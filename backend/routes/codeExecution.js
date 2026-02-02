const express = require('express');
const Docker = require('dockerode');
const { authenticate } = require('../middleware/auth');
const Task = require('../models/Task');
const Progress = require('../models/Progress');

const router = express.Router();

const isDev = process.env.NODE_ENV !== 'production';
const debugLog = (...args) => { if (isDev) console.log(...args); };

// Docker client
const dockerSocketPath = process.env.DOCKER_SOCKET_PATH ||
  (process.platform === 'win32' ? '\\\\.\\pipe\\docker_engine' : '/var/run/docker.sock');

const docker = new Docker({
  socketPath: dockerSocketPath
});

// Language configurations - images pinned for reproducibility
const LANGUAGE_CONFIGS = {
  cpp: {
    image: 'gcc:13.2',
    compileCommand: (code) => `echo '${code.replace(/'/g, "'\\''")}' > /tmp/code.cpp && g++ -o /tmp/code /tmp/code.cpp && /tmp/code`,
    timeout: 5000
  },
  java: {
    image: 'amazoncorretto:17.0.9',
    compileCommand: (code) => {
      const classMatch = code.match(/public\s+class\s+(\w+)/);
      const className = classMatch ? classMatch[1] : 'Solution';
      return `echo '${code.replace(/'/g, "'\\''")}' > /tmp/${className}.java && cd /tmp && javac ${className}.java && java ${className}`;
    },
    timeout: 5000
  },
  python: {
    image: 'python:3.11.7-slim',
    compileCommand: (code) => `python3 -c '${code.replace(/'/g, "'\\''")}'`,
    timeout: 5000
  }
};

// Helper function to clean output (remove control characters, normalize line endings, etc.)
const cleanString = (str) => {
  return str
    .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '')  // Remove control characters
    .replace(/\r\n/g, '\n')  // Normalize line endings
    .replace(/\r/g, '\n')  // Convert \r to \n
    .trim();
};

// Execute code in Docker container
async function executeCode(code, language, input = '') {
  const config = LANGUAGE_CONFIGS[language];
  if (!config) {
    throw new Error('Unsupported language');
  }

  return new Promise(async (resolve, reject) => {
    let container;
    try {
      // Build the Docker command
      let command = config.compileCommand(code);

      // Handle input piping
      if (input && (language === 'python' || language === 'cpp' || language === 'java')) {
        if (language === 'python') {
          command = `echo '${code.replace(/'/g, "'\\''")}' > /tmp/code.py && echo '${input.replace(/'/g, "'\\''")}' | python3 /tmp/code.py`;
        } else if (language === 'cpp') {
          command = `echo '${code.replace(/'/g, "'\\''")}' > /tmp/code.cpp && g++ -o /tmp/code /tmp/code.cpp && echo '${input.replace(/'/g, "'\\''")}' | /tmp/code`;
        } else if (language === 'java') {
          const classMatch = code.match(/public\s+class\s+(\w+)/);
          const className = classMatch ? classMatch[1] : 'Solution';
          command = `echo '${code.replace(/'/g, "'\\''")}' > /tmp/${className}.java && cd /tmp && javac ${className}.java && echo '${input.replace(/'/g, "'\\''")}' | java ${className}`;
        }
      }

      // Debug: Log the Docker command and inputs
      debugLog('[DEBUG] Docker command:', command);
      debugLog('[DEBUG] Input provided:', JSON.stringify(input));
      debugLog('[DEBUG] Language:', language);

      // Create the Docker container
      container = await docker.createContainer({
        Image: config.image,
        Cmd: ['/bin/sh', '-c', command],
        AttachStdout: true,
        AttachStderr: true,
        Tty: false,
        OpenStdin: false,
        NetworkDisabled: true,
        Memory: 128 * 1024 * 1024, // 128MB
        CpuPeriod: 100000,
        CpuQuota: 50000,
        PidsLimit: 50
      });

      await container.start();

      // Set timeout for execution
      const timeout = setTimeout(async () => {
        try {
          await container.kill();
          await container.remove();
          reject(new Error('Execution timeout'));
        } catch (err) {
          // Container might already be stopped
        }
      }, config.timeout);

      // Wait for container to finish
      const exitData = await container.wait();
      const exitCode = exitData.StatusCode !== undefined ? exitData.StatusCode : exitData;

      clearTimeout(timeout);

      debugLog('[DEBUG] Exit code:', exitCode);

      // Get stdout and stderr separately
      let stdout = '';
      let stderr = '';

      try {
        // Get stdout
        const stdoutLogs = await container.logs({
          stdout: true,
          stderr: false,
          timestamps: false
        });
        stdout = stdoutLogs.toString('utf8');
      } catch (err) {
        debugLog('[DEBUG] Error getting stdout:', err.message);
      }

      try {
        // Get stderr
        const stderrLogs = await container.logs({
          stdout: false,
          stderr: true,
          timestamps: false
        });
        stderr = stderrLogs.toString('utf8');
      } catch (err) {
        debugLog('[DEBUG] Error getting stderr:', err.message);
      }

      debugLog('[DEBUG] Raw stdout:', JSON.stringify(stdout));
      debugLog('[DEBUG] Raw stderr:', JSON.stringify(stderr));
      debugLog('[DEBUG] Stdout length:', stdout.length);
      debugLog('[DEBUG] Stderr length:', stderr.length);

      // Clean output strings
      const cleanedStdout = cleanString(stdout);
      const cleanedStderr = cleanString(stderr);

      debugLog('[DEBUG] Cleaned stdout:', cleanedStdout);
      debugLog('[DEBUG] Cleaned stderr:', cleanedStderr);

      let output = '';
      let errors = '';

      // Handle output based on exit code and streams
      // For successful execution (exit code 0), use stdout as output
      // For failed execution (exit code non-zero), use stderr as errors, but also include stdout if no stderr
      if (exitCode === 0) {
        output = cleanedStdout;
        errors = cleanedStderr; // Include stderr even if successful (e.g., warnings)
      } else {
        // Exit code is non-zero
        errors = cleanedStderr || cleanedStdout; // Use stderr if available, otherwise stdout
        output = cleanedStdout; // Still provide stdout for context
      }

      debugLog('[DEBUG] Final output field:', JSON.stringify(output));
      debugLog('[DEBUG] Final errors field:', JSON.stringify(errors));

      // Clean up container
      try {
        await container.remove();
      } catch (err) {
        debugLog('[DEBUG] Error removing container:', err.message);
      }

      resolve({ output, errors, exitCode });

    } catch (error) {
      console.error('[DEBUG] Docker execution error:', error);
      console.error('[DEBUG] Error stack:', error.stack);
      if (container) {
        try {
          await container.remove();
        } catch (err) {
          // Ignore
        }
      }
      reject(error);
    }
  });
}

// Execute and evaluate code
router.post('/evaluate', authenticate, async (req, res) => {
  try {
    const { taskId, code, language } = req.body;

    if (!taskId || !code || !language) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: taskId, code, language'
      });
    }

    // Get task with test cases
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (task.language !== language) {
      return res.status(400).json({
        success: false,
        message: 'Language mismatch'
      });
    }

    const testCases = task.test_cases || [];
    const results = [];
    let allPassed = true;

    // Run each test case
    for (const testCase of testCases) {
      try {
        console.log(`[DEBUG] Running test case with input: ${JSON.stringify(testCase.input)}`);
        
        const { output, errors, exitCode } = await executeCode(
          code,
          language,
          testCase.input || ''
        );

        // Clean both outputs for comparison
        const cleanedOutput = cleanString(output);
        const cleanedExpected = cleanString(testCase.expected_output || '');

        debugLog('[DEBUG] Test case comparison:');
        debugLog('[DEBUG] Expected:', JSON.stringify(cleanedExpected));
        debugLog('[DEBUG] Actual:', JSON.stringify(cleanedOutput));
        debugLog('[DEBUG] Exit code:', exitCode);
        debugLog('[DEBUG] Match:', cleanedOutput === cleanedExpected);

        const passed = exitCode === 0 && cleanedOutput === cleanedExpected;

        results.push({
          input: testCase.input,
          expected_output: testCase.expected_output,
          actual_output: output,
          errors: errors,
          passed: passed,
          is_hidden: testCase.is_hidden || false
        });

        if (!passed) {
          allPassed = false;
        }
      } catch (error) {
        console.error(`[DEBUG] Error executing test case:`, error);
        console.error('[DEBUG] Error message:', error.message);
        console.error('[DEBUG] Error stack:', error.stack);
        
        results.push({
          input: testCase.input,
          expected_output: testCase.expected_output,
          actual_output: '',
          errors: `Execution error: ${error.message}`,
          passed: false,
          is_hidden: testCase.is_hidden || false
        });
        allPassed = false;
      }
    }

    // Calculate score and XP (guard against zero test cases)
    const passedCount = results.filter(r => r.passed).length;
    const totalCount = results.length;
    const score = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0;
    const xp = totalCount === 0 ? 0 : allPassed ? 100 : Math.round((passedCount / totalCount) * 50);

    // Save submission
    const verdict = allPassed ? 'Pass' : 'Fail';
    await Progress.saveSubmission(
      req.user.id,
      taskId,
      language,
      code,
      verdict,
      JSON.stringify(results),
      ''
    );

    // If all tests passed, mark task as completed and unlock games
    let unlockedGames = [];
    if (allPassed) {
      await Progress.recordTaskCompletion(req.user.id, taskId, language, score, xp);
      unlockedGames = await Progress.unlockGamesForTask(req.user.id, taskId, language);
    }

    res.json({
      success: true,
      verdict: verdict,
      results: results.filter(r => !r.is_hidden), // Only show visible test cases
      score,
      xp,
      allPassed,
      unlockedGames: unlockedGames,
      message: allPassed ? 'All test cases passed! 🎉' : 'Some test cases failed. Try again!'
    });

  } catch (error) {
    console.error('[DEBUG] Code evaluation error:', error);
    console.error('[DEBUG] Error message:', error.message);
    console.error('[DEBUG] Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Code execution failed',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Simple code execution (without evaluation)
router.post('/run', authenticate, async (req, res) => {
  try {
    const { code, language, input = '' } = req.body;

    if (!code || !language) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: code, language'
      });
    }

    console.log(`[DEBUG] Running code for language: ${language}`);
    const { output, errors, exitCode } = await executeCode(code, language, input);

    // Log output before sending to frontend
    debugLog('[DEBUG] Final output being sent to frontend:', JSON.stringify(output));
    debugLog('[DEBUG] Final errors being sent to frontend:', JSON.stringify(errors));
    debugLog('[DEBUG] Final exitCode:', exitCode);

    res.json({
      success: true,
      output,
      errors,
      exitCode
    });

  } catch (error) {
    console.error('[DEBUG] Code execution error:', error);
    console.error('[DEBUG] Error message:', error.message);
    console.error('[DEBUG] Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Code execution failed',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;

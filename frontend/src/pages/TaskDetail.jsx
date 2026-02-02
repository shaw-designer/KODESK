import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Box,
  Grid,
  Alert,
  Chip,
  Divider,
  LinearProgress
} from '@mui/material';
import { PlayArrow as PlayIcon, Send as SendIcon } from '@mui/icons-material';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import api from '../services/api';

function TaskDetail() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTask();
  }, [taskId]);

  const fetchTask = async () => {
    try {
      const response = await api.get(`/tasks/${taskId}`);
      setTask(response.data.task);
      setCode(response.data.task.starter_code || '');
    } catch (error) {
      console.error('Error fetching task:', error);
      setError('Failed to load task');
    }
  };

  const handleRun = async () => {
    if (!code.trim()) {
      setError('Please write some code first');
      return;
    }

    setLoading(true);
    setError('');
    setOutput('');

    try {
      const response = await api.post('/execute/run', {
        code,
        language: task.language,
        input: ''
      });

      // Log raw response for debugging
      console.log('[DEBUG] Raw response from backend:', response.data);
      console.log('[DEBUG] Output:', JSON.stringify(response.data.output));
      console.log('[DEBUG] Errors:', JSON.stringify(response.data.errors));

      // Prefer output over errors, but show both if needed
      let outputText = '';
      if (response.data.output && response.data.output.trim()) {
        outputText = response.data.output;
      } else if (response.data.errors && response.data.errors.trim()) {
        outputText = response.data.errors;
      } else {
        outputText = 'No output';
      }
      
      // Clean output on frontend side as well
      const cleanedOutput = outputText
        .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '') // Remove control chars
        .replace(/\r\n/g, '\n') // Normalize line endings
        .replace(/\r/g, '\n');
      
      console.log('[DEBUG] Cleaned output for display:', cleanedOutput);
      setOutput(cleanedOutput);
    } catch (error) {
      setError(error.response?.data?.message || 'Code execution failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      setError('Please write some code first');
      return;
    }

    setEvaluating(true);
    setError('');
    setResult(null);

    try {
      const response = await api.post('/execute/evaluate', {
        taskId: task.id,
        code,
        language: task.language
      });

      console.log('[DEBUG] Evaluation response:', response.data);
      setResult(response.data);
      
      if (response.data.allPassed) {
        // Show success message for 3 seconds before redirecting
        setTimeout(() => {
          navigate(`/tasks/${task.language}`);
        }, 3000);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Evaluation failed');
    } finally {
      setEvaluating(false);
    }
  };

  if (!task) {
    return <LinearProgress />;
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        {task.title}
      </Typography>
      <Box display="flex" gap={1} mb={2}>
        <Chip label={task.difficulty_level} color="primary" size="small" />
        <Chip label={task.language.toUpperCase()} variant="outlined" size="small" />
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Problem Description
            </Typography>
            <Typography variant="body1" paragraph>
              {task.description}
            </Typography>
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Write Your Code
            </Typography>
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                multiline
                rows={15}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                variant="outlined"
                sx={{
                  '& .MuiInputBase-input': {
                    fontFamily: 'monospace',
                    fontSize: '14px'
                  }
                }}
              />
            </Box>
            <Box display="flex" gap={2}>
              <Button
                variant="outlined"
                startIcon={<PlayIcon />}
                onClick={handleRun}
                disabled={loading}
              >
                Run Code
              </Button>
              <Button
                variant="contained"
                startIcon={<SendIcon />}
                onClick={handleSubmit}
                disabled={evaluating}
              >
                {evaluating ? 'Evaluating...' : 'Submit'}
              </Button>
            </Box>
          </Paper>

          {output && (
            <Paper sx={{ p: 2, mt: 2, bgcolor: '#1e1e1e', color: '#fff' }}>
              <Typography variant="h6" gutterBottom>
                Output
              </Typography>
              <SyntaxHighlighter language={task.language} style={vscDarkPlus}>
                {output}
              </SyntaxHighlighter>
            </Paper>
          )}
        </Grid>

        <Grid item xs={12} md={6}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {result && (
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Evaluation Results
              </Typography>
              {result.allPassed ? (
                <>
                  <Alert severity="success" sx={{ mb: 2 }}>
                    🎉 {result.message}
                  </Alert>
                  {result.unlockedGames && result.unlockedGames.length > 0 && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      🎮 You have unlocked {result.unlockedGames.length} game(s)! Check the Games section to play.
                    </Alert>
                  )}
                </>
              ) : (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  {result.message}
                </Alert>
              )}
              <Typography variant="body2" gutterBottom>
                Score: {result.score}/100 | XP: {result.xp}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" gutterBottom>
                Test Case Results:
              </Typography>
              {result.results?.map((testResult, index) => (
                <Box key={index} sx={{ mb: 1 }}>
                  <Chip
                    label={testResult.passed ? 'Passed' : 'Failed'}
                    color={testResult.passed ? 'success' : 'error'}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Typography variant="body2" component="span">
                    Test Case {index + 1}
                  </Typography>
                  {!testResult.passed && (
                    <Box sx={{ mt: 1, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                      <Typography variant="caption" display="block">
                        Expected: {testResult.expected_output}
                      </Typography>
                      <Typography variant="caption" display="block">
                        Got: {testResult.actual_output}
                      </Typography>
                    </Box>
                  )}
                </Box>
              ))}
              {result.allPassed && (
                <Box sx={{ mt: 2, p: 1, bgcolor: 'success.light', borderRadius: 1 }}>
                  <Typography variant="body2" color="success.dark">
                    ✓ Redirecting to tasks in 3 seconds...
                  </Typography>
                </Box>
              )}
            </Paper>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}

export default TaskDetail;

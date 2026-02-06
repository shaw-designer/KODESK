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
  const [hasUserInput, setHasUserInput] = useState(false);
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
      setCode('');
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

          <Paper sx={{ 
            p: 0,
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            bgcolor: '#ffffff'
          }}>
            {/* Header */}
            <Box sx={{
              background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
              color: 'white',
              p: 2.5,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '0.5px' }}>
                  💻 Code Editor
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9, mt: 0.5, display: 'block' }}>
                  {task?.language.toUpperCase()} • Characters: {code.length}
                </Typography>
              </Box>
            </Box>

            {/* Hint Section */}
            {!hasUserInput && (
              <Box sx={{ 
                p: 2, 
                bgcolor: '#f8f9fa',
                borderBottom: '1px solid #e0e0e0',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5
              }}>
                <Box sx={{ fontSize: '20px' }}>💡</Box>
                <Box>
                  <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#1976d2', mb: 0.3 }}>
                    Getting Started
                  </Typography>
                  <Typography sx={{ fontSize: '13px', color: '#666', lineHeight: 1.4 }}>
                    Write your {task?.language || 'code'} solution below. Use Run Code to test your logic before submitting.
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Code Editor */}
            <Box sx={{ p: 2, bgcolor: '#ffffff' }}>
              <TextField
                fullWidth
                multiline
                rows={16}
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setHasUserInput(e.target.value.length > 0);
                }}
                onBlur={() => {
                  if (code.trim().length === 0) setHasUserInput(false);
                }}
                placeholder="// Start typing your code here..."
                variant="outlined"
                autoComplete="off"
                spellCheck="false"
                disabled={false}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#f5f7fa',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: '#1976d2',
                      boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)'
                    },
                    '&.Mui-focused': {
                      borderColor: '#1976d2',
                      boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.1)',
                      backgroundColor: '#ffffff'
                    }
                  },
                  '& .MuiOutlinedInput-input': {
                    fontFamily: '"Fira Code", "Courier New", monospace',
                    fontSize: '13.5px',
                    caretColor: '#1976d2',
                    color: '#1a1a1a !important',
                    lineHeight: '1.7',
                    padding: '16px',
                    '&::placeholder': {
                      color: '#999 !important',
                      opacity: 0.7
                    }
                  },
                  '& textarea': {
                    color: '#1a1a1a !important'
                  }
                }}
                InputProps={{
                  disableUnderline: true,
                  autoComplete: 'off',
                  spellCheck: 'false'
                }}
              />
            </Box>

            {/* Action Buttons */}
            <Box sx={{
              p: 2,
              bgcolor: '#f8f9fa',
              borderTop: '1px solid #e0e0e0',
              display: 'flex',
              gap: 1.5,
              flexWrap: 'wrap'
            }}>
              <Button
                variant="outlined"
                startIcon={<PlayIcon />}
                onClick={handleRun}
                disabled={loading}
                sx={{
                  px: 2.5,
                  py: 1,
                  borderColor: '#1976d2',
                  color: '#1976d2',
                  fontWeight: 600,
                  fontSize: '13.5px',
                  letterSpacing: '0.3px',
                  transition: 'all 0.3s ease',
                  borderRadius: '6px',
                  border: '2px solid #1976d2',
                  '&:hover': {
                    backgroundColor: 'rgba(25, 118, 210, 0.05)',
                    borderColor: '#1565c0',
                    color: '#1565c0'
                  },
                  '&:disabled': {
                    opacity: 0.5,
                    cursor: 'not-allowed'
                  }
                }}
              >
                {loading ? 'Running...' : 'Run Code'}
              </Button>
              <Button
                variant="contained"
                startIcon={<SendIcon />}
                onClick={handleSubmit}
                disabled={evaluating}
                sx={{
                  px: 3,
                  py: 1,
                  background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                  fontWeight: 700,
                  fontSize: '13.5px',
                  letterSpacing: '0.3px',
                  textTransform: 'uppercase',
                  borderRadius: '6px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.25)',
                  '&:hover:not(:disabled)': {
                    boxShadow: '0 6px 20px rgba(25, 118, 210, 0.35)',
                    transform: 'translateY(-2px)'
                  },
                  '&:disabled': {
                    opacity: 0.7,
                    cursor: 'not-allowed'
                  }
                }}
              >
                {evaluating ? '⏳ Evaluating...' : '✓ Submit Solution'}
              </Button>
            </Box>
          </Paper>

          {output && (
            <Paper sx={{ 
              p: 0,
              mt: 2,
              bgcolor: '#1e1e1e',
              color: '#fff',
              borderRadius: 2,
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
            }}>
              <Box sx={{ 
                p: 2,
                bgcolor: '#252526',
                borderBottom: '1px solid #3e3e42'
              }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0 }}>
                  📤 Output
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mt: 0.5 }}>
                  Program execution result
                </Typography>
              </Box>
              <Box sx={{ p: 2, bgcolor: '#1e1e1e', maxHeight: '300px', overflow: 'auto' }}>
                <SyntaxHighlighter language={task.language} style={vscDarkPlus}>
                  {output}
                </SyntaxHighlighter>
              </Box>
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
                <Box key={index} sx={{ mb: 2 }}>
                  <Chip
                    label={testResult.passed ? 'Passed' : 'Failed'}
                    color={testResult.passed ? 'success' : 'error'}
                    size="small"
                    sx={{ mr: 1, fontWeight: 'bold' }}
                  />
                  <Typography variant="body2" component="span" sx={{ fontWeight: 'bold', color: '#333' }}>
                    Test Case {index + 1}
                  </Typography>
                  {!testResult.passed && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: '#fff3cd', border: '2px solid #ffc107', borderRadius: 2 }}>
                      <Typography variant="body2" sx={{ color: '#000', fontWeight: 'bold', mb: 1 }}>
                        Expected Output:
                      </Typography>
                      <Box sx={{ p: 1.5, bgcolor: '#ffffff', border: '1px solid #ffc107', borderRadius: 1, mb: 1.5, fontFamily: 'monospace', color: '#000', whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '13px' }}>
                        {testResult.expected_output}
                      </Box>
                      <Typography variant="body2" sx={{ color: '#000', fontWeight: 'bold', mb: 1 }}>
                        Your Output:
                      </Typography>
                      <Box sx={{ p: 1.5, bgcolor: '#ffebee', border: '2px solid #d32f2f', borderRadius: 1, fontFamily: 'monospace', color: '#000', whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '13px' }}>
                        {testResult.actual_output || '(empty)'}
                      </Box>
                    </Box>
                  )}
                  {testResult.passed && (
                    <Box sx={{ mt: 1, p: 1.5, bgcolor: '#e8f5e9', border: '1px solid #4caf50', borderRadius: 1 }}>
                      <Typography variant="body2" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
                        ✓ Test case passed successfully!
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

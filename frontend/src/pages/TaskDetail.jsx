import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { keyframes } from '@mui/system';
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

// Define animations
const slideDown = keyframes`
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const slideRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

const bounce = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

const glow = keyframes`
  0%, 100% {
    box-shadow: 0 0 20px rgba(25, 118, 210, 0.3);
  }
  50% {
    box-shadow: 0 0 40px rgba(25, 118, 210, 0.6);
  }
`;

const successCheckmark = keyframes`
  0% {
    transform: scale(0) rotate(-45deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.2) rotate(0);
  }
  100% {
    transform: scale(1) rotate(0);
    opacity: 1;
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
`;

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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ animation: `${slideDown} 0.6s ease-out` }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#1976d2', mb: 1, animation: `${float} 3s ease-in-out infinite` }}>
          {task.title}
        </Typography>
        <Box display="flex" gap={1} mb={2} sx={{ animation: `${slideDown} 0.6s ease-out 0.1s both` }}>
          <Chip 
            label={task.difficulty_level} 
            color="primary" 
            size="small"
            sx={{
              fontWeight: 600,
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              '&:hover': {
                transform: 'scale(1.08)',
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)'
              }
            }}
          />
          <Chip 
            label={task.language.toUpperCase()} 
            variant="outlined" 
            size="small"
            sx={{
              fontWeight: 600,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.08)',
                color: '#1565c0',
                borderColor: '#1565c0'
              }
            }}
          />
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6} sx={{ animation: `${slideLeft} 0.7s ease-out 0.2s both` }}>
          <Paper sx={{ 
            p: 3, 
            mb: 2,
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
              transform: 'translateY(-4px)'
            }
          }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: '#1565c0', mb: 2 }}>
              📝 Problem Description
            </Typography>
            <Typography 
              variant="body1" 
              paragraph 
              sx={{ 
                lineHeight: 1.8,
                color: '#333',
                '&:hover': {
                  color: '#1976d2'
                },
                transition: 'color 0.3s ease'
              }}
            >
              {task.description}
            </Typography>
          </Paper>

          <Paper sx={{ 
            p: 0,
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            bgcolor: '#ffffff',
            animation: `${slideLeft} 0.8s ease-out 0.3s both`,
            transition: 'all 0.4s ease',
            '&:hover': {
              boxShadow: '0 12px 40px rgba(25, 118, 210, 0.2)',
              transform: 'translateY(-4px)'
            }
          }}>
            {/* Header */}
            <Box sx={{
              background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
              color: 'white',
              p: 2.5,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                animation: `${shimmer} 3s infinite`
              }
            }}>
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span style={{ animation: `${float} 2s ease-in-out infinite` }}>💻</span> Code Editor
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
                gap: 1.5,
                animation: `${slideDown} 0.5s ease-out`,
                transition: 'all 0.3s ease'
              }}>
                <Box sx={{ fontSize: '20px', animation: `${bounce} 2s ease-in-out infinite` }}>💡</Box>
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
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(135deg, transparent 0%, rgba(25, 118, 210, 0.03) 100%)',
                      borderRadius: '8px',
                      pointerEvents: 'none'
                    },
                    '&:hover': {
                      borderColor: '#1976d2',
                      boxShadow: '0 4px 16px rgba(25, 118, 210, 0.12)',
                      backgroundColor: '#fafbfc'
                    },
                    '&.Mui-focused': {
                      borderColor: '#1976d2',
                      boxShadow: '0 0 0 4px rgba(25, 118, 210, 0.15)',
                      backgroundColor: '#ffffff'
                    }
                  },
                  '& .MuiOutlinedInput-input': {
                    fontFamily: '\"Fira Code\", \"Courier New\", monospace',
                    fontSize: '13.5px',
                    caretColor: '#1976d2',
                    color: '#1a1a1a !important',
                    lineHeight: '1.7',
                    padding: '16px',
                    transition: 'all 0.2s ease',
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
              flexWrap: 'wrap',
              animation: `${slideUp} 0.6s ease-out 0.2s both`
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
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  borderRadius: '8px',
                  border: '2px solid #1976d2',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: 0,
                    height: 0,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(25, 118, 210, 0.1)',
                    transform: 'translate(-50%, -50%)',
                    transition: 'width 0.6s ease, height 0.6s ease'
                  },
                  '&:hover:not(:disabled)': {
                    backgroundColor: 'rgba(25, 118, 210, 0.06)',
                    borderColor: '#1565c0',
                    color: '#1565c0',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)',
                    '&::before': {
                      width: '300px',
                      height: '300px'
                    }
                  },
                  '&:active:not(:disabled)': {
                    transform: 'translateY(0)'
                  },
                  '&:disabled': {
                    opacity: 0.5,
                    cursor: 'not-allowed'
                  }
                }}
              >
                {loading ? '⏳ Running...' : '▶ Run Code'}
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
                  borderRadius: '8px',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 4px 15px rgba(25, 118, 210, 0.3)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                    transition: 'left 0.5s ease'
                  },
                  '&:hover:not(:disabled)': {
                    boxShadow: '0 8px 25px rgba(25, 118, 210, 0.4)',
                    transform: 'translateY(-3px)',
                    '&::before': {
                      left: '100%'
                    }
                  },
                  '&:active:not(:disabled)': {
                    transform: 'translateY(-1px)'
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
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
              animation: `${slideUp} 0.6s ease-out`,
              transition: 'all 0.4s ease',
              '&:hover': {
                boxShadow: '0 12px 40px rgba(25, 118, 210, 0.15)',
                transform: 'translateY(-4px)'
              }
            }}>
              <Box sx={{ 
                p: 2,
                bgcolor: '#252526',
                borderBottom: '1px solid #3e3e42',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <span style={{ animation: `${float} 2.5s ease-in-out infinite`, fontSize: '18px' }}>📤</span>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0 }}>
                    Output
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mt: 0.3 }}>
                    Program execution result
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ p: 2, bgcolor: '#1e1e1e', maxHeight: '300px', overflow: 'auto' }}>
                <SyntaxHighlighter language={task.language} style={vscDarkPlus}>
                  {output}
                </SyntaxHighlighter>
              </Box>
            </Paper>
          )}
        </Grid>

        <Grid item xs={12} md={6} sx={{ animation: `${slideRight} 0.7s ease-out 0.3s both` }}>
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 2,
                animation: `${slideDown} 0.4s ease-out`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(211, 47, 47, 0.15)'
                }
              }}
            >
              {error}
            </Alert>
          )}

          {result && (
            <Paper sx={{ 
              p: 3, 
              mb: 2,
              borderRadius: 2,
              animation: `${slideUp} 0.6s ease-out`,
              transition: 'all 0.4s ease',
              '&:hover': {
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
                transform: 'translateY(-4px)'
              }
            }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: '#1565c0', mb: 2 }}>
                ✓ Evaluation Results
              </Typography>
              {result.allPassed ? (
                <>
                  <Alert 
                    severity="success" 
                    sx={{ 
                      mb: 2,
                      animation: `${pulse} 2s ease-in-out infinite`,
                      '& .MuiAlert-icon': {
                        animation: `${successCheckmark} 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)`
                      }
                    }}
                  >
                    🎉 {result.message}
                  </Alert>
                  {result.unlockedGames && result.unlockedGames.length > 0 && (
                    <Alert 
                      severity="info" 
                      sx={{ 
                        mb: 2,
                        animation: `${slideUp} 0.5s ease-out 0.2s both`,
                        '&:hover': {
                          transform: 'scale(1.02)',
                          boxShadow: '0 4px 16px rgba(25, 118, 210, 0.15)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      🎮 You have unlocked {result.unlockedGames.length} game(s)! Check the Games section to play.
                    </Alert>
                  )}
                </>
              ) : (
                <Alert 
                  severity="warning" 
                  sx={{ 
                    mb: 2,
                    animation: `${slideDown} 0.4s ease-out`
                  }}
                >
                  {result.message}
                </Alert>
              )}
              <Typography variant="body2" gutterBottom sx={{ fontWeight: 600, mb: 2, animation: `${slideUp} 0.5s ease-out 0.1s both` }}>
                <span style={{ fontSize: '16px' }}>⭐</span> Score: <span style={{ color: '#1976d2', fontWeight: 700 }}>{result.score}/100</span> | <span style={{ fontSize: '16px' }}>✨</span> XP: <span style={{ color: '#ffa726', fontWeight: 700 }}>{result.xp}</span>
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 700, color: '#333', mb: 2 }}>
                Test Case Results:
              </Typography>
              {result.results?.map((testResult, index) => (
                <Box 
                  key={index} 
                  sx={{ 
                    mb: 2,
                    animation: `${slideUp} 0.5s ease-out ${0.1 + index * 0.1}s both`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateX(4px)'
                    }
                  }}
                >
                  <Chip
                    label={testResult.passed ? '✓ Passed' : '✗ Failed'}
                    color={testResult.passed ? 'success' : 'error'}
                    size="small"
                    sx={{ 
                      mr: 1, 
                      fontWeight: 'bold',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.08)'
                      }
                    }}
                  />
                  <Typography variant="body2" component="span" sx={{ fontWeight: 'bold', color: '#333' }}>
                    Test Case {index + 1}
                  </Typography>
                  {!testResult.passed && (
                    <Box sx={{ 
                      mt: 2, 
                      p: 2, 
                      bgcolor: '#fff3cd', 
                      border: '2px solid #ffc107', 
                      borderRadius: 2,
                      animation: `${slideDown} 0.4s ease-out`,
                      transition: 'all 0.3s ease'
                    }}>
                      <Typography variant="body2" sx={{ color: '#000', fontWeight: 'bold', mb: 1 }}>
                        Expected Output:
                      </Typography>
                      <Box sx={{ p: 1.5, bgcolor: '#ffffff', border: '1px solid #ffc107', borderRadius: 1, mb: 1.5, fontFamily: 'monospace', color: '#000', whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '13px', transition: 'all 0.3s ease', '&:hover': { boxShadow: '0 2px 8px rgba(255, 193, 7, 0.2)' } }}>
                        {testResult.expected_output}
                      </Box>
                      <Typography variant="body2" sx={{ color: '#000', fontWeight: 'bold', mb: 1 }}>
                        Your Output:
                      </Typography>
                      <Box sx={{ p: 1.5, bgcolor: '#ffebee', border: '2px solid #d32f2f', borderRadius: 1, fontFamily: 'monospace', color: '#000', whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '13px', transition: 'all 0.3s ease', '&:hover': { boxShadow: '0 2px 8px rgba(211, 47, 47, 0.2)' } }}>
                        {testResult.actual_output || '(empty)'}
                      </Box>
                    </Box>
                  )}
                  {testResult.passed && (
                    <Box sx={{ 
                      mt: 1, 
                      p: 1.5, 
                      bgcolor: '#e8f5e9', 
                      border: '1px solid #4caf50', 
                      borderRadius: 1,
                      animation: `${slideUp} 0.4s ease-out`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(76, 175, 80, 0.2)',
                        transform: 'scale(1.01)'
                      }
                    }}>
                      <Typography variant="body2" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
                        ✓ Test case passed successfully!
                      </Typography>
                    </Box>
                  )}
                </Box>
              ))}
              {result.allPassed && (
                <Box sx={{ 
                  mt: 2, 
                  p: 1.5, 
                  bgcolor: '#e8f5e9', 
                  borderRadius: 1,
                  animation: `${pulse} 1.5s ease-in-out infinite`
                }}>
                  <Typography variant="body2" color="success.dark" sx={{ fontWeight: 700 }}>
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

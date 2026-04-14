import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  LinearProgress,
  Button,
  Stack,
  Chip
} from '@mui/material';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function LearningContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const [content, setContent] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [loading, setLoading] = useState(false);

  const isLaunchpad = location.pathname === '/launchpad';
  const language = isLaunchpad ? null : location.pathname.slice(1); // remove leading /

  useEffect(() => {
    if (!isLaunchpad) {
      setLoading(true);
      const fetchContent = async () => {
        try {
          const res = await api.get(`/learning/${language}`);
          if (res.data && res.data.content) {
            // Ensure ordering by order_index
            const sorted = res.data.content.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
            setContent(sorted);
            setSelectedTopic(sorted[0] || null);
          } else {
            setContent([]);
            setSelectedTopic(null);
          }
        } catch (error) {
          console.error('Error fetching learning content:', error);
          setContent([]);
          setSelectedTopic(null);
        } finally {
          setLoading(false);
        }
      };

      fetchContent();
    } else {
      setContent([]);
      setSelectedTopic(null);
      setLoading(false);
    }
  }, [location.pathname, isLaunchpad, language]);

  const { user } = useAuth();

  if (loading) {
    return <LinearProgress />;
  }

  const launchpadView = (
    <div>
      {!user && (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.2, md: 3 },
            mb: 3,
            borderRadius: 4,
            border: '1px solid rgba(0, 217, 255, 0.28)',
            background: 'linear-gradient(130deg, rgba(7,20,46,0.98) 0%, rgba(19,62,95,0.95) 100%)',
            color: '#dff7ff',
            boxShadow: '0 18px 36px rgba(0, 0, 0, 0.28)'
          }}
        >
          <Typography variant="subtitle2" sx={{ color: '#90e8ff', letterSpacing: '0.11em', fontWeight: 700, mb: 1 }}>
            START YOUR ACCOUNT
          </Typography>
          <Typography variant="body2" sx={{ mb: 2.2, color: 'rgba(232, 247, 255, 0.92)' }}>
            Join now to unlock quests, track your XP, and save every mission milestone.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Button
              variant="contained"
              onClick={() => navigate('/login')}
              sx={{
                bgcolor: '#00d9ff',
                color: '#02263c',
                fontWeight: 700,
                '&:hover': { bgcolor: '#67e8ff' }
              }}
            >
              Login
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/register')}
              sx={{
                borderColor: '#00d9ff',
                color: '#b2f4ff',
                fontWeight: 700,
                '&:hover': {
                  borderColor: '#67e8ff',
                  backgroundColor: 'rgba(103, 232, 255, 0.08)'
                }
              }}
            >
              Sign Up
            </Button>
          </Stack>
        </Paper>
      )}

      <Box
        sx={{
          display: 'grid',
          gap: 4,
          mb: 4,
          gridTemplateColumns: { xs: '1fr', md: '0.95fr 1.05fr' },
          alignItems: 'center'
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box>
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', letterSpacing: '0.08em' }}>
              🚀 Welcome to the Coding Launchpad
            </Typography>
            <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: '680px' }}>
              Reimagine your guest learning journey with a fresh, mission-style experience.
              Start with C++ fundamentals, level up with Java, and master Python in the final phase.
            </Typography>
          </Box>

          <Paper
            elevation={10}
            sx={{
              p: 4,
              borderRadius: 4,
              border: '1px solid rgba(0, 217, 255, 0.18)',
              background: 'linear-gradient(150deg, rgba(6, 14, 37, 0.96) 0%, rgba(17, 35, 64, 0.94) 100%)',
              color: '#e8f7ff',
              boxShadow: '0 18px 42px rgba(4, 19, 49, 0.5)'
            }}
          >
            <Typography variant="subtitle2" sx={{ color: '#80d8ff', mb: 2, letterSpacing: '0.12em', fontWeight: 700 }}>
              MISSION PATH
            </Typography>
            <List dense>
              {[
                { label: 'C++', route: 'cpp', color: '#00d9ff' },
                { label: 'Java', route: 'java', color: '#39ff14' },
                { label: 'Python', route: 'python', color: '#ff006e' }
              ].map((item, index) => (
                <ListItem key={item.label} disablePadding>
                  <ListItemButton
                    onClick={() => navigate(`/${item.route}`)}
                    sx={{
                      px: 0,
                      py: 1.5,
                      borderBottom: index < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          width: 34,
                          height: 34,
                          borderRadius: '50%',
                          display: 'grid',
                          placeItems: 'center',
                          bgcolor: item.color,
                          color: '#041b31',
                          fontWeight: 800
                        }}
                      >
                        {index + 1}
                      </Box>
                      <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '1rem' }}>
                        {item.label}
                      </Typography>
                    </Box>
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
            <Typography variant="body2" sx={{ mt: 3, color: 'rgba(255,255,255,0.72)' }}>
              Get a structured learning sequence that moves from system-level power to cross-platform mastery, then into versatile scripting and rapid development.
            </Typography>
          </Paper>
        </Box>

        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            p: 2
          }}
        >
          <Box
            component="img"
            src="/assets/space-astronaut.gif"
            alt="Space Astronaut"
            sx={{
              width: '100%',
              maxWidth: 520,
              borderRadius: 4,
              boxShadow: '0 0 80px rgba(0, 217, 255, 0.35)',
              border: '2px solid rgba(0, 217, 255, 0.16)',
              backgroundColor: 'rgba(0,0,0,0.02)'
            }}
          />
        </Box>
      </Box>
    </div>
  );

  const languageView = (
    <div>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          Learning {language?.toUpperCase()}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 3, mt: 4 }}>
        {/* Left Sidebar - Topics List */}
        <Paper sx={{ width: 280, height: 'fit-content', position: 'sticky', top: 20, boxShadow: 3 }}>
          <Box sx={{ bgcolor: '#1976d2', color: 'white', p: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              📖 Topics
            </Typography>
          </Box>
          <List sx={{ maxHeight: '70vh', overflow: 'auto' }}>
            {content.map((item, index) => (
              <React.Fragment key={item.id}>
                <ListItem disablePadding>
                  <ListItemButton
                    selected={selectedTopic?.id === item.id}
                    onClick={() => setSelectedTopic(item)}
                    sx={{
                      '&.Mui-selected': {
                        backgroundColor: '#e3f2fd',
                        borderLeft: '4px solid #1976d2'
                      },
                      '&:hover': {
                        backgroundColor: '#f5f5f5'
                      }
                    }}
                  >
                    <ListItemText
                      primary={`${index + 1}. ${item.title}`}
                      secondary={item.topic}
                      primaryTypographyProps={{ sx: { fontWeight: selectedTopic?.id === item.id ? 'bold' : 'normal', fontSize: '14px' } }}
                      secondaryTypographyProps={{ sx: { fontSize: '12px' } }}
                    />
                  </ListItemButton>
                </ListItem>
                {index < content.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>

        {/* Right Content Area */}
        <Paper sx={{ flex: 1, p: 4, bgcolor: '#ffffff', boxShadow: 2, border: '1px solid #e0e0e0' }}>
          {selectedTopic ? (
            <div>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2', mb: 3, pb: 2, borderBottom: '3px solid #1976d2' }}>
                {selectedTopic.title}
              </Typography>
              <Typography variant="body1" paragraph sx={{ lineHeight: 2.2, color: '#000', fontSize: '17px', mb: 3, textAlign: 'justify', fontWeight: '500', letterSpacing: '0.3px' }}>
                {selectedTopic.content}
              </Typography>
              {selectedTopic.code_examples && (
                <Box sx={{ mt: 4, p: 3, bgcolor: '#f5f5f5', borderRadius: 2, border: '2px solid #1976d2', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#1565c0', mb: 2 }}>
                    💻 Code Example
                  </Typography>
                  <Box sx={{ p: 2, bgcolor: '#1e1e1e', borderRadius: 1, overflow: 'auto' }}>
                    <pre style={{ margin: 0, color: '#d4d4d4', fontSize: '13px', lineHeight: '1.6', fontFamily: 'Courier New, monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {selectedTopic.code_examples}
                    </pre>
                  </Box>
                </Box>
              )}
              {user && (
                <Box sx={{ mt: 4, p: 2, bgcolor: '#e8f5e9', border: '1px solid #4caf50', borderRadius: 2 }}>
                  <Typography variant="body2" sx={{ color: '#2e7d32' }}>
                    Some content may be missing. Please be patient. Head to <strong>Quests</strong> to practice your skills.
                  </Typography>
                </Box>
              )}
            </div>
          ) : (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary" sx={{ fontStyle: 'italic', fontSize: '18px', color: '#999' }}>
                ☜ Select a topic from the left to get started!
              </Typography>
              {content.length > 0 && (
                <Box sx={{ mt: 4 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Available topics:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                    {content.map((item) => (
                      <Chip
                        key={item.id}
                        label={item.title}
                        onClick={() => setSelectedTopic(item)}
                        variant="outlined"
                        color="primary"
                        sx={{ cursor: 'pointer' }}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </Paper>
      </Box>
    </div>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {isLaunchpad ? launchpadView : languageView}
    </Container>
  );
}

export default LearningContent;
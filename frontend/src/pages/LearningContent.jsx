import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Alert,
  Button,
  Stack,
  Chip
} from '@mui/material';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function LearningContent() {
  const { language } = useParams();
  const [content, setContent] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const lang = language || 'python';
    setLoading(true);
    const fetchContent = async () => {
      try {
        const res = await api.get(`/learning/${lang}`);
        if (res.data && res.data.content) {
          // Ensure ordering by order_index
          const sorted = res.data.content.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
          setContent(sorted);
        } else {
          setContent([]);
        }
      } catch (error) {
        console.error('Error fetching learning content:', error);
        setContent([]);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [language]);

  const { user } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2', mb: 2 }}>
          📚 Learn to Code
        </Typography>

        
        {/* Language Selection for Guests */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
          {['python', 'java', 'cpp'].map((lang) => (
            <Button
              key={lang}
              variant={language === lang ? 'contained' : 'outlined'}
              color="primary"
              onClick={() => navigate(`/learning/${lang}`)}
              sx={{
                minWidth: '120px',
                fontWeight: language === lang ? 'bold' : 'normal',
                backgroundColor: language === lang ? '#1976d2' : 'transparent'
              }}
            >
              {lang.toUpperCase()}
            </Button>
          ))}
        </Box>

        {!user && (
          <Alert severity="success" sx={{ mb: 3, maxWidth: '600px', mx: 'auto', bgcolor: '#e8f5e9', borderColor: '#4caf50', border: '2px solid' }}>
            <Typography sx={{ mb: 1.5 }}>
              🚀 <strong>Ready to start learning and complete quests?</strong>
            </Typography>
            <Typography sx={{ mb: 2 }}>
              Create an account or login to unlock interactive quests, arcade earn XP points, and track your progress!
            </Typography>
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Button variant="contained" size="medium" onClick={() => navigate('/register')} sx={{ backgroundColor: '#4caf50', '&:hover': { backgroundColor: '#45a049' } }}>
                Get Started - Sign Up
              </Button>
              <Button variant="outlined" size="medium" onClick={() => navigate('/login')} sx={{ borderColor: '#4caf50', color: '#4caf50' }}>
                Already a Member - Login
              </Button>
            </Stack>
          </Alert>
        )}
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
            <>
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
            </>
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
    </Container>
  );
}

export default LearningContent;


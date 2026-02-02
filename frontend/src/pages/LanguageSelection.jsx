import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Alert
} from '@mui/material';
import api from '../services/api';

const languages = [
  { id: 'cpp', name: 'C++', icon: '⚡', description: 'Learn C++ programming with hands-on challenges' },
  { id: 'java', name: 'Java', icon: '☕', description: 'Master Java programming fundamentals' },
  { id: 'python', name: 'Python', icon: '🐍', description: 'Start your Python journey with interactive coding' }
];

function LanguageSelection() {
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSelectedLanguage();
  }, []);

  const fetchSelectedLanguage = async () => {
    try {
      const response = await api.get('/languages/user/selected');
      if (response.data.selectedLanguage) {
        setSelectedLanguage(response.data.selectedLanguage.id);
      }
    } catch (error) {
      console.error('Error fetching selected language:', error);
    }
  };

  const handleSelectLanguage = async (languageId) => {
    setLoading(true);
    setMessage('');

    try {
      const response = await api.post('/languages/user/select', { languageId });
      if (response.data.success) {
        setSelectedLanguage(languageId);
        setMessage(`Successfully selected ${response.data.selectedLanguage.displayName}!`);
        setTimeout(() => {
          navigate('/');
        }, 1500);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to select language');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Select Your Learning Track
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Choose a programming language to start your coding journey. You can change this later from your dashboard.
      </Typography>

      {message && (
        <Alert severity={message.includes('Successfully') ? 'success' : 'error'} sx={{ mb: 3 }}>
          {message}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {languages.map((language) => (
          <Grid item xs={12} md={4} key={language.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                border: selectedLanguage === language.id ? 2 : 0,
                borderColor: 'primary.main'
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box textAlign="center" mb={2}>
                  <Typography variant="h2">{language.icon}</Typography>
                </Box>
                <Typography variant="h5" component="h2" gutterBottom align="center">
                  {language.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                  {language.description}
                </Typography>
                {selectedLanguage === language.id && (
                  <Box mt={2} textAlign="center">
                    <Typography variant="body2" color="primary.main" fontWeight="bold">
                      Currently Selected
                    </Typography>
                  </Box>
                )}
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                <Button
                  variant={selectedLanguage === language.id ? 'outlined' : 'contained'}
                  onClick={() => handleSelectLanguage(language.id)}
                  disabled={loading}
                >
                  {selectedLanguage === language.id ? 'Selected' : 'Select'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default LanguageSelection;


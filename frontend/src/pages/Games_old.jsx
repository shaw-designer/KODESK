import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  LinearProgress,
  Chip
} from '@mui/material';
import { PlayArrow as PlayIcon } from '@mui/icons-material';
import api from '../services/api';

function Games() {
  const [games, setGames] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSelectedLanguage();
  }, []);

  useEffect(() => {
    if (selectedLanguage) {
      fetchGames();
    }
  }, [selectedLanguage]);

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

  const fetchGames = async () => {
    try {
      const response = await api.get('/games/unlocked', {
        params: { language: selectedLanguage }
      });
      setGames(response.data.games || []);
    } catch (error) {
      console.error('Error fetching games:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LinearProgress />;
  }

  if (!selectedLanguage) {
    return (
      <Container>
        <Typography variant="h4" gutterBottom>
          Games
        </Typography>
        <Card sx={{ mt: 3, p: 3 }}>
          <Typography variant="body1" color="text.secondary">
            Please select a programming language first to unlock games.
          </Typography>
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Unlocked Games
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Games are unlocked as you complete coding tasks. Complete more tasks to unlock more games!
      </Typography>

      {games.length === 0 ? (
        <Card sx={{ mt: 3, p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No games unlocked yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Complete coding tasks to unlock games and have fun while learning!
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {games.map((game) => (
            <Grid item xs={12} sm={6} md={4} key={game.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {game.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {game.description || 'Have fun while learning!'}
                  </Typography>
                  <Chip label={`Level ${game.level_number}`} size="small" />
                </CardContent>
                <CardActions>
                  <Button
                    variant="contained"
                    startIcon={<PlayIcon />}
                    fullWidth
                    onClick={() => {
                      // Game implementation would go here
                      alert('Game feature coming soon!');
                    }}
                  >
                    Play Game
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}

export default Games;


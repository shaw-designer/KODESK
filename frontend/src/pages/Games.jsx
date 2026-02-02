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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Alert
} from '@mui/material';
import { PlayArrow as PlayIcon, Close as CloseIcon } from '@mui/icons-material';
import api from '../services/api';

// Simple Number Guessing Game Component
function NumberGuessingGame({ game, onComplete, onClose }) {
  const [targetNumber, setTargetNumber] = useState(null);
  const [guess, setGuess] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [message, setMessage] = useState('');
  const [gameWon, setGameWon] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    // Initialize game
    const randomNum = Math.floor(Math.random() * 100) + 1;
    setTargetNumber(randomNum);
    setAttempts(0);
    setGuess('');
    setMessage('I\'m thinking of a number between 1 and 100. Can you guess it?');
    setGameWon(false);
    setScore(0);
  }, []);

  const handleGuess = () => {
    const guessNum = parseInt(guess);

    if (!guess || isNaN(guessNum) || guessNum < 1 || guessNum > 100) {
      setMessage('Please enter a valid number between 1 and 100');
      return;
    }

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (guessNum === targetNumber) {
      const calculatedScore = Math.max(0, 100 - (newAttempts * 5));
      setScore(calculatedScore);
      setMessage(`🎉 You got it! The number was ${targetNumber}. You took ${newAttempts} attempts!`);
      setGameWon(true);
    } else if (guessNum < targetNumber) {
      setMessage(`Too low! Attempts: ${newAttempts}`);
    } else {
      setMessage(`Too high! Attempts: ${newAttempts}`);
    }

    setGuess('');
  };

  const handlePlayAgain = () => {
    const randomNum = Math.floor(Math.random() * 100) + 1;
    setTargetNumber(randomNum);
    setAttempts(0);
    setGuess('');
    setMessage('I\'m thinking of a new number. Can you guess it?');
    setGameWon(false);
    setScore(0);
  };

  const handleSubmitScore = () => {
    onComplete(score);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {game.title}
      </Typography>
      <Alert severity="info" sx={{ mb: 2 }}>
        Guess the number! The fewer attempts, the higher your score.
      </Alert>

      <Paper sx={{ p: 2, mb: 2, bgcolor: '#f5f5f5' }}>
        <Typography variant="body1" gutterBottom>
          {message}
        </Typography>
        {attempts > 0 && (
          <Typography variant="body2" color="textSecondary">
            Attempts: {attempts}
          </Typography>
        )}
      </Paper>

      {!gameWon ? (
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <input
            type="number"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            placeholder="Enter your guess (1-100)"
            onKeyPress={(e) => e.key === 'Enter' && handleGuess()}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontSize: '16px'
            }}
          />
          <Button
            variant="contained"
            onClick={handleGuess}
          >
            Guess
          </Button>
        </Box>
      ) : (
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" color="success.main" gutterBottom>
            Score: {score} points
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              onClick={handlePlayAgain}
            >
              Play Again
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmitScore}
            >
              Submit Score
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}

// Typing Speed Game Component
function TypingSpeedGame({ game, onComplete, onClose }) {
  const words = ['programming', 'javascript', 'database', 'frontend', 'backend', 'develop', 'testing', 'deploy', 'framework', 'component'];
  const [wordToType, setWordToType] = useState('');
  const [input, setInput] = useState('');
  const [correctWords, setCorrectWords] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (gameStarted && timeLeft > 0 && !gameEnded) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameStarted && !gameEnded) {
      handleGameEnd();
    }
  }, [timeLeft, gameStarted, gameEnded]);

  useEffect(() => {
    if (gameStarted && !wordToType) {
      pickNewWord();
    }
  }, [gameStarted]);

  const pickNewWord = () => {
    const randomWord = words[Math.floor(Math.random() * words.length)];
    setWordToType(randomWord);
    setInput('');
  };

  const handleStart = () => {
    setGameStarted(true);
    setCorrectWords(0);
    setInput('');
  };

  const handleGameEnd = () => {
    setGameEnded(true);
    setGameStarted(false);
    const calculatedScore = correctWords * 10;
    setScore(calculatedScore);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);

    if (value === wordToType) {
      setCorrectWords(correctWords + 1);
      pickNewWord();
    }
  };

  const handleSubmitScore = () => {
    onComplete(score);
  };

  const handlePlayAgain = () => {
    setGameStarted(true);
    setGameEnded(false);
    setCorrectWords(0);
    setTimeLeft(30);
    setInput('');
    pickNewWord();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {game.title}
      </Typography>
      <Alert severity="info" sx={{ mb: 2 }}>
        Type the words as fast as you can! You have 30 seconds.
      </Alert>

      {!gameStarted && !gameEnded && (
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Button variant="contained" size="large" onClick={handleStart}>
            Start Game
          </Button>
        </Box>
      )}

      {(gameStarted || gameEnded) && (
        <Box sx={{ mb: 3 }}>
          <Paper sx={{ p: 2, mb: 2, bgcolor: '#f5f5f5', textAlign: 'center' }}>
            <Typography variant="body2" color="textSecondary">
              Type this word:
            </Typography>
            <Typography variant="h4" sx={{ my: 1, fontFamily: 'monospace' }}>
              {wordToType}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Correct words: {correctWords} | Time left: {timeLeft}s
            </Typography>
          </Paper>

          {gameStarted && (
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Type here..."
              autoFocus
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '4px',
                border: '2px solid #2196F3',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          )}

          {gameEnded && (
            <Box>
              <Typography variant="h6" color="success.main" gutterBottom>
                Game Over!
              </Typography>
              <Typography variant="body1" gutterBottom>
                Words typed correctly: {correctWords}
              </Typography>
              <Typography variant="h6" color="success.main" gutterBottom>
                Score: {score} points
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  onClick={handlePlayAgain}
                >
                  Play Again
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSubmitScore}
                >
                  Submit Score
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}

// Main Games Component
function Games() {
  const [games, setGames] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [selectedLanguageName, setSelectedLanguageName] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState(null);
  const [gameModalOpen, setGameModalOpen] = useState(false);

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
        console.log('[DEBUG] Selected language:', response.data.selectedLanguage);
        setSelectedLanguage(response.data.selectedLanguage.id);
        setSelectedLanguageName(response.data.selectedLanguage.name);
      }
    } catch (error) {
      console.error('Error fetching selected language:', error);
    }
  };

  const fetchGames = async () => {
    try {
      console.log('[DEBUG] Fetching games for language:', selectedLanguage);
      const response = await api.get('/games/unlocked', {
        params: { language: selectedLanguage }
      });
      console.log('[DEBUG] Games fetched:', response.data.games);
      setGames(response.data.games || []);
    } catch (error) {
      console.error('Error fetching games:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayGame = (game) => {
    console.log('[DEBUG] Playing game:', game);
    setSelectedGame(game);
    setGameModalOpen(true);
  };

  const handleCloseGame = () => {
    setGameModalOpen(false);
    setSelectedGame(null);
  };

  const handleCompleteGame = async (score) => {
    try {
      console.log('[DEBUG] Recording game completion:', selectedGame.id, 'score:', score);
      const response = await api.post(`/games/${selectedGame.id}/complete`, {
        score,
        timeSpent: 0
      });
      console.log('[DEBUG] Game completion recorded:', response.data);
      alert('🎉 Game completed! Score: ' + score);
      handleCloseGame();
    } catch (error) {
      console.error('Error recording game completion:', error);
      alert('Error saving game score');
    }
  };

  const renderGameComponent = () => {
    if (!selectedGame) return null;

    const gameId = selectedGame.id;

    // Render different games based on ID
    if (gameId === 1) {
      return (
        <NumberGuessingGame
          game={selectedGame}
          onComplete={handleCompleteGame}
          onClose={handleCloseGame}
        />
      );
    } else if (gameId === 2 || gameId === 3) {
      return (
        <TypingSpeedGame
          game={selectedGame}
          onComplete={handleCompleteGame}
          onClose={handleCloseGame}
        />
      );
    }

    return <Typography>Game feature coming soon!</Typography>;
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
                    onClick={() => handlePlayGame(game)}
                  >
                    Play Game
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Game Modal */}
      <Dialog open={gameModalOpen} onClose={handleCloseGame} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedGame?.title}
          <Button
            onClick={handleCloseGame}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </Button>
        </DialogTitle>
        <DialogContent>
          {renderGameComponent()}
        </DialogContent>
      </Dialog>
    </Container>
  );
}

export default Games;

import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Button, Chip } from '@mui/material';
import styled, { keyframes } from 'styled-components';

const COLORS = ['#FF006E', '#00D9FF', '#39FF14', '#FFD700', '#FF6B35', '#A855F7'];
const COLOR_NAMES = ['Magenta', 'Cyan', 'Lime', 'Gold', 'Orange', 'Purple'];
const CODE_LENGTH = 4;
const MAX_ATTEMPTS = 10;

const pulse = keyframes`
  0%, 100% { box-shadow: 0 0 5px currentColor; }
  50% { box-shadow: 0 0 20px currentColor, 0 0 40px currentColor; }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
`;

const GameBoard = styled(Box)`
  max-width: 500px;
  margin: 0 auto;
`;

const ColorPeg = styled.div`
  width: ${props => props.size || 44}px;
  height: ${props => props.size || 44}px;
  border-radius: 50%;
  background: ${props => props.color || '#1A1F3A'};
  border: 2px solid ${props => props.color ? props.color : '#00D9FF40'};
  cursor: ${props => props.clickable ? 'pointer' : 'default'};
  transition: all 0.2s ease;
  box-shadow: ${props => props.color ? `0 0 10px ${props.color}60` : 'none'};

  &:hover {
    ${props => props.clickable && `
      transform: scale(1.15);
      box-shadow: 0 0 20px ${props.color || '#00D9FF'}80;
    `}
  }
`;

const GuessRow = styled(Box)`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #1A1F3A 0%, #262D42 100%);
  border: 1px solid ${props => props.active ? '#00D9FF' : '#00D9FF20'};
  border-radius: 12px;
  animation: ${slideIn} 0.3s ease;
  ${props => props.active && `box-shadow: 0 0 15px #00D9FF40;`}
`;

const FeedbackPeg = styled.div`
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: ${props => props.type === 'exact' ? '#39FF14' : props.type === 'color' ? '#FFD700' : '#1A1F3A'};
  border: 1px solid ${props => props.type === 'exact' ? '#39FF14' : props.type === 'color' ? '#FFD700' : '#00D9FF30'};
  box-shadow: ${props => props.type !== 'none' ? `0 0 8px ${props.type === 'exact' ? '#39FF14' : '#FFD700'}60` : 'none'};
`;

const ColorPalette = styled(Box)`
  display: flex;
  gap: 12px;
  justify-content: center;
  padding: 16px;
  background: linear-gradient(135deg, #1A1F3A 0%, #262D42 100%);
  border: 1px solid #00D9FF30;
  border-radius: 12px;
  margin-bottom: 20px;
`;

export default function CodeBreaker({ onScore, onBack }) {
  const [secretCode, setSecretCode] = useState([]);
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [score, setScore] = useState(0);

  const generateCode = useCallback(() => {
    const code = [];
    for (let i = 0; i < CODE_LENGTH; i++) {
      code.push(Math.floor(Math.random() * COLORS.length));
    }
    return code;
  }, []);

  useEffect(() => {
    setSecretCode(generateCode());
  }, [generateCode]);

  const getFeedback = (guess, secret) => {
    const feedback = [];
    const secretCopy = [...secret];
    const guessCopy = [...guess];

    // Check exact matches first
    for (let i = 0; i < CODE_LENGTH; i++) {
      if (guessCopy[i] === secretCopy[i]) {
        feedback.push('exact');
        secretCopy[i] = -1;
        guessCopy[i] = -2;
      }
    }

    // Check color matches
    for (let i = 0; i < CODE_LENGTH; i++) {
      if (guessCopy[i] === -2) continue;
      const idx = secretCopy.indexOf(guessCopy[i]);
      if (idx !== -1) {
        feedback.push('color');
        secretCopy[idx] = -1;
      }
    }

    // Fill remaining with none
    while (feedback.length < CODE_LENGTH) {
      feedback.push('none');
    }

    return feedback;
  };

  const handleColorClick = (colorIdx) => {
    if (gameOver || currentGuess.length >= CODE_LENGTH) return;
    setCurrentGuess([...currentGuess, colorIdx]);
  };

  const handleUndo = () => {
    if (currentGuess.length > 0) {
      setCurrentGuess(currentGuess.slice(0, -1));
    }
  };

  const handleSubmitGuess = () => {
    if (currentGuess.length !== CODE_LENGTH) return;

    const feedback = getFeedback(currentGuess, secretCode);
    const newGuesses = [...guesses, { guess: currentGuess, feedback }];
    setGuesses(newGuesses);
    setCurrentGuess([]);

    const exactCount = feedback.filter(f => f === 'exact').length;
    if (exactCount === CODE_LENGTH) {
      const calculatedScore = Math.max(10, 100 - ((newGuesses.length - 1) * 10));
      setScore(calculatedScore);
      setWon(true);
      setGameOver(true);
    } else if (newGuesses.length >= MAX_ATTEMPTS) {
      setScore(0);
      setGameOver(true);
    }
  };

  const handleRestart = () => {
    setSecretCode(generateCode());
    setGuesses([]);
    setCurrentGuess([]);
    setGameOver(false);
    setWon(false);
    setScore(0);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="body2" sx={{ color: '#B0B0B0', mb: 1 }}>
          Crack the 4-color code! Green = right color & position, Yellow = right color, wrong position.
        </Typography>
        <Chip
          label={`Attempt ${guesses.length + (gameOver ? 0 : 1)} / ${MAX_ATTEMPTS}`}
          sx={{ background: '#00D9FF20', color: '#00D9FF', border: '1px solid #00D9FF60' }}
        />
      </Box>

      <GameBoard>
        {/* Color Palette */}
        {!gameOver && (
          <ColorPalette>
            {COLORS.map((color, idx) => (
              <ColorPeg
                key={idx}
                color={color}
                size={40}
                clickable
                onClick={() => handleColorClick(idx)}
                title={COLOR_NAMES[idx]}
              />
            ))}
          </ColorPalette>
        )}

        {/* Current Guess */}
        {!gameOver && (
          <GuessRow active>
            <Box sx={{ display: 'flex', gap: 1, flex: 1 }}>
              {Array.from({ length: CODE_LENGTH }).map((_, i) => (
                <ColorPeg
                  key={i}
                  color={currentGuess[i] !== undefined ? COLORS[currentGuess[i]] : null}
                  size={44}
                />
              ))}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                onClick={handleUndo}
                disabled={currentGuess.length === 0}
                sx={{ minWidth: 60, fontSize: '0.75rem' }}
              >
                Undo
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={handleSubmitGuess}
                disabled={currentGuess.length !== CODE_LENGTH}
                sx={{ minWidth: 70, fontSize: '0.75rem' }}
              >
                Check
              </Button>
            </Box>
          </GuessRow>
        )}

        {/* Previous Guesses */}
        {[...guesses].reverse().map((entry, idx) => (
          <GuessRow key={idx}>
            <Typography sx={{ color: '#00D9FF60', fontSize: '0.75rem', width: 20 }}>
              {guesses.length - idx}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flex: 1 }}>
              {entry.guess.map((colorIdx, i) => (
                <ColorPeg key={i} color={COLORS[colorIdx]} size={38} />
              ))}
            </Box>
            <Box sx={{ display: 'flex', gap: '4px', flexWrap: 'wrap', width: 40 }}>
              {entry.feedback.map((f, i) => (
                <FeedbackPeg key={i} type={f} />
              ))}
            </Box>
          </GuessRow>
        ))}

        {/* Game Over */}
        {gameOver && (
          <Box sx={{
            textAlign: 'center',
            mt: 3,
            p: 3,
            background: 'linear-gradient(135deg, #1A1F3A 0%, #262D42 100%)',
            border: `2px solid ${won ? '#39FF14' : '#FF006E'}`,
            borderRadius: '16px',
            boxShadow: `0 0 30px ${won ? '#39FF14' : '#FF006E'}40`,
          }}>
            <Typography variant="h5" sx={{
              fontWeight: 800,
              color: won ? '#39FF14' : '#FF006E',
              mb: 1,
            }}>
              {won ? 'CODE CRACKED!' : 'CODE UNBROKEN'}
            </Typography>

            {!won && (
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
                <Typography sx={{ color: '#B0B0B0' }}>The code was:</Typography>
                {secretCode.map((c, i) => (
                  <ColorPeg key={i} color={COLORS[c]} size={28} />
                ))}
              </Box>
            )}

            <Typography variant="h6" sx={{ color: '#FFD700', mb: 2 }}>
              Score: {score} pts
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button variant="outlined" onClick={handleRestart}>
                Play Again
              </Button>
              {score > 0 && (
                <Button variant="contained" onClick={() => onScore(score)}>
                  Submit Score
                </Button>
              )}
            </Box>
          </Box>
        )}
      </GameBoard>
    </Box>
  );
}

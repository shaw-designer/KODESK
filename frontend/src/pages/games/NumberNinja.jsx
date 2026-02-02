import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Button, Chip } from '@mui/material';
import styled, { keyframes } from 'styled-components';

const bounce = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const MeterContainer = styled(Box)`
  position: relative;
  width: 100%;
  max-width: 400px;
  height: 40px;
  background: #0D1117;
  border: 2px solid #00D9FF30;
  border-radius: 20px;
  margin: 20px auto;
  overflow: hidden;
`;

const MeterFill = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: ${props => props.width}%;
  background: linear-gradient(90deg,
    #39FF14 0%,
    #FFD700 40%,
    #FF6B35 70%,
    #FF006E 100%
  );
  border-radius: 20px;
  transition: width 0.3s ease;
`;

const MeterTarget = styled.div`
  position: absolute;
  top: -4px;
  bottom: -4px;
  left: ${props => props.pos}%;
  width: 4px;
  background: #FFFFFF;
  box-shadow: 0 0 10px #FFFFFF80;
  border-radius: 2px;
  transform: translateX(-50%);
`;

const GuessHistoryItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  margin-bottom: 6px;
  background: #1A1F3A;
  border: 1px solid ${props => props.exact ? '#39FF14' : '#00D9FF20'};
  border-radius: 8px;
  font-family: 'Space Mono', monospace;
  font-size: 0.85rem;
`;

const Arrow = styled.span`
  color: ${props => props.direction === 'up' ? '#FF006E' : '#39FF14'};
  font-size: 1.2rem;
`;

const RangeSlider = styled.input`
  width: 100%;
  max-width: 400px;
  -webkit-appearance: none;
  height: 8px;
  background: linear-gradient(90deg, #00D9FF, #39FF14);
  border-radius: 4px;
  outline: none;
  opacity: 0.9;
  transition: opacity 0.15s ease-in-out;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #00D9FF;
    border: 3px solid #0A0E27;
    box-shadow: 0 0 15px #00D9FF80;
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #00D9FF;
    border: 3px solid #0A0E27;
    box-shadow: 0 0 15px #00D9FF80;
    cursor: pointer;
  }
`;

const RANGES = [
  { min: 1, max: 50, label: 'Novice (1-50)', maxAttempts: 8 },
  { min: 1, max: 100, label: 'Warrior (1-100)', maxAttempts: 10 },
  { min: 1, max: 500, label: 'Master (1-500)', maxAttempts: 12 },
  { min: 1, max: 1000, label: 'Legend (1-1000)', maxAttempts: 14 },
];

export default function NumberNinja({ onScore, onBack }) {
  const [rangeIdx, setRangeIdx] = useState(0);
  const [target, setTarget] = useState(0);
  const [guess, setGuess] = useState(25);
  const [guessHistory, setGuessHistory] = useState([]);
  const [attempts, setAttempts] = useState(0);
  const [won, setWon] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [round, setRound] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [lowerBound, setLowerBound] = useState(1);
  const [upperBound, setUpperBound] = useState(50);

  const range = RANGES[rangeIdx];

  const startRound = useCallback((rIdx) => {
    const r = RANGES[rIdx];
    const num = Math.floor(Math.random() * (r.max - r.min + 1)) + r.min;
    setTarget(num);
    setGuess(Math.floor((r.min + r.max) / 2));
    setGuessHistory([]);
    setAttempts(0);
    setWon(false);
    setGameOver(false);
    setScore(0);
    setLowerBound(r.min);
    setUpperBound(r.max);
  }, []);

  const handleStart = (rIdx) => {
    setRangeIdx(rIdx);
    setTotalScore(0);
    setRound(1);
    setGameStarted(true);
    startRound(rIdx);
  };

  const handleGuess = () => {
    const guessNum = Math.round(guess);
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    const distance = Math.abs(guessNum - target);
    let hint = '';
    if (distance === 0) {
      hint = 'EXACT!';
    } else if (distance <= 2) {
      hint = 'Burning hot!';
    } else if (distance <= 5) {
      hint = 'Very warm';
    } else if (distance <= 15) {
      hint = 'Warm';
    } else if (distance <= 30) {
      hint = 'Cool';
    } else {
      hint = 'Cold';
    }

    const entry = {
      guess: guessNum,
      direction: guessNum < target ? 'up' : guessNum > target ? 'down' : null,
      hint,
      distance,
    };

    setGuessHistory(prev => [entry, ...prev]);

    if (guessNum < target) {
      setLowerBound(Math.max(lowerBound, guessNum + 1));
    } else if (guessNum > target) {
      setUpperBound(Math.min(upperBound, guessNum - 1));
    }

    if (guessNum === target) {
      const maxAttempts = range.maxAttempts;
      const rangeMultiplier = (rangeIdx + 1) * 25;
      const attemptScore = Math.max(10, rangeMultiplier - ((newAttempts - 1) * (rangeMultiplier / maxAttempts)));
      setScore(Math.round(attemptScore));
      setWon(true);
      setGameOver(true);
    } else if (newAttempts >= range.maxAttempts) {
      setScore(0);
      setGameOver(true);
    }
  };

  const handleNextRound = () => {
    setTotalScore(s => s + score);
    const newRound = round + 1;
    setRound(newRound);

    // Increase difficulty every 3 rounds
    const newRangeIdx = Math.min(Math.floor((newRound - 1) / 3), RANGES.length - 1);
    setRangeIdx(newRangeIdx);
    startRound(newRangeIdx);
  };

  const handleFinish = () => {
    onScore(totalScore + score);
  };

  const meterPosition = range ? ((guess - range.min) / (range.max - range.min)) * 100 : 50;
  const targetPosition = range ? ((target - range.min) / (range.max - range.min)) * 100 : 50;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="body2" sx={{ color: '#B0B0B0', mb: 2 }}>
          Use the slider and temperature hints to find the target number!
        </Typography>
        {gameStarted && (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Chip label={`Round ${round}`}
              sx={{ background: '#00D9FF20', color: '#00D9FF', border: '1px solid #00D9FF60' }} />
            <Chip label={`${attempts}/${range.maxAttempts} tries`}
              sx={{ background: '#FFD70020', color: '#FFD700', border: '1px solid #FFD70060' }} />
            <Chip label={range.label}
              sx={{ background: '#A855F720', color: '#A855F7', border: '1px solid #A855F760' }} />
            <Chip label={`Total: ${totalScore}`}
              sx={{ background: '#39FF1420', color: '#39FF14', border: '1px solid #39FF1460' }} />
          </Box>
        )}
      </Box>

      {!gameStarted && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h5" sx={{ color: '#00D9FF', fontWeight: 700, mb: 3 }}>
            Number Ninja
          </Typography>
          <Typography variant="body1" sx={{ color: '#B0B0B0', mb: 3 }}>
            Find the hidden number using the slider! Hot/cold hints guide you.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            {RANGES.map((r, idx) => (
              <Button key={idx} variant="outlined" onClick={() => handleStart(idx)}
                sx={{
                  borderColor: idx === 0 ? '#39FF14' : idx === 1 ? '#00D9FF' : idx === 2 ? '#FFD700' : '#FF006E',
                  color: idx === 0 ? '#39FF14' : idx === 1 ? '#00D9FF' : idx === 2 ? '#FFD700' : '#FF006E',
                }}>
                {r.label}
              </Button>
            ))}
          </Box>
        </Box>
      )}

      {gameStarted && !gameOver && (
        <Box sx={{ maxWidth: 500, mx: 'auto' }}>
          {/* Proximity Meter */}
          <MeterContainer>
            <MeterFill width={meterPosition} />
            {won && <MeterTarget pos={targetPosition} />}
          </MeterContainer>

          {/* Current Guess Display */}
          <Typography sx={{
            textAlign: 'center',
            fontFamily: 'Space Mono, monospace',
            fontSize: '3rem',
            fontWeight: 800,
            color: '#00D9FF',
            textShadow: '0 0 20px #00D9FF60',
            mb: 1,
          }}>
            {Math.round(guess)}
          </Typography>

          {/* Slider */}
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <RangeSlider
              type="range"
              min={lowerBound}
              max={upperBound}
              value={guess}
              onChange={(e) => setGuess(Number(e.target.value))}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', maxWidth: 400, mx: 'auto' }}>
              <Typography sx={{ color: '#00D9FF60', fontSize: '0.75rem', fontFamily: 'monospace' }}>{lowerBound}</Typography>
              <Typography sx={{ color: '#00D9FF60', fontSize: '0.75rem', fontFamily: 'monospace' }}>{upperBound}</Typography>
            </Box>
          </Box>

          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Button variant="contained" onClick={handleGuess} size="large">
              Guess!
            </Button>
          </Box>

          {/* Guess History */}
          {guessHistory.length > 0 && (
            <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
              {guessHistory.map((entry, idx) => (
                <GuessHistoryItem key={idx} exact={entry.distance === 0}>
                  <Typography sx={{ color: '#00D9FF', fontFamily: 'monospace', fontWeight: 700, minWidth: 40 }}>
                    {entry.guess}
                  </Typography>
                  {entry.direction && (
                    <Arrow direction={entry.direction}>
                      {entry.direction === 'up' ? '▲' : '▼'}
                    </Arrow>
                  )}
                  <Typography sx={{
                    color: entry.hint === 'Burning hot!' ? '#FF006E' :
                      entry.hint === 'Very warm' ? '#FF6B35' :
                        entry.hint === 'Warm' ? '#FFD700' :
                          entry.hint === 'Cool' ? '#00D9FF' : '#A855F7',
                    fontSize: '0.85rem',
                  }}>
                    {entry.hint}
                  </Typography>
                </GuessHistoryItem>
              ))}
            </Box>
          )}
        </Box>
      )}

      {gameOver && (
        <Box sx={{
          textAlign: 'center',
          mt: 2,
          p: 3,
          background: 'linear-gradient(135deg, #1A1F3A 0%, #262D42 100%)',
          border: `2px solid ${won ? '#39FF14' : '#FF006E'}`,
          borderRadius: '16px',
          boxShadow: `0 0 30px ${won ? '#39FF14' : '#FF006E'}40`,
        }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: won ? '#39FF14' : '#FF006E', mb: 1 }}>
            {won ? 'FOUND IT!' : 'OUT OF TRIES'}
          </Typography>
          <Typography sx={{ color: '#B0B0B0', mb: 1 }}>
            The number was <span style={{ color: '#FFD700', fontWeight: 700 }}>{target}</span>
            {won && ` (found in ${attempts} ${attempts === 1 ? 'try' : 'tries'})`}
          </Typography>
          <Typography variant="h6" sx={{ color: '#FFD700', mb: 2 }}>
            +{score} pts
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            {won && (
              <Button variant="outlined" onClick={handleNextRound}>
                Next Round
              </Button>
            )}
            <Button variant="contained" onClick={handleFinish}>
              Submit Score ({totalScore + score})
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}

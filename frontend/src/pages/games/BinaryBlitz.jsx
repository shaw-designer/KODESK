import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Typography, Button, Chip } from '@mui/material';
import styled, { keyframes } from 'styled-components';

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
`;

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
`;

const BitButton = styled.div`
  width: 48px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Space Mono', monospace;
  font-size: 1.4rem;
  font-weight: 700;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;
  background: ${props => props.active ? '#00D9FF' : '#1A1F3A'};
  color: ${props => props.active ? '#0A0E27' : '#00D9FF'};
  border: 2px solid ${props => props.active ? '#00D9FF' : '#00D9FF40'};
  box-shadow: ${props => props.active ? '0 0 15px #00D9FF80' : 'none'};

  &:hover {
    transform: scale(1.1);
    border-color: #00D9FF;
    box-shadow: 0 0 10px #00D9FF60;
  }
`;

const DisplayBox = styled(Box)`
  background: #0D1117;
  border: 2px solid ${props => props.status === 'correct' ? '#39FF14' : props.status === 'wrong' ? '#FF006E' : '#00D9FF40'};
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  transition: all 0.3s ease;
  box-shadow: 0 0 20px ${props => props.status === 'correct' ? '#39FF1440' : props.status === 'wrong' ? '#FF006E40' : '#00D9FF20'};
  ${props => props.status === 'wrong' && `animation: ${shake} 0.3s ease;`}
`;

const GAME_TIME = 60;
const NUM_BITS = 8;

const MODES = ['dec2bin', 'bin2dec', 'hex2bin', 'bin2hex'];
const MODE_LABELS = {
  dec2bin: 'Decimal -> Binary',
  bin2dec: 'Binary -> Decimal',
  hex2bin: 'Hex -> Binary',
  bin2hex: 'Binary -> Hex',
};

export default function BinaryBlitz({ onScore, onBack }) {
  const [mode, setMode] = useState('dec2bin');
  const [targetNumber, setTargetNumber] = useState(0);
  const [bits, setBits] = useState(Array(NUM_BITS).fill(0));
  const [hexInput, setHexInput] = useState('');
  const [decInput, setDecInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState(null); // 'correct', 'wrong'
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [difficulty, setDifficulty] = useState(0);
  const timerRef = useRef(null);
  const inputRef = useRef(null);

  const generateNumber = useCallback(() => {
    const maxByDifficulty = [32, 64, 128, 256];
    const max = maxByDifficulty[Math.min(difficulty, 3)];
    return Math.floor(Math.random() * max);
  }, [difficulty]);

  const selectMode = useCallback(() => {
    // Start with dec2bin, progressively add modes
    const available = MODES.slice(0, Math.min(1 + Math.floor(correct / 3), MODES.length));
    return available[Math.floor(Math.random() * available.length)];
  }, [correct]);

  const newRound = useCallback(() => {
    const num = generateNumber();
    const newMode = selectMode();
    setTargetNumber(num);
    setMode(newMode);
    setBits(Array(NUM_BITS).fill(0));
    setHexInput('');
    setDecInput('');
    setStatus(null);

    if (newMode === 'bin2dec' || newMode === 'bin2hex') {
      // Target is displayed as binary, user enters decimal or hex
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [generateNumber, selectMode]);

  useEffect(() => {
    if (gameStarted && timeLeft > 0 && !gameOver) {
      timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
      return () => clearTimeout(timerRef.current);
    } else if (timeLeft === 0 && gameStarted) {
      setGameOver(true);
    }
  }, [timeLeft, gameStarted, gameOver]);

  const handleStart = () => {
    setScore(0);
    setStreak(0);
    setCorrect(0);
    setTotal(0);
    setDifficulty(0);
    setTimeLeft(GAME_TIME);
    setGameStarted(true);
    setGameOver(false);
    newRound();
  };

  const toggleBit = (index) => {
    if (status || gameOver) return;
    const newBits = [...bits];
    newBits[index] = newBits[index] === 0 ? 1 : 0;
    setBits(newBits);
  };

  const getBinaryValue = () => {
    return bits.reduce((acc, bit, idx) => acc + bit * Math.pow(2, NUM_BITS - 1 - idx), 0);
  };

  const getBinaryString = (num) => {
    return num.toString(2).padStart(NUM_BITS, '0');
  };

  const checkAnswer = () => {
    if (status || gameOver) return;
    let isCorrect = false;

    if (mode === 'dec2bin' || mode === 'hex2bin') {
      isCorrect = getBinaryValue() === targetNumber;
    } else if (mode === 'bin2dec') {
      isCorrect = parseInt(decInput) === targetNumber;
    } else if (mode === 'bin2hex') {
      isCorrect = parseInt(hexInput, 16) === targetNumber;
    }

    setTotal(t => t + 1);
    setStatus(isCorrect ? 'correct' : 'wrong');

    if (isCorrect) {
      const streakBonus = streak >= 3 ? 10 : streak >= 2 ? 5 : 0;
      setScore(s => s + 20 + streakBonus);
      setStreak(s => s + 1);
      setCorrect(c => {
        const newCorrect = c + 1;
        if (newCorrect % 5 === 0) setDifficulty(d => d + 1);
        return newCorrect;
      });
    } else {
      setStreak(0);
    }

    setTimeout(() => {
      newRound();
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') checkAnswer();
  };

  const getDisplayValue = () => {
    if (mode === 'dec2bin') return targetNumber.toString();
    if (mode === 'hex2bin') return '0x' + targetNumber.toString(16).toUpperCase();
    if (mode === 'bin2dec' || mode === 'bin2hex') return getBinaryString(targetNumber);
    return '';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="body2" sx={{ color: '#B0B0B0', mb: 2 }}>
          Convert between number systems as fast as you can!
        </Typography>
        {gameStarted && !gameOver && (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Chip label={`${timeLeft}s`}
              sx={{ background: timeLeft <= 10 ? '#FF006E20' : '#00D9FF20', color: timeLeft <= 10 ? '#FF006E' : '#00D9FF', border: `1px solid ${timeLeft <= 10 ? '#FF006E' : '#00D9FF'}60`, fontFamily: 'monospace', fontWeight: 700 }} />
            <Chip label={`Score: ${score}`}
              sx={{ background: '#39FF1420', color: '#39FF14', border: '1px solid #39FF1460' }} />
            <Chip label={`${correct}/${total}`}
              sx={{ background: '#FFD70020', color: '#FFD700', border: '1px solid #FFD70060' }} />
          </Box>
        )}
      </Box>

      {!gameStarted && !gameOver && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="h5" sx={{ color: '#00D9FF', fontWeight: 700, mb: 2 }}>
            Binary Blitz
          </Typography>
          <Typography variant="body1" sx={{ color: '#B0B0B0', mb: 3 }}>
            Convert between decimal, binary, and hex in {GAME_TIME} seconds.
            <br />New modes unlock as you progress!
          </Typography>
          <Button variant="contained" size="large" onClick={handleStart}>
            Start Converting
          </Button>
        </Box>
      )}

      {gameStarted && !gameOver && (
        <Box sx={{ maxWidth: 500, mx: 'auto' }}>
          <Chip label={MODE_LABELS[mode]} size="small"
            sx={{ mb: 2, background: '#A855F720', color: '#A855F7', border: '1px solid #A855F760', display: 'block', mx: 'auto', width: 'fit-content' }} />

          <DisplayBox status={status}>
            <Typography sx={{ color: '#B0B0B0', fontSize: '0.8rem', mb: 1 }}>
              Convert this:
            </Typography>
            <Typography sx={{
              fontFamily: 'Space Mono, monospace',
              fontSize: '2.2rem',
              fontWeight: 700,
              color: '#00D9FF',
              letterSpacing: '3px',
              textShadow: '0 0 20px #00D9FF60',
            }}>
              {getDisplayValue()}
            </Typography>
          </DisplayBox>

          <Box sx={{ mt: 3 }}>
            {(mode === 'dec2bin' || mode === 'hex2bin') && (
              <>
                <Typography sx={{ textAlign: 'center', color: '#B0B0B0', mb: 1, fontSize: '0.8rem' }}>
                  Toggle bits (MSB to LSB):
                </Typography>
                <Box sx={{ display: 'flex', gap: '6px', justifyContent: 'center', mb: 1 }}>
                  {bits.map((bit, idx) => (
                    <BitButton
                      key={idx}
                      active={bit === 1}
                      onClick={() => toggleBit(idx)}
                    >
                      {bit}
                    </BitButton>
                  ))}
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: '6px', mb: 2 }}>
                  {Array.from({ length: NUM_BITS }).map((_, idx) => (
                    <Typography key={idx} sx={{ width: 48, textAlign: 'center', fontSize: '0.6rem', color: '#00D9FF40' }}>
                      {Math.pow(2, NUM_BITS - 1 - idx)}
                    </Typography>
                  ))}
                </Box>
                <Typography sx={{ textAlign: 'center', color: '#E0E0E0', fontFamily: 'monospace', mb: 2 }}>
                  = {getBinaryValue()} (decimal)
                </Typography>
              </>
            )}

            {mode === 'bin2dec' && (
              <Box sx={{ textAlign: 'center' }}>
                <Typography sx={{ color: '#B0B0B0', mb: 1, fontSize: '0.8rem' }}>Enter decimal value:</Typography>
                <input
                  ref={inputRef}
                  type="number"
                  value={decInput}
                  onChange={(e) => setDecInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  style={{
                    background: '#0D1117',
                    border: '2px solid #00D9FF40',
                    borderRadius: '10px',
                    color: '#E0E0E0',
                    padding: '12px 20px',
                    fontSize: '1.3rem',
                    fontFamily: 'Space Mono, monospace',
                    textAlign: 'center',
                    width: '200px',
                    outline: 'none',
                  }}
                  placeholder="?"
                />
              </Box>
            )}

            {mode === 'bin2hex' && (
              <Box sx={{ textAlign: 'center' }}>
                <Typography sx={{ color: '#B0B0B0', mb: 1, fontSize: '0.8rem' }}>Enter hex value (without 0x):</Typography>
                <input
                  ref={inputRef}
                  type="text"
                  value={hexInput}
                  onChange={(e) => setHexInput(e.target.value.replace(/[^0-9a-fA-F]/g, ''))}
                  onKeyPress={handleKeyPress}
                  style={{
                    background: '#0D1117',
                    border: '2px solid #00D9FF40',
                    borderRadius: '10px',
                    color: '#E0E0E0',
                    padding: '12px 20px',
                    fontSize: '1.3rem',
                    fontFamily: 'Space Mono, monospace',
                    textAlign: 'center',
                    width: '200px',
                    outline: 'none',
                    textTransform: 'uppercase',
                  }}
                  placeholder="?"
                />
              </Box>
            )}

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Button variant="contained" onClick={checkAnswer} size="large">
                Submit
              </Button>
            </Box>
          </Box>
        </Box>
      )}

      {gameOver && (
        <Box sx={{
          textAlign: 'center',
          p: 3,
          background: 'linear-gradient(135deg, #1A1F3A 0%, #262D42 100%)',
          border: '2px solid #00D9FF',
          borderRadius: '16px',
          boxShadow: '0 0 30px #00D9FF40',
        }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#00D9FF', mb: 2 }}>
            TIME'S UP!
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', mb: 2, flexWrap: 'wrap' }}>
            <Box>
              <Typography sx={{ color: '#39FF14', fontSize: '1.5rem', fontWeight: 800 }}>{correct}</Typography>
              <Typography sx={{ color: '#B0B0B0', fontSize: '0.75rem' }}>Correct</Typography>
            </Box>
            <Box>
              <Typography sx={{ color: '#FF006E', fontSize: '1.5rem', fontWeight: 800 }}>{total - correct}</Typography>
              <Typography sx={{ color: '#B0B0B0', fontSize: '0.75rem' }}>Wrong</Typography>
            </Box>
            <Box>
              <Typography sx={{ color: '#A855F7', fontSize: '1.5rem', fontWeight: 800 }}>
                {total > 0 ? Math.round((correct / total) * 100) : 0}%
              </Typography>
              <Typography sx={{ color: '#B0B0B0', fontSize: '0.75rem' }}>Accuracy</Typography>
            </Box>
          </Box>
          <Typography variant="h6" sx={{ color: '#FFD700', mb: 2 }}>
            Score: {score} pts
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button variant="outlined" onClick={handleStart}>
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
    </Box>
  );
}

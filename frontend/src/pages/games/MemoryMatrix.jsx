import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Typography, Button, Chip } from '@mui/material';
import styled, { keyframes, css } from 'styled-components';

const flash = keyframes`
  0% { background: #00D9FF; box-shadow: 0 0 30px #00D9FF; }
  100% { background: #1A1F3A; box-shadow: none; }
`;

const successPulse = keyframes`
  0%, 100% { box-shadow: 0 0 10px #39FF1460; }
  50% { box-shadow: 0 0 30px #39FF14; }
`;

const GridContainer = styled(Box)`
  display: grid;
  grid-template-columns: repeat(${props => props.size}, 1fr);
  gap: 8px;
  max-width: ${props => Math.min(props.size * 70, 420)}px;
  margin: 0 auto;
`;

const Cell = styled.div`
  width: 100%;
  aspect-ratio: 1;
  border-radius: 10px;
  cursor: ${props => props.clickable ? 'pointer' : 'default'};
  transition: all 0.15s ease;
  background: ${props => {
    if (props.revealed) return '#00D9FF';
    if (props.selected && props.correct === true) return '#39FF14';
    if (props.selected && props.correct === false) return '#FF006E';
    if (props.selected) return '#00D9FF';
    return '#1A1F3A';
  }};
  border: 2px solid ${props => {
    if (props.revealed) return '#00D9FF';
    if (props.selected && props.correct === true) return '#39FF14';
    if (props.selected && props.correct === false) return '#FF006E';
    if (props.selected) return '#00D9FF';
    return '#00D9FF30';
  }};
  box-shadow: ${props => {
    if (props.revealed) return '0 0 15px #00D9FF80, inset 0 0 10px #00D9FF40';
    if (props.selected && props.correct === true) return '0 0 15px #39FF1480';
    if (props.selected && props.correct === false) return '0 0 15px #FF006E80';
    if (props.selected) return '0 0 15px #00D9FF60';
    return 'none';
  }};

  &:hover {
    ${props => props.clickable && `
      border-color: #00D9FF;
      box-shadow: 0 0 10px #00D9FF40;
      transform: scale(1.05);
    `}
  }
`;

const INITIAL_SIZE = 3;
const INITIAL_CELLS = 3;

export default function MemoryMatrix({ onScore, onBack }) {
  const [gridSize, setGridSize] = useState(INITIAL_SIZE);
  const [activeCells, setActiveCells] = useState(INITIAL_CELLS);
  const [pattern, setPattern] = useState(new Set());
  const [selected, setSelected] = useState(new Set());
  const [phase, setPhase] = useState('ready'); // ready, showing, input, result
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [showResult, setShowResult] = useState(null); // null, true, false per cell
  const [gameOver, setGameOver] = useState(false);
  const timerRef = useRef(null);

  const generatePattern = useCallback(() => {
    const totalCells = gridSize * gridSize;
    const newPattern = new Set();
    while (newPattern.size < activeCells) {
      newPattern.add(Math.floor(Math.random() * totalCells));
    }
    return newPattern;
  }, [gridSize, activeCells]);

  const startRound = useCallback(() => {
    const newPattern = generatePattern();
    setPattern(newPattern);
    setSelected(new Set());
    setShowResult(null);
    setPhase('showing');

    const showTime = Math.max(800, 2000 - (level * 100));
    timerRef.current = setTimeout(() => {
      setPhase('input');
    }, showTime);
  }, [generatePattern, level]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleStart = () => {
    setLevel(1);
    setScore(0);
    setLives(3);
    setGridSize(INITIAL_SIZE);
    setActiveCells(INITIAL_CELLS);
    setGameOver(false);
    setPhase('ready');
    setTimeout(() => {
      const newPattern = generatePattern();
      setPattern(newPattern);
      setSelected(new Set());
      setShowResult(null);
      setPhase('showing');
      timerRef.current = setTimeout(() => {
        setPhase('input');
      }, 2000);
    }, 100);
  };

  const handleCellClick = (idx) => {
    if (phase !== 'input' || selected.has(idx)) return;

    const newSelected = new Set(selected);
    newSelected.add(idx);
    setSelected(newSelected);

    if (!pattern.has(idx)) {
      // Wrong cell
      const newLives = lives - 1;
      setLives(newLives);
      setShowResult('checking');
      setPhase('result');

      setTimeout(() => {
        if (newLives <= 0) {
          setGameOver(true);
        } else {
          // Next round same level
          startRound();
        }
      }, 1500);
      return;
    }

    // Check if all pattern cells found
    const correctSelected = [...newSelected].filter(s => pattern.has(s));
    if (correctSelected.length === pattern.size) {
      const levelScore = level * 10 + activeCells * 5;
      setScore(prev => prev + levelScore);
      setPhase('result');
      setShowResult('checking');

      setTimeout(() => {
        const newLevel = level + 1;
        setLevel(newLevel);

        // Increase difficulty
        let newSize = gridSize;
        let newCells = activeCells + 1;
        if (newLevel % 3 === 0 && gridSize < 6) {
          newSize = gridSize + 1;
        }
        if (newCells > newSize * newSize * 0.5) {
          newCells = Math.floor(newSize * newSize * 0.4);
        }

        setGridSize(newSize);
        setActiveCells(newCells);

        // Start next round after brief delay
        setTimeout(() => {
          const totalCells = newSize * newSize;
          const nextPattern = new Set();
          while (nextPattern.size < newCells) {
            nextPattern.add(Math.floor(Math.random() * totalCells));
          }
          setPattern(nextPattern);
          setSelected(new Set());
          setShowResult(null);
          setPhase('showing');

          const showTime = Math.max(800, 2000 - (newLevel * 100));
          timerRef.current = setTimeout(() => {
            setPhase('input');
          }, showTime);
        }, 500);
      }, 1000);
    }
  };

  const getCellState = (idx) => {
    const isInPattern = pattern.has(idx);
    const isSelected = selected.has(idx);
    const isRevealed = phase === 'showing' && isInPattern;

    if (phase === 'result') {
      return {
        revealed: false,
        selected: isSelected || isInPattern,
        correct: isInPattern,
        clickable: false,
      };
    }

    return {
      revealed: isRevealed,
      selected: isSelected,
      correct: isSelected ? isInPattern : undefined,
      clickable: phase === 'input' && !isSelected,
    };
  };

  return (
    <Box sx={{ p: 3, textAlign: 'center' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" sx={{ color: '#B0B0B0', mb: 2 }}>
          Memorize the pattern, then recreate it! The grid grows as you advance.
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Chip label={`Level ${level}`} sx={{ background: '#00D9FF20', color: '#00D9FF', border: '1px solid #00D9FF60' }} />
          <Chip label={`Score: ${score}`} sx={{ background: '#39FF1420', color: '#39FF14', border: '1px solid #39FF1460' }} />
          <Chip label={`${'O'.repeat(lives)}${'X'.repeat(3 - lives)}`} sx={{ background: '#FF006E20', color: '#FF006E', border: '1px solid #FF006E60', fontFamily: 'monospace' }} />
        </Box>
      </Box>

      {phase === 'ready' && !gameOver && (
        <Box sx={{ py: 6 }}>
          <Typography variant="h5" sx={{ color: '#00D9FF', fontWeight: 700, mb: 3 }}>
            Ready?
          </Typography>
          <Button variant="contained" size="large" onClick={handleStart}>
            Start Game
          </Button>
        </Box>
      )}

      {phase !== 'ready' && !gameOver && (
        <>
          <Typography variant="body2" sx={{
            color: phase === 'showing' ? '#FFD700' : phase === 'input' ? '#00D9FF' : '#39FF14',
            mb: 2,
            fontWeight: 700,
            fontSize: '0.9rem',
          }}>
            {phase === 'showing' ? 'MEMORIZE THE PATTERN...' :
             phase === 'input' ? `TAP ${activeCells - [...selected].filter(s => pattern.has(s)).length} MORE CELLS` :
             'CHECKING...'}
          </Typography>

          <GridContainer size={gridSize}>
            {Array.from({ length: gridSize * gridSize }).map((_, idx) => {
              const state = getCellState(idx);
              return (
                <Cell
                  key={idx}
                  {...state}
                  onClick={() => handleCellClick(idx)}
                />
              );
            })}
          </GridContainer>
        </>
      )}

      {gameOver && (
        <Box sx={{
          mt: 2,
          p: 3,
          background: 'linear-gradient(135deg, #1A1F3A 0%, #262D42 100%)',
          border: '2px solid #FF006E',
          borderRadius: '16px',
          boxShadow: '0 0 30px #FF006E40',
        }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#FF006E', mb: 1 }}>
            GAME OVER
          </Typography>
          <Typography variant="h6" sx={{ color: '#FFD700', mb: 1 }}>
            Level Reached: {level}
          </Typography>
          <Typography variant="h6" sx={{ color: '#39FF14', mb: 2 }}>
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

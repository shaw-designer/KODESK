import React, { useState, useCallback } from 'react';
import { Box, Typography, Button, Chip } from '@mui/material';
import styled, { keyframes } from 'styled-components';

const swap = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.15); }
  100% { transform: scale(1); }
`;

const celebrate = keyframes`
  0% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0); }
`;

const ArrayBar = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  cursor: ${props => props.clickable ? 'pointer' : 'default'};
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;

  ${props => props.selected && `
    transform: translateY(-12px);
  `}

  ${props => props.sorted && `
    animation: ${celebrate} 0.5s ease;
  `}
`;

const Bar = styled.div`
  width: ${props => props.barWidth || 48}px;
  height: ${props => props.height}px;
  border-radius: 8px 8px 0 0;
  background: ${props => {
    if (props.sorted) return 'linear-gradient(180deg, #39FF14, #00FF88)';
    if (props.selected) return 'linear-gradient(180deg, #FFD700, #FF6B35)';
    if (props.comparing) return 'linear-gradient(180deg, #FF006E, #A855F7)';
    return 'linear-gradient(180deg, #00D9FF, #0088CC)';
  }};
  border: 2px solid ${props => {
    if (props.sorted) return '#39FF14';
    if (props.selected) return '#FFD700';
    if (props.comparing) return '#FF006E';
    return '#00D9FF';
  }};
  box-shadow: ${props => {
    if (props.sorted) return '0 0 15px #39FF1460';
    if (props.selected) return '0 0 20px #FFD70080';
    return '0 0 10px #00D9FF40';
  }};
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
`;

const ValueLabel = styled.div`
  font-family: 'Space Mono', monospace;
  font-weight: 700;
  font-size: ${props => props.small ? '0.75rem' : '0.9rem'};
  color: ${props => {
    if (props.sorted) return '#39FF14';
    if (props.selected) return '#FFD700';
    return '#00D9FF';
  }};
  margin-top: 8px;
  text-shadow: ${props => props.selected ? '0 0 10px #FFD70080' : 'none'};
`;

const ARRAY_SIZES = [6, 8, 10, 12];
const MAX_VALUE = 50;

function generateArray(size) {
  const arr = [];
  const used = new Set();
  while (arr.length < size) {
    const val = Math.floor(Math.random() * MAX_VALUE) + 1;
    if (!used.has(val)) {
      used.add(val);
      arr.push(val);
    }
  }
  return arr;
}

function isSorted(arr) {
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] > arr[i + 1]) return false;
  }
  return true;
}

export default function SortChallenge({ onScore, onBack }) {
  const [level, setLevel] = useState(1);
  const [array, setArray] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [swapCount, setSwapCount] = useState(0);
  const [minSwaps, setMinSwaps] = useState(0);
  const [sorted, setSorted] = useState(false);
  const [score, setScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [showingResult, setShowingResult] = useState(false);

  const calculateMinSwaps = (arr) => {
    const sorted = [...arr].sort((a, b) => a - b);
    const indexMap = new Map();
    arr.forEach((val, idx) => indexMap.set(val, idx));
    let swaps = 0;
    const visited = new Array(arr.length).fill(false);

    for (let i = 0; i < arr.length; i++) {
      if (visited[i] || arr[i] === sorted[i]) continue;
      let cycleSize = 0;
      let j = i;
      while (!visited[j]) {
        visited[j] = true;
        j = indexMap.get(sorted[j]);
        cycleSize++;
      }
      if (cycleSize > 0) swaps += cycleSize - 1;
    }
    return swaps;
  };

  const startLevel = useCallback((lvl) => {
    const sizeIdx = Math.min(Math.floor((lvl - 1) / 2), ARRAY_SIZES.length - 1);
    const size = ARRAY_SIZES[sizeIdx];
    let newArray;
    do {
      newArray = generateArray(size);
    } while (isSorted(newArray));

    setArray(newArray);
    setSelectedIdx(null);
    setSwapCount(0);
    setMinSwaps(calculateMinSwaps(newArray));
    setSorted(false);
    setShowingResult(false);
  }, []);

  const handleStart = () => {
    setLevel(1);
    setTotalScore(0);
    setGameStarted(true);
    startLevel(1);
  };

  const handleBarClick = (idx) => {
    if (sorted || showingResult) return;

    if (selectedIdx === null) {
      setSelectedIdx(idx);
    } else if (selectedIdx === idx) {
      setSelectedIdx(null);
    } else {
      // Swap
      const newArray = [...array];
      [newArray[selectedIdx], newArray[idx]] = [newArray[idx], newArray[selectedIdx]];
      setArray(newArray);
      setSelectedIdx(null);
      setSwapCount(s => s + 1);

      if (isSorted(newArray)) {
        setSorted(true);
        const newSwapCount = swapCount + 1;
        const efficiency = Math.max(0, 1 - ((newSwapCount - minSwaps) / (minSwaps * 2)));
        const levelScore = Math.round(50 + efficiency * 50);
        setScore(levelScore);
        setShowingResult(true);
      }
    }
  };

  const handleNextLevel = () => {
    setTotalScore(s => s + score);
    const newLevel = level + 1;
    setLevel(newLevel);
    startLevel(newLevel);
  };

  const handleFinish = () => {
    const finalScore = totalScore + score;
    onScore(finalScore);
  };

  const maxBarHeight = 180;
  const barWidth = Math.max(32, Math.min(48, 400 / (array.length || 1)));

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="body2" sx={{ color: '#B0B0B0', mb: 2 }}>
          Sort the array by swapping elements! Click two bars to swap them.
        </Typography>
        {gameStarted && (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Chip label={`Level ${level}`}
              sx={{ background: '#00D9FF20', color: '#00D9FF', border: '1px solid #00D9FF60' }} />
            <Chip label={`Swaps: ${swapCount}`}
              sx={{ background: '#FFD70020', color: '#FFD700', border: '1px solid #FFD70060' }} />
            <Chip label={`Optimal: ${minSwaps}`}
              sx={{ background: '#39FF1420', color: '#39FF14', border: '1px solid #39FF1460' }} />
            <Chip label={`Total: ${totalScore}`}
              sx={{ background: '#A855F720', color: '#A855F7', border: '1px solid #A855F760' }} />
          </Box>
        )}
      </Box>

      {!gameStarted && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="h5" sx={{ color: '#00D9FF', fontWeight: 700, mb: 2 }}>
            Sort Challenge
          </Typography>
          <Typography variant="body1" sx={{ color: '#B0B0B0', mb: 3 }}>
            Sort arrays by swapping elements. Fewer swaps = higher score!
            <br />Arrays get bigger as you level up.
          </Typography>
          <Button variant="contained" size="large" onClick={handleStart}>
            Start Sorting
          </Button>
        </Box>
      )}

      {gameStarted && array.length > 0 && (
        <>
          <Box sx={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            gap: '6px',
            minHeight: maxBarHeight + 60,
            p: 3,
            background: 'linear-gradient(135deg, #1A1F3A 0%, #262D42 100%)',
            border: '1px solid #00D9FF20',
            borderRadius: '16px',
          }}>
            {array.map((value, idx) => {
              const height = Math.max(20, (value / MAX_VALUE) * maxBarHeight);
              return (
                <ArrayBar
                  key={idx}
                  selected={selectedIdx === idx}
                  sorted={sorted}
                  clickable={!sorted}
                  onClick={() => handleBarClick(idx)}
                >
                  <Bar
                    height={height}
                    barWidth={barWidth}
                    selected={selectedIdx === idx}
                    sorted={sorted}
                  />
                  <ValueLabel
                    selected={selectedIdx === idx}
                    sorted={sorted}
                    small={array.length > 8}
                  >
                    {value}
                  </ValueLabel>
                </ArrayBar>
              );
            })}
          </Box>

          {showingResult && (
            <Box sx={{
              textAlign: 'center',
              mt: 3,
              p: 3,
              background: 'linear-gradient(135deg, #1A1F3A 0%, #262D42 100%)',
              border: '2px solid #39FF14',
              borderRadius: '16px',
              boxShadow: '0 0 30px #39FF1440',
            }}>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#39FF14', mb: 1 }}>
                SORTED!
              </Typography>
              <Typography sx={{ color: '#B0B0B0', mb: 1 }}>
                {swapCount} swaps (optimal: {minSwaps})
              </Typography>
              <Typography variant="h6" sx={{ color: '#FFD700', mb: 2 }}>
                +{score} pts
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button variant="outlined" onClick={handleNextLevel}>
                  Next Level
                </Button>
                <Button variant="contained" onClick={handleFinish}>
                  Submit Score ({totalScore + score})
                </Button>
              </Box>
            </Box>
          )}
        </>
      )}
    </Box>
  );
}

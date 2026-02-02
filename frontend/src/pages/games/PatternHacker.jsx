import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Box, Typography, Button, Chip } from '@mui/material';
import styled from 'styled-components';

const SequenceBox = styled(Box)`
  display: flex;
  gap: 10px;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  padding: 20px;
  background: #0D1117;
  border: 1px solid #00D9FF30;
  border-radius: 12px;
  margin-bottom: 20px;
`;

const SequenceItem = styled.div`
  font-family: 'Space Mono', monospace;
  font-size: ${props => props.small ? '1rem' : '1.3rem'};
  font-weight: 700;
  padding: 10px 16px;
  border-radius: 10px;
  background: ${props => props.isAnswer ? '#00D9FF15' : '#1A1F3A'};
  border: 2px solid ${props => {
    if (props.correct === true) return '#39FF14';
    if (props.correct === false) return '#FF006E';
    if (props.isAnswer) return '#00D9FF';
    return '#00D9FF30';
  }};
  color: ${props => {
    if (props.correct === true) return '#39FF14';
    if (props.correct === false) return '#FF006E';
    if (props.isAnswer) return '#00D9FF';
    return '#E0E0E0';
  }};
  box-shadow: ${props => {
    if (props.correct === true) return '0 0 15px #39FF1460';
    if (props.correct === false) return '0 0 15px #FF006E60';
    if (props.isAnswer) return '0 0 10px #00D9FF30';
    return 'none';
  }};
  min-width: 50px;
  text-align: center;
`;

const ChoiceButton = styled.div`
  font-family: 'Space Mono', monospace;
  font-size: 1.1rem;
  font-weight: 700;
  padding: 12px 24px;
  border-radius: 10px;
  cursor: pointer;
  background: #1A1F3A;
  border: 2px solid #00D9FF40;
  color: #E0E0E0;
  transition: all 0.2s ease;
  min-width: 70px;
  text-align: center;

  &:hover {
    border-color: #00D9FF;
    box-shadow: 0 0 15px #00D9FF40;
    transform: translateY(-3px);
    color: #00D9FF;
  }
`;

// Pattern generators
const PATTERN_TYPES = [
  {
    name: 'Arithmetic',
    generate: (difficulty) => {
      const start = Math.floor(Math.random() * 10) + 1;
      const diff = Math.floor(Math.random() * (3 + difficulty)) + 2;
      const len = 5 + Math.min(difficulty, 3);
      const seq = [];
      for (let i = 0; i < len; i++) seq.push(start + diff * i);
      return { sequence: seq, answer: seq[len - 1], showUpTo: len - 1 };
    },
  },
  {
    name: 'Geometric',
    generate: (difficulty) => {
      const start = Math.floor(Math.random() * 3) + 2;
      const ratio = Math.floor(Math.random() * 2) + 2;
      const len = 5 + Math.min(difficulty, 2);
      const seq = [];
      let val = start;
      for (let i = 0; i < len; i++) {
        seq.push(val);
        val *= ratio;
      }
      return { sequence: seq, answer: seq[len - 1], showUpTo: len - 1 };
    },
  },
  {
    name: 'Fibonacci-like',
    generate: (difficulty) => {
      const a = Math.floor(Math.random() * 3) + 1;
      const b = Math.floor(Math.random() * 5) + 2;
      const seq = [a, b];
      for (let i = 2; i < 7; i++) {
        seq.push(seq[i - 1] + seq[i - 2]);
      }
      return { sequence: seq, answer: seq[6], showUpTo: 6 };
    },
  },
  {
    name: 'Square Numbers',
    generate: (difficulty) => {
      const offset = Math.floor(Math.random() * (2 + difficulty));
      const len = 6;
      const seq = [];
      for (let i = 1; i <= len; i++) seq.push(i * i + offset);
      return { sequence: seq, answer: seq[len - 1], showUpTo: len - 1 };
    },
  },
  {
    name: 'Alternating',
    generate: (difficulty) => {
      const a = Math.floor(Math.random() * 5) + 1;
      const b = Math.floor(Math.random() * 5) + 10;
      const incA = Math.floor(Math.random() * 3) + 1;
      const incB = Math.floor(Math.random() * 3) + 1;
      const seq = [];
      for (let i = 0; i < 8; i++) {
        seq.push(i % 2 === 0 ? a + Math.floor(i / 2) * incA : b + Math.floor(i / 2) * incB);
      }
      return { sequence: seq, answer: seq[7], showUpTo: 7 };
    },
  },
  {
    name: 'Triangular',
    generate: (difficulty) => {
      const len = 6;
      const seq = [];
      for (let i = 1; i <= len; i++) seq.push((i * (i + 1)) / 2);
      return { sequence: seq, answer: seq[len - 1], showUpTo: len - 1 };
    },
  },
  {
    name: 'Power of 2',
    generate: (difficulty) => {
      const len = 7;
      const seq = [];
      for (let i = 0; i < len; i++) seq.push(Math.pow(2, i));
      return { sequence: seq, answer: seq[len - 1], showUpTo: len - 1 };
    },
  },
  {
    name: 'Cumulative Sum',
    generate: (difficulty) => {
      const base = [1, 2, 3, 4, 5, 6];
      const seq = [];
      let sum = 0;
      for (const n of base) {
        sum += n;
        seq.push(sum);
      }
      return { sequence: seq, answer: seq[5], showUpTo: 5 };
    },
  },
];

function generateChoices(answer, count = 4) {
  const choices = new Set([answer]);
  const offsets = [-3, -2, -1, 1, 2, 3, 5, 7, 10, -5, -7];
  while (choices.size < count) {
    const offset = offsets[Math.floor(Math.random() * offsets.length)];
    const choice = answer + offset;
    if (choice > 0 && choice !== answer) {
      choices.add(choice);
    } else {
      choices.add(answer + Math.floor(Math.random() * 20) + 1);
    }
  }
  return [...choices].sort(() => Math.random() - 0.5);
}

export default function PatternHacker({ onScore, onBack }) {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [currentPattern, setCurrentPattern] = useState(null);
  const [choices, setChoices] = useState([]);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [difficulty, setDifficulty] = useState(0);

  const generateRound = useCallback(() => {
    const typeIdx = Math.floor(Math.random() * PATTERN_TYPES.length);
    const patternType = PATTERN_TYPES[typeIdx];
    const pattern = patternType.generate(difficulty);
    const roundChoices = generateChoices(pattern.answer);

    setCurrentPattern({
      ...pattern,
      type: patternType.name,
    });
    setChoices(roundChoices);
    setAnswered(false);
    setSelectedAnswer(null);
    setIsCorrect(null);
  }, [difficulty]);

  const handleStart = () => {
    setLevel(1);
    setScore(0);
    setLives(3);
    setDifficulty(0);
    setGameStarted(true);
    setGameOver(false);
    generateRound();
  };

  useEffect(() => {
    if (gameStarted && !gameOver && !currentPattern) {
      generateRound();
    }
  }, [gameStarted, gameOver, currentPattern, generateRound]);

  const handleChoiceClick = (choice) => {
    if (answered) return;
    setAnswered(true);
    setSelectedAnswer(choice);

    const correct = choice === currentPattern.answer;
    setIsCorrect(correct);

    if (correct) {
      const levelBonus = level * 5;
      setScore(s => s + 20 + levelBonus);
    } else {
      setLives(l => l - 1);
    }

    setTimeout(() => {
      if (!correct && lives <= 1) {
        setGameOver(true);
        return;
      }

      const newLevel = level + 1;
      setLevel(newLevel);
      if (newLevel % 3 === 0) setDifficulty(d => d + 1);
      generateRound();
    }, 2000);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="body2" sx={{ color: '#B0B0B0', mb: 2 }}>
          Find the next number in the sequence! Patterns get harder as you level up.
        </Typography>
        {gameStarted && !gameOver && (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Chip label={`Level ${level}`}
              sx={{ background: '#00D9FF20', color: '#00D9FF', border: '1px solid #00D9FF60' }} />
            <Chip label={`Score: ${score}`}
              sx={{ background: '#39FF1420', color: '#39FF14', border: '1px solid #39FF1460' }} />
            <Chip label={`${'O'.repeat(lives)}${'X'.repeat(3 - lives)}`}
              sx={{ background: '#FF006E20', color: '#FF006E', border: '1px solid #FF006E60', fontFamily: 'monospace' }} />
            {currentPattern && (
              <Chip label={currentPattern.type} size="small"
                sx={{ background: '#A855F720', color: '#A855F7', border: '1px solid #A855F760' }} />
            )}
          </Box>
        )}
      </Box>

      {!gameStarted && !gameOver && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="h5" sx={{ color: '#00D9FF', fontWeight: 700, mb: 2 }}>
            Pattern Hacker
          </Typography>
          <Typography variant="body1" sx={{ color: '#B0B0B0', mb: 3 }}>
            Complete number sequences by finding the pattern.
            <br />Arithmetic, geometric, fibonacci, and more!
          </Typography>
          <Button variant="contained" size="large" onClick={handleStart}>
            Start Hacking
          </Button>
        </Box>
      )}

      {gameStarted && !gameOver && currentPattern && (
        <Box sx={{ maxWidth: 600, mx: 'auto' }}>
          {/* Sequence Display */}
          <SequenceBox>
            {currentPattern.sequence.slice(0, currentPattern.showUpTo).map((val, idx) => (
              <SequenceItem key={idx} small={currentPattern.sequence.length > 7}>
                {val}
              </SequenceItem>
            ))}
            <SequenceItem
              isAnswer
              correct={isCorrect}
              small={currentPattern.sequence.length > 7}
            >
              {answered ? currentPattern.answer : '?'}
            </SequenceItem>
          </SequenceBox>

          {/* Choices */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            {choices.map((choice, idx) => (
              <ChoiceButton
                key={idx}
                onClick={() => handleChoiceClick(choice)}
                style={answered ? {
                  borderColor: choice === currentPattern.answer ? '#39FF14' :
                    choice === selectedAnswer ? '#FF006E' : '#00D9FF20',
                  color: choice === currentPattern.answer ? '#39FF14' :
                    choice === selectedAnswer ? '#FF006E' : '#B0B0B0',
                  cursor: 'default',
                  boxShadow: choice === currentPattern.answer ? '0 0 15px #39FF1460' :
                    choice === selectedAnswer && !isCorrect ? '0 0 15px #FF006E60' : 'none',
                } : undefined}
              >
                {choice}
              </ChoiceButton>
            ))}
          </Box>

          {answered && (
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography sx={{
                color: isCorrect ? '#39FF14' : '#FF006E',
                fontWeight: 700,
                fontSize: '0.9rem',
              }}>
                {isCorrect ? `Correct! +${20 + level * 5} pts` : `Wrong! The answer was ${currentPattern.answer}`}
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {gameOver && (
        <Box sx={{
          textAlign: 'center',
          p: 3,
          background: 'linear-gradient(135deg, #1A1F3A 0%, #262D42 100%)',
          border: '2px solid #FF006E',
          borderRadius: '16px',
          boxShadow: '0 0 30px #FF006E40',
        }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#FF006E', mb: 2 }}>
            GAME OVER
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', mb: 2, flexWrap: 'wrap' }}>
            <Box>
              <Typography sx={{ color: '#00D9FF', fontSize: '1.5rem', fontWeight: 800 }}>{level - 1}</Typography>
              <Typography sx={{ color: '#B0B0B0', fontSize: '0.75rem' }}>Patterns Solved</Typography>
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

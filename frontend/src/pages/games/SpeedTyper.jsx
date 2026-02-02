import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Typography, Button, Chip } from '@mui/material';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
`;

const correctFlash = keyframes`
  0% { color: #39FF14; text-shadow: 0 0 20px #39FF14; }
  100% { color: #E0E0E0; text-shadow: none; }
`;

const WordDisplay = styled(Box)`
  background: #0D1117;
  border: 2px solid ${props => props.status === 'correct' ? '#39FF14' : props.status === 'wrong' ? '#FF006E' : '#00D9FF30'};
  border-radius: 16px;
  padding: 30px;
  text-align: center;
  transition: all 0.2s ease;
  box-shadow: 0 0 20px ${props => props.status === 'correct' ? '#39FF1440' : props.status === 'wrong' ? '#FF006E40' : '#00D9FF15'};
  margin-bottom: 20px;
`;

const TypeInput = styled.input`
  width: 100%;
  background: #1A1F3A;
  border: 2px solid #00D9FF40;
  border-radius: 12px;
  color: #E0E0E0;
  padding: 16px 24px;
  font-family: 'Space Mono', monospace;
  font-size: 1.2rem;
  text-align: center;
  outline: none;
  transition: all 0.2s ease;
  box-sizing: border-box;

  &:focus {
    border-color: #00D9FF;
    box-shadow: 0 0 20px #00D9FF40;
  }

  &::placeholder {
    color: #00D9FF40;
  }
`;

const ProgressTrack = styled(Box)`
  height: 6px;
  background: #1A1F3A;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 20px;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #00D9FF, ${props => props.low ? '#FF006E' : '#39FF14'});
  border-radius: 3px;
  transition: width 1s linear;
  box-shadow: 0 0 10px ${props => props.low ? '#FF006E' : '#00D9FF'}80;
`;

const WORD_SETS = {
  keywords: [
    'function', 'const', 'return', 'import', 'export', 'default',
    'class', 'extends', 'interface', 'async', 'await', 'promise',
    'typeof', 'instanceof', 'constructor', 'static', 'public', 'private',
  ],
  concepts: [
    'algorithm', 'recursion', 'iteration', 'database', 'framework',
    'component', 'middleware', 'endpoint', 'protocol', 'encryption',
    'callback', 'polymorphism', 'inheritance', 'abstraction', 'encapsulation',
    'deployment', 'container', 'pipeline', 'repository', 'dependency',
  ],
  snippets: [
    'console.log()', 'arr.map()', 'obj.keys()', 'str.split()',
    'Promise.all()', 'Array.from()', 'JSON.parse()', 'Math.random()',
    'fetch(url)', 'try { } catch', 'if (x === y)', 'for (let i)',
    'while (true)', '() => {}', 'new Map()', 'Set.has()',
  ],
};

const GAME_TIME = 45;

export default function SpeedTyper({ onScore, onBack }) {
  const [wordSet, setWordSet] = useState('keywords');
  const [currentWord, setCurrentWord] = useState('');
  const [input, setInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [score, setScore] = useState(0);
  const [correctWords, setCorrectWords] = useState(0);
  const [wrongWords, setWrongWords] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [wordStatus, setWordStatus] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [usedWords, setUsedWords] = useState(new Set());
  const inputRef = useRef(null);
  const timerRef = useRef(null);

  const pickNewWord = useCallback(() => {
    const words = WORD_SETS[wordSet];
    let available = words.filter(w => !usedWords.has(w));
    if (available.length === 0) {
      setUsedWords(new Set());
      available = words;
    }
    const word = available[Math.floor(Math.random() * available.length)];
    setUsedWords(prev => new Set([...prev, word]));
    setCurrentWord(word);
    setInput('');
    setWordStatus(null);
  }, [wordSet, usedWords]);

  useEffect(() => {
    if (gameStarted && timeLeft > 0 && !gameOver) {
      timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
      return () => clearTimeout(timerRef.current);
    } else if (timeLeft === 0 && gameStarted) {
      const totalChars = correctWords * 5; // approximate
      const minutes = GAME_TIME / 60;
      setWpm(Math.round(totalChars / 5 / minutes));
      setGameOver(true);
    }
  }, [timeLeft, gameStarted, gameOver, correctWords]);

  const handleStart = (set) => {
    setWordSet(set || 'keywords');
    setTimeLeft(GAME_TIME);
    setScore(0);
    setCorrectWords(0);
    setWrongWords(0);
    setStreak(0);
    setBestStreak(0);
    setUsedWords(new Set());
    setGameStarted(true);
    setGameOver(false);

    const words = WORD_SETS[set || 'keywords'];
    const word = words[Math.floor(Math.random() * words.length)];
    setCurrentWord(word);
    setInput('');
    setWordStatus(null);

    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInput(val);

    if (val === currentWord) {
      const streakBonus = streak >= 5 ? 5 : streak >= 3 ? 3 : 0;
      const lengthBonus = Math.floor(currentWord.length / 3);
      setScore(s => s + 10 + streakBonus + lengthBonus);
      setCorrectWords(c => c + 1);
      setStreak(s => {
        const newStreak = s + 1;
        setBestStreak(b => Math.max(b, newStreak));
        return newStreak;
      });
      setWordStatus('correct');
      setTimeout(() => pickNewWord(), 200);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      // Skip word (penalty)
      setWrongWords(w => w + 1);
      setStreak(0);
      setWordStatus('wrong');
      setTimeout(() => pickNewWord(), 200);
    }
  };

  const getCharColors = () => {
    return currentWord.split('').map((char, idx) => {
      if (idx >= input.length) return '#E0E0E0';
      return input[idx] === char ? '#39FF14' : '#FF006E';
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="body2" sx={{ color: '#B0B0B0', mb: 2 }}>
          Type programming words as fast as you can! Press Tab to skip.
        </Typography>
        {gameStarted && !gameOver && (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Chip label={`${timeLeft}s`}
              sx={{ background: timeLeft <= 10 ? '#FF006E20' : '#00D9FF20', color: timeLeft <= 10 ? '#FF006E' : '#00D9FF', border: `1px solid ${timeLeft <= 10 ? '#FF006E' : '#00D9FF'}60`, fontFamily: 'monospace', fontWeight: 700 }} />
            <Chip label={`Score: ${score}`}
              sx={{ background: '#39FF1420', color: '#39FF14', border: '1px solid #39FF1460' }} />
            <Chip label={`Streak: ${streak}`}
              sx={{ background: '#FFD70020', color: '#FFD700', border: '1px solid #FFD70060' }} />
          </Box>
        )}
      </Box>

      {!gameStarted && !gameOver && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h5" sx={{ color: '#00D9FF', fontWeight: 700, mb: 3 }}>
            Speed Typer
          </Typography>
          <Typography variant="body1" sx={{ color: '#B0B0B0', mb: 3 }}>
            Choose a word category and type as fast as you can!
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button variant="outlined" onClick={() => handleStart('keywords')}
              sx={{ borderColor: '#00D9FF', color: '#00D9FF' }}>
              Keywords
            </Button>
            <Button variant="outlined" onClick={() => handleStart('concepts')}
              sx={{ borderColor: '#39FF14', color: '#39FF14' }}>
              Concepts
            </Button>
            <Button variant="outlined" onClick={() => handleStart('snippets')}
              sx={{ borderColor: '#FFD700', color: '#FFD700' }}>
              Code Snippets
            </Button>
          </Box>
        </Box>
      )}

      {gameStarted && !gameOver && (
        <Box sx={{ maxWidth: 500, mx: 'auto' }}>
          <ProgressTrack>
            <ProgressFill
              low={timeLeft <= 10}
              style={{ width: `${(timeLeft / GAME_TIME) * 100}%` }}
            />
          </ProgressTrack>

          <WordDisplay status={wordStatus}>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: '2px', flexWrap: 'wrap' }}>
              {currentWord.split('').map((char, idx) => {
                const colors = getCharColors();
                return (
                  <Typography key={idx} component="span" sx={{
                    fontFamily: 'Space Mono, monospace',
                    fontSize: '2rem',
                    fontWeight: 700,
                    color: colors[idx],
                    transition: 'color 0.1s',
                    textShadow: colors[idx] === '#39FF14' ? '0 0 10px #39FF1480' :
                      colors[idx] === '#FF006E' ? '0 0 10px #FF006E80' : 'none',
                  }}>
                    {char}
                  </Typography>
                );
              })}
            </Box>
          </WordDisplay>

          <TypeInput
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type here..."
            autoComplete="off"
            spellCheck="false"
          />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Typography sx={{ color: '#39FF14', fontSize: '0.85rem' }}>
              Correct: {correctWords}
            </Typography>
            <Typography sx={{ color: '#FF006E', fontSize: '0.85rem' }}>
              Skipped: {wrongWords}
            </Typography>
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
              <Typography sx={{ color: '#39FF14', fontSize: '1.5rem', fontWeight: 800 }}>{correctWords}</Typography>
              <Typography sx={{ color: '#B0B0B0', fontSize: '0.75rem' }}>Words Typed</Typography>
            </Box>
            <Box>
              <Typography sx={{ color: '#00D9FF', fontSize: '1.5rem', fontWeight: 800 }}>{wpm}</Typography>
              <Typography sx={{ color: '#B0B0B0', fontSize: '0.75rem' }}>WPM</Typography>
            </Box>
            <Box>
              <Typography sx={{ color: '#FFD700', fontSize: '1.5rem', fontWeight: 800 }}>{bestStreak}</Typography>
              <Typography sx={{ color: '#B0B0B0', fontSize: '0.75rem' }}>Best Streak</Typography>
            </Box>
          </Box>
          <Typography variant="h6" sx={{ color: '#FFD700', mb: 2 }}>
            Score: {score} pts
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button variant="outlined" onClick={() => handleStart(wordSet)}>
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

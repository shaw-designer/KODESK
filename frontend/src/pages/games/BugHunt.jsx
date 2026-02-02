import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Typography, Button, Chip } from '@mui/material';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const CodeBlock = styled(Box)`
  background: #0D1117;
  border: 1px solid #00D9FF30;
  border-radius: 12px;
  padding: 20px;
  font-family: 'Space Mono', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.8;
  overflow-x: auto;
  animation: ${fadeIn} 0.4s ease;
`;

const CodeLine = styled.div`
  display: flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;

  background: ${props => {
    if (props.correct === true) return '#39FF1415';
    if (props.correct === false) return '#FF006E15';
    return 'transparent';
  }};
  border-color: ${props => {
    if (props.correct === true) return '#39FF14';
    if (props.correct === false) return '#FF006E';
    return 'transparent';
  }};

  &:hover {
    background: ${props => props.disabled ? 'transparent' : '#00D9FF10'};
    border-color: ${props => props.disabled ? 'transparent' : '#00D9FF40'};
  }
`;

const LineNumber = styled.span`
  color: #00D9FF40;
  min-width: 32px;
  text-align: right;
  margin-right: 16px;
  user-select: none;
  font-size: 12px;
`;

const BUG_SNIPPETS = [
  {
    language: 'Python',
    code: [
      'def calculate_average(numbers):',
      '    total = 0',
      '    for num in numbers:',
      '        total += num',
      '    average = total / len(number)',
      '    return average',
    ],
    bugLine: 4,
    explanation: '"number" should be "numbers" - variable name typo',
  },
  {
    language: 'JavaScript',
    code: [
      'function fibonacci(n) {',
      '  if (n <= 1) return n;',
      '  let a = 0, b = 1;',
      '  for (let i = 2; i <= n; i++) {',
      '    let temp = a + b;',
      '    a = b;',
      '    b = a;',
      '  }',
      '  return b;',
      '}',
    ],
    bugLine: 6,
    explanation: '"b = a" should be "b = temp" - loses the computed value',
  },
  {
    language: 'Python',
    code: [
      'def binary_search(arr, target):',
      '    low, high = 0, len(arr) - 1',
      '    while low <= high:',
      '        mid = (low + high) / 2',
      '        if arr[mid] == target:',
      '            return mid',
      '        elif arr[mid] < target:',
      '            low = mid + 1',
      '        else:',
      '            high = mid - 1',
      '    return -1',
    ],
    bugLine: 3,
    explanation: 'Should use integer division "//" not "/" to get array index',
  },
  {
    language: 'JavaScript',
    code: [
      'function reverseString(str) {',
      '  let reversed = "";',
      '  for (let i = str.length; i >= 0; i--) {',
      '    reversed += str[i];',
      '  }',
      '  return reversed;',
      '}',
    ],
    bugLine: 2,
    explanation: 'Should start at str.length - 1, not str.length (off-by-one)',
  },
  {
    language: 'Python',
    code: [
      'def is_palindrome(s):',
      '    s = s.lower().strip()',
      '    left = 0',
      '    right = len(s)',
      '    while left < right:',
      '        if s[left] != s[right]:',
      '            return False',
      '        left += 1',
      '        right -= 1',
      '    return True',
    ],
    bugLine: 3,
    explanation: '"right = len(s)" should be "right = len(s) - 1" (index out of range)',
  },
  {
    language: 'JavaScript',
    code: [
      'function mergeArrays(a, b) {',
      '  const result = [];',
      '  let i = 0, j = 0;',
      '  while (i < a.length && j < b.length) {',
      '    if (a[i] <= b[j]) {',
      '      result.push(a[i]);',
      '      i++;',
      '    } else {',
      '      result.push(b[j]);',
      '      i++;',
      '    }',
      '  }',
      '  return result;',
      '}',
    ],
    bugLine: 9,
    explanation: 'Should increment "j++" not "i++" when pushing from array b',
  },
  {
    language: 'Python',
    code: [
      'class Stack:',
      '    def __init__(self):',
      '        self.items = []',
      '',
      '    def push(self, item):',
      '        self.items.append(item)',
      '',
      '    def pop(self):',
      '        return self.items.pop(0)',
      '',
      '    def is_empty(self):',
      '        return len(self.items) == 0',
    ],
    bugLine: 8,
    explanation: 'Stack pop should remove from end: pop() not pop(0) - that\'s a queue',
  },
  {
    language: 'JavaScript',
    code: [
      'function removeDuplicates(arr) {',
      '  const seen = {};',
      '  const result = [];',
      '  for (let i = 0; i <= arr.length; i++) {',
      '    if (!seen[arr[i]]) {',
      '      seen[arr[i]] = true;',
      '      result.push(arr[i]);',
      '    }',
      '  }',
      '  return result;',
      '}',
    ],
    bugLine: 3,
    explanation: '"i <= arr.length" should be "i < arr.length" (off-by-one, accesses undefined)',
  },
  {
    language: 'Python',
    code: [
      'def flatten(nested_list):',
      '    result = []',
      '    for item in nested_list:',
      '        if isinstance(item, list):',
      '            result.append(flatten(item))',
      '        else:',
      '            result.append(item)',
      '    return result',
    ],
    bugLine: 4,
    explanation: 'Should use "result.extend()" not "result.append()" to flatten properly',
  },
  {
    language: 'JavaScript',
    code: [
      'async function fetchData(url) {',
      '  try {',
      '    const response = fetch(url);',
      '    const data = await response.json();',
      '    return data;',
      '  } catch (error) {',
      '    console.error(error);',
      '    return null;',
      '  }',
      '}',
    ],
    bugLine: 2,
    explanation: 'Missing "await" before fetch(url) - response is a Promise, not a Response',
  },
  {
    language: 'Python',
    code: [
      'def count_words(text):',
      '    words = text.split(" ")',
      '    counts = {}',
      '    for word in words:',
      '        if word in counts:',
      '            counts[word] = 1',
      '        else:',
      '            counts[word] = 1',
      '    return counts',
    ],
    bugLine: 5,
    explanation: 'Should be "counts[word] += 1" to increment, not reset to 1',
  },
  {
    language: 'JavaScript',
    code: [
      'function deepClone(obj) {',
      '  if (obj === null) return null;',
      '  if (typeof obj !== "object") return obj;',
      '  const clone = Array.isArray(obj) ? [] : {};',
      '  for (let key in obj) {',
      '    clone[key] = obj[key];',
      '  }',
      '  return clone;',
      '}',
    ],
    bugLine: 5,
    explanation: 'Should recursively call "deepClone(obj[key])" for a true deep clone',
  },
];

const GAME_TIME = 90;

export default function BugHunt({ onScore, onBack }) {
  const [snippets, setSnippets] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedLine, setSelectedLine] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const timerRef = useRef(null);

  const shuffleSnippets = useCallback(() => {
    const shuffled = [...BUG_SNIPPETS].sort(() => Math.random() - 0.5);
    setSnippets(shuffled);
  }, []);

  useEffect(() => {
    shuffleSnippets();
  }, [shuffleSnippets]);

  useEffect(() => {
    if (gameStarted && timeLeft > 0 && !gameOver) {
      timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
      return () => clearTimeout(timerRef.current);
    } else if (timeLeft === 0 && gameStarted) {
      setGameOver(true);
    }
  }, [timeLeft, gameStarted, gameOver]);

  const handleStart = () => {
    shuffleSnippets();
    setCurrentIdx(0);
    setTimeLeft(GAME_TIME);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setCorrect(0);
    setWrong(0);
    setAnswered(false);
    setSelectedLine(null);
    setGameStarted(true);
    setGameOver(false);
  };

  const handleLineClick = (lineIdx) => {
    if (answered || gameOver) return;
    setAnswered(true);
    setSelectedLine(lineIdx);

    const snippet = snippets[currentIdx % snippets.length];
    if (lineIdx === snippet.bugLine) {
      const streakBonus = streak >= 3 ? 5 : 0;
      setScore(s => s + 15 + streakBonus);
      setStreak(s => s + 1);
      setBestStreak(b => Math.max(b, streak + 1));
      setCorrect(c => c + 1);
    } else {
      setStreak(0);
      setWrong(w => w + 1);
    }

    setTimeout(() => {
      setCurrentIdx(i => i + 1);
      setAnswered(false);
      setSelectedLine(null);
    }, 2000);
  };

  const currentSnippet = snippets[currentIdx % snippets.length];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="body2" sx={{ color: '#B0B0B0', mb: 2 }}>
          Find the bug in each code snippet! Click the line with the error.
        </Typography>
        {gameStarted && !gameOver && (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Chip label={`${timeLeft}s`}
              sx={{ background: timeLeft <= 10 ? '#FF006E20' : '#00D9FF20', color: timeLeft <= 10 ? '#FF006E' : '#00D9FF', border: `1px solid ${timeLeft <= 10 ? '#FF006E' : '#00D9FF'}60`, fontFamily: 'monospace', fontWeight: 700 }} />
            <Chip label={`Score: ${score}`}
              sx={{ background: '#39FF1420', color: '#39FF14', border: '1px solid #39FF1460' }} />
            <Chip label={`Streak: ${streak}`}
              sx={{ background: '#FFD70020', color: '#FFD700', border: '1px solid #FFD70060' }} />
            <Chip label={currentSnippet?.language}
              sx={{ background: '#A855F720', color: '#A855F7', border: '1px solid #A855F760' }} />
          </Box>
        )}
      </Box>

      {!gameStarted && !gameOver && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="h5" sx={{ color: '#00D9FF', fontWeight: 700, mb: 2 }}>
            Bug Hunt
          </Typography>
          <Typography variant="body1" sx={{ color: '#B0B0B0', mb: 3 }}>
            You have {GAME_TIME} seconds to find as many bugs as possible.
            <br />Each correct find = 15 pts. Streak bonus at 3+!
          </Typography>
          <Button variant="contained" size="large" onClick={handleStart}>
            Start Hunting
          </Button>
        </Box>
      )}

      {gameStarted && !gameOver && currentSnippet && (
        <CodeBlock>
          {currentSnippet.code.map((line, idx) => {
            let isCorrect = undefined;
            if (answered && idx === currentSnippet.bugLine) isCorrect = true;
            if (answered && selectedLine === idx && idx !== currentSnippet.bugLine) isCorrect = false;

            return (
              <CodeLine
                key={idx}
                correct={isCorrect}
                disabled={answered}
                onClick={() => handleLineClick(idx)}
              >
                <LineNumber>{idx + 1}</LineNumber>
                <span style={{ color: '#E0E0E0' }}>
                  {line || '\u00A0'}
                </span>
              </CodeLine>
            );
          })}

          {answered && (
            <Box sx={{
              mt: 2, pt: 2, borderTop: '1px solid #00D9FF20',
              animation: `${fadeIn} 0.3s ease`,
            }}>
              <Typography sx={{
                color: selectedLine === currentSnippet.bugLine ? '#39FF14' : '#FF006E',
                fontSize: '0.85rem',
                fontFamily: 'Poppins, sans-serif',
              }}>
                {selectedLine === currentSnippet.bugLine ? 'Correct! ' : `Wrong! Bug is on line ${currentSnippet.bugLine + 1}. `}
                {currentSnippet.explanation}
              </Typography>
            </Box>
          )}
        </CodeBlock>
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
              <Typography sx={{ color: '#B0B0B0', fontSize: '0.75rem' }}>Bugs Found</Typography>
            </Box>
            <Box>
              <Typography sx={{ color: '#FF006E', fontSize: '1.5rem', fontWeight: 800 }}>{wrong}</Typography>
              <Typography sx={{ color: '#B0B0B0', fontSize: '0.75rem' }}>Missed</Typography>
            </Box>
            <Box>
              <Typography sx={{ color: '#FFD700', fontSize: '1.5rem', fontWeight: 800 }}>{bestStreak}</Typography>
              <Typography sx={{ color: '#B0B0B0', fontSize: '0.75rem' }}>Best Streak</Typography>
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

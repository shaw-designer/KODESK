import React, { useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  IconButton,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Close as CloseIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import styled, { keyframes } from 'styled-components';
import { colors } from '../theme/modernTheme';
import api from '../services/api';

// Game imports
import CodeBreaker from './games/CodeBreaker';
import MemoryMatrix from './games/MemoryMatrix';
import BugHunt from './games/BugHunt';
import BinaryBlitz from './games/BinaryBlitz';
import SortChallenge from './games/SortChallenge';
import PatternHacker from './games/PatternHacker';
import SpeedTyper from './games/SpeedTyper';
import NumberNinja from './games/NumberNinja';
import HareyException from './games/HareyException';

// Animations
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
`;

const glowPulse = keyframes`
  0%, 100% { box-shadow: 0 0 15px var(--glow-color, ${colors.primary}40); }
  50% { box-shadow: 0 0 30px var(--glow-color, ${colors.primary}80), 0 0 60px var(--glow-color, ${colors.primary}30); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

// Styled components
const ArcadeHeader = styled(Box)`
  text-align: center;
  padding: 40px 20px 30px;
  margin-bottom: 30px;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 200px;
    height: 3px;
    background: linear-gradient(90deg, transparent, ${colors.primary}, transparent);
  }
`;

const ArcadeTitle = styled(Typography)`
  && {
    font-size: 2.5rem;
    font-weight: 800;
    letter-spacing: 8px;
    background: linear-gradient(135deg, ${colors.primary}, ${colors.accent}, ${colors.secondary});
    background-size: 200% 200%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: ${shimmer} 3s ease-in-out infinite;
    text-transform: uppercase;
    margin-bottom: 8px;
  }
`;

const CategoryBar = styled(Box)`
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 30px;
`;

const CategoryChip = styled(Chip)`
  && {
    cursor: pointer;
    font-weight: 600;
    letter-spacing: 0.5px;
    transition: all 0.3s ease;
    background: ${props => props.$active ?
      `linear-gradient(135deg, ${colors.primary}40, ${colors.accent}40)` :
      `${colors.surfaceLight}80`
    };
    border: 1px solid ${props => props.$active ? colors.primary : `${colors.primary}30`};
    color: ${props => props.$active ? colors.primary : colors.text};

    &:hover {
      border-color: ${colors.primary};
      box-shadow: 0 0 15px ${colors.primary}40;
    }
  }
`;

const GameCard = styled(Box)`
  background: linear-gradient(135deg, ${colors.surface}FF 0%, ${colors.surfaceLight}FF 100%);
  border: 2px solid ${props => props.$glowColor || colors.primary}40;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  --glow-color: ${props => props.$glowColor || colors.primary};

  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 120px;
    height: 120px;
    background: radial-gradient(circle, ${props => props.$glowColor || colors.primary}15, transparent);
    border-radius: 50%;
    transform: translate(30%, -30%);
  }

  &:hover {
    transform: translateY(-8px) scale(1.02);
    border-color: ${props => props.$glowColor || colors.primary};
    animation: ${glowPulse} 2s ease-in-out infinite;

    .game-icon {
      animation: ${float} 2s ease-in-out infinite;
    }
  }
`;

const GameIcon = styled(Box)`
  width: 60px;
  height: 60px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  background: ${props => props.$bg || `linear-gradient(135deg, ${colors.primary}30, ${colors.accent}30)`};
  border: 1px solid ${props => props.$borderColor || colors.primary}40;
  box-shadow: 0 0 15px ${props => props.$borderColor || colors.primary}20;
  margin-bottom: 12px;
`;

const DifficultyDots = styled(Box)`
  display: flex;
  gap: 4px;
  align-items: center;
`;

const DifficultyDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.$filled ? props.$color || colors.primary : `${colors.primary}20`};
  box-shadow: ${props => props.$filled ? `0 0 6px ${props.$color || colors.primary}60` : 'none'};
`;

// Game definitions
const GAMES = [
  {
    id: 'code-breaker',
    title: 'Code Breaker',
    description: 'Crack the secret 4-color code using logic and deduction. A classic Mastermind challenge.',
    icon: '\uD83D\uDD10',
    category: 'Logic',
    difficulty: 2,
    color: '#FF006E',
    component: CodeBreaker,
  },
  {
    id: 'memory-matrix',
    title: 'Memory Matrix',
    description: 'Memorize and recreate grid patterns that grow increasingly complex.',
    icon: '\uD83E\uDDE0',
    category: 'Memory',
    difficulty: 2,
    color: '#A855F7',
    component: MemoryMatrix,
  },
  {
    id: 'bug-hunt',
    title: 'Bug Hunt',
    description: 'Find syntax errors hidden in code snippets. Test your debugging eye!',
    icon: '\uD83D\uDC1B',
    category: 'Code',
    difficulty: 3,
    color: '#39FF14',
    component: BugHunt,
  },
  {
    id: 'binary-blitz',
    title: 'Binary Blitz',
    description: 'Convert between decimal, binary, and hexadecimal at lightning speed.',
    icon: '\u26A1',
    category: 'Code',
    difficulty: 3,
    color: '#00D9FF',
    component: BinaryBlitz,
  },
  {
    id: 'sort-challenge',
    title: 'Sort Challenge',
    description: 'Swap elements to sort arrays. Fewer swaps means higher scores!',
    icon: '\uD83D\uDCCA',
    category: 'Logic',
    difficulty: 2,
    color: '#FFD700',
    component: SortChallenge,
  },
  {
    id: 'pattern-hacker',
    title: 'Pattern Hacker',
    description: 'Complete number sequences by cracking the underlying pattern.',
    icon: '\uD83D\uDD22',
    category: 'Logic',
    difficulty: 2,
    color: '#FF6B35',
    component: PatternHacker,
  },
  {
    id: 'speed-typer',
    title: 'Speed Typer',
    description: 'Type programming keywords and code snippets as fast as you can!',
    icon: '\u2328\uFE0F',
    category: 'Speed',
    difficulty: 1,
    color: '#00D9FF',
    component: SpeedTyper,
  },
  {
    id: 'number-ninja',
    title: 'Number Ninja',
    description: 'Use hot/cold hints and a slider to find hidden numbers. Range grows with each level!',
    icon: '\uD83C\uDFAF',
    category: 'Speed',
    difficulty: 1,
    color: '#39FF14',
    component: NumberNinja,
  },
  {
    id: 'harey-exception',
    title: 'Hare-y Exception',
    description: 'Whack bunnies to save them, but watch out for bombs! A fast-paced chaos game.',
    icon: '🐰',
    category: 'Speed',
    difficulty: 2,
    color: '#22C55E',
    component: HareyException,
  },
];

const CATEGORIES = ['All', 'Logic', 'Code', 'Speed', 'Memory'];

function Games() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeGame, setActiveGame] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const filteredGames = selectedCategory === 'All'
    ? GAMES
    : GAMES.filter(g => g.category === selectedCategory);

  const handlePlayGame = (game) => {
    setActiveGame(game);
  };

  const handleCloseGame = () => {
    setActiveGame(null);
  };

  const handleScore = async (score) => {
    try {
      await api.post('/games/arcade/score', {
        gameId: activeGame.id,
        score,
      });
    } catch (e) {
      // Backend may not have this route yet
      console.log('Score recording not available on backend');
    }

    setSnackbar({
      open: true,
      message: `Game complete! Score: ${score} pts`,
      severity: 'success',
    });
    setActiveGame(null);
  };

  return (
    <Container maxWidth="lg">
      {/* Arcade Header */}
      <ArcadeHeader>
        <ArcadeTitle variant="h2">
          ARCADE
        </ArcadeTitle>
        <Typography variant="body1" sx={{ color: `${colors.text}99`, maxWidth: 500, mx: 'auto' }}>
          Sharpen your coding skills with mini-games. Logic puzzles, debugging challenges, and speed trials await!
        </Typography>
      </ArcadeHeader>

      {/* Category Filter */}
      <CategoryBar>
        {CATEGORIES.map(cat => (
          <CategoryChip
            key={cat}
            label={cat}
            $active={selectedCategory === cat}
            onClick={() => setSelectedCategory(cat)}
          />
        ))}
      </CategoryBar>

      {/* Games Grid */}
      <Grid container spacing={3}>
        {filteredGames.map((game) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={game.id}>
            <GameCard
              $glowColor={game.color}
              onClick={() => handlePlayGame(game)}
            >
              <Box sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <GameIcon
                    className="game-icon"
                    $bg={`linear-gradient(135deg, ${game.color}20, ${game.color}10)`}
                    $borderColor={game.color}
                  >
                    {game.icon}
                  </GameIcon>
                  <Chip
                    label={game.category}
                    size="small"
                    sx={{
                      background: `${game.color}15`,
                      color: game.color,
                      border: `1px solid ${game.color}40`,
                      fontSize: '0.7rem',
                      height: 24,
                    }}
                  />
                </Box>

                <Typography variant="h6" sx={{
                  fontWeight: 700,
                  color: colors.text,
                  mb: 0.5,
                  fontSize: '1rem',
                }}>
                  {game.title}
                </Typography>

                <Typography variant="body2" sx={{
                  color: `${colors.text}88`,
                  fontSize: '0.8rem',
                  lineHeight: 1.4,
                  mb: 1.5,
                  minHeight: 45,
                }}>
                  {game.description}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <DifficultyDots>
                    {[1, 2, 3].map(d => (
                      <DifficultyDot key={d} $filled={d <= game.difficulty} $color={game.color} />
                    ))}
                    <Typography sx={{ color: `${colors.text}60`, fontSize: '0.7rem', ml: 0.5 }}>
                      {game.difficulty === 1 ? 'Easy' : game.difficulty === 2 ? 'Medium' : 'Hard'}
                    </Typography>
                  </DifficultyDots>

                  <Button
                    size="small"
                    sx={{
                      color: game.color,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      minWidth: 'auto',
                      '&:hover': {
                        background: `${game.color}15`,
                      },
                    }}
                  >
                    PLAY
                  </Button>
                </Box>
              </Box>
            </GameCard>
          </Grid>
        ))}
      </Grid>

      {/* Game Dialog */}
      <Dialog
        open={!!activeGame}
        onClose={handleCloseGame}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: `linear-gradient(135deg, ${colors.surface}F8 0%, ${colors.surfaceLight}F8 100%)`,
            border: `2px solid ${activeGame?.color || colors.primary}60`,
            borderRadius: '20px',
            boxShadow: `0 0 60px ${activeGame?.color || colors.primary}30`,
            maxHeight: '90vh',
          },
        }}
      >
        {activeGame && (
          <>
            {/* Dialog Header */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 2,
              borderBottom: `1px solid ${activeGame.color}20`,
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <IconButton onClick={handleCloseGame} size="small"
                  sx={{ color: colors.text, '&:hover': { color: activeGame.color } }}>
                  <BackIcon />
                </IconButton>
                <Typography sx={{ fontSize: '1.5rem' }}>{activeGame.icon}</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: activeGame.color }}>
                  {activeGame.title}
                </Typography>
              </Box>
              <IconButton onClick={handleCloseGame} size="small"
                sx={{ color: `${colors.text}60`, '&:hover': { color: '#FF006E' } }}>
                <CloseIcon />
              </IconButton>
            </Box>

            {/* Game Content */}
            <DialogContent sx={{ p: 0 }}>
              <activeGame.component
                onScore={handleScore}
                onBack={handleCloseGame}
              />
            </DialogContent>
          </>
        )}
      </Dialog>

      {/* Score Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar(s => ({ ...s, open: false }))}
          sx={{
            background: `linear-gradient(135deg, ${colors.surface} 0%, ${colors.surfaceLight} 100%)`,
            border: `1px solid ${colors.accent}60`,
            color: colors.accent,
            fontWeight: 600,
            '& .MuiAlert-icon': { color: colors.accent },
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Games;

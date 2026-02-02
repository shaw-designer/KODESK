import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Box,
  LinearProgress,
  CircularProgress,
  Stack,
  Tooltip,
  Avatar,
  Paper
} from '@mui/material';
import {
  Lock as LockIcon,
  CheckCircle as CheckCircleIcon,
  LocalFireDepartment as FlameIcon,
  Star as StarIcon,
  FlashOn as ZapIcon,
  LockOpen as UnlockIcon,
  ArrowForward as ArrowIcon
} from '@mui/icons-material';
import api from '../services/api';
import { colors } from '../theme/modernTheme';
import styled from 'styled-components';

// Styled components
const QuestBoardHeader = styled(Paper)`
  background: linear-gradient(135deg, ${colors.primary}30, ${colors.secondary}30);
  border: 1px solid ${colors.primary}40;
  border-radius: 16px;
  padding: 30px;
  margin-bottom: 30px;
  backdrop-filter: blur(20px);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -10%;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, ${colors.primary}15, transparent);
    border-radius: 50%;
  }
`;

const QuestCard = styled(Card)`
  background: linear-gradient(135deg, ${colors.surface}FF, ${colors.surfaceLight}FF) !important;
  border-radius: 14px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 150px;
    height: 150px;
    background: radial-gradient(circle, ${colors.primary}30, transparent);
    border-radius: 50%;
  }

  &:hover {
    transform: translateY(-8px) scale(1.02);
    border-color: ${colors.primary} !important;
    box-shadow: 0 0 30px ${colors.primary}60, inset 0 0 20px ${colors.primary}20 !important;
  }

  ${props => props.completed && `
    border: 2px solid ${colors.success} !important;
    opacity: 1;
  `}

  ${props => props.unlocked && !props.completed && `
    border: 2px solid ${colors.primary}60 !important;
    opacity: 1;
  `}

  ${props => !props.unlocked && `
    border: 2px solid ${colors.primary}20 !important;
    opacity: 0.6;
    cursor: not-allowed;
  `}
`;

const DifficultyBadge = styled(Box)`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 0.8rem;

  ${props => {
    let bgColor = colors.primary + '30';
    let textColor = colors.primary;
    let borderColor = colors.primary + '60';

    if (props.difficulty === 'beginner') {
      bgColor = colors.success + '30';
      textColor = colors.success;
      borderColor = colors.success + '60';
    } else if (props.difficulty === 'intermediate') {
      bgColor = colors.warning + '30';
      textColor = colors.warning;
      borderColor = colors.warning + '60';
    } else if (props.difficulty === 'advanced') {
      bgColor = colors.error + '30';
      textColor = colors.error;
      borderColor = colors.error + '60';
    }

    return `
      background: ${bgColor};
      color: ${textColor};
      border: 1px solid ${borderColor};
    `;
  }}
`;

const RewardBox = styled(Box)`
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 8px 0;

  & .reward-item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.85rem;
    font-weight: 700;
    color: ${colors.accent};

    & .MuiSvgIcon-root {
      font-size: 1rem;
    }
  }
`;

function Tasks() {
  const { language } = useParams();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, [language]);

  const fetchTasks = async () => {
    try {
      const response = await api.get(`/tasks/language/${language}`);
      setTasks(response.data.tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyInfo = (difficulty) => {
    const difficulties = {
      'beginner': { label: 'Novice', icon: '⭐', color: colors.success },
      'intermediate': { label: 'Warrior', icon: '⚔️', color: colors.warning },
      'advanced': { label: 'Master', icon: '👑', color: colors.error },
    };
    return difficulties[difficulty] || { label: 'Unknown', icon: '?', color: colors.primary };
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress sx={{ color: colors.primary }} />
      </Box>
    );
  }

  const completedCount = tasks.filter(t => t.is_completed).length;
  const unlockedCount = tasks.filter(t => t.is_unlocked).length;

  return (
    <Container maxWidth="lg">
      {/* Header */}
      <QuestBoardHeader elevation={0}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, color: colors.primary }}>
              Quest Board
            </Typography>
            <Typography variant="body1" sx={{ mb: 2, color: `${colors.text}CC` }}>
              Complete increasingly challenging quests to master {language?.toUpperCase()}. Each completed quest earns XP and unlocks new challenges!
            </Typography>
            <Stack direction="row" spacing={3} flexWrap="wrap">
              <Box>
                <Typography variant="caption" sx={{ color: `${colors.text}99` }}>
                  PROGRESS
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: colors.primary }}>
                  {completedCount}/{tasks.length}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: `${colors.text}99` }}>
                  UNLOCKED
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: colors.accent }}>
                  {unlockedCount}
                </Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ color: `${colors.text}99` }}>
                  COMPLETION
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={(completedCount / tasks.length) * 100}
                  sx={{
                    mt: 1,
                    height: 6,
                    borderRadius: 3,
                    background: `${colors.surfaceLight}80`,
                    '& .MuiLinearProgress-bar': {
                      background: `linear-gradient(90deg, ${colors.primary}, ${colors.accent})`,
                    }
                  }}
                />
              </Box>
            </Stack>
          </Grid>
          <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
            <Avatar
              sx={{
                width: 100,
                height: 100,
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
                fontSize: '3rem',
                fontWeight: 800,
                ml: { xs: 0, md: 'auto' }
              }}
            >
              {completedCount}
            </Avatar>
          </Grid>
        </Grid>
      </QuestBoardHeader>

      {/* Quests Grid */}
      <Grid container spacing={3}>
        {tasks.map((task, index) => {
          const diffInfo = getDifficultyInfo(task.difficulty_level);
          return (
            <Grid item xs={12} sm={6} md={4} key={task.id}>
              <Tooltip
                title={task.is_unlocked ? 'Click to start this quest!' : 'Complete previous quests to unlock'}
                arrow
              >
                <QuestCard
                  unlocked={task.is_unlocked}
                  completed={task.is_completed}
                  onClick={() => task.is_unlocked && navigate(`/task/${task.id}`)}
                  sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                >
                  {/* Quest Header */}
                  <CardContent sx={{ flex: 1 }}>
                    {/* Status Badge */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                      <Box>
                        <Chip
                          icon={<FlameIcon />}
                          label={`Quest ${task.level_number}`}
                          size="small"
                          sx={{
                            background: `${colors.primary}20`,
                            color: colors.primary,
                            fontWeight: 700,
                          }}
                        />
                      </Box>
                      {task.is_completed && (
                        <Tooltip title="Completed!">
                          <CheckCircleIcon sx={{ color: colors.success, fontSize: '1.5rem' }} />
                        </Tooltip>
                      )}
                      {!task.is_unlocked && (
                        <Tooltip title="Locked">
                          <LockIcon sx={{ color: `${colors.text}99`, fontSize: '1.5rem' }} />
                        </Tooltip>
                      )}
                      {task.is_unlocked && !task.is_completed && (
                        <Tooltip title="Available">
                          <UnlockIcon sx={{ color: colors.accent, fontSize: '1.5rem' }} />
                        </Tooltip>
                      )}
                    </Box>

                    {/* Quest Title */}
                    <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                      {task.title}
                    </Typography>

                    {/* Quest Description */}
                    <Typography variant="body2" sx={{ color: `${colors.text}99`, mb: 2, minHeight: '40px' }}>
                      {task.description?.substring(0, 100)}...
                    </Typography>

                    {/* Difficulty */}
                    <Box sx={{ mb: 2 }}>
                      <DifficultyBadge difficulty={task.difficulty_level}>
                        <span>{diffInfo.icon}</span>
                        <span>{diffInfo.label}</span>
                      </DifficultyBadge>
                    </Box>

                    {/* Rewards */}
                    <RewardBox>
                      <Box className="reward-item">
                        <StarIcon />
                        <span>100 XP</span>
                      </Box>
                      <Box className="reward-item">
                        <ZapIcon />
                        <span>50 Points</span>
                      </Box>
                    </RewardBox>
                  </CardContent>

                  {/* Action Button */}
                  <CardActions>
                    <Button
                      fullWidth
                      variant={task.is_unlocked ? 'contained' : 'outlined'}
                      disabled={!task.is_unlocked}
                      endIcon={<ArrowIcon />}
                      sx={{
                        background: task.is_unlocked
                          ? `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`
                          : 'transparent',
                        color: task.is_unlocked ? colors.textDark : colors.primary,
                      }}
                    >
                      {task.is_completed ? 'Completed' : task.is_unlocked ? 'Start Quest' : 'Locked'}
                    </Button>
                  </CardActions>
                </QuestCard>
              </Tooltip>
            </Grid>
          );
        })}
      </Grid>

      {tasks.length === 0 && (
        <Paper
          sx={{
            p: 6,
            textAlign: 'center',
            background: `linear-gradient(135deg, ${colors.surface}, ${colors.surfaceLight})`,
            border: `1px solid ${colors.primary}40`,
            borderRadius: 3,
            mt: 4,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            No Quests Available
          </Typography>
          <Typography variant="body2" sx={{ color: `${colors.text}99` }}>
            Check back later for new coding challenges!
          </Typography>
        </Paper>
      )}
    </Container>
  );
}

export default Tasks;

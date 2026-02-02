import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  LinearProgress,
  Chip,
  Avatar,
  Stack,
  Paper,
  CircularProgress,
  Badge
} from '@mui/material';
import {
  Code as CodeIcon,
  School as SchoolIcon,
  EmojiEvents as TrophyIcon,
  LocalFireDepartment as FireIcon,
  Star as StarIcon,
  Bolt as BoltIcon,
  ArrowForward as ArrowIcon
} from '@mui/icons-material';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme/modernTheme';
import styled from 'styled-components';

// Styled components
const HeroSection = styled(Box)`
  background: linear-gradient(135deg, ${colors.primary}30, ${colors.secondary}30, ${colors.accent}30);
  border: 1px solid ${colors.primary}40;
  border-radius: 16px;
  padding: 40px;
  margin-bottom: 30px;
  backdrop-filter: blur(20px);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -10%;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, ${colors.primary}20, transparent);
    border-radius: 50%;
    animation: float 6s ease-in-out infinite;
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(20px); }
  }
`;

const AvatarContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
`;

const LevelBadge = styled(Box)`
  background: linear-gradient(135deg, ${colors.primary}, ${colors.accent});
  border-radius: 50%;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 2rem;
  box-shadow: 0 0 30px ${colors.primary}60;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: -5px;
    left: -5px;
    right: -5px;
    bottom: -5px;
    border: 2px solid ${colors.primary};
    border-radius: 50%;
    animation: spin 3s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const StatCard = styled(Card)`
  background: linear-gradient(135deg, ${colors.surface}FF 0%, ${colors.surfaceLight}FF 100%) !important;
  border: 1px solid ${colors.primary}40 !important;
  backdrop-filter: blur(20px);
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, ${colors.primary}20, transparent);
    transition: left 0.5s;
  }

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 0 40px ${colors.primary}60, inset 0 0 20px ${colors.primary}20 !important;

    &::before {
      left: 100%;
    }
  }
`;

const ProgressBar = styled(LinearProgress)`
  && {
    height: 10px !important;
    border-radius: 10px;
    background: ${colors.surfaceLight}80 !important;
    box-shadow: inset 0 0 10px ${colors.primary}20;

    & .MuiLinearProgress-bar {
      background: linear-gradient(90deg, ${colors.primary}, ${colors.accent}) !important;
      box-shadow: 0 0 10px ${colors.primary}80;
      border-radius: 10px;
    }
  }
`;

const QuestCard = styled(Card)`
  background: linear-gradient(135deg, ${colors.surface}FF, ${colors.surfaceLight}FF) !important;
  border: 2px solid ${colors.primary}40 !important;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 100px;
    height: 100px;
    background: radial-gradient(circle, ${colors.primary}30, transparent);
    border-radius: 50%;
  }

  &:hover {
    transform: translateY(-6px) scale(1.02);
    border-color: ${colors.primary} !important;
    box-shadow: 0 0 30px ${colors.primary}60, inset 0 0 20px ${colors.primary}20 !important;

    & .MuiCardContent-root {
      transform: translateX(5px);
    }
  }
`;

const NotificationBadge = styled(Box)`
  display: inline-block;
  background: linear-gradient(135deg, ${colors.primary}, ${colors.accent});
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 0.85rem;
  animation: pulse 2s ease-in-out infinite;

  @keyframes pulse {
    0%, 100% { box-shadow: 0 0 10px ${colors.primary}60; }
    50% { box-shadow: 0 0 30px ${colors.primary}FF; }
  }
`;

function Dashboard() {
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const langResponse = await api.get('/languages/user/selected');
      if (langResponse.data.selectedLanguage) {
        setSelectedLanguage(langResponse.data.selectedLanguage);
        const progressResponse = await api.get(`/progress/${langResponse.data.selectedLanguage.id}`);
        setProgress(progressResponse.data.progress);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress sx={{ color: colors.primary }} />
      </Box>
    );
  }

  if (!selectedLanguage) {
    return (
      <Container maxWidth="md">
        <HeroSection>
          <AvatarContainer>
            <Avatar
              sx={{
                width: 100,
                height: 100,
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
                fontSize: '3rem',
                fontWeight: 800,
              }}
            >
              {user?.username?.[0]?.toUpperCase()}
            </Avatar>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" sx={{ color: colors.primary, fontWeight: 800, mb: 1 }}>
                Welcome, Coder!
              </Typography>
              <Typography variant="body1" sx={{ color: `${colors.text}CC` }}>
                Start your epic coding journey by selecting a programming realm
              </Typography>
            </Box>
          </AvatarContainer>
        </HeroSection>

        <QuestCard>
          <CardContent sx={{ textAlign: 'center', p: 4 }}>
            <BoltIcon sx={{ fontSize: '3rem', color: colors.primary, mb: 2 }} />
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
              Choose Your Path
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, color: `${colors.text}99` }}>
              Select a programming language to unlock quests and challenges
            </Typography>
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowIcon />}
              onClick={() => navigate('/languages')}
              sx={{
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
                padding: '12px 32px',
                fontSize: '1.1rem',
              }}
            >
              Explore Realms
            </Button>
          </CardContent>
        </QuestCard>
      </Container>
    );
  }

  const completionPercentage = progress ? ((progress.completed_tasks_count || 0) / 50) * 100 : 0;

  return (
    <Container maxWidth="lg">
      {/* Hero Section */}
      <HeroSection>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <AvatarContainer>
              <Box sx={{ position: 'relative' }}>
                <LevelBadge>
                  <span>1</span>
                </LevelBadge>
                <Badge
                  badgeContent="NEW"
                  color="error"
                  sx={{
                    position: 'absolute',
                    top: -5,
                    right: -5,
                    '& .MuiBadge-badge': {
                      background: `linear-gradient(135deg, ${colors.secondary}, ${colors.error})`,
                    },
                  }}
                />
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: colors.primary }}>
                  {user?.username}
                </Typography>
                <Typography variant="body2" sx={{ color: `${colors.text}99` }}>
                  Level 1 Pioneer
                </Typography>
              </Box>
            </AvatarContainer>
          </Grid>

          <Grid item xs={12} md={8}>
            <Typography variant="h4" sx={{ mb: 1, fontWeight: 800 }}>
              Welcome back, {user?.username}!
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, color: `${colors.text}CC` }}>
              You're on an epic quest to master {selectedLanguage.displayName}. Keep conquering challenges!
            </Typography>

            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Chip
                icon={<StarIcon />}
                label={`${progress?.total_xp || 0} XP`}
                sx={{
                  background: `${colors.primary}20`,
                  border: `1px solid ${colors.primary}60`,
                  color: colors.primary,
                  fontWeight: 700,
                }}
              />
              <Chip
                icon={<FireIcon />}
                label={`${progress?.completed_tasks_count || 0} Quests`}
                sx={{
                  background: `${colors.accent}20`,
                  border: `1px solid ${colors.accent}60`,
                  color: colors.accent,
                  fontWeight: 700,
                }}
              />
              <Chip
                icon={<TrophyIcon />}
                label={`${progress?.total_score || 0} Score`}
                sx={{
                  background: `${colors.secondary}20`,
                  border: `1px solid ${colors.secondary}60`,
                  color: colors.secondary,
                  fontWeight: 700,
                }}
              />
            </Stack>
          </Grid>
        </Grid>
      </HeroSection>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CodeIcon sx={{ mr: 1, color: colors.primary, fontSize: '1.8rem' }} />
                <Typography variant="body2" sx={{ color: `${colors.text}99`, fontWeight: 700 }}>
                  QUESTS
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 800, color: colors.primary }}>
                {progress?.completed_tasks_count || 0}
              </Typography>
              <Typography variant="caption" sx={{ color: `${colors.text}77` }}>
                of 50 completed
              </Typography>
              <Box sx={{ mt: 2 }}>
                <ProgressBar variant="determinate" value={completionPercentage} />
              </Box>
            </CardContent>
          </StatCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <StarIcon sx={{ mr: 1, color: colors.accent, fontSize: '1.8rem' }} />
                <Typography variant="body2" sx={{ color: `${colors.text}99`, fontWeight: 700 }}>
                  EXPERIENCE
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 800, color: colors.accent }}>
                {progress?.total_xp || 0}
              </Typography>
              <Typography variant="caption" sx={{ color: `${colors.text}77` }}>
                Level up: {Math.ceil((1000 - (progress?.total_xp || 0)) / 100)}00 XP
              </Typography>
            </CardContent>
          </StatCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrophyIcon sx={{ mr: 1, color: colors.secondary, fontSize: '1.8rem' }} />
                <Typography variant="body2" sx={{ color: `${colors.text}99`, fontWeight: 700 }}>
                  SCORE
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 800, color: colors.secondary }}>
                {progress?.total_score || 0}
              </Typography>
              <Typography variant="caption" sx={{ color: `${colors.text}77` }}>
                Points earned
              </Typography>
            </CardContent>
          </StatCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <FireIcon sx={{ mr: 1, color: colors.primary, fontSize: '1.8rem' }} />
                <Typography variant="body2" sx={{ color: `${colors.text}99`, fontWeight: 700 }}>
                  STREAK
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 800, color: colors.primary }}>
                0
              </Typography>
              <Typography variant="caption" sx={{ color: `${colors.text}77` }}>
                days in a row
              </Typography>
            </CardContent>
          </StatCard>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <QuestCard onClick={() => navigate(`/tasks/${selectedLanguage.id}`)}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <CodeIcon sx={{ fontSize: '2.5rem', color: colors.primary, mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                Continue Quests
              </Typography>
              <Typography variant="caption" sx={{ color: `${colors.text}99` }}>
                Tackle new challenges
              </Typography>
            </CardContent>
          </QuestCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <QuestCard onClick={() => navigate(`/learning/${selectedLanguage.id}`)}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <SchoolIcon sx={{ fontSize: '2.5rem', color: colors.accent, mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                Learn
              </Typography>
              <Typography variant="caption" sx={{ color: `${colors.text}99` }}>
                Study resources
              </Typography>
            </CardContent>
          </QuestCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <QuestCard onClick={() => navigate('/games')}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <BoltIcon sx={{ fontSize: '2.5rem', color: colors.secondary, mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                Arcade
              </Typography>
              <Typography variant="caption" sx={{ color: `${colors.text}99` }}>
                Play mini-games
              </Typography>
            </CardContent>
          </QuestCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <QuestCard onClick={() => navigate('/languages')}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <TrophyIcon sx={{ fontSize: '2.5rem', color: colors.success, mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                Realms
              </Typography>
              <Typography variant="caption" sx={{ color: `${colors.text}99` }}>
                Switch languages
              </Typography>
            </CardContent>
          </QuestCard>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Dashboard;


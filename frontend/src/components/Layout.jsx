import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  IconButton,
  Avatar,
  Badge,
  Tooltip,
  Divider,
  Stack,
  Chip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Code as CodeIcon,
  School as SchoolIcon,
  Games as GamesIcon,
  Person as PersonIcon,
  Language as LanguageIcon,
  Logout as LogoutIcon,
  Close as CloseIcon,
  EmojiEvents as TrophyIcon,
  LocalFireDepartment as FireIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme/modernTheme';
import styled from 'styled-components';

const drawerWidth = 280;

// Styled components for modern look
const StyledAppBar = styled(AppBar)`
  background: linear-gradient(135deg, ${colors.surface}E6 0%, ${colors.surfaceLight}E6 100%) !important;
  backdrop-filter: blur(20px);
  border-bottom: 1px solid ${colors.primary}40;
  box-shadow: 0 0 30px ${colors.primary}40, inset 0 0 30px ${colors.primary}10 !important;
  transition: all 0.3s;
`;

const GlowingLogo = styled(Typography)`
  font-weight: 800;
  font-size: 1.8rem;
  background: linear-gradient(135deg, ${colors.primary}, ${colors.accent});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 20px ${colors.primary}60;
  letter-spacing: 3px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    transform: scale(1.05);
    text-shadow: 0 0 30px ${colors.primary}FF;
  }
`;

const StatsContainer = styled(Box)`
  display: flex;
  gap: 20px;
  margin-left: 40px;
  
  @media (max-width: 900px) {
    display: none;
  }
`;

const StatItem = styled(Box)`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: ${colors.primary}15;
  border: 1px solid ${colors.primary}40;
  border-radius: 8px;
  backdrop-filter: blur(10px);
  
  & .MuiSvgIcon-root {
    color: ${colors.primary};
    font-size: 1.3rem;
  }
  
  & .stat-value {
    font-weight: 700;
    color: ${colors.accent};
    font-size: 0.9rem;
  }
`;

const DrawerHeader = styled(Box)`
  background: linear-gradient(135deg, ${colors.primary}20 0%, ${colors.secondary}20 100%);
  padding: 20px;
  border-bottom: 1px solid ${colors.primary}40;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
`;

const StyledDrawer = styled(Drawer)`
  & .MuiDrawer-paper {
    background: linear-gradient(180deg, ${colors.surface} 0%, ${colors.surfaceLight} 100%);
    border-right: 1px solid ${colors.primary}40;
    backdrop-filter: blur(20px);
  }
`;

const MenuItemStyled = styled(ListItemButton)`
  margin: 4px 8px;
  border-radius: 12px;
  color: ${colors.text};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 4px;
    height: 100%;
    background: linear-gradient(180deg, ${colors.primary}, ${colors.accent});
    transform: scaleY(0);
    transform-origin: top;
    transition: transform 0.3s;
  }

  &:hover {
    background: ${colors.primary}20;
    box-shadow: inset 0 0 20px ${colors.primary}30;
  }

  &.Mui-selected {
    background: linear-gradient(135deg, ${colors.primary}30, ${colors.secondary}20);
    border-left: 4px solid ${colors.primary};
    box-shadow: inset 0 0 20px ${colors.primary}40;

    & .MuiListItemIcon-root {
      color: ${colors.primary};
    }

    & .MuiListItemText-primary {
      color: ${colors.primary};
      font-weight: 700;
    }
  }
`;

const menuItems = [
  { text: 'Hub', icon: <DashboardIcon />, path: '/' },
  { text: 'Realms', icon: <LanguageIcon />, path: '/languages' },
  { text: 'Learning', icon: <SchoolIcon />, path: '/learning' },
  { text: 'Quests', icon: <CodeIcon />, path: '/tasks' },
  { text: 'Arcade', icon: <GamesIcon />, path: '/games' },
  { text: 'Profile', icon: <PersonIcon />, path: '/profile' }
];


function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const drawer = (
    <StyledDrawer
      variant="temporary"
      anchor="left"
      open={mobileOpen}
      onClose={handleDrawerToggle}
      ModalProps={{ keepMounted: true }}
      sx={{ width: drawerWidth }}
    >
      <DrawerHeader>
        <GlowingLogo variant="h6">KODESK</GlowingLogo>
        <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center' }}>
          Code Quest Arena
        </Typography>
      </DrawerHeader>

      <List sx={{ mt: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <MenuItemStyled
              selected={location.pathname === item.path || location.pathname.startsWith(item.path.split('/')[1])}
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </MenuItemStyled>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 2, borderColor: `${colors.primary}40` }} />

      <Box sx={{ px: 2, py: 2 }}>
        <Typography variant="caption" sx={{ color: `${colors.primary}80`, fontWeight: 700 }}>
          CURRENT PLAYER
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
          <Avatar sx={{ width: 40, height: 40, background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})` }}>
            {user?.username?.[0]?.toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: colors.primary }}>
              {user?.username}
            </Typography>
            <Typography variant="caption" sx={{ color: colors.text }}>
              Level 1
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ px: 2, py: 2, mt: 'auto' }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          sx={{
            borderColor: colors.error,
            color: colors.error,
            '&:hover': {
              backgroundColor: `${colors.error}15`,
              boxShadow: `0 0 15px ${colors.error}60`,
            },
          }}
        >
          Logout
        </Button>
      </Box>
    </StyledDrawer>
  );

  // Desktop drawer
  const desktopDrawer = (
    <Box
      sx={{
        width: drawerWidth,
        background: `linear-gradient(180deg, ${colors.surface} 0%, ${colors.surfaceLight} 100%)`,
        borderRight: `1px solid ${colors.primary}40`,
        backdropFilter: 'blur(20px)',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 1000,
      }}
    >
      <DrawerHeader>
        <GlowingLogo
          variant="h6"
          onClick={() => navigate('/')}
          sx={{ cursor: 'pointer' }}
        >
          KODESK
        </GlowingLogo>
        <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', fontSize: '0.75rem' }}>
          Code Quest Arena
        </Typography>
      </DrawerHeader>

      <List sx={{ mt: 2, flex: 1, px: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <MenuItemStyled
              selected={location.pathname === item.path || location.pathname.startsWith(item.path.split('/')[1])}
              onClick={() => navigate(item.path)}
              fullWidth
            >
              <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </MenuItemStyled>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 2, borderColor: `${colors.primary}40`, mx: 1 }} />

      <Box sx={{ px: 2, py: 2 }}>
        <Typography variant="caption" sx={{ color: `${colors.primary}80`, fontWeight: 700 }}>
          PLAYER STATS
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, mb: 2 }}>
          <Avatar sx={{ width: 40, height: 40, background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})` }}>
            {user?.username?.[0]?.toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: colors.primary }}>
              {user?.username}
            </Typography>
            <Typography variant="caption" sx={{ color: colors.text }}>
              Level 1 Pioneer
            </Typography>
          </Box>
        </Box>

        <Stack spacing={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, background: `${colors.primary}10`, borderRadius: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <StarIcon sx={{ fontSize: '1rem', color: colors.accent }} />
              <Typography variant="caption">XP</Typography>
            </Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: colors.accent }}>0</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, background: `${colors.secondary}10`, borderRadius: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrophyIcon sx={{ fontSize: '1rem', color: colors.secondary }} />
              <Typography variant="caption">Score</Typography>
            </Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: colors.secondary }}>0</Typography>
          </Box>
        </Stack>
      </Box>

      <Box sx={{ px: 2, py: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          size="small"
          sx={{
            borderColor: colors.error,
            color: colors.error,
            '&:hover': {
              backgroundColor: `${colors.error}15`,
              boxShadow: `0 0 15px ${colors.error}60`,
            },
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Desktop Drawer */}
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        {desktopDrawer}
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', ml: { xs: 0, md: `${drawerWidth}px` } }}>
        {/* AppBar */}
        <StyledAppBar position="sticky">
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>

            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', flex: 1 }}>
              <GlowingLogo variant="h6" sx={{ mr: 3 }}>
                QUESTING
              </GlowingLogo>
              <Typography variant="body2" sx={{ color: `${colors.primary}80` }}>
                Embrace the Code
              </Typography>
            </Box>

            <StatsContainer>
              <StatItem>
                <StarIcon />
                <span className="stat-value">0 XP</span>
              </StatItem>
              <StatItem>
                <TrophyIcon />
                <span className="stat-value">0 PTS</span>
              </StatItem>
              <StatItem>
                <FireIcon />
                <span className="stat-value">0 DAY</span>
              </StatItem>
            </StatsContainer>

            <Tooltip title={user?.username}>
              <Badge
                overlap="circular"
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                variant="dot"
                sx={{
                  '& .MuiBadge-badge': {
                    backgroundColor: colors.success,
                    boxShadow: `0 0 10px ${colors.success}`,
                    height: 14,
                    minWidth: 14,
                    borderRadius: '50%',
                  },
                }}
              >
                <Avatar
                  sx={{
                    background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
                    width: 40,
                    height: 40,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                  onClick={() => navigate('/profile')}
                >
                  {user?.username?.[0]?.toUpperCase()}
                </Avatar>
              </Badge>
            </Tooltip>
            <Tooltip title="Logout">
              <IconButton color="inherit" onClick={handleLogout} sx={{ ml: 1 }}>
                <LogoutIcon />
              </IconButton>
            </Tooltip>          </Toolbar>
        </StyledAppBar>

        {/* Mobile Drawer */}
        <Box sx={{ display: { md: 'none' } }}>
          {drawer}
        </Box>

        {/* Page Content */}
        <Box sx={{ flex: 1, overflow: 'auto', p: { xs: 1, sm: 2, md: 3 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

export default Layout;


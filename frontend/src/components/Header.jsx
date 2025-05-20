import React, { useState, useEffect } from "react";
import {
  AppBar, Box, Button, IconButton, Menu, MenuItem, Toolbar,
  Typography, useMediaQuery, Link as MuiLink, Avatar, Divider
} from "@mui/material";
import {
  Movie as MovieIcon, Search as SearchIcon, AccountCircle, Menu as MenuIcon,
  Settings as SettingsIcon, Logout as LogoutIcon, ConfirmationNumber as TicketsIcon,
  MeetingRoom as MeetingRoomIcon,
  People as PeopleIcon,
  LocalActivity as OffersIcon,
  CardMembership as MembershipIcon,
  TheaterComedy as CinemasIcon,
  AdminPanelSettings as AdminPanelIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Header() {
  const theme = useTheme();
  const { isAuthenticated, user, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuAnchorEl, setMobileMenuAnchorEl] = useState(null);
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  // eslint-disable-next-line no-unused-vars
  const [isScrolled, setIsScrolled] = useState(false);

  const isAdmin = isAuthenticated && user && hasRole('admin');
  const isClient = isAuthenticated && user && !isAdmin;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleProfileMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMobileMenuOpen = (event) => setMobileMenuAnchorEl(event.currentTarget);
  const handleMenuClose = () => {
    setAnchorEl(null);
    setMobileMenuAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/login');
  };

  const handleNavigate = (path) => {
    handleMenuClose();
    navigate(path);
  };

  const menuId = "primary-account-menu";
  const renderProfileMenu = (
    <Menu
      anchorEl={anchorEl}
      id={menuId}
      keepMounted
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={() => handleNavigate('/profile')}>
        <SettingsIcon sx={{ mr: 1 }} fontSize="small" /> Profile Settings
      </MenuItem>
      {!isAdmin && (
        <MenuItem onClick={() => handleNavigate('/my-tickets')}>
          <TicketsIcon sx={{ mr: 1 }} fontSize="small" /> My Tickets
        </MenuItem>
      )}
      {isAdmin && [
          <Divider key="admin-divider-profile" />,
          <MenuItem key="add-movie-profile" onClick={() => handleNavigate('/movies')}>
            <MovieIcon sx={{ mr: 1 }} fontSize="small" /> Manage Movies
          </MenuItem>,
          <MenuItem key="manage-rooms-profile" onClick={() => handleNavigate('/admin/rooms')}>
            <MeetingRoomIcon sx={{ mr: 1 }} fontSize="small" /> Manage Rooms
          </MenuItem>,
          <MenuItem key="manage-users-profile" onClick={() => handleNavigate('/admin/users')}>
            <PeopleIcon sx={{ mr: 1 }} fontSize="small" /> Manage Users
          </MenuItem>
      ]}
      <Divider />
      <MenuItem onClick={handleLogout}>
        <LogoutIcon sx={{ mr: 1 }} fontSize="small" /> Sign Out
      </MenuItem>
    </Menu>
  );

  const mobileMenuId = "primary-menu-mobile";
  const renderMobileNavMenu = (
    <Menu
      anchorEl={mobileMenuAnchorEl}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      open={Boolean(mobileMenuAnchorEl)}
      onClose={handleMenuClose}
      sx={{ '& .MuiPaper-root': { width: '250px' } }}
    >
      {(!isAdmin) && [
        <MenuItem key="movies-mobile" onClick={() => handleNavigate('/movies')}> <MovieIcon sx={{mr:1}} fontSize="small"/> Movies</MenuItem>,
      ]}

      {isAdmin && [
        <MenuItem key="add-movie-mobile" onClick={() => handleNavigate('/movies')}>
          <MovieIcon sx={{ mr: 1 }} fontSize="small" /> Manage Movies
        </MenuItem>,
        <MenuItem key="manage-rooms-mobile" onClick={() => handleNavigate('/rooms')}>
          <MeetingRoomIcon sx={{ mr: 1 }} fontSize="small" /> Manage Rooms
        </MenuItem>,
        <MenuItem key="manage-users-mobile" onClick={() => handleNavigate('/users')}>
          <PeopleIcon sx={{ mr: 1 }} fontSize="small" /> Manage Users
        </MenuItem>
      ]}
      
      <Divider sx={{ my: 1 }} />

      {isAuthenticated ? (
        [
          <MenuItem key="profile-mobile" onClick={() => handleNavigate('/profile')}>
            <SettingsIcon sx={{ mr: 1 }} fontSize="small" /> Profile
          </MenuItem>,
          !isAdmin && (
             <MenuItem key="my-tickets-mobile" onClick={() => handleNavigate('/my-tickets')}>
                <TicketsIcon sx={{ mr: 1 }} fontSize="small" /> My Tickets
             </MenuItem>
          ),
          <MenuItem key="logout-mobile" onClick={handleLogout}>
            <LogoutIcon sx={{ mr: 1 }} fontSize="small" /> Sign Out
          </MenuItem>
        ].filter(Boolean)
      ) : (
          <MenuItem sx={{p:0}}>
            <Button color="primary" variant="contained" fullWidth onClick={() => handleNavigate('/login')} sx={{m:1}}>
              Sign In
            </Button>
          </MenuItem>
        )}
    </Menu>
  );

  const userName = user?.name || user?.email || 'User';

  return (
    <>
      <AppBar>
        <Toolbar>
          <MuiLink component={RouterLink} to={isAdmin ? "/" : "/"} sx={{ display: 'flex', /* ... */ }}>
            <MovieIcon sx={{ color: "primary.main", /* ... */ }} />
            <Typography variant="h5" component="div" sx={{ fontWeight: 700, /* ... */ }}>
              CinePlex
            </Typography>
          </MuiLink>

          {!isMobile && (
            <Box sx={{ display: "flex", gap: {xs: 1, sm: 2}, flexGrow: 1, justifyContent: 'center', px: 2 }}>
              {(!isAuthenticated || isClient) && ( 
                <>
                  <Button component={RouterLink} to="/movies" color="inherit" sx={{fontSize: {xs: '0.8rem', sm: '0.9rem'}}}>Movies</Button>
                </>
              )}
              {isAdmin && (
                <>
                  <Button component={RouterLink} to="/movies" color="secondary" sx={{fontSize: {xs: '0.8rem', sm: '0.9rem'}, fontWeight: 'bold'}}>Manage Movies</Button>
                  <Button component={RouterLink} to="/rooms" color="secondary" sx={{fontSize: {xs: '0.8rem', sm: '0.9rem'}, fontWeight: 'bold'}}>Manage Rooms</Button>
                  <Button component={RouterLink} to="/users" color="secondary" sx={{fontSize: {xs: '0.8rem', sm: '0.9rem'}, fontWeight: 'bold'}}>Manage Users</Button>
                </>
              )}
            </Box>
          )}

          {isMobile && !isAdmin && <Box sx={{ flexGrow: 1 }} />} 
          {isMobile && isAdmin && <Box sx={{ flexGrow: 1 }} />}

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton size="large" color="inherit" onClick={() => navigate('/search')}>
              <SearchIcon />
            </IconButton>

            {isMobile ? (
              <IconButton size="large" edge="end" color="inherit" aria-label="open mobile menu" onClick={handleMobileMenuOpen}>
                <MenuIcon />
              </IconButton>
            ) : ( 
              isAuthenticated ? (
                <Button
                  color="inherit"
                  onClick={handleProfileMenuOpen}
                  aria-controls={menuId}
                  aria-haspopup="true"
                  startIcon={<Avatar sx={{ width: 28, height: 28, bgcolor: 'secondary.main', fontSize: '0.8rem' }}>{userName.charAt(0).toUpperCase()}</Avatar>}
                  sx={{ textTransform: 'none', ml: 1, mr: -0.5 }} 
                >
                  {userName}
                </Button>
              ) : (
                <Button variant="contained" color="primary" onClick={() => navigate('/login')} sx={{ ml: 2 }}>
                  Sign In
                </Button>
              )
            )}
          </Box>
        </Toolbar>
      </AppBar>
      {!isMobile && renderProfileMenu}
      {renderMobileNavMenu}
      <Toolbar /> {/* Spacer */}
    </>
  );
}

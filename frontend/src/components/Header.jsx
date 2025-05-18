// src/components/Navbar.jsx (or Header.jsx)
import { useState, useEffect } from "react";
import {
  AppBar,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  useMediaQuery,
  Link as MuiLink,
  Avatar
} from "@mui/material";
import {
  Movie as MovieIcon,
  Search as SearchIcon,
  AccountCircle,
  Menu as MenuIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  ConfirmationNumber as TicketsIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Header() { // Renamed to Header to match your MainLayout import
  const theme = useTheme();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuAnchorEl, setMobileMenuAnchorEl] = useState(null);
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [isScrolled, setIsScrolled] = useState(false);

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
      <MenuItem onClick={() => handleNavigate('/my-tickets')}>
        <TicketsIcon sx={{ mr: 1 }} fontSize="small" /> My Tickets
      </MenuItem>
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
      sx={{ '& .MuiPaper-root': { width: '200px' } }}
    >
      <MenuItem onClick={() => handleNavigate('/')}>Movies</MenuItem>
      <MenuItem onClick={() => handleNavigate('/cinemas')}>Cinemas</MenuItem>
      <MenuItem onClick={() => handleNavigate('/offers')}>Offers</MenuItem>
      <MenuItem onClick={() => handleNavigate('/membership')}>Membership</MenuItem>
      <Box sx={{ my: 1 }}><hr /></Box>
      {isAuthenticated
        ? [ // Return an array of MenuItems
            <MenuItem key="profile" onClick={() => handleNavigate('/profile')}>
              <SettingsIcon sx={{ mr: 1 }} fontSize="small" /> Profile
            </MenuItem>,
            <MenuItem key="my-tickets" onClick={() => handleNavigate('/my-tickets')}>
              <TicketsIcon sx={{ mr: 1 }} fontSize="small" /> My Tickets
            </MenuItem>,
            <MenuItem key="logout" onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 1 }} fontSize="small" /> Sign Out
            </MenuItem>,
          ]
        : (
          <MenuItem>
            <Button
              color="primary"
              variant="contained"
              fullWidth
              onClick={() => handleNavigate('/login')}
            >
              Sign In
            </Button>
          </MenuItem>
        )}
    </Menu>
  );

  const userName = user?.name || user?.email || 'User';

  return (
    <>
      <AppBar
        position="fixed"
        color="transparent"
        elevation={isScrolled ? 4 : 0}
        sx={{
          background: isScrolled
            ? "rgba(20, 20, 20, 0.95)"
            : "linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)",
          transition: "all 0.3s ease",
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <MuiLink component={RouterLink} to="/" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit', flexGrow: { xs: 1, md: 0 } }}>
            <MovieIcon sx={{ color: "primary.main", fontSize: { xs: 30, md: 40 }, mr: 1 }} />
            <Typography variant="h5" component="div" sx={{ fontWeight: 700, display: { xs: 'none', md: 'block' } }}>
              CinePlex
            </Typography>
          </MuiLink>

          {!isMobile && (
            <Box sx={{ display: "flex", gap: 2, flexGrow: 1, justifyContent: 'center' }}>
              <Button component={RouterLink} to="/" color="inherit">Movies</Button>
              <Button component={RouterLink} to="/cinemas" color="inherit">Cinemas</Button>
              <Button component={RouterLink} to="/offers" color="inherit">Offers</Button>
              <Button component={RouterLink} to="/membership" color="inherit">Membership</Button>
            </Box>
          )}

          {isMobile && <Box sx={{ flexGrow: 1 }} />}

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton size="large" color="inherit" onClick={() => navigate('/search')}>
              <SearchIcon />
            </IconButton>

            {isMobile ? (
              <IconButton
                size="large"
                edge="end"
                color="inherit"
                aria-label="open mobile menu"
                onClick={handleMobileMenuOpen}
              >
                <MenuIcon />
              </IconButton>
            ) : (
              isAuthenticated ? (
                // Use a Box to group the name button and potentially an icon if desired
                // The Button with the user's name will open the profile menu
                <Button
                  color="inherit"
                  onClick={handleProfileMenuOpen} // This button opens the profile dropdown
                  aria-controls={menuId}
                  aria-haspopup="true"
                  startIcon={<Avatar sx={{ width: 28, height: 28, bgcolor: 'secondary.main', fontSize: '0.8rem' }}>{userName.charAt(0).toUpperCase()}</Avatar>}
                  sx={{ textTransform: 'none', mx: 1 }}
                >
                  {userName}
                </Button>
                // If you want an AccountCircle icon in addition or instead, place it here.
                // For instance, if the button above only showed name and didn't open menu:
                // <IconButton onClick={handleProfileMenuOpen} color="inherit">
                //   <AccountCircle />
                // </IconButton>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate('/login')}
                  sx={{ ml: 2 }}
                >
                  Sign In
                </Button>
              )
            )}
          </Box>
        </Toolbar>
      </AppBar>
      {/* Only render renderProfileMenu if not on mobile AND if there's an anchor (menu is open) */}
      {/* The Menu component itself handles the 'open' prop, so we just need to pass it to render */}
      {!isMobile && renderProfileMenu}
      {renderMobileNavMenu}
      <Toolbar /> {/* Spacer */}
    </>
  );
}
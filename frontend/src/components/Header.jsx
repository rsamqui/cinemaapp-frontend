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
} from "@mui/material";
import {
  Movie as MovieIcon,
  Search as SearchIcon,
  AccountCircle,
  Menu as MenuIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { Link as RouterLink, useNavigate } from 'react-router-dom'; 

export default function Header() {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuAnchorEl, setMobileMenuAnchorEl] = useState(null);
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMobileMenuAnchorEl(null);
  };

  const handleSignIn = () => {
    handleMenuClose();
    navigate('/login');
  };
  
  const handleNavigation = (path) => {
    handleMenuClose();
    navigate(path);
  };


  const menuId = "primary-account-menu";
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      id={menuId}
      keepMounted
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); /* Placeholder */ }}>Profile</MenuItem>
      <MenuItem onClick={() => { handleMenuClose(); navigate('/my-tickets'); /* Placeholder */}}>My Tickets</MenuItem>
      <MenuItem onClick={handleMenuClose}>Sign Out</MenuItem> {/* Add sign out logic */}
    </Menu>
  );

  const mobileMenuId = "primary-menu-mobile";
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMenuAnchorEl}
      id={mobileMenuId}
      keepMounted
      open={Boolean(mobileMenuAnchorEl)}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={() => handleNavigation('/')}> {/* Assuming movies are on home or a /movies path */}
        <Typography>Movies</Typography>
      </MenuItem>
      <MenuItem onClick={() => handleNavigation('/cinemas')}> {/* Placeholder path */}
        <Typography>Cinemas</Typography>
      </MenuItem>
      <MenuItem onClick={() => handleNavigation('/offers')}> {/* Placeholder path */}
        <Typography>Offers</Typography>
      </MenuItem>
      <MenuItem onClick={() => handleNavigation('/membership')}> {/* Placeholder path */}
        <Typography>Membership</Typography>
      </MenuItem>
      <MenuItem>
        <Button color="primary" variant="contained" fullWidth onClick={handleSignIn}>
          Sign In
        </Button>
      </MenuItem>
    </Menu>
  );

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
          zIndex: theme.zIndex.drawer + 1, // Ensure Navbar is above other content
        }}
      >
        <Toolbar>
          <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
            <MuiLink component={RouterLink} to="/" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
              <MovieIcon sx={{ color: "primary.main", fontSize: 40, mr: 1 }} />
              <Typography variant="h5" component="div" sx={{ fontWeight: 700 }}>
                CinePass
              </Typography>
            </MuiLink>
          </Box>

          {!isMobile && (
            <Box sx={{ display: "flex", gap: 3, mr: 3 }}>
              <Button component={RouterLink} to="/" color="inherit">Movies</Button>
              <Button component={RouterLink} to="/cinemas" color="inherit">Cinemas</Button>
              <Button component={RouterLink} to="/offers" color="inherit">Offers</Button>
              <Button component={RouterLink} to="/membership" color="inherit">Membership</Button>
            </Box>
          )}

          <IconButton size="large" color="inherit" onClick={() => navigate('/search') /* Placeholder */}>
            <SearchIcon />
          </IconButton>

          {isMobile ? (
            <IconButton
              size="large"
              edge="end"
              color="inherit"
              aria-label="menu"
              onClick={handleMobileMenuOpen}
            >
              <MenuIcon />
            </IconButton>
          ) : (
            <>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSignIn}
                sx={{ ml: 2 }}
              >
                Sign In
              </Button>
              <IconButton
                size="large"
                edge="end"
                aria-label="account"
                aria-controls={menuId}
                aria-haspopup="true"
                onClick={handleProfileMenuOpen}
                color="inherit"
                sx={{ ml: 1 }}
              >
                <AccountCircle />
              </IconButton>
            </>
          )}
        </Toolbar>
      </AppBar>
      {renderMenu}
      {renderMobileMenu}
      <Toolbar /> 
    </>
  );
}
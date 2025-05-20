import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  IconButton,
  Link as MuiLink,
  Divider,
  TextField,
  Button,
} from '@mui/material';
import {
  Movie as MovieIcon,
  LocationOn as LocationOnIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

const TwitterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
  </svg>
);

const FacebookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
  </svg>
);

const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);


export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: (theme) => theme.palette.mode === 'dark' ? "#0a0a0a" : theme.palette.grey[200], // Adjust for light/dark theme
        color: "text.secondary",
        py: 6,
        borderTop: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      <Container maxWidth={false} > {/* Keeps your full-width setting */}
        <Grid container spacing={4} justifyContent="space-between">
          {/* Column 1: Brand and Social */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <MovieIcon sx={{ color: "primary.main", fontSize: 40, mr: 1 }} />
              <Typography variant="h5" component="div" sx={{ fontWeight: 700, color: "text.primary" }}>
                CinePlex {/* Changed from CinePass to match other components */}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Your premier destination for the latest blockbusters and
              timeless classics. Experience cinema like never before.
            </Typography>
            <Box sx={{ display: "flex", gap: 1.5 }}> {/* Adjusted gap */}
              <IconButton size="small" sx={{ color: "text.primary" }} href="https://twitter.com" target="_blank" aria-label="Twitter">
                <TwitterIcon />
              </IconButton>
              <IconButton size="small" sx={{ color: "text.primary" }} href="https://facebook.com" target="_blank" aria-label="Facebook">
                <FacebookIcon />
              </IconButton>
              <IconButton size="small" sx={{ color: "text.primary" }} href="https://instagram.com" target="_blank" aria-label="Instagram">
                <InstagramIcon />
              </IconButton>
            </Box>
          </Grid>

          {/* Column 3: Information */}
          <Grid item xs={6} sm={3} md={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: "text.primary" }}>
              Information
            </Typography>
            <Box component="ul" sx={{ p: 0, m: 0, listStyle: "none" }}>
              <Box component="li" sx={{ mb: 1 }}><MuiLink component={RouterLink} to="/about-us" color="text.secondary" underline="hover">About Us</MuiLink></Box>
              <Box component="li" sx={{ mb: 1 }}><MuiLink component={RouterLink} to="/careers" color="text.secondary" underline="hover">Careers</MuiLink></Box>
              <Box component="li" sx={{ mb: 1 }}><MuiLink component={RouterLink} to="/terms" color="text.secondary" underline="hover">Terms of Service</MuiLink></Box>
              <Box component="li" sx={{ mb: 1 }}><MuiLink component={RouterLink} to="/privacy" color="text.secondary" underline="hover">Privacy Policy</MuiLink></Box>
            </Box>
          </Grid>

          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: "text.primary" }}>
              Contact Us
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <LocationOnIcon fontSize="small" sx={{ mr: 1, color: "primary.main" }}/>
                <Typography variant="body2">123 Cinema Street, Movie City, MC 12345</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <PhoneIcon fontSize="small" sx={{ mr: 1, color: "primary.main" }}/>
                <Typography variant="body2">+1 (555) 123-4567</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <EmailIcon fontSize="small" sx={{ mr: 1, color: "primary.main" }}/>
                <Typography variant="body2">info@cineplex.com</Typography>
              </Box>
            </Box>
            <Typography variant="body2" sx={{ mb: 1.5 }}>
              Subscribe to our newsletter:
            </Typography>
          </Grid>
        </Grid>
        <Divider sx={{ my: 4, borderColor: "rgba(255,255,255,0.12)" }} /> {/* Adjusted divider color for dark bg */}
        <Typography variant="body2" align="center" sx={{ pt: 2, opacity: 0.7 }}>
          &copy; {new Date().getFullYear()} CinePlex. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}

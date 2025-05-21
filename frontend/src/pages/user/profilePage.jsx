/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, Paper, Box, Button, TextField, Grid,
  CircularProgress, Alert, Snackbar, Divider, IconButton, InputAdornment
} from '@mui/material';
import {
  Person as PersonIcon, Email as EmailIcon, Lock as LockIcon,
  Visibility, VisibilityOff, Save as SaveIcon, VpnKey as PasswordIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import userService from '../../services/userService'; 

export default function ProfilePage() {
  const { user, login: updateUserInContext } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState(null);
  const [isSavingDetails, setIsSavingDetails] = useState(false);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    if (user) {
        console.log("ProfilePage: Populating form with user from context:", JSON.stringify(user));
        setName(user.name || '');
        setEmail(user.email || '');
    }
  }, [user]);

  const handleDetailsSubmit = async (event) => {
    event.preventDefault();
    setDetailsError(null);
    if (!name.trim()) {
      setDetailsError("Name cannot be empty.");
      return;
    }
    if (!email.trim()) {
      setDetailsError("Email cannot be empty.");
      return;
    }
    setIsSavingDetails(true);
    try {
      const updatedUserData = await userService.updateUserProfile({ name, email });
      
      setSnackbarMessage("Profile details updated successfully!");
      setSnackbarOpen(true);
      setIsEditingDetails(false); 
      if(updatedUserData.user) {
          setName(updatedUserData.user.name || '');
          setEmail(updatedUserData.user.email || '');
      }

    } catch (err) {
      console.error("Failed to update profile details:", err);
      setDetailsError(err.message || "Failed to update details.");
    } finally {
      setIsSavingDetails(false);
    }
  };

  const handleSnackbarClose = () => setSnackbarOpen(false);

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress /> <Typography sx={{ ml: 2 }}>Loading user profile...</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 2, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
          My Profile
        </Typography>

        <Box component="form" onSubmit={handleDetailsSubmit} noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth name="name" label="Full Name" value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!isEditingDetails}
                InputProps={{ startAdornment: (<InputAdornment position="start"><PersonIcon /></InputAdornment>)}}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth name="email" label="Email Address" type="email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!isEditingDetails}
                InputProps={{ startAdornment: (<InputAdornment position="start"><EmailIcon /></InputAdornment>)}}
              />
            </Grid>
          </Grid>
          {detailsError && <Alert severity="error" sx={{ mt: 2 }}>{detailsError}</Alert>}
          <Box sx={{ mt: 3, display: 'flex', justifyContent: isEditingDetails ? 'space-between' : 'flex-end' }}>
            {isEditingDetails ? (
              <>
                <Button onClick={() => { setIsEditingDetails(false); setName(user.name || ''); setEmail(user.email || ''); setDetailsError(null);}} color="inherit">
                  Cancel
                </Button>
                <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={isSavingDetails}>
                  {isSavingDetails ? <CircularProgress size={24} color="inherit"/> : "Save Details"}
                </Button>
              </>
            ) : (
              <Button variant="outlined" onClick={() => setIsEditingDetails(true)}>
                Edit Details
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      <Snackbar
        open={snackbarOpen} autoHideDuration={4000} onClose={handleSnackbarClose}
        message={snackbarMessage} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Container>
  );
}

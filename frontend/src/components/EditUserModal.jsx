import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  TextField, Button, FormControl, InputLabel, Select, MenuItem, Grid, Box,
  CircularProgress, Alert
} from '@mui/material';
import userService from '../services/userService';

export default function EditUserModal({ open, onClose, user, onUserUpdated }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const availableRoles = ['client', 'admin'];

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setRole(user.role || 'client');
    } else {
      setName('');
      setEmail('');
      setRole('client');
    }
    setError(null);
  }, [user, open]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    if (!user || !user.id) {
      setError("No user selected for update.");
      return;
    }
    if (!name.trim() || !email.trim() || !role) {
      setError("Name, email, and role are required.");
      return;
    }

    setIsSaving(true);
    const updatedUserData = { name, email, role };

    try {
      const updatedUser = await userService.updateUserByAdmin(user.id, updatedUserData);
      onUserUpdated(updatedUser); 
      onClose();
    } catch (err) {
      console.error("Failed to update user:", err);
      setError(err.message || "An error occurred while updating the user.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;
  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ component: 'form', onSubmit: handleSubmit }}>
      <DialogTitle>Edit User: {user.name || user.email}</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          Modify the user's details below.
        </DialogContentText>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Full Name"
              type="text"
              fullWidth
              variant="outlined"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              margin="dense"
              id="email"
              label="Email Address"
              type="email"
              fullWidth
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth margin="dense" required>
              <InputLabel id="role-select-label">Role</InputLabel>
              <Select
                labelId="role-select-label"
                id="role"
                value={role}
                label="Role"
                onChange={(e) => setRole(e.target.value)}
              >
                {availableRoles.map((r) => (
                  <MenuItem key={r} value={r} sx={{textTransform: 'capitalize'}}>
                    {r}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px' }}>
        <Button onClick={onClose} color="inherit" disabled={isSaving}>Cancel</Button>
        <Button type="submit" variant="contained" disabled={isSaving}>
          {isSaving ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
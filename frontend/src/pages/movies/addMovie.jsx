import React, { useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  TextField,
  Grid,
  CircularProgress,
  Alert,
  Snackbar,
  InputAdornment,
} from '@mui/material';
import {
  Movie as MovieIcon,
  Description as DescriptionIcon,
  Timer as TimerIcon,
  Link as LinkIcon,
} from '@mui/icons-material';
import movieService from '../../services/movieService';

export default function AddMoviePage() {

  const [title, setTitle] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [duration, setDuration] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [genre, setGenre] = useState('');
  const [rating, setRating] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const validateForm = () => {
    if (!title.trim()) return "Movie Title is required.";
    if (!synopsis.trim()) return "Synopsis is required.";
    if (!duration.trim()) return "Duration is required (e.g., 'HH:MM:SS' or '120 min').";
    if (!posterUrl.trim()) return "Poster URL is required.";
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaveError(null);

    const validationError = validateForm();
    if (validationError) {
      setSaveError(validationError);
      return;
    }

    setIsSaving(true);

    const newMovieData = {
      title: title.trim(),
      synopsis: synopsis.trim(),
      duration: duration.trim(),
      posterUrl: posterUrl.trim(),
      genre: genre.trim() || null,
      rating: rating.trim() ? parseFloat(rating) : null,
    };

    console.log("Submitting new movie data:", newMovieData);

    try {
      const response = await movieService.addMovie(newMovieData);
      console.log("Movie added successfully:", response);
      setSnackbarMessage(`Movie "${newMovieData.title}" added successfully!`);
      setSnackbarOpen(true);
      setTitle('');
      setSynopsis('');
      setDuration('');
      setPosterUrl('');
      setGenre('');
      setRating('');
    } catch (err) {
      console.error("Failed to add movie:", err);
      setSaveError(err.message || err.error || "An unexpected error occurred while adding the movie.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 3, fontWeight: 'bold' }}>
          Add New Movie
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Movie Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                InputProps={{ startAdornment: (<InputAdornment position="start"><MovieIcon /></InputAdornment>)}}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Synopsis"
                value={synopsis}
                onChange={(e) => setSynopsis(e.target.value)}
                multiline
                rows={4}
                InputProps={{ startAdornment: (<InputAdornment position="start"><DescriptionIcon /></InputAdornment>)}}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Duration (e.g., 145 min or 02:25:00)"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                InputProps={{ startAdornment: (<InputAdornment position="start"><TimerIcon /></InputAdornment>)}}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Poster Image URL"
                type="url"
                value={posterUrl}
                onChange={(e) => setPosterUrl(e.target.value)}
                InputProps={{ startAdornment: (<InputAdornment position="start"><LinkIcon /></InputAdornment>)}}
              />
            </Grid>
          </Grid>

          {saveError && (
             <Alert severity="error" sx={{ mt: 3, mb:0 }}>{saveError}</Alert>
          )}

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={isSaving}
              startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {isSaving ? 'Saving Movie...' : 'Add Movie'}
            </Button>
          </Box>
        </Box>
      </Paper>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Container>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, Grid, Card, CardActionArea, CardMedia,
  CardContent, CardActions, Button, Box, CircularProgress, Alert, Chip, IconButton,
  Dialog, DialogActions, DialogTitle, DialogContentText, DialogContent,
  Snackbar,
} from '@mui/material';
import {
  Star as StarIcon,
  ConfirmationNumber as TicketIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  AddCircleOutline as AddIcon,
  Theaters as TheatersIcon,
} from '@mui/icons-material';
import movieService from '../../services/movieService';
import { useAuth } from '../../contexts/AuthContext';

export default function ListMoviesPage() {
  const [displayData, setDisplayData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { isAuthenticated, hasRole } = useAuth();

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [movieToDelete, setMovieToDelete] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const isAdmin = isAuthenticated && hasRole('admin');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let data;
      if (isAdmin) {
        console.log("ListMoviesPage: Fetching all movies for admin...");
        data = await movieService.getMovies(); 
        const adminViewData = (data || []).map(movie => ({
          screeningId: `admin-mov-${movie.id}`,
          roomId: movie.roomId || null, 
          roomNumber: movie.roomNumber || null,
          movie: {
            ...movie,
          }
        }));
        setDisplayData(adminViewData);
      } else {
        console.log("ListMoviesPage: Fetching now showing screenings for client...");
        data = await movieService.getNowShowing(); 
        setDisplayData(data || []);
      }
      console.log("ListMoviesPage: Data loaded and set to displayData", data);
    } catch (err) {
      console.error("ListMoviesPage: Failed to fetch movie/screening data:", err);
      setError(err.message || "Could not load movies. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleViewDetails = useCallback((movieId) => {
    if (!movieId) {
        console.error("ViewDetails: movieId is undefined");
        return;
    }
    navigate(`/movies/details/${movieId}`);
  }, [navigate]);

  const handleBookNow = useCallback((screeningIdOrRoomId) => {
    if (!screeningIdOrRoomId) {
        console.error("BookNow: identifier is undefined");
        return;
    }
    if (!isAdmin) {
        navigate(`/bookings/${screeningIdOrRoomId}`);
    } else {
        alert("Admin: To book, please use the client view or schedule this movie appropriately.");
    }
  }, [isAdmin, navigate]);

  const handleEditMovie = useCallback((movieId) => {
    if (!movieId) {
        console.error("EditMovie: movieId is undefined");
        return;
    }
    navigate(`/movies/edit/${movieId}`);
  }, [navigate]);

  const handleClickDelete = useCallback((movieItem) => {
    if (!movieItem || !movieItem.movie || !movieItem.movie.id) {
        console.error("DeleteMovie: Invalid movieItem for deletion", movieItem);
        return;
    }
    setMovieToDelete(movieItem);
    setOpenDeleteDialog(true);
  }, []);

  const handleCloseDeleteDialog = useCallback(() => {
    setOpenDeleteDialog(false);
    setMovieToDelete(null);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!movieToDelete || !movieToDelete.movie || !movieToDelete.movie.id) return;
    try {
      await movieService.deleteMovie(movieToDelete.movie.id);
      setSnackbarMessage(`Movie "${movieToDelete.movie.title}" deleted successfully.`);
      setSnackbarOpen(true);
      loadData();
    } catch (err) {
      console.error("Failed to delete movie:", err);
      setSnackbarMessage(err.message || "Failed to delete movie.");
      setSnackbarOpen(true);
    } finally {
      handleCloseDeleteDialog();
    }
  }, [movieToDelete, loadData, handleCloseDeleteDialog]);

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "calc(100vh - 128px)"}}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading Movies...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4, textAlign: "center" }}>
        <Alert severity="error">{error}</Alert>
        <Button variant="outlined" onClick={loadData} sx={{mt: 2}}>Try Again</Button>
      </Container>
    );
  }

  if (!isLoading && displayData.length === 0) {
    return (
      <Container sx={{ py: 4, textAlign: "center" }}>
        <TheatersIcon sx={{ fontSize: 60, color: "text.secondary", mb: 2 }} />
        <Typography variant="h5" color="text.secondary">
          No movies are currently available.
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {isAdmin ? "You can add new movies!" : "Please check back soon!"}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4}}>
        <Typography variant="h3" component="h1" fontWeight="bold">
          {isAdmin ? "Manage Movies" : "Now Showing"}
        </Typography>
        {isAdmin && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/movies/add')}>
                Add New Movie
            </Button>
        )}
      </Box>
      <Grid container spacing={3} justifyContent="flex-start">
        {displayData.map((item) => {
          if (!item || !item.movie) {
            console.warn("ListMoviesPage: Item or item.movie is undefined, skipping card.", item);
            return null;
          }
          return (
            <Grid item key={item.screeningId || item.movie.id} xs={12} sm={6} md={4} lg={3} xl={2.4}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out', '&:hover': { transform: 'scale(1.03)', boxShadow: (theme) => theme.shadows[10] }}}>
                <CardActionArea
                  onClick={() => handleViewDetails(item.movie.id)}
                  sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}
                >
                  <CardMedia
                    component="img"
                    sx={{ aspectRatio: '2/3', objectFit: 'cover', width: '100%' }}
                    image={item.movie.posterUrl || "https://placehold.co/400x600/1c1c1c/ffffff?text=No+Poster"}
                    alt={item.movie.title || "Movie Poster"}
                    onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/400x600/1c1c1c/ffffff?text=Error"; }}
                  />
                  <CardContent sx={{ flexGrow: 1, width: '100%' }}>
                    <Typography gutterBottom variant="h6" component="div" noWrap title={item.movie.title} sx={{fontWeight: 'bold'}}>
                      {item.movie.title || "Untitled Movie"}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Chip label={item.movie.genre || 'N/A'} size="small" variant="outlined" />
                      {(item.movie.rating !== null && item.movie.rating !== undefined) && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <StarIcon sx={{ color: 'warning.main', mr: 0.5, fontSize: '1.1rem' }} />
                          <Typography variant="body2">{item.movie.rating}/5</Typography>
                        </Box>
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {item.movie.duration || 'N/A'}
                      {item.roomNumber && !isAdmin && ` - Room ${item.roomNumber}`}
                    </Typography>
                  </CardContent>
                </CardActionArea>
                <CardActions sx={{ justifyContent: 'space-between', p: 1.5, width: '100%' }}>
                  {!isAdmin && (
                    <Button fullWidth variant="contained" color="primary" onClick={() => handleBookNow(item.screeningId || item.roomId)} startIcon={<TicketIcon />}>
                      Book Now
                    </Button>
                  )}
                  {isAdmin && (
                    <>
                      <Button variant="outlined" color="secondary" size="small" startIcon={<EditIcon />} onClick={() => handleEditMovie(item.movie.id)} sx={{flexGrow: 1, mr: 0.5}}>
                        Edit
                      </Button>
                      <Button variant="outlined" color="error" size="small" startIcon={<DeleteIcon />} onClick={() => handleClickDelete(item)} sx={{flexGrow: 1, ml: 0.5}}>
                        Delete
                      </Button>
                    </>
                  )}
                </CardActions>
              </Card>
            </Grid>
          )
        })}
      </Grid>

      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the movie "{movieToDelete?.movie?.title}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>Delete</Button>
        </DialogActions>
      </Dialog>

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
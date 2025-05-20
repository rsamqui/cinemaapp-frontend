import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Box,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import { Star as StarIcon, ConfirmationNumber as TicketIcon } from '@mui/icons-material';
import movieService from '../../services/movieService';

export default function ListMoviesPage() {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
  const loadNowShowing = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await movieService.getMovies(); 
      console.log("Fetched raw movie data:", JSON.stringify(data, null, 2));

      const transformedData = (data || []).map(movie => ({
        screeningId: `scr-movie-${movie.id}`, 
        roomId: movie.roomId,
        roomNumber: movie.roomNumber,
        movie: {
          id: movie.id,
          title: movie.title,
          posterUrl: movie.posterUrl,
          duration: movie.duration,
          description: movie.synopsis
        }
      }));
      setMovies(transformedData);
    } catch (err) {
      console.error("Failed to fetch movies:", err);
      setError("Could not load movies. Please check back later.");
    } finally {
      setIsLoading(false);
    }
  };
  loadNowShowing();
}, []);

  const handleViewDetails = (movieId) => {
    navigate(`/movies/details/${movieId}`);
  };

  const handleBookNow = (movieId) => {
    navigate(`/movies/details/${movieId}`);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 128px)' }}> {/* Adjust height if footer/header varies */}
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading Movies...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (movies.length === 0) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <TicketIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h5" color="text.secondary">No movies are currently showing.</Typography>
        <Typography variant="body1" color="text.secondary">Please check back soon!</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ mb: 5, fontWeight: 'bold' }}>
        Now Showing
      </Typography>
      <Grid container spacing={4} justifyContent="center">
        {movies.map((item) => (
          <Grid item key={item.screeningId || item.roomId} xs={12} sm={6} md={4} lg={3} xl={2.4}> {/* Added xl */}
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.03)',
                  boxShadow: (theme) => theme.shadows[10],
                }
              }}
            >
              <CardActionArea
                onClick={() => handleViewDetails(item.movie.id)}
                sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}
              >
                <CardMedia
                  component="img"
                  sx={{ aspectRatio: '2/3', objectFit: 'cover', width: '100%' }}
                  image={item.movie.posterUrl || "https://placehold.co/400x600/1c1c1c/ffffff?text=No+Poster"}
                  alt={item.movie.title}
                  onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/400x600/1c1c1c/ffffff?text=Error"; }}
                />
                <CardContent sx={{ flexGrow: 1, width: '100%' }}>
                  <Typography gutterBottom variant="h6" component="div" noWrap title={item.movie.title} sx={{fontWeight: 'bold'}}>
                    {item.movie.title}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Chip label={item.movie.genre} size="small" variant="outlined" />
                    {item.movie.rating && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <StarIcon sx={{ color: 'warning.main', mr: 0.5, fontSize: '1.1rem' }} />
                        <Typography variant="body2">{item.movie.rating}/5</Typography>
                      </Box>
                    )}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Duration: {item.movie.duration}
                  </Typography>
                </CardContent>
              </CardActionArea>
              <CardActions sx={{ justifyContent: 'stretch', p: 1.5}}> 
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={() => handleBookNow(item.screeningId || item.roomId)}
                  startIcon={<TicketIcon />}
                >
                  Book Now
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
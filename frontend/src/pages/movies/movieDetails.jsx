import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Chip,
  Divider,
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  Theaters as TheatersIcon,
  ConfirmationNumber as TicketIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import movieService from '../../services/movieService';

export default function MovieDetailPage() {
  const { movieId: routeMovieId } = useParams(); // Get movieId from URL, rename to avoid conflict
  const navigate = useNavigate();
  const [apiResponse, setApiResponse] = useState(null); // Stores the direct API response
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!routeMovieId) { // Use routeMovieId from params
      setError("Movie ID is missing.");
      setIsLoading(false);
      return;
    }
    const loadMovieDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await movieService.getMovieScreeningDetails(routeMovieId);
        console.log("MovieDetailPage - Fetched Data:", JSON.stringify(data, null, 2));
        setApiResponse(data); // Store the whole flat response
      } catch (err) {
        console.error(`Failed to fetch details for movie ${routeMovieId}:`, err);
        setError(err.message || "Could not load movie details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    loadMovieDetails();
  }, [routeMovieId]);

  const handleBookNow = () => {
    if (apiResponse && (apiResponse.screeningId || apiResponse.roomId)) {
      const bookingIdentifier = apiResponse.screeningId || apiResponse.roomId;

      const movieInfoPayload = {
        id: apiResponse.movieId,
        title: apiResponse.movieTitle,
        ticketPrice: apiResponse.ticketPrice || 230,
        showtimeDate: apiResponse.showDate || "2025-05-20"
      };
      console.log("MovieDetailPage: Navigating with movieInfoPayload:", JSON.stringify(movieInfoPayload));
      console.log("MovieDetailPage: Navigating to booking identifier:", bookingIdentifier);

      navigate(`/bookings/${bookingIdentifier}`, {
        state: {
          movieInfo: movieInfoPayload,
          roomInfo: {
            id: apiResponse.roomId,
            roomNumber: apiResponse.roomNumber,
          }
        }
      });
    } else {
      console.error("Cannot book, screeningId or roomId not available from movieDetails.");
      alert("Booking information is currently unavailable for this movie.");
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 128px)' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading Movie Details...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button component={RouterLink} to="/movies" variant="outlined" startIcon={<ArrowBackIcon />}>
          Back to Movies
        </Button>
      </Container>
    );
  }

  if (!apiResponse) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h5">Movie details not found.</Typography>
        <Button component={RouterLink} to="/movies" variant="outlined" startIcon={<ArrowBackIcon />}>
          Back to Movies
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
      <Button component={RouterLink} to="/movies" variant="text" startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
        Back to All Movies
      </Button>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 } }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box
              component="img"
              sx={{
                width: '100%',
                maxHeight: { xs: 450, md: 600 },
                objectFit: 'cover', 
                borderRadius: 2,
                boxShadow: 3,
              }}
              src={apiResponse.moviePosterUrl || "https://placehold.co/600x900/1c1c1c/ffffff?text=No+Image"}
              alt={apiResponse.movieTitle}
              onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/600x900/1c1c1c/ffffff?text=Error"; }}
            />
          </Grid>
          <Grid item xs={12} md={8}>
            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
              {apiResponse.movieTitle}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 1 }}>
              {apiResponse.movieDuration && <Chip icon={<ScheduleIcon />} label={apiResponse.movieDuration} variant="outlined" size="small" />}
              {apiResponse.roomNumber && <Chip icon={<TheatersIcon />} label={`Showing in Room ${apiResponse.roomNumber}`} variant="outlined" size="small" />}
            </Box>
            
            <Divider sx={{ my: 3 }} />

            <Typography variant="h5" gutterBottom sx={{ fontWeight: 500 }}>
              Synopsis
            </Typography>
            <Typography variant="body1" paragraph sx={{ lineHeight: 1.7 }}>
              {apiResponse.movieSynopsis || "Synopsis not available."}
            </Typography>

            <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<TicketIcon />}
                onClick={handleBookNow}
                disabled={!apiResponse.roomId} 
              >
                Book Now
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}
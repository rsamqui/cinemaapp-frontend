// src/pages/MyTicketsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container, Typography, Paper, Box, Button, Grid,
  CircularProgress, Alert, Card, CardContent, CardMedia, CardActions, Chip,
  Divider, List, ListItem, ListItemIcon, ListItemText,
} from '@mui/material';
import {
    Movie as MovieIcon,
    Theaters as TheatersIcon,
    EventSeat as EventSeatIcon,
    CalendarToday as CalendarIcon,
    AttachMoney as AttachMoneyIcon,
    ArrowForwardIos as ArrowForwardIosIcon,
    SentimentVeryDissatisfied as SadIcon,
    ArrowBack as ArrowBackIcon,
    ErrorOutline as ErrorIcon, // For booking status chip if needed
    ConfirmationNumber as ConfirmationNumberIcon, // <<< ENSURE THIS IS IMPORTED
} from '@mui/icons-material';
import bookingService from '../../services/bookingService';
import { useAuth } from '../../contexts/AuthContext';

export default function MyTicketsPage() {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const loadMyBookings = useCallback(async () => {
    if (!isAuthenticated || !user || !user.id) {
        if (isAuthenticated && !user) {
             console.log("MyTicketsPage: User authenticated but user object not yet available. Waiting...");
        } else if (!isAuthenticated) {
            setError("Please log in to see your bookings.");
            setIsLoading(false);
        }
        return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await bookingService.getMyBookings(user.id);
      console.log("MyTicketsPage: Fetched bookings for user " + user.id + ":", JSON.stringify(data, null, 2));
      setBookings(data || []);
    } catch (err) {
      console.error("MyTicketsPage: Failed to fetch bookings:", err);
      setError(err.message || "Could not load your bookings. Please try again.");
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (user && user.id) {
        loadMyBookings();
    } else if (!isAuthenticated && !isLoading) {
        setError("Please log in to view your bookings.");
        setIsLoading(false);
    }
  }, [user, isAuthenticated, loadMyBookings, isLoading]);


  const fixedShowtime = "07:00 PM";

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 128px)', p: 2 }}>
        <CircularProgress /> <Typography sx={{ ml: 2 }}>Loading Your Bookings...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <Alert severity="error" sx={{mb:2}}>{error}</Alert>
        <Button variant="outlined" onClick={loadMyBookings} sx={{mt: 2}}>Try Again</Button>
         <Button component={RouterLink} to="/" variant="contained" sx={{mt: 2, ml: 1}}>Go Home</Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
        My Bookings
      </Typography>

      {!isAuthenticated && (
          <Alert severity="warning">Please log in to view your bookings.</Alert>
      )}

      {isAuthenticated && bookings.length === 0 && !isLoading && (
        <Paper sx={{p:3, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2}}>
          <SadIcon sx={{fontSize: 60, color: 'text.secondary'}}/>
          <Typography variant="h6" color="text.secondary">You have no bookings yet.</Typography>
          <Button component={RouterLink} to="/movies" variant="contained">
            Book a Movie
          </Button>
        </Paper>
      )}

      {isAuthenticated && bookings.length > 0 && (
        <Grid container spacing={3}>
          {bookings.map((booking) => (
            <Grid item xs={12} md={6} key={booking.bookingId}>
              <Card sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, height: '100%', boxShadow: 2 }}>
                {booking.moviePosterUrl && (
                    <CardMedia
                        component="img"
                        sx={{ width: {xs: '100%', sm: 180}, height: {xs: 270, sm: 'auto'}, objectFit: 'cover' }}
                        image={booking.moviePosterUrl}
                        alt={booking.movieTitle}
                        onError={(e) => { e.target.style.display='none';}}
                    />
                )}
                {!booking.moviePosterUrl && (
                     <Box sx={{width: {xs: '100%', sm: 180}, height: {xs: 270, sm: 'auto'}, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.200'}}>
                        <MovieIcon sx={{fontSize: 60, color: 'grey.400'}}/>
                    </Box>
                )}
                <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                        <Typography gutterBottom variant="h6" component="div" sx={{fontWeight: 500}} noWrap title={booking.movieTitle}>
                        {booking.movieTitle || 'N/A'}
                        </Typography>
                        <List dense disablePadding sx={{mb:1, fontSize: '0.9rem'}}>
                            <ListItem disablePadding sx={{py:0.25}}>
                                <ListItemIcon sx={{minWidth: 30}}><CalendarIcon fontSize="inherit" /></ListItemIcon>
                                <ListItemText 
                                    secondaryTypographyProps={{fontSize: '0.85rem'}} 
                                    primary="Show Date" 
                                    secondary={booking.showDate ? new Date(booking.showDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) + ` - ${fixedShowtime}` : 'N/A'} 
                                />
                            </ListItem>
                             <ListItem disablePadding sx={{py:0.25}}>
                                <ListItemIcon sx={{minWidth: 30}}><TheatersIcon fontSize="inherit" /></ListItemIcon>
                                <ListItemText secondaryTypographyProps={{fontSize: '0.85rem'}} primary="Room" secondary={booking.roomNumber || 'N/A'} />
                            </ListItem>
                            <ListItem disablePadding sx={{py:0.25}}>
                                <ListItemIcon sx={{minWidth: 30}}><EventSeatIcon fontSize="inherit" /></ListItemIcon>
                                <ListItemText secondaryTypographyProps={{fontSize: '0.85rem'}} primary="Seats" secondary={booking.bookedSeatsString || 'N/A'} />
                            </ListItem>
                             <ListItem disablePadding sx={{py:0.25}}>
                                <ListItemIcon sx={{minWidth: 30}}>
                                    <ConfirmationNumberIcon fontSize="inherit" /> {/* Using the imported icon */}
                                </ListItemIcon>
                                <ListItemText secondaryTypographyProps={{fontSize: '0.85rem'}} primary="Booking ID" secondary={booking.bookingId} />
                            </ListItem>
                            <ListItem disablePadding sx={{py:0.25}}>
                                <ListItemIcon sx={{minWidth: 30}}><AttachMoneyIcon fontSize="inherit" /></ListItemIcon>
                                <ListItemText 
                                    secondaryTypographyProps={{fontSize: '0.85rem'}} 
                                    primary="Total Paid" 
                                    secondary={booking.totalPrice !== undefined ? new Intl.NumberFormat('es-NI', { style: 'currency', currency: 'NIO' }).format(parseFloat(booking.totalPrice)) : "N/A"} 
                                />
                            </ListItem>
                             {booking.bookingStatus && (
                                <ListItem disablePadding sx={{py:0.25}}>
                                    <ListItemIcon sx={{minWidth: 30}}>
                                        {booking.bookingStatus === 'confirmed' ? <Chip size="small" label=" " color="success" sx={{width: 10, height: 10, borderRadius: '50%', p:0, minWidth:10}} /> : <ErrorIcon fontSize="inherit" color="warning"/>}
                                    </ListItemIcon>
                                    <ListItemText 
                                        secondaryTypographyProps={{fontSize: '0.85rem', textTransform: 'capitalize'}} 
                                        primary="Status" 
                                        secondary={booking.bookingStatus.replace('_', ' ')} 
                                    />
                                </ListItem>
                             )}
                        </List>
                    </CardContent>
                    <Divider />
                    <CardActions sx={{ justifyContent: 'flex-end', p:1.5 }}>
                    <Button
                        variant="contained"
                        size="small"
                        color="primary"
                        endIcon={<ArrowForwardIosIcon />}
                        onClick={() => navigate(`/ticket/${booking.bookingId}`)}
                    >
                        View E-Ticket
                    </Button>
                    </CardActions>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}

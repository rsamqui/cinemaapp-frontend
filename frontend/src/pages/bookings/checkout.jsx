import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container, Typography, Paper, Box, Button, Grid, Divider,
  TextField, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  CircularProgress, Alert, List, ListItem, ListItemText, ListItemIcon,
} from '@mui/material';
import {
  Movie as MovieIcon, Theaters as TheatersIcon, EventSeat as EventSeatIcon,
  Person as PersonIcon, Payments as PaymentsIcon, CalendarToday as CalendarIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext'; // To get userId and user's name
import bookingService from '../../services/bookingService';

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Data passed from SeatSelectionPage
  const {
    selectedSeats, // Expected: Array of { id: 'A1' (displayId), dbId: 101 (database PK) }
    movieDetails,  // Expected: { id (movieId_from_db), title, ticketPrice }
    roomInfo,      // Expected: { id (roomId_from_db), roomNumber }
    showDate,      // Expected: String like 'YYYY-MM-DD'
    totalPrice,    // This is what SeatSelectionPage sends
  } = location.state || {};

  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) {
      console.log("CheckoutPage: User not authenticated, redirecting to login.");
      navigate('/login', { state: { from: location }, replace: true });
    }
  }, [isAuthenticated, user, navigate, location]);

  // Check if essential booking data is present
  if (!selectedSeats || selectedSeats.length === 0 || !movieDetails || !movieDetails.id || !roomInfo || !roomInfo.id || !showDate || totalPrice === undefined) {
    console.error("CheckoutPage: Essential booking data missing from location.state. Rendering warning.", { selectedSeats, movieDetails, roomInfo, showDate, totalPrice });
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <Alert severity="warning" sx={{mb: 2}}>
          Incomplete booking information. Please start over from the seat selection.
        </Alert>
        <Button component={RouterLink} to="/" variant="outlined" startIcon={<ArrowBackIcon />}>
          Back to Movies
        </Button>
      </Container>
    );
  }

  const handleOpenPaymentModal = () => {
    setPaymentError(null);
    setOpenPaymentModal(true);
  };

  const handleClosePaymentModal = () => {
    if (!isProcessingPayment) {
        setOpenPaymentModal(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!cardName.trim() || !cardNumber.trim() || !expiryDate.trim() || !cvv.trim()) {
        setPaymentError("Please fill in all card details.");
        return;
    }
    setIsProcessingPayment(true);
    setPaymentError(null);

    // Construct the payload to match backend expectations
    const bookingPayload = {
      userId: user.id,
      roomId: roomInfo.id,             // From roomInfo passed in state
      movieId: movieDetails.id,        // From movieDetails passed in state
      seatDbIds: selectedSeats.map(seat => seat.dbId), // Array of seat database PKs
      price: totalPrice,               // <<< CHANGED from totalPrice to price
      showDate: showDate,              // From state
    };

    console.log("CheckoutPage: Attempting to create booking with payload:", JSON.stringify(bookingPayload, null, 2));

    try {
      const bookingConfirmation = await bookingService.createBooking(bookingPayload);
      console.log("CheckoutPage: Booking successful, response:", bookingConfirmation);
      handleClosePaymentModal();
      if (bookingConfirmation && bookingConfirmation.bookingId) {
        navigate(`/ticket/${bookingConfirmation.bookingId}`, { replace: true });
      } else {
        console.error("CheckoutPage: Booking ID not found in confirmation response.", bookingConfirmation);
        setPaymentError("Booking confirmed, but there was an issue retrieving your ticket ID. Please contact support.");
      }
    } catch (err) {
      console.error("CheckoutPage: Payment/Booking failed:", err);
      setPaymentError(err.message || err.error || "An error occurred during booking. Please try again.");
    } finally {
      setIsProcessingPayment(false);
    }
  };


  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 3, fontWeight: 'bold' }}>
          Checkout Summary
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={7}>
            <Typography variant="h6" gutterBottom sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 1, mb: 2}}>
              Booking For:
            </Typography>
            <List dense disablePadding>
              <ListItem disableGutters>
                <ListItemIcon sx={{minWidth: 40}}><MovieIcon color="primary"/></ListItemIcon>
                <ListItemText primaryTypographyProps={{fontWeight: 'medium'}} primary="Movie" secondary={movieDetails.title || 'N/A'} />
              </ListItem>
              <ListItem disableGutters>
                <ListItemIcon sx={{minWidth: 40}}><TheatersIcon color="primary"/></ListItemIcon>
                <ListItemText primaryTypographyProps={{fontWeight: 'medium'}} primary="Room" secondary={roomInfo.roomNumber || 'N/A'} />
              </ListItem>
              <ListItem disableGutters>
                <ListItemIcon sx={{minWidth: 40}}><CalendarIcon color="primary"/></ListItemIcon>
                <ListItemText
                  primaryTypographyProps={{fontWeight: 'medium'}}
                  primary="Show Date"
                  secondary={showDate ? new Date(showDate + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                />
              </ListItem>
              <ListItem disableGutters>
                <ListItemIcon sx={{minWidth: 40}}><EventSeatIcon color="primary"/></ListItemIcon>
                <ListItemText
                  primaryTypographyProps={{fontWeight: 'medium'}}
                  primary="Seats"
                  secondary={`${selectedSeats.map(s => s.id).join(', ')} (${selectedSeats.length} total)`}
                />
              </ListItem>
              <ListItem disableGutters>
                <ListItemIcon sx={{minWidth: 40}}><PersonIcon color="primary"/></ListItemIcon>
                <ListItemText primaryTypographyProps={{fontWeight: 'medium'}} primary="Booked By" secondary={user?.name || user?.email || 'Guest'} />
              </ListItem>
            </List>
            <Divider sx={{ my: 3 }} />
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <Typography variant="h6" sx={{ fontWeight: 'medium' }}>Total Amount:</Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                {new Intl.NumberFormat('es-NI', { style: 'currency', currency: 'NIO' }).format(totalPrice)}
                </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={5} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderLeft: {md: '1px solid'}, borderColor: {md: 'divider'}, pl: {md: 3} }}>
             <Typography variant="h6" gutterBottom>Confirm Payment</Typography>
            <PaymentsIcon sx={{fontSize: 60, color: 'primary.light', my: 2}}/>
            <Button
              variant="contained" color="primary" size="large" fullWidth
              onClick={handleOpenPaymentModal}
              sx={{ py: 1.5, fontSize: '1.1rem', mt:1 }}
            >
              Enter Card Details
            </Button>
             {paymentError && <Alert severity="error" sx={{mt:2, width: '100%'}}>{paymentError}</Alert>}
          </Grid>
        </Grid>
      </Paper>

      <Dialog open={openPaymentModal} onClose={handleClosePaymentModal} PaperProps={{component: 'form', onSubmit: (e) => { e.preventDefault(); handleConfirmPayment(); } }}>
        <DialogTitle sx={{backgroundColor: 'primary.main', color: 'primary.contrastText'}}>Simulated Secure Payment</DialogTitle>
        <DialogContent sx={{pt: '20px !important'}}>
          <DialogContentText sx={{mb:2}}>This is a non-functional payment form. Enter any details to simulate booking.</DialogContentText>
          <TextField autoFocus margin="dense" id="cardName" label="Name on Card" type="text" fullWidth variant="outlined" value={cardName} onChange={e => setCardName(e.target.value)} required/>
          <TextField margin="dense" id="cardNumber" label="Card Number (e.g., 4242...)" type="text" fullWidth variant="outlined" value={cardNumber} onChange={e => setCardNumber(e.target.value)} required/>
          <Grid container spacing={2} sx={{mt: 0.5}}>
            <Grid item xs={7}><TextField margin="dense" id="expiryDate" label="Expiry (MM/YY)" type="text" fullWidth variant="outlined" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} required/></Grid>
            <Grid item xs={5}><TextField margin="dense" id="cvv" label="CVV" type="text" fullWidth variant="outlined" value={cvv} onChange={e => setCvv(e.target.value)} required/></Grid>
          </Grid>
          {paymentError && !isProcessingPayment && <Alert severity="error" sx={{mt:2, width: '100%'}}>{paymentError}</Alert>}
        </DialogContent>
        <DialogActions sx={{p: '16px 24px'}}>
          <Button onClick={handleClosePaymentModal} color="inherit" disabled={isProcessingPayment}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isProcessingPayment}>
            {isProcessingPayment ? <CircularProgress color="inherit" size={24} /> : `Confirm & Pay ${new Intl.NumberFormat('es-NI', { style: 'currency', currency: 'NIO' }).format(totalPrice)}`}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

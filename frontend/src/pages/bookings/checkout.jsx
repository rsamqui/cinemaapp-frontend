import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container, Typography, Paper, Box, Button, Grid, Divider,
  TextField, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  CircularProgress, Alert, List, ListItem, ListItemText, ListItemIcon,
} from '@mui/material';
import { Movie as MovieIcon, EventSeat as EventSeatIcon, Person as PersonIcon, Payments as PaymentsIcon, Theaters as TheatersIcon, CalendarToday } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import bookingService from '../services/bookingService';

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const {
    selectedSeats,
    movieDetails,
    roomInfo,
    showDate,
    totalPrice,
  } = location.state || {};

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [openPaymentModal, setOpenPaymentModal] = useState(false);

  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  if (!isAuthenticated || !user) {
    navigate('/login', { state: { from: location }, replace: true });
    return null;
  }

  if (!selectedSeats || selectedSeats.length === 0 || !movieDetails || !roomInfo || !showDate || totalPrice === undefined) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <Alert severity="warning">Incomplete booking information. Please select your seats again.</Alert>
        <Button onClick={() => navigate('/')} sx={{ mt: 2 }}>Back to Movies</Button>
      </Container>
    );
  }

  const handleOpenPaymentModal = () => setOpenPaymentModal(true);
  const handleClosePaymentModal = () => setOpenPaymentModal(false);

  const handleConfirmPayment = async () => {
    if (!cardName || !cardNumber || !expiryDate || !cvv) { 
        alert("Please fill in all card details.");
        return;
    }
    setIsProcessingPayment(true);
    setPaymentError(null);

    const bookingPayload = {
      userId: user.id,
      movieId: movieDetails.id,
      roomId: roomInfo.id,
      seatDbIds: selectedSeats.map(seat => seat.dbId),
      totalPrice: totalPrice,
      showDate: showDate,
    };

    console.log("Attempting to create booking with payload:", bookingPayload);

    try {
      const bookingConfirmation = await bookingService.createBooking(bookingPayload);
      console.log("Booking successful, response:", bookingConfirmation);
      handleClosePaymentModal();
      navigate(`/bookings/ticket/${bookingConfirmation.bookingId}`, { replace: true });
    } catch (err) {
      console.error("Payment/Booking failed:", err);
      setPaymentError(err.message || "An error occurred during booking. Please try again.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 } }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 3 }}>
          Confirm Your Booking
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Typography variant="h6" gutterBottom>Booking Details:</Typography>
            <List dense>
              <ListItem>
                <ListItemIcon><MovieIcon color="primary"/></ListItemIcon>
                <ListItemText primary="Movie" secondary={movieDetails.title} />
              </ListItem>
              <ListItem>
                <ListItemIcon><TheatersIcon color="primary"/></ListItemIcon>
                <ListItemText primary="Room" secondary={roomInfo.roomNumber} />
              </ListItem>
              <ListItem>
                <ListItemIcon><CalendarToday color="primary"/></ListItemIcon>
                <ListItemText primary="Show Date" secondary={new Date(showDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} />
              </ListItem>
              <ListItem>
                <ListItemIcon><EventSeatIcon color="primary"/></ListItemIcon>
                <ListItemText primary="Seats" secondary={`${selectedSeats.map(s => s.id).join(', ')} (${selectedSeats.length})`} />
              </ListItem>
              <ListItem>
                <ListItemIcon><PersonIcon color="primary"/></ListItemIcon>
                <ListItemText primary="Booked By" secondary={user.name || user.email} />
              </ListItem>
            </List>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 'bold', textAlign: 'right' }}>
              Total: {new Intl.NumberFormat('es-NI', { style: 'currency', currency: 'NIO' }).format(totalPrice)}
            </Typography>
          </Grid>

          <Grid item xs={12} md={5} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Button
              variant="contained" color="primary" size="large" fullWidth
              startIcon={<PaymentsIcon />} onClick={handleOpenPaymentModal}
              sx={{ py: 1.5, fontSize: '1.1rem' }}
            >
              Proceed to Payment
            </Button>
            {paymentError && <Alert severity="error" sx={{mt:2}}>{paymentError}</Alert>}
          </Grid>
        </Grid>
      </Paper>

      <Dialog open={openPaymentModal} onClose={handleClosePaymentModal}>
        <DialogTitle>Simulated Secure Payment</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{mb:2}}>
            This is a non-functional payment form. Enter any details to proceed.
          </DialogContentText>
          <TextField autoFocus margin="dense" id="cardName" label="Name on Card" type="text" fullWidth variant="standard" value={cardName} onChange={e => setCardName(e.target.value)} />
          <TextField margin="dense" id="cardNumber" label="Card Number (e.g., 4242...)" type="text" fullWidth variant="standard" value={cardNumber} onChange={e => setCardNumber(e.target.value)} />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField margin="dense" id="expiryDate" label="Expiry (MM/YY)" type="text" fullWidth variant="standard" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} />
            </Grid>
            <Grid item xs={6}>
              <TextField margin="dense" id="cvv" label="CVV" type="text" fullWidth variant="standard" value={cvv} onChange={e => setCvv(e.target.value)} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{p: '16px 24px'}}>
          <Button onClick={handleClosePaymentModal} color="secondary">Cancel</Button>
          <Button onClick={handleConfirmPayment} variant="contained" disabled={isProcessingPayment}>
            {isProcessingPayment ? <CircularProgress size={24} /> : `Pay ${new Intl.NumberFormat('es-NI', { style: 'currency', currency: 'NIO' }).format(totalPrice)}`}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

// src/pages/SeatSelectionPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Grid,
  Divider,
} from '@mui/material';
import Room from '../../components/Room';
import { SEAT_STATUS } from '../../constants/seatConstants';

const MOCK_MOVIE_DETAILS = {
  title: 'Cosmic Adventure X',
  showtime: 'May 18, 2025 - 07:00 PM',
  screen: 'Screen 3',
  ticketPrice: 230,
};

const fetchRoomLayoutForShowtime = async (showtimeId) => {
  console.log(`Workspaceing room layout for showtime: ${showtimeId}`);
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    rows: 8,
    cols: 12,
    seatStatuses: [
      { id: 'A3', status: SEAT_STATUS.TAKEN }, { id: 'A4', status: SEAT_STATUS.TAKEN },
      { id: 'C5', status: SEAT_STATUS.RESERVED },{ id: 'C6', status: SEAT_STATUS.RESERVED },
      { id: 'D1', status: SEAT_STATUS.BLOCKED },{ id: 'H10', status: SEAT_STATUS.TAKEN },
      { id: 'H11', status: SEAT_STATUS.TAKEN },{ id: 'H12', status: SEAT_STATUS.TAKEN },
    ],
  };
};

export default function SeatSelectionPage() {
  const { screeningId } = useParams();
  const navigate = useNavigate();

  const [movieDetails, _setMovieDetails] = useState(MOCK_MOVIE_DETAILS);
  const [roomConfig, setRoomConfig] = useState({ rows: 0, cols: 0 });
  const [initialSeatStatuses, setInitialSeatStatuses] = useState([]);
  const [userSelectedSeatIds, setUserSelectedSeatIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const TICKET_PRICE = movieDetails.ticketPrice;

  // Define loadLayout outside useEffect, memoize with useCallback
  const loadLayout = useCallback(async () => {
    console.log("Executing loadLayout for screeningId:", screeningId || 'defaultScreening');
    setIsLoading(true);
    setError(null);
    try {
      const layoutData = await fetchRoomLayoutForShowtime(screeningId || 'defaultScreening');
      setRoomConfig({ rows: layoutData.rows, cols: layoutData.cols });
      setInitialSeatStatuses(layoutData.seatStatuses || []);
      setUserSelectedSeatIds(new Set()); // Reset selections on layout load
    } catch (err) {
      console.error("Failed to load room layout:", err);
      setError("Sorry, we couldn't load the seat map. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [screeningId]); // Dependency: screeningId (and any other variable from component scope used inside)

  useEffect(() => {
    loadLayout(); // Call the memoized function
  }, [loadLayout]); // Now useEffect depends on the stable loadLayout function

  const handleSeatSelect = useCallback((seatInfo, attemptedNewStatus) => {
    setUserSelectedSeatIds(prevSelectedIds => {
      const newSelectedIds = new Set(prevSelectedIds);
      if (attemptedNewStatus === SEAT_STATUS.SELECTED) {
        newSelectedIds.add(seatInfo.id);
      } else if (attemptedNewStatus === SEAT_STATUS.AVAILABLE) {
        newSelectedIds.delete(seatInfo.id);
      }
      return newSelectedIds;
    });
  }, []);

  const allSeatStatusesForRoom = useMemo(() => {
    const initialStatusMap = new Map();
    initialSeatStatuses.forEach(seat => initialStatusMap.set(seat.id, seat.status));
    const combinedStatuses = [];
    if (roomConfig.rows > 0 && roomConfig.cols > 0) {
        for (let i = 0; i < roomConfig.rows; i++) {
            const rowLabel = String.fromCharCode(65 + i);
            for (let j = 0; j < roomConfig.cols; j++) {
                const colLabel = (j + 1).toString();
                const seatId = `${rowLabel}${colLabel}`;
                let status = SEAT_STATUS.AVAILABLE;
                if (userSelectedSeatIds.has(seatId)) {
                    status = SEAT_STATUS.SELECTED;
                } else if (initialStatusMap.has(seatId)) {
                    status = initialStatusMap.get(seatId);
                }
                combinedStatuses.push({ id: seatId, status });
            }
        }
    }
    return combinedStatuses;
  }, [initialSeatStatuses, userSelectedSeatIds, roomConfig.rows, roomConfig.cols]);

  const selectedSeatObjectsForDisplay = useMemo(() => {
    return Array.from(userSelectedSeatIds).map(id => ({ id, status: SEAT_STATUS.SELECTED })).sort((a,b) => a.id.localeCompare(b.id));
  }, [userSelectedSeatIds]);

  const calculateTotalPrice = () => userSelectedSeatIds.size * TICKET_PRICE;

  const handleProceedToPayment = () => {
    if (userSelectedSeatIds.size === 0) {
      alert("Please select at least one seat.");
      return;
    }
    const seatsToBook = Array.from(userSelectedSeatIds).map(id => ({ id, status: SEAT_STATUS.SELECTED }));
    navigate('/checkout', { state: { selectedSeats: seatsToBook, movieDetails, totalPrice: calculateTotalPrice() } });
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress /> <Typography sx={{ ml: 2 }}>Loading seat map...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <Alert severity="error" sx={{justifyContent: 'center'}}>{error}</Alert>
        {/* The onClick now calls the stable loadLayout function */}
        <Button variant="outlined" onClick={loadLayout} sx={{mt: 2}}>
          Try Again
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 } }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">Seat Selection</Typography>
        <Box sx={{ mb: 3, p: 2, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 1 }}>
          <Typography variant="h6">{movieDetails.title}</Typography>
          <Typography variant="subtitle1" color="text.secondary">{movieDetails.showtime} - {movieDetails.screen}</Typography>
        </Box>
        {roomConfig.rows > 0 && roomConfig.cols > 0 && (
            <Room
                key={`${roomConfig.rows}-${roomConfig.cols}-${initialSeatStatuses.length}-${userSelectedSeatIds.size}`}
                initialRows={roomConfig.rows}
                initialCols={roomConfig.cols}
                externallySetSeats={allSeatStatusesForRoom}
                onSeatSelect={handleSeatSelect}
                isEditable={false}
            />
        )}
        <Divider sx={{ my: 4 }} />
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>Your Selection</Typography>
          {selectedSeatObjectsForDisplay.length > 0 ? (
            <Grid container spacing={1} sx={{ mb: 2 }}>
              {selectedSeatObjectsForDisplay.map(seat => (
                <Grid item key={seat.id}>
                  <Chip label={seat.id} color="primary" onDelete={() => handleSeatSelect({ id: seat.id }, SEAT_STATUS.AVAILABLE)} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>Please click on an available seat to select it.</Typography>
          )}
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Total Price: {new Intl.NumberFormat('es-NI', { style: 'currency', currency: 'NIO' }).format(calculateTotalPrice())}</Typography>
        </Box>
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" color="primary" size="large" onClick={handleProceedToPayment} disabled={selectedSeatObjectsForDisplay.length === 0}>
            Proceed to Checkout
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Container, Typography, Paper, Box, Button, Chip,
  CircularProgress, Alert, Grid, Divider,
  FormControl, InputLabel, Select, MenuItem,
} from "@mui/material";
import Room from "../../components/Room";
import { SEAT_STATUS } from "../../constants/seatConstants";
import roomService from "../../services/roomService";

const formatDateForAPI = (date) => {
  return date.toISOString().split('T')[0];
};

const getNext7Days = () => {
  const days = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    days.push({
      value: formatDateForAPI(date), // YYYY-MM-DD
      label: date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }),
    });
  }
  return days;
};

const DEFAULT_MOVIE_DETAILS = {
  id: null,
  title: "Movie Loading...",
  ticketPrice: 230,
  showtime: "N/A",
  screen: "N/A",
};

export default function SeatSelectionPage() {
  const { roomId } = useParams(); // This is used as roomId
  const navigate = useNavigate();
  const location = useLocation();

  const [movieDetails, setMovieDetails] = useState(
    location.state?.movieInfo || DEFAULT_MOVIE_DETAILS
  );
  const [roomConfig, setRoomConfig] = useState({
    rows: 0, cols: 0, roomNumber: null, roomId: null, movieId: null,
  });
  const [initialSeatStatuses, setInitialSeatStatuses] = useState([]);
  const [userSelectedSeatIds, setUserSelectedSeatIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const availableDates = useMemo(() => getNext7Days(), []);
  const [selectedShowDate, setSelectedShowDate] = useState(availableDates[0]?.value || formatDateForAPI(new Date()));


  useEffect(() => {
    if (location.state?.movieInfo) {
        setMovieDetails(prev => ({
            ...DEFAULT_MOVIE_DETAILS, 
            ...prev, 
            ...location.state.movieInfo, 
            showtimeDate: location.state.movieInfo.showtimeDate || selectedShowDate
        }));
    } else {
        setMovieDetails(prev => ({...prev, showtimeDate: selectedShowDate}));
    }
  }, [location.state?.movieInfo, selectedShowDate]);


  const TICKET_PRICE = movieDetails?.ticketPrice || DEFAULT_MOVIE_DETAILS.ticketPrice;

  const loadLayout = useCallback(async () => {
  if (!roomId || !selectedShowDate) { 
    setError("Room ID or Show Date is missing.");
    setIsLoading(false);
    return;
  }
    console.log(`SeatSelectionPage (loadLayout): Executing for roomId: ${roomId}, Date: ${selectedShowDate}`);
    setIsLoading(true);
    setError(null);
    try {
      const responseArray = await roomService.getRoomById(roomId, selectedShowDate);
      console.log(
        "SeatSelectionPage (loadLayout): Fetched API responseArray:",
        JSON.stringify(responseArray)
      );

      if (Array.isArray(responseArray) && responseArray.length > 0) {
        const roomData = responseArray[0];
        setRoomConfig({
          rows: roomData.totalRows || 0, cols: roomData.totalColumns || 0,
          roomNumber: roomData.roomNumber || "N/A", roomId: roomData.id,
          movieId: roomData.movieId,
        });
        // seatLayout from backend should ideally reflect statuses for selectedShowDate
        setInitialSeatStatuses((roomData.seatLayout || []).map(seat => ({...seat, dbId: seat.dbId || seat.id})));
        setUserSelectedSeatIds(new Set()); // Reset selections when date or layout changes

        setMovieDetails(prev => ({
          ...DEFAULT_MOVIE_DETAILS,
          ...(location.state?.movieInfo && location.state.movieInfo.id ? location.state.movieInfo : (prev && prev.id ? prev : {})),
          id: roomData.movieId || location.state?.movieInfo?.id || DEFAULT_MOVIE_DETAILS.id,
          title: roomData.movieTitle || location.state?.movieInfo?.title || DEFAULT_MOVIE_DETAILS.title,
          ticketPrice: TICKET_PRICE,
          screen: roomData.roomNumber || prev?.screen,
          showtimeDate: selectedShowDate, // Update movieDetails with the selected date
          showtimeTime: prev?.showtimeTime || DEFAULT_MOVIE_DETAILS.showtimeTime, // Keep existing time or default
        }));
      } else { throw new Error("Room data not found or invalid response."); }
    } catch (err) {
      console.error("SeatSelectionPage (loadLayout): Failed to load room layout:", err);
      setError(err.message || "Sorry, we couldn't load the seat map.");
      // Reset states on error
      setRoomConfig({ rows: 0, cols: 0, roomNumber: null, roomId: null, movieId: null });
      setInitialSeatStatuses([]);
    } finally { setIsLoading(false); }
  }, [roomId, selectedShowDate, location.state?.movieInfo, TICKET_PRICE]);

  useEffect(() => {
    loadLayout();
  }, [loadLayout]);

  const handleSeatSelect = useCallback((seatInfo, attemptedNewStatus) => {
    setUserSelectedSeatIds((prevSelectedIds) => {
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
    initialSeatStatuses.forEach((seat) => {
      if (seat && seat.id) {
        initialStatusMap.set(seat.id, { status: seat.status, dbId: seat.dbId });
      }
    });

    const combinedStatuses = [];
    if (roomConfig.rows > 0 && roomConfig.cols > 0) {
      for (let i = 0; i < roomConfig.rows; i++) {
        const rowLabel = String.fromCharCode(65 + i);
        for (let j = 0; j < roomConfig.cols; j++) {
          const colLabel = (j + 1).toString();
          const seatId = `${rowLabel}${colLabel}`;
          let status = SEAT_STATUS.AVAILABLE;
          let dbId = null;

          const initialSeatData = initialStatusMap.get(seatId);
          if (initialSeatData) {
            status = initialSeatData.status;
            dbId = initialSeatData.dbId;
          }

          if (userSelectedSeatIds.has(seatId)) {
            status = SEAT_STATUS.SELECTED;
          }
          combinedStatuses.push({ id: seatId, status, dbId });
        }
      }
    }
    return combinedStatuses;
  }, [
    initialSeatStatuses,
    userSelectedSeatIds,
    roomConfig.rows,
    roomConfig.cols,
  ]);

  const selectedSeatObjectsForDisplay = useMemo(() => {
    return allSeatStatusesForRoom
      .filter(
        (seat) =>
          userSelectedSeatIds.has(seat.id) &&
          seat.status === SEAT_STATUS.SELECTED
      )
      .sort((a, b) => a.id.localeCompare(b.id));
  }, [userSelectedSeatIds, allSeatStatusesForRoom]);

  const calculateTotalPrice = () => userSelectedSeatIds.size * TICKET_PRICE;

  const handleProceedToCheckout = () => {
    if (userSelectedSeatIds.size === 0) {
      alert("Please select at least one seat.");
      return;
    }
    const seatsToBook = selectedSeatObjectsForDisplay.map((seat) => ({
      id: seat.id,
      dbId: seat.dbId,
    }));

    if (
      seatsToBook.some((seat) => seat.dbId === null || seat.dbId === undefined)
    ) {
      alert(
        "Error: Some selected seats are missing database IDs. Cannot proceed."
      );
      console.error(
        "Selected seats with missing dbId:",
        seatsToBook.filter((s) => !s.dbId)
      );
      return;
    }

    const navigationState = {
      selectedSeats: seatsToBook,
      movieDetails: {
        id: movieDetails.id, title: movieDetails.title, ticketPrice: TICKET_PRICE,
      },
      roomInfo: {
        id: roomConfig.roomId, roomNumber: roomConfig.roomNumber,
      },
      showDate: selectedShowDate,
      totalPrice: calculateTotalPrice(),
    };
    console.log("SeatSelectionPage: Navigating to /checkout with state:", JSON.stringify(navigationState, null, 2));
    navigate("/checkout", { state: navigationState });
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress />{" "}
        <Typography sx={{ ml: 2 }}>Loading seat map...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4, textAlign: "center" }}>
        <Alert severity="error" sx={{ justifyContent: "center" }}>
          {error}
        </Alert>
        <Button variant="outlined" onClick={loadLayout} sx={{ mt: 2 }}>
          Try Again
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 } }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Select Your Seats
        </Typography>

        {/* Movie and Showtime Info Box */}
        <Box sx={{ mb: 3, p: 2, backgroundColor: "rgba(0,0,0,0.05)", borderRadius: 1 }}>
          <Typography variant="h6">{movieDetails.title || "Movie Title"}</Typography>
          {/* Date Selector */}
          <FormControl fullWidth margin="normal" sx={{my:2, maxWidth: {sm: '300px'} }}>
            <InputLabel id="show-date-select-label">Show Date</InputLabel>
            <Select
              labelId="show-date-select-label"
              value={selectedShowDate}
              label="Show Date"
              onChange={(e) => {
                setSelectedShowDate(e.target.value);
                setUserSelectedSeatIds(new Set()); // Reset selected seats when date changes
              }}
            >
              {availableDates.map(dateOpt => (
                <MenuItem key={dateOpt.value} value={dateOpt.value}>
                  {dateOpt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography variant="subtitle1" color="text.secondary">
            Time: {movieDetails.showtimeTime || "07:00 PM"} - Room: {roomConfig.roomNumber || "..."}
          </Typography>
        </Box>

        {/* Conditional Rendering for Room based on loading state for seat map */}
        {isLoading && roomConfig.rows > 0 ? ( // Show loader if rows are set but still loading (e.g. date change)
             <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                <CircularProgress /> <Typography sx={{ ml: 2 }}>Loading Seat Map for {new Date(selectedShowDate + 'T00:00:00').toLocaleDateString()}...</Typography>
            </Box>
        ) : error && roomConfig.rows > 0 ? ( // Show error if rows are set but loading failed
             <Container sx={{ py: 2, textAlign: "center" }}>
                <Alert severity="error" sx={{ justifyContent: "center" }}>{error}</Alert>
                <Button variant="outlined" onClick={loadLayout} sx={{ mt: 2 }}> Try Again </Button>
            </Container>
        ) : roomConfig.rows > 0 && roomConfig.cols > 0 ? (
          <Room
            key={`${roomConfig.roomId}-${selectedShowDate}-${roomConfig.rows}-${roomConfig.cols}-${userSelectedSeatIds.size}`} // Add selectedShowDate to key
            initialRows={roomConfig.rows}
            initialCols={roomConfig.cols}
            externallySetSeats={allSeatStatusesForRoom}
            onUserSeatToggle={handleSeatSelect}
            isEditable={false}
          />
        ) : (
          !isLoading && <Alert severity="info" sx={{mt: 2}}>Seat map is currently unavailable or room dimensions are not set.</Alert>
        )}

        {/* ... (Rest of JSX: Divider, Your Selection, Total Price, Proceed to Checkout Button) ... */}
         <Divider sx={{ my: 4 }} />
         <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>Your Selection</Typography>
          {selectedSeatObjectsForDisplay.length > 0 ? (
            <Grid container spacing={1} sx={{ mb: 2 }}>
              {selectedSeatObjectsForDisplay.map((seat) => (
                <Grid item key={seat.id}>
                  <Chip
                    label={seat.id}
                    color="primary"
                    onDelete={() => handleSeatSelect({ id: seat.id }, SEAT_STATUS.AVAILABLE)}
                  />
                </Grid>
              ))}
            </Grid>
          ) : ( <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>Please click on an available seat to select it.</Typography> )}
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            Total Price:{" "} {new Intl.NumberFormat("es-NI", { style: "currency", currency: "NIO" }).format(calculateTotalPrice())}
          </Typography>
        </Box>
        <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
          <Button variant="contained" color="primary" size="large" onClick={handleProceedToCheckout} disabled={selectedSeatObjectsForDisplay.length === 0 || isLoading}>
            Proceed to Checkout
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
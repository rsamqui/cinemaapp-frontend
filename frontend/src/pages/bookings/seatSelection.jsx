import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
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
} from "@mui/material";
import Room from "../../components/Room";
import { SEAT_STATUS } from "../../constants/seatConstants";
import roomService from "../../services/roomService";

const DEFAULT_MOVIE_DETAILS = {
  id: null,
  title: "Movie Loading...",
  showtimeDate: "N/A", // Added for placeholder
  showtimeTime: "N/A", // Added for placeholder
  screen: "N/A",
};

export default function SeatSelectionPage() {
  const { screeningId } = useParams(); // This is the identifier from the URL
  const navigate = useNavigate();
  const location = useLocation();

  const [movieDetails, setMovieDetails] = useState(
    location.state?.movieInfo || DEFAULT_MOVIE_DETAILS
  );
  const [roomConfig, setRoomConfig] = useState({
    rows: 0,
    cols: 0,
    roomNumber: null,
    roomId: null, // This will be the DB ID of the room, same as screeningId in this simplified model
    movieId: null,
  });
  const [initialSeatStatuses, setInitialSeatStatuses] = useState([]);
  const [userSelectedSeatIds, setUserSelectedSeatIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log(
    "SeatSelectionPage - Initial location.state.movieInfo:",
    JSON.stringify(location.state?.movieInfo)
  );

  const TICKET_PRICE = 230;

  useEffect(() => {
    console.log(
      "SeatSelectionPage: movieDetails state updated:",
      JSON.stringify(movieDetails)
    );
  }, [movieDetails]);

  useEffect(() => {
    console.log(
      "SeatSelectionPage: roomConfig state updated:",
      JSON.stringify(roomConfig)
    );
  }, [roomConfig]);

  const loadLayout = useCallback(async () => {
    if (!screeningId) {
      setError("Screening/Room ID information is missing in URL.");
      setIsLoading(false);
      return;
    }
    console.log(
      "SeatSelectionPage (loadLayout): Executing for screeningId (used as roomId):",
      screeningId
    );
    setIsLoading(true);
    setError(null);
    try {
      const responseArray = await roomService.getRoomById(screeningId); // screeningId is the room's ID here
      console.log(
        "SeatSelectionPage (loadLayout): Fetched API responseArray:",
        JSON.stringify(responseArray)
      );

      if (Array.isArray(responseArray) && responseArray.length > 0) {
        const roomData = responseArray[0];
        console.log(
          "SeatSelectionPage (loadLayout): Extracted roomData:",
          JSON.stringify(roomData)
        );

        if (roomData && roomData.id) {
          setRoomConfig({
            rows: roomData.totalRows || 0,
            cols: roomData.totalColumns || 0,
            roomNumber: roomData.roomNumber || "N/A",
            roomId: roomData.id, // This is the room's DB ID
            movieId: roomData.movieId, // Movie ID associated with this room
          });
          // Ensure seatLayout has dbId for each seat
          setInitialSeatStatuses(
            (roomData.seatLayout || []).map(seat => ({...seat, dbId: seat.dbId || seat.id}))
          );
          setUserSelectedSeatIds(new Set());

          // Update movieDetails state. Prioritize data linked directly to the room/screening.
          setMovieDetails(prev => {
            const baseDetails = location.state?.movieInfo && location.state.movieInfo.id
                                ? location.state.movieInfo
                                : (prev && prev.id ? prev : DEFAULT_MOVIE_DETAILS);
            return {
              ...baseDetails,
              id: roomData.movieId || baseDetails.id,
              title: roomData.movieTitle || baseDetails.title,
              ticketPrice: 230,
              screen: roomData.roomNumber || baseDetails.screen,
              // showtimeDate and showtimeTime should ideally come from roomData if it's specific
              // For now, relying on what might have been passed from MovieDetailPage
              showtimeDate: baseDetails.showtimeDate,
              showtimeTime: baseDetails.showtimeTime,
            };
          });
          console.log(
            "SeatSelectionPage (loadLayout): setState calls made."
          );
        } else {
          throw new Error("Extracted room data is invalid (e.g., missing ID).");
        }
      } else {
        throw new Error("Room data not found or API returned an empty array.");
      }
    } catch (err) {
      console.error("SeatSelectionPage (loadLayout): Failed to load room layout:",err);
      setError( err.message || "Sorry, we couldn't load the seat map. Please try again later.");
      setRoomConfig({ rows: 0, cols: 0, roomNumber: null, roomId: null, movieId: null });
      setInitialSeatStatuses([]);
    } finally {
      setIsLoading(false);
    }
  }, [screeningId, location.state?.movieInfo]); // Added location.state.movieInfo dependency

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

  // RENAMED THIS FUNCTION
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
      alert("Error: Some selected seats are missing database IDs. Cannot proceed.");
      console.error("Selected seats with missing dbId:", seatsToBook.filter((s) => !s.dbId));
      return;
    }

    const navigationState = {
      selectedSeats: seatsToBook,
      movieDetails: {
        id: movieDetails.id,
        title: movieDetails.title,
        ticketPrice: TICKET_PRICE,
      },
      roomInfo: {
        id: roomConfig.roomId,
        roomNumber: roomConfig.roomNumber,
      },
      // THIS NEEDS TO BE DYNAMIC AND CORRECTLY POPULATED
      showDate: movieDetails.showtimeDate || "2025-06-01",
      totalPrice: calculateTotalPrice(),
    };

    console.log("SeatSelectionPage: Navigating to /checkout with state:", JSON.stringify(navigationState, null, 2));
    navigate("/checkout", { state: navigationState });
  };

  console.log(
    "SeatSelectionPage: FINAL VALUES BEFORE RENDER ---",
    "isLoading:", isLoading,
    "error:", error,
    "roomConfig.rows:", roomConfig.rows,
    "roomConfig.cols:", roomConfig.cols,
    "allSeatStatusesForRoom length:", allSeatStatusesForRoom.length
  );

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

        <Box
          sx={{
            mb: 3,
            p: 2,
            backgroundColor: "rgba(0,0,0,0.05)",
            borderRadius: 1,
          }}
        >
          <Typography variant="h6">
            {movieDetails.title || "Movie Title"}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {/* This should display the actual show date and time */}
            Date:{" "}
            {movieDetails.showtimeDate
              ? new Date(movieDetails.showtimeDate).toLocaleDateString()
              : "Select Date"}{" "}
            - Time: {movieDetails.showtimeTime || "Select Time"} - Room:{" "}
            {roomConfig.roomNumber || "..."}
          </Typography>
        </Box>

        {(roomConfig.rows > 0 && roomConfig.cols > 0) ? (
        <Room
            key={`${roomConfig.roomId}-${roomConfig.rows}-${roomConfig.cols}-${userSelectedSeatIds.size}`}
            initialRows={roomConfig.rows}
            initialCols={roomConfig.cols}
            externallySetSeats={allSeatStatusesForRoom}
            onUserSeatToggle={handleSeatSelect}
            isEditable={false}
        />
        ) : (
          !isLoading && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Seat map is currently unavailable or room dimensions are not set.
            </Alert>
          )
        )}

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Your Selection
          </Typography>
          {selectedSeatObjectsForDisplay.length > 0 ? (
            <Grid container spacing={1} sx={{ mb: 2 }}>
              {selectedSeatObjectsForDisplay.map((seat) => (
                <Grid item key={seat.id}>
                  <Chip
                    label={seat.id}
                    color="primary"
                    onDelete={() =>
                      handleSeatSelect({ id: seat.id }, SEAT_STATUS.AVAILABLE)
                    }
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Please click on an available seat to select it.
            </Typography>
          )}
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            Total Price:{" "}
            {new Intl.NumberFormat("es-NI", {
              style: "currency",
              currency: "NIO",
            }).format(calculateTotalPrice())}
          </Typography>
        </Box>

        <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleProceedToCheckout}
            disabled={selectedSeatObjectsForDisplay.length === 0}
          >
            Proceed to Checkout
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

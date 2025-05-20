// src/pages/SeatSelectionPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom"; // Added useLocation
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
import roomService from "../../services/roomService"; // Assuming this service exists

// Default movie details in case location.state.movieInfo is not available
const DEFAULT_MOVIE_DETAILS = {
  id: null,
  title: "Movie Loading...",
  ticketPrice: 230,
  showtime: "N/A",
  screen: "N/A",
};

export default function SeatSelectionPage() {
  const { roomId } = useParams(); // This is the identifier for the specific showing/room content
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize movieDetails with data from location.state or a default object
  const [movieDetails, setMovieDetails] = useState(
    location.state?.movieInfo || DEFAULT_MOVIE_DETAILS
  );

  const [roomConfig, setRoomConfig] = useState({
    rows: 0,
    cols: 0,
    roomNumber: null,
    roomId: null,
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

  // Safely access TICKET_PRICE, provide default if movieDetails or ticketPrice is missing
  const TICKET_PRICE =
    movieDetails?.ticketPrice || DEFAULT_MOVIE_DETAILS.ticketPrice;

  // useEffect to log state updates (for debugging, can be removed later)
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
    if (!roomId) {
      setError("Screening information is missing.");
      setIsLoading(false);
      return;
    }
    console.log(
      "SeatSelectionPage (loadLayout): Executing for roomId/roomId:",
      roomId
    );
    setIsLoading(true);
    setError(null);
    try {
      const responseArray = await roomService.getRoomById(roomId);
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
        console.log(
          `SeatSelectionPage (loadLayout): Before setState - roomData.totalRows: ${roomData.totalRows}, roomData.totalColumns: ${roomData.totalColumns}`
        );

        if (roomData && roomData.id) {
          setRoomConfig({
            rows: roomData.totalRows || 0,
            cols: roomData.totalColumns || 0,
            roomNumber: roomData.roomNumber || "N/A",
            roomId: roomData.id,
            movieId: roomData.movieId,
          });
          setInitialSeatStatuses(roomData.seatLayout || []);
          setUserSelectedSeatIds(new Set());

          if (roomData.movieTitle) {
            setMovieDetails((prev) => ({
              ...(prev || DEFAULT_MOVIE_DETAILS),
              title: roomData.movieTitle, // This would be correct if roomData has movieTitle
              id: roomData.movieId, // This correctly uses data.movieId from roomData
              ticketPrice:
                roomData.ticketPrice ||
                prev?.ticketPrice ||
                DEFAULT_MOVIE_DETAILS.ticketPrice,
            }));
          } else if (roomData.movie && typeof roomData.movie === "object") {
            setMovieDetails((prev) => ({
              ...(prev || DEFAULT_MOVIE_DETAILS),
              ...roomData.movie,
            }));
          }
          console.log(
            "SeatSelectionPage (loadLayout): setState calls made with extracted roomData."
          );
        } else {
          console.error(
            "SeatSelectionPage (loadLayout): Extracted roomData is missing an ID or is invalid:",
            roomData
          );
          throw new Error("Extracted room data is invalid (e.g., missing ID).");
        }
      } else {
        console.error(
          "SeatSelectionPage (loadLayout): No room data found in API response or unexpected array format:",
          responseArray
        );
        throw new Error("Room data not found or API returned an empty array.");
      }
    } catch (err) {
      console.error(
        "SeatSelectionPage (loadLayout): Failed to load room layout:",
        err
      );
      setError(
        err.message ||
          "Sorry, we couldn't load the seat map. Please try again later."
      );
      setRoomConfig({
        rows: 0,
        cols: 0,
        roomNumber: null,
        roomId: null,
        movieId: null,
      }); // Reset on error
      setInitialSeatStatuses([]);
    } finally {
      setIsLoading(false);
      console.log(
        "SeatSelectionPage (loadLayout): Finished, setIsLoadingPage(false)."
      );
    }
  }, [roomId]); // Added location.state.movieInfo as a dependency

  useEffect(() => {
    loadLayout();
  }, [loadLayout]); // useEffect depends on the stable loadLayout function

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

    navigate("/checkout", {
      state: {
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
        showDate: movieDetails.showtimeDate || "2025-05-20",
        totalPrice: calculateTotalPrice(),
      },
    });
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

        {roomConfig.rows > 0 && roomConfig.cols > 0 ? (
          <Room
            key={`${roomConfig.roomId}-${roomConfig.rows}-${roomConfig.cols}-${userSelectedSeatIds.size}`} // Updated key
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

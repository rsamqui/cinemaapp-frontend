// src/pages/admin/CreateRoomPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import RoomEditorLayout from "../../components/Room"; // Your RoomEditorLayout component
// import { SEAT_STATUS } from '../../constants/seatConstants'; // Not strictly needed if not sending layout
import roomService from "../../services/roomService"; // Import your actual room service
import movieService from "../../services/movieService"; // Assuming you have a movie service

// --- Mock API Calls (Keep for fallback or remove if using actual services) ---
// const fetchMoviesMock = async () => { /* ... */ };
// const saveRoomConfigurationAPIMock = async (config) => { /* ... */ };
// --- End Mock API Calls ---

const MAX_ADMIN_ROWS = 26; // A-Z
const MAX_ADMIN_COLS = 12; // Example max

// Define a stable empty array reference outside the component for externallySetSeats
const EMPTY_EXTERNALLY_SET_SEATS = [];

export default function CreateRoomPage() {
  // eslint-disable-next-line no-unused-vars
  const navigate = useNavigate();

  const [roomName, setRoomName] = useState(""); // Descriptive name (optional if not sent to this API)
  const [roomNumber, setRoomNumber] = useState(""); // For the "roomNumber" field in payload
  const [numRows, setNumRows] = useState(7);
  const [numCols, setNumCols] = useState(12);
  const [selectedMovieId, setSelectedMovieId] = useState("");
  const [movies, setMovies] = useState([]);
  const [isLoadingMovies, setIsLoadingMovies] = useState(true);
  const [movieError, setMovieError] = useState(null);

  // currentSeatLayout is kept for the visual preview, but not sent to /newRoom endpoint
  const [currentSeatLayout, setCurrentSeatLayout] = useState([]);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  useEffect(() => {
    const loadMovies = async () => {
      setIsLoadingMovies(true);
      setMovieError(null);
      try {
        const fetchedMovies = await movieService.getMovies();
        setMovies(fetchedMovies || []);
      } catch (err) {
        console.error("Failed to fetch movies:", err);
        setMovieError("Could not load movies. Please try again.");
      } finally {
        setIsLoadingMovies(false);
      }
    };
    loadMovies();
  }, []);

  // This callback is still useful if RoomEditorLayout allows interaction (e.g. blocking seats)
  // even if that specific data isn't sent to THIS /newRoom endpoint.
  const handleRoomLayoutChange = useCallback((newLayout) => {
    setCurrentSeatLayout(newLayout);
    console.log(
      "CreateRoomPage: Visual layout updated",
      newLayout.length,
      "seats"
    );
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaveError(null); // Clear previous errors

    // Validation
    if (!roomNumber.trim() || isNaN(parseInt(roomNumber, 10))) {
      setSaveError("Room Number is required and must be a number.");
      return;
    }
    if (!selectedMovieId) {
      setSaveError("Please select a movie.");
      return;
    }
    if (numRows <= 0 || numCols <= 0) {
      setSaveError("Rows and columns must be greater than 0.");
      return;
    }
    // Add validation for roomName if it's also required by another process or for display
    if (!roomName.trim()) {
      setSaveError("Room/Screen Name is required for descriptive purposes.");
      // return; // You might still allow submission if /newRoom API doesn't need it
    }

    setIsSaving(true);

    const payload = {
      roomNumber: parseInt(roomNumber, 10),
      movieId: parseInt(selectedMovieId, 10),
      totalRows: numRows,
      totalColumns: numCols,
    };

    console.log("Submitting to /newRoom with payload:", payload);

    try {
      const response = await roomService.createNewRoom(payload);
      console.log("Room created successfully:", response);
      setSnackbarMessage(`Room number ${payload.roomNumber} configured successfully!`);
      setSnackbarOpen(true);
      // Reset form
      setRoomName("");
      setRoomNumber("");
      setSelectedMovieId("");
      setNumRows(7);
      setNumCols(12);
      setCurrentSeatLayout([]); // Reset visual layout
      // navigate('/admin/rooms-list'); // Optional: navigate to a list of rooms
    } catch (err) {
      console.error("Failed to create room via API:", err);
      setSaveError(err.message || "An unexpected error occurred while saving the room.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  const initialExternallySetSeats = useMemo(() => [], []);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 } }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Create New Cinema Room
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3} alignItems="flex-start">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                required
                label="Room Number (e.g., 1, 2)"
                type="number" // Set type to number
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                error={
                  !!saveError &&
                  (!roomNumber.trim() || isNaN(parseInt(roomNumber, 10)))
                }
                helperText={
                  !!saveError &&
                  (!roomNumber.trim() || isNaN(parseInt(roomNumber, 10)))
                    ? "Room number is required & numeric"
                    : ""
                }
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl
                fullWidth
                required
                error={!!saveError && !selectedMovieId}
              >
                <InputLabel id="movie-select-label">Select Movie</InputLabel>
                <Select
                  labelId="movie-select-label"
                  value={selectedMovieId}
                  label="Select Movie"
                  onChange={(e) => setSelectedMovieId(e.target.value)}
                  disabled={isLoadingMovies}
                  displayEmpty
                >
                  <MenuItem
                    value=""
                    disabled={
                      movies.length > 0 || isLoadingMovies || !!movieError
                    }
                  >
                    <em>
                      {isLoadingMovies
                        ? "Loading movies..."
                        : movieError
                        ? movieError
                        : movies.length === 0
                        ? "No movies available"
                        : "Select a movie"}
                    </em>
                  </MenuItem>
                  {movies.map((movie) => (
                    <MenuItem key={movie.id} value={movie.id}>
                      {movie.title}
                    </MenuItem>
                  ))}
                </Select>
                {!!saveError && !selectedMovieId && (
                  <Typography
                    component="p"
                    color="error"
                    variant="caption"
                    sx={{ ml: 1.5, mt: 0.5 }}
                  >
                    Movie is required
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={3} md={1.5}>
              <TextField
                fullWidth
                required
                label="Rows"
                type="number"
                value={numRows.toString()}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val)) {
                    setNumRows(Math.max(1, Math.min(MAX_ADMIN_ROWS, val)));
                  } else if (e.target.value === '') {
                    // Allow clearing the field, maybe set to a default or handle empty state
                    setNumRows(1); // Or some other sensible default for empty
                  }
                }}
                InputProps={{ inputProps: { min: 1, max: MAX_ADMIN_ROWS } }}
                error={!!saveError && numRows <= 0}
                helperText={!!saveError && numRows <= 0 ? "Invalid" : ""}
              />
            </Grid>
            <Grid item xs={6} sm={3} md={1.5}>
              <TextField
                fullWidth
                required
                label="Columns"
                type="number"
                value={numCols}
                onChange={(e) =>
                  setNumCols(
                    Math.max(
                      1,
                      Math.min(
                        MAX_ADMIN_COLS,
                        parseInt(e.target.value, 10) || 1
                      )
                    )
                  )
                }
                InputProps={{ inputProps: { min: 1, max: MAX_ADMIN_COLS } }}
                error={!!saveError && numCols <= 0}
                helperText={!!saveError && numCols <= 0 ? "Invalid" : ""}
              />
            </Grid>
          </Grid>

          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
            Room Layout Preview
          </Typography>
          {/* RoomEditorLayout is still useful for visual feedback of dimensions */}
          {numRows > 0 && numCols > 0 ? (
            <RoomEditorLayout
              key={`${numRows}-${numCols}-${currentSeatLayout.length}`} // Added currentSeatLayout.length to key
              initialRows={numRows}
              initialCols={numCols}
              isEditable={true} // Admin can still mark seats as BLOCKED visually
              externallySetSeats={
                currentSeatLayout.length > 0
                  ? currentSeatLayout
                  : initialExternallySetSeats
              } // Pass current layout if modified
              onLayoutChange={handleRoomLayoutChange}
            />
          ) : (
            <Alert severity="info" sx={{ mt: 2 }}>
              Set rows and columns to preview the layout.
            </Alert>
          )}

          {saveError && (
            <Alert severity="error" sx={{ mt: 3, mb: 2 }}>
              {saveError}
            </Alert>
          )}

          <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={isSaving || isLoadingMovies}
              startIcon={
                isSaving ? <CircularProgress size={20} color="inherit" /> : null
              }
            >
              {isSaving ? "Saving..." : "Create Room Configuration"}
            </Button>
          </Box>
        </Box>
      </Paper>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Container>
  );
}

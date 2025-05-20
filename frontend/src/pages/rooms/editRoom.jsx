import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import Room from "../../components/Room";
import { SEAT_STATUS } from "../../constants/seatConstants";
import roomService from "../../services/roomService";
import movieService from "../../services/movieService";

const MAX_ADMIN_ROWS = 26;
const MAX_ADMIN_COLS = 18;

export default function EditRoomPage() {
  const { roomId } = useParams();
  // eslint-disable-next-line no-unused-vars
  const navigate = useNavigate();

  const [roomNumber, setRoomNumber] = useState("");
  const [numRows, setNumRows] = useState(0);
  const [numCols, setNumCols] = useState(0);
  const [selectedMovieId, setSelectedMovieId] = useState("");
  const [movies, setMovies] = useState([]);
  const [initialSeatLayout, setInitialSeatLayout] = useState([]);
  const [currentSeatLayout, setCurrentSeatLayout] = useState([]);

  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [isLoadingMovies, setIsLoadingMovies] = useState(true);
  const [pageError, setPageError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Fetch movies
  useEffect(() => {
    const loadMovies = async () => {
      setIsLoadingMovies(true);
      try {
        // Pass roomId when editing so the current movie is included
        const fetchedMovies = await movieService.getAvailableMovies(roomId);
        setMovies(fetchedMovies || []);
      } catch (err) {
        console.error("Failed to fetch movies:", err);
        setPageError("Could not load movies list.");
      } finally {
        setIsLoadingMovies(false);
      }
    };
    if (roomId) {
      // Only load if roomId is available for context
      loadMovies();
    } else {
      // For CreateRoomPage, call without roomId
      setIsLoadingMovies(false);
      setPageError("Room ID not available to fetch relevant movies.");
    }
  }, [roomId]);

  // Fetch existing room data
  useEffect(() => {
    if (!roomId) {
      console.log("EditRoomPage: roomId is missing, not loading data.");
      setPageError("Room ID is missing.");
      setIsLoadingPage(false);
      return;
    }
    console.log(
      `EditRoomPage: useEffect for loadRoomData triggered with roomId: ${roomId}`
    );
    const loadRoomData = async () => {
      setIsLoadingPage(true);
      setPageError(null);
      try {
        const responseData = await roomService.getRoomById(roomId); // responseData is an array
        console.log(
          "EditRoomPage: Fetched API responseData:",
          JSON.stringify(responseData)
        );

        // Check if responseData is an array and has at least one element
        if (Array.isArray(responseData) && responseData.length > 0) {
          const roomObject = responseData[0];

          console.log(
            "EditRoomPage: Extracted roomObject:",
            JSON.stringify(roomObject)
          );
          console.log(
            `EditRoomPage: Before setState - roomObject.totalRows: ${roomObject.totalRows}, roomObject.totalColumns: ${roomObject.totalColumns}`
          );

          setRoomNumber(roomObject.roomNumber?.toString() || "");
          setNumRows(roomObject.totalRows || 0);
          setNumCols(roomObject.totalColumns || 0);
          setSelectedMovieId(roomObject.movieId?.toString() || "");
          const fetchedLayout = roomObject.seatLayout || [];
          setInitialSeatLayout(fetchedLayout);
          setCurrentSeatLayout(fetchedLayout);
          console.log(
            "EditRoomPage: setState calls made with extracted roomObject data."
          );
        } else {
          // Handle case where no room data is returned or format is unexpected
          console.error(
            "EditRoomPage: No room data found in response or unexpected format:",
            responseData
          );
          throw new Error("Room data not found or in an unexpected format.");
        }
      } catch (err) {
        console.error(`Failed to fetch room data for ID ${roomId}:`, err);
        setPageError(
          `Could not load room data: ${err.message || "Unknown error"}`
        );
      } finally {
        setIsLoadingPage(false);
        console.log(
          "EditRoomPage: loadRoomData finished, setIsLoadingPage(false)."
        );
      }
    };
    loadRoomData();
  }, [roomId]);

  // Add a separate useEffect to log numRows and numCols when they change
  useEffect(() => {
    console.log(`EditRoomPage: numRows state updated to: ${numRows}`);
  }, [numRows]);

  useEffect(() => {
    console.log(`EditRoomPage: numCols state updated to: ${numCols}`);
  }, [numCols]);

  const handleRoomLayoutChange = useCallback((newLayout) => {
    setCurrentSeatLayout(newLayout);
    console.log(
      "EditRoomPage: Visual layout updated",
      newLayout.length,
      "seats"
    );
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaveError(null);

    if (!roomNumber.trim() || isNaN(parseInt(roomNumber, 10))) {
      setSaveError("Room Number is required and must be a number.");
      return;
    }
    if (!selectedMovieId) {
      setSaveError("Please select a movie.");
      return;
    }
    const parsedRows = parseInt(numRows, 10);
    const parsedCols = parseInt(numCols, 10);
    if (
      isNaN(parsedRows) ||
      parsedRows <= 0 ||
      isNaN(parsedCols) ||
      parsedCols <= 0
    ) {
      setSaveError("Rows and columns must be valid numbers greater than 0.");
      return;
    }

    setIsSaving(true);

    const layoutToSave = currentSeatLayout;
    const updatedRoomData = {
      roomNumber: parseInt(roomNumber, 10),
      movieId: parseInt(selectedMovieId, 10),
      totalRows: parsedRows,
      totalColumns: parsedCols,
      layout: layoutToSave,
    };
    await roomService.updateRoom(roomId, updatedRoomData);

    console.log(
      `Submitting PUT /rooms/${roomId} with payload:`,
      updatedRoomData
    );

    try {
      await roomService.updateRoom(roomId, updatedRoomData);
      setSnackbarMessage(`Room ${roomNumber} updated successfully!`);
      setSnackbarOpen(true);
      // navigate(`/admin/view-room/${roomId}`);
    } catch (err) {
      console.error("Failed to update room:", err);
      setSaveError(err.message || "An unexpected error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSnackbarClose = () => setSnackbarOpen(false);

  console.log(
    `EditRoomPage: Before return - isLoadingPage: ${isLoadingPage}, pageError: ${pageError}, numRows: ${numRows}, numCols: ${numCols}`
  );
  if (isLoadingPage || isLoadingMovies) {
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
        <Typography sx={{ ml: 2 }}>Loading room data...</Typography>
      </Box>
    );
  }

  console.log(`EditRoomPage: Checking error. pageError: ${pageError}`);
  if (pageError) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{pageError}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 } }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Edit Room Layout for room: ( {roomId})
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3} alignItems="flex-start">
            {/* Room Number Input */}
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                required
                label="Room Number"
                type="number"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                error={
                  !!saveError &&
                  (!roomNumber.trim() || isNaN(parseInt(roomNumber, 10)))
                }
                helperText={
                  !!saveError &&
                  (!roomNumber.trim() || isNaN(parseInt(roomNumber, 10)))
                    ? "Required & numeric"
                    : ""
                }
              />
            </Grid>

            {/* Movie Select */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl
                fullWidth
                required
                error={!!saveError && !selectedMovieId}
              >
                <InputLabel id="movie-select-label">
                  Associated Movie
                </InputLabel>
                <Select
                  labelId="movie-select-label"
                  value={selectedMovieId}
                  label="Associated Movie"
                  onChange={(e) => setSelectedMovieId(e.target.value)}
                  displayEmpty
                >
                  <MenuItem value="">
                    <em>Select a movie</em>
                  </MenuItem>
                  {movies.map((movie) => (
                    <MenuItem key={movie.id} value={movie.id.toString()}>
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
                    Required
                  </Typography>
                )}
              </FormControl>
            </Grid>
            {/* Rows & Columns */}
            <Grid item xs={6} sm={3} md={1.5}>
              <TextField
                fullWidth
                required
                label="Total Rows"
                type="number"
                value={numRows}
                onChange={(e) =>
                  setNumRows(
                    Math.max(
                      1,
                      Math.min(
                        MAX_ADMIN_ROWS,
                        parseInt(e.target.value, 10) || 0
                      )
                    )
                  )
                }
                InputProps={{ inputProps: { min: 1, max: MAX_ADMIN_ROWS } }}
                error={
                  !!saveError &&
                  (isNaN(parseInt(numRows, 10)) || parseInt(numRows, 10) <= 0)
                }
                helperText={
                  !!saveError &&
                  (isNaN(parseInt(numRows, 10)) || parseInt(numRows, 10) <= 0)
                    ? "Invalid"
                    : ""
                }
              />
            </Grid>
            <Grid item xs={6} sm={3} md={1.5}>
              <TextField
                fullWidth
                required
                label="Total Columns"
                type="number"
                value={numCols}
                onChange={(e) =>
                  setNumCols(
                    Math.max(
                      1,
                      Math.min(
                        MAX_ADMIN_COLS,
                        parseInt(e.target.value, 10) || 0
                      )
                    )
                  )
                }
                InputProps={{ inputProps: { min: 1, max: MAX_ADMIN_COLS } }}
                error={
                  !!saveError &&
                  (isNaN(parseInt(numCols, 10)) || parseInt(numCols, 10) <= 0)
                }
                helperText={
                  !!saveError &&
                  (isNaN(parseInt(numCols, 10)) || parseInt(numCols, 10) <= 0)
                    ? "Invalid"
                    : ""
                }
              />
            </Grid>
          </Grid>
          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
            Edit Room Layout{" "}
          </Typography>
          console.log(`EditRoomPage: Checking dimensions before rendering Room.
          numRows: ${numRows}, numCols: ${numCols}`);
          {numRows > 0 && numCols > 0 ? (
            <Room
              key={`${roomId}-${numRows}-${numCols}-${initialSeatLayout.length}`} // Key to re-init if fundamental props change
              initialRows={numRows}
              initialCols={numCols}
              isEditable={true}
              externallySetSeats={currentSeatLayout}
              onLayoutChange={handleRoomLayoutChange}
            />
          ) : (
            <Alert severity="info" sx={{ mt: 2 }}>
              Room dimensions not loaded or invalid. (numRows: {numRows},
              numCols: {numCols})
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
              disabled={isSaving || isLoadingPage || isLoadingMovies}
              startIcon={
                isSaving ? <CircularProgress size={20} color="inherit" /> : null
              }
            >
              {isSaving ? "Saving Changes..." : "Update Room"}
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

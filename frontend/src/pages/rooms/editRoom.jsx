import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  Container, Typography, Paper, Box, Button, TextField, Grid,
  FormControl, InputLabel, Select, MenuItem, CircularProgress, Alert, Snackbar,
} from "@mui/material";
import Room from "../../components/Room"; 
import roomService from "../../services/roomService";
import movieService from "../../services/movieService";


const MAX_ADMIN_ROWS = 26;
const MAX_ADMIN_COLS = 18;

export default function EditRoomPage() {
  const { roomId } = useParams();

  const [roomNumber, setRoomNumber] = useState("");
  const [numRows, setNumRows] = useState(0);
  const [numCols, setNumCols] = useState(0);
  const [selectedMovieId, setSelectedMovieId] = useState("");
  const [movies, setMovies] = useState([]);
  const [currentSeatLayout, setCurrentSeatLayout] = useState([]);

  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [isLoadingMovies, setIsLoadingMovies] = useState(true);
  const [pageError, setPageError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  useEffect(() => {
    const loadAllMovies = async () => {
      setIsLoadingMovies(true);
      try {
        const fetchedMovies = await movieService.getMovies();
        setMovies(fetchedMovies || []);
      } catch (err) {
        console.error("EditRoomPage: Failed to fetch movies:", err);
        setPageError("Could not load movies list.");
      } finally {
        setIsLoadingMovies(false);
      }
    };
    loadAllMovies();
  }, []);

  useEffect(() => {
    if (!roomId) {
      setPageError("Room ID is missing. Cannot load room data.");
      setIsLoadingPage(false); 
      setIsLoadingMovies(false);
      return;
    }

    const loadRoomData = async () => {
      setIsLoadingPage(true);
      setPageError(null);
      try {
        const responseData = await roomService.getRoomById(roomId);
        console.log("EditRoomPage: Fetched API responseData for room:", JSON.stringify(responseData));

        if (Array.isArray(responseData) && responseData.length > 0) {
          const roomObject = responseData[0];
          setRoomNumber(roomObject.roomNumber?.toString() || "");
          setNumRows(roomObject.totalRows || 0);
          setNumCols(roomObject.totalColumns || 0);
          setSelectedMovieId(roomObject.movieId?.toString() || "");
          const fetchedLayout = roomObject.seatLayout || [];
          setCurrentSeatLayout(fetchedLayout);
        } else {
          throw new Error("Room data not found or in an unexpected format.");
        }
      } catch (err) {
        console.error(`EditRoomPage: Failed to fetch room data for ID ${roomId}:`, err);
        setPageError(`Could not load room data: ${err.message || "Unknown error"}`);
      } finally {
        setIsLoadingPage(false);
      }
    };

    loadRoomData();
  }, [roomId]);

  const handleRoomLayoutChange = useCallback((newLayout) => {
    console.log("EditRoomPage: Visual layout would be updated by Room if it had internal changes", newLayout.length);
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
    if (isNaN(parsedRows) || parsedRows <= 0 || isNaN(parsedCols) || parsedCols <= 0) {
        setSaveError("Rows and columns must be valid numbers greater than 0.");
        return;
    }

    setIsSaving(true);

    const updatedRoomData = {
      roomNumber: parseInt(roomNumber, 10),
      movieId: parseInt(selectedMovieId, 10),
      totalRows: parsedRows,
      totalColumns: parsedCols,
    };

    console.log(`Submitting PUT /api/rooms/${roomId} with payload:`, updatedRoomData);

    try {
      await roomService.updateRoom(roomId, updatedRoomData);
      setSnackbarMessage(`Room ${roomNumber} updated successfully!`);
      setSnackbarOpen(true);
    } catch (err) {
      console.error("Failed to update room:", err);
      setSaveError(err.error || err.message || "An unexpected error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSnackbarClose = () => setSnackbarOpen(false);

  const externallySetSeatsForEditor = useMemo(() => currentSeatLayout, [currentSeatLayout]);

  if (isLoadingPage || isLoadingMovies) { /* ... loading UI ... */ }
  if (pageError) { /* ... error UI ... */ }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 } }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Edit Room Configuration
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3} alignItems="flex-start">
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth required label="Room Number" type="number" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} error={!!saveError && (!roomNumber.trim() || isNaN(parseInt(roomNumber,10)))} helperText={!!saveError && (!roomNumber.trim() || isNaN(parseInt(roomNumber,10))) ? "Required & numeric" : ""} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth required error={!!saveError && !selectedMovieId}>
                <InputLabel id="movie-select-label">Associated Movie</InputLabel>
                <Select labelId="movie-select-label" value={selectedMovieId} label="Associated Movie" onChange={(e) => setSelectedMovieId(e.target.value)} displayEmpty disabled={isLoadingMovies}>
                  <MenuItem value=""><em>{isLoadingMovies ? "Loading..." : movies.length === 0 ? "No movies" : "Select Movie"}</em></MenuItem>
                  {movies.map((movie) => (<MenuItem key={movie.id} value={movie.id.toString()}>{movie.title}</MenuItem>))}
                </Select>
                {!!saveError && !selectedMovieId && <Typography component="p" color="error" variant="caption" sx={{ml:1.5, mt:0.5}}>Required</Typography>}
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={3} md={1.5}>
              <TextField fullWidth required label="Total Rows" type="number" value={numRows} onChange={(e) => setNumRows(Math.max(0, Math.min(MAX_ADMIN_ROWS, parseInt(e.target.value,10) || 0)))} InputProps={{ inputProps: { min: 1, max: MAX_ADMIN_ROWS } }} error={!!saveError && (isNaN(parseInt(numRows,10)) || parseInt(numRows,10) <=0)} helperText={!!saveError && (isNaN(parseInt(numRows,10)) || parseInt(numRows,10) <=0) ? "Invalid" : ""}/>
            </Grid>
            <Grid item xs={6} sm={3} md={1.5}>
              <TextField fullWidth required label="Total Columns" type="number" value={numCols} onChange={(e) => setNumCols(Math.max(0, Math.min(MAX_ADMIN_COLS, parseInt(e.target.value,10) || 0)))} InputProps={{ inputProps: { min: 1, max: MAX_ADMIN_COLS } }} error={!!saveError && (isNaN(parseInt(numCols,10)) || parseInt(numCols,10) <=0)} helperText={!!saveError && (isNaN(parseInt(numCols,10)) || parseInt(numCols,10) <=0) ? "Invalid" : ""}/>
            </Grid>
          </Grid>

          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Room Layout Preview</Typography>
          {(numRows > 0 && numCols > 0) ? (
            <Room
              key={`${roomId}-${numRows}-${numCols}-${currentSeatLayout.length}`}
              initialRows={numRows}
              initialCols={numCols}
              isEditable={false}
              externallySetSeats={externallySetSeatsForEditor}
              onLayoutChange={handleRoomLayoutChange}
            />
          ) : (<Alert severity="info" sx={{mt: 2}}>Enter valid rows and columns to see a preview.</Alert>)}

          {saveError && (<Alert severity="error" sx={{ mt: 3, mb: 2 }}>{saveError}</Alert>)}
          <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
            <Button type="submit" variant="contained" color="primary" size="large" disabled={isSaving || isLoadingPage || isLoadingMovies} startIcon={ isSaving ? <CircularProgress size={20} color="inherit" /> : null }>
              {isSaving ? "Saving Changes..." : "Update Room"}
            </Button>
          </Box>
        </Box>
      </Paper>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose} message={snackbarMessage} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}/>
    </Container>
  );
}
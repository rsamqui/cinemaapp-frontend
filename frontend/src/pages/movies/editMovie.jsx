import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  TextField,
  Grid,
  CircularProgress,
  Alert,
  Snackbar,
  InputAdornment,
} from "@mui/material";
import {
  Movie as MovieIcon,
  Description as DescriptionIcon,
  Timer as TimerIcon,
  Link as LinkIcon,
  Category as CategoryIcon,
  StarRate as StarRateIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import movieService from "../../services/movieService";

export default function EditMoviePage() {
  const { movieId } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [duration, setDuration] = useState("");
  const [posterUrl, setPosterUrl] = useState("");
  const [originalMovieData, setOriginalMovieData] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [pageError, setPageError] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  useEffect(() => {
    if (!movieId) {
      setPageError("Movie ID is missing from URL.");
      setIsLoading(false);
      return;
    }

    const loadMovieData = async () => {
      setIsLoading(true);
      setPageError(null);
      try {
        const responseArray = await movieService.getMovieById(movieId); // Renamed to responseArray for clarity
        console.log(
          "EditMoviePage - Fetched API responseArray:",
          JSON.stringify(responseArray, null, 2)
        );

        if (Array.isArray(responseArray) && responseArray.length > 0) {
          const movieObject = responseArray[0]; // <<< FIX: Access the first element
          console.log(
            "EditMoviePage - Extracted movieObject:",
            JSON.stringify(movieObject)
          );

          if (movieObject && movieObject.id) {
            setTitle(movieObject.title || "");
            setSynopsis(movieObject.synopsis || "");
            setDuration(movieObject.duration || "");
            setPosterUrl(movieObject.posterUrl || "");
            setOriginalMovieData(movieObject);
          } else {
            console.error(
              "EditMoviePage: Extracted movieObject is invalid or missing an ID",
              movieObject
            );
            throw new Error("Fetched movie data is invalid.");
          }
        } else {
          console.error(
            "EditMoviePage: No movie data found in API response or unexpected array format",
            responseArray
          );
          throw new Error(
            "Movie not found or API returned an empty/invalid array."
          );
        }
      } catch (err) {
        console.error(
          `EditMoviePage: Failed to fetch movie details for ID ${movieId}:`,
          err
        );
        setPageError(
          err.message || "Could not load movie details. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    };
    loadMovieData();
  }, [movieId]);

  const validateForm = () => {
    if (!title.trim()) return "Movie Title is required.";
    if (!synopsis.trim()) return "Synopsis is required.";
    if (!duration.trim()) return "Duration is required.";
    if (!posterUrl.trim()) return "Poster URL is required.";
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaveError(null);
    const validationError = validateForm();
    if (validationError) {
      setSaveError(validationError);
      return;
    }
    setIsSaving(true);
    const updatedMovieData = {
      title: title.trim(),
      synopsis: synopsis.trim(),
      duration: duration.trim(),
      posterUrl: posterUrl.trim(),
    };
    try {
      await movieService.updateMovie(movieId, updatedMovieData);
      setSnackbarMessage(
        `Movie "${updatedMovieData.title}" updated successfully!`
      );
      setSnackbarOpen(true);
      navigate("/movies");
    } catch (err) {
      console.error("Failed to update movie:", err);
      setSaveError(
        err.message ||
          err.error ||
          "An unexpected error occurred while updating."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleSnackbarClose = () => setSnackbarOpen(false);

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
        <Typography sx={{ ml: 2 }}>Loading Movie Details...</Typography>
      </Box>
    );
  }

  if (pageError) {
    return (
      <Container sx={{ py: 4, textAlign: "center" }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {pageError}
        </Alert>
        <Button
          component={RouterLink}
          to="/admin/movies"
          variant="outlined"
          startIcon={<ArrowBackIcon />}
        >
          Back to Movies List
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{ fontWeight: "bold" }}
          >
            Edit Movie {originalMovieData && `"${originalMovieData.title}"`}{" "}
            (ID: {movieId})
          </Typography>
          {/* Adjust back link as needed, e.g., to /admin/list-movies */}
          <Button
            component={RouterLink}
            to="/movies"
            startIcon={<ArrowBackIcon />}
          >
            Back to List
          </Button>
        </Box>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            {/* Form fields using title, synopsis, duration, posterUrl, genre, rating states */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                name="title"
                label="Movie Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MovieIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                name="synopsis"
                label="Synopsis"
                value={synopsis}
                onChange={(e) => setSynopsis(e.target.value)}
                multiline
                rows={4}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <DescriptionIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                name="duration"
                label="Duration (e.g., 145 min or 02:25:00)"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <TimerIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                name="posterUrl"
                label="Poster Image URL"
                type="url"
                value={posterUrl}
                onChange={(e) => setPosterUrl(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LinkIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>

          {saveError && (
            <Alert severity="error" sx={{ mt: 3, mb: 0 }}>
              {saveError}
            </Alert>
          )}

          <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={isSaving || isLoading}
              startIcon={
                isSaving ? <CircularProgress size={20} color="inherit" /> : null
              }
            >
              {isSaving ? "Saving Changes..." : "Update Movie"}
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

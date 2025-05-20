import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, Grid, Card, CardContent, CardActions,
  Button, Box, CircularProgress, Alert, IconButton,
  Dialog, DialogActions, DialogTitle, DialogContentText, DialogContent,
  Snackbar,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  AddCircleOutline as AddIcon,
  MeetingRoom as MeetingRoomIcon,
} from '@mui/icons-material';
import roomService from '../../services/roomService';

export default function ListRoomsAdminPage() {
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const loadRooms = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await roomService.getRooms();
      console.log("ListRoomsAdminPage: Fetched rooms data:", data);
      setRooms(data || []);
    } catch (err) {
      console.error("ListRoomsAdminPage: Failed to fetch rooms:", err);
      setError(err.message || "Could not load rooms. Please try again.");
      setRooms([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  const handleEditRoom = useCallback((roomId) => {
    if (!roomId) return;
    navigate(`/rooms/edit/${roomId}`);
  }, [navigate]);

  const handleClickDelete = useCallback((room) => {
    if (!room || !room.id) return;
    setRoomToDelete(room);
    setOpenDeleteDialog(true);
  }, []);

  const handleCloseDeleteDialog = useCallback(() => {
    setOpenDeleteDialog(false);
    setRoomToDelete(null);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!roomToDelete || !roomToDelete.id) return;
    try {
      await roomService.deleteRoom(roomToDelete.id);
      setSnackbarMessage(`Room ${roomToDelete.roomNumber || roomToDelete.id} deleted successfully.`);
      setSnackbarOpen(true);
      loadRooms(); // Refresh the list
    } catch (err) {
      console.error("Failed to delete room:", err);
      setSnackbarMessage(err.message || "Failed to delete room.");
      setSnackbarOpen(true);
    } finally {
      handleCloseDeleteDialog();
    }
  }, [roomToDelete, loadRooms, handleCloseDeleteDialog]);

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 128px)' }}>
        <CircularProgress /> <Typography sx={{ ml: 2 }}>Loading Rooms...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <Alert severity="error">{error}</Alert>
        <Button variant="outlined" onClick={loadRooms} sx={{mt: 2}}>Try Again</Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4}}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Manage Cinema Rooms
        </Typography>
        <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/rooms/create')}
        >
            Add New Room
        </Button>
      </Box>

      {rooms.length === 0 && !isLoading && (
        <Box sx={{textAlign: 'center', mt: 5, p:3, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <MeetingRoomIcon sx={{fontSize: 80, color: 'text.disabled', mb: 2}} />
            <Typography variant="h6" color="text.secondary">No rooms configured yet.</Typography>
            <Typography color="text.secondary">Use the button above to add a new room.</Typography>
        </Box>
      )}

      <Grid container spacing={3}>
        {rooms.map((room) => (
          <Grid item key={room.id} xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', boxShadow: 2 }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="div" sx={{fontWeight: 'medium'}}>
                  Room {room.roomNumber}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Database ID: {room.id}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Movie ID Assigned: {room.movieId || 'None'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Dimensions: {room.totalRows || 'N/A'} Rows x {room.totalColumns || 'N/A'} Columns
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Seats: {room.totalSeats || (room.totalRows * room.totalColumns) || 'N/A'}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'flex-end', p:2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => handleEditRoom(room.id)}
                >
                  Edit
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => handleClickDelete(room)}
                >
                  Delete
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Delete Room</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete Room {roomToDelete?.roomNumber || roomToDelete?.id}?
            This action will also delete all associated seats and may affect related bookings. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus variant="contained">
            Confirm Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Container>
  );
}
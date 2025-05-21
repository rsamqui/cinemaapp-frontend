import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, Paper, Box, Button, Grid, CircularProgress, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,
  IconButton, Tooltip, Chip, Snackbar,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
} from '@mui/material';
import {
  Edit as EditIcon, Delete as DeleteIcon, AddCircleOutline as AddIcon,
  PersonAdd as PersonAddIcon, 
  AdminPanelSettings as AdminIcon,
  Person as ClientIcon,
} from '@mui/icons-material';
import userService from '../../services/userService';
import EditUserModal from '../../components/EditUserModal';

export default function ManageUsersPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentUserToEdit, setCurrentUserToEdit] = useState(null);

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await userService.getAllUsers();
      setUsers(data || []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError(err.message || "Could not load users. Please try again.");
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleOpenEditModal = (user) => {
    setCurrentUserToEdit(user);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setCurrentUserToEdit(null);
  };

  const handleUserUpdated = (updatedUser) => {
    setSnackbarMessage(`User "${updatedUser.name || updatedUser.email}" updated successfully.`);
    setSnackbarOpen(true);
    loadUsers();
  };

  const handleClickDelete = (user) => {
    setUserToDelete(user);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setUserToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await userService.deleteUserByAdmin(userToDelete.id);
      setSnackbarMessage(`User "${userToDelete.name || userToDelete.email}" deleted successfully.`);
      setSnackbarOpen(true);
      loadUsers();
    } catch (err) {
      console.error("Failed to delete user:", err);
      setSnackbarMessage(err.message || "Failed to delete user.");
      setSnackbarOpen(true);
    } finally {
      handleCloseDeleteDialog();
    }
  };

  const handleSnackbarClose = () => setSnackbarOpen(false);

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 128px)' }}>
        <CircularProgress /> <Typography sx={{ ml: 2 }}>Loading Users...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <Alert severity="error">{error}</Alert>
        <Button variant="outlined" onClick={loadUsers} sx={{mt: 2}}>Try Again</Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4}}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Manage Users
        </Typography>
        <Button variant="contained" startIcon={<PersonAddIcon />} onClick={() => navigate('/admin/create-user')}>
            Add New User
        </Button>
      </Box>

      {users.length === 0 && !isLoading && (
        <Box sx={{textAlign: 'center', mt: 5, p:3}}>
            <PeopleIcon sx={{fontSize: 80, color: 'text.disabled', mb: 2}} />
            <Typography variant="h6" color="text.secondary">No users found.</Typography>
        </Box>
      )}

      {users.length > 0 && (
        <Paper sx={{ width: '100%', overflow: 'hidden', boxShadow: 3 }}>
          <TableContainer>
            <Table stickyHeader aria-label="users table">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((user) => (
                    <TableRow hover key={user.id}>
                      <TableCell>{user.id}</TableCell>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip
                          icon={user.role === 'admin' ? <AdminIcon /> : <ClientIcon />}
                          label={user.role}
                          color={user.role === 'admin' ? 'secondary' : 'primary'}
                          size="small"
                          sx={{textTransform: 'capitalize'}}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit User">
                          <IconButton color="primary" onClick={() => handleOpenEditModal(user)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete User">
                          <IconButton color="error" onClick={() => handleClickDelete(user)}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={users.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      )}

      {currentUserToEdit && (
        <EditUserModal
          open={isEditModalOpen}
          onClose={handleCloseEditModal}
          user={currentUserToEdit}
          onUserUpdated={handleUserUpdated}
        />
      )}

      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Delete User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the user "{userToDelete?.name || userToDelete?.email}" (ID: {userToDelete?.id})?
            This action cannot be undone.
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
        open={snackbarOpen} autoHideDuration={4000} onClose={handleSnackbarClose}
        message={snackbarMessage} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Container>
  );
}

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from "@mui/material/styles";
import { darkTheme } from "./theme";
import ProtectedRoute from './constants/protectedRoute';
import MainLayout from './layouts/MainLayout';
import Home from './pages/home.jsx';
import Login from './pages/user/login.jsx';
import Register from './pages/user/register.jsx';
import AddMoviePage from './pages/movies/addMovie.jsx';
import SeatSelectionPage from './pages/bookings/seatSelection.jsx';
import CreateRoomPage from './pages/rooms/createRoom.jsx';
import EditRoomPage from './pages/rooms/editRoom.jsx';
import ListRoomsPage from './pages/movies/listMovies.jsx';
import MovieDetailPage from './pages/movies/movieDetails.jsx';
import CheckoutPage from './pages/bookings/checkoutPage.jsx';
import TicketPage from './pages/bookings/ticketPage.jsx';
import EditMoviePage from './pages/movies/editMovie.jsx';
import ListRoomsAdminPage from './pages/rooms/listRooms.jsx';
import ProfilePage from './pages/user/profilePage.jsx';
import ManageUsersPage from './pages/user/manageUsersPage.jsx';
import MyTicketsPage from './pages/user/myTicketsPage.jsx';

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <Router>
        <Routes>
          {/* Public Routes (No auth needed, no MainLayout) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Routes that use MainLayout */}
          <Route element={<MainLayout />}>
            {/* Public route within MainLayout */}
            <Route path="/" element={<Home />} />
        
            {/* Admin-only route, also within MainLayout */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/movies/add" element={<AddMoviePage />} />
              <Route path="/movies/edit/:movieId" element={<EditMoviePage />} />
              <Route path="/rooms" element={<ListRoomsAdminPage />} />
              <Route path="/rooms/create" element={<CreateRoomPage />} />
              <Route path="/rooms/edit/:roomId" element={<EditRoomPage />} />
              <Route path="/users" element={<ManageUsersPage />} />
              {/* You can add other admin routes here that need the MainLayout */}
            </Route>

            {/* Admin-only route, also within MainLayout */}
            <Route element={<ProtectedRoute allowedRoles={['client','admin']} />}>
              <Route path="/bookings/:roomId" element={<SeatSelectionPage />} />
              <Route path="/movies" element={<ListRoomsPage />} />
              <Route path="/movies/details/:movieId" element={<MovieDetailPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/bookings/ticket/:bookingId" element={<TicketPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/myickets" element={<MyTicketsPage />} />
            </Route>
            
          </Route>

        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
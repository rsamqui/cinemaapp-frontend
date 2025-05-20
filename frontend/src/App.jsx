import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from "@mui/material/styles";
import { darkTheme } from "./theme";
import ProtectedRoute from './constants/protectedRoute';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Login from './pages/user/Login';
import Register from './pages/user/Register';
import AddMovie from './pages/movies/addMovie';
import SeatSelectionPage from './pages/bookings/seatSelection';
import CreateRoomPage from './pages/rooms/createRoom';
import EditRoomPage from './pages/rooms/editRoom';
import ListRoomsPage from './pages/movies/listMovies';
import MovieDetailPage from './pages/movies/movieDetails';

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      {/* <CssBaseline /> */}
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
              <Route path="/movies/add" element={<AddMovie />} />
              <Route path="/rooms/create" element={<CreateRoomPage />} />
              <Route path="/rooms/edit/:roomId" element={<EditRoomPage />} />
              {/* You can add other admin routes here that need the MainLayout */}
            </Route>

            {/* Admin-only route, also within MainLayout */}
            <Route element={<ProtectedRoute allowedRoles={['client','admin']} />}>
              <Route path="/bookings" element={<SeatSelectionPage />} />
              <Route path="/movies" element={<ListRoomsPage />} />
              <Route path="/movies/details/:movieId" element={<MovieDetailPage />} />
            {/*  <Route path="/profile" element={<div>User Profile</div>} /> */}
            </Route>
            
          </Route>

        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
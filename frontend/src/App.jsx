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

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      {/* CssBaseline was removed in a previous step, ensure that was intentional
          or re-add it here if MUI components look odd without it.
          If Tailwind's preflight is your only base, that's fine.
      */}
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
              {/* You can add other admin routes here that need the MainLayout */}
            </Route>

            {/* Admin-only route, also within MainLayout */}
            <Route element={<ProtectedRoute allowedRoles={['client']} />}>
              <Route path="/bookings" element={<SeatSelectionPage />} />
              <Route path="/rooms" element={<CreateRoomPage />} />
            {/*  <Route path="/profile" element={<div>User Profile</div>} /> */}
            </Route>
            
          </Route>

        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
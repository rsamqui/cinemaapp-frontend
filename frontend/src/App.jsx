import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from "@mui/material/styles";
import { darkTheme } from "./theme";
import ProtectedRoute from './routes/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AddMovie from './pages/movies/addMovie';

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
              <Route path="/addMovie" element={<AddMovie />} />
              {/* You can add other admin routes here that need the MainLayout */}
            </Route>

            {/* Other authenticated user routes (not admin-specific) within MainLayout */}
            {/* <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<div>Dashboard</div>} />
              <Route path="/profile" element={<div>User Profile</div>} />
            </Route> */}
          </Route>

          {/* <Route path="*" element={<NotFoundPage />} /> */}
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
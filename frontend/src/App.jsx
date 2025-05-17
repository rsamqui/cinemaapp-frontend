import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from "@mui/material/styles";
import { darkTheme } from "./theme";
import MainLayout from './layouts/MainLayout';
import Home from './pages/home';
import Login from './pages/Login';

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <Router>
        <Routes>
          {/* Routes that should have the persistent Navbar */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
          </Route>

          {/* Routes that should NOT have the persistent Navbar (e.g., Login) */}
          <Route path="/login" element={<Login />} />
          {/* <Route path="*" element={<NotFoundPage />} /> */}
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
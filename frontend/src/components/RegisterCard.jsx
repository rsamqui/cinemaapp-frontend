// src/components/RegisterCard.jsx
import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom"; // Import RouterLink for internal navigation
import { useAuth } from "../contexts/AuthContext";
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  InputAdornment,
  IconButton,
  Link as MuiLink, // Renamed to avoid conflict
  Divider,
  // Checkbox, // Not typically needed for registration
  // FormControlLabel, // Not typically needed for registration
} from "@mui/material";
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Movie as MovieIcon,
  Person as PersonIcon, // Icon for Name
} from "@mui/icons-material";
import { ThemeProvider } from "@mui/material/styles";
import { darkTheme } from "../theme"; // Assuming this path is correct

function RegisterCard() {
  const { register } = useAuth(); // Use the register function from AuthContext
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [generalError, setGeneralError] = useState(""); // For general API errors

  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleClickShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

  const validateEmail = (emailValue) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(emailValue);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    // Reset errors
    setNameError("");
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");
    setGeneralError("");

    let isValid = true;

    if (!name.trim()) {
      setNameError("Name is required");
      isValid = false;
    }

    if (!email.trim()) {
      setEmailError("Email is required");
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      isValid = false;
    }

    if (!password) {
      setPasswordError("Password is required");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      isValid = false;
    }

    if (!confirmPassword) {
      setConfirmPasswordError("Please confirm your password");
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      isValid = false;
    }

    if (isValid) {
      console.log("Registration attempt with:", { name, email, password });
      try {
        await register({ name, email, password });
        console.log("Registration successful");
        navigate('/login', { state: { message: 'Registration successful! Please log in.' } });
      } catch (error) {
        console.error("Registration failed in component:", error);
        const errorMessage = error.message || error.error || "Registration failed. Please try again.";
        
        if (error.errors) {
          error.errors.forEach(err => {
            if (err.field === 'email') setEmailError(err.message);
            if (err.field === 'name') setNameError(err.message);
          });
        } else {
          setGeneralError(errorMessage);
        }
      }
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <Container component="main" maxWidth="sm">
        <Paper
          elevation={6}
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            borderRadius: 2,
            background: darkTheme.palette.background.paper,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
              <MovieIcon sx={{ color: "primary.main", fontSize: 40, mr: 1 }} />
              <Typography component="h1" variant="h4" sx={{ fontWeight: 700 }}>
                CinePlex
              </Typography>
            </Box>

            <Typography component="h2" variant="h6" sx={{ mb: 3, color: "text.secondary" }}>
              Create your CinePlex Account
            </Typography>

            {generalError && (
              <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                {generalError}
              </Typography>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }} noValidate>
              <TextField
                margin="normal"
                required
                fullWidth
                id="name"
                label="Full Name"
                name="name"
                autoComplete="name"
                autoFocus // Autofocus on the first field
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={!!nameError}
                helperText={nameError}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={!!emailError}
                helperText={emailError}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="new-password" // Use "new-password" for registration
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={!!passwordError}
                helperText={passwordError}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={!!confirmPasswordError}
                helperText={confirmPasswordError}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle confirm password visibility"
                        onClick={handleClickShowConfirmPassword}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {/* Removed "Remember me" and "Forgot password?" for registration form */}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                sx={{
                  mt: 3, // Adjusted margin
                  mb: 3,
                  py: 1.5,
                  fontSize: "1rem",
                  fontWeight: 700,
                }}
              >
                Sign Up
              </Button>

              <Divider sx={{ my: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  OR
                </Typography>
              </Divider>

              <Box sx={{ textAlign: "center", mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Already have an account?{" "}
                  <MuiLink component={RouterLink} to="/login" variant="body2" sx={{ color: "secondary.main", fontWeight: "medium", "&:hover": { textDecoration: "underline" } }}>
                    Sign In
                  </MuiLink>
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>

        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            &copy; {new Date().getFullYear()} CinePlex. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default RegisterCard;
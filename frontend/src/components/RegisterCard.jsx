import { useState } from "react";

import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  InputAdornment,
  IconButton,
  Link,
  Divider,
  Checkbox,
  FormControlLabel,
} from "@mui/material"
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Movie as MovieIcon,
} from "@mui/icons-material"
import { ThemeProvider } from "@mui/material/styles"
import { darkTheme } from "../theme";

function LoginCard() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [rememberMe, setRememberMe] = useState(false)

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword)
  }

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    // Reset errors
    setEmailError("")
    setPasswordError("")

    // Validate email
    if (!email) {
      setEmailError("Email is required")
    } else if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address")
    }

    // Validate password
    if (!password) {
      setPasswordError("Password is required")
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters")
    }

    // If validation passes
    if (email && validateEmail(email) && password && password.length >= 6) {
      console.log("Login attempt with:", { email, password, rememberMe })
      // Call your authentication API
    }
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <Container component="main" maxWidth="xs">
        <Paper
          elevation={6}
          sx={{
            p: 4,
            borderRadius: 2,
            background: "linear-gradient(to bottom, #1f1f1f, #141414)",
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
                CinePass
              </Typography>
            </Box>

            <Typography component="h2" variant="h6" sx={{ mb: 3 }}>
              Sign in to your account
            </Typography>

            <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
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
                autoComplete="current-password"
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
                      <IconButton aria-label="toggle password visibility" onClick={handleClickShowPassword} edge="end">
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      value="remember"
                      color="primary"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                  }
                  label="Remember me"
                />
                <Link href="#" variant="body2" sx={{ color: "secondary.main" }}>
                  Forgot password?
                </Link>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                sx={{
                  mt: 2,
                  mb: 3,
                  py: 1.5,
                  fontSize: "1rem",
                  "&:hover": {
                    backgroundColor: "#f40612",
                  },
                }}
              >
                Sign In
              </Button>

              <Divider sx={{ my: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  OR
                </Typography>
              </Divider>

              <Box sx={{ textAlign: "center", mt: 2 }}>
                <Typography variant="body2">
                  Don't have an account?{" "}
                  <Link href="#" variant="body2" sx={{ color: "secondary.main" }}>
                    Sign up now
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>

        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            &copy; {new Date().getFullYear()} CinePass. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </ThemeProvider>
  )
}

export default LoginCard;
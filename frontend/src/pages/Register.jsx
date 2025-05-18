import { Box } from "@mui/material";
import RegisterCard from "../components/RegisterCard";
import { useLocation } from "react-router-dom";
import Typography from "@mui/material/Typography";

export default function Register() {
  const location = useLocation();
  const message = location.state?.message;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default',
        py: 4,
      }}
    >
      {message && (
        <Typography color="success.main" sx={{ mb: 2 }}>
          {message}
        </Typography>
      )}
      <RegisterCard />
    </Box>
  );
}
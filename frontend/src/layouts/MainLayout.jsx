import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function MainLayout() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100%', minWidth: '100%' }}>
      <Header />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "background.default", 
        }}
      >
        <Outlet />
      </Box>
      <Footer />
    </Box>
  );
}
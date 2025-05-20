// src/pages/TicketPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import {
  Container,
  Typography,
  Paper,
  Box,
  CircularProgress,
  Alert,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
  // IconButton, // Not used in this version unless you add more actions
} from "@mui/material";
// Corrected import for qrcode.react using namespace import
import QRCode from "react-qr-code"; // <<< CHANGED IMPORT
import {
  Movie as MovieIcon,
  Theaters as TheatersIcon,
  EventSeat as EventSeatIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  ConfirmationNumber as ConfirmationNumberIcon,
  AttachMoney as AttachMoneyIcon,
  ArrowBack as ArrowBackIcon,
  Print as PrintIcon,
} from "@mui/icons-material";
import bookingService from "../../services/bookingService";

// Mock function (keep or replace with actual service call)
// eslint-disable-next-line no-unused-vars
const fetchMockTicketDetails = async (bookingId) => {
  console.log("Fetching mock ticket details for booking ID:", bookingId);
  await new Promise((resolve) => setTimeout(resolve, 700));
  if (bookingId === "undefined" || !bookingId)
    throw new Error("Invalid Booking ID for mock.");
  return {
    bookingId: bookingId,
    bookDate: new Date().toISOString(),
    totalPrice: 460,
    userName: "Ricardo Sam Qui",
    movieTitle: "Cosmic Adventure X",
    movieDuration: "145 min",
    roomNumber: 101,
    seats: [{ id: "C7" }, { id: "C8" }],
    qrCodeData: `https://yourcinema.com/verify-ticket?bookingId=${bookingId}`,
    bookingTransactionTime: new Date().toISOString(),
  };
};

export default function TicketPage() {
  const { bookingId } = useParams();
  // const navigate = useNavigate(); // Not used in this version, uncomment if needed
  const [ticketDetails, setTicketDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!bookingId) {
      setError("Booking ID is missing from URL.");
      setIsLoading(false);
      return;
    }
    const loadTicketDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await bookingService.getBookingDetailsForTicket(bookingId);
        // const data = await fetchMockTicketDetails(bookingId); // Use mock if service isn't ready
        if (!data) {
          throw new Error(
            "Ticket details not found or invalid response from API."
          );
        }
        setTicketDetails(data);
      } catch (err) {
        console.error("Failed to load ticket details:", err);
        setError(
          err.message ||
            "Could not load your ticket details. Please try again or contact support."
        );
      } finally {
        setIsLoading(false);
      }
    };
    loadTicketDetails();
  }, [bookingId]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "calc(100vh - 128px)",
          p: 2,
        }}
      >
        <CircularProgress size={50} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading Your E-Ticket...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4, textAlign: "center" }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          component={RouterLink}
          to="/"
          variant="outlined"
          startIcon={<ArrowBackIcon />}
        >
          Back to Home
        </Button>
      </Container>
    );
  }

  if (!ticketDetails) {
    return (
      <Container sx={{ py: 4, textAlign: "center" }}>
        <Typography variant="h5">Ticket information not found.</Typography>
        <Button
          component={RouterLink}
          to="/"
          variant="outlined"
          startIcon={<ArrowBackIcon />}
        >
          Back to Home
        </Button>
      </Container>
    );
  }

  const fixedShowtime = "07:00 PM"; // Example, make this dynamic if needed
  const displayShowDateTime = ticketDetails.showDate
    ? `${new Date(ticketDetails.showDate + "T00:00:00").toLocaleDateString(
        undefined,
        { weekday: "long", year: "numeric", month: "long", day: "numeric" }
      )} - ${fixedShowtime}`
    : "Date/Time N/A";

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 2, md: 4 } }}>
      <Paper
        elevation={6}
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          borderRadius: "8px",
          backgroundColor: "background.paper",
        }}
      >
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <ConfirmationNumberIcon
            sx={{ fontSize: 60, color: "primary.main", mb: 1 }}
          />
          <Typography
            variant="h4"
            component="h1"
            sx={{ fontWeight: "bold", color: "primary.dark" }}
          >
            Your E-Ticket
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Booking ID: <strong>{ticketDetails.bookingId}</strong>
          </Typography>
        </Box>
        <Divider sx={{ my: 2.5 }} />

        <Grid container spacing={2.5}>
          <Grid item xs={12} md={7}>
            <Typography
              variant="h5"
              gutterBottom
              sx={{ fontWeight: 500, color: "text.primary", mb: 1.5 }}
            >
              {ticketDetails.movieTitle || "Movie Title N/A"}
            </Typography>
            <List dense disablePadding>
              <ListItem disableGutters>
                <ListItemIcon sx={{ minWidth: 38 }}>
                  <PersonIcon color="action" />
                </ListItemIcon>
                <ListItemText
                  primary="Booked For"
                  secondary={ticketDetails.userName || "N/A"}
                  primaryTypographyProps={{ fontWeight: "medium" }}
                />
              </ListItem>
              <ListItem disableGutters>
                <ListItemIcon sx={{ minWidth: 38 }}>
                  <CalendarIcon color="action" />
                </ListItemIcon>
                <ListItemText
                  primary="Show Date & Time"
                  secondary={displayShowDateTime}
                  primaryTypographyProps={{ fontWeight: "medium" }}
                />
              </ListItem>
              <ListItem disableGutters>
                <ListItemIcon sx={{ minWidth: 38 }}>
                  <TheatersIcon color="action" />
                </ListItemIcon>
                <ListItemText
                  primary="Room"
                  secondary={ticketDetails.roomNumber || "N/A"}
                  primaryTypographyProps={{ fontWeight: "medium" }}
                />
              </ListItem>
              <ListItem disableGutters>
                <ListItemIcon sx={{ minWidth: 38 }}>
                  <EventSeatIcon color="action" />
                </ListItemIcon>
                <ListItemText
                  primary="Seats"
                  secondary={
                    ticketDetails.seats && ticketDetails.seats.length > 0
                      ? ticketDetails.seats.map((s) => s.id).join(", ")
                      : "N/A"
                  }
                  primaryTypographyProps={{ fontWeight: "medium" }}
                />
              </ListItem>
              <ListItem disableGutters>
                <ListItemIcon sx={{ minWidth: 38 }}>
                  <AttachMoneyIcon color="action" />
                </ListItemIcon>
                <ListItemText
                  primary="Total Paid"
                  secondary={
                    ticketDetails.totalPrice !== undefined
                      ? new Intl.NumberFormat("es-NI", {
                          style: "currency",
                          currency: "NIO",
                        }).format(ticketDetails.totalPrice)
                      : "N/A"
                  }
                  primaryTypographyProps={{ fontWeight: "medium" }}
                />
              </ListItem>
              <ListItem disableGutters>
                <ListItemIcon sx={{ minWidth: 38 }}>
                  <CalendarIcon fontSize="small" color="action" />
                </ListItemIcon>
                <ListItemText
                  primary="Booked On"
                  secondary={
                    ticketDetails.bookingTransactionTime
                      ? new Date(
                          ticketDetails.bookingTransactionTime
                        ).toLocaleString()
                      : "N/A"
                  }
                  primaryTypographyProps={{
                    fontSize: "0.8rem",
                    fontWeight: "medium",
                  }}
                  secondaryTypographyProps={{ fontSize: "0.8rem" }}
                />
              </ListItem>
            </List>
          </Grid>
          <Grid
            item
            xs={12}
            md={5}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              mt: { xs: 3, md: 0 },
            }}
          >
            <Typography
              variant="overline"
              display="block"
              gutterBottom
              align="center"
            >
              Scan at Entry
            </Typography>
            <Box
              sx={{
                p: 1,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                backgroundColor: "white",
                display: "inline-block",
                boxShadow: 1,
              }}
            >
              {/* Using the namespace import */}
              <QRCode
                value={
                  ticketDetails.qrCodeData ||
                  `BookingID:${ticketDetails.bookingId}`
                }
                size={150} // Controls the pixel size of the QR code
                bgColor="#FFFFFF"
                fgColor="#000000"
                level="M" // Error correction level: L, M, Q, H
              />
            </Box>
          </Grid>
        </Grid>

        <Box
          sx={{
            mt: 4,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Button
            component={RouterLink}
            to="/movies"
            variant="outlined"
            startIcon={<ArrowBackIcon />}
          >
            Back to Movies
          </Button>
          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
          >
            Print Ticket
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

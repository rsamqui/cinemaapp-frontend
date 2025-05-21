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
} from "@mui/material";
import QRCode from "react-qr-code";
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

export default function TicketPage() {
  const { bookingId } = useParams();
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

  const fixedShowtime = "07:00 PM";
  const displayShowDateTime = `${ticketDetails.showDate} - ${fixedShowtime}`;

  return (
    <>
      <style type="text/css" media="print">
        {`
          @media print {
            body, html {
              margin: 0;
              padding: 0;
              width: 100%;
              height: 100%;
              background-color: #fff; /* Ensure background is white for printing */
            }
            body * {
              visibility: hidden;
              box-shadow: none !important;
              border: none !important; /* Reset borders for non-printed items */
            }
            #printable-ticket, #printable-ticket * {
              visibility: visible;
            }
            #printable-ticket {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%; /* Make ticket take full width of printable area */
              margin: 0;
              padding: 20px; /* Add some padding for the printed ticket */
              box-shadow: none !important;
              border: 1px solid #555 !important; /* Optional: Add a border to the ticket when printed */
              border-radius: 0 !important; /* Optional: Remove border-radius for print */
              background-color: #fff !important; /* Ensure ticket background is white */
              page-break-inside: avoid; /* Try to avoid breaking the ticket across pages */
            }
            #printable-ticket .MuiPaper-root { /* Target MUI paper specifically if needed */
                background-color: #fff !important;
                color: #000 !important;
            }
            #printable-ticket .MuiTypography-root,
            #printable-ticket .MuiListItemText-primary,
            #printable-ticket .MuiListItemText-secondary,
            #printable-ticket .MuiListItemIcon-root .MuiSvgIcon-root {
                color: #000 !important; /* Ensure text and icons are black for printing */
                -webkit-print-color-adjust: exact; /* Ensure colors print correctly in WebKit browsers */
                color-adjust: exact; /* Standard property for color adjustment */
            }
            #printable-ticket .MuiDivider-root {
                border-color: #000 !important;
            }
            #printable-ticket .qr-code-container { /* Style the QR code container for print */
                border: 1px solid #000 !important; /* Ensure QR code border is visible if it's on a Box */
                padding: 8px !important; /* Adjust if you have a specific container for QR */
                background-color: #fff !important;
            }
            #printable-ticket .qr-code-container svg { /* Ensure QR code SVG itself is styled if needed */
                display: block;
                margin: auto;
            }
            .no-print {
              display: none !important;
            }
          }
        `}
      </style>

      <Container maxWidth="sm" sx={{ py: { xs: 2, md: 4 } }}>
        <Paper
          id="printable-ticket"
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
              Your Cinplex E-Ticket
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
                className="qr-code-container"
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
                <QRCode
                  value={
                    ticketDetails.qrCodeData ||
                    `BookingID:${ticketDetails.bookingId}`
                  }
                  size={150}
                  bgColor="#FFFFFF"
                  fgColor="#000000"
                  level="M"
                />
              </Box>
            </Grid>
          </Grid>
        </Paper>

        <Box
          className="no-print"
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
      </Container>
    </>
  );
}
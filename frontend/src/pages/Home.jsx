import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Container,
  Divider,
  Grid,
  IconButton,
  Link, 
  Typography,
} from "@mui/material";
import {
  PlayArrow as PlayArrowIcon,
  Star as StarIcon,
  CalendarMonth as CalendarIcon,
  LocationOn as LocationOnIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
} from "@mui/icons-material";

// Sample movie data (keep this or fetch it as needed)
const featuredMovie = {
  id: 1,
  title: "Dune: Part Two",
  image: "/placeholder.svg?height=600&width=1200",
  rating: 4.8,
  duration: "166 min",
  genre: "Sci-Fi, Adventure",
  description:
    "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
};

const nowShowingMovies = [
  { id: 1, title: "Dune: Part Two", image: "/placeholder.svg?height=400&width=300", rating: 4.8 },
  { id: 2, title: "Poor Things", image: "/placeholder.svg?height=400&width=300", rating: 4.5 },
  { id: 3, title: "Kung Fu Panda 4", image: "/placeholder.svg?height=400&width=300", rating: 4.2 },
  { id: 4, title: "Godzilla x Kong", image: "/placeholder.svg?height=400&width=300", rating: 4.0 },
];

const comingSoonMovies = [
  { id: 5, title: "Furiosa", image: "/placeholder.svg?height=400&width=300", releaseDate: "May 24, 2024" },
  { id: 6, title: "Inside Out 2", image: "/placeholder.svg?height=400&width=300", releaseDate: "June 14, 2024" },
  { id: 7, title: "A Quiet Place: Day One", image: "/placeholder.svg?height=400&width=300", releaseDate: "June 28, 2024" },
  { id: 8, title: "Deadpool & Wolverine", image: "/placeholder.svg?height=400&width=300", releaseDate: "July 26, 2024" },
];

export default function Home() {

  return (
    <>
      {/* Hero Section */}
      <Box
        sx={{
          position: "relative",
          height: { xs: "70vh", md: "90vh" },
          display: "flex",
          alignItems: "center",
          backgroundImage: `linear-gradient(to top, rgba(20, 20, 20, 1) 0%, rgba(20, 20, 20, 0.7) 50%, rgba(20, 20, 20, 0.4) 100%), url(${featuredMovie.image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Container maxWidth={false} /* or your previous setting */ >
          <Grid container spacing={2}>
            <Grid item xs={12} md={8} lg={6}>
              <Box sx={{ mt: { xs: 8, md: 0 } /* Adjust mt if needed due to fixed AppBar */ }}>
                <Typography
                  variant="overline"
                  sx={{ color: "secondary.main", fontWeight: 600 }}
                >
                  Featured Movie
                </Typography>
                <Typography
                  variant="h2"
                  component="h1"
                  sx={{
                    fontWeight: 800,
                    mb: 2,
                    fontSize: { xs: "2.5rem", md: "3.5rem" },
                  }}
                >
                  {featuredMovie.title}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                    mb: 3,
                    flexWrap: "wrap",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <StarIcon
                      sx={{ color: "secondary.main", mr: 0.5 }}
                      fontSize="small"
                    />
                    <Typography variant="body1">
                      {featuredMovie.rating}/5
                    </Typography>
                  </Box>
                  <Typography variant="body1">
                    {featuredMovie.duration}
                  </Typography>
                  <Typography variant="body1">
                    {featuredMovie.genre}
                  </Typography>
                </Box>
                <Typography
                  variant="body1"
                  sx={{ mb: 4, maxWidth: "600px", opacity: 0.9 }}
                >
                  {featuredMovie.description}
                </Typography>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={<PlayArrowIcon />}
                    sx={{ px: 4, py: 1.5 }}
                  >
                    Watch Trailer
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    size="large"
                    sx={{ px: 4, py: 1.5 }}
                  >
                    Book Tickets
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Now Showing Section */}
      <Container maxWidth={false} /* or your previous setting */ sx={{ py: 6 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Typography variant="h4" component="h2" sx={{ fontWeight: 700 }}>
            Now Showing
          </Typography>
          <Button color="secondary" endIcon={<PlayArrowIcon />}>
            View All
          </Button>
        </Box>
        <Grid container spacing={3}>
          {nowShowingMovies.map((movie) => (
            <Grid item xs={6} sm={4} md={3} key={movie.id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  bgcolor: "background.paper",
                  transition: "transform 0.2s",
                  "&:hover": { transform: "scale(1.03)" },
                }}
              >
                <CardActionArea>
                  <CardMedia
                    component="img"
                    height="350"
                    image={movie.image}
                    alt={movie.title}
                  />
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1,
                      }}
                    >
                      <Typography gutterBottom variant="h6" component="div" noWrap>
                        {movie.title}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <StarIcon sx={{ color: "secondary.main", mr: 0.5 }} fontSize="small"/>
                        <Typography variant="body2">{movie.rating}</Typography>
                      </Box>
                    </Box>
                    <Button variant="contained" color="primary" fullWidth size="small">
                      Book Now
                    </Button>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Coming Soon Section */}
      <Box sx={{ bgcolor: "background.paper", py: 8 }}>
        <Container maxWidth={false} /* or your previous setting */>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 4,
            }}
          >
            <Typography variant="h4" component="h2" sx={{ fontWeight: 700 }}>
              Coming Soon
            </Typography>
            <Button color="secondary" endIcon={<CalendarIcon />}>
              View Schedule
            </Button>
          </Box>
          <Grid container spacing={3}>
            {comingSoonMovies.map((movie) => (
              <Grid item xs={6} sm={4} md={3} key={movie.id}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    bgcolor: "#252525",
                    transition: "transform 0.2s",
                    "&:hover": { transform: "scale(1.03)" },
                  }}
                >
                  <CardActionArea>
                    <CardMedia
                      component="img"
                      height="350"
                      image={movie.image}
                      alt={movie.title}
                    />
                    <CardContent>
                      <Typography gutterBottom variant="h6" component="div" noWrap>
                        {movie.title}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                        <CalendarIcon sx={{ color: "primary.main", mr: 1 }} fontSize="small"/>
                        <Typography variant="body2" color="text.secondary">
                          {movie.releaseDate}
                        </Typography>
                      </Box>
                      <Button variant="outlined" color="secondary" fullWidth size="small">
                        Remind Me
                      </Button>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          bgcolor: "#0a0a0a",
          color: "text.secondary",
          py: 6,
          borderTop: "1px solid #333",
        }}
      >
        <Container maxWidth={false} /* or your previous "lg" / false setting */ >
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                {/* <MovieIcon sx={{ color: "primary.main", fontSize: 40, mr: 1 }} /> Re-add if you want logo here too */}
                <Typography variant="h5" component="div" sx={{ fontWeight: 700, color: "white" }}>
                  CinePass
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Your premier destination for the latest blockbusters and
                timeless classics. Experience cinema like never before.
              </Typography>
              <Box sx={{ display: "flex", gap: 2 }}>
                 {/* SVG Icons for social media */}
                <IconButton size="small" sx={{ color: "white" }}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" /></svg></IconButton>
                <IconButton size="small" sx={{ color: "white" }}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" /></svg></IconButton>
                <IconButton size="small" sx={{ color: "white" }}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg></IconButton>
              </Box>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: "white" }}>
                Quick Links
              </Typography>
              <Box component="ul" sx={{ p: 0, m: 0, listStyle: "none", lineHeight: 2 }}>
                <Box component="li"><Link href="#" color="inherit" underline="hover">Movies</Link></Box>
                <Box component="li"><Link href="#" color="inherit" underline="hover">Cinemas</Link></Box>
                <Box component="li"><Link href="#" color="inherit" underline="hover">Offers & Promotions</Link></Box>
                <Box component="li"><Link href="#" color="inherit" underline="hover">Gift Cards</Link></Box>
              </Box>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: "white" }}>
                Information
              </Typography>
              <Box component="ul" sx={{ p: 0, m: 0, listStyle: "none", lineHeight: 2 }}>
                <Box component="li"><Link href="#" color="inherit" underline="hover">About Us</Link></Box>
                <Box component="li"><Link href="#" color="inherit" underline="hover">Careers</Link></Box>
                <Box component="li"><Link href="#" color="inherit" underline="hover">Terms of Service</Link></Box>
                <Box component="li"><Link href="#" color="inherit" underline="hover">Privacy Policy</Link></Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: "white" }}>
                Contact Us
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <LocationOnIcon fontSize="small" sx={{ mr: 1, color: "primary.main" }}/>
                  <Typography variant="body2">123 Cinema Street, Movie City, MC 12345</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <PhoneIcon fontSize="small" sx={{ mr: 1, color: "primary.main" }}/>
                  <Typography variant="body2">+1 (555) 123-4567</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <EmailIcon fontSize="small" sx={{ mr: 1, color: "primary.main" }}/>
                  <Typography variant="body2">info@cinepass.com</Typography>
                </Box>
              </Box>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Subscribe to our newsletter for updates and exclusive offers
              </Typography>
              <Box component="form" sx={{ display: "flex", gap: 1 }}>
                <input type="email" placeholder="Your email" style={{ flex: 1, padding: "10px 12px", backgroundColor: "#333", border: "none", borderRadius: "4px", color: "white" }}/>
                <Button variant="contained" color="primary" type="submit">
                  Subscribe
                </Button>
              </Box>
            </Grid>
          </Grid>
          <Divider sx={{ my: 4, borderColor: "#333" }} />
          <Typography variant="body2" align="center" sx={{ pt: 2, opacity: 0.7 }}>
            &copy; {new Date().getFullYear()} CinePass. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </>
  );
}
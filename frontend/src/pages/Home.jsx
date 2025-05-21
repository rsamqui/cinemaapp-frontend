import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Container,
  Grid,
  Typography,
  CardActions,
} from "@mui/material";
import {
  PlayArrow as PlayArrowIcon,
  Star as StarIcon,
  CalendarMonth as CalendarIcon,
  LocationOn as LocationOnIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
} from "@mui/icons-material";
import { Link as RouterLink } from 'react-router-dom';

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


export default function Home() {
  const handleWatchTrailer = (movieId) => {
    console.log("Watch trailer for movie ID:", movieId);
  };

  const handleBookTickets = (movieId) => {
    console.log("Book tickets for movie ID:", movieId);
  };

  return (
    <>
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
        <Container maxWidth={false} >
          <Grid container spacing={2}>
            <Grid item xs={12} md={8} lg={6}>
              <Box sx={{ mt: { xs: 8, md: 0 } }}>
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
                    onClick={() => handleWatchTrailer(featuredMovie.id)}
                  >
                    Watch Trailer
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    size="large"
                    sx={{ px: 4, py: 1.5 }}
                    onClick={() => handleBookTickets(featuredMovie.id)}
                  >
                    Book Tickets
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth={false} sx={{ py: 6 }}>
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
          <Button component={RouterLink} to="/movies/now-showing" color="secondary" endIcon={<PlayArrowIcon />}>
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
                  justifyContent: 'space-between',
                  bgcolor: "background.paper",
                  transition: "transform 0.2s",
                  "&:hover": { transform: "scale(1.03)" },
                }}
              >
                <Box component={RouterLink} to={`/movies/${movie.id}`} sx={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <CardMedia
                    component="img"
                    height="350"
                    image={movie.image}
                    alt={movie.title}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1,
                      }}
                    >
                      <Typography gutterBottom variant="h6" component="div" noWrap sx={{fontSize: '1rem'}}>
                        {movie.title}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", ml: 1 }}>
                        <StarIcon sx={{ color: "secondary.main", mr: 0.5 }} fontSize="small"/>
                        <Typography variant="body2">{movie.rating}</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Box>
                <CardActions sx={{ justifyContent: 'center', p: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    size="small"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleBookTickets(movie.id);
                    }}
                  >
                    Book Now
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </>
  );
}
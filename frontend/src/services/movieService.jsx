import apiClient from './api';

const getMovies = async () => {
  try {
    const response = await apiClient.get('/movies'); // Endpoint to get all movies
    return response.data || [];
  } catch (error) {
    console.error("Error fetching all movies:", error.response?.data || error.message);
    throw error.response?.data || new Error(`Failed to fetch movies: ${error.message}`);
  }
};

const getNowShowing = async () => {
  try {
    const response = await apiClient.get('/movies/now-showing');
    return response.data || [];
  } catch (error) {
    console.error("Error fetching now showing movies:", error.response?.data || error.message);
    throw error.response?.data || new Error("Failed to fetch now showing movies");
  }
}

const getMovieScreeningDetails = async (movieId) => {
  try {
    const response = await apiClient.get(`/movies/details/${movieId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching details for movie ${movieId}:`, error.response?.data || error.message);
    throw error.response?.data || new Error(`Failed to fetch movie details: ${error.message}`);
  }
};

const getAvailableMovies = async (roomId = null) => {
  try {
    let endpoint = '/movies/available';
    if (roomId) {
      console.log(`Workspaceing available movies, context roomId: ${roomId}`);
    }
    const response = await apiClient.get(endpoint);
    return response.data || [];
  } catch (error) {
    console.error("Error fetching available movies:", error.response?.data || error.message);
    throw error.response?.data || new Error(`Failed to fetch available movies: ${error.message}`);
  }
};

const createNewMovie = async (roomData) => {
  try {
    const response = await apiClient.post('/newRoom', roomData);
    return response.data;
  } catch (error) {
    console.error("Error creating new room:", error.response?.data || error.message);
    throw error.response?.data || new Error("Failed to create new room");
  }
};



export default {
    createNewMovie,
    getMovieScreeningDetails,
    getNowShowing,
    getAvailableMovies,
    getMovies,
};

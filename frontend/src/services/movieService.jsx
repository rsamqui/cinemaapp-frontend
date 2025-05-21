import apiClient from './api';

const getMovies = async () => {
  try {
    const response = await apiClient.get('/movies');
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

const getMovieById = async (movieId) => {
  try {
    const response = await apiClient.get(`/movies/${movieId}`); 
    console.log(`movieService.getMovieById - Response for movie ${movieId}:`, response); 
    if (response && response.data) {
        return response.data;
    } else {
        console.warn(`movieService.getMovieById - No data in response for movie ${movieId}, status: ${response?.status}`);
        return null; 
    }
  } catch (error) {
    console.error(`movieService.getMovieById - Error fetching movie ${movieId}:`, error.response?.data || error.message);
    throw error.response?.data || new Error(`Failed to fetch movie ${movieId}: ${error.message}`);
  }
};

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

const addMovie = async (movieData) => {
  try {
    const response = await apiClient.post('/movies/new', movieData);
    return response.data;
  } catch (error) {
    console.error("Error adding new movie:", error.response?.data || error.message);
    const errData = error.response?.data || { message: "Failed to add new movie." };
    if (typeof errData === 'string') { 
        throw new Error(errData);
    }
    throw errData;
  }
};

const updateMovie = async (movieId, movieData) => {
  try {
    const response = await apiClient.put(`/movies/${movieId}`, movieData);
    return response.data;
  } catch (error) {
    console.error(`Error updating movie ${movieId}:`, error.response?.data || error.message);
    const errData = error.response?.data || { message: `Failed to update movie ${movieId}: ${error.message}` };
    if (typeof errData === 'string') {
        throw new Error(errData);
    }
    throw errData;
  }
};

const deleteMovie = async (movieId) => {
  try {
    const response = await apiClient.delete(`/movies/${movieId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting movie ${movieId}:`, error.response?.data || error.message);
    throw error.response?.data || new Error(`Failed to delete movie: ${error.message}`);
  }
};

export default {
    addMovie,
    updateMovie,
    deleteMovie,
    getMovieById,
    getMovieScreeningDetails,
    getNowShowing,
    getAvailableMovies,
    getMovies,
};

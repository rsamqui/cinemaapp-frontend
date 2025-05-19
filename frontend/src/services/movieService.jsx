import apiClient from './api';

const getMovies = async () => {
  try {
    const response = await apiClient.get('/movies');
    return response.data;
  } catch (error) {
    console.error("Error fetching movies:", error.response?.data || error.message);
    throw error.response?.data || new Error("Failed to fetch movies");
  }
}

const createNewMovie = async (roomData) => {
  try {
    const response = await apiClient.post('/newRoom', roomData);
    return response.data;
  } catch (error) {
    console.error("Error creating new room:", error.response?.data || error.message);
    throw error.response?.data || new Error("Failed to create new room");
  }
};

// You might have other room-related functions here
// const getRoomLayout = async (roomId) => { ... };
// const updateRoomLayout = async (roomId, layoutData) => { ... };

export default {
    createNewMovie,
    getMovies,
};

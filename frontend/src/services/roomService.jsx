import apiClient from './api';

const getRooms = async () => {
  try {
    const response = await apiClient.get('/rooms');
    return response.data;
  } catch (error) {
    console.error("Error fetching rooms:", error.response?.data || error.message);
    throw error.response?.data || new Error("Failed to fetch rooms");
  }
}

const createNewRoom = async (roomData) => {
  try {
    console.log("roomService: Calling POST /rooms/newRoom with data:", roomData);
    const response = await apiClient.post('/rooms/newRoom', roomData);
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
    getRooms,
    createNewRoom,
};

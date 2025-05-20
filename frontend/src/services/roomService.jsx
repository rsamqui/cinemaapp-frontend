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

const getRoomById = async (roomId) => {
  try {
    console.log(`roomService: Calling GET /rooms with params: { id: ${roomId} }`);
    const response = await apiClient.get('/rooms', {
      params: {
        id: roomId,
      },
    });
    console.log(`roomService: Response status for room ${roomId}: ${response.status}`);
    console.log(`roomService: Response data for room ${roomId}:`, JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error(`Error fetching room with id=${roomId}:`, error.response?.data || error.message);
    const errData = error.response?.data || { message: `Failed to fetch room ${roomId}` };
    if (typeof errData === 'string') {
        throw new Error(errData);
    }
    throw errData;
  }
};

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

const updateRoom = async (roomId, roomData) => {
  try {
    const response = await apiClient.put(`/rooms/${roomId}`, roomData);
    return response.data;
  } catch (error) {
    console.error(`Error updating room ${roomId}:`, error.response?.data || error.message);
    const errData = error.response?.data || { message: `Failed to update room ${roomId}: ${error.message}` };
    if (typeof errData === 'string') {
        throw new Error(errData);
    }
    throw errData;
  }
};

const deleteRoom = async (roomId) => {
  try {
    const response = await apiClient.delete(`/rooms/${roomId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting room ${roomId}:`, error.response?.data || error.message);
    throw error.response?.data || new Error(`Failed to delete room ${roomId}`);
  }
};

export default {
    getRooms,
    getRoomById,
    createNewRoom,
    updateRoom,
    deleteRoom
};

import apiClient from './api'; 

const getMyProfile = async () => {
  try {
    const response = await apiClient.get('/users/details/:userId');
    return response.data;
  } catch (error) {
    console.error("Error fetching user profile:", error.response?.data || error.message);
    throw error.response?.data || new Error("Failed to fetch profile.");
  }
};


const updateUserProfile = async (profileData) => {
  try {
    const response = await apiClient.put('/users/:userId', profileData);
    return response.data; 
  } catch (error) {
    console.error("Error updating user profile:", error.response?.data || error.message);
    const errData = error.response?.data || { message: "Failed to update profile." };
    if (typeof errData === 'string') throw new Error(errData);
    throw errData;
  }
};

const getAllUsers = async () => {
  try {
    const response = await apiClient.get('/users');
    return response.data || [];
  } catch (error) {
    console.error("Error fetching all users:", error.response?.data || error.message);
    throw error.response?.data || new Error(`Failed to fetch users: ${error.message}`);
  }
};

const updateUserByAdmin = async (userId, userData) => {
  try {
    const response = await apiClient.put(`/users/edit/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error(`Error updating user ${userId}:`, error.response?.data || error.message);
    const errData = error.response?.data || { message: `Failed to update user ${userId}` };
    if (typeof errData === 'string') throw new Error(errData);
    throw errData;
  }
};

const deleteUserByAdmin = async (userId) => {
  try {
    const response = await apiClient.delete(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting user ${userId}:`, error.response?.data || error.message);
    const errData = error.response?.data || { message: `Failed to delete user ${userId}` };
    if (typeof errData === 'string') throw new Error(errData);
    throw errData;
  }
};

export default {
  getMyProfile,
  updateUserProfile,
  getAllUsers,
  updateUserByAdmin,
  deleteUserByAdmin
};

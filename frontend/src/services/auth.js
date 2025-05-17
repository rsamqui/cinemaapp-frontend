import apiClient from './api';

const login = async (credentials) => {
  try {
    const response = await apiClient.post('/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      // Optionally store user info too, or fetch it separately
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
    }
    return response.data;
  } catch (error) {
    // Handle or throw error to be caught by the component
    console.error("Login error:", error.response?.data || error.message);
    throw error.response?.data || new Error("Login failed");
  }
};

const register = async (userData) => {
  try {
    const response = await apiClient.post('/register', userData);
    // Assuming backend might automatically log in user or just return a success message
    return response.data;
  } catch (error) {
    console.error("Registration error:", error.response?.data || error.message);
    throw error.response?.data || new Error("Registration failed");
  }
};

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (e) {
      console.error("Error parsing user from localStorage", e);
      localStorage.removeItem('user'); // Clear corrupted data
      return null;
    }
  }
  return null;
};

const getToken = () => {
  return localStorage.getItem('token');
};

export default {
  login,
  register,
  logout,
  getCurrentUser,
  getToken,
};
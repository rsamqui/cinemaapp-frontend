import apiClient from './api';

const createBooking = async (bookingData) => {
  try {
    
    const response = await apiClient.post('/bookings/bookSeats', bookingData);
    return response.data;
  } catch (error) {
    console.error("Error creating booking:", error.response?.data || error.message);
    const errData = error.response?.data || { message: "Booking creation failed." };
    if (typeof errData === 'string') {
        throw new Error(errData);
    }
    throw errData;
  }
};

const getBookingDetailsForTicket = async (bookingId) => {
    try {
        const response = await apiClient.get(`/bookings/ticket/${bookingId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching booking details for ticket ${bookingId}:`, error.response?.data || error.message);
        const errData = error.response?.data || { message: "Failed to fetch booking details." };
        if (typeof errData === 'string') throw new Error(errData);
        throw errData;
    }
};

const getMyBookings = async (userId) => {
  try {
    const response = await apiClient.get(`/bookings/ticket/${userId}`);
    return response.data || [];
  } catch (error) {
    console.error("Error fetching user's tickets:", error.response?.data || error.message);
    throw error.response?.data || new Error("Failed to fetch your bookings.");
  }
};

export default {
  getMyBookings,
  createBooking,
  getBookingDetailsForTicket,
};

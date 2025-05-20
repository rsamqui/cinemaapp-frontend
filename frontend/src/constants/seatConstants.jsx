export const SEAT_STATUS = {
  AVAILABLE: 'available',
  SELECTED: 'selected',      // For user selection during booking
  RESERVED: 'reserved',      // Temporarily held (e.g., by another user, or for VIPs)
  TAKEN: 'taken',      // Already booked and paid
};

export const SEAT_COLORS = {
  [SEAT_STATUS.AVAILABLE]: { backgroundColor: '#4caf50', color: 'white', borderColor: '#388e3c' },
  [SEAT_STATUS.SELECTED]: { backgroundColor: '#2196f3', color: 'white', borderColor: '#1976d2' },
  [SEAT_STATUS.RESERVED]: { backgroundColor: '#ffc107', color: 'black', borderColor: '#ffa000' }, // Gold/Yellow
  [SEAT_STATUS.TAKEN]: { backgroundColor: '#f44336', color: 'white', borderColor: '#d32f2f', cursor: 'not-allowed' }, // Red
};
// src/components/Seat.jsx
import React from 'react';
import { Button, Tooltip } from '@mui/material';
import { SEAT_STATUS, SEAT_COLORS } from '../constants/seatConstants';

const Seat = ({ id, status, label, onClick, disabled }) => {
  let statusStyle = SEAT_COLORS[status];

  if (!statusStyle) {
    console.warn(`Seat.jsx: No specific style for status "${status}" (ID: ${id}). Falling back to BLOCKED.`);
    statusStyle = SEAT_COLORS[SEAT_STATUS.BLOCKED];
  }
  if (!statusStyle) { // Absolute fallback if SEAT_COLORS[SEAT_STATUS.BLOCKED] is also missing
    statusStyle = { backgroundColor: 'grey', color: 'white', borderColor: 'darkgrey', cursor: 'not-allowed' };
  }

  const finalSx = {
    minWidth: '35px',
    height: '35px',
    p: 0,
    fontSize: '0.7rem',
    // Apply all properties from statusStyle directly
    color: statusStyle.color,
    backgroundColor: statusStyle.backgroundColor,
    borderColor: statusStyle.borderColor, // This will be used by the 'border' property below
    border: `1px solid ${statusStyle.borderColor || 'transparent'}`, // Ensure border is visible
    cursor: statusStyle.cursor || 'pointer',

    // Crucial: Override hover state for contained buttons to prevent MUI theme hover colors
    // from taking over if we want to maintain our status-specific background.
    '&:hover': {
      backgroundColor: statusStyle.backgroundColor, // Keep the same background on hover
      // You can add a slight change for hover if desired, e.g., darken or lighten
      // filter: 'brightness(90%)', // Example: darken slightly
      opacity: (status === SEAT_STATUS.AVAILABLE || status === SEAT_STATUS.SELECTED) && !disabled ? 0.85 : 1,
    },
    // For contained buttons, MUI might apply a different background for disabled state.
    // You might need to explicitly style the disabled state too if it's not looking right.
    '&.Mui-disabled': {
        backgroundColor: statusStyle.backgroundColor, // Keep status color even when disabled
        color: statusStyle.color, // Keep status text color
        opacity: 0.6, // Example: make it look more faded for disabled
        borderColor: statusStyle.borderColor,
    }
  };

  return (
    <Tooltip title={`Seat ${id} - ${status || 'unknown'}`} placement="top">
      <span>
        <Button
          fullWidth
          variant="contained" // Keep this for the button's general shape and elevation
          sx={finalSx}
          onClick={onClick}
          disabled={disabled}
          aria-label={`Seat ${id}, status: ${status || 'unknown'}`}
        >
          {label}
        </Button>
      </span>
    </Tooltip>
  );
};

export default React.memo(Seat);
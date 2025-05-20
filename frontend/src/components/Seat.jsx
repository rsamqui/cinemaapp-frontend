import React from 'react';
import { Button, Tooltip } from '@mui/material';
import { SEAT_STATUS, SEAT_COLORS } from '../constants/seatConstants';

const Seat = ({ id, status, label, onClick, disabled }) => {
  let statusStyle = SEAT_COLORS[status];

  if (!statusStyle) {
    console.warn(`Seat.jsx: No specific style for status "${status}" (ID: ${id}). Falling back to BLOCKED.`);
    statusStyle = SEAT_COLORS[SEAT_STATUS.BLOCKED];
  }
  if (!statusStyle) { 
    statusStyle = { backgroundColor: 'grey', color: 'white', borderColor: 'darkgrey', cursor: 'not-allowed' };
  }

  const finalSx = {
    minWidth: '35px',
    height: '35px',
    p: 0,
    fontSize: '0.7rem',
    color: statusStyle.color,
    backgroundColor: statusStyle.backgroundColor,
    borderColor: statusStyle.borderColor, 
    border: `1px solid ${statusStyle.borderColor || 'transparent'}`,
    cursor: statusStyle.cursor || 'pointer',

    '&:hover': {
      backgroundColor: statusStyle.backgroundColor, 
      opacity: (status === SEAT_STATUS.AVAILABLE || status === SEAT_STATUS.SELECTED) && !disabled ? 0.85 : 1,
    },
    
    '&.Mui-disabled': {
        backgroundColor: statusStyle.backgroundColor, 
        opacity: 0.6, 
        borderColor: statusStyle.borderColor,
    }
  };

  return (
    <Tooltip title={`Seat ${id} - ${status || 'unknown'}`} placement="top">
      <span>
        <Button
          fullWidth
          variant="contained" 
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
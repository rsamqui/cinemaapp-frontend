import React, { useMemo, useCallback } from 'react'; // Removed useState, useEffect if not needed locally
import {
  Box,
  // Container, Paper, FormControl, Grid, InputLabel, MenuItem, Select, TextField, // Removed if this component is purely for display
  Typography,
} from '@mui/material';
import Seat from './Seat';
import { SEAT_STATUS, SEAT_COLORS } from '../constants/seatConstants'; // Ensure this path is correct

const getAlphabetLetter = (index) => String.fromCharCode(65 + index);

export default function Room({
  initialRows, // This prop name is fine
  initialCols, // This prop name is fine
  externallySetSeats = [], // This prop is CRUCIAL and should contain ALL current statuses
  onSeatSelect, // Callback to notify parent of click intent
  // isEditable,   // Should be false for booking mode
}) {
  // The `seatsToRender` is derived directly from props.
  // No internal 'seats' state needed in this component if parent controls all statuses.
  const seatsToRender = useMemo(() => {
    const generated = [];
    // console.log("Room.jsx: Generating seatsToRender. initialRows:", initialRows, "initialCols:", initialCols);
    // console.log("Room.jsx: externallySetSeats received:", JSON.stringify(externallySetSeats.filter(s => s.id.startsWith('H') || s.status === SEAT_STATUS.SELECTED)));


    if (initialRows > 0 && initialCols > 0) {
      for (let i = 0; i < initialRows; i++) {
        const rowLabel = getAlphabetLetter(i);
        for (let j = 0; j < initialCols; j++) {
          const colLabel = (j + 1).toString();
          const seatId = `${rowLabel}${colLabel}`;

          // Find the status from the comprehensive externallySetSeats prop
          const seatInfoFromParent = externallySetSeats.find(s => s.id === seatId);
          
          // Default to AVAILABLE if not found in the comprehensive list from parent
          // This should ideally not happen if SeatSelectionPage correctly generates all seats for allSeatStatusesForRoom
          const currentStatus = seatInfoFromParent ? seatInfoFromParent.status : SEAT_STATUS.AVAILABLE;

          // if (seatId.startsWith('H') || currentStatus === SEAT_STATUS.SELECTED) {
          //   console.log(`Room.jsx (seatsToRender): Seat ${seatId}, InfoFromParent: ${JSON.stringify(seatInfoFromParent)}, Final Status: ${currentStatus}`);
          // }

          generated.push({
            id: seatId,
            rowLabel,
            colLabel,
            rowIndex: i,
            colIndex: j,
            status: currentStatus, // This status comes directly from the parent's resolved list
          });
        }
      }
    }
    return generated;
  }, [initialRows, initialCols, externallySetSeats]);

  const handleSeatClick = useCallback((seatId, currentSeatStatus) => {
    // This function just notifies the parent (SeatSelectionPage) of the click intent.
    // The parent will then update its state, which flows back down as new `externallySetSeats`.
    if (onSeatSelect) {
      let attemptedNewStatus;
      if (currentSeatStatus === SEAT_STATUS.AVAILABLE) {
        attemptedNewStatus = SEAT_STATUS.SELECTED;
      } else if (currentSeatStatus === SEAT_STATUS.SELECTED) {
        attemptedNewStatus = SEAT_STATUS.AVAILABLE;
      } else {
        // Click on TAKEN, RESERVED, BLOCKED - do nothing or notify parent differently if needed
        return;
      }
      // Pass minimal info: just the seat ID and the status it would toggle to.
      // The parent (SeatSelectionPage) has the full seat object if needed.
      onSeatSelect({ id: seatId }, attemptedNewStatus);
    }
  }, [onSeatSelect]); // isEditable is not directly used here for changing state

  // The configuration inputs (row/col selectors, total seats) and Paper/Container
  // have been removed from this component. If Room.jsx is meant to *also* be an admin
  // configuration tool, then those elements would be kept, and isEditable would control them.
  // For the seat selection flow, SeatSelectionPage handles the "config" (rows/cols from backend).

  if (initialRows === 0 || initialCols === 0 || seatsToRender.length === 0) {
    return <Typography sx={{textAlign: 'center', mt: 2}}>Room data not available or being loaded.</Typography>;
  }

  return (
    <>
      <Box sx={{ width: '80%', mx: 'auto', textAlign: 'center', bgcolor: 'grey.700', color: 'white', p:1, mb:3, borderRadius: '4px 4px 0 0', boxShadow: '0px 5px 15px rgba(0,0,0,0.3)' }}>
          SCREEN
      </Box>

      <Box sx={{ overflowX: 'auto', pb: 2, display: 'flex', justifyContent: 'center' }}>
        <Box> {/* This inner Box helps with positioning row labels if needed, or structure */}
          {Array.from({ length: initialRows }).map((_, rowIndex) => (
            <Box key={`row-${rowIndex}`} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Typography sx={{ width: '30px', mr: 1, textAlign: 'center', fontWeight: 'bold' }}>
                {getAlphabetLetter(rowIndex)}
              </Typography>
              {seatsToRender
                .filter(seat => seat.rowIndex === rowIndex)
                .sort((a, b) => a.colIndex - b.colIndex)
                .map(seat => (
                  <Box key={seat.id} sx={{ minWidth: '40px', maxWidth: '40px', height: '40px', margin: '2px' }}>
                    <Seat
                      id={seat.id}
                      label={seat.colLabel}
                      status={seat.status} // This status is directly from seatsToRender
                      onClick={() => handleSeatClick(seat.id, seat.status)}
                      disabled={
                        // For booking mode (isEditable=false assumed here based on context)
                        // Disable if not AVAILABLE or already SELECTED (as clicking SELECTED deselects it)
                        // Or more simply, disable if it's taken, reserved, or blocked.
                        // The Seat component itself might also have internal disabled logic based on status.
                        (seat.status === SEAT_STATUS.TAKEN || seat.status === SEAT_STATUS.RESERVED || seat.status === SEAT_STATUS.BLOCKED)
                      }
                    />
                  </Box>
                ))}
            </Box>
          ))}
        </Box>
      </Box>

      {/* Legend - This is fine here, or could be moved to SeatSelectionPage */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 2 }}>
        {Object.entries(SEAT_COLORS).map(([statusKey, style]) => (
          <Box key={statusKey} sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 20, height: 20, backgroundColor: style.backgroundColor, borderColor: style.borderColor, borderStyle: 'solid', borderWidth: '1px', mr: 1 }} />
            <Typography variant="body2" sx={{textTransform: 'capitalize'}}>{statusKey}</Typography>
          </Box>
        ))}
      </Box>
      {/* Removed selected seats count - that's displayed in SeatSelectionPage */}
    </>
  );
}
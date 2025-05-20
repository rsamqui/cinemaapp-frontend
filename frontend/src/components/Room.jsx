// src/components/Room.jsx
import React, { useMemo, useCallback } from 'react';
import { Box, Typography } from '@mui/material';
import Seat from './Seat'; // Ensure this path is correct
import { SEAT_STATUS, SEAT_COLORS } from '../constants/seatConstants'; // Ensure this path is correct

const getAlphabetLetter = (index) => String.fromCharCode(65 + index);

export default function Room({
  initialRows,
  initialCols,
  externallySetSeats = [],
  onLayoutChange,      // For admin config changes
  onUserSeatToggle,    // For user booking selections
  isEditable = false,
}) {
  const seatsToRender = useMemo(() => {
    const generated = [];
      console.log(`Room.jsx: Rendered. Props initialRows=${initialRows}, initialCols=${initialCols}, externallySetSeats length=${externallySetSeats.length}, isEditable=${isEditable}`);
    if (initialRows > 0 && initialCols > 0) {
      for (let i = 0; i < initialRows; i++) {
        const rowLabel = getAlphabetLetter(i);
        for (let j = 0; j < initialCols; j++) {
          const colLabel = (j + 1).toString();
          const seatId = `${rowLabel}${colLabel}`;
          
          const seatInfoFromParent = externallySetSeats.find(s => s.id === seatId);
          let currentStatus = SEAT_STATUS.AVAILABLE; 

          if (seatInfoFromParent && seatInfoFromParent.status && Object.values(SEAT_STATUS).includes(seatInfoFromParent.status)) {
            currentStatus = seatInfoFromParent.status;
          } else if (seatInfoFromParent) {
            // This case means seatInfoFromParent was found, but its status is not in your SEAT_STATUS values
            // Or seatInfoFromParent.status is undefined/null.
            // console.warn(`Room.jsx: Seat ${seatId} from externallySetSeats has invalid/missing status '${seatInfoFromParent.status}'. Defaulting to AVAILABLE.`);
          }
          // If seatInfoFromParent is not found, it also defaults to AVAILABLE.

          generated.push({
            id: seatId, rowLabel, colLabel, rowIndex: i, colIndex: j,
            status: currentStatus,
          });
        }
      }
    }
    // console.log(`Room.jsx: Generated seatsToRender (first 5 for row A):`, JSON.stringify(generated.filter(s=>s.rowLabel === 'A').slice(0,5)));
    return generated;
  }, [initialRows, initialCols, externallySetSeats, isEditable]);

  const handleSeatClick = useCallback((seatId, currentSeatStatus) => {
    if (isEditable) {
      if (onLayoutChange) {
        // Admin toggles between AVAILABLE and (e.g.) UNAVAILABLE_ADMIN or BLOCKED
        const newLayout = seatsToRender.map(seat => {
          if (seat.id === seatId) {
            if (seat.status === SEAT_STATUS.OCCUPIED || seat.status === SEAT_STATUS.RESERVED) return seat;
            const newStatus = seat.status === SEAT_STATUS.AVAILABLE
              ? SEAT_STATUS.UNAVAILABLE_ADMIN // Or SEAT_STATUS.BLOCKED
              : SEAT_STATUS.AVAILABLE;
            return { ...seat, status: newStatus };
          }
          return seat;
        });
        onLayoutChange(newLayout);
      }
    } else { // User booking mode
      if (!onUserSeatToggle) return;
      if (currentSeatStatus === SEAT_STATUS.AVAILABLE) {
        onUserSeatToggle({ id: seatId, status: currentSeatStatus }, SEAT_STATUS.SELECTED);
      } else if (currentSeatStatus === SEAT_STATUS.SELECTED) {
        onUserSeatToggle({ id: seatId, status: currentSeatStatus }, SEAT_STATUS.AVAILABLE);
      }
    }
  }, [isEditable, onLayoutChange, onUserSeatToggle, seatsToRender]); // seatsToRender is needed if modifying it directly for onLayoutChange


  // Conditional rendering: If initialRows or initialCols are not yet set (or 0), show message.
  if (!(initialRows > 0 && initialCols > 0)) {
    return <Typography sx={{textAlign: 'center', mt: 2, p:2 }}>Set rows and columns to view layout.</Typography>;
  }
  
  // If rows/cols are set but seatsToRender is somehow empty (shouldn't happen if above guard passes and useMemo works)
  // This also guards against rendering before the useMemo has populated seatsToRender for the first time.
  if (seatsToRender.length === 0) {
      return <Typography sx={{textAlign: 'center', mt: 2, p:2 }}>Generating seat layout...</Typography>;
  }

  return (
    <Box sx={{ border: isEditable ? '1px solid #444' : 'none', p: isEditable ? {xs:1, sm:2} : 0, borderRadius: 1, backgroundColor: isEditable ? '#222' : 'transparent'}}>
      <Box sx={{ width: '80%', mx: 'auto', textAlign: 'center', bgcolor: 'grey.800', color: 'white', p:1, mb:3, borderRadius: '4px 4px 0 0', boxShadow: '0px 5px 15px rgba(0,0,0,0.3)' }}>
          SCREEN
      </Box>

      <Box sx={{ overflowX: 'auto', pb: 2, display: 'flex', justifyContent: 'center' }}>
        <Box> {/* Inner Box wrapping all rows */}
          {Array.from({ length: initialRows }).map((_, rowIndex) => (
            <Box key={`row-${rowIndex}`} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Typography sx={{ width: '30px', mr: 1, textAlign: 'center', fontWeight: 'bold', color: 'text.secondary' }}>
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
                      status={seat.status} // This status comes directly from seatsToRender
                      onClick={() => handleSeatClick(seat.id, seat.status)}
                      disabled={
                        isEditable
                          ? (seat.status === SEAT_STATUS.OCCUPIED || seat.status === SEAT_STATUS.RESERVED)
                          : (seat.status !== SEAT_STATUS.AVAILABLE && seat.status !== SEAT_STATUS.SELECTED)
                      }
                    />
                  </Box>
                ))}
            </Box>
          ))}
        </Box>
      </Box>

      {/* Legend */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 2 }}>
        {Object.keys(SEAT_STATUS).map((statusKey) => {
          const statusValue = SEAT_STATUS[statusKey];
          const style = SEAT_COLORS[statusValue];
          if (!style) return null;

          const showInLegend = isEditable
            ? (statusValue === SEAT_STATUS.AVAILABLE || statusValue === SEAT_STATUS.UNAVAILABLE_ADMIN || statusValue === SEAT_STATUS.BLOCKED || statusValue === SEAT_STATUS.OCCUPIED || statusValue === SEAT_STATUS.RESERVED) // Admin sees more
            : (statusValue !== SEAT_STATUS.UNAVAILABLE_ADMIN && statusValue !== SEAT_STATUS.BLOCKED); // User sees bookable/selected/taken/reserved

          if (showInLegend) {
            return (
              <Box key={statusValue} sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: 20, height: 20, backgroundColor: style.backgroundColor, borderColor: style.borderColor, borderStyle: 'solid', borderWidth: '1px', mr: 1 }} />
                <Typography variant="body2" sx={{textTransform: 'capitalize'}}>{statusValue.replace('_', ' ')}</Typography>
              </Box>
            );
          }
          return null;
        })}
      </Box>
    </Box>
  );
}
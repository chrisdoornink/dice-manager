import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { CombatLogEntry } from '../hooks/useCombatLog';

interface CombatLogOverlayProps {
  logEntries: CombatLogEntry[];
}

const CombatLogOverlay: React.FC<CombatLogOverlayProps> = ({ logEntries }) => {
  return (
    <Paper
      elevation={3}
      sx={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        maxWidth: '350px',
        width: '350px',
        maxHeight: '300px',
        overflowY: 'auto',
        padding: '10px',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        zIndex: 1000,
        border: '1px solid #753a1a',
        borderRadius: '4px',
      }}
    >
      <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#ffd700', marginBottom: '5px', fontFamily: '"Press Start 2P", cursive' }}>
        Combat Log
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {logEntries.length > 0 ? (
          logEntries.map((entry) => (
            <Box key={entry.id} sx={{ 
              backgroundColor: 'rgba(0, 0, 0, 0.4)', 
              padding: '4px 8px',
              borderRadius: '3px',
              borderLeft: '3px solid #753a1a',
            }}>
              <Typography sx={{ 
                color: '#f5f5f5',
                fontSize: '0.8rem', 
                fontFamily: '"Courier New", monospace',
              }}>
                {entry.message}
              </Typography>
            </Box>
          ))
        ) : (
          <Typography sx={{ color: '#f5f5f5', fontSize: '0.8rem', fontStyle: 'italic' }}>
            No combat events logged yet.
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default CombatLogOverlay;

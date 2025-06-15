import React, { useEffect, useRef } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { CombatLogEntry } from '../hooks/useCombatLog';

interface CombatLogOverlayProps {
  logEntries: CombatLogEntry[];
  isOpen: boolean;
  onToggle: () => void;
}

const CombatLogOverlay: React.FC<CombatLogOverlayProps> = ({ logEntries, isOpen, onToggle }) => {
  // Create a ref for the container element
  const logContainerRef = useRef<HTMLDivElement>(null);
  
  // Filter to only show visible entries when not in full view
  const entriesToShow = isOpen ? logEntries : logEntries.filter(entry => entry.visible);
  
  // Auto-scroll to bottom when log entries change
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [entriesToShow]);
  
  return (
    <>
      {/* Toggle button - always visible */}
      <Box
        onClick={onToggle}
        sx={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: '#ffd700',
          padding: '5px 10px',
          borderRadius: '4px',
          cursor: 'pointer',
          zIndex: 1001,
          border: '1px solid #753a1a',
          fontFamily: '"Press Start 2P", cursive',
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {isOpen ? 'Close Log' : 'Combat Log'}
      </Box>
      
      {/* Log overlay - visibility depends on isOpen or if there are visible messages */}
      {(isOpen || entriesToShow.length > 0) && (
        <Paper
          ref={logContainerRef}
          elevation={3}
          sx={{
            position: 'fixed',
            top: isOpen ? '50px' : '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            maxWidth: isOpen ? '80%' : '350px',
            width: isOpen ? '80%' : '350px',
            maxHeight: isOpen ? '400px' : '200px',
            overflowY: 'auto',
            padding: '10px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            zIndex: 1000,
            border: '1px solid #753a1a',
            borderRadius: '4px',
            transition: 'all 0.3s ease-in-out',
          }}
        >
      <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#ffd700', marginBottom: '5px', fontFamily: '"Press Start 2P", cursive' }}>
        Combat Log
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {entriesToShow.length > 0 ? (
          entriesToShow.map((entry) => (
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
      )}
    </>
  );
};

export default CombatLogOverlay;

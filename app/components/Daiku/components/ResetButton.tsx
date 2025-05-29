import React from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

interface ResetButtonProps {
  onReset: () => void;
}

export const ResetButton: React.FC<ResetButtonProps> = ({ onReset }) => {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        zIndex: 1000,
      }}
    >
      <Tooltip title="Reset Game">
        <IconButton 
          onClick={onReset}
          size="large"
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
            },
          }}
        >
          <RefreshIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

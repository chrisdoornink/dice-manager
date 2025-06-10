import React from 'react';
import { Box } from '@mui/material';
import { EntityInfoPanel } from './EntityInfoPanel';
import { ResetButton } from './ResetButton';
import { PlayerEntity } from '../utils/types';

interface HeaderSectionProps {
  currentTurn: number;
  handleReset: () => void;
  selectedEntity: PlayerEntity | null;
  errorMessage: string;
}

const HeaderSection: React.FC<HeaderSectionProps> = ({
  currentTurn,
  handleReset,
  selectedEntity,
  errorMessage
}) => {
  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      {/* Left side - Turn indicator */}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {/* Turn indicator */}
        <Box
          sx={{
            marginLeft: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            padding: '5px 10px',
            borderRadius: '4px',
            fontWeight: 'bold',
          }}
        >
          Turn: {currentTurn}
        </Box>
      </Box>

      {/* Center - Reset and Debug buttons */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
        }}
      >
        <ResetButton onReset={handleReset} />
      </Box>

      {/* Right side - Entity Info Panel */}
      <Box sx={{ marginRight: '20px' }}>
        <EntityInfoPanel selectedEntity={selectedEntity} />
      </Box>

      {/* Error message display */}
      {errorMessage && (
        <Box
          sx={{
            position: 'absolute',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#f44336',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '4px',
            zIndex: 1100,
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            animation: 'fadeIn 0.3s',
            '@keyframes fadeIn': {
              '0%': { opacity: 0, transform: 'translateX(-50%) translateY(-20px)' },
              '100%': { opacity: 1, transform: 'translateX(-50%) translateY(0)' },
            },
          }}
        >
          {errorMessage}
        </Box>
      )}
    </Box>
  );
};

export default HeaderSection;

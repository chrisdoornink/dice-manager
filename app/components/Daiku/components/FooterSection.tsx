import React from 'react';
import { Box } from '@mui/material';
import PlayerStatusFooter from './PlayerStatusFooter';
import PixelatedButton from './PixelatedButton';
import { PlayerEntity } from '../utils/types';
import { GridPosition } from '../utils/types';

interface FooterSectionProps {
  playerEntities: PlayerEntity[];
  isEnemyTurn: boolean;
  pendingMoves: Map<string, GridPosition>;
  executeMoves: () => void;
}

const FooterSection: React.FC<FooterSectionProps> = ({
  playerEntities,
  isEnemyTurn,
  pendingMoves,
  executeMoves,
}) => {
  // Ensure button width is appropriate based on move count
  const getExecuteButtonWidth = () => {
    const moveCount = pendingMoves.size;
    if (moveCount >= 10) return '190px';
    if (moveCount >= 1) return '180px';
    return '150px';
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '80px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 16px', // Add padding on the sides for mobile
      }}
    >
      {/* Centered container with max width */}
      <Box
        sx={{
          margin: '0 auto',
          width: '100%',
          maxWidth: '600px', // Max width for desktop view
          display: 'flex',
          justifyContent: 'space-between', // Space between left and right elements
          alignItems: 'center',
          // Scale down content for screens below 650px
          '@media (max-width: 650px)': {
            transform: 'scale(0.85) translateX(-50px)',
            transformOrigin: 'center',
            gap: '10px',
          },
          // Scale down even more for very small screens
          '@media (max-width: 480px)': {
            transform: 'scale(0.75) translateX(-50px)',
            transformOrigin: 'center',
            gap: '10px',
          },
        }}
      >
        {/* Left side - Player Status Footer */}
        <Box sx={{ textAlign: 'left' }}>
          <PlayerStatusFooter playerEntities={playerEntities} />
        </Box>

        {/* Right side - Either Enemy Turn Notification or Execute Moves Button */}
        <Box sx={{ textAlign: 'right' }}>
          {isEnemyTurn ? (
            <Box
              sx={{
                backgroundColor: 'rgba(244, 67, 54, 0.8)',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '4px',
                animation: 'pulse 1.5s infinite',
                '@keyframes pulse': {
                  '0%': { opacity: 0.7 },
                  '50%': { opacity: 1 },
                  '100%': { opacity: 0.7 },
                },
              }}
            >
              Enemy Turn
            </Box>
          ) : (
            pendingMoves.size > 0 && (
              <PixelatedButton
                onClick={executeMoves}
                disabled={isEnemyTurn || pendingMoves.size === 0}
                sx={{ width: getExecuteButtonWidth(), marginBottom: '20px' }}
              >
                Execute Moves ({pendingMoves.size})
              </PixelatedButton>
            )
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default FooterSection;

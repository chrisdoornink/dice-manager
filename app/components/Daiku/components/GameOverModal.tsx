import React from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';

interface GameOverModalProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
  onReset: () => void;
}

const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  message,
  onClose,
  onReset,
}) => {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      aria-labelledby="game-over-modal"
      aria-describedby="game-over-message"
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          border: '2px solid #000',
          boxShadow: 24,
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderRadius: 2,
        }}
      >
        <Typography id="game-over-title" variant="h4" component="h2" mb={2}>
          Game Over
        </Typography>
        
        <Typography id="game-over-message" sx={{ mt: 2, mb: 4 }}>
          {message}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="contained" 
            onClick={onReset}
            sx={{ 
              backgroundColor: '#4CAF50', 
              '&:hover': { backgroundColor: '#388E3C' } 
            }}
          >
            New Game
          </Button>
          <Button 
            variant="outlined"
            onClick={onClose}
          >
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default GameOverModal;

import React from "react";
import { Modal, Box, Typography, Button, Divider } from "@mui/material";
import { PlayerEntity, EnemyEntity } from "../utils/types";

interface GameOverModalProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
  onReset: () => void;
  playerEntities: PlayerEntity[];
  enemyEntities: EnemyEntity[];
  currentTurn: number;
}

const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  message,
  onClose,
  onReset,
  playerEntities,
  enemyEntities,
  currentTurn,
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
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 500,
          maxHeight: "80vh",
          overflowY: "auto",
          bgcolor: "background.paper",
          border: "2px solid #000",
          boxShadow: 24,
          p: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          borderRadius: 2,
        }}
      >
        <Typography id="game-over-title" variant="h4" component="h2" mb={2}>
          Game Over
        </Typography>

        <Typography id="game-over-message" sx={{ mt: 2, mb: 2 }}>
          {message}
        </Typography>

        <Divider sx={{ width: "100%", my: 2 }} />
        
        {/* Game Summary */}
        <Box sx={{ width: "100%", mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Game Summary
          </Typography>
          <Typography variant="body1">
            Total turns: {currentTurn}
          </Typography>
        </Box>
        
        <Divider sx={{ width: "100%", my: 2 }} />
        
        {/* Player Stats */}
        <Box sx={{ width: "100%", mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Player Stats
          </Typography>

          {playerEntities.map((player) => {
            const health = player.entityType.currentHealth || 0;
            const startingHealth = player.entityType.startingHealth || 1;
            const healthPercent = Math.round((health / startingHealth) * 100);
            const isDefeated = player.defeated;

            return (
              <Box key={player.id} sx={{ mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {player.entityType.name}
                </Typography>
                <Box sx={{ pl: 2 }}>
                  <Typography variant="body2">
                    Health: {health}/{startingHealth} ({healthPercent}%)
                  </Typography>
                  <Typography variant="body2">
                    Status: {isDefeated ? '💀 Defeated' : '✅ Active'}
                  </Typography>
                  <Typography variant="body2">
                    Kills: {player.kills || 0}
                  </Typography>
                  {isDefeated && (
                    <>
                      {player.turnDefeated && (
                        <Typography variant="body2">
                          Defeated on turn: {player.turnDefeated}
                        </Typography>
                      )}
                      {player.killedBy && (
                        <Typography variant="body2">
                          Killed by: {player.killedBy.startsWith('clobbin') ? 'Clobbin' :
                                    player.killedBy.startsWith('spuddle') ? 'Spuddle' :
                                    player.killedBy.startsWith('skritcher') ? 'Skritcher' :
                                    player.killedBy.startsWith('whumble') ? 'Whumble' :
                                    player.killedBy}
                        </Typography>
                      )}
                    </>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>

        <Divider sx={{ width: "100%", my: 2 }} />

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            onClick={onReset}
            sx={{
              backgroundColor: "#4CAF50",
              "&:hover": { backgroundColor: "#388E3C" },
            }}
          >
            New Game
          </Button>
          <Button variant="outlined" onClick={onClose}>
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default GameOverModal;

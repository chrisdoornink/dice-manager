import React from "react";
import { Modal, Box, Typography, Button, Divider } from "@mui/material";
import GameEndBoardView from "./GameEndBoardView";
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
  // Generate a shareable summary of the game with emojis
  const generateShareableSummary = () => {
    // Determine if players won or lost
    const allPlayersDefeated = playerEntities.every((player) => player.defeated);
    const allEnemiesDefeated = enemyEntities.every((enemy) => enemy.defeated);

    const gameResult = allEnemiesDefeated
      ? "🏆 VICTORY!"
      : allPlayersDefeated
      ? "☠️ DEFEAT!"
      : "⚔️ ONGOING";

    // Count total kills for players and enemies
    const playerKills = playerEntities.reduce((total, player) => total + (player.kills || 0), 0);
    const enemyKills = enemyEntities.reduce((total, enemy) => total + (enemy.kills || 0), 0);

    // Count survivors
    const playersSurvived = playerEntities.filter((player) => !player.defeated).length;
    const totalPlayers = playerEntities.length;
    const enemiesSurvived = enemyEntities.filter((enemy) => !enemy.defeated).length;
    const totalEnemies = enemyEntities.length;

    // Build the summary text
    const lines = [];

    // Header with fancy border
    lines.push(`╔══════════════════════════╗`);
    lines.push(`║  🎲 DAIKU - ${gameResult}  ║`);
    lines.push(`╚══════════════════════════╝`);

    // Battle stats
    lines.push(`🗓️ Turn: ${currentTurn}`);
    lines.push(``);

    // Create health bars for each team
    const playerHealthBar = createHealthBar(playersSurvived, totalPlayers);
    const enemyHealthBar = createHealthBar(enemiesSurvived, totalEnemies);

    // Team summaries with health bars
    lines.push(
      `👑 HEROES: ${playerHealthBar} (${playersSurvived}/${totalPlayers}) 🎯 ${playerKills} kills`
    );
    lines.push(
      `👹 ENEMIES: ${enemyHealthBar} (${enemiesSurvived}/${totalEnemies}) 🗡️ ${enemyKills} kills`
    );
    lines.push(``);

    // Individual player results
    lines.push(`🧙‍♂️ HERO DETAILS 🧙‍♂️`);

    playerEntities.forEach((player) => {
      const unitType = player.entityType.type;
      const unitEmoji =
        unitType === "archer"
          ? "🏹"
          : unitType === "cavalry"
          ? "🐎"
          : unitType === "warrior"
          ? "🛡️"
          : unitType === "mage"
          ? "🔮"
          : "⚔️";

      const status = player.defeated ? "💀" : "❤️";
      const health = player.entityType.currentHealth || 0;
      const startingHealth = player.startingHealth || player.entityType.maxHealth;
      const kills = player.kills || 0;
      const healthBar = createUnitHealthBar(health, startingHealth);

      if (player.defeated && player.killedBy) {
        const killerType = player.killedBy.startsWith("clobbin")
          ? "Clobbin"
          : player.killedBy.startsWith("spuddle")
          ? "Spuddle"
          : player.killedBy.startsWith("skritcher")
          ? "Skritcher"
          : player.killedBy.startsWith("whumble")
          ? "Whumble"
          : "Enemy";

        lines.push(
          `${unitEmoji} ${player.entityType.name}: ${status} ${healthBar} Kills: ${kills} ⚰️ by ${killerType}`
        );
      } else {
        lines.push(
          `${unitEmoji} ${player.entityType.name}: ${status} ${healthBar} Kills: ${kills}`
        );
      }
    });

    // Return the formatted text
    return lines.join("\n");
  };

  // Helper to create a health bar for a team
  const createHealthBar = (surviving: number, total: number): string => {
    const fullHearts = surviving;
    const emptyHearts = total - surviving;
    return "❤️".repeat(fullHearts) + "🖤".repeat(emptyHearts);
  };

  // Helper to create a health bar for an individual unit
  const createUnitHealthBar = (current: number, max: number): string => {
    // Cap at 10 segments for readability
    const segments = 5;
    const filledSegments = Math.round((current / max) * segments);
    const emptySegments = segments - filledSegments;

    return `[${"█".repeat(filledSegments)}${"░".repeat(emptySegments)}] ${current}/${max}`;
  };

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
          <Typography variant="body1">Total turns: {currentTurn}</Typography>
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
                    Status: {isDefeated ? "💀 Defeated" : "✅ Active"}
                  </Typography>
                  <Typography variant="body2">Kills: {player.kills || 0}</Typography>
                  {isDefeated && (
                    <>
                      {player.turnDefeated && (
                        <Typography variant="body2">
                          Defeated on turn: {player.turnDefeated}
                        </Typography>
                      )}
                      {player.killedBy && (
                        <Typography variant="body2">
                          Killed by:{" "}
                          {player.killedBy.startsWith("clobbin")
                            ? "Clobbin"
                            : player.killedBy.startsWith("spuddle")
                            ? "Spuddle"
                            : player.killedBy.startsWith("skritcher")
                            ? "Skritcher"
                            : player.killedBy.startsWith("whumble")
                            ? "Whumble"
                            : player.killedBy}
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

        {/* Shareable Game Summary */}
        <Box sx={{ width: "100%", mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Shareable Summary
          </Typography>

          <Box
            sx={{
              p: 2,
              backgroundColor: "#f5f5f5",
              borderRadius: 1,
              fontFamily: "monospace",
              position: "relative",
            }}
          >
            {generateShareableSummary()}

            <Button
              variant="contained"
              size="small"
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                fontSize: "0.7rem",
                bg: "copy-code",
                color: "bg",
                _hover: { bg: "copy-code-hover" },
              }}
              onClick={() => navigator.clipboard.writeText(generateShareableSummary())}
            >
              Copy to Clipboard
            </Button>
          </Box>

          {/* Board visualization showing final positions */}
          <GameEndBoardView
            playerEntities={playerEntities}
            enemyEntities={enemyEntities}
            size={260}
          />
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

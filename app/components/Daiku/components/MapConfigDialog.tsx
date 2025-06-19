import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Grid
} from '@mui/material';
import { PlacementStrategy, EnemyPlacementStrategy } from '../hooks/useGameInitialization';

interface MapConfigDialogProps {
  open: boolean;
  onClose: () => void;
  onStart: (config: {
    playerPlacement: PlacementStrategy;
    enemyPlacement: EnemyPlacementStrategy;
  }) => void;
}

const MapConfigDialog: React.FC<MapConfigDialogProps> = ({ open, onClose, onStart }) => {
  const [playerPlacement, setPlayerPlacement] = useState<PlacementStrategy>('center');
  const [enemyPlacement, setEnemyPlacement] = useState<EnemyPlacementStrategy>('far');

  const handleStartGame = () => {
    onStart({
      playerPlacement,
      enemyPlacement
    });
  };

  // Descriptions for placement strategies
  const playerStrategies = {
    center: 'Players positioned near the center of the map',
    corners: 'Players positioned in the corners of the map',
    edges: 'Players positioned along the edges of the map',
    spread: 'Players evenly distributed across the map',
    random: 'Players randomly positioned on the map'
  };

  const enemyStrategies = {
    opposite: 'Enemies positioned opposite to player positions',
    surrounding: 'Enemies positioned to surround the players',
    far: 'Enemies positioned as far as possible from players',
    random: 'Enemies randomly positioned on the map'
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Game Configuration</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Choose the starting placement for players and enemies to begin your game.
        </DialogContentText>
        
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Player Placement
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Player Placement</InputLabel>
                <Select
                  value={playerPlacement}
                  label="Player Placement"
                  onChange={(e) => setPlayerPlacement(e.target.value as PlacementStrategy)}
                >
                  <MenuItem value="center">Center</MenuItem>
                  <MenuItem value="corners">Corners</MenuItem>
                  <MenuItem value="edges">Edges</MenuItem>
                  <MenuItem value="spread">Spread Out</MenuItem>
                  <MenuItem value="random">Random</MenuItem>
                </Select>
              </FormControl>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {playerStrategies[playerPlacement]}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Enemy Placement
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Enemy Placement</InputLabel>
                <Select
                  value={enemyPlacement}
                  label="Enemy Placement"
                  onChange={(e) => setEnemyPlacement(e.target.value as EnemyPlacementStrategy)}
                >
                  <MenuItem value="opposite">Opposite</MenuItem>
                  <MenuItem value="surrounding">Surrounding</MenuItem>
                  <MenuItem value="far">Far</MenuItem>
                  <MenuItem value="random">Random</MenuItem>
                </Select>
              </FormControl>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {enemyStrategies[enemyPlacement]}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleStartGame} variant="contained" color="primary">
          Start Game
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MapConfigDialog;

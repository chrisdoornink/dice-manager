import React from 'react';
import { Box, Typography } from '@mui/material';
import { PlayerEntity, EnemyEntity, GridPosition } from '../utils/types';
import { axialToPixel } from "../utils/hexagonCoordinates";

interface GameEndBoardViewProps {
  playerEntities: PlayerEntity[];
  enemyEntities: EnemyEntity[];
  size?: number; // Size of the board visualization
}

/**
 * A simplified visualization of the final board state showing:
 * - Empty hexes (gray)
 * - Enemy alive positions (red)
 * - Enemy dead positions (pink)
 * - Player alive positions (blue)
 * - Player dead positions (light blue)
 */
const GameEndBoardView: React.FC<GameEndBoardViewProps> = ({ 
  playerEntities, 
  enemyEntities,
  size = 200 // Default size
}) => {
  // Create a simple hex point generator for small hexes
  const generateHexPoints = (size: number): string => {
    const width = size;
    const height = size * 0.866; // height to width ratio is approximately 0.866
    
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      const x = width / 2 + size / 2 * Math.cos(angle);
      const y = height / 2 + size / 2 * Math.sin(angle);
      points.push(`${x},${y}`);
    }
    return points.join(' ');
  };

  const hexSize = 12; // Small hex size for the visualization
  const hexWidth = hexSize * 2;
  const hexHeight = hexSize * Math.sqrt(3);
  const hexagonPoints = generateHexPoints(hexSize);
  
  // Determine board boundaries based on entity positions
  const positions: GridPosition[] = [
    ...playerEntities.map(entity => entity.position),
    ...enemyEntities.map(entity => entity.position)
  ];
  
  const minQ = Math.min(...positions.map(pos => pos.q)) - 2;
  const maxQ = Math.max(...positions.map(pos => pos.q)) + 2;
  const minR = Math.min(...positions.map(pos => pos.r)) - 2;
  const maxR = Math.max(...positions.map(pos => pos.r)) + 2;
  
  // Create a grid of positions to render
  const gridPositions: GridPosition[] = [];
  for (let q = minQ; q <= maxQ; q++) {
    for (let r = minR; r <= maxR; r++) {
      // Valid hex grid coordinates satisfy q + r + s = 0, where s = -q - r
      if (Math.abs(q + r) <= 5) { // Limit to reasonable distance from center
        gridPositions.push({ q, r });
      }
    }
  }
  
  // Function to get entity at a position
  const getEntityAtPosition = (position: GridPosition) => {
    // Check for player entities
    const player = playerEntities.find(
      entity => entity.position.q === position.q && entity.position.r === position.r
    );
    if (player) return { entity: player, type: 'player' };
    
    // Check for enemy entities
    const enemy = enemyEntities.find(
      entity => entity.position.q === position.q && entity.position.r === position.r
    );
    if (enemy) return { entity: enemy, type: 'enemy' };
    
    return null;
  };
  
  // Function to determine hex color based on entity status
  const getHexColor = (position: GridPosition): string => {
    const entityInfo = getEntityAtPosition(position);
    
    if (!entityInfo) {
      // Empty hex
      return '#cccccc';
    } else if (entityInfo.type === 'player') {
      // Player entity
      return entityInfo.entity.defeated ? '#a4c2f4' : '#4285f4'; // Light blue if defeated, blue if alive
    } else {
      // Enemy entity
      return entityInfo.entity.defeated ? '#f4a4a4' : '#ea4335'; // Light red if defeated, red if alive
    }
  };
  
  // Calculate the board center for positioning
  const centerOffsetX = ((maxQ - minQ) * hexWidth * 0.75) / 2;
  const centerOffsetY = ((maxR - minR) * hexHeight) / 2;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        mt: 1,
        mb: 2
      }}
    >
      <Typography variant="subtitle2" sx={{ mb: 1, textAlign: 'center' }}>
        Final Board State
      </Typography>
      <Box
        sx={{
          width: size,
          height: size,
          position: 'relative',
          border: '1px solid #ddd',
          borderRadius: '4px',
          backgroundColor: '#f5f5f5'
        }}
      >
        <svg
          width={size}
          height={size}
          viewBox={`${-centerOffsetX} ${-centerOffsetY} ${size * 2} ${size * 2}`}
        >
          <g transform={`translate(${size/2}, ${size/2})`}>
            {gridPositions.map((position) => {
              const { x, y } = axialToPixel(position.q, position.r, hexSize);
              return (
                <g 
                  key={`${position.q},${position.r}`} 
                  transform={`translate(${x}, ${y})`}
                >
                  <polygon
                    points={hexagonPoints}
                    fill={getHexColor(position)}
                    stroke="#666666"
                    strokeWidth="0.5"
                  />
                </g>
              );
            })}
          </g>
        </svg>
      </Box>
      
      {/* Color legend */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1, flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ width: 12, height: 12, backgroundColor: '#4285f4', mr: 0.5 }} />
          <Typography variant="caption">Hero</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ width: 12, height: 12, backgroundColor: '#a4c2f4', mr: 0.5 }} />
          <Typography variant="caption">Fallen Hero</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ width: 12, height: 12, backgroundColor: '#ea4335', mr: 0.5 }} />
          <Typography variant="caption">Enemy</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ width: 12, height: 12, backgroundColor: '#f4a4a4', mr: 0.5 }} />
          <Typography variant="caption">Defeated Enemy</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ width: 12, height: 12, backgroundColor: '#cccccc', mr: 0.5 }} />
          <Typography variant="caption">Empty</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default GameEndBoardView;

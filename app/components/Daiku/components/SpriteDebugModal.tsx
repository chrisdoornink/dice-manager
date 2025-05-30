import React, { useState } from 'react';
import { Box, Modal, Typography, Button, Grid, Paper, Tabs, Tab } from '@mui/material';
import { FOREST_SPRITES, MOUNTAIN_SPRITES } from '../utils/generateTerrainMap';

interface SpriteDebugModalProps {
  open: boolean;
  onClose: () => void;
  spriteSheetPath?: string;
}

const SpriteDebugModal: React.FC<SpriteDebugModalProps> = ({ open, onClose }) => {
  const [tabValue, setTabValue] = useState<number>(0);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const forestSpriteSheet = "/images/terrain/forest_sprites.png";
  const mountainSpriteSheet = "/images/terrain/mountains_sprites.png";

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="sprite-debug-modal"
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxHeight: '90vh',
          overflowY: 'auto',
          bgcolor: 'background.paper',
          border: '2px solid #000',
          boxShadow: 24,
          p: 4,
        }}
      >
        <Typography variant="h6" component="h2" gutterBottom>
          Terrain Sprite Debug View
        </Typography>
        <Button onClick={onClose} sx={{ position: 'absolute', top: 10, right: 10 }}>
          Close
        </Button>
        
        {/* Tabs for different sprite types */}
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label="Forest Sprites" />
          <Tab label="Mountain Sprites" />
        </Tabs>
        
        {/* Forest Sprites Tab */}
        {tabValue === 0 && (
          <>
            <Typography variant="subtitle1" gutterBottom>
              Individual Forest Sprites:
            </Typography>
            <Grid container spacing={3}>
              {FOREST_SPRITES.map((sprite, index) => (
                <Grid item key={index} xs={12} sm={6} md={4} lg={3}>
                  <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
                    <Typography variant="subtitle2" gutterBottom align="center">
                      Forest Sprite {index + 1}
                    </Typography>
                    
                    {/* The SVG clip approach for cleaner sprite display */}
                    <Box
                      sx={{
                        width: '100%',
                        height: 200,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        mb: 2,
                        position: 'relative',
                        overflow: 'hidden',
                        backgroundColor: '#4a9f4f',
                        border: '1px dashed #ccc',
                      }}
                    >
                      <svg
                        width="100%"
                        height="100%"
                        viewBox="0 0 256 256"
                        preserveAspectRatio="xMidYMid meet"
                      >
                        <defs>
                          <clipPath id={`forest-clip-${index}`}>
                            <rect x="0" y="0" width="256" height="256" />
                          </clipPath>
                        </defs>
                        <image
                          href={forestSpriteSheet}
                          x={-sprite.x}
                          y={-sprite.y}
                          width="1024"
                          height="1024"
                          clipPath={`url(#forest-clip-${index})`}
                        />
                      </svg>
                    </Box>
                    
                    <Typography variant="body2">
                      <strong>Coordinates:</strong><br />
                      x: {sprite.x}, y: {sprite.y}<br />
                      width: {sprite.width}, height: {sprite.height}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
            
            {/* Full Sprite Sheet Reference */}
            <Box sx={{ mt: 4 }}>
              <Typography variant="subtitle1" gutterBottom>
                Full Forest Sprite Sheet Reference:
              </Typography>
              <Box
                component="img"
                src={forestSpriteSheet}
                alt="Full Forest Sprite Sheet"
                sx={{ 
                  width: '100%',
                  maxWidth: '800px',
                  border: '1px solid #ccc',
                  display: 'block',
                  margin: '0 auto'
                }}
              />
            </Box>
          </>
        )}

        {/* Mountain Sprites Tab */}
        {tabValue === 1 && (
          <>
            <Typography variant="subtitle1" gutterBottom>
              Individual Mountain Sprites:
            </Typography>
            <Grid container spacing={3}>
              {MOUNTAIN_SPRITES.map((sprite, index) => (
                <Grid item key={index} xs={12} sm={6} md={4} lg={3}>
                  <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
                    <Typography variant="subtitle2" gutterBottom align="center">
                      Mountain Sprite {index + 1}
                    </Typography>
                    
                    {/* The SVG clip approach for cleaner sprite display */}
                    <Box
                      sx={{
                        width: '100%',
                        height: 200,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        mb: 2,
                        position: 'relative',
                        overflow: 'hidden',
                        backgroundColor: '#A0A0A0',
                        border: '1px dashed #ccc',
                      }}
                    >
                      <svg
                        width="100%"
                        height="100%"
                        viewBox="0 0 256 256"
                        preserveAspectRatio="xMidYMid meet"
                      >
                        <defs>
                          <clipPath id={`mountain-clip-${index}`}>
                            <rect x="0" y="0" width="256" height="256" />
                          </clipPath>
                        </defs>
                        <image
                          href={mountainSpriteSheet}
                          x={-sprite.x}
                          y={-sprite.y}
                          width="1024"
                          height="1024"
                          clipPath={`url(#mountain-clip-${index})`}
                        />
                      </svg>
                    </Box>
                    
                    <Typography variant="body2">
                      <strong>Coordinates:</strong><br />
                      x: {sprite.x}, y: {sprite.y}<br />
                      width: {sprite.width}, height: {sprite.height}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
            
            {/* Full Sprite Sheet Reference */}
            <Box sx={{ mt: 4 }}>
              <Typography variant="subtitle1" gutterBottom>
                Full Mountain Sprite Sheet Reference:
              </Typography>
              <Box
                component="img"
                src={mountainSpriteSheet}
                alt="Full Mountain Sprite Sheet"
                sx={{ 
                  width: '100%',
                  maxWidth: '800px',
                  border: '1px solid #ccc',
                  display: 'block',
                  margin: '0 auto'
                }}
              />
            </Box>
          </>
        )}
      </Box>
    </Modal>
  );
};

export default SpriteDebugModal;

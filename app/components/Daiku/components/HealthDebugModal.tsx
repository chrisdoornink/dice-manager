import React from 'react';
import {
  Modal,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { PlayerEntity, EnemyEntity } from '../utils/types'; // Assuming types are defined here

interface HealthDebugModalProps {
  open: boolean;
  onClose: () => void;
  players: PlayerEntity[];
  enemies: EnemyEntity[];
}

const modalStyle = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  maxWidth: 600,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  maxHeight: '90vh',
  overflowY: 'auto',
};

const HealthDebugModal: React.FC<HealthDebugModalProps> = ({ open, onClose, players, enemies }) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h2">
            Entity Health & Attack Debug
          </Typography>
          <IconButton onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Box>

        <Typography variant="subtitle1" gutterBottom>
          Players
        </Typography>
        <TableContainer component={Paper} sx={{ mb: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID/Name</TableCell>
                <TableCell align="right">Health</TableCell>
                <TableCell align="right">Max Health</TableCell>
                <TableCell>Attack</TableCell> {/* Assuming attack is a string or number */}
                <TableCell>Type</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {players.map((player) => (
                <TableRow key={player.id}>
                  <TableCell component="th" scope="row">
                    {player.id} ({player.entityType.type})
                  </TableCell>
                  <TableCell align="right">{player.entityType.currentHealth ?? player.entityType.maxHealth}</TableCell>
                  <TableCell align="right">{player.entityType.maxHealth}</TableCell>
                  <TableCell>{player.entityType.attack} {/* TODO: Adjust based on actual attack property */}</TableCell>
                  <TableCell>{player.entityType.type}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Typography variant="subtitle1" gutterBottom>
          Enemies
        </Typography>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID/Name</TableCell>
                <TableCell align="right">Health</TableCell>
                <TableCell align="right">Max Health</TableCell>
                <TableCell>Attack</TableCell> {/* Assuming attack is a string or number */}
                <TableCell>Type</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {enemies.map((enemy) => (
                <TableRow key={enemy.id}>
                  <TableCell component="th" scope="row">
                    {enemy.id} ({enemy.entityType.type})
                  </TableCell>
                  <TableCell align="right">{enemy.entityType.currentHealth ?? enemy.entityType.maxHealth}</TableCell>
                  <TableCell align="right">{enemy.entityType.maxHealth}</TableCell>
                  <TableCell>{enemy.entityType.attack} {/* TODO: Adjust based on actual attack property */}</TableCell>
                  <TableCell>{enemy.entityType.type}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Modal>
  );
};

export default HealthDebugModal;

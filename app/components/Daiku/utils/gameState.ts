import { GridPosition, TerrainDefinition, PlayerEntity, HexagonData } from "./types";

// Define the structure of the game state to be saved in localStorage
export interface GameState {
  // Map and terrain
  terrainMap: Array<[string, TerrainDefinition]>; // Convert Map to array for storage
  
  // Entities
  playerEntities: PlayerEntity[];
  
  // Game status
  currentTurn: number;
  gameStartedAt: number; // timestamp
  lastSavedAt: number; // timestamp
}

// Local storage key
const GAME_STATE_KEY = 'daiku-game-state';

// Save game state to localStorage
export const saveGameState = (state: GameState): void => {
  try {
    localStorage.setItem(GAME_STATE_KEY, JSON.stringify(state));
    console.log('Game state saved', new Date().toISOString());
  } catch (error) {
    console.error('Failed to save game state:', error);
  }
};

// Load game state from localStorage
export const loadGameState = (): GameState | null => {
  try {
    const savedState = localStorage.getItem(GAME_STATE_KEY);
    if (!savedState) return null;
    
    return JSON.parse(savedState);
  } catch (error) {
    console.error('Failed to load game state:', error);
    return null;
  }
};

// Clear game state from localStorage
export const clearGameState = (): void => {
  try {
    localStorage.removeItem(GAME_STATE_KEY);
    console.log('Game state cleared');
  } catch (error) {
    console.error('Failed to clear game state:', error);
  }
};

// Check if a saved game exists
export const hasSavedGame = (): boolean => {
  return localStorage.getItem(GAME_STATE_KEY) !== null;
};

// Convert Map<string, TerrainDefinition> to array for storage
export const terrainMapToArray = (map: Map<string, TerrainDefinition>): Array<[string, TerrainDefinition]> => {
  return Array.from(map.entries());
};

// Convert array back to Map<string, TerrainDefinition>
export const arrayToTerrainMap = (array: Array<[string, TerrainDefinition]>): Map<string, TerrainDefinition> => {
  return new Map(array);
};

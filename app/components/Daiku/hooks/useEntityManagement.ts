import { useState } from 'react';
import { PlayerEntity, EnemyEntity } from '../utils/types';

interface UseEntityManagementReturn {
  playerEntities: PlayerEntity[];
  setPlayerEntities: React.Dispatch<React.SetStateAction<PlayerEntity[]>>;
  enemyEntities: EnemyEntity[];
  setEnemyEntities: React.Dispatch<React.SetStateAction<EnemyEntity[]>>;
}

export const useEntityManagement = (): UseEntityManagementReturn => {
  // Track player entities
  const [playerEntities, setPlayerEntities] = useState<PlayerEntity[]>([]);

  // Enemy entities on the grid
  const [enemyEntities, setEnemyEntities] = useState<EnemyEntity[]>([]);

  return {
    playerEntities,
    setPlayerEntities,
    enemyEntities,
    setEnemyEntities
  };
};

export default useEntityManagement;

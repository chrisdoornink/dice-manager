import { useState } from 'react';

export const useModals = () => {
  // State for debug modals
  const [isSpriteDebugModalOpen, setIsSpriteDebugModalOpen] = useState(false);
  const [isHealthDebugModalOpen, setIsHealthDebugModalOpen] = useState(false);
  
  // State for game over modal
  const [isGameOverModalOpen, setIsGameOverModalOpen] = useState(false);
  const [gameOverMessage, setGameOverMessage] = useState("");

  return {
    // Debug modals
    isSpriteDebugModalOpen,
    setIsSpriteDebugModalOpen,
    isHealthDebugModalOpen,
    setIsHealthDebugModalOpen,
    
    // Game over modal
    isGameOverModalOpen,
    setIsGameOverModalOpen,
    gameOverMessage,
    setGameOverMessage
  };
};

export default useModals;

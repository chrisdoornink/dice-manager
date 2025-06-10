import { useState } from 'react';

export const useModals = () => {
  // State for debug modals
  const [isSpriteDebugModalOpen, setIsSpriteDebugModalOpen] = useState(false);
  const [isHealthDebugModalOpen, setIsHealthDebugModalOpen] = useState(false);

  return {
    isSpriteDebugModalOpen,
    setIsSpriteDebugModalOpen,
    isHealthDebugModalOpen,
    setIsHealthDebugModalOpen
  };
};

export default useModals;

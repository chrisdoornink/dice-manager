import { useState } from 'react';
import { GridPosition } from '../utils/types';

export const useMoveManagement = () => {
  // Track pending moves for the current turn
  const [pendingMoves, setPendingMoves] = useState<Map<string, GridPosition>>(new Map());
  
  // Error message handling
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [errorMessageTimeout, setErrorMessageTimeout] = useState<NodeJS.Timeout | null>(null);

  const showError = (message: string) => {
    // Clear any existing timeout
    if (errorMessageTimeout) {
      clearTimeout(errorMessageTimeout);
    }

    // Set the error message
    setErrorMessage(message);

    // Set a timeout to clear it after a few seconds
    const timeout = setTimeout(() => {
      setErrorMessage("");
    }, 3000);

    setErrorMessageTimeout(timeout);
  };

  return {
    pendingMoves,
    setPendingMoves,
    errorMessage,
    setErrorMessage,
    errorMessageTimeout,
    setErrorMessageTimeout,
    showError
  };
};

export default useMoveManagement;

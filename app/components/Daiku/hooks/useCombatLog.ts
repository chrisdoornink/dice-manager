import { useState, useCallback } from 'react';

export type CombatLogEntry = {
  id: number;
  message: string;
  timestamp: number;
};

export const useCombatLog = (maxEntries = 10) => {
  const [logEntries, setLogEntries] = useState<CombatLogEntry[]>([]);
  const [idCounter, setIdCounter] = useState(0);

  const addLogEntry = useCallback((message: string) => {
    setLogEntries(prevEntries => {
      // Create a new log entry
      const newEntry: CombatLogEntry = {
        id: idCounter,
        message,
        timestamp: Date.now(),
      };
      
      // Increment the ID counter for the next entry
      setIdCounter(prevId => prevId + 1);
      
      // Add the new entry and limit to maxEntries, keeping most recent
      const updatedEntries = [newEntry, ...prevEntries].slice(0, maxEntries);
      
      return updatedEntries;
    });
  }, [idCounter, maxEntries]);

  const clearLog = useCallback(() => {
    setLogEntries([]);
  }, []);

  return {
    logEntries,
    addLogEntry,
    clearLog,
  };
};

export default useCombatLog;

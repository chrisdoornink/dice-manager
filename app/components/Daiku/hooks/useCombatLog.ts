import { useState, useCallback } from "react";

export type CombatLogEntry = {
  id: number;
  message: string;
  timestamp: number;
};

export const useCombatLog = () => {
  const [logEntries, setLogEntries] = useState<CombatLogEntry[]>([]);
  const [idCounter, setIdCounter] = useState(0);

  const addLogEntry = useCallback(
    (message: string) => {
      setLogEntries((prevEntries) => {
        // Create a new log entry
        const newEntry: CombatLogEntry = {
          id: idCounter,
          message,
          timestamp: Date.now(),
        };

        // Increment the ID counter for the next entry
        setIdCounter((prevId) => prevId + 1);

        // Add the new entry to the end
        const updatedEntries = [...prevEntries, newEntry];

        return updatedEntries;
      });
    },
    [idCounter]
  );

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

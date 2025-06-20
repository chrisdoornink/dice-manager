import { useState, useCallback, useEffect } from "react";

export type CombatLogEntry = {
  id: number;
  message: string;
  timestamp: number;
  visible: boolean;
  queued?: boolean;
};

// Local storage keys
const COMBAT_LOG_ENTRIES_KEY = "daiku-combat-log-entries";
const COMBAT_LOG_ID_COUNTER_KEY = "daiku-combat-log-id-counter";

export const useCombatLog = () => {
  // Initialize state from local storage if available
  const [logEntries, setLogEntries] = useState<CombatLogEntry[]>(() => {
    if (typeof window !== "undefined") {
      const savedEntries = localStorage.getItem(COMBAT_LOG_ENTRIES_KEY);
      return savedEntries ? JSON.parse(savedEntries) : [];
    }
    return [];
  });
  
  const [idCounter, setIdCounter] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const savedCounter = localStorage.getItem(COMBAT_LOG_ID_COUNTER_KEY);
      return savedCounter ? parseInt(savedCounter, 10) : 0;
    }
    return 0;
  });
  
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [messageQueue, setMessageQueue] = useState<string[]>([]);
  const [processingQueue, setProcessingQueue] = useState(false);
  
  // Process the message queue with a 500ms delay between messages
  // Save log entries to local storage when they change
  useEffect(() => {
    if (typeof window !== "undefined" && logEntries.length > 0) {
      localStorage.setItem(COMBAT_LOG_ENTRIES_KEY, JSON.stringify(logEntries));
    }
  }, [logEntries]);

  // Save id counter to local storage when it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(COMBAT_LOG_ID_COUNTER_KEY, idCounter.toString());
    }
  }, [idCounter]);

  useEffect(() => {
    if (messageQueue.length > 0 && !processingQueue) {
      setProcessingQueue(true);
      
      const message = messageQueue[0];
      const remainingMessages = messageQueue.slice(1);
      
      // Add the entry immediately
      const newEntryId = idCounter;
      setLogEntries(prevEntries => [
        ...prevEntries, 
        {
          id: newEntryId,
          message,
          timestamp: Date.now(),
          visible: true,
          queued: false
        }
      ]);
      
      setIdCounter(prevId => prevId + 1);
      setMessageQueue(remainingMessages);
      
      // Wait 500ms before processing the next message
      setTimeout(() => {
        setProcessingQueue(false);
      }, 500);
      
      // Auto-hide after 3 seconds
      setTimeout(() => {
        setLogEntries(prevEntries => 
          prevEntries.map(entry => 
            entry.id === newEntryId ? { ...entry, visible: false } : entry
          )
        );
      }, 3000);
    }
  }, [messageQueue, processingQueue, idCounter]);

  const addLogEntry = useCallback(
    (message: string) => {
      // Add the new message to the queue
      setMessageQueue(prevQueue => [...prevQueue, message]);
    },
    []
  );

  // Clear log will now be used explicitly when a new game starts
  const clearLog = useCallback(() => {
    setLogEntries([]);
    if (typeof window !== "undefined") {
      // Clear the log entries from local storage
      localStorage.removeItem(COMBAT_LOG_ENTRIES_KEY);
    }
    // Reset the idCounter to 0
    setIdCounter(0);
    if (typeof window !== "undefined") {
      localStorage.setItem(COMBAT_LOG_ID_COUNTER_KEY, "0");
    }
  }, []);
  
  const toggleLogVisibility = useCallback(() => {
    setIsLogOpen(prev => !prev);
  }, []);

  return {
    logEntries,
    visibleLogEntries: logEntries.filter(entry => entry.visible),
    permanentLogEntries: logEntries,
    addLogEntry,
    clearLog,
    isLogOpen,
    toggleLogVisibility,
  };
};

export default useCombatLog;

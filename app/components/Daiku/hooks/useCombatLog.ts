import { useState, useCallback, useEffect } from "react";

export type CombatLogEntry = {
  id: number;
  message: string;
  timestamp: number;
  visible: boolean;
  queued?: boolean;
};

export const useCombatLog = () => {
  const [logEntries, setLogEntries] = useState<CombatLogEntry[]>([]);
  const [idCounter, setIdCounter] = useState(0);
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [messageQueue, setMessageQueue] = useState<string[]>([]);
  const [processingQueue, setProcessingQueue] = useState(false);
  
  // Process the message queue with a 500ms delay between messages
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

  const clearLog = useCallback(() => {
    setLogEntries([]);
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

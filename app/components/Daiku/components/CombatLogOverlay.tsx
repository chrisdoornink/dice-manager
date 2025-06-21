import React, { useEffect, useRef, useState } from "react";
import { Box, Paper, Typography } from "@mui/material";
import PixelatedButton from "./PixelatedButton";
import { CombatLogEntry } from "../hooks/useCombatLog";

interface CombatLogOverlayProps {
  logEntries: CombatLogEntry[];
  isOpen: boolean;
  onToggle: () => void;
}

// Function to format log message with colored enemy/player names, italic death text, and bold important words
const formatLogMessage = (message: string) => {
  // Define regular expressions for different patterns
  const enemyNames = [
    "Clobbin", "Spuddle", "Skritcher", "Whumble", 
    "clobbin", "spuddle", "skritcher", "whumble"
  ];
  
  const playerNames = [
    "Warrior", "Archer", "Mage", "Healer", "Cavalry",
    "warrior", "archer", "mage", "healer", "cavalry"
  ];

  // Create a copy of the message to work with
  let formattedMessage = message;
  
  // Format enemy names in red - using word boundaries to match whole words only
  enemyNames.forEach(name => {
    formattedMessage = formattedMessage.replace(
      new RegExp(`\\b${name}\\b`, 'gi'),
      match => `<span style="color: #ff4d4d; font-weight: bold;">${match}</span>`
    );
  });
  
  // Format player names in blue ("good guy" color) - using word boundaries to match whole words only
  playerNames.forEach(name => {
    formattedMessage = formattedMessage.replace(
      new RegExp(`\\b${name}\\b`, 'gi'),
      match => `<span style="color: #66b3ff; font-weight: bold;">${match}</span>`
    );
  });
  
  // Format death text in italics
  formattedMessage = formattedMessage.replace(
    /\b(died|defeated|slain|killed|destroyed|perished)\b/gi,
    match => `<span style="font-style: italic;">${match}</span>`
  );
  
  // Format damage amounts in bold
  formattedMessage = formattedMessage.replace(
    /(\d+)(\s*)(damage|health|points|hp)/gi,
    (match, number, space, unit) => `<span style="font-weight: bold;">${number}</span>${space}${unit}`
  );
  
  // Return formatted message as a React component using dangerouslySetInnerHTML
  return <span dangerouslySetInnerHTML={{ __html: formattedMessage }} />;
};

const CombatLogOverlay: React.FC<CombatLogOverlayProps> = ({ logEntries, isOpen, onToggle }) => {
  // Create a ref for the container element
  const logContainerRef = useRef<HTMLDivElement>(null);
  const [logHeight, setLogHeight] = useState<number>(() => {
    // Try to get saved height from localStorage
    const savedHeight = localStorage.getItem('daiku-combat-log-height');
    return savedHeight ? parseInt(savedHeight, 10) : 200;
  });
  const [isDragging, setIsDragging] = useState(false);

  // Filter to only show visible entries when not in full view
  const entriesToShow = isOpen ? logEntries : logEntries.filter((entry) => entry.visible);

  // Auto-scroll to bottom when log entries change
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [entriesToShow]);

  // Save height to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('daiku-combat-log-height', logHeight.toString());
  }, [logHeight]);

  // Handle drag to resize
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  // Update window height state to handle fixed positioning
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  
  // Handle window resize
  useEffect(() => {
    const handleWindowResize = () => {
      setWindowHeight(window.innerHeight);
    };
    
    window.addEventListener('resize', handleWindowResize);
    return () => window.removeEventListener('resize', handleWindowResize);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && isOpen) {
        const newHeight = Math.max(100, Math.min(windowHeight * 0.8, e.clientY - 10)); // min 100px, max 80vh
        setLogHeight(newHeight);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isOpen, windowHeight]);

  return (
    <>
      {/* Toggle button - always visible when log is closed */}
      <Box sx={{ position: "fixed", top: "10px", right: "10px", zIndex: 1001, display: isOpen ? "none" : "block" }}>
        <PixelatedButton 
          onClick={onToggle}
          size="small"
          textSize="0.7rem"
        >
          Combat Log
        </PixelatedButton>
      </Box>

      {/* Outer container for combat log (fixed position) */}
      {(isOpen || entriesToShow.length > 0) && (
        <Box
          sx={{
            position: "fixed",
            top: "0",
            left: "50%",
            transform: "translateX(-50%)",
            width: isOpen ? "100%" : "350px",
            maxWidth: isOpen ? "100%" : "350px",
            height: isOpen ? `${logHeight}px` : "200px", 
            maxHeight: isOpen ? "80vh" : "200px",
            display: "flex",
            flexDirection: "column",
            zIndex: 1000,
          }}
        >
          {/* Main content container with scrolling */}
          <Paper
            elevation={3}
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflowY: "auto",
              backgroundColor: "rgba(0, 0, 0, 0.85)",
              border: "2px solid black",
              borderRadius: "0", // No rounded corners for pixel look
              boxShadow: "3px 3px 0px black", // Pixelated shadow
              imageRendering: "pixelated",
              transition: isDragging ? "none" : "all 0.3s ease-in-out",
              fontFamily: 'var(--font-press-start-2p), Courier, monospace',
            }}
          >
            {/* Header */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "2px solid black",
                backgroundColor: "#333",
                padding: "5px",
                flexShrink: 0,
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: "#f5f5f5",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  fontFamily: 'var(--font-press-start-2p), Courier, monospace',
                  fontSize: "0.7rem",
                }}
              >
                Combat Log
              </Typography>
              <Box sx={{ display: "flex", gap: "8px" }}>
                {isOpen && (
                  <Box
                    onClick={onToggle}
                    sx={{
                      color: "#f5f5f5",
                      cursor: "pointer",
                      fontSize: "0.7rem",
                      fontFamily: 'var(--font-press-start-2p), Courier, monospace',
                      padding: "2px 4px",
                      border: "1px solid #444",
                      backgroundColor: "#222",
                      boxShadow: "1px 1px 0 #000",
                      imageRendering: "pixelated",
                      "&:hover": { 
                        color: "#ffd700",
                        boxShadow: "2px 2px 0 #000",
                        transform: "translate(-1px, -1px)"
                      },
                      "&:active": {
                        boxShadow: "0px 0px 0 #000",
                        transform: "translate(1px, 1px)"
                      },
                      transition: "all 0.1s"
                    }}
                  >
                    CLOSE
                  </Box>
                )}
              </Box>
            </Box>
            
            {/* Scrollable content area */}
            <Box 
              ref={logContainerRef}
              sx={{
                display: "flex", 
                flexDirection: "column", 
                gap: "4px",
                flex: 1,
                overflowY: "auto", 
                padding: "10px",
              }}
            >
              {entriesToShow.length > 0 ? (
                entriesToShow.map((entry) => (
                  <Box
                    key={entry.id}
                    sx={{
                      backgroundColor: "rgba(0, 0, 0, 0.5)",
                      padding: "4px 8px",
                      borderRadius: "0px", // Square corners for pixel look
                      borderLeft: "3px solid #753a1a",
                      border: "1px solid #444",
                    }}
                  >
                    <Typography
                      sx={{
                        color: "#f5f5f5",
                        fontSize: "0.8rem",
                        fontFamily: '"Courier New", monospace',
                      }}
                    >
                      {formatLogMessage(entry.message)}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography sx={{ color: "#f5f5f5", fontSize: "0.8rem", fontStyle: "italic" }}>
                  No combat events logged yet.
                </Typography>
              )}
            </Box>
          </Paper>
          
          {/* Resize handle - always attached to the bottom of the container */}
          {isOpen && (
            <Box
              sx={{
                width: "100%",
                height: "8px",
                cursor: "ns-resize",
                backgroundColor: "#222",
                borderTop: "1px solid black",
                borderBottom: "2px solid black",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexShrink: 0,
                // Pixelated look for the handle
                backgroundImage: "repeating-linear-gradient(90deg, #444, #444 4px, #222 4px, #222 8px)",
                imageRendering: "pixelated",
              }}
              onMouseDown={handleMouseDown}
            >
              <Box sx={{ width: "20px", height: "3px", backgroundColor: "#666" }} />
            </Box>
          )}
        </Box>
      )}
    </>
  );
};

export default CombatLogOverlay;

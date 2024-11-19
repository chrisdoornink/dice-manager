'use client';

import React, { useEffect, useState } from "react";
import { Box, Button, Container, Grid, TextField, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Snackbar } from "@mui/material";
import { v4 as uuidv4 } from "uuid";
import HistoryIcon from '@mui/icons-material/History';
import ShareIcon from '@mui/icons-material/Share';
import CloseIcon from '@mui/icons-material/Close';
import DiceItem from "./DiceItem";
import { RollHistoryDrawer } from "./RollHistory";
import type { RollHistoryItem } from "./RollHistory";
import { DEFAULT_DICE, DEFAULT_PRESETS, type Dice, type DicePreset } from "./constants";
import { VenmoButton } from "../VenmoButton";
import { storage } from "../../../lib/storage";
import { StorageItems } from "../../../lib/storage/constants";
import { useTheme } from "@/app/contexts/ThemeContext";
import { encodePreset, decodePreset, getSharedPresetFromURL } from "@/app/utils/presetSharing";

const DiceManager = () => {
  // Initialize with empty arrays to match server-side render
  const [dice, setDice] = useState<Dice[]>([]);
  const [presets, setPresets] = useState<DicePreset[]>([]);
  const [rollHistory, setRollHistory] = useState<RollHistoryItem[]>([]);
  const [isClient, setIsClient] = useState(false);

  const [lockedDice, setLockedDice] = useState<Set<string>>(new Set());
  const [savePresetOpen, setSavePresetOpen] = useState(false);
  const [loadPresetOpen, setLoadPresetOpen] = useState(false);
  const [newPresetName, setNewPresetName] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [rolling, setRolling] = useState(false);
  const [rollTime, setRollTime] = useState(2000);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const { theme } = useTheme();

  // Load data from localStorage only after initial render
  useEffect(() => {
    setIsClient(true);
    setDice(storage.getItem(StorageItems.currentDice));
    setPresets(storage.getItem(StorageItems.dicePresets));
    setRollHistory(storage.getItem(StorageItems.rollHistory));
  }, []);

  useEffect(() => {
    if (!isClient) return;
    storage.setItem(StorageItems.currentDice, dice);
  }, [dice, isClient]);

  useEffect(() => {
    if (!isClient) return;
    storage.setItem(StorageItems.dicePresets, presets);
  }, [presets, isClient]);

  useEffect(() => {
    if (!isClient) return;
    storage.setItem(StorageItems.rollHistory, rollHistory);
  }, [rollHistory, isClient]);

  // Check for shared preset in URL on mount
  useEffect(() => {
    if (!isClient) return;
    
    const sharedPreset = getSharedPresetFromURL();
    if (sharedPreset) {
      loadPreset(sharedPreset);
      // Clear the URL parameter after loading
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [isClient]);

  const addDice = () => {
    setDice([...dice, { ...DEFAULT_DICE, id: uuidv4() }]);
  };

  const updateDice = (updatedDie: Dice) => {
    const newDiceList = dice.map((die) => (die.id === updatedDie.id ? updatedDie : die));
    setDice(newDiceList);
  };

  const deleteDice = (die: Dice) => {
    const newDiceList = [...dice];
    newDiceList.splice(newDiceList.indexOf(die), 1);
    setDice(newDiceList);
  };

  const savePreset = () => {
    if (newPresetName.trim()) {
      const newPreset: DicePreset = {
        id: uuidv4(),
        name: newPresetName.trim(),
        dice: [...dice],
      };
      setPresets([...presets, newPreset]);
      setSavePresetOpen(false);
      setNewPresetName("");
    }
  };

  const loadPreset = (preset: DicePreset) => {
    setDice(preset.dice.map((die) => ({ ...die, id: uuidv4() })));
    setLoadPresetOpen(false);
  };

  const deletePreset = (presetId: string) => {
    setPresets(presets.filter((p) => p.id !== presetId));
  };

  const rollDice = () => {
    const diceToRoll = dice.filter((d) => !lockedDice.has(d.id));
    setRolling(true);

    setTimeout(() => {
      const newDice = dice.map((die) => {
        if (!lockedDice.has(die.id)) {
          const newValue = Math.floor(Math.random() * die.values.length);
          return {
            ...die,
            currentValue: newValue,
          };
        }
        return die;
      });

      const timestamp = Date.now();
      const newRolls = diceToRoll.map((die) => {
        const newDie = newDice.find((d) => d.id === die.id);
        return {
          id: uuidv4(),
          dieName: `d${die.sides}`,
          value: newDie ? newDie.values[newDie.currentValue] : die.values[die.currentValue],
          timestamp,
        };
      });

      setDice(newDice);
      setRollHistory([...newRolls, ...rollHistory]);
      setRolling(false);
    }, rollTime);
  };

  const toggleDieLock = (die: Dice) => {
    setLockedDice((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(die.id)) {
        newSet.delete(die.id);
      } else {
        newSet.add(die.id);
      }
      return newSet;
    });
  };

  const sharePreset = (preset: DicePreset) => {
    const encoded = encodePreset(preset);
    const url = `${window.location.origin}${window.location.pathname}?preset=${encoded}`;
    
    navigator.clipboard.writeText(url).then(() => {
      setSnackbarMessage("Share link copied to clipboard!");
      setSnackbarOpen(true);
    }).catch(() => {
      setSnackbarMessage("Failed to copy share link");
      setSnackbarOpen(true);
    });
  };

  return (
    <Container
      maxWidth={false}
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        px: { xs: 2, sm: 4 },
        py: { xs: 2, sm: 4 },
        backgroundColor: theme.background,
      }}
    >
      {/* Top Controls */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          justifyContent: "center",
          mb: 4,
        }}
      >
        <Button
          variant="outlined"
          onClick={addDice}
          sx={{
            minWidth: 100,
            color: theme.buttonText,
            borderColor: theme.buttonBorder,
          }}
        >
          Add Die
        </Button>
        <Button
          variant="outlined"
          onClick={() => setHistoryOpen(true)}
          startIcon={<HistoryIcon />}
          sx={{
            minWidth: 100,
            color: theme.buttonText,
            borderColor: theme.buttonBorder,
          }}
        >
          History
        </Button>
        <Button
          variant="outlined"
          onClick={() => setSavePresetOpen(true)}
          disabled={dice.length === 0}
          sx={{
            minWidth: 100,
            color: theme.buttonText,
            borderColor: theme.buttonBorder,
          }}
        >
          Save Preset
        </Button>
        <Button
          variant="outlined"
          onClick={() => setLoadPresetOpen(true)}
          sx={{
            minWidth: 100,
            color: theme.buttonText,
            borderColor: theme.buttonBorder,
          }}
        >
          Load Preset
        </Button>
      </Box>

      {/* Centered Dice Area */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          my: 4,
        }}
      >
        <Grid
          container
          spacing={3}
          justifyContent="center"
          alignItems="center"
          sx={{ maxWidth: "lg" }}
        >
          {dice.map((die) => (
            <Grid item key={die.id}>
              <DiceItem
                die={die}
                onUpdate={updateDice}
                onDelete={deleteDice}
                rolling={rolling}
                selected={lockedDice.has(die.id)}
                onToggleSelect={toggleDieLock}
              />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Bottom Controls */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 3,
          mt: "auto",
          pt: 4,
        }}
      >
        {/* Roll Button */}
        <Button
          variant="contained"
          onClick={rollDice}
          disabled={dice.length === 0 || rolling}
          sx={{
            minWidth: 200,
            py: 1.5,
            px: 4,
            fontSize: "1.1rem",
          }}
        >
          {rolling
            ? "Rolling..."
            : lockedDice.size > 0
            ? `Roll ${dice.length - lockedDice.size} Dice`
            : "Roll All"}
        </Button>

        {/* Roll Speed Controls */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            p: 2,
            borderRadius: 1,
            bgcolor: theme.background,
            opacity: 0.8,
          }}
        >
          <Button
            variant="outlined"
            size="small"
            onClick={() => setRollTime(Math.max(1000, rollTime - 1000))}
            disabled={rollTime <= 1000}
            sx={{
              minWidth: 80,
              color: theme.buttonText,
              borderColor: theme.buttonBorder,
              fontSize: "0.75rem",
            }}
          >
            Faster
          </Button>
          <Box
            sx={{
              px: 2,
              color: theme.buttonText,
              fontSize: "0.75rem",
            }}
          >
            Roll Time: {rollTime / 1000}s
          </Box>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setRollTime(Math.min(10000, rollTime + 1000))}
            disabled={rollTime >= 10000}
            sx={{
              minWidth: 80,
              color: theme.buttonText,
              borderColor: theme.buttonBorder,
              fontSize: "0.75rem",
            }}
          >
            Slower
          </Button>
        </Box>
      </Box>

      {/* Dialogs */}
      <Dialog open={savePresetOpen} onClose={() => setSavePresetOpen(false)}>
        <DialogTitle>Save Preset</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Preset Name"
            fullWidth
            value={newPresetName}
            onChange={(e) => setNewPresetName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSavePresetOpen(false)}>Cancel</Button>
          <Button onClick={savePreset} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={loadPresetOpen} onClose={() => setLoadPresetOpen(false)}>
        <DialogTitle>Load Preset</DialogTitle>
        <DialogContent sx={{ minWidth: 400 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 1 }}>
            {[...DEFAULT_PRESETS, ...presets].map((preset) => (
              <Box
                key={preset.id}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  p: 1,
                  borderRadius: 1,
                  backgroundColor: theme.buttonBackground,
                  "&:hover": {
                    backgroundColor: theme.buttonBackgroundHover,
                  },
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Button
                    onClick={() => loadPreset(preset)}
                    sx={{
                      color: theme.buttonText,
                      textAlign: "left",
                      textTransform: "none",
                    }}
                  >
                    {preset.name}
                  </Button>
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                  {!DEFAULT_PRESETS.includes(preset) && (
                    <IconButton
                      size="small"
                      onClick={() => sharePreset(preset)}
                      sx={{ color: theme.buttonText }}
                    >
                      <ShareIcon />
                    </IconButton>
                  )}
                  {!DEFAULT_PRESETS.includes(preset) && (
                    <IconButton
                      size="small"
                      onClick={() => deletePreset(preset.id)}
                      sx={{ color: theme.buttonText }}
                    >
                      <CloseIcon />
                    </IconButton>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLoadPresetOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      <RollHistoryDrawer
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        history={rollHistory}
        onClear={() => setRollHistory([])}
      />

      <VenmoButton venmoUsername="chrisdoornink" />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        action={
          <IconButton
            size="small"
            color="inherit"
            onClick={() => setSnackbarOpen(false)}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </Container>
  );
};

export default DiceManager;

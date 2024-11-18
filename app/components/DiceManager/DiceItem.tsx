import { Box, Button, Dialog, FormControl, TextField } from "@mui/material";
import LockIcon from '@mui/icons-material/Lock';
import React, { useEffect, useState } from "react";
import type { Dice } from "./constants";
import { useTheme } from "@/app/contexts/ThemeContext";

interface DiceItemProps {
  die: Dice;
  onUpdate: (die: Dice) => void;
  onDelete: (die: Dice) => void;
  rolling: boolean;
  selected: boolean;
  onToggleSelect: (die: Dice) => void;
}

const DiceItem: React.FC<DiceItemProps> = ({
  die,
  onUpdate,
  onDelete,
  rolling,
  selected,
  onToggleSelect,
}) => {
  const [open, setOpen] = useState(false);
  const [displayValue, setDisplayValue] = useState(
    die.values[die.currentValue] || die.currentValue + 1
  );
  const [rotationDeg, setRotationDeg] = useState(0);
  const { theme } = useTheme();

  useEffect(() => {
    if (rolling && !selected) {
      const interval = setInterval(() => {
        setDisplayValue(die.values[Math.floor(Math.random() * die.values.length)]);
        setRotationDeg((prev) => prev + 90);
      }, 100);

      return () => clearInterval(interval);
    } else {
      setDisplayValue(die.values[die.currentValue]);
    }
  }, [rolling, die.values, die.currentValue, selected]);

  const getFontSize = (value: string | number) => {
    const length = value.toString().length;
    if (length <= 2) return "2rem";
    if (length <= 3) return "1.5rem";
    if (length <= 4) return "1.25rem";
    return "1rem";
  };

  const dieFaceStyles = {
    position: "absolute",
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: getFontSize(displayValue),
    fontWeight: "bold",
    backgroundColor: selected ? theme.dieFaceBackgroundSelected : theme.dieFaceBackground,
    color: theme.dieFaceText,
    textShadow: `0px 1px 0px ${theme.textShadowLight}, 0px -1px 0px ${theme.textShadowDark}`,
    boxShadow: `inset 0 0 10px ${theme.boxShadow}`,
    borderRadius: "4px",
    backfaceVisibility: "hidden",
    transition: "background-color 0.2s ease-in-out",
  };

  const handleUpdate = (event: React.FormEvent) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const values = formData.get("values") as string;
    const newValues = values ? values.split(",").map((v) => v.trim()) : [];

    // Ensure we have at least one value
    if (newValues.length === 0) {
      newValues.push("1");
    }

    onUpdate({
      ...die,
      sides: newValues.length,
      values: newValues,
    });
    setOpen(false);
  };

  return (
    <Box
      sx={{
        p: 2,
        backgroundColor: theme.background,
        borderRadius: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        position: "relative",
        cursor: "pointer",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          "& .hover-lock": {
            opacity: 0.2,
          },
          "& .die-face": {
            backgroundColor: theme.dieFaceBackgroundHover,
          },
        },
      }}
      onClick={() => onToggleSelect(die)}
      data-testid={`die-${die.name.toLowerCase()}`}
    >
      {/* Lock icon for hover state */}
      {!selected && (
        <Box
          className="hover-lock"
          sx={{
            position: "absolute",
            top: 14,
            right: 8,
            color: "text.secondary",
            opacity: 0,
            fontSize: "1.2rem",
            transition: "opacity 0.2s ease-in-out",
          }}
        >
          <LockIcon fontSize="inherit" />
        </Box>
      )}

      {/* Lock icon for selected state */}
      {selected && (
        <Box
          sx={{
            position: "absolute",
            top: 14,
            right: 8,
            color: "text.secondary",
            opacity: 0.6,
            fontSize: "1.2rem",
          }}
        >
          <LockIcon fontSize="inherit" />
        </Box>
      )}
      <Box
        sx={{
          mb: 1,
          textAlign: "center",
          color: theme.labelText,
          fontSize: "0.875rem",
        }}
        data-testid={`die-label-${die.name.toLowerCase()}`}
      >
        {`d${die.sides}`}
        <Box
          component="span"
          onClick={(e) => {
            e.stopPropagation();
            setOpen(true);
          }}
          sx={{
            ml: 1,
            cursor: "pointer",
            fontSize: "0.75rem",
            color: theme.editButtonText,
            "&:hover": {
              color: theme.editButtonHoverText,
              textDecoration: "underline",
            },
          }}
          data-testid={`edit-die-${die.name.toLowerCase()}`}
        >
          edit
        </Box>
      </Box>

      <Box
        sx={{
          width: 80,
          height: 80,
          perspective: "200px",
          position: "relative",
        }}
      >
        <Box
          sx={{
            width: "100%",
            height: "100%",
            position: "relative",
            transformStyle: "preserve-3d",
            transform:
              rolling && !selected
                ? `rotateX(${rotationDeg}deg) rotateY(${rotationDeg * 1.5}deg)`
                : "rotateX(-10deg) rotateY(15deg)",
            transition: "transform 0.1s ease-in-out",
          }}
        >
          {/* Front face */}
          <Box
            className="die-face"
            sx={{
              ...dieFaceStyles,
              transform: "translateZ(40px)",
            }}
          >
            {displayValue}
          </Box>

          {/* Back face */}
          <Box
            className="die-face"
            sx={{
              ...dieFaceStyles,
              transform: "translateZ(-40px) rotateX(180deg)",
              border: `1px solid ${theme.dieFaceBorder}`,
              backgroundColor: selected ? theme.dieFaceBackgroundSelected : theme.dieFaceBackground,
            }}
          >
            {displayValue}
          </Box>

          {/* Right face */}
          <Box
            className="die-face"
            sx={{
              ...dieFaceStyles,
              width: "80px",
              height: "80px",
              transform: "rotateY(90deg) translateZ(40px)",
              border: `1px solid ${theme.dieFaceBorder}`,
              backgroundColor: selected ? theme.dieFaceBackgroundSelected : theme.dieFaceBackground,
            }}
          >
            {displayValue}
          </Box>

          {/* Left face */}
          <Box
            className="die-face"
            sx={{
              ...dieFaceStyles,
              width: "80px",
              height: "80px",
              transform: "rotateY(-90deg) translateZ(40px)",
              border: `1px solid ${theme.dieFaceBorder}`,
              backgroundColor: selected ? theme.dieFaceBackgroundSelected : theme.dieFaceBackground,
            }}
          >
            {displayValue}
          </Box>

          {/* Top face */}
          <Box
            className="die-face"
            sx={{
              ...dieFaceStyles,
              width: "80px",
              height: "80px",
              transform: "rotateX(90deg) translateZ(40px)",
              border: `1px solid ${theme.dieFaceBorder}`,
              backgroundColor: selected ? theme.dieFaceBackgroundSelected : theme.dieFaceBackground,
            }}
          >
            {displayValue}
          </Box>

          {/* Bottom face */}
          <Box
            className="die-face"
            sx={{
              ...dieFaceStyles,
              width: "80px",
              height: "80px",
              transform: "rotateX(-90deg) translateZ(40px)",
              border: `1px solid ${theme.dieFaceBorder}`,
              backgroundColor: selected ? theme.dieFaceBackgroundSelected : theme.dieFaceBackground,
            }}
          >
            {displayValue}
          </Box>
        </Box>
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <Box
          component="form"
          onSubmit={handleUpdate}
          sx={{
            p: 2,
            minWidth: 300,
          }}
        >
          <FormControl fullWidth>
            <TextField
              label="Name"
              value={die.name}
              onChange={(e) => onUpdate({ ...die, name: e.target.value })}
              size="small"
              sx={{ mb: 2 }}
            />
          </FormControl>
          <FormControl fullWidth>
            <TextField
              name="values"
              label="Values (comma-separated)"
              defaultValue={die.values.join(", ")}
              helperText="Enter values separated by commas (e.g., '1, 2, 3' or 'Yes, No, Maybe')"
              multiline
              rows={2}
            />
          </FormControl>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Box>
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={() => {
                  onDelete(die);
                  setOpen(false);
                }}
              >
                Delete
              </Button>
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" variant="contained">
                Save
              </Button>
            </Box>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
};

export default DiceItem;

import { Drawer, Box, Typography, IconButton, Link } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import RollHistoryList from "./RollHistoryList";
import { RollHistoryItem } from "./types";
import { useTheme } from "@/app/contexts/ThemeContext";

interface RollHistoryDrawerProps {
  open: boolean;
  onClose: () => void;
  onClear: () => void;
  history: RollHistoryItem[];
}

export default function RollHistoryDrawer({
  open,
  onClose,
  onClear,
  history,
}: RollHistoryDrawerProps) {
  const { theme } = useTheme();

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 300,
          p: 2,
          bgcolor: theme.background,
          color: theme.buttonText,
        },
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Typography variant="h6">Roll History</Typography>
          <Link
            component="button"
            variant="caption"
            onClick={onClear}
            sx={{
              color: theme.buttonText,
              textDecoration: "none",
              "&:hover": {
                textDecoration: "underline",
              },
            }}
          >
            clear
          </Link>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>
      <RollHistoryList history={history} />
    </Drawer>
  );
}
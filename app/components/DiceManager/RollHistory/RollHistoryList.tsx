import { Box, List, ListItem, ListItemText, Typography, Divider } from "@mui/material";
import { RollHistoryItem, RollGroup } from "./types";
import { useTheme } from "../../../contexts/ThemeContext";
interface RollHistoryListProps {
  history: RollHistoryItem[];
}

export default function RollHistoryList({ history }: RollHistoryListProps) {
  const { theme } = useTheme();

  if (history.length === 0) {
    return (
      <Box sx={{ textAlign: "center", color: "text.secondary", mt: 4 }}>
        <Typography variant="body2">No rolls yet</Typography>
      </Box>
    );
  }

  // Group rolls by timestamp
  const groupedRolls: RollGroup[] = history.reduce((groups: RollGroup[], item) => {
    const existingGroup = groups.find((g) => g.timestamp === item.timestamp);
    if (existingGroup) {
      existingGroup.rolls.push(item);
    } else {
      groups.push({ timestamp: item.timestamp, rolls: [item] });
    }
    return groups;
  }, []);

  return (
    <List sx={{ width: "100%", py: 0 }}>
      {groupedRolls.map((group, groupIndex) => (
        <Box key={group.timestamp} sx={{ mb: groupIndex < groupedRolls.length - 1 ? 2 : 0 }}>
          <Typography
            variant="caption"
            sx={{
              color: theme.buttonText,
              display: "block",
              px: 2,
              py: 0.5,
              borderBottom: "1px solid",
              borderColor: theme.buttonBorder,
              bgcolor: theme.background,
            }}
          >
            {new Date(group.timestamp).toLocaleTimeString()}
          </Typography>
          {group.rolls.map((item, index) => (
            <ListItem
              key={item.id}
              sx={{
                py: 0.25,
                px: 1.5,
              }}
            >
              <ListItemText
                primary={
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                  >
                    <Typography variant="body2">{item.dieName}</Typography>
                    <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                      {item.value}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </Box>
      ))}
    </List>
  );
}

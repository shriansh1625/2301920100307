import {
  Box,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import { Log } from "logging-middleware";
import {
  isNotificationViewed,
  markNotificationViewed,
} from "../utils/viewedNotifications.js";

const TYPE_COLOR = {
  Placement: "success",
  Result: "info",
  Event: "warning",
};

export function NotificationCard({ notification, viewedIds, onViewed }) {
  const isNew = !isNotificationViewed(notification.ID, viewedIds);

  async function handleClick() {
    if (!isNew) {
      return;
    }

    markNotificationViewed(notification.ID);
    onViewed(notification.ID);
    await Log("frontend", "info", "component", "notification marked viewed");
  }

  return (
    <Card
      variant="outlined"
      onClick={handleClick}
      sx={{
        cursor: isNew ? "pointer" : "default",
        borderColor: isNew ? "primary.main" : "divider",
        bgcolor: isNew ? "action.hover" : "background.paper",
      }}
    >
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
          <Chip
            label={notification.Type}
            color={TYPE_COLOR[notification.Type] ?? "default"}
            size="small"
          />
          {isNew ? <Chip label="New" color="primary" size="small" /> : null}
        </Stack>

        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          {notification.Message}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          {notification.Timestamp}
        </Typography>

        {notification.priorityScore ? (
          <Box mt={1}>
            <Typography variant="caption" color="text.secondary">
              Priority Score: {notification.priorityScore}
            </Typography>
          </Box>
        ) : null}
      </CardContent>
    </Card>
  );
}

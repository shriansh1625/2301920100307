import { useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import { Log } from "logging-middleware";

import { NotificationCard } from "../components/NotificationCard.jsx";
import { usePriorityNotifications } from "../hooks/usePriorityNotifications.js";
import { getViewedNotificationIds } from "../utils/viewedNotifications.js";

const LIMIT_OPTIONS = [10, 15, 20];

export function PriorityPage() {
  const [limit, setLimit] = useState(10);
  const [viewedIds, setViewedIds] = useState(() => getViewedNotificationIds());
  const { notifications, loading, error, topCountLabel } = usePriorityNotifications(limit);

  async function handleLimitChange(event) {
    setLimit(Number(event.target.value));
    await Log("frontend", "debug", "page", "priority limit updated");
  }

  function handleViewed(notificationId) {
    setViewedIds((current) => {
      const updated = new Set(current);
      updated.add(notificationId);
      return updated;
    });
  }

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
        <StarIcon color="primary" sx={{ fontSize: 28 }} />
        <Typography variant="h5" fontWeight={700}>
          Priority Inbox
        </Typography>
      </Stack>

      <Typography variant="body2" color="text.secondary" mb={2}>
        Showing the {topCountLabel.toLowerCase()} unread notifications ranked by
        importance (Placement &gt; Result &gt; Event) and recency.
      </Typography>

      <FormControl size="small" sx={{ minWidth: 180, mb: 3 }}>
        <InputLabel id="priority-limit-label">Show Top</InputLabel>
        <Select
          labelId="priority-limit-label"
          value={limit}
          label="Show Top"
          onChange={handleLimitChange}
        >
          {LIMIT_OPTIONS.map((option) => (
            <MenuItem key={option} value={option}>
              Top {option}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Divider sx={{ mb: 3 }} />

      {loading ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      ) : null}

      {!loading && error ? (
        <Alert severity="error">Failed to load priority inbox: {error}</Alert>
      ) : null}

      {!loading && !error && notifications.length === 0 ? (
        <Alert severity="info">No priority notifications available.</Alert>
      ) : null}

      {!loading && !error && notifications.length > 0 ? (
        <Stack spacing={1.5}>
          {notifications.map((notification) => (
            <NotificationCard
              key={notification.ID}
              notification={notification}
              viewedIds={viewedIds}
              onViewed={handleViewed}
            />
          ))}
        </Stack>
      ) : null}
    </Box>
  );
}

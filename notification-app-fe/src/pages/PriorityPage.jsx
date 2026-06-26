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
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import { Log } from "logging-middleware";

import { NotificationCard } from "../components/NotificationCard.jsx";
import { usePriorityNotifications } from "../hooks/usePriorityNotifications.js";
import { getViewedNotificationIds } from "../utils/viewedNotifications.js";

const LIMIT_OPTIONS = [10, 15, 20];

const RANK_LABELS = { 3: "Placement", 2: "Result", 1: "Event" };

function PrioritySkeleton() {
  return (
    <Box
      sx={{
        border: "1px solid #E2E8F0",
        borderRadius: "10px",
        p: 2,
        bgcolor: "background.paper",
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <Skeleton variant="circular" width={8} height={8} sx={{ mt: "5px", flexShrink: 0 }} />
        <Box sx={{ flex: 1 }}>
          <Stack direction="row" justifyContent="space-between" mb={1}>
            <Skeleton variant="rounded" width={72} height={22} />
            <Skeleton variant="rounded" width={28} height={16} />
          </Stack>
          <Skeleton variant="text" width="48%" height={20} />
          <Skeleton variant="text" width="30%" height={16} sx={{ mt: 0.5 }} />
        </Box>
      </Stack>
    </Box>
  );
}

export function PriorityPage() {
  const [limit, setLimit] = useState(10);
  const [viewedIds, setViewedIds] = useState(() => getViewedNotificationIds());
  const { notifications, loading, error } = usePriorityNotifications(limit);

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

  const placementCount = notifications.filter((n) => n.Type === "Placement").length;
  const resultCount = notifications.filter((n) => n.Type === "Result").length;
  const eventCount = notifications.filter((n) => n.Type === "Event").length;

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3} flexWrap="wrap" gap={2}>
        <Box>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <EmojiEventsOutlinedIcon sx={{ fontSize: 26, color: "primary.main" }} />
            <Typography variant="h5">Priority Inbox</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, ml: "calc(26px + 12px)" }}>
            Ranked by importance and recency
          </Typography>
        </Box>

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel id="priority-limit-label">Show Top</InputLabel>
          <Select
            labelId="priority-limit-label"
            value={limit}
            label="Show Top"
            onChange={handleLimitChange}
            sx={{ bgcolor: "background.paper", borderRadius: 2 }}
          >
            {LIMIT_OPTIONS.map((option) => (
              <MenuItem key={option} value={option}>
                Top {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {!loading && !error && notifications.length > 0 ? (
        <Stack
          direction="row"
          spacing={1.5}
          sx={{
            mb: 3,
            p: 2,
            bgcolor: "primary.light",
            borderRadius: 2,
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          {[
            { label: "Placements", count: placementCount, color: "#16A34A" },
            { label: "Results", count: resultCount, color: "#0369A1" },
            { label: "Events", count: eventCount, color: "#D97706" },
          ].map(({ label, count, color }) => (
            <Box key={label} sx={{ textAlign: "center", minWidth: 72 }}>
              <Typography variant="h6" sx={{ color, lineHeight: 1.2 }}>
                {count}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {label}
              </Typography>
            </Box>
          ))}
        </Stack>
      ) : null}

      <Divider sx={{ mb: 3 }} />

      {loading ? (
        <Stack spacing={1.5}>
          {[...Array(5)].map((_, i) => (
            <PrioritySkeleton key={i} />
          ))}
        </Stack>
      ) : null}

      {!loading && error ? (
        <Alert severity="error">Could not load priority inbox. Please try again.</Alert>
      ) : null}

      {!loading && !error && notifications.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <EmojiEventsOutlinedIcon sx={{ fontSize: 48, color: "#CBD5E1", mb: 1.5 }} />
          <Typography variant="body1" color="text.secondary">
            No priority notifications available
          </Typography>
        </Box>
      ) : null}

      {!loading && !error && notifications.length > 0 ? (
        <Stack spacing={1.5}>
          {notifications.map((notification, index) => (
            <Stack key={notification.ID} direction="row" spacing={1.5} alignItems="flex-start">
              <Typography
                sx={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: "text.disabled",
                  minWidth: 20,
                  mt: 2.5,
                  textAlign: "right",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {index + 1}
              </Typography>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <NotificationCard
                  notification={notification}
                  viewedIds={viewedIds}
                  onViewed={handleViewed}
                />
              </Box>
            </Stack>
          ))}
        </Stack>
      ) : null}
    </Box>
  );
}

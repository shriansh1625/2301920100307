import { useMemo, useState } from "react";
import {
  Alert,
  Badge,
  Box,
  CircularProgress,
  Divider,
  Pagination,
  Stack,
  Typography,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { Log } from "logging-middleware";

import { NotificationCard } from "../components/NotificationCard.jsx";
import { NotificationFilter } from "../components/NotificationFilter.jsx";
import { useNotifications } from "../hooks/useNotifications.js";
import {
  getUnreadCount,
  getViewedNotificationIds,
} from "../utils/viewedNotifications.js";

export function NotificationsPage() {
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [viewedIds, setViewedIds] = useState(() => getViewedNotificationIds());

  const { notifications, totalPages, loading, error } = useNotifications({
    page,
    limit: 10,
    notificationType: filter,
  });

  const unreadCount = useMemo(
    () => getUnreadCount(notifications, viewedIds),
    [notifications, viewedIds]
  );

  async function handleFilterChange(newFilter) {
    setFilter(newFilter);
    setPage(1);
    await Log("frontend", "debug", "page", "notifications filter updated");
  }

  async function handlePageChange(_, newPage) {
    setPage(newPage);
    await Log("frontend", "debug", "page", "notifications page changed");
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
        <Badge badgeContent={unreadCount} color="primary" max={99}>
          <NotificationsIcon sx={{ fontSize: 28 }} />
        </Badge>
        <Typography variant="h5" fontWeight={700}>
          Notifications
        </Typography>
      </Stack>

      <Divider sx={{ mb: 3 }} />

      <Box sx={{ mb: 3 }}>
        <NotificationFilter value={filter} onChange={handleFilterChange} />
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      ) : null}

      {!loading && error ? (
        <Alert severity="error">Failed to load notifications: {error}</Alert>
      ) : null}

      {!loading && !error && notifications.length === 0 ? (
        <Alert severity="info">No notifications found for this filter.</Alert>
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

      {!loading && !error && totalPages > 1 ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            shape="rounded"
          />
        </Box>
      ) : null}
    </Box>
  );
}

import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  Divider,
  Pagination,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import { appLog } from "../utils/appLog.js";

import { NotificationCard } from "../components/NotificationCard.jsx";
import { NotificationFilter } from "../components/NotificationFilter.jsx";
import { useNotifications } from "../hooks/useNotifications.js";
import {
  getUnreadCount,
  getViewedNotificationIds,
} from "../utils/viewedNotifications.js";

function NotificationSkeleton() {
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
            <Skeleton variant="rounded" width={36} height={16} />
          </Stack>
          <Skeleton variant="text" width="55%" height={20} />
          <Skeleton variant="text" width="32%" height={16} sx={{ mt: 0.5 }} />
        </Box>
      </Stack>
    </Box>
  );
}

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
    appLog("frontend", "debug", "page", "notifications filter updated");
  }

  async function handlePageChange(_, newPage) {
    setPage(newPage);
    appLog("frontend", "debug", "page", "notifications page changed");
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
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3}>
        <Box>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <NotificationsNoneIcon sx={{ fontSize: 26, color: "primary.main" }} />
            <Typography variant="h5">Notifications</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, ml: "calc(26px + 12px)" }}>
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
              : "All caught up"}
          </Typography>
        </Box>
      </Stack>

      <Divider sx={{ mb: 3 }} />

      <Box sx={{ mb: 3 }}>
        <NotificationFilter value={filter} onChange={handleFilterChange} />
      </Box>

      {loading ? (
        <Stack spacing={1.5}>
          {[...Array(5)].map((_, i) => (
            <NotificationSkeleton key={i} />
          ))}
        </Stack>
      ) : null}

      {!loading && error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          Could not load notifications. Please try again.
        </Alert>
      ) : null}

      {!loading && !error && notifications.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            color: "text.secondary",
          }}
        >
          <NotificationsNoneIcon sx={{ fontSize: 48, color: "#CBD5E1", mb: 1.5 }} />
          <Typography variant="body1" color="text.secondary">
            No notifications for this filter
          </Typography>
        </Box>
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
            size="medium"
          />
        </Box>
      ) : null}
    </Box>
  );
}

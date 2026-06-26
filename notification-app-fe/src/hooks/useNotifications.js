import { useCallback, useEffect, useState } from "react";
import { Log } from "logging-middleware";
import { fetchNotifications } from "../api/notifications.js";

export function useNotifications({ page = 1, limit = 10, notificationType } = {}) {
  const [notifications, setNotifications] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await Log("frontend", "debug", "hook", "loading notifications");
      const data = await fetchNotifications({ page, limit, notificationType });
      setNotifications(data.notifications ?? []);
      setTotalPages(data.totalPages ?? data.pagination?.totalPages ?? 1);
    } catch (loadError) {
      const message =
        loadError instanceof Error ? loadError.message : "Unable to load notifications";
      setError(message);
      await Log("frontend", "error", "hook", "notifications hook failed");
    } finally {
      setLoading(false);
    }
  }, [page, limit, notificationType]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  return {
    notifications,
    totalPages,
    loading,
    error,
    reload: loadNotifications,
  };
}

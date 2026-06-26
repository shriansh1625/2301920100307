import { useEffect, useMemo, useState } from "react";
import { appLog } from "../utils/appLog.js";
import { fetchAllNotifications } from "../api/notifications.js";
import { getTopPriorityNotifications } from "../utils/priority.js";

export function usePriorityNotifications(limit = 10) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadPriorityNotifications() {
      setLoading(true);
      setError(null);

      try {
        appLog("frontend", "debug", "hook", "loading priority inbox");
        const allNotifications = await fetchAllNotifications();
        const ranked = getTopPriorityNotifications(allNotifications, limit);

        if (isMounted) {
          setNotifications(ranked);
        }

        appLog("frontend", "info", "hook", "priority inbox loaded");
      } catch (loadError) {
        const message =
          loadError instanceof Error ? loadError.message : "Unable to load priority inbox";

        if (isMounted) {
          setError(message);
        }

        appLog("frontend", "error", "hook", "priority hook failed");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadPriorityNotifications();

    return () => {
      isMounted = false;
    };
  }, [limit]);

  const topCountLabel = useMemo(() => `Top ${limit}`, [limit]);

  return {
    notifications,
    loading,
    error,
    topCountLabel,
  };
}

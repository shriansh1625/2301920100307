import { Log } from "logging-middleware";
import { getAuthToken, getApiBaseUrl } from "./auth.js";

const MAX_PAGE_LIMIT = 10;

function parseTotalPages(data) {
  if (typeof data.totalPages === "number") {
    return data.totalPages;
  }

  if (typeof data.pagination?.totalPages === "number") {
    return data.pagination.totalPages;
  }

  const totalItems = data.totalItems ?? data.pagination?.totalItems;
  const pageLimit = data.limit ?? data.pagination?.limit ?? MAX_PAGE_LIMIT;

  if (typeof totalItems === "number" && pageLimit > 0) {
    return Math.max(1, Math.ceil(totalItems / pageLimit));
  }

  return 1;
}

export async function fetchNotifications({ page = 1, limit = 10, notificationType } = {}) {
  await Log("frontend", "debug", "api", "fetch notifications request started");

  try {
    const token = await getAuthToken();
    const safeLimit = Math.min(Math.max(limit, 1), MAX_PAGE_LIMIT);
    const params = new URLSearchParams({
      page: String(page),
      limit: String(safeLimit),
    });

    if (notificationType && notificationType !== "All") {
      params.set("notification_type", notificationType);
    }

    const response = await fetch(
      `${getApiBaseUrl()}/notifications?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      await Log("frontend", "error", "api", "notifications fetch failed");
      throw new Error(errorText || `Request failed with status ${response.status}`);
    }

    const data = await response.json();
    await Log("frontend", "info", "api", "notifications fetched successfully");

    return {
      ...data,
      totalPages: parseTotalPages(data),
    };
  } catch (error) {
    await Log("frontend", "error", "api", "notifications request error");
    throw error;
  }
}

export async function fetchAllNotifications({ notificationType, maxPages = 20 } = {}) {
  const allNotifications = [];
  let page = 1;

  while (page <= maxPages) {
    const data = await fetchNotifications({
      page,
      limit: MAX_PAGE_LIMIT,
      notificationType,
    });

    const batch = data.notifications ?? [];

    if (batch.length === 0) {
      break;
    }

    allNotifications.push(...batch);

    const reportedTotalPages = data.totalPages ?? null;

    if (reportedTotalPages && page >= reportedTotalPages) {
      break;
    }

    if (batch.length < MAX_PAGE_LIMIT) {
      break;
    }

    page += 1;
  }

  return allNotifications;
}

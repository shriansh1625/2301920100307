const STORAGE_KEY = "viewed-notification-ids";

function readViewedIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeViewedIds(ids) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export function getViewedNotificationIds() {
  return new Set(readViewedIds());
}

export function markNotificationViewed(notificationId) {
  const viewed = getViewedNotificationIds();
  viewed.add(notificationId);
  writeViewedIds([...viewed]);
}

export function isNotificationViewed(notificationId, viewedIds) {
  return viewedIds.has(notificationId);
}

export function getUnreadCount(notifications, viewedIds) {
  return notifications.filter((notification) => !viewedIds.has(notification.ID)).length;
}

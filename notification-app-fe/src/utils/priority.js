const TYPE_WEIGHT = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

const WEIGHT_MULTIPLIER = 1_000_000_000_000;

export function parseTimestamp(timestamp) {
  const normalized = timestamp.includes("T")
    ? timestamp
    : `${timestamp.replace(" ", "T")}Z`;
  return Math.floor(new Date(normalized).getTime() / 1000);
}

export function calculatePriorityScore(notification) {
  const weight = TYPE_WEIGHT[notification.Type] ?? 0;
  const recency = parseTimestamp(notification.Timestamp);
  return weight * WEIGHT_MULTIPLIER + recency;
}

export function getTopPriorityNotifications(notifications, limit = 10) {
  return [...notifications]
    .map((notification) => ({
      ...notification,
      priorityScore: calculatePriorityScore(notification),
    }))
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, limit);
}

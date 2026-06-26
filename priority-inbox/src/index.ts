import "./loadEnv.js";
import { Log, getAccessToken, getEvalBaseUrl } from "logging-middleware";
import type { NotificationsResponse } from "./types.js";
import { getTopPriorityNotifications } from "./priority.js";

async function fetchNotifications(): Promise<NotificationsResponse> {
  const token = await getAccessToken();
  const url = `${getEvalBaseUrl()}/notifications`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Notifications API failed (${response.status}): ${errorText}`);
  }

  return (await response.json()) as NotificationsResponse;
}

function printResults(topNotifications: ReturnType<typeof getTopPriorityNotifications>) {
  process.stdout.write("Top 10 Priority Notifications\n");
  process.stdout.write("=".repeat(72) + "\n");

  topNotifications.forEach((notification, index) => {
    process.stdout.write(
      `${index + 1}. [${notification.Type}] ${notification.Message}\n`
    );
    process.stdout.write(
      `   ID: ${notification.ID} | Time: ${notification.Timestamp}\n`
    );
    process.stdout.write(
      `   Priority Score: ${notification.priorityScore}\n\n`
    );
  });
}

async function main() {
  await Log("backend", "info", "handler", "priority inbox run started");

  const data = await fetchNotifications();
  await Log(
    "backend",
    "debug",
    "handler",
    `fetched ${data.notifications.length} notifications`
  );

  const topTen = getTopPriorityNotifications(data.notifications, 10);
  printResults(topTen);

  await Log("backend", "info", "handler", "priority inbox run completed");
}

main().catch(async (error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown error";

  try {
    await Log("backend", "error", "handler", "priority inbox run failed");
  } catch {
    // Avoid masking the original failure.
  }

  process.stderr.write(`FAILED: ${message}\n`);
  process.exit(1);
});

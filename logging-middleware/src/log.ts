import { getAccessToken, getEvalBaseUrl } from "./auth.js";
import type { Level, LogPayload, LogResponse, Package, Stack } from "./types.js";

const BACKEND_PACKAGES = new Set([
  "cache",
  "controller",
  "cron_job",
  "db",
  "domain",
  "handler",
  "repository",
  "route",
  "service",
  "auth",
  "config",
  "middleware",
  "utils",
]);

const MAX_MESSAGE_LENGTH = 48;

const FRONTEND_PACKAGES = new Set([
  "api",
  "component",
  "hook",
  "page",
  "state",
  "style",
  "auth",
  "config",
  "middleware",
  "utils",
]);

function validateInput(
  stack: string,
  level: string,
  pkg: string,
  message: string
): LogPayload {
  const allowedLevels = ["debug", "info", "warn", "error", "fatal"];
  const allowedStacks = ["backend", "frontend"];

  if (!allowedStacks.includes(stack)) {
    throw new Error(`Invalid stack: ${stack}`);
  }

  if (!allowedLevels.includes(level)) {
    throw new Error(`Invalid level: ${level}`);
  }

  const trimmedMessage = message.trim();

  if (!trimmedMessage) {
    throw new Error("Log message cannot be empty");
  }

  if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
    throw new Error(
      `Log message must be at most ${MAX_MESSAGE_LENGTH} characters`
    );
  }

  if (stack === "backend" && !BACKEND_PACKAGES.has(pkg)) {
    throw new Error(`Invalid backend package: ${pkg}`);
  }

  if (stack === "frontend" && !FRONTEND_PACKAGES.has(pkg)) {
    throw new Error(`Invalid frontend package: ${pkg}`);
  }

  return {
    stack: stack as Stack,
    level: level as Level,
    package: pkg as Package,
    message: trimmedMessage,
  };
}

export async function Log(
  stack: string,
  level: string,
  pkg: string,
  message: string
): Promise<LogResponse> {
  const payload = validateInput(stack, level, pkg, message);
  const token = await getAccessToken();

  const response = await fetch(`${getEvalBaseUrl()}/logs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Log API failed (${response.status}): ${errorText}`);
  }

  return (await response.json()) as LogResponse;
}

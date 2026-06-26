import { Log } from "logging-middleware";

export function appLog(stack, level, pkg, message) {
  void Log(stack, level, pkg, message).catch(() => {
    // Logging must not block or break UI flows.
  });
}

import "./loadEnv.js";
import { Log } from "./log.js";

async function runTest() {
  const result = await Log(
    "backend",
    "info",
    "middleware",
    "logging middleware initialized"
  );

  if (result.logID) {
    process.stdout.write(`SUCCESS: log created with logID=${result.logID}\n`);
  } else {
    process.stderr.write("FAILED: no logID returned\n");
    process.exit(1);
  }
}

runTest().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  process.stderr.write(`FAILED: ${message}\n`);
  process.exit(1);
});

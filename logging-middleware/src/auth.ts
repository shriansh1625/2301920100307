import type { AuthResponse } from "./types.js";

let manualConfig: Record<string, string> | null = null;
let cachedToken: string | null = null;
let tokenExpiresAt = 0;

export function configure(env: Record<string, string>): void {
  manualConfig = env;
  cachedToken = null;
  tokenExpiresAt = 0;
}

function readEnv(name: string): string | undefined {
  if (manualConfig?.[name]) {
    return manualConfig[name].trim();
  }

  if (typeof process !== "undefined" && process.env?.[name]) {
    return process.env[name]?.trim();
  }

  return undefined;
}

function getRequiredEnv(name: string): string {
  const value = readEnv(name);
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getEvalBaseUrl(): string {
  return readEnv("EVAL_BASE_URL") || "http://4.224.186.213/evaluation-service";
}

function isTokenValid(): boolean {
  if (!cachedToken) return false;
  const nowInSeconds = Math.floor(Date.now() / 1000);
  return nowInSeconds < tokenExpiresAt - 30;
}

export async function getAccessToken(): Promise<string> {
  if (isTokenValid() && cachedToken) {
    return cachedToken;
  }

  const authUrl = `${getEvalBaseUrl()}/auth`;

  const body = {
    email: getRequiredEnv("EVAL_EMAIL"),
    name: getRequiredEnv("EVAL_NAME"),
    rollNo: getRequiredEnv("EVAL_ROLL_NO"),
    accessCode: getRequiredEnv("EVAL_ACCESS_CODE"),
    clientID: getRequiredEnv("EVAL_CLIENT_ID"),
    clientSecret: getRequiredEnv("EVAL_CLIENT_SECRET"),
  };

  const response = await fetch(authUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Auth failed (${response.status}): ${errorText}`);
  }

  const data = (await response.json()) as AuthResponse;

  cachedToken = data.access_token;
  tokenExpiresAt = data.expires_in;

  return cachedToken;
}

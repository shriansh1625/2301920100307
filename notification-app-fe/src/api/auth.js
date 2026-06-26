import { configure, getAccessToken } from "logging-middleware";
import { getEvalConfig } from "../config/evalConfig.js";

const PROXY_BASE_URL = "/evaluation-service";

let isConfigured = false;

function ensureConfigured() {
  if (isConfigured) {
    return;
  }

  const evalConfig = getEvalConfig();
  configure({
    ...evalConfig,
    EVAL_BASE_URL: PROXY_BASE_URL,
  });
  isConfigured = true;
}

export async function getAuthToken() {
  ensureConfigured();
  return getAccessToken();
}

export function getApiBaseUrl() {
  return PROXY_BASE_URL;
}

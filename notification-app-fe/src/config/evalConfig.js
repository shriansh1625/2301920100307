const evalConfig = typeof __EVAL_CONFIG__ !== "undefined" ? __EVAL_CONFIG__ : {};

export function getEvalConfig() {
  return evalConfig;
}

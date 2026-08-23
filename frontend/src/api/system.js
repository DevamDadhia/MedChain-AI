import api from "./client";

/**
 * Fetch system health status
 * Endpoint: GET /health
 */
export async function getHealth() {
  return await api.get("/health");
}

/**
 * Fetch database readiness status
 * Endpoint: GET /ready
 */
export async function getReady() {
  return await api.get("/ready");
}

/**
 * Fetch registered API endpoints registry
 * Endpoint: GET /api-info
 */
export async function getApiInfo() {
  return await api.get("/api-info");
}

/**
 * Fetch system version info
 * Endpoint: GET /system/version
 */
export async function getSystemVersion() {
  return await api.get("/system/version");
}

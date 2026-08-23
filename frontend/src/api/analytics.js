import api from "./client";

/**
 * Fetch hospital time-series telemetry data (bed occupancy, admissions, staff count, flu cases)
 * Endpoint: GET /data/timeseries?limit=100
 */
export async function getTimeseries(limit = 100) {
  return await api.get("/data/timeseries", { limit });
}

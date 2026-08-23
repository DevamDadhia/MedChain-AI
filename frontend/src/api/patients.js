import api from "./client";

/**
 * Fetch patient admissions and clinical resource usage data
 * Endpoint: GET /data/patients?limit=100
 */
export async function getPatients(limit = 100) {
  return await api.get("/data/patients", { limit });
}

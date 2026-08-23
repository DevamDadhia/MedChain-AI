import api from "./client";

/**
 * Fetch unified dashboard telemetry and AI briefing
 * Endpoint: GET /dashboard
 */
export async function getDashboard() {
  return await api.get("/dashboard");
}

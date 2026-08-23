import api from "./client";

/**
 * Fetch hospital staff workload and roster data
 * Endpoint: GET /data/staff?limit=100
 */
export async function getStaff(limit = 100) {
  return await api.get("/data/staff", { limit });
}

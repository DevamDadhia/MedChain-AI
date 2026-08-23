import api from "./client";

/**
 * Fetch medical vendor catalog and reliability ratings
 * Endpoint: GET /data/vendors?limit=100
 */
export async function getVendors(limit = 100) {
  return await api.get("/data/vendors", { limit });
}

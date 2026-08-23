import api from "./client";

/**
 * Fetch hospital inventory assets
 * Endpoint: GET /data/inventory?limit=100
 */
export async function getInventory(limit = 100) {
  return await api.get("/data/inventory", { limit });
}

/**
 * Fetch medicine transactions/catalog
 * Endpoint: GET /data/medicines?limit=100
 */
export async function getMedicines(limit = 100) {
  return await api.get("/data/medicines", { limit });
}

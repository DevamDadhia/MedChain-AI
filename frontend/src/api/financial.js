import api from "./client";

/**
 * Fetch hospital financial expenditures and transactions
 * Endpoint: GET /data/financial?limit=100
 */
export async function getFinancial(limit = 100) {
  return await api.get("/data/financial", { limit });
}

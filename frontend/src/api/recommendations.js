import api from "./client";

/**
 * Fetch algorithmic inventory, bed, and staffing recommendations
 * Endpoint: GET /recommendations
 */
export async function getRecommendations() {
  return await api.get("/recommendations");
}

import api from "./client";

/**
 * Fetch Gemini AI configuration status
 * Endpoint: GET /ai/status
 */
export async function getAIStatus() {
  return await api.get("/ai/status");
}

/**
 * Run Gemini AI Healthcare Operations Analysis
 * Endpoint: POST /ai/analyze
 */
export async function analyzeContext(context) {
  return await api.post("/ai/analyze", { context });
}

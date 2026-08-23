// Centralized API client for HEALTHGRID FastAPI Backend

const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000").replace(/\/+$/, "");

/**
 * Custom API Error containing status, payload, and user-friendly error message.
 */
export class ApiError extends Error {
  constructor(message, status = 0, data = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

/**
 * Standard HTTP Request Wrapper
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  
  const headers = {
    "Accept": "application/json",
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...options.headers,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeout || 15000);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Parse JSON or text
    let data;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      let message = `API Error (${response.status}): ${response.statusText}`;
      if (data && typeof data === "object") {
        if (typeof data.detail === "string") {
          message = data.detail;
        } else if (Array.isArray(data.detail)) {
          // Pydantic validation errors
          message = data.detail.map((err) => `${err.loc?.join(".") || "field"}: ${err.msg}`).join(", ");
        } else if (data.message) {
          message = data.message;
        }
      }
      throw new ApiError(message, response.status, data);
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw new ApiError("Request timed out. Please check if the HEALTHGRID backend is responding.", 408);
    }
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      `Unable to connect to HEALTHGRID backend at ${API_BASE_URL}. Ensure FastAPI is running on port 8000. (${error.message})`,
      0,
      error
    );
  }
}

export const api = {
  get: (endpoint, params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) query.append(key, val);
    });
    const queryString = query.toString();
    const finalEndpoint = queryString ? `${endpoint}?${queryString}` : endpoint;
    return request(finalEndpoint, { method: "GET" });
  },

  post: (endpoint, body = {}) => {
    return request(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  getBaseUrl: () => API_BASE_URL,
};

export default api;

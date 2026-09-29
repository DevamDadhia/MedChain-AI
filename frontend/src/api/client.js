// Centralized API client for HEALTHGRID FastAPI Backend

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"
).replace(/\/+$/, "");

const DEFAULT_TIMEOUT = 60000; // 60 seconds
const NORMAL_TIMEOUT = 30000;  // 30 seconds
const RETRY_DELAY = 2000;      // 2 seconds

/**
 * Custom API Error containing status, payload,
 * and user-friendly error message.
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
 * Wait helper
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Standard HTTP Request Wrapper
 */
async function request(endpoint, options = {}) {
  const normalizedEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  const url = `${API_BASE_URL}${normalizedEndpoint}`;

  const headers = {
    Accept: "application/json",
    ...(options.body
      ? { "Content-Type": "application/json" }
      : {}),
    ...options.headers,
  };

  const isHealthCheck = normalizedEndpoint === "/health";
  const isDashboardRequest = normalizedEndpoint === "/dashboard";

  // Give Render enough time to wake up for initial health/dashboard calls.
  const timeout =
    options.timeout ||
    (isHealthCheck || isDashboardRequest
      ? DEFAULT_TIMEOUT
      : NORMAL_TIMEOUT);

  // Only retry safe GET requests used during initial connection.
  const shouldRetry =
    options.method === "GET" &&
    (isHealthCheck || isDashboardRequest);

  const maxAttempts = shouldRetry ? 2 : 1;

  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const controller = new AbortController();

    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeout);

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

      if (
        contentType &&
        contentType.includes("application/json")
      ) {
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
            message = data.detail
              .map(
                (err) =>
                  `${err.loc?.join(".") || "field"}: ${err.msg}`
              )
              .join(", ");
          } else if (data.message) {
            message = data.message;
          }
        }

        throw new ApiError(
          message,
          response.status,
          data
        );
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);

      lastError = error;

      // Retry only connection/time-out failures.
      if (
        shouldRetry &&
        attempt < maxAttempts &&
        (
          error?.name === "AbortError" ||
          error?.status === 408 ||
          error?.status === 0
        )
      ) {
        await sleep(RETRY_DELAY);
        continue;
      }

      if (error?.name === "AbortError") {
        throw new ApiError(
          "The HEALTHGRID backend is taking longer than expected to respond. Please try again.",
          408
        );
      }

      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(
        `Unable to connect to the HEALTHGRID backend. The server may be waking up or temporarily unavailable. (${error.message})`,
        0,
        error
      );
    }
  }

  throw new ApiError(
    "Unable to connect to the HEALTHGRID backend. Please try again.",
    0,
    lastError
  );
}

export const api = {
  get: (endpoint, params = {}) => {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        query.append(key, val);
      }
    });

    const queryString = query.toString();

    const finalEndpoint = queryString
      ? `${endpoint}?${queryString}`
      : endpoint;

    return request(finalEndpoint, {
      method: "GET",
    });
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
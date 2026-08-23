import React from "react";
import { AlertOctagon, RefreshCw, ServerOff } from "lucide-react";

export function ErrorBanner({ message, onRetry, title = "Backend Connection Issue" }) {
  return (
    <div className="error-banner" role="alert">
      <div className="error-banner-icon">
        <ServerOff size={28} />
      </div>
      <div className="error-banner-content">
        <h4 className="error-banner-title">{title}</h4>
        <p className="error-banner-message">{message || "Failed to communicate with the HEALTHGRID API."}</p>
        <div className="error-banner-hints">
          <span>Make sure the backend is active at <code>http://127.0.0.1:8000</code></span>
        </div>
      </div>
      {onRetry && (
        <button className="error-retry-btn" onClick={onRetry} aria-label="Retry connection">
          <RefreshCw size={15} />
          <span>Retry</span>
        </button>
      )}
    </div>
  );
}

export default ErrorBanner;

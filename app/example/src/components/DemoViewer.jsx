import { useState } from "react";
import {
  ExternalLink,
  RefreshCw,
  Maximize2,
  Minimize2,
  Monitor,
  Smartphone,
} from "lucide-react";
import "../styles/DemoViewer.css";

function DemoViewer({ demoUrl, title }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState("desktop"); // desktop, mobile
  const [isLoading, setIsLoading] = useState(true);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    // Force iframe reload by changing src
    const iframe = document.getElementById("demo-iframe");
    if (iframe) {
      iframe.src = iframe.src;
    }
  };

  const openInNewTab = () => {
    window.open(demoUrl, "_blank", "noopener,noreferrer");
  };

  if (!demoUrl) {
    return (
      <div className="demo-viewer">
        <div className="empty-state">
          <Monitor size={48} />
          <h3>No demo available</h3>
          <p>The generated component doesn't have a demo URL yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`demo-viewer ${isFullscreen ? "fullscreen" : ""}`}>
      <div className="demo-header">
        <div className="demo-title">
          <h2>
            <Monitor size={24} />
            Live Demo
          </h2>
          <p>{title}</p>
        </div>

        <div className="demo-controls">
          <div className="view-modes">
            <button
              className={`view-mode-button ${
                viewMode === "desktop" ? "active" : ""
              }`}
              onClick={() => setViewMode("desktop")}
              title="Desktop view"
            >
              <Monitor size={16} />
            </button>
            <button
              className={`view-mode-button ${
                viewMode === "mobile" ? "active" : ""
              }`}
              onClick={() => setViewMode("mobile")}
              title="Mobile view"
            >
              <Smartphone size={16} />
            </button>
          </div>

          <div className="demo-actions">
            <button
              className="action-button"
              onClick={handleRefresh}
              title="Refresh demo"
            >
              <RefreshCw size={16} />
            </button>
            <button
              className="action-button"
              onClick={toggleFullscreen}
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
            <button
              className="action-button"
              onClick={openInNewTab}
              title="Open in new tab"
            >
              <ExternalLink size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="demo-content">
        {isLoading && (
          <div className="loading-overlay">
            <div className="loading-spinner">
              <RefreshCw className="animate-spin" size={32} />
            </div>
            <p>Loading demo...</p>
          </div>
        )}

        <div className={`iframe-container ${viewMode}`}>
          <iframe
            id="demo-iframe"
            src={demoUrl}
            title={`Demo: ${title}`}
            onLoad={handleIframeLoad}
            className="demo-iframe"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
            loading="lazy"
          />
        </div>
      </div>

      <div className="demo-footer">
        <div className="demo-info">
          <span className="demo-url">
            <ExternalLink size={14} />
            <a href={demoUrl} target="_blank" rel="noopener noreferrer">
              {demoUrl}
            </a>
          </span>
        </div>
        <div className="demo-status">
          <span
            className={`status-indicator ${isLoading ? "loading" : "loaded"}`}
          >
            {isLoading ? "Loading..." : "Loaded"}
          </span>
        </div>
      </div>
    </div>
  );
}

export default DemoViewer;

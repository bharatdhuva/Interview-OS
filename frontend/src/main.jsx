import React, { Component } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "your_google_client_id_here";
class ErrorBoundary extends Component {
    state = { hasError: false, error: null };
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error("Caught by ErrorBoundary", error, errorInfo);
    }
    render() {
        if (this.state.hasError)
            return (<div style={{ color: "red", padding: "20px", fontFamily: "monospace" }}>
          <h2>App Crash</h2>
          <pre>{this.state.error?.stack || this.state.error?.message}</pre>
        </div>);
        return this.props.children;
    }
}
createRoot(document.getElementById("root")).render(<GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </GoogleOAuthProvider>);

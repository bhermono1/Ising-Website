"use client";

import { useEffect } from "react";

// Rendered only if the root layout itself throws — kept minimal and
// self-contained (own <html>/<body>, inline styles, no shared providers)
// since whatever crashed the layout could be part of that shared chain.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#09080f",
          color: "#f4f2fa",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Something went wrong</h1>
        <p style={{ color: "#9b96b3", marginBottom: "1.5rem" }}>Please try reloading the page.</p>
        <button
          onClick={reset}
          style={{
            background: "linear-gradient(135deg, #ff2d78, #7c3aed)",
            color: "#fff",
            border: "none",
            borderRadius: "9999px",
            padding: "0.75rem 1.5rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}

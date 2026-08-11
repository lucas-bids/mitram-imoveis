"use client";

import { useEffect } from "react";
import { reportClientError } from "@/lib/logger";

// Catches crashes in the root layout itself, which the segment-level
// error.tsx can't reach. Per Next.js convention it must render its own
// <html>/<body> and stay self-contained — it may be rendering precisely
// because the app's own layout/components just failed.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportClientError("global-error-boundary", error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            padding: "1rem",
            textAlign: "center",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1rem" }}>
            Algo deu errado
          </h2>
          <p style={{ marginBottom: "2rem", maxWidth: "28rem" }}>
            Desculpe, ocorreu um erro inesperado. Tente novamente.
          </p>
          <button
            onClick={() => reset()}
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "0.5rem",
              border: "1px solid #ccc",
              cursor: "pointer",
            }}
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  );
}

type LogLevel = "error" | "warn";
type LogContext = Record<string, unknown>;

function serializeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      // Next.js attaches `digest` to errors that crossed the server/client
      // boundary, so it can be grepped against the generic message shown
      // to the user to find this full log entry.
      digest: (error as Error & { digest?: string }).digest,
    };
  }
  return { name: "NonError", message: String(error) };
}

// Emits one single-line JSON string per event. Netlify's log stream is
// shared across concurrent invocations, so a multi-line console.error can
// interleave with another request's output; a single line keeps each
// event atomic and greppable by scope while preserving the full stack.
function emit(level: LogLevel, scope: string, message: string, error?: unknown, context?: LogContext) {
  const line = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    scope,
    message,
    ...(error !== undefined ? { error: serializeError(error) } : {}),
    ...(context ? { context } : {}),
  });

  if (level === "error") console.error(line);
  else console.warn(line);
}

export function logError(scope: string, error: unknown, context?: LogContext) {
  const message = error instanceof Error ? error.message : String(error);
  emit("error", scope, message, error, context);
}

export function logWarn(scope: string, message: string, context?: LogContext) {
  emit("warn", scope, message, undefined, context);
}

// Called from client-side error boundaries: logs to the browser console
// (useful with devtools open) and forwards to /api/log-error so the event
// also lands in Netlify's server logs, since browser console output is
// otherwise invisible to us in production. Fire-and-forget by design — a
// failed report must never surface to the user.
export function reportClientError(scope: string, error: Error & { digest?: string }) {
  logError(scope, error);
  fetch("/api/log-error", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: error.message,
      stack: error.stack,
      digest: error.digest,
      scope,
      url: typeof window !== "undefined" ? window.location.href : undefined,
    }),
  }).catch(() => {});
}

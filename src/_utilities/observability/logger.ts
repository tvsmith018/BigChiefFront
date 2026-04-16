type LogLevel = "info" | "warn" | "error";

type LogContext = Record<string, unknown> | undefined;

const shouldEmitInfoOrWarn =
  process.env.NODE_ENV !== "production" ||
  process.env.NEXT_PUBLIC_OBSERVABILITY_DEBUG === "true";

function sanitizeContext(context: LogContext) {
  if (!context) return undefined;
  const next = { ...context };
  if ("access" in next) next.access = "[redacted]";
  if ("refresh" in next) next.refresh = "[redacted]";
  if ("authorization" in next) next.authorization = "[redacted]";
  return next;
}

function emit(level: LogLevel, event: string, context?: LogContext) {
  const payload = {
    ts: new Date().toISOString(),
    level,
    event,
    context: sanitizeContext(context),
  };

  if (level === "error") {
    console.error(payload);
    return;
  }

  if (!shouldEmitInfoOrWarn) return;

  if (level === "warn") {
    console.warn(payload);
    return;
  }

  console.info(payload);
}

export function logInfo(event: string, context?: LogContext) {
  emit("info", event, context);
}

export function logWarn(event: string, context?: LogContext) {
  emit("warn", event, context);
}

export function logError(
  event: string,
  error: unknown,
  context?: LogContext
) {
  const errorContext: Record<string, unknown> = {};
  if (error instanceof Error) {
    errorContext.name = error.name;
    errorContext.message = error.message;
    errorContext.stack = error.stack;
  } else {
    errorContext.message = String(error);
  }

  emit("error", event, { ...context, ...errorContext });
}

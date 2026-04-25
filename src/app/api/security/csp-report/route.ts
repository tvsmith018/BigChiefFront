import { NextResponse } from "next/server";

import { logWarn } from "@/_utilities/observability/logger";

type LegacyCspReport = {
  "csp-report"?: {
    "blocked-uri"?: string;
    "document-uri"?: string;
    "effective-directive"?: string;
    "violated-directive"?: string;
    "original-policy"?: string;
    "source-file"?: string;
    "line-number"?: number;
    disposition?: string;
  };
};

type ReportingApiEnvelope = Array<{
  type?: string;
  url?: string;
  body?: {
    blockedURL?: string;
    documentURL?: string;
    effectiveDirective?: string;
    violatedDirective?: string;
    originalPolicy?: string;
    sourceFile?: string;
    lineNumber?: number;
    disposition?: string;
  };
}>;

function sanitizeUrl(value: unknown) {
  if (typeof value !== "string" || value.length === 0) return undefined;
  try {
    const url = new URL(value);
    return `${url.origin}${url.pathname}`;
  } catch {
    return value.slice(0, 200);
  }
}

export async function POST(request: Request) {
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  const contentType = request.headers.get("content-type");

  try {
    const text = await request.text();
    if (!text) {
      logWarn("security_csp_report_empty", { requestId, contentType });
      return new NextResponse(null, { status: 204 });
    }

    const parsed = JSON.parse(text) as LegacyCspReport | ReportingApiEnvelope;

    if (Array.isArray(parsed)) {
      for (const entry of parsed) {
        if (entry.type !== "csp-violation") continue;
        logWarn("security_csp_violation_reported", {
          requestId,
          reportType: entry.type,
          blockedUri: sanitizeUrl(entry.body?.blockedURL),
          documentUri: sanitizeUrl(entry.body?.documentURL ?? entry.url),
          effectiveDirective: entry.body?.effectiveDirective,
          violatedDirective: entry.body?.violatedDirective,
          sourceFile: sanitizeUrl(entry.body?.sourceFile),
          lineNumber: entry.body?.lineNumber,
          disposition: entry.body?.disposition,
        });
      }
      return new NextResponse(null, { status: 204 });
    }

    const report = parsed["csp-report"];
    if (report) {
      logWarn("security_csp_violation_reported", {
        requestId,
        blockedUri: sanitizeUrl(report["blocked-uri"]),
        documentUri: sanitizeUrl(report["document-uri"]),
        effectiveDirective: report["effective-directive"],
        violatedDirective: report["violated-directive"],
        sourceFile: sanitizeUrl(report["source-file"]),
        lineNumber: report["line-number"],
        disposition: report.disposition,
      });
      return new NextResponse(null, { status: 204 });
    }

    logWarn("security_csp_report_unrecognized_payload", {
      requestId,
      contentType,
    });
    return new NextResponse(null, { status: 204 });
  } catch {
    logWarn("security_csp_report_parse_failed", {
      requestId,
      contentType,
    });
    return new NextResponse(null, { status: 204 });
  }
}

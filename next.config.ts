import type { NextConfig } from "next";

const cspReportOnly = [
  "default-src 'self'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "img-src 'self' https: data: blob:",
  "font-src 'self' https: data:",
  "style-src 'self' 'unsafe-inline' https:",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
  "connect-src 'self' https: wss:",
  "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://www.facebook.com https://web.facebook.com",
  "form-action 'self'",
  "report-uri /api/security/csp-report",
  "report-to csp-endpoint",
].join("; ");

const cspReportToHeader = JSON.stringify({
  group: "csp-endpoint",
  max_age: 10886400,
  endpoints: [{ url: "/api/security/csp-report" }],
});

function parseAllowedDevOrigins(value?: string) {
  if (!value) return [];
  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

const allowedDevOrigins = Array.from(new Set([
  ...parseAllowedDevOrigins(process.env.ALLOWED_DEV_ORIGINS),
  "bigchiefdev.ngrok.app",
]));

const nextConfig: NextConfig = {
  images: {
    // Avoid Next image optimizer upstream timeouts in local dev by fetching
    // remote images directly from the browser.
    unoptimized: process.env.NODE_ENV === "development",
    remotePatterns:[
      {
        protocol: "https",
        hostname: 'res.cloudinary.com',
      },
    ]
  },
  devIndicators: false,
  allowedDevOrigins,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Report-To", value: cspReportToHeader },
          {
            key: "Reporting-Endpoints",
            value: 'csp-endpoint="/api/security/csp-report"',
          },
          { key: "Content-Security-Policy-Report-Only", value: cspReportOnly },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

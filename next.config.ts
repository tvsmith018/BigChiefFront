import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { remotePatterns:[
      {
        hostname: 'res.cloudinary.com',
      },
    ]
  },
  devIndicators: false,
  allowedDevOrigins: ["192.168.1.141", "bigchiefdev.ngrok.app"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
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

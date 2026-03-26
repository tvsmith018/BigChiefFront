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
};

export default nextConfig;

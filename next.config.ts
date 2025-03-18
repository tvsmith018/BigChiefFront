import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { remotePatterns:[
      {
        hostname: 'res.cloudinary.com',
      },
    ]
  },
  devIndicators: false,
  ignoreBuildErrors: true,
};

export default nextConfig;

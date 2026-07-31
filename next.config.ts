import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Next 16 only allows quality values listed here (default is [75] alone)
    // — an unlisted `quality` prop is silently coerced to the nearest one.
    qualities: [75, 90],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;

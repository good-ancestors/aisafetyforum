import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/scholarship',
        destination: '/scholarships',
        permanent: true,
      },
      {
        source: '/sponsor',
        destination: '/sponsorship',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

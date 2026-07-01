import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'drive.google.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/panduan-ppdb.pdf',
        destination: '/ppdb/panduan',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;

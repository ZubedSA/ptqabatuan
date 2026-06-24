import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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

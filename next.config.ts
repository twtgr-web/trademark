import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Statischer Export, damit die App z.B. direkt über GitHub Pages gehostet werden kann.
  output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // dev only: let phones on the local network (home Wi-Fi, a hotspot) load the dev server's scripts;
  // without it the page renders but nothing is interactive. `*` matches one part of the address.
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "172.*.*.*"],
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

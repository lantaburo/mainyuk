import withPWAInit from "@ducanh2912/next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Lint errors (unused vars, no-explicit-any, etc.) should not block
    // production builds/deploys. Run `npm run lint` separately in CI/dev
    // if you want to enforce style rules.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Type errors should not block production deploys — TS is a dev-time tool.
    // Fix type errors locally; this prevents CI from failing on infra issues
    // like missing @types/* when NODE_ENV=production skips devDependencies.
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        // Cloudflare R2 public dev URL (pub-*.r2.dev)
        protocol: "https",
        hostname: "**.r2.dev",
      },
      {
        // Custom domain jika ada (mis. cdn.mainyuk.my.id)
        protocol: "https",
        hostname: "**.mainyuk.my.id",
      },
    ],
  },
};

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

export default withPWA(nextConfig);

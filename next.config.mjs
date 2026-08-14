/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Lint errors (unused vars, no-explicit-any, etc.) should not block
    // production builds/deploys. Run `npm run lint` separately in CI/dev
    // if you want to enforce style rules.
    ignoreDuringBuilds: true,
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

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        // Cloudflare R2 public dev URL (pub-*.r2.dev)
        protocol: "https",
        hostname: "**.r2.dev",
      },
      {
        // Custom domain jika ada (mis. cdn.klikweb.id)
        protocol: "https",
        hostname: "**.klikweb.id",
      },
    ],
  },
};

export default nextConfig;

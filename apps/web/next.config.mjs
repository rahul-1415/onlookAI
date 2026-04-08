/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@onlook/shared-types", "@onlook/ui", "@onlook/prompts"],
  experimental: {
    typedRoutes: true
  }
};

export default nextConfig;


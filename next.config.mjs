/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cvfqzmprnwkxqnzqhtpj.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
    ],
  },
  // Server code never ships to browsers, so minifying it only saves a
  // little cold-start time at the cost of unreadable production stack
  // traces (mangled names, no line mapping). Disabling it keeps server
  // errors legible in Netlify's logs.
  // (Line-accurate server source maps, `experimental.serverSourceMaps`,
  // don't exist yet on Next 14.2.14 — would need a Next 15 upgrade.)
  experimental: {
    serverMinification: false,
  },
  // Makes client chunk .js.map files available on request, so a browser
  // stack trace forwarded via /api/log-error can be manually resolved back
  // to source. Off by default in Next.js; does not affect what ships to
  // visitors, only what's available at /_next/static/**/*.js.map.
  productionBrowserSourceMaps: true,
};

export default nextConfig;

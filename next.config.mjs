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
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
    ],
  },
  // Server code never ships to browsers, so minifying it only saves a
  // little cold-start time at the cost of unreadable production stack
  // traces (mangled names, no line mapping). Disabling it keeps server
  // errors legible in Netlify's logs.
  // Next 15.5 does support `experimental.serverSourceMaps`, but it stays off
  // on purpose: it enlarges the Netlify function bundle, and unminified
  // server output is already enough to read a stack trace.
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

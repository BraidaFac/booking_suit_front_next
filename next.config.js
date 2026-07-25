/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // Allow dev server to accept requests from tunnel origins (ngrok, Cloudflare)
  allowedDevOrigins: [
    '*.ngrok.io',
    '*.ngrok-free.app',
    '*.trycloudflare.com',
  ],
};

module.exports = nextConfig;

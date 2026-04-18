/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['res.cloudinary.com'],
  },
  async headers() {
    return [
      {
        // Apply these headers to all routes.
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            // Restrict resources to our own domain, Appwrite and Cloudinary.  Allow inline
            // styles for Tailwind and safe inline scripts required by Next.js.  You may
            // further tighten this policy based on your needs.
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https://res.cloudinary.com",
              "media-src https://res.cloudinary.com",
              "connect-src 'self' https://cloud.appwrite.io https://res.cloudinary.com",
              "frame-ancestors 'none'",
              "base-uri 'self'",
            ].join('; '),
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            // Disable camera, microphone and geolocation by default
            value: 'camera=(), microphone=(), geolocation=()'
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
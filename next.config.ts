import type { NextConfig } from "next";

const IS_PROD = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  async headers() {
    const scriptSrc = IS_PROD
      ? "script-src 'self' 'unsafe-inline'"
      : "script-src 'self' 'unsafe-inline' 'unsafe-eval'";

    const connectSrc = IS_PROD
      ? "connect-src 'self'"
      : "connect-src 'self' ws: http: https://api.sarvam.ai";

    return [
      {
        // Apply to all routes
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Keep dev tooling flexible; tighten eval in production.
              scriptSrc,
              // Tailwind inline styles + Google Fonts
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              // Google Fonts font files
              "font-src 'self' https://fonts.gstatic.com",
              // Browser only needs app endpoints in production.
              connectSrc,
              // Audio blobs created via URL.createObjectURL
              "media-src 'self' blob:",
              "img-src 'self' data:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;

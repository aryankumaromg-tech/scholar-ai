import type { NextConfig } from "next";

const securityHeaders = [
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Arena and other deployment dashboards render previews in a cross-origin iframe.
  // Do not send X-Frame-Options: SAMEORIGIN here, otherwise the preview is blocked.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // officeparser resolves pdfjs workers and internal assets at runtime;
  // bundling it breaks PDF text extraction inside a serverless function.
  serverExternalPackages: ["officeparser"],
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.aryankumaromg.xyz" }],
        destination: "https://aryankumaromg.xyz/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Listing photos are uploaded to Vercel Blob (see src/actions/listings.ts)
    // — local disk writes don't persist on Vercel's serverless filesystem, so
    // next/image needs this remote host allow-listed to render them.
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
};

export default nextConfig;

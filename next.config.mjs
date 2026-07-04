/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      // Supabase Storage (posters y fotos de autor subidos desde el panel)
      { protocol: "https", hostname: "mqsbbptkhkkjjrkdwgvf.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
  },
  experimental: {
    optimizePackageImports: ["gsap", "lenis"],
  },
};

export default nextConfig;

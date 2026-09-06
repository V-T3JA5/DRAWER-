/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export — no server needed, works on Vercel or any static host
  // with zero runtime server cost. Manifest + content are read at build
  // time via Server Components; nothing here needs a live server.
  output: 'export',
  images: {
    // The default Image Optimization API needs a running server, which
    // static export doesn't have. Cover/step images are small, pre-sized
    // SVGs/photos anyway, so unoptimized <Image> is the right tradeoff
    // here rather than pulling in a separate optimization pipeline.
    unoptimized: true,
  },
};

module.exports = nextConfig;

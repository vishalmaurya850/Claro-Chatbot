/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: [
    '@pinecone-database/pinecone',
  ],
  env: {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig

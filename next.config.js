/******************
 * Next.js config *
 ******************/
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    ACCESS_KEY_ID_AWS: process.env.ACCESS_KEY_ID_AWS,
    SECRET_ACCESS_KEY_AWS: process.env.SECRET_ACCESS_KEY_AWS,
    REGION_AWS: process.env.REGION_AWS,
    ENVIRONMENT: process.env.ENVIRONMENT,
  },
};

module.exports = nextConfig;
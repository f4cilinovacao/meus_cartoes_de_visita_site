/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  bundler: "webpack",
};

module.exports = nextConfig;

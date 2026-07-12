/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // core는 dist(빌드), ui/api-client는 TS 소스 → 트랜스파일 대상
  transpilePackages: ["@lucky/core", "@lucky/ui", "@lucky/api-client"],
};

export default nextConfig;

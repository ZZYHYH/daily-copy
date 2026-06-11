import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true, // 静态导出需要禁用图片优化
  },
  // 压缩配置
  compress: true,
  // 生产环境 Source Map
  productionBrowserSourceMaps: false,
};

export default nextConfig;

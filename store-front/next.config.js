const nextConfig = {
  // Base path configuration for deployment
  basePath: '',
  
  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  
  // Production optimizations
  swcMinify: true,
  compress: true,
  
  // Environment-specific configurations
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api',
  },
};

module.exports = nextConfig;

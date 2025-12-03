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
  // swcMinify: true, // This option is not valid in Next.js 16+
  compress: true,
  
  // Ensure proper MIME types for static assets
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
  
  // Environment-specific configurations
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api',
  },
};

module.exports = nextConfig;

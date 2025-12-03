# Deployment Guide

This guide provides step-by-step instructions for deploying all applications in this monorepo to Vercel.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [Frontend Applications](#frontend-applications)
   - [Admin Panel](#admin-panel)
   - [Seller Panel](#seller-panel)
   - [Store Front](#store-front)
4. [Backend API](#backend-api)
5. [Deployment Process](#deployment-process)
6. [Post-Deployment Verification](#post-deployment-verification)

## Prerequisites

Before deploying, ensure you have:

1. A Vercel account
2. Access to MongoDB database
3. Access to Supabase project
4. Cloudinary account
5. Node.js 18+ installed locally (for testing)

## Environment Variables

Each application requires specific environment variables. Check the `.env.example` files in each directory:

- Backend: [backend/.env.example](backend/.env.example)
- Admin Panel: [admin-panel/.env.example](admin-panel/.env.example) (if applicable)
- Seller Panel: [seller-panel/.env.example](seller-panel/.env.example) (if applicable)
- Store Front: [store-front/.env.example](store-front/.env.example) (if applicable)

## Frontend Applications

### Admin Panel

**Base Path**: `/admin/`
**Framework**: Vite + React
**Build Command**: `npm run build`
**Output Directory**: `dist/`

Key configurations:
- Base path configured in [vite.config.ts](admin-panel/vite.config.ts)
- Routing compatible with Vercel
- Bundle optimization with manual chunking

### Seller Panel

**Base Path**: `/seller/`
**Framework**: Vite + React
**Build Command**: `npm run build`
**Output Directory**: `dist/`

Key configurations:
- Base path configured in [vite.config.ts](seller-panel/vite.config.ts)
- Routing compatible with Vercel
- Bundle optimization with manual chunking

### Store Front

**Base Path**: `/`
**Framework**: Next.js
**Build Command**: `npm run build`
**Output Directory**: `.next/`

Key configurations:
- Optimized for Next.js deployment
- Image optimization for Cloudinary
- Bundle analyzer support

## Backend API

**Framework**: Node.js + Express
**Entry Point**: [backend/src/server.js](backend/src/server.js)
**Port**: Configurable via `PORT` environment variable (defaults to 5000)

Key configurations:
- CORS configured for all frontend applications
- Socket.IO with WebSocket support
- MongoDB connection with production optimizations
- Graceful shutdown handling
- Security headers for production

## Deployment Process

### Option 1: Deploy All Applications Together (Recommended)

1. Push your code to GitHub
2. Import the repository to Vercel
3. Vercel will automatically detect and configure all applications based on [vercel.json](vercel.json)
4. Set environment variables in Vercel project settings:
   - `MONGO_URI` - Your MongoDB connection string
   - `SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_ANON_KEY` - Your Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
   - `JWT_SECRET` - Strong JWT secret
   - `CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name
   - `CLOUDINARY_API_KEY` - Your Cloudinary API key
   - `CLOUDINARY_API_SECRET` - Your Cloudinary API secret
   - `CLIENT_URL` - Your store front URL
   - `ADMIN_URL` - Your admin panel URL
   - `SELLER_URL` - Your seller panel URL

### Option 2: Deploy Applications Separately

#### Deploy Backend API

1. Navigate to Vercel dashboard
2. Create new project
3. Select backend directory
4. Configure:
   - Build Command: `npm install`
   - Output Directory: `.` (current directory)
   - Install Command: `npm install`
5. Add required environment variables

#### Deploy Admin Panel

1. Navigate to Vercel dashboard
2. Create new project
3. Select admin-panel directory
4. Configure:
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add any required environment variables

#### Deploy Seller Panel

1. Navigate to Vercel dashboard
2. Create new project
3. Select seller-panel directory
4. Configure:
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add any required environment variables

#### Deploy Store Front

1. Navigate to Vercel dashboard
2. Create new project
3. Select store-front directory
4. Configure:
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. Add any required environment variables

## Post-Deployment Verification

After deployment, verify that:

1. All applications are accessible:
   - Store Front: `https://your-domain.com/`
   - Admin Panel: `https://your-domain.com/admin/`
   - Seller Panel: `https://your-domain.com/seller/`
   - API: `https://your-domain.com/api/`

2. API endpoints are responding correctly
3. Database connections are working
4. Authentication flows work properly
5. File uploads to Cloudinary function
6. Real-time messaging works via Socket.IO

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure all frontend URLs are added to CORS configuration in Vercel environment variables
2. **Database Connection Failures**: Verify MONGO_URI is correctly set and database is accessible
3. **Authentication Issues**: Check JWT_SECRET consistency across environments
4. **File Upload Problems**: Verify Cloudinary credentials are correct

### Monitoring

- Check Vercel logs for build and runtime errors
- Monitor MongoDB connection logs
- Review application logs via Winston logger

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Supabase Documentation](https://supabase.com/docs)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
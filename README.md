# B2B Marketplace Platform

This is a B2B marketplace platform with multiple frontend applications and a backend API.

## Project Structure

- `/admin-panel` - Admin dashboard for managing the platform
- `/seller-panel` - Seller dashboard for managing products and orders
- `/store-front` - Public storefront for buyers
- `/backend` - Node.js API server

## Deployment

This project is configured for deployment on Vercel with the following setup:

1. **Root Configuration** - Routes requests to appropriate frontend applications
2. **Admin Panel** - Deployed at `/admin/*` path
3. **Seller Panel** - Deployed at `/seller/*` path
4. **Store Front** - Deployed at root path `/`
5. **Backend API** - Deployed as a serverless function

## Environment Variables

Each application requires specific environment variables. Check the `.env.example` files in each directory for required variables.

## Development

To run locally:

1. Install dependencies in each directory:
   ```bash
   cd admin-panel && npm install
   cd seller-panel && npm install
   cd store-front && npm install
   cd backend && npm install
   ```

2. Start development servers:
   ```bash
   # In separate terminals
   cd admin-panel && npm run dev
   cd seller-panel && npm run dev
   cd store-front && npm run dev
   cd backend && npm run dev
   ```

## Deployment to Vercel

1. Connect your GitHub repository to Vercel
2. Configure the project with the root directory as the project root
3. Vercel will automatically detect and deploy each application based on the vercel.json configurations
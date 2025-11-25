import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import authRoutes from "./routes/auth.routes.js";
import sellerRoutes from "./routes/seller.routes.js";
import buyerRoutes from "./routes/buyer.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import productRoutes from "./routes/product.routes.js";
import approvalRoutes from "./routes/approval.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import rfqRoutes from "./routes/rfq.routes.js";
import universalRoutes from "./routes/universal.routes.js";
import categoryRequestRoutes from "./routes/categoryRequest.routes.js";

import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const result = dotenv.config({ path: path.resolve(__dirname, '../.env') });
if (result.error) {
  console.error('Error loading .env file:', result.error);
} else {
  console.log('.env file loaded successfully');
}
console.log("Environment variables loaded:");
console.log("MONGO_URI:", process.env.MONGO_URI);
console.log("PORT:", process.env.PORT);

connectDB();

const app = express();

// CORS configuration
app.use(cors({
  origin: [
    "http://localhost:5174",
    "http://localhost:5173"
  ],
  credentials: true
}));


// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - IP: ${req.ip}`);
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - Status: ${res.statusCode} - Duration: ${duration}ms`);
  });
  
  next();
});

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes with logging
app.use("/api/auth", (req, res, next) => {
  console.log(`[ROUTE] /api/auth - ${req.method} request`);
  next();
}, authRoutes);

app.use('/api/categories', categoryRoutes)
app.use('/api/sellers', sellerRoutes)
app.use('/api/buyers', buyerRoutes)
app.use('/api/products', productRoutes)
app.use('/api/approvals', approvalRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/rfqs', rfqRoutes)
app.use('/api/universal', universalRoutes)
app.use('/api/category-requests', categoryRequestRoutes)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ERROR:`, err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${5000}`);
  console.log(`📡 CORS enabled for ${'http://localhost:5000'}`);
});

export default app;
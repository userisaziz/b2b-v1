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
import messageRoutes from "./routes/message.routes.js";

import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';

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

// Create HTTP server
const server = createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5174",
      "http://localhost:5173",
      "http://localhost:3000",
      "http://localhost:3001"
    ],
    credentials: true
  }
});

// Store connected users
const connectedUsers = new Map();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Register user
  socket.on('register_user', (userId) => {
    connectedUsers.set(userId, socket.id);
    console.log(`User ${userId} registered with socket ${socket.id}`);
  });
  
  // Join room
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });
  
  // Send message
  socket.on('send_message', (data) => {
    console.log('Received message:', data);
    
    // Emit to recipient if online
    const recipientSocketId = connectedUsers.get(data.recipient_id);
    if (recipientSocketId) {
      socket.to(recipientSocketId).emit('new_message', data);
      console.log(`Message forwarded to recipient ${data.recipient_id}`);
    }
    
    // Also emit to the room if applicable
    if (data.room_id) {
      socket.to(data.room_id).emit('new_message', data);
    }
  });
  
  // Typing indicator
  socket.on('typing', (data) => {
    const recipientSocketId = connectedUsers.get(data.recipient_id);
    if (recipientSocketId) {
      socket.to(recipientSocketId).emit('user_typing', {
        sender_id: data.sender_id,
        is_typing: data.is_typing
      });
    }
  });
  
  // Disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Remove user from connected users
    for (let [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        break;
      }
    }
  });
});

// CORS configuration
app.use(cors({
  origin: [
    "http://localhost:5174",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:3001",
   "https://b2b-v1-seller.vercel.app",
    "https://b2b-v1-admin.vercel.app"
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
app.use('/api/messages', messageRoutes)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ERROR:`, err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📡 Socket.IO server is running on port ${PORT}`);
  console.log(`📡 CORS enabled for multiple origins`);
});

export default app;
export { io };
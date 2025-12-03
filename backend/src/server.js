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
import testRoutes from "./routes/test.routes.js";

import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Import our new logging utilities
import logger from './utils/consoleLogger.js';
import httpLogger from './middleware/httpLogger.js';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables (only in development/local environments)
if (process.env.NODE_ENV !== 'production') {
  const result = dotenv.config({ path: path.resolve(__dirname, '../.env') });
  if (result.error) {
    logger.error('Error loading .env file:', result.error);
  } else {
    logger.info('.env file loaded successfully');
  }
}

logger.info("Environment variables loaded:");
logger.info("MONGO_URI:", process.env.MONGO_URI ? "****" : "Not set");
logger.info("PORT:", process.env.PORT || 5000);

const app = express();

// Create HTTP server
const server = createServer(app);

// Initialize Socket.IO
const socketCorsOrigins = [
  "http://localhost:5174",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:3001",
  "https://b2b-v1-seller.vercel.app",
  "https://b2b-v1-admin.vercel.app",
  "https://b2b-v1-storefront.vercel.app",
  process.env.CLIENT_URL,
  process.env.ADMIN_URL,
  process.env.SELLER_URL
].filter(Boolean); // Filter out undefined values

const io = new Server(server, {
  cors: {
    origin: socketCorsOrigins,
    credentials: true,
    methods: ["GET", "POST"]
  },
  transports: ["websocket", "polling"],
  allowEIO3: true
});

// Store connected users
const connectedUsers = new Map();
const userRooms = new Map(); // Track which rooms users are in

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info('📱 User connected:', socket.id);
  
  // Register user
  socket.on('register_user', (userId) => {
    connectedUsers.set(userId, socket.id);
    logger.info(`👤 User ${userId} registered with socket ${socket.id}`);
    
    // Broadcast to all clients that user is online
    socket.broadcast.emit('user_status_changed', {
      userId,
      status: 'online'
    });
  });
  
  // Join room
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    logger.info(`🚪 Socket ${socket.id} joined room ${roomId}`);
    
    // Track which rooms this user is in
    const userId = getUserIdBySocketId(socket.id);
    if (userId) {
      if (!userRooms.has(userId)) {
        userRooms.set(userId, new Set());
      }
      userRooms.get(userId).add(roomId);
    }
  });
  
  // Leave room
  socket.on('leave_room', (roomId) => {
    socket.leave(roomId);
    logger.info(`🚪 Socket ${socket.id} left room ${roomId}`);
    
    // Remove room from user's tracked rooms
    const userId = getUserIdBySocketId(socket.id);
    if (userId && userRooms.has(userId)) {
      userRooms.get(userId).delete(roomId);
    }
  });
  
  // Send message
  socket.on('send_message', (data) => {
    logger.debug('✉️ Received message:', data);
    
    // Emit to recipient if online
    const recipientSocketId = connectedUsers.get(data.recipient_id);
    if (recipientSocketId) {
      socket.to(recipientSocketId).emit('new_message', data);
      logger.info(`📤 Message forwarded to recipient ${data.recipient_id}`);
    }
    
    // Also emit to the room if applicable
    if (data.room_id) {
      socket.to(data.room_id).emit('new_message', data);
    }
    
    // Broadcast to sender that message was delivered
    socket.emit('message_delivered', {
      messageId: data.id,
      timestamp: new Date()
    });
  });
  
  // Typing indicator
  socket.on('typing', (data) => {
    const recipientSocketId = connectedUsers.get(data.recipient_id);
    if (recipientSocketId) {
      socket.to(recipientSocketId).emit('user_typing', {
        sender_id: data.sender_id,
        is_typing: data.is_typing,
        conversation_id: data.conversation_id
      });
    }
  });
  
  // Read receipt
  socket.on('mark_as_read', (data) => {
    const recipientSocketId = connectedUsers.get(data.recipient_id);
    if (recipientSocketId) {
      socket.to(recipientSocketId).emit('message_read', {
        message_id: data.message_id,
        reader_id: data.reader_id,
        timestamp: new Date()
      });
    }
  });
  
  // Online users request
  socket.on('request_online_users', () => {
    const onlineUsers = Array.from(connectedUsers.keys());
    socket.emit('online_users', onlineUsers);
  });
  
  // User status update
  socket.on('update_status', (data) => {
    const userId = getUserIdBySocketId(socket.id);
    if (userId) {
      // Broadcast status change to all connected users
      socket.broadcast.emit('user_status_changed', {
        userId,
        status: data.status
      });
    }
  });
  
  // Disconnect
  socket.on('disconnect', () => {
    logger.info('📴 User disconnected:', socket.id);
    // Remove user from connected users
    let userIdToRemove = null;
    for (let [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        userIdToRemove = userId;
        connectedUsers.delete(userId);
        break;
      }
    }
    
    // Remove user from rooms
    if (userIdToRemove) {
      userRooms.delete(userIdToRemove);
      
      // Broadcast that user went offline
      socket.broadcast.emit('user_status_changed', {
        userId: userIdToRemove,
        status: 'offline'
      });
    }
  });
});

// Helper function to get user ID by socket ID
function getUserIdBySocketId(socketId) {
  for (let [userId, sid] of connectedUsers.entries()) {
    if (sid === socketId) {
      return userId;
    }
  }
  return null;
}

// CORS configuration
const corsOptions = {
  origin: [
    "http://localhost:5174",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:3001",
    "https://b2b-v1-seller.vercel.app",
    "https://b2b-v1-admin.vercel.app",
    "https://b2b-v1-storefront.vercel.app",
    process.env.CLIENT_URL,
    process.env.ADMIN_URL,
    process.env.SELLER_URL
  ].filter(Boolean), // Filter out undefined values
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// HTTP request logging middleware
app.use(httpLogger);

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security headers for production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });
}

// Routes with logging
app.use("/api/auth", (req, res, next) => {
  logger.info(`[ROUTE] /api/auth - ${req.method} request`);
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
app.use('/api/test', testRoutes)

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('🚨 Unhandled error:', err, {
    url: req.url,
    method: req.method,
    headers: req.headers,
    body: req.body,
    query: req.query
  });
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
  
  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
});

// Connect to database and start server
connectDB().then(() => {
  logger.info('✅ Database connected successfully');
  
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    logger.info(`🚀 Server is running on port ${PORT}`);
    logger.info(`📡 Socket.IO server is running on port ${PORT}`);
    logger.info(`🌐 CORS enabled for multiple origins`);
    logger.info(`📅 ${new Date().toISOString()}`);
    
    if (process.env.NODE_ENV === 'production') {
      logger.info('🔧 Running in PRODUCTION mode');
    } else {
      logger.info('🔧 Running in DEVELOPMENT mode');
    }
  });
}).catch((err) => {
  logger.error('❌ Failed to start server due to database connection error:', err);
  process.exit(1);
});

export default app;
export { io };
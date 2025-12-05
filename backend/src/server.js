import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
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
import healthRoutes from "./routes/health.routes.js";

import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { Server } from "socket.io";

// Import our new logging utilities
import logger from "./utils/consoleLogger.js";
import httpLogger from "./middleware/httpLogger.js";

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables (only in development/local environments)
if (process.env.NODE_ENV !== "production") {
  const result = dotenv.config({ path: path.resolve(__dirname, "../.env") });
  if (result.error) {
    logger.error("Error loading .env file:", result.error);
  } else {
    logger.info(".env file loaded successfully");
  }
}

logger.info("Environment variables loaded:");
logger.info("MONGO_URI:", process.env.MONGO_URI ? "****" : "Not set");
logger.info("PORT:", process.env.PORT || 5000);

const app = express();

// CORS whitelist
const whitelist = [
  "http://localhost:5174",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:3001",
  "https://b2b-v1-seller.vercel.app",
  "https://b2b-v1-admin-panel.vercel.app",
  "https://b2b-v1-storefront.vercel.app",
  process.env.CLIENT_URL,
  process.env.ADMIN_URL,
  process.env.SELLER_URL
].filter(url => url); // Remove falsy values

// CORS options
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl)
    if (!origin) return callback(null, true);
    
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      logger.warn(`❌ CORS Blocked: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
};

// Apply CORS middleware
app.use(cors(corsOptions));

// HTTP request logging middleware
app.use(httpLogger);

// Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Security headers (production only)
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });
}

// Server + Socket.io
const server = createServer(app);

/* ============================================================
  ✅ SOCKET.IO CORS (Same whitelist)
  ============================================================ */
const io = new Server(server, {
  cors: {
    origin: whitelist,
    credentials: true,
    methods: ["GET", "POST"]
  },
  transports: ["websocket", "polling"]
});

/* ============================================================
  SOCKET.IO EVENTS
  ============================================================ */
const connectedUsers = new Map();
const userRooms = new Map();

io.on('connection', (socket) => {
  logger.info("🔌 User connected:", socket.id);

  socket.on("register_user", (userId) => {
    connectedUsers.set(userId, socket.id);
    socket.broadcast.emit("user_status_changed", { userId, status: "online" });
  });

  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    const userId = [...connectedUsers].find(([id, sid]) => sid === socket.id)?.[0];
    if (userId) {
      if (!userRooms.has(userId)) userRooms.set(userId, new Set());
      userRooms.get(userId).add(roomId);
    }
  });

  socket.on("leave_room", (roomId) => {
    socket.leave(roomId);
  });

  socket.on("send_message", (data) => {
    const recipientSocket = connectedUsers.get(data.recipient_id);
    if (recipientSocket) {
      io.to(recipientSocket).emit("new_message", data);
    }
    if (data.room_id) io.to(data.room_id).emit("new_message", data);
    socket.emit("message_delivered", { messageId: data.id, timestamp: new Date() });
  });

  socket.on("typing", (data) => {
    const target = connectedUsers.get(data.recipient_id);
    if (target) io.to(target).emit("user_typing", data);
  });

  socket.on("mark_as_read", (data) => {
    const target = connectedUsers.get(data.recipient_id);
    if (target) io.to(target).emit("message_read", data);
  });

  socket.on("disconnect", () => {
    logger.info("❌ Disconnected:", socket.id);
    let userId = null;

    for (const [id, sid] of connectedUsers.entries()) {
      if (sid === socket.id) {
        userId = id;
        connectedUsers.delete(id);
        break;
      }
    }

    if (userId) {
      userRooms.delete(userId);
      socket.broadcast.emit("user_status_changed", { userId, status: "offline" });
    }
  });
});

/* ============================================================
  ROUTES
  ============================================================ */
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/sellers', sellerRoutes);
app.use('/api/buyers', buyerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/rfqs', rfqRoutes);
app.use('/api/universal', universalRoutes);
app.use('/api/category-requests', categoryRequestRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/test', testRoutes);

/* ============================================================
  ERROR HANDLER
  ============================================================ */
app.use((err, req, res, next) => {
  logger.error("Error:", err.message);
  res.status(500).json({ success: false, message: err.message });
});

/* ============================================================
  START SERVER
  ============================================================ */
connectDB().then(() => {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    logger.info(`🚀 Server running on ${PORT}`);
  });
}).catch((err) => {
  logger.error("DB error:", err);
  process.exit(1);
});

export default app;
export { io };

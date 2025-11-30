import express from "express";
import {
  createRFQ,
  getAllRFQs,
  getRFQById,
  updateRFQ,
  deleteRFQ,
  distributeRFQ,
  submitQuote,
  getRFQsForSeller,
  getRFQsForBuyer,
  createPublicRFQ
} from "../controllers/rfq.controller.js";
import { protectUniversal, requireRole } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public route for creating RFQs without authentication
router.post("/public", createPublicRFQ);

// Apply universal protection to all other routes
router.use(protectUniversal);

// Admin routes
router.post("/", requireRole("admin", "buyer"), createRFQ);
router.get("/", requireRole("admin"), getAllRFQs);
router.get("/:id", requireRole("admin"), getRFQById);
router.put("/:id", requireRole("admin", "buyer"), updateRFQ);
router.delete("/:id", requireRole("admin", "buyer"), deleteRFQ);
router.post("/:id/distribute", requireRole("admin"), distributeRFQ);

// Seller routes
router.get("/seller/my-rfqs", requireRole("seller"), getRFQsForSeller);
router.post("/:id/quote", requireRole("seller"), submitQuote);

// Buyer routes
router.get("/buyer/my-rfqs", requireRole("buyer"), getRFQsForBuyer);

export default router;
import express from "express";
import { createSeller, getAllSellers, getSellerById, getSellerProfile } from "../controllers/seller.controller.js";
import { approveSeller, rejectSeller } from "../controllers/approval.controller.js";
import { protectAdmin, protectSeller } from "../middleware/auth.middleware.js";

const router = express.Router();

// seller register
router.post("/create", createSeller);

// get authenticated seller profile (must be before :id route to avoid conflict)
router.get("/profile", protectSeller, getSellerProfile);

// admin approves/rejects seller
router.route("/:id/approval")
  .patch(protectAdmin, approveSeller)
  .delete(protectAdmin, rejectSeller);

// get all sellers
router.get("/", getAllSellers);

// get single seller (must be after profile route)
router.get("/:id", getSellerById);

export default router;
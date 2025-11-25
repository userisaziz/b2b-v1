import express from "express";
import { createSeller, getAllSellers, getSellerById, getSellerProfile } from "../controllers/seller.controller.js";
import { approveSeller, rejectSeller } from "../controllers/approval.controller.js";
import { protectAdmin, protectSeller } from "../middleware/auth.middleware.js";

const router = express.Router();

// seller register
router.post("/create", createSeller);

// admin approves/rejects seller
router.route("/:id/approval")
  .patch(protectAdmin, approveSeller)
  .delete(protectAdmin, rejectSeller);

// get all sellers
router.get("/", getAllSellers);

// get single seller
router.get("/:id", getSellerById);

// get authenticated seller profile
router.get("/profile", protectSeller, getSellerProfile);

export default router;
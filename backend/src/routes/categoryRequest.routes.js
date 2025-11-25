import express from "express";
import {
  createCategoryRequest,
  getAllCategoryRequests,
  getCategoryRequestById,
  approveCategoryRequest,
  rejectCategoryRequest,
  getSellerCategoryRequests
} from "../controllers/categoryRequest.controller.js";
import upload from "../middleware/multer.js";
import { protectUniversal, requireRole, protectAdmin, protectSeller } from "../middleware/auth.middleware.js";

const router = express.Router();

// Seller route for creating a new category request with image upload
router.post("/", protectSeller, upload.single("image"), createCategoryRequest);

// Admin routes for managing category requests
router.get("/", requireRole("admin"), getAllCategoryRequests);
router.get("/:id", requireRole("admin"), getCategoryRequestById);
router.patch("/:id/approve", requireRole("admin"), approveCategoryRequest);
router.patch("/:id/reject", requireRole("admin"), rejectCategoryRequest);

// Seller routes for viewing their own requests
router.get("/seller", protectSeller, getSellerCategoryRequests);

export default router;
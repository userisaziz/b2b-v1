import express from "express";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
  getCategoryBySlugWithProducts,
  getCategoryProducts
} from "../controllers/category.controller.js";

import { protectUniversal, protectAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// Admin only
router.post("/", protectUniversal, protectAdmin, createCategory);
router.put("/:id", protectUniversal, protectAdmin, updateCategory);
router.delete("/:id", protectUniversal, protectAdmin, deleteCategory);

// Public
router.get("/", getAllCategories);
router.get("/slug/:slug", getCategoryBySlug);
router.get("/:id", getCategoryById);

// New routes for category products
router.get("/slug/:slug/products", getCategoryBySlugWithProducts);
router.get("/:id/products", getCategoryProducts);

export default router;
import express from "express";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
} from "../controllers/category.controller.js";

import { protectUniversal, protectAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// Admin only
router.post("/", protectUniversal, protectAdmin, createCategory);
router.put("/:id", protectUniversal, protectAdmin, updateCategory);
router.delete("/:id", protectUniversal, protectAdmin, deleteCategory);

// Public
router.get("/", getAllCategories);
router.get("/:id", getCategoryById);

export default router;
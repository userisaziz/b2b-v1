import express from "express";
import { 
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  getSellerProducts,
  addProductImages,
  
  adminChangeCategories,
  trackProductView
} from "../controllers/product.controller.js";
import upload from "../middleware/multer.js";
import { protectUniversal, requireRole, protectSeller, protectAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// Seller operations
router.post("/", protectUniversal, requireRole("seller", "admin"), upload.array("images", 10), createProduct);
router.get("/seller", protectUniversal, protectSeller, getSellerProducts);
router.put("/:id", protectUniversal, protectSeller, updateProduct);
router.delete("/:id", protectUniversal, protectSeller, deleteProduct);
router.post("/:id/images", protectUniversal, protectSeller, upload.array("images", 10), addProductImages);

// Public
router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.post("/:id/view", trackProductView);

// Admin forced category update
router.put("/:id/admin/categories", protectUniversal, protectAdmin, adminChangeCategories);

export default router;
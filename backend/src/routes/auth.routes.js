import express from "express";
import { unifiedLogin, registerSeller, registerBuyer } from "../controllers/auth.controller.js";
import { protectUniversal } from "../middleware/auth.middleware.js";
import Seller from "../models/seller.model.js";

const router = express.Router();

// Single login endpoint for Admin, Seller, and Employee
router.post("/login", unifiedLogin);

// Separate login endpoint for Buyers
router.post("/buyer/login", unifiedLogin);

// Registration endpoints (Admin registration handled separately/manually)
router.post("/seller/register", registerSeller);
router.post("/buyer/register", registerBuyer);

// Profile endpoint for authenticated users
router.get("/profile", protectUniversal, async (req, res) => {
  try {
    // For sellers, we want to provide more detailed information
    if (req.userType === "seller") {
      const seller = await Seller.findById(req.user._id).select("-password");
      if (!seller) {
        return res.status(404).json({
          success: false,
          message: "Seller not found"
        });
      }
      
      return res.json({ 
        success: true,
        message: "Seller Profile",
        user: {
          id: seller._id,
          name: seller.name,
          email: seller.email,
          phone: seller.phone,
          companyName: seller.companyName,
          businessType: seller.businessType,
          businessAddress: seller.businessAddress,
          crNumber: seller.crNumber,
          taxNumber: seller.taxNumber,
          profileImage: seller.profileImage,
          approvalStatus: seller.approvalStatus,
          isVerified: seller.isVerified,
          rating: seller.rating,
          totalReviews: seller.totalReviews,
          isActive: seller.isActive,
          isEmailVerified: seller.isEmailVerified,
          lastLogin: seller.lastLogin,
          createdAt: seller.createdAt,
          updatedAt: seller.updatedAt,
          role: req.userType,
        }
      });
    }
    
    // For other user types, return basic information
    res.json({ 
      success: true,
      message: "User Profile",
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.userType,
        // Add other relevant user information based on role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching profile",
      error: error.message
    });
  }
});

export default router;
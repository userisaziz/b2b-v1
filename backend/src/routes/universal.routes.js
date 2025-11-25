import express from "express";
import { protectUniversal, requireRole } from "../middleware/auth.middleware.js";
import Seller from "../models/seller.model.js";

const router = express.Router();

// Universal protection - any authenticated user can access
router.use(protectUniversal);

// Universal profile endpoint - any authenticated user can access their profile
router.get("/profile", async (req, res) => {
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

// Universal dashboard - any authenticated user can access, but content varies by role
router.get("/dashboard", (req, res) => {
  const role = req.userType;
  let dashboardInfo = {};
  
  switch (role) {
    case 'admin':
      dashboardInfo = {
        type: "Admin Dashboard",
        features: ["User Management", "Seller Approval", "System Analytics"]
      };
      break;
    case 'seller':
      dashboardInfo = {
        type: "Seller Dashboard",
        features: ["Product Management", "Order Processing", "Sales Analytics"]
      };
      break;
    case 'buyer':
      dashboardInfo = {
        type: "Buyer Dashboard",
        features: ["RFQ Management", "Order Tracking", "Supplier Communication"]
      };
      break;
    case 'employee':
      dashboardInfo = {
        type: "Employee Dashboard",
        features: ["Task Management", "Communication", "Reporting"]
      };
      break;
    default:
      dashboardInfo = {
        type: "Default Dashboard",
        features: ["Basic Features"]
      };
  }
  
  res.json({ 
    success: true,
    message: "Universal Dashboard",
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.userType,
    },
    dashboard: dashboardInfo
  });
});

// Role-specific endpoints using requireRole middleware
router.get("/admin-only", requireRole('admin'), (req, res) => {
  res.json({ 
    success: true,
    message: "This endpoint is only accessible by admins",
    user: req.user,
    userType: req.userType
  });
});

router.get("/seller-only", requireRole('seller'), (req, res) => {
  res.json({ 
    success: true,
    message: "This endpoint is only accessible by sellers",
    user: req.user,
    userType: req.userType
  });
});

router.get("/buyer-only", requireRole('buyer'), (req, res) => {
  res.json({ 
    success: true,
    message: "This endpoint is only accessible by buyers",
    user: req.user,
    userType: req.userType
  });
});

router.get("/employee-only", requireRole('employee'), (req, res) => {
  res.json({ 
    success: true,
    message: "This endpoint is only accessible by employees",
    user: req.user,
    userType: req.userType
  });
});

// Multiple role access example
router.get("/admin-seller", requireRole('admin', 'seller'), (req, res) => {
  res.json({ 
    success: true,
    message: "This endpoint is accessible by admins and sellers",
    user: req.user,
    userType: req.userType
  });
});

export default router;
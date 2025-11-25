import jwt from "jsonwebtoken";
import { Admin } from "../models/admin.model.js";
import Seller  from "../models/seller.model.js";
import { Buyer } from "../models/buyer.model.js";
import { CompanyEmployee } from "../models/companyEmployee.model.js";

// Generate JWT Token
export const generateToken = (id, userType) => {
  return jwt.sign({ id, userType }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// Verify JWT and attach user
const verifyToken = async (req, res, next, Model, userType) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(`[AUTH] Token decoded for ${userType}:`, decoded);

    // Verify userType matches
    if (decoded.userType !== userType) {
      console.log(`[AUTH] User type mismatch. Expected: ${userType}, Got: ${decoded.userType}`);
      return res.status(403).json({
        success: false,
        message: "Not authorized for this resource",
      });
    }

    const user = await Model.findById(decoded.id).select("-password");

    if (!user) {
      console.log(`[AUTH] User not found for ${userType}: ${decoded.id}`);
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user is active
    if (user.isActive === false) {
      console.log(`[AUTH] User account deactivated for ${userType}: ${decoded.id}`);
      return res.status(403).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    req.user = user;
    req.userType = userType;
    next();
  } catch (error) {
    console.error(`[AUTH] Token verification failed for ${userType}:`, error.message);
    return res.status(401).json({
      success: false,
      message: "Not authorized, token failed",
      error: error.message,
    });
  }
};

// Middleware for different user types
export const protectAdmin = (req, res, next) =>
  verifyToken(req, res, next, Admin, "admin");

export const protectSeller = async (req, res, next) => {
  await verifyToken(req, res, next, Seller, "seller");
  
  // Additional check: Seller must be approved
  if (req.user.approvalStatus !== "approved") {
    console.log(`[AUTH] Seller not approved: ${req.user._id}, Status: ${req.user.approvalStatus}`);
    return res.status(403).json({
      success: false,
      message: "Your seller account is not approved yet",
      approvalStatus: req.user.approvalStatus,
    });
  }
  console.log(`[AUTH] Seller approved: ${req.user._id}`);
};

export const protectBuyer = (req, res, next) =>
  verifyToken(req, res, next, Buyer, "buyer");

export const protectEmployee = async (req, res, next) => {
  await verifyToken(req, res, next, CompanyEmployee, "employee");
  
  // Check if employee status is active
  if (req.user.status !== "active") {
    console.log(`[AUTH] Employee not active: ${req.user._id}, Status: ${req.user.status}`);
    return res.status(403).json({
      success: false,
      message: "Your employee account is not active",
    });
  }
  console.log(`[AUTH] Employee active: ${req.user._id}`);
};

// Check specific admin permissions
export const checkAdminPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user.permissions[permission]) {
      console.log(`[AUTH] Admin lacks permission: ${permission} for user ${req.user._id}`);
      return res.status(403).json({
        success: false,
        message: "You don't have permission to perform this action",
      });
    }
    console.log(`[AUTH] Admin has permission: ${permission} for user ${req.user._id}`);
    next();
  };
};

// Check employee permissions
export const checkEmployeePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user.permissions[permission]) {
      console.log(`[AUTH] Employee lacks permission: ${permission} for user ${req.user._id}`);
      return res.status(403).json({
        success: false,
        message: "You don't have permission to perform this action",
      });
    }
    console.log(`[AUTH] Employee has permission: ${permission} for user ${req.user._id}`);
    next();
  };
};

// Universal protection middleware that checks token and determines user type
export const protectUniversal = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(`[AUTH] Universal token decoded:`, decoded);

    // Determine model and verify user based on userType
    let user, Model;
    switch (decoded.userType) {
      case "admin":
        Model = Admin;
        break;
      case "seller":
        Model = Seller;
        break;
      case "buyer":
        Model = Buyer;
        break;
      case "employee":
        Model = CompanyEmployee;
        break;
      default:
        console.log(`[AUTH] Invalid user type: ${decoded.userType}`);
        return res.status(403).json({
          success: false,
          message: "Invalid user type",
        });
    }

    user = await Model.findById(decoded.id).select("-password");

    if (!user) {
      console.log(`[AUTH] User not found for type ${decoded.userType}: ${decoded.id}`);
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user is active (for applicable user types)
    if (user.isActive === false && decoded.userType !== "seller") {
      console.log(`[AUTH] User account deactivated for ${decoded.userType}: ${decoded.id}`);
      return res.status(403).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    // Additional checks for specific user types
    if (decoded.userType === "seller" && user.approvalStatus !== "approved") {
      console.log(`[AUTH] Seller not approved: ${user._id}, Status: ${user.approvalStatus}`);
      return res.status(403).json({
        success: false,
        message: "Your seller account is not approved yet",
        approvalStatus: user.approvalStatus,
      });
    }

    if (decoded.userType === "employee" && user.status !== "active") {
      console.log(`[AUTH] Employee not active: ${user._id}, Status: ${user.status}`);
      return res.status(403).json({
        success: false,
        message: "Your employee account is not active",
      });
    }

    req.user = user;
    req.userType = decoded.userType;
    console.log(`[AUTH] User authenticated successfully: ${user._id} as ${decoded.userType}`);
    next();
  } catch (error) {
    console.error(`[AUTH] Universal token verification failed:`, error.message);
    return res.status(401).json({
      success: false,
      message: "Not authorized, token failed",
      error: error.message,
    });
  }
};

// Role-based access control middleware
export const requireRole = (...roles) => {
  return (req, res, next) => {
    console.log(`[AUTH] Checking roles: ${roles.join(', ')} for user type: ${req.userType}`);
    if (!roles.includes(req.userType)) {
      console.log(`[AUTH] Access denied. User type ${req.userType} not in allowed roles: ${roles.join(', ')}`);
      return res.status(403).json({
        success: false,
        message: "Access denied. Insufficient permissions.",
      });
    }
    console.log(`[AUTH] Access granted for user type: ${req.userType}`);
    next();
  };
};
// ============================================
// controllers/auth.controller.js
// ============================================
import { Admin } from "../models/admin.model.js";
import Seller  from "../models/seller.model.js";
import { Buyer } from "../models/buyer.model.js";
import { CompanyEmployee } from "../models/companyEmployee.model.js";
import { generateToken } from "../middleware/auth.middleware.js";
import {
  logLoginAttempt,
  shouldBlockAttempt,
} from "../services/loginSecurity.service.js";

// Unified Login for Admin, Seller, and Employee
export const unifiedLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`[LOGIN] Attempting login for email: ${email}`);

    if (!email || !password) {
      console.log(`[LOGIN] Missing email or password for email: ${email}`);
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // AI SECURITY: Check if this IP/email should be blocked
    const ipAddress =
      req.headers["x-forwarded-for"]?.split(",")[0] || req.connection.remoteAddress || "unknown";
    const isBlocked = await shouldBlockAttempt(email, ipAddress);

    if (isBlocked) {
      console.log(`[SECURITY] Blocked login attempt for ${email} from ${ipAddress}`);

      // Log the blocked attempt
      await logLoginAttempt(
        {
          email,
          success: false,
          failureReason: "other",
        },
        req
      );

      return res.status(429).json({
        success: false,
        message: "Too many failed login attempts. Please try again later.",
      });
    }

    // Search across Admin, Seller, and Employee models
    let user = null;
    let userType = null;

    // Check Admin
    user = await Admin.findOne({ email }).select("+password");
    if (user) {
      userType = "admin";
      console.log(`[LOGIN] Found admin user: ${email}`);
    }

    // Check Seller if not found in Admin
    if (!user) {
      user = await Seller.findOne({ email }).select("+password");
      if (user) {
        userType = "seller";
        console.log(`[LOGIN] Found seller user: ${email}`);
      }
    }

    // Check Employee if not found in Seller
    if (!user) {
      user = await CompanyEmployee.findOne({ email }).select("+password");
      if (user) {
        userType = "employee";
        console.log(`[LOGIN] Found employee user: ${email}`);
      }
    }

    // Check Buyer if not found in Employee
    if (!user) {
      user = await Buyer.findOne({ email }).select("+password");
      if (user) {
        userType = "buyer";
        console.log(`[LOGIN] Found buyer user: ${email}`);
      }
    }

    // If user not found
    if (!user) {
      console.log(`[LOGIN] User not found for email: ${email}`);

      // AI SECURITY: Log failed attempt
      await logLoginAttempt(
        {
          email,
          success: false,
          failureReason: "user_not_found",
        },
        req
      );

      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if password comparison method exists
    if (!user.comparePassword) {
      console.log(`[LOGIN] Password comparison method not available for user: ${email}`);
      return res.status(500).json({
        success: false,
        message: "Password comparison method not available",
      });
    }

    // Check if password matches
    const isPasswordValid = await user.comparePassword(password);
    console.log(`[LOGIN] Password validation for ${email}: ${isPasswordValid}`);

    if (!isPasswordValid) {
      console.log(`[LOGIN] Invalid password for email: ${email}`);

      // AI SECURITY: Log failed attempt
      await logLoginAttempt(
        {
          email,
          userType,
          userId: user._id,
          success: false,
          failureReason: "invalid_password",
        },
        req
      );

      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check seller approval status
    if (userType === "seller") {
      if (user.approvalStatus === "pending") {
        console.log(`[LOGIN] Seller account pending approval: ${email}`);

        // AI SECURITY: Log failed attempt
        await logLoginAttempt(
          {
            email,
            userType,
            userId: user._id,
            success: false,
            failureReason: "account_pending",
          },
          req
        );

        return res.status(403).json({
          success: false,
          message: "Your account is pending admin approval",
          approvalStatus: "pending",
        });
      }

      if (user.approvalStatus === "rejected") {
        console.log(`[LOGIN] Seller account rejected: ${email}`);
        return res.status(403).json({
          success: false,
          message: "Your account has been rejected",
          approvalStatus: "rejected",
          rejectionReason: user.rejectionReason,
        });
      }

      if (user.approvalStatus === "suspended") {
        console.log(`[LOGIN] Seller account suspended: ${email}`);

        // AI SECURITY: Log failed attempt
        await logLoginAttempt(
          {
            email,
            userType,
            userId: user._id,
            success: false,
            failureReason: "account_suspended",
          },
          req
        );

        return res.status(403).json({
          success: false,
          message: "Your account has been suspended",
          approvalStatus: "suspended",
        });
      }
    }

    // Check employee status
    if (userType === "employee") {
      if (user.status !== "active") {
        console.log(`[LOGIN] Employee account not active (${user.status}): ${email}`);
        return res.status(403).json({
          success: false,
          message: `Your employee account is ${user.status}`,
          status: user.status,
        });
      }
    }

    // AI SECURITY: Log successful attempt
    await logLoginAttempt(
      {
        email,
        userType,
        userId: user._id,
        success: true,
      },
      req
    );

    // Update last login (with error handling)
    try {
      user.lastLogin = new Date();
      await user.save();
      console.log(`[LOGIN] Updated last login for user: ${email}`);
    } catch (saveError) {
      console.error("Error updating last login:", saveError);
      // Continue with login even if we can't update lastLogin
    }

    // Generate token
    const token = generateToken(user._id, userType);
    console.log(`[LOGIN] Generated token for ${userType}: ${email}`);

    // Prepare response data based on userType
    let responseData = {
      id: user._id,
      name: user.name,
      email: user.email,
      userType,
    };

    if (userType === "seller") {
      responseData.companyName = user.companyName;
      responseData.approvalStatus = user.approvalStatus;
    }

    if (userType === "admin") {
      responseData.adminLevel = user.adminLevel;
      responseData.permissions = user.permissions;
    }

    if (userType === "employee") {
      responseData.sellerId = user.sellerId;
      responseData.role = user.role;
      responseData.permissions = user.permissions;
    }

    console.log(`[LOGIN] Successful login for ${userType}: ${email}`);
    res.json({
      success: true,
      message: "Login successful",
      token,
      data: responseData,
    });
  } catch (error) {
    console.error("[LOGIN] Error during login:", error);
    res.status(500).json({
      success: false,
      message: "Error logging in",
      error: error.message,
    });
  }
};

// Register Seller
export const registerSeller = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      companyName,
      businessEmail,
      businessType,
      taxId,
      businessAddress,
    } = req.body;

    console.log(`[REGISTER] Attempting seller registration for email: ${email}`);

    // Check if seller already exists
    const existingSeller = await Seller.findOne({ email });
    if (existingSeller) {
      console.log(`[REGISTER] Seller with email already exists: ${email}`);
      return res.status(400).json({
        success: false,
        message: "Seller with this email already exists",
      });
    }

    // Check if email conflicts with admin
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      console.log(`[REGISTER] Email conflicts with admin: ${email}`);
      return res.status(400).json({
        success: false,
        message: "Email already in use",
      });
    }

    // Check if email conflicts with employee
    const existingEmployee = await CompanyEmployee.findOne({ email });
    if (existingEmployee) {
      console.log(`[REGISTER] Email conflicts with employee: ${email}`);
      return res.status(400).json({
        success: false,
        message: "Email already in use",
      });
    }

    // Check if business email already exists
    const existingBusinessEmail = await Seller.findOne({ businessEmail });
    if (existingBusinessEmail) {
      console.log(`[REGISTER] Business email already registered: ${businessEmail}`);
      return res.status(400).json({
        success: false,
        message: "Business email already registered",
      });
    }

    const seller = await Seller.create({
      name,
      email,
      password,
      phone,
      companyName,
      businessEmail,
      businessType,
      taxId,
      businessAddress,
      approvalStatus: "pending",
    });

    console.log(`[REGISTER] Seller registered successfully: ${email}`);
    res.status(201).json({
      success: true,
      message: "Seller registered successfully. Awaiting admin approval.",
      data: {
        id: seller._id,
        name: seller.name,
        email: seller.email,
        approvalStatus: seller.approvalStatus,
      },
    });
  } catch (error) {
    console.error("[REGISTER] Error registering seller:", error);
    res.status(500).json({
      success: false,
      message: "Error registering seller",
      error: error.message,
    });
  }
};

// Register Buyer
export const registerBuyer = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    console.log(`[REGISTER] Attempting buyer registration for email: ${email}`);

    // Check if buyer already exists
    const existingBuyer = await Buyer.findOne({ email });
    if (existingBuyer) {
      console.log(`[REGISTER] Buyer with email already exists: ${email}`);
      return res.status(400).json({
        success: false,
        message: "Buyer with this email already exists",
      });
    }

    const buyer = await Buyer.create({
      name,
      email,
      password,
      phone,
    });

    // Auto-login after registration
    const token = generateToken(buyer._id, "buyer");
    console.log(`[REGISTER] Buyer registered successfully: ${email}`);

    res.status(201).json({
      success: true,
      message: "Buyer registered successfully",
      token,
      data: {
        id: buyer._id,
        name: buyer.name,
        email: buyer.email,
      },
    });
  } catch (error) {
    console.error("[REGISTER] Error registering buyer:", error);
    res.status(500).json({
      success: false,
      message: "Error registering buyer",
      error: error.message,
    });
  }
};
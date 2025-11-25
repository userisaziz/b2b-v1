import Seller from "../models/seller.model.js";
import { Buyer } from "../models/buyer.model.js";
import bcrypt from "bcryptjs";

const approveSeller = async (req, res) => {
  try {
    const { sellerId } = req.body;
    
    // Validate sellerId
    if (!sellerId) {
      return res.status(400).json({ 
        success: false,
        message: "Seller ID is required" 
      });
    }

    // Find seller by ID
    const seller = await Seller.findById(sellerId);
    
    // Check if seller exists
    if (!seller) {
      return res.status(404).json({ 
        success: false,
        message: "Seller not found" 
      });
    }

    // Update approval status
    seller.approvalStatus = "approved";
    seller.approvedBy = req.user._id; // Assuming admin is authenticated
    seller.approvedAt = new Date();
    
    await seller.save();
    
    res.status(200).json({ 
      success: true,
      message: "Seller approved successfully",
      data: {
        id: seller._id,
        name: seller.name,
        email: seller.email,
        approvalStatus: seller.approvalStatus
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Error approving seller",
      error: error.message 
    });
  }
};

const rejectSeller = async (req, res) => {
  try {
    const { sellerId, rejectionReason } = req.body;
    
    // Validate input
    if (!sellerId) {
      return res.status(400).json({ 
        success: false,
        message: "Seller ID is required" 
      });
    }

    // Find seller by ID
    const seller = await Seller.findById(sellerId);
    
    // Check if seller exists
    if (!seller) {
      return res.status(404).json({ 
        success: false,
        message: "Seller not found" 
      });
    }

    // Update approval status
    seller.approvalStatus = "rejected";
    seller.rejectionReason = rejectionReason || "No reason provided";
    seller.rejectedAt = new Date();
    seller.approvedBy = req.user._id; // Assuming admin is authenticated
    
    await seller.save();
    
    res.status(200).json({ 
      success: true,
      message: "Seller rejected successfully",
      data: {
        id: seller._id,
        name: seller.name,
        email: seller.email,
        approvalStatus: seller.approvalStatus
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Error rejecting seller",
      error: error.message 
    });
  }
};

const getPendingSellers = async (req, res) => {
  try {
    // Find all sellers with pending approval status
    const pendingSellers = await Seller.find({ approvalStatus: "pending" })
      .select("-password") // Exclude password field
      .sort({ createdAt: -1 }); // Sort by newest first
    
    res.status(200).json({ 
      success: true,
      message: "Pending sellers retrieved successfully",
      data: pendingSellers
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Error retrieving pending sellers",
      error: error.message 
    });
  }
};

// Admin creates a new seller with password
const createSeller = async (req, res) => {
  try {
    const { name, email, phone, companyName, businessType, password, crNumber, taxNumber } = req.body;

    // Check if seller already exists
    const existingSeller = await Seller.findOne({ email });
    if (existingSeller) {
      return res.status(400).json({ 
        success: false,
        message: "Seller with this email already exists" 
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new seller with approved status
    const newSeller = await Seller.create({
      name,
      email,
      phone,
      companyName,
      businessType,
      crNumber,
      taxNumber,
      password: hashedPassword,
      approvalStatus: "approved", // Admin-created sellers are automatically approved
      isActive: true,
      approvedBy: req.user._id,
      approvedAt: new Date()
    });

    // Remove password from response
    const sellerResponse = newSeller.toObject();
    delete sellerResponse.password;

    res.status(201).json({
      success: true,
      message: "Seller created successfully",
      data: sellerResponse
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Error creating seller",
      error: error.message 
    });
  }
};

// Admin creates a new buyer with password
const createBuyer = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Check if buyer already exists
    const existingBuyer = await Buyer.findOne({ email });
    if (existingBuyer) {
      return res.status(400).json({ 
        success: false,
        message: "Buyer with this email already exists" 
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new buyer
    const newBuyer = await Buyer.create({
      name,
      email,
      phone,
      password: hashedPassword,
      isActive: true
    });

    // Remove password from response
    const buyerResponse = newBuyer.toObject();
    delete buyerResponse.password;

    res.status(201).json({
      success: true,
      message: "Buyer created successfully",
      data: buyerResponse
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Error creating buyer",
      error: error.message 
    });
  }
};

export { approveSeller, rejectSeller, getPendingSellers, createSeller, createBuyer };
import CategoryRequest from "../models/categoryRequest.model.js";
import Category from "../models/category.model.js";
import Seller from "../models/seller.model.js";
import { Admin } from "../models/admin.model.js";
import { uploadMultipleToCloudinary } from "../utils/cloudinary.js";

// ======================================================
// CATEGORY REQUEST CONTROLLERS
// ======================================================

// Create a new category request (seller)
export const createCategoryRequest = async (req, res) => {
  try {
    const {
      proposedName,
      proposedSlug,
      parentCategoryId,
      description,
      sellerReason
    } = req.body;

    // Validate required fields
    if (!proposedName || !proposedSlug || !sellerReason) {
      return res.status(400).json({ 
        message: "proposedName, proposedSlug, and sellerReason are required" 
      });
    }

    // Handle image upload if provided
    let image = null;
    if (req.file) {
      const cloudinaryResult = await uploadMultipleToCloudinary([req.file]);
      if (cloudinaryResult && cloudinaryResult.length > 0) {
        image = {
          url: cloudinaryResult[0].secure_url,
          alt: proposedName
        };
      }
    }

    // Get parent category details if provided
    let parentCategoryName = null;
    let parentCategoryPath = null;
    if (parentCategoryId) {
      const parentCategory = await Category.findById(parentCategoryId);
      if (!parentCategory) {
        return res.status(400).json({ message: "Parent category not found" });
      }
      parentCategoryName = parentCategory.name;
      parentCategoryPath = parentCategory.path;
    }

    // Create the category request
    const categoryRequest = await CategoryRequest.create({
      sellerId: req.user._id,
      proposedName,
      proposedSlug,
      parentCategoryId: parentCategoryId || null,
      parentCategoryName,
      parentCategoryPath,
      description,
      sellerReason,
      image
    });

    res.status(201).json({
      message: "Category request submitted successfully",
      categoryRequest
    });
  } catch (err) {
    console.error("Create category request error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all category requests (admin)
export const getAllCategoryRequests = async (req, res) => {
  try {
    const { status, sellerId } = req.query;
    let filter = {};
    
    if (status) filter.status = status;
    if (sellerId) filter.sellerId = sellerId;
    
    const requests = await CategoryRequest.find(filter)
      .populate("sellerId", "name companyName email")
      .populate("parentCategoryId", "name")
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (err) {
    console.error("Get category requests error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get category request by ID
export const getCategoryRequestById = async (req, res) => {
  try {
    const request = await CategoryRequest.findById(req.params.id)
      .populate("sellerId", "name companyName email")
      .populate("parentCategoryId", "name")
      .populate("reviewedBy", "name email");
    
    if (!request) {
      return res.status(404).json({ message: "Category request not found" });
    }
    
    res.json(request);
  } catch (err) {
    console.error("Get category request error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Approve a category request (admin)
export const approveCategoryRequest = async (req, res) => {
  try {
    const request = await CategoryRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: "Category request not found" });
    }
    
    // Check if request is already approved or rejected
    if (request.status === "approved") {
      return res.status(400).json({ message: "Request is already approved" });
    }
    
    if (request.status === "rejected") {
      return res.status(400).json({ message: "Request is already rejected" });
    }
    
    // Create the new category
    let parentCategory = null;
    let level = 0;
    let path = `/${request.proposedSlug}`;
    let ancestors = [];

    // Check Parent
    if (request.parentCategoryId) {
      parentCategory = await Category.findById(request.parentCategoryId);
      if (!parentCategory) {
        return res.status(400).json({ message: "Parent category not found" });
      }

      level = parentCategory.level + 1;
      path = `${parentCategory.path}/${request.proposedSlug}`;
      ancestors = [
        ...parentCategory.ancestors,
        { id: parentCategory._id, name: parentCategory.name, slug: parentCategory.slug }
      ];
    }

    // Create Category
    const category = await Category.create({
      name: request.proposedName,
      slug: request.proposedSlug,
      parentId: request.parentCategoryId,
      level,
      path,
      ancestors,
      description: request.description,
      createdBy: req.user._id
    });

    // Update parent children count
    if (request.parentCategoryId) {
      await Category.findByIdAndUpdate(request.parentCategoryId, {
        $inc: { "stats.childrenCount": 1 }
      });
    }

    // Update the request
    request.status = "approved";
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    await request.save();
    
    res.json({
      message: "Category request approved successfully",
      request,
      category
    });
  } catch (err) {
    console.error("Approve category request error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Reject a category request (admin)
export const rejectCategoryRequest = async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    const request = await CategoryRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: "Category request not found" });
    }
    
    // Check if request is already approved or rejected
    if (request.status === "approved") {
      return res.status(400).json({ message: "Request is already approved" });
    }
    
    if (request.status === "rejected") {
      return res.status(400).json({ message: "Request is already rejected" });
    }
    
    request.status = "rejected";
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    request.rejectionReason = rejectionReason;
    await request.save();
    
    res.json({
      message: "Category request rejected successfully",
      request
    });
  } catch (err) {
    console.error("Reject category request error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get category requests for a specific seller
export const getSellerCategoryRequests = async (req, res) => {
  try {
    const { status } = req.query;
    let filter = { sellerId: req.user._id };
    
    if (status) filter.status = status;
    
    const requests = await CategoryRequest.find(filter)
      .populate("parentCategoryId", "name")
      .sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (err) {
    console.error("Get seller category requests error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
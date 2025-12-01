// controllers/product.controller.js

import mongoose from 'mongoose';
import Category from "../models/category.model.js";
import Product from "../models/product.model.js";
import Seller from "../models/seller.model.js";
import ProductCategoryChangeRequest from "../models/productCategoryChangeRequest.model.js";
import ProductApprovalRequest from "../models/productApprovalRequest.model.js";
import upload from "../middleware/multer.js";
import { uploadMultipleToCloudinary } from "../utils/cloudinary.js";

// ======================================================
// CREATE PRODUCT — SELLER OR ADMIN
// ======================================================
export const createProduct = async (req, res) => {
  try {
    // Parse the product data
    let productData;
    
    // Handle both JSON and FormData submissions
    if (req.is('multipart/form-data')) {
      // For FormData, data might be in a 'data' field or directly in req.body
      if (req.body.data) {
        productData = JSON.parse(req.body.data);
      } else {
        // If no data field, assume individual fields are in req.body
        productData = req.body;
      }
      
      // Handle imageUrls if present in FormData
      if (req.body.imageUrls) {
        try {
          productData.imageUrls = JSON.parse(req.body.imageUrls);
        } catch (e) {
          productData.imageUrls = [];
        }
      }
    } else {
      // For JSON requests
      if (typeof req.body === 'string') {
        productData = JSON.parse(req.body);
      } else {
        productData = req.body;
      }
    }
    
    const {
      name,
      description,
      price,
      stock,
      categoryIds = [],
      images = [],
      sku,
      brand,
      metaTitle,
      metaDescription,
      keywords,
      imageUrls = [], // Additional image URLs from form data
      sellerId // For admin use: specify seller ID in payload
    } = productData;

    // Validate categories exist
    const categories = await Category.find({ _id: { $in: categoryIds } });
    if (categories.length !== categoryIds.length) {
      return res.status(400).json({ message: "One or more categories are invalid" });
    }

    // Handle image uploads if files are provided
    let uploadedImages = [...images]; // Start with existing image URLs
    
    // Add any image URLs from the form data
    if (Array.isArray(imageUrls)) {
      const urlImages = imageUrls.map(url => ({
        url: url,
        alt: name || "Product Image"
      }));
      uploadedImages = [...uploadedImages, ...urlImages];
    }

    // Upload files to Cloudinary if provided
    if (req.files && req.files.length > 0) {
      const cloudinaryResults = await uploadMultipleToCloudinary(req.files);
      
      // Add Cloudinary URLs to images array
      const cloudinaryImages = cloudinaryResults.map(result => ({
        url: result.secure_url,
        alt: name || "Product Image"
      }));
      
      uploadedImages = [...uploadedImages, ...cloudinaryImages];
    }

    // Determine seller ID based on user type
    let finalSellerId;
    if (req.userType === 'admin') {
      // Admin must provide sellerId in payload
      if (!sellerId) {
        return res.status(400).json({ message: "Admin must provide sellerId in payload" });
      }
      
      // If sellerId is not a valid ObjectId, try to find seller by email or name
      if (!mongoose.Types.ObjectId.isValid(sellerId)) {
        // Try to find seller by email first
        const sellerByEmail = await Seller.findOne({ email: sellerId });
        if (sellerByEmail) {
          finalSellerId = sellerByEmail._id;
        } else {
          // If not found by email, try to find by name
          const sellerByName = await Seller.findOne({ name: sellerId });
          if (sellerByName) {
            finalSellerId = sellerByName._id;
          } else {
            return res.status(400).json({ 
              message: "Invalid sellerId format. Must be a valid ObjectId, seller email, or seller name" 
            });
          }
        }
      } else {
        // sellerId is already a valid ObjectId
        finalSellerId = sellerId;
      }
    } else {
      // Seller uses their own ID
      finalSellerId = req.user._id;
    }

    // Determine product status
    // For sellers, products should start as "draft" and require admin approval
    // For admins, they can set any valid status
    let productStatus = "draft"; // Default to draft for sellers
    if (productData.status && ['active', 'inactive', 'draft'].includes(productData.status)) {
      productStatus = productData.status;
    }
    
    // If seller is creating a product, force it to "draft" status
    if (req.userType === 'seller') {
      productStatus = "draft";
    }

    // Create product with appropriate status
    const product = await Product.create({
      name,
      description,
      price,
      stock,
      categories: categoryIds,
      images: uploadedImages,
      sku,
      brand,
      meta: { metaTitle, metaDescription, keywords },
      sellerId: finalSellerId,
      status: productStatus
    });

    // Only create approval request if status is draft (needs approval)
    if (productStatus === "draft") {
      // Create a product approval request
      await ProductApprovalRequest.create({
        productId: product._id,
        sellerId: finalSellerId,
        requestType: "new",
        changes: {
          name,
          description,
          price,
          stock,
          categories: categoryIds,
          images: uploadedImages,
          sku,
          brand,
          meta: { metaTitle, metaDescription, keywords }
        }
      });
    }

    // Increase product count for categories
    await Category.updateMany(
      { _id: { $in: categoryIds } },
      { $inc: { "stats.productCount": 1 } }
    );

    res.status(201).json({
      message: productStatus === "draft" 
        ? "Product created successfully and submitted for approval" 
        : "Product created successfully",
      product
    });
  } catch (err) {
    console.error("Create product error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ======================================================
// UPDATE PRODUCT — SELLER ONLY
// ======================================================
export const updateProduct = async (req, res) => {
  try {
    // Parse the update data
    let updates;
    
    // Handle both JSON and FormData submissions
    if (req.is('multipart/form-data')) {
      // For FormData, data might be in a 'data' field or directly in req.body
      if (req.body.data) {
        updates = JSON.parse(req.body.data);
      } else {
        // If no data field, assume individual fields are in req.body
        updates = req.body;
      }
      
      // Handle imageUrls if present in FormData
      if (req.body.imageUrls) {
        try {
          updates.imageUrls = JSON.parse(req.body.imageUrls);
        } catch (e) {
          updates.imageUrls = [];
        }
      }
    } else {
      // For JSON requests
      if (typeof req.body === 'string') {
        updates = JSON.parse(req.body);
      } else {
        updates = req.body;
      }
    }

    const product = await Product.findOne({
      _id: req.params.id,
      sellerId: req.user._id // ensure seller owns it
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found or unauthorized" });
    }

    // Handle category change (seller cannot directly change)
    if (updates.categories) {
      return res.status(403).json({
        message: "Seller cannot directly change categories. Use category change request."
      });
    }

    // Store original product data for approval request
    const originalProduct = product.toObject();

    // Apply updates to product but keep status as draft for approval
    Object.assign(product, updates);
    
    // If the product was already approved (active), it needs re-approval
    // If it's already draft, it's still waiting for initial approval
    if (product.status === "active") {
      product.status = "draft"; // Set to draft for re-approval
    }
    
    await product.save();

    // Create a product approval request for modifications
    await ProductApprovalRequest.create({
      productId: product._id,
      sellerId: req.user._id,
      requestType: "modification",
      changes: updates
    });

    res.json({
      message: "Product update submitted for approval",
      product
    });
  } catch (err) {
    console.error("Update product error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ======================================================
// DELETE PRODUCT — SELLER
// ======================================================
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      sellerId: req.user._id
    });

    if (!product) {
      return res.status(404).json({ message: "Not found or unauthorized" });
    }

    await Product.findByIdAndDelete(product._id);

    // Decrease productCount in categories
    await Category.updateMany(
      { _id: { $in: product.categories } },
      { $inc: { "stats.productCount": -1 } }
    );

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Delete product error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ======================================================
// GET ALL PRODUCTS — PUBLIC
// ======================================================
export const getAllProducts = async (req, res) => {
  try {
    // Extract query parameters
    const { 
      category, 
      seller_id, 
      search, 
      min_price, 
      max_price,
      page = 1, 
      limit = 20 
    } = req.query;
    
    // Build query object
    let query = {};
    
    // Add category filter if provided
    if (category) {
      // Check if category is a valid ObjectId
      if (mongoose.Types.ObjectId.isValid(category)) {
        query.categories = category;
      } else {
        // If not ObjectId, try to find category by slug
        const categoryDoc = await Category.findOne({ slug: category });
        if (categoryDoc) {
          query.categories = categoryDoc._id;
        }
      }
    }
    
    // Add seller filter if provided
    if (seller_id) {
      query.sellerId = seller_id;
    }
    
    // Add price range filters
    if (min_price || max_price) {
      query.price = {};
      if (min_price) query.price.$gte = parseFloat(min_price);
      if (max_price) query.price.$lte = parseFloat(max_price);
    }
    
    // Add search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    // Execute query with pagination
    const products = await Product.find(query)
      .populate("categories")
      .populate("sellerId", "name email companyName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);
      
    // Get total count for pagination
    const total = await Product.countDocuments(query);
    
    res.json({
      data: products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (err) {
    console.error("Get all products error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ======================================================
// GET PRODUCT BY ID
// ======================================================
export const getProductById = async (req, res) => {
  try {
    // Validate the ID format
    if (!req.params.id || req.params.id === 'undefined') {
      return res.status(400).json({ message: "Invalid product ID" });
    }
    
    const product = await Product.findById(req.params.id)
      .populate("categories")
      .populate("sellerId", "name email");

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json(product);
  } catch (err) {
    console.error("Get product error:", err);
    // Handle invalid ObjectId format
    if (err.name === 'CastError') {
      return res.status(400).json({ message: "Invalid product ID format" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// ======================================================
// GET ALL PRODUCTS FOR A SELLER
// ======================================================
export const getSellerProducts = async (req, res) => {
  try {
    // Extract query parameters
    const { 
      category, 
      search, 
      min_price, 
      max_price,
      page = 1, 
      limit = 20,
      sort = '-createdAt'
    } = req.query;
    
    // Build query object with seller filter
    let query = { sellerId: req.user._id };
    
    // Add category filter if provided
    if (category) {
      // Check if category is a valid ObjectId
      if (mongoose.Types.ObjectId.isValid(category)) {
        query.categories = category;
      } else {
        // If not ObjectId, try to find category by slug
        const categoryDoc = await Category.findOne({ slug: category });
        if (categoryDoc) {
          query.categories = categoryDoc._id;
        }
      }
    }
    
    // Add price range filters
    if (min_price || max_price) {
      query.price = {};
      if (min_price) query.price.$gte = parseFloat(min_price);
      if (max_price) query.price.$lte = parseFloat(max_price);
    }
    
    // Add search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    // Execute query with pagination
    const products = await Product.find(query)
      .populate("categories")
      .populate("sellerId", "name email companyName")
      .sort(sort)
      .skip(skip)
      .limit(limitNum);
      
    // Get total count for pagination
    const total = await Product.countDocuments(query);
    
    res.json({
      success: true,
      count: products.length,
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (err) {
    console.error("Get seller products error:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: err.message 
    });
  }
};

// ======================================================
// ADMIN OVERRIDE — CHANGE PRODUCT CATEGORIES DIRECTLY
// ======================================================
export const adminChangeCategories = async (req, res) => {
  try {
    const { categoryIds = [] } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const oldCategories = product.categories;

    product.categories = categoryIds;
    await product.save();

    // update counts
    await Category.updateMany(
      { _id: { $in: oldCategories } },
      { $inc: { "stats.productCount": -1 } }
    );

    await Category.updateMany(
      { _id: { $in: categoryIds } },
      { $inc: { "stats.productCount": 1 } }
    );

    res.json({
      message: "Product categories updated by admin",
      product
    });
  } catch (err) {
    console.error("Admin change categories error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ======================================================
// SELLER REQUEST: CHANGE CATEGORIES
// ======================================================
export const requestCategoryChange = async (req, res) => {
  try {
    const { newCategoryIds = [] } = req.body;

    const product = await Product.findOne({
      _id: req.params.id,
      sellerId: req.user._id
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found or unauthorized" });
    }

    // Validate categories exist
    const categories = await Category.find({ _id: { $in: newCategoryIds } });
    if (categories.length !== newCategoryIds.length) {
      return res.status(400).json({ message: "One or more categories are invalid" });
    }

    const request = await ProductCategoryChangeRequest.create({
      productId: product._id,
      sellerId: req.user._id,
      oldCategoryIds: product.categories,
      newCategoryIds,
      status: "pending"
    });

    res.status(201).json({
      message: "Category change request submitted",
      request
    });
  } catch (err) {
    console.error("Request category change error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ======================================================
// ADD PRODUCT IMAGES
// ======================================================
export const addProductImages = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      sellerId: req.user._id
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found or unauthorized" });
    }

    let newImages = [...product.images]; // Start with existing images

    // Handle image uploads if files are provided
    if (req.files && req.files.length > 0) {
      // Upload files to Cloudinary
      const cloudinaryResults = await uploadMultipleToCloudinary(req.files);
      
      // Add Cloudinary URLs to images array
      const cloudinaryImages = cloudinaryResults.map(result => ({
        url: result.secure_url,
        alt: product.name || "Product Image"
      }));
      
      newImages = [...newImages, ...cloudinaryImages];
    }

    // Also handle image URLs from request body
    if (req.body.imageUrls && Array.isArray(req.body.imageUrls)) {
      const urlImages = req.body.imageUrls.map(url => ({
        url: url,
        alt: product.name || "Product Image"
      }));
      newImages = [...newImages, ...urlImages];
    }

    product.images = newImages;
    await product.save();

    res.json({
      message: "Images added successfully",
      product
    });
  } catch (err) {
    console.error("Add product images error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ======================================================
// TRACK PRODUCT VIEW
// ======================================================
export const trackProductView = async (req, res) => {
  try {
    // Simply return success for now - in a real implementation, you might want to:
    // 1. Store view count in the product document
    // 2. Store view events for analytics
    // 3. Track user viewing patterns
    
    // For now, we'll just acknowledge the request
    res.status(200).json({ 
      success: true, 
      message: "Product view tracked" 
    });
  } catch (err) {
    console.error("Track product view error:", err);
    // Don't fail the request if tracking fails
    res.status(200).json({ 
      success: true, 
      message: "Product view tracked" 
    });
  }
};

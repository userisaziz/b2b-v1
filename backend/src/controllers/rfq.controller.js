import RFQ from "../models/rfq.model.js";
import Product from "../models/product.model.js";
import Category from "../models/category.model.js";
import Seller from "../models/seller.model.js";
import { Buyer } from "../models/buyer.model.js";
import { Admin } from "../models/admin.model.js";

// Create a new RFQ
export const createRFQ = async (req, res) => {
  try {
    const {
      title,
      description,
      productId,
      categoryId,
      quantity,
      unit,
      distributionType,
      targetSellerIds,
      expiryDate,
      specifications
    } = req.body;

    // Validate product if provided
    let product = null;
    if (productId) {
      product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
    }

    // Validate category if provided
    let category = null;
    if (categoryId) {
      category = await Category.findById(categoryId);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
    }

    // Validate target sellers if provided
    if (distributionType === 'specific' && targetSellerIds && targetSellerIds.length > 0) {
      const sellers = await Seller.find({ _id: { $in: targetSellerIds } });
      if (sellers.length !== targetSellerIds.length) {
        return res.status(400).json({ message: "One or more target sellers not found" });
      }
    }

    // Create RFQ
    const rfqData = {
      title,
      description,
      quantity,
      unit,
      distributionType,
      targetSellerIds,
      expiryDate,
      specifications
    };

    // Set references based on user type
    if (req.userType === 'admin') {
      rfqData.adminId = req.user._id;
      // For admin-created RFQs, we might not have a specific buyer
      rfqData.buyerId = req.body.buyerId || null;
    } else if (req.userType === 'buyer') {
      rfqData.buyerId = req.user._id;
    }

    // Add product/category references if provided
    if (product) rfqData.productId = product._id;
    if (category) rfqData.categoryId = category._id;

    const rfq = await RFQ.create(rfqData);

    res.status(201).json({
      message: "RFQ created successfully",
      rfq
    });
  } catch (err) {
    console.error("Create RFQ error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all RFQs
export const getAllRFQs = async (req, res) => {
  try {
    const { status, buyerId, productId, categoryId } = req.query;
    let filter = {};

    if (status) filter.status = status;
    if (buyerId) filter.buyerId = buyerId;
    if (productId) filter.productId = productId;
    if (categoryId) filter.categoryId = categoryId;

    const rfqs = await RFQ.find(filter)
      .populate('productId', 'name sku')
      .populate('categoryId', 'name')
      .populate('buyerId', 'name email')
      .populate('adminId', 'name email')
      .populate('targetSellerIds', 'name companyName')
      .sort({ createdAt: -1 });

    res.json(rfqs);
  } catch (err) {
    console.error("Get all RFQs error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get RFQ by ID
export const getRFQById = async (req, res) => {
  try {
    const rfq = await RFQ.findById(req.params.id)
      .populate('productId', 'name sku description price images')
      .populate('categoryId', 'name description')
      .populate('buyerId', 'name email')
      .populate('adminId', 'name email')
      .populate('targetSellerIds', 'name companyName email')
      .populate('responses.sellerId', 'name companyName email');

    if (!rfq) {
      return res.status(404).json({ message: "RFQ not found" });
    }

    res.json(rfq);
  } catch (err) {
    console.error("Get RFQ error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update RFQ
export const updateRFQ = async (req, res) => {
  try {
    const {
      title,
      description,
      quantity,
      unit,
      distributionType,
      targetSellerIds,
      expiryDate,
      specifications,
      status
    } = req.body;

    const rfq = await RFQ.findById(req.params.id);
    if (!rfq) {
      return res.status(404).json({ message: "RFQ not found" });
    }

    // Check if user is authorized to update this RFQ
    if (req.userType === 'admin') {
      // Admins can update any RFQ
    } else if (req.userType === 'buyer') {
      if (rfq.buyerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Unauthorized to update this RFQ" });
      }
    } else {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Validate target sellers if provided
    if (distributionType === 'specific' && targetSellerIds && targetSellerIds.length > 0) {
      const sellers = await Seller.find({ _id: { $in: targetSellerIds } });
      if (sellers.length !== targetSellerIds.length) {
        return res.status(400).json({ message: "One or more target sellers not found" });
      }
    }

    // Update RFQ fields
    if (title) rfq.title = title;
    if (description) rfq.description = description;
    if (quantity) rfq.quantity = quantity;
    if (unit) rfq.unit = unit;
    if (distributionType) rfq.distributionType = distributionType;
    if (targetSellerIds) rfq.targetSellerIds = targetSellerIds;
    if (expiryDate) rfq.expiryDate = expiryDate;
    if (specifications) rfq.specifications = specifications;
    if (status) rfq.status = status;

    await rfq.save();

    res.json({
      message: "RFQ updated successfully",
      rfq
    });
  } catch (err) {
    console.error("Update RFQ error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete RFQ
export const deleteRFQ = async (req, res) => {
  try {
    const rfq = await RFQ.findById(req.params.id);
    if (!rfq) {
      return res.status(404).json({ message: "RFQ not found" });
    }

    // Check if user is authorized to delete this RFQ
    if (req.userType === 'admin') {
      // Admins can delete any RFQ
    } else if (req.userType === 'buyer') {
      if (rfq.buyerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Unauthorized to delete this RFQ" });
      }
    } else {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await RFQ.findByIdAndDelete(req.params.id);

    res.json({ message: "RFQ deleted successfully" });
  } catch (err) {
    console.error("Delete RFQ error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Distribute RFQ to sellers
export const distributeRFQ = async (req, res) => {
  try {
    const { sellerIds } = req.body;
    const rfq = await RFQ.findById(req.params.id);
    
    if (!rfq) {
      return res.status(404).json({ message: "RFQ not found" });
    }

    // Only admins can distribute RFQs
    if (req.userType !== 'admin') {
      return res.status(403).json({ message: "Only admins can distribute RFQs" });
    }

    // Validate sellers
    const sellers = await Seller.find({ _id: { $in: sellerIds } });
    if (sellers.length !== sellerIds.length) {
      return res.status(400).json({ message: "One or more sellers not found" });
    }

    // Add sellers to targetSellerIds if not already there
    const existingSellerIds = rfq.targetSellerIds.map(id => id.toString());
    const newSellerIds = sellerIds.filter(id => !existingSellerIds.includes(id.toString()));
    
    if (newSellerIds.length > 0) {
      rfq.targetSellerIds.push(...newSellerIds);
      await rfq.save();
    }

    res.json({
      message: "RFQ distributed to sellers successfully",
      rfq
    });
  } catch (err) {
    console.error("Distribute RFQ error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Submit quote response to RFQ
export const submitQuote = async (req, res) => {
  try {
    const { quotePrice, quoteQuantity, deliveryTime, message } = req.body;
    const rfq = await RFQ.findById(req.params.id);
    
    if (!rfq) {
      return res.status(404).json({ message: "RFQ not found" });
    }

    // Only sellers can submit quotes
    if (req.userType !== 'seller') {
      return res.status(403).json({ message: "Only sellers can submit quotes" });
    }

    // Check if seller is allowed to respond to this RFQ
    let canRespond = false;
    
    if (rfq.distributionType === 'all') {
      // All sellers can respond
      canRespond = true;
    } else if (rfq.distributionType === 'category' && rfq.categoryId) {
      // Check if seller has products in this category
      const sellerProducts = await Product.find({ 
        sellerId: req.user._id, 
        categories: rfq.categoryId 
      });
      if (sellerProducts.length > 0) {
        canRespond = true;
      }
    } else if (rfq.distributionType === 'specific') {
      // Check if seller is in targetSellerIds
      const isTargetSeller = rfq.targetSellerIds.some(id => 
        id.toString() === req.user._id.toString()
      );
      if (isTargetSeller) {
        canRespond = true;
      }
    }

    if (!canRespond) {
      return res.status(403).json({ message: "You are not authorized to respond to this RFQ" });
    }

    // Check if seller has already submitted a response
    const existingResponseIndex = rfq.responses.findIndex(response => 
      response.sellerId && response.sellerId.toString() === req.user._id.toString()
    );

    const response = {
      sellerId: req.user._id,
      quotePrice,
      quoteQuantity: quoteQuantity || rfq.quantity,
      deliveryTime,
      message,
      status: 'submitted',
      submittedAt: new Date()
    };

    if (existingResponseIndex >= 0) {
      // Update existing response
      rfq.responses[existingResponseIndex] = response;
    } else {
      // Add new response
      rfq.responses.push(response);
    }

    await rfq.save();

    res.json({
      message: "Quote submitted successfully",
      response
    });
  } catch (err) {
    console.error("Submit quote error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get RFQs for a specific seller
export const getRFQsForSeller = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const { status } = req.query;

    // Find RFQs that this seller can respond to
    let rfqs = await RFQ.find({
      status: 'published',
      $or: [
        { distributionType: 'all' },
        { 
          distributionType: 'category',
          categoryId: { $in: await Product.distinct('categories', { sellerId }) }
        },
        { 
          distributionType: 'specific',
          targetSellerIds: sellerId
        }
      ]
    });

    // Filter by status if provided
    if (status) {
      rfqs = rfqs.filter(rfq => rfq.status === status);
    }

    // Populate related data
    const populatedRfqs = await RFQ.populate(rfqs, [
      { path: 'productId', select: 'name sku' },
      { path: 'categoryId', select: 'name' },
      { path: 'buyerId', select: 'name email' },
      { path: 'adminId', select: 'name email' }
    ]);

    res.json(populatedRfqs);
  } catch (err) {
    console.error("Get RFQs for seller error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get RFQs created by a specific buyer
export const getRFQsForBuyer = async (req, res) => {
  try {
    const buyerId = req.user._id;
    const { status } = req.query;

    let filter = { buyerId };
    if (status) filter.status = status;

    const rfqs = await RFQ.find(filter)
      .populate('productId', 'name sku')
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 });

    res.json(rfqs);
  } catch (err) {
    console.error("Get RFQs for buyer error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
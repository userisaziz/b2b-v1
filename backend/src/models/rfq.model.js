import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const rfqSchema = new Schema({
  // RFQ details
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  // Product reference (optional - for product-specific RFQs)
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product'
  },
  // Category reference (optional - for category-specific RFQs)
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: 'Category'
  },
  // Quantity needed
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  // Unit of measurement
  unit: {
    type: String,
    required: true,
    trim: true
  },
  // Buyer who created the RFQ
  buyerId: {
    type: Schema.Types.ObjectId,
    ref: 'Buyer',
    required: true
  },
  // Admin who created the RFQ (for general RFQs)
  adminId: {
    type: Schema.Types.ObjectId,
    ref: 'Admin'
  },
  // Status of the RFQ
  status: {
    type: String,
    enum: ['draft', 'published', 'closed', 'cancelled'],
    default: 'draft'
  },
  // Distribution settings
  distributionType: {
    type: String,
    enum: ['all', 'category', 'specific'], // all sellers, category-specific, or specific sellers
    default: 'all'
  },
  // Specific sellers to distribute to (when distributionType is 'specific')
  targetSellerIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Seller'
  }],
  // Responses from sellers
  responses: [{
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: 'Seller'
    },
    quotePrice: {
      type: Number,
      min: 0
    },
    quoteQuantity: {
      type: Number,
      min: 0
    },
    deliveryTime: {
      type: Number // in days
    },
    message: {
      type: String
    },
    status: {
      type: String,
      enum: ['pending', 'submitted', 'accepted', 'rejected'],
      default: 'pending'
    },
    submittedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Expiry date for the RFQ
  expiryDate: {
    type: Date
  },
  // Additional specifications
  specifications: {
    type: Map,
    of: String
  },
  // Attachments (if any)
  attachments: [{
    url: String,
    name: String,
    type: String
  }]
}, {
  timestamps: true
});

// Indexes
rfqSchema.index({ title: 'text', description: 'text' });
rfqSchema.index({ buyerId: 1 });
rfqSchema.index({ status: 1 });
rfqSchema.index({ createdAt: -1 });

const RFQ = mongoose.model('RFQ', rfqSchema);

export default RFQ;
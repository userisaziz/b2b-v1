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
    min: 1
  },
  // Budget range
  budget_min: {
    type: Number,
    min: 0
  },
  budget_max: {
    type: Number,
    min: 0
  },
  // Delivery information
  delivery_location: {
    type: String,
    trim: true
  },
  deadline: {
    type: Date
  },
  // Buyer who created the RFQ (optional for public RFQs)
  buyerId: {
    type: Schema.Types.ObjectId,
    ref: 'Buyer'
  },
  // Admin who created the RFQ (for general RFQs)
  adminId: {
    type: Schema.Types.ObjectId,
    ref: 'Admin'
  },
  // Contact information for public RFQs
  contact_name: {
    type: String,
    trim: true
  },
  contact_email: {
    type: String,
    trim: true
  },
  contact_phone: {
    type: String,
    trim: true
  },
  // Status of the RFQ
  status: {
    type: String,
    enum: ['draft', 'open', 'closed', 'cancelled'],
    default: 'open'
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
rfqSchema.index({ contact_email: 1 });

const RFQ = mongoose.model('RFQ', rfqSchema);

export default RFQ;
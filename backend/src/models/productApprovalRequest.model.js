import mongoose from 'mongoose';

const productApprovalRequestSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true
  },
  requestType: {
    type: String,
    enum: ['new', 'modification'],
    required: true
  },
  changes: {
    type: mongoose.Schema.Types.Mixed, // Store the changes made to the product
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin', // Changed from 'User' to 'Admin' since only admins review requests
    required: false
  },
  reviewedAt: {
    type: Date,
    required: false
  },
  rejectionReason: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

// Indexes
productApprovalRequestSchema.index({ sellerId: 1 });
productApprovalRequestSchema.index({ productId: 1 });
productApprovalRequestSchema.index({ status: 1 });
productApprovalRequestSchema.index({ requestType: 1 });
productApprovalRequestSchema.index({ createdAt: -1 });

const ProductApprovalRequest = mongoose.model('ProductApprovalRequest', productApprovalRequestSchema);

export default ProductApprovalRequest;
import mongoose from 'mongoose';

const categoryRequestSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true
  },
  proposedName: {
    type: String,
    required: true,
    trim: true
  },
  proposedSlug: {
    type: String,
    required: true,
    trim: true
  },
  parentCategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  parentCategoryName: {
    type: String,
    trim: true
  },
  parentCategoryPath: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  sellerReason: {
    type: String,
    required: true,
    trim: true
  },
  // Add image field for category request
  image: {
    url: {
      type: String,
      trim: true
    },
    alt: {
      type: String,
      trim: true
    }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  reviewedAt: {
    type: Date
  },
  adminNotes: {
    type: String,
    trim: true
  },
  rejectionReason: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes
categoryRequestSchema.index({ sellerId: 1 });
categoryRequestSchema.index({ status: 1 });
categoryRequestSchema.index({ createdAt: -1 });

const CategoryRequest = mongoose.model('CategoryRequest', categoryRequestSchema);

export default CategoryRequest;
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const productCategoryChangeRequestSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  sellerId: {
    type: Schema.Types.ObjectId,
    ref: 'Seller',
    required: true
  },
  requestType: {
    type: String,
    enum: ['add', 'remove', 'change'],
    required: true
  },
  currentCategoryIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Category'
  }],
  requestedCategoryIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Category'
  }],
  categoriesToAdd: [{
    type: Schema.Types.ObjectId,
    ref: 'Category'
  }],
  categoriesToRemove: [{
    type: Schema.Types.ObjectId,
    ref: 'Category'
  }],
  reason: {
    type: String,
    required: true
  },
  sellerNotes: String,
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  adminNotes: String,
  reviewedBy: {
    type: Schema.Types.ObjectId,
    ref: 'Admin'
  },
  reviewedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
productCategoryChangeRequestSchema.index({ sellerId: 1 });
productCategoryChangeRequestSchema.index({ productId: 1 });
productCategoryChangeRequestSchema.index({ status: 1 });

const ProductCategoryChangeRequest = mongoose.model('ProductCategoryChangeRequest', productCategoryChangeRequestSchema);

export default ProductCategoryChangeRequest;
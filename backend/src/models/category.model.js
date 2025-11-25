import mongoose from 'mongoose';
const Schema = mongoose.Schema;

// =====================================================
// 1. CATEGORY SCHEMA
// =====================================================

const categorySchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  parentId: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  level: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  path: {
    type: String,
    required: true
  },
  ancestors: [{
    id: { type: Schema.Types.ObjectId, ref: 'Category' },
    name: String,
    slug: String
  }],
  description: String,
  imageUrl: String,
  isActive: {
    type: Boolean,
    default: true
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  metadata: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  },
  stats: {
    productCount: { type: Number, default: 0 },
    childrenCount: { type: Number, default: 0 }
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
categorySchema.index({ slug: 1 });
categorySchema.index({ parentId: 1 });
categorySchema.index({ path: 1 });
categorySchema.index({ 'ancestors.id': 1 });
categorySchema.index({ isActive: 1, displayOrder: 1 });
categorySchema.index({ level: 1 });

const Category = mongoose.model('Category', categorySchema);

export default Category;
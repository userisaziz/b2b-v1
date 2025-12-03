import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const productSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  categories: [{
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  }],
  images: [{
    url: String,
    alt: String
  }],
  sku: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  brand: {
    type: String,
    trim: true
  },
  meta: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  },
  sellerId: {
    type: Schema.Types.ObjectId,
    ref: 'Seller',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft'],
    default: 'draft'
  },
  // Enhanced attributes structure to support multiple attributes with more details
  attributes: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    value: {
      type: String,
      required: true,
      trim: true
    },
    unit: {
      type: String,
      trim: true
    },
    displayType: {
      type: String,
      enum: ['text', 'number', 'boolean', 'color', 'size'],
      default: 'text'
    },
    isSearchable: {
      type: Boolean,
      default: true
    },
    isFilterable: {
      type: Boolean,
      default: true
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ sellerId: 1 });
productSchema.index({ categories: 1 });
productSchema.index({ price: 1 });
productSchema.index({ status: 1 });
productSchema.index({ 'attributes.name': 1, 'attributes.value': 1 });

// Update the updatedAt field before saving
productSchema.pre('save', async function() {
  this.updatedAt = new Date();
});

const Product = mongoose.model('Product', productSchema);

export default Product;
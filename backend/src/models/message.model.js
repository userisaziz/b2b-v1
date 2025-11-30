import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender_id: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'sender_type',
    required: true
  },
  recipient_id: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'recipient_type',
    required: true
  },
  sender_type: {
    type: String,
    required: true,
    enum: ['Buyer', 'Seller', 'Admin']
  },
  recipient_type: {
    type: String,
    required: true,
    enum: ['Buyer', 'Seller', 'Admin']
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  message_type: {
    type: String,
    default: 'general',
    enum: ['general', 'rfq', 'order', 'support']
  },
  status: {
    type: String,
    default: 'unread',
    enum: ['read', 'unread']
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
messageSchema.index({ sender_id: 1, recipient_id: 1 });
messageSchema.index({ recipient_id: 1, status: 1 });
messageSchema.index({ created_at: -1 });

const Message = mongoose.model('Message', messageSchema);

export default Message;
import Message from '../models/message.model.js';
import { Buyer } from '../models/buyer.model.js';
import Seller  from '../models/seller.model.js';
import { validationResult } from 'express-validator';
import { io } from '../server.js';

// Send a new message
export const sendMessage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { recipient_id, subject, message, message_type, recipient_type } = req.body;
    const sender_id = req.user.id;
    const sender_type = req.user.role;

    // Validate recipient exists
    let recipientModel;
    switch (recipient_type) {
      case 'Buyer':
        recipientModel = Buyer;
        break;
      case 'Seller':
        recipientModel = Seller;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid recipient type'
        });
    }

    const recipient = await recipientModel.findById(recipient_id);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found'
      });
    }

    // Create message
    const newMessage = new Message({
      sender_id,
      recipient_id,
      sender_type,
      recipient_type,
      subject,
      message,
      message_type
    });

    await newMessage.save();

    // Populate sender and recipient info
    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender_id', 'name email company')
      .populate('recipient_id', 'name email company');

    // Emit socket event for real-time updates
    io.emit('new_message', populatedMessage);

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: populatedMessage
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get inbox messages for a user
export const getInbox = async (req, res) => {
  try {
    const user_id = req.user.id;
    const user_type = req.user.role;
    const { limit = 50, offset = 0 } = req.query;

    const messages = await Message.find({
      recipient_id: user_id,
      recipient_type: user_type
    })
      .populate('sender_id', 'name email company')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const totalCount = await Message.countDocuments({
      recipient_id: user_id,
      recipient_type: user_type
    });

    res.status(200).json({
      success: true,
      data: messages,
      totalCount,
      message: 'Inbox messages retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching inbox:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get sent messages for a user
export const getSent = async (req, res) => {
  try {
    const user_id = req.user.id;
    const user_type = req.user.role;
    const { limit = 50, offset = 0 } = req.query;

    const messages = await Message.find({
      sender_id: user_id,
      sender_type: user_type
    })
      .populate('recipient_id', 'name email company')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const totalCount = await Message.countDocuments({
      sender_id: user_id,
      sender_type: user_type
    });

    res.status(200).json({
      success: true,
      data: messages,
      totalCount,
      message: 'Sent messages retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching sent messages:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get a specific message
export const getMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;
    const user_type = req.user.role;

    const message = await Message.findOne({
      _id: id,
      $or: [
        { sender_id: user_id, sender_type: user_type },
        { recipient_id: user_id, recipient_type: user_type }
      ]
    }).populate([
      { path: 'sender_id', select: 'name email company' },
      { path: 'recipient_id', select: 'name email company' }
    ]);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found or unauthorized'
      });
    }

    // Mark as read if recipient is viewing
    if (message.recipient_id.toString() === user_id && message.status === 'unread') {
      message.status = 'read';
      await message.save();
      
      // Emit update event
      io.emit('message_updated', message);
      
      // Emit read receipt
      io.emit('message_read', {
        message_id: message._id,
        reader_id: user_id,
        timestamp: new Date()
      });
    }

    res.status(200).json({
      success: true,
      data: message,
      message: 'Message retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching message:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get conversation between buyer and seller
export const getConversation = async (req, res) => {
  try {
    const { participant_id, participant_type } = req.params;
    const user_id = req.user.id;
    const user_type = req.user.role;

    // Validate participant type
    if (!['Buyer', 'Seller'].includes(participant_type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid participant type'
      });
    }

    // Get messages between the two participants
    const messages = await Message.find({
      $or: [
        { 
          sender_id: user_id, 
          sender_type: user_type,
          recipient_id: participant_id,
          recipient_type: participant_type
        },
        {
          sender_id: participant_id,
          sender_type: participant_type,
          recipient_id: user_id,
          recipient_type: user_type
        }
      ]
    })
      .populate('sender_id', 'name email company')
      .populate('recipient_id', 'name email company')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      data: messages,
      message: 'Conversation retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Mark message as read
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;
    const user_type = req.user.role;

    const message = await Message.findOneAndUpdate(
      {
        _id: id,
        recipient_id: user_id,
        recipient_type: user_type
      },
      { status: 'read' },
      { new: true }
    ).populate([
      { path: 'sender_id', select: 'name email company' },
      { path: 'recipient_id', select: 'name email company' }
    ]);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found or unauthorized'
      });
    }

    // Emit update event
    io.emit('message_updated', message);
    
    // Emit read receipt
    io.emit('message_read', {
      message_id: message._id,
      reader_id: user_id,
      timestamp: new Date()
    });

    res.status(200).json({
      success: true,
      data: message,
      message: 'Message marked as read'
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get unread message count
export const getUnreadCount = async (req, res) => {
  try {
    const user_id = req.user.id;
    const user_type = req.user.role;

    const count = await Message.countDocuments({
      recipient_id: user_id,
      recipient_type: user_type,
      status: 'unread'
    });

    res.status(200).json({
      success: true,
      data: { count },
      message: 'Unread count retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
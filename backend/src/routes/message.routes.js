import express from 'express';
import { 
  sendMessage, 
  getInbox, 
  getSent, 
  getMessage, 
  markAsRead,
  getUnreadCount,
  getConversation
} from '../controllers/message.controller.js';
import { protectUniversal } from '../middleware/auth.middleware.js';
import { body } from 'express-validator';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protectUniversal);

// Message routes
router.post('/send', 
  body('recipient_id').notEmpty().withMessage('Recipient ID is required'),
  body('subject').notEmpty().withMessage('Subject is required'),
  body('message').notEmpty().withMessage('Message content is required'),
  body('recipient_type').isIn(['Buyer', 'Seller']).withMessage('Invalid recipient type'),
  sendMessage
);

router.get('/inbox', getInbox);
router.get('/sent', getSent);
router.get('/conversation/:participant_id/:participant_type', getConversation);
router.get('/:id', getMessage);
router.put('/:id/read', markAsRead);
router.get('/unread/count', getUnreadCount);

export default router;
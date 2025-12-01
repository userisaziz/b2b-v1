# Real-time Chat Implementation

This document describes the real-time chat functionality implemented using WebSocket for communication between buyers and sellers.

## Features Implemented

### 1. Real-time Messaging
- Instant message delivery between buyers and sellers
- WebSocket-based communication for low latency
- Message persistence in MongoDB

### 2. Online Presence
- Real-time user online/offline status
- Visual indicators for user availability
- Automatic status updates

### 3. Typing Indicators
- Real-time typing notifications
- Visual feedback when users are composing messages
- Automatic timeout for typing indicators

### 4. Message Status
- Delivery receipts
- Read receipts
- Message status indicators (sent, delivered, read)

### 5. Conversation History
- Persistent chat history
- Easy retrieval of conversation threads
- Sorting by timestamp

## Technical Implementation

### Backend (Node.js + Socket.IO)
- Socket.IO server for real-time communication
- MongoDB for message persistence
- Express.js REST API for initial data loading
- Event-driven architecture

### Frontend (React + TypeScript)
- Custom WebSocket service wrappers
- Real-time UI updates
- Component-based architecture
- TypeScript type safety

## WebSocket Events

### Client to Server
- `register_user` - Register user with socket connection
- `send_message` - Send a new message
- `typing` - Notify when user is typing
- `mark_as_read` - Mark message as read
- `join_room` - Join a chat room
- `leave_room` - Leave a chat room
- `update_status` - Update user status (online/offline)

### Server to Client
- `new_message` - New message received
- `user_typing` - User is typing notification
- `message_read` - Message read receipt
- `message_delivered` - Message delivery confirmation
- `message_updated` - Message status updated
- `user_status_changed` - User status change notification
- `online_users` - List of currently online users

## API Endpoints

### Messages
- `POST /api/messages/send` - Send a new message
- `GET /api/messages/inbox` - Get inbox messages
- `GET /api/messages/sent` - Get sent messages
- `GET /api/messages/:id` - Get specific message
- `PUT /api/messages/:id/read` - Mark message as read
- `GET /api/messages/unread/count` - Get unread message count
- `GET /api/messages/conversation/:participant_id/:participant_type` - Get conversation history

## Components

### Storefront
- `EnhancedChatInterface` - Full-featured chat interface
- `SimpleChatInterface` - Lightweight chat widget
- `useRealtimeMessages` - React hook for WebSocket integration

### Seller Panel
- `ChatWidget` - Chat widget for seller-buyer communication
- Enhanced message page with real-time features

## Usage Examples

### Sending a Message
```typescript
import socketService from '@/services/socket.service';

// Send a message via WebSocket
socketService.sendMessage({
  recipient_id: 'buyer123',
  subject: 'Product Inquiry',
  message: 'Hello, I have a question about your product',
  message_type: 'general',
  sender_id: 'seller456',
  sender_type: 'Seller',
  recipient_type: 'Buyer'
});
```

### Listening for Messages
```typescript
import socketService from '@/services/socket.service';

// Listen for new messages
socketService.onNewMessage((message) => {
  console.log('New message received:', message);
  // Update UI with new message
});

// Listen for typing indicators
socketService.onTyping((data) => {
  if (data.is_typing) {
    console.log(`${data.sender_id} is typing...`);
  }
});
```

## Security Considerations

- Authentication required for all WebSocket connections
- Message validation and sanitization
- Rate limiting to prevent abuse
- Secure WebSocket connections (wss:// in production)

## Performance Optimizations

- Message batching for high-frequency updates
- Efficient event handling with proper cleanup
- Lazy loading of conversation history
- Connection pooling for database operations

## Future Enhancements

- Message encryption
- File/image sharing
- Voice/video calling integration
- Message reactions and emojis
- Group chat functionality
- Message search and filtering
- Push notifications for offline users
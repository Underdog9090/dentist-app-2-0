import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { initializeSocket } from '../services/socketService.js';
import { sendNotificationToUser } from '../services/socketService.js';
import User from '../models/User.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smile-bright', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Create HTTP server and initialize Socket.io
const httpServer = createServer();
const io = initializeSocket(httpServer);
httpServer.listen(3001, () => {
  console.log('Test server running on port 3001');
});

// Test function to send notifications
async function testNotifications() {
  try {
    // Get a test user
    const user = await User.findOne({ role: 'patient' });
    if (!user) {
      console.error('No patient user found for testing');
      return;
    }

    console.log(`Testing notifications for user: ${user.username}`);

    // Test booking status notification
    console.log('\nSending booking status notification...');
    sendNotificationToUser(user._id, {
      type: 'booking_status',
      title: 'Appointment Confirmed',
      message: 'Your appointment has been confirmed for tomorrow at 10:00 AM',
      appointmentId: 'test-appointment-id',
      timestamp: new Date()
    });

    // Wait 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test message reply notification
    console.log('\nSending message reply notification...');
    sendNotificationToUser(user._id, {
      type: 'message_reply',
      title: 'New Message',
      message: 'You have received a reply to your appointment message',
      appointmentId: 'test-appointment-id',
      timestamp: new Date()
    });

    console.log('\nAll test notifications sent!');
    console.log('Check the frontend to see if notifications appear correctly.');

  } catch (error) {
    console.error('Error testing notifications:', error);
  } finally {
    // Close connections
    mongoose.connection.close();
    httpServer.close();
  }
}

// Run the test
testNotifications(); 
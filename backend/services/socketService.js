import { Server } from 'socket.io';
import Notification from '../models/Notification.js';

let io;

export function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Handle user joining their room
    socket.on('join', (userId) => {
      socket.join(`user_${userId}`);
      console.log(`User ${userId} joined their room`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
}

// Helper function to send notification to a specific user and persist it
export async function sendNotificationToUser(userId, notification) {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  io.to(`user_${userId}`).emit('notification', notification);
  // Save to database
  try {
    await Notification.create({
      user: userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      appointmentId: notification.appointmentId,
      timestamp: notification.timestamp || new Date(),
      read: false
    });
  } catch (err) {
    console.error('Failed to save notification:', err);
  }
}

// Helper function to send notification to all users
export function broadcastNotification(notification) {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  io.emit('notification', notification);
} 
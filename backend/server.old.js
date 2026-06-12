// This file has been renamed to server.old.js to avoid confusion. Please use src/server.js as your backend entry point.

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import appointmentRoutes from './routes/appointments.js';
import userRoutes from './routes/users.js';
import notificationRoutes from './routes/notifications.js';
import { startReminderSystem } from './utils/reminderSystem.js';
import { initializeSocket } from './services/socketService.js';
import { initializeNotificationService } from './services/notificationService.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.io
initializeSocket(httpServer);

// Initialize Notification Service
initializeNotificationService();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smile-bright', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/appointments', appointmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);

// Basic route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Smile Bright API' });
});

// Start the reminder system
startReminderSystem();

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 
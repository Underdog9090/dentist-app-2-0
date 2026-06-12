import nodemailer from 'nodemailer';
import { sendNotificationToUser } from './socketService.js';

let transporter;

// Initialize the notification service
export function initializeNotificationService() {
  // Initialize email transporter
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

// Send email notification
export async function sendEmailNotification(to, subject, text, html) {
  if (!transporter) {
    console.error('Email transporter not initialized');
    return;
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@dentist.com',
      to,
      subject,
      text,
      html
    });
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

// Notify about new message reply
export async function notifyMessageReply(userId, email, appointmentId, reply) {
  // Send real-time notification
  sendNotificationToUser(userId, {
    type: 'message_reply',
    title: 'New Reply to Your Message',
    message: 'You have received a reply to your message.',
    appointmentId,
    timestamp: new Date()
  });

  // Send email notification
  await sendEmailNotification(
    email,
    'New Reply to Your Message',
    `You have received a reply to your message: ${reply}`,
    `
    <h2>New Reply to Your Message</h2>
    <p>You have received a reply to your message:</p>
    <p>${reply}</p>
    <p>Click here to view the full conversation: <a href="${process.env.FRONTEND_URL}/appointments/${appointmentId}">View Message</a></p>
    `
  );
}

// Notify about booking status change
export async function notifyBookingStatusChange(userId, email, appointmentId, status) {
  // Send real-time notification
  sendNotificationToUser(userId, {
    type: 'booking_status',
    title: 'Booking Status Updated',
    message: `Your booking status has been updated to: ${status}`,
    appointmentId,
    timestamp: new Date()
  });

  // Send email notification
  await sendEmailNotification(
    email,
    'Booking Status Updated',
    `Your booking status has been updated to: ${status}`,
    `
    <h2>Booking Status Updated</h2>
    <p>Your booking status has been updated to: <strong>${status}</strong></p>
    <p>Click here to view your booking: <a href="${process.env.FRONTEND_URL}/appointments/${appointmentId}">View Booking</a></p>
    `
  );
} 
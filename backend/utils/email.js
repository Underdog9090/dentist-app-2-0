import nodemailer from 'nodemailer';
import { templates } from './emailTemplates.js';

// Configure your email transport (example: Gmail, can be replaced with any SMTP)
const transporter = nodemailer.createTransport({
  service: 'gmail', // or use 'smtp.ethereal.email' for testing
  auth: {
    user: process.env.EMAIL_USER, // set in your .env file
    pass: process.env.EMAIL_PASS, // set in your .env file
  },
});

// Helper function to send emails
async function sendEmail(to, subject, html) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    html,
  };
  await transporter.sendMail(mailOptions);
}

// Send appointment confirmation email
export async function sendAppointmentConfirmation(appointment) {
  try {
    await sendEmail(
      appointment.email,
      `Appointment Confirmed: ${appointment.service}`,
      templates.appointmentConfirmation(appointment)
    );
  } catch (error) {
    console.error('Failed to send appointment confirmation email:', error);
    throw error;
  }
}

// Send appointment cancellation email
export async function sendAppointmentCancellation(appointment) {
  try {
    await sendEmail(
      appointment.email,
      `Appointment Cancelled: ${appointment.service}`,
      templates.appointmentCancellation(appointment)
    );
  } catch (error) {
    console.error('Failed to send appointment cancellation email:', error);
    throw error;
  }
}

// Send appointment reminder email
export async function sendAppointmentReminder(appointment) {
  try {
    await sendEmail(
      appointment.email,
      `Reminder: Upcoming Dental Appointment`,
      templates.appointmentReminder(appointment)
    );
  } catch (error) {
    console.error('Failed to send appointment reminder email:', error);
    throw error;
  }
}

// Send reply to patient message
export async function sendReplyEmail(appointment, replyBody) {
  try {
    await sendEmail(
      appointment.email,
      `Reply to your message about: ${appointment.service}`,
      templates.messageReply(appointment, replyBody)
    );
  } catch (error) {
    console.error('Failed to send reply email:', error);
    throw error;
  }
} 
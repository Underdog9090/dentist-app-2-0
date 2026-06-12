import Appointment from '../models/Appointment.js';
import { sendAppointmentReminder } from './email.js';

// Function to send reminders for appointments
export async function sendReminders() {
  try {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    // Find appointments scheduled for tomorrow
    const appointments = await Appointment.find({
      date: {
        $gte: tomorrow,
        $lt: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)
      },
      status: 'confirmed',
      reminderSent: { $ne: true } // Only send reminder if not already sent
    });

    console.log(`Found ${appointments.length} appointments to send reminders for`);

    // Send reminder email for each appointment
    for (const appointment of appointments) {
      try {
        await sendAppointmentReminder(appointment);
        
        // Mark reminder as sent
        appointment.reminderSent = true;
        await appointment.save();
        
        console.log(`Sent reminder for appointment ${appointment._id}`);
      } catch (error) {
        console.error(`Failed to send reminder for appointment ${appointment._id}:`, error);
      }
    }
  } catch (error) {
    console.error('Error in reminder system:', error);
  }
}

// Function to start the reminder system
export function startReminderSystem() {
  // Run immediately on startup
  sendReminders();

  // Then run every hour
  setInterval(sendReminders, 60 * 60 * 1000);
} 
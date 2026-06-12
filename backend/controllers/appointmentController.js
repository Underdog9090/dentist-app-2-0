import Appointment from '../models/Appointment.js';
import { sendReplyEmail, sendAppointmentConfirmation, sendAppointmentCancellation } from '../utils/email.js';
import { sendNotificationToUser } from '../services/socketService.js';
import User from '../models/User.js';

// Create new appointment
export const createAppointment = async (req, res) => {
    try {
        const appointment = new Appointment({
            ...req.body,
            user: req.user.id
        });
        await appointment.save();
        res.status(201).json(appointment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all appointments for the logged-in user
export const getAppointments = async (req, res) => {
    try {
        let appointments;
        if (req.user.role === 'admin') {
            appointments = await Appointment.find().sort({ date: 1 });
        } else {
            appointments = await Appointment.find({ user: req.user.id }).sort({ date: 1 });
        }
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single appointment
export const getAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        res.json(appointment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update appointment
export const updateAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Check if status is being changed
        const statusChanged = req.body.status && req.body.status !== appointment.status;

        // Update the appointment
        Object.assign(appointment, req.body);
        await appointment.save();

        // Send appropriate email and notification based on status change
        if (statusChanged) {
            try {
                if (req.body.status === 'confirmed') {
                    await sendAppointmentConfirmation(appointment);
                    // Send real-time notification
                    sendNotificationToUser(appointment.user, {
                        type: 'booking_status',
                        title: 'Appointment Confirmed',
                        message: `Your appointment on ${new Date(appointment.date).toLocaleDateString()} has been confirmed.`,
                        appointmentId: appointment._id,
                        timestamp: new Date()
                    });
                } else if (req.body.status === 'cancelled') {
                    await sendAppointmentCancellation(appointment);
                    // Send real-time notification
                    sendNotificationToUser(appointment.user, {
                        type: 'booking_status',
                        title: 'Appointment Cancelled',
                        message: `Your appointment on ${new Date(appointment.date).toLocaleDateString()} has been cancelled.`,
                        appointmentId: appointment._id,
                        timestamp: new Date()
                    });
                }
            } catch (emailError) {
                console.error('Failed to send status change email:', emailError);
                // Don't fail the request if email fails
            }
        }

        res.json(appointment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete appointment
export const deleteAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findByIdAndDelete(req.params.id);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        res.json({ message: 'Appointment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add a reply to an appointment
export const addReply = async (req, res) => {
    try {
        const { id } = req.params;
        const { body } = req.body;
        if (!body || !body.trim()) {
            return res.status(400).json({ message: 'Reply body is required' });
        }
        const appointment = await Appointment.findById(id);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        const reply = {
            body,
            admin: req.user.username || req.user.email || req.user.role,
            date: new Date()
        };
        appointment.replies.push(reply);
        appointment.read = true;
        await appointment.save();

        // Send email notification to patient
        try {
            await sendReplyEmail(appointment, reply.body);
        } catch (emailErr) {
            // Log but don't fail the request if email fails
            console.error('Failed to send reply email:', emailErr);
        }

        // Notify the other party
        if (req.user.role === 'patient') {
            // Notify all admins
            const admins = await User.find({ role: 'admin' });
            admins.forEach(admin => {
                sendNotificationToUser(admin._id, {
                    type: 'message_reply',
                    title: 'New Patient Reply',
                    message: `A patient has replied to a message regarding their appointment on ${new Date(appointment.date).toLocaleDateString()}.`,
                    appointmentId: appointment._id,
                    timestamp: new Date()
                });
            });
        } else {
            // Notify patient
            sendNotificationToUser(appointment.user, {
                type: 'message_reply',
                title: 'New Message',
                message: `You have received a new message regarding your appointment on ${new Date(appointment.date).toLocaleDateString()}.`,
                appointmentId: appointment._id,
                timestamp: new Date()
            });
        }

        res.status(201).json(appointment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 
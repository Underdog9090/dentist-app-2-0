import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
    patientName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    service: {
        type: String,
        required: true
    },
    message: {
        type: String
    },
    read: {
        type: Boolean,
        default: false
    },
    replies: [
        {
            body: { type: String, required: true },
            date: { type: Date, default: Date.now },
            admin: { type: String } // Optionally store admin name or id
        }
    ],
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled'],
        default: 'pending'
    },
    reminderSent: {
        type: Boolean,
        default: false
    },
    staff: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Optional for now
    },
    duration: {
        type: Number,
        default: 30 // Duration in minutes
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment; 
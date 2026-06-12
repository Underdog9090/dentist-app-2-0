import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'staff', 'patient'],
        default: 'patient'
    },
    schedule: {
        type: Map,
        of: {
            start: { type: String },
            end: { type: String },
            available: { type: Boolean }
        },
        default: () => ({
            monday: { start: '09:00', end: '17:00', available: true },
            tuesday: { start: '09:00', end: '17:00', available: true },
            wednesday: { start: '09:00', end: '17:00', available: true },
            thursday: { start: '09:00', end: '17:00', available: true },
            friday: { start: '09:00', end: '17:00', available: true },
            saturday: { start: '10:00', end: '14:00', available: false },
            sunday: { start: '10:00', end: '14:00', available: false }
        })
    },
    specialties: [{
        type: String
    }],
    dateOfBirth: {
        type: Date
    },
    phoneNumber: {
        type: String
    },
    avatar: {
        type: String
    },
    medicalHistory: [{
        condition: String,
        diagnosis: String,
        date: Date
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date
    },
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Method to check if user is admin
userSchema.methods.isAdmin = function() {
    return this.role === 'admin';
};

// Method to check if user is staff
userSchema.methods.isStaff = function() {
    return this.role === 'staff';
};

// Method to check if user is patient
userSchema.methods.isPatient = function() {
    return this.role === 'patient';
};

const User = mongoose.model('User', userSchema);
export default User; 
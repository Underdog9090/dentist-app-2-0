import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Register new user
export const register = async (req, res) => {
    try {
        const { username, email, password, phoneNumber, dateOfBirth } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user as patient by default
        const user = new User({
            username,
            email,
            password,
            role: 'patient', // Always set role to patient for public registration
            phoneNumber,
            dateOfBirth
        });

        await user.save();

        // Create token
        const token = jwt.sign(
            { 
                id: user._id, 
                username: user.username, 
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                phoneNumber: user.phoneNumber,
                dateOfBirth: user.dateOfBirth
            }
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Login user
export const login = async (req, res) => {
    console.log('Login endpoint hit', req.body); // Logging
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        console.log('User found:', user); // Logging
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        console.log('Password match:', isMatch); // Logging
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create token
        const token = jwt.sign(
            { 
                id: user._id, 
                username: user.username, 
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error); // Logging
        res.status(400).json({ message: error.message });
    }
};

// Get current user
export const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create admin user
export const createAdmin = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new admin user
        const user = new User({
            username,
            email,
            password,
            role: 'admin'  // Set role as admin
        });

        await user.save();

        // Create token
        const token = jwt.sign(
            { 
                id: user._id, 
                username: user.username, 
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all staff users
export const getStaff = async (req, res) => {
    try {
        const staff = await User.find({ role: 'staff' }).select('-password');
        res.json(staff);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create staff user (admin only)
export const createStaff = async (req, res) => {
    try {
        // Check if the requesting user is admin
        if (!req.user.isAdmin()) {
            return res.status(403).json({ message: 'Only admins can create staff accounts' });
        }

        const { username, email, password, specialties } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new staff user
        const user = new User({
            username,
            email,
            password,
            role: 'staff',
            specialties
        });

        await user.save();

        res.status(201).json({
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                specialties: user.specialties
            }
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update staff user
export const updateStaff = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Don't allow role changes through this endpoint
        delete updates.role;

        // If schedule is being updated, validate the format
        if (updates.schedule) {
            const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
            for (const day of days) {
                if (updates.schedule[day]) {
                    const { start, end, available } = updates.schedule[day];
                    if (start && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(start)) {
                        return res.status(400).json({ message: `Invalid start time format for ${day}` });
                    }
                    if (end && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(end)) {
                        return res.status(400).json({ message: `Invalid end time format for ${day}` });
                    }
                    if (typeof available !== 'undefined' && typeof available !== 'boolean') {
                        return res.status(400).json({ message: `Invalid available value for ${day}` });
                    }
                }
            }
        }

        const user = await User.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update staff schedule
export const updateStaffSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        const { schedule } = req.body;

        // Validate schedule format
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        for (const day of days) {
            if (schedule[day]) {
                const { start, end, available } = schedule[day];
                if (start && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(start)) {
                    return res.status(400).json({ message: `Invalid start time format for ${day}` });
                }
                if (end && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(end)) {
                    return res.status(400).json({ message: `Invalid end time format for ${day}` });
                }
                if (typeof available !== 'undefined' && typeof available !== 'boolean') {
                    return res.status(400).json({ message: `Invalid available value for ${day}` });
                }
            }
        }

        const user = await User.findByIdAndUpdate(
            id,
            { $set: { schedule } },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete staff user
export const deleteStaff = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndDelete(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update user role (admin only)
export const updateUserRole = async (req, res) => {
    try {
        // Check if the requesting user is admin
        if (!req.user.isAdmin()) {
            return res.status(403).json({ message: 'Only admins can update user roles' });
        }

        const { id } = req.params;
        const { role } = req.body;

        // Validate role
        if (!['admin', 'staff', 'patient'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const user = await User.findByIdAndUpdate(
            id,
            { role },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all users (admin only)
export const getAllUsers = async (req, res) => {
    try {
        // Check if the requesting user is admin
        if (!req.user.isAdmin()) {
            return res.status(403).json({ message: 'Only admins can view all users' });
        }

        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
import express from 'express';
const router = express.Router();
import auth from '../middleware/auth.js';
import User from '../models/User.js';
import isAdmin from '../middleware/isAdmin.js';

// Get all staff members
router.get('/', auth, async (req, res) => {
  try {
    const staff = await User.find({ role: 'staff' });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new staff member
router.post('/', auth, isAdmin, async (req, res) => {
  try {
    const { username, email, password, role, specialties, schedule } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const staff = new User({
      username,
      email,
      password,
      role: role || 'staff',
      specialties: specialties || [],
      schedule: schedule || {
        monday: { start: '09:00', end: '17:00', available: true },
        tuesday: { start: '09:00', end: '17:00', available: true },
        wednesday: { start: '09:00', end: '17:00', available: true },
        thursday: { start: '09:00', end: '17:00', available: true },
        friday: { start: '09:00', end: '17:00', available: true }
      }
    });

    await staff.save();
    res.status(201).json(staff);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a staff member
router.put('/:id', auth, isAdmin, async (req, res) => {
  try {
    const { username, email, password, role, specialties, schedule } = req.body;
    const staff = await User.findById(req.params.id);

    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    if (username) staff.username = username;
    if (email) staff.email = email;
    if (password) staff.password = password;
    if (role) staff.role = role;
    if (specialties) staff.specialties = specialties;
    if (schedule) staff.schedule = schedule;

    await staff.save();
    res.json(staff);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a staff member
router.delete('/:id', auth, isAdmin, async (req, res) => {
  try {
    const staff = await User.findById(req.params.id);
    
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    await staff.remove();
    res.json({ message: 'Staff member deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router; 
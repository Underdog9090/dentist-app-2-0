import express from 'express';
import { 
    register, 
    login, 
    getCurrentUser, 
    createAdmin, 
    getStaff,
    createStaff,
    updateStaff,
    deleteStaff,
    updateStaffSchedule,
    updateUserRole,
    getAllUsers
} from '../controllers/userController.js';
import auth from '../middleware/auth.js';
import isAdmin from '../middleware/isAdmin.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import User from '../models/User.js';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Public routes
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('username').notEmpty().trim().escape(),
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  return register(req, res, next);
});

router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  return login(req, res, next);
});

// Protected routes
router.get('/me', auth, getCurrentUser);

// Admin only routes
router.post('/create-admin', auth, isAdmin, createAdmin);
router.get('/all', auth, isAdmin, getAllUsers);
router.put('/:id/role', auth, isAdmin, updateUserRole);

// Staff management routes (admin only)
router.get('/staff', auth, isAdmin, getStaff);
router.post('/staff', auth, isAdmin, createStaff);
router.put('/staff/:id', auth, isAdmin, updateStaff);
router.delete('/staff/:id', auth, isAdmin, deleteStaff);
router.put('/staff/:id/schedule', auth, isAdmin, updateStaffSchedule);

// Forgot Password Endpoint
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    // For security, don't reveal if user exists
    return res.status(200).json({ message: 'If that email is registered, a reset link has been sent.' });
  }

  // Generate token
  const token = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  await user.save();

  // Send email
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const resetUrl = `http://localhost:3000/reset-password/${token}`;
  const mailOptions = {
    to: user.email,
    from: process.env.EMAIL_USER,
    subject: 'Smile Bright Password Reset',
    text: `You requested a password reset. Click the link to set a new password: ${resetUrl}`,
  };

  await transporter.sendMail(mailOptions);

  res.status(200).json({ message: 'If that email is registered, a reset link has been sent.' });
});

// Reset Password Endpoint with validation
router.post('/reset-password', [
  body('token').notEmpty(),
  body('password').isLength({ min: 6 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { token, password } = req.body;
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });
  if (!user) {
    return res.status(400).json({ message: 'Invalid or expired token.' });
  }

  user.password = password; // Will be hashed by pre-save hook
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.status(200).json({ message: 'Password has been reset. You can now log in.' });
});

// Change password endpoint
router.put('/change-password', auth, async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 
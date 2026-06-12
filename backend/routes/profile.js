import express from 'express';
const router = express.Router();
import auth from '../middleware/auth.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

// Update user profile
router.put('/', auth, async (req, res) => {
  try {
    console.log('Profile update request received:', {
      userId: req.user.id,
      bodyKeys: Object.keys(req.body)
    });

    const { username, email, phone, avatar } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      console.log('User not found:', req.user.id);
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        console.log('Email already in use:', email);
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    // Update user fields
    const updates = {};
    if (username) updates.username = username;
    if (email) updates.email = email;
    if (phone) updates.phoneNumber = phone;
    if (avatar) {
      // If avatar is a base64 string, ensure it's not too large
      if (avatar.startsWith('data:image')) {
        const base64Data = avatar.split(',')[1];
        if (base64Data.length > 1000000) { // 1MB limit
          return res.status(400).json({ 
            message: 'Image size too large. Please use an image smaller than 1MB.' 
          });
        }
        updates.avatar = avatar;
      }
    }

    console.log('Updating user with fields:', Object.keys(updates));
    
    // Update user with new fields
    Object.assign(user, updates);
    await user.save();

    // Return updated user without password
    const updatedUser = user.toObject();
    delete updatedUser.password;
    
    console.log('Profile updated successfully for user:', req.user.id);
    res.json(updatedUser);
  } catch (error) {
    console.error('Profile update error:', {
      message: error.message,
      stack: error.stack
    });
    res.status(400).json({ message: error.message });
  }
});

// Change password
router.put('/change-password', auth, async (req, res) => {
  try {
    console.log('Password change request received for user:', req.user.id);
    
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      console.log('User not found for password change:', req.user.id);
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      console.log('Invalid current password for user:', req.user.id);
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();
    console.log('Password updated successfully for user:', req.user.id);
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password change error:', {
      message: error.message,
      stack: error.stack
    });
    res.status(400).json({ message: error.message });
  }
});

// Debug route to test registration
router.get('/test', (req, res) => {
  res.json({ message: 'Profile route is working' });
});

export default router; 
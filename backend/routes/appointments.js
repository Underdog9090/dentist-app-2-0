import express from 'express';
import { createAppointment, getAppointments, getAppointment, updateAppointment, deleteAppointment, addReply } from '../controllers/appointmentController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/', auth, createAppointment);

// Protected routes
router.get('/', auth, getAppointments);
router.get('/:id', auth, getAppointment);
router.put('/:id', auth, updateAppointment);
router.delete('/:id', auth, deleteAppointment);
router.post('/:id/reply', auth, addReply);

export default router; 
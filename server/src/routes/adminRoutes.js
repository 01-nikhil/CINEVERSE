import express from 'express';
import { store } from '../services/store.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Apply auth + admin guard to all admin routes
router.use(protect, adminOnly);

// @route GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const stats = await store.getAdminStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/admin/bookings
router.get('/bookings', async (req, res) => {
  try {
    const bookings = await store.getAllBookings();
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    res.json(store.users.map(u => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      phone: u.phone,
      avatar: u.avatar,
      createdAt: u.createdAt
    })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route POST /api/admin/verify-ticket
router.post('/verify-ticket', async (req, res) => {
  try {
    const { bookingRef } = req.body;
    if (!bookingRef) return res.status(400).json({ message: 'Provide booking reference' });

    const booking = await store.getBookingById(bookingRef.trim());
    if (!booking) {
      return res.status(404).json({ valid: false, message: 'Invalid Ticket! No booking found.' });
    }

    if (booking.paymentStatus === 'refunded') {
      return res.status(400).json({ valid: false, message: 'Ticket has been cancelled & refunded!' });
    }

    res.json({
      valid: true,
      message: 'Valid Entry Pass Verified!',
      booking
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

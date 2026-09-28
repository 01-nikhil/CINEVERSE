import express from 'express';
import { store } from '../services/store.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route POST /api/bookings
// Reserve seats and create a confirmed booking
router.post('/', protect, async (req, res) => {
  try {
    const {
      movieId,
      theaterId,
      showtimeId,
      seats,
      snacks,
      subtotal,
      convenienceFee,
      discountAmount,
      totalAmount,
      paymentMethod,
      movieDetails,
      theaterData,
      showDate,
      showTime
    } = req.body;

    if (!showtimeId || !seats || seats.length === 0) {
      return res.status(400).json({ message: 'Missing showtime or seats selection' });
    }

    const bookingRef = `CNV-${Math.floor(100000 + Math.random() * 900000)}`;
    const seatNames = seats.map(s => s.seatNumber);

    // Reserve seats in showtime (atomic validation)
    await store.reserveSeats(showtimeId, seatNames, null);

    const qrCodeData = `CINEVERSE|${bookingRef}|${movieDetails?.title || 'Movie'}|${seatNames.join(',')}|PAID`;

    const newBooking = await store.createBooking({
      bookingRef,
      userId: req.user._id,
      movieId,
      theaterId,
      showtimeId,
      seats,
      snacks: snacks || [],
      subtotal: subtotal || 0,
      convenienceFee: convenienceFee || 35,
      discountAmount: discountAmount || 0,
      totalAmount,
      paymentStatus: 'paid',
      paymentMethod: paymentMethod || 'ONLINE_PAYMENT',
      transactionId: `TXN_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      qrCodeData,
      movieDetails,
      theaterData,
      showDate,
      showTime
    });

    res.status(201).json(newBooking);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @route GET /api/bookings/my
// Get current user's bookings
router.get('/my', protect, async (req, res) => {
  try {
    const userBookings = await store.getBookingsByUser(req.user._id);
    res.json(userBookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/bookings/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await store.getBookingById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    
    // Check permission
    if (req.user.role !== 'admin' && String(booking.userId) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route POST /api/bookings/:id/cancel
router.post('/:id/cancel', protect, async (req, res) => {
  try {
    const cancelled = await store.cancelBooking(req.params.id, req.user._id, req.user.role);
    res.json({ message: 'Booking successfully cancelled & refund processed', booking: cancelled });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;

import express from 'express';
import { store } from '../services/store.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// @route GET /api/showtimes
router.get('/', async (req, res) => {
  try {
    const { movieId, date, theaterId } = req.query;
    const showtimes = await store.getShowtimes({ movieId, date, theaterId });
    res.json(showtimes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/showtimes/:id
router.get('/:id', async (req, res) => {
  try {
    const showtime = await store.getShowtimeById(req.params.id);
    if (!showtime) return res.status(404).json({ message: 'Showtime not found' });
    res.json(showtime);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route POST /api/showtimes (Admin only)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const newShowtime = await store.createShowtime(req.body);
    res.status(201).json(newShowtime);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;

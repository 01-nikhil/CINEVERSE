import express from 'express';
import { store } from '../services/store.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// @route GET /api/theaters
router.get('/', async (req, res) => {
  try {
    const theaters = await store.getTheaters();
    res.json(theaters);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/theaters/:id
router.get('/:id', async (req, res) => {
  try {
    const theater = await store.getTheaterById(req.params.id);
    if (!theater) return res.status(404).json({ message: 'Theater not found' });
    res.json(theater);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route POST /api/theaters (Admin only)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const newTheater = await store.createTheater(req.body);
    res.status(201).json(newTheater);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;

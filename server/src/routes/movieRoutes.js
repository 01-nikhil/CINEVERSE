import express from 'express';
import { store } from '../services/store.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// @route GET /api/movies
router.get('/', async (req, res) => {
  try {
    const { status, genre, search } = req.query;
    const movies = await store.getMovies({ status, genre, search });
    res.json(movies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/movies/:id
router.get('/:id', async (req, res) => {
  try {
    const movie = await store.getMovieById(req.params.id);
    if (!movie) return res.status(404).json({ message: 'Movie not found' });
    res.json(movie);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route POST /api/movies (Admin only)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const movie = await store.createMovie(req.body);
    res.status(201).json(movie);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @route PUT /api/movies/:id (Admin only)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const updated = await store.updateMovie(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Movie not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @route DELETE /api/movies/:id (Admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const deleted = await store.deleteMovie(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Movie not found' });
    res.json({ message: 'Movie removed successfully', movie: deleted });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

import express from 'express';
import { store } from '../services/store.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route GET /api/reviews/movie/:movieId
router.get('/movie/:movieId', async (req, res) => {
  try {
    const reviews = await store.getReviewsByMovie(req.params.movieId);
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route POST /api/reviews
router.post('/', protect, async (req, res) => {
  try {
    const { movieId, rating, title, comment } = req.body;
    if (!movieId || !rating || !comment) {
      return res.status(400).json({ message: 'Movie ID, rating and comment are required' });
    }

    const newReview = await store.addReview({
      movieId,
      userId: req.user._id,
      userName: req.user.name,
      userAvatar: req.user.avatar,
      rating: Number(rating),
      title: title || '',
      comment
    });

    res.status(201).json(newReview);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;

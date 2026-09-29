import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from '../server/src/config/db.js';

import authRoutes from '../server/src/routes/authRoutes.js';
import movieRoutes from '../server/src/routes/movieRoutes.js';
import theaterRoutes from '../server/src/routes/theaterRoutes.js';
import showtimeRoutes from '../server/src/routes/showtimeRoutes.js';
import bookingRoutes from '../server/src/routes/bookingRoutes.js';
import adminRoutes from '../server/src/routes/adminRoutes.js';
import reviewRoutes from '../server/src/routes/reviewRoutes.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());

// Connect DB middleware for serverless requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (err) {
    console.warn('DB connect warning:', err.message);
  }
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/theaters', theaterRoutes);
app.use('/api/showtimes', showtimeRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'CineVerse Serverless API on Vercel',
    timestamp: new Date().toISOString()
  });
});

export default app;

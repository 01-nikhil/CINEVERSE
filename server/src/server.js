import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import movieRoutes from './routes/movieRoutes.js';
import theaterRoutes from './routes/theaterRoutes.js';
import showtimeRoutes from './routes/showtimeRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000', '*'],
  credentials: true
}));
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/theaters', theaterRoutes);
app.use('/api/showtimes', showtimeRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'CineVerse Backend API',
    timestamp: new Date().toISOString()
  });
});

// Serve frontend client build statically if built
const clientDistPath = path.resolve(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

// Catch-all for SPA client routing on any non-API path
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ message: 'API Route Not Found' });
  }
  res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
    if (err) {
      // If dist is not yet built, provide a helpful bridge page
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>CineVerse API Server</title>
          <style>
            body { background: #07080b; color: #fff; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
            .card { background: #0e1117; padding: 40px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); max-width: 500px; box-shadow: 0 20px 50px rgba(0,0,0,0.8); }
            h1 { color: #e50914; margin-bottom: 12px; }
            p { color: #94a3b8; line-height: 1.6; margin-bottom: 24px; }
            a { background: #e50914; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; display: inline-block; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>🎬 CineVerse API Server</h1>
            <p>The backend API server is online and running on port ${PORT}.</p>
            <p>Access the live client & admin web application at:</p>
            <a href="http://localhost:5173">Open CineVerse Web App (Port 5173) &rarr;</a>
          </div>
        </body>
        </html>
      `);
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

// Connect DB & Start Server
connectDB().finally(() => {
  app.listen(PORT, () => {
    console.log(`🎬 CineVerse API Server running on port ${PORT}`);
    console.log(`📡 Ready at http://localhost:${PORT}/`);
  });
});

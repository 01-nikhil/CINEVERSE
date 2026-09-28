import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { connectDB } from './config/db.js';
import { Movie } from './models/Movie.js';
import { Theater } from './models/Theater.js';
import { Showtime } from './models/Showtime.js';
import { User } from './models/User.js';
import { Review } from './models/Review.js';
import { sampleMovies, sampleTheaters, generateShowtimes, sampleReviews } from './services/seedData.js';

dotenv.config();

const seed = async () => {
  try {
    await connectDB();
    console.log('Seeding database with pristine CineVerse data...');

    await Movie.deleteMany({});
    await Theater.deleteMany({});
    await Showtime.deleteMany({});
    await User.deleteMany({});
    await Review.deleteMany({});

    const createdMovies = await Movie.insertMany(sampleMovies);
    const createdTheaters = await Theater.insertMany(sampleTheaters);
    const showtimes = generateShowtimes();
    await Showtime.insertMany(showtimes);
    await Review.insertMany(sampleReviews);

    // Users
    const salt = await bcrypt.genSalt(10);
    const userPass = await bcrypt.hash('password123', salt);
    const adminPass = await bcrypt.hash('admin123', salt);

    await User.create([
      {
        name: 'Deepak User',
        email: 'user@cineverse.com',
        password: userPass,
        role: 'user',
        phone: '+1 555-0199',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
      },
      {
        name: 'Admin Master',
        email: 'admin@cineverse.com',
        password: adminPass,
        role: 'admin',
        phone: '+1 555-9999',
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80'
      }
    ]);

    console.log(`✅ Seeded ${createdMovies.length} movies, ${createdTheaters.length} theaters, ${showtimes.length} showtimes!`);
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();

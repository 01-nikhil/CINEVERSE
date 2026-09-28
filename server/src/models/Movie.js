import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    tagline: {
      type: String,
      default: '',
    },
    posterUrl: {
      type: String,
      required: true,
    },
    backdropUrl: {
      type: String,
      required: true,
    },
    trailerUrl: {
      type: String,
      default: '',
    },
    genre: {
      type: [String],
      required: true,
      default: ['Action', 'Sci-Fi'],
    },
    duration: {
      type: Number, // in minutes
      required: true,
    },
    releaseDate: {
      type: Date,
      required: true,
    },
    rating: {
      type: Number,
      default: 8.5,
      min: 0,
      max: 10,
    },
    votesCount: {
      type: Number,
      default: 1240,
    },
    certification: {
      type: String,
      default: 'PG-13',
      enum: ['G', 'PG', 'PG-13', 'R', 'NC-17', 'U', 'UA', 'A'],
    },
    language: {
      type: [String],
      default: ['English'],
    },
    formats: {
      type: [String],
      default: ['2D', '3D', 'IMAX 3D', 'Dolby Atmos'],
    },
    cast: [
      {
        name: String,
        role: String,
        image: String,
      },
    ],
    director: {
      type: String,
      default: 'Christopher Nolan',
    },
    status: {
      type: String,
      enum: ['now_showing', 'coming_soon', 'archived'],
      default: 'now_showing',
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Movie = mongoose.models.Movie || mongoose.model('Movie', movieSchema);

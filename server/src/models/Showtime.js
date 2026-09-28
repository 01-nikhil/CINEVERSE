import mongoose from 'mongoose';

const showtimeSchema = new mongoose.Schema(
  {
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: true,
    },
    theaterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theater',
      required: true,
    },
    screenNumber: {
      type: Number,
      default: 1,
    },
    screenType: {
      type: String,
      default: 'IMAX 3D',
    },
    date: {
      type: String, // YYYY-MM-DD format for fast querying
      required: true,
    },
    time: {
      type: String, // e.g. "14:30", "18:00", "21:15"
      required: true,
    },
    prices: {
      vip: { type: Number, default: 450 },
      premium: { type: Number, default: 320 },
      standard: { type: Number, default: 220 },
    },
    bookedSeats: [
      {
        seatNumber: String, // e.g. "A4", "D7"
        status: {
          type: String,
          enum: ['booked', 'locked'],
          default: 'booked',
        },
        bookingId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Booking',
        },
      },
    ],
  },
  { timestamps: true }
);

export const Showtime = mongoose.models.Showtime || mongoose.model('Showtime', showtimeSchema);

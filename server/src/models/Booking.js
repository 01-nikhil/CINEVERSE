import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    bookingRef: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
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
    showtimeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Showtime',
      required: true,
    },
    seats: [
      {
        seatNumber: String,
        tier: String, // 'VIP', 'Premium', 'Standard'
        price: Number,
      },
    ],
    snacks: [
      {
        name: String,
        quantity: Number,
        price: Number,
      },
    ],
    subtotal: {
      type: Number,
      required: true,
    },
    convenienceFee: {
      type: Number,
      default: 35,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'pending', 'cancelled', 'refunded'],
      default: 'paid',
    },
    paymentMethod: {
      type: String,
      default: 'CREDIT_CARD',
    },
    transactionId: {
      type: String,
      default: () => `TXN_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    },
    qrCodeData: {
      type: String,
    },
    movieDetails: {
      title: String,
      posterUrl: String,
      format: String,
      language: String,
    },
    theaterData: {
      name: String,
      city: String,
      address: String,
      screenType: String,
    },
    showDate: String,
    showTime: String,
  },
  { timestamps: true }
);

export const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);

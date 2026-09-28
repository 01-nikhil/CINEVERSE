import mongoose from 'mongoose';

const theaterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      default: 'Metro City',
    },
    address: {
      type: String,
      required: true,
    },
    amenities: {
      type: [String],
      default: ['IMAX Laser', 'Dolby Atmos 7.1', 'Recliner Seats', 'Gourmet Dining', 'Free Parking'],
    },
    screens: [
      {
        screenNumber: Number,
        name: String,
        screenType: {
          type: String,
          enum: ['IMAX 3D', 'Dolby Atmos', '4DX', 'RealD 3D', 'Standard Digital'],
          default: 'IMAX 3D',
        },
        rows: {
          type: Number,
          default: 8,
        },
        cols: {
          type: Number,
          default: 12,
        },
        seatLayoutConfig: {
          vipRows: { type: [String], default: ['A', 'B'] },
          premiumRows: { type: [String], default: ['C', 'D', 'E', 'F'] },
          standardRows: { type: [String], default: ['G', 'H'] },
        },
      },
    ],
  },
  { timestamps: true }
);

export const Theater = mongoose.models.Theater || mongoose.model('Theater', theaterSchema);

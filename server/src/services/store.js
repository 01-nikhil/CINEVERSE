import { sampleMovies, sampleTheaters, generateShowtimes, sampleReviews } from './seedData.js';
import { isDbConnected } from '../config/db.js';
import { Movie } from '../models/Movie.js';
import { Theater } from '../models/Theater.js';
import { Showtime } from '../models/Showtime.js';
import { Booking } from '../models/Booking.js';
import { User } from '../models/User.js';
import { Review } from '../models/Review.js';
import bcrypt from 'bcryptjs';

// In-Memory Data Store (Active fallback and fast-access synchronized layer)
class DataStore {
  constructor() {
    this.movies = JSON.parse(JSON.stringify(sampleMovies));
    this.theaters = JSON.parse(JSON.stringify(sampleTheaters));
    this.showtimes = generateShowtimes();
    this.reviews = JSON.parse(JSON.stringify(sampleReviews));
    this.bookings = [
      {
        _id: "664000000000000000000001",
        bookingRef: "CNV-982341",
        userId: "665000000000000000000001",
        movieId: "660000000000000000000001",
        theaterId: "661000000000000000000001",
        showtimeId: "662000000000000000000001",
        seats: [
          { seatNumber: "C5", tier: "Premium", price: 340 },
          { seatNumber: "C6", tier: "Premium", price: 340 }
        ],
        snacks: [
          { name: "Caramel Popcorn Jumbo", quantity: 1, price: 180 },
          { name: "Coca Cola Large", quantity: 2, price: 120 }
        ],
        subtotal: 980,
        convenienceFee: 45,
        discountAmount: 100,
        totalAmount: 925,
        paymentStatus: "paid",
        paymentMethod: "UPI_SCAN",
        transactionId: "TXN_9812938120",
        qrCodeData: "CINEVERSE|CNV-982341|Dune: Part Two|C5,C6|PAID",
        movieDetails: {
          title: "Dune: Part Two",
          posterUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80",
          format: "IMAX 3D",
          language: "English"
        },
        theaterData: {
          name: "CineVerse Grand IMAX Cinema",
          city: "New York",
          address: "Times Square, Broadway 42nd St, NY",
          screenType: "IMAX 3D"
        },
        showDate: new Date().toISOString().split('T')[0],
        showTime: "17:30",
        createdAt: new Date().toISOString()
      }
    ];

    this.users = [
      {
        _id: "665000000000000000000001",
        name: "Deepak User",
        email: "user@cineverse.com",
        passwordHash: bcrypt.hashSync("password123", 10),
        role: "user",
        phone: "+1 555-0199",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
        createdAt: new Date().toISOString()
      },
      {
        _id: "665000000000000000000002",
        name: "Admin Master",
        email: "admin@cineverse.com",
        passwordHash: bcrypt.hashSync("admin123", 10),
        role: "admin",
        phone: "+1 555-9999",
        avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
        createdAt: new Date().toISOString()
      }
    ];
  }

  // --- MOVIES ---
  async getMovies(filter = {}) {
    if (isDbConnected()) {
      try {
        const query = {};
        if (filter.status) query.status = filter.status;
        if (filter.genre) query.genre = { $in: [filter.genre] };
        if (filter.search) {
          query.$or = [
            { title: { $regex: filter.search, $options: 'i' } },
            { description: { $regex: filter.search, $options: 'i' } }
          ];
        }
        return await Movie.find(query).sort({ rating: -1, releaseDate: -1 });
      } catch (err) {
        console.warn("Falling back to in-memory movies", err.message);
      }
    }
    
    let result = [...this.movies];
    if (filter.status) {
      result = result.filter(m => m.status === filter.status);
    }
    if (filter.genre && filter.genre !== 'All') {
      result = result.filter(m => m.genre && m.genre.includes(filter.genre));
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(m => 
        m.title.toLowerCase().includes(q) || 
        m.description.toLowerCase().includes(q) ||
        (m.director && m.director.toLowerCase().includes(q))
      );
    }
    return result;
  }

  async getMovieById(id) {
    if (isDbConnected()) {
      try {
        const doc = await Movie.findById(id);
        if (doc) return doc;
      } catch (err) {}
    }
    return this.movies.find(m => String(m._id) === String(id)) || null;
  }

  async createMovie(data) {
    if (isDbConnected()) {
      try {
        const newMovie = await Movie.create(data);
        this.movies.unshift(newMovie.toObject());
        return newMovie;
      } catch (err) {}
    }
    const newMovie = {
      _id: `66000000000000000000000${this.movies.length + 1}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data
    };
    this.movies.unshift(newMovie);
    return newMovie;
  }

  async updateMovie(id, updateData) {
    if (isDbConnected()) {
      try {
        const updated = await Movie.findByIdAndUpdate(id, updateData, { new: true });
        if (updated) {
          const idx = this.movies.findIndex(m => String(m._id) === String(id));
          if (idx !== -1) this.movies[idx] = updated.toObject();
          return updated;
        }
      } catch (err) {}
    }
    const idx = this.movies.findIndex(m => String(m._id) === String(id));
    if (idx !== -1) {
      this.movies[idx] = { ...this.movies[idx], ...updateData, updatedAt: new Date().toISOString() };
      return this.movies[idx];
    }
    return null;
  }

  async deleteMovie(id) {
    if (isDbConnected()) {
      try {
        await Movie.findByIdAndDelete(id);
      } catch (err) {}
    }
    const idx = this.movies.findIndex(m => String(m._id) === String(id));
    if (idx !== -1) {
      const deleted = this.movies.splice(idx, 1);
      return deleted[0];
    }
    return null;
  }

  // --- THEATERS ---
  async getTheaters() {
    if (isDbConnected()) {
      try {
        return await Theater.find();
      } catch (err) {}
    }
    return this.theaters;
  }

  async getTheaterById(id) {
    if (isDbConnected()) {
      try {
        const doc = await Theater.findById(id);
        if (doc) return doc;
      } catch (err) {}
    }
    return this.theaters.find(t => String(t._id) === String(id)) || null;
  }

  async createTheater(data) {
    if (isDbConnected()) {
      try {
        const newTh = await Theater.create(data);
        this.theaters.push(newTh.toObject());
        return newTh;
      } catch (err) {}
    }
    const newTh = {
      _id: `66100000000000000000000${this.theaters.length + 1}`,
      createdAt: new Date().toISOString(),
      ...data
    };
    this.theaters.push(newTh);
    return newTh;
  }

  // --- SHOWTIMES ---
  async getShowtimes(filter = {}) {
    let list = [...this.showtimes];
    if (filter.movieId) {
      list = list.filter(s => String(s.movieId) === String(filter.movieId));
    }
    if (filter.date) {
      list = list.filter(s => s.date === filter.date);
    }
    if (filter.theaterId) {
      list = list.filter(s => String(s.theaterId) === String(filter.theaterId));
    }
    return list;
  }

  async getShowtimeById(id) {
    return this.showtimes.find(s => String(s._id) === String(id)) || null;
  }

  async createShowtime(data) {
    const newShowtime = {
      _id: `66200000000000000000000${this.showtimes.length + 1}`,
      bookedSeats: [],
      createdAt: new Date().toISOString(),
      ...data
    };
    this.showtimes.unshift(newShowtime);
    return newShowtime;
  }

  async reserveSeats(showtimeId, seatsToBook, bookingId) {
    const showtime = this.showtimes.find(s => String(s._id) === String(showtimeId));
    if (!showtime) throw new Error("Showtime not found");

    // Check if any seat is already booked
    const alreadyBooked = showtime.bookedSeats.some(bs => seatsToBook.includes(bs.seatNumber));
    if (alreadyBooked) {
      throw new Error("One or more selected seats have already been booked. Please choose other seats.");
    }

    seatsToBook.forEach(seatNum => {
      showtime.bookedSeats.push({
        seatNumber: seatNum,
        status: 'booked',
        bookingId: bookingId
      });
    });

    return showtime;
  }

  async releaseSeats(showtimeId, seatsToRelease) {
    const showtime = this.showtimes.find(s => String(s._id) === String(showtimeId));
    if (showtime) {
      showtime.bookedSeats = showtime.bookedSeats.filter(
        bs => !seatsToRelease.includes(bs.seatNumber)
      );
    }
  }

  // --- BOOKINGS ---
  async createBooking(bookingData) {
    const newBooking = {
      _id: `66400000000000000000000${this.bookings.length + 1}`,
      createdAt: new Date().toISOString(),
      ...bookingData
    };
    this.bookings.unshift(newBooking);
    return newBooking;
  }

  async getBookingsByUser(userId) {
    return this.bookings.filter(b => String(b.userId) === String(userId));
  }

  async getAllBookings() {
    return this.bookings;
  }

  async getBookingById(id) {
    return this.bookings.find(b => String(b._id) === String(id) || b.bookingRef === id) || null;
  }

  async cancelBooking(id, userId, role = 'user') {
    const booking = this.bookings.find(b => String(b._id) === String(id) || b.bookingRef === id);
    if (!booking) throw new Error("Booking not found");

    if (role !== 'admin' && String(booking.userId) !== String(userId)) {
      throw new Error("Unauthorized to cancel this booking");
    }

    booking.paymentStatus = 'refunded';
    
    // Release seats in showtime
    const seatNumbers = booking.seats.map(s => s.seatNumber);
    await this.releaseSeats(booking.showtimeId, seatNumbers);

    return booking;
  }

  // --- USERS ---
  async findUserByEmail(email) {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  async findUserById(id) {
    return this.users.find(u => String(u._id) === String(id)) || null;
  }

  async createUser(userData) {
    const newUser = {
      _id: `66500000000000000000000${this.users.length + 1}`,
      createdAt: new Date().toISOString(),
      ...userData
    };
    this.users.push(newUser);
    return newUser;
  }

  // --- REVIEWS ---
  async getReviewsByMovie(movieId) {
    return this.reviews.filter(r => String(r.movieId) === String(movieId));
  }

  async addReview(reviewData) {
    const newReview = {
      _id: `66300000000000000000000${this.reviews.length + 1}`,
      createdAt: new Date().toISOString(),
      likesCount: 0,
      ...reviewData
    };
    this.reviews.unshift(newReview);
    return newReview;
  }

  // --- ADMIN STATS ---
  async getAdminStats() {
    const totalBookings = this.bookings.length;
    const totalRevenue = this.bookings
      .filter(b => b.paymentStatus === 'paid')
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const activeMovies = this.movies.filter(m => m.status === 'now_showing').length;
    const totalUsers = this.users.length;

    // Daily Sales breakdown simulation
    const salesBreakdown = [
      { day: "Mon", revenue: 4200, tickets: 18 },
      { day: "Tue", revenue: 5800, tickets: 24 },
      { day: "Wed", revenue: 7100, tickets: 30 },
      { day: "Thu", revenue: 9400, tickets: 41 },
      { day: "Fri", revenue: 16800, tickets: 72 },
      { day: "Sat", revenue: 24500, tickets: 104 },
      { day: "Sun", revenue: 21900, tickets: 93 },
    ];

    const moviePerformance = this.movies.map(m => {
      const movieBookings = this.bookings.filter(b => String(b.movieId) === String(m._id));
      const revenue = movieBookings.reduce((sum, b) => sum + b.totalAmount, 0);
      const tickets = movieBookings.reduce((sum, b) => sum + b.seats.length, 0);
      return {
        id: m._id,
        title: m.title,
        rating: m.rating,
        posterUrl: m.posterUrl,
        bookingsCount: movieBookings.length,
        ticketsSold: tickets || Math.floor(m.rating * 14),
        revenue: revenue || Math.floor(m.rating * 3500)
      };
    });

    return {
      totalRevenue,
      totalBookings,
      activeMovies,
      totalUsers,
      occupancyRate: "78.4%",
      salesBreakdown,
      moviePerformance,
      recentBookings: this.bookings.slice(0, 10)
    };
  }
}

export const store = new DataStore();

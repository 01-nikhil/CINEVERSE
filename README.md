# 🎬 CineVerse — Modern Fullstack MERN Movie Ticket Booking Platform

**CineVerse** is a modern movie ticket booking web application built with the **MERN** stack (MongoDB, Express, React, Node.js) featuring a Client Portal and an Admin Management Suite.

---

## 🌟 Key Features

### 🍿 1. Client Experience & Booking Journey
- **Cinematic Dark Glassmorphism UI**: Dynamic hero backdrop carousels, neon glowing indicators, smooth micro-animations.
- **Discovery & Smart Filters**: Browse by *Now Showing*, *Coming Soon*, search by title/director/cast, and filter by genres (*Action*, *Sci-Fi*, *Drama*, etc.).
- **Movie Details & Trailer Player**: Full synopsis, cast & crew cards, duration, certification, embedded high-def YouTube trailer modal.
- **Audience Reviews & Ratings**: Live review feed and interactive rating submission.
- **7-Day Showtime Selector**: Dynamic date picker with format tags (*IMAX 3D*, *Dolby Atmos 128 Channels*, *4DX Motion*).
- **Interactive Cinema Seat Matrix**:
  - Realistic curved screen representation with spotlight glow
  - Tiered seating: **VIP Recliner** (Row A, B), **Premium Club** (Row C, D, E, F), and **Standard** (Row G, H)
  - Real-time seat locking with atomic collision prevention
- **Gourmet Food & Beverage Combos**: Add warm caramel popcorn, nachos, fountain drinks, and 3D glasses.
- **Checkout & Promo Discounts**: Apply promo codes (e.g. `CINEVERSE50` for 50% off), multiple payment options (Cards, UPI QR, CineVerse Wallet).
- **Digital Passes & Scannable QR Codes**: Instant confetti celebration with scannable QR ticket, booking reference ID, printable stub, and download option.
- **My Passes Wallet**: View all active and past tickets, or cancel with instant 100% refund simulation.

---

### 🛡️ 2. Admin Command & Management Suite (`/admin`)
- **Executive Analytics Dashboard**: Real-time Gross Revenue, Confirmed Tickets, Active Movies, Occupancy Rate, and weekly visual sales breakdown.
- **Box Office Performance**: Performance breakdown of gross revenue and tickets sold per blockbuster.
- **Movie Catalogue Manager**: Add new movies with full metadata (posters, backdrops, trailer URLs, durations, genres) and edit/delete existing movies.
- **Showtime Scheduler**: Assign screenings to multiplex screens and customize pricing per tier.
- **Live Ticket Scanner & Verification**: Enter or scan booking reference codes (`CNV-XXXXXX`) to authenticate passes at theater hall entry gates in real-time.
- **Bookings Ledger**: Search and audit all customer bookings with refund status tracking.

---

## ⚡ Quick Demo Accounts (1-Click Switchers)

The login modal contains 1-click demo buttons for instant access:
- **Admin Account**: `admin@cineverse.com` / `admin123`
- **User Account**: `user@cineverse.com` / `password123`
- **Promo Coupon**: Use `CINEVERSE50` at checkout for 50% discount.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18+ or v20+
- **npm**: v9+

### Running the Application

1. **Start both Backend & Frontend concurrently**:
   ```bash
   npm run dev
   ```
   - **Frontend Client**: [http://localhost:5173](http://localhost:5173)
   - **Backend API Server**: [http://localhost:5000](http://localhost:5000)

2. **Or run individually**:
   ```bash
   # In /server
   npm run dev

   # In /client
   npm run dev
   ```

---

## 📂 Project Architecture

```
cineverse/
├── package.json               # Root monorepo workspace runner
├── server/                    # Node.js & Express REST Backend
│   ├── src/
│   │   ├── config/db.js       # MongoDB & resilient fallback store engine
│   │   ├── models/            # Mongoose Schemas (User, Movie, Theater, Showtime, Booking, Review)
│   │   ├── routes/            # REST API endpoints (Auth, Movies, Theaters, Showtimes, Bookings, Admin, Reviews)
│   │   ├── middleware/        # JWT Authentication & Admin protection
│   │   ├── services/          # Unified store service & realistic seed datasets
│   │   ├── seed.js            # Standalone database seeder
│   │   └── server.js          # Express app entry point
│   └── package.json
└── client/                    # Vite + React Frontend
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx           # Brand header, navigation & user wallet trigger
    │   │   ├── HeroBanner.jsx       # Featured movie carousel & trailer player
    │   │   ├── MovieCard.jsx        # Glassmorphic movie card with hover zooms
    │   │   ├── MovieGrid.jsx        # Tabbed filter (Now Showing / Coming Soon / Genres / Search)
    │   │   ├── MovieDetailsModal.jsx# Full specs, trailer, cast & audience reviews
    │   │   ├── BookingModal.jsx     # 5-step booking flow (Date -> Seats -> Snacks -> Pay -> QR Pass)
    │   │   ├── MyBookingsModal.jsx  # Digital ticket wallet & refund processor
    │   │   ├── AdminPortal.jsx      # Full Admin suite (Analytics, Movie CRUD, Scheduler, Ticket Scanner)
    │   │   ├── AuthModal.jsx        # Login/Register with 1-click demo switcher
    │   │   └── TrailerModal.jsx     # YouTube cinema player
    │   ├── context/AuthContext.jsx  # Authentication state & session manager
    │   ├── services/api.js          # REST API client with JWT Bearer tokens
    │   ├── App.jsx                  # Master root component
    │   └── index.css                # Cinematic CSS design system
    └── package.json
```

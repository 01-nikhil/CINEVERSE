# 🎬 CineVerse - Fullstack Movie Ticket Booking Platform

CineVerse is a modern fullstack MERN movie ticket booking web application built with React (Vite), Express.js, MongoDB / Resilient In-Memory store, and Tailwind/Vanilla CSS styling.

---

## 🚀 One-Click Deploy to Vercel

1. Import this repository into [Vercel](https://vercel.com/new).
2. **Framework Preset**: Select **Vite** or **Other**.
3. **Root Directory**: `./` (leave default).
4. **Build Command**: `npm run build --prefix client` (configured automatically via `vercel.json`).
5. **Output Directory**: `client/dist` (configured automatically via `vercel.json`).
6. **Environment Variables** (in Vercel Project Settings > Environment Variables):
   - `MONGODB_URI`: Your MongoDB connection string (e.g., MongoDB Atlas URI `mongodb+srv://...`) *(Optional: fallback in-memory store activates if omitted)*
   - `JWT_SECRET`: A secure random secret string for JWT authentication tokens.

---

## 🛠 Project Structure

```
cineverse/
├── api/
│   └── index.js         # Vercel Serverless Function entrypoint for Express API
├── client/              # React (Vite) Frontend
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── server/              # Express Backend & Mongoose models
│   ├── src/
│   └── package.json
├── package.json         # Monorepo root scripts & dependencies
├── vercel.json          # Vercel deployment routing & build config
└── README.md
```

---

## 💻 Local Development

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Start Both Client & Server
```bash
npm run dev
```
- **Client**: [http://localhost:5173](http://localhost:5173)
- **API**: [http://localhost:5000](http://localhost:5000)

### 3. Seed Database (Optional)
```bash
npm run seed
```
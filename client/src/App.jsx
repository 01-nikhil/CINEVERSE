import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { MovieGrid } from './components/MovieGrid';
import { MovieDetailsModal } from './components/MovieDetailsModal';
import { BookingModal } from './components/BookingModal';
import { MyBookingsModal } from './components/MyBookingsModal';
import { AuthModal } from './components/AuthModal';
import { TrailerModal } from './components/TrailerModal';
import { AdminPortal } from './components/AdminPortal';
import { api } from './services/api';
import { Film, Shield, Sparkles, Heart, Ticket } from 'lucide-react';

function CineVerseMain() {
  const [activeView, setActiveView] = useState('client'); // 'client' | 'admin'
  const [movies, setMovies] = useState([]);
  const [loadingMovies, setLoadingMovies] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [bookingMovie, setBookingMovie] = useState(null);
  const [trailerMovie, setTrailerMovie] = useState(null);
  const [myBookingsOpen, setMyBookingsOpen] = useState(false);

  const fetchMovies = async () => {
    setLoadingMovies(true);
    try {
      const data = await api.getMovies();
      setMovies(data);
    } catch (err) {
      console.error('Failed to load movies:', err);
    } finally {
      setLoadingMovies(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleSearchFocus = () => {
    setActiveView('client');
    const elem = document.getElementById('movies-section');
    if (elem) elem.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Dynamic Navbar */}
      <Navbar
        onOpenMyBookings={() => setMyBookingsOpen(true)}
        activeView={activeView}
        setActiveView={setActiveView}
        onSearchClick={handleSearchFocus}
      />

      {/* Main View Router */}
      <main style={{ flex: 1 }}>
        {activeView === 'client' ? (
          <div>
            {/* Hero Carousel */}
            <div className="app-container" style={{ paddingTop: '24px' }}>
              <HeroBanner
                movies={movies}
                onSelectMovie={(m) => setSelectedMovie(m)}
                onOpenTrailer={(m) => setTrailerMovie(m)}
                onBookNow={(m) => setBookingMovie(m)}
              />

              {/* Movie Grid with Filter Tabs & Search */}
              <MovieGrid
                movies={movies}
                loading={loadingMovies}
                onSelectMovie={(m) => setSelectedMovie(m)}
                onBookMovie={(m) => setBookingMovie(m)}
                onOpenTrailer={(m) => setTrailerMovie(m)}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
            </div>
          </div>
        ) : (
          <AdminPortal onBackToClient={() => setActiveView('client')} />
        )}
      </main>

      {/* Footer */}
      <footer style={{
        background: 'rgba(10, 12, 17, 0.95)',
        borderTop: '1px solid var(--border-subtle)',
        padding: '48px 24px 32px',
        marginTop: '60px',
      }}>
        <div className="app-container" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '32px',
          marginBottom: '36px',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Film size={18} color="#fff" />
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.02em', color: '#fff' }}>
                CINEVERSE
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              The next-generation cinematic platform. Immersive audio-visual booking with real-time seat matrices, gourmet concessions, and paperless digital passes.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff', marginBottom: '14px' }}>
              EXPERIENCES
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <li>IMAX Laser 4K & 70mm</li>
              <li>Dolby Atmos 128 Channels</li>
              <li>4DX Environmental Dome</li>
              <li>VIP Director's Club Lounges</li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff', marginBottom: '14px' }}>
              PLATFORM PORTALS
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
              <button
                onClick={() => setActiveView('client')}
                style={{ background: 'none', border: 'none', color: '#00f0ff', textAlign: 'left', cursor: 'pointer', fontWeight: 600 }}
              >
                🎬 Client Movie Booking Portal
              </button>
              <button
                onClick={() => setActiveView('admin')}
                style={{ background: 'none', border: 'none', color: '#ff4d58', textAlign: 'left', cursor: 'pointer', fontWeight: 600 }}
              >
                🛡️ Admin Management & Scanner Hub
              </button>
            </div>
          </div>
        </div>

        <div className="app-container" style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '0.78rem',
          color: 'var(--text-muted)'
        }}>
          <div>© 2026 CineVerse Entertainment Ltd. Fullstack MERN Architecture.</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            Built with <Heart size={13} color="#e50914" fill="#e50914" /> for modern cinema enthusiasts
          </div>
        </div>
      </footer>

      {/* Modals */}
      {selectedMovie && (
        <MovieDetailsModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
          onBook={(m) => {
            setSelectedMovie(null);
            setBookingMovie(m);
          }}
          onOpenTrailer={(m) => setTrailerMovie(m)}
        />
      )}

      {bookingMovie && (
        <BookingModal
          movie={bookingMovie}
          onClose={() => setBookingMovie(null)}
          onBookingComplete={() => {
            fetchMovies();
          }}
        />
      )}

      {trailerMovie && (
        <TrailerModal
          movie={trailerMovie}
          onClose={() => setTrailerMovie(null)}
        />
      )}

      {myBookingsOpen && (
        <MyBookingsModal
          onClose={() => setMyBookingsOpen(false)}
        />
      )}

      <AuthModal />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CineVerseMain />
    </AuthProvider>
  );
}

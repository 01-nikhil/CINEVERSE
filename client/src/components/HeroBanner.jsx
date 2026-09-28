import React, { useState, useEffect } from 'react';
import { Play, Ticket, Star, Clock, Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';

export const HeroBanner = ({ movies = [], onSelectMovie, onOpenTrailer, onBookNow }) => {
  const featuredMovies = movies.length > 0 
    ? movies.filter(m => m.featured || m.status === 'now_showing').slice(0, 4) 
    : [];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (featuredMovies.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredMovies.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [featuredMovies.length]);

  if (featuredMovies.length === 0) return null;

  const currentMovie = featuredMovies[currentIndex];

  return (
    <div style={{
      position: 'relative',
      height: '580px',
      width: '100%',
      overflow: 'hidden',
      marginBottom: '48px',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border-subtle)',
      boxShadow: 'var(--shadow-lg)'
    }}>
      {/* Background Image with Layered Gradients */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `url(${currentMovie.backdropUrl || currentMovie.posterUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center 20%',
        transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: 'scale(1.03)',
      }} />

      {/* Cinematic Vignette & Color Overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `
          linear-gradient(90deg, #07080b 0%, rgba(7, 8, 11, 0.85) 45%, rgba(7, 8, 11, 0.2) 100%),
          linear-gradient(0deg, #07080b 0%, rgba(7, 8, 11, 0.5) 40%, transparent 100%)
        `,
      }} />

      {/* Content Container */}
      <div className="app-container" style={{
        position: 'relative',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '0 48px',
        maxWidth: '1200px'
      }}>
        <div style={{ maxWidth: '640px' }}>
          {/* Top Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <span className="badge badge-red" style={{ gap: '6px' }}>
              <Sparkles size={12} />
              PREMIERING NOW
            </span>
            <span className="badge badge-gold" style={{ gap: '4px' }}>
              <Star size={12} fill="#ffb703" />
              {currentMovie.rating}/10 ({currentMovie.votesCount ? (currentMovie.votesCount / 1000).toFixed(1) + 'k' : '2k'} votes)
            </span>
            <span className="badge badge-cyan">
              {currentMovie.certification || 'PG-13'}
            </span>
            <span className="badge badge-muted" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={12} />
              {Math.floor(currentMovie.duration / 60)}h {currentMovie.duration % 60}m
            </span>
          </div>

          {/* Movie Title */}
          <h1 style={{
            fontSize: '3.4rem',
            fontWeight: 900,
            lineHeight: 1.08,
            marginBottom: '12px',
            textShadow: '0 4px 20px rgba(0,0,0,0.8)',
            letterSpacing: '-0.03em'
          }}>
            {currentMovie.title}
          </h1>

          {/* Tagline */}
          {currentMovie.tagline && (
            <p style={{
              fontSize: '1.15rem',
              fontStyle: 'italic',
              color: '#00f0ff',
              marginBottom: '14px',
              fontWeight: 500,
              textShadow: '0 0 10px rgba(0, 240, 255, 0.3)'
            }}>
              "{currentMovie.tagline}"
            </p>
          )}

          {/* Synopsis */}
          <p style={{
            fontSize: '0.98rem',
            lineHeight: 1.6,
            color: '#cbd5e1',
            marginBottom: '24px',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {currentMovie.description}
          </p>

          {/* Formats Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>AVAILABLE IN:</span>
            {(currentMovie.formats || ['IMAX 3D', 'Dolby Atmos', '4DX']).map((fmt, i) => (
              <span
                key={i}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#fff',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: '4px',
                  letterSpacing: '0.04em'
                }}
              >
                {fmt}
              </span>
            ))}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => onBookNow(currentMovie)}
              className="btn btn-primary btn-lg"
              style={{
                gap: '10px',
                boxShadow: '0 0 25px rgba(229, 9, 20, 0.6)'
              }}
            >
              <Ticket size={20} />
              <span>Book Tickets</span>
            </button>

            {currentMovie.trailerUrl && (
              <button
                onClick={() => onOpenTrailer(currentMovie)}
                className="btn btn-secondary btn-lg"
                style={{
                  gap: '10px',
                  backdropFilter: 'blur(10px)',
                  background: 'rgba(255, 255, 255, 0.12)'
                }}
              >
                <Play size={18} fill="currentColor" />
                <span>Watch Trailer</span>
              </button>
            )}

            <button
              onClick={() => onSelectMovie(currentMovie)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                marginLeft: '8px'
              }}
            >
              <span>Details</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Slide Navigation Dots & Arrows */}
      {featuredMovies.length > 1 && (
        <div style={{
          position: 'absolute',
          bottom: '24px',
          right: '48px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          zIndex: 10
        }}>
          <button
            onClick={() => setCurrentIndex((prev) => (prev - 1 + featuredMovies.length) % featuredMovies.length)}
            style={{
              background: 'rgba(15, 19, 28, 0.75)',
              border: '1px solid var(--border-subtle)',
              color: '#fff',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <ChevronLeft size={18} />
          </button>

          {featuredMovies.map((_, idx) => (
            <div
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              style={{
                width: currentIndex === idx ? '28px' : '8px',
                height: '8px',
                borderRadius: '4px',
                background: currentIndex === idx ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.25)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: currentIndex === idx ? '0 0 10px var(--accent-primary)' : 'none'
              }}
            />
          ))}

          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % featuredMovies.length)}
            style={{
              background: 'rgba(15, 19, 28, 0.75)',
              border: '1px solid var(--border-subtle)',
              color: '#fff',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

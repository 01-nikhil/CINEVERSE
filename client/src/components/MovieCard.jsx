import React from 'react';
import { Star, Clock, Ticket, Play, Sparkles } from 'lucide-react';

export const MovieCard = ({ movie, onSelect, onBook, onOpenTrailer }) => {
  const isNowShowing = movie.status === 'now_showing';

  return (
    <div
      style={{
        position: 'relative',
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        cursor: 'pointer',
      }}
      className="movie-card"
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-8px) scale(1.015)';
        e.currentTarget.style.borderColor = 'rgba(229, 9, 20, 0.4)';
        e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(229, 9, 20, 0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.borderColor = 'var(--border-subtle)';
        e.currentTarget.style.boxShadow = 'none';
      }}
      onClick={() => onSelect(movie)}
    >
      {/* Poster Image Container */}
      <div style={{
        position: 'relative',
        width: '100%',
        paddingTop: '142%', // 1:1.42 cinema aspect ratio
        overflow: 'hidden',
        background: '#0c0f16',
      }}>
        <img
          src={movie.posterUrl}
          alt={movie.title}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s ease',
          }}
          loading="lazy"
        />

        {/* Top Badges Overlay */}
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          right: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 2,
        }}>
          <span className="badge badge-gold" style={{ backdropFilter: 'blur(8px)', background: 'rgba(21, 25, 34, 0.85)' }}>
            <Star size={11} fill="#ffb703" />
            {movie.rating}
          </span>

          <span
            className={`badge ${isNowShowing ? 'badge-red' : 'badge-cyan'}`}
            style={{ backdropFilter: 'blur(8px)', background: 'rgba(21, 25, 34, 0.85)' }}
          >
            {isNowShowing ? 'NOW SHOWING' : 'COMING SOON'}
          </span>
        </div>

        {/* Bottom Format Pills Overlay */}
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          right: '10px',
          display: 'flex',
          gap: '6px',
          flexWrap: 'wrap',
          zIndex: 2,
        }}>
          {(movie.formats || ['2D', 'IMAX 3D']).slice(0, 2).map((fmt, i) => (
            <span
              key={i}
              style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                color: '#fff',
                background: 'rgba(0, 0, 0, 0.75)',
                backdropFilter: 'blur(6px)',
                padding: '2px 6px',
                borderRadius: '4px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
              }}
            >
              {fmt}
            </span>
          ))}
        </div>

        {/* Hover Trailer Play Button */}
        {movie.trailerUrl && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenTrailer(movie);
            }}
            title="Watch Trailer"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: 'rgba(229, 9, 20, 0.9)',
              border: '2px solid rgba(255, 255, 255, 0.6)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 3,
              boxShadow: '0 0 25px rgba(229, 9, 20, 0.8)',
              transition: 'all 0.25s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.15)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)')}
          >
            <Play size={22} fill="#fff" style={{ marginLeft: '2px' }} />
          </button>
        )}

        {/* Bottom subtle shadow vignette */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, transparent 60%, rgba(7, 8, 11, 0.95) 100%)',
        }} />
      </div>

      {/* Card Info Details */}
      <div style={{
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        justifyContent: 'space-between',
      }}>
        <div>
          {/* Genre list */}
          <div style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            marginBottom: '6px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {Array.isArray(movie.genre) ? movie.genre.join(' • ') : movie.genre}
          </div>

          {/* Title */}
          <h3 style={{
            fontSize: '1.15rem',
            fontWeight: 700,
            marginBottom: '8px',
            lineHeight: 1.25,
            color: '#fff',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {movie.title}
          </h3>

          {/* Duration & Language */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            marginBottom: '16px',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={13} />
              {Math.floor(movie.duration / 60)}h {movie.duration % 60}m
            </span>
            <span>•</span>
            <span>{Array.isArray(movie.language) ? movie.language[0] : movie.language || 'English'}</span>
          </div>
        </div>

        {/* Action Button */}
        {isNowShowing ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBook(movie);
            }}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '10px 0',
              fontSize: '0.9rem',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <Ticket size={16} />
            <span>Book Tickets</span>
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(movie);
            }}
            className="btn btn-secondary"
            style={{
              width: '100%',
              padding: '10px 0',
              fontSize: '0.9rem',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <span>View Release Info</span>
          </button>
        )}
      </div>
    </div>
  );
};

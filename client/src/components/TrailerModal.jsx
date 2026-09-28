import React from 'react';
import { X } from 'lucide-react';

export const TrailerModal = ({ movie, onClose }) => {
  if (!movie || !movie.trailerUrl) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{
          maxWidth: '880px',
          padding: 0,
          background: '#000',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          boxShadow: '0 0 50px rgba(229, 9, 20, 0.4)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          position: 'relative',
          paddingTop: '56.25%', // 16:9 Aspect Ratio
          width: '100%',
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '14px',
              right: '14px',
              zIndex: 10,
              background: 'rgba(0, 0, 0, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#fff',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
            }}
          >
            <X size={18} />
          </button>

          <iframe
            src={`${movie.trailerUrl}?autoplay=1&rel=0`}
            title={`${movie.title} Trailer`}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              border: 'none',
            }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
};

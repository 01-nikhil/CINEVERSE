import React, { useState } from 'react';
import { MovieCard } from './MovieCard';
import { Search, Sparkles, Filter, Film } from 'lucide-react';

const GENRES = ['All', 'Action', 'Sci-Fi', 'Adventure', 'Drama', 'Biography', 'Comedy', 'Thriller'];

export const MovieGrid = ({
  movies = [],
  loading,
  onSelectMovie,
  onBookMovie,
  onOpenTrailer,
  searchQuery,
  setSearchQuery,
}) => {
  const [activeTab, setActiveTab] = useState('now_showing'); // 'now_showing' | 'coming_soon' | 'all'
  const [selectedGenre, setSelectedGenre] = useState('All');

  // Filter movies
  const filteredMovies = movies.filter((movie) => {
    // Status tab filter
    if (activeTab !== 'all' && movie.status !== activeTab) {
      return false;
    }

    // Genre filter
    if (selectedGenre !== 'All') {
      if (!movie.genre || !movie.genre.includes(selectedGenre)) {
        return false;
      }
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = movie.title.toLowerCase().includes(q);
      const matchDesc = movie.description?.toLowerCase().includes(q);
      const matchDirector = movie.director?.toLowerCase().includes(q);
      const matchCast = movie.cast?.some((c) => c.name.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchDirector && !matchCast) {
        return false;
      }
    }

    return true;
  });

  return (
    <section style={{ marginBottom: '64px' }} id="movies-section">
      {/* Controls Bar */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        marginBottom: '32px',
      }}>
        {/* Top Row: Tabs & Search */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          {/* Status Tabs */}
          <div style={{
            display: 'flex',
            background: 'var(--bg-card)',
            padding: '4px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-subtle)',
          }}>
            <button
              onClick={() => setActiveTab('now_showing')}
              style={{
                padding: '8px 20px',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                background: activeTab === 'now_showing' ? 'var(--accent-primary)' : 'transparent',
                color: activeTab === 'now_showing' ? '#fff' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: activeTab === 'now_showing' ? '0 2px 10px var(--accent-primary-glow)' : 'none'
              }}
            >
              Now Showing ({movies.filter(m => m.status === 'now_showing').length})
            </button>
            <button
              onClick={() => setActiveTab('coming_soon')}
              style={{
                padding: '8px 20px',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                background: activeTab === 'coming_soon' ? 'var(--accent-primary)' : 'transparent',
                color: activeTab === 'coming_soon' ? '#fff' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: activeTab === 'coming_soon' ? '0 2px 10px var(--accent-primary-glow)' : 'none'
              }}
            >
              Coming Soon ({movies.filter(m => m.status === 'coming_soon').length})
            </button>
            <button
              onClick={() => setActiveTab('all')}
              style={{
                padding: '8px 20px',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                background: activeTab === 'all' ? 'var(--accent-primary)' : 'transparent',
                color: activeTab === 'all' ? '#fff' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              All Movies
            </button>
          </div>

          {/* Search Box */}
          <div style={{
            position: 'relative',
            minWidth: '280px',
            maxWidth: '380px',
            flex: 1,
          }}>
            <Search
              size={18}
              color="var(--text-muted)"
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none'
              }}
            />
            <input
              type="text"
              placeholder="Search by title, director, cast..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={{
                paddingLeft: '42px',
                borderRadius: 'var(--radius-full)',
                height: '42px',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Genre Filter Chips */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '6px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--text-muted)',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginRight: '8px'
          }}>
            <Filter size={15} />
            <span>Genre:</span>
          </div>

          {GENRES.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                border: selectedGenre === genre ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                background: selectedGenre === genre ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                color: selectedGenre === genre ? '#00f0ff' : 'var(--text-secondary)',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Movies Grid or Empty State */}
      {loading ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '24px',
        }}>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="skeleton"
              style={{ height: '420px', borderRadius: 'var(--radius-md)' }}
            />
          ))}
        </div>
      ) : filteredMovies.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '28px',
        }}>
          {filteredMovies.map((movie) => (
            <MovieCard
              key={movie._id}
              movie={movie}
              onSelect={onSelectMovie}
              onBook={onBookMovie}
              onOpenTrailer={onOpenTrailer}
            />
          ))}
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '64px 20px',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
        }}>
          <Film size={48} color="var(--text-muted)" style={{ marginBottom: '16px', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>No movies found</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 20px' }}>
            We couldn't find any movies matching your current search or genre filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedGenre('All');
              setActiveTab('all');
            }}
            className="btn btn-secondary btn-sm"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </section>
  );
};

import React, { useState, useEffect } from 'react';
import { X, Star, Clock, Calendar, Ticket, Play, MessageSquare, ThumbsUp, Send, User } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const MovieDetailsModal = ({ movie, onClose, onBook, onOpenTrailer }) => {
  const { user, openLogin } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 10, title: '', comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!movie) return;
    const fetchReviews = async () => {
      setLoadingReviews(true);
      try {
        const data = await api.getReviews(movie._id);
        setReviews(data);
      } catch (err) {
        console.error('Failed to fetch reviews', err);
      } finally {
        setLoadingReviews(false);
      }
    };
    fetchReviews();
  }, [movie]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      openLogin();
      return;
    }
    if (!reviewForm.comment.trim()) return;

    setSubmittingReview(true);
    try {
      const newRev = await api.addReview({
        movieId: movie._id,
        rating: Number(reviewForm.rating),
        title: reviewForm.title,
        comment: reviewForm.comment,
      });
      setReviews([newRev, ...reviews]);
      setReviewForm({ rating: 10, title: '', comment: '' });
    } catch (err) {
      alert(err.message || 'Failed to post review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (!movie) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{
          maxWidth: '860px',
          padding: 0,
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            zIndex: 10,
            background: 'rgba(0, 0, 0, 0.65)',
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
          <X size={20} />
        </button>

        {/* Hero Backdrop Banner */}
        <div style={{
          position: 'relative',
          height: '320px',
          width: '100%',
          backgroundImage: `url(${movie.backdropUrl || movie.posterUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 30%',
        }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(0deg, var(--bg-surface) 0%, rgba(14, 17, 23, 0.5) 60%, transparent 100%)',
          }} />

          {/* Quick Play Trailer Button */}
          {movie.trailerUrl && (
            <button
              onClick={() => onOpenTrailer(movie)}
              className="btn btn-secondary btn-sm"
              style={{
                position: 'absolute',
                bottom: '20px',
                right: '24px',
                backdropFilter: 'blur(10px)',
                background: 'rgba(0,0,0,0.7)',
                gap: '8px'
              }}
            >
              <Play size={16} fill="#fff" />
              <span>Watch Trailer</span>
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div style={{ padding: '0 32px 32px', marginTop: '-80px', position: 'relative', zIndex: 2 }}>
          {/* Main Info Header */}
          <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-end', marginBottom: '24px' }}>
            <img
              src={movie.posterUrl}
              alt={movie.title}
              style={{
                width: '140px',
                height: '200px',
                borderRadius: 'var(--radius-sm)',
                objectFit: 'cover',
                boxShadow: 'var(--shadow-lg)',
                border: '2px solid rgba(255, 255, 255, 0.15)',
                flexShrink: 0,
              }}
            />

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                <span className="badge badge-gold">
                  <Star size={12} fill="#ffb703" /> {movie.rating}/10
                </span>
                <span className="badge badge-cyan">{movie.certification || 'PG-13'}</span>
                <span className="badge badge-red">{movie.status === 'now_showing' ? 'Now Showing' : 'Coming Soon'}</span>
              </div>

              <h2 style={{ fontSize: '2.1rem', fontWeight: 800, marginBottom: '6px', lineHeight: 1.15 }}>
                {movie.title}
              </h2>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={14} /> {Math.floor(movie.duration / 60)}h {movie.duration % 60}m
                </span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={14} /> {new Date(movie.releaseDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
                <span>•</span>
                <span>{Array.isArray(movie.language) ? movie.language.join(', ') : movie.language}</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          {movie.status === 'now_showing' && (
            <div style={{ marginBottom: '28px' }}>
              <button
                onClick={() => {
                  onClose();
                  onBook(movie);
                }}
                className="btn btn-primary btn-lg"
                style={{ width: '100%', gap: '10px' }}
              >
                <Ticket size={20} />
                <span>Select Showtime & Book Seats</span>
              </button>
            </div>
          )}

          {/* Genres & Formats */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            padding: '16px',
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '24px',
            border: '1px solid var(--border-subtle)'
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>GENRES</span>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {(movie.genre || []).map((g, i) => (
                  <span key={i} className="badge badge-purple">{g}</span>
                ))}
              </div>
            </div>

            <div style={{ marginLeft: 'auto' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>EXPERIENCE IN</span>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {(movie.formats || ['IMAX 3D', 'Dolby Atmos']).map((f, i) => (
                  <span key={i} className="badge badge-emerald">{f}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Synopsis */}
          <div style={{ marginBottom: '28px' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '8px' }}>Synopsis</h3>
            <p style={{ lineHeight: 1.7, color: '#cbd5e1' }}>{movie.description}</p>
          </div>

          {/* Director & Cast */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '14px' }}>Cast & Crew</h3>
            <div style={{ fontSize: '0.9rem', marginBottom: '16px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Directed by: </span>
              <span style={{ color: '#fff', fontWeight: 600 }}>{movie.director || 'Visionary Director'}</span>
            </div>

            {movie.cast && movie.cast.length > 0 && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                gap: '14px',
              }}>
                {movie.cast.map((actor, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'var(--bg-card)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '10px',
                      textAlign: 'center',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <img
                      src={actor.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt={actor.name}
                      style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        margin: '0 auto 8px',
                      }}
                    />
                    <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#fff', lineHeight: 1.2 }}>
                      {actor.name}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {actor.role}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reviews & Ratings Section */}
          <div style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '28px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquare size={18} color="var(--accent-primary)" />
                Audience Reviews ({reviews.length})
              </h3>
            </div>

            {/* Post a Review Box */}
            <form
              onSubmit={handleReviewSubmit}
              style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-md)',
                padding: '18px',
                marginBottom: '24px',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Your Rating:
                </span>
                <select
                  value={reviewForm.rating}
                  onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })}
                  className="input-field"
                  style={{ width: '130px', padding: '6px 12px' }}
                >
                  <option value="10">⭐ 10/10 Masterpiece</option>
                  <option value="9">⭐ 9/10 Incredible</option>
                  <option value="8">⭐ 8/10 Great</option>
                  <option value="7">⭐ 7/10 Good</option>
                  <option value="6">⭐ 6/10 Decent</option>
                  <option value="5">⭐ 5/10 Average</option>
                </select>
              </div>

              <input
                type="text"
                placeholder="Review Headline (Optional, e.g. 'Stunning visual masterpiece!')"
                value={reviewForm.title}
                onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                className="input-field"
                style={{ marginBottom: '10px' }}
              />

              <textarea
                placeholder="Write your genuine thoughts on the movie and theater experience..."
                rows={3}
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                className="input-field"
                style={{ resize: 'vertical', marginBottom: '12px' }}
                required
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="btn btn-primary btn-sm"
                  style={{ gap: '6px' }}
                >
                  <Send size={14} />
                  <span>{submittingReview ? 'Posting...' : 'Post Review'}</span>
                </button>
              </div>
            </form>

            {/* Reviews List */}
            {loadingReviews ? (
              <p style={{ color: 'var(--text-muted)' }}>Loading reviews...</p>
            ) : reviews.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {reviews.map((rev) => (
                  <div
                    key={rev._id}
                    style={{
                      background: 'var(--bg-card)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '16px',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img
                          src={rev.userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                          alt={rev.userName}
                          style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{rev.userName}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {new Date(rev.createdAt || Date.now()).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <span className="badge badge-gold">⭐ {rev.rating}/10</span>
                    </div>

                    {rev.title && (
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '4px', color: '#fff' }}>
                        {rev.title}
                      </h4>
                    )}
                    <p style={{ fontSize: '0.88rem', color: '#cbd5e1' }}>{rev.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                No reviews yet. Be the first to share your experience!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

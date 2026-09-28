import React, { useState, useEffect } from 'react';
import { X, Ticket, Calendar, Clock, MapPin, QrCode, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import QRCode from 'qrcode';

export const MyBookingsModal = ({ onClose }) => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qrMap, setQrMap] = useState({});
  const [cancellingId, setCancellingId] = useState(null);
  const [message, setMessage] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await api.getMyBookings();
      setBookings(data);

      // Generate QR codes for each active booking
      const qrs = {};
      for (const b of data) {
        if (b.qrCodeData) {
          qrs[b._id] = await QRCode.toDataURL(b.qrCodeData, { width: 140, margin: 1 });
        }
      }
      setQrMap(qrs);
    } catch (err) {
      console.error('Failed to load user bookings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? A 100% full refund will be processed immediately.')) {
      return;
    }

    setCancellingId(bookingId);
    try {
      await api.cancelBooking(bookingId);
      setMessage('✅ Booking successfully cancelled & refund processed!');
      fetchBookings();
    } catch (err) {
      alert(err.message || 'Failed to cancel booking');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{
          maxWidth: '820px',
          padding: 0,
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          background: 'rgba(15, 19, 28, 0.95)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(0, 240, 255, 0.15)',
              color: '#00f0ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Ticket size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>My Cinema Passes</h2>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {user?.email} • {bookings.length} Bookings Recorded
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              color: 'var(--text-muted)',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px', maxHeight: '75vh', overflowY: 'auto' }}>
          {message && (
            <div style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid #10b981',
              color: '#10b981',
              marginBottom: '16px',
              fontSize: '0.88rem',
            }}>
              {message}
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              Loading your bookings...
            </div>
          ) : bookings.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {bookings.map((booking) => {
                const isRefunded = booking.paymentStatus === 'refunded';
                return (
                  <div
                    key={booking._id}
                    style={{
                      background: 'var(--bg-card)',
                      borderRadius: 'var(--radius-md)',
                      border: isRefunded ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--border-subtle)',
                      padding: '20px',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                      gap: '20px',
                      alignItems: 'center',
                      opacity: isRefunded ? 0.7 : 1,
                    }}
                  >
                    {/* Left: Movie & Showtime Specs */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span className="badge badge-red" style={{ fontSize: '0.7rem' }}>
                          {booking.bookingRef}
                        </span>
                        <span
                          className={`badge ${isRefunded ? 'badge-red' : 'badge-emerald'}`}
                          style={{ fontSize: '0.7rem' }}
                        >
                          {isRefunded ? 'REFUNDED / CANCELLED' : 'CONFIRMED PASS'}
                        </span>
                      </div>

                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>
                        {booking.movieDetails?.title || 'Movie Experience'}
                      </h3>

                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <MapPin size={13} color="var(--accent-cyan)" />
                          <span>{booking.theaterData?.name} ({booking.theaterData?.screenType || 'IMAX'})</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Calendar size={13} color="var(--accent-gold)" />
                          <span>{booking.showDate} at {booking.showTime}</span>
                        </div>
                      </div>

                      {/* Seats */}
                      <div style={{ marginTop: '12px' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>SEATS:</span>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#00f0ff' }}>
                          {booking.seats.map(s => s.seatNumber).join(', ')}
                        </div>
                      </div>
                    </div>

                    {/* Right: QR Code & Price Actions */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '12px',
                      borderLeft: '1px dashed var(--border-subtle)',
                      paddingLeft: '16px'
                    }}>
                      {!isRefunded && qrMap[booking._id] && (
                        <div style={{ textAlign: 'center' }}>
                          <img
                            src={qrMap[booking._id]}
                            alt="Pass QR"
                            style={{ width: '90px', height: '90px', borderRadius: '6px', background: '#fff', padding: '4px' }}
                          />
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                            Scan at Hall Entry
                          </div>
                        </div>
                      )}

                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff' }}>
                          ₹{booking.totalAmount}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          Paid via {booking.paymentMethod}
                        </div>
                      </div>

                      {!isRefunded && (
                        <button
                          onClick={() => handleCancel(booking._id)}
                          disabled={cancellingId === booking._id}
                          className="btn btn-outline-danger btn-sm"
                          style={{ width: '100%', fontSize: '0.78rem' }}
                        >
                          {cancellingId === booking._id ? 'Processing Refund...' : 'Cancel & Get Full Refund'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '48px 20px' }}>
              <Ticket size={48} color="var(--text-muted)" style={{ marginBottom: '16px', opacity: 0.4 }} />
              <h3 style={{ fontSize: '1.2rem', marginBottom: '6px' }}>No passes booked yet</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Explore now-showing blockbusters and secure your seats today!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

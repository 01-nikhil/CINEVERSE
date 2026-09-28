import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  MapPin,
  Ticket,
  CheckCircle2,
  Sparkles,
  CreditCard,
  QrCode,
  Tag,
  Download,
  AlertCircle,
  Plus,
  Minus,
  Utensils
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';
import QRCode from 'qrcode';

const SNACKS_MENU = [
  { id: 's1', name: 'Caramel Popcorn Jumbo', desc: 'Warm crunchy golden caramel glazed', price: 180, image: '🍿' },
  { id: 's2', name: 'Cheesy Nachos & Dip Combo', desc: 'Crispy corn tortilla with warm jalapeño salsa & queso', price: 210, image: '🧀' },
  { id: 's3', name: 'Coca-Cola Ice Blast (Large)', desc: 'Chilled carbonated fountain soda', price: 120, image: '🥤' },
  { id: 's4', name: 'IMAX 3D Reusable Polarized Glasses', desc: 'Certified high-clarity 3D eyewear', price: 60, image: '🕶️' },
];

export const BookingModal = ({ movie, onClose, onBookingComplete }) => {
  const { user, openLogin } = useAuth();

  // Booking Flow Steps: 1: 'showtime' | 2: 'seats' | 3: 'snacks' | 4: 'checkout' | 5: 'confirmation'
  const [step, setStep] = useState(1);

  // Data
  const [theaters, setTheaters] = useState([]);
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selections
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTheater, setSelectedTheater] = useState(null);
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]); // Array of { seatNumber, tier, price }
  const [selectedSnacks, setSelectedSnacks] = useState({}); // { snackId: quantity }
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CARD'); // 'CARD' | 'UPI' | 'WALLET'

  // Confirmed booking state
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingError, setBookingError] = useState('');

  // Date Generator for the next 7 days
  const next7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString(undefined, { weekday: 'short' });
    const dayNum = d.getDate();
    const monthName = d.toLocaleDateString(undefined, { month: 'short' });
    return { dateStr, dayName, dayNum, monthName };
  });

  useEffect(() => {
    if (next7Days.length > 0) {
      setSelectedDate(next7Days[0].dateStr);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [theatersData, showtimesData] = await Promise.all([
          api.getTheaters(),
          api.getShowtimes({ movieId: movie._id, date: selectedDate })
        ]);
        setTheaters(theatersData);
        setShowtimes(showtimesData);
        if (theatersData.length > 0 && !selectedTheater) {
          setSelectedTheater(theatersData[0]);
        }
      } catch (err) {
        console.error('Failed to load showtime info:', err);
      } finally {
        setLoading(false);
      }
    };
    if (movie && selectedDate) {
      fetchData();
    }
  }, [movie, selectedDate]);

  // Generate Seat Matrix Layout
  // Rows: A, B (VIP), C, D, E, F (Premium), G, H (Standard)
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const cols = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  const getSeatTier = (row) => {
    if (['A', 'B'].includes(row)) return 'VIP';
    if (['C', 'D', 'E', 'F'].includes(row)) return 'Premium';
    return 'Standard';
  };

  const getSeatPrice = (tier) => {
    if (!selectedShowtime?.prices) {
      if (tier === 'VIP') return 450;
      if (tier === 'Premium') return 320;
      return 220;
    }
    return selectedShowtime.prices[tier.toLowerCase()] || 250;
  };

  const isSeatBooked = (seatNumber) => {
    if (!selectedShowtime?.bookedSeats) return false;
    return selectedShowtime.bookedSeats.some(bs => bs.seatNumber === seatNumber);
  };

  const isSeatSelected = (seatNumber) => {
    return selectedSeats.some(s => s.seatNumber === seatNumber);
  };

  const handleSeatClick = (row, col) => {
    const seatNumber = `${row}${col}`;
    if (isSeatBooked(seatNumber)) return;

    if (isSeatSelected(seatNumber)) {
      setSelectedSeats(selectedSeats.filter(s => s.seatNumber !== seatNumber));
    } else {
      if (selectedSeats.length >= 8) {
        alert('You can select a maximum of 8 seats per booking');
        return;
      }
      const tier = getSeatTier(row);
      const price = getSeatPrice(tier);
      setSelectedSeats([...selectedSeats, { seatNumber, tier, price }]);
    }
  };

  // Pricing calculations
  const seatsTotal = selectedSeats.reduce((sum, s) => sum + s.price, 0);
  const snacksTotal = Object.entries(selectedSnacks).reduce((sum, [snackId, qty]) => {
    const snack = SNACKS_MENU.find(s => s.id === snackId);
    return sum + (snack ? snack.price * qty : 0);
  }, 0);
  const convenienceFee = selectedSeats.length > 0 ? 35 + (selectedSeats.length * 5) : 0;
  const subtotal = seatsTotal + snacksTotal;
  const grandTotal = Math.max(0, subtotal + convenienceFee - appliedDiscount);

  // Apply promo code handler
  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (code === 'CINEVERSE50' || code === 'SAVE50') {
      const discount = Math.round(subtotal * 0.5);
      setAppliedDiscount(discount);
      setPromoMessage('🎉 50% discount applied successfully!');
    } else if (code === 'FLAT100') {
      setAppliedDiscount(100);
      setPromoMessage('🎉 ₹100 Flat discount applied!');
    } else {
      setAppliedDiscount(0);
      setPromoMessage('❌ Invalid coupon code');
    }
  };

  // Complete Payment & Confirm Booking
  const handleConfirmPayment = async () => {
    if (!user) {
      openLogin();
      return;
    }

    setIsProcessing(true);
    setBookingError('');

    try {
      const snacksPayload = Object.entries(selectedSnacks)
        .filter(([_, qty]) => qty > 0)
        .map(([snackId, qty]) => {
          const item = SNACKS_MENU.find(s => s.id === snackId);
          return { name: item?.name || 'Snack', quantity: qty, price: item?.price || 0 };
        });

      const bookingPayload = {
        movieId: movie._id,
        theaterId: selectedTheater?._id,
        showtimeId: selectedShowtime?._id,
        seats: selectedSeats,
        snacks: snacksPayload,
        subtotal,
        convenienceFee,
        discountAmount: appliedDiscount,
        totalAmount: grandTotal,
        paymentMethod,
        movieDetails: {
          title: movie.title,
          posterUrl: movie.posterUrl,
          format: selectedShowtime?.screenType || 'IMAX 3D',
          language: Array.isArray(movie.language) ? movie.language[0] : movie.language,
        },
        theaterData: {
          name: selectedTheater?.name,
          city: selectedTheater?.city,
          address: selectedTheater?.address,
          screenType: selectedShowtime?.screenType || 'IMAX 3D',
        },
        showDate: selectedDate,
        showTime: selectedShowtime?.time || '18:00',
      };

      const booking = await api.createBooking(bookingPayload);
      setConfirmedBooking(booking);

      // Generate Ticket QR Code
      const qrString = `CINEVERSE-PASS|REF:${booking.bookingRef}|SHOW:${booking.showDate} ${booking.showTime}|SEATS:${selectedSeats.map(s => s.seatNumber).join(',')}|STATUS:VERIFIED`;
      const qrUrl = await QRCode.toDataURL(qrString, { width: 220, margin: 1, color: { dark: '#07080b', light: '#ffffff' } });
      setQrDataUrl(qrUrl);

      // Trigger Confetti Celebration
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#e50914', '#00f0ff', '#ffb703', '#ffffff']
      });

      setStep(5);
      if (onBookingComplete) onBookingComplete(booking);
    } catch (err) {
      setBookingError(err.message || 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{
          maxWidth: step === 2 ? '940px' : '760px',
          padding: 0,
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div style={{
          padding: '18px 24px',
          background: 'rgba(15, 19, 28, 0.95)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {step > 1 && step < 5 && (
              <button
                onClick={() => setStep(step - 1)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  color: '#fff',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <ChevronLeft size={18} />
              </button>
            )}
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
                {step === 5 ? 'Booking Confirmed 🎉' : movie.title}
              </h2>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {step === 1 && 'Step 1: Select Date, Theater & Showtime'}
                {step === 2 && `Step 2: Choose Seats (${selectedSeats.length} Selected)`}
                {step === 3 && 'Step 3: Food & Beverage Combos'}
                {step === 4 && 'Step 4: Review & Payment Checkout'}
                {step === 5 && `Booking Pass Reference: ${confirmedBooking?.bookingRef}`}
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

        {/* Step Progression Bar */}
        {step < 5 && (
          <div style={{
            display: 'flex',
            height: '4px',
            background: 'rgba(255, 255, 255, 0.05)',
            width: '100%',
          }}>
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                style={{
                  flex: 1,
                  background: s <= step ? 'linear-gradient(90deg, #e50914, #ff2a5f)' : 'transparent',
                  transition: 'background 0.3s ease',
                }}
              />
            ))}
          </div>
        )}

        {/* STEP 1: DATE, THEATER & SHOWTIMES */}
        {step === 1 && (
          <div style={{ padding: '24px' }}>
            {/* 7-Day Date Selector */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={15} color="var(--accent-primary)" />
                SELECT DATE
              </div>
              <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '6px' }}>
                {next7Days.map((d) => (
                  <button
                    key={d.dateStr}
                    onClick={() => setSelectedDate(d.dateStr)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: '10px 16px',
                      borderRadius: 'var(--radius-sm)',
                      border: selectedDate === d.dateStr ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                      background: selectedDate === d.dateStr ? 'rgba(229, 9, 20, 0.18)' : 'var(--bg-card)',
                      color: selectedDate === d.dateStr ? '#fff' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      minWidth: '72px',
                      transition: 'all 0.2s',
                    }}
                  >
                    <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 600 }}>{d.dayName}</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: selectedDate === d.dateStr ? '#ff4d58' : '#fff' }}>{d.dayNum}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{d.monthName}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Theaters List with Showtimes */}
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={15} color="var(--accent-cyan)" />
                SELECT THEATER & SHOWTIME
              </div>

              {theaters.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>Loading theaters...</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {theaters.map((theater) => {
                    const theaterShowtimes = showtimes.filter(s => String(s.theaterId) === String(theater._id));
                    return (
                      <div
                        key={theater._id}
                        style={{
                          background: 'var(--bg-card)',
                          borderRadius: 'var(--radius-md)',
                          padding: '18px',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                          <div>
                            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', marginBottom: '3px' }}>
                              {theater.name}
                            </h4>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                              {theater.address} • {theater.city}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {theater.amenities.slice(0, 2).map((a, i) => (
                              <span key={i} className="badge badge-muted" style={{ fontSize: '0.68rem' }}>{a}</span>
                            ))}
                          </div>
                        </div>

                        {/* Showtime Chips */}
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                          {theaterShowtimes.length > 0 ? (
                            theaterShowtimes.map((st) => (
                              <button
                                key={st._id}
                                onClick={() => {
                                  setSelectedTheater(theater);
                                  setSelectedShowtime(st);
                                  setStep(2);
                                }}
                                style={{
                                  padding: '10px 16px',
                                  borderRadius: 'var(--radius-sm)',
                                  border: '1px solid rgba(255, 255, 255, 0.12)',
                                  background: 'rgba(255, 255, 255, 0.04)',
                                  color: '#fff',
                                  cursor: 'pointer',
                                  textAlign: 'center',
                                  transition: 'all 0.2s',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '2px',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.borderColor = 'var(--accent-primary)';
                                  e.currentTarget.style.background = 'rgba(229, 9, 20, 0.15)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                                }}
                              >
                                <span style={{ fontSize: '1rem', fontWeight: 800 }}>{st.time}</span>
                                <span style={{ fontSize: '0.68rem', color: '#00f0ff', fontWeight: 700 }}>{st.screenType}</span>
                              </button>
                            ))
                          ) : (
                            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                              No showtimes scheduled for this date.
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: CINEMATIC SEAT SELECTION */}
        {step === 2 && (
          <div style={{ padding: '24px' }}>
            {/* Curved Screen Indicator */}
            <div className="cinema-screen-container">
              <div className="cinema-screen-curve" />
              <div className="cinema-screen-beam" />
              <div className="screen-text">All Eyes On Screen</div>
            </div>

            {/* Interactive Seat Matrix */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              overflowX: 'auto',
              padding: '10px 0 24px',
            }}>
              {rows.map((row) => {
                const tier = getSeatTier(row);
                return (
                  <div key={row} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '20px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textAlign: 'center' }}>
                      {row}
                    </span>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      {cols.map((col) => {
                        const seatNumber = `${row}${col}`;
                        const booked = isSeatBooked(seatNumber);
                        const selected = isSeatSelected(seatNumber);

                        // Colors by tier
                        let bg = 'var(--seat-avail-standard)';
                        let border = 'rgba(255, 255, 255, 0.1)';
                        if (tier === 'VIP') {
                          bg = 'rgba(245, 158, 11, 0.25)';
                          border = 'rgba(245, 158, 11, 0.5)';
                        } else if (tier === 'Premium') {
                          bg = 'rgba(59, 130, 246, 0.25)';
                          border = 'rgba(59, 130, 246, 0.5)';
                        }

                        if (booked) {
                          bg = '#161922';
                          border = 'rgba(255, 255, 255, 0.05)';
                        }

                        if (selected) {
                          bg = '#10b981';
                          border = '#10b981';
                        }

                        // Add aisle spacer between col 4 and 5, and col 8 and 9
                        const hasAisle = col === 4 || col === 8;

                        return (
                          <React.Fragment key={col}>
                            <button
                              disabled={booked}
                              onClick={() => handleSeatClick(row, col)}
                              title={`${seatNumber} - ${tier} (₹${getSeatPrice(tier)}) ${booked ? '[Booked]' : ''}`}
                              style={{
                                width: '32px',
                                height: '30px',
                                borderRadius: '6px 6px 3px 3px',
                                background: bg,
                                border: `1px solid ${border}`,
                                color: booked ? '#475569' : selected ? '#050608' : '#fff',
                                fontSize: '0.65rem',
                                fontWeight: 800,
                                cursor: booked ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.15s ease',
                                transform: selected ? 'scale(1.15)' : 'none',
                                boxShadow: selected ? '0 0 12px rgba(16, 185, 129, 0.8)' : 'none',
                              }}
                            >
                              {col}
                            </button>
                            {hasAisle && <div style={{ width: '16px' }} />}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Seat Legend */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '20px',
              padding: '14px',
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '20px',
              flexWrap: 'wrap',
              border: '1px solid var(--border-subtle)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem' }}>
                <div style={{ width: '14px', height: '14px', borderRadius: '3px', background: 'rgba(245, 158, 11, 0.4)', border: '1px solid #f59e0b' }} />
                <span>VIP Recliner (₹{getSeatPrice('VIP')})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem' }}>
                <div style={{ width: '14px', height: '14px', borderRadius: '3px', background: 'rgba(59, 130, 246, 0.4)', border: '1px solid #3b82f6' }} />
                <span>Premium Club (₹{getSeatPrice('Premium')})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem' }}>
                <div style={{ width: '14px', height: '14px', borderRadius: '3px', background: '#334155' }} />
                <span>Standard (₹{getSeatPrice('Standard')})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem' }}>
                <div style={{ width: '14px', height: '14px', borderRadius: '3px', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
                <span>Selected</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                <div style={{ width: '14px', height: '14px', borderRadius: '3px', background: '#161922', border: '1px solid rgba(255,255,255,0.05)' }} />
                <span>Booked</span>
              </div>
            </div>

            {/* Bottom Summary Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              background: 'rgba(15, 19, 28, 0.95)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-medium)',
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SELECTED SEATS</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>
                  {selectedSeats.length > 0 ? selectedSeats.map(s => s.seatNumber).join(', ') : 'None'}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#00f0ff', fontWeight: 700 }}>
                  Seats Total: ₹{seatsTotal}
                </div>
              </div>

              <button
                disabled={selectedSeats.length === 0}
                onClick={() => setStep(3)}
                className="btn btn-primary"
                style={{ padding: '12px 28px', opacity: selectedSeats.length === 0 ? 0.4 : 1 }}
              >
                <span>Continue to Snacks</span>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SNACKS & ADD-ONS */}
        {step === 3 && (
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Utensils size={18} color="var(--accent-gold)" />
                  Gourmet Bites & Drinks
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Delivered hot directly to your seat</p>
              </div>
              <button
                onClick={() => setStep(4)}
                className="btn btn-secondary btn-sm"
              >
                Skip to Payment ➔
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              {SNACKS_MENU.map((item) => {
                const qty = selectedSnacks[item.id] || 0;
                return (
                  <div
                    key={item.id}
                    style={{
                      background: 'var(--bg-card)',
                      borderRadius: 'var(--radius-md)',
                      padding: '16px',
                      border: qty > 0 ? '1px solid var(--accent-gold)' : '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ fontSize: '2.4rem', lineHeight: 1 }}>{item.image}</div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: '2px' }}>
                        {item.name}
                      </h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                        {item.desc}
                      </p>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffb703' }}>
                        ₹{item.price}
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {qty > 0 ? (
                        <>
                          <button
                            onClick={() => setSelectedSnacks({ ...selectedSnacks, [item.id]: qty - 1 })}
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              background: 'rgba(255, 255, 255, 0.1)',
                              border: 'none',
                              color: '#fff',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Minus size={14} />
                          </button>
                          <span style={{ fontWeight: 800, fontSize: '0.95rem', minWidth: '16px', textAlign: 'center' }}>
                            {qty}
                          </span>
                          <button
                            onClick={() => setSelectedSnacks({ ...selectedSnacks, [item.id]: qty + 1 })}
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              background: 'var(--accent-primary)',
                              border: 'none',
                              color: '#fff',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Plus size={14} />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setSelectedSnacks({ ...selectedSnacks, [item.id]: 1 })}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                        >
                          + Add
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Next Button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Snacks Total: <strong style={{ color: '#fff' }}>₹{snacksTotal}</strong>
              </div>
              <button
                onClick={() => setStep(4)}
                className="btn btn-primary"
                style={{ padding: '12px 28px' }}
              >
                <span>Proceed to Checkout</span>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: CHECKOUT & PAYMENT */}
        {step === 4 && (
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              {/* Left Column: Order Breakdown & Coupon */}
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '14px', color: '#fff' }}>
                  Booking Summary
                </h3>

                <div style={{
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-md)',
                  padding: '18px',
                  border: '1px solid var(--border-subtle)',
                  marginBottom: '16px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.88rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Movie</span>
                    <span style={{ fontWeight: 700, color: '#fff' }}>{movie.title}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.88rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Date & Time</span>
                    <span style={{ fontWeight: 600, color: '#fff' }}>{selectedDate} at {selectedShowtime?.time}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.88rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Seats ({selectedSeats.length})</span>
                    <span style={{ fontWeight: 700, color: '#00f0ff' }}>{selectedSeats.map(s => s.seatNumber).join(', ')}</span>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '10px 0' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Tickets Subtotal</span>
                    <span>₹{seatsTotal}</span>
                  </div>
                  {snacksTotal > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Snacks & Combos</span>
                      <span>₹{snacksTotal}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Convenience Fee</span>
                    <span>₹{convenienceFee}</span>
                  </div>
                  {appliedDiscount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem', color: '#10b981' }}>
                      <span>Discount Applied</span>
                      <span>-₹{appliedDiscount}</span>
                    </div>
                  )}

                  <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '10px 0' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>Total Amount</span>
                    <span style={{ fontWeight: 900, fontSize: '1.35rem', color: '#ff4d58' }}>₹{grandTotal}</span>
                  </div>
                </div>

                {/* Promo Code Input */}
                <div style={{
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px',
                  border: '1px solid var(--border-subtle)',
                }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Tag size={14} color="var(--accent-gold)" />
                    HAVE A PROMO CODE? (Try: <strong style={{ color: '#00f0ff' }}>CINEVERSE50</strong>)
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="Enter promo code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="input-field"
                      style={{ padding: '8px 12px', fontSize: '0.85rem', textTransform: 'uppercase' }}
                    />
                    <button
                      onClick={handleApplyPromo}
                      className="btn btn-secondary btn-sm"
                    >
                      Apply
                    </button>
                  </div>
                  {promoMessage && (
                    <div style={{ fontSize: '0.78rem', marginTop: '6px', color: appliedDiscount > 0 ? '#10b981' : '#f87171' }}>
                      {promoMessage}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Payment Methods */}
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '14px', color: '#fff' }}>
                  Payment Method
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '14px',
                      borderRadius: 'var(--radius-sm)',
                      background: paymentMethod === 'CARD' ? 'rgba(229, 9, 20, 0.15)' : 'var(--bg-card)',
                      border: paymentMethod === 'CARD' ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'CARD'}
                      onChange={() => setPaymentMethod('CARD')}
                    />
                    <CreditCard size={18} color={paymentMethod === 'CARD' ? '#ff4d58' : '#94a3b8'} />
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Credit / Debit Card (Instant 3D Secure)</span>
                  </label>

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '14px',
                      borderRadius: 'var(--radius-sm)',
                      background: paymentMethod === 'UPI' ? 'rgba(0, 240, 255, 0.15)' : 'var(--bg-card)',
                      border: paymentMethod === 'UPI' ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'UPI'}
                      onChange={() => setPaymentMethod('UPI')}
                    />
                    <QrCode size={18} color={paymentMethod === 'UPI' ? '#00f0ff' : '#94a3b8'} />
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>UPI QR Scan (GooglePay, PhonePe, Paytm)</span>
                  </label>

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '14px',
                      borderRadius: 'var(--radius-sm)',
                      background: paymentMethod === 'WALLET' ? 'rgba(255, 183, 3, 0.15)' : 'var(--bg-card)',
                      border: paymentMethod === 'WALLET' ? '1px solid var(--accent-gold)' : '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'WALLET'}
                      onChange={() => setPaymentMethod('WALLET')}
                    />
                    <Sparkles size={18} color={paymentMethod === 'WALLET' ? '#ffb703' : '#94a3b8'} />
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>CineVerse FastPay Wallet</span>
                  </label>
                </div>

                {bookingError && (
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-xs)',
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid #ef4444',
                    color: '#fca5a5',
                    fontSize: '0.85rem',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <AlertCircle size={16} />
                    <span>{bookingError}</span>
                  </div>
                )}

                <button
                  disabled={isProcessing}
                  onClick={handleConfirmPayment}
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', gap: '10px' }}
                >
                  {isProcessing ? (
                    <span>Securing Seats & Processing...</span>
                  ) : (
                    <>
                      <Ticket size={20} />
                      <span>Pay ₹{grandTotal} & Confirm Tickets</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: CONFIRMATION & DIGITAL TICKET PASS */}
        {step === 5 && confirmedBooking && (
          <div style={{ padding: '32px 24px', textAlign: 'center' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.2)',
              border: '2px solid #10b981',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 0 25px rgba(16, 185, 129, 0.5)'
            }}>
              <CheckCircle2 size={36} />
            </div>

            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '6px' }}>
              Your Cinema Pass is Ready!
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '28px' }}>
              A confirmation email & SMS has been dispatched with booking ID <strong>{confirmedBooking.bookingRef}</strong>.
            </p>

            {/* Printable Digital Ticket Stub */}
            <div
              id="printable-ticket"
              style={{
                maxWidth: '460px',
                margin: '0 auto 28px',
                background: '#fff',
                color: '#07080b',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
                textAlign: 'left',
                border: '1px solid rgba(0,0,0,0.1)'
              }}
            >
              {/* Ticket Top Banner */}
              <div style={{
                background: 'linear-gradient(135deg, #e50914 0%, #07080b 100%)',
                color: '#fff',
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div>
                  <div style={{ fontSize: '0.7rem', letterSpacing: '0.15em', fontWeight: 800 }}>CINEVERSE ENTRY PASS</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 900 }}>{confirmedBooking.movieDetails?.title || movie.title}</div>
                </div>
                <span style={{
                  background: 'rgba(255,255,255,0.2)',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '0.72rem',
                  fontWeight: 800
                }}>
                  {confirmedBooking.movieDetails?.format || 'IMAX 3D'}
                </span>
              </div>

              {/* Ticket Content */}
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '18px' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>THEATER</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>{confirmedBooking.theaterData?.name}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>SHOW DATE & TIME</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
                      {confirmedBooking.showDate} • {confirmedBooking.showTime}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>SEAT NUMBERS</div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#e50914', letterSpacing: '0.05em' }}>
                      {confirmedBooking.seats.map(s => s.seatNumber).join(', ')}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                      Total Paid: <strong>₹{confirmedBooking.totalAmount}</strong> (TXN ID: {confirmedBooking.transactionId})
                    </div>
                  </div>

                  {qrDataUrl && (
                    <div style={{ textAlign: 'center' }}>
                      <img
                        src={qrDataUrl}
                        alt="Booking QR Code"
                        style={{ width: '88px', height: '88px', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                      />
                      <div style={{ fontSize: '0.62rem', color: '#64748b', marginTop: '2px' }}>Scan at Gate</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => window.print()}
                className="btn btn-secondary"
                style={{ gap: '8px' }}
              >
                <Download size={16} />
                <span>Print / Save Pass</span>
              </button>

              <button
                onClick={onClose}
                className="btn btn-primary"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

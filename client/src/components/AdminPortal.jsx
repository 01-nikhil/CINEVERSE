import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Film,
  Plus,
  Trash2,
  Edit3,
  Calendar,
  Clock,
  MapPin,
  TrendingUp,
  DollarSign,
  Ticket,
  Users,
  QrCode,
  Search,
  CheckCircle2,
  XCircle,
  Sparkles,
  RefreshCw,
  Eye,
  Lock,
  Layers
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const AdminPortal = ({ onBackToClient }) => {
  const { user, isAdmin, quickDemoLogin } = useAuth();

  // Admin Active Tab: 'overview' | 'movies' | 'showtimes' | 'scanner' | 'bookings'
  const [activeTab, setActiveTab] = useState('overview');

  // Stats & Core Data
  const [stats, setStats] = useState(null);
  const [movies, setMovies] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Movie Form State (for Add / Edit)
  const [isMovieModalOpen, setIsMovieModalOpen] = useState(false);
  const [editingMovieId, setEditingMovieId] = useState(null);
  const [movieForm, setMovieForm] = useState({
    title: '',
    tagline: '',
    description: '',
    posterUrl: '',
    backdropUrl: '',
    trailerUrl: '',
    genre: ['Action', 'Sci-Fi'],
    duration: 150,
    releaseDate: new Date().toISOString().split('T')[0],
    rating: 8.5,
    certification: 'PG-13',
    language: ['English'],
    formats: ['IMAX 3D', 'Dolby Atmos', '2D'],
    director: '',
    status: 'now_showing',
    featured: false,
  });

  // Showtime Scheduler State
  const [showtimeForm, setShowtimeForm] = useState({
    movieId: '',
    theaterId: '',
    screenType: 'IMAX 3D',
    date: new Date().toISOString().split('T')[0],
    time: '18:00',
    vipPrice: 450,
    premiumPrice: 320,
    standardPrice: 220,
  });
  const [schedulingSuccess, setSchedulingSuccess] = useState('');

  // Ticket Scanner State
  const [scanQuery, setScanQuery] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [scanning, setScanning] = useState(false);

  // Search in Bookings table
  const [bookingFilter, setBookingFilter] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsData, moviesData, theatersData, bookingsData] = await Promise.all([
        api.getAdminStats(),
        api.getMovies({}),
        api.getTheaters(),
        api.getAllBookings(),
      ]);
      setStats(statsData);
      setMovies(moviesData);
      setTheaters(theatersData);
      setBookings(bookingsData);

      if (moviesData.length > 0 && theatersData.length > 0 && !showtimeForm.movieId) {
        setShowtimeForm(prev => ({
          ...prev,
          movieId: moviesData[0]._id,
          theaterId: theatersData[0]._id,
        }));
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
    }
  }, [isAdmin]);

  // Handle Save Movie (Create or Update)
  const handleSaveMovie = async (e) => {
    e.preventDefault();
    try {
      if (editingMovieId) {
        await api.updateMovie(editingMovieId, movieForm);
      } else {
        await api.createMovie(movieForm);
      }
      setIsMovieModalOpen(false);
      setEditingMovieId(null);
      fetchAdminData();
    } catch (err) {
      alert(err.message || 'Failed to save movie');
    }
  };

  const handleEditMovie = (m) => {
    setEditingMovieId(m._id);
    setMovieForm({
      title: m.title || '',
      tagline: m.tagline || '',
      description: m.description || '',
      posterUrl: m.posterUrl || '',
      backdropUrl: m.backdropUrl || '',
      trailerUrl: m.trailerUrl || '',
      genre: m.genre || ['Action'],
      duration: m.duration || 120,
      releaseDate: m.releaseDate ? m.releaseDate.split('T')[0] : '',
      rating: m.rating || 8.0,
      certification: m.certification || 'PG-13',
      language: m.language || ['English'],
      formats: m.formats || ['2D'],
      director: m.director || '',
      status: m.status || 'now_showing',
      featured: m.featured || false,
    });
    setIsMovieModalOpen(true);
  };

  const handleDeleteMovie = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this movie?')) return;
    try {
      await api.deleteMovie(id);
      fetchAdminData();
    } catch (err) {
      alert(err.message || 'Failed to delete movie');
    }
  };

  // Handle Create Showtime
  const handleScheduleShowtime = async (e) => {
    e.preventDefault();
    try {
      await api.createShowtime({
        movieId: showtimeForm.movieId,
        theaterId: showtimeForm.theaterId,
        screenType: showtimeForm.screenType,
        date: showtimeForm.date,
        time: showtimeForm.time,
        prices: {
          vip: Number(showtimeForm.vipPrice),
          premium: Number(showtimeForm.premiumPrice),
          standard: Number(showtimeForm.standardPrice),
        },
      });
      setSchedulingSuccess('✨ Showtime successfully scheduled!');
      setTimeout(() => setSchedulingSuccess(''), 4000);
      fetchAdminData();
    } catch (err) {
      alert(err.message || 'Failed to schedule showtime');
    }
  };

  // Handle Verify Ticket Scanner
  const handleVerifyTicket = async (e) => {
    e.preventDefault();
    if (!scanQuery.trim()) return;

    setScanning(true);
    setScanResult(null);
    try {
      // Clean query if it is barcode raw format
      let ref = scanQuery.trim();
      if (ref.includes('REF:')) {
        const match = ref.match(/REF:([A-Z0-9-]+)/);
        if (match) ref = match[1];
      }
      const data = await api.verifyTicket(ref);
      setScanResult(data);
    } catch (err) {
      setScanResult({ valid: false, message: err.message || 'Ticket not found or invalid' });
    } finally {
      setScanning(false);
    }
  };

  // Admin lock screen if not logged in as Admin
  if (!isAdmin) {
    return (
      <div className="app-container" style={{ padding: '80px 24px', textAlign: 'center', maxWidth: '540px' }}>
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          padding: '40px',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: 'rgba(229, 9, 20, 0.15)',
            border: '1px solid rgba(229, 9, 20, 0.4)',
            color: '#ff4d58',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
          }}>
            <Lock size={32} />
          </div>

          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
            Admin Portal Access
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '28px' }}>
            This command center allows cinema administrators to manage live movie catalogues, schedule screen showtimes, verify digital entry passes, and monitor revenue analytics.
          </p>

          <button
            onClick={() => quickDemoLogin('admin')}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', gap: '10px', marginBottom: '12px' }}
          >
            <ShieldCheck size={20} />
            <span>Unlock Admin Portal (1-Click Demo)</span>
          </button>

          <button
            onClick={onBackToClient}
            className="btn btn-secondary"
            style={{ width: '100%' }}
          >
            Return to CineVerse Client
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container" style={{ padding: '32px 24px 80px' }}>
      {/* Top Banner Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '32px',
        paddingBottom: '20px',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #e50914 0%, #7f0007 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px var(--accent-primary-glow)',
          }}>
            <ShieldCheck size={26} color="#fff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 900 }}>CineVerse Admin Command</h1>
              <span className="badge badge-red">LIVE ADMIN</span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Managing Theaters • Scheduling Showtimes • Revenue & Pass Validation
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={fetchAdminData}
            className="btn btn-secondary btn-sm"
            style={{ gap: '6px' }}
          >
            <RefreshCw size={14} />
            <span>Refresh Data</span>
          </button>

          <button
            onClick={onBackToClient}
            className="btn btn-secondary btn-sm"
          >
            Switch to Client View
          </button>
        </div>
      </div>

      {/* Analytics KPI Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '18px',
        marginBottom: '32px',
      }}>
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-md)',
          padding: '20px',
          border: '1px solid var(--border-subtle)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
            TOTAL REVENUE
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#10b981' }}>
            ₹{(stats?.totalRevenue || 0).toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            +18.4% compared to last week
          </div>
        </div>

        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-md)',
          padding: '20px',
          border: '1px solid var(--border-subtle)',
        }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
            CONFIRMED PASSES
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#00f0ff' }}>
            {stats?.totalBookings || bookings.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Active seats reserved
          </div>
        </div>

        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-md)',
          padding: '20px',
          border: '1px solid var(--border-subtle)',
        }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
            ACTIVE MOVIES
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#ffb703' }}>
            {movies.filter(m => m.status === 'now_showing').length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Across 3 Multiplex Centers
          </div>
        </div>

        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-md)',
          padding: '20px',
          border: '1px solid var(--border-subtle)',
        }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
            AVG OCCUPANCY RATE
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#ff4d58' }}>
            {stats?.occupancyRate || '78.4%'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Peak evening fill rate
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{
        display: 'flex',
        gap: '10px',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '16px',
        marginBottom: '28px',
        overflowX: 'auto',
      }}>
        {[
          { id: 'overview', label: 'Dashboard & Sales', icon: <TrendingUp size={16} /> },
          { id: 'movies', label: `Movie Manager (${movies.length})`, icon: <Film size={16} /> },
          { id: 'showtimes', label: 'Showtime Scheduler', icon: <Clock size={16} /> },
          { id: 'scanner', label: 'Ticket QR Scanner', icon: <QrCode size={16} /> },
          { id: 'bookings', label: `Bookings Ledger (${bookings.length})`, icon: <Ticket size={16} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: 'var(--radius-full)',
              border: activeTab === tab.id ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
              background: activeTab === tab.id ? 'rgba(229, 9, 20, 0.18)' : 'var(--bg-card)',
              color: activeTab === tab.id ? '#fff' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
            }}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: DASHBOARD & SALES */}
      {activeTab === 'overview' && (
        <div>
          {/* Revenue Chart Visualizer */}
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-md)',
            padding: '24px',
            border: '1px solid var(--border-subtle)',
            marginBottom: '28px',
          }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '18px' }}>
              Weekly Revenue Distribution (₹)
            </h3>

            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: '16px',
              height: '200px',
              paddingTop: '20px',
              borderBottom: '1px solid var(--border-subtle)',
            }}>
              {(stats?.salesBreakdown || [
                { day: 'Mon', revenue: 4200 },
                { day: 'Tue', revenue: 5800 },
                { day: 'Wed', revenue: 7100 },
                { day: 'Thu', revenue: 9400 },
                { day: 'Fri', revenue: 16800 },
                { day: 'Sat', revenue: 24500 },
                { day: 'Sun', revenue: 21900 },
              ]).map((item) => {
                const heightPct = Math.round((item.revenue / 25000) * 100);
                return (
                  <div
                    key={item.day}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      height: '100%',
                      justifyContent: 'flex-end',
                    }}
                  >
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      ₹{(item.revenue / 1000).toFixed(1)}k
                    </div>
                    <div
                      style={{
                        width: '100%',
                        maxWidth: '48px',
                        height: `${heightPct}%`,
                        background: 'linear-gradient(180deg, #e50914 0%, #7f0007 100%)',
                        borderRadius: '6px 6px 0 0',
                        boxShadow: '0 0 15px rgba(229, 9, 20, 0.4)',
                        transition: 'height 0.5s ease',
                      }}
                    />
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, marginTop: '8px', color: '#fff' }}>
                      {item.day}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Performing Movies Table */}
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-md)',
            padding: '24px',
            border: '1px solid var(--border-subtle)',
          }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px' }}>
              Movie Box Office Performance
            </h3>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '12px 8px' }}>MOVIE</th>
                    <th style={{ padding: '12px 8px' }}>RATING</th>
                    <th style={{ padding: '12px 8px' }}>TICKETS SOLD</th>
                    <th style={{ padding: '12px 8px' }}>GROSS REVENUE</th>
                  </tr>
                </thead>
                <tbody>
                  {(stats?.moviePerformance || []).map((m) => (
                    <tr key={m.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '12px 8px', fontWeight: 700, color: '#fff' }}>{m.title}</td>
                      <td style={{ padding: '12px 8px' }}>⭐ {m.rating}</td>
                      <td style={{ padding: '12px 8px' }}>{m.ticketsSold} passes</td>
                      <td style={{ padding: '12px 8px', fontWeight: 800, color: '#10b981' }}>₹{m.revenue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MOVIE MANAGER */}
      {activeTab === 'movies' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Manage Movie Catalogue</h3>
            <button
              onClick={() => {
                setEditingMovieId(null);
                setMovieForm({
                  title: '',
                  tagline: '',
                  description: '',
                  posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop&q=80',
                  backdropUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1600&auto=format&fit=crop&q=80',
                  trailerUrl: '',
                  genre: ['Action', 'Sci-Fi'],
                  duration: 145,
                  releaseDate: new Date().toISOString().split('T')[0],
                  rating: 8.5,
                  certification: 'PG-13',
                  language: ['English'],
                  formats: ['IMAX 3D', 'Dolby Atmos', '2D'],
                  director: '',
                  status: 'now_showing',
                  featured: false,
                });
                setIsMovieModalOpen(true);
              }}
              className="btn btn-primary btn-sm"
              style={{ gap: '6px' }}
            >
              <Plus size={16} />
              <span>Add New Movie</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {movies.map((m) => (
              <div
                key={m._id}
                style={{
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  padding: '16px',
                  display: 'flex',
                  gap: '14px',
                }}
              >
                <img
                  src={m.posterUrl}
                  alt={m.title}
                  style={{ width: '80px', height: '115px', borderRadius: 'var(--radius-xs)', objectFit: 'cover' }}
                />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                      <span className={`badge ${m.status === 'now_showing' ? 'badge-red' : 'badge-cyan'}`} style={{ fontSize: '0.65rem' }}>
                        {m.status === 'now_showing' ? 'NOW SHOWING' : 'COMING SOON'}
                      </span>
                    </div>
                    <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>{m.title}</h4>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      ⭐ {m.rating} • {m.duration}m
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    <button
                      onClick={() => handleEditMovie(m)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '4px 10px', fontSize: '0.75rem', gap: '4px' }}
                    >
                      <Edit3 size={13} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteMovie(m._id)}
                      className="btn btn-outline-danger btn-sm"
                      style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SHOWTIME SCHEDULER */}
      {activeTab === 'showtimes' && (
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            padding: '28px',
            border: '1px solid var(--border-subtle)',
          }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={20} color="var(--accent-primary)" />
              Schedule New Showtime Slot
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Assign movie screenings to multiplex screens and customize tier pricing.
            </p>

            {schedulingSuccess && (
              <div style={{
                padding: '12px 16px',
                borderRadius: 'var(--radius-xs)',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid #10b981',
                color: '#10b981',
                marginBottom: '16px',
                fontSize: '0.85rem'
              }}>
                {schedulingSuccess}
              </div>
            )}

            <form onSubmit={handleScheduleShowtime} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Select Movie
                </label>
                <select
                  value={showtimeForm.movieId}
                  onChange={(e) => setShowtimeForm({ ...showtimeForm, movieId: e.target.value })}
                  className="input-field"
                  required
                >
                  {movies.map((m) => (
                    <option key={m._id} value={m._id}>{m.title} ({m.certification})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Select Multiplex Theater
                </label>
                <select
                  value={showtimeForm.theaterId}
                  onChange={(e) => setShowtimeForm({ ...showtimeForm, theaterId: e.target.value })}
                  className="input-field"
                  required
                >
                  {theaters.map((t) => (
                    <option key={t._id} value={t._id}>{t.name} ({t.city})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Screen Format
                  </label>
                  <select
                    value={showtimeForm.screenType}
                    onChange={(e) => setShowtimeForm({ ...showtimeForm, screenType: e.target.value })}
                    className="input-field"
                  >
                    <option value="IMAX 3D">IMAX 3D</option>
                    <option value="Dolby Atmos">Dolby Atmos</option>
                    <option value="4DX">4DX Motion</option>
                    <option value="Standard Digital">Standard 2D</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Showtime (24h)
                  </label>
                  <input
                    type="time"
                    value={showtimeForm.time}
                    onChange={(e) => setShowtimeForm({ ...showtimeForm, time: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Date
                </label>
                <input
                  type="date"
                  value={showtimeForm.date}
                  onChange={(e) => setShowtimeForm({ ...showtimeForm, date: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              {/* Tier Prices */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f59e0b', display: 'block', marginBottom: '4px' }}>
                    VIP Recliner (₹)
                  </label>
                  <input
                    type="number"
                    value={showtimeForm.vipPrice}
                    onChange={(e) => setShowtimeForm({ ...showtimeForm, vipPrice: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#3b82f6', display: 'block', marginBottom: '4px' }}>
                    Premium Club (₹)
                  </label>
                  <input
                    type="number"
                    value={showtimeForm.premiumPrice}
                    onChange={(e) => setShowtimeForm({ ...showtimeForm, premiumPrice: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                    Standard (₹)
                  </label>
                  <input
                    type="number"
                    value={showtimeForm.standardPrice}
                    onChange={(e) => setShowtimeForm({ ...showtimeForm, standardPrice: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ marginTop: '10px', padding: '12px 0' }}
              >
                Schedule & Publish Showtime
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 4: TICKET SCANNER & VERIFICATION */}
      {activeTab === 'scanner' && (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            padding: '28px',
            border: '1px solid var(--border-subtle)',
            textAlign: 'center',
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'rgba(0, 240, 255, 0.15)',
              color: '#00f0ff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '14px',
            }}>
              <QrCode size={30} />
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '6px' }}>
              Cinema Gate Pass Scanner
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
              Type or paste the booking reference code (e.g. <strong>CNV-982341</strong>) to authenticate visitor entry.
            </p>

            <form onSubmit={handleVerifyTicket} style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
              <input
                type="text"
                placeholder="Enter Booking Ref (e.g. CNV-982341)"
                value={scanQuery}
                onChange={(e) => setScanQuery(e.target.value)}
                className="input-field"
                style={{ fontSize: '1rem', textTransform: 'uppercase' }}
                required
              />
              <button
                type="submit"
                disabled={scanning}
                className="btn btn-cyan"
                style={{ padding: '0 24px' }}
              >
                {scanning ? 'Verifying...' : 'Verify Pass'}
              </button>
            </form>

            {/* Verification Result Card */}
            {scanResult && (
              <div style={{
                background: scanResult.valid ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                border: scanResult.valid ? '1px solid #10b981' : '1px solid #ef4444',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                textAlign: 'left',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  {scanResult.valid ? (
                    <CheckCircle2 size={24} color="#10b981" />
                  ) : (
                    <XCircle size={24} color="#ef4444" />
                  )}
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: scanResult.valid ? '#10b981' : '#ef4444' }}>
                    {scanResult.message}
                  </h4>
                </div>

                {scanResult.booking && (
                  <div style={{ fontSize: '0.88rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div><strong>Movie:</strong> {scanResult.booking.movieDetails?.title}</div>
                    <div><strong>Theater:</strong> {scanResult.booking.theaterData?.name}</div>
                    <div><strong>Showtime:</strong> {scanResult.booking.showDate} at {scanResult.booking.showTime}</div>
                    <div><strong>Reserved Seats:</strong> <span style={{ color: '#00f0ff', fontWeight: 800 }}>{scanResult.booking.seats?.map(s => s.seatNumber).join(', ')}</span></div>
                    <div><strong>Paid Amount:</strong> ₹{scanResult.booking.totalAmount} (Status: {scanResult.booking.paymentStatus})</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: BOOKINGS LEDGER */}
      {activeTab === 'bookings' && (
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-md)',
          padding: '24px',
          border: '1px solid var(--border-subtle)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Customer Bookings Ledger</h3>
            <div style={{ position: 'relative', width: '280px' }}>
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search booking ref..."
                value={bookingFilter}
                onChange={(e) => setBookingFilter(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '36px', height: '38px', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '10px 8px' }}>REF ID</th>
                  <th style={{ padding: '10px 8px' }}>MOVIE</th>
                  <th style={{ padding: '10px 8px' }}>THEATER</th>
                  <th style={{ padding: '10px 8px' }}>SEATS</th>
                  <th style={{ padding: '10px 8px' }}>SHOW DATE</th>
                  <th style={{ padding: '10px 8px' }}>AMOUNT</th>
                  <th style={{ padding: '10px 8px' }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {bookings
                  .filter(b => !bookingFilter || b.bookingRef?.toLowerCase().includes(bookingFilter.toLowerCase()))
                  .map((b) => (
                    <tr key={b._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '10px 8px', fontWeight: 800, color: '#ff4d58' }}>{b.bookingRef}</td>
                      <td style={{ padding: '10px 8px', fontWeight: 700, color: '#fff' }}>{b.movieDetails?.title || 'Movie'}</td>
                      <td style={{ padding: '10px 8px' }}>{b.theaterData?.name}</td>
                      <td style={{ padding: '10px 8px', color: '#00f0ff', fontWeight: 700 }}>
                        {b.seats?.map(s => s.seatNumber).join(', ')}
                      </td>
                      <td style={{ padding: '10px 8px' }}>{b.showDate} {b.showTime}</td>
                      <td style={{ padding: '10px 8px', fontWeight: 800 }}>₹{b.totalAmount}</td>
                      <td style={{ padding: '10px 8px' }}>
                        <span className={`badge ${b.paymentStatus === 'paid' ? 'badge-emerald' : 'badge-red'}`} style={{ fontSize: '0.65rem' }}>
                          {b.paymentStatus.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD / EDIT MOVIE MODAL */}
      {isMovieModalOpen && (
        <div className="modal-overlay" onClick={() => setIsMovieModalOpen(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: '640px', padding: '28px', background: 'var(--bg-surface)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '18px' }}>
              {editingMovieId ? 'Edit Movie' : 'Add New Movie to CineVerse'}
            </h3>

            <form onSubmit={handleSaveMovie} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Movie Title
                </label>
                <input
                  type="text"
                  value={movieForm.title}
                  onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Release Status
                  </label>
                  <select
                    value={movieForm.status}
                    onChange={(e) => setMovieForm({ ...movieForm, status: e.target.value })}
                    className="input-field"
                  >
                    <option value="now_showing">Now Showing</option>
                    <option value="coming_soon">Coming Soon</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    value={movieForm.duration}
                    onChange={(e) => setMovieForm({ ...movieForm, duration: Number(e.target.value) })}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    IMDb / Rating (0-10)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={movieForm.rating}
                    onChange={(e) => setMovieForm({ ...movieForm, rating: Number(e.target.value) })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Certification
                  </label>
                  <select
                    value={movieForm.certification}
                    onChange={(e) => setMovieForm({ ...movieForm, certification: e.target.value })}
                    className="input-field"
                  >
                    <option value="PG-13">PG-13</option>
                    <option value="R">R</option>
                    <option value="PG">PG</option>
                    <option value="UA">UA</option>
                    <option value="A">A</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Tagline (Punchy quote)
                </label>
                <input
                  type="text"
                  value={movieForm.tagline}
                  onChange={(e) => setMovieForm({ ...movieForm, tagline: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Poster Image URL
                </label>
                <input
                  type="url"
                  value={movieForm.posterUrl}
                  onChange={(e) => setMovieForm({ ...movieForm, posterUrl: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  YouTube Trailer Embed URL
                </label>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/embed/Way9Dexny3w"
                  value={movieForm.trailerUrl}
                  onChange={(e) => setMovieForm({ ...movieForm, trailerUrl: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Synopsis & Description
                </label>
                <textarea
                  rows={3}
                  value={movieForm.description}
                  onChange={(e) => setMovieForm({ ...movieForm, description: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsMovieModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Save Movie
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

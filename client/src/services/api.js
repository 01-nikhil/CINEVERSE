const API_BASE = '/api';

const getHeaders = () => {
  const token = localStorage.getItem('cineverse_token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
};

export const api = {
  // Auth
  login: (email, password) =>
    fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }).then(handleResponse),

  register: (userData) =>
    fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    }).then(handleResponse),

  demoLogin: (role) =>
    fetch(`${API_BASE}/auth/demo-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    }).then(handleResponse),

  getMe: () =>
    fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders(),
    }).then(handleResponse),

  // Movies
  getMovies: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.status) searchParams.append('status', params.status);
    if (params.genre) searchParams.append('genre', params.genre);
    if (params.search) searchParams.append('search', params.search);
    return fetch(`${API_BASE}/movies?${searchParams.toString()}`).then(handleResponse);
  },

  getMovieById: (id) =>
    fetch(`${API_BASE}/movies/${id}`).then(handleResponse),

  createMovie: (movieData) =>
    fetch(`${API_BASE}/movies`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(movieData),
    }).then(handleResponse),

  updateMovie: (id, movieData) =>
    fetch(`${API_BASE}/movies/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(movieData),
    }).then(handleResponse),

  deleteMovie: (id) =>
    fetch(`${API_BASE}/movies/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    }).then(handleResponse),

  // Theaters
  getTheaters: () =>
    fetch(`${API_BASE}/theaters`).then(handleResponse),

  // Showtimes
  getShowtimes: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.movieId) searchParams.append('movieId', params.movieId);
    if (params.date) searchParams.append('date', params.date);
    if (params.theaterId) searchParams.append('theaterId', params.theaterId);
    return fetch(`${API_BASE}/showtimes?${searchParams.toString()}`).then(handleResponse);
  },

  createShowtime: (showtimeData) =>
    fetch(`${API_BASE}/showtimes`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(showtimeData),
    }).then(handleResponse),

  // Bookings
  createBooking: (bookingData) =>
    fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(bookingData),
    }).then(handleResponse),

  getMyBookings: () =>
    fetch(`${API_BASE}/bookings/my`, {
      headers: getHeaders(),
    }).then(handleResponse),

  cancelBooking: (id) =>
    fetch(`${API_BASE}/bookings/${id}/cancel`, {
      method: 'POST',
      headers: getHeaders(),
    }).then(handleResponse),

  // Reviews
  getReviews: (movieId) =>
    fetch(`${API_BASE}/reviews/movie/${movieId}`).then(handleResponse),

  addReview: (reviewData) =>
    fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(reviewData),
    }).then(handleResponse),

  // Admin
  getAdminStats: () =>
    fetch(`${API_BASE}/admin/stats`, {
      headers: getHeaders(),
    }).then(handleResponse),

  getAllBookings: () =>
    fetch(`${API_BASE}/admin/bookings`, {
      headers: getHeaders(),
    }).then(handleResponse),

  getAllUsers: () =>
    fetch(`${API_BASE}/admin/users`, {
      headers: getHeaders(),
    }).then(handleResponse),

  verifyTicket: (bookingRef) =>
    fetch(`${API_BASE}/admin/verify-ticket`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ bookingRef }),
    }).then(handleResponse),
};

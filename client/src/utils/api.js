// Centralized API client for AirSkyGo
const API_BASE = '/api';

export const getAdminAuthToken = () => {
  return localStorage.getItem('asg_admin_token') || '';
};

export const setAdminAuthToken = (token) => {
  if (token) {
    localStorage.setItem('asg_admin_token', token);
  } else {
    localStorage.removeItem('asg_admin_token');
  }
};

const getAdminHeaders = (extra = {}) => {
  const token = getAdminAuthToken();
  const headers = { ...extra };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // Live Site Settings (CMS)
  getSettings: async () => {
    const res = await fetch(`${API_BASE}/settings`);
    return res.json();
  },

  updateSettings: async (settingsData) => {
    const res = await fetch(`${API_BASE}/admin/settings`, {
      method: 'PUT',
      headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(settingsData)
    });
    return res.json();
  },

  // Brand Identity & Styling (Logo, Colors, Name, Contact)
  getBrand: async () => {
    const res = await fetch(`${API_BASE}/brand`);
    return res.json();
  },

  updateBrand: async (brandData) => {
    const res = await fetch(`${API_BASE}/admin/brand`, {
      method: 'POST',
      headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(brandData)
    });
    return res.json();
  },

  // Airports
  getAirports: async () => {
    const res = await fetch(`${API_BASE}/airports`);
    return res.json();
  },

  addAirport: async (airportData) => {
    const res = await fetch(`${API_BASE}/admin/airports`, {
      method: 'POST',
      headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(airportData)
    });
    return res.json();
  },

  deleteAirport: async (code) => {
    const res = await fetch(`${API_BASE}/admin/airports/${code}`, {
      method: 'DELETE',
      headers: getAdminHeaders()
    });
    return res.json();
  },

  // Coupons
  getCoupons: async () => {
    const res = await fetch(`${API_BASE}/coupons`);
    return res.json();
  },

  addCoupon: async (couponData) => {
    const res = await fetch(`${API_BASE}/admin/coupons`, {
      method: 'POST',
      headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(couponData)
    });
    return res.json();
  },

  updateCoupon: async (id, couponData) => {
    const res = await fetch(`${API_BASE}/admin/coupons/${id}`, {
      method: 'PUT',
      headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(couponData)
    });
    return res.json();
  },

  deleteCoupon: async (id) => {
    const res = await fetch(`${API_BASE}/admin/coupons/${id}`, {
      method: 'DELETE',
      headers: getAdminHeaders()
    });
    return res.json();
  },

  applyCoupon: async (code, amount) => {
    const res = await fetch(`${API_BASE}/coupons/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, amount })
    });
    return res.json();
  },

  // Flights
  searchFlights: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/flights?${query}`);
    return res.json();
  },

  getFlightById: async (id) => {
    const res = await fetch(`${API_BASE}/flights/${id}`);
    return res.json();
  },

  getFlightSeats: async (id) => {
    const res = await fetch(`${API_BASE}/flights/${id}/seats`);
    return res.json();
  },

  getFareCalendar: async (from, to) => {
    const res = await fetch(`${API_BASE}/fares/calendar?from=${from}&to=${to}`);
    return res.json();
  },

  trackFlightStatus: async (query) => {
    const res = await fetch(`${API_BASE}/flights/status/search?query=${encodeURIComponent(query || '')}`);
    return res.json();
  },

  // Bookings
  createBooking: async (bookingData) => {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData)
    });
    return res.json();
  },

  getBookings: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/bookings?${query}&_t=${Date.now()}`, {
      cache: 'no-store',
      headers: getAdminHeaders({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      })
    });
    return res.json();
  },

  getBookingByPnr: async (pnr) => {
    const cleanPnr = encodeURIComponent(String(pnr || '').trim());
    const res = await fetch(`${API_BASE}/bookings/${cleanPnr}?_t=${Date.now()}`, {
      cache: 'no-store',
      headers: getAdminHeaders({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      })
    });
    return res.json();
  },

  cancelBooking: async (pnr) => {
    const cleanPnr = encodeURIComponent(String(pnr || '').trim());
    const res = await fetch(`${API_BASE}/bookings/${cleanPnr}/cancel`, {
      method: 'PATCH',
      headers: getAdminHeaders()
    });
    return res.json();
  },

  checkInBooking: async (pnr) => {
    const cleanPnr = encodeURIComponent(String(pnr || '').trim());
    const res = await fetch(`${API_BASE}/bookings/${cleanPnr}/checkin`, {
      method: 'PATCH'
    });
    return res.json();
  },

  // Admin APIs
  getAdminStats: async () => {
    const res = await fetch(`${API_BASE}/admin/stats?_t=${Date.now()}`, {
      cache: 'no-store',
      headers: getAdminHeaders()
    });
    return res.json();
  },

  addFlight: async (flightData) => {
    const res = await fetch(`${API_BASE}/admin/flights`, {
      method: 'POST',
      headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(flightData)
    });
    return res.json();
  },

  updateFlight: async (id, flightData) => {
    const res = await fetch(`${API_BASE}/admin/flights/${id}`, {
      method: 'PUT',
      headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(flightData)
    });
    return res.json();
  },

  deleteFlight: async (id) => {
    const res = await fetch(`${API_BASE}/admin/flights/${id}`, {
      method: 'DELETE',
      headers: getAdminHeaders()
    });
    return res.json();
  },

  updateBookingStatus: async (pnr, status) => {
    const cleanPnr = encodeURIComponent(String(pnr || '').trim());
    const res = await fetch(`${API_BASE}/admin/bookings/${cleanPnr}/status?_t=${Date.now()}`, {
      method: 'PATCH',
      headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ status })
    });
    return res.json();
  },

  deleteBooking: async (pnr) => {
    const res = await fetch(`${API_BASE}/admin/bookings/${pnr}`, {
      method: 'DELETE',
      headers: getAdminHeaders()
    });
    return res.json();
  },

  adminLogin: async (username, password) => {
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return res.json();
  },

  adminChangeCredentials: async (credentials) => {
    const res = await fetch(`${API_BASE}/admin/change-credentials`, {
      method: 'POST',
      headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(credentials)
    });
    return res.json();
  },

  getApisConfig: async () => {
    const res = await fetch(`${API_BASE}/admin/apis`, {
      headers: getAdminHeaders()
    });
    return res.json();
  },

  updateApisConfig: async (config) => {
    const res = await fetch(`${API_BASE}/admin/apis`, {
      method: 'PUT',
      headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(config)
    });
    return res.json();
  },

  // Moyatri Multi-Services
  getHotels: async (city = '') => {
    const q = city ? `?city=${encodeURIComponent(city)}` : '';
    const res = await fetch(`${API_BASE}/hotels${q}`);
    return res.json();
  },

  getHolidays: async () => {
    const res = await fetch(`${API_BASE}/holidays`);
    return res.json();
  },

  getTrains: async () => {
    const res = await fetch(`${API_BASE}/trains`);
    return res.json();
  },

  getVisa: async () => {
    const res = await fetch(`${API_BASE}/visa`);
    return res.json();
  },

  // Customer Management & Real Data
  customerAuth: async (authData) => {
    const res = await fetch(`${API_BASE}/auth/customer-auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(authData)
    });
    return res.json();
  },

  getCustomers: async () => {
    const res = await fetch(`${API_BASE}/admin/customers`, {
      headers: getAdminHeaders()
    });
    return res.json();
  },

  deleteCustomer: async (id) => {
    const res = await fetch(`${API_BASE}/admin/customers/${id}`, {
      method: 'DELETE',
      headers: getAdminHeaders()
    });
    return res.json();
  },

  // Hotel Booking
  bookHotel: async (data) => {
    const res = await fetch(`${API_BASE}/hotels/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  getAdminHotelBookings: async () => {
    const res = await fetch(`${API_BASE}/admin/hotel-bookings`, {
      headers: getAdminHeaders()
    });
    return res.json();
  },

  updateHotelBookingStatus: async (id, status) => {
    const res = await fetch(`${API_BASE}/admin/hotel-bookings/${id}/status`, {
      method: 'PATCH',
      headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ status })
    });
    return res.json();
  },

  // Holiday Inquiries
  inquireHoliday: async (data) => {
    const res = await fetch(`${API_BASE}/holidays/inquire`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  getAdminHolidayInquiries: async () => {
    const res = await fetch(`${API_BASE}/admin/holiday-inquiries`, {
      headers: getAdminHeaders()
    });
    return res.json();
  },

  updateHolidayInquiryStatus: async (id, status) => {
    const res = await fetch(`${API_BASE}/admin/holiday-inquiries/${id}/status`, {
      method: 'PATCH',
      headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ status })
    });
    return res.json();
  },

  // Admin Holiday Packages Catalog
  getAdminHolidays: async () => {
    const res = await fetch(`${API_BASE}/admin/holidays`, {
      headers: getAdminHeaders()
    });
    return res.json();
  },

  addHoliday: async (data) => {
    const res = await fetch(`${API_BASE}/admin/holidays`, {
      method: 'POST',
      headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  updateHoliday: async (id, data) => {
    const res = await fetch(`${API_BASE}/admin/holidays/${id}`, {
      method: 'PUT',
      headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  toggleHolidayStatus: async (id) => {
    const res = await fetch(`${API_BASE}/admin/holidays/${id}/toggle`, {
      method: 'PATCH',
      headers: getAdminHeaders()
    });
    return res.json();
  },

  deleteHoliday: async (id) => {
    const res = await fetch(`${API_BASE}/admin/holidays/${id}`, {
      method: 'DELETE',
      headers: getAdminHeaders()
    });
    return res.json();
  },

  // Train Booking
  bookTrain: async (data) => {
    const res = await fetch(`${API_BASE}/trains/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  getAdminTrainBookings: async () => {
    const res = await fetch(`${API_BASE}/admin/train-bookings`, {
      headers: getAdminHeaders()
    });
    return res.json();
  },

  // Visa Applications
  applyVisa: async (data) => {
    const res = await fetch(`${API_BASE}/visa/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  getAdminVisaApplications: async () => {
    const res = await fetch(`${API_BASE}/admin/visa-applications`, {
      headers: getAdminHeaders()
    });
    return res.json();
  },

  updateVisaApplicationStatus: async (id, status) => {
    const res = await fetch(`${API_BASE}/admin/visa-applications/${id}/status`, {
      method: 'PATCH',
      headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ status })
    });
    return res.json();
  },

  // Payment & UPI Settings
  getPaymentSettings: async () => {
    const res = await fetch(`${API_BASE}/payment-settings`);
    return res.json();
  },

  updatePaymentSettings: async (settingsData) => {
    const res = await fetch(`${API_BASE}/admin/payment-settings`, {
      method: 'POST',
      headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(settingsData)
    });
    return res.json();
  },

  // Integrated API & Payment Settings (Matches airskyindia.com/admin/settings)
  getApiSettings: async () => {
    const res = await fetch(`${API_BASE}/admin/api-settings`, {
      headers: getAdminHeaders()
    });
    return res.json();
  },

  updateApiSettings: async (settingsData) => {
    const res = await fetch(`${API_BASE}/admin/api-settings`, {
      method: 'POST',
      headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(settingsData)
    });
    return res.json();
  },

  testSerpApiKey: async (apiKey) => {
    const res = await fetch(`${API_BASE}/admin/apis/test-serpapi`, {
      method: 'POST',
      headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ apiKey })
    });
    return res.json();
  }
};

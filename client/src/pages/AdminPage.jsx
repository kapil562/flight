import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, Lock, Mail, Eye, EyeOff, LogOut, ArrowLeft, Layers, Settings,
  Plane, Tag, MapPin, Ticket, Save, Plus, Trash2, Edit2, RefreshCw, KeyRound,
  CheckCircle, ArrowUpRight, Search, Check, AlertTriangle, UserCheck, Cpu, Globe, ExternalLink, Radio,
  Palette, Building2, Compass, Train, Users, Phone, MessageCircle, Menu, X, ChevronRight, LayoutDashboard,
  Palmtree, Clock, ToggleLeft, ToggleRight, Database, QrCode, Key, Sliders, Sparkles
} from 'lucide-react';
import { api } from '../utils/api';
import { applyGlobalTheme } from '../utils/theme';
import AdminPaymentsUpi from '../components/AdminPaymentsUpi';
import AdminBrandSettings from '../components/AdminBrandSettings';
import AdminBrandCmsSettings from '../components/AdminBrandCmsSettings';
import AdminApiSettings from '../components/AdminApiSettings';
import AirlineBadge from '../components/AirlineBadge';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Login form state (Empty by default for high security)
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [lockoutSeconds, setLockoutSeconds] = useState(() => {
    const savedLock = sessionStorage.getItem('asg_admin_lockout_until');
    if (savedLock) {
      const remaining = Math.ceil((parseInt(savedLock, 10) - Date.now()) / 1000);
      return remaining > 0 ? remaining : 0;
    }
    return 0;
  });

  // Dashboard state
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'customers' | 'bookings' | 'hotel_bookings' | 'holiday_inquiries' | 'holidays_catalog' | 'train_bookings' | 'visa_applications' | 'flights' | 'coupons' | 'airports' | 'settings' | 'apis' | 'security'
  const [stats, setStats] = useState(null);
  const [flights, setFlights] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [airports, setAirports] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [hotelBookings, setHotelBookings] = useState([]);
  const [holidayInquiries, setHolidayInquiries] = useState([]);
  const [holidayPackages, setHolidayPackages] = useState([]);
  const [holidayCatalogSearch, setHolidayCatalogSearch] = useState('');
  const [catalogStatusFilter, setCatalogStatusFilter] = useState('all');
  const [trainBookings, setTrainBookings] = useState([]);
  const [visaApplications, setVisaApplications] = useState([]);
  const [settingsForm, setSettingsForm] = useState({});

  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState({ text: '', type: 'success' });

  // Modals & sub-states
  const [showAddFlightModal, setShowAddFlightModal] = useState(false);
  const [editingFlight, setEditingFlight] = useState(null);
  const [showAddCouponModal, setShowAddCouponModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [showAddAirportModal, setShowAddAirportModal] = useState(false);
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [bookingSearch, setBookingSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [hotelSearch, setHotelSearch] = useState('');
  const [holidaySearch, setHolidaySearch] = useState('');
  const [trainSearch, setTrainSearch] = useState('');
  const [visaSearch, setVisaSearch] = useState('');
  const [viewingBooking, setViewingBooking] = useState(null);

  // Password change state
  const [credForm, setCredForm] = useState({
    currentPassword: '',
    newUsername: '',
    newPassword: '',
    newName: ''
  });

  // Forms
  const [newFlight, setNewFlight] = useState({
    flightNumber: '',
    airline: 'IndiGo',
    airlineCode: '6E',
    from: 'DEL',
    to: 'BOM',
    departureTime: '10:00',
    arrivalTime: '12:15',
    duration: '2h 15m',
    basePrice: 4500,
    aircraft: 'Airbus A320neo',
    stops: 0,
    status: 'On-Time'
  });

  const [newCoupon, setNewCoupon] = useState({
    code: '',
    type: 'flat',
    discount: 500,
    minAmount: 3000,
    description: ''
  });

  const [newAirport, setNewAirport] = useState({
    code: '',
    city: '',
    name: '',
    country: 'India'
  });

  const [holidayForm, setHolidayForm] = useState({
    title: '',
    destination: '',
    duration: '5 Days / 4 Nights',
    price: 15999,
    originalPrice: 21999,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
    inclusions: '3 Star Resort Stay, Daily Breakfast & Dinner, Sightseeing, Airport Transfers',
    badge: 'Bestseller',
    flightsIncluded: true,
    active: true
  });

  // Check saved session on mount
  useEffect(() => {
    const savedSession = localStorage.getItem('asg_admin_session');
    const savedToken = localStorage.getItem('asg_admin_token');
    if (savedSession && savedToken) {
      try {
        const parsed = JSON.parse(savedSession);
        setIsAuthenticated(true);
        setAdminUser(parsed);
      } catch (e) {
        localStorage.removeItem('asg_admin_session');
        localStorage.removeItem('asg_admin_token');
      }
    }
  }, []);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutSeconds <= 0) {
      sessionStorage.removeItem('asg_admin_lockout_until');
      return;
    }
    const timer = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev <= 1) {
          sessionStorage.removeItem('asg_admin_lockout_until');
          sessionStorage.removeItem('asg_failed_attempts');
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutSeconds]);

  // Fetch admin dashboard data when authenticated
  const loadDashboardData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const [
        statsRes,
        flightsRes,
        bookingsRes,
        couponsRes,
        airportsRes,
        settingsRes,
        customersRes,
        hotelsRes,
        holidaysRes,
        holidayPackagesRes,
        trainsRes,
        visasRes
      ] = await Promise.all([
        api.getAdminStats(),
        api.searchFlights({}),
        api.getBookings({}),
        api.getCoupons(),
        api.getAirports(),
        api.getSettings(),
        api.getCustomers().catch(() => ({ success: false })),
        api.getAdminHotelBookings().catch(() => ({ success: false })),
        api.getAdminHolidayInquiries().catch(() => ({ success: false })),
        api.getAdminHolidays().catch(() => ({ success: false })),
        api.getAdminTrainBookings().catch(() => ({ success: false })),
        api.getAdminVisaApplications().catch(() => ({ success: false }))
      ]);

      if (statsRes?.message?.includes('Unauthorized') || statsRes?.status === 401) {
        handleLogout();
        return;
      }

      if (statsRes.success) setStats(statsRes.stats);
      if (flightsRes.success) setFlights(flightsRes.data);
      if (bookingsRes.success) setBookings(bookingsRes.data);
      if (couponsRes.success) setCoupons(couponsRes.data);
      if (airportsRes.success) setAirports(airportsRes.data);
      if (settingsRes.success && settingsRes.data) setSettingsForm(settingsRes.data);
      if (customersRes.success) setCustomers(customersRes.data || []);
      if (hotelsRes.success) setHotelBookings(hotelsRes.data || []);
      if (holidaysRes.success) setHolidayInquiries(holidaysRes.data || []);
      if (holidayPackagesRes?.success) setHolidayPackages(holidayPackagesRes.data || []);
      if (trainsRes.success) setTrainBookings(trainsRes.data || []);
      if (visasRes.success) setVisaApplications(visasRes.data || []);
    } catch (err) {
      if (!isSilent) console.error('Error fetching admin data', err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    loadDashboardData();
    // Live background auto-polling every 2.5 seconds: any booking made on phone shows up immediately!
    const pollTimer = setInterval(() => {
      loadDashboardData(true);
    }, 2500);
    return () => clearInterval(pollTimer);
  }, [isAuthenticated]);

  // Handle Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (lockoutSeconds > 0) return;
    setLoginError('');
    setIsLoggingIn(true);
    try {
      const res = await api.adminLogin(username.trim(), password);
      if (res.success) {
        setIsAuthenticated(true);
        setAdminUser(res.admin);
        localStorage.setItem('asg_admin_session', JSON.stringify(res.admin));
        if (res.token) {
          localStorage.setItem('asg_admin_token', res.token);
        }
        sessionStorage.removeItem('asg_failed_attempts');
        sessionStorage.removeItem('asg_admin_lockout_until');
      } else {
        const failedCount = (parseInt(sessionStorage.getItem('asg_failed_attempts') || '0', 10)) + 1;
        sessionStorage.setItem('asg_failed_attempts', String(failedCount));
        if (failedCount >= 5) {
          const lockUntil = Date.now() + 5 * 60 * 1000;
          sessionStorage.setItem('asg_admin_lockout_until', String(lockUntil));
          setLockoutSeconds(300);
          setLoginError('Security Alert: 5 failed attempts reached. Login locked for 5 minutes.');
        } else {
          setLoginError(res.message || `Invalid Admin ID or Password. (${5 - failedCount} attempts remaining)`);
        }
      }
    } catch (err) {
      setLoginError('Security verification failed or rate limit active.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('asg_admin_session');
    localStorage.removeItem('asg_admin_token');
    setIsAuthenticated(false);
    setAdminUser(null);
  };

  const triggerAlert = (text, type = 'success') => {
    setAlertMessage({ text, type });
    setTimeout(() => setAlertMessage({ text: '', type: 'success' }), 4000);
  };

  // 5 Color Themes Configuration (1-Click Instant Change)
  const COLOR_THEMES = [
    {
      id: 'sky',
      name: 'Aero Sky Blue',
      label: 'Sky Blue (Default)',
      desc: 'Modern clean aviation theme with vibrant sky blue and deep navy accents',
      dotColor: '#0284c7',
      badge: 'Standard Aviation',
      colors: ['#0284c7', '#0369a1', '#f0f9ff', '#0f172a']
    },
    {
      id: 'emerald',
      name: 'Royal Emerald',
      label: 'Emerald Green',
      desc: 'Lush emerald green and deep teal for an organic, high-trust, premium flight portal',
      dotColor: '#059669',
      badge: 'Eco & Premium',
      colors: ['#059669', '#047857', '#ecfdf5', '#042f2e']
    },
    {
      id: 'sunset',
      name: 'Sunset Coral',
      label: 'Sunset Orange',
      desc: 'Warm sunset gradient with energetic amber and coral tones (SpiceJet & Akasa vibes)',
      dotColor: '#ea580c',
      badge: 'Festive & Bold',
      colors: ['#ea580c', '#c2410c', '#fff7ed', '#431407']
    },
    {
      id: 'purple',
      name: 'Royal Violet',
      label: 'Royal Purple',
      desc: 'Executive luxury violet with majestic deep purple gradients (Vistara Luxury vibes)',
      dotColor: '#7c3aed',
      badge: 'Luxury Executive',
      colors: ['#7c3aed', '#6d28d9', '#f5f3ff', '#2e1065']
    },
    {
      id: 'gold',
      name: 'Midnight Gold',
      label: 'Midnight & Gold',
      desc: 'Sophisticated dark aesthetic with shimmering amber-gold accents (Platinum First Class)',
      dotColor: '#d97706',
      badge: 'Platinum VIP',
      colors: ['#d97706', '#b45309', '#fffbeb', '#451a03']
    }
  ];

  // 1-Click Instant Theme Change Handler
  const handleQuickThemeChange = async (themeId) => {
    // 1. Immediately apply to DOM documentElement for zero-latency instant switch
    document.documentElement.setAttribute('data-theme', themeId);
    localStorage.setItem('asg_theme', themeId);

    // 2. Update local state
    const updatedForm = { ...settingsForm, theme: themeId };
    setSettingsForm(updatedForm);

    const themeObj = COLOR_THEMES.find(t => t.id === themeId);

    if (themeObj && themeObj.colors) {
      applyGlobalTheme({
        primary_color: themeObj.colors[0],
        hover_color: themeObj.colors[1],
        light_color: themeObj.colors[2],
        dark_color: themeObj.colors[3]
      });
    }

    // 3. Persist to server backend immediately
    try {
      await api.updateSettings(updatedForm);
      triggerAlert(`Website color theme switched to "${themeObj?.name || themeId}" live! 1-Click update applied.`);
    } catch (err) {
      console.error('Error auto-saving theme', err);
      triggerAlert(`Theme applied locally to "${themeObj?.name || themeId}"`);
    }
  };

  // 1. Save Website CMS Settings
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      const res = await api.updateSettings(settingsForm);
      if (res.success) {
        triggerAlert('All website changes are now active live across the customer portal!');
      }
    } catch (err) {
      alert('Error updating settings');
    }
  };

  // 2. Change Admin ID / Password
  const handleChangeCredentials = async (e) => {
    e.preventDefault();
    if (!credForm.currentPassword) {
      alert('Please enter your current password');
      return;
    }
    if (credForm.newPassword && credForm.newPassword.length < 8) {
      alert('Security Requirement: New password must be at least 8 characters long.');
      return;
    }
    try {
      const res = await api.adminChangeCredentials(credForm);
      if (res.success) {
        if (res.token) {
          localStorage.setItem('asg_admin_token', res.token);
        }
        if (res.admin) {
          setAdminUser(res.admin);
          localStorage.setItem('asg_admin_session', JSON.stringify(res.admin));
        }
        triggerAlert('Admin ID & Password updated and encrypted in cloud vault successfully!');
        setCredForm({ currentPassword: '', newUsername: '', newPassword: '', newName: '' });
      } else {
        alert(res.message || 'Failed to update credentials');
      }
    } catch (err) {
      alert('Error updating credentials');
    }
  };



  // 3. Add Flight
  const handleAddFlightSubmit = async (e) => {
    e.preventDefault();
    if (!newFlight.flightNumber || !newFlight.basePrice) {
      alert('Flight number and price required');
      return;
    }
    try {
      const res = await api.addFlight(newFlight);
      if (res.success) {
        triggerAlert(`Flight ${newFlight.flightNumber} route published live!`);
        setShowAddFlightModal(false);
        loadDashboardData();
      }
    } catch (err) {
      alert('Error adding flight');
    }
  };

  // 4. Update Flight Price & Status
  const handleUpdateFlightSubmit = async (e) => {
    e.preventDefault();
    if (!editingFlight) return;
    try {
      const res = await api.updateFlight(editingFlight.id, editingFlight);
      if (res.success) {
        triggerAlert(`Flight ${editingFlight.flightNumber} updated!`);
        setEditingFlight(null);
        loadDashboardData();
      }
    } catch (err) {
      alert('Error updating flight');
    }
  };

  // 5. Delete Flight
  const handleDeleteFlight = async (id) => {
    if (!window.confirm('Delete this flight route?')) return;
    try {
      await api.deleteFlight(id);
      triggerAlert('Flight route deleted');
      loadDashboardData();
    } catch (err) {
      alert('Error deleting flight');
    }
  };

  // 6. Add / Edit Coupon
  const handleStartEditCoupon = (coupon) => {
    setEditingCoupon({ ...coupon });
    setShowAddCouponModal(true);
  };

  const handleSaveCouponSubmit = async (e) => {
    e.preventDefault();
    const dataToSave = editingCoupon || newCoupon;
    if (!dataToSave.code || !dataToSave.discount) {
      alert('Please enter both Coupon Code and Discount Value');
      return;
    }

    try {
      if (editingCoupon && editingCoupon.id) {
        const res = await api.updateCoupon(editingCoupon.id, editingCoupon);
        if (res.success) {
          triggerAlert(`Coupon ${editingCoupon.code} updated successfully!`);
          setShowAddCouponModal(false);
          setEditingCoupon(null);
          loadDashboardData();
        } else {
          alert(res.message || 'Error updating coupon');
        }
      } else {
        const res = await api.addCoupon(newCoupon);
        if (res.success) {
          triggerAlert(`Coupon ${newCoupon.code} created!`);
          setShowAddCouponModal(false);
          setNewCoupon({ code: '', type: 'flat', discount: 500, minAmount: 3000, description: '', status: 'Active' });
          loadDashboardData();
        } else {
          alert(res.message || 'Error creating coupon');
        }
      }
    } catch (err) {
      alert('Error saving coupon');
    }
  };

  // 7. Delete Coupon
  const handleDeleteCoupon = async (id) => {
    if (!window.confirm('Delete coupon code?')) return;
    try {
      await api.deleteCoupon(id);
      triggerAlert('Coupon deleted');
      loadDashboardData();
    } catch (err) {
      alert('Error deleting coupon');
    }
  };

  // 8. Add Airport
  const handleAddAirportSubmit = async (e) => {
    e.preventDefault();
    if (!newAirport.code || !newAirport.city) return;
    try {
      const res = await api.addAirport(newAirport);
      if (res.success) {
        triggerAlert(`Airport ${newAirport.code} added!`);
        setShowAddAirportModal(false);
        setNewAirport({ code: '', city: '', name: '', country: 'India' });
        loadDashboardData();
      }
    } catch (err) {
      alert('Error adding airport');
    }
  };

  // 9. Delete Airport
  const handleDeleteAirport = async (code) => {
    if (!window.confirm(`Delete airport ${code}?`)) return;
    try {
      await api.deleteAirport(code);
      triggerAlert('Airport deleted');
      loadDashboardData();
    } catch (err) {
      alert('Error deleting airport');
    }
  };

  // 10. Update Booking Status
  const handleUpdateBookingStatus = async (pnr, newStatus) => {
    try {
      const res = await api.updateBookingStatus(pnr, newStatus);
      if (res.success) {
        triggerAlert(`PNR ${pnr} status changed to ${newStatus}`);
        loadDashboardData();
        // Broadcast to user checkout modal across tabs/windows
        try {
          const updateEvent = { pnr, status: newStatus, timestamp: Date.now() };
          localStorage.setItem('asg_booking_status_update', JSON.stringify(updateEvent));
          if (window.BroadcastChannel) {
            const bc = new BroadcastChannel('asg_bookings_channel');
            bc.postMessage(updateEvent);
            bc.close();
          }
        } catch (e) {}
      }
    } catch (err) {
      alert('Error updating status');
    }
  };

  // 10b. Delete Booking
  const handleDeleteBooking = async (pnr) => {
    if (!window.confirm(`Are you sure you want to permanently delete booking PNR ${pnr}?`)) return;
    try {
      const res = await api.deleteBooking(pnr);
      if (res.success) {
        triggerAlert(`Booking PNR ${pnr} deleted successfully`);
        setBookings(prev => prev.filter(b => b.pnr !== pnr));
        loadDashboardData();
      } else {
        alert(res.message || 'Error deleting booking');
      }
    } catch (err) {
      alert('Error deleting booking');
    }
  };

  // 11. Delete Customer
  const handleDeleteCustomer = async (id, name) => {
    if (!window.confirm(`Delete customer account for ${name || id}?`)) return;
    try {
      const res = await api.deleteCustomer(id);
      if (res.success) {
        triggerAlert('Customer deleted successfully');
        setCustomers(prev => prev.filter(c => c.id !== id));
      }
    } catch (err) {
      alert('Error deleting customer');
    }
  };

  // 12. Update Hotel Booking Status
  const handleUpdateHotelStatus = async (id, newStatus) => {
    try {
      const res = await api.updateHotelBookingStatus(id, newStatus);
      if (res.success) {
        triggerAlert(`Hotel booking ${id} status updated to ${newStatus}`);
        setHotelBookings(prev => prev.map(h => h.id === id ? { ...h, status: newStatus } : h));
      }
    } catch (err) {
      alert('Error updating hotel status');
    }
  };

  // 13. Update Holiday Inquiry Status
  const handleUpdateHolidayStatus = async (id, newStatus) => {
    try {
      const res = await api.updateHolidayInquiryStatus(id, newStatus);
      if (res.success) {
        triggerAlert(`Holiday lead ${id} status updated to ${newStatus}`);
        setHolidayInquiries(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
      }
    } catch (err) {
      alert('Error updating holiday inquiry status');
    }
  };

  // 14. Update Visa Application Status
  const handleUpdateVisaStatus = async (id, newStatus) => {
    try {
      const res = await api.updateVisaApplicationStatus(id, newStatus);
      if (res.success) {
        triggerAlert(`Visa application ${id} status updated to ${newStatus}`);
        setVisaApplications(prev => prev.map(v => ((v.id === id || v.applicationId === id) ? { ...v, status: newStatus } : v)));
      }
    } catch (err) {
      alert('Error updating visa status');
    }
  };

  // 15. Holiday Catalog Handlers (Add, Edit, Delete, Toggle Active)
  const handleToggleHoliday = async (id) => {
    try {
      const res = await api.toggleHolidayStatus(id);
      if (res.success) {
        triggerAlert(`Holiday package is now ${res.active ? 'ACTIVE (Live)' : 'DEACTIVATED (Hidden)'}`);
        setHolidayPackages(prev => prev.map(p => p.id === id ? { ...p, active: res.active } : p));
      }
    } catch (err) {
      alert('Error toggling holiday package status');
    }
  };

  const handleDeleteHoliday = async (id) => {
    if (!window.confirm('Are you sure you want to delete this holiday package?')) return;
    try {
      const res = await api.deleteHoliday(id);
      if (res.success) {
        triggerAlert('Holiday package deleted');
        setHolidayPackages(prev => prev.filter(p => p.id !== id));
      }
    } catch (err) {
      alert('Error deleting holiday package');
    }
  };

  const handleOpenAddHoliday = () => {
    setEditingHoliday(null);
    setHolidayForm({
      title: '',
      destination: '',
      duration: '5 Days / 4 Nights',
      price: 15999,
      originalPrice: 21999,
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
      inclusions: '3 Star Resort Stay, Daily Breakfast & Dinner, Sightseeing, Airport Transfers',
      badge: 'Bestseller',
      flightsIncluded: true,
      active: true
    });
    setShowHolidayModal(true);
  };

  const handleOpenEditHoliday = (pkg) => {
    setEditingHoliday(pkg);
    setHolidayForm({
      title: pkg.title || '',
      destination: pkg.destination || '',
      duration: pkg.duration || '5 Days / 4 Nights',
      price: pkg.price || 15000,
      originalPrice: pkg.originalPrice || Math.round((pkg.price || 15000) * 1.25),
      rating: pkg.rating || 4.8,
      image: pkg.image || '',
      inclusions: Array.isArray(pkg.inclusions) ? pkg.inclusions.join(', ') : (pkg.inclusions || ''),
      badge: pkg.badge || 'Trending',
      flightsIncluded: !!pkg.flightsIncluded,
      active: pkg.active !== false
    });
    setShowHolidayModal(true);
  };

  const handleSaveHolidaySubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...holidayForm,
        price: Number(holidayForm.price),
        originalPrice: Number(holidayForm.originalPrice),
        rating: Number(holidayForm.rating),
        inclusions: typeof holidayForm.inclusions === 'string'
          ? holidayForm.inclusions.split(',').map(s => s.trim()).filter(Boolean)
          : holidayForm.inclusions
      };

      if (editingHoliday) {
        const res = await api.updateHoliday(editingHoliday.id, payload);
        if (res.success) {
          triggerAlert('Holiday package updated successfully!');
          setHolidayPackages(prev => prev.map(p => p.id === editingHoliday.id ? res.data : p));
          setShowHolidayModal(false);
        }
      } else {
        const res = await api.addHoliday(payload);
        if (res.success) {
          triggerAlert('New holiday package published live!');
          setHolidayPackages(prev => [res.data, ...prev]);
          setShowHolidayModal(false);
        }
      }
    } catch (err) {
      alert('Error saving holiday package');
    }
  };

  const filteredHolidaysCatalog = holidayPackages.filter(p => {
    if (catalogStatusFilter === 'active' && p.active === false) return false;
    if (catalogStatusFilter === 'inactive' && p.active !== false) return false;
    if (holidayCatalogSearch.trim()) {
      const q = holidayCatalogSearch.trim().toLowerCase();
      const match = (p.title && p.title.toLowerCase().includes(q)) ||
                    (p.destination && p.destination.toLowerCase().includes(q)) ||
                    (p.id && p.id.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const filteredBookings = bookings.filter(b =>
    (b.pnr || '').toLowerCase().includes(bookingSearch.toLowerCase()) ||
    (b.contact?.email || '').toLowerCase().includes(bookingSearch.toLowerCase()) ||
    (b.passengers || []).some(p => `${p.firstName || ''} ${p.lastName || ''}`.toLowerCase().includes(bookingSearch.toLowerCase()))
  );

  const filteredCustomers = customers.filter(c =>
    (c.name || '').toLowerCase().includes(customerSearch.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(customerSearch.toLowerCase()) ||
    (c.phone || '').includes(customerSearch)
  );

  const filteredHotels = hotelBookings.filter(h =>
    (h.hotelName || '').toLowerCase().includes(hotelSearch.toLowerCase()) ||
    (h.guestName || '').toLowerCase().includes(hotelSearch.toLowerCase()) ||
    (h.customerPhone || '').includes(hotelSearch) ||
    (h.id || '').toLowerCase().includes(hotelSearch.toLowerCase())
  );

  const filteredHolidays = holidayInquiries.filter(hi =>
    (hi.packageTitle || '').toLowerCase().includes(holidaySearch.toLowerCase()) ||
    (hi.travelerName || '').toLowerCase().includes(holidaySearch.toLowerCase()) ||
    (hi.phone || '').includes(holidaySearch)
  );

  const filteredTrains = trainBookings.filter(t =>
    (t.trainName || '').toLowerCase().includes(trainSearch.toLowerCase()) ||
    (t.passengerName || '').toLowerCase().includes(trainSearch.toLowerCase()) ||
    (t.pnr || '').toLowerCase().includes(trainSearch.toLowerCase()) ||
    (t.phone || '').includes(trainSearch)
  );

  const filteredVisas = visaApplications.filter(v =>
    (v.applicantName || '').toLowerCase().includes(visaSearch.toLowerCase()) ||
    (v.country || '').toLowerCase().includes(visaSearch.toLowerCase()) ||
    (v.passportNumber || '').toLowerCase().includes(visaSearch.toLowerCase()) ||
    (v.phone || '').includes(visaSearch)
  );

  /* ================= RENDER: LOGIN SCREEN IF NOT AUTHENTICATED ================= */
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 flex flex-col items-center justify-center p-4 text-slate-100">
        
        {/* Back to website button */}
        <div className="w-full max-w-md mb-4 flex justify-between items-center text-xs">
          <a
            href="/"
            className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← Return to Customer Website</span>
          </a>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-emerald-400 font-mono text-[11px] font-bold">256-Bit SSL Secured</span>
          </div>
        </div>

        {/* Login Box */}
        <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6">
          
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-700 flex items-center justify-center text-white mx-auto shadow-lg shadow-sky-500/30">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">AirSkyGo Admin Portal</h2>
            <p className="text-xs text-slate-400">
              Authorized personnel only. Please verify your identity to unlock master control.
            </p>
          </div>

          {lockoutSeconds > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-2.5 animate-pulse">
              <Clock className="w-5 h-5 flex-shrink-0 text-amber-400" />
              <div>
                <div className="font-bold">Security Lock Active</div>
                <div className="text-[11px] text-amber-400/90">
                  Too many failed attempts. Try again in {Math.floor(lockoutSeconds / 60)}m {lockoutSeconds % 60}s.
                </div>
              </div>
            </div>
          )}

          {loginError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-bold mb-1.5">Admin ID / Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  disabled={lockoutSeconds > 0}
                  placeholder="Enter authorized Admin ID / Email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-3 py-3 text-white font-semibold focus:outline-hidden focus:ring-2 focus:ring-sky-500 disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1.5">Admin Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={lockoutSeconds > 0}
                  placeholder="Enter Admin Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-10 py-3 text-white font-mono font-semibold focus:outline-hidden focus:ring-2 focus:ring-sky-500 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn || lockoutSeconds > 0}
              className="w-full py-3.5 bg-white hover:bg-slate-100 text-slate-950 font-black text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              {isLoggingIn ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>LOGIN TO ADMIN PANEL</span>
                </>
              )}
            </button>
          </form>

          {/* Enterprise Security Shield Info */}
          <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-300">Protected Admin Console</div>
              <p className="text-[10px] text-slate-500">
                Encrypted token sessions & brute-force IP rate limiting are actively monitored.
              </p>
            </div>
          </div>

        </div>
      </div>
    );
  }

  /* ================= RENDER: FULL DEDICATED ADMIN DASHBOARD ================= */
  /* ================= RENDER: FULL DEDICATED ADMIN DASHBOARD WITH MODERN SIDEBAR ================= */
  const navSections = [
    {
      heading: 'Dashboard & Users',
      items: [
        { id: 'overview', icon: Layers, label: 'Analytics Dashboard' },
        { id: 'customers', icon: Users, label: 'Registered Customers', count: customers.length }
      ]
    },
    {
      heading: 'Bookings & Leads',
      items: [
        { id: 'bookings', icon: Ticket, label: 'Flight Bookings', count: bookings.length },
        { id: 'hotel_bookings', icon: Building2, label: 'Hotel Bookings', count: hotelBookings.length },
        { id: 'holiday_inquiries', icon: Compass, label: 'Holiday Inquiries', count: holidayInquiries.length },
        { id: 'train_bookings', icon: Train, label: 'Train Tickets', count: trainBookings.length },
        { id: 'visa_applications', icon: Globe, label: 'Visa Applications', count: visaApplications.length }
      ]
    },
    {
      heading: 'Inventory & Hubs',
      items: [
        { id: 'flights', icon: Plane, label: 'Flight Inventory', count: flights.length },
        { id: 'holidays_catalog', icon: Palmtree, label: 'Holiday Packages', count: holidayPackages.length },
        { id: 'coupons', icon: Tag, label: 'Discount Coupons', count: coupons.length },
        { id: 'airports', icon: MapPin, label: 'Airport Hubs', count: airports.length }
      ]
    },
    {
      heading: 'Settings & Systems',
      items: [
        { id: 'services_modules', icon: Sliders, label: 'Service Tabs (ON / OFF)' },
        { id: 'footer_crm', icon: Sparkles, label: 'Footer & Contact CMS' },
        { id: 'brand_crm', icon: Palette, label: 'Brand & Website CRM' },
        { id: 'api_settings', icon: Key, label: 'API Keys' },
        { id: 'payments_upi', icon: QrCode, label: 'Payments & UPI' },
        { id: 'security', icon: KeyRound, label: 'Admin Security' }
      ]
    }
  ];

  const currentTabObj = navSections.flatMap(s => s.items).find(i => i.id === activeTab);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* MOBILE TOP BAR (With Hamburger Toggle) */}
      <div className="lg:hidden bg-slate-900 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40 border-b border-slate-800 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-sm tracking-tight">AirSkyGo</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Admin</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
            title="View Live Website"
          >
            <Eye className="w-4 h-4 text-sky-400" />
          </a>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* MOBILE BACKDROP OVERLAY */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs transition-opacity"
        />
      )}

      {/* LEFT SIDEBAR NAVIGATION */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-72 bg-slate-900 text-slate-300 flex flex-col z-50 border-r border-slate-800 transition-transform duration-200 ease-in-out shrink-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Top Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-base tracking-tight text-white">AirSkyGo</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  CMS
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">Master Admin Console</span>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Sections */}
        <div className="flex-1 overflow-y-auto p-3 space-y-5 scrollbar-thin">
          {navSections.map((sec, sIdx) => (
            <div key={sIdx}>
              <span className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">
                {sec.heading}
              </span>
              <div className="space-y-1">
                {sec.items.map(item => {
                  const Icon = item.icon;
                  const isAct = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                        isAct
                          ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30 font-black'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className={`w-4 h-4 shrink-0 ${isAct ? 'text-white' : 'text-slate-400'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {typeof item.count === 'number' && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          isAct ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Footer User Info & Live Link */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40 space-y-2">
          <div className="p-2.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-sky-600/30 text-sky-400 flex items-center justify-center font-bold text-xs shrink-0">
                AD
              </div>
              <div className="overflow-hidden">
                <span className="text-xs font-bold text-white block truncate">{adminUser?.name || 'Super Admin'}</span>
                <span className="text-[10px] text-slate-400 block truncate font-mono">{adminUser?.username || 'admin@airskygo.com'}</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-sky-400" />
            <span>View Live Website ↗</span>
          </a>
        </div>
      </aside>

      {/* RIGHT MAIN VIEWPORT */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Sticky Desktop Top Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-slate-400">Admin Console</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="font-extrabold text-slate-900 text-sm">
              {currentTabObj?.label || 'Overview'}
            </span>
            {typeof currentTabObj?.count === 'number' && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-700 font-mono">
                {currentTabObj.count} Total
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadDashboardData}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Reload live data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh Data</span>
            </button>

            {/* Quick 1-Click Theme Switcher in header */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <Palette className="w-3.5 h-3.5 text-slate-500 ml-1.5 hidden sm:inline" />
              {COLOR_THEMES.map(theme => {
                const isAct = (settingsForm.theme || 'sky') === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => handleQuickThemeChange(theme.id)}
                    className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                      isAct ? 'ring-2 ring-slate-900 shadow-xs scale-105' : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: theme.dotColor }}
                    title={`Theme: ${theme.name}`}
                  />
                );
              })}
            </div>
          </div>
        </header>

        {/* Feedback Alert Toast */}
        {alertMessage.text && (
          <div className="bg-emerald-600 text-white px-6 py-2.5 text-xs font-bold flex items-center justify-between shadow-md animate-fadeIn">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>{alertMessage.text}</span>
            </div>
            <button onClick={() => setAlertMessage({ text: '', type: 'success' })}>✕</button>
          </div>
        )}

        {/* Main Content Body Container */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 overflow-y-auto space-y-6 max-w-7xl w-full">
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Row 1: Key Financial & Booking Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <span className="text-xs font-bold text-slate-400 uppercase">Total Revenue</span>
                <div className="text-3xl font-black text-slate-900 font-mono mt-1">
                  ₹{(stats?.totalRevenue || 0).toLocaleString('en-IN')}
                </div>
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Real-time earnings</span>
                </span>
              </div>

              <div 
                onClick={() => setActiveTab('customers')}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-sky-500 cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase">Registered Customers</span>
                  <span className="text-sky-600 text-[10px] font-bold">View Tab →</span>
                </div>
                <div className="text-3xl font-black text-slate-900 font-mono mt-1">
                  {stats?.totalCustomers || customers.length}
                </div>
                <span className="text-[11px] text-sky-600 font-semibold mt-1 block">
                  Verified mobile & email accounts
                </span>
              </div>

              <div 
                onClick={() => setActiveTab('bookings')}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-sky-500 cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase">Flight Bookings</span>
                  <span className="text-sky-600 text-[10px] font-bold">View Tab →</span>
                </div>
                <div className="text-3xl font-black text-slate-900 font-mono mt-1">
                  {stats?.totalBookings || bookings.length}
                </div>
                <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
                  {stats?.confirmedCount || 0} Confirmed • {stats?.cancelledCount || 0} Cancelled
                </span>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <span className="text-xs font-bold text-slate-400 uppercase">Total Passengers</span>
                <div className="text-3xl font-black text-slate-900 font-mono mt-1">
                  {stats?.totalPassengers || 0}
                </div>
                <span className="text-[11px] text-purple-600 font-semibold mt-1 block">
                  Ticketed Travellers
                </span>
              </div>
            </div>

            {/* Row 2: Multi-Service Travel Ecosystem */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div 
                onClick={() => setActiveTab('hotel_bookings')}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-amber-400 cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
                  <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-amber-500" /> Hotels</span>
                  <span className="text-amber-600 text-[10px]">Manage →</span>
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono mt-1">
                  {hotelBookings.length}
                </div>
                <span className="text-[10px] text-slate-500 font-medium">Hotel guest reservations</span>
              </div>

              <div 
                onClick={() => setActiveTab('holiday_inquiries')}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-emerald-500 cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
                  <span className="flex items-center gap-1.5"><Compass className="w-3.5 h-3.5 text-emerald-500" /> Holidays</span>
                  <span className="text-emerald-600 text-[10px]">Manage →</span>
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono mt-1">
                  {holidayInquiries.length}
                </div>
                <span className="text-[10px] text-slate-500 font-medium">Tour package leads</span>
              </div>

              <div 
                onClick={() => setActiveTab('train_bookings')}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-rose-400 cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
                  <span className="flex items-center gap-1.5"><Train className="w-3.5 h-3.5 text-rose-500" /> Trains</span>
                  <span className="text-rose-600 text-[10px]">Manage →</span>
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono mt-1">
                  {trainBookings.length}
                </div>
                <span className="text-[10px] text-slate-500 font-medium">IRCTC train bookings</span>
              </div>

              <div 
                onClick={() => setActiveTab('visa_applications')}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-purple-500 cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
                  <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-purple-500" /> Visas</span>
                  <span className="text-purple-600 text-[10px]">Manage →</span>
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono mt-1">
                  {visaApplications.length}
                </div>
                <span className="text-[10px] text-slate-500 font-medium">Express visa filings</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <h4 className="font-extrabold text-slate-900 text-base mb-4">Revenue by Airline</h4>
                <div className="space-y-3">
                  {stats?.airlineRevenue && Object.entries(stats.airlineRevenue).map(([airline, rev]) => (
                    <div key={airline} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-slate-700">
                        <span>{airline}</span>
                        <span className="font-mono">₹{rev.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-sky-600 rounded-full"
                          style={{ width: `${Math.min(100, (rev / (stats.totalRevenue || 1)) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-extrabold text-slate-900 text-base">Recent Bookings Stream</h4>
                  <button onClick={() => setActiveTab('bookings')} className="text-xs font-bold text-sky-600">
                    View All →
                  </button>
                </div>
                <div className="space-y-3">
                  {bookings.slice(0, 5).map(b => (
                    <div key={b.pnr} className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="font-mono font-bold text-sky-800">{b.pnr}</div>
                        <div className="font-bold text-slate-800">{b.from} → {b.to} ({b.airline})</div>
                      </div>
                      <div className="text-right">
                        <div className="font-black font-mono text-slate-900">₹{b.fare?.total?.toLocaleString('en-IN')}</div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          b.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {b.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LEGACY WEBSITE CMS & GLOBAL SETTINGS */}
        {activeTab === 'legacy_settings' && (
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
              <div>
                <h4 className="text-xl font-black text-slate-900">Website Global Content Management (CMS)</h4>
                <p className="text-xs text-slate-500">Edit titles, banner announcements, fees, tax, and support info live.</p>
              </div>
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-extrabold text-xs flex items-center gap-2 shadow-md shadow-emerald-600/30 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save All Changes Live</span>
              </button>
            </div>

            {/* THEME SELECTOR SECTION (5 PRESETS) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-sky-500 via-emerald-500 to-amber-500 text-white flex items-center justify-center shadow-xs">
                    <Palette className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h5 className="text-base font-extrabold text-slate-900">1. Website 5 Color Theme Presets (1-Click Change)</h5>
                    <p className="text-xs text-slate-500">Select any theme below to instantly update button colors, gradients, highlights, and cards across the live website.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">Current Theme:</span>
                  <span className="text-xs font-mono font-extrabold bg-sky-50 text-sky-800 border border-sky-200 px-3 py-1 rounded-xl uppercase">
                    {settingsForm.theme || 'sky'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-2">
                {COLOR_THEMES.map((theme) => {
                  const isSelected = (settingsForm.theme || 'sky') === theme.id;
                  return (
                    <div
                      key={theme.id}
                      onClick={() => handleQuickThemeChange(theme.id)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between relative group ${
                        isSelected
                          ? 'border-sky-600 bg-sky-50/40 shadow-md ring-2 ring-sky-500/30'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-2.5 right-2.5 bg-sky-600 text-white rounded-full p-1 shadow-xs">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}

                      <div>
                        {/* 4 Swatch Palette Dots */}
                        <div className="flex items-center gap-1.5 mb-3">
                          {theme.colors.map((c, i) => (
                            <div
                              key={i}
                              className="w-4 h-4 rounded-full border border-black/10 shadow-xs"
                              style={{ backgroundColor: c }}
                              title={c}
                            ></div>
                          ))}
                        </div>

                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                          {theme.badge}
                        </span>
                        
                        <div className="text-sm font-black text-slate-900 mt-2">
                          {theme.name}
                        </div>
                        
                        <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                          {theme.desc}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickThemeChange(theme.id);
                        }}
                        className={`mt-4 w-full py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-sky-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Currently Active</span>
                          </>
                        ) : (
                          <span>Set As Active</span>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Brand & Support */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <h5 className="text-xs font-black text-slate-400 uppercase tracking-wider">2. Brand Identity & Contact</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Site Brand Name</label>
                  <input
                    type="text"
                    value={settingsForm.siteName || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, siteName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Site Tagline</label>
                  <input
                    type="text"
                    value={settingsForm.siteTagline || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, siteTagline: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Support Email</label>
                  <input
                    type="email"
                    value={settingsForm.supportEmail || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, supportEmail: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Support Phone</label>
                  <input
                    type="text"
                    value={settingsForm.supportPhone || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, supportPhone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Currency Symbol</label>
                  <input
                    type="text"
                    value={settingsForm.currency || '₹'}
                    onChange={(e) => setSettingsForm({ ...settingsForm, currency: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Fees & Tax Controls */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <h5 className="text-xs font-black text-slate-400 uppercase tracking-wider">3. Tax & Penalty Pricing Settings</h5>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">GST / Airport Tax Rate (%)</label>
                  <input
                    type="number"
                    value={settingsForm.gstPercent || 12}
                    onChange={(e) => setSettingsForm({ ...settingsForm, gstPercent: parseInt(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Flight Cancellation Fee (₹)</label>
                  <input
                    type="number"
                    value={settingsForm.cancellationFee || 999}
                    onChange={(e) => setSettingsForm({ ...settingsForm, cancellationFee: parseInt(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Travel Protection Insurance Fee (₹)</label>
                  <input
                    type="number"
                    value={settingsForm.insuranceFee || 199}
                    onChange={(e) => setSettingsForm({ ...settingsForm, insuranceFee: parseInt(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Announcement Ticker */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-black text-slate-400 uppercase tracking-wider">4. Top Header Announcement Ticker</h5>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={settingsForm.announcement?.enabled ?? true}
                    onChange={(e) => setSettingsForm({
                      ...settingsForm,
                      announcement: { ...settingsForm.announcement, enabled: e.target.checked }
                    })}
                    className="w-4 h-4 rounded text-sky-600"
                  />
                  <span>Show Announcement Ticker</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 text-xs">
                <div className="sm:col-span-9">
                  <label className="block font-bold text-slate-700 mb-1">Announcement Message</label>
                  <input
                    type="text"
                    value={settingsForm.announcement?.text || ''}
                    onChange={(e) => setSettingsForm({
                      ...settingsForm,
                      announcement: { ...settingsForm.announcement, text: e.target.value }
                    })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block font-bold text-slate-700 mb-1">Badge Text</label>
                  <input
                    type="text"
                    value={settingsForm.announcement?.badge || ''}
                    onChange={(e) => setSettingsForm({
                      ...settingsForm,
                      announcement: { ...settingsForm.announcement, badge: e.target.value }
                    })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Hero Banner Content */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <h5 className="text-xs font-black text-slate-400 uppercase tracking-wider">5. Hero Search Headline & Subtitle</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hero Title Prefix</label>
                  <input
                    type="text"
                    value={settingsForm.hero?.title || ''}
                    onChange={(e) => setSettingsForm({
                      ...settingsForm,
                      hero: { ...settingsForm.hero, title: e.target.value }
                    })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Brand Highlight Word</label>
                  <input
                    type="text"
                    value={settingsForm.hero?.brandHighlight || ''}
                    onChange={(e) => setSettingsForm({
                      ...settingsForm,
                      hero: { ...settingsForm.hero, brandHighlight: e.target.value }
                    })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-sky-700"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Hero Subtitle</label>
                  <textarea
                    rows={2}
                    value={settingsForm.hero?.subtitle || ''}
                    onChange={(e) => setSettingsForm({
                      ...settingsForm,
                      hero: { ...settingsForm.hero, subtitle: e.target.value }
                    })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-sm shadow-lg shadow-emerald-600/30 cursor-pointer"
            >
              Save All Settings Live
            </button>
          </form>
        )}

        {/* TAB 3: FLIGHTS & PRICES */}
        {activeTab === 'flights' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h4 className="text-xl font-black text-slate-900">Flight Routes, Prices & Status</h4>
                <p className="text-xs text-slate-500">Edit flight base prices, departure times, and delay statuses live.</p>
              </div>
              <button
                onClick={() => setShowAddFlightModal(true)}
                className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Add New Flight</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                    <tr>
                      <th className="p-3.5">Flight #</th>
                      <th className="p-3.5">Airline</th>
                      <th className="p-3.5">Route</th>
                      <th className="p-3.5">Timings</th>
                      <th className="p-3.5">Base Fare (₹)</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {flights.map(f => (
                      <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3.5">
                          <AirlineBadge code={f.airlineCode} name={f.airline} size="sm" />
                        </td>
                        <td className="p-3.5 font-bold text-slate-800">
                          {f.from} → {f.to}
                          <span className="text-[10px] text-slate-400 block font-normal">{f.duration}</span>
                        </td>
                        <td className="p-3.5 font-mono font-bold text-slate-800">{f.departureTime} - {f.arrivalTime}</td>
                        <td className="p-3.5 font-mono font-black text-slate-900 text-sm">₹{f.basePrice?.toLocaleString('en-IN')}</td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {f.status || 'On-Time'}
                          </span>
                        </td>
                        <td className="p-3.5 text-right space-x-1">
                          <button
                            onClick={() => setEditingFlight(f)}
                            className="p-1.5 rounded-lg text-sky-600 hover:bg-sky-50 border border-sky-200 transition-colors cursor-pointer"
                            title="Edit Flight & Price"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteFlight(f.id)}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
                            title="Delete Flight"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: HOLIDAY PACKAGES (CATALOG CMS) */}
        {activeTab === 'holidays_catalog' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h4 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Palmtree className="w-5 h-5 text-emerald-600" />
                  Holiday Packages & Tour Catalog
                </h4>
                <p className="text-xs text-slate-500">
                  Live tour packages shown on the website. Control active/inactive status, prices, and itineraries in one click.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search title, destination, ID..."
                    value={holidayCatalogSearch}
                    onChange={(e) => setHolidayCatalogSearch(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <button
                  onClick={handleOpenAddHoliday}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-95 whitespace-nowrap"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Add New Package</span>
                </button>
              </div>
            </div>

            {/* Status Filter Chips */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">Filter:</span>
              {[
                { id: 'all', label: `All Packages (${holidayPackages.length})` },
                { id: 'active', label: `Live / Active (${holidayPackages.filter(p => p.active !== false).length})` },
                { id: 'inactive', label: `Deactivated / Hidden (${holidayPackages.filter(p => p.active === false).length})` }
              ].map(chip => (
                <button
                  key={chip.id}
                  onClick={() => setCatalogStatusFilter(chip.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    catalogStatusFilter === chip.id
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Packages Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                    <tr>
                      <th className="p-3.5">Tour Package</th>
                      <th className="p-3.5">Destination & Duration</th>
                      <th className="p-3.5">Price / Person</th>
                      <th className="p-3.5">Features & Badge</th>
                      <th className="p-3.5 text-center">Status (Live / Hidden)</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredHolidaysCatalog.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="p-8 text-center text-slate-400">
                          No holiday packages found matching your criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredHolidaysCatalog.map(pkg => {
                        const isActive = pkg.active !== false;
                        return (
                          <tr key={pkg.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-3.5">
                              <div className="flex items-center gap-3">
                                <img
                                  src={pkg.image}
                                  alt={pkg.title}
                                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                                />
                                <div>
                                  <div className="font-extrabold text-slate-900 line-clamp-1">{pkg.title}</div>
                                  <div className="font-mono text-[10px] text-emerald-700 font-bold">{pkg.id}</div>
                                </div>
                              </div>
                            </td>
                            <td className="p-3.5">
                              <div className="font-bold text-slate-800 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                                <span>{pkg.destination}</span>
                              </div>
                              <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                                <span>{pkg.duration}</span>
                              </div>
                            </td>
                            <td className="p-3.5">
                              <div className="font-mono font-black text-slate-900 text-sm">
                                ₹{pkg.price?.toLocaleString('en-IN')}
                              </div>
                              {pkg.originalPrice && (
                                <span className="text-[10px] text-slate-400 line-through">
                                  ₹{pkg.originalPrice?.toLocaleString('en-IN')}
                                </span>
                              )}
                            </td>
                            <td className="p-3.5">
                              <div className="flex flex-wrap gap-1">
                                {pkg.badge && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                                    {pkg.badge}
                                  </span>
                                )}
                                {pkg.flightsIncluded && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800">
                                    ✈️ Flights Incl.
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-3.5 text-center">
                              <button
                                type="button"
                                onClick={() => handleToggleHoliday(pkg.id)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-all shadow-2xs ${
                                  isActive
                                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                                    : 'bg-slate-200 text-slate-600 hover:bg-slate-300 border border-slate-300'
                                }`}
                                title="Click to toggle Active / Deactive"
                              >
                                <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                                <span>{isActive ? 'Active (Live)' : 'Deactivated'}</span>
                              </button>
                            </td>
                            <td className="p-3.5 text-right space-x-1 whitespace-nowrap">
                              <button
                                onClick={() => handleOpenEditHoliday(pkg)}
                                className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 border border-emerald-200 transition-colors cursor-pointer"
                                title="Edit Package"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteHoliday(pkg.id)}
                                className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
                                title="Delete Package"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: COUPONS */}
        {activeTab === 'coupons' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h4 className="text-xl font-black text-slate-900">Discount Coupons & Offers</h4>
                <p className="text-xs text-slate-500">Manage instant promo codes for checkout discount.</p>
              </div>
              <button
                onClick={() => {
                  setEditingCoupon(null);
                  setShowAddCouponModal(true);
                }}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Add Coupon</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {coupons.map(c => (
                <div key={c.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs relative space-y-2">
                  <div className="absolute top-3 right-3 flex items-center gap-1">
                    <button
                      onClick={() => handleStartEditCoupon(c)}
                      className="text-slate-400 hover:text-sky-600 p-1.5 rounded-lg hover:bg-sky-50 transition-colors cursor-pointer"
                      title="Edit Coupon"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCoupon(c.id)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete Coupon"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="inline-block px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-300 rounded-lg text-xs font-mono font-black tracking-wider">
                    {c.code}
                  </div>
                  <div className="text-base font-black text-slate-900">
                    {c.type === 'percent' ? `${c.discount}% OFF` : `₹${c.discount} OFF`}
                  </div>
                  <p className="text-xs text-slate-500">{c.description || 'Special promo'}</p>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Min amount: ₹{c.minAmount || 0}
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${
                      c.status === 'Inactive' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {c.status || 'Active'}
                    </span>
                    {c.showOnSearch ? (
                      <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800 border border-sky-300">
                        ✈️ Flight Search Display
                      </span>
                    ) : (
                      <span className="inline-block text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        Reviews Only
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: AIRPORTS */}
        {activeTab === 'airports' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h4 className="text-xl font-black text-slate-900">Airports & Travel Hubs</h4>
                <p className="text-xs text-slate-500">Add or remove destination hubs and IATA codes.</p>
              </div>
              <button
                onClick={() => setShowAddAirportModal(true)}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Add Airport</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {airports.map(a => (
                <div key={a.code} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black font-mono text-sky-600">{a.code}</span>
                      <span className="font-extrabold text-slate-900 text-sm">{a.city}</span>
                    </div>
                    <p className="text-xs text-slate-500 truncate max-w-[200px]">{a.name}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteAirport(a.code)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                    title="Delete Airport"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: BOOKINGS */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h4 className="text-xl font-black text-slate-900">Passenger Reservations & PNR Control</h4>
                <p className="text-xs text-slate-500">Live booking modifications, seat statuses, and refunds.</p>
              </div>
              <div className="relative w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search PNR, email, passenger..."
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                    <tr>
                      <th className="p-3.5">PNR #</th>
                      <th className="p-3.5">Flight</th>
                      <th className="p-3.5">Route</th>
                      <th className="p-3.5">Passenger(s)</th>
                      <th className="p-3.5">Total & Payment</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredBookings.map(b => (
                      <tr key={b.pnr} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3.5 font-mono font-black text-sky-800">{b.pnr}</td>
                        <td className="p-3.5 font-bold text-slate-900">{b.airline} ({b.flightNumber})</td>
                        <td className="p-3.5 font-bold text-slate-800">{b.from} → {b.to}</td>
                        <td className="p-3.5">
                          {b.passengers?.map((p, i) => (
                            <div key={i} className="font-semibold text-slate-800">
                              {p.firstName} {p.lastName} <span className="font-mono text-sky-700">({p.seat || 'No seat'})</span>
                            </div>
                          ))}
                        </td>
                        <td className="p-3.5 font-mono">
                          <div className="font-black text-slate-900">₹{b.fare?.total?.toLocaleString('en-IN')}</div>
                          <div className="text-[10px] text-slate-500 font-sans mt-0.5">
                            {b.payment?.method || 'UPI'} • {b.payment?.status || 'Paid'}
                          </div>
                          {b.payment?.utrNumber && (
                            <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-mono font-bold">
                              <span>UTR: {b.payment.utrNumber}</span>
                            </div>
                          )}
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide inline-block ${
                            b.status === 'CONFIRMED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : b.status === 'VERIFICATION_PENDING'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : (b.status === 'PENDING' || !b.status)
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {b.status === 'VERIFICATION_PENDING' ? '⏳ Verification' : (b.status || 'PENDING')}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="inline-flex items-center gap-1.5 justify-end">
                            {/* 1. View / Eye button */}
                            <button
                              type="button"
                              title="View Booking Details"
                              onClick={() => setViewingBooking(b)}
                              className="w-7 h-7 rounded border border-blue-400 text-blue-600 hover:bg-blue-50 flex items-center justify-center cursor-pointer transition-colors shadow-2xs"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* 2. Check / Confirm button */}
                            <button
                              type="button"
                              title="Approve / Confirm Booking"
                              onClick={() => handleUpdateBookingStatus(b.pnr, 'CONFIRMED')}
                              className="w-7 h-7 rounded border border-emerald-500 text-emerald-600 hover:bg-emerald-50 flex items-center justify-center cursor-pointer transition-colors shadow-2xs"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>

                            {/* 3. Cross / Cancel button */}
                            <button
                              type="button"
                              title="Cancel Booking"
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to cancel booking ${b.pnr}?`)) {
                                  handleUpdateBookingStatus(b.pnr, 'CANCELLED');
                                }
                              }}
                              className="w-7 h-7 rounded border border-rose-400 text-rose-600 hover:bg-rose-50 flex items-center justify-center cursor-pointer transition-colors shadow-2xs"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>

                            {/* 4. Trash / Delete button */}
                            <button
                              type="button"
                              title="Delete Booking"
                              onClick={() => handleDeleteBooking(b.pnr)}
                              className="w-7 h-7 rounded border border-rose-400 text-rose-600 hover:bg-rose-50 flex items-center justify-center cursor-pointer transition-colors shadow-2xs"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: REGISTERED CUSTOMERS */}
        {activeTab === 'customers' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h4 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-sky-600" />
                  Registered Customers & Accounts
                </h4>
                <p className="text-xs text-slate-500">
                  Real customers who logged in or booked flights/hotels. Manage member tier and records.
                </p>
              </div>
              <div className="relative w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by name, phone, or email..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-3.5">User ID</th>
                      <th className="p-3.5">Customer Name</th>
                      <th className="p-3.5">Contact Details</th>
                      <th className="p-3.5">Tier & Points</th>
                      <th className="p-3.5 text-center">Bookings</th>
                      <th className="p-3.5">Registered</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredCustomers.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="p-8 text-center text-slate-400">
                          No customers found matching "{customerSearch}".
                        </td>
                      </tr>
                    ) : (
                      filteredCustomers.map(c => {
                        const cleanPhone = (c.phone || '').replace(/\D/g, '').slice(-10);
                        return (
                          <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-3.5 font-mono font-bold text-sky-700">
                              {c.id}
                            </td>
                            <td className="p-3.5 font-bold text-slate-900">
                              {c.name || 'Valued Customer'}
                            </td>
                            <td className="p-3.5 space-y-0.5">
                              {c.phone && (
                                <div className="flex items-center gap-1.5 font-mono text-slate-700">
                                  <Phone className="w-3 h-3 text-slate-400" />
                                  <span>{c.phone}</span>
                                  {cleanPhone && (
                                    <a
                                      href={`https://wa.me/91${cleanPhone}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      title="Chat on WhatsApp"
                                      className="text-emerald-600 hover:text-emerald-700 ml-1"
                                    >
                                      <MessageCircle className="w-3.5 h-3.5" />
                                    </a>
                                  )}
                                </div>
                              )}
                              {c.email && (
                                <div className="flex items-center gap-1.5 text-slate-500">
                                  <Mail className="w-3 h-3 text-slate-400" />
                                  <span>{c.email}</span>
                                </div>
                              )}
                            </td>
                            <td className="p-3.5">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">
                                {c.tier || 'Member'}
                              </span>
                              <span className="ml-1 text-[10px] text-amber-600 font-mono font-bold">
                                🪙 {c.points || 500} pts
                              </span>
                            </td>
                            <td className="p-3.5 text-center font-bold text-slate-900">
                              <span className="px-2 py-0.5 rounded bg-slate-100 font-mono">
                                {c.bookingsCount || 0}
                              </span>
                            </td>
                            <td className="p-3.5 text-slate-500 text-[11px]">
                              {c.registeredAt ? new Date(c.registeredAt).toLocaleDateString('en-IN') : 'Recent'}
                            </td>
                            <td className="p-3.5 text-right">
                              <button
                                onClick={() => handleDeleteCustomer(c.id, c.name)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                                title="Delete Customer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: HOTEL BOOKINGS */}
        {activeTab === 'hotel_bookings' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h4 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-amber-500" />
                  Hotel Reservations & Guest Stays
                </h4>
                <p className="text-xs text-slate-500">
                  Live hotel room bookings across Mumbai, Goa, Delhi, Jaipur & Maldives.
                </p>
              </div>
              <div className="relative w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search guest, hotel, or phone..."
                  value={hotelSearch}
                  onChange={(e) => setHotelSearch(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-3.5">Booking ID</th>
                      <th className="p-3.5">Guest Name & Contact</th>
                      <th className="p-3.5">Hotel & City</th>
                      <th className="p-3.5">Room & Dates</th>
                      <th className="p-3.5">Total Amount</th>
                      <th className="p-3.5 text-center">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredHotels.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="p-8 text-center text-slate-400">
                          No hotel reservations found.
                        </td>
                      </tr>
                    ) : (
                      filteredHotels.map(h => {
                        const cleanPhone = (h.customerPhone || '').replace(/\D/g, '').slice(-10);
                        return (
                          <tr key={h.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-3.5 font-mono font-bold text-amber-700">
                              {h.id}
                            </td>
                            <td className="p-3.5">
                              <div className="font-bold text-slate-900">{h.guestName}</div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                                <span>{h.customerPhone}</span>
                                {cleanPhone && (
                                  <a
                                    href={`https://wa.me/91${cleanPhone}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-emerald-600 hover:text-emerald-700"
                                  >
                                    <MessageCircle className="w-3.5 h-3.5" />
                                  </a>
                                )}
                              </div>
                            </td>
                            <td className="p-3.5">
                              <div className="font-bold text-slate-800">{h.hotelName}</div>
                              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {h.city}
                              </div>
                            </td>
                            <td className="p-3.5">
                              <div className="font-bold text-slate-700">{h.roomType} • {h.nights} Nights</div>
                              <div className="text-[11px] text-slate-400">
                                Check-in: {h.checkIn} | {h.guests} Guests
                              </div>
                            </td>
                            <td className="p-3.5 font-black font-mono text-slate-900">
                              ₹{(h.totalAmount || 0).toLocaleString('en-IN')}
                            </td>
                            <td className="p-3.5 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                h.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' :
                                h.status === 'COMPLETED' ? 'bg-sky-100 text-sky-800' :
                                'bg-rose-100 text-rose-800'
                              }`}>
                                {h.status || 'CONFIRMED'}
                              </span>
                            </td>
                            <td className="p-3.5 text-right">
                              <select
                                value={h.status || 'CONFIRMED'}
                                onChange={(e) => handleUpdateHotelStatus(h.id, e.target.value)}
                                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-700 cursor-pointer"
                              >
                                <option value="CONFIRMED">CONFIRMED</option>
                                <option value="COMPLETED">COMPLETED</option>
                                <option value="CANCELLED">CANCELLED</option>
                              </select>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: HOLIDAY INQUIRIES */}
        {activeTab === 'holiday_inquiries' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h4 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-emerald-600" />
                  Holiday Tour Inquiries & Leads
                </h4>
                <p className="text-xs text-slate-500">
                  Direct traveler requests for holiday packages (Kashmir, Goa, Kerala, Dubai, etc.).
                </p>
              </div>
              <div className="relative w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search traveler, package, phone..."
                  value={holidaySearch}
                  onChange={(e) => setHolidaySearch(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-3.5">Lead ID</th>
                      <th className="p-3.5">Traveler Name</th>
                      <th className="p-3.5">WhatsApp / Phone</th>
                      <th className="p-3.5">Package & Destination</th>
                      <th className="p-3.5">Duration & Pax</th>
                      <th className="p-3.5">Est. Price</th>
                      <th className="p-3.5 text-center">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredHolidays.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="p-8 text-center text-slate-400">
                          No holiday package inquiries yet.
                        </td>
                      </tr>
                    ) : (
                      filteredHolidays.map(hi => {
                        const cleanPhone = (hi.phone || '').replace(/\D/g, '').slice(-10);
                        return (
                          <tr key={hi.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-3.5 font-mono font-bold text-emerald-700">
                              {hi.id}
                            </td>
                            <td className="p-3.5 font-bold text-slate-900">
                              {hi.travelerName}
                            </td>
                            <td className="p-3.5">
                              <div className="flex items-center gap-1.5 font-mono text-slate-700">
                                <span>{hi.phone}</span>
                                {cleanPhone && (
                                  <a
                                    href={`https://wa.me/91${cleanPhone}?text=Hello%20${encodeURIComponent(hi.travelerName)},%20regarding%20your%20holiday%20booking%20for%20${encodeURIComponent(hi.packageTitle)}...`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold hover:bg-emerald-200"
                                  >
                                    <MessageCircle className="w-3 h-3" /> WhatsApp
                                  </a>
                                )}
                              </div>
                            </td>
                            <td className="p-3.5">
                              <div className="font-bold text-slate-800">{hi.packageTitle}</div>
                              <div className="text-[11px] text-slate-400">{hi.destination}</div>
                            </td>
                            <td className="p-3.5">
                              <div className="font-bold text-slate-700">{hi.duration}</div>
                              <div className="text-[11px] text-slate-400">{hi.travelers} Travelers</div>
                            </td>
                            <td className="p-3.5 font-black font-mono text-slate-900">
                              ₹{(hi.price || 0).toLocaleString('en-IN')}
                            </td>
                            <td className="p-3.5 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                hi.status === 'NEW' ? 'bg-amber-100 text-amber-800' :
                                hi.status === 'CONTACTED' ? 'bg-sky-100 text-sky-800' :
                                hi.status === 'BOOKED' ? 'bg-emerald-100 text-emerald-800' :
                                'bg-slate-100 text-slate-700'
                              }`}>
                                {hi.status || 'NEW'}
                              </span>
                            </td>
                            <td className="p-3.5 text-right">
                              <select
                                value={hi.status || 'NEW'}
                                onChange={(e) => handleUpdateHolidayStatus(hi.id, e.target.value)}
                                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-700 cursor-pointer"
                              >
                                <option value="NEW">NEW</option>
                                <option value="CONTACTED">CONTACTED</option>
                                <option value="BOOKED">BOOKED</option>
                                <option value="CLOSED">CLOSED</option>
                              </select>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: TRAIN BOOKINGS */}
        {activeTab === 'train_bookings' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h4 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <Train className="w-5 h-5 text-rose-500" />
                  IRCTC Train Bookings
                </h4>
                <p className="text-xs text-slate-500">
                  Live train ticket reservations (Vande Bharat, Rajdhani, Shatabdi).
                </p>
              </div>
              <div className="relative w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search train, passenger, PNR..."
                  value={trainSearch}
                  onChange={(e) => setTrainSearch(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-3.5">Train PNR</th>
                      <th className="p-3.5">Passenger Name</th>
                      <th className="p-3.5">Train Details</th>
                      <th className="p-3.5">Route</th>
                      <th className="p-3.5">Travel Class</th>
                      <th className="p-3.5">Total Fare</th>
                      <th className="p-3.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredTrains.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="p-8 text-center text-slate-400">
                          No train bookings recorded yet.
                        </td>
                      </tr>
                    ) : (
                      filteredTrains.map(t => (
                        <tr key={t.pnr} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3.5 font-mono font-bold text-rose-700">
                            {t.pnr}
                          </td>
                          <td className="p-3.5">
                            <div className="font-bold text-slate-900">{t.passengerName}</div>
                            <div className="text-[11px] text-slate-400">{t.phone}</div>
                          </td>
                          <td className="p-3.5">
                            <div className="font-bold text-slate-800">{t.trainName}</div>
                            <div className="text-[11px] font-mono text-slate-400">{t.trainNumber}</div>
                          </td>
                          <td className="p-3.5">
                            <div className="font-bold text-slate-700">{t.from} → {t.to}</div>
                            <div className="text-[11px] text-slate-400">{t.departureDate}</div>
                          </td>
                          <td className="p-3.5">
                            <span className="px-2 py-0.5 rounded bg-slate-100 font-mono font-bold text-slate-800">
                              {t.selectedClass}
                            </span>
                          </td>
                          <td className="p-3.5 font-black font-mono text-slate-900">
                            ₹{(t.fare || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="p-3.5 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              {t.status || 'CONFIRMED'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: VISA APPLICATIONS */}
        {activeTab === 'visa_applications' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h4 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-purple-600" />
                  International Visa Applications
                </h4>
                <p className="text-xs text-slate-500">
                  Tourist & business visa applications, passport details, and approval workflow.
                </p>
              </div>
              <div className="relative w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search applicant, passport, country..."
                  value={visaSearch}
                  onChange={(e) => setVisaSearch(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-3.5">Application ID</th>
                      <th className="p-3.5">Applicant Name</th>
                      <th className="p-3.5">Passport Number</th>
                      <th className="p-3.5">Country & Visa Type</th>
                      <th className="p-3.5">Contact (WhatsApp)</th>
                      <th className="p-3.5">Fee</th>
                      <th className="p-3.5 text-center">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredVisas.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="p-8 text-center text-slate-400">
                          No visa applications submitted yet.
                        </td>
                      </tr>
                    ) : (
                      filteredVisas.map(v => {
                        const visaId = v.applicationId || v.id;
                        const cleanPhone = (v.phone || '').replace(/\D/g, '').slice(-10);
                        return (
                          <tr key={visaId} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-3.5 font-mono font-bold text-purple-700">
                              {visaId}
                            </td>
                            <td className="p-3.5 font-bold text-slate-900">
                              {v.applicantName}
                            </td>
                            <td className="p-3.5 font-mono font-bold text-slate-700 uppercase">
                              {v.passportNumber}
                            </td>
                            <td className="p-3.5">
                              <div className="font-bold text-slate-800">{v.country}</div>
                              <div className="text-[11px] text-purple-600 font-semibold">{v.visaType}</div>
                            </td>
                            <td className="p-3.5">
                              <div className="flex items-center gap-1.5 font-mono text-slate-700">
                                <span>{v.phone}</span>
                                {cleanPhone && (
                                  <a
                                    href={`https://wa.me/91${cleanPhone}?text=Hello%20${encodeURIComponent(v.applicantName)},%20update%20on%20your%20${encodeURIComponent(v.country)}%20visa...`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-emerald-600 hover:text-emerald-700"
                                    title="WhatsApp"
                                  >
                                    <MessageCircle className="w-3.5 h-3.5" />
                                  </a>
                                )}
                              </div>
                            </td>
                            <td className="p-3.5 font-black font-mono text-slate-900">
                              ₹{(v.fee || 0).toLocaleString('en-IN')}
                            </td>
                            <td className="p-3.5 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                v.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                                v.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' :
                                v.status === 'EMBASSY_SUBMITTED' ? 'bg-indigo-100 text-indigo-800' :
                                'bg-amber-100 text-amber-800'
                              }`}>
                                {v.status || 'UNDER_REVIEW'}
                              </span>
                            </td>
                            <td className="p-3.5 text-right">
                              <select
                                value={v.status || 'UNDER_REVIEW'}
                                onChange={(e) => handleUpdateVisaStatus(visaId, e.target.value)}
                                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-700 cursor-pointer"
                              >
                                <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                                <option value="DOCUMENTS_VERIFIED">DOCUMENTS_VERIFIED</option>
                                <option value="EMBASSY_SUBMITTED">EMBASSY_SUBMITTED</option>
                                <option value="APPROVED">APPROVED</option>
                                <option value="REJECTED">REJECTED</option>
                              </select>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: SECURITY & CHANGE ID / PASSWORD */}
        {activeTab === 'security' && (
          <div className="max-w-3xl space-y-6">
            
            {/* Top Security Overview Status */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Cloud Vault</div>
                  <div className="text-xs font-black text-slate-900">AES-256-GCM Encrypted</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Session Protection</div>
                  <div className="text-xs font-black text-slate-900">HMAC-SHA256 Token</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Brute Force Guard</div>
                  <div className="text-xs font-black text-slate-900">5-Try Lockout Active</div>
                </div>
              </div>
            </div>

            {/* Credentials Management Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div>
                <div className="flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-sky-600" />
                  <h4 className="text-xl font-black text-slate-900">Admin Security & Credentials</h4>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Yahan se aap apna Admin ID / Email aur Password change kar sakte hain. Changes cloud vault me real-time encrypt ho jaate hain.
                </p>
              </div>

              <form onSubmit={handleChangeCredentials} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Current Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Enter current password to authorize change"
                    value={credForm.currentPassword}
                    onChange={(e) => setCredForm({ ...credForm, currentPassword: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-mono font-bold focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">New Admin ID / Email</label>
                    <input
                      type="text"
                      placeholder="e.g. myadmin@airskygo.com"
                      value={credForm.newUsername}
                      onChange={(e) => setCredForm({ ...credForm, newUsername: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">New Password (Min 8 Characters)</label>
                    <input
                      type="password"
                      placeholder="Enter strong new password"
                      value={credForm.newPassword}
                      onChange={(e) => setCredForm({ ...credForm, newPassword: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-mono font-bold focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                    />
                    {credForm.newPassword && (
                      <div className="mt-2 space-y-1">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span>Password Strength:</span>
                          <span className={credForm.newPassword.length >= 8 ? (/[0-9]/.test(credForm.newPassword) && /[^A-Za-z0-9]/.test(credForm.newPassword) ? 'text-emerald-600' : 'text-amber-600') : 'text-rose-500'}>
                            {credForm.newPassword.length < 8 ? 'Too Short (Min 8)' : (/[0-9]/.test(credForm.newPassword) && /[^A-Za-z0-9]/.test(credForm.newPassword) ? 'Strong Password' : 'Medium (Add numbers & symbols)')}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              credForm.newPassword.length < 8
                                ? 'w-1/4 bg-rose-500'
                                : /[0-9]/.test(credForm.newPassword) && /[^A-Za-z0-9]/.test(credForm.newPassword)
                                ? 'w-full bg-emerald-500'
                                : 'w-2/3 bg-amber-500'
                            }`}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Admin Display Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Master Administrator"
                    value={credForm.newName}
                    onChange={(e) => setCredForm({ ...credForm, newName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save & Encrypt New Credentials</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="px-4 py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Logout This Device</span>
                  </button>
                </div>
              </form>

              {/* CENTRAL DATABASE DB.JSON BACKUP CARD */}
              <div className="pt-6 border-t border-slate-100">
                <div className="p-5 rounded-2xl bg-sky-50/80 border border-sky-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Database className="w-5 h-5 text-sky-600" />
                      <h5 className="font-extrabold text-slate-900 text-sm">Unified Master Database (db.json)</h5>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1">
                      Full system database protected by your active admin session token. Only authenticated administrators can access or download this export.
                    </p>
                  </div>
                  <a
                    href={`/api/db?admin_token=${localStorage.getItem('asg_admin_token') || ''}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all whitespace-nowrap self-start sm:self-auto cursor-pointer"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    <span>View / Export db.json</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: UNIFIED BRAND & WEBSITE CRM */}
        {(activeTab === 'brand_crm' || activeTab === 'brand' || activeTab === 'settings') && (
          <AdminBrandCmsSettings />
        )}

        {/* TAB: SERVICE TABS (ON / OFF) */}
        {(activeTab === 'services_modules' || activeTab === 'service_modules') && (
          <AdminBrandCmsSettings initialSection="sec-services" />
        )}

        {/* TAB: FOOTER & CONTACT DETAILS CMS */}
        {activeTab === 'footer_crm' && (
          <AdminBrandCmsSettings initialSection="sec-footer" />
        )}

        {/* TAB: PAYMENTS & UPI GATEWAY */}
        {activeTab === 'payments_upi' && (
          <AdminPaymentsUpi />
        )}

        {/* TAB: API KEYS & PAYMENT SETTINGS (AIRSKYINDIA STYLE + ADVANCED ENGINES) */}
        {(activeTab === 'api_settings' || activeTab === 'apis') && (
          <AdminApiSettings onNavigateTab={(tab) => setActiveTab(tab)} />
        )}


      </main>
      </div>

      {/* MODAL: EDIT FLIGHT */}
      {editingFlight && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-slate-200 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h4 className="font-extrabold text-slate-900 text-base">
                Edit Flight & Price • {editingFlight.flightNumber}
              </h4>
              <button onClick={() => setEditingFlight(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateFlightSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Base Price (₹) *</label>
                  <input
                    type="number"
                    value={editingFlight.basePrice}
                    onChange={(e) => setEditingFlight({ ...editingFlight, basePrice: parseInt(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-sm text-sky-700"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Live Status</label>
                  <select
                    value={editingFlight.status || 'On-Time'}
                    onChange={(e) => setEditingFlight({ ...editingFlight, status: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold"
                  >
                    <option value="On-Time">On-Time</option>
                    <option value="Boarding">Boarding</option>
                    <option value="Delayed (20m)">Delayed (20m)</option>
                    <option value="Delayed (45m)">Delayed (45m)</option>
                    <option value="Landed">Landed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Departure Time</label>
                  <input
                    type="time"
                    value={editingFlight.departureTime}
                    onChange={(e) => setEditingFlight({ ...editingFlight, departureTime: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Arrival Time</label>
                  <input
                    type="time"
                    value={editingFlight.arrivalTime}
                    onChange={(e) => setEditingFlight({ ...editingFlight, arrivalTime: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-3 bg-sky-600 hover:bg-sky-500 text-white font-extrabold rounded-xl text-xs shadow-md cursor-pointer"
              >
                Save Flight Changes Live
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD FLIGHT */}
      {showAddFlightModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-slate-200 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h4 className="font-extrabold text-slate-900 text-base">Add New Scheduled Flight Route</h4>
              <button onClick={() => setShowAddFlightModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddFlightSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Flight Number *</label>
                  <input
                    type="text"
                    placeholder="e.g. 6E-9042"
                    value={newFlight.flightNumber}
                    onChange={(e) => setNewFlight({ ...newFlight, flightNumber: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Airline *</label>
                  <select
                    value={newFlight.airline}
                    onChange={(e) => {
                      const codeMap = { 'IndiGo': '6E', 'Air India': 'AI', 'Vistara': 'UK', 'Akasa Air': 'QP', 'SpiceJet': 'SG', 'Emirates': 'EK' };
                      setNewFlight({ ...newFlight, airline: e.target.value, airlineCode: codeMap[e.target.value] || '6E' });
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold"
                  >
                    <option>IndiGo</option>
                    <option>Air India</option>
                    <option>Vistara</option>
                    <option>Akasa Air</option>
                    <option>SpiceJet</option>
                    <option>Emirates</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Origin Airport</label>
                  <select
                    value={newFlight.from}
                    onChange={(e) => setNewFlight({ ...newFlight, from: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold font-mono"
                  >
                    {airports.map(a => (
                      <option key={a.code} value={a.code}>{a.city} ({a.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Destination Airport</label>
                  <select
                    value={newFlight.to}
                    onChange={(e) => setNewFlight({ ...newFlight, to: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold font-mono"
                  >
                    {airports.map(a => (
                      <option key={a.code} value={a.code}>{a.city} ({a.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Departure Time</label>
                  <input
                    type="time"
                    value={newFlight.departureTime}
                    onChange={(e) => setNewFlight({ ...newFlight, departureTime: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Arrival Time</label>
                  <input
                    type="time"
                    value={newFlight.arrivalTime}
                    onChange={(e) => setNewFlight({ ...newFlight, arrivalTime: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Base Fare (₹) *</label>
                  <input
                    type="number"
                    value={newFlight.basePrice}
                    onChange={(e) => setNewFlight({ ...newFlight, basePrice: parseInt(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Aircraft</label>
                  <input
                    type="text"
                    value={newFlight.aircraft}
                    onChange={(e) => setNewFlight({ ...newFlight, aircraft: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-3 bg-sky-600 hover:bg-sky-500 text-white font-extrabold rounded-xl text-xs shadow-md cursor-pointer"
              >
                Publish New Flight Route
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT COUPON */}
      {showAddCouponModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-200 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h4 className="font-extrabold text-slate-900 text-base">
                  {editingCoupon ? 'Edit Discount Coupon' : 'Create Discount Coupon'}
                </h4>
                {editingCoupon && (
                  <span className="text-[10px] text-sky-600 font-mono font-bold">ID: {editingCoupon.id}</span>
                )}
              </div>
              <button 
                onClick={() => {
                  setShowAddCouponModal(false);
                  setEditingCoupon(null);
                }} 
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCouponSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-500 mb-1">Coupon Code *</label>
                <input
                  type="text"
                  placeholder="e.g. FLYMORE"
                  value={editingCoupon ? editingCoupon.code : newCoupon.code}
                  onChange={(e) => {
                    const code = e.target.value.toUpperCase();
                    if (editingCoupon) setEditingCoupon({ ...editingCoupon, code });
                    else setNewCoupon({ ...newCoupon, code });
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold uppercase"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Type</label>
                  <select
                    value={editingCoupon ? editingCoupon.type : newCoupon.type}
                    onChange={(e) => {
                      const nextType = e.target.value;
                      if (editingCoupon) {
                        const curVal = editingCoupon.discount || 0;
                        const adjustedDiscount = nextType === 'percent' ? (curVal > 100 ? 10 : (curVal || 10)) : (curVal < 50 ? 500 : curVal);
                        setEditingCoupon({
                          ...editingCoupon,
                          type: nextType,
                          discount: adjustedDiscount,
                          minAmount: nextType === 'percent' ? 0 : (editingCoupon.minAmount || 3000)
                        });
                      } else {
                        const curVal = newCoupon.discount || 0;
                        const adjustedDiscount = nextType === 'percent' ? (curVal > 100 ? 10 : (curVal || 10)) : (curVal < 50 ? 500 : curVal);
                        setNewCoupon({
                          ...newCoupon,
                          type: nextType,
                          discount: adjustedDiscount,
                          minAmount: nextType === 'percent' ? 0 : 3000
                        });
                      }
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold"
                  >
                    <option value="flat">Flat Amount (₹)</option>
                    <option value="percent">Percentage (%)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">
                    {(editingCoupon ? editingCoupon.type : newCoupon.type) === 'percent' ? 'Discount Percentage (%) *' : 'Discount Amount (₹) *'}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max={(editingCoupon ? editingCoupon.type : newCoupon.type) === 'percent' ? "100" : undefined}
                      placeholder={(editingCoupon ? editingCoupon.type : newCoupon.type) === 'percent' ? "e.g. 10 (for 10%)" : "e.g. 500"}
                      value={editingCoupon ? editingCoupon.discount : newCoupon.discount}
                      onChange={(e) => {
                        let discount = parseInt(e.target.value) || 0;
                        if ((editingCoupon ? editingCoupon.type : newCoupon.type) === 'percent' && discount > 100) discount = 100;
                        if (editingCoupon) setEditingCoupon({ ...editingCoupon, discount });
                        else setNewCoupon({ ...newCoupon, discount });
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold pr-7"
                      required
                    />
                    <span className="absolute right-3 top-2 font-bold text-slate-400 pointer-events-none">
                      {(editingCoupon ? editingCoupon.type : newCoupon.type) === 'percent' ? '%' : '₹'}
                    </span>
                  </div>
                </div>
              </div>

              {(editingCoupon ? editingCoupon.type : newCoupon.type) === 'percent' ? (
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Status</label>
                  <select
                    value={editingCoupon ? (editingCoupon.status || 'Active') : (newCoupon.status || 'Active')}
                    onChange={(e) => {
                      const status = e.target.value;
                      if (editingCoupon) setEditingCoupon({ ...editingCoupon, status });
                      else setNewCoupon({ ...newCoupon, status });
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold"
                  >
                    <option value="Active">Active (Live)</option>
                    <option value="Inactive">Inactive (Disabled)</option>
                  </select>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Min Order Amount (₹)</label>
                    <input
                      type="number"
                      placeholder="e.g. 3000"
                      value={editingCoupon ? editingCoupon.minAmount : newCoupon.minAmount}
                      onChange={(e) => {
                        const minAmount = parseInt(e.target.value) || 0;
                        if (editingCoupon) setEditingCoupon({ ...editingCoupon, minAmount });
                        else setNewCoupon({ ...newCoupon, minAmount });
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Status</label>
                    <select
                      value={editingCoupon ? (editingCoupon.status || 'Active') : (newCoupon.status || 'Active')}
                      onChange={(e) => {
                        const status = e.target.value;
                        if (editingCoupon) setEditingCoupon({ ...editingCoupon, status });
                        else setNewCoupon({ ...newCoupon, status });
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold"
                    >
                      <option value="Active">Active (Live)</option>
                      <option value="Inactive">Inactive (Disabled)</option>
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-500 mb-1">Coupon Placement (Kahan Dikhana Hai?)</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (editingCoupon) setEditingCoupon({ ...editingCoupon, showOnSearch: true });
                      else setNewCoupon({ ...newCoupon, showOnSearch: true });
                    }}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      (editingCoupon ? editingCoupon.showOnSearch : newCoupon.showOnSearch)
                        ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-500/20 text-sky-900 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-xs flex items-center gap-1 font-extrabold text-sky-700">
                      <span>✈️ Flight Search Card</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                      Search flight cards par discount dikhega & auto-apply hoga
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (editingCoupon) setEditingCoupon({ ...editingCoupon, showOnSearch: false });
                      else setNewCoupon({ ...newCoupon, showOnSearch: false });
                    }}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      !(editingCoupon ? editingCoupon.showOnSearch : newCoupon.showOnSearch)
                        ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-500/20 text-sky-900 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-xs flex items-center gap-1 font-extrabold text-slate-800">
                      <span>📋 Reviews Page Only</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                      Checkout / review page par available offers me dikhega
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-500 mb-1">Description</label>
                <input
                  type="text"
                  placeholder={(editingCoupon ? editingCoupon.type : newCoupon.type) === 'percent' ? "e.g. 10% instant discount on all flights" : "e.g. Flat ₹500 off on flights"}
                  value={editingCoupon ? (editingCoupon.description || '') : newCoupon.description}
                  onChange={(e) => {
                    const description = e.target.value;
                    if (editingCoupon) setEditingCoupon({ ...editingCoupon, description });
                    else setNewCoupon({ ...newCoupon, description });
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddCouponModal(false);
                    setEditingCoupon(null);
                  }}
                  className="w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-extrabold rounded-xl text-xs shadow-md transition-colors cursor-pointer"
                >
                  {editingCoupon ? 'Save & Update Coupon' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD AIRPORT */}
      {showAddAirportModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-200 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h4 className="font-extrabold text-slate-900 text-base">Add New Airport</h4>
              <button onClick={() => setShowAddAirportModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddAirportSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-500 mb-1">IATA Code (3 letters) *</label>
                <input
                  type="text"
                  maxLength={3}
                  placeholder="e.g. ATQ"
                  value={newAirport.code}
                  onChange={(e) => setNewAirport({ ...newAirport, code: e.target.value.toUpperCase() })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold uppercase"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-500 mb-1">City *</label>
                <input
                  type="text"
                  placeholder="e.g. Amritsar"
                  value={newAirport.city}
                  onChange={(e) => setNewAirport({ ...newAirport, city: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-500 mb-1">Airport Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Sri Guru Ram Dass Jee Intl Airport"
                  value={newAirport.name}
                  onChange={(e) => setNewAirport({ ...newAirport, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-3 bg-sky-600 hover:bg-sky-500 text-white font-extrabold rounded-xl text-xs shadow-md cursor-pointer"
              >
                Add Airport
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT HOLIDAY PACKAGE */}
      {showHolidayModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-xl p-6 sm:p-7 shadow-2xl border border-slate-200 animate-fadeIn max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Palmtree className="w-5 h-5 text-emerald-600" />
                <h4 className="font-extrabold text-slate-900 text-base">
                  {editingHoliday ? `Edit: ${editingHoliday.title}` : 'Add New Tour Package'}
                </h4>
              </div>
              <button onClick={() => setShowHolidayModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveHolidaySubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Package Title *</label>
                <input
                  type="text"
                  required
                  value={holidayForm.title}
                  onChange={(e) => setHolidayForm({ ...holidayForm, title: e.target.value })}
                  placeholder="e.g. Magical Manali Snow & Solang Valley Tour"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Destination *</label>
                  <input
                    type="text"
                    required
                    value={holidayForm.destination}
                    onChange={(e) => setHolidayForm({ ...holidayForm, destination: e.target.value })}
                    placeholder="e.g. Manali, Himachal Pradesh"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Duration *</label>
                  <input
                    type="text"
                    required
                    value={holidayForm.duration}
                    onChange={(e) => setHolidayForm({ ...holidayForm, duration: e.target.value })}
                    placeholder="e.g. 5 Days / 4 Nights"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={holidayForm.price}
                    onChange={(e) => setHolidayForm({ ...holidayForm, price: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-emerald-700 focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    value={holidayForm.originalPrice}
                    onChange={(e) => setHolidayForm({ ...holidayForm, originalPrice: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-500 focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Badge Tag</label>
                  <input
                    type="text"
                    value={holidayForm.badge}
                    onChange={(e) => setHolidayForm({ ...holidayForm, badge: e.target.value })}
                    placeholder="Bestseller / Trending"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Image URL</label>
                <input
                  type="url"
                  value={holidayForm.image}
                  onChange={(e) => setHolidayForm({ ...holidayForm, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Inclusions (comma separated)</label>
                <textarea
                  rows="2"
                  value={holidayForm.inclusions}
                  onChange={(e) => setHolidayForm({ ...holidayForm, inclusions: e.target.value })}
                  placeholder="3 Star Hotel, Daily Breakfast & Dinner, Airport Transfers, Sightseeing"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-medium text-slate-700 focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={holidayForm.flightsIncluded}
                      onChange={(e) => setHolidayForm({ ...holidayForm, flightsIncluded: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                    />
                    <span>Flights Included</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-bold text-emerald-700">
                    <input
                      type="checkbox"
                      checked={holidayForm.active}
                      onChange={(e) => setHolidayForm({ ...holidayForm, active: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                    />
                    <span>Active (Live on Website)</span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-md cursor-pointer transition-all active:scale-95"
                >
                  {editingHoliday ? 'Save Changes' : 'Publish Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW BOOKING DETAILS */}
      {viewingBooking && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-100 animate-fadeIn">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                  <Ticket className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">
                    Booking Details #{viewingBooking.bookingId || viewingBooking.pnr}
                  </h3>
                  <div className="text-xs text-slate-500 font-mono">
                    PNR: <span className="font-bold text-sky-700">{viewingBooking.pnr}</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingBooking(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {/* Flight & Route Banner */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase">Flight</div>
                  <div className="text-base font-extrabold text-slate-900">
                    {viewingBooking.airline} ({viewingBooking.flightNumber})
                  </div>
                  <div className="text-xs text-slate-500 font-medium capitalize">
                    Class: {viewingBooking.travelClass || 'Economy'} • Trip: {viewingBooking.tripType || 'One Way'}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-slate-400 uppercase">Route</div>
                  <div className="text-base font-extrabold text-sky-800">
                    {viewingBooking.from} → {viewingBooking.to}
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    {viewingBooking.departureDate} at {viewingBooking.departureTime || '08:00'}
                  </div>
                </div>
              </div>

              {/* Status Badges */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="text-xs font-bold text-slate-400 mb-1">Booking Status</div>
                  <span className={`inline-block px-3 py-1 rounded-md text-xs font-bold ${
                    viewingBooking.status === 'CONFIRMED'
                      ? 'bg-emerald-500 text-white'
                      : viewingBooking.status === 'CANCELLED'
                      ? 'bg-rose-500 text-white'
                      : viewingBooking.status === 'VERIFICATION_PENDING'
                      ? 'bg-orange-500 text-white'
                      : 'bg-amber-400 text-slate-950 font-bold'
                  }`}>
                    {viewingBooking.status || 'PENDING'}
                  </span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="text-xs font-bold text-slate-400 mb-1">Payment Status</div>
                  <span className={`inline-block px-3 py-1 rounded-md text-xs font-bold ${
                    (viewingBooking.payment?.status?.toLowerCase().includes('pending') || viewingBooking.status === 'PENDING')
                      ? 'bg-amber-400 text-slate-950 font-bold'
                      : (viewingBooking.payment?.status?.toLowerCase().includes('paid') || viewingBooking.status === 'CONFIRMED')
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}>
                    {viewingBooking.payment?.method || 'UPI'} • {viewingBooking.payment?.status || 'PENDING'}
                  </span>
                  {viewingBooking.payment?.utrNumber && (
                    <div className="mt-1 text-[11px] font-mono font-bold text-blue-700">
                      UTR: {viewingBooking.payment.utrNumber}
                    </div>
                  )}
                </div>
              </div>

              {/* Passengers */}
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm mb-2 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-sky-600" />
                  Passengers Manifest ({viewingBooking.passengers?.length || 0})
                </h4>
                <div className="space-y-2">
                  {viewingBooking.passengers?.map((p, idx) => (
                    <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-900 text-sm">
                          {p.title} {p.firstName} {p.lastName}
                        </div>
                        <div className="text-slate-500">
                          Gender: {p.gender || 'N/A'} • Nationality: {p.nationality || 'Indian'}
                          {p.passportNumber && ` • Passport: ${p.passportNumber}`}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-2 py-0.5 rounded font-mono font-bold bg-sky-100 text-sky-800">
                          Seat: {p.seat || 'Unassigned'}
                        </span>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Meal: {p.meal || 'No Meal'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer Contact */}
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm mb-2 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-sky-600" />
                  Contact & Customer Details
                </h4>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-slate-400 font-bold">Email Address</div>
                    <div className="font-bold text-slate-800">{viewingBooking.contact?.email || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 font-bold">Phone Number</div>
                    <div className="font-bold text-slate-800">{viewingBooking.contact?.phone || 'N/A'}</div>
                  </div>
                </div>
              </div>

              {/* Fare Summary */}
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm mb-2 flex items-center gap-1.5">
                  <Ticket className="w-4 h-4 text-sky-600" />
                  Fare & Payment Details
                </h4>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Base Fare</span>
                    <span className="font-mono">₹{viewingBooking.fare?.basePrice?.toLocaleString('en-IN') || 0}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Taxes & Fees</span>
                    <span className="font-mono">₹{viewingBooking.fare?.taxes?.toLocaleString('en-IN') || 0}</span>
                  </div>
                  {viewingBooking.fare?.discount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Discount</span>
                      <span className="font-mono">-₹{viewingBooking.fare?.discount?.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-black text-slate-900">
                    <span>Total Amount</span>
                    <span className="font-mono text-base text-sky-800">
                      ₹{(viewingBooking.fare?.total || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons in Modal */}
              <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    handleUpdateBookingStatus(viewingBooking.pnr, 'CONFIRMED');
                    setViewingBooking({ ...viewingBooking, status: 'CONFIRMED' });
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Confirm Booking
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Cancel booking ${viewingBooking.pnr}?`)) {
                      handleUpdateBookingStatus(viewingBooking.pnr, 'CANCELLED');
                      setViewingBooking({ ...viewingBooking, status: 'CANCELLED' });
                    }
                  }}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <X className="w-4 h-4" />
                  Cancel Booking
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleDeleteBooking(viewingBooking.pnr);
                    setViewingBooking(null);
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Permanently
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

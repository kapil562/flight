import React, { useState, useEffect } from 'react';
import {
  X, ShieldCheck, DollarSign, Ticket, Plane, Users, Plus, Trash2, Edit2,
  CheckCircle, AlertCircle, RefreshCw, Settings, Tag, MapPin, Save, Eye,
  Sliders, ArrowUpRight, Search, Check, AlertTriangle, Layers, Percent,
  Building2, Compass, Train, Globe, Phone, Mail, Calendar, ExternalLink, MessageCircle, Palmtree, ToggleLeft, ToggleRight, Database, QrCode, Palette, Key
} from 'lucide-react';
import { api } from '../utils/api';
import AirlineBadge from './AirlineBadge';
import AdminPaymentsUpi from './AdminPaymentsUpi';
import AdminBrandSettings from './AdminBrandSettings';
import AdminBrandCmsSettings from './AdminBrandCmsSettings';
import AdminApiSettings from './AdminApiSettings';

export default function AdminPanel({ airports = [], onClose, onFlightsUpdated, onSettingsUpdated, currentSettings = {} }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'customers' | 'bookings' | 'hotel_bookings' | 'holiday_inquiries' | 'holidays_catalog' | 'train_bookings' | 'visa_applications' | 'flights' | 'coupons' | 'airports' | 'settings'
  const [stats, setStats] = useState(null);
  const [flights, setFlights] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [hotelBookings, setHotelBookings] = useState([]);
  const [holidayInquiries, setHolidayInquiries] = useState([]);
  const [holidayPackages, setHolidayPackages] = useState([]);
  const [trainBookings, setTrainBookings] = useState([]);
  const [visaApplications, setVisaApplications] = useState([]);
  const [settingsForm, setSettingsForm] = useState(currentSettings);
  const [loading, setLoading] = useState(true);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Modals / Editing states
  const [showAddFlightModal, setShowAddFlightModal] = useState(false);
  const [editingFlight, setEditingFlight] = useState(null); // flight object to edit
  const [showAddCouponModal, setShowAddCouponModal] = useState(false);
  const [showAddAirportModal, setShowAddAirportModal] = useState(false);
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [bookingSearch, setBookingSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [hotelSearch, setHotelSearch] = useState('');
  const [holidaySearch, setHolidaySearch] = useState('');
  const [holidayCatalogSearch, setHolidayCatalogSearch] = useState('');
  const [catalogStatusFilter, setCatalogStatusFilter] = useState('all');
  const [trainSearch, setTrainSearch] = useState('');
  const [visaSearch, setVisaSearch] = useState('');

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

  // Forms data
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

  // Load all admin data
  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [
        statsRes,
        flightsRes,
        bookingsRes,
        couponsRes,
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
        api.getSettings(),
        api.getCustomers().catch(() => ({ success: false })),
        api.getAdminHotelBookings().catch(() => ({ success: false })),
        api.getAdminHolidayInquiries().catch(() => ({ success: false })),
        api.getAdminHolidays().catch(() => ({ success: false })),
        api.getAdminTrainBookings().catch(() => ({ success: false })),
        api.getAdminVisaApplications().catch(() => ({ success: false }))
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (flightsRes.success) setFlights(flightsRes.data);
      if (bookingsRes.success) setBookings(bookingsRes.data);
      if (couponsRes.success) setCoupons(couponsRes.data);
      if (settingsRes.success && settingsRes.data) setSettingsForm(settingsRes.data);
      if (customersRes.success) setCustomers(customersRes.data || []);
      if (hotelsRes.success) setHotelBookings(hotelsRes.data || []);
      if (holidaysRes.success) setHolidayInquiries(holidaysRes.data || []);
      if (holidayPackagesRes?.success) setHolidayPackages(holidayPackagesRes.data || []);
      if (trainsRes.success) setTrainBookings(trainsRes.data || []);
      if (visasRes.success) setVisaApplications(visasRes.data || []);
    } catch (err) {
      console.error('Error loading admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // 1. Save Website Settings (CMS)
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      const res = await api.updateSettings(settingsForm);
      if (res.success) {
        setSaveSuccessMsg('Website Settings Saved Live! All changes are now active.');
        if (onSettingsUpdated) onSettingsUpdated(res.data);
        setTimeout(() => setSaveSuccessMsg(''), 4000);
      }
    } catch (err) {
      alert('Failed to save settings');
    }
  };

  // 2. Add Flight
  const handleAddFlightSubmit = async (e) => {
    e.preventDefault();
    if (!newFlight.flightNumber || !newFlight.basePrice) {
      alert('Please fill flight number and base price.');
      return;
    }

    try {
      const res = await api.addFlight(newFlight);
      if (res.success) {
        alert('Flight route published live!');
        setShowAddFlightModal(false);
        loadAdminData();
        if (onFlightsUpdated) onFlightsUpdated();
      }
    } catch (err) {
      alert('Error creating flight');
    }
  };

  // 3. Update Existing Flight
  const handleUpdateFlightSubmit = async (e) => {
    e.preventDefault();
    if (!editingFlight) return;
    try {
      const res = await api.updateFlight(editingFlight.id, editingFlight);
      if (res.success) {
        alert(`Flight ${editingFlight.flightNumber} updated live!`);
        setEditingFlight(null);
        loadAdminData();
        if (onFlightsUpdated) onFlightsUpdated();
      }
    } catch (err) {
      alert('Error updating flight');
    }
  };

  // 4. Delete Flight
  const handleDeleteFlight = async (id) => {
    if (!window.confirm('Are you sure you want to delete this scheduled flight?')) return;
    try {
      const res = await api.deleteFlight(id);
      if (res.success) {
        loadAdminData();
        if (onFlightsUpdated) onFlightsUpdated();
      }
    } catch (err) {
      alert('Error deleting flight');
    }
  };

  // 5. Add Coupon
  const handleAddCouponSubmit = async (e) => {
    e.preventDefault();
    if (!newCoupon.code || !newCoupon.discount) return;
    try {
      const res = await api.addCoupon(newCoupon);
      if (res.success) {
        alert(`Coupon ${newCoupon.code} created!`);
        setShowAddCouponModal(false);
        setNewCoupon({ code: '', type: 'flat', discount: 500, minAmount: 3000, description: '' });
        loadAdminData();
      }
    } catch (err) {
      alert('Error adding coupon');
    }
  };

  // 6. Delete Coupon
  const handleDeleteCoupon = async (id) => {
    if (!window.confirm('Delete this coupon code?')) return;
    try {
      await api.deleteCoupon(id);
      loadAdminData();
    } catch (err) {
      alert('Error deleting coupon');
    }
  };

  // 7. Add Airport
  const handleAddAirportSubmit = async (e) => {
    e.preventDefault();
    if (!newAirport.code || !newAirport.city || !newAirport.name) return;
    try {
      const res = await api.addAirport(newAirport);
      if (res.success) {
        alert(`Airport ${newAirport.code} added!`);
        setShowAddAirportModal(false);
        setNewAirport({ code: '', city: '', name: '', country: 'India' });
        loadAdminData();
      }
    } catch (err) {
      alert('Error adding airport');
    }
  };

  // 8. Delete Airport
  const handleDeleteAirport = async (code) => {
    if (!window.confirm(`Delete airport ${code}?`)) return;
    try {
      await api.deleteAirport(code);
      loadAdminData();
    } catch (err) {
      alert('Error deleting airport');
    }
  };

  // 9. Update Booking Status
  const handleUpdateBookingStatus = async (pnr, newStatus) => {
    try {
      const res = await api.updateBookingStatus(pnr, newStatus);
      if (res.success) {
        loadAdminData();
      }
    } catch (err) {
      alert('Error updating booking status');
    }
  };

  // 10. Delete Customer
  const handleDeleteCustomer = async (id, name) => {
    if (!window.confirm(`Delete customer account for ${name || id}?`)) return;
    try {
      const res = await api.deleteCustomer(id);
      if (res.success) {
        setCustomers(prev => prev.filter(c => c.id !== id));
      }
    } catch (err) {
      alert('Error deleting customer');
    }
  };

  // 11. Update Hotel Booking Status
  const handleUpdateHotelStatus = async (id, newStatus) => {
    try {
      const res = await api.updateHotelBookingStatus(id, newStatus);
      if (res.success) {
        setHotelBookings(prev => prev.map(h => h.id === id ? { ...h, status: newStatus } : h));
      }
    } catch (err) {
      alert('Error updating hotel booking status');
    }
  };

  // 12. Update Holiday Inquiry Status
  const handleUpdateHolidayStatus = async (id, newStatus) => {
    try {
      const res = await api.updateHolidayInquiryStatus(id, newStatus);
      if (res.success) {
        setHolidayInquiries(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
      }
    } catch (err) {
      alert('Error updating holiday inquiry status');
    }
  };

  // 13. Update Visa Application Status
  const handleUpdateVisaStatus = async (id, newStatus) => {
    try {
      const res = await api.updateVisaApplicationStatus(id, newStatus);
      if (res.success) {
        setVisaApplications(prev => prev.map(v => ((v.id === id || v.applicationId === id) ? { ...v, status: newStatus } : v)));
      }
    } catch (err) {
      alert('Error updating visa status');
    }
  };

  // 14. Holiday Catalog Handlers (Add, Edit, Delete, Toggle Active)
  const handleToggleHoliday = async (id) => {
    try {
      const res = await api.toggleHolidayStatus(id);
      if (res.success) {
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
          setHolidayPackages(prev => prev.map(p => p.id === editingHoliday.id ? res.data : p));
          setShowHolidayModal(false);
        }
      } else {
        const res = await api.addHoliday(payload);
        if (res.success) {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-6xl max-h-[96vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto">
        
        {/* Top Admin Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black tracking-tight">AirSkyGo Master Control CMS</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  LIVE CMS
                </span>
              </div>
              <p className="text-xs text-slate-400">Har ek cheez yahan se live modify aur control karein</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadAdminData}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Body with Left Sidebar */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Sidebar */}
          <div className="w-64 bg-slate-900 border-r border-slate-800 p-3 flex flex-col overflow-y-auto space-y-4 shrink-0 text-slate-300 scrollbar-thin">
            <div>
              <span className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                Dashboard & Users
              </span>
              <div className="space-y-0.5">
                {[
                  { id: 'overview', icon: Layers, label: 'Analytics Overview' },
                  { id: 'customers', icon: Users, label: 'Customers', count: customers.length }
                ].map(item => {
                  const Icon = item.icon;
                  const isAct = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isAct ? 'bg-sky-600 text-white font-extrabold shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {typeof item.count === 'number' && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          isAct ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                        }`}>{item.count}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <span className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                Bookings & Leads
              </span>
              <div className="space-y-0.5">
                {[
                  { id: 'bookings', icon: Ticket, label: 'Flights', count: bookings.length },
                  { id: 'hotel_bookings', icon: Building2, label: 'Hotels', count: hotelBookings.length },
                  { id: 'holiday_inquiries', icon: Compass, label: 'Holidays', count: holidayInquiries.length },
                  { id: 'train_bookings', icon: Train, label: 'Trains', count: trainBookings.length },
                  { id: 'visa_applications', icon: Globe, label: 'Visas', count: visaApplications.length }
                ].map(item => {
                  const Icon = item.icon;
                  const isAct = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isAct ? 'bg-sky-600 text-white font-extrabold shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {typeof item.count === 'number' && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          isAct ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                        }`}>{item.count}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <span className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                Inventory & CMS
              </span>
              <div className="space-y-0.5">
                {[
                  { id: 'flights', icon: Plane, label: 'Flight Routes', count: flights.length },
                  { id: 'holidays_catalog', icon: Palmtree, label: 'Holiday Packages', count: holidayPackages.length },
                  { id: 'coupons', icon: Tag, label: 'Coupons', count: coupons.length },
                  { id: 'airports', icon: MapPin, label: 'Airports', count: airports.length },
                  { id: 'services_modules', icon: Sliders, label: 'Service Tabs (ON / OFF)' },
                  { id: 'footer_crm', icon: Sparkles, label: 'Footer & Contact CMS' },
                  { id: 'brand_crm', icon: Palette, label: 'Brand & Website CRM' },
                  { id: 'api_settings', icon: Key, label: 'API Keys' },
                  { id: 'payments_upi', icon: QrCode, label: 'Payments & UPI' }
                ].map(item => {
                  const Icon = item.icon;
                  const isAct = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isAct ? 'bg-sky-600 text-white font-extrabold shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {typeof item.count === 'number' && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          isAct ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                        }`}>{item.count}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Content Viewport */}
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            {saveSuccessMsg && (
              <div className="bg-emerald-500 text-white px-5 py-2.5 text-xs font-bold flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>{saveSuccessMsg}</span>
                </div>
                <button onClick={() => setSaveSuccessMsg('')}>✕</button>
              </div>
            )}
            
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 space-y-6">
          
          {/* TAB 1: DASHBOARD STATS */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Row 1: Key Business Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                  <span className="text-xs font-bold text-slate-400 uppercase">Total Revenue</span>
                  <div className="text-3xl font-black text-slate-900 font-mono mt-1">
                    ₹{(stats?.totalRevenue || 0).toLocaleString('en-IN')}
                  </div>
                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>Real-time processed</span>
                  </span>
                </div>

                <div 
                  onClick={() => setActiveTab('customers')}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-sky-500 cursor-pointer transition-all"
                >
                  <span className="text-xs font-bold text-slate-400 uppercase flex items-center justify-between">
                    <span>Registered Customers</span>
                    <span className="text-sky-600 text-[10px] font-bold">View Tab →</span>
                  </span>
                  <div className="text-3xl font-black text-slate-900 font-mono mt-1">
                    {stats?.totalCustomers || customers.length}
                  </div>
                  <span className="text-[11px] text-sky-600 font-semibold mt-1 block">
                    Verified phone & email accounts
                  </span>
                </div>

                <div 
                  onClick={() => setActiveTab('bookings')}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-sky-500 cursor-pointer transition-all"
                >
                  <span className="text-xs font-bold text-slate-400 uppercase flex items-center justify-between">
                    <span>Flight Bookings</span>
                    <span className="text-sky-600 text-[10px] font-bold">View Tab →</span>
                  </span>
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

              {/* Airline revenue & recent bookings */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                  <h4 className="font-extrabold text-slate-900 text-base mb-4">Revenue Breakdown by Airline</h4>
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

          {/* TAB 2: LEGACY WEBSITE CMS & GENERAL SETTINGS */}
          {activeTab === 'legacy_settings' && (
            <form onSubmit={handleSaveSettings} className="space-y-6">
              
              {/* Header with Save CTA */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div>
                  <h4 className="text-lg font-black text-slate-900">Website Global Content Management (CMS)</h4>
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

              {/* 1. Brand & Contact */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                <h5 className="text-xs font-black text-slate-400 uppercase tracking-wider">1. Brand Identity & Contact</h5>
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

              {/* 2. Fees & Tax Controls */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                <h5 className="text-xs font-black text-slate-400 uppercase tracking-wider">2. Tax & Penalty Pricing Settings</h5>
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

              {/* 3. Top Announcement Ticker */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-black text-slate-400 uppercase tracking-wider">3. Header Announcement Ticker</h5>
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
                    <span>Show Announcement Banner</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 text-xs">
                  <div className="sm:col-span-8">
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
                  <div className="sm:col-span-4">
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

              {/* 4. Hero Banner Content */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                <h5 className="text-xs font-black text-slate-400 uppercase tracking-wider">4. Hero Banner Headline & Subtitle</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Hero Main Title (Prefix)</label>
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

              <div className="pt-2 text-right">
                <button
                  type="submit"
                  className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-sm shadow-lg shadow-emerald-600/30 cursor-pointer"
                >
                  Save All Settings Live
                </button>
              </div>

              {/* CENTRAL DATABASE DB.JSON BACKUP CARD */}
              <div className="pt-6 border-t border-slate-100">
                <div className="p-5 rounded-2xl bg-sky-50/80 border border-sky-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Database className="w-5 h-5 text-sky-600" />
                      <h5 className="font-extrabold text-slate-900 text-sm">Unified Master Database (db.json)</h5>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1">
                      Server ka sara data (flights, users, bookings, hotels, holidays, etc.) real-time <code className="bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded font-mono font-bold">server/db.json</code> me save rehta hai.
                    </p>
                  </div>
                  <a
                    href="/api/db"
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all whitespace-nowrap self-start sm:self-auto cursor-pointer"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    <span>View / Export db.json</span>
                  </a>
                </div>
              </div>

            </form>
          )}

          {/* TAB: UNIFIED BRAND & WEBSITE CRM */}
          {(activeTab === 'brand_crm' || activeTab === 'brand' || activeTab === 'settings') && (
            <AdminBrandCmsSettings onSettingsUpdated={onSettingsUpdated} />
          )}

          {/* TAB: SERVICE TABS & MODULES (ON / OFF) */}
          {(activeTab === 'services_modules' || activeTab === 'service_modules') && (
            <AdminBrandCmsSettings onSettingsUpdated={onSettingsUpdated} initialSection="sec-services" />
          )}

          {/* TAB: FOOTER & CONTACT DETAILS CMS */}
          {activeTab === 'footer_crm' && (
            <AdminBrandCmsSettings onSettingsUpdated={onSettingsUpdated} initialSection="sec-footer" />
          )}

          {/* TAB: API KEYS & PAYMENT SETTINGS */}
          {(activeTab === 'api_settings' || activeTab === 'apis') && (
            <AdminApiSettings onNavigateTab={(tab) => setActiveTab(tab)} />
          )}

          {/* TAB: PAYMENTS & UPI */}
          {activeTab === 'payments_upi' && (
            <AdminPaymentsUpi />
          )}

          {/* TAB 3: FLIGHTS & LIVE PRICE MANAGER */}
          {activeTab === 'flights' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h4 className="text-lg font-extrabold text-slate-900">Flight Inventory, Prices & Live Status</h4>
                  <p className="text-xs text-slate-500">Change any flight price, timings, route, or delay status in real-time.</p>
                </div>
                <button
                  onClick={() => setShowAddFlightModal(true)}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Add New Flight</span>
                </button>
              </div>

              {/* Flights Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                      <tr>
                        <th className="p-3.5">Flight #</th>
                        <th className="p-3.5">Airline</th>
                        <th className="p-3.5">Route</th>
                        <th className="p-3.5">Time</th>
                        <th className="p-3.5">Base Fare (₹)</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right">Edit / Delete</th>
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

          {/* TAB 4: COUPONS & DISCOUNTS */}
          {activeTab === 'coupons' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h4 className="text-lg font-extrabold text-slate-900">Promo Codes & Discounts</h4>
                  <p className="text-xs text-slate-500">Create instant discount codes for customer bookings.</p>
                </div>
                <button
                  onClick={() => setShowAddCouponModal(true)}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Add New Coupon</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {coupons.map(c => (
                  <div key={c.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs relative space-y-2">
                    <button
                      onClick={() => handleDeleteCoupon(c.id)}
                      className="absolute top-3 right-3 text-slate-400 hover:text-rose-600 p-1 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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
                    <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {c.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: AIRPORTS MANAGEMENT */}
          {activeTab === 'airports' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h4 className="text-lg font-extrabold text-slate-900">Airports & Travel Hubs</h4>
                  <p className="text-xs text-slate-500">Manage IATA airport codes, cities, and destination hubs.</p>
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

          {/* TAB 6: BOOKINGS & PASSENGER MANIFEST */}
          {activeTab === 'bookings' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h4 className="text-lg font-extrabold text-slate-900">Passenger Bookings & PNR Control</h4>
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
                        <th className="p-3.5 text-right">Change Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {filteredBookings.map(b => (
                        <tr key={b.pnr} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3.5 font-mono font-black text-sky-800">{b.pnr}</td>
                          <td className="p-3.5 font-bold text-slate-900">{b.airline} ({b.flightNumber})</td>
                          <td className="p-3.5 font-bold text-slate-800">
                            {b.tripType === 'multiCity' || (b.multiCityLegs && b.multiCityLegs.length > 0) ? (
                              <div>
                                <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-black bg-purple-100 text-purple-700 uppercase mr-1">
                                  Multi-City
                                </span>
                                <span className="text-slate-900">
                                  {b.multiCityLegs ? b.multiCityLegs.map(l => `${l.from} ➔ ${l.to}`).join(' • ') : b.route || `${b.from} → ${b.to}`}
                                </span>
                              </div>
                            ) : (
                              <span>{b.from} → {b.to}</span>
                            )}
                          </td>
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
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              b.status === 'CONFIRMED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : b.status === 'PENDING'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : b.status === 'VERIFICATION_PENDING'
                                ? 'bg-orange-100 text-orange-900 border border-orange-300'
                                : 'bg-rose-100 text-rose-800'
                            }`}>
                              {b.status === 'VERIFICATION_PENDING' ? '⏳ Verification Pending' : b.status === 'PENDING' ? '⏳ PENDING' : b.status}
                            </span>
                            {b.status === 'VERIFICATION_PENDING' && (
                              <button
                                type="button"
                                onClick={() => handleUpdateBookingStatus(b.pnr, 'CONFIRMED')}
                                className="mt-1.5 block text-[10px] font-extrabold bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-0.5 rounded shadow-2xs cursor-pointer"
                                title="Click to quickly verify UTR and confirm booking"
                              >
                                ✓ Approve & Confirm
                              </button>
                            )}
                          </td>
                          <td className="p-3.5 text-right space-x-1">
                            <select
                              value={b.status}
                              onChange={(e) => handleUpdateBookingStatus(b.pnr, e.target.value)}
                              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-700 cursor-pointer"
                            >
                              <option value="PENDING">PENDING</option>
                              <option value="CONFIRMED">CONFIRMED</option>
                              <option value="VERIFICATION_PENDING">VERIFICATION_PENDING</option>
                              <option value="CANCELLED">CANCELLED</option>
                              <option value="REFUNDED">REFUNDED</option>
                            </select>
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
                                  className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-700"
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
                                  className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-700"
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
                                  className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-700"
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

          {/* TAB: HOLIDAYS CATALOG (INVENTORY & ACTIVE / DEACTIVE TOGGLE) */}
          {activeTab === 'holidays_catalog' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h4 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    <Palmtree className="w-5 h-5 text-emerald-600" />
                    Holiday Tour Packages Catalog
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

        </div>
          </div>
        </div>

        {/* MODAL: EDIT FLIGHT & LIVE PRICE */}
        {editingFlight && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-slate-200 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <h4 className="font-extrabold text-slate-900 text-base">
                  Edit Flight & Price • {editingFlight.flightNumber}
                </h4>
                <button onClick={() => setEditingFlight(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
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

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Aircraft Model</label>
                    <input
                      type="text"
                      value={editingFlight.aircraft}
                      onChange={(e) => setEditingFlight({ ...editingFlight, aircraft: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Stops (0 = Non-Stop)</label>
                    <input
                      type="number"
                      value={editingFlight.stops}
                      onChange={(e) => setEditingFlight({ ...editingFlight, stops: parseInt(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-4 py-3 bg-sky-600 hover:bg-sky-500 text-white font-extrabold rounded-xl text-xs shadow-md cursor-pointer"
                >
                  Save Flight Changes
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: ADD NEW FLIGHT */}
        {showAddFlightModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-slate-200 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <h4 className="font-extrabold text-slate-900 text-base">Add New Scheduled Flight Route</h4>
                <button onClick={() => setShowAddFlightModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
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
                    <label className="block font-bold text-slate-500 mb-1">Aircraft Model</label>
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

        {/* MODAL: ADD NEW COUPON */}
        {showAddCouponModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-200 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <h4 className="font-extrabold text-slate-900 text-base">Create New Discount Coupon</h4>
                <button onClick={() => setShowAddCouponModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddCouponSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Coupon Code *</label>
                  <input
                    type="text"
                    placeholder="e.g. SUPERFLY"
                    value={newCoupon.code}
                    onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold uppercase"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Discount Type</label>
                    <select
                      value={newCoupon.type}
                      onChange={(e) => setNewCoupon({ ...newCoupon, type: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold"
                    >
                      <option value="flat">Flat Amount (₹)</option>
                      <option value="percent">Percentage (%)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Discount Value *</label>
                    <input
                      type="number"
                      value={newCoupon.discount}
                      onChange={(e) => setNewCoupon({ ...newCoupon, discount: parseInt(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-500 mb-1">Minimum Booking Amount (₹)</label>
                  <input
                    type="number"
                    value={newCoupon.minAmount}
                    onChange={(e) => setNewCoupon({ ...newCoupon, minAmount: parseInt(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-500 mb-1">Description / Offer Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Flat ₹500 off on festive flights"
                    value={newCoupon.description}
                    onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full mt-4 py-3 bg-sky-600 hover:bg-sky-500 text-white font-extrabold rounded-xl text-xs shadow-md cursor-pointer"
                >
                  Create & Activate Promo Code
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: ADD AIRPORT */}
        {showAddAirportModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-200 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <h4 className="font-extrabold text-slate-900 text-base">Add New Airport Hub</h4>
                <button onClick={() => setShowAddAirportModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddAirportSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Airport 3-Letter IATA Code *</label>
                  <input
                    type="text"
                    maxLength={3}
                    placeholder="e.g. IXC"
                    value={newAirport.code}
                    onChange={(e) => setNewAirport({ ...newAirport, code: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold uppercase"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-500 mb-1">City Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Chandigarh"
                    value={newAirport.city}
                    onChange={(e) => setNewAirport({ ...newAirport, city: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-500 mb-1">Airport Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Shaheed Bhagat Singh International Airport"
                    value={newAirport.name}
                    onChange={(e) => setNewAirport({ ...newAirport, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full mt-4 py-3 bg-sky-600 hover:bg-sky-500 text-white font-extrabold rounded-xl text-xs shadow-md cursor-pointer"
                >
                  Add Airport to Database
                </button>
              </form>
            </div>
          </div>
        {/* MODAL: ADD / EDIT HOLIDAY PACKAGE */}
        {showHolidayModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <div className="bg-white rounded-3xl w-full max-w-xl p-6 shadow-2xl border border-slate-200 animate-fadeIn max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div>
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                    {editingHoliday ? 'Edit Package' : 'New Tour Package'}
                  </span>
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

      </div>
    </div>
  );
}

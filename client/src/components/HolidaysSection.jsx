import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Palmtree, MapPin, Clock, Star, Sparkles, Check, X, Plane, ShieldCheck, Phone, Search, Users, Calendar, MessageCircle, Printer, Compass, ChevronDown } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../utils/api';

const POPULAR_TOURS = [
  { name: 'Kashmir', label: '❄️ Kashmir' },
  { name: 'Goa', label: '🏖️ Goa' },
  { name: 'Kerala', label: '🌴 Kerala' },
  { name: 'Dubai', label: '🏙️ Dubai' },
  { name: 'Bali', label: '🌺 Bali' },
  { name: 'Himachal', label: '🏔️ Himachal' },
  { name: 'Rajasthan', label: '🏰 Rajasthan' },
  { name: 'Thailand', label: '🏝️ Thailand' }
];

export default function HolidaysSection({ settings = {}, brand = null }) {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all'); // 'all' | 'domestic' | 'international' | 'honeymoon' | 'weekend'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('all'); // 'all' | 'short' | 'medium' | 'long'
  const [selectedBudget, setSelectedBudget] = useState('all'); // 'all' | 'budget' | 'mid' | 'luxury'
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inquiry/Booking form state
  const [inqName, setInqName] = useState('');
  const [inqPhone, setInqPhone] = useState('');
  const [inqEmail, setInqEmail] = useState('');
  const [inqDate, setInqDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [inqTravellers, setInqTravellers] = useState(2);
  const [inqNotes, setInqNotes] = useState('');

  // Auto-fill logged in user info
  useEffect(() => {
    try {
      const userStr = localStorage.getItem('asg_user');
      if (userStr) {
        const u = JSON.parse(userStr);
        if (u.name && !inqName) setInqName(u.name);
        if (u.phone && !inqPhone) setInqPhone(u.phone);
        if (u.email && !inqEmail) setInqEmail(u.email);
      }
    } catch (e) {
      console.warn('Failed to parse user session', e);
    }
  }, [selectedPkg]);

  const fetchHolidays = async () => {
    setLoading(true);
    try {
      const res = await api.getHolidays();
      if (res.success) {
        setPackages(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load holidays:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  const filtered = packages.filter(p => {
    // Domestic vs International
    const isIndia = p.destination?.toLowerCase().includes('india') || 
                    p.id?.includes('GOA') || 
                    p.id?.includes('KASH') || 
                    p.id?.includes('KER') ||
                    p.id?.includes('MAN') ||
                    p.id?.includes('RAJ');

    if (filterType === 'domestic' && !isIndia) return false;
    if (filterType === 'international' && isIndia) return false;
    if (filterType === 'honeymoon' && !p.badge?.toLowerCase().includes('honeymoon') && !p.title?.toLowerCase().includes('honeymoon') && !p.title?.toLowerCase().includes('romantic')) {
      if (filterType === 'honeymoon' && !p.destination?.toLowerCase().includes('bali') && !p.destination?.toLowerCase().includes('kashmir') && !p.destination?.toLowerCase().includes('kerala')) return false;
    }
    if (filterType === 'weekend' && (!p.duration || (!p.duration.includes('3') && !p.duration.includes('4')))) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const match = (p.title && p.title.toLowerCase().includes(q)) ||
                    (p.destination && p.destination.toLowerCase().includes(q)) ||
                    (p.badge && p.badge.toLowerCase().includes(q));
      if (!match) return false;
    }

    // Duration filter
    if (selectedDuration !== 'all' && p.duration) {
      const d = p.duration.toLowerCase();
      if (selectedDuration === 'short' && !d.includes('2') && !d.includes('3') && !d.includes('4')) return false;
      if (selectedDuration === 'medium' && !d.includes('5') && !d.includes('6') && !d.includes('7')) return false;
      if (selectedDuration === 'long' && !d.includes('8') && !d.includes('9') && !d.includes('10') && !d.includes('11') && !d.includes('12') && !d.includes('14')) return false;
    }

    // Budget filter
    if (selectedBudget === 'budget' && p.price > 15000) return false;
    if (selectedBudget === 'mid' && (p.price <= 15000 || p.price > 35000)) return false;
    if (selectedBudget === 'luxury' && p.price <= 35000) return false;

    return true;
  });

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    if (!selectedPkg) return;
    setIsSubmitting(true);

    try {
      const totalAmount = selectedPkg.price * inqTravellers;
      const res = await api.inquireHoliday({
        packageId: selectedPkg.id,
        packageName: selectedPkg.title,
        destination: selectedPkg.destination,
        customerName: inqName || 'Valued Traveller',
        customerPhone: inqPhone || '',
        customerEmail: inqEmail || '',
        travelDate: inqDate || '',
        travellers: inqTravellers,
        totalAmount,
        notes: inqNotes || ''
      });

      const confirmed = {
        inquiryId: res.inquiry?.inquiryId || ('INQ-' + Math.floor(1000 + Math.random() * 9000)),
        package: selectedPkg,
        customerName: inqName,
        customerPhone: inqPhone,
        travelDate: inqDate,
        travellers: inqTravellers,
        totalAmount,
        status: 'CONFIRMED'
      };

      try {
        const prev = JSON.parse(localStorage.getItem('asg_holiday_bookings') || '[]');
        prev.unshift(confirmed);
        localStorage.setItem('asg_holiday_bookings', JSON.stringify(prev));
      } catch (e) {}

      setSelectedPkg(null);
      setConfirmedBooking(confirmed);
      confetti({ particleCount: 75, spread: 65, origin: { y: 0.6 } });
    } catch (err) {
      console.error(err);
      alert('Unable to submit inquiry at this moment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      {/* Hero Search Section - Harmonized with Flights HeroSearch */}
      <div className="relative pt-7 sm:pt-12 pb-6 sm:pb-12 bg-gradient-to-b from-sky-900 via-sky-800 to-slate-900 text-white rounded-2xl sm:rounded-[2.5rem] shadow-xl z-10">
        {/* Background ambient lighting */}
        <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden rounded-2xl sm:rounded-[2.5rem]">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-teal-500 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
          
          {/* Banner Title */}
          <motion.div 
            className="text-center max-w-3xl mx-auto mb-3 sm:mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-emerald-200 text-xs font-semibold uppercase tracking-wider mb-3">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              <Palmtree className="w-3.5 h-3.5 text-amber-300" />
              Verified Holiday Tour Packages • Handcrafted Itineraries
            </div>
            <h1 className="text-xl sm:text-5xl font-extrabold tracking-tight text-white mb-1 sm:mb-2 leading-tight">
              Explore Handcrafted Tours with <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">Moyatri Holidays</span>
            </h1>
            <p className="hidden sm:block text-slate-300 text-xs sm:text-base">
              All-inclusive holiday packages with luxury stays, sightseeing, transfers, meals &amp; 24/7 dedicated trip assistance.
            </p>
          </motion.div>

          {/* Elevated White Search Box Card */}
          <motion.div 
            className="bg-white text-slate-800 rounded-2xl sm:rounded-3xl p-3 sm:p-7 shadow-2xl border border-slate-100 relative"
            initial={{ opacity: 0, y: 25, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          >
            {/* Top Options Row: Category Tabs */}
            <div className="flex items-center justify-between gap-1.5 pb-2.5 sm:pb-4 mb-2.5 sm:mb-4 border-b border-slate-100">
              <div className="inline-flex items-center bg-slate-100 p-0.5 sm:p-1 rounded-xl sm:rounded-2xl gap-0.5 sm:gap-1 overflow-x-auto scrollbar-none max-w-full">
                {[
                  { id: 'all', label: 'All Packages' },
                  { id: 'domestic', label: '🇮🇳 India Tours' },
                  { id: 'international', label: '✈️ International' },
                  { id: 'honeymoon', label: '🌹 Honeymoon & Romantic' },
                  { id: 'weekend', label: '⚡ Weekend Trips' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFilterType(tab.id)}
                    className={`px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                      filterType === tab.id ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Assistance Badge */}
              <div className="hidden lg:flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 shrink-0">
                <Check className="w-3.5 h-3.5" />
                <span>100% Customizable Packages</span>
              </div>
            </div>

            {/* Input Grid (Destination / Search, Duration, Budget, Search CTA) */}
            <div className="grid grid-cols-2 md:grid-cols-12 gap-2 sm:gap-3 relative items-center">
              
              {/* Destination / Search Query Input */}
              <div className="col-span-2 md:col-span-5 relative">
                <div className="p-2 sm:p-3.5 rounded-xl sm:rounded-2xl border border-slate-200 focus-within:border-emerald-500 transition-colors bg-slate-50/50 focus-within:bg-white h-full min-h-[76px] sm:min-h-[84px] flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5 sm:mb-1">
                    <Palmtree className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600" />
                    <span>Where do you want to go?</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Kashmir, Goa, Dubai, Bali, Kerala..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-transparent text-sm sm:text-base font-extrabold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:outline-none"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 cursor-pointer shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="text-[10px] sm:text-xs text-slate-400 truncate">
                    Search city, state or holiday theme
                  </div>
                </div>
              </div>

              {/* Trip Duration Filter */}
              <div className="col-span-1 md:col-span-2">
                <div className="p-2 sm:p-3.5 rounded-xl sm:rounded-2xl border border-slate-200 hover:border-emerald-500 transition-colors bg-slate-50/50 hover:bg-white h-full min-h-[76px] sm:min-h-[84px] flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5 sm:mb-1">
                    <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600" />
                    <span>Duration</span>
                  </div>
                  <select
                    value={selectedDuration}
                    onChange={(e) => setSelectedDuration(e.target.value)}
                    className="w-full bg-transparent text-xs sm:text-sm font-extrabold text-slate-900 focus:outline-none cursor-pointer"
                  >
                    <option value="all">All Durations</option>
                    <option value="short">2 - 4 Days (Short)</option>
                    <option value="medium">5 - 7 Days (Regular)</option>
                    <option value="long">8+ Days (Extended)</option>
                  </select>
                  <div className="text-[10px] sm:text-xs text-emerald-700 font-semibold truncate">
                    {selectedDuration === 'all' ? 'Any trip length' : `${selectedDuration.toUpperCase()} tour`}
                  </div>
                </div>
              </div>

              {/* Budget Range Filter */}
              <div className="col-span-1 md:col-span-2">
                <div className="p-2 sm:p-3.5 rounded-xl sm:rounded-2xl border border-slate-200 hover:border-emerald-500 transition-colors bg-slate-50/50 hover:bg-white h-full min-h-[76px] sm:min-h-[84px] flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5 sm:mb-1">
                    <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500" />
                    <span>Budget Range</span>
                  </div>
                  <select
                    value={selectedBudget}
                    onChange={(e) => setSelectedBudget(e.target.value)}
                    className="w-full bg-transparent text-xs sm:text-sm font-extrabold text-slate-900 focus:outline-none cursor-pointer"
                  >
                    <option value="all">All Budgets</option>
                    <option value="budget">Under ₹15,000</option>
                    <option value="mid">₹15,000 - ₹35,000</option>
                    <option value="luxury">₹35,000+ Luxury</option>
                  </select>
                  <div className="text-[10px] sm:text-xs text-amber-700 font-semibold truncate">
                    Per person fare
                  </div>
                </div>
              </div>

              {/* Big Search CTA Button */}
              <div className="col-span-2 md:col-span-3">
                <motion.button
                  type="button"
                  onClick={() => {
                    // Smooth scroll to packages grid
                    const el = document.getElementById('holiday-packages-grid');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full h-full min-h-[52px] sm:min-h-[84px] px-4 py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Search className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                  <span className="whitespace-nowrap">SEARCH PACKAGES</span>
                </motion.button>
              </div>

            </div>

            {/* Bottom Row: Tour Perks */}
            <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
              <div className="flex items-center gap-3 overflow-x-auto scrollbar-none pb-0.5">
                <span className="flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  <Check className="w-3 h-3" /> 100% Customized Plans
                </span>
                <span className="flex items-center gap-1 font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
                  <Plane className="w-3 h-3" /> Flights &amp; Hotel Inclusions
                </span>
                <span className="hidden sm:flex items-center gap-1 font-semibold text-slate-700">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> Dedicated 24/7 Trip Guide
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Over 25,000+ happy holiday travelers booked</span>
            </div>

          </motion.div>

          {/* Quick Tour Shortcuts (Harmonized with Flights popular routes) */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-emerald-200">
            <span className="font-semibold text-slate-400 flex items-center gap-1">
              <Compass className="w-3.5 h-3.5" /> Popular Tours:
            </span>
            {POPULAR_TOURS.map(tour => (
              <button
                key={tour.name}
                type="button"
                onClick={() => {
                  setSearchQuery(tour.name);
                  setFilterType('all');
                }}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors backdrop-blur-xs cursor-pointer ${
                  searchQuery.toLowerCase() === tour.name.toLowerCase()
                    ? 'bg-white text-slate-900 border-white font-bold shadow-xs'
                    : 'bg-white/10 hover:bg-white/20 border-white/10 text-white'
                }`}
              >
                {tour.label}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Results Section */}
      <div id="holiday-packages-grid" className="py-6 sm:py-8 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 scroll-mt-6">
        
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <span>Featured Tour Packages</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                {filtered.length} Available
              </span>
            </h3>
            <p className="text-xs text-slate-500">Best price guaranteed with 24/7 dedicated trip assistance.</p>
          </div>
        </div>

        {/* Packages Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <div key={n} className="bg-white rounded-3xl p-4 border border-slate-200 animate-pulse space-y-3">
                <div className="h-52 bg-slate-200 rounded-2xl"></div>
                <div className="h-5 bg-slate-200 rounded w-3/4"></div>
                <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                <div className="h-10 bg-slate-100 rounded-xl mt-4"></div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs max-w-lg mx-auto">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Palmtree className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-black text-slate-900 mb-1">No holiday packages found</h4>
            <p className="text-xs text-slate-500 mb-6">
              Try a different search keyword or switch between India tours and International destinations.
            </p>
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setFilterType('all'); setSelectedDuration('all'); setSelectedBudget('all'); }}
              className="px-5 py-2.5 bg-emerald-600 text-white text-xs font-extrabold rounded-xl shadow-md hover:bg-emerald-500 transition-all cursor-pointer"
            >
              Show All Tour Packages
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(pkg => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Photo & Duration Badge */}
                  <div className="relative h-56 overflow-hidden bg-slate-100">
                    <img
                      src={pkg.image}
                      alt={pkg.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    {pkg.badge && (
                      <span className="absolute top-3 left-3 bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-1 rounded-full shadow-md">
                        {pkg.badge}
                      </span>
                    )}
                    {pkg.flightsIncluded && (
                      <span className="absolute top-3 right-3 bg-sky-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                        <Plane className="w-3 h-3" />
                        <span>Flights Included</span>
                      </span>
                    )}
                    <div className="absolute bottom-3 left-3 bg-slate-900/85 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-md">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>{pkg.duration}</span>
                    </div>
                    <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md text-slate-900 text-xs font-black px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-md">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      <span>{pkg.rating || 4.8}</span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-4 sm:p-5">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mb-1">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{pkg.destination}</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-snug line-clamp-2">
                      {pkg.title}
                    </h3>

                    {/* Inclusions */}
                    <div className="mt-3 space-y-1">
                      {(pkg.inclusions || []).slice(0, 3).map((inc, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span className="truncate">{inc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Price & Action */}
                <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between">
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
                        ₹{pkg.price.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-slate-400 line-through">
                        ₹{(pkg.originalPrice || Math.round(pkg.price * 1.25)).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <span className="text-[10px] text-emerald-600 font-bold">per person • twin sharing</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedPkg(pkg)}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-md shadow-emerald-600/30 transition-all cursor-pointer active:scale-95"
                  >
                    Book Package
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

      </div>

      {/* MODAL: Book / Inquire Package */}
      <AnimatePresence>
        {selectedPkg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md">
            <div className="fixed inset-0" onClick={() => setSelectedPkg(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 border border-slate-100 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Express Tour Reservation
                  </span>
                  <h3 className="text-base font-black text-slate-900">{selectedPkg.title}</h3>
                  <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-emerald-600" /> {selectedPkg.destination} • {selectedPkg.duration}
                  </div>
                </div>
                <button onClick={() => setSelectedPkg(null)} className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 cursor-pointer">
                  <X className="w-4 h-4 text-slate-600" />
                </button>
              </div>

              <form onSubmit={handleInquirySubmit} className="space-y-4 py-4">
                {/* Summary Card */}
                <div className="p-3.5 bg-emerald-50/80 rounded-2xl border border-emerald-100 flex items-center justify-between text-xs font-bold text-slate-700">
                  <div>
                    <div className="text-[10px] text-slate-400 font-normal">Package Fare</div>
                    <div>₹{selectedPkg.price.toLocaleString('en-IN')} / person</div>
                    <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                      {inqTravellers} {inqTravellers === 1 ? 'Traveller' : 'Travellers'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 font-normal">Total Estimated Amount</div>
                    <div className="text-base font-black text-emerald-700 font-mono">
                      ₹{(selectedPkg.price * inqTravellers).toLocaleString('en-IN')}
                    </div>
                    <span className="text-[9px] text-emerald-600 font-bold">Includes Sightseeing &amp; Stays</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Primary Traveller Name *</label>
                  <input
                    type="text"
                    required
                    value={inqName}
                    onChange={(e) => setInqName(e.target.value)}
                    placeholder="e.g. Manish Sharma"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp / Phone *</label>
                    <input
                      type="tel"
                      required
                      value={inqPhone}
                      onChange={(e) => setInqPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Approx. Travel Date</label>
                    <input
                      type="date"
                      required
                      value={inqDate}
                      onChange={(e) => setInqDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={inqEmail}
                      onChange={(e) => setInqEmail(e.target.value)}
                      placeholder="traveller@example.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Total Travellers</label>
                    <select
                      value={inqTravellers}
                      onChange={(e) => setInqTravellers(parseInt(e.target.value) || 2)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="1">1 Solo Traveller</option>
                      <option value="2">2 Travellers (Couple / Twin)</option>
                      <option value="3">3 Travellers</option>
                      <option value="4">4 Travellers (Family)</option>
                      <option value="6">6+ Travellers (Group)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-extrabold text-sm shadow-md shadow-emerald-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span>Submitting Reservation...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Confirm Tour Reservation &amp; Get Quote</span>
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRMED BOOKING / VOUCHER MODAL */}
      <AnimatePresence>
        {confirmedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full text-center shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto"
            >
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              <h3 className="text-xl font-black text-slate-900">Holiday Booking Request Confirmed!</h3>
              <p className="text-xs text-slate-500 mt-1">
                Your tour reservation for <strong className="text-slate-800">{confirmedBooking.package.title}</strong> has been logged.
              </p>

              {/* Voucher Card */}
              <div className="my-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-left space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Inquiry ID</span>
                  <span className="font-mono font-black text-emerald-700 text-sm">{confirmedBooking.inquiryId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Destination:</span>
                  <strong className="text-slate-800">{confirmedBooking.package.destination}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Primary Traveller:</span>
                  <strong className="text-slate-800">{confirmedBooking.customerName || 'Valued Guest'}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Travel Date:</span>
                  <strong className="text-slate-800">{confirmedBooking.travelDate}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Party Size:</span>
                  <strong className="text-slate-800">{confirmedBooking.travellers} Travellers</strong>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <span className="text-slate-700 font-bold">Estimated Cost:</span>
                  <strong className="text-base font-black text-emerald-600 font-mono">
                    ₹{confirmedBooking.totalAmount.toLocaleString('en-IN')}
                  </strong>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Summary
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmedBooking(null)}
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs cursor-pointer"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

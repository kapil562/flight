import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Palmtree, MapPin, Clock, Star, Sparkles, Check, X, Plane, ShieldCheck, Phone, Search, Users, Calendar, MessageCircle, Printer, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../utils/api';

export default function HolidaysSection() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all'); // 'all' | 'domestic' | 'international'
  const [searchQuery, setSearchQuery] = useState('');
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
    const isIndia = p.destination?.toLowerCase().includes('india') || 
                    p.id?.includes('GOA') || 
                    p.id?.includes('KASH') || 
                    p.id?.includes('KER') ||
                    p.id?.includes('MAN') ||
                    p.id?.includes('RAJ');

    if (filterType === 'domestic' && !isIndia) return false;
    if (filterType === 'international' && isIndia) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const match = (p.title && p.title.toLowerCase().includes(q)) ||
                    (p.destination && p.destination.toLowerCase().includes(q)) ||
                    (p.badge && p.badge.toLowerCase().includes(q));
      if (!match) return false;
    }

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
    <div className="py-6 sm:py-8 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
      
      {/* Banner - Obsidian Luxury Apple Header */}
      <div className="bg-slate-950 rounded-3xl sm:rounded-4xl p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden mb-8 border border-white/10">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-bold text-slate-200 mb-3">
            <Palmtree className="w-3.5 h-3.5 text-amber-300" />
            Curated Bespoke Holiday Packages
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight mb-2">
            Handcrafted Travel Experiences &amp; Group Tours
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-medium">
            All-inclusive holiday itineraries with 5-star stays, private airport transfers, sightseeing &amp; verified guides.
          </p>
        </div>

        {/* Search & Segmented Filter Pill Dock */}
        <div className="relative z-10 mt-6 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-7 bg-white text-slate-900 rounded-2xl p-2.5 flex items-center gap-2 shadow-lg border border-slate-200/80">
            <Search className="w-4 h-4 text-slate-500 shrink-0 ml-1.5" />
            <input
              type="text"
              placeholder="Search destination, state or country (e.g. Goa, Kashmir, Dubai, Bali, Kerala)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs font-extrabold text-slate-900 focus:outline-none placeholder:text-slate-400"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="md:col-span-5 bg-white/10 backdrop-blur-md p-1 rounded-2xl flex items-center gap-1 border border-white/15 overflow-x-auto scrollbar-none">
            {[
              { id: 'all', label: 'All Packages' },
              { id: 'domestic', label: 'Domestic India' },
              { id: 'international', label: 'International' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterType(tab.id)}
                className={`flex-1 px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap text-center ${
                  filterType === tab.id
                    ? 'bg-white text-slate-950 shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>Featured Tour Packages</span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
              {filtered.length} Available
            </span>
          </h3>
          <p className="text-xs text-slate-500 font-medium">Bespoke itineraries backed by 24/7 dedicated travel concierge.</p>
        </div>
      </div>

      {/* Packages Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div key={n} className="bg-white rounded-3xl p-4 border border-slate-200/80 animate-pulse space-y-3">
              <div className="h-56 bg-slate-100 rounded-2xl"></div>
              <div className="h-5 bg-slate-200 rounded w-3/4"></div>
              <div className="h-4 bg-slate-100 rounded w-1/2"></div>
              <div className="h-10 bg-slate-100 rounded-xl mt-4"></div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs max-w-lg mx-auto">
          <div className="w-16 h-16 bg-slate-100 text-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Palmtree className="w-8 h-8" />
          </div>
          <h4 className="text-lg font-black text-slate-900 mb-1">No holiday packages found</h4>
          <p className="text-xs text-slate-500 mb-6">
            Try a different search keyword or switch between India tours and International destinations.
          </p>
          <button
            type="button"
            onClick={() => { setSearchQuery(''); setFilterType('all'); }}
            className="px-5 py-2.5 bg-slate-900 text-white text-xs font-black rounded-2xl shadow-md hover:bg-black transition-all cursor-pointer"
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
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.985 }}
              className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Photo & Duration Badge */}
                <div className="relative h-60 overflow-hidden bg-slate-100">
                  <img
                    src={pkg.image}
                    alt={pkg.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  {pkg.badge && (
                    <span className="absolute top-3.5 left-3.5 bg-slate-950/80 backdrop-blur-md text-amber-300 text-[10px] font-black px-2.5 py-1 rounded-full border border-amber-400/30 shadow-md">
                      {pkg.badge}
                    </span>
                  )}
                  {pkg.flightsIncluded && (
                    <span className="absolute top-3.5 right-3.5 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                      <Plane className="w-3 h-3 text-sky-400" />
                      <span>Flights Included</span>
                    </span>
                  )}
                  <div className="absolute bottom-3.5 left-3.5 bg-slate-950/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-md">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{pkg.duration}</span>
                  </div>
                  <div className="absolute bottom-3.5 right-3.5 bg-white/95 backdrop-blur-md text-slate-900 text-xs font-black px-2.5 py-1 rounded-xl flex items-center gap-1 shadow-md">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>{pkg.rating || 4.8}</span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-5">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 mb-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                    <span className="truncate">{pkg.destination}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-snug line-clamp-2">
                    {pkg.title}
                  </h3>

                  {/* Inclusions */}
                  <div className="mt-3.5 space-y-1.5">
                    {(pkg.inclusions || []).slice(0, 3).map((inc, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{inc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Price & Action */}
              <div className="p-5 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
                      ₹{pkg.price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-slate-400 line-through">
                      ₹{(pkg.originalPrice || Math.round(pkg.price * 1.25)).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-black">per person • twin sharing</span>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedPkg(pkg)}
                  className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-black text-white font-black text-xs shadow-md transition-all cursor-pointer active:scale-95"
                >
                  Book Package
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* MODAL: Book / Inquire Package */}
      <AnimatePresence>
        {selectedPkg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md">
            <div className="fixed inset-0" onClick={() => setSelectedPkg(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative z-10 w-full max-w-lg bg-white rounded-3xl sm:rounded-4xl shadow-2xl p-6 sm:p-7 border border-slate-200/80 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Express Tour Reservation
                  </span>
                  <h3 className="text-base font-black text-slate-900 mt-0.5">{selectedPkg.title}</h3>
                  <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 font-medium">
                    <MapPin className="w-3 h-3 text-slate-600" /> {selectedPkg.destination} • {selectedPkg.duration}
                  </div>
                </div>
                <button onClick={() => setSelectedPkg(null)} className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleInquirySubmit} className="space-y-4 py-4">
                {/* Summary Card */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs font-bold text-slate-800">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Package Fare</div>
                    <div className="mt-0.5 font-black">₹{selectedPkg.price.toLocaleString('en-IN')} / person</div>
                    <div className="text-[10px] text-slate-500 font-semibold mt-0.5">
                      {inqTravellers} {inqTravellers === 1 ? 'Traveller' : 'Travellers'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Estimated Cost</div>
                    <div className="text-lg font-black text-slate-950 font-mono">
                      ₹{(selectedPkg.price * inqTravellers).toLocaleString('en-IN')}
                    </div>
                    <span className="text-[9px] text-emerald-600 font-black">Stays &amp; Sightseeing Included</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Primary Traveller Name</label>
                  <input
                    type="text"
                    required
                    value={inqName}
                    onChange={(e) => setInqName(e.target.value)}
                    placeholder="e.g. Manish Sharma"
                    className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 focus:border-slate-900 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">WhatsApp / Phone</label>
                    <input
                      type="tel"
                      required
                      value={inqPhone}
                      onChange={(e) => setInqPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 focus:border-slate-900 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Travel Date</label>
                    <input
                      type="date"
                      required
                      value={inqDate}
                      onChange={(e) => setInqDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-slate-900 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
                    <input
                      type="email"
                      value={inqEmail}
                      onChange={(e) => setInqEmail(e.target.value)}
                      placeholder="traveller@example.com"
                      className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 focus:border-slate-900 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Total Travellers</label>
                    <select
                      value={inqTravellers}
                      onChange={(e) => setInqTravellers(parseInt(e.target.value) || 2)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-slate-900 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none cursor-pointer"
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
                  className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-black disabled:opacity-50 text-white font-black text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <span>Submitting Reservation...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Confirm Reservation &amp; Get Itinerary</span>
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
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl sm:rounded-4xl p-6 sm:p-7 max-w-md w-full text-center shadow-2xl border border-slate-200/80 max-h-[90vh] overflow-y-auto"
            >
              <div className="w-13 h-13 bg-slate-950 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md">
                <Check className="w-7 h-7 text-emerald-400 stroke-[3]" />
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Holiday Reservation Confirmed</h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Your tour reservation for <strong className="text-slate-800">{confirmedBooking.package.title}</strong> has been received by our luxury concierge.
              </p>

              {/* Voucher Card */}
              <div className="my-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs text-left space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inquiry ID</span>
                  <span className="font-mono font-black text-slate-900 text-sm">{confirmedBooking.inquiryId}</span>
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
                  <strong className="text-base font-black text-slate-950 font-mono">
                    ₹{confirmedBooking.totalAmount.toLocaleString('en-IN')}
                  </strong>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Summary
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmedBooking(null)}
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-black text-white font-black rounded-2xl text-xs cursor-pointer transition-colors"
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

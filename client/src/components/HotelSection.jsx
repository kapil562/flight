import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Calendar, Users, Star, Check, Wifi, Coffee, Waves, Sparkles, Building, Building2, X, Printer, ShieldCheck, Tag, Compass, ChevronDown } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../utils/api';
import CustomDatePicker from './CustomDatePicker';

const POPULAR_DESTINATIONS = [
  { name: 'Goa', label: '🏖️ Goa', desc: 'Beach Resorts & Nightlife' },
  { name: 'Dubai', label: '🏙️ Dubai', desc: 'Luxury Skyscrapers & Malls' },
  { name: 'Mumbai', label: '🌆 Mumbai', desc: 'Financial Hub & Marine Drive' },
  { name: 'Manali', label: '🏔️ Manali', desc: 'Snow Peaks & Hill Stays' },
  { name: 'Jaipur', label: '🏰 Jaipur', desc: 'Heritage Palaces & Haveli' },
  { name: 'Delhi', label: '🏛️ Delhi', desc: 'Capital Luxury & Culture' },
  { name: 'Bangalore', label: '🌳 Bangalore', desc: 'Garden City & Tech Parks' },
  { name: 'Kashmir', label: '❄️ Kashmir', desc: 'Houseboats & Valley Views' },
  { name: 'Udaipur', label: '👑 Udaipur', desc: 'Lake Palaces & Royalty' },
  { name: 'Kerala', label: '🌴 Kerala', desc: 'Backwaters & Ayurveda' }
];

const getTodayDateString = (offsetDays = 0) => {
  const d = new Date();
  if (offsetDays) d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function HotelSection({ settings = {}, brand = null }) {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cityInput, setCityInput] = useState('Goa');
  const [activeCity, setActiveCity] = useState('Goa');
  const [selectedStars, setSelectedStars] = useState('all');
  const [stayType, setStayType] = useState('all');
  const [dataSource, setDataSource] = useState('');
  const [bookingHotel, setBookingHotel] = useState(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Destination dropdown state
  const [showCityDrop, setShowCityDrop] = useState(false);
  const [searchCityQuery, setSearchCityQuery] = useState('');
  const cityRef = useRef(null);

  // Occupancy modal state
  const [showPaxModal, setShowPaxModal] = useState(false);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);
  const paxRef = useRef(null);

  // Search parameters
  const [checkIn, setCheckIn] = useState(() => getTodayDateString(1));
  const [checkOut, setCheckOut] = useState(() => getTodayDateString(3));
  const guests = `${adults + children} Guests, ${rooms} Room${rooms > 1 ? 's' : ''}`;

  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (cityRef.current && !cityRef.current.contains(e.target)) setShowCityDrop(false);
      if (paxRef.current && !paxRef.current.contains(e.target)) setShowPaxModal(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate nights
  const getNights = () => {
    try {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      const diff = Math.round((end - start) / (1000 * 60 * 60 * 24));
      return diff > 0 ? diff : 1;
    } catch {
      return 1;
    }
  };
  const nights = getNights();

  // Load user details if available
  useEffect(() => {
    try {
      const userStr = localStorage.getItem('asg_user');
      if (userStr) {
        const u = JSON.parse(userStr);
        if (u.name && !guestName) setGuestName(u.name);
        if (u.phone && !guestPhone) setGuestPhone(u.phone);
        if (u.email && !guestEmail) setGuestEmail(u.email);
      }
    } catch (e) {
      console.warn('Failed to parse user session', e);
    }
  }, [bookingHotel]);

  // Fetch hotels for a given city
  const fetchHotels = async (targetCity = '') => {
    setLoading(true);
    try {
      const res = await api.getHotels(targetCity);
      if (res.success) {
        setHotels(res.data || []);
        setDataSource(res.source || 'Verified Partner Network');
        if (targetCity) setActiveCity(targetCity);
      }
    } catch (err) {
      console.error('Failed to load hotels:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchHotels('Goa');
  }, []);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const query = cityInput.trim() || 'Goa';
    setShowCityDrop(false);
    fetchHotels(query);
  };

  const handleQuickDestination = (destName) => {
    setCityInput(destName);
    setShowCityDrop(false);
    fetchHotels(destName);
  };

  const filteredHotels = hotels.filter(h => {
    if (selectedStars === 'all') return true;
    return h.stars === parseInt(selectedStars);
  });

  const handleBookHotel = async (e) => {
    e.preventDefault();
    if (!bookingHotel) return;
    setIsSubmitting(true);

    const totalPrice = bookingHotel.price * nights;

    try {
      const res = await api.bookHotel({
        hotelId: bookingHotel.id,
        hotelName: bookingHotel.name,
        city: bookingHotel.city || activeCity,
        customerName: guestName || 'Valued Guest',
        customerPhone: guestPhone || '',
        customerEmail: guestEmail || '',
        checkIn,
        checkOut,
        guests,
        totalPrice,
        paymentType: 'Pay at Hotel'
      });

      const confirmed = {
        bookingId: res.booking?.bookingId || ('HTL-' + Math.floor(100000 + Math.random() * 900000)),
        hotel: bookingHotel,
        checkIn,
        checkOut,
        nights,
        guests,
        totalAmount: totalPrice,
        status: 'CONFIRMED',
        customerName: guestName,
        customerPhone: guestPhone,
        customerEmail: guestEmail,
        createdAt: new Date().toISOString()
      };

      try {
        const prev = JSON.parse(localStorage.getItem('asg_hotel_bookings') || '[]');
        prev.unshift(confirmed);
        localStorage.setItem('asg_hotel_bookings', JSON.stringify(prev));
      } catch (e) {
        console.warn('Could not cache booking locally', e);
      }

      setBookingConfirmed(confirmed);
      setBookingHotel(null);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    } catch (err) {
      console.error('Hotel booking error', err);
      alert('Unable to complete booking right now. Please try again.');
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
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
          
          {/* Banner Title */}
          <motion.div 
            className="text-center max-w-3xl mx-auto mb-3 sm:mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sky-200 text-xs font-semibold uppercase tracking-wider mb-3">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Verified Luxury Hotels &amp; Stays • Best Guaranteed Rates
            </div>
            <h1 className="text-xl sm:text-5xl font-extrabold tracking-tight text-white mb-1 sm:mb-2 leading-tight">
              Book Worldwide Hotels at <span className="bg-gradient-to-r from-sky-400 via-cyan-300 to-amber-300 bg-clip-text text-transparent">Guaranteed Lowest Fares</span>
            </h1>
            <p className="hidden sm:block text-slate-300 text-xs sm:text-base">
              Real-time live Google Places search for over 500,000+ luxury resorts, 5-star hotels &amp; villas with zero advance prepayment.
            </p>
          </motion.div>

          {/* Elevated White Search Box Card */}
          <motion.div 
            className="bg-white text-slate-800 rounded-2xl sm:rounded-3xl p-3 sm:p-7 shadow-2xl border border-slate-100 relative"
            initial={{ opacity: 0, y: 25, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          >
            {/* Top Options Row: Stay Type & Rating */}
            <div className="flex items-center justify-between gap-1.5 pb-2.5 sm:pb-4 mb-2.5 sm:mb-4 border-b border-slate-100">
              <div className="inline-flex items-center bg-slate-100 p-0.5 sm:p-1 rounded-xl sm:rounded-2xl gap-0.5 sm:gap-1">
                {[
                  { id: 'all', label: 'All Stays' },
                  { id: '5', label: '⭐ 5-Star Luxury' },
                  { id: '4', label: '⭐ 4-Star Premium' },
                  { id: 'resorts', label: 'Resorts & Villas' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setStayType(tab.id);
                      if (tab.id === '5' || tab.id === '4') setSelectedStars(tab.id);
                      else setSelectedStars('all');
                    }}
                    className={`px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                      stayType === tab.id ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Free Cancellation Badge */}
              <div className="hidden md:flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                <Check className="w-3.5 h-3.5" />
                <span>Zero Prepayment • Free Cancellation</span>
              </div>
            </div>

            {/* Input Grid (Destination, Check-in, Check-out, Guests, Search CTA) */}
            <form onSubmit={handleSearchSubmit}>
              <div className="grid grid-cols-2 md:grid-cols-12 gap-2 sm:gap-3 relative items-center">
                
                {/* Destination / City */}
                <div className="col-span-2 md:col-span-4 relative" ref={cityRef}>
                  <div
                    onClick={() => setShowCityDrop(!showCityDrop)}
                    className="cursor-pointer p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border border-slate-200 hover:border-sky-500 transition-colors bg-slate-50/50 hover:bg-white h-full min-h-[76px] sm:min-h-[84px] flex flex-col justify-between"
                  >
                    <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5 sm:mb-1">
                      <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-600" />
                      <span>Destination / City</span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <div className="min-w-0 pr-2">
                        <h3 className="text-sm sm:text-lg font-extrabold leading-none truncate text-slate-900 capitalize">
                          {cityInput || 'Select City'}
                        </h3>
                        <p className="text-[10px] sm:text-xs truncate max-w-[180px] sm:max-w-[220px] mt-0.5 text-slate-500">
                          India &amp; International • Best Rates
                        </p>
                      </div>
                      <span className="text-xs font-mono font-bold text-sky-600 px-2 py-0.5 bg-sky-100 rounded-md shrink-0">
                        Select
                      </span>
                    </div>
                  </div>

                  {/* Destination Dropdown */}
                  <AnimatePresence>
                    {showCityDrop && (
                      <motion.div 
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ duration: 0.18 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 max-h-80 flex flex-col p-2"
                      >
                        <div className="p-2 border-b border-slate-100">
                          <input
                            type="text"
                            autoFocus
                            placeholder="Type any city or country (e.g. Goa, Dubai, Manali)..."
                            value={searchCityQuery}
                            onChange={(e) => setSearchCityQuery(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                if (searchCityQuery.trim()) {
                                  setCityInput(searchCityQuery.trim());
                                  fetchHotels(searchCityQuery.trim());
                                  setShowCityDrop(false);
                                }
                              }
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-sky-500"
                          />
                        </div>
                        <div className="overflow-y-auto max-h-64 p-1">
                          {POPULAR_DESTINATIONS
                            .filter(d => !searchCityQuery || d.name.toLowerCase().includes(searchCityQuery.toLowerCase()) || d.label.toLowerCase().includes(searchCityQuery.toLowerCase()))
                            .map(dest => (
                              <div
                                key={dest.name}
                                onClick={() => {
                                  setCityInput(dest.name);
                                  fetchHotels(dest.name);
                                  setShowCityDrop(false);
                                  setSearchCityQuery('');
                                }}
                                className={`flex items-center justify-between p-2.5 rounded-xl hover:bg-sky-50 cursor-pointer transition-colors ${
                                  cityInput.toLowerCase() === dest.name.toLowerCase() ? 'bg-sky-50 font-bold' : ''
                                }`}
                              >
                                <div className="min-w-0 pr-2">
                                  <div className="text-sm font-bold text-slate-900 truncate">
                                    {dest.label}
                                  </div>
                                  <div className="text-xs text-slate-500 truncate">
                                    {dest.desc}
                                  </div>
                                </div>
                                <span className="text-xs font-mono font-bold text-sky-600 px-2 py-0.5 bg-sky-100 rounded-md shrink-0">
                                  Search
                                </span>
                              </div>
                            ))}

                          {searchCityQuery.trim().length >= 2 && (
                            <div
                              onClick={() => {
                                setCityInput(searchCityQuery.trim());
                                fetchHotels(searchCityQuery.trim());
                                setShowCityDrop(false);
                                setSearchCityQuery('');
                              }}
                              className="p-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 cursor-pointer text-sky-700 text-xs font-bold flex items-center justify-between mt-1 border border-sky-200"
                            >
                              <span>🏨 Search hotels in "{searchCityQuery.trim()}"</span>
                              <span className="font-mono bg-sky-600 text-white px-2 py-0.5 rounded text-[10px]">Go</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Check-In Date */}
                <div className="col-span-1 md:col-span-2">
                  <CustomDatePicker
                    label="Check-in"
                    value={checkIn}
                    onChange={(date) => {
                      setCheckIn(date);
                      if (checkOut <= date) {
                        try {
                          const d = new Date(date);
                          d.setDate(d.getDate() + 1);
                          const y = d.getFullYear();
                          const m = String(d.getMonth() + 1).padStart(2, '0');
                          const day = String(d.getDate()).padStart(2, '0');
                          setCheckOut(`${y}-${m}-${day}`);
                        } catch {}
                      }
                    }}
                    minDate={getTodayDateString()}
                  />
                </div>

                {/* Check-Out Date */}
                <div className="col-span-1 md:col-span-2">
                  <CustomDatePicker
                    label="Check-out"
                    value={checkOut}
                    onChange={(date) => setCheckOut(date)}
                    minDate={checkIn || getTodayDateString(1)}
                    subText={`${nights} ${nights === 1 ? 'Night' : 'Nights'}`}
                    align="right"
                  />
                </div>

                {/* Guests & Rooms Selector */}
                <div className="col-span-2 md:col-span-2 relative" ref={paxRef}>
                  <div
                    onClick={() => setShowPaxModal(!showPaxModal)}
                    className="cursor-pointer p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border border-slate-200 hover:border-sky-500 transition-colors bg-slate-50/50 hover:bg-white h-full min-h-[76px] sm:min-h-[84px] flex flex-col justify-between"
                  >
                    <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5 sm:mb-1">
                      <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-600 shrink-0" />
                      <span className="truncate">Guests &amp; Rooms</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-900 text-sm sm:text-base truncate">
                        {adults + children} Guests
                      </span>
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    </div>
                    <div className="text-[10px] sm:text-xs font-semibold text-sky-700 capitalize truncate mt-0.5">
                      {rooms} {rooms === 1 ? 'Room' : 'Rooms'} • {adults} Adults{children > 0 ? `, ${children} Kids` : ''}
                    </div>
                  </div>

                  {/* Guests Dropdown Modal */}
                  <AnimatePresence>
                    {showPaxModal && (
                      <motion.div 
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ duration: 0.18 }}
                        className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 text-slate-800"
                      >
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Rooms &amp; Occupancy</h4>
                        
                        {/* Rooms */}
                        <div className="flex items-center justify-between py-2 border-b border-slate-100">
                          <div>
                            <div className="font-bold text-sm">Rooms</div>
                            <div className="text-xs text-slate-500">Number of rooms</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setRooms(r => Math.max(1, r - 1))}
                              className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 flex items-center justify-center cursor-pointer"
                            >-</button>
                            <span className="w-5 text-center font-bold">{rooms}</span>
                            <button
                              type="button"
                              onClick={() => setRooms(r => Math.min(5, r + 1))}
                              className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 flex items-center justify-center cursor-pointer"
                            >+</button>
                          </div>
                        </div>

                        {/* Adults */}
                        <div className="flex items-center justify-between py-2 border-b border-slate-100">
                          <div>
                            <div className="font-bold text-sm">Adults</div>
                            <div className="text-xs text-slate-500">12+ years</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setAdults(a => Math.max(1, a - 1))}
                              className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 flex items-center justify-center cursor-pointer"
                            >-</button>
                            <span className="w-5 text-center font-bold">{adults}</span>
                            <button
                              type="button"
                              onClick={() => setAdults(a => Math.min(10, a + 1))}
                              className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 flex items-center justify-center cursor-pointer"
                            >+</button>
                          </div>
                        </div>

                        {/* Children */}
                        <div className="flex items-center justify-between py-2 border-b border-slate-100">
                          <div>
                            <div className="font-bold text-sm">Children</div>
                            <div className="text-xs text-slate-500">0 - 11 years</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setChildren(c => Math.max(0, c - 1))}
                              className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 flex items-center justify-center cursor-pointer"
                            >-</button>
                            <span className="w-5 text-center font-bold">{children}</span>
                            <button
                              type="button"
                              onClick={() => setChildren(c => Math.min(6, c + 1))}
                              className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 flex items-center justify-center cursor-pointer"
                            >+</button>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setShowPaxModal(false)}
                          className="w-full mt-3 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                        >
                          Done
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Big Search CTA Button */}
                <div className="col-span-2 md:col-span-2">
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full h-full min-h-[52px] sm:min-h-[84px] px-4 py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-sky-600/30 hover:shadow-sky-600/50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Search className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                    <span className="whitespace-nowrap">SEARCH HOTELS</span>
                  </motion.button>
                </div>

              </div>
            </form>

            {/* Bottom Row: Trust Badges */}
            <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
              <div className="flex items-center gap-3 overflow-x-auto scrollbar-none pb-0.5">
                <span className="flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  <Check className="w-3 h-3" /> Free Cancellation
                </span>
                <span className="flex items-center gap-1 font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md">
                  <ShieldCheck className="w-3 h-3" /> Pay at Hotel Option
                </span>
                <span className="hidden sm:flex items-center gap-1 font-semibold text-slate-700">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> 500,000+ Verified Properties
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">All prices include base rates &amp; instant booking confirmation</span>
            </div>

          </motion.div>

          {/* Quick Destination Shortcuts (Harmonized with Flights popular routes) */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-sky-200">
            <span className="font-semibold text-slate-400 flex items-center gap-1">
              <Compass className="w-3.5 h-3.5" /> Popular Destinations:
            </span>
            {POPULAR_DESTINATIONS.slice(0, 8).map(dest => (
              <button
                key={dest.name}
                type="button"
                onClick={() => handleQuickDestination(dest.name)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors backdrop-blur-xs cursor-pointer ${
                  activeCity.toLowerCase() === dest.name.toLowerCase()
                    ? 'bg-white text-slate-900 border-white font-bold shadow-xs'
                    : 'bg-white/10 hover:bg-white/20 border-white/10 text-white'
                }`}
              >
                {dest.label}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Results Section */}
      <div className="py-6 sm:py-8 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Results Header & Filter Chips */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black text-slate-900">
                Hotels &amp; Stays in <span className="text-sky-600 capitalize">{activeCity}</span>
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-700 text-xs font-bold">
                {filteredHotels.length} Found
              </span>
            </div>
            {dataSource && (
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Live Feed: <strong>{dataSource}</strong>
              </p>
            )}
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-bold text-slate-400 shrink-0">Filter:</span>
            {[
              { id: 'all', label: 'All Stays' },
              { id: '5', label: '⭐ 5-Star Luxury' },
              { id: '4', label: '⭐ 4-Star Premium' }
            ].map(chip => (
              <button
                key={chip.id}
                type="button"
                onClick={() => setSelectedStars(chip.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  selectedStars === chip.id
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Hotel Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <div key={n} className="bg-white rounded-3xl p-4 border border-slate-200 animate-pulse space-y-3">
                <div className="h-48 bg-slate-200 rounded-2xl"></div>
                <div className="h-5 bg-slate-200 rounded w-3/4"></div>
                <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                <div className="h-10 bg-slate-100 rounded-xl mt-4"></div>
              </div>
            ))}
          </div>
        ) : filteredHotels.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs max-w-lg mx-auto">
            <div className="w-16 h-16 bg-sky-50 text-sky-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-black text-slate-900 mb-1">No hotels found in "{activeCity}"</h4>
            <p className="text-xs text-slate-500 mb-6">
              Try searching for a different destination or pick from popular choices like Goa, Dubai, Mumbai or Jaipur.
            </p>
            <button
              type="button"
              onClick={() => handleQuickDestination('Goa')}
              className="px-5 py-2.5 bg-sky-600 text-white text-xs font-extrabold rounded-xl shadow-md hover:bg-sky-500 transition-all cursor-pointer"
            >
              Explore Goa Hotels
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHotels.map(hotel => (
              <motion.div
                key={hotel.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Image & Badge */}
                  <div className="relative h-52 overflow-hidden bg-slate-100">
                    <img
                      src={hotel.image}
                      alt={hotel.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    {hotel.badge && (
                      <span className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-md text-amber-300 text-[10px] font-black px-2.5 py-1 rounded-full border border-amber-400/30 flex items-center gap-1 shadow-md">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        {hotel.badge}
                      </span>
                    )}
                    {hotel.verified && (
                      <span className="absolute top-3 right-3 bg-blue-600/90 backdrop-blur-md text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-md">
                        Verified Stay
                      </span>
                    )}
                    <span className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md text-slate-900 text-xs font-black px-2.5 py-1 rounded-xl shadow-md flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>{hotel.rating}</span>
                      <span className="text-[10px] text-slate-400">({hotel.reviewsCount})</span>
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-4 sm:p-5">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-sky-600 mb-1">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{hotel.location}</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-snug line-clamp-1">
                      {hotel.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{hotel.roomType || 'Standard Deluxe Suite'}</p>

                    {/* Amenities */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {(hotel.amenities || ['Free Wi-Fi', 'Breakfast', 'Pool']).slice(0, 3).map((amenity, idx) => (
                        <span key={idx} className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                          ✓ {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Price & Book CTA */}
                <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between">
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
                        ₹{hotel.price.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-slate-400 line-through">
                        ₹{(hotel.originalPrice || Math.round(hotel.price * 1.25)).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <span className="text-[10px] text-emerald-600 font-bold">
                      {hotel.discount || '20% OFF'} • per night
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setBookingHotel(hotel)}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-extrabold text-xs shadow-md shadow-sky-600/30 transition-all cursor-pointer active:scale-95"
                  >
                    Book Hotel
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

      </div>

      {/* MODAL: Book Hotel */}
      <AnimatePresence>
        {bookingHotel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md">
            <div className="fixed inset-0" onClick={() => setBookingHotel(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 border border-slate-100 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Express Hotel Reservation
                  </span>
                  <h3 className="text-lg font-black text-slate-900">{bookingHotel.name}</h3>
                  <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-sky-600" /> {bookingHotel.location}
                  </div>
                </div>
                <button onClick={() => setBookingHotel(null)} className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 cursor-pointer">
                  <X className="w-4 h-4 text-slate-600" />
                </button>
              </div>

              <form onSubmit={handleBookHotel} className="space-y-4 py-4">
                {/* Stay Summary Card */}
                <div className="p-3.5 bg-sky-50/80 rounded-2xl border border-sky-100 flex items-center justify-between text-xs font-bold text-slate-700">
                  <div>
                    <div className="text-[10px] text-slate-400 font-normal">Reservation Stay</div>
                    <div>{checkIn} to {checkOut}</div>
                    <div className="text-[10px] text-sky-700 font-semibold mt-0.5">
                      {nights} {nights === 1 ? 'Night' : 'Nights'} • {guests}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 font-normal">Total Price</div>
                    <div className="text-base font-black text-sky-700 font-mono">
                      ₹{(bookingHotel.price * nights).toLocaleString('en-IN')}
                    </div>
                    <span className="text-[9px] text-emerald-600 font-bold">Includes Taxes &amp; Fees</span>
                  </div>
                </div>

                {/* Primary Guest Details */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Primary Guest Full Name *</label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="e.g. Manish Sharma"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="guest@example.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                {/* Payment Option Note */}
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-800">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Zero Prepayment Required!</strong>
                    <span>Pay ₹{(bookingHotel.price * nights).toLocaleString('en-IN')} directly upon check-in at the hotel desk via Cash / UPI / Card. Free cancellation up to 24h before check-in.</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 disabled:opacity-50 text-white font-extrabold text-sm shadow-md shadow-sky-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span>Confirming Reservation...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Confirm &amp; Book (Pay at Hotel)</span>
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRMATION POPUP */}
      <AnimatePresence>
        {bookingConfirmed && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full text-center shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto"
            >
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              <h3 className="text-xl font-black text-slate-900">Hotel Booking Confirmed!</h3>
              <p className="text-xs text-slate-500 mt-1">
                Your reservation at <strong className="text-slate-800">{bookingConfirmed.hotel.name}</strong> has been secured and sent to the hotel desk.
              </p>

              {/* Voucher Card */}
              <div className="my-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-left space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Booking Reference</span>
                  <span className="font-mono font-black text-sky-700 text-sm">{bookingConfirmed.bookingId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Primary Guest:</span>
                  <strong className="text-slate-800">{bookingConfirmed.customerName || 'Valued Guest'}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Check-In:</span>
                  <strong className="text-slate-800">{bookingConfirmed.checkIn} (from 14:00)</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Check-Out:</span>
                  <strong className="text-slate-800">{bookingConfirmed.checkOut} (until 11:00)</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Duration:</span>
                  <strong className="text-slate-800">{bookingConfirmed.nights} Nights • {bookingConfirmed.guests}</strong>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <span className="text-slate-700 font-bold">Pay at Hotel:</span>
                  <strong className="text-base font-black text-emerald-600 font-mono">
                    ₹{bookingConfirmed.totalAmount.toLocaleString('en-IN')}
                  </strong>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Voucher
                </button>
                <button
                  type="button"
                  onClick={() => setBookingConfirmed(null)}
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

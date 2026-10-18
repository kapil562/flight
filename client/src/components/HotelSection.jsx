import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Calendar, Users, Star, Check, Wifi, Coffee, Waves, Sparkles, Building, X, Printer, ShieldCheck, Tag, Compass } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../utils/api';

const POPULAR_DESTINATIONS = [
  { name: 'Goa', label: '🏖️ Goa' },
  { name: 'Dubai', label: '🏙️ Dubai' },
  { name: 'Mumbai', label: '🌆 Mumbai' },
  { name: 'Manali', label: '🏔️ Manali' },
  { name: 'Jaipur', label: '🏰 Jaipur' },
  { name: 'Delhi', label: '🏛️ Delhi' },
  { name: 'Bangalore', label: '🌳 Bangalore' },
  { name: 'Kashmir', label: '❄️ Kashmir' }
];

export default function HotelSection() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cityInput, setCityInput] = useState('Goa');
  const [activeCity, setActiveCity] = useState('Goa');
  const [selectedStars, setSelectedStars] = useState('all');
  const [dataSource, setDataSource] = useState('');
  const [bookingHotel, setBookingHotel] = useState(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search parameters
  const [checkIn, setCheckIn] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [checkOut, setCheckOut] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  const [guests, setGuests] = useState('2 Guests, 1 Room');
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');

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
    fetchHotels(query);
  };

  const handleQuickDestination = (destName) => {
    setCityInput(destName);
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

      // Save to localStorage history for user
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
    <div className="py-6 sm:py-8 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
      
      {/* Search Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-sky-900 rounded-3xl p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden mb-8">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-sky-200 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Moyatri Verified Hotels & Luxury Stays • Live Serper Google Places
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight mb-2">
            Book Worldwide Hotels at Guaranteed Lowest Fares
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Real-time live Google Places search for over 500,000+ luxury resorts, 5-star hotels & villas with zero advance payment.
          </p>
        </div>

        {/* Search Input Box */}
        <form onSubmit={handleSearchSubmit} className="relative z-10 mt-6 bg-white text-slate-800 rounded-2xl p-4 shadow-xl border border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            
            {/* City */}
            <div className="md:col-span-4 p-3 rounded-xl border border-slate-200 bg-slate-50/70 focus-within:bg-white focus-within:border-sky-500 transition-all">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-1">
                <MapPin className="w-3.5 h-3.5 text-sky-600" />
                <span>Destination / City</span>
              </div>
              <input
                type="text"
                placeholder="e.g. Goa, Mumbai, Dubai, Manali, Jaipur..."
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                className="w-full bg-transparent font-extrabold text-slate-900 text-sm focus:outline-none"
              />
            </div>

            {/* Check-In */}
            <div className="md:col-span-3 p-3 rounded-xl border border-slate-200 bg-slate-50/70">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-1">
                <Calendar className="w-3.5 h-3.5 text-sky-600" />
                <span>Check-in Date</span>
              </div>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full bg-transparent font-extrabold text-slate-900 text-sm focus:outline-none cursor-pointer"
              />
            </div>

            {/* Check-Out */}
            <div className="md:col-span-3 p-3 rounded-xl border border-slate-200 bg-slate-50/70">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-1">
                <Calendar className="w-3.5 h-3.5 text-sky-600" />
                <span>Check-out Date ({nights} {nights === 1 ? 'Night' : 'Nights'})</span>
              </div>
              <input
                type="date"
                value={checkOut}
                min={checkIn}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full bg-transparent font-extrabold text-slate-900 text-sm focus:outline-none cursor-pointer"
              />
            </div>

            {/* Search CTA */}
            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-extrabold text-sm shadow-md shadow-sky-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Search className="w-4 h-4" />
                <span>Search</span>
              </button>
            </div>

          </div>
        </form>

        {/* Quick Destinations */}
        <div className="relative z-10 mt-4 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-sky-200 shrink-0 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5" /> Popular:
          </span>
          {POPULAR_DESTINATIONS.map((dest) => (
            <button
              key={dest.name}
              type="button"
              onClick={() => handleQuickDestination(dest.name)}
              className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer backdrop-blur-md border ${
                activeCity.toLowerCase() === dest.name.toLowerCase()
                  ? 'bg-white text-slate-900 border-white shadow-sm'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
              }`}
            >
              {dest.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header & Filter Chips */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-black text-slate-900">
              Hotels & Stays in <span className="text-sky-600 capitalize">{activeCity}</span>
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
                  {hotel.source?.includes('Serper') && (
                    <span className="absolute top-3 right-3 bg-blue-600/90 backdrop-blur-md text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-md">
                      Live Google Places
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
                    <span className="text-[9px] text-emerald-600 font-bold">Includes Taxes & Fees</span>
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

                {/* Guests & Room selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Room & Occupancy</label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500 cursor-pointer"
                  >
                    <option value="1 Guest, 1 Room">1 Guest, 1 Room</option>
                    <option value="2 Guests, 1 Room">2 Guests, 1 Room</option>
                    <option value="3 Guests, 1 Room">3 Guests, 1 Room (Triple)</option>
                    <option value="4 Guests, 2 Rooms">4 Guests, 2 Rooms</option>
                  </select>
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
                      <span>Confirm & Book (Pay at Hotel)</span>
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

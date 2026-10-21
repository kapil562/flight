import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeftRight, Calendar, Users, Search, Plane, PlaneTakeoff, PlaneLanding, 
  Check, ChevronDown, Plus, Trash2, ArrowRight, Sparkles, ShieldCheck, 
  TrendingUp, MapPin, Compass, Flame, Star, Award, Heart
} from 'lucide-react';
import CustomDatePicker from './CustomDatePicker';

const getTodayDateString = (offsetDays = 0) => {
  const d = new Date();
  if (offsetDays) d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const POPULAR_HUBS = [
  'DEL', 'BOM', 'BLR', 'HYD', 'GOI', 'GOX', 'CCU', 'MAA',
  'AMD', 'PNQ', 'JAI', 'LKO', 'COK', 'PAT', 'IXC', 'SXR',
  'VNS', 'GAU', 'DXB', 'BKK', 'SIN', 'LHR'
];

// Airbnb-Style Curated Destinations with Live Visual Assets and Explicit Origin-to-Destination Routes
const CURATED_DESTINATIONS = [
  {
    fromCode: 'DEL',
    fromCity: 'Delhi',
    code: 'GOI',
    city: 'Goa',
    title: 'Sun, Sand & Palm Beaches',
    price: '₹2,499',
    tag: 'Trending Now',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80'
  },
  {
    fromCode: 'BOM',
    fromCity: 'Mumbai',
    code: 'DXB',
    city: 'Dubai',
    title: 'Luxury Skylines & Safari',
    price: '₹8,999',
    tag: 'International Hit',
    image: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=600&q=80'
  },
  {
    fromCode: 'DEL',
    fromCity: 'Delhi',
    code: 'SXR',
    city: 'Srinagar',
    title: 'Kashmir Paradise & Dal Lake',
    price: '₹3,899',
    tag: 'Scenic Escape',
    image: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=600&q=80'
  },
  {
    fromCode: 'CCU',
    fromCity: 'Kolkata',
    code: 'BKK',
    city: 'Bangkok',
    title: 'Vibrant Temples & Nightlife',
    price: '₹7,499',
    tag: 'Best Value',
    image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=600&q=80'
  },
  {
    fromCode: 'DEL',
    fromCity: 'Delhi',
    code: 'BOM',
    city: 'Mumbai',
    title: 'City of Dreams & Marine Drive',
    price: '₹2,899',
    tag: 'Metro Direct',
    image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=600&q=80'
  },
  {
    fromCode: 'DEL',
    fromCity: 'Delhi',
    code: 'BLR',
    city: 'Bengaluru',
    title: 'Silicon Valley of India',
    price: '₹2,999',
    tag: 'Frequent Flights',
    image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=600&q=80'
  }
];

const filterAndSortAirports = (airportList, searchQuery) => {
  if (!airportList || !Array.isArray(airportList)) return [];
  const q = (searchQuery || '').trim().toLowerCase();
  
  if (!q) {
    const popularSet = new Set(POPULAR_HUBS);
    const popAirports = POPULAR_HUBS
      .map(code => airportList.find(a => (a.code || '').toUpperCase() === code))
      .filter(Boolean);
    const otherAirports = airportList.filter(a => !popularSet.has((a.code || '').toUpperCase()));
    return [...popAirports, ...otherAirports];
  }

  const filtered = airportList.filter(a => (
    (a.city && a.city.toLowerCase().includes(q)) || 
    (a.code && a.code.toLowerCase().includes(q)) || 
    (a.name && a.name.toLowerCase().includes(q)) ||
    (a.state && a.state.toLowerCase().includes(q)) ||
    (a.country && a.country.toLowerCase().includes(q))
  ));

  return filtered.sort((a, b) => {
    const aCode = (a.code || '').toLowerCase();
    const bCode = (b.code || '').toLowerCase();
    const aCity = (a.city || '').toLowerCase();
    const bCity = (b.city || '').toLowerCase();

    if (aCode === q && bCode !== q) return -1;
    if (bCode === q && aCode !== q) return 1;

    const aCityStarts = aCity.startsWith(q);
    const bCityStarts = bCity.startsWith(q);
    if (aCityStarts && !bCityStarts) return -1;
    if (bCityStarts && !aCityStarts) return 1;

    return (a.city || '').localeCompare(b.city || '');
  });
};

export default function HeroSearch({ airports, onSearch, searchParams, settings = {}, brand = null, loading = false }) {
  const [tripType, setTripType] = useState(searchParams?.tripType || 'oneWay'); // 'oneWay' | 'roundTrip' | 'multiCity'
  const [fromCode, setFromCode] = useState(searchParams?.from || 'DEL');
  const [toCode, setToCode] = useState(searchParams?.to || 'BOM');
  const [departureDate, setDepartureDate] = useState(searchParams?.date || getTodayDateString(1));
  const [returnDate, setReturnDate] = useState('');
  const [travelClass, setTravelClass] = useState(searchParams?.travelClass || 'economy');
  const [passengers, setPassengers] = useState(searchParams?.passengers || { adults: 1, children: 0, infants: 0 });
  const [specialFare, setSpecialFare] = useState(searchParams?.specialFare || 'regular');

  // Multi-City flight legs state
  const [legs, setLegs] = useState(() => {
    if (searchParams?.legs && Array.isArray(searchParams.legs) && searchParams.legs.length >= 2) {
      return searchParams.legs;
    }
    return [
      { from: 'DEL', to: 'BOM', date: getTodayDateString(1) },
      { from: 'BOM', to: 'BLR', date: getTodayDateString(3) }
    ];
  });
  const [activeLegDrop, setActiveLegDrop] = useState(null);
  const [legSearch, setLegSearch] = useState('');
  const multiCityRef = useRef(null);

  const handleTripTypeChange = (type) => {
    setTripType(type);
    if (type === 'roundTrip' && (!returnDate || returnDate < departureDate)) {
      const parts = (departureDate || getTodayDateString(1)).split('-').map(Number);
      const d = new Date(parts[0], parts[1] - 1, parts[2] + 3);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      setReturnDate(`${y}-${m}-${day}`);
    }
    if (type === 'multiCity') {
      setLegs(prev => {
        const updated = [...prev];
        const origin0 = updated[0]?.from || fromCode || 'DEL';
        const dest0 = updated[0]?.to || toCode || 'BOM';
        const date0 = updated[0]?.date || departureDate || getTodayDateString(1);

        const origin1 = updated[1]?.from || dest0 || 'BOM';
        const dest1 = updated[1]?.to || (origin1 === 'BLR' ? 'DEL' : 'BLR');
        let date1 = updated[1]?.date;
        if (!date1 || date1 < date0) {
          try {
            const d = new Date(date0);
            d.setDate(d.getDate() + 2);
            date1 = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          } catch {
            date1 = getTodayDateString(3);
          }
        }

        updated[0] = { from: origin0, to: dest0, date: date0 };
        updated[1] = { from: origin1, to: dest1, date: date1 };
        return updated;
      });
    }
  };

  // Dropdown states
  const [showFromDrop, setShowFromDrop] = useState(false);
  const [showToDrop, setShowToDrop] = useState(false);
  const [showPaxModal, setShowPaxModal] = useState(false);
  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');

  const fromRef = useRef(null);
  const toRef = useRef(null);
  const paxRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (fromRef.current && !fromRef.current.contains(e.target)) setShowFromDrop(false);
      if (toRef.current && !toRef.current.contains(e.target)) setShowToDrop(false);
      if (paxRef.current && !paxRef.current.contains(e.target)) setShowPaxModal(false);
      if (multiCityRef.current && !multiCityRef.current.contains(e.target)) setActiveLegDrop(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const resolveAirport = (code, placeholderCity = 'Select City', placeholderName = 'Airport') => {
    if (!code || !code.trim()) {
      return { isEmpty: true, code: '--', city: placeholderCity, name: placeholderName };
    }
    const clean = code.trim().toUpperCase();
    const found = airports.find(a => 
      a.code.toUpperCase() === clean || 
      a.city.toUpperCase() === clean
    );
    if (found) return { ...found, isEmpty: false };

    const formattedCity = clean.length === 3 
      ? clean 
      : clean.charAt(0) + clean.slice(1).toLowerCase();

    return {
      isEmpty: false,
      code: clean.slice(0, 4),
      city: formattedCity,
      name: `${formattedCity} Airport`
    };
  };

  const fromAirport = resolveAirport(fromCode, 'New Delhi', 'Indira Gandhi Intl');
  const toAirport = resolveAirport(toCode, 'Mumbai', 'Chhatrapati Shivaji Intl');

  const handleSelectFrom = (val) => {
    const matched = airports.find(a => 
      a.code.toLowerCase() === val.toLowerCase() || 
      a.city.toLowerCase() === val.toLowerCase()
    );
    setFromCode(matched ? matched.code : val.trim().toUpperCase());
    setShowFromDrop(false);
    setSearchFrom('');
  };

  const handleSelectTo = (val) => {
    const matched = airports.find(a => 
      a.code.toLowerCase() === val.toLowerCase() || 
      a.city.toLowerCase() === val.toLowerCase()
    );
    setToCode(matched ? matched.code : val.trim().toUpperCase());
    setShowToDrop(false);
    setSearchTo('');
  };

  const totalPassengers = passengers.adults + passengers.children + passengers.infants;

  const handleSwapAirports = () => {
    const temp = fromCode;
    setFromCode(toCode);
    setToCode(temp);
  };

  // Multi-City Leg Management Handlers
  const handleAddLeg = () => {
    if (legs.length >= 5) return;
    const lastLeg = legs[legs.length - 1];
    const nextFrom = lastLeg.to || '';
    const nextTo = '';
    
    let nextDate = getTodayDateString(1);
    try {
      const d = new Date(lastLeg.date || new Date());
      d.setDate(d.getDate() + 2);
      nextDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    } catch {
      nextDate = getTodayDateString(2);
    }

    setLegs(prev => [...prev, { from: nextFrom, to: nextTo, date: nextDate }]);
  };

  const handleRemoveLeg = (idx) => {
    if (legs.length <= 2) return;
    setLegs(prev => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateLeg = (idx, field, value) => {
    const updated = [...legs];
    const prevTo = updated[idx].to;
    updated[idx][field] = value;
    
    if (field === 'to' && idx < updated.length - 1) {
      if (updated[idx + 1].from === prevTo || !updated[idx + 1].from) {
        updated[idx + 1].from = value;
      }
    }

    if (field === 'date') {
      for (let i = idx + 1; i < updated.length; i++) {
        if (updated[i].date && updated[i].date < updated[i - 1].date) {
          try {
            const d = new Date(updated[i - 1].date);
            d.setDate(d.getDate() + 1);
            updated[i].date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          } catch {
            updated[i].date = updated[i - 1].date;
          }
        }
      }
    }

    setLegs(updated);
  };

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    if (tripType === 'multiCity') {
      for (let i = 0; i < legs.length; i++) {
        if (!legs[i].from || !legs[i].to) {
          alert(`Flight ${i + 1}: Please select both Origin and Destination.`);
          return;
        }
        if (legs[i].from.trim().toUpperCase() === legs[i].to.trim().toUpperCase()) {
          alert(`Flight ${i + 1}: Origin (${legs[i].from}) and Destination (${legs[i].to}) cannot be the same!`);
          return;
        }
      }
      onSearch({
        tripType: 'multiCity',
        legs,
        from: legs[0].from,
        to: legs[legs.length - 1].to,
        date: legs[0].date,
        travelClass,
        passengers,
        specialFare
      });
      return;
    }

    if (!fromCode || !toCode) {
      alert('Please select both Origin and Destination airports!');
      return;
    }

    if (fromCode.trim().toUpperCase() === toCode.trim().toUpperCase()) {
      alert('Origin and Destination airports cannot be the same!');
      return;
    }

    onSearch({
      tripType,
      from: fromCode,
      to: toCode,
      date: departureDate,
      returnDate: tripType === 'roundTrip' ? returnDate : null,
      travelClass,
      passengers,
      specialFare
    });
  };

  const handleQuickDestinationSelect = (dest) => {
    const origin = dest.fromCode || fromCode || 'DEL';
    const target = dest.code;
    setFromCode(origin);
    setToCode(target);
    onSearch({
      tripType: 'oneWay',
      from: origin,
      to: target,
      date: departureDate || getTodayDateString(1),
      returnDate: null,
      travelClass,
      passengers,
      specialFare
    });
  };

  return (
    <div className="relative pt-4 sm:pt-8 pb-12 sm:pb-16 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
      
      {/* Background Ambient Glow (Apple Minimalist Aurora with Organic Motion) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-96 pointer-events-none -z-10 overflow-hidden opacity-75">
        <motion.div 
          animate={{ 
            x: [0, 28, -16, 0], 
            y: [0, -18, 14, 0],
            scale: [1, 1.12, 0.96, 1] 
          }}
          transition={{ repeat: Infinity, duration: 16, ease: "easeInOut" }}
          className="absolute top-8 left-1/4 w-88 h-88 bg-gradient-to-tr from-sky-300/40 via-blue-200/30 to-indigo-300/30 rounded-full blur-3xl" 
        />
        <motion.div 
          animate={{ 
            x: [0, -25, 18, 0], 
            y: [0, 18, -14, 0],
            scale: [1, 1.15, 0.92, 1] 
          }}
          transition={{ repeat: Infinity, duration: 20, ease: "easeInOut" }}
          className="absolute top-14 right-1/4 w-96 h-96 bg-gradient-to-br from-amber-200/40 via-rose-200/30 to-purple-200/25 rounded-full blur-3xl" 
        />
        
        {/* Responsive Gliding Jet Arc Micro-Animation across Mobile, Tablet, Desktop */}
        <div className="absolute top-2 sm:top-6 left-0 right-0 h-16 sm:h-24 opacity-35 sm:opacity-45 overflow-hidden pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 1000 80" fill="none" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M 20 65 Q 500 12 980 65" 
              stroke="url(#flightGradHero)" 
              strokeWidth="2" 
              strokeDasharray="6 6" 
            />
            <defs>
              <linearGradient id="flightGradHero" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0" />
                <stop offset="50%" stopColor="#0284c7" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
          <motion.div
            animate={{
              x: ['3%', '94%'],
              y: [36, 6, 36],
              rotate: [18, 0, -18]
            }}
            transition={{
              repeat: Infinity,
              duration: 16,
              ease: "easeInOut"
            }}
            className="absolute top-0 left-0 text-sky-600 pointer-events-none drop-shadow-xs will-change-transform"
          >
            <Plane className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-sky-600/30" />
          </motion.div>
        </div>
      </div>

      {/* Hero Editorial Header */}
      <motion.div 
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="text-center max-w-3xl mx-auto mb-6 sm:mb-10"
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-xl border border-slate-200/90 shadow-xs mb-4"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-xs font-black text-slate-800 tracking-tight">Direct Airline GDS Inventory</span>
          <span className="text-slate-300">•</span>
          <span className="text-xs font-bold text-sky-600">Zero Convenience Fee</span>
        </motion.div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
          Where do you want to <span className="text-slate-900 underline decoration-amber-400 decoration-wavy decoration-2">fly next?</span>
        </h1>
        
        <p className="text-sm sm:text-lg text-slate-500 mt-3 font-medium max-w-xl mx-auto leading-relaxed">
          Search real-time airfares across 150+ airlines with instant digital PNRs and verified transparent rates.
        </p>
      </motion.div>

      {/* AIRBNB-STYLE UNIFIED FLOATING SEARCH POD */}
      <motion.div 
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-30 max-w-5xl mx-auto"
      >
        
        {/* Top Floating Segmented Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3 px-2 sm:px-4">
          
          {/* Trip Type Apple-Style Segmented Pill */}
          <div className="inline-flex items-center bg-slate-200/70 backdrop-blur-md p-1 rounded-full border border-slate-300/50 shadow-inner">
            {[
              { id: 'oneWay', label: 'One Way' },
              { id: 'roundTrip', label: 'Round Trip' },
              { id: 'multiCity', label: 'Multi-City' }
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleTripTypeChange(t.id)}
                className={`px-4 sm:px-5 py-1.5 rounded-full text-xs font-black transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  tripType === t.id
                    ? 'bg-white text-slate-900 shadow-sm shadow-slate-400/20 scale-[1.02]'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Cabin Class Minimalist Chips */}
          <div className="flex items-center gap-1.5 bg-slate-100/90 backdrop-blur-md p-1 rounded-full border border-slate-200/80">
            {[
              { id: 'economy', label: 'Economy' },
              { id: 'premiumEconomy', label: 'Prem. Eco' },
              { id: 'business', label: 'Business' }
            ].map(cls => (
              <button
                key={cls.id}
                type="button"
                onClick={() => setTravelClass(cls.id)}
                className={`px-3 py-1 rounded-full text-xs font-black transition-all cursor-pointer ${
                  travelClass === cls.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cls.label}
              </button>
            ))}
          </div>
        </div>

        {/* The Main Airbnb Capsule Card */}
        {tripType === 'multiCity' ? (
          /* Multi-City Itinerary Builder Mode */
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl p-5 sm:p-7 shadow-[0_20px_60px_rgba(15,23,42,0.08)] border border-slate-200/90 space-y-4" ref={multiCityRef}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-black text-slate-900 text-sm sm:text-base">Multi-City Route Planner ({legs.length} Flights)</span>
              <span className="text-xs text-sky-600 font-bold bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
                Automatic City Linking Enabled
              </span>
            </div>

            {legs.map((leg, idx) => {
              const legFromAirport = resolveAirport(leg.from, 'Select City', 'Origin');
              const legToAirport = resolveAirport(leg.to, 'Select City', 'Destination');
              const isFromOpen = activeLegDrop?.index === idx && activeLegDrop?.field === 'from';
              const isToOpen = activeLegDrop?.index === idx && activeLegDrop?.field === 'to';

              return (
                <div key={idx} className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800">Flight Leg {idx + 1}</span>
                    {legs.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLeg(idx)}
                        className="text-xs text-rose-600 font-bold hover:bg-rose-50 px-2 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                    {/* Origin */}
                    <div className="relative">
                      <div
                        onClick={() => {
                          setActiveLegDrop(isFromOpen ? null : { index: idx, field: 'from' });
                          setLegSearch('');
                        }}
                        className="p-3 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-sky-500 transition-colors"
                      >
                        <span className="text-[10px] uppercase font-black text-slate-400 block">From</span>
                        <div className="flex items-baseline justify-between mt-0.5">
                          <span className="font-black text-sm text-slate-900 truncate">{legFromAirport.city}</span>
                          <span className="font-mono font-bold text-sky-600 text-sm">{legFromAirport.code}</span>
                        </div>
                      </div>

                      <AnimatePresence>
                        {isFromOpen && (
                          <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 w-72 max-h-60 flex flex-col p-2">
                            <input
                              type="text"
                              autoFocus
                              placeholder="Search origin..."
                              value={legSearch}
                              onChange={(e) => setLegSearch(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none"
                            />
                            <div className="overflow-y-auto max-h-48 p-1 mt-1 space-y-1">
                              {filterAndSortAirports(airports, legSearch).map(a => (
                                <div
                                  key={a.code}
                                  onClick={() => {
                                    handleUpdateLeg(idx, 'from', a.code);
                                    setActiveLegDrop(null);
                                  }}
                                  className="p-2 rounded-lg hover:bg-sky-50 cursor-pointer flex justify-between text-xs"
                                >
                                  <span className="font-bold text-slate-800">{a.city}</span>
                                  <span className="font-mono font-bold text-sky-600">{a.code}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Destination */}
                    <div className="relative">
                      <div
                        onClick={() => {
                          setActiveLegDrop(isToOpen ? null : { index: idx, field: 'to' });
                          setLegSearch('');
                        }}
                        className="p-3 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-sky-500 transition-colors"
                      >
                        <span className="text-[10px] uppercase font-black text-slate-400 block">To</span>
                        <div className="flex items-baseline justify-between mt-0.5">
                          <span className="font-black text-sm text-slate-900 truncate">{legToAirport.city}</span>
                          <span className="font-mono font-bold text-blue-600 text-sm">{legToAirport.code}</span>
                        </div>
                      </div>

                      <AnimatePresence>
                        {isToOpen && (
                          <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 w-72 max-h-60 flex flex-col p-2">
                            <input
                              type="text"
                              autoFocus
                              placeholder="Search destination..."
                              value={legSearch}
                              onChange={(e) => setLegSearch(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none"
                            />
                            <div className="overflow-y-auto max-h-48 p-1 mt-1 space-y-1">
                              {filterAndSortAirports(airports, legSearch).map(a => (
                                <div
                                  key={a.code}
                                  onClick={() => {
                                    handleUpdateLeg(idx, 'to', a.code);
                                    setActiveLegDrop(null);
                                  }}
                                  className="p-2 rounded-lg hover:bg-sky-50 cursor-pointer flex justify-between text-xs"
                                >
                                  <span className="font-bold text-slate-800">{a.city}</span>
                                  <span className="font-mono font-bold text-blue-600">{a.code}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Date */}
                    <div>
                      <CustomDatePicker
                        label="Departure"
                        value={leg.date}
                        onChange={(d) => handleUpdateLeg(idx, 'date', d)}
                        minDate={idx === 0 ? getTodayDateString() : (legs[idx - 1]?.date || getTodayDateString())}
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {legs.length < 5 && (
              <button
                type="button"
                onClick={handleAddLeg}
                className="w-full py-2.5 border-2 border-dashed border-sky-300 hover:border-sky-500 rounded-2xl bg-sky-50/50 hover:bg-sky-50 text-sky-700 font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Another City ({legs.length}/5)</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSearchSubmit}
              className="w-full py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-slate-900/20"
            >
              <Search className="w-4 h-4" />
              <span>Search All {legs.length} Flights</span>
            </button>
          </div>
        ) : (
          /* Standard Unified Pill Bar (One Way / Round Trip) */
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl lg:rounded-full p-2 sm:p-2.5 shadow-[0_24px_70px_rgba(15,23,42,0.1)] border border-slate-200/90 transition-all hover:shadow-[0_28px_80px_rgba(15,23,42,0.14)]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:items-center relative gap-1.5 lg:gap-0">
              
              {/* SECTION 1: ORIGIN (FROM) */}
              <div className="flex-1 min-w-0 relative" ref={fromRef}>
                <div
                  onClick={() => { setShowFromDrop(!showFromDrop); setShowToDrop(false); }}
                  className="p-3 sm:px-4 sm:py-3 rounded-2xl sm:rounded-full hover:bg-slate-100/80 transition-all cursor-pointer group"
                >
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Where From?</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-sm sm:text-base font-black text-slate-900 truncate">
                      {fromAirport.city}
                    </span>
                    <span className="text-[10px] sm:text-xs font-mono font-black text-sky-700 bg-sky-50 border border-sky-200/80 px-1.5 py-0.5 rounded-md shrink-0">
                      {fromAirport.code}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 truncate block mt-0.5">{fromAirport.name}</span>
                </div>

                {/* From Dropdown */}
                <AnimatePresence>
                  {showFromDrop && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      className="absolute top-full left-0 mt-3 w-84 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 p-3 z-50 overflow-hidden"
                    >
                      <input
                        type="text"
                        autoFocus
                        placeholder="Search city, airport or code..."
                        value={searchFrom}
                        onChange={(e) => setSearchFrom(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-black text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500"
                      />

                      <div className="overflow-y-auto max-h-64 p-1 mt-2 space-y-1">
                        <div className="text-[10px] font-black text-slate-400 uppercase px-2 py-1">Popular Origins</div>
                        {filterAndSortAirports(airports, searchFrom).map(airport => (
                          <div
                            key={airport.code}
                            onClick={() => handleSelectFrom(airport.code)}
                            className="p-2.5 rounded-xl hover:bg-sky-50 cursor-pointer flex items-center justify-between text-xs transition-colors"
                          >
                            <div>
                              <div className="font-black text-slate-900">{airport.city}</div>
                              <div className="text-[10px] text-slate-400">{airport.name}</div>
                            </div>
                            <span className="font-mono font-black text-sky-600 bg-sky-100 px-2.5 py-1 rounded-lg">
                              {airport.code}
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Desktop Swap Button between Origin & Destination */}
              <div className="hidden lg:flex items-center justify-center -mx-3.5 z-20 shrink-0">
                <motion.button
                  type="button"
                  onClick={handleSwapAirports}
                  whileHover={{ scale: 1.15, rotate: 180 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                  className="w-7 h-7 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-600 hover:text-sky-600 cursor-pointer"
                  title="Swap Origin and Destination"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                </motion.button>
              </div>

              {/* Mobile Centered Swap Button with Tactile Spring Animation */}
              <div className="flex lg:hidden justify-center -my-2 z-10">
                <motion.button
                  type="button"
                  onClick={handleSwapAirports}
                  whileTap={{ scale: 0.85, rotate: 270 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shadow-xs active:bg-sky-50 active:text-sky-600 cursor-pointer"
                  title="Swap Origin and Destination"
                >
                  <ArrowLeftRight className="w-3 h-3 rotate-90" />
                </motion.button>
              </div>

              {/* SECTION 2: DESTINATION (TO) */}
              <div className="flex-1 min-w-0 relative" ref={toRef}>
                <div
                  onClick={() => { setShowToDrop(!showToDrop); setShowFromDrop(false); }}
                  className="p-3 sm:px-4 sm:py-3 rounded-2xl sm:rounded-full hover:bg-slate-100/80 transition-all cursor-pointer group"
                >
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Where To?</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-sm sm:text-base font-black text-slate-900 truncate">
                      {toAirport.city}
                    </span>
                    <span className="text-[10px] sm:text-xs font-mono font-black text-blue-700 bg-blue-50 border border-blue-200/80 px-1.5 py-0.5 rounded-md shrink-0">
                      {toAirport.code}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 truncate block mt-0.5">{toAirport.name}</span>
                </div>

                {/* To Dropdown */}
                <AnimatePresence>
                  {showToDrop && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      className="absolute top-full left-0 mt-3 w-84 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 p-3 z-50 overflow-hidden"
                    >
                      <input
                        type="text"
                        autoFocus
                        placeholder="Search destination city or airport..."
                        value={searchTo}
                        onChange={(e) => setSearchTo(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-black text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                      />

                      <div className="overflow-y-auto max-h-64 p-1 mt-2 space-y-1">
                        <div className="text-[10px] font-black text-slate-400 uppercase px-2 py-1">Popular Destinations</div>
                        {filterAndSortAirports(airports, searchTo).map(airport => (
                          <div
                            key={airport.code}
                            onClick={() => handleSelectTo(airport.code)}
                            className="p-2.5 rounded-xl hover:bg-sky-50 cursor-pointer flex items-center justify-between text-xs transition-colors"
                          >
                            <div>
                              <div className="font-black text-slate-900">{airport.city}</div>
                              <div className="text-[10px] text-slate-400">{airport.name}</div>
                            </div>
                            <span className="font-mono font-black text-blue-600 bg-blue-100 px-2.5 py-1 rounded-lg">
                              {airport.code}
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Subtle Vertical Divider */}
              <div className="hidden lg:block w-px h-8 bg-slate-200/80 mx-1 shrink-0" />

              {/* SECTION 3A: DEPARTURE DATE (JAANA) */}
              <div className="flex-1 min-w-0">
                <CustomDatePicker
                  variant="capsule"
                  label={tripType === 'roundTrip' ? "Departure" : "Departure Date"}
                  subText="Jaane ki date"
                  value={departureDate}
                  onChange={(d) => {
                    setDepartureDate(d);
                    if (returnDate && returnDate < d) {
                      const parts = d.split('-').map(Number);
                      const ret = new Date(parts[0], parts[1] - 1, parts[2] + 3);
                      const y = ret.getFullYear();
                      const m = String(ret.getMonth() + 1).padStart(2, '0');
                      const day = String(ret.getDate()).padStart(2, '0');
                      setReturnDate(`${y}-${m}-${day}`);
                    }
                  }}
                  minDate={getTodayDateString()}
                  from={fromCode}
                  to={toCode}
                />
              </div>

              {/* SECTION 3B: RETURN DATE (AANA - AANE KI TICKET) */}
              {tripType === 'roundTrip' && (
                <>
                  <div className="hidden lg:block w-px h-8 bg-slate-200/80 mx-1 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <CustomDatePicker
                      variant="capsule"
                      label="Return Date"
                      subText="Aane ki ticket"
                      value={returnDate || getTodayDateString(3)}
                      onChange={(d) => setReturnDate(d)}
                      minDate={departureDate || getTodayDateString()}
                      from={toCode}
                      to={fromCode}
                      align="right"
                    />
                  </div>
                </>
              )}

              {/* Subtle Vertical Divider */}
              <div className="hidden lg:block w-px h-8 bg-slate-200/80 mx-1 shrink-0" />

              {/* SECTION 4: TRAVELLERS */}
              <div className="flex-1 min-w-0 relative" ref={paxRef}>
                <div
                  onClick={() => setShowPaxModal(!showPaxModal)}
                  className="p-3 sm:px-4 sm:py-3 rounded-2xl sm:rounded-full hover:bg-slate-100/80 transition-all cursor-pointer relative group"
                >
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Who's Flying?</span>
                  <div className="text-sm sm:text-base font-black text-slate-900 truncate mt-0.5">
                    {totalPassengers} {totalPassengers > 1 ? 'Guests' : 'Guest'}
                  </div>
                  <span className="text-[10px] text-sky-700 capitalize font-bold block truncate">
                    {travelClass}
                  </span>
                </div>

                {/* Pax Modal */}
                <AnimatePresence>
                  {showPaxModal && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      className="absolute top-full right-0 mt-3 w-76 bg-white rounded-3xl shadow-2xl border border-slate-200 p-4 z-50 text-slate-800"
                    >
                      <div className="text-xs font-black text-slate-400 uppercase mb-3">Traveller Selection</div>
                      
                      {/* Adults */}
                      <div className="flex items-center justify-between py-2 border-b border-slate-100">
                        <div>
                          <div className="font-black text-xs">Adults</div>
                          <div className="text-[10px] text-slate-400">12+ years</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setPassengers(p => ({ ...p, adults: Math.max(1, p.adults - 1) }))}
                            className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-black hover:bg-slate-200 flex items-center justify-center cursor-pointer"
                          >-</button>
                          <span className="w-5 text-center font-black text-xs">{passengers.adults}</span>
                          <button
                            type="button"
                            onClick={() => setPassengers(p => ({ ...p, adults: Math.min(9, p.adults + 1) }))}
                            className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-black hover:bg-slate-200 flex items-center justify-center cursor-pointer"
                          >+</button>
                        </div>
                      </div>

                      {/* Children */}
                      <div className="flex items-center justify-between py-2 border-b border-slate-100">
                        <div>
                          <div className="font-black text-xs">Children</div>
                          <div className="text-[10px] text-slate-400">2-12 years</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setPassengers(p => ({ ...p, children: Math.max(0, p.children - 1) }))}
                            className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-black hover:bg-slate-200 flex items-center justify-center cursor-pointer"
                          >-</button>
                          <span className="w-5 text-center font-black text-xs">{passengers.children}</span>
                          <button
                            type="button"
                            onClick={() => setPassengers(p => ({ ...p, children: Math.min(6, p.children + 1) }))}
                            className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-black hover:bg-slate-200 flex items-center justify-center cursor-pointer"
                          >+</button>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowPaxModal(false)}
                        className="w-full mt-3 py-2.5 bg-slate-900 text-white font-black text-xs rounded-xl shadow-md cursor-pointer"
                      >
                        Apply Travellers
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* SECTION 5: LARGE CIRCULAR SEARCH BUTTON */}
              <div className="p-1 shrink-0 flex items-center justify-center">
                <motion.button
                  type="button"
                  onClick={handleSearchSubmit}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.94 }}
                  className="relative w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-slate-900 hover:bg-black text-white flex items-center justify-center shadow-xl shadow-slate-900/30 cursor-pointer shrink-0 transition-all group overflow-hidden"
                  title="Search Flights"
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-sky-400/0 via-sky-300/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Search className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5] relative z-10 group-hover:rotate-6 transition-transform duration-300" />
                </motion.button>
              </div>

            </div>
          </div>
        )}

        {/* Special Fare Benefits Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pt-3 px-3 scrollbar-none">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider shrink-0">Special Fares:</span>
          {[
            { id: 'regular', label: 'Regular' },
            { id: 'student', label: 'Student (Extra 10kg)' },
            { id: 'senior', label: 'Senior Citizen (Flat ₹600 OFF)' },
            { id: 'armed', label: 'Armed Forces' }
          ].map(f => (
            <motion.button
              key={f.id}
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setSpecialFare(f.id)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                specialFare === f.id
                  ? 'bg-amber-100/90 text-amber-900 border border-amber-300 font-black shadow-xs'
                  : 'bg-white/80 border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {f.label}
            </motion.button>
          ))}
        </div>

      </motion.div>

      {/* CURATED DESTINATION COLLECTIONS (AIRBNB EXPLORE GETAWAYS STYLE) */}
      <motion.div 
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.6 }}
        className="mt-14 sm:mt-20"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-black text-sky-600 uppercase tracking-wider mb-1">
              <Compass className="w-4 h-4 text-sky-600" />
              <span>TRENDING GETAWAYS</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Popular Flight Escapes for You
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Instant one-click searches with lowest verified round-trip and one-way airfares
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-2xs self-start sm:self-auto">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>Updated 5 mins ago</span>
          </div>
        </div>

        {/* Destination Cards Carousel Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
          {CURATED_DESTINATIONS.map((dest, idx) => (
            <motion.div
              key={dest.code}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: idx * 0.06 }}
              whileHover={{ y: -6, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleQuickDestinationSelect(dest)}
              className="group relative rounded-3xl overflow-hidden bg-white border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-sky-300 transition-all cursor-pointer flex flex-col"
            >
              {/* Destination Image & Route Badges */}
              <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-100">
                <img
                  src={dest.image}
                  alt={dest.city}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                
                {/* Category Tag */}
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-white/95 backdrop-blur-md text-[9px] font-black uppercase text-slate-900 tracking-wider shadow-xs">
                  {dest.tag}
                </span>

                {/* Explicit Airport Route Pill (e.g. DEL ➔ GOI) */}
                <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-slate-950/85 backdrop-blur-md text-[9px] font-mono font-black text-amber-300 border border-white/20 tracking-wider shadow-xs">
                  {dest.fromCode} ➔ {dest.code}
                </span>

                {/* City & From Info on Image */}
                <div className="absolute bottom-2 left-2.5 right-2">
                  <div className="text-white font-black text-sm sm:text-base tracking-tight drop-shadow-sm leading-tight">
                    {dest.city}
                  </div>
                  <div className="text-[10px] text-amber-200 font-bold drop-shadow-xs flex items-center gap-1 mt-0.5">
                    <span>From {dest.fromCity} ({dest.fromCode})</span>
                  </div>
                </div>
              </div>

              {/* Bottom Details Box */}
              <div className="p-3 bg-white flex flex-col justify-between flex-1 gap-2">
                {/* Explicit Search Route (e.g. Delhi ➔ Goa) */}
                <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-100">
                  <div className="flex items-center gap-1 font-black text-slate-800 text-[11px] truncate">
                    <span className="text-slate-500 font-medium truncate">{dest.fromCity}</span>
                    <ArrowRight className="w-3 h-3 text-sky-600 shrink-0 stroke-[2.5]" />
                    <span className="text-slate-900 font-black truncate">{dest.city}</span>
                  </div>
                  <span className="font-mono text-[9px] font-black text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200/60 shrink-0">
                    Direct
                  </span>
                </div>

                {/* Price & Search Arrow */}
                <div className="flex items-center justify-between pt-0.5">
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase block leading-none">Starting from</span>
                    <span className="text-sm font-black text-slate-900 font-mono mt-0.5 block">{dest.price}</span>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-sky-600 group-hover:text-white transition-colors flex items-center justify-center text-slate-600 shrink-0 shadow-2xs">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

    </div>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeftRight, Calendar, Users, Search, Plane, PlaneTakeoff, PlaneLanding, Check, ChevronDown, Plus, Trash2, ArrowRight, Compass, Sparkles, ShieldCheck, Zap, Info, Clock } from 'lucide-react';
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

    const aCodeStarts = aCode.startsWith(q);
    const bCodeStarts = bCode.startsWith(q);
    if (aCodeStarts && !bCodeStarts) return -1;
    if (bCodeStarts && !aCodeStarts) return 1;

    const aPop = POPULAR_HUBS.indexOf((a.code || '').toUpperCase());
    const bPop = POPULAR_HUBS.indexOf((b.code || '').toUpperCase());
    if (aPop !== -1 && bPop !== -1) return aPop - bPop;
    if (aPop !== -1) return -1;
    if (bPop !== -1) return 1;

    return (a.city || '').localeCompare(b.city || '');
  });
};

export default function HeroSearch({ airports, onSearch, searchParams, settings = {}, brand = null, loading = false }) {
  const [tripType, setTripType] = useState(searchParams?.tripType || 'oneWay'); // 'oneWay' | 'roundTrip' | 'multiCity'
  const [fromCode, setFromCode] = useState(searchParams?.from || '');
  const [toCode, setToCode] = useState(searchParams?.to || '');
  const [departureDate, setDepartureDate] = useState(searchParams?.date || getTodayDateString());
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
      { from: '', to: '', date: getTodayDateString() },
      { from: '', to: '', date: getTodayDateString(2) }
    ];
  });
  const [activeLegDrop, setActiveLegDrop] = useState(null); // { index: number, field: 'from' | 'to' } | null
  const [legSearch, setLegSearch] = useState('');
  const multiCityRef = useRef(null);

  const handleTripTypeChange = (type) => {
    setTripType(type);
    if (type === 'roundTrip' && (!returnDate || returnDate < departureDate)) {
      const parts = (departureDate || getTodayDateString()).split('-').map(Number);
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

  // Resolve airport details accurately by code or city
  const resolveAirport = (code, placeholderCity = 'Select City', placeholderName = 'Airport or city') => {
    if (!code || !code.trim()) {
      return {
        isEmpty: true,
        code: '--',
        city: placeholderCity,
        name: placeholderName
      };
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

  const fromAirport = resolveAirport(fromCode, 'Select Origin', 'Where from?');
  const toAirport = resolveAirport(toCode, 'Select Destination', 'Where to?');

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
    
    // Auto-chain destination to next leg origin
    if (field === 'to' && idx < updated.length - 1) {
      if (updated[idx + 1].from === prevTo || !updated[idx + 1].from) {
        updated[idx + 1].from = value;
      }
    }

    // Auto-adjust subsequent leg dates if this leg's date is moved forward
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

  const handleSwapLegAirports = (idx) => {
    const updated = [...legs];
    const temp = updated[idx].from;
    updated[idx].from = updated[idx].to;
    updated[idx].to = temp;
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
      alert('Please select both Origin (From) and Destination (To) airports!');
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

  const quickRoutes = settings.popularRoutes || [
    { from: 'DEL', to: 'BOM', label: 'Delhi ⇄ Mumbai' },
    { from: 'DEL', to: 'BLR', label: 'Delhi ⇄ Bengaluru' },
    { from: 'BOM', to: 'GOI', label: 'Mumbai ⇄ Goa' },
    { from: 'DEL', to: 'GOI', label: 'Delhi ⇄ Goa' },
    { from: 'DEL', to: 'DXB', label: 'Delhi ⇄ Dubai' },
  ];

  const heroSettings = {
    badgeText: settings.hero?.badgeText || 'Verified Real-Time Airline Inventory',
    title: settings.hero?.title || 'Book Worldwide Flights at Guaranteed Lowest Fares',
    brandHighlight: brand?.name || settings.hero?.brandHighlight || 'AIR SKY',
    subtitle: brand?.tagline || settings.hero?.subtitle || 'Zero convenience fee, live GDS airfares, instant 3D seat mapping & verified digital PNR.'
  };

  return (
    <div className="py-2 sm:py-6 max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
      
      {/* Search Header Banner Container */}
      <div className="relative rounded-3xl p-4 sm:p-8 lg:p-10 text-white shadow-2xl overflow-hidden bg-gradient-to-br from-slate-950 via-sky-950 to-blue-950 border border-slate-800/80 mb-6 sm:mb-8">
        
        {/* Ambient Glow & Vector Lines Backdrop */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-35">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-sky-500/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl" />
          <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="flightGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#flightGrid)" />
          </svg>
        </div>

        {/* Top Header Information & Trust Badge */}
        <div className="relative z-10 max-w-3xl mb-4 sm:mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[11px] sm:text-xs font-black text-sky-200 mb-2.5 sm:mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{heroSettings.badgeText}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          </div>
          
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
            {heroSettings.title}
          </h1>
          
          <p className="text-xs sm:text-sm text-slate-300 mt-1.5 sm:mt-2 font-medium max-w-2xl leading-relaxed">
            {heroSettings.subtitle}
          </p>

          {/* Micro Trust Pills */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-3 sm:mt-4 text-[11px] sm:text-xs font-semibold text-slate-300">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% GDS Verified</span>
            </div>
            <span className="text-slate-600">•</span>
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Instant PNR Dispatch</span>
            </div>
            <span className="text-slate-600">•</span>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-sky-400" />
              <span>24x7 Airport Helpdesk</span>
            </div>
          </div>
        </div>

        {/* Main Search Cockpit Box */}
        <div className="relative z-30 bg-white text-slate-800 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 lg:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.25)] border border-slate-100">
          
          {/* Top Control Bar: Trip Type & Cabin Class */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 sm:pb-4 mb-3 sm:mb-4 border-b border-slate-100">
            
            {/* Segmented Trip Type Pill */}
            <div className="inline-flex items-center bg-slate-100/90 p-1 rounded-2xl gap-1 shrink-0 border border-slate-200/80">
              <button
                type="button"
                onClick={() => handleTripTypeChange('oneWay')}
                className={`px-3.5 sm:px-5 py-1.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer whitespace-nowrap ${
                  tripType === 'oneWay'
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                One Way
              </button>
              
              <button
                type="button"
                onClick={() => handleTripTypeChange('roundTrip')}
                className={`px-3.5 sm:px-5 py-1.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer whitespace-nowrap ${
                  tripType === 'roundTrip'
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                Round Trip
              </button>

              <button
                type="button"
                onClick={() => handleTripTypeChange('multiCity')}
                className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  tripType === 'multiCity'
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <span>Multi City</span>
                <span className="text-[9px] px-1.5 py-0.2 bg-amber-400 text-slate-950 rounded-full font-black uppercase">
                  NEW
                </span>
              </button>
            </div>

            {/* Travel Class Selector */}
            <div className="flex items-center gap-2 text-xs sm:text-sm shrink-0">
              <span className="text-slate-400 font-extrabold text-[10px] sm:text-xs uppercase tracking-wider">Cabin:</span>
              <div className="inline-flex items-center bg-slate-100/90 p-1 rounded-xl gap-1 border border-slate-200/80">
                {[
                  { id: 'economy', label: 'Economy' },
                  { id: 'premiumEconomy', label: 'Prem. Eco', desktopLabel: 'Premium Economy' },
                  { id: 'business', label: 'Business' }
                ].map((cls) => (
                  <button
                    key={cls.id}
                    type="button"
                    onClick={() => setTravelClass(cls.id)}
                    className={`px-2.5 sm:px-3 py-1 rounded-lg font-black transition-all cursor-pointer shrink-0 whitespace-nowrap text-[11px] sm:text-xs ${
                      travelClass === cls.id
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                    }`}
                  >
                    <span className="sm:hidden">{cls.label}</span>
                    <span className="hidden sm:inline">{cls.desktopLabel || cls.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Conditional Multi-City Itinerary Builder vs Standard Grid */}
          {tripType === 'multiCity' ? (
            <div className="space-y-3.5" ref={multiCityRef}>
              <div className="flex items-center justify-between text-xs px-1">
                <span className="font-black text-slate-800 text-sm">Multi-City Itinerary ({legs.length} Flights Connected)</span>
                <span className="text-sky-600 font-bold bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200 text-[11px]">
                  Automatic Route Chaining Active
                </span>
              </div>

              {legs.map((leg, idx) => {
                const legFromAirport = resolveAirport(leg.from, 'Select Origin', 'Origin Airport');
                const legToAirport = resolveAirport(leg.to, 'Select Destination', 'Destination Airport');
                const isFromOpen = activeLegDrop?.index === idx && activeLegDrop?.field === 'from';
                const isToOpen = activeLegDrop?.index === idx && activeLegDrop?.field === 'to';

                return (
                  <div key={idx} className="bg-slate-50/90 border border-slate-200 hover:border-sky-300 rounded-2xl p-3 sm:p-4 transition-all relative shadow-xs">
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-sky-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                          {idx + 1}
                        </span>
                        <span className="font-black text-xs sm:text-sm text-slate-900">
                          Flight Leg {idx + 1}
                        </span>
                        <span className="text-xs text-slate-500 font-semibold hidden sm:inline">
                          ({legFromAirport.isEmpty ? 'Origin' : legFromAirport.city} ➔ {legToAirport.isEmpty ? 'Destination' : legToAirport.city})
                        </span>
                      </div>

                      {legs.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveLeg(idx)}
                          className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-12 gap-2 sm:gap-3 items-center relative">
                      {/* Origin Airport */}
                      <div className="col-span-1 md:col-span-4 relative">
                        <div
                          onClick={() => {
                            setActiveLegDrop(isFromOpen ? null : { index: idx, field: 'from' });
                            setLegSearch('');
                          }}
                          className={`cursor-pointer p-2.5 sm:p-3 rounded-xl border bg-white hover:border-sky-500 transition-colors shadow-xs h-full min-h-[76px] sm:min-h-[84px] flex flex-col justify-between ${
                            legFromAirport.isEmpty ? 'border-dashed border-slate-300' : 'border-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                            <PlaneTakeoff className="w-3 h-3 text-sky-600 shrink-0" />
                            <span className="truncate">From (Leg {idx + 1})</span>
                          </div>
                          <div className="flex items-baseline justify-between">
                            <div className="min-w-0 pr-1">
                              <h4 className={`text-sm sm:text-base font-extrabold leading-none truncate ${legFromAirport.isEmpty ? 'text-slate-400' : 'text-slate-900'}`}>{legFromAirport.city}</h4>
                              <p className={`text-[10px] sm:text-[11px] truncate max-w-[120px] sm:max-w-[150px] mt-0.5 ${legFromAirport.isEmpty ? 'text-slate-400 italic' : 'text-slate-500'}`}>{legFromAirport.name}</p>
                            </div>
                            <span className={`text-base sm:text-xl font-black font-mono shrink-0 ${legFromAirport.isEmpty ? 'text-slate-300' : 'text-sky-600'}`}>{legFromAirport.code}</span>
                          </div>
                        </div>

                        {/* Dropdown */}
                        <AnimatePresence>
                          {isFromOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: -6, scale: 0.98 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -6, scale: 0.98 }}
                              className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 w-[calc(100vw-2.5rem)] sm:w-[360px] max-h-76 flex flex-col p-2"
                            >
                              <input
                                type="text"
                                autoFocus
                                placeholder="Search city or airport..."
                                value={legSearch}
                                onChange={(e) => setLegSearch(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-sky-500"
                              />
                              <div className="overflow-y-auto max-h-56 p-1 mt-1 space-y-1">
                                {filterAndSortAirports(airports, legSearch).map(a => (
                                  <div
                                    key={a.code}
                                    onClick={() => {
                                      handleUpdateLeg(idx, 'from', a.code);
                                      setActiveLegDrop(null);
                                    }}
                                    className="p-2 rounded-xl hover:bg-sky-50 cursor-pointer flex items-center justify-between text-xs"
                                  >
                                    <div>
                                      <span className="font-bold text-slate-800">{a.city}</span>
                                      <p className="text-[10px] text-slate-400 truncate max-w-[200px]">{a.name}</p>
                                    </div>
                                    <span className="font-mono font-bold text-sky-600 bg-sky-100 px-2 py-0.5 rounded">{a.code}</span>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Swap button between multi-city leg */}
                      <div className="hidden md:flex justify-center -mx-2 z-10">
                        <button
                          type="button"
                          onClick={() => handleSwapLegAirports(idx)}
                          className="w-7 h-7 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-600 hover:text-sky-600 cursor-pointer"
                        >
                          <ArrowLeftRight className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Destination Airport */}
                      <div className="col-span-1 md:col-span-4 relative">
                        <div
                          onClick={() => {
                            setActiveLegDrop(isToOpen ? null : { index: idx, field: 'to' });
                            setLegSearch('');
                          }}
                          className={`cursor-pointer p-2.5 sm:p-3 rounded-xl border bg-white hover:border-sky-500 transition-colors shadow-xs h-full min-h-[76px] sm:min-h-[84px] flex flex-col justify-between ${
                            legToAirport.isEmpty ? 'border-dashed border-slate-300' : 'border-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                            <PlaneLanding className="w-3 h-3 text-blue-600 shrink-0" />
                            <span className="truncate">To (Leg {idx + 1})</span>
                          </div>
                          <div className="flex items-baseline justify-between">
                            <div className="min-w-0 pr-1">
                              <h4 className={`text-sm sm:text-base font-extrabold leading-none truncate ${legToAirport.isEmpty ? 'text-slate-400' : 'text-slate-900'}`}>{legToAirport.city}</h4>
                              <p className={`text-[10px] sm:text-[11px] truncate max-w-[120px] sm:max-w-[150px] mt-0.5 ${legToAirport.isEmpty ? 'text-slate-400 italic' : 'text-slate-500'}`}>{legToAirport.name}</p>
                            </div>
                            <span className={`text-base sm:text-xl font-black font-mono shrink-0 ${legToAirport.isEmpty ? 'text-slate-300' : 'text-blue-600'}`}>{legToAirport.code}</span>
                          </div>
                        </div>

                        {/* Dropdown */}
                        <AnimatePresence>
                          {isToOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: -6, scale: 0.98 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -6, scale: 0.98 }}
                              className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 w-[calc(100vw-2.5rem)] sm:w-[360px] max-h-76 flex flex-col p-2"
                            >
                              <input
                                type="text"
                                autoFocus
                                placeholder="Search city or airport..."
                                value={legSearch}
                                onChange={(e) => setLegSearch(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-blue-500"
                              />
                              <div className="overflow-y-auto max-h-56 p-1 mt-1 space-y-1">
                                {filterAndSortAirports(airports, legSearch).map(a => (
                                  <div
                                    key={a.code}
                                    onClick={() => {
                                      handleUpdateLeg(idx, 'to', a.code);
                                      setActiveLegDrop(null);
                                    }}
                                    className="p-2 rounded-xl hover:bg-sky-50 cursor-pointer flex items-center justify-between text-xs"
                                  >
                                    <div>
                                      <span className="font-bold text-slate-800">{a.city}</span>
                                      <p className="text-[10px] text-slate-400 truncate max-w-[200px]">{a.name}</p>
                                    </div>
                                    <span className="font-mono font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded">{a.code}</span>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Leg Date */}
                      <div className="col-span-2 md:col-span-3">
                        <CustomDatePicker
                          label={`Departure (Flight ${idx + 1})`}
                          value={leg.date}
                          onChange={(d) => handleUpdateLeg(idx, 'date', d)}
                          minDate={idx === 0 ? getTodayDateString() : (legs[idx - 1]?.date || getTodayDateString())}
                          from={leg.from}
                          to={leg.to}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Add flight leg button */}
              {legs.length < 5 && (
                <button
                  type="button"
                  onClick={handleAddLeg}
                  className="w-full py-2.5 border-2 border-dashed border-sky-300 hover:border-sky-500 rounded-2xl bg-sky-50/50 hover:bg-sky-50 text-sky-700 font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Another City / Flight Leg ({legs.length}/5)</span>
                </button>
              )}
            </div>
          ) : (
            /* Standard Grid: Origin, Destination, Departure Date, Return Date, Travellers */
            <div className="grid grid-cols-2 md:grid-cols-12 gap-2 sm:gap-3 relative items-stretch">
              
              {/* Origin Airport Tile */}
              <div className="col-span-2 md:col-span-3 relative" ref={fromRef}>
                <div
                  onClick={() => { setShowFromDrop(!showFromDrop); setShowToDrop(false); }}
                  className={`cursor-pointer p-3 sm:p-4 rounded-2xl border transition-all bg-slate-50/60 hover:bg-white h-full min-h-[82px] sm:min-h-[92px] flex flex-col justify-between group ${
                    fromAirport.isEmpty ? 'border-dashed border-slate-300 hover:border-sky-500' : 'border-slate-200 hover:border-sky-500 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-wider">
                    <PlaneTakeoff className="w-3.5 h-3.5 text-sky-600 group-hover:scale-110 transition-transform" />
                    <span>FROM (ORIGIN)</span>
                  </div>

                  <div className="flex items-baseline justify-between mt-1">
                    <div className="min-w-0 pr-2">
                      <h3 className={`text-base sm:text-xl font-black leading-tight truncate ${fromAirport.isEmpty ? 'text-slate-400' : 'text-slate-900'}`}>
                        {fromAirport.city}
                      </h3>
                      <p className={`text-[10px] sm:text-xs truncate max-w-[140px] sm:max-w-[170px] mt-0.5 ${fromAirport.isEmpty ? 'text-slate-400 italic' : 'text-slate-500'}`}>
                        {fromAirport.name}
                      </p>
                    </div>
                    <span className={`text-xl sm:text-2xl font-black font-mono shrink-0 tracking-tight ${fromAirport.isEmpty ? 'text-slate-300' : 'text-sky-600'}`}>
                      {fromAirport.code}
                    </span>
                  </div>
                </div>

                {/* From Airport Selection Dropdown */}
                <AnimatePresence>
                  {showFromDrop && (
                    <motion.div 
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.16 }}
                      className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 w-[calc(100vw-2rem)] sm:w-[390px] md:w-[420px] max-h-84 flex flex-col p-2.5 overflow-hidden"
                    >
                      <div className="pb-2 border-b border-slate-100">
                        <input
                          type="text"
                          autoFocus
                          placeholder="Type city, airport or code (e.g. DEL, BOM, Goa)..."
                          value={searchFrom}
                          onChange={(e) => setSearchFrom(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-sky-500"
                        />
                      </div>

                      <div className="overflow-y-auto max-h-64 p-1 space-y-1">
                        {!searchFrom && (
                          <div className="px-2 py-1 text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-500" /> Popular Origin Hubs
                          </div>
                        )}
                        {filterAndSortAirports(airports, searchFrom).map((airport, idx) => {
                          const isPop = POPULAR_HUBS.includes(airport.code);
                          return (
                            <div
                              key={airport.code}
                              onClick={() => handleSelectFrom(airport.code)}
                              className={`flex items-center justify-between p-2.5 rounded-xl hover:bg-sky-50 cursor-pointer transition-colors ${
                                fromCode === airport.code ? 'bg-sky-50 font-black' : ''
                              }`}
                            >
                              <div className="min-w-0 pr-2">
                                <div className="text-xs sm:text-sm font-black text-slate-900 truncate flex items-center gap-1.5">
                                  <span>{airport.city}</span>
                                  <span className="text-xs font-semibold text-slate-500 font-mono">({airport.code})</span>
                                  {isPop && !searchFrom && idx < 6 && (
                                    <span className="text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.2 rounded-full">
                                      Popular
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-500 truncate max-w-[260px] sm:max-w-[320px]">
                                  {airport.name}{airport.state ? `, ${airport.state}` : ''}
                                </div>
                              </div>
                              <span className="text-xs font-mono font-black text-sky-600 px-2.5 py-1 bg-sky-100 rounded-lg shrink-0">
                                {airport.code}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Desktop Floating 3D Swap Button */}
                <div className="hidden md:flex absolute -right-4.5 top-1/2 -translate-y-1/2 z-20">
                  <motion.button
                    type="button"
                    onClick={handleSwapAirports}
                    whileHover={{ scale: 1.15, rotate: 180 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                    className="w-9 h-9 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-600 hover:text-sky-600 hover:border-sky-400 transition-colors cursor-pointer"
                    title="Swap Origin and Destination"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                  </motion.button>
                </div>
              </div>

              {/* Mobile Centered Swap Button */}
              <div className="flex md:hidden justify-center -my-2.5 z-10 col-span-2">
                <motion.button
                  type="button"
                  onClick={handleSwapAirports}
                  whileTap={{ scale: 0.9, rotate: 180 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="w-8 h-8 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 hover:text-sky-600 transition-colors cursor-pointer"
                  title="Swap Origin and Destination"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5 rotate-90" />
                </motion.button>
              </div>

              {/* Destination Airport Tile */}
              <div className="col-span-2 md:col-span-3 relative" ref={toRef}>
                <div
                  onClick={() => { setShowToDrop(!showToDrop); setShowFromDrop(false); }}
                  className={`cursor-pointer p-3 sm:p-4 rounded-2xl border transition-all bg-slate-50/60 hover:bg-white h-full min-h-[82px] sm:min-h-[92px] flex flex-col justify-between group ${
                    toAirport.isEmpty ? 'border-dashed border-slate-300 hover:border-blue-500' : 'border-slate-200 hover:border-blue-500 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-wider">
                    <PlaneLanding className="w-3.5 h-3.5 text-blue-600 group-hover:scale-110 transition-transform" />
                    <span>TO (DESTINATION)</span>
                  </div>

                  <div className="flex items-baseline justify-between mt-1">
                    <div className="min-w-0 pr-2">
                      <h3 className={`text-base sm:text-xl font-black leading-tight truncate ${toAirport.isEmpty ? 'text-slate-400' : 'text-slate-900'}`}>
                        {toAirport.city}
                      </h3>
                      <p className={`text-[10px] sm:text-xs truncate max-w-[140px] sm:max-w-[170px] mt-0.5 ${toAirport.isEmpty ? 'text-slate-400 italic' : 'text-slate-500'}`}>
                        {toAirport.name}
                      </p>
                    </div>
                    <span className={`text-xl sm:text-2xl font-black font-mono shrink-0 tracking-tight ${toAirport.isEmpty ? 'text-slate-300' : 'text-blue-600'}`}>
                      {toAirport.code}
                    </span>
                  </div>
                </div>

                {/* To Airport Selection Dropdown */}
                <AnimatePresence>
                  {showToDrop && (
                    <motion.div 
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.16 }}
                      className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 w-[calc(100vw-2rem)] sm:w-[390px] md:w-[420px] max-h-84 flex flex-col p-2.5 overflow-hidden"
                    >
                      <div className="pb-2 border-b border-slate-100">
                        <input
                          type="text"
                          autoFocus
                          placeholder="Type destination city, airport or code..."
                          value={searchTo}
                          onChange={(e) => setSearchTo(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="overflow-y-auto max-h-64 p-1 space-y-1">
                        {!searchTo && (
                          <div className="px-2 py-1 text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-500" /> Popular Destination Hubs
                          </div>
                        )}
                        {filterAndSortAirports(airports, searchTo).map((airport, idx) => {
                          const isPop = POPULAR_HUBS.includes(airport.code);
                          return (
                            <div
                              key={airport.code}
                              onClick={() => handleSelectTo(airport.code)}
                              className={`flex items-center justify-between p-2.5 rounded-xl hover:bg-sky-50 cursor-pointer transition-colors ${
                                toCode === airport.code ? 'bg-sky-50 font-black' : ''
                              }`}
                            >
                              <div className="min-w-0 pr-2">
                                <div className="text-xs sm:text-sm font-black text-slate-900 truncate flex items-center gap-1.5">
                                  <span>{airport.city}</span>
                                  <span className="text-xs font-semibold text-slate-500 font-mono">({airport.code})</span>
                                  {isPop && !searchTo && idx < 6 && (
                                    <span className="text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.2 rounded-full">
                                      Popular
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-500 truncate max-w-[260px] sm:max-w-[320px]">
                                  {airport.name}{airport.state ? `, ${airport.state}` : ''}
                                </div>
                              </div>
                              <span className="text-xs font-mono font-black text-blue-600 px-2.5 py-1 bg-blue-100 rounded-lg shrink-0">
                                {airport.code}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Departure Date Tile */}
              <div className={tripType === 'roundTrip' ? 'col-span-1 md:col-span-2' : 'col-span-1 md:col-span-3'}>
                <CustomDatePicker
                  label="Departure Date"
                  value={departureDate}
                  onChange={(date) => {
                    setDepartureDate(date);
                    if (returnDate && returnDate < date) {
                      setReturnDate(date);
                    }
                  }}
                  minDate={getTodayDateString()}
                  from={fromCode}
                  to={toCode}
                />
              </div>

              {/* Return Date Tile */}
              {tripType === 'roundTrip' ? (
                <div className="col-span-1 md:col-span-2">
                  <CustomDatePicker
                    label="Return Date"
                    value={returnDate}
                    onChange={(date) => setReturnDate(date)}
                    minDate={departureDate || getTodayDateString()}
                    subText="Return Savings"
                    from={toCode}
                    to={fromCode}
                    align="right"
                  />
                </div>
              ) : (
                /* One-Way: Click to add Return Trip fast button */
                <div 
                  onClick={() => handleTripTypeChange('roundTrip')}
                  className="hidden md:flex col-span-1 md:col-span-1 p-2 rounded-2xl border border-dashed border-slate-300 hover:border-sky-400 bg-slate-50/50 hover:bg-sky-50/50 cursor-pointer flex-col justify-center items-center text-center transition-all group"
                  title="Click to add Return Journey and save up to 25%"
                >
                  <Plus className="w-4 h-4 text-sky-600 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold text-slate-600 group-hover:text-sky-700 leading-tight mt-0.5">
                    + Add Return
                  </span>
                  <span className="text-[8px] font-black text-emerald-600 uppercase tracking-wider">Save 25%</span>
                </div>
              )}

              {/* Travellers & Cabin Class Tile */}
              <div className={tripType === 'roundTrip' ? 'col-span-2 md:col-span-2' : 'col-span-1 md:col-span-2'} ref={paxRef}>
                <div
                  onClick={() => setShowPaxModal(!showPaxModal)}
                  className="cursor-pointer p-3 sm:p-4 rounded-2xl border border-slate-200 hover:border-sky-500 transition-all bg-slate-50/60 hover:bg-white h-full min-h-[82px] sm:min-h-[92px] flex flex-col justify-between hover:shadow-md group"
                >
                  <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-wider">
                    <Users className="w-3.5 h-3.5 text-sky-600 group-hover:scale-110 transition-transform" />
                    <span className="truncate">TRAVELLERS</span>
                  </div>

                  <div className="flex items-baseline justify-between mt-1">
                    <span className="font-black text-slate-900 text-base sm:text-xl truncate">
                      {totalPassengers} {totalPassengers > 1 ? 'Guests' : 'Guest'}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 ml-1 transition-transform ${showPaxModal ? 'rotate-180' : ''}`} />
                  </div>

                  <div className="text-[10px] sm:text-xs font-bold text-sky-700 capitalize truncate mt-0.5">
                    {travelClass === 'premiumEconomy' ? 'Prem. Economy' : travelClass}
                  </div>
                </div>

                {/* Travellers Popover Modal */}
                <AnimatePresence>
                  {showPaxModal && (
                    <motion.div 
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.16 }}
                      className="absolute right-0 mt-2 w-76 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 text-slate-800"
                    >
                      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Select Travellers</span>
                        <span className="text-xs font-bold text-sky-600">{totalPassengers} Total</span>
                      </div>
                      
                      {/* Adults */}
                      <div className="flex items-center justify-between py-2 border-b border-slate-100">
                        <div>
                          <div className="font-extrabold text-xs sm:text-sm text-slate-900">Adults</div>
                          <div className="text-[10px] text-slate-500">Age 12+ years</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setPassengers(p => ({ ...p, adults: Math.max(1, p.adults - 1) }))}
                            className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-black hover:bg-slate-200 flex items-center justify-center cursor-pointer active:scale-95"
                          >-</button>
                          <span className="w-5 text-center font-black text-xs sm:text-sm">{passengers.adults}</span>
                          <button
                            type="button"
                            onClick={() => setPassengers(p => ({ ...p, adults: Math.min(9, p.adults + 1) }))}
                            className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-black hover:bg-slate-200 flex items-center justify-center cursor-pointer active:scale-95"
                          >+</button>
                        </div>
                      </div>

                      {/* Children */}
                      <div className="flex items-center justify-between py-2 border-b border-slate-100">
                        <div>
                          <div className="font-extrabold text-xs sm:text-sm text-slate-900">Children</div>
                          <div className="text-[10px] text-slate-500">Age 2 - 12 years</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setPassengers(p => ({ ...p, children: Math.max(0, p.children - 1) }))}
                            className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-black hover:bg-slate-200 flex items-center justify-center cursor-pointer active:scale-95"
                          >-</button>
                          <span className="w-5 text-center font-black text-xs sm:text-sm">{passengers.children}</span>
                          <button
                            type="button"
                            onClick={() => setPassengers(p => ({ ...p, children: Math.min(6, p.children + 1) }))}
                            className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-black hover:bg-slate-200 flex items-center justify-center cursor-pointer active:scale-95"
                          >+</button>
                        </div>
                      </div>

                      {/* Infants */}
                      <div className="flex items-center justify-between py-2 border-b border-slate-100">
                        <div>
                          <div className="font-extrabold text-xs sm:text-sm text-slate-900">Infants</div>
                          <div className="text-[10px] text-slate-500">Under 2 years (on lap)</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setPassengers(p => ({ ...p, infants: Math.max(0, p.infants - 1) }))}
                            className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-black hover:bg-slate-200 flex items-center justify-center cursor-pointer active:scale-95"
                          >-</button>
                          <span className="w-5 text-center font-black text-xs sm:text-sm">{passengers.infants}</span>
                          <button
                            type="button"
                            onClick={() => setPassengers(p => ({ ...p, infants: Math.min(4, p.infants + 1) }))}
                            className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-black hover:bg-slate-200 flex items-center justify-center cursor-pointer active:scale-95"
                          >+</button>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowPaxModal(false)}
                        className="w-full mt-3 py-2.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-black rounded-xl text-xs shadow-md transition-all cursor-pointer"
                      >
                        Apply Travellers
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          )}

          {/* Bottom Bar: Special Fares & High-Converting Search CTA */}
          <div className="mt-3.5 sm:mt-5 pt-3 sm:pt-4 border-t border-slate-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
            
            {/* Special Fare Benefits Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
              <span className="font-extrabold text-slate-400 shrink-0 text-[10px] sm:text-xs uppercase tracking-wider">
                Special Fare:
              </span>
              {[
                { id: 'regular', label: 'Regular', hint: 'Standard Fares' },
                { id: 'student', label: 'Student', hint: 'Extra 10kg Baggage' },
                { id: 'senior', label: 'Senior Citizen', hint: 'Flat ₹600 OFF' },
                { id: 'armed', label: 'Armed Forces', hint: 'Govt. Concession' }
              ].map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setSpecialFare(f.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold border transition-all cursor-pointer shrink-0 whitespace-nowrap text-left ${
                    specialFare === f.id
                      ? 'bg-amber-50 text-amber-900 border-amber-300 shadow-xs ring-1 ring-amber-300'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-[11px] font-black leading-none">{f.label}</div>
                  <div className="text-[9px] text-slate-500 mt-0.5">{f.hint}</div>
                </button>
              ))}
            </div>

            {/* Glowing Search Flights Action Button */}
            <motion.button
              type="button"
              onClick={handleSearchSubmit}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full lg:w-auto px-8 sm:px-10 py-3 sm:py-4 rounded-2xl bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-black text-sm sm:text-base shadow-xl shadow-sky-600/35 hover:shadow-sky-600/50 transition-all flex items-center justify-center gap-2.5 cursor-pointer shrink-0 group relative overflow-hidden"
            >
              <Plane className="w-5 h-5 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
              <span>{tripType === 'multiCity' ? `SEARCH ${legs.length} MULTI-CITY FLIGHTS` : 'SEARCH FLIGHTS'}</span>
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </motion.button>

          </div>

        </div>

        {/* Quick Route Shortcuts below the Cockpit */}
        <div className="relative z-10 mt-3.5 sm:mt-5 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-sky-200 shrink-0 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-amber-400" /> Popular Flights:
          </span>
          {quickRoutes.map(qr => (
            <button
              key={`${qr.from}-${qr.to}`}
              type="button"
              onClick={() => {
                setFromCode(qr.from);
                setToCode(qr.to);
                onSearch({ from: qr.from, to: qr.to, date: departureDate, tripType: 'oneWay', travelClass, passengers, specialFare });
              }}
              className="px-3 py-1 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer backdrop-blur-md border bg-white/10 hover:bg-white/20 text-white border-white/20 active:scale-95"
            >
              {qr.label}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}

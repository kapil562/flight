import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeftRight, Calendar, Users, Search, PlaneTakeoff, PlaneLanding, Check, ChevronDown, Plus, Trash2, ArrowRight } from 'lucide-react';
import CustomDatePicker from './CustomDatePicker';

const getTodayDateString = (offsetDays = 0) => {
  const d = new Date();
  if (offsetDays) d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function HeroSearch({ airports, onSearch, searchParams, settings = {}, brand = null }) {
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

  const setQuickDate = (offsetDays) => {
    setDepartureDate(getTodayDateString(offsetDays));
  };

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

    // Capitalize first letter properly for display
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
    badgeText: settings.hero?.badgeText || 'Super Fast Real-Time Aviation Search',
    title: settings.hero?.title || 'Fly Anywhere with',
    brandHighlight: brand?.name || settings.hero?.brandHighlight || 'AIR SKY',
    subtitle: brand?.tagline || settings.hero?.subtitle || 'Ixigo & Cleartrip style live airfares, lowest fare trend, instant seat map & verified PNR tickets.'
  };

  return (
    <div className="relative pt-7 sm:pt-12 pb-6 sm:pb-12 bg-gradient-to-b from-sky-900 via-sky-800 to-slate-900 text-white rounded-2xl sm:rounded-[2.5rem] shadow-xl z-10">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden rounded-2xl sm:rounded-[2.5rem]">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
        
        {/* Banner Title (Controlled by Admin CMS) */}
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-2 sm:mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sky-200 text-xs font-semibold uppercase tracking-wider mb-3">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            {heroSettings.badgeText}
          </div>
          <h1 className="text-xl sm:text-5xl font-extrabold tracking-tight text-white mb-1 sm:mb-2 leading-tight">
            {heroSettings.title} <span className="bg-gradient-to-r from-sky-400 via-cyan-300 to-amber-300 bg-clip-text text-transparent">{heroSettings.brandHighlight}</span>
          </h1>
          <p className="hidden sm:block text-slate-300 text-xs sm:text-base">
            {heroSettings.subtitle}
          </p>
        </motion.div>

        {/* Main Search Box Card */}
        <motion.div 
          className="bg-white text-slate-800 rounded-2xl sm:rounded-3xl p-3 sm:p-7 shadow-2xl border border-slate-100 relative"
          initial={{ opacity: 0, y: 25, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          
          {/* Top Options Row: Trip Type & Class */}
          <div className="flex items-center justify-between gap-1.5 pb-2.5 sm:pb-4 mb-2.5 sm:mb-4 border-b border-slate-100">
            <div className="inline-flex items-center bg-slate-100 p-0.5 sm:p-1 rounded-xl sm:rounded-2xl gap-0.5 sm:gap-1">
              <button
                type="button"
                onClick={() => handleTripTypeChange('oneWay')}
                className={`px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-sm font-bold transition-all cursor-pointer ${
                  tripType === 'oneWay' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                One Way
              </button>
              <button
                type="button"
                onClick={() => handleTripTypeChange('roundTrip')}
                className={`px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-sm font-bold transition-all cursor-pointer ${
                  tripType === 'roundTrip' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Round Trip
              </button>
              <button
                type="button"
                onClick={() => handleTripTypeChange('multiCity')}
                className={`px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  tripType === 'multiCity' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Multi City</span>
                <span className="text-[9px] px-1 py-0.2 bg-amber-400 text-slate-900 rounded font-black uppercase">New</span>
              </button>
            </div>

            {/* Travel Class Selector - Dropdown on mobile / Pills on desktop */}
            <div className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm shrink-0">
              <div className="sm:hidden relative">
                <select
                  value={travelClass}
                  onChange={(e) => setTravelClass(e.target.value)}
                  className="bg-sky-50 text-sky-800 border border-sky-200 rounded-lg px-2 py-1 text-[11px] font-bold focus:outline-hidden"
                >
                  <option value="economy">Economy</option>
                  <option value="premiumEconomy">Prem. Eco</option>
                  <option value="business">Business</option>
                </select>
              </div>

              <div className="hidden sm:flex items-center gap-1.5">
                <span className="text-slate-400 font-medium shrink-0">Class:</span>
                {['economy', 'premiumEconomy', 'business'].map((cls) => (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => setTravelClass(cls)}
                    className={`px-3 py-1 rounded-lg capitalize font-semibold transition-all cursor-pointer shrink-0 whitespace-nowrap text-xs ${
                      travelClass === cls
                        ? 'bg-sky-50 text-sky-700 border border-sky-300 font-bold'
                        : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    {cls === 'premiumEconomy' ? 'Prem. Economy' : cls}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Conditional Input: Multi-City Legs Builder vs Standard Grid */}
          {tripType === 'multiCity' ? (
            <div className="space-y-3.5" ref={multiCityRef}>
              <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                <span className="font-bold text-slate-700">Multi-City Itinerary Legs ({legs.length} Flights)</span>
                <span className="text-sky-600 font-semibold">Automatic origin linking enabled</span>
              </div>

              {legs.map((leg, idx) => {
                const legFromAirport = resolveAirport(leg.from, 'Select Origin', 'Origin Airport');
                const legToAirport = resolveAirport(leg.to, 'Select Destination', 'Destination Airport');
                const isFromOpen = activeLegDrop?.index === idx && activeLegDrop?.field === 'from';
                const isToOpen = activeLegDrop?.index === idx && activeLegDrop?.field === 'to';

                return (
                  <div key={idx} className="bg-slate-50/80 border border-slate-200 hover:border-sky-300 rounded-2xl p-3 sm:p-4 transition-all relative">
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-sky-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                          {idx + 1}
                        </span>
                        <span className="font-extrabold text-xs sm:text-sm text-slate-900">
                          Flight {idx + 1}
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
                              transition={{ duration: 0.15 }}
                              className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 max-h-72 flex flex-col p-2"
                            >
                              <div className="p-2 border-b border-slate-100">
                                <input
                                  type="text"
                                  autoFocus
                                  placeholder="Search city, airport or code..."
                                  value={legSearch}
                                  onChange={(e) => setLegSearch(e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-sky-500"
                                />
                              </div>
                              <div className="overflow-y-auto max-h-52 p-1">
                                {airports
                                  .filter(a => {
                                    if (!legSearch) return true;
                                    const q = legSearch.toLowerCase().trim();
                                    return (
                                      (a.city && a.city.toLowerCase().includes(q)) ||
                                      (a.code && a.code.toLowerCase().includes(q)) ||
                                      (a.name && a.name.toLowerCase().includes(q)) ||
                                      (a.state && a.state.toLowerCase().includes(q)) ||
                                      (a.country && a.country.toLowerCase().includes(q))
                                    );
                                  })
                                  .map(airport => (
                                    <div
                                      key={airport.code}
                                      onClick={() => {
                                        handleUpdateLeg(idx, 'from', airport.code);
                                        setActiveLegDrop(null);
                                        setLegSearch('');
                                      }}
                                      className={`flex items-center justify-between p-2 rounded-xl hover:bg-sky-50 cursor-pointer text-xs ${
                                        leg.from === airport.code ? 'bg-sky-50 font-bold' : ''
                                      }`}
                                    >
                                      <div className="min-w-0 pr-2">
                                        <div className="font-bold text-slate-900 truncate">{airport.city} ({airport.code})</div>
                                        <div className="text-[10px] text-slate-500 truncate max-w-[200px]">{airport.name}</div>
                                      </div>
                                      <span className="font-mono font-bold text-sky-600 px-1.5 py-0.5 bg-sky-100 rounded text-[10px]">
                                        {airport.code}
                                      </span>
                                    </div>
                                  ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Swap Button */}
                      <div className="hidden md:flex justify-center -mx-3 z-10 md:col-span-1">
                        <button
                          type="button"
                          onClick={() => handleSwapLegAirports(idx)}
                          className="w-8 h-8 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-600 hover:text-sky-600 cursor-pointer hover:rotate-180 transition-transform"
                          title="Swap Route"
                        >
                          <ArrowLeftRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Destination Airport */}
                      <div className="col-span-1 md:col-span-4 relative">
                        <div
                          onClick={() => {
                            setActiveLegDrop(isToOpen ? null : { index: idx, field: 'to' });
                            setLegSearch('');
                          }}
                          className={`cursor-pointer p-2.5 sm:p-3 rounded-xl border bg-white hover:border-blue-500 transition-colors shadow-xs h-full min-h-[76px] sm:min-h-[84px] flex flex-col justify-between ${
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
                              transition={{ duration: 0.15 }}
                              className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 max-h-72 flex flex-col p-2"
                            >
                              <div className="p-2 border-b border-slate-100">
                                <input
                                  type="text"
                                  autoFocus
                                  placeholder="Search destination city or code..."
                                  value={legSearch}
                                  onChange={(e) => setLegSearch(e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500"
                                />
                              </div>
                              <div className="overflow-y-auto max-h-52 p-1">
                                {airports
                                  .filter(a => {
                                    if (!legSearch) return true;
                                    const q = legSearch.toLowerCase().trim();
                                    return (
                                      (a.city && a.city.toLowerCase().includes(q)) ||
                                      (a.code && a.code.toLowerCase().includes(q)) ||
                                      (a.name && a.name.toLowerCase().includes(q)) ||
                                      (a.state && a.state.toLowerCase().includes(q)) ||
                                      (a.country && a.country.toLowerCase().includes(q))
                                    );
                                  })
                                  .map(airport => (
                                    <div
                                      key={airport.code}
                                      onClick={() => {
                                        handleUpdateLeg(idx, 'to', airport.code);
                                        setActiveLegDrop(null);
                                        setLegSearch('');
                                      }}
                                      className={`flex items-center justify-between p-2 rounded-xl hover:bg-sky-50 cursor-pointer text-xs ${
                                        leg.to === airport.code ? 'bg-sky-50 font-bold' : ''
                                      }`}
                                    >
                                      <div className="min-w-0 pr-2">
                                        <div className="font-bold text-slate-900 truncate">{airport.city} ({airport.code})</div>
                                        <div className="text-[10px] text-slate-500 truncate max-w-[200px]">{airport.name}</div>
                                      </div>
                                      <span className="font-mono font-bold text-blue-600 px-1.5 py-0.5 bg-blue-100 rounded text-[10px]">
                                        {airport.code}
                                      </span>
                                    </div>
                                  ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Departure Date */}
                      <div className="col-span-2 md:col-span-3">
                        <CustomDatePicker
                          label="Departure Date"
                          value={leg.date}
                          minDate={idx === 0 ? getTodayDateString() : (legs[idx - 1]?.date || getTodayDateString())}
                          onChange={(date) => handleUpdateLeg(idx, 'date', date)}
                          from={leg.from}
                          to={leg.to}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Multi-City Controls Row */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                {legs.length < 5 ? (
                  <button
                    type="button"
                    onClick={handleAddLeg}
                    className="px-4 py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>+ Add Another Flight / City</span>
                  </button>
                ) : (
                  <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                    Maximum 5 flight legs reached
                  </span>
                )}

                {/* Travellers Selector inside Multi-City */}
                <div className="relative" ref={paxRef}>
                  <button
                    type="button"
                    onClick={() => setShowPaxModal(!showPaxModal)}
                    className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-xs flex items-center gap-2 cursor-pointer transition-colors border border-slate-200 shadow-xs"
                  >
                    <Users className="w-4 h-4 text-sky-600" />
                    <span>{totalPassengers} {totalPassengers > 1 ? 'Passengers' : 'Passenger'}</span>
                    <span className="text-[10px] text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded capitalize font-bold">
                      {travelClass === 'premiumEconomy' ? 'Prem. Eco' : travelClass}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {/* Passengers Dropdown Modal for Multi City */}
                  <AnimatePresence>
                    {showPaxModal && (
                      <motion.div 
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ duration: 0.18 }}
                        className="absolute right-0 bottom-full mb-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 text-slate-800"
                      >
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Travellers (Passengers)</h4>
                        
                        {/* Adults */}
                        <div className="flex items-center justify-between py-2 border-b border-slate-100">
                          <div>
                            <div className="font-bold text-sm">Adults</div>
                            <div className="text-xs text-slate-500">12+ years</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setPassengers(p => ({ ...p, adults: Math.max(1, p.adults - 1) }))}
                              className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 flex items-center justify-center cursor-pointer"
                            >-</button>
                            <span className="w-5 text-center font-bold">{passengers.adults}</span>
                            <button
                              type="button"
                              onClick={() => setPassengers(p => ({ ...p, adults: Math.min(9, p.adults + 1) }))}
                              className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 flex items-center justify-center cursor-pointer"
                            >+</button>
                          </div>
                        </div>

                        {/* Children */}
                        <div className="flex items-center justify-between py-2 border-b border-slate-100">
                          <div>
                            <div className="font-bold text-sm">Children</div>
                            <div className="text-xs text-slate-500">2 - 12 years</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setPassengers(p => ({ ...p, children: Math.max(0, p.children - 1) }))}
                              className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 flex items-center justify-center cursor-pointer"
                            >-</button>
                            <span className="w-5 text-center font-bold">{passengers.children}</span>
                            <button
                              type="button"
                              onClick={() => setPassengers(p => ({ ...p, children: Math.min(6, p.children + 1) }))}
                              className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 flex items-center justify-center cursor-pointer"
                            >+</button>
                          </div>
                        </div>

                        {/* Infants */}
                        <div className="flex items-center justify-between py-2 border-b border-slate-100">
                          <div>
                            <div className="font-bold text-sm">Infants</div>
                            <div className="text-xs text-slate-500">Below 2 yrs</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setPassengers(p => ({ ...p, infants: Math.max(0, p.infants - 1) }))}
                              className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 flex items-center justify-center cursor-pointer"
                            >-</button>
                            <span className="w-5 text-center font-bold">{passengers.infants}</span>
                            <button
                              type="button"
                              onClick={() => setPassengers(p => ({ ...p, infants: Math.min(4, p.infants + 1) }))}
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
              </div>
            </div>
          ) : (
            /* Input Grid (One Way / Round Trip) */
            <div className="grid grid-cols-2 md:grid-cols-12 gap-2 sm:gap-3 relative items-center">
            
            {/* Origin Airport */}
            <div className="col-span-2 md:col-span-3 relative" ref={fromRef}>
              <div
                onClick={() => { setShowFromDrop(!showFromDrop); setShowToDrop(false); }}
                className={`cursor-pointer p-2 sm:p-3.5 rounded-xl sm:rounded-2xl border transition-colors bg-slate-50/50 hover:bg-white ${
                  fromAirport.isEmpty ? 'border-dashed border-slate-300 hover:border-sky-500' : 'border-slate-200 hover:border-sky-500'
                }`}
              >
                <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5 sm:mb-1">
                  <PlaneTakeoff className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-600" />
                  <span>From (Origin)</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="min-w-0 pr-2">
                    <h3 className={`text-sm sm:text-lg font-extrabold leading-none truncate ${fromAirport.isEmpty ? 'text-slate-400' : 'text-slate-900'}`}>{fromAirport.city}</h3>
                    <p className={`text-[10px] sm:text-xs truncate max-w-[150px] sm:max-w-[170px] mt-0.5 ${fromAirport.isEmpty ? 'text-slate-400 italic' : 'text-slate-500'}`}>{fromAirport.name}</p>
                  </div>
                  <span className={`text-lg sm:text-2xl font-black font-mono shrink-0 ${fromAirport.isEmpty ? 'text-slate-300' : 'text-sky-600'}`}>{fromAirport.code}</span>
                </div>
              </div>

              {/* From Dropdown */}
              <AnimatePresence>
                {showFromDrop && (
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
                        placeholder="Type city, airport or code (e.g. LKO, Goa)..."
                        value={searchFrom}
                        onChange={(e) => setSearchFrom(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-sky-500"
                      />
                    </div>
                    <div className="overflow-y-auto max-h-64 p-1">
                      {airports
                        .filter(a => {
                          if (!searchFrom) return true;
                          const q = searchFrom.toLowerCase().trim();
                          return (
                            (a.city && a.city.toLowerCase().includes(q)) || 
                            (a.code && a.code.toLowerCase().includes(q)) || 
                            (a.name && a.name.toLowerCase().includes(q)) ||
                            (a.state && a.state.toLowerCase().includes(q)) ||
                            (a.country && a.country.toLowerCase().includes(q))
                          );
                        })
                        .map(airport => (
                          <div
                            key={airport.code}
                            onClick={() => handleSelectFrom(airport.code)}
                            className={`flex items-center justify-between p-2.5 rounded-xl hover:bg-sky-50 cursor-pointer transition-colors ${
                              fromCode === airport.code ? 'bg-sky-50 font-bold' : ''
                            }`}
                          >
                            <div className="min-w-0 pr-2">
                              <div className="text-sm font-bold text-slate-900 truncate">
                                {airport.city} <span className="text-xs font-semibold text-slate-500 font-mono">({airport.code})</span>
                              </div>
                              <div className="text-xs text-slate-500 truncate max-w-[280px] sm:max-w-[340px]">
                                {airport.name}{airport.state ? `, ${airport.state}` : ''}
                              </div>
                            </div>
                            <span className="text-xs font-mono font-bold text-sky-600 px-2 py-0.5 bg-sky-100 rounded-md shrink-0">
                              {airport.code}
                            </span>
                          </div>
                        ))}
                      {searchFrom.trim().length >= 2 && !airports.some(a => a.code.toLowerCase() === searchFrom.toLowerCase() || a.city.toLowerCase() === searchFrom.toLowerCase()) && (
                        <div
                          onClick={() => handleSelectFrom(searchFrom)}
                          className="p-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 cursor-pointer text-sky-700 text-xs font-bold flex items-center justify-between mt-1 border border-sky-200"
                        >
                          <span>✈️ Fly from "{searchFrom.toUpperCase()}" (Custom Route)</span>
                          <span className="font-mono bg-sky-600 text-white px-2 py-0.5 rounded text-[10px]">Select</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Desktop Floating Swap Button between Origin & Destination */}
              <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20">
                <motion.button
                  type="button"
                  onClick={handleSwapAirports}
                  whileHover={{ scale: 1.15, rotate: 180 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="w-8 h-8 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-600 hover:text-sky-600 hover:border-sky-400 transition-colors cursor-pointer"
                  title="Swap Origin and Destination"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            </div>

            {/* Mobile Swap Button */}
            <div className="flex md:hidden justify-center -my-2.5 z-10 col-span-2">
              <motion.button
                type="button"
                onClick={handleSwapAirports}
                whileTap={{ scale: 0.9, rotate: 180 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="w-7 h-7 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 hover:text-sky-600 transition-colors cursor-pointer"
                title="Swap Origin and Destination"
              >
                <ArrowLeftRight className="w-3 h-3 rotate-90" />
              </motion.button>
            </div>

            {/* Destination Airport */}
            <div className="col-span-2 md:col-span-3 relative" ref={toRef}>
              <div
                onClick={() => { setShowToDrop(!showToDrop); setShowFromDrop(false); }}
                className={`cursor-pointer p-2 sm:p-3.5 rounded-xl sm:rounded-2xl border transition-colors bg-slate-50/50 hover:bg-white ${
                  toAirport.isEmpty ? 'border-dashed border-slate-300 hover:border-blue-500' : 'border-slate-200 hover:border-blue-500'
                }`}
              >
                <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5 sm:mb-1">
                  <PlaneLanding className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600" />
                  <span>To (Destination)</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="min-w-0 pr-2">
                    <h3 className={`text-sm sm:text-lg font-extrabold leading-none truncate ${toAirport.isEmpty ? 'text-slate-400' : 'text-slate-900'}`}>{toAirport.city}</h3>
                    <p className={`text-[10px] sm:text-xs truncate max-w-[150px] sm:max-w-[170px] mt-0.5 ${toAirport.isEmpty ? 'text-slate-400 italic' : 'text-slate-500'}`}>{toAirport.name}</p>
                  </div>
                  <span className={`text-lg sm:text-2xl font-black font-mono shrink-0 ${toAirport.isEmpty ? 'text-slate-300' : 'text-blue-600'}`}>{toAirport.code}</span>
                </div>
              </div>

              {/* To Dropdown */}
              <AnimatePresence>
                {showToDrop && (
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
                        placeholder="Type destination city, airport or code..."
                        value={searchTo}
                        onChange={(e) => setSearchTo(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="overflow-y-auto max-h-64 p-1">
                      {airports
                        .filter(a => {
                          if (!searchTo) return true;
                          const q = searchTo.toLowerCase().trim();
                          return (
                            (a.city && a.city.toLowerCase().includes(q)) || 
                            (a.code && a.code.toLowerCase().includes(q)) || 
                            (a.name && a.name.toLowerCase().includes(q)) ||
                            (a.state && a.state.toLowerCase().includes(q)) ||
                            (a.country && a.country.toLowerCase().includes(q))
                          );
                        })
                        .map(airport => (
                          <div
                            key={airport.code}
                            onClick={() => handleSelectTo(airport.code)}
                            className={`flex items-center justify-between p-2.5 rounded-xl hover:bg-sky-50 cursor-pointer transition-colors ${
                              toCode === airport.code ? 'bg-sky-50 font-bold' : ''
                            }`}
                          >
                            <div className="min-w-0 pr-2">
                              <div className="text-sm font-bold text-slate-900 truncate">
                                {airport.city} <span className="text-xs font-semibold text-slate-500 font-mono">({airport.code})</span>
                              </div>
                              <div className="text-xs text-slate-500 truncate max-w-[280px] sm:max-w-[340px]">
                                {airport.name}{airport.state ? `, ${airport.state}` : ''}
                              </div>
                            </div>
                            <span className="text-xs font-mono font-bold text-blue-600 px-2 py-0.5 bg-blue-100 rounded-md shrink-0">
                              {airport.code}
                            </span>
                          </div>
                        ))}
                      {searchTo.trim().length >= 2 && !airports.some(a => a.code.toLowerCase() === searchTo.toLowerCase() || a.city.toLowerCase() === searchTo.toLowerCase()) && (
                        <div
                          onClick={() => handleSelectTo(searchTo)}
                          className="p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 cursor-pointer text-blue-700 text-xs font-bold flex items-center justify-between mt-1 border border-blue-200"
                        >
                          <span>✈️ Fly to "{searchTo.toUpperCase()}" (Custom Route)</span>
                          <span className="font-mono bg-blue-600 text-white px-2 py-0.5 rounded text-[10px]">Select</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Departure Date */}
            <div className={tripType === 'roundTrip' ? 'col-span-1 md:col-span-2' : 'col-span-1 md:col-span-3'}>
              <CustomDatePicker
                label="Departure"
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

            {/* Return Date */}
            {tripType === 'roundTrip' && (
              <div className="col-span-1 md:col-span-2">
                <CustomDatePicker
                  label="Return"
                  value={returnDate}
                  onChange={(date) => setReturnDate(date)}
                  minDate={departureDate || getTodayDateString()}
                  subText="Return Savings"
                  from={toCode}
                  to={fromCode}
                  align="right"
                />
              </div>
            )}

            {/* Travellers Modal Trigger */}
            <div className={tripType === 'roundTrip' ? 'col-span-2 md:col-span-2' : 'col-span-1 md:col-span-3'} ref={paxRef}>
              <div
                onClick={() => setShowPaxModal(!showPaxModal)}
                className="cursor-pointer p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border border-slate-200 hover:border-sky-500 transition-colors bg-slate-50/50 hover:bg-white h-full min-h-[76px] sm:min-h-[84px] flex flex-col justify-between"
              >
                <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5 sm:mb-1">
                  <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-600 shrink-0" />
                  <span className="truncate">Travellers & Class</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 text-sm sm:text-xl">
                    {totalPassengers} {totalPassengers > 1 ? 'Passengers' : 'Passenger'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                </div>
                <div className="text-[10px] sm:text-xs font-semibold text-sky-700 capitalize truncate mt-0.5">
                  {travelClass === 'premiumEconomy' ? 'Premium Economy' : travelClass}
                </div>
              </div>

              {/* Passengers Dropdown Modal */}
              <AnimatePresence>
                {showPaxModal && (
                  <motion.div 
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 text-slate-800"
                  >
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Travellers (Passengers)</h4>
                    
                    {/* Adults */}
                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                      <div>
                        <div className="font-bold text-sm">Adults</div>
                        <div className="text-xs text-slate-500">12+ years</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPassengers(p => ({ ...p, adults: Math.max(1, p.adults - 1) }))}
                          className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 flex items-center justify-center cursor-pointer"
                        >-</button>
                        <span className="w-5 text-center font-bold">{passengers.adults}</span>
                        <button
                          type="button"
                          onClick={() => setPassengers(p => ({ ...p, adults: Math.min(9, p.adults + 1) }))}
                          className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 flex items-center justify-center cursor-pointer"
                        >+</button>
                      </div>
                    </div>

                    {/* Children */}
                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                      <div>
                        <div className="font-bold text-sm">Children</div>
                        <div className="text-xs text-slate-500">2 - 12 years</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPassengers(p => ({ ...p, children: Math.max(0, p.children - 1) }))}
                          className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 flex items-center justify-center cursor-pointer"
                        >-</button>
                        <span className="w-5 text-center font-bold">{passengers.children}</span>
                        <button
                          type="button"
                          onClick={() => setPassengers(p => ({ ...p, children: Math.min(6, p.children + 1) }))}
                          className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 flex items-center justify-center cursor-pointer"
                        >+</button>
                      </div>
                    </div>

                    {/* Infants */}
                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                      <div>
                        <div className="font-bold text-sm">Infants</div>
                        <div className="text-xs text-slate-500">Below 2 yrs</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPassengers(p => ({ ...p, infants: Math.max(0, p.infants - 1) }))}
                          className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 flex items-center justify-center cursor-pointer"
                        >-</button>
                        <span className="w-5 text-center font-bold">{passengers.infants}</span>
                        <button
                          type="button"
                          onClick={() => setPassengers(p => ({ ...p, infants: Math.min(4, p.infants + 1) }))}
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

          </div>
        )}

          {/* Bottom Row: Special Fares & Search CTA */}
          <div className="mt-2.5 sm:mt-5 pt-2 sm:pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-4">
            
            {/* Special Fare Chips - Responsive scroll on mobile */}
            <div className="flex items-center gap-1.5 text-xs overflow-x-auto max-w-full pb-0.5 sm:pb-0 scrollbar-none">
              <span className="font-semibold text-slate-400 shrink-0 text-[10px] sm:text-xs">Special:</span>
              {[
                { id: 'regular', label: 'Regular' },
                { id: 'student', label: 'Student' },
                { id: 'senior', label: 'Senior Citizen' },
                { id: 'armed', label: 'Armed Forces' }
              ].map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setSpecialFare(f.id)}
                  className={`px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full font-semibold border transition-all cursor-pointer shrink-0 whitespace-nowrap text-[10px] sm:text-xs ${
                    specialFare === f.id
                      ? 'bg-amber-50 text-amber-800 border-amber-300 font-bold shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Big Search CTA Button */}
            <motion.button
              type="button"
              onClick={handleSearchSubmit}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto h-11 sm:h-auto px-6 sm:px-8 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-sky-600/30 hover:shadow-sky-600/50 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
              <span>{tripType === 'multiCity' ? `SEARCH ${legs.length} FLIGHTS` : 'SEARCH FLIGHTS'}</span>
            </motion.button>
          </div>

        </motion.div>

        {/* Quick Route Shortcuts (Controlled by Admin CMS) */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-sky-200">
          <span className="font-semibold text-slate-400">Popular Routes:</span>
          {quickRoutes.map(qr => (
            <button
              key={`${qr.from}-${qr.to}`}
              onClick={() => {
                setFromCode(qr.from);
                setToCode(qr.to);
                onSearch({ from: qr.from, to: qr.to, date: departureDate });
              }}
              className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 transition-colors backdrop-blur-xs font-medium cursor-pointer"
            >
              {qr.label}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}

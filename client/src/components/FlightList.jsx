import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Filter, SlidersHorizontal, ArrowUpDown, Sun, Sunset, Moon, Sunrise, RotateCcw, X, Check, Plane, Calendar, ArrowRight, Sparkles, CheckCircle2, Tag, Copy, Zap } from 'lucide-react';
import FlightCard from './FlightCard';
import PriceCalendar from './PriceCalendar';
import AirlineBadge from './AirlineBadge';

export default function FlightList({ flights, loading, searchParams, multiCityLegsData, airports = [], onDateChange, onBookFlight, brand = null }) {
  const [selectedStops, setSelectedStops] = useState('all'); // 'all', '0', '1'
  const [selectedAirlines, setSelectedAirlines] = useState([]);
  const [copiedCoupon, setCopiedCoupon] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('all'); // 'early', 'morning', 'afternoon', 'night', 'all'
  const [maxPrice, setMaxPrice] = useState(30000);
  const [sortBy, setSortBy] = useState('cheapest'); // 'cheapest', 'fastest', 'earliest'
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Multi-City State Management
  const isMultiCity = searchParams?.tripType === 'multiCity' && Array.isArray(multiCityLegsData) && multiCityLegsData.length > 0;
  const [activeLegIndex, setActiveLegIndex] = useState(0);
  const [selectedLegFlights, setSelectedLegFlights] = useState({});

  // Auto-initialize each leg's selected flight with the cheapest option
  useEffect(() => {
    if (isMultiCity && multiCityLegsData) {
      setSelectedLegFlights(prev => {
        const initial = { ...prev };
        multiCityLegsData.forEach((leg, idx) => {
          if (!initial[idx] && leg.flights && leg.flights.length > 0) {
            const sorted = [...leg.flights].sort((a, b) => a.basePrice - b.basePrice);
            initial[idx] = sorted[0];
          }
        });
        return initial;
      });
    }
  }, [isMultiCity, multiCityLegsData]);

  // Active pool of flights depending on whether we are in Multi-City leg view or standard search
  const activeFlightsPool = useMemo(() => {
    if (isMultiCity) {
      return multiCityLegsData[activeLegIndex]?.flights || [];
    }
    return flights;
  }, [isMultiCity, multiCityLegsData, activeLegIndex, flights]);

  // Calculate total price for all selected multi-city legs
  const totalMultiCityPrice = useMemo(() => {
    if (!isMultiCity || !multiCityLegsData) return 0;
    return multiCityLegsData.reduce((sum, _, idx) => {
      const f = selectedLegFlights[idx];
      return sum + (f ? f.basePrice : 0);
    }, 0);
  }, [isMultiCity, multiCityLegsData, selectedLegFlights]);

  // Handle booking the complete multi-city journey
  const handleBookMultiCityCombo = () => {
    if (!isMultiCity || !multiCityLegsData) return;
    const legFlightsList = multiCityLegsData.map((_, idx) => selectedLegFlights[idx]).filter(Boolean);
    if (legFlightsList.length < multiCityLegsData.length) {
      alert('Please select a flight for each leg of your multi-city trip before proceeding.');
      return;
    }

    const firstLeg = legFlightsList[0];
    const lastLeg = legFlightsList[legFlightsList.length - 1];

    const combinedFlight = {
      id: `MC-${Date.now()}`,
      tripType: 'multiCity',
      isMultiCity: true,
      airline: legFlightsList.map(f => f.airline).filter((v, i, a) => a.indexOf(v) === i).join(' / '),
      airlineCode: firstLeg.airlineCode,
      airlineColor: firstLeg.airlineColor,
      flightNumber: legFlightsList.map(f => f.flightNumber).join(' + '),
      from: searchParams.legs?.[0]?.from || firstLeg.from,
      to: searchParams.legs?.[searchParams.legs.length - 1]?.to || lastLeg.to,
      fromCity: firstLeg.fromCity || firstLeg.from,
      toCity: lastLeg.toCity || lastLeg.to,
      departureDate: searchParams.legs?.[0]?.date || firstLeg.departureDate,
      departureTime: firstLeg.departureTime,
      arrivalTime: lastLeg.arrivalTime,
      duration: `Multi-City (${legFlightsList.length} Flights)`,
      stops: legFlightsList.length - 1,
      basePrice: totalMultiCityPrice,
      classes: {
        economy: totalMultiCityPrice,
        premiumEconomy: Math.round(totalMultiCityPrice * 1.4),
        business: Math.round(totalMultiCityPrice * 2.5)
      },
      multiCityLegs: legFlightsList.map((f, i) => ({
        legIndex: i,
        flightId: f.id,
        flightNumber: f.flightNumber,
        airline: f.airline,
        airlineCode: f.airlineCode,
        from: f.from,
        to: f.to,
        fromCity: f.fromCity,
        toCity: f.toCity,
        departureTime: f.departureTime,
        arrivalTime: f.arrivalTime,
        date: searchParams.legs?.[i]?.date,
        price: f.basePrice
      }))
    };

    onBookFlight(combinedFlight, totalMultiCityPrice, 'saver');
  };

  // Extract unique airlines & minimum/maximum prices from incoming flights
  const airlinesList = useMemo(() => {
    const map = new Map();
    activeFlightsPool.forEach(f => {
      if (!map.has(f.airline)) {
        map.set(f.airline, { name: f.airline, code: f.airlineCode, minPrice: f.basePrice, count: 1 });
      } else {
        const item = map.get(f.airline);
        item.count += 1;
        item.minPrice = Math.min(item.minPrice, f.basePrice);
      }
    });
    return Array.from(map.values());
  }, [activeFlightsPool]);

  // Determine min and max base prices
  const { minAvailablePrice, maxAvailablePrice } = useMemo(() => {
    if (!activeFlightsPool.length) return { minAvailablePrice: 2000, maxAvailablePrice: 30000 };
    let min = Infinity;
    let max = -Infinity;
    activeFlightsPool.forEach(f => {
      if (f.basePrice < min) min = f.basePrice;
      if (f.basePrice > max) max = f.basePrice;
    });
    return { minAvailablePrice: min, maxAvailablePrice: max };
  }, [activeFlightsPool]);

  // Ensure all flights are visible by default by syncing maxPrice
  useEffect(() => {
    if (maxAvailablePrice && maxAvailablePrice > 0) {
      setMaxPrice(maxAvailablePrice);
    }
  }, [maxAvailablePrice]);

  // Toggle airline filter
  const toggleAirline = (airlineName) => {
    if (selectedAirlines.includes(airlineName)) {
      setSelectedAirlines(selectedAirlines.filter(a => a !== airlineName));
    } else {
      setSelectedAirlines([...selectedAirlines, airlineName]);
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedStops('all');
    setSelectedAirlines([]);
    setSelectedTimeSlot('all');
    setMaxPrice(maxAvailablePrice || 30000);
    setSortBy('cheapest');
  };

  // Count active filters
  const activeFilterCount = (selectedStops !== 'all' ? 1 : 0) +
    (selectedAirlines.length > 0 ? 1 : 0) +
    (selectedTimeSlot !== 'all' ? 1 : 0) +
    (maxPrice < (maxAvailablePrice || 35000) ? 1 : 0);

  // Helper for departure time categorization
  const checkTimeSlot = (depTime, slot) => {
    if (slot === 'all') return true;
    const hour = parseInt(depTime.split(':')[0], 10);
    if (slot === 'early') return hour < 6;
    if (slot === 'morning') return hour >= 6 && hour < 12;
    if (slot === 'afternoon') return hour >= 12 && hour < 18;
    if (slot === 'night') return hour >= 18;
    return true;
  };

  // Filtered & Sorted Flights
  const processedFlights = useMemo(() => {
    let result = [...activeFlightsPool];

    // Filter by stops
    if (selectedStops !== 'all') {
      result = result.filter(f => f.stops === parseInt(selectedStops));
    }

    // Filter by airlines
    if (selectedAirlines.length > 0) {
      result = result.filter(f => selectedAirlines.includes(f.airline));
    }

    // Filter by price
    if (maxPrice) {
      result = result.filter(f => f.basePrice <= maxPrice);
    }

    // Filter by departure slot
    if (selectedTimeSlot !== 'all') {
      result = result.filter(f => checkTimeSlot(f.departureTime, selectedTimeSlot));
    }

    // Sorting
    if (sortBy === 'cheapest') {
      result.sort((a, b) => a.basePrice - b.basePrice);
    } else if (sortBy === 'fastest') {
      result.sort((a, b) => {
        const getMins = (dur) => {
          const h = parseInt(dur.match(/(\d+)h/)?.[1] || 0);
          const m = parseInt(dur.match(/(\d+)m/)?.[1] || 0);
          return h * 60 + m;
        };
        return getMins(a.duration) - getMins(b.duration);
      });
    } else if (sortBy === 'earliest') {
      result.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
    }

    return result;
  }, [activeFlightsPool, selectedStops, selectedAirlines, maxPrice, selectedTimeSlot, sortBy]);

  // Common Filter Controls (reused in desktop sidebar & mobile drawer)
  const FilterControls = () => (
    <div className="space-y-5">
      {/* Filter by Stops */}
      <div className="border-b border-slate-100 pb-4">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">Stops</h4>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'all', label: 'All' },
            { id: '0', label: 'Non-Stop' },
            { id: '1', label: '1 Stop' }
          ].map(s => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSelectedStops(s.id)}
              className={`py-2 px-2 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                selectedStops === s.id
                  ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter by Departure Time Slots */}
      <div className="border-b border-slate-100 pb-4">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">Departure Time</h4>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'early', icon: Sunrise, label: 'Early', time: 'Before 6 AM' },
            { id: 'morning', icon: Sun, label: 'Morning', time: '6 AM - 12 PM' },
            { id: 'afternoon', icon: Sunset, label: 'Afternoon', time: '12 PM - 6 PM' },
            { id: 'night', icon: Moon, label: 'Night', time: 'After 6 PM' }
          ].map(slot => {
            const Icon = slot.icon;
            const isAct = selectedTimeSlot === slot.id;
            return (
              <button
                key={slot.id}
                type="button"
                onClick={() => setSelectedTimeSlot(isAct ? 'all' : slot.id)}
                className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                  isAct
                    ? 'bg-sky-50 border-sky-500 text-sky-800'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Icon className={`w-3.5 h-3.5 ${isAct ? 'text-sky-600' : 'text-slate-400'}`} />
                  <span className="text-xs font-bold">{slot.label}</span>
                </div>
                <div className="text-[10px] text-slate-400">{slot.time}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter by Price Slider */}
      <div className="border-b border-slate-100 pb-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Max Price</h4>
          <span className="text-sm font-extrabold text-sky-600">₹{maxPrice.toLocaleString('en-IN')}</span>
        </div>
        <input
          type="range"
          min={minAvailablePrice || 2500}
          max={maxAvailablePrice || 35000}
          step={250}
          value={maxPrice}
          onChange={(e) => setMaxPrice(parseInt(e.target.value))}
          className="w-full accent-sky-600 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
          <span>₹{(minAvailablePrice || 2500).toLocaleString('en-IN')}</span>
          <span>₹{(maxAvailablePrice || 35000).toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Filter by Airlines Checkboxes */}
      <div>
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">Airlines</h4>
        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          {airlinesList.map(airline => {
            const isChecked = selectedAirlines.includes(airline.name);
            return (
              <label
                key={airline.name}
                onClick={() => toggleAirline(airline.name)}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer text-xs transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}} // handled by parent div click
                    className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 rounded-sm"
                  />
                  <AirlineBadge code={airline.code} name={airline.name} size="sm" showDetails={false} />
                  <span className="font-bold text-slate-800">{airline.name}</span>
                  <span className="text-[11px] text-slate-400">({airline.count})</span>
                </div>
                <span className="font-semibold text-slate-500 font-mono text-[11px]">
                  ₹{airline.minPrice.toLocaleString('en-IN')}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
      
      {/* Fare Trend Calendar */}
      <PriceCalendar
        from={searchParams.from}
        to={searchParams.to}
        selectedDate={searchParams.date}
        onSelectDate={onDateChange}
      />

      {/* AirSkyIndia-Style Promo Offers & Coupon Strip Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-sky-500/10 border border-amber-200/80 rounded-2xl p-3 sm:p-4 mb-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                <span>Flight Special Fares & Promo Offers Active</span>
                <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">Instant Refunds*</span>
              </h4>
              <p className="text-[11px] text-slate-500">
                Tap any promo code below to copy & auto-apply discount on booking
              </p>
            </div>
          </div>

          {/* Quick Clickable Coupon Chips */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { code: 'AIRSKY500', off: 'Flat ₹500 OFF', bg: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
              { code: 'FLYHIGH', off: '10% OFF', bg: 'bg-sky-50 text-sky-800 border-sky-300' },
              { code: 'IXIGO50', off: 'Flat ₹750 OFF', bg: 'bg-purple-50 text-purple-800 border-purple-300' },
              { code: 'FIRSTFLY', off: '₹1,000 OFF', bg: 'bg-amber-50 text-amber-800 border-amber-300' }
            ].map(cpn => (
              <button
                key={cpn.code}
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(cpn.code);
                  setCopiedCoupon(cpn.code);
                  setTimeout(() => setCopiedCoupon(''), 2500);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-mono font-bold transition-all hover:scale-105 cursor-pointer shadow-2xs ${cpn.bg}`}
                title={`Click to copy ${cpn.code}`}
              >
                <Tag className="w-3 h-3" />
                <span>{cpn.code}</span>
                <span className="opacity-75 text-[10px]">({cpn.off})</span>
                {copiedCoupon === cpn.code ? (
                  <Check className="w-3 h-3 text-emerald-600" />
                ) : (
                  <Copy className="w-2.5 h-2.5 opacity-60" />
                )}
              </button>
            ))}
          </div>
        </div>

        {copiedCoupon && (
          <div className="mt-2 text-[11px] font-bold text-emerald-700 bg-emerald-100/70 border border-emerald-200 px-3 py-1 rounded-lg animate-fadeIn flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Code <strong>{copiedCoupon}</strong> copied! It will be automatically applied when you click "Book Now".</span>
          </div>
        )}
      </div>

      {/* Mobile Quick-Filter Pills Strip */}
      <div className="lg:hidden flex items-center gap-2 overflow-x-auto pb-2 mb-3 scrollbar-none">
        <button
          type="button"
          onClick={() => setMobileFilterOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-600 text-white font-bold text-xs shrink-0 shadow-xs cursor-pointer"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-white text-sky-700 text-[10px] flex items-center justify-center font-black">
              {activeFilterCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setSelectedStops(selectedStops === '0' ? 'all' : '0')}
          className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 border transition-all cursor-pointer ${
            selectedStops === '0'
              ? 'bg-sky-50 border-sky-500 text-sky-700 font-extrabold'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          ⚡ Non-Stop
        </button>

        <button
          type="button"
          onClick={() => setSelectedTimeSlot(selectedTimeSlot === 'morning' ? 'all' : 'morning')}
          className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 border transition-all cursor-pointer ${
            selectedTimeSlot === 'morning'
              ? 'bg-sky-50 border-sky-500 text-sky-700 font-extrabold'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          🌅 Morning
        </button>

        <button
          type="button"
          onClick={() => toggleAirline('IndiGo')}
          className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 border transition-all cursor-pointer ${
            selectedAirlines.includes('IndiGo')
              ? 'bg-sky-50 border-sky-500 text-sky-700 font-extrabold'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          ✈️ IndiGo
        </button>

        <button
          type="button"
          onClick={() => toggleAirline('Air India')}
          className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 border transition-all cursor-pointer ${
            selectedAirlines.includes('Air India')
              ? 'bg-sky-50 border-sky-500 text-sky-700 font-extrabold'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          ✈️ Air India
        </button>

        <button
          type="button"
          onClick={() => setSortBy('cheapest')}
          className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 border transition-all cursor-pointer ${
            sortBy === 'cheapest'
              ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-extrabold'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          💰 Lowest Price
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* Left Sidebar Filter Column (Visible on Desktop) */}
        <aside className="hidden lg:block lg:col-span-3 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs sticky top-24">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <SlidersHorizontal className="w-4 h-4 text-sky-600" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-sky-600 text-white text-[10px] flex items-center justify-center font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset All</span>
              </button>
            </div>

            <div className="pt-4">
              <FilterControls />
            </div>
          </div>
        </aside>

        {/* Right Flights List Column */}
        <main className="lg:col-span-9 w-full">
          
          {/* Multi-City Journey Navigator & Itinerary Banner */}
          {isMultiCity && (
            <div className="bg-gradient-to-r from-sky-900 via-blue-900 to-indigo-950 text-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xl mb-4 border border-sky-800/40">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center font-black shadow-md">
                    <Plane className="w-4 h-4 rotate-45" />
                  </span>
                  <div>
                    <h3 className="font-extrabold text-white text-base sm:text-lg flex items-center gap-2">
                      <span>Multi-City Route Navigator</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-400 text-slate-900 uppercase">
                        {multiCityLegsData.length} Legs
                      </span>
                    </h3>
                    <p className="text-xs text-sky-200">
                      Select your preferred flight for each leg below to assemble your custom itinerary
                    </p>
                  </div>
                </div>

                {/* Total Combined Fare Pill */}
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/15">
                  <div className="text-right">
                    <span className="text-[10px] text-sky-200 font-bold uppercase block leading-none mb-1">Total Combo Fare</span>
                    <span className="text-lg sm:text-xl font-black text-amber-300 font-mono leading-none">
                      ₹{totalMultiCityPrice.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleBookMultiCityCombo}
                    className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Book Complete Multi-City ({multiCityLegsData.length} Flights)</span>
                  </button>
                </div>
              </div>

              {/* Leg Switcher Tabs */}
              <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {multiCityLegsData.map((leg, idx) => {
                  const isCurrent = activeLegIndex === idx;
                  const selected = selectedLegFlights[idx];

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveLegIndex(idx)}
                      className={`text-left p-3 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                        isCurrent
                          ? 'bg-white text-slate-900 border-white shadow-lg ring-2 ring-sky-400'
                          : 'bg-white/10 text-white border-white/10 hover:bg-white/15'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                          isCurrent ? 'bg-sky-600 text-white' : 'bg-white/20 text-sky-200'
                        }`}>
                          Leg {idx + 1}
                        </span>
                        <span className={`text-[11px] font-semibold ${isCurrent ? 'text-slate-500' : 'text-sky-200'}`}>
                          {leg.date}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 font-extrabold text-sm sm:text-base mb-1">
                        <span>{leg.from}</span>
                        <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                        <span>{leg.to}</span>
                      </div>

                      {selected ? (
                        <div className={`flex items-center justify-between text-xs mt-1 pt-1 border-t ${
                          isCurrent ? 'border-slate-100 text-slate-700' : 'border-white/10 text-sky-100'
                        }`}>
                          <span className="font-bold truncate max-w-[120px]">{selected.airline} ({selected.flightNumber})</span>
                          <span className={`font-black font-mono ${isCurrent ? 'text-emerald-600' : 'text-emerald-300'}`}>
                            ₹{selected.basePrice?.toLocaleString('en-IN')}
                          </span>
                        </div>
                      ) : (
                        <div className="text-[11px] text-amber-300 font-bold mt-1">
                          Click to select flight
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Header & Sorting Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base sm:text-xl">
                {isMultiCity ? (
                  <span>
                    Leg {activeLegIndex + 1}: Flights from {multiCityLegsData[activeLegIndex]?.from} to {multiCityLegsData[activeLegIndex]?.to}
                  </span>
                ) : (
                  <span>Flights from {searchParams.from} to {searchParams.to}</span>
                )}
              </h3>
              <p className="text-xs text-slate-500">
                Showing <strong className="text-slate-800">{processedFlights.length}</strong> available flights • {isMultiCity ? multiCityLegsData[activeLegIndex]?.date : searchParams.date}
              </p>
            </div>

            {/* Sorting Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold overflow-x-auto scrollbar-none">
              <button
                type="button"
                onClick={() => setSortBy('cheapest')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  sortBy === 'cheapest' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cheapest
              </button>
              <button
                type="button"
                onClick={() => setSortBy('fastest')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  sortBy === 'fastest' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Fastest
              </button>
              <button
                type="button"
                onClick={() => setSortBy('earliest')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  sortBy === 'earliest' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Earliest
              </button>
            </div>
          </div>

          {/* Flights list rendering */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(n => (
                <div key={n} className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse space-y-4">
                  <div className="h-6 bg-slate-200 rounded w-1/4"></div>
                  <div className="h-12 bg-slate-100 rounded"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : processedFlights.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center shadow-xs">
              <div className="w-16 h-16 bg-sky-50 text-sky-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <RotateCcw className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-1">No Flights Match Your Filter</h3>
              <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
                Try loosening your filters or resetting the price and time slot preferences.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="px-6 py-2.5 bg-sky-600 text-white font-bold rounded-xl text-sm shadow-md hover:bg-sky-500 transition-colors cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              <div className="space-y-4">
                {processedFlights.map(flight => {
                  const isSelectedForThisLeg = isMultiCity && selectedLegFlights[activeLegIndex]?.id === flight.id;

                  return (
                    <div key={flight.id} className="relative">
                      {isSelectedForThisLeg && (
                        <div className="bg-emerald-600 text-white text-[11px] font-black px-4 py-1.5 rounded-t-2xl flex items-center justify-between -mb-2 z-10 relative shadow-sm">
                          <span className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Selected for Leg {activeLegIndex + 1} ({flight.from} ➔ {flight.to})</span>
                          </span>
                          <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-bold">Active Choice</span>
                        </div>
                      )}
                      <FlightCard
                        flight={flight}
                        travelClass={searchParams.travelClass}
                        brand={brand}
                        onBookFlight={(f, currentPrice, selectedFareTier, initialCoupon) => {
                          const couponToUse = initialCoupon || copiedCoupon || '';
                          if (isMultiCity) {
                            setSelectedLegFlights(prev => ({ ...prev, [activeLegIndex]: f }));
                            if (activeLegIndex < multiCityLegsData.length - 1) {
                              setActiveLegIndex(activeLegIndex + 1);
                            }
                          } else {
                            onBookFlight(f, currentPrice, selectedFareTier, couponToUse);
                          }
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </AnimatePresence>
          )}

        </main>

      </div>

      {/* MOBILE FILTER MODAL / DRAWER */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 backdrop-blur-xs p-0 sm:p-4">
            <div className="fixed inset-0" onClick={() => setMobileFilterOpen(false)} />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="relative z-10 w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-sky-600" />
                  <h3 className="font-extrabold text-slate-900 text-base">Filter Flights</h3>
                  {activeFilterCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-sky-600 text-white text-xs flex items-center justify-center font-bold">
                      {activeFilterCount}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-y-auto py-4 flex-1">
                <FilterControls />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Reset All
                </button>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-sky-600 text-white font-extrabold text-xs shadow-md shadow-sky-600/30 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Show {processedFlights.length} Flights</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

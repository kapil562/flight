import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Filter, SlidersHorizontal, ArrowUpDown, Sun, Sunset, Moon, Sunrise, RotateCcw, X, Check, Plane, Calendar, ArrowRight, Sparkles, CheckCircle2, Tag, Copy, Zap } from 'lucide-react';
import FlightCard from './FlightCard';
import AirlineBadge from './AirlineBadge';
import FlightSearchLoader from './FlightSearchLoader';

export default function FlightList({ 
  flights = [], 
  loading = false, 
  searchParams = {}, 
  multiCityLegsData = null, 
  roundTripData = null, 
  airports = [], 
  onDateChange, 
  onBookFlight, 
  brand = null 
}) {
  const [selectedStops, setSelectedStops] = useState('all'); // 'all', '0', '1'
  const [selectedAirlines, setSelectedAirlines] = useState([]);
  const [copiedCoupon, setCopiedCoupon] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('all'); // 'early', 'morning', 'afternoon', 'night', 'all'
  const [maxPrice, setMaxPrice] = useState(30000);
  const [sortBy, setSortBy] = useState('cheapest'); // 'cheapest', 'fastest', 'earliest'
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // ==========================================
  // Multi-City State Management
  // ==========================================
  const isMultiCity = searchParams?.tripType === 'multiCity' && Array.isArray(multiCityLegsData) && multiCityLegsData.length > 0;
  const [activeLegIndex, setActiveLegIndex] = useState(0);
  const [selectedLegFlights, setSelectedLegFlights] = useState({});

  // Reset selected flights when search params or multiCityLegsData change
  useEffect(() => {
    setSelectedLegFlights({});
    setActiveLegIndex(0);
  }, [JSON.stringify(searchParams.legs || [])]);

  // Count of selected legs and status
  const selectedLegsCount = useMemo(() => {
    if (!isMultiCity || !multiCityLegsData) return 0;
    return multiCityLegsData.filter((_, idx) => Boolean(selectedLegFlights[idx])).length;
  }, [isMultiCity, multiCityLegsData, selectedLegFlights]);

  const allLegsSelected = isMultiCity && Boolean(multiCityLegsData) && selectedLegsCount === multiCityLegsData.length;

  const nextUnselectedLegIndex = useMemo(() => {
    if (!isMultiCity || !multiCityLegsData) return 0;
    const idx = multiCityLegsData.findIndex((_, i) => !selectedLegFlights[i]);
    return idx === -1 ? 0 : idx;
  }, [isMultiCity, multiCityLegsData, selectedLegFlights]);

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
      const missingIdx = multiCityLegsData.findIndex((_, idx) => !selectedLegFlights[idx]);
      setActiveLegIndex(missingIdx !== -1 ? missingIdx : 0);
      alert(`Please select a flight for Leg ${missingIdx + 1} (${multiCityLegsData[missingIdx]?.from} ➔ ${multiCityLegsData[missingIdx]?.to}) before proceeding.`);
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

  // ==========================================
  // Round Trip State Management
  // ==========================================
  const isRoundTrip = searchParams?.tripType === 'roundTrip' && Boolean(roundTripData) && Array.isArray(roundTripData.onward);
  const [selectedOnwardFlight, setSelectedOnwardFlight] = useState(null);
  const [selectedReturnFlight, setSelectedReturnFlight] = useState(null);
  const [mobileRoundTab, setMobileRoundTab] = useState('onward'); // 'onward' | 'return'
  const [roundTripViewMode, setRoundTripViewMode] = useState('split'); // 'split' | 'tabs'



  // Calculate total round-trip price
  const totalRoundTripPrice = useMemo(() => {
    if (!isRoundTrip) return 0;
    return (selectedOnwardFlight?.basePrice || 0) + (selectedReturnFlight?.basePrice || 0);
  }, [isRoundTrip, selectedOnwardFlight, selectedReturnFlight]);

  // Book complete round-trip combo
  const handleBookRoundTripCombo = () => {
    if (!isRoundTrip || !roundTripData) return;
    if (!selectedOnwardFlight || !selectedReturnFlight) {
      alert('Please select both departure and return flights to proceed.');
      return;
    }

    const combinedFlight = {
      id: `RT-${selectedOnwardFlight.id}-${selectedReturnFlight.id}`,
      tripType: 'roundTrip',
      isRoundTrip: true,
      airline: selectedOnwardFlight.airline === selectedReturnFlight.airline 
        ? selectedOnwardFlight.airline 
        : `${selectedOnwardFlight.airline} + ${selectedReturnFlight.airline}`,
      airlineCode: selectedOnwardFlight.airlineCode,
      airlineColor: selectedOnwardFlight.airlineColor,
      flightNumber: `${selectedOnwardFlight.flightNumber} / ${selectedReturnFlight.flightNumber}`,
      from: roundTripData.from || selectedOnwardFlight.from,
      to: roundTripData.to || selectedOnwardFlight.to,
      fromCity: selectedOnwardFlight.fromCity || selectedOnwardFlight.from,
      toCity: selectedOnwardFlight.toCity || selectedOnwardFlight.to,
      departureDate: roundTripData.departureDate || selectedOnwardFlight.departureDate,
      returnDate: roundTripData.returnDate || selectedReturnFlight.departureDate,
      departureTime: selectedOnwardFlight.departureTime,
      arrivalTime: selectedReturnFlight.arrivalTime,
      duration: `Round Trip`,
      stops: Math.max(selectedOnwardFlight.stops || 0, selectedReturnFlight.stops || 0),
      layoverAirport: selectedOnwardFlight.layoverAirport || selectedReturnFlight.layoverAirport || null,
      layoverCity: selectedOnwardFlight.layoverCity || selectedReturnFlight.layoverCity || null,
      basePrice: totalRoundTripPrice,
      classes: {
        economy: totalRoundTripPrice,
        premiumEconomy: Math.round(totalRoundTripPrice * 1.35),
        business: Math.round(totalRoundTripPrice * 2.3)
      },
      onwardFlight: selectedOnwardFlight,
      returnFlight: selectedReturnFlight,
      roundTripDetails: {
        onward: selectedOnwardFlight,
        return: selectedReturnFlight
      }
    };

    onBookFlight(combinedFlight, totalRoundTripPrice, 'saver');
  };

  const handleOnwardFlightSelect = (flight) => {
    if (selectedOnwardFlight?.id === flight.id && selectedReturnFlight) {
      handleBookRoundTripCombo();
      return;
    }
    setSelectedOnwardFlight(flight);
    if (!selectedReturnFlight) {
      setMobileRoundTab('return');
    }
  };

  const handleReturnFlightSelect = (flight) => {
    if (selectedReturnFlight?.id === flight.id && selectedOnwardFlight) {
      handleBookRoundTripCombo();
      return;
    }
    setSelectedReturnFlight(flight);
  };

  // Active pool of flights depending on current mode
  const activeFlightsPool = useMemo(() => {
    if (isRoundTrip && roundTripData) {
      return [...(roundTripData.onward || []), ...(roundTripData.return || [])];
    }
    if (isMultiCity) {
      return multiCityLegsData[activeLegIndex]?.flights || [];
    }
    return flights || [];
  }, [isRoundTrip, roundTripData, isMultiCity, multiCityLegsData, activeLegIndex, flights]);

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
    if (slot === 'all' || !depTime) return true;
    const hour = parseInt(depTime.split(':')[0], 10);
    if (slot === 'early') return hour < 6;
    if (slot === 'morning') return hour >= 6 && hour < 12;
    if (slot === 'afternoon') return hour >= 12 && hour < 18;
    if (slot === 'night') return hour >= 18;
    return true;
  };

  // Reusable filter & sort function
  const filterAndSortFlights = (pool) => {
    if (!Array.isArray(pool)) return [];
    let result = [...pool];

    // Filter by stops
    if (selectedStops !== 'all') {
      const targetStops = parseInt(selectedStops);
      result = result.filter(f => selectedStops === '2' ? f.stops >= 2 : f.stops === targetStops);
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
      result.sort((a, b) => (a.departureTime || '').localeCompare(b.departureTime || ''));
    }

    // Guarantee 100% duplicate-free results
    const seen = new Set();
    result = result.filter(f => {
      const key = `${f.airlineCode || f.airline}_${f.departureTime}_${f.arrivalTime}_${f.from}_${f.to}_${f.stops}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return result;
  };

  // Filtered Flights for Round Trip (Onward & Return)
  const processedOnwardFlights = useMemo(() => {
    if (!isRoundTrip || !roundTripData?.onward) return [];
    return filterAndSortFlights(roundTripData.onward);
  }, [isRoundTrip, roundTripData?.onward, selectedStops, selectedAirlines, maxPrice, selectedTimeSlot, sortBy]);

  const processedReturnFlights = useMemo(() => {
    if (!isRoundTrip || !roundTripData?.return) return [];
    return filterAndSortFlights(roundTripData.return);
  }, [isRoundTrip, roundTripData?.return, selectedStops, selectedAirlines, maxPrice, selectedTimeSlot, sortBy]);

  // Standard or Multi-City processed flights
  const processedFlights = useMemo(() => {
    if (isRoundTrip) return processedOnwardFlights;
    return filterAndSortFlights(activeFlightsPool);
  }, [isRoundTrip, processedOnwardFlights, activeFlightsPool, selectedStops, selectedAirlines, maxPrice, selectedTimeSlot, sortBy]);

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
    <div className={`max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 ${(isRoundTrip || isMultiCity) ? 'pb-36 sm:pb-32' : ''}`}>

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
          onClick={() => setSelectedStops(selectedStops === '1' ? 'all' : '1')}
          className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 border transition-all cursor-pointer ${
            selectedStops === '1'
              ? 'bg-amber-50 border-amber-500 text-amber-700 font-extrabold'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          🟡 1-Stop
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
          
          {/* ========================================================= */}
          {/* ROUND TRIP BANNER & FLIGHT SELECTION (MakeMyTrip Pattern) */}
          {/* ========================================================= */}
          {isRoundTrip && !loading && (
            <div className="bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 text-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xl mb-5 border border-sky-800/40">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center font-black shadow-md shrink-0">
                    <Plane className="w-4 h-4 rotate-45" />
                  </span>
                  <div>
                    <h3 className="font-extrabold text-white text-base sm:text-lg flex items-center gap-2">
                      <span>Round Trip Combo Selection</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-400 text-slate-950 uppercase tracking-wide">
                        2 Flights Included
                      </span>
                    </h3>
                    <p className="text-xs text-sky-200">
                      Select 1 departure flight and 1 return flight below to book both together at guaranteed combined fare
                    </p>
                  </div>
                </div>

                {/* Combo Fare Pill */}
                <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 bg-white/10 backdrop-blur-md p-3 sm:px-4 sm:py-2 rounded-2xl border border-white/15">
                  <div className="flex items-center justify-between sm:block text-left sm:text-right">
                    <span className="text-[10px] text-sky-200 font-bold uppercase tracking-wider block leading-none sm:mb-1">
                      {selectedOnwardFlight && selectedReturnFlight ? 'Total Combo Fare' : 'Combo Fare'}
                    </span>
                    <span className="text-lg sm:text-xl font-black text-amber-300 font-mono leading-none">
                      {selectedOnwardFlight || selectedReturnFlight
                        ? `₹${totalRoundTripPrice.toLocaleString('en-IN')}`
                        : 'Select Flights'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleBookRoundTripCombo}
                    disabled={!selectedOnwardFlight || !selectedReturnFlight}
                    className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {!selectedOnwardFlight && !selectedReturnFlight 
                        ? 'Select Flights to Book' 
                        : (!selectedOnwardFlight ? 'Select Departure Flight' : (!selectedReturnFlight ? 'Select Return Flight' : 'Book Round Trip Combo'))}
                    </span>
                  </button>
                </div>
              </div>

              {/* Responsive Tab & View Switcher (Desktop & Mobile) */}
              <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3">
                <div className="grid grid-cols-2 gap-2 flex-1 min-w-[260px]">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileRoundTab('onward');
                      if (roundTripViewMode !== 'tabs') setRoundTripViewMode('tabs');
                    }}
                    className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                      mobileRoundTab === 'onward'
                        ? 'bg-white text-slate-900 border-white shadow-md font-extrabold ring-2 ring-sky-400'
                        : 'bg-white/10 text-white border-white/10 hover:bg-white/15'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] uppercase font-black ${mobileRoundTab === 'onward' ? 'text-sky-600' : 'text-sky-300'}`}>
                        1. Departure Flight
                      </span>
                      {selectedOnwardFlight && <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3]" />}
                    </div>
                    <div className="text-xs font-black truncate">{roundTripData.from} ➔ {roundTripData.to}</div>
                    <div className={`text-[11px] font-mono mt-0.5 font-bold ${
                      selectedOnwardFlight 
                        ? (mobileRoundTab === 'onward' ? 'text-emerald-600' : 'text-emerald-300')
                        : (mobileRoundTab === 'onward' ? 'text-slate-400 italic' : 'text-sky-200/70 italic')
                    }`}>
                      {selectedOnwardFlight ? `₹${selectedOnwardFlight.basePrice?.toLocaleString('en-IN')} (${selectedOnwardFlight.airline})` : 'Tap to Choose'}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMobileRoundTab('return');
                      if (roundTripViewMode !== 'tabs') setRoundTripViewMode('tabs');
                    }}
                    className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                      mobileRoundTab === 'return'
                        ? 'bg-white text-slate-900 border-white shadow-md font-extrabold ring-2 ring-indigo-400'
                        : 'bg-white/10 text-white border-white/10 hover:bg-white/15'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] uppercase font-black ${mobileRoundTab === 'return' ? 'text-indigo-600' : 'text-sky-300'}`}>
                        2. Return Flight
                      </span>
                      {selectedReturnFlight && <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3]" />}
                    </div>
                    <div className="text-xs font-black truncate">{roundTripData.to} ➔ {roundTripData.from}</div>
                    <div className={`text-[11px] font-mono mt-0.5 font-bold ${
                      selectedReturnFlight 
                        ? (mobileRoundTab === 'return' ? 'text-emerald-600' : 'text-emerald-300')
                        : (mobileRoundTab === 'return' ? 'text-slate-400 italic' : 'text-sky-200/70 italic')
                    }`}>
                      {selectedReturnFlight ? `₹${selectedReturnFlight.basePrice?.toLocaleString('en-IN')} (${selectedReturnFlight.airline})` : 'Tap to Choose'}
                    </div>
                  </button>
                </div>

                {/* Desktop View Layout Toggle (Split vs Tabs) */}
                <div className="hidden lg:flex items-center gap-1 bg-white/10 p-1 rounded-xl border border-white/15 text-xs font-bold shrink-0">
                  <button
                    type="button"
                    onClick={() => setRoundTripViewMode('split')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      roundTripViewMode === 'split' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-200 hover:text-white'
                    }`}
                  >
                    Side-by-Side
                  </button>
                  <button
                    type="button"
                    onClick={() => setRoundTripViewMode('tabs')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      roundTripViewMode === 'tabs' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-200 hover:text-white'
                    }`}
                  >
                    Step Tabs
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* MULTI-CITY ROUTE NAVIGATOR & ITINERARY BANNER             */}
          {/* ========================================================= */}
          {isMultiCity && !loading && (
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

                {/* Total Combined Fare Pill & Action */}
                <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 bg-white/10 backdrop-blur-md p-3 sm:px-4 sm:py-2 rounded-2xl border border-white/15">
                  <div className="flex items-center justify-between sm:block text-left sm:text-right">
                    <span className="text-[10px] text-sky-200 font-bold uppercase tracking-wider block leading-none sm:mb-1">
                      {selectedLegsCount === 0 
                        ? 'Total Fare' 
                        : allLegsSelected 
                          ? 'Total Combined Fare' 
                          : `Selected (${selectedLegsCount}/${multiCityLegsData.length})`}
                    </span>
                    <span className="text-lg sm:text-xl font-black text-amber-300 font-mono leading-none">
                      {selectedLegsCount === 0 ? 'Select Flights' : `₹${totalMultiCityPrice.toLocaleString('en-IN')}`}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (allLegsSelected) {
                        handleBookMultiCityCombo();
                      } else {
                        setActiveLegIndex(nextUnselectedLegIndex);
                        const el = document.getElementById('flight-results-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                    className={`w-full sm:w-auto px-4 py-2.5 font-black text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 ${
                      allLegsSelected
                        ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950'
                        : 'bg-white hover:bg-slate-100 text-slate-800'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {selectedLegsCount === 0
                        ? `Select Flight for Leg 1`
                        : allLegsSelected
                          ? `Book Complete Multi-City (${multiCityLegsData.length} Flights)`
                          : `Next: Select Leg ${nextUnselectedLegIndex + 1}`}
                    </span>
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
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded flex items-center gap-1 ${
                          isCurrent ? 'bg-sky-600 text-white' : 'bg-white/20 text-sky-200'
                        }`}>
                          <span>Leg {idx + 1}</span>
                          {selected && <Check className="w-3 h-3 stroke-[3]" />}
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
                        <div className="text-[11px] text-amber-300 font-bold mt-1 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                          <span>Click to select flight</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Header & Sorting Bar (Only in standard one-way or multi-city mode when NOT loading) */}
          {!isRoundTrip && !loading && (
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
          )}

          {/* ========================================================= */}
          {/* FLIGHTS RENDERING                                         */}
          {/* ========================================================= */}
          {loading ? (
            <FlightSearchLoader
              searchParams={searchParams}
              airports={airports}
              isRoundTrip={isRoundTrip}
              roundTripData={roundTripData}
              isMultiCity={isMultiCity}
              multiCityLegsData={multiCityLegsData}
              brand={brand}
            />
          ) : isRoundTrip ? (
            /* ========================================================= */
            /* ROUND TRIP SPLIT 2-COLUMN VIEW (DESKTOP) & TABS (MOBILE)   */
            /* ========================================================= */
            <div>
              {/* Desktop View: Split 2-Columns OR Step Tabs based on user toggle */}
              {roundTripViewMode === 'split' ? (
                <div className="hidden lg:grid lg:grid-cols-2 gap-5 items-start">
                  
                  {/* Left Column: Departure Flights */}
                  <div className="space-y-3.5">
                    <div className="bg-sky-50/70 border border-sky-200/80 rounded-2xl p-3.5 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-black uppercase text-sky-700 tracking-wider block">
                          Departure Flight
                        </span>
                        <h4 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-1.5">
                          <span>{roundTripData.from}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-sky-600" />
                          <span>{roundTripData.to}</span>
                        </h4>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {roundTripData.departureDate} • {processedOnwardFlights.length} Flights available
                        </p>
                      </div>

                      {selectedOnwardFlight && (
                        <div className="text-right bg-white px-3 py-1.5 rounded-xl border border-sky-100 shadow-xs">
                          <span className="text-[9px] uppercase font-bold text-slate-400 block leading-tight">Selected Fare</span>
                          <span className="font-mono font-black text-emerald-600 text-xs sm:text-sm">
                            ₹{selectedOnwardFlight.basePrice?.toLocaleString('en-IN')}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      {processedOnwardFlights.map(flight => (
                        <FlightCard
                          key={`onward-${flight.id}`}
                          flight={flight}
                          travelClass={searchParams.travelClass}
                          brand={brand}
                          isSelectable={true}
                          isSelected={selectedOnwardFlight?.id === flight.id}
                          selectLabel="Select Departure"
                          selectedLabel={selectedOnwardFlight?.id === flight.id && selectedReturnFlight ? "Book Round Trip" : "Departure Chosen"}
                          onSelect={() => handleOnwardFlightSelect(flight)}
                          onBookFlight={() => handleOnwardFlightSelect(flight)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Return Flights */}
                  <div className="space-y-3.5">
                    <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-2xl p-3.5 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-black uppercase text-indigo-700 tracking-wider block">
                          Return Flight
                        </span>
                        <h4 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-1.5">
                          <span>{roundTripData.to}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{roundTripData.from}</span>
                        </h4>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {roundTripData.returnDate} • {processedReturnFlights.length} Flights available
                        </p>
                      </div>

                      {selectedReturnFlight && (
                        <div className="text-right bg-white px-3 py-1.5 rounded-xl border border-indigo-100 shadow-xs">
                          <span className="text-[9px] uppercase font-bold text-slate-400 block leading-tight">Selected Fare</span>
                          <span className="font-mono font-black text-emerald-600 text-xs sm:text-sm">
                            ₹{selectedReturnFlight.basePrice?.toLocaleString('en-IN')}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      {processedReturnFlights.map(flight => (
                        <FlightCard
                          key={`return-${flight.id}`}
                          flight={flight}
                          travelClass={searchParams.travelClass}
                          brand={brand}
                          isSelectable={true}
                          isSelected={selectedReturnFlight?.id === flight.id}
                          selectLabel="Select Return"
                          selectedLabel={selectedReturnFlight?.id === flight.id && selectedOnwardFlight ? "Book Round Trip" : "Return Chosen"}
                          onSelect={() => handleReturnFlightSelect(flight)}
                          onBookFlight={() => handleReturnFlightSelect(flight)}
                        />
                      ))}
                    </div>
                  </div>

                </div>
              ) : (
                <div className="hidden lg:block space-y-4">
                  {mobileRoundTab === 'onward' ? (
                    <div>
                      <div className="text-xs font-bold text-slate-600 mb-2.5 flex items-center justify-between bg-sky-50/70 p-3 rounded-xl border border-sky-200/80">
                        <span className="font-extrabold text-sky-900 text-sm">Select Departure Flight: {roundTripData.from} ➔ {roundTripData.to}</span>
                        <span className="font-mono text-sky-700 font-bold">{roundTripData.departureDate} • {processedOnwardFlights.length} Flights</span>
                      </div>
                      <div className="space-y-3">
                        {processedOnwardFlights.map(flight => (
                          <FlightCard
                            key={`d-onward-${flight.id}`}
                            flight={flight}
                            travelClass={searchParams.travelClass}
                            brand={brand}
                            isSelectable={true}
                            isSelected={selectedOnwardFlight?.id === flight.id}
                            selectLabel="Select Departure"
                            selectedLabel={selectedOnwardFlight?.id === flight.id && selectedReturnFlight ? "Book Round Trip" : "Departure Chosen"}
                            onSelect={() => handleOnwardFlightSelect(flight)}
                            onBookFlight={() => handleOnwardFlightSelect(flight)}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-xs font-bold text-slate-600 mb-2.5 flex items-center justify-between bg-indigo-50/70 p-3 rounded-xl border border-indigo-200/80">
                        <span className="font-extrabold text-indigo-900 text-sm">Select Return Flight: {roundTripData.to} ➔ {roundTripData.from}</span>
                        <span className="font-mono text-indigo-700 font-bold">{roundTripData.returnDate} • {processedReturnFlights.length} Flights</span>
                      </div>
                      <div className="space-y-3">
                        {processedReturnFlights.map(flight => (
                          <FlightCard
                            key={`d-return-${flight.id}`}
                            flight={flight}
                            travelClass={searchParams.travelClass}
                            brand={brand}
                            isSelectable={true}
                            isSelected={selectedReturnFlight?.id === flight.id}
                            selectLabel="Select Return"
                            selectedLabel={selectedReturnFlight?.id === flight.id && selectedOnwardFlight ? "Book Round Trip" : "Return Chosen"}
                            onSelect={() => handleReturnFlightSelect(flight)}
                            onBookFlight={() => handleReturnFlightSelect(flight)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Mobile Single-Column Tab View */}
              <div className="lg:hidden space-y-4">
                {mobileRoundTab === 'onward' ? (
                  <div>
                    <div className="text-xs font-bold text-slate-600 mb-2 flex items-center justify-between">
                      <span>Showing Departure Flights ({roundTripData.from} ➔ {roundTripData.to})</span>
                      <span className="font-mono text-sky-600">{roundTripData.departureDate}</span>
                    </div>
                    <div className="space-y-3">
                      {processedOnwardFlights.map(flight => (
                        <FlightCard
                          key={`m-onward-${flight.id}`}
                          flight={flight}
                          travelClass={searchParams.travelClass}
                          brand={brand}
                          isSelectable={true}
                          isSelected={selectedOnwardFlight?.id === flight.id}
                          selectLabel="Select Departure"
                          selectedLabel={selectedOnwardFlight?.id === flight.id && selectedReturnFlight ? "Book Round Trip" : "Departure Chosen"}
                          onSelect={() => handleOnwardFlightSelect(flight)}
                          onBookFlight={() => handleOnwardFlightSelect(flight)}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-xs font-bold text-slate-600 mb-2 flex items-center justify-between">
                      <span>Showing Return Flights ({roundTripData.to} ➔ {roundTripData.from})</span>
                      <span className="font-mono text-indigo-600">{roundTripData.returnDate}</span>
                    </div>
                    <div className="space-y-3">
                      {processedReturnFlights.map(flight => (
                        <FlightCard
                          key={`m-return-${flight.id}`}
                          flight={flight}
                          travelClass={searchParams.travelClass}
                          brand={brand}
                          isSelectable={true}
                          isSelected={selectedReturnFlight?.id === flight.id}
                          selectLabel="Select Return"
                          selectedLabel={selectedReturnFlight?.id === flight.id && selectedOnwardFlight ? "Book Round Trip" : "Return Chosen"}
                          onSelect={() => handleReturnFlightSelect(flight)}
                          onBookFlight={() => handleReturnFlightSelect(flight)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : processedFlights.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center shadow-xs">
              <div className="w-16 h-16 bg-sky-50 text-sky-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <RotateCcw className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-1">
                {flights.length === 0 ? 'No Live Flights Found' : 'No Flights Match Your Filter'}
              </h3>
              <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
                {flights.length === 0
                  ? 'No real-time flights were returned for this route. Please make sure your SerpApi Key is valid and active in Admin Settings, or try different dates/airports.'
                  : 'Try loosening your filters or resetting the price and time slot preferences.'}
              </p>
              {flights.length > 0 && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-6 py-2.5 bg-sky-600 text-white font-bold rounded-xl text-sm shadow-md hover:bg-sky-500 transition-colors cursor-pointer"
                >
                  Reset All Filters
                </button>
              )}
            </div>
          ) : (
            /* ========================================================= */
            /* ONE-WAY / MULTI-CITY SINGLE COLUMN FLIGHTS LIST            */
            /* ========================================================= */
            <div className="space-y-4">
              {/* All Legs Selected Celebration Banner */}
              {isMultiCity && allLegsSelected && (
                <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 border border-emerald-400/40">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-black text-xl shrink-0">
                      ✓
                    </span>
                    <div>
                      <h4 className="font-extrabold text-sm sm:text-base leading-tight">
                        All {multiCityLegsData.length} Legs Selected!
                      </h4>
                      <p className="text-xs text-emerald-100 mt-0.5">
                        Total Combined Fare: <strong className="text-white font-mono text-sm">₹{totalMultiCityPrice.toLocaleString('en-IN')}</strong>
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleBookMultiCityCombo}
                    className="w-full sm:w-auto px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span>Proceed to Book All {multiCityLegsData.length} Flights</span>
                  </button>
                </div>
              )}

              <AnimatePresence mode="popLayout">
                <div className="space-y-4">
                  {processedFlights.map(flight => {
                    const isSelectedForThisLeg = isMultiCity && selectedLegFlights[activeLegIndex]?.id === flight.id;

                    const handleMultiCityPick = (f) => {
                      setSelectedLegFlights(prev => {
                        const updated = { ...prev, [activeLegIndex]: f };
                        const allDone = multiCityLegsData.every((_, i) => Boolean(updated[i]));
                        if (!allDone && activeLegIndex < multiCityLegsData.length - 1) {
                          setActiveLegIndex(activeLegIndex + 1);
                          setTimeout(() => {
                            const el = document.getElementById('flight-results-section');
                            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }, 100);
                        }
                        return updated;
                      });
                    };

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
                          isSelectable={isMultiCity}
                          isSelected={isSelectedForThisLeg}
                          selectLabel={`Select for Leg ${activeLegIndex + 1}`}
                          selectedLabel={isSelectedForThisLeg && allLegsSelected ? `Book All ${multiCityLegsData.length} Flights` : `Leg ${activeLegIndex + 1} Chosen`}
                          onSelect={() => {
                            if (isMultiCity) {
                              if (isSelectedForThisLeg && allLegsSelected) {
                                handleBookMultiCityCombo();
                              } else {
                                handleMultiCityPick(flight);
                              }
                            }
                          }}
                          onBookFlight={(f, currentPrice, selectedFareTier, initialCoupon) => {
                            const couponToUse = initialCoupon || copiedCoupon || '';
                            if (isMultiCity) {
                              if (isSelectedForThisLeg && allLegsSelected) {
                                handleBookMultiCityCombo();
                              } else {
                                handleMultiCityPick(f);
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
            </div>
          )}

        </main>

      </div>


      {/* ========================================================= */}
      {/* STICKY BOTTOM ACTION DOCK (Round Trip & Multi-City)       */}
      {/* Zero scrolling required to book combo!                    */}
      {/* ========================================================= */}
      <AnimatePresence>
        {isRoundTrip && (selectedOnwardFlight || selectedReturnFlight) && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md text-white border-t border-sky-500/30 shadow-[0_-10px_35px_rgba(0,0,0,0.4)] px-3 sm:px-6 py-2.5 sm:py-3.5"
          >
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
              
              {/* Left / Middle: Selected Flight Chips */}
              <div className="w-full sm:w-auto flex items-center gap-2 overflow-x-auto scrollbar-none pb-0.5 sm:pb-0">
                
                {/* Departure Flight Chip */}
                <button
                  type="button"
                  onClick={() => {
                    setMobileRoundTab('onward');
                    if (roundTripViewMode !== 'tabs') setRoundTripViewMode('tabs');
                  }}
                  className={`px-3 py-1.5 rounded-xl border text-left shrink-0 transition-all cursor-pointer ${
                    selectedOnwardFlight
                      ? 'bg-sky-950/90 border-sky-400 text-sky-100 ring-1 ring-sky-400/50'
                      : 'bg-white/5 border-dashed border-sky-400/40 text-sky-300/80 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] uppercase font-black tracking-wider text-sky-300">
                      1. Departure
                    </span>
                    {selectedOnwardFlight && <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />}
                  </div>
                  <div className="text-xs font-black truncate max-w-[130px] sm:max-w-[180px]">
                    {roundTripData.from} ➔ {roundTripData.to}
                  </div>
                  <div className="text-[10px] font-mono text-emerald-400 font-bold truncate">
                    {selectedOnwardFlight ? `₹${selectedOnwardFlight.basePrice?.toLocaleString('en-IN')} (${selectedOnwardFlight.airline})` : 'Tap to Select'}
                  </div>
                </button>

                {/* Return Flight Chip */}
                <button
                  type="button"
                  onClick={() => {
                    setMobileRoundTab('return');
                    if (roundTripViewMode !== 'tabs') setRoundTripViewMode('tabs');
                  }}
                  className={`px-3 py-1.5 rounded-xl border text-left shrink-0 transition-all cursor-pointer ${
                    selectedReturnFlight
                      ? 'bg-indigo-950/90 border-indigo-400 text-indigo-100 ring-1 ring-indigo-400/50'
                      : 'bg-white/5 border-dashed border-indigo-400/40 text-indigo-300/80 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] uppercase font-black tracking-wider text-indigo-300">
                      2. Return
                    </span>
                    {selectedReturnFlight && <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />}
                  </div>
                  <div className="text-xs font-black truncate max-w-[130px] sm:max-w-[180px]">
                    {roundTripData.to} ➔ {roundTripData.from}
                  </div>
                  <div className="text-[10px] font-mono text-emerald-400 font-bold truncate">
                    {selectedReturnFlight ? `₹${selectedReturnFlight.basePrice?.toLocaleString('en-IN')} (${selectedReturnFlight.airline})` : 'Tap to Select'}
                  </div>
                </button>

              </div>

              {/* Right: Total Price & Instant Book Action */}
              <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-3 sm:gap-4 shrink-0">
                <div className="text-left sm:text-right">
                  <div className="text-[9px] uppercase font-bold text-sky-200/80 tracking-wider">
                    {selectedOnwardFlight && selectedReturnFlight ? 'Total Combo Fare' : 'Combo Fare'}
                  </div>
                  <div className="text-lg sm:text-2xl font-black text-amber-300 font-mono leading-none">
                    ₹{totalRoundTripPrice.toLocaleString('en-IN')}
                  </div>
                </div>

                {selectedOnwardFlight && selectedReturnFlight ? (
                  <button
                    type="button"
                    onClick={handleBookRoundTripCombo}
                    className="flex-1 sm:flex-none px-5 sm:px-7 py-2.5 sm:py-3 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-102 active:scale-98"
                  >
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span>Book Round Trip Combo</span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </button>
                ) : !selectedReturnFlight ? (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileRoundTab('return');
                      if (roundTripViewMode !== 'tabs') setRoundTripViewMode('tabs');
                    }}
                    className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 bg-sky-500 hover:bg-sky-400 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                  >
                    <span>Choose Return Flight</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileRoundTab('onward');
                      if (roundTripViewMode !== 'tabs') setRoundTripViewMode('tabs');
                    }}
                    className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 bg-sky-500 hover:bg-sky-400 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                  >
                    <span>Choose Departure Flight</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMultiCity && selectedLegsCount > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md text-white border-t border-emerald-500/30 shadow-[0_-10px_35px_rgba(0,0,0,0.4)] px-3 sm:px-6 py-2.5 sm:py-3.5"
          >
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
              
              {/* Multi-City Legs Chips */}
              <div className="w-full sm:w-auto flex items-center gap-2 overflow-x-auto scrollbar-none pb-0.5 sm:pb-0">
                {multiCityLegsData.map((leg, idx) => {
                  const flight = selectedLegFlights[idx];
                  const isActive = activeLegIndex === idx;
                  return (
                    <button
                      key={`dock-leg-${idx}`}
                      type="button"
                      onClick={() => setActiveLegIndex(idx)}
                      className={`px-3 py-1.5 rounded-xl border text-left shrink-0 transition-all cursor-pointer ${
                        flight
                          ? 'bg-emerald-950/90 border-emerald-400 text-emerald-100 ring-1 ring-emerald-400/50'
                          : isActive
                          ? 'bg-sky-900/80 border-sky-400 text-white ring-2 ring-sky-400'
                          : 'bg-white/5 border-dashed border-white/20 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] uppercase font-black tracking-wider text-sky-300">
                          Leg {idx + 1}
                        </span>
                        {flight && <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />}
                      </div>
                      <div className="text-xs font-black truncate max-w-[110px] sm:max-w-[150px]">
                        {leg.from} ➔ {leg.to}
                      </div>
                      <div className="text-[10px] font-mono font-bold text-emerald-400 truncate">
                        {flight ? `₹${flight.basePrice?.toLocaleString('en-IN')}` : 'Select Flight'}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Price & Action */}
              <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-3 sm:gap-4 shrink-0">
                <div className="text-left sm:text-right">
                  <div className="text-[9px] uppercase font-bold text-sky-200/80 tracking-wider">
                    {allLegsSelected ? `All ${multiCityLegsData.length} Legs Fare` : `Selected (${selectedLegsCount}/${multiCityLegsData.length})`}
                  </div>
                  <div className="text-lg sm:text-2xl font-black text-amber-300 font-mono leading-none">
                    ₹{totalMultiCityPrice.toLocaleString('en-IN')}
                  </div>
                </div>

                {allLegsSelected ? (
                  <button
                    type="button"
                    onClick={handleBookMultiCityCombo}
                    className="flex-1 sm:flex-none px-5 sm:px-7 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-102 active:scale-98"
                  >
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span>Book All {multiCityLegsData.length} Flights</span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setActiveLegIndex(nextMissingLegIndex)}
                    className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 bg-sky-500 hover:bg-sky-400 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                  >
                    <span>Choose Leg {nextMissingLegIndex + 1}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>


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

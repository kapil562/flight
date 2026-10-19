import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plane, Clock, Luggage, Utensils, ChevronDown, ChevronUp, ShieldCheck, Info, MessageCircle, Phone, Lock, Tag, Sparkles, Check, ArrowRight } from 'lucide-react';
import AirlineBadge from './AirlineBadge';
import HoldFareModal from './HoldFareModal';

const formatTerminal = (term) => {
  if (!term) return '';
  const str = String(term).trim();
  if (/^T\d/i.test(str)) return str;
  if (/^\d/.test(str)) return `T${str}`;
  return str;
};

export default function FlightCard({ 
  flight, 
  travelClass = 'economy', 
  onBookFlight, 
  brand = null,
  isSelectable = false,
  isSelected = false,
  selectLabel = 'Select Flight',
  selectedLabel = 'Selected',
  onSelect = null
}) {
  const [showDetails, setShowDetails] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState('info'); // 'info' | 'fare' | 'baggage' | 'cancellation'
  const [showHoldModal, setShowHoldModal] = useState(false);

  const currentPrice = flight.classes?.[travelClass] || flight.basePrice;
  const originalPrice = Math.round(currentPrice * 1.18);
  const totalSavings = originalPrice - currentPrice;

  // Contact details from brand
  const activeBrand = brand || window.__BRAND__ || {};
  const phone = activeBrand.phone || '+91 72248 28030';
  const whatsappNumber = (activeBrand.whatsapp || '918077680310').replace(/\D/g, '');

  const handleWhatsAppBooking = (e) => {
    e.stopPropagation();
    const message = encodeURIComponent(
      `Hi ${activeBrand.name || 'AIR SKY'}, I want to book this flight:\n` +
      `✈️ Flight: ${flight.airline} (${flight.flightNumber})\n` +
      `🛫 Route: ${flight.from} (${flight.fromCity}) ➔ ${flight.to} (${flight.toCity})\n` +
      `⏰ Departure: ${flight.departureTime} | Arrival: ${flight.arrivalTime}\n` +
      `💰 Fare: ₹${currentPrice.toLocaleString('en-IN')} (${travelClass.toUpperCase()})\n\n` +
      `Please check availability and confirm booking.`
    );
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  const handleCallToBook = (e) => {
    e.stopPropagation();
    window.open(`tel:${phone.replace(/\s+/g, '')}`, '_self');
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        whileHover={{ y: -3, boxShadow: '0 16px 30px -8px rgba(0,0,0,0.08)' }}
        transition={{ duration: 0.3 }}
        className={`bg-white rounded-2xl border transition-all overflow-hidden mb-4 ${
          isSelected 
            ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md bg-emerald-50/10' 
            : 'border-slate-200/90 shadow-xs'
        }`}
      >
        
        {/* Top Banner if fast or best value */}
        {flight.stops === 0 && flight.basePrice < 5000 && (
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-1 text-white text-[11px] font-bold tracking-wide flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Fastest & Best Value Non-Stop Flight</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-white/20 px-2 py-0.5 rounded text-[10px]">Instant PNR</span>
              <span className="bg-emerald-700/60 px-2 py-0.5 rounded text-[10px]">Special Fares • Instant refunds*</span>
            </div>
          </div>
        )}

        <div className="p-4 sm:p-5">
          {isSelectable || compact ? (
            /* ======================================================== */
            /* COMPACT COMBO / SPLIT-VIEW LAYOUT (Zero Text Collisions)  */
            /* ======================================================== */
            <div>
              {/* Row 1: Airline Badge, Flight No, Aircraft & Stops Badge */}
              <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2 min-w-0">
                  <AirlineBadge code={flight.airlineCode} name={flight.airline} logoUrl={flight.airlineLogo || flight.logo} size="sm" />
                  <div className="min-w-0 flex items-center gap-1.5 text-xs text-slate-500">
                    <span className="font-mono font-bold text-slate-700">{flight.flightNumber}</span>
                    <span>•</span>
                    <span className="truncate max-w-[130px]">{flight.aircraft}</span>
                  </div>
                </div>
                <div className="shrink-0">
                  {flight.stops === 0 ? (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Non-Stop
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-200">
                      {flight.stops} Stop {flight.layoverAirport ? `via ${flight.layoverAirport}` : ''}
                    </span>
                  )}
                </div>
              </div>

              {/* Row 2: Timings & Route (Clear 3-Column Grid) */}
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 py-1.5">
                {/* Departure */}
                <div className="text-left min-w-0">
                  <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none">
                    {flight.departureTime}
                  </div>
                  <div className="text-xs font-black text-slate-800 mt-1 flex items-center gap-1">
                    <span>{flight.from}</span>
                    {flight.terminal?.from && (
                      <span className="text-[10px] text-slate-400 font-semibold">({formatTerminal(flight.terminal.from)})</span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">{flight.fromCity}</div>
                </div>

                {/* Duration Line */}
                <div className="w-24 sm:w-28 text-center px-1">
                  <div className="text-[10px] font-bold text-slate-500 mb-1 flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{flight.duration}</span>
                  </div>
                  <div className="relative flex items-center justify-center">
                    <div className="w-full h-0.5 bg-gradient-to-r from-sky-400 via-sky-600 to-indigo-600"></div>
                    <div className="absolute w-1.5 h-1.5 rounded-full bg-sky-500 -left-0.5"></div>
                    <Plane className="w-3.5 h-3.5 text-sky-600 rotate-90 bg-white" />
                    <div className="absolute w-1.5 h-1.5 rounded-full bg-indigo-500 -right-0.5"></div>
                  </div>
                  <div className="text-[10px] font-semibold text-slate-400 mt-1">
                    {flight.stops === 0 ? 'Direct' : `${flight.stops} Stop`}
                  </div>
                </div>

                {/* Arrival */}
                <div className="text-right min-w-0">
                  <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none">
                    {flight.arrivalTime}
                  </div>
                  <div className="text-xs font-black text-slate-800 mt-1 flex items-center justify-end gap-1">
                    <span>{flight.to}</span>
                    {flight.terminal?.to && (
                      <span className="text-[10px] text-slate-400 font-semibold">({formatTerminal(flight.terminal.to)})</span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">{flight.toCity}</div>
                </div>
              </div>

              {/* Row 3: Price (Left) & Select Action (Right) */}
              <div className="flex items-center justify-between gap-3 pt-3 mt-2 border-t border-slate-100">
                <div>
                  <div className="flex items-center gap-1.5 leading-none">
                    <span className="text-[11px] line-through text-slate-400 font-semibold">
                      ₹{originalPrice.toLocaleString('en-IN')}
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                      Save ₹{totalSavings.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                    ₹{currentPrice.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-slate-400">per traveller • taxes incl.</div>
                </div>

                <div>
                  <motion.button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onSelect) onSelect(flight);
                      else if (onBookFlight) onBookFlight(flight, currentPrice);
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-extrabold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30 ring-2 ring-emerald-300'
                        : 'bg-white hover:bg-sky-50 text-sky-700 border-2 border-sky-600 shadow-sky-600/10'
                    }`}
                    title={isSelected ? 'Flight Selected' : 'Click to select this flight'}
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>{selectedLabel}</span>
                      </>
                    ) : (
                      <span>{selectLabel}</span>
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          ) : (
            /* ======================================================== */
            /* STANDARD WIDE LAYOUT (One-Way Desktop Flights)            */
            /* ======================================================== */
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              
              {/* Airline Col */}
              <div className="md:col-span-3">
                <AirlineBadge code={flight.airlineCode} name={flight.airline} logoUrl={flight.airlineLogo || flight.logo} />
                <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-mono font-semibold">{flight.flightNumber}</span>
                  <span>•</span>
                  <span className="truncate">{flight.aircraft}</span>
                </div>
              </div>

              {/* Timings & Duration Col */}
              <div className="md:col-span-5 flex items-center justify-between sm:justify-around gap-2">
                
                {/* Departure */}
                <div className="text-left">
                  <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {flight.departureTime}
                  </div>
                  <div className="text-xs font-bold text-slate-700">{flight.from}</div>
                  <div className="text-[11px] text-slate-500">{flight.fromCity}</div>
                  {flight.terminal?.from && (
                    <div className="text-[10px] text-slate-400 font-semibold">{flight.terminal.from}</div>
                  )}
                </div>

                {/* Path and Duration line */}
                <div className="flex-1 max-w-[140px] text-center px-2">
                  <div className="text-[11px] font-bold text-slate-500 mb-1 flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{flight.duration}</span>
                  </div>
                  
                  <div className="relative flex items-center justify-center">
                    <div className="w-full h-0.5 bg-gradient-to-r from-sky-300 via-sky-500 to-indigo-500"></div>
                    <div className="absolute w-2 h-2 rounded-full bg-sky-500 -left-0.5"></div>
                    {flight.stops > 0 && (
                      <div 
                        className="absolute w-2.5 h-2.5 rounded-full bg-amber-500 border-2 border-white shadow-xs z-10" 
                        title={`Layover: ${flight.layover || flight.layoverCity || '1 Stop'}`}
                      ></div>
                    )}
                    <motion.div 
                      className="absolute bg-white px-0.5"
                      animate={{ x: [-12, 12, -12] }}
                      transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <Plane className="w-3.5 h-3.5 text-sky-600 rotate-90" />
                    </motion.div>
                    <div className="absolute w-2 h-2 rounded-full bg-indigo-500 -right-0.5"></div>
                  </div>

                  <div className="text-[10px] font-semibold text-slate-400 mt-1">
                    {flight.stops === 0 ? (
                      <span className="text-emerald-600 font-bold">Non-Stop</span>
                    ) : (
                      <span className="text-amber-700 font-bold inline-flex items-center gap-1">
                        <span>{flight.stops} Stop</span>
                        {(flight.layoverAirport || flight.layoverCity) && (
                          <span className="text-slate-500 font-medium">via {flight.layoverAirport || flight.layoverCity}</span>
                        )}
                      </span>
                    )}
                  </div>
                </div>

                {/* Arrival */}
                <div className="text-right">
                  <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {flight.arrivalTime}
                  </div>
                  <div className="text-xs font-bold text-slate-700">{flight.to}</div>
                  <div className="text-[11px] text-slate-500">{flight.toCity}</div>
                  {flight.terminal?.to && (
                    <div className="text-[10px] text-slate-400 font-semibold">{flight.terminal.to}</div>
                  )}
                </div>

              </div>

              {/* Pricing & Multiple Booking Actions Col */}
              <div className="md:col-span-4 flex flex-col items-start md:items-end justify-between gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                
                {/* Price display with Strikethrough & Savings */}
                <div className="text-left md:text-right">
                  <div className="flex items-center md:justify-end gap-2">
                    <span className="text-xs line-through text-slate-400 font-semibold">
                      ₹{originalPrice.toLocaleString('en-IN')}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      Save ₹{totalSavings.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    ₹{currentPrice.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-slate-400">per traveller • taxes incl.</div>
                </div>

                {/* Primary Booking / Selection Action */}
                <div className="w-full md:w-auto">
                  <motion.button
                    onClick={() => onBookFlight(flight, currentPrice)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full md:w-auto px-7 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-extrabold text-sm shadow-md shadow-sky-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
                    title="Instant Online Seat & Passenger Booking"
                  >
                    Book Now
                  </motion.button>
                </div>

                {/* Quick Coupon Chip (Only for standalone one-way booking) */}
                <div 
                  onClick={() => onBookFlight(flight, currentPrice, 'saver', 'AIRSKY500')}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-lg cursor-pointer transition-colors"
                  title="Click to apply AIRSKY500 on this flight"
                >
                  <Tag className="w-3 h-3 text-emerald-600" />
                  <span>Use <strong>AIRSKY500</strong> for Flat ₹500 Off</span>
                </div>

              </div>

            </div>
          )}

          {/* Badges / Add-ons row */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-3 text-slate-500">
              <div className="flex items-center gap-1.5 font-medium">
                <Luggage className="w-3.5 h-3.5 text-slate-400" />
                <span>{flight.baggage}</span>
              </div>
              {flight.mealIncluded ? (
                <div className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                  <Utensils className="w-3.5 h-3.5" />
                  <span>Free In-Flight Meal</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Utensils className="w-3.5 h-3.5" />
                  <span>Meals Available for purchase</span>
                </div>
              )}
              {flight.seatsAvailable < 40 && (
                <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-md">
                  Only {flight.seatsAvailable} seats left!
                </span>
              )}
            </div>

            {/* Collapsible toggle */}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-sky-600 hover:text-sky-700 font-bold flex items-center gap-1 text-xs cursor-pointer"
            >
              <span>{showDetails ? 'Hide Details' : 'Flight Details'}</span>
              {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Collapsible Details Drawer - Ultra Compact */}
          <AnimatePresence>
            {showDetails && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-2.5 pt-2.5 border-t border-slate-200/90 bg-slate-50/70 -mx-4 -mb-4 sm:-mx-5 sm:-mb-5 p-2.5 sm:p-3 rounded-b-2xl overflow-hidden"
              >
                {/* 4 Tabs Header - Compact */}
                <div className="flex items-center gap-1.5 border-b border-slate-200/80 pb-2 mb-2.5 overflow-x-auto scrollbar-none">
                  {[
                    { id: 'info', label: 'Flight Info', icon: Plane },
                    { id: 'fare', label: 'Fare Details', icon: Tag },
                    { id: 'baggage', label: 'Baggage', icon: Luggage },
                    { id: 'cancellation', label: 'Cancellation', icon: ShieldCheck }
                  ].map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeDetailTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveDetailTab(tab.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                          isActive
                            ? 'bg-sky-600 text-white shadow-xs'
                            : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <Icon className="w-3 h-3" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* TAB 1: FLIGHT INFORMATION - Ultra Compact */}
                {activeDetailTab === 'info' && (
                  <div className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-xs space-y-2.5 animate-fadeIn">
                    {/* Compact Route Flow & Airline info in 1 sleek strip */}
                    <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100 flex-wrap">
                      <div className="flex items-center gap-2 min-w-0">
                        <AirlineBadge code={flight.airlineCode} name={flight.airline} showDetails={false} size="sm" />
                        <span className="font-extrabold text-xs text-slate-900">{flight.airline}</span>
                        <span className="font-mono text-[11px] text-slate-500 font-semibold shrink-0">{flight.flightNumber}</span>
                        <span className="text-slate-300 shrink-0">•</span>
                        <span className="text-[11px] text-slate-500 truncate max-w-[120px] sm:max-w-none">{flight.aircraft || 'Airbus/Boeing'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                        <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 font-extrabold text-[10px] capitalize">
                          {travelClass}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-extrabold text-[10px]">
                          {flight.status || 'On-Time'}
                        </span>
                      </div>
                    </div>

                    {/* Route Strip & Segments Breakdown */}
                    {flight.stops > 0 && flight.segments && flight.segments.length > 0 ? (
                      <div className="space-y-2">
                        <div className="text-[11px] font-extrabold text-amber-800 bg-amber-50 border border-amber-200/80 px-2.5 py-1.5 rounded-lg flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                            <span>Connecting via <strong>{flight.layoverCity || flight.layoverAirport} ({flight.layoverAirport})</strong></span>
                          </span>
                          <span className="font-mono">{flight.layoverDuration || '1h 30m Layover'}</span>
                        </div>

                        {/* Segment 1 */}
                        <div className="bg-slate-50/90 rounded-xl p-2.5 border border-slate-200/80 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between text-[11px] text-slate-500 pb-1 border-b border-slate-200/60 font-semibold">
                            <span className="font-bold text-slate-800">Flight 1: {flight.segments[0].flightNumber} ({flight.segments[0].airline})</span>
                            <span className="font-mono text-slate-600 font-bold">{flight.segments[0].duration}</span>
                          </div>
                          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 pt-0.5">
                            <div className="min-w-0">
                              <div className="flex items-baseline gap-1">
                                <span className="font-black text-slate-900 font-mono text-sm">{flight.segments[0].departureTime}</span>
                                <span className="font-bold text-slate-800 text-xs">{flight.segments[0].from}</span>
                              </div>
                              <div className="text-[10px] text-slate-500 truncate">{flight.segments[0].fromCity}</div>
                            </div>
                            <div className="flex items-center justify-center px-1">
                              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                            </div>
                            <div className="text-right min-w-0">
                              <div className="flex items-baseline justify-end gap-1">
                                <span className="font-bold text-slate-800 text-xs">{flight.segments[0].to}</span>
                                <span className="font-black text-slate-900 font-mono text-sm">{flight.segments[0].arrivalTime}</span>
                              </div>
                              <div className="text-[10px] text-slate-500 truncate">{flight.segments[0].toCity}</div>
                            </div>
                          </div>
                        </div>

                        {/* Layover Divider */}
                        <div className="py-1 px-3 bg-amber-100/70 border border-dashed border-amber-300 rounded-lg text-center text-[10px] font-bold text-amber-900 flex items-center justify-center gap-2">
                          <Clock className="w-3 h-3 text-amber-700" />
                          <span>Layover in {flight.layoverCity || flight.layoverAirport} • Change Planes ({flight.layoverDuration || '1h 30m'})</span>
                        </div>

                        {/* Segment 2 */}
                        <div className="bg-slate-50/90 rounded-xl p-2.5 border border-slate-200/80 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between text-[11px] text-slate-500 pb-1 border-b border-slate-200/60 font-semibold">
                            <span className="font-bold text-slate-800">Flight 2: {flight.segments[1]?.flightNumber || flight.flightNumber} ({flight.segments[1]?.airline || flight.airline})</span>
                            <span className="font-mono text-slate-600 font-bold">{flight.segments[1]?.duration || flight.duration}</span>
                          </div>
                          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 pt-0.5">
                            <div className="min-w-0">
                              <div className="flex items-baseline gap-1">
                                <span className="font-black text-slate-900 font-mono text-sm">{flight.segments[1]?.departureTime}</span>
                                <span className="font-bold text-slate-800 text-xs">{flight.segments[1]?.from || flight.layoverAirport}</span>
                              </div>
                              <div className="text-[10px] text-slate-500 truncate">{flight.segments[1]?.fromCity || flight.layoverCity}</div>
                            </div>
                            <div className="flex items-center justify-center px-1">
                              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                            </div>
                            <div className="text-right min-w-0">
                              <div className="flex items-baseline justify-end gap-1">
                                <span className="font-bold text-slate-800 text-xs">{flight.segments[1]?.to || flight.to}</span>
                                <span className="font-black text-slate-900 font-mono text-sm">{flight.segments[1]?.arrivalTime || flight.arrivalTime}</span>
                              </div>
                              <div className="text-[10px] text-slate-500 truncate">{flight.segments[1]?.toCity || flight.toCity}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Clean & Responsive Route Strip for Non-stop */
                      <div className="bg-slate-50/90 rounded-xl p-2.5 sm:p-3 border border-slate-200/70">
                        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                          {/* Departure */}
                          <div className="min-w-0 text-left">
                            <div className="flex items-baseline gap-1.5 flex-wrap">
                              <span className="font-black font-mono text-base sm:text-lg text-slate-900 leading-tight">
                                {flight.departureTime}
                              </span>
                              <span className="font-extrabold text-xs sm:text-sm text-slate-800">
                                {flight.from}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                              <span>{flight.fromCity}</span>
                              {flight.terminal?.from && (
                                <span className="ml-1 text-slate-400 font-semibold">
                                  • {formatTerminal(flight.terminal.from)}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Duration & Non-stop Badge */}
                          <div className="flex flex-col items-center justify-center px-2 shrink-0">
                            <span className="text-[10px] font-extrabold text-slate-500 font-mono">
                              {flight.duration}
                            </span>
                            <div className="w-14 sm:w-20 flex items-center justify-center my-0.5 relative">
                              <div className="w-full h-[1.5px] bg-slate-300"></div>
                              <Plane className="w-2.5 h-2.5 text-sky-600 absolute left-1/2 -top-1 -translate-x-1/2 rotate-90 bg-slate-50 px-0.5" />
                            </div>
                            <span className="text-[10px] font-black text-emerald-700 bg-emerald-100/90 px-1.5 py-0.5 rounded">
                              Non-Stop
                            </span>
                          </div>

                          {/* Arrival */}
                          <div className="min-w-0 text-right">
                            <div className="flex items-baseline justify-end gap-1.5 flex-wrap">
                              <span className="font-extrabold text-xs sm:text-sm text-slate-800">
                                {flight.to}
                              </span>
                              <span className="font-black font-mono text-base sm:text-lg text-slate-900 leading-tight">
                                {flight.arrivalTime}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                              <span>{flight.toCity}</span>
                              {flight.terminal?.to && (
                                <span className="ml-1 text-slate-400 font-semibold">
                                  • {formatTerminal(flight.terminal.to)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 4 Mini Specification Badges */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-slate-700 min-w-0">
                        <Plane className="w-3 h-3 text-sky-600 shrink-0" />
                        <span className="truncate">{flight.aircraft || 'Airbus/Boeing'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-slate-700 min-w-0">
                        <Luggage className="w-3 h-3 text-sky-600 shrink-0" />
                        <span className="truncate">Cabin: <strong>7 Kg</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-slate-700 min-w-0">
                        <Luggage className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span className="truncate">Check-in: <strong>15 Kg</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-slate-700 min-w-0">
                        <Utensils className="w-3 h-3 text-amber-600 shrink-0" />
                        <span className="truncate">{flight.mealIncluded ? 'Free Meal' : 'Meal on purchase'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: FARE DETAILS - Ultra Compact */}
                {activeDetailTab === 'fare' && (
                  <div className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-xs space-y-2 animate-fadeIn">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-[10px] text-slate-400 block font-semibold">Base Fare</span>
                        <span className="font-mono font-bold text-slate-800">₹{Math.round(currentPrice * 0.88).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-[10px] text-slate-400 block font-semibold">Fuel Surcharge (YQ)</span>
                        <span className="font-mono font-bold text-slate-800">₹{Math.round(currentPrice * 0.08).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-[10px] text-slate-400 block font-semibold">Airport Fees & Taxes</span>
                        <span className="font-mono font-bold text-slate-800">₹{Math.round(currentPrice * 0.04).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-sky-50 border border-sky-100">
                        <span className="text-[10px] text-sky-700 block font-bold">Total Fare (1 Pax)</span>
                        <span className="font-mono font-black text-sky-900 text-sm">₹{currentPrice.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    <div className="px-2.5 py-1.5 bg-emerald-50/80 border border-emerald-200/80 rounded-lg flex items-center justify-between text-[11px] text-emerald-800">
                      <div className="flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Use promo code <strong>AIRSKY500</strong> for flat ₹500 off at checkout</span>
                      </div>
                      <span className="font-extrabold font-mono text-emerald-700">-₹500</span>
                    </div>
                  </div>
                )}

                {/* TAB 3: BAGGAGE POLICY - Ultra Compact */}
                {activeDetailTab === 'baggage' && (
                  <div className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-xs space-y-2 animate-fadeIn">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {/* Cabin */}
                      <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/70">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-extrabold text-slate-900 text-[11px]">Cabin Baggage</span>
                          <span className="px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 font-bold text-[10px]">7 Kg (1 Pc)</span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-tight">55 × 35 × 25 cm per passenger + 1 personal laptop bag/purse.</p>
                      </div>

                      {/* Check-in */}
                      <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/70">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-extrabold text-slate-900 text-[11px]">Check-in Baggage</span>
                          <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">15 Kg (1 Pc)</span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-tight">Max 158 cm (L+W+H). Pre-book additional luggage during checkout for up to 40% discount.</p>
                      </div>
                    </div>

                    <div className="px-2.5 py-1.5 bg-slate-50 border border-slate-200/80 rounded-lg text-[10px] text-slate-500 flex items-center gap-1.5">
                      <Info className="w-3 h-3 text-sky-600 shrink-0" />
                      <span>Infants are entitled to 7 kg hand luggage + 1 collapsible stroller/pram at no additional cost.</span>
                    </div>
                  </div>
                )}

                {/* TAB 4: CANCELLATION & CHANGES - Ultra Compact */}
                {activeDetailTab === 'cancellation' && (
                  <div className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-xs space-y-2 animate-fadeIn">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[11px] border border-slate-200/80 rounded-lg overflow-hidden">
                        <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 text-[10px] font-extrabold uppercase">
                          <tr>
                            <th className="py-1.5 px-2.5">Time Frame (Before Departure)</th>
                            <th className="py-1.5 px-2.5">Cancellation Fee</th>
                            <th className="py-1.5 px-2.5">Date Change Fee</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          <tr>
                            <td className="py-1.5 px-2.5 font-medium">Up to 24 hours prior</td>
                            <td className="py-1.5 px-2.5 font-bold text-slate-900">₹3,000 or Base Fare</td>
                            <td className="py-1.5 px-2.5 font-bold text-sky-700">₹2,500 + diff</td>
                          </tr>
                          <tr>
                            <td className="py-1.5 px-2.5 font-medium">Within 24 to 4 hours</td>
                            <td className="py-1.5 px-2.5 font-bold text-slate-900">₹3,500 or Base Fare</td>
                            <td className="py-1.5 px-2.5 font-bold text-sky-700">₹3,000 + diff</td>
                          </tr>
                          <tr className="bg-rose-50/30">
                            <td className="py-1.5 px-2.5 font-medium text-rose-800">Within 4 hours or No-Show</td>
                            <td className="py-1.5 px-2.5 font-bold text-rose-700">Non-refundable (taxes only)</td>
                            <td className="py-1.5 px-2.5 font-bold text-rose-700">Not Permitted</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="px-2.5 py-1.5 bg-sky-50 border border-sky-200/80 rounded-lg text-[10px] text-sky-900 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-sky-600 shrink-0" />
                        <span><strong>Zero Date Change Guarantee:</strong> Add <strong>Flexi Plus</strong> at checkout for ₹0 date change fee!</span>
                      </div>
                    </div>
                  </div>
                )}

              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </motion.div>

      {/* Hold Fare Modal */}
      <AnimatePresence>
        {showHoldModal && (
          <HoldFareModal
            flight={flight}
            currentPrice={currentPrice}
            brand={brand}
            onClose={() => setShowHoldModal(false)}
            onBookNow={() => {
              setShowHoldModal(false);
              onBookFlight(flight, currentPrice, 'saver');
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

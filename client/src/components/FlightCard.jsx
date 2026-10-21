import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plane, Clock, Luggage, Utensils, ChevronDown, ChevronUp, ShieldCheck, Info, MessageCircle, Phone, Lock, Tag, Sparkles, Check, ArrowRight } from 'lucide-react';
import AirlineBadge from './AirlineBadge';
import HoldFareModal from './HoldFareModal';

const codeToCityName = {
  DEL: 'Delhi',
  BOM: 'Mumbai',
  BLR: 'Bengaluru',
  MAA: 'Chennai',
  CCU: 'Kolkata',
  HYD: 'Hyderabad',
  AMD: 'Ahmedabad',
  GOI: 'Goa',
  GOX: 'Goa (Mopa)',
  PNQ: 'Pune',
  JAI: 'Jaipur',
  LKO: 'Lucknow',
  COK: 'Kochi',
  TRV: 'Thiruvananthapuram',
  IXC: 'Chandigarh',
  PAT: 'Patna',
  BBI: 'Bhubaneswar',
  GAU: 'Guwahati',
  SXR: 'Srinagar',
  IXB: 'Bagdogra',
  VNS: 'Varanasi',
  ATQ: 'Amritsar',
  IDR: 'Indore',
  BDQ: 'Vadodara',
  NAG: 'Nagpur',
  UDR: 'Udaipur',
  VTZ: 'Visakhapatnam',
  IXR: 'Ranchi',
  DXB: 'Dubai',
  SIN: 'Singapore',
  BKK: 'Bangkok',
  LHR: 'London',
  JFK: 'New York'
};

const getDisplayCity = (code, rawCity) => {
  if (code && codeToCityName[String(code).toUpperCase()]) {
    return codeToCityName[String(code).toUpperCase()];
  }
  if (!rawCity) return code || '';
  if (/mumbai/i.test(rawCity)) return 'Mumbai';
  if (/delhi/i.test(rawCity)) return 'Delhi';
  if (/bengaluru|bangalore/i.test(rawCity)) return 'Bengaluru';
  if (/chennai/i.test(rawCity)) return 'Chennai';
  if (/kolkata/i.test(rawCity)) return 'Kolkata';
  if (/hyderabad/i.test(rawCity)) return 'Hyderabad';
  if (/lucknow/i.test(rawCity)) return 'Lucknow';
  return String(rawCity).replace(/International Airport|Airport|Intl Airport/gi, '').trim() || rawCity;
};

const formatTerminal = (term) => {
  if (!term) return '';
  const str = String(term).trim();
  if (/^T\d/i.test(str)) return str.toUpperCase();
  if (/^\d/.test(str)) return `T${str}`;
  return str;
};

export default function FlightCard({ 
  flight, 
  travelClass = 'economy', 
  onBookFlight, 
  brand = null,
  searchCoupon = null,
  isSelectable = false,
  isSelected = false,
  compact = false,
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
  const cleanSelectedLabel = String(selectedLabel || 'Selected').replace(/^[✓✔\s]+|[✓✔\s]+$/g, '').trim();

  // Dynamic Search Coupon from Admin
  const activeCoupon = searchCoupon || {
    code: 'AIRSKY500',
    type: 'percent',
    discount: 35,
    description: 'Flat 35% off on any domestic or international flight'
  };

  const featuredCoupon = activeCoupon.code || 'AIRSKY500';
  const isPercentCoupon = activeCoupon.type === 'percent';
  const couponDiscountValue = activeCoupon.discount || (isPercentCoupon ? 35 : 500);

  // Exact discount calculation on this flight's currentPrice
  const couponDiscountAmount = isPercentCoupon
    ? Math.round((currentPrice * couponDiscountValue) / 100)
    : Math.min(couponDiscountValue, currentPrice);

  const discountedFlightPrice = Math.max(0, currentPrice - couponDiscountAmount);

  const couponDiscountText = isPercentCoupon 
    ? `${couponDiscountValue}% Off` 
    : `Flat ₹${couponDiscountValue} Off`;

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
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        whileHover={{ y: -3, boxShadow: '0 16px 36px -10px rgba(15,23,42,0.1)' }}
        transition={{ duration: 0.25 }}
        className={`bg-white rounded-3xl border transition-all overflow-hidden mb-4 ${
          isSelected 
            ? 'border-emerald-500 ring-2 ring-emerald-500/25 shadow-lg bg-emerald-50/15' 
            : 'border-slate-200/90 shadow-[0_4px_20px_rgba(15,23,42,0.03)] hover:border-sky-300'
        }`}
      >
        
        {/* Top Highlight Banner if Non-Stop & Great Value */}
        {flight.stops === 0 && flight.basePrice < 5500 && (
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-700 px-4 py-1.5 text-white text-[11px] font-black tracking-wide flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Fastest Direct Flight • Instant GDS PNR Guarantee</span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] uppercase font-mono">Instant PNR</span>
              <span className="bg-emerald-950/40 px-2 py-0.5 rounded text-[10px]">Zero Convenience Fee*</span>
            </div>
          </div>
        )}

        <div className="p-4 sm:p-5">
          {isSelectable || compact ? (
            /* COMPACT COMBO / SPLIT-VIEW LAYOUT */
            <div>
              {/* Row 1: Airline Badge, Flight No, Aircraft & Stops Badge */}
              <div className="flex items-center justify-between gap-2.5 pb-2.5 mb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <AirlineBadge code={flight.airlineCode} name={flight.airline} logoUrl={flight.airlineLogo || flight.logo} size="sm" showDetails={false} />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-black text-slate-900 text-xs sm:text-sm leading-tight truncate">
                      {flight.airline}
                    </h4>
                    <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 leading-tight mt-0.5 truncate">
                      <span className="font-mono font-bold text-slate-700 whitespace-nowrap">{flight.flightNumber}</span>
                      {flight.aircraft && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="truncate">{flight.aircraft}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  {flight.stops === 0 ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                      Non-Stop
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
                      {flight.stops} Stop {flight.layoverAirport ? `via ${flight.layoverAirport}` : ''}
                    </span>
                  )}
                </div>
              </div>

              {/* Row 2: Timings & Route (Clear 3-Column Grid) */}
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 py-1.5">
                {/* Departure */}
                <div className="text-left min-w-0">
                  <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none font-mono">
                    {flight.departureTime}
                  </div>
                  <div className="text-xs font-black text-slate-800 mt-1 flex items-center gap-1">
                    <span>{flight.from}</span>
                    {flight.terminal?.from && (
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1 py-0.2 rounded">
                        {formatTerminal(flight.terminal.from)}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate" title={flight.fromCity}>
                    {getDisplayCity(flight.from, flight.fromCity)}
                  </div>
                </div>

                {/* Duration Line */}
                <div className="w-28 sm:w-32 text-center px-1">
                  <div className="text-[10px] font-bold text-slate-500 mb-1 flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{flight.duration}</span>
                  </div>
                  <div className="relative flex items-center justify-center">
                    <div className="w-full h-0.5 bg-slate-300 rounded-full" />
                    <div className="absolute w-2 h-2 rounded-full bg-slate-800 -left-0.5 shadow-xs" />
                    {flight.stops > 0 ? (
                      <div 
                        className="absolute w-2.5 h-2.5 rounded-full bg-amber-500 border-2 border-white shadow-xs z-10" 
                        title={`Layover: ${flight.layover || flight.layoverCity || `${flight.stops} Stop`}`}
                      />
                    ) : (
                      <div className="absolute bg-white px-0.5 z-10">
                        <Plane className="w-3 h-3 text-slate-800 rotate-90" />
                      </div>
                    )}
                    <div className="absolute w-2 h-2 rounded-full bg-slate-800 -right-0.5 shadow-xs" />
                  </div>
                  <div className="text-[10px] font-semibold text-slate-400 mt-1">
                    {flight.stops === 0 ? (
                      <span className="text-emerald-600 font-bold">Non-Stop</span>
                    ) : (
                      <span className="text-amber-700 font-bold inline-flex items-center justify-center gap-1">
                        <span>{flight.stops} Stop</span>
                        {(flight.layoverAirport || flight.layoverCity) && (
                          <span className="text-slate-500 font-medium">via {flight.layoverAirport || flight.layoverCity}</span>
                        )}
                      </span>
                    )}
                  </div>
                </div>

                {/* Arrival */}
                <div className="text-right min-w-0">
                  <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none font-mono">
                    {flight.arrivalTime}
                  </div>
                  <div className="text-xs font-black text-slate-800 mt-1 flex items-center justify-end gap-1">
                    {flight.terminal?.to && (
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1 py-0.2 rounded">
                        {formatTerminal(flight.terminal.to)}
                      </span>
                    )}
                    <span>{flight.to}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 truncate" title={flight.toCity}>
                    {getDisplayCity(flight.to, flight.toCity)}
                  </div>
                </div>
              </div>

              {/* Row 3: Price (Left) & Select Action (Right) */}
              <div className="flex items-center justify-between gap-3 pt-3 mt-2 border-t border-slate-100">
                <div>
                  <div className="flex items-baseline gap-2 leading-none">
                    <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-mono">
                      ₹{discountedFlightPrice.toLocaleString('en-IN')}
                    </span>
                    {couponDiscountAmount > 0 ? (
                      <span className="text-xs line-through text-slate-400 font-semibold font-mono">
                        ₹{currentPrice.toLocaleString('en-IN')}
                      </span>
                    ) : (
                      <span className="text-xs line-through text-slate-400 font-semibold font-mono">
                        ₹{originalPrice.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                  {couponDiscountAmount > 0 ? (
                    <div className="flex items-center gap-1.5 mt-1 leading-none">
                      <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200/90 px-1.5 py-0.5 rounded">
                        Save ₹{couponDiscountAmount.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500">
                        with {featuredCoupon}
                      </span>
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-400 mt-0.5">per traveller • taxes incl.</div>
                  )}
                </div>

                <div>
                  <motion.button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onSelect) onSelect(flight);
                      else if (onBookFlight) onBookFlight(flight, currentPrice, 'saver', featuredCoupon);
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30 ring-2 ring-emerald-300'
                        : 'bg-slate-900 hover:bg-black text-white'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-4 h-4 stroke-[3] shrink-0" />
                        <span className="whitespace-nowrap">{cleanSelectedLabel}</span>
                      </>
                    ) : (
                      <span className="whitespace-nowrap">{selectLabel}</span>
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          ) : (
            /* STANDARD WIDE LAYOUT */
            <div>
              {/* DESKTOP VIEW */}
              <div className="hidden md:grid md:grid-cols-12 gap-4 items-center">
                
                {/* Airline Col */}
                <div className="md:col-span-3">
                  <div className="flex items-center gap-3">
                    <AirlineBadge code={flight.airlineCode} name={flight.airline} logoUrl={flight.airlineLogo || flight.logo} size="md" showDetails={false} />
                    <div className="min-w-0">
                      <h4 className="font-black text-slate-900 text-sm sm:text-base leading-tight truncate">
                        {flight.airline}
                      </h4>
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                        <span className="font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded">{flight.flightNumber}</span>
                        {flight.aircraft && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="truncate text-slate-500">{flight.aircraft}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timings & Route Col */}
                <div className="md:col-span-5 lg:col-span-6 flex items-center justify-between gap-3 px-2">
                  
                  {/* Departure */}
                  <div className="text-left min-w-0">
                    <div className="text-2xl font-black text-slate-900 tracking-tight leading-none font-mono">
                      {flight.departureTime}
                    </div>
                    <div className="text-sm font-black text-slate-800 mt-1 flex items-center gap-1.5">
                      <span>{flight.from}</span>
                      {flight.terminal?.from && (
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {formatTerminal(flight.terminal.from)}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 truncate mt-0.5" title={flight.fromCity}>
                      {getDisplayCity(flight.from, flight.fromCity)}
                    </div>
                  </div>

                  {/* Path & Duration line */}
                  <div className="flex-1 max-w-[170px] text-center px-2">
                    <div className="text-xs font-bold text-slate-500 mb-1 flex items-center justify-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{flight.duration}</span>
                    </div>
                    
                    <div className="relative flex items-center justify-center my-1.5">
                      <div className="w-full h-0.5 bg-slate-300 rounded-full" />
                      <div className="absolute w-2 h-2 rounded-full bg-slate-800 -left-0.5 shadow-xs" />
                      {flight.stops > 0 ? (
                        <div 
                          className="absolute w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-white shadow-xs z-10" 
                          title={`Layover: ${flight.layover || flight.layoverCity || `${flight.stops} Stop`}`}
                        />
                      ) : (
                        <div className="absolute bg-white px-0.5 z-10">
                          <Plane className="w-3.5 h-3.5 text-slate-800 rotate-90" />
                        </div>
                      )}
                      <div className="absolute w-2 h-2 rounded-full bg-slate-800 -right-0.5 shadow-xs" />
                    </div>

                    <div className="text-[11px] font-semibold text-slate-500 mt-1">
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
                  <div className="text-right min-w-0">
                    <div className="text-2xl font-black text-slate-900 tracking-tight leading-none font-mono">
                      {flight.arrivalTime}
                    </div>
                    <div className="text-sm font-black text-slate-800 mt-1 flex items-center justify-end gap-1.5">
                      <span>{flight.to}</span>
                      {flight.terminal?.to && (
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {formatTerminal(flight.terminal.to)}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 truncate mt-0.5" title={flight.toCity}>
                      {getDisplayCity(flight.to, flight.toCity)}
                    </div>
                  </div>

                </div>

                {/* Pricing & Booking Col */}
                <div className="md:col-span-4 lg:col-span-3 flex flex-col items-end justify-center gap-2 pl-4 border-l border-slate-100">
                  <div className="text-right">
                    <div className="flex items-baseline justify-end gap-2 leading-none">
                      <span className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight font-mono">
                        ₹{discountedFlightPrice.toLocaleString('en-IN')}
                      </span>
                      {couponDiscountAmount > 0 && (
                        <span className="text-xs line-through text-slate-400 font-semibold font-mono">
                          ₹{currentPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                    
                    {couponDiscountAmount > 0 ? (
                      <div className="flex items-center justify-end gap-1.5 mt-1 leading-none">
                        <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200/90 px-1.5 py-0.5 rounded">
                          Save ₹{couponDiscountAmount.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[11px] font-bold text-slate-500">
                          with {featuredCoupon}
                        </span>
                      </div>
                    ) : null}

                    <div className="text-[10px] text-slate-400 mt-1 font-medium">per traveller • taxes included</div>
                  </div>

                  <motion.button
                    onClick={() => onBookFlight(flight, currentPrice, 'saver', featuredCoupon)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full px-7 py-3 rounded-2xl bg-slate-900 hover:bg-black text-white font-black text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap active:scale-[0.98]"
                  >
                    <span>Book Flight</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>

              </div>

              {/* MOBILE VIEW */}
              <div className="block md:hidden">
                {/* Row 1: Airline Badge, Flight No, Aircraft & Stops Badge */}
                <div className="flex items-center justify-between gap-2.5 pb-2.5 mb-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <AirlineBadge code={flight.airlineCode} name={flight.airline} logoUrl={flight.airlineLogo || flight.logo} size="sm" showDetails={false} />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-black text-slate-900 text-xs sm:text-sm leading-tight truncate">
                        {flight.airline}
                      </h4>
                      <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 leading-tight mt-0.5 truncate">
                        <span className="font-mono font-bold text-slate-700 whitespace-nowrap">{flight.flightNumber}</span>
                        {flight.aircraft && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="truncate">{flight.aircraft}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    {flight.stops === 0 ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap shadow-2xs">
                        Non-Stop
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap shadow-2xs">
                        {flight.stops} Stop {flight.layoverAirport || flight.layoverCity ? `• ${flight.layoverAirport || flight.layoverCity}` : ''}
                      </span>
                    )}
                  </div>
                </div>

                {/* Row 2: Timings & Route (Clear 3-Column Grid) */}
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 py-1.5">
                  {/* Departure */}
                  <div className="text-left min-w-0">
                    <div className="text-2xl font-black text-slate-900 tracking-tight leading-none font-mono">
                      {flight.departureTime}
                    </div>
                    <div className="text-xs font-black text-slate-800 mt-1 flex items-center gap-1">
                      <span>{flight.from}</span>
                      {flight.terminal?.from && (
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1 py-0.2 rounded">
                          {formatTerminal(flight.terminal.from)}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate" title={flight.fromCity}>
                      {getDisplayCity(flight.from, flight.fromCity)}
                    </div>
                  </div>

                  {/* Duration Line */}
                  <div className="w-28 sm:w-32 text-center px-1">
                    <div className="text-[10px] font-bold text-slate-500 mb-1 flex items-center justify-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{flight.duration}</span>
                    </div>
                    <div className="relative flex items-center justify-center">
                      <div className="w-full h-0.5 bg-slate-300 rounded-full" />
                      <div className="absolute w-2 h-2 rounded-full bg-slate-800 -left-0.5 shadow-xs" />
                      {flight.stops > 0 ? (
                        <div 
                          className="absolute w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-white shadow-xs z-10" 
                          title={`Layover: ${flight.layover || flight.layoverCity || `${flight.stops} Stop`}`}
                        />
                      ) : (
                        <div className="absolute bg-white px-0.5 z-10">
                          <Plane className="w-3 h-3 text-slate-800 rotate-90" />
                        </div>
                      )}
                      <div className="absolute w-2 h-2 rounded-full bg-slate-800 -right-0.5 shadow-xs" />
                    </div>
                    <div className="text-[10px] font-semibold text-slate-400 mt-1">
                      {flight.stops === 0 ? (
                        <span className="text-emerald-600 font-bold">Direct</span>
                      ) : (
                        <span className="text-amber-700 font-bold">
                          {flight.layoverAirport || flight.layoverCity ? `via ${flight.layoverAirport || flight.layoverCity}` : `${flight.stops} Stop`}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Arrival */}
                  <div className="text-right min-w-0">
                    <div className="text-2xl font-black text-slate-900 tracking-tight leading-none font-mono">
                      {flight.arrivalTime}
                    </div>
                    <div className="text-xs font-black text-slate-800 mt-1 flex items-center justify-end gap-1">
                      <span>{flight.to}</span>
                      {flight.terminal?.to && (
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1 py-0.2 rounded">
                          {formatTerminal(flight.terminal.to)}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate" title={flight.toCity}>
                      {getDisplayCity(flight.to, flight.toCity)}
                    </div>
                  </div>
                </div>

                {/* Row 3: Price & Book Now Row */}
                <div className="flex items-center justify-between gap-3 pt-3 mt-2 border-t border-slate-100">
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2 leading-none">
                      <span className="text-2xl font-black text-slate-900 tracking-tight font-mono">
                        ₹{discountedFlightPrice.toLocaleString('en-IN')}
                      </span>
                      {couponDiscountAmount > 0 && (
                        <span className="text-xs line-through text-slate-400 font-semibold font-mono">
                          ₹{currentPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                    {couponDiscountAmount > 0 ? (
                      <div className="flex items-center gap-1.5 mt-1 leading-none">
                        <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200/90 px-1.5 py-0.5 rounded">
                          Save ₹{couponDiscountAmount.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[11px] font-bold text-slate-500">
                          with {featuredCoupon}
                        </span>
                      </div>
                    ) : (
                      <div className="text-[10px] text-slate-400 font-medium mt-1">per traveller • taxes included</div>
                    )}
                  </div>

                  <div className="shrink-0">
                    <motion.button
                      onClick={() => onBookFlight(flight, currentPrice, 'saver', featuredCoupon)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-6 py-2.5 rounded-2xl bg-slate-900 hover:bg-black text-white font-black text-xs shadow-md transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 active:scale-[0.98]"
                    >
                      <span>Book Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Badges / Add-ons row */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-2 text-slate-500">
              <div className="flex items-center gap-1 font-semibold text-[11px]">
                <Luggage className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{flight.baggage}</span>
              </div>
              <span className="text-slate-300">•</span>
              {flight.mealIncluded ? (
                <div className="flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
                  <Utensils className="w-3.5 h-3.5 shrink-0" />
                  <span>Free Meal</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-slate-400 text-[11px]">
                  <Utensils className="w-3.5 h-3.5 shrink-0" />
                  <span>Paid Meal</span>
                </div>
              )}
              {flight.seatsAvailable < 40 && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="text-rose-600 font-black bg-rose-50 px-2 py-0.5 rounded-full text-[10px]">
                    {flight.seatsAvailable} seats left
                  </span>
                </>
              )}
            </div>

            {/* Collapsible details toggle */}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-sky-600 hover:text-sky-700 font-black flex items-center gap-1 text-xs cursor-pointer shrink-0"
            >
              <span>{showDetails ? 'Hide Details' : 'Flight Details'}</span>
              {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Collapsible Details Drawer */}
          <AnimatePresence>
            {showDetails && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-3 pt-3 border-t border-slate-200/90 bg-slate-50/80 -mx-4 -mb-4 sm:-mx-5 sm:-mb-5 p-3 sm:p-4 rounded-b-3xl overflow-hidden"
              >
                {/* 4 Tabs Header */}
                <div className="flex items-center gap-1.5 border-b border-slate-200/80 pb-2.5 mb-3 overflow-x-auto scrollbar-none">
                  {[
                    { id: 'info', label: 'Flight Info', icon: Plane },
                    { id: 'fare', label: 'Fare Details', icon: Tag },
                    { id: 'baggage', label: 'Baggage Policy', icon: Luggage },
                    { id: 'cancellation', label: 'Cancellation & Refunds', icon: ShieldCheck }
                  ].map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeDetailTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveDetailTab(tab.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
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

                {/* TAB 1: FLIGHT INFORMATION */}
                {activeDetailTab === 'info' && (
                  <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs space-y-3">
                    <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100 flex-wrap">
                      <div className="flex items-center gap-2 min-w-0">
                        <AirlineBadge code={flight.airlineCode} name={flight.airline} showDetails={false} size="sm" />
                        <span className="font-black text-xs sm:text-sm text-slate-900">{flight.airline}</span>
                        <span className="font-mono text-xs text-slate-500 font-bold shrink-0">{flight.flightNumber}</span>
                        <span className="text-slate-300 shrink-0">•</span>
                        <span className="text-xs text-slate-500 truncate">{flight.aircraft || 'Airbus/Boeing'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                        <span className="px-2.5 py-0.5 rounded-lg bg-sky-50 text-sky-700 font-black text-[10px] capitalize">
                          {travelClass} Class
                        </span>
                        <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 font-black text-[10px]">
                          {flight.status || 'On-Time GDS'}
                        </span>
                      </div>
                    </div>

                    {/* Route Strip */}
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/70">
                      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                        <div className="min-w-0 text-left">
                          <div className="flex items-baseline gap-1.5 flex-wrap">
                            <span className="font-black font-mono text-base sm:text-lg text-slate-900 leading-tight">
                              {flight.departureTime}
                            </span>
                            <span className="font-black text-xs sm:text-sm text-slate-800">
                              {flight.from}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                            <span>{flight.fromCity}</span>
                            {flight.terminal?.from && (
                              <span className="ml-1 text-slate-400 font-bold">
                                • {formatTerminal(flight.terminal.from)}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-center justify-center px-2 shrink-0">
                          <span className="text-[10px] font-black text-slate-500 font-mono">
                            {flight.duration}
                          </span>
                          <div className="w-16 sm:w-24 flex items-center justify-center my-0.5 relative">
                            <div className="w-full h-0.5 bg-slate-300" />
                            <Plane className="w-3 h-3 text-sky-600 absolute left-1/2 -top-1.5 -translate-x-1/2 rotate-90 bg-slate-50 px-0.5" />
                          </div>
                          <span className="text-[10px] font-black text-emerald-700 bg-emerald-100/90 px-2 py-0.2 rounded-full">
                            {flight.stops === 0 ? 'Non-Stop' : `${flight.stops} Stop`}
                          </span>
                        </div>

                        <div className="min-w-0 text-right">
                          <div className="flex items-baseline justify-end gap-1.5 flex-wrap">
                            <span className="font-black text-xs sm:text-sm text-slate-800">
                              {flight.to}
                            </span>
                            <span className="font-black font-mono text-base sm:text-lg text-slate-900 leading-tight">
                              {flight.arrivalTime}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                            <span>{flight.toCity}</span>
                            {flight.terminal?.to && (
                              <span className="ml-1 text-slate-400 font-bold">
                                • {formatTerminal(flight.terminal.to)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Specs */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 min-w-0">
                        <Plane className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                        <span className="truncate">{flight.aircraft || 'Airbus A320neo'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 min-w-0">
                        <Luggage className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                        <span className="truncate">Cabin: <strong>7 Kg</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 min-w-0">
                        <Luggage className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">Check-in: <strong>15 Kg</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 min-w-0">
                        <Utensils className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="truncate">{flight.mealIncluded ? 'Free Meal Included' : 'On-Board Purchase'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: FARE DETAILS */}
                {activeDetailTab === 'fare' && (
                  <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs space-y-2.5">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] text-slate-400 block font-bold">Base Fare</span>
                        <span className="font-mono font-black text-slate-800 text-sm">₹{Math.round(currentPrice * 0.88).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] text-slate-400 block font-bold">Fuel Surcharge (YQ)</span>
                        <span className="font-mono font-black text-slate-800 text-sm">₹{Math.round(currentPrice * 0.08).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] text-slate-400 block font-bold">Airport User Fees & Taxes</span>
                        <span className="font-mono font-black text-slate-800 text-sm">₹{Math.round(currentPrice * 0.04).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-100">
                        <span className="text-[10px] text-sky-700 block font-black">Total Live Fare</span>
                        <span className="font-mono font-black text-sky-900 text-base">₹{currentPrice.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    <div className="px-3 py-2 bg-emerald-50/80 border border-emerald-200/80 rounded-xl flex items-center justify-between text-xs text-emerald-800">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Promo code <strong>{featuredCoupon}</strong> applies {couponDiscountText} discount at final step</span>
                      </div>
                      <span className="font-black font-mono text-emerald-700">-₹{couponDiscountAmount.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                )}

                {/* TAB 3: BAGGAGE POLICY */}
                {activeDetailTab === 'baggage' && (
                  <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                      <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/70">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-black text-slate-900">Cabin Hand Luggage</span>
                          <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 font-black text-[10px]">7 Kg (1 Piece)</span>
                        </div>
                        <p className="text-slate-500 leading-relaxed text-[11px]">
                          Dimensions max 55 × 35 × 25 cm per passenger plus 1 personal laptop bag, handbag, or duty-free purchase bag.
                        </p>
                      </div>

                      <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/70">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-black text-slate-900">Check-in Baggage</span>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-black text-[10px]">15 Kg (1 Piece)</span>
                        </div>
                        <p className="text-slate-500 leading-relaxed text-[11px]">
                          Standard domestic baggage allowance. Pre-book additional 5kg, 10kg, or 15kg at checkout for special airline web discounts.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: CANCELLATION */}
                {activeDetailTab === 'cancellation' && (
                  <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs space-y-2.5">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border border-slate-200/80 rounded-xl overflow-hidden">
                        <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 text-[10px] font-black uppercase">
                          <tr>
                            <th className="py-2 px-3">Timeline (Before Flight Departure)</th>
                            <th className="py-2 px-3">Cancellation Fee</th>
                            <th className="py-2 px-3">Date Reschedule Fee</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          <tr>
                            <td className="py-2 px-3 font-semibold">More than 24 hours prior</td>
                            <td className="py-2 px-3 font-bold text-slate-900">₹3,000 or Base Fare</td>
                            <td className="py-2 px-3 font-bold text-sky-700">₹2,500 + Fare Difference</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-3 font-semibold">Within 24 to 4 hours</td>
                            <td className="py-2 px-3 font-bold text-slate-900">₹3,500 or Base Fare</td>
                            <td className="py-2 px-3 font-bold text-sky-700">₹3,000 + Fare Difference</td>
                          </tr>
                          <tr className="bg-rose-50/30">
                            <td className="py-2 px-3 font-semibold text-rose-800">Within 4 hours or Flight No-Show</td>
                            <td className="py-2 px-3 font-bold text-rose-700">Airport Taxes Only</td>
                            <td className="py-2 px-3 font-bold text-rose-700">Not Permitted</td>
                          </tr>
                        </tbody>
                      </table>
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
              onBookFlight(flight, currentPrice, 'saver', featuredCoupon);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

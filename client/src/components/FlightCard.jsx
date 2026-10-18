import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plane, Clock, Luggage, Utensils, ChevronDown, ChevronUp, ShieldCheck, Info, MessageCircle, Phone, Lock, Tag, Sparkles } from 'lucide-react';
import AirlineBadge from './AirlineBadge';
import HoldFareModal from './HoldFareModal';

export default function FlightCard({ flight, travelClass = 'economy', onBookFlight, brand = null }) {
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
      `💰 Fare: ₹${currentPrice.toLocaleString('en-IN')} (${selectedFareTier.toUpperCase()})\n\n` +
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
        className="bg-white rounded-2xl border border-slate-200/90 shadow-xs transition-all overflow-hidden mb-4"
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
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            
            {/* Airline Col */}
            <div className="md:col-span-3">
              <AirlineBadge code={flight.airlineCode} name={flight.airline} logoUrl={flight.airlineLogo || flight.logo} />
              <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                <span className="font-mono font-semibold">{flight.flightNumber}</span>
                <span>•</span>
                <span className="truncate">{flight.aircraft}</span>
              </div>
              {flight.source && (
                <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  {flight.source}
                </div>
              )}
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
                    <span className="text-amber-600 font-bold">{flight.stops} Stop</span>
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

              {/* Primary Booking Action */}
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

              {/* Quick Coupon Chip */}
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

          {/* Collapsible Details Drawer */}
          <AnimatePresence>
            {showDetails && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="mt-4 pt-4 border-t border-slate-200 bg-slate-50/70 -mx-4 -mb-4 sm:-mx-5 sm:-mb-5 p-3.5 sm:p-5 rounded-b-2xl overflow-hidden"
              >
                {/* 4 Tabs Header */}
                <div className="flex items-center gap-1.5 sm:gap-2 border-b border-slate-200 pb-2.5 mb-3.5 overflow-x-auto scrollbar-none">
                  {[
                    { id: 'info', label: 'Flight Information', icon: Plane },
                    { id: 'fare', label: 'Fare Details', icon: Tag },
                    { id: 'baggage', label: 'Baggage Policy', icon: Luggage },
                    { id: 'cancellation', label: 'Cancellation & Changes', icon: ShieldCheck }
                  ].map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeDetailTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveDetailTab(tab.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                          isActive
                            ? 'bg-sky-600 text-white shadow-xs'
                            : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* TAB 1: FLIGHT INFORMATION */}
                {activeDetailTab === 'info' && (
                  <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-4 animate-fadeIn">
                    {/* Header with Airline & Travel Class */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <AirlineBadge code={flight.airlineCode} airline={flight.airline} className="w-8 h-8 sm:w-9 sm:h-9" />
                        <div>
                          <div className="font-extrabold text-sm text-slate-900">{flight.airline}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{flight.flightNumber} • {flight.aircraft || 'Airbus/Boeing'}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg bg-sky-50 text-sky-700 font-extrabold text-xs capitalize">
                          {travelClass}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 font-extrabold text-xs">
                          {flight.status || 'On-Time'}
                        </span>
                      </div>
                    </div>

                    {/* Route Schedule & Airport Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center py-1">
                      {/* Origin */}
                      <div className="text-left">
                        <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">{flight.departureTime}</div>
                        <div className="font-extrabold text-xs sm:text-sm text-slate-800">{flight.fromCity || flight.from} ({flight.from})</div>
                        <div className="text-[11px] text-slate-500">Terminal {flight.terminal?.from || 'T1/T2'}</div>
                      </div>

                      {/* Flight Path */}
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{flight.duration}</span>
                        </div>
                        <div className="w-full max-w-[130px] flex items-center gap-1 my-1">
                          <div className="h-0.5 flex-1 bg-slate-200"></div>
                          <Plane className="w-3.5 h-3.5 text-sky-600 rotate-90 shrink-0" />
                          <div className="h-0.5 flex-1 bg-slate-200"></div>
                        </div>
                        <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          {flight.stops === 0 ? 'Non-Stop' : `${flight.stops} Stop (${flight.layoverCity || 'Via'})`}
                        </span>
                      </div>

                      {/* Destination */}
                      <div className="text-left sm:text-right">
                        <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">{flight.arrivalTime}</div>
                        <div className="font-extrabold text-xs sm:text-sm text-slate-800">{flight.toCity || flight.to} ({flight.to})</div>
                        <div className="text-[11px] text-slate-500">Terminal {flight.terminal?.to || 'T1/T2'}</div>
                      </div>
                    </div>

                    {/* Key Specifications Grid */}
                    <div className="pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-[10px] text-slate-400 block font-semibold uppercase">Aircraft</span>
                        <span className="font-bold text-slate-800 truncate block">{flight.aircraft}</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-[10px] text-slate-400 block font-semibold uppercase">Cabin Baggage</span>
                        <span className="font-bold text-slate-800">7 Kg Included</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-[10px] text-slate-400 block font-semibold uppercase">Check-in Baggage</span>
                        <span className="font-bold text-slate-800">15 Kg Included</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-[10px] text-slate-400 block font-semibold uppercase">In-flight Meal</span>
                        <span className="font-bold text-slate-800">{flight.mealIncluded ? 'Free Meal' : 'Available for purchase'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: FARE DETAILS */}
                {activeDetailTab === 'fare' && (
                  <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3 animate-fadeIn">
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                      <span className="font-extrabold text-xs sm:text-sm text-slate-900">Fare Summary (Per Traveller)</span>
                      <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">All Taxes Included</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between text-slate-600">
                        <span>Base Airfare</span>
                        <span className="font-mono font-bold text-slate-900">₹{Math.round(currentPrice * 0.88).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Airline Fuel Surcharge (YQ/YR)</span>
                        <span className="font-mono font-bold text-slate-900">₹{Math.round(currentPrice * 0.08).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Airport Passenger Fees, UDF & GST</span>
                        <span className="font-mono font-bold text-slate-900">₹{Math.round(currentPrice * 0.04).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="pt-2 border-t border-slate-100 flex justify-between items-baseline">
                        <div>
                          <span className="font-black text-sm text-slate-900">Total Price</span>
                          <span className="text-[10px] text-slate-400 block">Taxes & fees included</span>
                        </div>
                        <span className="text-xl font-black text-sky-700 font-mono">₹{currentPrice.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Apply promo code <strong>AIRSKY500</strong> at checkout for flat ₹500 discount!</span>
                      </div>
                      <span className="font-extrabold font-mono text-emerald-700">-₹500</span>
                    </div>
                  </div>
                )}

                {/* TAB 3: BAGGAGE POLICY */}
                {activeDetailTab === 'baggage' && (
                  <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3 animate-fadeIn">
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <Luggage className="w-4 h-4 text-sky-600" />
                        <span className="font-extrabold text-xs sm:text-sm text-slate-900">Baggage Allowances & Dimensions</span>
                      </div>
                      <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded font-mono">{flight.flightNumber}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {/* Cabin Baggage */}
                      <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-extrabold text-slate-900">Cabin (Hand) Baggage</span>
                          <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-black text-[10px]">7 Kg Included</span>
                        </div>
                        <ul className="space-y-1.5 text-slate-600 text-[11px]">
                          <li>• 1 piece of cabin baggage up to 7 kg per traveller.</li>
                          <li>• Standard dimensions: 55 cm × 35 cm × 25 cm.</li>
                          <li>• 1 small personal item (laptop bag or purse) allowed under-seat.</li>
                        </ul>
                      </div>

                      {/* Check-in Baggage */}
                      <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-extrabold text-slate-900">Check-in Baggage</span>
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-black text-[10px]">15 Kg Included</span>
                        </div>
                        <ul className="space-y-1.5 text-slate-600 text-[11px]">
                          <li>• 15 kg standard check-in luggage per passenger (1 piece).</li>
                          <li>• Max dimensions (L + W + H) not to exceed 158 cm (62 inches).</li>
                          <li>• Extra baggage (+5kg / +10kg) can be pre-booked at 40% discount vs airport.</li>
                        </ul>
                      </div>
                    </div>

                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-500 flex items-center gap-2">
                      <Info className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                      <span>Infants are entitled to 1 piece of hand baggage up to 7 kg plus 1 fully collapsible pram/stroller free of charge.</span>
                    </div>
                  </div>
                )}

                {/* TAB 4: CANCELLATION & RESCHEDULING */}
                {activeDetailTab === 'cancellation' && (
                  <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3 animate-fadeIn">
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span className="font-extrabold text-xs sm:text-sm text-slate-900">Cancellation & Date Change Policy</span>
                      </div>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${flight.refundable ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                        {flight.refundable ? 'Refundable Ticket' : 'Non-Refundable'}
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] font-extrabold uppercase">
                          <tr>
                            <th className="p-2.5">Time Frame (Before Departure)</th>
                            <th className="p-2.5">Cancellation Fee</th>
                            <th className="p-2.5">Date Change Fee</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700 text-[11px]">
                          <tr>
                            <td className="p-2.5 font-medium">Up to 24 hours before flight</td>
                            <td className="p-2.5 font-bold text-slate-900">₹3,000 or Base Fare (whichever lower)</td>
                            <td className="p-2.5 font-bold text-sky-700">₹2,500 + Fare Difference</td>
                          </tr>
                          <tr>
                            <td className="p-2.5 font-medium">Within 24 to 4 hours before flight</td>
                            <td className="p-2.5 font-bold text-slate-900">₹3,500 or Base Fare (whichever lower)</td>
                            <td className="p-2.5 font-bold text-sky-700">₹3,000 + Fare Difference</td>
                          </tr>
                          <tr className="bg-rose-50/40">
                            <td className="p-2.5 font-medium text-rose-800">Within 4 hours or No-Show</td>
                            <td className="p-2.5 font-bold text-rose-700">Non-refundable (Only airport taxes returned)</td>
                            <td className="p-2.5 font-bold text-rose-700">Not Permitted</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="p-2.5 bg-sky-50 border border-sky-200 rounded-lg text-[11px] text-sky-900 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                        <span><strong>Zero Date Change Guarantee:</strong> Choose <strong>Flexi Plus</strong> in checkout to get ₹0 date change fee up to 24 hours!</span>
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

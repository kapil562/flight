import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plane, Clock, Luggage, Utensils, ChevronDown, ChevronUp, ShieldCheck, Info, MessageCircle, Phone, Lock, Tag, Sparkles } from 'lucide-react';
import AirlineBadge from './AirlineBadge';
import HoldFareModal from './HoldFareModal';

export default function FlightCard({ flight, travelClass = 'economy', onBookFlight, brand = null }) {
  const [showDetails, setShowDetails] = useState(false);
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
                className="mt-4 pt-4 border-t border-slate-200 bg-slate-50/70 -mx-4 -mb-4 sm:-mx-5 sm:-mb-5 p-4 sm:p-5 rounded-b-2xl overflow-hidden"
              >
                {/* Flight Route Detailed Info */}
                <div className="text-xs text-slate-600 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center gap-2 font-bold text-slate-800 mb-2">
                    <Info className="w-4 h-4 text-sky-600" />
                    <span>Flight Specifications</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-500">
                    <div>Route: <strong className="text-slate-800 block text-xs mt-0.5">{flight.from} → {flight.to}</strong></div>
                    <div>Aircraft: <strong className="text-slate-800 block text-xs mt-0.5">{flight.aircraft}</strong></div>
                    <div>Cancellation: <strong className="text-slate-800 block text-xs mt-0.5">{flight.refundable ? 'Refundable with fee' : 'Non-refundable'}</strong></div>
                    <div>Layover: <strong className="text-slate-800 block text-xs mt-0.5">{flight.layoverCity || 'None (Direct)'}</strong></div>
                  </div>
                </div>

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
              onBookFlight(flight, currentPrice, selectedFareTier);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plane, 
  Clock, 
  Luggage, 
  Utensils, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  Info, 
  MessageCircle, 
  Phone, 
  Lock, 
  Tag, 
  Sparkles, 
  Check, 
  ArrowRight,
  ExternalLink,
  Flame,
  CheckCircle2
} from 'lucide-react';
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
  selectLabel = 'Book Flight',
  selectedLabel = 'Book Flight',
  onSelect = null
}) {
  const [showDetails, setShowDetails] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState('info'); // 'info' | 'fare' | 'baggage' | 'cancellation'
  const [showHoldModal, setShowHoldModal] = useState(false);

  const currentPrice = flight.classes?.[travelClass] || flight.basePrice;
  const originalPrice = Math.round(currentPrice * 1.18);
  const cleanSelectedLabel = String(selectedLabel || 'Selected').replace(/^[✓✔\s]+|[✓✔\s]+$/g, '').trim();

  // Dynamic Search Coupon
  const activeCoupon = searchCoupon || {
    code: 'AIRSKY500',
    type: 'percent',
    discount: 35,
    description: 'Flat 35% off on any domestic or international flight'
  };

  const featuredCoupon = activeCoupon.code || 'AIRSKY500';
  const isPercentCoupon = activeCoupon.type === 'percent';
  const couponDiscountValue = activeCoupon.discount || (isPercentCoupon ? 35 : 500);

  const couponDiscountAmount = isPercentCoupon
    ? Math.round((currentPrice * couponDiscountValue) / 100)
    : Math.min(couponDiscountValue, currentPrice);

  const discountedFlightPrice = Math.max(0, currentPrice - couponDiscountAmount);

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

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className={`bg-white rounded-3xl border transition-all overflow-hidden mb-4 relative ${
          isSelected 
            ? 'border-slate-950 ring-2 ring-slate-950/20 shadow-xl bg-slate-50/20' 
            : 'border-slate-200 shadow-[0_6px_25px_rgba(15,23,42,0.04)] hover:shadow-[0_12px_36px_rgba(15,23,42,0.08)] hover:border-slate-300'
        }`}
      >
        
        {/* Top Minimalist Airline Header Bar */}
        <div className="bg-slate-50/90 px-4 sm:px-6 py-2.5 border-b border-slate-100 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <AirlineBadge 
              code={flight.airlineCode} 
              name={flight.airline} 
              logoUrl={flight.airlineLogo || flight.logo} 
              size="xs" 
              showDetails={false} 
            />
            <span className="font-black text-slate-900 truncate">
              {flight.airline}
            </span>
            <span className="font-mono text-[11px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
              {flight.flightNumber}
            </span>
            {flight.aircraft && (
              <span className="hidden sm:inline-block text-[11px] text-slate-400 font-medium">
                • {flight.aircraft}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {flight.stops === 0 ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Non-Stop Direct</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-800 border border-amber-200">
                <span>{flight.stops} Stop {flight.layoverAirport ? `via ${flight.layoverAirport}` : ''}</span>
              </span>
            )}

            {flight.seatsAvailable < 30 && (
              <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                <Flame className="w-3 h-3 text-rose-500 fill-rose-500" />
                <span>{flight.seatsAvailable} seats left</span>
              </span>
            )}
          </div>
        </div>

        {/* Card Main Body */}
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
            
            {/* Left & Center: Journey Hub (Col 1 to 8) */}
            <div className="lg:col-span-8 grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-6">
              
              {/* Departure Hub */}
              <div className="text-left min-w-0">
                <div className="text-2xl sm:text-3xl font-black text-slate-950 font-mono tracking-tight leading-none">
                  {flight.departureTime}
                </div>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="text-sm font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                    {flight.from}
                  </span>
                  {flight.terminal?.from && (
                    <span className="text-[10px] font-bold text-slate-500">
                      {formatTerminal(flight.terminal.from)}
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500 font-semibold truncate mt-1">
                  {getDisplayCity(flight.from, flight.fromCity)}
                </div>
              </div>

              {/* Central Flight Route Trail */}
              <div className="w-28 sm:w-44 text-center px-1">
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-black text-slate-600 mb-1.5">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{flight.duration}</span>
                </div>

                <div className="relative flex items-center justify-center my-1">
                  <div className="w-full h-0.5 bg-slate-300 rounded-full" />
                  <div className="absolute w-2 h-2 rounded-full bg-slate-900 -left-0.5" />
                  <div className="absolute w-6 h-6 rounded-full bg-slate-950 text-white flex items-center justify-center shadow-xs">
                    <Plane className="w-3 h-3 rotate-45 text-white" />
                  </div>
                  <div className="absolute w-2 h-2 rounded-full bg-slate-900 -right-0.5" />
                </div>

                <div className="text-[10px] font-bold text-slate-400 mt-1">
                  {flight.stops === 0 ? 'Direct Flight' : `${flight.stops} Stop Layover`}
                </div>
              </div>

              {/* Arrival Hub */}
              <div className="text-right min-w-0">
                <div className="text-2xl sm:text-3xl font-black text-slate-950 font-mono tracking-tight leading-none">
                  {flight.arrivalTime}
                </div>
                <div className="flex items-center justify-end gap-1.5 mt-1.5">
                  {flight.terminal?.to && (
                    <span className="text-[10px] font-bold text-slate-500">
                      {formatTerminal(flight.terminal.to)}
                    </span>
                  )}
                  <span className="text-sm font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                    {flight.to}
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-semibold truncate mt-1">
                  {getDisplayCity(flight.to, flight.toCity)}
                </div>
              </div>

            </div>

            {/* Right: Dedicated Luxury Price Deck (Col 9 to 12) */}
            <div className="lg:col-span-4 bg-slate-50/80 rounded-2xl p-4 border border-slate-100 flex flex-col sm:flex-row lg:flex-col items-center sm:items-center lg:items-end justify-between gap-3">
              <div className="text-left sm:text-left lg:text-right w-full sm:w-auto lg:w-full">
                <div className="flex items-baseline gap-2 leading-none">
                  <span className="text-2xl sm:text-3xl font-black text-slate-950 font-mono tracking-tight">
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

                {couponDiscountAmount > 0 && (
                  <div className="inline-flex items-center gap-1.5 mt-1.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-black">
                    <span>Save ₹{couponDiscountAmount.toLocaleString('en-IN')}</span>
                    <span className="text-emerald-600 font-bold">• with {featuredCoupon}</span>
                  </div>
                )}

                <div className="text-[10px] text-slate-400 font-medium mt-1">
                  per traveller • taxes incl.
                </div>
              </div>

              <motion.button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (isSelectable && onSelect) {
                    onSelect(flight);
                  } else if (onBookFlight) {
                    onBookFlight(flight, currentPrice, 'saver', featuredCoupon);
                  }
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full sm:w-auto lg:w-full py-3 px-6 rounded-2xl font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  isSelected
                    ? 'bg-slate-950 text-white ring-2 ring-slate-950'
                    : 'bg-slate-950 hover:bg-black text-white'
                }`}
              >
                {isSelected ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>{cleanSelectedLabel}</span>
                  </>
                ) : (
                  <>
                    <span>{selectLabel}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </div>

          </div>

          {/* Bottom Utility Amenities Bar */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3 text-slate-500 font-medium text-[11px]">
              <div className="flex items-center gap-1.5">
                <Luggage className="w-3.5 h-3.5 text-slate-400" />
                <span>{flight.baggage || '7 kg Cabin • 15 kg Check-in'}</span>
              </div>
              <span className="text-slate-200">•</span>
              <div className="flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5 text-slate-400" />
                <span>{flight.mealIncluded ? 'Free Meal Included' : 'Food Available for Purchase'}</span>
              </div>
              <span className="text-slate-200 hidden sm:inline">•</span>
              <div className="hidden sm:flex items-center gap-1 text-emerald-700 font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Instant Airline PNR</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="text-slate-800 hover:text-black font-black flex items-center gap-1 text-xs cursor-pointer shrink-0"
            >
              <span>{showDetails ? 'Close Details' : 'Flight Details'}</span>
              {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Expandable Flight Details Drawer */}
        <AnimatePresence>
          {showDetails && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-slate-200 bg-slate-50/90 p-4 sm:p-6 rounded-b-3xl space-y-4"
            >
              <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
                {[
                  { id: 'info', label: 'Flight Info', icon: Plane },
                  { id: 'fare', label: 'Fare Breakup', icon: Tag },
                  { id: 'baggage', label: 'Baggage Rules', icon: Luggage },
                  { id: 'cancellation', label: 'Refund Policy', icon: ShieldCheck }
                ].map(t => {
                  const Icon = t.icon;
                  const isAct = activeDetailTab === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setActiveDetailTab(t.id)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                        isAct 
                          ? 'bg-slate-950 text-white shadow-sm' 
                          : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>

              {activeDetailTab === 'info' && (
                <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-3 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-black text-slate-900">{flight.airline} • {flight.flightNumber}</span>
                    <span className="font-mono text-slate-500 font-bold">{travelClass.toUpperCase()} CLASS</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-slate-400 font-bold">Departure Terminal</div>
                      <div className="font-black text-slate-800 mt-0.5">{flight.terminal?.from || 'Terminal 1'} ({flight.from})</div>
                    </div>
                    <div>
                      <div className="text-slate-400 font-bold">Arrival Terminal</div>
                      <div className="font-black text-slate-800 mt-0.5">{flight.terminal?.to || 'Terminal 2'} ({flight.to})</div>
                    </div>
                  </div>
                </div>
              )}

              {activeDetailTab === 'fare' && (
                <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Base Fare</span>
                    <span className="font-mono font-bold">₹{Math.round(currentPrice * 0.82).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Aviation Security & Airport Taxes</span>
                    <span className="font-mono font-bold">₹{Math.round(currentPrice * 0.18).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-100 font-black text-slate-900">
                    <span>Published Fare</span>
                    <span className="font-mono">₹{currentPrice.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )}

              {activeDetailTab === 'baggage' && (
                <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Cabin Hand Luggage</span>
                    <span className="font-bold text-slate-900">7 kg / Adult</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Check-in Baggage</span>
                    <span className="font-bold text-slate-900">15 kg / Adult</span>
                  </div>
                </div>
              )}

              {activeDetailTab === 'cancellation' && (
                <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-2 text-xs">
                  <p className="text-slate-600 leading-relaxed">
                    Standard airline cancellation fees apply as per DGCA regulations. Cancellations permitted up to 2 hours prior to scheduled departure.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>

      {/* WhatsApp Help Modal */}
      {showHoldModal && (
        <HoldFareModal 
          isOpen={showHoldModal} 
          onClose={() => setShowHoldModal(false)} 
          flight={flight} 
          currentPrice={currentPrice} 
          brand={activeBrand} 
        />
      )}
    </>
  );
}

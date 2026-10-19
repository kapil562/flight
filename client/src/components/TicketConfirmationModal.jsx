import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Download, Printer, Share2, Plane, Calendar, Clock, MapPin, X, Sparkles, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import AirlineBadge from './AirlineBadge';

export default function TicketConfirmationModal({ booking, onClose, onOpenMyBookings, brand = null }) {
  const ticketRef = useRef(null);

  // Trigger celebration confetti upon mount
  useEffect(() => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  if (!booking) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 25 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 25 }}
        transition={{ type: 'spring', damping: 24, stiffness: 300 }}
        className="bg-white rounded-3xl w-full max-w-2xl my-auto shadow-2xl border border-slate-200 overflow-hidden"
      >
        
        {/* Celebration Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 text-center relative overflow-hidden">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
            <CheckCircle2 className="w-8 h-8 text-white stroke-[2.5]" />
          </div>

          <h2 className="text-2xl font-black tracking-tight">
            {booking.status === 'VERIFICATION_PENDING' ? 'Booking Submitted for Verification!' : 'Booking Confirmed!'}
          </h2>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-md mx-auto">
            {booking.status === 'VERIFICATION_PENDING'
              ? 'Your UPI payment reference is submitted. Our admin team will verify and approve your booking shortly.'
              : 'Your flight has been ticketed. A confirmation email and SMS have been dispatched.'}
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 text-xs font-mono font-bold tracking-wider">
              <span>PNR:</span>
              <span className="text-amber-300 text-base">{booking.pnr}</span>
            </div>
            {booking.payment?.utrNumber && (
              <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 text-[11px] font-mono text-white">
                <span className="text-emerald-200">UTR:</span>
                <span className="font-bold">{booking.payment.utrNumber}</span>
              </div>
            )}
          </div>
        </div>

        {/* Boarding Pass / Ticket Card */}
        <div className="p-6 bg-slate-50" ref={ticketRef}>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative">
            
            {/* Top Ticket Header */}
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                {brand?.logo ? (
                  <img
                    src={brand.logo}
                    alt={brand.name || 'Brand Logo'}
                    className="h-8 w-auto max-w-[120px] object-contain rounded"
                  />
                ) : (
                  <Plane className="w-5 h-5 text-sky-400 rotate-45" />
                )}
                <div>
                  <h4 className="font-extrabold text-sm sm:text-base leading-none">
                    {brand?.name || 'AIR SKY'} E-Boarding Pass
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">ELECTRONIC TICKET / PASSENGER COUPON</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 text-right">
                <AirlineBadge code={booking.airlineCode || (booking.airline?.toLowerCase().includes('indigo') ? '6E' : booking.airline?.toLowerCase().includes('akasa') ? 'QP' : booking.airline?.toLowerCase().includes('vistara') ? 'UK' : booking.airline?.toLowerCase().includes('spice') ? 'SG' : booking.airline?.toLowerCase().includes('air india') ? 'AI' : booking.airline?.slice(0, 2))} name={booking.airline} size="sm" showDetails={false} />
                <div>
                  <div className="text-xs font-bold text-sky-400">{booking.airline}</div>
                  <div className="text-[11px] font-mono text-slate-400">{booking.flightNumber}</div>
                </div>
              </div>
            </div>

            {/* Multi-City Leg Breakdown (if applicable) */}
            {booking.multiCityLegs && booking.multiCityLegs.length > 0 && (
              <div className="p-4 sm:p-5 border-b border-slate-100 space-y-3 bg-sky-50/50">
                <div className="text-[11px] font-black uppercase text-sky-800 tracking-wider flex items-center gap-1.5">
                  <Plane className="w-3.5 h-3.5 text-sky-600" />
                  <span>Multi-City Flight Itinerary ({booking.multiCityLegs.length} Flights)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {booking.multiCityLegs.map((leg, idx) => (
                    <div key={idx} className="bg-white rounded-xl p-3 border border-sky-100 shadow-xs flex items-center justify-between text-xs">
                      <div>
                        <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded bg-sky-600 text-white font-bold text-[10px] flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span>{leg.from} ➔ {leg.to}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{leg.airline} ({leg.flightNumber})</div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block font-mono">{leg.date}</span>
                        <span className="font-mono font-bold text-sky-700">{leg.departureTime} - {leg.arrivalTime}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Round Trip Dual-Flight Breakdown (if applicable) */}
            {(booking.tripType === 'roundTrip' || booking.roundTripDetails) && (
              <div className="p-4 sm:p-5 border-b border-slate-100 space-y-3 bg-indigo-50/40">
                <div className="text-[11px] font-black uppercase text-indigo-900 tracking-wider flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Plane className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Round Trip Confirmed Flight Passes (2 Flights)</span>
                  </div>
                  <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded font-black uppercase">
                    Both Confirmed
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Onward Flight */}
                  <div className="bg-white rounded-xl p-3.5 border border-sky-200 shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-extrabold text-[10px] uppercase">
                        1. Departure Flight (Jana)
                      </span>
                      <span className="font-mono text-slate-500 font-bold text-[11px]">{booking.departureDate}</span>
                    </div>
                    <div className="font-extrabold text-slate-900 text-sm flex items-center justify-between">
                      <span>{booking.from} <span className="text-xs font-normal text-slate-500">({booking.fromCity})</span></span>
                      <ArrowRight className="w-3.5 h-3.5 text-sky-600" />
                      <span>{booking.to} <span className="text-xs font-normal text-slate-500">({booking.toCity})</span></span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1.5 border-t border-slate-100 font-semibold">
                      <span>{booking.roundTripDetails?.onward?.airline || booking.airline} ({booking.roundTripDetails?.onward?.flightNumber || booking.flightNumber})</span>
                      <span className="font-mono font-black text-sky-700">
                        {booking.roundTripDetails?.onward?.departureTime || booking.departureTime} ➔ {booking.roundTripDetails?.onward?.arrivalTime || ''}
                      </span>
                    </div>
                  </div>

                  {/* Return Flight */}
                  <div className="bg-white rounded-xl p-3.5 border border-indigo-200 shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-extrabold text-[10px] uppercase">
                        2. Return Flight (Aana)
                      </span>
                      <span className="font-mono text-slate-500 font-bold text-[11px]">{booking.returnDate || booking.departureDate}</span>
                    </div>
                    <div className="font-extrabold text-slate-900 text-sm flex items-center justify-between">
                      <span>{booking.to} <span className="text-xs font-normal text-slate-500">({booking.toCity})</span></span>
                      <ArrowRight className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{booking.from} <span className="text-xs font-normal text-slate-500">({booking.fromCity})</span></span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1.5 border-t border-slate-100 font-semibold">
                      <span>{booking.roundTripDetails?.return?.airline || booking.airline} ({booking.roundTripDetails?.return?.flightNumber || booking.flightNumber})</span>
                      <span className="font-mono font-black text-indigo-700">
                        {booking.roundTripDetails?.return?.departureTime || booking.departureTime} ➔ {booking.roundTripDetails?.return?.arrivalTime || booking.arrivalTime}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Flight Route & Timings (One-Way only) */}
            {booking.tripType !== 'roundTrip' && !booking.roundTripDetails && (
              <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                <div className="sm:col-span-5 text-left">
                  <span className="text-3xl font-black text-slate-900 font-mono">{booking.from}</span>
                  <div className="text-xs font-bold text-slate-700">{booking.fromCity}</div>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-sky-600" />
                    <span>Dep: {booking.departureTime}</span>
                  </div>
                </div>

                <div className="sm:col-span-2 text-center py-2 sm:py-0">
                  <div className="w-8 h-8 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center mx-auto shadow-xs">
                    <Plane className="w-4 h-4 rotate-90" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">Non-Stop</span>
                </div>

                <div className="sm:col-span-5 text-right">
                  <span className="text-3xl font-black text-slate-900 font-mono">{booking.to}</span>
                  <div className="text-xs font-bold text-slate-700">{booking.toCity}</div>
                  <div className="text-xs text-slate-400 mt-1 flex items-center justify-end gap-1 font-mono">
                    <Clock className="w-3 h-3 text-sky-600" />
                    <span>Arr: {booking.arrivalTime}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Perforated Notches line */}
            <div className="relative py-2 border-t-2 border-dashed border-slate-200">
              <div className="absolute -left-3 -top-3 w-6 h-6 rounded-full bg-slate-50 border border-slate-200"></div>
              <div className="absolute -right-3 -top-3 w-6 h-6 rounded-full bg-slate-50 border border-slate-200"></div>
            </div>

            {/* Passenger, Class, Date & Seat Metadata Grid */}
            <div className="p-5 sm:p-6 bg-slate-50/50 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Passenger(s)</span>
                <div className="font-extrabold text-slate-900 mt-0.5">
                  {booking.passengers?.map((p, i) => (
                    <div key={i} className="truncate">{p.title} {p.firstName} {p.lastName}</div>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Seat(s)</span>
                <div className="font-extrabold text-sky-700 font-mono mt-0.5">
                  {booking.passengers?.map(p => p.seat).filter(Boolean).join(', ') || '12A'}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Travel Date</span>
                <div className="font-extrabold text-slate-900 mt-0.5 font-mono">{booking.departureDate}</div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Class / Gate</span>
                <div className="font-extrabold text-slate-900 mt-0.5">
                  <span className="capitalize">{booking.travelClass}</span> • Gate 14B
                </div>
              </div>
            </div>

            {/* Barcode & Total */}
            <div className="p-4 sm:p-5 bg-white border-t border-slate-100 flex items-center justify-between">
              <div>
                {/* Simulated Realistic Barcode */}
                <div className="h-10 flex items-center gap-[3px] opacity-80">
                  {Array.from({ length: 38 }).map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-full bg-slate-800 ${idx % 3 === 0 ? 'w-1' : idx % 5 === 0 ? 'w-1.5' : 'w-0.5'}`}
                    ></div>
                  ))}
                </div>
                <span className="text-[10px] font-mono text-slate-400 mt-1 block">ASG-{booking.pnr}-ETKT-2026</span>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Paid</span>
                <div className="text-xl font-black text-slate-900 font-mono">
                  ₹{booking.fare?.total?.toLocaleString('en-IN')}
                </div>
                <div className="flex items-center justify-end gap-1 mt-0.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    booking.status === 'VERIFICATION_PENDING'
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    {booking.status === 'VERIFICATION_PENDING' ? '⏳ Verification Pending' : (booking.payment?.method || 'PAID')}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => { onClose(); onOpenMyBookings(); }}
            className="text-xs font-bold text-sky-600 hover:text-sky-700 cursor-pointer"
          >
            Go to My Bookings →
          </button>

          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Print</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDownloadPDF}
              className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download E-Ticket</span>
            </motion.button>
          </div>
        </div>

      </motion.div>
    </motion.div>
  );
}

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { CheckCircle2, Download, Printer, Share2, Plane, Calendar, Clock, MapPin, X, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import AirlineBadge from './AirlineBadge';

export default function TicketConfirmationModal({ booking, onClose, onOpenMyBookings, brand = null }) {
  const ticketRef = useRef(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

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

  const handleDownloadPDF = async () => {
    if (!ticketRef.current || isGeneratingPDF) return;
    setIsGeneratingPDF(true);
    try {
      const element = ticketRef.current;
      const canvas = await html2canvas(element, {
        scale: 2.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const pageWidth = pdf.internal.pageSize.getWidth(); // 210mm
      const pageHeight = pdf.internal.pageSize.getHeight(); // 297mm
      const margin = 12; // 12mm margins
      const maxPrintWidth = pageWidth - (margin * 2); // 186mm
      const maxPrintHeight = pageHeight - (margin * 2); // 273mm

      let printWidth = maxPrintWidth;
      let printHeight = (canvas.height * printWidth) / canvas.width;

      // Mathematically ensure it strictly fits on 1 single page!
      if (printHeight > maxPrintHeight) {
        printHeight = maxPrintHeight;
        printWidth = (canvas.width * printHeight) / canvas.height;
      }

      const posX = (pageWidth - printWidth) / 2;
      const posY = Math.max(margin, (pageHeight - printHeight) / 3);

      pdf.addImage(imgData, 'PNG', posX, posY, printWidth, printHeight, undefined, 'FAST');
      pdf.save(`AirSkyGo-Ticket-${booking.pnr || 'CONFIRMED'}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      // Fallback
      window.print();
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (!booking) return null;

  const modalContent = (
    <div
      id="ticket-modal-portal"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-start sm:items-center justify-center p-2.5 sm:p-4 py-4 sm:py-8"
    >
      {/* Print stylesheet to enforce strictly 1-page printout of ticket pass only */}
      <style>{`
        @media print {
          /* 1. Completely eliminate the entire 8392px React website root from print flow */
          #root,
          body > *:not(#ticket-modal-portal) {
            display: none !important;
            height: 0 !important;
            max-height: 0 !important;
            overflow: hidden !important;
          }

          /* 2. Reset html & body so height is auto and doesn't generate blank trailing sheets */
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: 100% !important;
            overflow: hidden !important;
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* 3. Neutralize backdrop and hide non-printable UI elements */
          #ticket-modal-portal {
            position: static !important;
            display: block !important;
            width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            background: transparent !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            overflow: visible !important;
          }

          .no-print,
          #ticket-modal-portal .no-print {
            display: none !important;
            height: 0 !important;
            overflow: hidden !important;
          }

          #ticket-modal-card-wrapper {
            position: static !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            background: transparent !important;
            transform: none !important;
          }

          #ticket-card-outer {
            padding: 0 !important;
            background: transparent !important;
            margin: 0 auto !important;
            max-width: 680px !important;
          }

          /* 4. Ticket Pass strictly 1 page */
          #printable-ticket {
            display: block !important;
            position: static !important;
            width: 100% !important;
            max-width: 680px !important;
            margin: 0 auto !important;
            box-shadow: none !important;
            border: 1px solid #cbd5e1 !important;
            border-radius: 16px !important;
            background: #ffffff !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            page-break-after: avoid !important;
            break-after: avoid !important;
          }

          @page {
            size: A4 portrait;
            margin: 10mm;
          }
        }
      `}</style>

      <motion.div
        id="ticket-modal-card-wrapper"
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-2xl my-auto shadow-2xl border border-slate-200 overflow-hidden"
      >
        
        {/* Celebration Header */}
        <div className="no-print bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 sm:p-6 text-center relative overflow-hidden">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 sm:p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <div className="w-11 h-11 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-2.5 shadow-inner">
            <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-white stroke-[2.5]" />
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
            {booking.status === 'VERIFICATION_PENDING' ? 'Booking Submitted for Verification!' : 'Booking Confirmed!'}
          </h2>
          <p className="text-emerald-100 text-[11px] sm:text-xs mt-1 max-w-md mx-auto leading-normal">
            {booking.status === 'VERIFICATION_PENDING'
              ? 'Your UPI payment reference is submitted. Our admin team will verify and approve your booking shortly.'
              : 'Your flight has been ticketed. A confirmation email and SMS have been dispatched.'}
          </p>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/20 text-xs font-mono font-bold tracking-wider">
              <span className="text-emerald-200">PNR:</span>
              <span className="text-amber-300 text-sm sm:text-base font-black">{booking.pnr}</span>
            </div>
            {booking.payment?.utrNumber && (
              <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-[11px] font-mono text-white">
                <span className="text-emerald-200">UTR:</span>
                <span className="font-bold">{booking.payment.utrNumber}</span>
              </div>
            )}
          </div>
        </div>

        {/* Boarding Pass / Ticket Card */}
        <div id="ticket-card-outer" className="p-3 sm:p-6 bg-slate-50">
          <div
            ref={ticketRef}
            id="printable-ticket"
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative"
          >
            
            {/* Top Ticket Header */}
            <div className="p-3.5 sm:p-5 bg-slate-900 text-white flex items-center justify-between gap-2 overflow-hidden">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                {brand?.logo ? (
                  <img
                    src={brand.logo}
                    alt={brand.name || 'Brand Logo'}
                    crossOrigin="anonymous"
                    className="h-6 sm:h-8 w-auto max-w-[90px] sm:max-w-[120px] object-contain rounded shrink-0"
                  />
                ) : (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-sky-500/20 flex items-center justify-center shrink-0">
                    <Plane className="w-4 h-4 text-sky-400 rotate-45" />
                  </div>
                )}
                <div className="min-w-0">
                  <h4 className="font-extrabold text-xs sm:text-base leading-tight truncate">
                    {brand?.name || 'AIR SKY'} E-Boarding Pass
                  </h4>
                  <span className="text-[9px] sm:text-[10px] text-slate-400 font-mono block truncate">ELECTRONIC TICKET / PASSENGER COUPON</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-right shrink-0">
                <AirlineBadge code={booking.airlineCode || (booking.airline?.toLowerCase().includes('indigo') ? '6E' : booking.airline?.toLowerCase().includes('akasa') ? 'QP' : booking.airline?.toLowerCase().includes('vistara') ? 'UK' : booking.airline?.toLowerCase().includes('spice') ? 'SG' : booking.airline?.toLowerCase().includes('air india') ? 'AI' : booking.airline?.slice(0, 2))} name={booking.airline} size="sm" showDetails={false} />
                <div className="text-right">
                  <div className="text-[11px] sm:text-xs font-bold text-sky-400 truncate max-w-[90px] sm:max-w-[120px]">{booking.airline}</div>
                  <div className="text-[10px] sm:text-[11px] font-mono text-slate-400">{booking.flightNumber}</div>
                  <div className="text-[10px] sm:text-[11px] font-mono font-bold text-amber-400">PNR: {booking.pnr}</div>
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

            {/* Flight Route & Timings (One-Way only - Fully Responsive Horizontal Layout) */}
            {booking.tripType !== 'roundTrip' && !booking.roundTripDetails && booking.tripType !== 'multiCity' && !booking.multiCityLegs && (
              <div className="p-4 sm:p-6 flex items-center justify-between gap-2 sm:gap-4">
                {/* From Airport */}
                <div className="text-left flex-1 min-w-0">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight block">{booking.from}</span>
                  <div className="text-[11px] sm:text-xs font-bold text-slate-700 truncate">{booking.fromCity}</div>
                  <div className="text-[10px] sm:text-xs text-slate-400 mt-1 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-sky-600 shrink-0" />
                    <span>Dep: {booking.departureTime}</span>
                  </div>
                </div>

                {/* Flight Path Indicator */}
                <div className="text-center px-1.5 sm:px-4 shrink-0 flex flex-col items-center justify-center">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center shadow-xs">
                    <Plane className="w-3.5 h-3.5 sm:w-4 sm:h-4 rotate-90" />
                  </div>
                  <div className="w-12 sm:w-20 h-0.5 bg-slate-200 my-1 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-sky-500"></div>
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Non-Stop</span>
                </div>

                {/* To Airport */}
                <div className="text-right flex-1 min-w-0">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight block">{booking.to}</span>
                  <div className="text-[11px] sm:text-xs font-bold text-slate-700 truncate">{booking.toCity}</div>
                  <div className="text-[10px] sm:text-xs text-slate-400 mt-1 flex items-center justify-end gap-1 font-mono">
                    <Clock className="w-3 h-3 text-sky-600 shrink-0" />
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
            <div className="p-3.5 sm:p-5 bg-slate-50/50 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 text-xs">
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Passenger(s)</span>
                <div className="font-extrabold text-slate-900 mt-0.5 truncate">
                  {booking.passengers?.map((p, i) => (
                    <div key={i} className="truncate">{p.title} {p.firstName} {p.lastName}</div>
                  ))}
                </div>
              </div>

              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Seat(s)</span>
                <div className="font-extrabold text-sky-700 font-mono mt-0.5 truncate">
                  {booking.passengers?.map(p => p.seat).filter(Boolean).join(', ') || '12A'}
                </div>
              </div>

              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Travel Date</span>
                <div className="font-extrabold text-slate-900 mt-0.5 font-mono truncate">{booking.departureDate}</div>
              </div>

              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Class / Gate</span>
                <div className="font-extrabold text-slate-900 mt-0.5 truncate">
                  <span className="capitalize">{booking.travelClass}</span> • Gate 14B
                </div>
              </div>
            </div>

            {/* Barcode & Total - Fully Responsive to prevent Price Overflow */}
            <div className="p-3.5 sm:p-5 bg-white border-t border-slate-100 flex items-center justify-between gap-3 overflow-hidden">
              <div className="min-w-0 flex-1 overflow-hidden pr-2">
                {/* Simulated Realistic Barcode */}
                <div className="h-8 sm:h-10 flex items-center gap-[2px] sm:gap-[3px] opacity-80 overflow-hidden max-w-[130px] sm:max-w-[200px]">
                  {Array.from({ length: 26 }).map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-full bg-slate-800 shrink-0 ${idx % 3 === 0 ? 'w-1' : idx % 5 === 0 ? 'w-1 sm:w-1.5' : 'w-0.5'}`}
                    ></div>
                  ))}
                </div>
                <span className="text-[9px] sm:text-[10px] font-mono text-slate-400 mt-1 block truncate">
                  ASG-{booking.pnr}-ETKT-2026
                </span>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Total Paid</span>
                <div className="text-lg sm:text-2xl font-black text-slate-900 font-mono whitespace-nowrap leading-tight">
                  ₹{booking.fare?.total?.toLocaleString('en-IN')}
                </div>
                <div className="flex items-center justify-end gap-1 mt-1">
                  <span className={`text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded whitespace-nowrap inline-flex items-center ${
                    booking.status === 'VERIFICATION_PENDING'
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                  }`}>
                    {booking.status === 'VERIFICATION_PENDING' ? '⏳ Verification Pending' : (booking.payment?.method || 'PAID')}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="no-print p-4 sm:p-5 border-t border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3">
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
              whileHover={{ scale: isGeneratingPDF ? 1 : 1.05 }}
              whileTap={{ scale: isGeneratingPDF ? 1 : 0.95 }}
              disabled={isGeneratingPDF}
              onClick={handleDownloadPDF}
              className="px-4 sm:px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-75 disabled:cursor-not-allowed text-white font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all shrink-0"
            >
              {isGeneratingPDF ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download E-Ticket</span>
                </>
              )}
            </motion.button>
          </div>
        </div>

      </motion.div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modalContent, document.body);
}
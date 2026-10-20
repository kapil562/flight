import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { 
  Check, 
  Download, 
  Printer, 
  Plane, 
  Users, 
  Luggage, 
  Briefcase, 
  Receipt, 
  Home, 
  Search, 
  ArrowRight, 
  X, 
  Loader2 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

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
        scale: 2,
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
      const margin = 10;
      const maxPrintWidth = pageWidth - (margin * 2);
      const maxPrintHeight = pageHeight - (margin * 2);

      let printWidth = maxPrintWidth;
      let printHeight = (canvas.height * printWidth) / canvas.width;

      if (printHeight > maxPrintHeight) {
        printHeight = maxPrintHeight;
        printWidth = (canvas.width * printHeight) / canvas.height;
      }

      const posX = (pageWidth - printWidth) / 2;
      const posY = 10;

      pdf.addImage(imgData, 'PNG', posX, posY, printWidth, printHeight, undefined, 'FAST');
      pdf.save(`AirSkyGo-Ticket-${booking.bookingId || booking.pnr || 'CONFIRMED'}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      window.print();
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (!booking) return null;

  const fare = booking.fare || {};
  const basePrice = Number(fare.basePrice || 7000);
  const taxes = Number(fare.taxes || 850);
  const discount = Number(fare.discount || 0);
  const total = Number(fare.total || (basePrice + taxes - discount));
  const contactEmail = booking.contact?.email || 'customer@gmail.com';

  const modalContent = (
    <div
      id="ticket-modal-portal"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-start sm:items-center justify-center p-2.5 sm:p-4 py-4 sm:py-8"
    >
      {/* Print stylesheet to enforce strictly 1-page printout of ticket pass only */}
      <style>{`
        @media print {
          #root,
          body > *:not(#ticket-modal-portal) {
            display: none !important;
            height: 0 !important;
            max-height: 0 !important;
            overflow: hidden !important;
          }

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

          #ticket-modal-portal {
            position: static !important;
            display: block !important;
            width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            background: transparent !important;
            overflow: visible !important;
          }

          .no-print,
          #ticket-modal-portal .no-print {
            display: none !important;
            height: 0 !important;
            overflow: hidden !important;
          }

          #ticket-card-outer {
            padding: 0 !important;
            background: transparent !important;
            margin: 0 auto !important;
            max-width: 680px !important;
          }

          #printable-ticket {
            display: block !important;
            position: static !important;
            width: 100% !important;
            max-width: 680px !important;
            margin: 0 auto !important;
            box-shadow: none !important;
            border: 1px solid #e2e8f0 !important;
            border-radius: 16px !important;
            background: #ffffff !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          @page {
            size: A4 portrait;
            margin: 8mm;
          }
        }
      `}</style>

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-slate-50/50 rounded-3xl w-full max-w-xl my-auto shadow-2xl border border-slate-200 overflow-hidden relative"
      >
        {/* Close Button top-right */}
        <button
          onClick={onClose}
          className="no-print absolute top-3.5 right-3.5 z-20 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Outer container */}
        <div id="ticket-card-outer" className="p-3 sm:p-5">
          <div ref={ticketRef} id="printable-ticket" className="bg-white rounded-2xl p-4 sm:p-6 space-y-4 border border-slate-200/80 shadow-xs">

            {/* 1. Header (Checkmark, Booking Confirmed, Booking ID, Email text) */}
            <div className="text-center pt-2">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                <Check className="w-6 h-6 sm:w-7 sm:h-7 stroke-[3]" />
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-3">
                Booking Confirmed!
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                Your flight has been booked successfully.
              </p>

              {/* Booking ID Highlight Card */}
              <div className="mt-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl py-2.5 px-6 max-w-xs mx-auto text-center shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Booking ID</span>
                <span className="text-lg sm:text-xl font-black text-amber-500 tracking-wider font-mono">
                  {booking.bookingId || booking.pnr}
                </span>
              </div>

              <p className="text-[11px] sm:text-xs text-slate-500 mt-2">
                A confirmation has been sent to <span className="font-semibold text-slate-700">{contactEmail}</span>
              </p>
            </div>

            {/* 2. Flight Details Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-3.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600">
                <Plane className="w-3.5 h-3.5 text-amber-500 rotate-45" />
                <span>Flight Details</span>
              </div>

              <div className="flex items-center justify-between gap-2 sm:gap-4">
                {/* From Airport */}
                <div className="text-left flex-1 min-w-0">
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">{booking.from}</div>
                  <div className="text-[10px] sm:text-xs text-slate-500 mt-0.5 line-clamp-2">
                    {booking.fromCity || `${booking.from} Airport`}
                  </div>
                </div>

                {/* Duration & Arrow */}
                <div className="flex flex-col items-center justify-center px-2 shrink-0">
                  <ArrowRight className="w-4 h-4 text-amber-500" />
                  <span className="text-[10px] text-slate-400 mt-0.5 font-medium">Non-stop</span>
                </div>

                {/* To Airport */}
                <div className="text-right flex-1 min-w-0">
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">{booking.to}</div>
                  <div className="text-[10px] sm:text-xs text-slate-500 mt-0.5 line-clamp-2">
                    {booking.toCity || `${booking.to} Airport`}
                  </div>
                </div>
              </div>

              {/* Airline, Date & Timings */}
              <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
                <div className="text-left">
                  <span className="font-black text-amber-600">{booking.airline}</span>
                  <span className="text-slate-400 ml-1.5 font-mono font-medium">{booking.flightNumber}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 font-medium">{booking.departureDate}</span>
                  <span className="font-mono font-bold text-slate-900 ml-2">{booking.departureTime} - {booking.arrivalTime}</span>
                </div>
              </div>
            </div>

            {/* 3. Passengers Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600">
                <Users className="w-3.5 h-3.5 text-amber-500" />
                <span>Passengers</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="text-slate-400 font-semibold border-b border-slate-100 text-[11px]">
                      <th className="pb-1.5 font-semibold w-8">#</th>
                      <th className="pb-1.5 font-semibold">Name</th>
                      <th className="pb-1.5 font-semibold">Gender</th>
                      <th className="pb-1.5 font-semibold">Seat</th>
                      <th className="pb-1.5 font-semibold">Meal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {(booking.passengers && booking.passengers.length > 0 ? booking.passengers : [{
                      title: 'Mr',
                      firstName: booking.contact?.name || 'Customer',
                      lastName: 'Traveller',
                      gender: 'Male',
                      seat: '15A',
                      meal: '---'
                    }]).map((p, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-2 font-mono text-slate-400">{idx + 1}</td>
                        <td className="py-2 font-bold text-slate-900">{p.title} {p.firstName} {p.lastName}</td>
                        <td className="py-2 text-slate-600">{p.gender || 'Male'}</td>
                        <td className="py-2 font-mono font-semibold text-slate-700">{p.seat || '15A'}</td>
                        <td className="py-2 text-slate-500">{p.meal || '---'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4. Baggage & Carry-on Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600">
                  <Luggage className="w-3.5 h-3.5 text-amber-500" />
                  <span>Baggage & Carry-on</span>
                </div>
                <span className="w-5 h-2 rounded-full border border-amber-300"></span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="bg-amber-50/40 rounded-xl p-2.5 border border-amber-100 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                    <Luggage className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">CHECK-IN BAGGAGE</div>
                    <div className="text-xs font-extrabold text-slate-800">15 kg per person</div>
                  </div>
                </div>

                <div className="bg-emerald-50/40 rounded-xl p-2.5 border border-emerald-100 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">CABIN BAGGAGE</div>
                    <div className="text-xs font-extrabold text-slate-800">7 kg (1 bag + 1 personal item)</div>
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 leading-normal">
                ⓘ Indicative allowance for this cabin class. Final entitlement is confirmed by the airline at check-in.
              </p>
            </div>

            {/* 5. Payment Summary Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 mb-1">
                <Receipt className="w-3.5 h-3.5 text-amber-500" />
                <span>Payment Summary</span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center text-slate-700">
                  <span>Base Fare (incl. taxes)</span>
                  <span className="font-mono font-bold">₹{(basePrice + taxes).toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between items-center text-slate-400 text-[11px] pl-3">
                  <span>of which Taxes & Fees (incl. GST)</span>
                  <span className="font-mono">₹{taxes.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between items-center text-slate-400 text-[11px] pl-3">
                  <span>of which Base Fare (excl. taxes)</span>
                  <span className="font-mono">₹{basePrice.toLocaleString('en-IN')}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between items-center text-emerald-600 font-semibold">
                    <span>Promo Discount ({fare.promoCode || 'SPECIAL'})</span>
                    <span className="font-mono">-₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                  <span className="font-extrabold text-sm text-slate-900">Total Paid</span>
                  <span className="font-mono font-black text-xl text-amber-500">₹{total.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between items-center pt-0.5">
                  <span className="text-[11px] text-slate-400 font-medium">Payment Status</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider">
                    completed
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* 6. Action Buttons at Bottom */}
        <div className="no-print p-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-center gap-2.5">
          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-75"
          >
            {isGeneratingPDF ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Downloading...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download Ticket</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl shadow-2xs flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Home className="w-3.5 h-3.5 text-slate-500" />
            <span>Back to Home</span>
          </button>

          <button
            onClick={() => { onClose(); onOpenMyBookings(); }}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl shadow-2xs flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <span>Track Booking</span>
          </button>
        </div>

      </motion.div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modalContent, document.body);
}

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
  Loader2,
  FileText
} from 'lucide-react';
import confetti from 'canvas-confetti';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function TicketConfirmationModal({ booking, onClose, onOpenMyBookings, brand = null }) {
  const modalTicketRef = useRef(null);
  const indigoPdfRef = useRef(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showPdfPreview, setShowPdfPreview] = useState(false);

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

  // Generate authentic IndiGo-style official PDF
  const handleDownloadPDF = async () => {
    if (!indigoPdfRef.current || isGeneratingPDF) return;
    setIsGeneratingPDF(true);
    try {
      const element = indigoPdfRef.current;
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: 820
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
      const margin = 8;
      const maxPrintWidth = pageWidth - (margin * 2);
      const maxPrintHeight = pageHeight - (margin * 2);

      let printWidth = maxPrintWidth;
      let printHeight = (canvas.height * printWidth) / canvas.width;

      if (printHeight > maxPrintHeight) {
        printHeight = maxPrintHeight;
        printWidth = (canvas.width * printHeight) / canvas.height;
      }

      const posX = (pageWidth - printWidth) / 2;
      const posY = 8;

      pdf.addImage(imgData, 'PNG', posX, posY, printWidth, printHeight, undefined, 'FAST');
      pdf.save(`${booking.airline || 'IndiGo'}-Itinerary-${booking.bookingId || booking.pnr || 'CONFIRMED'}.pdf`);
    } catch (err) {
      console.error('Error generating official PDF:', err);
      window.print();
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (!booking) return null;

  const fare = booking.fare || {};
  const basePrice = Number(fare.basePrice || 4495);
  const taxes = Number(fare.taxes || 1455);
  const discount = Number(fare.discount || 0);
  const total = Number(fare.total || (basePrice + taxes - discount));
  const contactEmail = booking.contact?.email || 'customer@gmail.com';
  const contactPhone = booking.contact?.phone || '9876543210';

  // Airline specific theme color
  const airlineName = booking.airline || 'IndiGo';
  const isIndiGo = airlineName.toLowerCase().includes('indigo');
  const airlinePrimaryColor = isIndiGo ? '#002B7F' : airlineName.toLowerCase().includes('air india') ? '#E21836' : airlineName.toLowerCase().includes('spice') ? '#ED1C24' : airlineName.toLowerCase().includes('akasa') ? '#FF5900' : '#002B7F';

  const passengersList = (booking.passengers && booking.passengers.length > 0) ? booking.passengers : [{
    title: 'Mr',
    firstName: booking.contact?.name || 'Customer',
    lastName: 'Traveller',
    gender: 'Male',
    seat: '7B',
    meal: 'Standard'
  }];

  const modalContent = (
    <div
      id="ticket-modal-portal"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-start sm:items-center justify-center p-2.5 sm:p-4 py-4 sm:py-8"
    >
      {/* Print stylesheet to enforce strictly 1-page printout of IndiGo official ticket */}
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
          #ticket-modal-portal .no-print,
          #screen-confirmation-card {
            display: none !important;
            height: 0 !important;
            overflow: hidden !important;
          }

          #indigo-official-pdf-ticket {
            display: block !important;
            position: static !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 760px !important;
            margin: 0 auto !important;
            box-shadow: none !important;
            border: none !important;
            background: #ffffff !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            visibility: visible !important;
          }

          @page {
            size: A4 portrait;
            margin: 8mm;
          }
        }
      `}</style>

      {/* ======================================================== */}
      {/* 1. OFF-SCREEN INDIGO OFFICIAL ITINERARY FOR PDF CAPTURE  */}
      {/* ======================================================== */}
      <div
        style={{
          position: 'absolute',
          left: '-9999px',
          top: 0,
          width: '780px',
          background: '#ffffff',
          color: '#111827',
          fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
        }}
      >
        <div
          ref={indigoPdfRef}
          id="indigo-official-pdf-ticket"
          className="p-8 bg-white text-slate-900 space-y-4"
          style={{ width: '780px', backgroundColor: '#ffffff' }}
        >
          {/* Header Row: IndiGo Logo + Booking Date */}
          <div className="flex items-center justify-between pb-3 border-b-2" style={{ borderColor: airlinePrimaryColor }}>
            <div className="flex items-center gap-3">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black tracking-tight" style={{ color: airlinePrimaryColor }}>
                  {airlineName}
                </span>
                <div className="flex gap-0.5 ml-1">
                  <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: airlinePrimaryColor }}></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 inline-block"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block"></span>
                </div>
              </div>
              <span className="text-xs text-slate-400 font-mono pl-3 border-l border-slate-300">
                Itinerary / Tax Invoice
              </span>
            </div>

            <div className="text-right">
              <div className="text-xs font-bold text-slate-800">
                *Date of booking: <span className="font-mono">{booking.createdAt ? new Date(booking.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '20 Oct 2026 16:39'}</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                Issued by AirSkyGo Booking Desk
              </div>
            </div>
          </div>

          {/* PNR & Payment Status Dotted Line */}
          <div className="py-2 border-b border-dotted border-slate-400 flex items-center justify-between text-xs font-mono">
            <div>
              <span className="text-slate-500 font-semibold uppercase">PNR/Booking Reference: </span>
              <span className="font-black text-sm text-slate-900 tracking-wider">{booking.pnr}</span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold uppercase">Payment Status: </span>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-300">
                Confirmed
              </span>
            </div>
          </div>

          {/* Passenger Information Box */}
          <div className="border border-slate-700 rounded-lg p-3 space-y-2 bg-white">
            <div className="text-xs font-black uppercase tracking-wide text-slate-900">
              Passenger Information
            </div>

            <div className="divide-y divide-slate-100">
              {passengersList.map((p, idx) => (
                <div key={idx} className="pt-1.5 first:pt-0">
                  <div className="text-xs font-black text-slate-900">
                    {p.title} {p.firstName} {p.lastName}
                    <span className="text-slate-500 font-normal ml-3">
                      {p.type || 'Adult'} | {p.gender || 'Male'} |
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-xs mt-1 text-slate-700">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-semibold">Sector</span>
                      <span className="font-mono font-bold">{booking.from} - {booking.to}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-semibold">Seat</span>
                      <span className="font-mono font-bold text-sky-800">{p.seat || '15A'} (Window)</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-semibold">{isIndiGo ? '6E Add-ons' : 'Add-ons'}</span>
                      <span className="font-medium">{p.meal || 'Lite'} • {booking.travelClass || 'Economy'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Boarding / Flight Coupon Box with Barcode */}
          <div className="border border-slate-700 rounded-lg p-3.5 space-y-3 bg-white">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Plane className="w-3.5 h-3.5 rotate-45" style={{ color: airlinePrimaryColor }} />
                <span className="font-black text-slate-900">
                  {booking.flightNumber} (Airbus A320) • {booking.departureDate}
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-[11px] font-bold text-rose-700">
                  Check-in/Bag Drop Closes: 60 mins before departure
                </span>
              </div>
              <div className="text-[11px] font-bold px-2 py-0.5 rounded border border-slate-300 bg-slate-50">
                {booking.travelClass || 'Economy'}
              </div>
            </div>

            <div className="grid grid-cols-12 gap-3 items-center py-1">
              {/* Barcode Block (Realistic IndiGo style) */}
              <div className="col-span-3">
                <div className="border border-slate-300 p-1.5 rounded bg-white">
                  <div className="h-14 flex items-center justify-center gap-[2px] overflow-hidden bg-slate-950 p-1 rounded">
                    {Array.from({ length: 34 }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-full bg-white shrink-0 ${
                          i % 5 === 0 ? 'w-1.5' : i % 3 === 0 ? 'w-1' : 'w-0.5'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-[8px] font-mono text-center text-slate-500 mt-1 truncate">
                    *{booking.pnr}*
                  </div>
                </div>
              </div>

              {/* Origin, Travel Time, Destination */}
              <div className="col-span-9 grid grid-cols-3 gap-2 items-center text-center">
                <div className="text-left">
                  <div className="text-base font-black text-slate-900">{booking.fromCity || 'Delhi'}</div>
                  <div className="text-[10px] text-slate-500 font-medium leading-tight">
                    {booking.from} - {booking.fromCity || 'Indira Gandhi'} Airport (Terminal 1)
                  </div>
                  <div className="text-xs font-mono font-black text-slate-900 mt-1.5">
                    {booking.departureTime} hrs, {booking.departureDate}
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center">
                  <div className="text-[10px] text-slate-500 font-semibold">Travel Time ~2h 15m</div>
                  <div className="w-full flex items-center justify-center my-1.5">
                    <div className="h-[2px] bg-slate-400 w-20 relative">
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 border-t-2 border-r-2 border-slate-600 rotate-45" />
                    </div>
                  </div>
                  <div className="text-[9px] font-black text-emerald-700 uppercase tracking-wider">
                    Non-Stop Flight
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-base font-black text-slate-900">{booking.toCity || 'Mumbai'}</div>
                  <div className="text-[10px] text-slate-500 font-medium leading-tight">
                    {booking.to} - {booking.toCity || 'Chhatrapati Shivaji'} Airport (Terminal 2)
                  </div>
                  <div className="text-xs font-mono font-black text-slate-900 mt-1.5">
                    {booking.arrivalTime} hrs, {booking.departureDate}
                  </div>
                </div>
              </div>
            </div>

            <div className="text-[9px] text-slate-400 italic pt-1 border-t border-slate-100">
              *Booking date reflects in UTC (Coordinated Universal Time), all other flight timings are as per local airport time.
            </div>
          </div>

          {/* Baggage Information Box */}
          <div className="border border-slate-700 rounded-lg p-3 space-y-2 bg-white">
            <div className="text-xs font-black uppercase tracking-wide text-slate-900">
              Baggage Information
            </div>

            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-300 text-slate-500 text-[10px] uppercase font-bold">
                  <th className="py-1 w-12">S.No</th>
                  <th className="py-1 w-28">Sector</th>
                  <th className="py-1">Adult / Child Baggage Allowance</th>
                </tr>
              </thead>
              <tbody className="text-slate-800 text-xs divide-y divide-slate-100">
                <tr>
                  <td className="py-1.5 font-mono text-slate-500">1</td>
                  <td className="py-1.5 font-bold font-mono">{booking.from} - {booking.to}</td>
                  <td className="py-1.5 font-bold text-slate-900">
                    Check-in: 15KG (1 piece only) • Cabin: Up to 7KG (1 bag + personal item)
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="text-[9px] text-slate-600 space-y-1 pt-1.5 border-t border-slate-100 leading-normal">
              <p>• <strong>Cabin Baggage:</strong> One handbag up to 7 KG and 115 CM (L+W+H) shall be allowed per customer to place in overhead bin or under seat.</p>
              <p>• <strong>Check-in Baggage:</strong> Free checked-in baggage allowance is 15 kg per person. Any baggage presented at the airport exceeding weight limit will be subject to standard airport baggage tariff.</p>
              <p>• <strong>Lithium Batteries & Power Banks:</strong> Due to DGCA safety rules, power banks and spare lithium batteries must be carried in hand baggage only and are prohibited in check-in luggage.</p>
            </div>
          </div>

          {/* Side-by-Side: Flight Summary (Fare Breakup) & Contact Details */}
          <div className="grid grid-cols-2 gap-3">
            {/* Box A: Flight Summary */}
            <div className="border border-slate-700 rounded-lg overflow-hidden bg-white">
              <div className="bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-900 border-b border-slate-700">
                Flight Summary
              </div>
              <div className="p-2.5 space-y-1 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>AirFare Charge</span>
                  <span className="font-mono font-medium">₹{basePrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Seat Fee</span>
                  <span className="font-mono">₹{fare.seatCost ? fare.seatCost.toLocaleString('en-IN') : '0'}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Fuel Charge & Security Fee</span>
                  <span className="font-mono">₹{Math.round(taxes * 0.45).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>User Development Fee (UDF)</span>
                  <span className="font-mono">₹{Math.round(taxes * 0.35).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>GST for State</span>
                  <span className="font-mono">₹{Math.round(taxes * 0.20).toLocaleString('en-IN')}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Promo Discount ({fare.promoCode || 'SPECIAL'})</span>
                    <span className="font-mono">-₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="pt-1.5 mt-1 border-t-2 border-slate-800 flex justify-between items-center font-black text-xs text-slate-900">
                  <span>Total Fare</span>
                  <span className="font-mono text-sm">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Box B: Contact Details */}
            <div className="border border-slate-700 rounded-lg overflow-hidden bg-white flex flex-col justify-between">
              <div>
                <div className="bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-900 border-b border-slate-700">
                  Contact Details
                </div>
                <div className="p-2.5 space-y-2 text-xs text-slate-700">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-semibold">Mobile Number</span>
                    <span className="font-mono font-bold text-slate-900">+91 {contactPhone}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-semibold">Email Address</span>
                    <span className="font-mono font-bold text-slate-900">{contactEmail}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-semibold">Booking ID</span>
                    <span className="font-mono font-bold text-sky-800">{booking.bookingId || booking.pnr}</span>
                  </div>
                </div>
              </div>

              <div className="p-2 bg-slate-50 border-t border-slate-200 text-[9px] text-slate-500 font-medium">
                Issued via AirSkyGo OTA Booking Service • Verified DGCA Schedule.
              </div>
            </div>
          </div>

          {/* Important Travel Advisory & Conditions */}
          <div className="border-t border-slate-300 pt-2 text-[8.5px] text-slate-500 space-y-0.5 leading-relaxed">
            <p><strong>Note & Guidelines:</strong></p>
            <p>1. <strong>Photo ID:</strong> A valid original photo ID (Aadhaar, Passport, Voter ID, Driving License) is compulsory for all passengers for airport entry and boarding.</p>
            <p>2. <strong>Reporting Time:</strong> Domestic check-in counters and baggage drop desks close strictly 60 minutes prior to scheduled departure. Boarding gates close 25 minutes prior.</p>
            <p>3. <strong>Dangerous Goods:</strong> Flammable liquids, compressed gases, corrosive materials, and weapons are strictly prohibited in all airline baggage under DGCA regulations.</p>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. ON-SCREEN MODERN CONFIRMATION MODAL                   */}
      {/* ======================================================== */}
      <motion.div
        id="screen-confirmation-card"
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
          <div ref={modalTicketRef} className="bg-white rounded-2xl p-4 sm:p-6 space-y-4 border border-slate-200/80 shadow-xs">

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
                <div className="text-left flex-1 min-w-0">
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">{booking.from}</div>
                  <div className="text-[10px] sm:text-xs text-slate-500 mt-0.5 line-clamp-2">
                    {booking.fromCity || `${booking.from} Airport`}
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center px-2 shrink-0">
                  <ArrowRight className="w-4 h-4 text-amber-500" />
                  <span className="text-[10px] text-slate-400 mt-0.5 font-medium">Non-stop</span>
                </div>

                <div className="text-right flex-1 min-w-0">
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">{booking.to}</div>
                  <div className="text-[10px] sm:text-xs text-slate-500 mt-0.5 line-clamp-2">
                    {booking.toCity || `${booking.to} Airport`}
                  </div>
                </div>
              </div>

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
                    {passengersList.map((p, idx) => (
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
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download Official Ticket (PDF)</span>
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

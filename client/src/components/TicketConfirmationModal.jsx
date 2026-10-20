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

  // Generate authentic IndiGo-style official 6-page PDF
  const handleDownloadPDF = async () => {
    if (isGeneratingPDF) return;
    setIsGeneratingPDF(true);
    try {
      const pageElements = document.querySelectorAll('.indigo-pdf-page');
      if (!pageElements || pageElements.length === 0) {
        window.print();
        return;
      }

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      for (let i = 0; i < pageElements.length; i++) {
        if (i > 0) pdf.addPage('a4', 'portrait');
        const el = pageElements[i];
        const canvas = await html2canvas(el, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
          windowWidth: 794
        });
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
      }

      const cleanPnr = (booking.pnr || booking.bookingId || 'CONFIRMED').toUpperCase();
      pdf.save(`IndiGo-Itinerary-${cleanPnr}.pdf`);
    } catch (err) {
      console.error('Error generating official IndiGo PDF:', err);
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
  const cleanPnr = (booking.pnr || booking.bookingId || 'Y9WUNS').toUpperCase();
  const bookingDateStr = booking.createdAt 
    ? `${new Date(booking.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} ${new Date(booking.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })}`
    : '20 Oct 2026 16:39';

  const fromCode = booking.from || 'DEL';
  const toCode = booking.to || 'BOM';
  const fromCityName = booking.fromCity || (booking.from ? `${booking.from} Airport` : 'Delhi Airport');
  const toCityName = booking.toCity || (booking.to ? `${booking.to} Airport` : 'Mumbai Airport');
  const airline = booking.airline || 'IndiGo';
  const flightNo = booking.flightNumber || '6E 955';
  const depTime = booking.departureTime || '20:20';
  const arrTime = booking.arrivalTime || '22:20';
  const depDate = booking.departureDate || new Date().toISOString().split('T')[0];

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
      {/* 1. OFF-SCREEN INDIGO OFFICIAL 6-PAGE ITINERARY FOR PDF   */}
      {/* ======================================================== */}
      <div
        style={{
          position: 'absolute',
          left: '-9999px',
          top: 0,
          width: '794px',
          background: '#ffffff',
          color: '#111827',
          fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
        }}
      >
        {/* PAGE 1: Itinerary, Passenger Info & Flight Segment with Barcode */}
        <div
          className="indigo-pdf-page"
          style={{
            width: '794px',
            height: '1123px',
            padding: '34px 44px',
            boxSizing: 'border-box',
            position: 'relative',
            backgroundColor: '#ffffff'
          }}
        >
          {/* Top metadata */}
          <div className="flex justify-between items-center text-[10.5px] text-slate-800 pb-1">
            <span>{new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })}, {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
            <span>Itinerary</span>
          </div>

          {/* IndiGo Logo + Date */}
          <div className="flex justify-between items-center pb-3">
            <div className="flex items-center gap-1.5">
              <span className="text-[34px] font-black text-[#001B94] tracking-tight">IndiGo</span>
              <svg className="w-8 h-5 text-[#001B94]" viewBox="0 0 24 16" fill="currentColor">
                <circle cx="2" cy="8" r="1.3" />
                <circle cx="5" cy="8" r="1.3" />
                <circle cx="8" cy="8" r="1.3" />
                <circle cx="11" cy="8" r="1.3" />
                <circle cx="14" cy="8" r="1.3" />
                <path d="M14 8 L22 3 L20 8 L22 13 Z" />
              </svg>
            </div>
            <div className="text-xs font-bold text-slate-900">
              *Date of booking {bookingDateStr}
            </div>
          </div>

          {/* Dotted border line: PNR & Payment Status */}
          <div className="py-2 border-y border-dotted border-slate-900 flex justify-between items-center text-xs text-slate-900 font-medium">
            <div>
              <span className="font-bold">PNR/Booking Reference </span>
              <span className="font-black text-sm ml-6 tracking-wider">{cleanPnr}</span>
            </div>
            <div>
              <span className="font-bold">Payment Status </span>
              <span className="font-bold ml-6">
                {(booking.payment?.status || booking.status) === 'CONFIRMED' ? 'Confirmed' : 'Pending'}
              </span>
            </div>
          </div>

          {/* Passenger Information */}
          <h3 className="text-base font-black text-slate-900 mt-4 mb-2">
            Passenger Information
          </h3>

          <div className="border border-slate-900 rounded-xl p-3.5 mb-4">
            <div className="text-sm font-black text-slate-900 mb-2">
              {passengersList[0]?.title || 'Mr'} {passengersList[0]?.firstName || 'Ashu'} {passengersList[0]?.lastName || 'Sharma'} <span className="font-normal text-slate-700 text-xs ml-1">{passengersList[0]?.type || 'Adult'} | {passengersList[0]?.gender || 'Male'} |</span>
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left font-black text-slate-900">
                  <th className="pb-1 w-1/3">Sector</th>
                  <th className="pb-1 w-1/3">Seat</th>
                  <th className="pb-1 w-1/3">6E Add-ons</th>
                </tr>
              </thead>
              <tbody className="text-slate-800 text-xs font-medium">
                <tr>
                  <td>{booking.from || 'DEL'}-{booking.to || 'NMI'}</td>
                  <td>{passengersList[0]?.seat || '7B'}(Middle)</td>
                  <td>Lite</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Flight Card with Barcode */}
          <div className="border border-slate-900 rounded-xl p-4 mb-3">
            <div className="flex justify-between items-center text-xs pb-3 border-b border-slate-200">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 text-[11px]">
                <svg className="w-3.5 h-3.5 text-slate-700 rotate-45" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                </svg>
                <span>• {booking.flightNumber || '6E 955'} ({booking.aircraft || 'A320'}) • {booking.departureDate || '21 Oct 2026'} • Check-in/Bag Drop Closes: 60 mins before departure</span>
              </div>
              <div className="text-[#0284c7] font-medium text-[11px] bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                Lite | {booking.travelClass || 'Economy'}
              </div>
            </div>

            {/* Authentic High-Density Boarding Barcode */}
            <div className="my-3 py-1 bg-white flex items-center justify-center">
              <svg className="w-full h-16" viewBox="0 0 650 70" preserveAspectRatio="none">
                <rect x="0" y="0" width="8" height="70" fill="#000" />
                <rect x="12" y="0" width="4" height="70" fill="#000" />
                <rect x="20" y="0" width="6" height="70" fill="#000" />
                {Array.from({ length: 90 }).map((_, idx) => {
                  const isBlack = (idx * 19 + cleanPnr.charCodeAt(idx % cleanPnr.length)) % 3 !== 0;
                  const w = idx % 7 === 0 ? 6 : idx % 3 === 0 ? 3.5 : 2;
                  return isBlack ? (
                    <rect key={idx} x={30 + idx * 6.5} y={0} width={w} height={70} fill="#000" />
                  ) : null;
                })}
                <rect x="620" y="0" width="6" height="70" fill="#000" />
                <rect x="630" y="0" width="4" height="70" fill="#000" />
                <rect x="640" y="0" width="8" height="70" fill="#000" />
              </svg>
            </div>

            {/* Flight Route Details */}
            <div className="grid grid-cols-12 gap-2 items-center pt-2 text-slate-900">
              <div className="col-span-5">
                <div className="text-lg font-black">{booking.fromCity || 'Delhi'}</div>
                <div className="text-xs text-slate-700 leading-tight">{booking.from || 'DEL'} - {booking.fromAirport || 'Indira Gandhi International Airport'}</div>
                <div className="text-xs text-slate-600">(Terminal 1)</div>
                <div className="text-sm font-black mt-2">{booking.departureTime || '20:20'} hrs, {booking.departureDate || '21 Oct 2026'}</div>
              </div>
              <div className="col-span-2 text-center text-xs text-slate-700 font-medium">
                <div>—— Travel Time ~2h 0m ——</div>
              </div>
              <div className="col-span-5 text-right">
                <div className="text-lg font-black">{booking.toCity || 'Navi Mumbai'}</div>
                <div className="text-xs text-slate-700 leading-tight">{booking.to || 'NMI'} - {booking.toAirport || 'Navi Mumbai Airport'}</div>
                <div className="text-xs text-slate-600">&nbsp;</div>
                <div className="text-sm font-black mt-2">{booking.arrivalTime || '22:20'} hrs, {booking.departureDate || '21 Oct 2026'}</div>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-600 italic mb-8">
            *Booking date reflects in UTC (Coordinated Universal Time), all other timings mentioned are as per local TIME
          </div>

          {/* Page 1 Footer */}
          <div className="absolute bottom-5 left-11 right-11 flex justify-between items-center text-[9.5px] text-slate-500 font-mono border-t border-slate-200 pt-1.5">
            <span className="truncate max-w-[580px]">
              https://www.goindigo.in/book/itinerary.html?order_id=JFTWEE9C{cleanPnr}&payment_status=INPROCESS&isBookingFlow=1
            </span>
            <span>1/6</span>
          </div>
        </div>

        {/* PAGE 2: Baggage Information, Fare Summary & Contact Details */}
        <div
          className="indigo-pdf-page"
          style={{
            width: '794px',
            height: '1123px',
            padding: '34px 44px',
            boxSizing: 'border-box',
            position: 'relative',
            backgroundColor: '#ffffff'
          }}
        >
          {/* Top metadata */}
          <div className="flex justify-between items-center text-[10.5px] text-slate-800 pb-1">
            <span>{new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })}, {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
            <span>Itinerary</span>
          </div>

          {/* IndiGo Logo + Date */}
          <div className="flex justify-between items-center pb-3">
            <div className="flex items-center gap-1.5">
              <span className="text-[34px] font-black text-[#001B94] tracking-tight">IndiGo</span>
              <svg className="w-8 h-5 text-[#001B94]" viewBox="0 0 24 16" fill="currentColor">
                <circle cx="2" cy="8" r="1.3" />
                <circle cx="5" cy="8" r="1.3" />
                <circle cx="8" cy="8" r="1.3" />
                <circle cx="11" cy="8" r="1.3" />
                <circle cx="14" cy="8" r="1.3" />
                <path d="M14 8 L22 3 L20 8 L22 13 Z" />
              </svg>
            </div>
            <div className="text-xs font-bold text-slate-900">
              *Date of booking {bookingDateStr}
            </div>
          </div>

          {/* Baggage Information Box */}
          <div className="border border-slate-900 rounded-xl p-3.5 mb-4">
            <h4 className="text-sm font-black text-slate-900 mb-2">Baggage Information</h4>
            <table className="w-full text-xs mb-3">
              <thead>
                <tr className="text-left font-bold text-slate-900">
                  <th className="pb-1 w-16">S.No</th>
                  <th className="pb-1 w-36">Sector</th>
                  <th className="pb-1">Adult</th>
                </tr>
              </thead>
              <tbody className="text-slate-800 text-xs">
                <tr>
                  <td>1</td>
                  <td>{booking.from || 'DEL'} - {booking.to || 'NMI'}</td>
                  <td>Check-in: 0KG, Cabin: Up to 7KG</td>
                </tr>
              </tbody>
            </table>

            <div className="text-[10px] text-slate-700 space-y-2 leading-relaxed">
              <p><strong>Check-in Cabin:</strong> One hand bag up to 7 KG and 115 CM (L+W+H), shall be allowed per customer. For contactless travel we recommend to place it under the seat in front, on board.</p>
              <p>• <strong>Disclaimer (for Lite Fare):</strong> Lite Fare includes 7 kg cabin baggage only (to be placed preferably under the seat) with no check-in bag allowed. If your cabin bag does not fit within the permitted size or exceeds the weight limit, it will be refused at the boarding gate or placed in the aircraft hold subject to a fee.</p>
              <p>• <strong>Check-in Baggage:</strong> Lite Fare does not include a check-in bag. Any check-in bag presented at the airport/boarding gate will be subject to charges as per the applicable Lite Fare baggage policy. Passengers may purchase check-in baggage separately after booking, via Manage Booking, web check-in, or at the airport at applicable rates.</p>
              <p>• <strong>Cabin Baggage:</strong> Only one cabin bag up to 7 kg is permitted per customer, subject to regulatory size and weight limits.</p>
            </div>
          </div>

          {/* Flight Summary & Contact Details (Side by Side) */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Left: Flight summary */}
            <div className="border border-slate-900 rounded-xl overflow-hidden">
              <div className="bg-slate-50 px-3.5 py-1.5 font-black text-xs text-slate-900 border-b border-slate-300">
                Flight summary
              </div>
              <div className="p-3 text-xs space-y-1.5 text-slate-800">
                <div className="flex justify-between"><span>AirFare Charge</span><span>₹{basePrice.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between"><span>Seat fee</span><span>₹{fare.seatCost ? Number(fare.seatCost).toLocaleString('en-IN') : '578'}</span></div>
                <div className="flex justify-between"><span>Fuel Charge</span><span>₹900</span></div>
                <div className="flex justify-between"><span>Aviation Security Fee</span><span>₹236</span></div>
                <div className="flex justify-between"><span>User Development fee</span><span>₹152</span></div>
                <div className="flex justify-between"><span>Arrival User Development Fee</span><span>₹319</span></div>
                <div className="flex justify-between"><span>GST for Delhi</span><span>₹270</span></div>
                <div className="pt-2 mt-2 border-t border-slate-900 flex justify-between font-black text-sm text-slate-900">
                  <span>Total fare</span>
                  <span>₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Right: Contact Details */}
            <div className="border border-slate-900 rounded-xl overflow-hidden flex flex-col justify-between">
              <div>
                <div className="bg-slate-50 px-3.5 py-1.5 font-black text-xs text-slate-900 border-b border-slate-300">
                  Contact Details
                </div>
                <div className="p-3 text-xs space-y-2 text-slate-800">
                  <div>
                    <span className="font-semibold text-slate-600 block">Number:</span>
                    <span className="font-mono font-bold">+91-{contactPhone}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-600 block">E - mail:</span>
                    <span className="font-mono font-bold">{contactEmail}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Note section */}
          <div className="text-[10px] text-slate-700 leading-relaxed space-y-1">
            <div className="font-black text-slate-900">Note</div>
            <p>1. Foreigners intending to visit protected/restricted areas in the states of Arunachal Pradesh, Himachal Pradesh, Jammu & Kashmir, Meghalaya, Mizoram, Nagaland, Rajasthan, Sikkim, Uttarakhand and Andaman & Nicobar Islands must be in possession Protected Area Permit (PAP)/Restricted Area Permit (RAP). To apply please visit e-FRRO Home</p>
          </div>

          {/* Page 2 Footer */}
          <div className="absolute bottom-5 left-11 right-11 flex justify-between items-center text-[9.5px] text-slate-500 font-mono border-t border-slate-200 pt-1.5">
            <span className="truncate max-w-[580px]">
              https://www.goindigo.in/book/itinerary.html?order_id=JFTWEE9C{cleanPnr}&payment_status=INPROCESS&isBookingFlow=1
            </span>
            <span>2/6</span>
          </div>
        </div>

        {/* PAGE 3: Terms & Conditions, Carriage, Free Checked Baggage, Visa Rules */}
        <div
          className="indigo-pdf-page"
          style={{
            width: '794px',
            height: '1123px',
            padding: '34px 44px',
            boxSizing: 'border-box',
            position: 'relative',
            backgroundColor: '#ffffff'
          }}
        >
          {/* Top metadata */}
          <div className="flex justify-between items-center text-[10.5px] text-slate-800 pb-1">
            <span>{new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })}, {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
            <span>Itinerary</span>
          </div>

          {/* IndiGo Logo + Date */}
          <div className="flex justify-between items-center pb-3">
            <div className="flex items-center gap-1.5">
              <span className="text-[34px] font-black text-[#001B94] tracking-tight">IndiGo</span>
              <svg className="w-8 h-5 text-[#001B94]" viewBox="0 0 24 16" fill="currentColor">
                <circle cx="2" cy="8" r="1.3" />
                <circle cx="5" cy="8" r="1.3" />
                <circle cx="8" cy="8" r="1.3" />
                <circle cx="11" cy="8" r="1.3" />
                <circle cx="14" cy="8" r="1.3" />
                <path d="M14 8 L22 3 L20 8 L22 13 Z" />
              </svg>
            </div>
            <div className="text-xs font-bold text-slate-900">
              *Date of booking {bookingDateStr}
            </div>
          </div>

          <div className="text-[10px] text-slate-800 space-y-2 leading-relaxed">
            <p>2. Goods and Services Tax (GST) shall be levied at applicable rates on all air transportation services provided by IndiGo, except in cases specifically exempted under law.</p>
            <p>3. This is not a GST invoice. For GST details, please refer the GST invoice which shall be sent to the email address in the name of the First passenger, mentioned in this itinerary. In case of a booking made by a GSTIN holder, the GST invoice shall be sent in the name of the GSTIN holder to the email address mentioned while providing the GSTIN information at the time of reservation.</p>
            <p>4. Additionally, passengers may download the GST invoice using their PNR number on the IndiGo website www.goindigo.in.</p>
            <p>5. GST shall also be applicable on any special services requested by the passenger at applicable rates.</p>
            <p>6. Tax Invoices shall be only in INR, even in cases where the payment is made in a currency other than INR.</p>
            <p>7. Airfare Charges include Base Fare and CUTE Charge.</p>
            <p>8. PSF/ASF/UDF/ADF are collected on behalf of the Airport Authority of India (AAI)/Other Airport Operators. In case of no-show, you can claim the taxes on www.goindigo.in.</p>
            <p>9. To know more about DGCA regulations and policies to ensure a seamless and compliant travel experience. Click here</p>
            <p>10. All Indian and foreign citizens traveling to Nagaland (except citizen of Nagaland) are required to obtain a mandatory Inner Line Permit (ILP) to enter the state. Apply here.</p>

            <div className="pt-2 font-black text-slate-900 text-xs">Terms & Conditions</div>
            <p>To see our Condition of Carriage please visit: https://www.goindigo.in/information/conditions-of-carriage.html</p>

            <div className="pt-1 font-black text-slate-900 text-xs">Must Read:</div>
            <p>Refer Section-3, Series M Part IV of the Civil Aviation Requirements for information on facilities in cases of denied boarding, cancellations, and delays. Details at DGCA website: Home | Directorate General of Civil Aviation | Government of India (dgca.gov.in)</p>

            <p><strong>Free Checked In Baggage Allowance</strong> is 15kg per person, one piece only (Domestic) / 30 kg (International, excluding Singapore to/from Tiruchirappalli & Chennai which is 30Kg). Free checked in baggage allowance for travel to Jeddah is 25 kg and from Jeddah is 25 kg + 5L Zamzam water. For travel to and from Abu Dhabi, Colombo, Doha, Dubai, Hong Kong, Istanbul, Kuwait, Muscat, Riyadh, Sharjah and Yangon the checked in baggage allowance is up to 30 kg per adult and child. This allowance does not apply to Infants. International passengers, please note that carrying satellite mobile phones into India is prohibited.</p>
            <p>To help ensure a smooth journey, review our baggage guidelines before you travel. As allowances may vary by flight, the most accurate and updated details are available in your booking confirmation and on your ticket.</p>
            <p>For Infants valid birth certificate is required.</p>

            <p><strong>Passengers without valid visa</strong> to the arrival destination will not be permitted to board unless visa on arrival is permitted or visa is not required for such passengers as per the laws of the arrival destination. In case of international travel, nationality of passengers will be verified at the check-in counters at the airport. In the event, the information regarding nationality of passengers provided during purchase of tickets is found to be incorrect, certain additional fees/taxes may be required to be paid upfront at the check-in counter.</p>
          </div>

          {/* Page 3 Footer */}
          <div className="absolute bottom-5 left-11 right-11 flex justify-between items-center text-[9.5px] text-slate-500 font-mono border-t border-slate-200 pt-1.5">
            <span className="truncate max-w-[580px]">
              https://www.goindigo.in/book/itinerary.html?order_id=JFTWEE9C{cleanPnr}&payment_status=INPROCESS&isBookingFlow=1
            </span>
            <span>3/6</span>
          </div>
        </div>

        {/* PAGE 4: Power Bank Restrictions, Fog Advisory, General Guidelines */}
        <div
          className="indigo-pdf-page"
          style={{
            width: '794px',
            height: '1123px',
            padding: '34px 44px',
            boxSizing: 'border-box',
            position: 'relative',
            backgroundColor: '#ffffff'
          }}
        >
          {/* Top metadata */}
          <div className="flex justify-between items-center text-[10.5px] text-slate-800 pb-1">
            <span>{new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })}, {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
            <span>Itinerary</span>
          </div>

          {/* IndiGo Logo + Date */}
          <div className="flex justify-between items-center pb-3">
            <div className="flex items-center gap-1.5">
              <span className="text-[34px] font-black text-[#001B94] tracking-tight">IndiGo</span>
              <svg className="w-8 h-5 text-[#001B94]" viewBox="0 0 24 16" fill="currentColor">
                <circle cx="2" cy="8" r="1.3" />
                <circle cx="5" cy="8" r="1.3" />
                <circle cx="8" cy="8" r="1.3" />
                <circle cx="11" cy="8" r="1.3" />
                <circle cx="14" cy="8" r="1.3" />
                <path d="M14 8 L22 3 L20 8 L22 13 Z" />
              </svg>
            </div>
            <div className="text-xs font-bold text-slate-900">
              *Date of booking {bookingDateStr}
            </div>
          </div>

          <div className="text-[10px] text-slate-800 space-y-2 leading-relaxed">
            <div className="font-black text-slate-900 text-xs">Guidelines for Power Banks & Spare Lithium Batteries:</div>
            <p>Due to potential fire risk, the following restrictions apply:</p>
            <p>• Must be carried in hand baggage only and kept within reach<br/>• Must not be used, charged, or recharged during the flight<br/>• Maximum of two (2) devices per passenger<br/>• Each device must not exceed 160 Wh</p>

            <div className="pt-1 font-black text-slate-900 text-xs">Fog Advisory</div>
            <p>Customer satisfaction and hassle free travel are of utmost importance to us. At times, there are circumstances, which are beyond our control like weather related phenomena of fog. This unexpected phenomenon may cause inconvenience to you due to flight delays, rescheduling and cancellations.</p>
            <p>We appreciate your patience and request for your kind cooperation in these times. We will endeavour to give you proactive information through text messages or emails. However, we would urge you to call our Call Centre or check updates on your flight at 9910383838.</p>
            <p>Alternatively, to know flight status you can:<br/>- Download mobile app.<br/>- Visit website – www.goindigo.in<br/>- Tweet us @IndiGo6E, follow us on Facebook.<br/>- Send SMS, ST[space]flight number[space]departure date of flight as DDMM. For example: to know the status for 6E-333 for 11th February send &quot;ST 333 1102&quot; to 566772.<br/>- Live chat on website.</p>

            <div className="pt-1 font-black text-slate-900 text-xs">General:</div>
            <p>Check-in at www.goIndiGo.in is available. This service is not available for international travel and customers with infants or groups.</p>
            <p>Changes/cancellations are permitted more than three (3) hours prior to scheduled departure and (four (4) hours for international sectors) with payment of change/cancellation fee and difference in fare if applicable.</p>
            <p>A security search is compulsory.</p>
            <p>A valid photo id, in original, is required for each person travelling. For foreign nationals, only passport, in original, will be considered as a valid photo id. For detailed terms and conditions, log on to www.goIndiGo.in</p>
            <p>Check Your Flight Timings: To know the flight status on the day of departure, contact our 24 X 7 call centre or logon to our website or mobile app (available on iPhone, Windows, Android and Blackberry), or send an sms to 566772.</p>
            <p>Indian Nationals travelling to and from Kathmandu are required to carry either Passport or Voter’s Id Card only as their valid photo Id, no other photo Id will be considered as valid.</p>
            <p>Airfare Charges include Base Fare, Fuel Charge, CUTE Charge and Agency Commission payable to travel agents (if applicable).</p>
            <p>Passengers going to UAE/ Oman from India on tourist/ employment visas require an &apos;OK TO BOARD&apos; comment in their PNR. Please check with your visa issuing agency.</p>
            <p>Name changes are not permitted on your booking.</p>
          </div>

          {/* Page 4 Footer */}
          <div className="absolute bottom-5 left-11 right-11 flex justify-between items-center text-[9.5px] text-slate-500 font-mono border-t border-slate-200 pt-1.5">
            <span className="truncate max-w-[580px]">
              https://www.goindigo.in/book/itinerary.html?order_id=JFTWEE9C{cleanPnr}&payment_status=INPROCESS&isBookingFlow=1
            </span>
            <span>4/6</span>
          </div>
        </div>

        {/* PAGE 5: Food & Beverage, MacBook Battery Warning, Terminal Info, Delays */}
        <div
          className="indigo-pdf-page"
          style={{
            width: '794px',
            height: '1123px',
            padding: '34px 44px',
            boxSizing: 'border-box',
            position: 'relative',
            backgroundColor: '#ffffff'
          }}
        >
          {/* Top metadata */}
          <div className="flex justify-between items-center text-[10.5px] text-slate-800 pb-1">
            <span>{new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })}, {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
            <span>Itinerary</span>
          </div>

          {/* IndiGo Logo + Date */}
          <div className="flex justify-between items-center pb-3">
            <div className="flex items-center gap-1.5">
              <span className="text-[34px] font-black text-[#001B94] tracking-tight">IndiGo</span>
              <svg className="w-8 h-5 text-[#001B94]" viewBox="0 0 24 16" fill="currentColor">
                <circle cx="2" cy="8" r="1.3" />
                <circle cx="5" cy="8" r="1.3" />
                <circle cx="8" cy="8" r="1.3" />
                <circle cx="11" cy="8" r="1.3" />
                <circle cx="14" cy="8" r="1.3" />
                <path d="M14 8 L22 3 L20 8 L22 13 Z" />
              </svg>
            </div>
            <div className="text-xs font-bold text-slate-900">
              *Date of booking {bookingDateStr}
            </div>
          </div>

          <div className="text-[10px] text-slate-800 space-y-2 leading-relaxed">
            <p>Hot and cold food and beverages as shown in the Food and Beverage Menu may be purchased on board, subject to their availability. For ATRs and flights below 60 minutes flying time hot food or beverages will not be offered. On select flights below 30 minutes flying time only limited snacks (cookies and nuts) and water will be offered.</p>
            <p>LED / LCD TVs of more than 99.06 cm in size will be charged. Refer to www.goIndiGo.in.</p>
            <p>This booking is governed by IndiGo&apos;s fare rules and Conditions of Carriage that are available from Airport Counters, IndiGo Shops or www.goIndiGo.in</p>
            <p>Flight schedules are subject to change and approval by authorities.</p>
            <p>IndiGo reserves the right to deny boarding if credit card information is not supplied at check-in.</p>
            <p>Hot Food and Beverages shall not be served on short sector flights.</p>
            <p>Damaged, defective or recalled lithium batteries are prohibited from carriage by air. Customers are advised not to carry older generation Apple MacBook Pro laptops with 15 inch screen, purchased between September 2015 and February 2017 in hand baggage as well as in check-in baggage. In case the battery of such laptop is replaced, kindly carry the receipt of replacement provided by Apple, in absence of which carriage of such laptop shall be prohibited. For more information please visit Apple Support website.</p>

            <div className="pt-1 font-black text-slate-900 text-xs">Terminal Information</div>
            <p>International Terminal Information: For international flights, IndiGo will operate from the following terminals airports: New Delhi - Terminal 3, IGIA; Mumbai- International Terminal, CSIA; Dubai- Terminal 1, Dubai International Airport; Bangkok- Suvarnabhumi Airport; Singapore- Terminal 2, Changi Airport; Kathmandu- Tribhuvan International Airport; Muscat- Muscat International Airport. Chennai- International Terminal, Chennai International Airport; Hyderabad- International Terminal, RGIA; Kolkata- Terminal II, Kolkata International Airport; Kochi- International Terminal, Kochi International Airport and Thiruvananthapuram- International Terminal, Thiruvananthapuram.</p>
            <p>IndiGo flights from Delhi to Singapore will depart from Terminal 3. In case a passenger is arriving into Delhi from a country other than India and is further booked on domestic flights departing from Terminal 1 or 2, he/she must make their own visa arrangements for transit to other airport terminals in Delhi. (i.e. from Terminal 3 to Terminal 1D or Terminal 2).</p>
            <p>Domestic Terminal Information: Thiruvananthapuram - Effective 01 st Mar 2016, IndiGo operations for flight no. 6E-103 (Pune/Bengaluru to Thiruvananthapuram) and 6E-408 (Thiruvananthapuram to Bengaluru/Pune) will be carried out of the International Terminal (TB-2), Chakkai, Thiruvananthapuram -695024. Chandigarh - New Civil Air Terminal.</p>

            <div className="pt-1 font-black text-slate-900 text-xs">Flight Delay or Cancellation</div>
            <p>• At any time after a Booking has been made, we may change our schedules and/or cancel, terminate, divert, postpone, reschedule or delay any flight where we reasonably consider this to be justified by circumstances beyond our control, or for reasons of safety, or for commercial reasons. Circumstances beyond IndiGo&apos;s control can include, without limitation, weather, air traffic control, mechanical failures, acts of terrorism, acts of nature, force majeure, strikes, riots, wars, hostilities, disturbances, governmental regulations, orders.</p>
          </div>

          {/* Page 5 Footer */}
          <div className="absolute bottom-5 left-11 right-11 flex justify-between items-center text-[9.5px] text-slate-500 font-mono border-t border-slate-200 pt-1.5">
            <span className="truncate max-w-[580px]">
              https://www.goindigo.in/book/itinerary.html?order_id=JFTWEE9C{cleanPnr}&payment_status=INPROCESS&isBookingFlow=1
            </span>
            <span>5/6</span>
          </div>
        </div>

        {/* PAGE 6: Delay Compensation & Official Dangerous Goods Graphical Chart */}
        <div
          className="indigo-pdf-page"
          style={{
            width: '794px',
            height: '1123px',
            padding: '34px 44px',
            boxSizing: 'border-box',
            position: 'relative',
            backgroundColor: '#ffffff'
          }}
        >
          {/* Top metadata */}
          <div className="flex justify-between items-center text-[10.5px] text-slate-800 pb-1">
            <span>{new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })}, {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
            <span>Itinerary</span>
          </div>

          {/* IndiGo Logo + Date */}
          <div className="flex justify-between items-center pb-3">
            <div className="flex items-center gap-1.5">
              <span className="text-[34px] font-black text-[#001B94] tracking-tight">IndiGo</span>
              <svg className="w-8 h-5 text-[#001B94]" viewBox="0 0 24 16" fill="currentColor">
                <circle cx="2" cy="8" r="1.3" />
                <circle cx="5" cy="8" r="1.3" />
                <circle cx="8" cy="8" r="1.3" />
                <circle cx="11" cy="8" r="1.3" />
                <circle cx="14" cy="8" r="1.3" />
                <path d="M14 8 L22 3 L20 8 L22 13 Z" />
              </svg>
            </div>
            <div className="text-xs font-bold text-slate-900">
              *Date of booking {bookingDateStr}
            </div>
          </div>

          <div className="text-[10px] text-slate-800 space-y-2 leading-relaxed mb-4">
            <p>demands or requirements, shortages of critical manpower, parts or materials, labour unrest etc. If an IndiGo flight is cancelled, rescheduled or delayed for more than two hours (depending on the length of the journey), a Customer shall have the right to choose a refund; or a credit for future travel on IndiGo; or re-booking onto an alternative IndiGo flight at no additional cost (subject to availability); subject to the requirements under the local laws of the country in which the flight has been cancelled, rescheduled or delayed.</p>
            <p>• In the special case where a subsequent portion of an IndiGo flight is cancelled while a Customer is already in transit, such a Customer shall have the right to choose to remain at the transit station and to be re-booked onto an alternative IndiGo flight to the final destination at no additional cost subject to availability; or to remain at the transit station and accept a partial refund for the portion of the flight not completed; or to return to the point of origin and receive a refund. Contact our call centre (0) 99 10 38 38 38 or +91 124 6613838 if you have any queries.</p>
            <p>• Online Group fares - Domestic - 100% of the airfare per person per segment will be levied if changed/cancelled at least 3hrs before the scheduled departure. No-show charges will be levied within 3 hrs. Fare difference, change/cancellation fee apply.</p>
            <p>• Online Group fares – International - 100% of airfare per person per segment will be levied if changed/cancelled at least 4hrs before the scheduled departure.</p>
            <p>• Disclaimer: Please note in case of Vande Bharat Flights, 100% of Airline component will be forfeited. Non-Airline taxes will be refunded in full.</p>
          </div>

          {/* Dangerous Goods and Restricted Articles (Official Graphical Box) */}
          <div className="border-2 border-rose-600 rounded-xl p-3.5 relative pt-4">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#d9383a] text-white text-[11px] font-black px-4 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
              <span>🚫 Not allowed!</span>
            </div>

            <div className="text-center mb-2">
              <div className="text-xs font-black text-slate-900">
                Dangerous goods and <span className="text-rose-600">restricted articles</span>
              </div>
              <div className="text-[9px] text-slate-500">
                Please declare dangerous or restricted goods. Carrying them may lead to prosecution.
              </div>
            </div>

            <div className="grid grid-cols-12 gap-2 text-center text-[8.5px] font-semibold text-slate-700">
              {/* Restricted Items (9 cols) */}
              <div className="col-span-9 grid grid-cols-5 gap-2 border-r border-slate-300 pr-2">
                <div className="flex flex-col items-center">
                  <div className="text-xl mb-0.5">🔥</div>
                  <span>Flammable substances</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-xl mb-0.5">💥</div>
                  <span>Explosives</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-xl mb-0.5">☢️</div>
                  <span>Radioactive materials</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-xl mb-0.5">🧪</div>
                  <span>Corrosive substances</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-xl mb-0.5">🛢️</div>
                  <span>Compressed gases</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-xl mb-0.5">🔫</div>
                  <span>Weapons</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-xl mb-0.5">🧴</div>
                  <span>Peroxides & oxidisers</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-xl mb-0.5">☣️</div>
                  <span>Bio-hazard materials</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-xl mb-0.5">🌶️</div>
                  <span>Pepper spray</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-xl mb-0.5">🔥</div>
                  <span>Lighters, matches</span>
                </div>
              </div>

              {/* Hand Baggage Allowed Items (3 cols) */}
              <div className="col-span-3 flex flex-col justify-between pl-1">
                <div className="text-[8.5px] font-bold text-emerald-700 leading-tight">
                  Items allowed only in the<br/><span className="text-emerald-800 font-black">hand baggage</span>
                </div>
                <div className="grid grid-cols-2 gap-1 items-center pt-1">
                  <div className="flex flex-col items-center">
                    <div className="text-xl mb-0.5">🔋</div>
                    <span>Lithium batteries</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="text-xl mb-0.5">⚡</div>
                    <span>Power banks</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Page 6 Footer */}
          <div className="absolute bottom-5 left-11 right-11 flex justify-between items-center text-[9.5px] text-slate-500 font-mono border-t border-slate-200 pt-1.5">
            <span className="truncate max-w-[580px]">
              https://www.goindigo.in/book/itinerary.html?order_id=JFTWEE9C{cleanPnr}&payment_status=INPROCESS&isBookingFlow=1
            </span>
            <span>6/6</span>
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
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">{fromCode}</div>
                  <div className="text-[10px] sm:text-xs text-slate-500 mt-0.5 line-clamp-2">
                    {fromCityName}
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center px-2 shrink-0">
                  <ArrowRight className="w-4 h-4 text-amber-500" />
                  <span className="text-[10px] text-slate-400 mt-0.5 font-medium">Non-stop</span>
                </div>

                <div className="text-right flex-1 min-w-0">
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">{toCode}</div>
                  <div className="text-[10px] sm:text-xs text-slate-500 mt-0.5 line-clamp-2">
                    {toCityName}
                  </div>
                </div>
              </div>

              <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
                <div className="text-left">
                  <span className="font-black text-amber-600">{airline}</span>
                  <span className="text-slate-400 ml-1.5 font-mono font-medium">{flightNo}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 font-medium">{depDate}</span>
                  <span className="font-mono font-bold text-slate-900 ml-2">{depTime} - {arrTime}</span>
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

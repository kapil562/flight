import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, ShieldCheck, CheckCircle2, CreditCard, QrCode, Building, Tag, ArrowRight, ArrowLeft,
  Lock, Sparkles, Plane, Utensils, Luggage, Shield, Smartphone, Copy, Check, ExternalLink, Zap,
  Phone, MessageCircle, FileText, AlertCircle, RefreshCw, UserPlus, Trash2, Armchair, Plus
} from 'lucide-react';
import { api } from '../utils/api';
import AirlineBadge from './AirlineBadge';
import RealAircraftSeatMap from './RealAircraftSeatMap';

export default function BookingCheckoutModal({
  flight,
  currentPrice,
  travelClass,
  selectedSeats = [],
  passengersCount = 1,
  onClose,
  onBookingSuccess,
  brand = null,
  initialCoupon = ''
}) {
  const [step, setStep] = useState(1); // 1 = Travellers & Addons, 2 = Seat Selection per User, 3 = Payment Gateway

  // Passenger data with ability to add multiple users dynamically
  const [passengers, setPassengers] = useState(() => {
    const count = Math.max(1, passengersCount);
    return Array.from({ length: count }).map((_, idx) => ({
      title: 'Mr',
      firstName: '',
      lastName: '',
      type: 'Adult',
      seat: selectedSeats[idx]?.seatNumber || `${12 + idx}${['A', 'B', 'C', 'D', 'E', 'F'][idx % 6]}`,
      seatPrice: selectedSeats[idx]?.price || 0,
      meal: 'No Meal',
      mealPrice: 0
    }));
  });

  // Contact Info
  const [contact, setContact] = useState({
    email: '',
    phone: ''
  });

  // Business GST Info
  const [showGst, setShowGst] = useState(false);
  const [gstDetails, setGstDetails] = useState({
    gstin: '',
    companyName: ''
  });

  // Add-ons
  const [travelInsurance, setTravelInsurance] = useState(true);
  const [extraBaggageKg, setExtraBaggageKg] = useState(0);
  const [flexiFare, setFlexiFare] = useState(false);

  // Seat Selection State
  const [layoutData, setLayoutData] = useState(null);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [activePassengerIndex, setActivePassengerIndex] = useState(0);

  // Coupons / Promo Offers
  const [couponCode, setCouponCode] = useState(initialCoupon || '');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponMsg, setCouponMsg] = useState('');
  const [couponError, setCouponError] = useState('');
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  // Payment method & Admin UPI Settings
  const [paymentSettings, setPaymentSettings] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi', 'card', 'netbanking'
  const [utrNumber, setUtrNumber] = useState('');
  const [copiedVpa, setCopiedVpa] = useState(false);
  const [cardDetails, setCardDetails] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch payment settings, seat layout and coupons on mount
  useEffect(() => {
    api.getPaymentSettings().then(res => {
      if (res.success && res.data) {
        setPaymentSettings(res.data);
      }
    }).catch(() => {});

    api.getCoupons().then(res => {
      if (res.success && Array.isArray(res.data)) {
        setAvailableCoupons(res.data);
      }
    }).catch(() => {});

    const flightId = flight?.id || flight?.flightNumber;
    if (flightId) {
      setLoadingSeats(true);
      api.getFlightSeats(flightId).then(res => {
        if (res.success && res.layout) {
          setLayoutData(res.layout);
        }
      }).catch(err => {
        console.error('Error loading seats:', err);
      }).finally(() => {
        setLoadingSeats(false);
      });
    }
  }, [flight?.id, flight?.flightNumber]);

  // Fare calculations based dynamically on passengers.length
  const currentPaxCount = passengers.length;
  const baseFare = currentPrice * currentPaxCount;
  const totalSeatFee = passengers.reduce((sum, p) => sum + (p.seatPrice || 0), 0);
  const totalMealsFee = passengers.reduce((sum, p) => sum + (p.mealPrice || 0), 0);
  const baggageFee = extraBaggageKg === 5 ? 900 : extraBaggageKg === 10 ? 1700 : extraBaggageKg === 15 ? 2400 : 0;
  const insuranceFee = travelInsurance ? 199 * currentPaxCount : 0;
  const flexiFee = flexiFare ? Math.round(baseFare * 0.12) : 0;
  const taxes = Math.round(baseFare * 0.12);

  const subTotalBeforeDiscount = baseFare + totalSeatFee + totalMealsFee + baggageFee + insuranceFee + flexiFee + taxes;
  const grandTotal = Math.max(0, subTotalBeforeDiscount - discountAmount);

  // Auto-apply initial coupon if passed
  useEffect(() => {
    if (initialCoupon) {
      handleApplyPromo(initialCoupon);
    }
  }, [initialCoupon]);

  // Add multiple users / travellers dynamically
  const handleAddPassenger = (type = 'Adult') => {
    const newIdx = passengers.length;
    const defaultSeat = `${12 + newIdx}${['A', 'B', 'C', 'D', 'E', 'F'][newIdx % 6]}`;
    setPassengers([
      ...passengers,
      {
        title: type === 'Child' ? 'Master' : 'Mr',
        firstName: '',
        lastName: '',
        type,
        seat: defaultSeat,
        seatPrice: 0,
        meal: 'No Meal',
        mealPrice: 0
      }
    ]);
  };

  // Remove passenger
  const handleRemovePassenger = (idxToRemove) => {
    if (passengers.length <= 1) return;
    const updated = passengers.filter((_, i) => i !== idxToRemove);
    setPassengers(updated);
    if (activePassengerIndex >= updated.length) {
      setActivePassengerIndex(Math.max(0, updated.length - 1));
    }
  };

  // Update passenger field
  const updatePassenger = (index, field, value) => {
    const updated = [...passengers];
    updated[index][field] = value;
    setPassengers(updated);
  };

  // Set meal for passenger
  const handleMealSelect = (index, mealName, price) => {
    const updated = [...passengers];
    updated[index].meal = mealName;
    updated[index].mealPrice = price;
    setPassengers(updated);
  };

  // Handle seat selection for active passenger
  const handleSeatClick = (seat) => {
    if (seat.isOccupied) return;

    const updated = [...passengers];
    // If another passenger has this seat, swap or clear it
    const existingIdx = updated.findIndex((p, i) => i !== activePassengerIndex && p.seat === seat.seatNumber);
    if (existingIdx > -1) {
      updated[existingIdx].seat = '';
      updated[existingIdx].seatPrice = 0;
    }

    updated[activePassengerIndex].seat = seat.seatNumber;
    updated[activePassengerIndex].seatPrice = seat.price || 0;
    setPassengers(updated);

    // Auto-advance to next passenger without a seat
    const nextUnseated = updated.findIndex((p, idx) => idx > activePassengerIndex && !p.seat);
    if (nextUnseated > -1) {
      setActivePassengerIndex(nextUnseated);
    }
  };

  // Auto-assign free seats for all
  const handleAutoAssignFreeSeats = () => {
    const updated = [...passengers];
    updated.forEach((p, i) => {
      p.seat = `${14 + i}${['A', 'B', 'C', 'D', 'E', 'F'][i % 6]}`;
      p.seatPrice = 0;
    });
    setPassengers(updated);
  };

  // Apply Promo
  const handleApplyPromo = async (codeToUse) => {
    const code = (codeToUse || couponCode || '').trim().toUpperCase();
    if (!code) return;
    setApplyingCoupon(true);
    setCouponError('');
    setCouponMsg('');

    try {
      const res = await api.applyCoupon(code, subTotalBeforeDiscount);
      if (res.success) {
        setDiscountAmount(res.discount);
        setCouponMsg(res.message || `Promo ${code} applied successfully!`);
        setCouponCode(code);
      } else {
        setCouponError(res.message || 'Invalid or inactive promo code');
        setDiscountAmount(0);
      }
    } catch (err) {
      setCouponError('Could not apply promo code. Please verify and try again.');
      setDiscountAmount(0);
    } finally {
      setApplyingCoupon(false);
    }
  };

  // Remove Promo
  const handleRemovePromo = () => {
    setCouponCode('');
    setDiscountAmount(0);
    setCouponMsg('');
    setCouponError('');
  };

  // Step 1 Validation -> Proceed to Step 2 (Seat Selection)
  const handleProceedToSeats = () => {
    for (let i = 0; i < passengers.length; i++) {
      if (!passengers[i].firstName || !passengers[i].lastName) {
        alert(`Please enter First & Last Name for Traveller ${i + 1}`);
        return;
      }
    }
    if (!contact.email || !contact.phone) {
      alert('Please enter your contact Email and Phone number');
      return;
    }
    setStep(2);
  };

  // Step 2 Validation -> Proceed to Step 3 (Payment)
  const handleProceedToPayment = () => {
    // Ensure all passengers have a seat (fallback to auto assigned)
    const updated = [...passengers];
    updated.forEach((p, i) => {
      if (!p.seat) {
        p.seat = `${15 + i}${['A', 'B', 'C', 'D', 'E', 'F'][i % 6]}`;
        p.seatPrice = 0;
      }
    });
    setPassengers(updated);
    setStep(3);
  };

  // Submit Final Booking
  const handleFinalBooking = async () => {
    setIsProcessing(true);

    try {
      const isManualUpi = paymentMethod === 'upi';
      const activeVpa = paymentSettings?.upi?.vpa || 'paytm.s2zbyoe@pty';

      const bookingPayload = {
        flightId: flight.id,
        flightNumber: flight.flightNumber,
        airline: flight.airline,
        airlineCode: flight.airlineCode,
        from: flight.from,
        to: flight.to,
        fromCity: flight.fromCity,
        toCity: flight.toCity,
        departureDate: flight.departureDate || new Date().toISOString().split('T')[0],
        departureTime: flight.departureTime,
        arrivalTime: flight.arrivalTime,
        travelClass: travelClass,
        tripType: flight.tripType || (flight.isMultiCity ? 'multiCity' : 'oneWay'),
        multiCityLegs: flight.multiCityLegs || null,
        route: flight.isMultiCity
          ? (flight.multiCityLegs?.map(l => `${l.from} ➔ ${l.to}`).join(' • ') || `${flight.from} ➔ ${flight.to}`)
          : `${flight.from} → ${flight.to}`,
        passengers: passengers.map(p => ({
          title: p.title,
          firstName: p.firstName,
          lastName: p.lastName,
          gender: p.title === 'Mr' || p.title === 'Master' ? 'Male' : 'Female',
          seat: p.seat || '12A',
          seatPrice: p.seatPrice || 0,
          meal: p.meal,
          type: p.type || 'Adult'
        })),
        contact,
        gst: showGst ? gstDetails : null,
        fare: {
          basePrice: baseFare,
          seatCost: totalSeatFee,
          mealsCost: totalMealsFee,
          baggageCost: baggageFee,
          insurance: insuranceFee,
          flexiCost: flexiFee,
          taxes: taxes,
          discount: discountAmount,
          promoCode: discountAmount > 0 ? couponCode : null,
          total: grandTotal
        },
        payment: {
          method: paymentMethod,
          utrNumber: isManualUpi ? utrNumber : null,
          vpa: isManualUpi ? activeVpa : null,
          bank: paymentMethod === 'netbanking' ? selectedBank : null,
          cardLast4: paymentMethod === 'card' ? (cardDetails.number.slice(-4) || '4242') : null,
          status: isManualUpi ? 'VERIFICATION_PENDING' : 'CONFIRMED'
        }
      };

      const res = await api.createBooking(bookingPayload);
      if (res.success && res.data) {
        onBookingSuccess(res.data);
      } else {
        alert(res.message || 'Booking submission failed. Please try again.');
      }
    } catch (err) {
      console.error('Booking failed', err);
      alert('Network error while booking. Please retry.');
    } finally {
      setIsProcessing(false);
    }
  };

  const activeBrand = brand || window.__BRAND__ || {};
  const supportPhone = activeBrand.phone || '+91 72248 28030';
  const supportWa = (activeBrand.whatsapp || '918077680310').replace(/\D/g, '');

  const handleWhatsAppHelp = () => {
    const text = encodeURIComponent(
      `Hi ${activeBrand.name || 'AIR SKY'}, I am booking flight ${flight.airline} (${flight.flightNumber}) for ₹${grandTotal.toLocaleString('en-IN')}. Please help me complete booking for ${passengers.length} traveller(s).`
    );
    window.open(`https://wa.me/${supportWa}?text=${text}`, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-slate-50 rounded-3xl w-full max-w-5xl my-auto shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]"
      >
        {/* Header */}
        <div className="bg-white px-5 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <AirlineBadge code={flight.airlineCode} name={flight.airline} size="sm" showDetails={false} />
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <span>
                  {step === 1 && `1. Review Travellers (${passengers.length} Person${passengers.length > 1 ? 's' : ''})`}
                  {step === 2 && `2. Select Seats for Each Traveller`}
                  {step === 3 && `3. Secure Payment Gateway`}
                </span>
                {discountAmount > 0 && (
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    <span>Saved ₹{discountAmount.toLocaleString('en-IN')}</span>
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {flight.airline} • {flight.flightNumber} • {flight.from} ({flight.fromCity}) ➔ {flight.to} ({flight.toCity})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-4 sm:p-6 flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
            
            {/* Left Column: Form / Steps */}
            <div className="lg:col-span-8 space-y-5">
              
              {/* 3-Step Flow Indicators */}
              <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
                
                {/* Step 1 Pill */}
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className={`flex items-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                    step === 1 ? 'text-sky-600 font-extrabold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                    step === 1 ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    1
                  </span>
                  <span>Travellers ({passengers.length})</span>
                </button>

                <div className="w-6 sm:w-10 h-0.5 bg-slate-200"></div>

                {/* Step 2 Pill */}
                <button
                  type="button"
                  onClick={() => step > 1 ? setStep(2) : handleProceedToSeats()}
                  className={`flex items-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                    step === 2 ? 'text-sky-600 font-extrabold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                    step === 2 ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    2
                  </span>
                  <span>Select Seats</span>
                </button>

                <div className="w-6 sm:w-10 h-0.5 bg-slate-200"></div>

                {/* Step 3 Pill */}
                <button
                  type="button"
                  onClick={() => step === 2 && handleProceedToPayment()}
                  className={`flex items-center gap-2 text-xs font-bold transition-all ${
                    step === 3 ? 'text-sky-600 font-extrabold' : 'text-slate-400'
                  }`}
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                    step === 3 ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-400'
                  }`}>
                    3
                  </span>
                  <span>Payment</span>
                </button>
              </div>

              {/* ======================================================== */}
              {/* STEP 1: TRAVELLERS (ADD MULTIPLE USERS) & ADDONS */}
              {/* ======================================================== */}
              {step === 1 && (
                <div className="space-y-5 animate-fadeIn">
                  
                  {/* Traveller Details Card with "+ Add Traveller" Action */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-base">Traveller Details</h4>
                        <p className="text-xs text-slate-500">Add passenger details as shown on government ID or passport.</p>
                      </div>

                      {/* Add Multiple Users Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleAddPassenger('Adult')}
                          className="px-3 py-1.5 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 font-extrabold text-xs flex items-center gap-1 border border-sky-200 transition-all cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Adult</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddPassenger('Child')}
                          className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 font-extrabold text-xs flex items-center gap-1 border border-amber-200 transition-all cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Child (2-12y)</span>
                        </button>
                      </div>
                    </div>

                    {/* Dynamic List of Passengers */}
                    <div className="space-y-4">
                      {passengers.map((p, idx) => (
                        <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3 relative">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-sky-600 text-white text-[11px] font-black flex items-center justify-center">
                                {idx + 1}
                              </span>
                              <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
                                Traveller {idx + 1} ({p.type || 'Adult'})
                              </span>
                              <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                                Seat: <strong className="text-sky-700">{p.seat || 'Auto'}</strong>
                              </span>
                            </div>

                            {/* Delete User button (if more than 1 traveller) */}
                            {passengers.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemovePassenger(idx)}
                                className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Remove Traveller"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                            <div className="sm:col-span-2">
                              <label className="block text-[11px] font-bold text-slate-500 mb-1">Title</label>
                              <select
                                value={p.title}
                                onChange={(e) => updatePassenger(idx, 'title', e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold"
                              >
                                <option value="Mr">Mr</option>
                                <option value="Ms">Ms</option>
                                <option value="Mrs">Mrs</option>
                                <option value="Master">Master</option>
                              </select>
                            </div>

                            <div className="sm:col-span-5">
                              <label className="block text-[11px] font-bold text-slate-500 mb-1">First & Middle Name *</label>
                              <input
                                type="text"
                                placeholder="As on Passport / Govt ID"
                                value={p.firstName}
                                onChange={(e) => updatePassenger(idx, 'firstName', e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-sky-500"
                              />
                            </div>

                            <div className="sm:col-span-5">
                              <label className="block text-[11px] font-bold text-slate-500 mb-1">Last Name *</label>
                              <input
                                type="text"
                                placeholder="Surname"
                                value={p.lastName}
                                onChange={(e) => updatePassenger(idx, 'lastName', e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-sky-500"
                              />
                            </div>
                          </div>

                          {/* In-Flight Meal Selection for this Passenger */}
                          <div className="pt-2 border-t border-slate-200/80">
                            <label className="block text-[11px] font-bold text-slate-500 mb-1.5 flex items-center gap-1">
                              <Utensils className="w-3.5 h-3.5 text-sky-600" />
                              <span>Select In-Flight Meal (Optional)</span>
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                              {[
                                { name: 'No Meal', price: 0 },
                                { name: 'Veg Special Meal', price: 299 },
                                { name: 'Non-Veg Gourmet Snack', price: 349 }
                              ].map(m => (
                                <button
                                  key={m.name}
                                  type="button"
                                  onClick={() => handleMealSelect(idx, m.name, m.price)}
                                  className={`p-2 rounded-lg border text-left font-semibold transition-all cursor-pointer ${
                                    p.meal === m.name
                                      ? 'bg-sky-50 border-sky-500 text-sky-900 font-bold'
                                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                  }`}
                                >
                                  <div>{m.name}</div>
                                  <div className="text-[10px] text-slate-400 font-mono">
                                    {m.price === 0 ? 'Free/None' : `+₹${m.price}`}
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                    <h4 className="font-extrabold text-slate-900 text-base">Contact Information</h4>
                    <p className="text-xs text-slate-500">Your E-ticket and live flight notifications will be sent to these details.</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1">Email Address *</label>
                        <input
                          type="email"
                          required
                          placeholder="name@example.com"
                          value={contact.email}
                          onChange={(e) => setContact({ ...contact, email: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold focus:ring-2 focus:ring-sky-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1">Mobile Number (WhatsApp) *</label>
                        <input
                          type="tel"
                          required
                          placeholder="+91 98765 43210"
                          value={contact.phone}
                          onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold focus:ring-2 focus:ring-sky-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Add Flexi Fare & Baggage */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                    <h4 className="font-extrabold text-slate-900 text-base">Travel Add-ons & Flexibility</h4>

                    <div className="flex items-start justify-between p-3.5 rounded-xl border border-sky-200 bg-sky-50/40">
                      <div className="flex items-start gap-3">
                        <Zap className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                            <span>Add Flexi Fare (Free Date Change & Instant Refunds)</span>
                            <span className="bg-sky-600 text-white text-[9px] font-black uppercase px-1.5 py-0.2 rounded">Popular</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Zero date change fee up to 24h before departure + instant airline refund guarantee.
                          </p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={flexiFare}
                        onChange={(e) => setFlexiFare(e.target.checked)}
                        className="w-5 h-5 text-sky-600 rounded cursor-pointer mt-1"
                      />
                    </div>

                    <div className="flex items-start justify-between p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40">
                      <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                            <span>Comprehensive Travel Insurance (₹199 / pax)</span>
                            <span className="bg-emerald-600 text-white text-[9px] font-black uppercase px-1.5 py-0.2 rounded">Recommended</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Medical cover up to ₹5,00,000 + Baggage loss & flight delay compensation.
                          </p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={travelInsurance}
                        onChange={(e) => setTravelInsurance(e.target.checked)}
                        className="w-5 h-5 text-emerald-600 rounded cursor-pointer mt-1"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                        <Luggage className="w-4 h-4 text-slate-500" />
                        <span>Pre-book Extra Check-in Baggage (Save up to 40% vs Airport)</span>
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                        {[
                          { kg: 0, label: 'Standard 15 kg', price: 0 },
                          { kg: 5, label: '+5 kg Extra', price: 900 },
                          { kg: 10, label: '+10 kg Extra', price: 1700 }
                        ].map(b => (
                          <button
                            key={b.kg}
                            type="button"
                            onClick={() => setExtraBaggageKg(b.kg)}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                              extraBaggageKg === b.kg
                                ? 'bg-sky-50 border-sky-500 text-sky-900 font-bold ring-1 ring-sky-500'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white'
                            }`}
                          >
                            <div className="font-bold">{b.label}</div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              {b.price === 0 ? 'Included' : `+₹${b.price.toLocaleString('en-IN')}`}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* GST Business Section */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                    <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowGst(!showGst)}>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-sky-600" />
                        <span className="font-bold text-xs sm:text-sm text-slate-900">Add GST Number (Optional for Tax Invoice)</span>
                      </div>
                      <button type="button" className="text-xs font-bold text-sky-600 cursor-pointer">
                        {showGst ? 'Remove' : '+ Add GSTIN'}
                      </button>
                    </div>

                    {showGst && (
                      <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 mb-1">Enter 15-digit GSTIN *</label>
                          <input
                            type="text"
                            maxLength={15}
                            placeholder="e.g. 07AAAAA0000A1Z5"
                            value={gstDetails.gstin}
                            onChange={(e) => setGstDetails({ ...gstDetails, gstin: e.target.value.toUpperCase() })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold uppercase"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 mb-1">Registered Company Name *</label>
                          <input
                            type="text"
                            placeholder="e.g. Acme Tech Pvt Ltd"
                            value={gstDetails.companyName}
                            onChange={(e) => setGstDetails({ ...gstDetails, companyName: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bottom Next Button -> Moves to Seat Selection */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 cursor-pointer"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={handleProceedToSeats}
                      className="px-7 py-3 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-extrabold text-sm shadow-md shadow-sky-600/30 flex items-center gap-2 cursor-pointer transition-all"
                    >
                      <span>Next: Select Seats ({passengers.length})</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              )}

              {/* ======================================================== */}
              {/* ======================================================== */}
              {/* STEP 2: SELECT SEATS FOR EACH TRAVELLER (CABIN MAP) */}
              {/* ======================================================== */}
              {step === 2 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4 animate-fadeIn">
                  
                  <RealAircraftSeatMap
                    flight={flight}
                    passengers={passengers}
                    activePassengerIndex={activePassengerIndex}
                    onSelectPassengerIndex={setActivePassengerIndex}
                    onSeatClick={handleSeatClick}
                    onAutoAssignFree={handleAutoAssignFreeSeats}
                    layoutData={layoutData}
                    loading={loadingSeats}
                  />

                  {/* Seat Navigation Buttons */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Travellers</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleProceedToPayment}
                      className="px-7 py-3 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-extrabold text-sm shadow-md shadow-sky-600/30 flex items-center gap-2 cursor-pointer transition-all"
                    >
                      <span>Next: Proceed to Payment (Step 3)</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* STEP 3: PAYMENT GATEWAY (UPI QR, CARDS, NETBANKING) */}
              {/* ======================================================== */}
              {step === 3 && (
                <motion.div
                  key="checkout-step-3"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-5 animate-fadeIn"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-emerald-600" />
                      <span className="font-extrabold text-slate-900 text-base">Select Payment Method</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                      256-Bit SSL Encrypted
                    </span>
                  </div>

                  {/* Passengers & Assigned Seats Summary Pill */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
                    <div className="font-bold text-slate-700 flex items-center justify-between">
                      <span>Confirmed Travellers & Assigned Seats:</span>
                      <span className="text-[10px] text-sky-600 cursor-pointer hover:underline" onClick={() => setStep(2)}>
                        Change Seats
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {passengers.map((p, i) => (
                        <span key={i} className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 font-medium text-slate-800">
                          <strong>{p.title} {p.firstName} {p.lastName}</strong>: Seat <span className="text-sky-700 font-mono font-bold">{p.seat}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Applied promo badge in payment screen */}
                  {discountAmount > 0 && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800 font-semibold">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-emerald-600" />
                        <span>Promo Code <strong>{couponCode}</strong> Active! Instant ₹{discountAmount.toLocaleString('en-IN')} Discount Deducted.</span>
                      </div>
                      <span className="text-xs font-mono font-black text-emerald-700">-₹{discountAmount}</span>
                    </div>
                  )}

                  {/* Payment Method Tabs */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('upi')}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer relative ${
                        paymentMethod === 'upi'
                          ? 'bg-sky-50 border-sky-500 text-sky-900 shadow-xs font-bold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="absolute -top-2 right-2 bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider shadow-xs">
                        Fastest • 0% Fee
                      </span>
                      <QrCode className="w-4 h-4 mx-auto mb-1 text-sky-600" />
                      <div className="text-xs">UPI / QR Code</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        paymentMethod === 'card'
                          ? 'bg-sky-50 border-sky-500 text-sky-900 shadow-xs font-bold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <CreditCard className="w-4 h-4 mx-auto mb-1 text-sky-600" />
                      <div className="text-xs">Credit / Debit Card</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('netbanking')}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        paymentMethod === 'netbanking'
                          ? 'bg-sky-50 border-sky-500 text-sky-900 shadow-xs font-bold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Building className="w-4 h-4 mx-auto mb-1 text-sky-600" />
                      <div className="text-xs">Net Banking</div>
                    </button>
                  </div>

                  {/* UPI QR Payment Content */}
                  {paymentMethod === 'upi' && (() => {
                    const activeVpa = paymentSettings?.upi?.vpa || 'paytm.s2zbyoe@pty';
                    const activeName = paymentSettings?.upi?.businessName || 'Air Sky India';
                    const activeMcc = paymentSettings?.upi?.mcc || '5499';
                    const txnRef = `ASG${flight.id || 'FL'}${Date.now().toString().slice(-6)}`;
                    const note = `Flight ${flight.flightNumber || 'Ticket'}`;
                    const upiPayload = `upi://pay?pa=${encodeURIComponent(activeVpa)}&pn=${encodeURIComponent(activeName)}&am=${grandTotal}&cu=INR&tn=${encodeURIComponent(note)}&mc=${encodeURIComponent(activeMcc)}&tr=${encodeURIComponent(txnRef)}`;
                    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(upiPayload)}`;

                    return (
                      <div className="space-y-4">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
                          <p className="text-xs font-bold text-slate-600 mb-3">
                            Scan with Any UPI App (GPay, PhonePe, Paytm, CRED)
                          </p>

                          <div className="inline-block p-3 bg-white rounded-2xl shadow-md border border-slate-200">
                            <img
                              src={qrUrl}
                              alt="UPI QR Code"
                              className="w-44 h-44 mx-auto object-contain"
                            />
                            <div className="mt-2 text-xs font-black text-slate-900">
                              Amount: ₹{grandTotal.toLocaleString('en-IN')}
                            </div>
                          </div>

                          <div className="mt-3 flex items-center justify-center gap-2 text-xs font-mono">
                            <span className="text-slate-500">UPI ID:</span>
                            <span className="font-bold text-slate-800">{activeVpa}</span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard?.writeText(activeVpa);
                                setCopiedVpa(true);
                                setTimeout(() => setCopiedVpa(false), 2000);
                              }}
                              className="text-sky-600 hover:text-sky-700 p-1 cursor-pointer"
                              title="Copy UPI ID"
                            >
                              {copiedVpa ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        {/* UTR Input */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Enter 12-digit UTR / UPI Transaction Reference Number *
                          </label>
                          <input
                            type="text"
                            maxLength={16}
                            placeholder="e.g. 423456789012"
                            value={utrNumber}
                            onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, ''))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold tracking-widest focus:ring-2 focus:ring-sky-500"
                          />
                          <p className="text-[10px] text-slate-400 mt-1">
                            Found in your GPay / PhonePe / Paytm transaction receipt after paying.
                          </p>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Card Payment Content */}
                  {paymentMethod === 'card' && (
                    <div className="space-y-3 text-xs">
                      <div className="p-2.5 bg-sky-50 border border-sky-200 rounded-xl text-sky-800 text-[11px] font-semibold flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                        <span>Pay securely with Credit / Debit card. Instant bank discounts applied automatically.</span>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-600 mb-1">Card Number *</label>
                        <input
                          type="text"
                          maxLength={19}
                          placeholder="4111 2222 3333 4444"
                          value={cardDetails.number}
                          onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-slate-600 mb-1">Expiry Date *</label>
                          <input
                            type="text"
                            maxLength={5}
                            placeholder="MM/YY"
                            value={cardDetails.expiry}
                            onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-600 mb-1">CVV / CVC *</label>
                          <input
                            type="password"
                            maxLength={4}
                            placeholder="•••"
                            value={cardDetails.cvv}
                            onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-600 mb-1">Cardholder Name *</label>
                        <input
                          type="text"
                          placeholder="Name as printed on card"
                          value={cardDetails.name}
                          onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold"
                        />
                      </div>
                    </div>
                  )}

                  {/* Net Banking */}
                  {paymentMethod === 'netbanking' && (
                    <div className="space-y-3 text-xs">
                      <label className="block font-bold text-slate-700">Choose Bank:</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Mahindra', 'Punjab National Bank'].map(b => (
                          <button
                            key={b}
                            type="button"
                            onClick={() => setSelectedBank(b)}
                            className={`p-2.5 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                              selectedBank === b
                                ? 'bg-sky-50 border-sky-500 text-sky-900 shadow-xs'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white'
                            }`}
                          >
                            {b}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* WhatsApp Support Alternative */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>Having trouble paying?</span>
                    <button
                      type="button"
                      onClick={handleWhatsAppHelp}
                      className="text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Pay via WhatsApp Agent</span>
                    </button>
                  </div>

                  {/* Payment Navigation Buttons */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Seats</span>
                    </button>

                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={handleFinalBooking}
                      className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm shadow-md shadow-emerald-600/30 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Generating Instant PNR...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          <span>Pay ₹{grandTotal.toLocaleString('en-IN')} & Confirm Ticket</span>
                        </>
                      )}
                    </button>
                  </div>

                </motion.div>
              )}

            </div>

            {/* Right Column: Fare Breakup & PromoSuggestions */}
            <div className="lg:col-span-4 space-y-4">
              
              {/* PromoSuggestions Box */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-900">
                    <Tag className="w-4 h-4 text-emerald-600" />
                    <span>Promo & Coupon Offers</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                    Tap to apply
                  </span>
                </div>

                {/* Promo Code Input & Apply / Remove Buttons */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Enter promo code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold uppercase focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                  {discountAmount > 0 ? (
                    <button
                      type="button"
                      onClick={handleRemovePromo}
                      className="px-3 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold rounded-xl text-xs transition-colors cursor-pointer border border-rose-200"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={applyingCoupon || !couponCode}
                      onClick={() => handleApplyPromo()}
                      className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      {applyingCoupon ? 'Checking...' : 'Apply'}
                    </button>
                  )}
                </div>

                {/* Success or Error Feedback */}
                {couponMsg && (
                  <div className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{couponMsg}</span>
                  </div>
                )}
                {couponError && (
                  <div className="text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>{couponError}</span>
                  </div>
                )}

                {/* Clickable PromoSuggestions Cards */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Available Offers — Tap to Apply
                  </div>

                  <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                    {(availableCoupons.length > 0 ? availableCoupons : [
                      { code: 'AIRSKY500', type: 'flat', discount: 500, minAmount: 3000, description: 'Flat ₹500 off on any flight' },
                      { code: 'FLYHIGH', type: 'percent', discount: 10, maxDiscount: 1500, minAmount: 4000, description: '10% instant discount up to ₹1,500' },
                      { code: 'IXIGO50', type: 'flat', discount: 750, minAmount: 5000, description: 'Special ₹750 Super Saver discount' },
                      { code: 'FIRSTFLY', type: 'flat', discount: 1000, minAmount: 6000, description: 'Welcome ₹1,000 off on first flight' }
                    ]).map(c => {
                      const isApplied = couponCode.toUpperCase() === c.code.toUpperCase() && discountAmount > 0;
                      return (
                        <div
                          key={c.code}
                          onClick={() => !isApplied && handleApplyPromo(c.code)}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                            isApplied
                              ? 'bg-emerald-50 border-emerald-400 ring-1 ring-emerald-400'
                              : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/80 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-black text-xs text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                                {c.code}
                              </span>
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.2 rounded">
                                {c.type === 'percent' ? `${c.discount}% OFF` : `₹${c.discount} OFF`}
                              </span>
                            </div>

                            <button
                              type="button"
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                                isApplied
                                  ? 'bg-emerald-600 text-white'
                                  : 'text-sky-600 hover:text-sky-700'
                              }`}
                            >
                              {isApplied ? 'Applied ✓' : 'Apply'}
                            </button>
                          </div>

                          <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{c.description}</p>
                          {c.minAmount && (
                            <div className="text-[9px] text-slate-400 mt-0.5 font-mono">
                              Min booking amount: ₹{c.minAmount.toLocaleString('en-IN')}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Detailed Fare Summary */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                <h4 className="font-extrabold text-slate-900 text-base pb-2 border-b border-slate-100">
                  Fare Breakup
                </h4>

                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Base Fare ({passengers.length} Traveller{passengers.length > 1 ? 's' : ''})</span>
                    <span className="font-bold font-mono">₹{baseFare.toLocaleString('en-IN')}</span>
                  </div>

                  {totalSeatFee > 0 && (
                    <div className="flex justify-between">
                      <span>Seat Selection ({passengers.filter(p => p.seatPrice > 0).length} Paid)</span>
                      <span className="font-bold font-mono text-sky-700">+₹{totalSeatFee.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  {totalMealsFee > 0 && (
                    <div className="flex justify-between">
                      <span>Meals & In-Flight Food</span>
                      <span className="font-bold font-mono text-sky-700">+₹{totalMealsFee.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  {baggageFee > 0 && (
                    <div className="flex justify-between">
                      <span>Extra Baggage ({extraBaggageKg}kg)</span>
                      <span className="font-bold font-mono text-sky-700">+₹{baggageFee.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  {insuranceFee > 0 && (
                    <div className="flex justify-between">
                      <span>Travel Insurance ({passengers.length} Pax)</span>
                      <span className="font-bold font-mono text-emerald-700">+₹{insuranceFee.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  {flexiFee > 0 && (
                    <div className="flex justify-between">
                      <span>Flexi Fare Add-on</span>
                      <span className="font-bold font-mono text-sky-700">+₹{flexiFee.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Taxes & Fees (incl. GST)</span>
                    <span className="font-bold font-mono">+₹{taxes.toLocaleString('en-IN')}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-extrabold bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5" />
                        <span>Promo Discount ({couponCode})</span>
                      </span>
                      <span className="font-mono">-₹{discountAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-500 uppercase">Total Payable Fare</div>
                    <div className="text-[10px] text-slate-400">{passengers.length} Traveller{passengers.length > 1 ? 's' : ''} • Taxes included</div>
                  </div>
                  <div className="text-2xl font-black text-slate-900 font-mono">
                    ₹{grandTotal.toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 text-center pt-1 border-t border-slate-100">
                  🔒 Guaranteed best value with instant airline PNR generation
                </div>
              </div>

            </div>

          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

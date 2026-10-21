import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, ShieldCheck, CheckCircle2, CreditCard, QrCode, Building, Tag, ArrowRight, ArrowLeft,
  Lock, Sparkles, Plane, Utensils, Luggage, Shield, Smartphone, Copy, Check, ExternalLink, Zap,
  Phone, MessageCircle, FileText, AlertCircle, AlertTriangle, RefreshCw, UserPlus, Trash2, Armchair, Plus, Info, Globe, Clock
} from 'lucide-react';
import { api } from '../utils/api';
import { getEdgePaymentSettings, getEdgeLiveBookings, updateEdgeBookingStatus } from '../utils/edgeConfig';
import AirlineBadge from './AirlineBadge';
import RealAircraftSeatMap from './RealAircraftSeatMap';
import StepTransitionLoader from './StepTransitionLoader';

const INDIAN_AIRPORTS = new Set([
  'DEL', 'BOM', 'BLR', 'HYD', 'CCU', 'MAA', 'AMD', 'PNQ', 'GOX', 'GOI', 
  'COK', 'JAI', 'LKO', 'VNS', 'AYJ', 'PAT', 'SXR', 'IXC', 'ATQ', 'IDR', 
  'BHO', 'NAG', 'GAU', 'BBI', 'IXB', 'VTZ', 'TRV', 'CCJ', 'CNN', 'CJB', 
  'TRZ', 'IXM', 'TCR', 'SXV', 'PNY', 'IXE', 'HBX', 'IXG', 'GBI', 'RQY', 
  'MYQ', 'IXX', 'VDY', 'STV', 'BDQ', 'HSR', 'BHU', 'BHJ', 'JGA', 'PBD', 
  'IXK', 'IXY', 'UDR', 'JDH', 'JSA', 'BKB', 'KQH', 'KTU', 'DED', 'PGH', 
  'NNS', 'DHM', 'KUU', 'SLV', 'IXJ', 'IXL', 'IXD', 'GOP', 'AGR', 'BEK', 
  'KNU', 'HDO', 'KBK', 'HRH', 'MZS', 'AZH', 'SHV', 'CWK', 'GWL', 'JLR', 
  'HJR', 'REW', 'RPR', 'PAB', 'JGB', 'IXR', 'DGH', 'IXW', 'DBR', 'GAY', 
  'RDP', 'COH', 'JRG', 'RRK', 'PYB', 'UKE', 'VGA', 'TIR', 'RJA', 'CDP', 
  'KJB', 'IXA', 'IMF', 'DMU', 'DIB', 'IXS', 'JRH', 'TEZ', 'RUP', 'IXI', 
  'SHL', 'AJL', 'PYG', 'HGI', 'IXT', 'TEI', 'ZER', 'IXZ', 'AGX', 'SAG', 
  'KLH', 'IXU', 'JLG', 'NDC', 'SDW', 'GDB', 'ISK', 'BUP', 'AIP', 'LUH', 
  'IXP'
]);

const formatTerminal = (term) => {
  if (!term) return 'T1';
  const str = String(term).trim();
  if (/^T\d/i.test(str)) return str;
  if (/^\d/.test(str)) return `T${str}`;
  return str;
};

const DEFAULT_DEEP_LINKS = {
  any: 'upi://pay?pa={vpa}&pn={name}&am={amount}&cu=INR&tn={note}&tr={tr}&mc={mc}&mode=02',
  phonepe: 'phonepe://pay?pa={vpa}&pn={name}&am={amount}&cu=INR&tn={note}&tr={tr}&mc={mc}&mode=02',
  gpay: 'tez://upi/pay?pa={vpa}&pn={name}&am={amount}&cu=INR&tn={note}&tr={tr}&mc={mc}&mode=02',
  paytm: 'paytmmp://pay?pa={vpa}&pn={name}&am={amount}&cu=INR&tn={note}&tr={tr}&mc={mc}&mode=02',
  bhim: 'upi://pay?pa={vpa}&pn={name}&am={amount}&cu=INR&tn={note}&tr={tr}&mc={mc}&mode=02',
  other: 'upi://pay?pa={vpa}&pn={name}&am={amount}&cu=INR&tn={note}&tr={tr}&mc={mc}&mode=02'
};

// Standard 6-character Airline PNR Generator (IndiGo format, e.g. Y9WUNS)
export const generateAirlinePnr = () => {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const digits = '23456789';
  const chars = letters + digits;
  let pnr = '';
  for (let i = 0; i < 6; i++) {
    pnr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  if (!/\d/.test(pnr)) {
    const pos = Math.floor(Math.random() * 6);
    pnr = pnr.substring(0, pos) + digits.charAt(Math.floor(Math.random() * digits.length)) + pnr.substring(pos + 1);
  }
  if (!/[A-Z]/.test(pnr)) {
    const pos = Math.floor(Math.random() * 6);
    pnr = pnr.substring(0, pos) + letters.charAt(Math.floor(Math.random() * letters.length)) + pnr.substring(pos + 1);
  }
  return pnr;
};

export const getStoredOrNewPnr = () => {
  try {
    const stored = localStorage.getItem('asg_current_pending_pnr');
    if (stored && /^[A-Z0-9]{6}$/.test(stored.trim().toUpperCase())) {
      return stored.trim().toUpperCase();
    }
  } catch (e) {}
  const fresh = generateAirlinePnr();
  try { localStorage.setItem('asg_current_pending_pnr', fresh); } catch (e) {}
  return fresh;
};

export default function BookingCheckoutModal({
  flight,
  currentPrice,
  travelClass,
  selectedSeats = [],
  passengersCount = 1,
  onClose,
  onBookingSuccess,
  brand = null,
  initialCoupon = '',
  initialFareTier = 'saver'
}) {
  const [step, setStep] = useState(1); // 1 = Travellers & Addons, 2 = Seat Selection, 3 = Review & Offers, 4 = Payment Gateway
  const [createdPnr, setCreatedPnr] = useState(() => getStoredOrNewPnr());
  const [showFareBreakupPopup, setShowFareBreakupPopup] = useState(false);
  const [isStepLoading, setIsStepLoading] = useState(false);
  const [transitionMeta, setTransitionMeta] = useState({ targetStep: 1, fromStep: 1 });

  const transitionToStep = (targetStep) => {
    if (targetStep === step) return;
    setTransitionMeta({ targetStep, fromStep: step });
    setIsStepLoading(true);
    setTimeout(() => {
      setStep(targetStep);
      setIsStepLoading(false);
    }, 450);
  };

  // Check if international travel (from or to airport outside India)
  const isInternationalFlight = Boolean(
    flight?.isInternational ||
    (flight?.to && !INDIAN_AIRPORTS.has(flight.to.toUpperCase())) ||
    (flight?.from && !INDIAN_AIRPORTS.has(flight.from.toUpperCase()))
  );

  // Passenger data with ability to add multiple users dynamically
  const [passengers, setPassengers] = useState(() => {
    let prefillFirst = '';
    let prefillLast = '';
    try {
      const s = localStorage.getItem('asg_user');
      if (s) {
        const u = JSON.parse(s);
        if (u.name && !u.name.toLowerCase().includes('traveller')) {
          const parts = u.name.trim().split(' ');
          prefillFirst = parts[0] || '';
          prefillLast = parts.slice(1).join(' ') || '';
        }
      }
    } catch {}

    const count = Math.max(1, passengersCount);
    return Array.from({ length: count }).map((_, idx) => ({
      title: 'Mr',
      gender: 'Male',
      firstName: idx === 0 ? prefillFirst : '',
      lastName: idx === 0 ? prefillLast : '',
      passportNumber: '',
      passportExpiry: '',
      nationality: 'Indian',
      type: 'Adult',
      seat: selectedSeats[idx]?.seatNumber || '',
      onwardSeat: '',
      returnSeat: '',
      onwardSeatPrice: 0,
      returnSeatPrice: 0,
      seatPrice: selectedSeats[idx]?.price || 0,
      meal: 'No Meal',
      mealPrice: 0
    }));
  });

  // For Round Trip seat selection: active flight leg ('onward' | 'return')
  const [seatFlightLeg, setSeatFlightLeg] = useState('onward');

  // Contact Info (prefilled from active user session)
  const [contact, setContact] = useState(() => {
    try {
      const savedUser = localStorage.getItem('asg_user');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        return {
          email: u.email || '',
          phone: u.phone ? u.phone.replace(/\D/g, '').slice(-10) : ''
        };
      }
    } catch {}
    return { email: '', phone: '' };
  });

  // Business GST Info
  const [showGst, setShowGst] = useState(false);
  const [gstDetails, setGstDetails] = useState({
    gstin: '',
    companyName: ''
  });

  // Add-ons & Fare Flexibility
  const [selectedFareTier, setSelectedFareTier] = useState(initialFareTier || 'saver'); // 'saver' | 'flexi' | 'super'
  const [travelInsurance, setTravelInsurance] = useState(true);
  const [extraBaggageKg, setExtraBaggageKg] = useState(0);

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
  const [paymentSettings, setPaymentSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('asg_payment_settings');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [paymentMethod, setPaymentMethod] = useState(() => {
    try {
      const saved = localStorage.getItem('asg_payment_settings');
      if (saved) {
        const ps = JSON.parse(saved);
        if (ps.methods?.upiApps !== false) return 'upiApps';
        if (ps.methods?.upiQr !== false) return 'upiQr';
        if (ps.methods?.card === true) return 'card';
        if (ps.methods?.netBanking === true) return 'netbanking';
      }
    } catch {}
    return 'upiApps';
  });
  const [selectedUpiApp, setSelectedUpiApp] = useState('PhonePe');
  const [selectedAppKey, setSelectedAppKey] = useState('phonepe');
  const [appLaunchFailed, setAppLaunchFailed] = useState(null);
  const [isLaunchingApp, setIsLaunchingApp] = useState(false);
  const [paymentTimerSeconds, setPaymentTimerSeconds] = useState(300); // 5 min = 300s
  const [isTimerExpired, setIsTimerExpired] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [copiedVpa, setCopiedVpa] = useState(false);
  const [cardDetails, setCardDetails] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [isProcessing, setIsProcessing] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);

  const ensureCompleteBookingData = (b) => {
    const defaultPax = (passengers && passengers.length > 0 ? passengers : [{
      title: 'Mr',
      firstName: contact?.name || contact?.email?.split('@')[0] || 'Customer',
      lastName: 'Traveller',
      gender: 'Male',
      seat: '7B',
      type: 'Adult'
    }]);

    return {
      airline: b?.airline || flight?.airline || 'IndiGo',
      flightNumber: b?.flightNumber || flight?.flightNumber || '6E 955',
      aircraft: b?.aircraft || flight?.aircraft || 'A320',
      from: b?.from || flight?.from || 'DEL',
      to: b?.to || flight?.to || 'BOM',
      fromCity: b?.fromCity || flight?.fromCity || (b?.from || flight?.from ? `${b?.from || flight?.from} Airport` : 'Delhi'),
      toCity: b?.toCity || flight?.toCity || (b?.to || flight?.to ? `${b?.to || flight?.to} Airport` : 'Mumbai'),
      departureDate: b?.departureDate || flight?.departureDate || flight?.date || new Date().toISOString().split('T')[0],
      departureTime: b?.departureTime || flight?.departureTime || '20:20',
      arrivalTime: b?.arrivalTime || flight?.arrivalTime || '22:20',
      travelClass: b?.travelClass || travelClass || 'Economy',
      passengers: (b?.passengers && b.passengers.length > 0) ? b.passengers : defaultPax,
      contact: b?.contact || contact || { email: 'customer@gmail.com', phone: '9876543210' },
      fare: b?.fare || {
        basePrice: Number(currentPrice || 4495),
        taxes: 1455,
        total: Number(grandTotal || 5950)
      },
      ...b,
      from: b?.from || flight?.from || 'DEL',
      to: b?.to || flight?.to || 'BOM',
      fromCity: b?.fromCity || flight?.fromCity || (b?.from || flight?.from ? `${b?.from || flight?.from} Airport` : 'Delhi'),
      toCity: b?.toCity || flight?.toCity || (b?.to || flight?.to ? `${b?.to || flight?.to} Airport` : 'Mumbai'),
      airline: b?.airline || flight?.airline || 'IndiGo',
      flightNumber: b?.flightNumber || flight?.flightNumber || '6E 955',
      departureDate: b?.departureDate || flight?.departureDate || new Date().toISOString().split('T')[0],
      departureTime: b?.departureTime || flight?.departureTime || '20:20',
      arrivalTime: b?.arrivalTime || flight?.arrivalTime || '22:20'
    };
  };

  // Real-time synchronization when Admin approves booking:
  // 1. BroadcastChannel (Instant 0ms across tabs)
  // 2. Storage event (Instant 0ms across windows)
  // 3. Fast Polling across devices/mobile phones (1.2s interval)
  useEffect(() => {
    const activePnr = createdPnr || localStorage.getItem('asg_current_pending_pnr');
    if (!isVerifyingPayment || !activePnr) return;

    let isDone = false;
    const checkApproval = (booking) => {
      if (isDone || !booking) return false;
      const bStatus = String(booking.status || '').trim().toUpperCase();
      // ONLY accept explicit CONFIRMED status set by admin — never auto-confirm via payment.status
      if (bStatus === 'CONFIRMED') {
        isDone = true;
        setIsVerifyingPayment(false);
        try { localStorage.removeItem('asg_current_pending_pnr'); } catch (e) {}
        onBookingSuccess(ensureCompleteBookingData(booking));
        return true;
      }
      return false;
    };

    // 0. Delayed initial fetch (wait 2s for Edge Config to settle after booking creation)
    const initialTimeout = setTimeout(() => {
      api.getBookingByPnr(activePnr).then(res => {
        const b = res?.data || res?.booking;
        if (b) checkApproval(b);
      }).catch(() => {});
    }, 2000);

    // 1. BroadcastChannel listener (instant same-machine sync)
    let bc = null;
    if (window.BroadcastChannel) {
      try {
        bc = new BroadcastChannel('asg_bookings_channel');
        bc.onmessage = async (msg) => {
          const msgPnr = String(msg.data?.pnr || '').trim().toUpperCase();
          const msgStatus = String(msg.data?.status || '').trim().toUpperCase();
          if (msgPnr === String(activePnr).trim().toUpperCase() && msgStatus === 'CONFIRMED') {
            const res = await api.getBookingByPnr(activePnr);
            const b = res?.data || res?.booking || { ...msg.data, pnr: activePnr, status: 'CONFIRMED' };
            checkApproval(b);
          }
        };
      } catch (e) {}
    }

    // 2. LocalStorage cross-tab event listener
    const handleStorageChange = async (e) => {
      if (e.key === 'asg_booking_status_update' && e.newValue) {
        try {
          const data = JSON.parse(e.newValue);
          const dataPnr = String(data?.pnr || '').trim().toUpperCase();
          const dataStatus = String(data?.status || '').trim().toUpperCase();
          if (dataPnr === String(activePnr).trim().toUpperCase() && dataStatus === 'CONFIRMED') {
            const res = await api.getBookingByPnr(activePnr);
            const b = res?.data || res?.booking || { ...data, pnr: activePnr, status: 'CONFIRMED' };
            checkApproval(b);
          }
        } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // 3. Fast Network Polling (every 1.5s via API)
    const interval = setInterval(async () => {
      if (isDone) {
        clearInterval(interval);
        return;
      }
      try {
        const res = await api.getBookingByPnr(activePnr);
        const booking = res?.data || res?.booking;
        if (booking && checkApproval(booking)) {
          clearInterval(interval);
        }
      } catch (err) {
        console.warn('Polling status error:', err);
      }
    }, 1500);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      if (bc) {
        try { bc.close(); } catch (e) {}
      }
    };
  }, [isVerifyingPayment, createdPnr, onBookingSuccess]);

  // 5-minute countdown timer on Step 4 (Payment)
  useEffect(() => {
    if (step !== 4) {
      setPaymentTimerSeconds(300);
      setIsTimerExpired(false);
      return;
    }

    const timer = setInterval(() => {
      setPaymentTimerSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsTimerExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [step]);

  const formatTimer = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleSelectPaymentMethod = (methodId) => {
    if ((methodId === 'upiQr' || methodId === 'upi') && paymentMethod !== methodId) {
      setQrLoading(true);
      setTimeout(() => {
        setQrLoading(false);
      }, 1600);
    }
    setPaymentMethod(methodId);
  };

  useEffect(() => {
    if (step === 4 && (paymentMethod === 'upiQr' || paymentMethod === 'upi')) {
      setQrLoading(true);
      const timer = setTimeout(() => {
        setQrLoading(false);
      }, 1600);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // Fetch payment settings, seat layout and coupons on mount
  useEffect(() => {
    // 1. Initial hydration from localStorage
    let savedLocal = null;
    try {
      const s = localStorage.getItem('asg_payment_settings');
      if (s) {
        savedLocal = JSON.parse(s);
        if (savedLocal?.upi) {
          if (savedLocal.upi.name && savedLocal.upi.name.includes('Meesho')) {
            savedLocal.upi.name = 'AirSkyGo';
            savedLocal.upi.businessName = 'AirSkyGo';
          }
          if (savedLocal.upi.vpa && savedLocal.upi.vpa.includes('mairtel')) {
            savedLocal.upi.vpa = 'paytm.s2zbyoe@pty';
          }
        }
        setPaymentSettings(savedLocal);
      }
    } catch (e) {}

    // 2. Listen for live updates from Admin panel
    const handleSettingsUpdate = (e) => {
      if (e.detail) {
        setPaymentSettings(e.detail);
      }
    };
    window.addEventListener('asg_payment_settings_updated', handleSettingsUpdate);

    // 3. Fetch from static /payment_settings.json (always authoritative after deploy)
    const applySettings = (data) => {
      const merged = {
        ...data,
        apps: { ...(data.apps || {}) },
        upi: { ...(data.upi || {}) },
        methods: { ...(data.methods || {}) },
        deepLinks: { ...(data.deepLinks || {}) }
      };
      setPaymentSettings(merged);
      try { localStorage.setItem('asg_payment_settings', JSON.stringify(merged)); } catch (e) {}

      const m = merged.methods || {};
      const isCurrentEnabled =
        (paymentMethod === 'upiApps' && m.upiApps !== false) ||
        (paymentMethod === 'upiQr' && m.upiQr !== false) ||
        (paymentMethod === 'card' && m.card === true) ||
        (paymentMethod === 'netbanking' && m.netBanking === true);
      if (!isCurrentEnabled) {
        if (m.upiApps !== false) setPaymentMethod('upiApps');
        else if (m.upiQr !== false) setPaymentMethod('upiQr');
        else if (m.card === true) setPaymentMethod('card');
        else if (m.netBanking === true) setPaymentMethod('netbanking');
      }
    };

    // 3. Real-time live polling from Vercel Edge Config so admin changes (e.g. GPay/Paytm/PhonePe) appear instantly WITHOUT refresh
    const fetchLiveSettings = async () => {
      try {
        const edgeData = await getEdgePaymentSettings();
        if (edgeData) {
          applySettings(edgeData);
          return;
        }
      } catch (e) {}

      api.getPaymentSettings()
        .then(res => {
          if (res.success && res.data) {
            applySettings(res.data);
          }
        })
        .catch(() => {
          fetch('/payment_settings.json?t=' + Date.now())
            .then(r => r.ok ? r.json() : Promise.reject())
            .then(data => { applySettings(data); })
            .catch(() => {});
        });
    };

    fetchLiveSettings();
    const livePoller = setInterval(fetchLiveSettings, 2000);

    return () => {
      clearInterval(livePoller);
      window.removeEventListener('asg_payment_settings_updated', handleSettingsUpdate);
    };
  }, []);

  useEffect(() => {
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

  // Dynamic Fare Tiers (Saver, Flexi Plus, AirSky VIP)
  const unitBasePrice = flight?.basePrice || currentPrice;
  const tierPrices = {
    saver: unitBasePrice,
    flexi: Math.round(unitBasePrice * 1.15),
    super: Math.round(unitBasePrice * 1.35)
  };
  const currentPaxCount = passengers.length;
  const tierUpgradePerPax = (tierPrices[selectedFareTier] || unitBasePrice) - unitBasePrice;
  const tierUpgradeTotal = tierUpgradePerPax * currentPaxCount;
  const standardBaseFare = unitBasePrice * currentPaxCount;
  const baseFare = standardBaseFare + tierUpgradeTotal;
  const totalSeatFee = passengers.reduce((sum, p) => sum + (p.seatPrice || 0), 0);
  const totalMealsFee = passengers.reduce((sum, p) => sum + (p.mealPrice || 0), 0);
  const baggageFee = extraBaggageKg === 5 ? 900 : extraBaggageKg === 10 ? 1700 : extraBaggageKg === 15 ? 2400 : 0;
  const insuranceFee = travelInsurance ? 199 * currentPaxCount : 0;
  const taxes = Math.round(baseFare * 0.12);

  const subTotalBeforeDiscount = baseFare + totalSeatFee + totalMealsFee + baggageFee + insuranceFee + taxes;
  const grandTotal = Math.max(0, subTotalBeforeDiscount - discountAmount);

  // Dynamic Payment Methods & UPI Apps filtered strictly by Admin Settings
  const activeMethods = paymentSettings?.methods || { upiQr: true, upiApps: true, card: false, netBanking: false };
  const isUpiQrEnabled = activeMethods.upiQr !== false;
  const isUpiAppsEnabled = activeMethods.upiApps !== false;
  const isCardEnabled = !!activeMethods.card;
  const isNetBankingEnabled = !!activeMethods.netBanking;

  const paymentTabs = [
    ...(isUpiAppsEnabled ? [{ id: 'upiApps', label: 'UPI Apps', icon: Smartphone, badge: 'Popular' }] : []),
    ...(isUpiQrEnabled ? [{ id: 'upiQr', label: 'UPI QR Code', icon: QrCode, badge: 'Instant' }] : []),
    ...(isCardEnabled ? [{ id: 'card', label: 'Credit / Debit', icon: CreditCard }] : []),
    ...(isNetBankingEnabled ? [{ id: 'netbanking', label: 'Net Banking', icon: Building }] : [])
  ];

  const activeAppsConfig = paymentSettings?.apps || paymentSettings?.upiApps || {
    phonepe: true,
    gpay: true,
    paytm: true,
    bhim: true,
    any: false,
    other: false
  };

  const ALL_UPI_APPS = [
    { key: 'phonepe', name: 'PhonePe', iconUrl: '/icons/phonepe.png', badge: 'Fastest' },
    { key: 'gpay', name: 'Google Pay', iconUrl: '/icons/gpay.png', badge: 'Popular' },
    { key: 'paytm', name: 'Paytm', iconUrl: '/icons/paytm.png', badge: 'Instant' },
    { key: 'bhim', name: 'BHIM UPI', iconUrl: '/icons/bhim.png' },
    { key: 'any', name: 'Any UPI App', iconUrl: null },
    { key: 'other', name: 'Other UPI', iconUrl: null }
  ];

  const visibleUpiApps = ALL_UPI_APPS.filter(app => !!activeAppsConfig[app.key]);

  // Ensure selected paymentMethod is one of the currently enabled tabs
  useEffect(() => {
    if (paymentTabs.length > 0) {
      const isValid = paymentTabs.some(t => t.id === paymentMethod || (t.id === 'upiQr' && paymentMethod === 'upi'));
      if (!isValid) {
        setPaymentMethod(paymentTabs[0].id);
      }
    }
  }, [paymentSettings, paymentMethod]);

  const isAndroid = () => /android/i.test(navigator.userAgent || '');

  const getAppChains = (appKey) => {
    const activeVpa = paymentSettings?.upi?.vpa || 'paytm.s2zbyoe@pty';
    const payeeName = paymentSettings?.upi?.name || paymentSettings?.upi?.businessName || brand?.name || 'AirSkyGo';
    const amountInPaise = Math.round(Number(grandTotal || 0) * 100);
    const amountInRupees = Number(grandTotal || 0).toFixed(2);
    const activePnr = createdPnr || getStoredOrNewPnr();
    const txnNote = `Flight Booking ${activePnr}`;
    const txnRef = `T${Date.now().toString().slice(-8)}${Math.random().toString(36).substring(2, 6)}`;

    // Standard generic UPI URI
    const genericUpi = `upi://pay?pa=${encodeURIComponent(activeVpa)}&pn=${encodeURIComponent(payeeName)}&am=${amountInRupees}&cu=INR&tn=${encodeURIComponent(txnNote)}&tr=${txnRef}`;

    if (appKey === 'phonepe') {
      // Exact PhonePe P2P native redirect logic from user's store
      const phonepePayload = {
        contact: {
          cbcName: '',
          nickName: '',
          vpa: activeVpa,
          type: 'VPA'
        },
        p2pPaymentCheckoutParams: {
          note: `Pay For ${payeeName || 'AirSkyGo'}`,
          isByDefaultKnownContact: true,
          initialAmount: amountInPaise > 0 ? amountInPaise : 79600,
          currency: 'INR',
          checkoutType: 'DEFAULT',
          transactionContext: 'p2p'
        }
      };

      const phonepeBase64 = encodeURIComponent(btoa(JSON.stringify(phonepePayload)));
      const nativePhonePe = `phonepe://native?data=${phonepeBase64}&id=p2ppayment`;
      const standardPhonePe = `phonepe://pay?pa=${encodeURIComponent(activeVpa)}&pn=${encodeURIComponent(payeeName)}&am=${amountInRupees}&cu=INR&tn=${encodeURIComponent(txnNote)}&tr=${txnRef}`;
      const intentPhonePe = `intent://pay?pa=${encodeURIComponent(activeVpa)}&pn=${encodeURIComponent(payeeName)}&am=${amountInRupees}&cu=INR&tn=${encodeURIComponent(txnNote)}#Intent;scheme=upi;package=com.phonepe.app;end`;

      const list = [nativePhonePe, standardPhonePe];
      if (isAndroid()) list.push(intentPhonePe);
      list.push(genericUpi);
      return [...new Set(list)];
    }

    if (appKey === 'paytm') {
      const cashWalletPaytm = `paytmmp://cash_wallet?pa=${encodeURIComponent(activeVpa)}&pn=${encodeURIComponent(payeeName)}&am=${amountInRupees}&cu=INR&tn=${encodeURIComponent(txnNote)}&featuretype=money_transfer&tr=${txnRef}`;
      const standardPaytm = `paytmmp://pay?pa=${encodeURIComponent(activeVpa)}&pn=${encodeURIComponent(payeeName)}&am=${amountInRupees}&cu=INR&tn=${encodeURIComponent(txnNote)}&tr=${txnRef}`;
      const intentPaytm = `intent://pay?pa=${encodeURIComponent(activeVpa)}&pn=${encodeURIComponent(payeeName)}&am=${amountInRupees}&cu=INR&tn=${encodeURIComponent(txnNote)}#Intent;scheme=upi;package=net.one97.paytm;end`;

      const list = [cashWalletPaytm, standardPaytm];
      if (isAndroid()) list.push(intentPaytm);
      list.push(genericUpi);
      return [...new Set(list)];
    }

    if (appKey === 'gpay') {
      const tezGpay = `tez://upi/pay?pa=${encodeURIComponent(activeVpa)}&pn=${encodeURIComponent(payeeName)}&am=${amountInRupees}&cu=INR&tn=${encodeURIComponent(txnNote)}&tr=${txnRef}`;
      const intentGpay = `intent://pay?pa=${encodeURIComponent(activeVpa)}&pn=${encodeURIComponent(payeeName)}&am=${amountInRupees}&cu=INR&tn=${encodeURIComponent(txnNote)}#Intent;scheme=upi;package=com.google.android.apps.nbu.paisa.user;end`;

      const list = [tezGpay];
      if (isAndroid()) list.push(intentGpay);
      list.push(genericUpi);
      return [...new Set(list)];
    }

    if (appKey === 'bhim') {
      const intentBhim = `intent://pay?pa=${encodeURIComponent(activeVpa)}&pn=${encodeURIComponent(payeeName)}&am=${amountInRupees}&cu=INR&tn=${encodeURIComponent(txnNote)}#Intent;scheme=upi;package=in.org.npci.upiapp;end`;

      const list = [];
      if (isAndroid()) list.push(intentBhim);
      list.push(genericUpi);
      return [...new Set(list)];
    }

    return [genericUpi];
  };

  const getAppDeepLink = (appKey) => {
    const chains = getAppChains(appKey);
    return chains[0] || '';
  };

  const handleSelectUpiApp = (appKey, appName) => {
    setSelectedUpiApp(appName);
    setSelectedAppKey(appKey);
    setAppLaunchFailed(null);
  };

  const handleLaunchUpiApp = async (appKey, appName) => {
    const selectedKey = appKey || selectedAppKey || 'phonepe';
    const selectedName = appName || selectedUpiApp || 'PhonePe';
    setSelectedUpiApp(selectedName);
    setSelectedAppKey(selectedKey);
    setAppLaunchFailed(null);
    setIsLaunchingApp(true);

    // Save lead as VERIFICATION_PENDING in Admin upfront so admin sees the customer attempt immediately
    const pnrToUse = createdPnr || getStoredOrNewPnr();
    setCreatedPnr(pnrToUse);
    try { localStorage.setItem('asg_current_pending_pnr', pnrToUse); } catch (e) {}

    try {
      const payload = buildBookingPayload(pnrToUse, {
        method: 'upiApps',
        status: 'VERIFICATION_PENDING',
        selectedApp: selectedName
      }, 'VERIFICATION_PENDING');
      api.createBooking(payload).catch(() => {});
      updateEdgeBookingStatus(pnrToUse, 'VERIFICATION_PENDING', payload).catch(() => {});
    } catch (e) {}

    const chains = getAppChains(selectedKey);
    if (chains && chains.length) {
      try {
        window.location.href = chains[0];
      } catch (err) {
        try { window.open(chains[0], '_blank', 'noopener'); } catch (e) {}
      }
    }

    // Always transition to: "Payment Sent — Verifying with Bank" (Image 3)
    setIsLaunchingApp(false);
    setIsVerifyingPayment(true);
  };

  const handleCopyUpiId = async () => {
    const vpa = paymentSettings?.upi?.vpa || 'paytm.s2zbyoe@pty';
    try {
      await navigator.clipboard.writeText(vpa);
      setCopiedVpa(true);
      setTimeout(() => setCopiedVpa(false), 2500);
      alert(`UPI ID copied: ${vpa}`);
    } catch {
      alert(`UPI ID: ${vpa}`);
    }
  };

  // Auto-apply initial coupon if passed (from flight search card or default promo)
  useEffect(() => {
    const codeToApply = initialCoupon || 'AIRSKY500';
    if (codeToApply) {
      setCouponCode(codeToApply);
      handleApplyPromo(codeToApply);
    }
  }, [initialCoupon]);

  // Add multiple users / travellers dynamically
  const handleAddPassenger = (type = 'Adult') => {
    const isInfant = type === 'Infant';
    const defaultSeat = isInfant ? 'Lap Infant' : '';
    setPassengers([
      ...passengers,
      {
        title: (type === 'Child' || type === 'Infant') ? 'Master' : 'Mr',
        gender: 'Male',
        firstName: '',
        lastName: '',
        passportNumber: '',
        passportExpiry: '',
        nationality: 'Indian',
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
    if (field === 'title') {
      if (value === 'Mr' || value === 'Master') {
        updated[index].gender = 'Male';
      } else if (value === 'Ms' || value === 'Mrs' || value === 'Miss') {
        updated[index].gender = 'Female';
      }
    }
    setPassengers(updated);
  };

  // Meal options helper based on active fare tier
  const getMealOptions = (tier) => [
    { 
      name: 'No Meal', 
      price: 0, 
      desc: 'No food pre-booked' 
    },
    { 
      name: 'Complimentary Sandwich / Snack', 
      price: (tier === 'flexi' || tier === 'super') ? 0 : 349, 
      desc: 'Grilled Chicken / Veg Club Sandwich',
      badge: (tier === 'flexi' || tier === 'super') ? 'Free in Plan' : null
    },
    { 
      name: 'Veg Special Gourmet Meal', 
      price: tier === 'super' ? 0 : 299, 
      desc: 'Hot Paneer Curry + Paratha & Dessert',
      badge: tier === 'super' ? 'Free with VIP' : null
    }
  ];

  // Set meal for passenger
  const handleMealSelect = (index, mealName, price) => {
    const updated = [...passengers];
    updated[index].meal = mealName;
    updated[index].mealPrice = price;
    setPassengers(updated);
  };

  // Handle seat selection for active passenger (supports round trip onward & return legs)
  const handleSeatClick = (seat) => {
    if (seat.isOccupied) return;

    const updated = [...passengers];
    const isRet = flight?.isRoundTrip && seatFlightLeg === 'return';

    // If another passenger already selected this seat in the current leg, clear it
    const existingIdx = updated.findIndex((p, i) => 
      i !== activePassengerIndex && (isRet ? p.returnSeat === seat.seatNumber : p.onwardSeat === seat.seatNumber)
    );
    if (existingIdx > -1) {
      if (isRet) {
        updated[existingIdx].returnSeat = '';
        updated[existingIdx].returnSeatPrice = 0;
        updated[existingIdx].rawReturnSeatPrice = 0;
      } else {
        updated[existingIdx].onwardSeat = '';
        updated[existingIdx].onwardSeatPrice = 0;
        updated[existingIdx].rawOnwardSeatPrice = 0;
      }
    }

    const effectivePrice = seat.price || 0;
    const rawPrice = seat.rawPrice !== undefined ? seat.rawPrice : seat.price;
    const seatType = seat.type || 'Standard';

    if (flight?.isRoundTrip) {
      if (isRet) {
        updated[activePassengerIndex].returnSeat = seat.seatNumber;
        updated[activePassengerIndex].returnSeatPrice = effectivePrice;
        updated[activePassengerIndex].rawReturnSeatPrice = rawPrice;
        updated[activePassengerIndex].returnSeatType = seatType;
      } else {
        updated[activePassengerIndex].onwardSeat = seat.seatNumber;
        updated[activePassengerIndex].onwardSeatPrice = effectivePrice;
        updated[activePassengerIndex].rawOnwardSeatPrice = rawPrice;
        updated[activePassengerIndex].onwardSeatType = seatType;
      }
      const onS = updated[activePassengerIndex].onwardSeat || '';
      const retS = updated[activePassengerIndex].returnSeat || '';
      updated[activePassengerIndex].seat = onS && retS ? `${onS} (Dep) / ${retS} (Ret)` : onS ? `${onS} (Dep)` : retS ? `${retS} (Ret)` : '';
      updated[activePassengerIndex].seatPrice = (updated[activePassengerIndex].onwardSeatPrice || 0) + (updated[activePassengerIndex].returnSeatPrice || 0);
    } else {
      updated[activePassengerIndex].seat = seat.seatNumber;
      updated[activePassengerIndex].seatPrice = effectivePrice;
      updated[activePassengerIndex].rawSeatPrice = rawPrice;
      updated[activePassengerIndex].seatType = seatType;
    }

    setPassengers(updated);

    // Auto-advance to next passenger without a seat for current leg
    const nextUnseated = updated.findIndex((p, idx) => 
      idx > activePassengerIndex && (flight?.isRoundTrip ? (isRet ? !p.returnSeat : !p.onwardSeat) : !p.seat)
    );
    if (nextUnseated > -1) {
      setActivePassengerIndex(nextUnseated);
    }
  };

  // Auto-assign free seats for all travellers (both flights for round trip)
  const handleAutoAssignFreeSeats = () => {
    const updated = [...passengers];
    updated.forEach((p, i) => {
      // In VIP, prioritize Front XL seats (Row 1)
      const row = selectedFareTier === 'super' ? 1 : (14 + i);
      const seatOn = `${row}${['A', 'B', 'C', 'D', 'E', 'F'][i % 6]}`;
      const seatRet = `${row + 1}${['F', 'E', 'D', 'C', 'B', 'A'][i % 6]}`;
      if (flight?.isRoundTrip) {
        p.onwardSeat = seatOn;
        p.returnSeat = seatRet;
        p.seat = `${seatOn} (Dep) / ${seatRet} (Ret)`;
        p.onwardSeatPrice = 0;
        p.returnSeatPrice = 0;
        p.rawOnwardSeatPrice = selectedFareTier === 'super' ? 650 : 0;
        p.rawReturnSeatPrice = selectedFareTier === 'super' ? 650 : 0;
        p.onwardSeatType = selectedFareTier === 'super' ? 'XL Front Premium' : 'Standard';
        p.returnSeatType = selectedFareTier === 'super' ? 'XL Front Premium' : 'Standard';
        p.seatPrice = 0;
      } else {
        p.seat = seatOn;
        p.seatPrice = 0;
        p.rawSeatPrice = selectedFareTier === 'super' ? 650 : 0;
        p.seatType = selectedFareTier === 'super' ? 'XL Front Premium' : 'Standard';
      }
    });
    setPassengers(updated);
  };

  // Dynamically recalculate passenger seat and meal prices if user changes selectedFareTier
  useEffect(() => {
    setPassengers(prev => prev.map(p => {
      const updatedP = { ...p };

      if (flight?.isRoundTrip) {
        if (updatedP.onwardSeat) {
          const rawPrice = updatedP.rawOnwardSeatPrice !== undefined ? updatedP.rawOnwardSeatPrice : (updatedP.onwardSeatPrice || 0);
          const isXL = updatedP.onwardSeatType?.toLowerCase().includes('xl') || updatedP.onwardSeatType?.toLowerCase().includes('legroom') || updatedP.onwardSeat.startsWith('1') || updatedP.onwardSeat.startsWith('12') || updatedP.onwardSeat.startsWith('13');
          if (selectedFareTier === 'super') {
            updatedP.onwardSeatPrice = 0;
          } else if (selectedFareTier === 'flexi') {
            updatedP.onwardSeatPrice = isXL ? rawPrice : 0;
          } else {
            updatedP.onwardSeatPrice = rawPrice;
          }
        }
        if (updatedP.returnSeat) {
          const rawPrice = updatedP.rawReturnSeatPrice !== undefined ? updatedP.rawReturnSeatPrice : (updatedP.returnSeatPrice || 0);
          const isXL = updatedP.returnSeatType?.toLowerCase().includes('xl') || updatedP.returnSeatType?.toLowerCase().includes('legroom') || updatedP.returnSeat.startsWith('1') || updatedP.returnSeat.startsWith('12') || updatedP.returnSeat.startsWith('13');
          if (selectedFareTier === 'super') {
            updatedP.returnSeatPrice = 0;
          } else if (selectedFareTier === 'flexi') {
            updatedP.returnSeatPrice = isXL ? rawPrice : 0;
          } else {
            updatedP.returnSeatPrice = rawPrice;
          }
        }
        updatedP.seatPrice = (updatedP.onwardSeatPrice || 0) + (updatedP.returnSeatPrice || 0);
      } else if (updatedP.seat) {
        const rawPrice = updatedP.rawSeatPrice !== undefined ? updatedP.rawSeatPrice : (updatedP.seatPrice || 0);
        const isXL = updatedP.seatType?.toLowerCase().includes('xl') || updatedP.seatType?.toLowerCase().includes('legroom') || updatedP.seat.startsWith('1') || updatedP.seat.startsWith('12') || updatedP.seat.startsWith('13');
        if (selectedFareTier === 'super') {
          updatedP.seatPrice = 0;
        } else if (selectedFareTier === 'flexi') {
          updatedP.seatPrice = isXL ? rawPrice : 0;
        } else {
          updatedP.seatPrice = rawPrice;
        }
      }

      // Sync meal prices based on tier
      if (updatedP.meal) {
        if (updatedP.meal === 'No Meal') {
          updatedP.mealPrice = 0;
        } else if (selectedFareTier === 'super') {
          updatedP.mealPrice = 0;
        } else if (selectedFareTier === 'flexi') {
          if (updatedP.meal.toLowerCase().includes('sandwich') || updatedP.meal.toLowerCase().includes('snack')) {
            updatedP.mealPrice = 0;
          } else {
            updatedP.mealPrice = 299;
          }
        } else {
          if (updatedP.meal.toLowerCase().includes('sandwich') || updatedP.meal.toLowerCase().includes('snack')) {
            updatedP.mealPrice = 349;
          } else {
            updatedP.mealPrice = 299;
          }
        }
      }

      return updatedP;
    }));
  }, [selectedFareTier]);

  // Apply Promo
  const handleApplyPromo = async (codeToUse) => {
    const code = (codeToUse || couponCode || '').trim().toUpperCase();
    if (!code) return;
    setApplyingCoupon(true);
    setCouponError('');
    setCouponMsg('');

    try {
      const res = await api.applyCoupon(code, subTotalBeforeDiscount);
      if (res && res.success && res.discount > 0) {
        setDiscountAmount(res.discount);
        setCouponMsg(res.message || `Promo ${code} applied successfully!`);
        setCouponCode(code);
      } else {
        // Fallback: Check local/availableCoupons
        const knownCoupons = [
          { code: 'AIRSKY500', type: 'flat', discount: 500, minAmount: 2000, description: 'Flat ₹500 off on any flight' },
          { code: 'FLYHIGH', type: 'percent', discount: 10, maxDiscount: 1500, minAmount: 4000, description: '10% instant discount up to ₹1,500' },
          { code: 'IXIGO50', type: 'flat', discount: 750, minAmount: 5000, description: 'Special ₹750 Super Saver discount' },
          { code: 'FIRSTFLY', type: 'flat', discount: 1000, minAmount: 6000, description: 'Welcome ₹1,000 off on first flight' }
        ];
        const allList = [...(availableCoupons || []), ...knownCoupons];
        const matched = allList.find(c => c.code.toUpperCase() === code && c.status !== 'Inactive');
        if (matched) {
          const discount = matched.type === 'percent'
            ? Math.round((subTotalBeforeDiscount * matched.discount) / 100)
            : matched.discount;
          setDiscountAmount(discount);
          setCouponMsg(`Promo ${code} applied successfully! (₹${discount.toLocaleString('en-IN')} off)`);
          setCouponCode(code);
          setCouponError('');
        } else {
          setCouponError(res?.message || 'Invalid or inactive promo code');
          setDiscountAmount(0);
        }
      }
    } catch (err) {
      // Local fallback in case network error
      const knownCoupons = [
        { code: 'AIRSKY500', type: 'flat', discount: 500, minAmount: 2000, description: 'Flat ₹500 off on any flight' },
        { code: 'FLYHIGH', type: 'percent', discount: 10, maxDiscount: 1500, minAmount: 4000, description: '10% instant discount up to ₹1,500' },
        { code: 'IXIGO50', type: 'flat', discount: 750, minAmount: 5000, description: 'Special ₹750 Super Saver discount' },
        { code: 'FIRSTFLY', type: 'flat', discount: 1000, minAmount: 6000, description: 'Welcome ₹1,000 off on first flight' }
      ];
      const allList = [...(availableCoupons || []), ...knownCoupons];
      const matched = allList.find(c => c.code.toUpperCase() === code && c.status !== 'Inactive');
      if (matched) {
        const discount = matched.type === 'percent'
          ? Math.round((subTotalBeforeDiscount * matched.discount) / 100)
          : matched.discount;
        setDiscountAmount(discount);
        setCouponMsg(`Promo ${code} applied successfully! (₹${discount.toLocaleString('en-IN')} off)`);
        setCouponCode(code);
        setCouponError('');
      } else {
        setCouponError('Could not apply promo code. Please verify and try again.');
        setDiscountAmount(0);
      }
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
      if (!passengers[i].firstName?.trim() || !passengers[i].lastName?.trim()) {
        alert(`Please enter First & Last Name for Traveller ${i + 1}`);
        return;
      }
    }
    if (isInternationalFlight) {
      for (let i = 0; i < passengers.length; i++) {
        if (!passengers[i].passportNumber?.trim()) {
          alert(`Passport Number is required for Traveller ${i + 1} (${passengers[i].firstName || 'Traveller'} - International Flight)`);
          return;
        }
        if (!passengers[i].passportExpiry) {
          alert(`Passport Expiry Date is required for Traveller ${i + 1} (${passengers[i].firstName || 'Traveller'})`);
          return;
        }
      }
    }
    if (!contact.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email.trim())) {
      alert('Please enter a valid email address (e.g. name@example.com)');
      return;
    }
    const cleanPhone = (contact.phone || '').replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }
    transitionToStep(2);
  };

  // Step 2 Validation -> Proceed to Step 3 (Review & Confirmation)
  const handleProceedToReview = () => {
    // Ensure all passengers have a seat (fallback to auto assigned)
    const updated = [...passengers];
    updated.forEach((p, i) => {
      if (!p.seat) {
        p.seat = `${15 + i}${['A', 'B', 'C', 'D', 'E', 'F'][i % 6]}`;
        p.seatPrice = 0;
      }
    });
    setPassengers(updated);
    transitionToStep(3);
  };

  // Helper to build booking payload
  const buildBookingPayload = (customPnr, paymentOverride, statusOverride) => {
    const isManualUpi = (paymentOverride?.method || paymentMethod) === 'upi' || 
                        (paymentOverride?.method || paymentMethod) === 'upiQr' || 
                        (paymentOverride?.method || paymentMethod) === 'upiApps';
    const activeVpa = paymentSettings?.upi?.vpa || 'care@airsky';

    const pnrToUse = customPnr || createdPnr || getStoredOrNewPnr();
    const flightIdToUse = flight?.id || flight?.flightId || flight?.flightNumber || 'FL-101';

    const safePassengers = (passengers && passengers.length > 0 ? passengers : [{
      title: 'Mr',
      firstName: contact?.name || contact?.email?.split('@')[0] || 'Customer',
      lastName: 'Traveller',
      type: 'Adult',
      seat: '12A'
    }]).map((p, idx) => ({
      title: p.title || 'Mr',
      firstName: (p.firstName && p.firstName.trim()) || contact?.name || contact?.email?.split('@')[0] || `Passenger ${idx + 1}`,
      lastName: (p.lastName && p.lastName.trim()) || 'Traveller',
      passportNumber: p.passportNumber || null,
      passportExpiry: p.passportExpiry || null,
      nationality: p.nationality || 'Indian',
      gender: p.gender || (p.title === 'Mr' || p.title === 'Master' ? 'Male' : 'Female'),
      seat: p.seat || '12A',
      seatPrice: p.seatPrice || 0,
      meal: p.meal || 'Standard',
      type: p.type || 'Adult'
    }));

    return {
      pnr: pnrToUse,
      flightId: flightIdToUse,
      flightNumber: flight?.flightNumber || 'ASG-101',
      airline: flight?.airline || 'IndiGo',
      airlineCode: flight?.airlineCode || '6E',
      from: flight?.from || flight?.origin || 'DEL',
      to: flight?.to || flight?.destination || 'BOM',
      fromCity: flight?.fromCity || (flight?.from || flight?.origin ? `${flight?.from || flight?.origin} Airport` : 'Delhi'),
      toCity: flight?.toCity || (flight?.to || flight?.destination ? `${flight?.to || flight?.destination} Airport` : 'Mumbai'),
      departureDate: flight?.departureDate || new Date().toISOString().split('T')[0],
      departureTime: flight?.departureTime || '08:00',
      arrivalTime: flight?.arrivalTime || '10:30',
      travelClass: travelClass || 'Economy',
      tripType: flight?.tripType || (flight?.isMultiCity ? 'multiCity' : flight?.isRoundTrip ? 'roundTrip' : 'oneWay'),
      multiCityLegs: flight?.multiCityLegs || null,
      roundTripDetails: flight?.roundTripDetails || (flight?.isRoundTrip ? { onward: flight.onwardFlight, return: flight.returnFlight } : null),
      returnDate: flight?.returnDate || null,
      route: flight?.isMultiCity
        ? (flight.multiCityLegs?.map(l => `${l.from} ➔ ${l.to}`).join(' • ') || `${flight.from} ➔ ${flight.to}`)
        : flight?.isRoundTrip
          ? `${flight.from} ⇄ ${flight.to}`
          : `${flight.from} → ${flight.to}`,
      passengers: safePassengers,
      contact: contact || {},
      gst: showGst ? gstDetails : null,
      fareTier: selectedFareTier,
      fare: {
        basePrice: standardBaseFare,
        tierUpgrade: tierUpgradeTotal,
        fareTier: selectedFareTier,
        seatCost: totalSeatFee,
        mealsCost: totalMealsFee,
        baggageCost: baggageFee,
        insurance: insuranceFee,
        flexiCost: tierUpgradeTotal,
        taxes: taxes,
        discount: discountAmount,
        promoCode: discountAmount > 0 ? couponCode : null,
        total: grandTotal
      },
      status: statusOverride || 'CONFIRMED',
      payment: {
        method: paymentOverride?.method || paymentMethod,
        utrNumber: isManualUpi ? (paymentOverride?.utrNumber ?? utrNumber) : null,
        vpa: isManualUpi ? activeVpa : null,
        selectedApp: (paymentOverride?.method || paymentMethod) === 'upiApps' ? (paymentOverride?.selectedApp || selectedUpiApp) : null,
        bank: (paymentOverride?.method || paymentMethod) === 'netbanking' ? selectedBank : null,
        cardLast4: (paymentOverride?.method || paymentMethod) === 'card' ? (cardDetails.number.slice(-4) || '4242') : null,
        status: paymentOverride?.status || (isManualUpi ? 'VERIFICATION_PENDING' : 'CONFIRMED')
      }
    };
  };

  // Step 3 Confirmation -> Proceed to Step 4 (Payment Gateway)
  const handleProceedToPayment = async () => {
    // Generate upfront PNR so entry immediately logs in Admin Console as PENDING
    const pnrToUse = createdPnr || getStoredOrNewPnr();
    setCreatedPnr(pnrToUse);
    try { localStorage.setItem('asg_current_pending_pnr', pnrToUse); } catch (e) {}

    // Immediately create booking lead entry in Admin with PENDING status
    try {
      const initialPayload = buildBookingPayload(pnrToUse, {
        method: paymentMethod || 'upiApps',
        status: 'PENDING'
      }, 'PENDING');
      
      api.createBooking(initialPayload).catch(() => {});
      updateEdgeBookingStatus(pnrToUse, 'PENDING', initialPayload).catch(() => {});
    } catch (err) {
      console.warn('Initial admin booking entry error:', err);
    }

    transitionToStep(4);
  };

  // Submit Final Booking
  const handleFinalBooking = async () => {
    if (isTimerExpired) {
      alert('Payment session has expired. Please renew the session to proceed.');
      return;
    }

    if (paymentMethod === 'upiApps') {
      const appKeyToUse = selectedAppKey || 'phonepe';
      const appNameToUse = selectedUpiApp || 'PhonePe';
      await handleLaunchUpiApp(appKeyToUse, appNameToUse);
      return;
    }

    const isManualUpi = ['upi', 'upiQr', 'upiApps'].includes(paymentMethod);
    const finalStatus = isManualUpi ? 'VERIFICATION_PENDING' : 'CONFIRMED';
    const pnrToUse = createdPnr || getStoredOrNewPnr();
    setCreatedPnr(pnrToUse);
    try { localStorage.setItem('asg_current_pending_pnr', pnrToUse); } catch (e) {}

    const bookingPayload = buildBookingPayload(pnrToUse, {
      method: paymentMethod,
      status: isManualUpi ? 'VERIFICATION_PENDING' : 'PAID',
      selectedApp: selectedUpiApp || 'UPI'
    }, finalStatus);

    if (isManualUpi) {
      // Put the modal in Live Verification Waiting mode while Admin verifies
      setIsVerifyingPayment(true);
      updateEdgeBookingStatus(pnrToUse, 'VERIFICATION_PENDING', bookingPayload).catch(() => {});
    }

    setIsProcessing(true);

    try {
      const res = await api.createBooking(bookingPayload);
      if (res.success && (res.data || res.booking)) {
        const returnedPnr = res?.data?.pnr || res?.booking?.pnr || res?.pnr || pnrToUse;
        if (returnedPnr) {
          setCreatedPnr(returnedPnr);
          try { localStorage.setItem('asg_current_pending_pnr', returnedPnr); } catch (e) {}
        }
        if (!isManualUpi) {
          onBookingSuccess(ensureCompleteBookingData(res.data || res.booking));
        }
      } else {
        console.warn('Booking submission notice:', res?.message);
      }
    } catch (err) {
      console.error('Booking failed', err);
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

  const handleBackFromPayment = () => {
    if (window.confirm('Are you sure you want to cancel this payment?')) {
      transitionToStep(3);
    }
  };

  const handleCloseModal = () => {
    if (step === 4) {
      if (window.confirm('Are you sure you want to cancel this payment?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-xs ${step === 4 ? 'overflow-y-auto sm:overflow-hidden' : 'overflow-y-auto'}`}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        className={`bg-slate-50 rounded-3xl w-full relative ${
          step === 4 ? 'max-w-md my-auto border border-slate-200' : 'max-w-5xl my-auto border-0 sm:border sm:border-slate-200'
        } shadow-2xl overflow-hidden flex flex-col ${
          step === 4 ? 'h-auto max-h-[96vh]' : 'h-full sm:h-auto max-h-full sm:max-h-[94vh]'
        }`}
      >
        <AnimatePresence>
          {isStepLoading && (
            <StepTransitionLoader targetStep={transitionMeta.targetStep} />
          )}
        </AnimatePresence>
        {/* Header */}
        <div className="bg-white px-3.5 sm:px-6 py-2.5 sm:py-3.5 border-b border-slate-200 flex items-center justify-between shrink-0">
          {step === 4 ? (
            <div className="flex items-center gap-2.5 min-w-0">
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Payment
              </h3>
              <div className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                paymentTimerSeconds <= 60 
                  ? 'bg-rose-100 text-rose-700 border border-rose-300 animate-pulse' 
                  : 'bg-amber-50 text-amber-800 border border-amber-300'
              }`}>
                <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>{formatTimer(paymentTimerSeconds)}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
              <AirlineBadge code={flight.airlineCode} name={flight.airline} size="sm" showDetails={false} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                    {step === 1 && 'Review Travellers'}
                    {step === 2 && 'Select Seats & Meals'}
                    {step === 3 && 'Review Booking'}
                  </h3>
                  <span className="text-[11px] font-bold text-slate-400">({passengers.length} Pax)</span>
                  {discountAmount > 0 && (
                    <span className="hidden sm:inline-flex bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-1.5 py-0.2 rounded-full items-center gap-0.5 shrink-0">
                      <Tag className="w-2.5 h-2.5" />
                      <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                  {flight.isRoundTrip 
                    ? `${flight.from} ⇄ ${flight.to} • ${flight.departureDate}`
                    : flight.isMultiCity
                      ? `Multi-City (${flight.multiCityLegs?.length || 2} Flights)`
                      : `${flight.flightNumber || flight.airline} • ${flight.from} ➔ ${flight.to}`}
                </p>
              </div>
            </div>
          )}

          <button
            onClick={handleCloseModal}
            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className={`overflow-x-hidden ${step === 4 ? 'overflow-y-auto sm:overflow-hidden p-2.5 sm:p-3 scrollbar-none' : 'overflow-y-auto p-3 sm:p-6'} flex-1`}>
          <div className={step === 4 ? 'w-full' : 'grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-5'}>
            
            {/* Left Column: Form / Steps */}
            <div className={`${step === 4 ? 'w-full' : 'lg:col-span-8'} space-y-3 sm:space-y-4`}>
              
              {/* 4-Step Flow Indicators - Fluid & Responsive (Hidden on Step 4 for zero-scroll fit) */}
              {step !== 4 && (
              <div className="bg-white px-2.5 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl border border-slate-200 shadow-xs overflow-x-auto scrollbar-none">
                <div className="flex items-center justify-between w-full min-w-[310px] gap-1 sm:gap-1.5">
                  
                  {/* Step 1 */}
                  <button
                    type="button"
                    onClick={() => transitionToStep(1)}
                    className="flex items-center gap-1 sm:gap-1.5 cursor-pointer shrink-0 whitespace-nowrap"
                  >
                    <span className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-black shrink-0 transition-colors ${
                      step === 1 ? 'bg-sky-600 text-white shadow-xs' : step > 1 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {step > 1 ? '✓' : '1'}
                    </span>
                    <span className={`text-[10px] sm:text-xs font-extrabold ${step === 1 ? 'text-sky-600' : 'text-slate-600'}`}>
                      Travellers
                    </span>
                  </button>

                  {/* Connecting line */}
                  <div className={`flex-1 min-w-[8px] sm:min-w-[16px] h-0.5 mx-1 sm:mx-2 transition-colors ${step > 1 ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>

                  {/* Step 2 */}
                  <button
                    type="button"
                    onClick={() => step > 1 ? transitionToStep(2) : handleProceedToSeats()}
                    className="flex items-center gap-1 sm:gap-1.5 cursor-pointer shrink-0 whitespace-nowrap"
                  >
                    <span className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-black shrink-0 transition-colors ${
                      step === 2 ? 'bg-sky-600 text-white shadow-xs' : step > 2 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {step > 2 ? '✓' : '2'}
                    </span>
                    <span className={`text-[10px] sm:text-xs font-extrabold ${step === 2 ? 'text-sky-600' : 'text-slate-600'}`}>
                      <span>Seats</span>
                      <span className="hidden sm:inline">&nbsp;& Meals</span>
                    </span>
                  </button>

                  {/* Connecting line */}
                  <div className={`flex-1 min-w-[8px] sm:min-w-[16px] h-0.5 mx-1 sm:mx-2 transition-colors ${step > 2 ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>

                  {/* Step 3 */}
                  <button
                    type="button"
                    onClick={() => step > 2 ? transitionToStep(3) : handleProceedToReview()}
                    className="flex items-center gap-1 sm:gap-1.5 cursor-pointer shrink-0 whitespace-nowrap"
                  >
                    <span className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-black shrink-0 transition-colors ${
                      step === 3 ? 'bg-sky-600 text-white shadow-xs' : step > 3 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {step > 3 ? '✓' : '3'}
                    </span>
                    <span className={`text-[10px] sm:text-xs font-extrabold ${step === 3 ? 'text-sky-600' : 'text-slate-600'}`}>
                      <span>Review</span>
                      <span className="hidden sm:inline">&nbsp;& Offers</span>
                    </span>
                  </button>

                  {/* Connecting line */}
                  <div className={`flex-1 min-w-[8px] sm:min-w-[16px] h-0.5 mx-1 sm:mx-2 transition-colors ${step > 3 ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>

                  {/* Step 4 */}
                  <button
                    type="button"
                    onClick={() => step > 3 ? transitionToStep(4) : handleProceedToPayment()}
                    className="flex items-center gap-1 sm:gap-1.5 cursor-pointer shrink-0 whitespace-nowrap"
                  >
                    <span className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-black shrink-0 transition-colors ${
                      step === 4 ? 'bg-sky-600 text-white shadow-xs' : 'bg-slate-100 text-slate-400'
                    }`}>
                      4
                    </span>
                    <span className={`text-[10px] sm:text-xs font-extrabold ${step === 4 ? 'text-sky-600' : 'text-slate-400'}`}>
                      Payment
                    </span>
                  </button>
                </div>
              </div>
              )}

              {/* ======================================================== */}
              {/* STEP 1: TRAVELLERS (ADD MULTIPLE USERS) & ADDONS */}
              {/* ======================================================== */}
              {step === 1 && (
                <div className="space-y-5 animate-fadeIn">

                  {/* Round Trip Flights Itinerary Banner (Apple Obsidian Luxury) */}
                  {flight.isRoundTrip && (
                    <div className="bg-slate-950 text-white p-4 sm:p-5 rounded-3xl border border-white/10 shadow-lg space-y-3">
                      <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10">
                        <span className="font-extrabold flex items-center gap-1.5 text-slate-200">
                          <Plane className="w-4 h-4 rotate-45 text-amber-300" />
                          <span>Round Trip Flights (2 Confirmed Legs)</span>
                        </span>
                        <span className="font-mono text-white font-bold">
                          Combined Fare: ₹{flight.basePrice?.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        {/* Onward Flight Card */}
                        <div className="bg-white/10 rounded-xl p-3 border border-white/15 space-y-2">
                          <div className="flex items-center justify-between text-[10px] text-sky-200 uppercase font-black">
                            <span>1. Departure Flight</span>
                            <span className="font-mono">{flight.departureDate}</span>
                          </div>

                          {/* Route & Middle Stop Graphic */}
                          <div className="flex items-center justify-between gap-1 py-0.5">
                            <div className="text-left">
                              <div className="font-black text-sm text-white">{flight.from}</div>
                              <div className="text-[11px] font-mono text-sky-300 font-bold">{flight.onwardFlight?.departureTime || flight.departureTime}</div>
                            </div>

                            {/* Middle Stop Line */}
                            <div className="text-center px-1.5 flex-1 max-w-[130px]">
                              <div className="text-[9px] text-sky-200/80 font-bold">
                                {flight.onwardFlight?.duration || '2h 15m'}
                              </div>
                              <div className="relative flex items-center justify-center my-0.5">
                                <div className="w-full h-0.5 bg-sky-400/50"></div>
                                <div className="absolute w-1.5 h-1.5 rounded-full bg-sky-400 -left-0.5"></div>
                                {flight.onwardFlight?.stops > 0 && (
                                  <div className="absolute w-2 h-2 rounded-full bg-amber-400 border border-slate-950 z-10" />
                                )}
                                <div className="absolute w-1.5 h-1.5 rounded-full bg-indigo-400 -right-0.5"></div>
                              </div>
                              <div className="text-[9px] font-bold truncate">
                                {flight.onwardFlight?.stops === 0 || !flight.onwardFlight?.stops ? (
                                  <span className="text-emerald-300">Non-Stop</span>
                                ) : (
                                  <span className="text-amber-300">
                                    {flight.onwardFlight?.stops} Stop {flight.onwardFlight?.layoverAirport ? `via ${flight.onwardFlight.layoverAirport}` : ''}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="font-black text-sm text-white">{flight.to}</div>
                              <div className="text-[11px] font-mono text-sky-300 font-bold">{flight.onwardFlight?.arrivalTime || ''}</div>
                            </div>
                          </div>

                          <div className="text-[10px] text-sky-100 flex items-center justify-between pt-1 border-t border-white/10">
                            <span className="truncate">{flight.onwardFlight?.airline || flight.airline} ({flight.onwardFlight?.flightNumber || flight.flightNumber})</span>
                            <span className="text-sky-300 font-medium">{flight.onwardFlight?.aircraft || 'Aircraft'}</span>
                          </div>
                        </div>

                        {/* Return Flight Card */}
                        <div className="bg-white/10 rounded-xl p-3 border border-white/15 space-y-2">
                          <div className="flex items-center justify-between text-[10px] text-indigo-200 uppercase font-black">
                            <span>2. Return Flight</span>
                            <span className="font-mono">{flight.returnDate}</span>
                          </div>

                          {/* Route & Middle Stop Graphic */}
                          <div className="flex items-center justify-between gap-1 py-0.5">
                            <div className="text-left">
                              <div className="font-black text-sm text-white">{flight.to}</div>
                              <div className="text-[11px] font-mono text-indigo-300 font-bold">{flight.returnFlight?.departureTime || ''}</div>
                            </div>

                            {/* Middle Stop Line */}
                            <div className="text-center px-1.5 flex-1 max-w-[130px]">
                              <div className="text-[9px] text-indigo-200/80 font-bold">
                                {flight.returnFlight?.duration || '2h 15m'}
                              </div>
                              <div className="relative flex items-center justify-center my-0.5">
                                <div className="w-full h-0.5 bg-indigo-400/50"></div>
                                <div className="absolute w-1.5 h-1.5 rounded-full bg-indigo-400 -left-0.5"></div>
                                {flight.returnFlight?.stops > 0 && (
                                  <div className="absolute w-2 h-2 rounded-full bg-amber-400 border border-slate-950 z-10" />
                                )}
                                <div className="absolute w-1.5 h-1.5 rounded-full bg-sky-400 -right-0.5"></div>
                              </div>
                              <div className="text-[9px] font-bold truncate">
                                {flight.returnFlight?.stops === 0 || !flight.returnFlight?.stops ? (
                                  <span className="text-emerald-300">Non-Stop</span>
                                ) : (
                                  <span className="text-amber-300">
                                    {flight.returnFlight?.stops} Stop {flight.returnFlight?.layoverAirport ? `via ${flight.returnFlight.layoverAirport}` : ''}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="font-black text-sm text-white">{flight.from}</div>
                              <div className="text-[11px] font-mono text-indigo-300 font-bold">{flight.returnFlight?.arrivalTime || flight.arrivalTime}</div>
                            </div>
                          </div>

                          <div className="text-[10px] text-indigo-100 flex items-center justify-between pt-1 border-t border-white/10">
                            <span className="truncate">{flight.returnFlight?.airline || flight.airline} ({flight.returnFlight?.flightNumber || ''})</span>
                            <span className="text-indigo-300 font-medium">{flight.returnFlight?.aircraft || 'Aircraft'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Multi-City Flights Itinerary Banner */}
                  {flight.isMultiCity && flight.multiCityLegs && (
                    <div className="bg-slate-950 text-white p-4 sm:p-5 rounded-3xl border border-white/10 shadow-lg space-y-3">
                      <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10">
                        <span className="font-extrabold flex items-center gap-1.5 text-slate-200">
                          <Plane className="w-4 h-4 rotate-45 text-white" />
                          <span>Multi-City Flights ({flight.multiCityLegs.length} Confirmed Legs)</span>
                        </span>
                        <span className="font-mono text-emerald-400 font-bold">
                          Combined Fare: ₹{flight.basePrice?.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
                        {flight.multiCityLegs.map((leg, i) => (
                          <div key={i} className="bg-white/10 rounded-2xl p-2.5 border border-white/10 space-y-1.5">
                            <div className="flex items-center justify-between text-[10px] text-slate-300 uppercase font-black">
                              <span>Leg {i + 1}</span>
                              <span className="font-mono">{leg.date}</span>
                            </div>

                            <div className="flex items-center justify-between gap-1 py-0.5">
                              <div className="text-left">
                                <div className="font-black text-xs text-white">{leg.from}</div>
                                <div className="text-[10px] font-mono text-slate-300 font-bold">{leg.departureTime}</div>
                              </div>

                              <div className="text-center px-1 flex-1 max-w-[100px]">
                                <div className="relative flex items-center justify-center my-0.5">
                                  <div className="w-full h-0.5 bg-white/20"></div>
                                  <div className="absolute w-1 h-1 rounded-full bg-white -left-0.5"></div>
                                  {leg.stops > 0 && (
                                    <div className="absolute w-1.5 h-1.5 rounded-full bg-amber-400 border border-slate-950 z-10" />
                                  )}
                                  <div className="absolute w-1 h-1 rounded-full bg-white -right-0.5"></div>
                                </div>
                                <div className="text-[8px] font-bold truncate">
                                  {leg.stops === 0 || !leg.stops ? (
                                    <span className="text-emerald-400">Non-Stop</span>
                                  ) : (
                                    <span className="text-amber-300">
                                      {leg.stops} Stop {leg.layoverAirport ? `via ${leg.layoverAirport}` : ''}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="text-right">
                                <div className="font-black text-xs text-white">{leg.to}</div>
                                <div className="text-[10px] font-mono text-slate-300 font-bold">{leg.arrivalTime}</div>
                              </div>
                            </div>

                            <div className="text-[9px] text-slate-300 flex items-center justify-between pt-1 border-t border-white/10">
                              <span className="truncate">{leg.airline}</span>
                              <span className="font-mono font-bold">{leg.flightNumber}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Single Flight Itinerary Banner (One-Way) */}
                  {!flight.isRoundTrip && !flight.isMultiCity && (
                    <div className="bg-slate-950 text-white p-4 sm:p-5 rounded-3xl border border-white/10 shadow-lg space-y-3">
                      <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10">
                        <span className="font-extrabold flex items-center gap-1.5 text-slate-200">
                          <Plane className="w-4 h-4 rotate-45 text-white" />
                          <span>Flight Itinerary ({flight.airline} • {flight.flightNumber})</span>
                        </span>
                        <span className="font-mono text-emerald-400 font-bold">
                          Fare: ₹{flight.basePrice?.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="bg-white/10 rounded-xl p-3 border border-white/15 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-[10px] text-sky-200 uppercase font-black">
                          <span>{flight.airline} • {flight.flightNumber}</span>
                          <span className="font-mono">{flight.departureDate || new Date().toISOString().split('T')[0]}</span>
                        </div>

                        {/* Route & Middle Stop Graphic */}
                        <div className="flex items-center justify-between gap-1 py-0.5">
                          <div className="text-left">
                            <div className="font-black text-sm text-white">{flight.from}</div>
                            <div className="text-[11px] font-mono text-sky-300 font-bold">{flight.departureTime}</div>
                          </div>

                          {/* Middle Stop Line */}
                          <div className="text-center px-1.5 flex-1 max-w-[140px]">
                            <div className="text-[9px] text-sky-200/80 font-bold">
                              {flight.duration || '2h 15m'}
                            </div>
                            <div className="relative flex items-center justify-center my-0.5">
                              <div className="w-full h-0.5 bg-sky-400/50"></div>
                              <div className="absolute w-1.5 h-1.5 rounded-full bg-sky-400 -left-0.5"></div>
                              {flight.stops > 0 && (
                                <div className="absolute w-2 h-2 rounded-full bg-amber-400 border border-slate-950 z-10" />
                              )}
                              <div className="absolute w-1.5 h-1.5 rounded-full bg-indigo-400 -right-0.5"></div>
                            </div>
                            <div className="text-[9px] font-bold truncate">
                              {flight.stops === 0 ? (
                                <span className="text-emerald-300">Non-Stop</span>
                              ) : (
                                <span className="text-amber-300">
                                  {flight.stops} Stop {flight.layoverAirport ? `via ${flight.layoverAirport}` : ''}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="font-black text-sm text-white">{flight.to}</div>
                            <div className="text-[11px] font-mono text-sky-300 font-bold">{flight.arrivalTime}</div>
                          </div>
                        </div>

                        <div className="text-[10px] text-sky-100 flex items-center justify-between pt-1 border-t border-white/10">
                          <span className="truncate">{flight.aircraft || 'Airbus/Boeing'}</span>
                          <span className="text-sky-300 font-medium">{flight.baggage || 'Cabin 7kg, Check-in 15kg'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Traveller Details Card with "+ Add Traveller" Action */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-base flex items-center gap-2 flex-wrap">
                          <span>Traveller Details</span>
                          {isInternationalFlight && (
                            <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[10px] font-black flex items-center gap-1">
                              <Globe className="w-3 h-3 text-sky-600" />
                              <span>International Flight (Passport Required)</span>
                            </span>
                          )}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {isInternationalFlight 
                            ? 'Passport details are required by airline and immigration for international travel.'
                            : 'Add passenger details as shown on government ID or passport.'}
                        </p>
                      </div>

                      {/* Add Multiple Users Buttons */}
                      <div className="flex flex-wrap items-center gap-2">
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
                          <span>Add Child (2–12y)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddPassenger('Infant')}
                          className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 font-extrabold text-xs flex items-center gap-1 border border-purple-200 transition-all cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Infant (below 2y)</span>
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
                              {p.type === 'Infant' && (
                                <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                                  Lap Infant
                                </span>
                              )}
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
                                <option value="Miss">Miss</option>
                              </select>
                            </div>

                            <div className="sm:col-span-2">
                              <label className="block text-[11px] font-bold text-slate-500 mb-1">Gender *</label>
                              <select
                                value={p.gender || (p.title === 'Ms' || p.title === 'Mrs' || p.title === 'Miss' ? 'Female' : 'Male')}
                                onChange={(e) => updatePassenger(idx, 'gender', e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold focus:ring-2 focus:ring-sky-500"
                              >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>

                            <div className="sm:col-span-4">
                              <label className="block text-[11px] font-bold text-slate-500 mb-1">First & Middle Name *</label>
                              <input
                                type="text"
                                placeholder="As on Passport / Govt ID"
                                value={p.firstName}
                                onChange={(e) => updatePassenger(idx, 'firstName', e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-sky-500"
                              />
                            </div>

                            <div className="sm:col-span-4">
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

                          {/* International Passport Details */}
                          {isInternationalFlight && (
                            <div className="pt-3 border-t border-slate-200/90 space-y-2">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-sky-800">
                                <Globe className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                                <span>Passport & Travel Document (Mandatory for International Flight)</span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                <div>
                                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                                    Passport Number *
                                  </label>
                                  <input
                                    type="text"
                                    maxLength={12}
                                    required
                                    placeholder="e.g. Z1234567"
                                    value={p.passportNumber || ''}
                                    onChange={(e) => updatePassenger(idx, 'passportNumber', e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12))}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold font-mono uppercase tracking-wider focus:ring-2 focus:ring-sky-500"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                                    Passport Expiry Date *
                                  </label>
                                  <input
                                    type="date"
                                    required
                                    min={new Date().toISOString().split('T')[0]}
                                    value={p.passportExpiry || ''}
                                    onChange={(e) => updatePassenger(idx, 'passportExpiry', e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-sky-500"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                                    Nationality *
                                  </label>
                                  <input
                                    type="text"
                                    required
                                    placeholder="e.g. Indian"
                                    value={p.nationality || 'Indian'}
                                    onChange={(e) => updatePassenger(idx, 'nationality', e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-sky-500"
                                  />
                                </div>
                              </div>
                            </div>
                          )}
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
                        <div className="relative flex items-center">
                          <span className="absolute left-3 text-xs font-bold text-slate-500 font-mono select-none">
                            +91
                          </span>
                          <input
                            type="tel"
                            inputMode="numeric"
                            maxLength={10}
                            required
                            placeholder="98765 43210"
                            value={contact.phone}
                            onChange={(e) => {
                              const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                              setContact({ ...contact, phone: digits });
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-3.5 py-2.5 text-xs font-bold font-mono tracking-wider focus:ring-2 focus:ring-sky-500"
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 block">Maximum 10 digits (WhatsApp enabled)</span>
                      </div>
                    </div>
                  </div>

                  {/* Add Fare Type & Baggage */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                    <h4 className="font-extrabold text-slate-900 text-base">Travel Add-ons & Flexibility</h4>

                    {/* Fare Family Options (Saver, Flexi Plus, AirSky VIP) */}
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Zap className="w-4 h-4 text-sky-600" />
                          <span>Choose Fare Category / Flexibility Tier</span>
                        </label>
                        <span className="text-[10px] text-slate-400 font-semibold">Customise your trip benefits</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Saver */}
                        <div
                          onClick={() => setSelectedFareTier('saver')}
                          className={`p-3.5 rounded-xl border cursor-pointer transition-all relative ${
                            selectedFareTier === 'saver'
                              ? 'border-sky-600 bg-sky-50/40 ring-2 ring-sky-500/20 shadow-xs'
                              : 'border-slate-200 bg-white hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800 text-sm">Saver</span>
                            <span className="font-extrabold text-sky-700 text-sm">₹{tierPrices.saver.toLocaleString('en-IN')}</span>
                          </div>
                          <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[10px] font-bold">Standard Base Fare</span>
                          <ul className="mt-2.5 space-y-1 text-[11px] text-slate-500">
                            <li>✓ 7kg Cabin + 15kg Check-in</li>
                            <li>✓ Standard Seat Selection</li>
                            <li className="text-slate-400">✗ Date change fee applies</li>
                          </ul>
                        </div>

                        {/* Flexi Plus */}
                        <div
                          onClick={() => setSelectedFareTier('flexi')}
                          className={`p-3.5 rounded-xl border cursor-pointer transition-all relative ${
                            selectedFareTier === 'flexi'
                              ? 'border-sky-600 bg-sky-50/40 ring-2 ring-sky-500/20 shadow-xs'
                              : 'border-slate-200 bg-white hover:bg-slate-50'
                          }`}
                        >
                          <span className="absolute -top-2 right-2 bg-sky-600 text-white text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full shadow-xs">
                            Popular
                          </span>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800 text-sm">Flexi Plus</span>
                            <span className="font-extrabold text-sky-700 text-sm">₹{tierPrices.flexi.toLocaleString('en-IN')}</span>
                          </div>
                          <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded bg-sky-100 text-sky-800 text-[10px] font-bold">+₹{(tierPrices.flexi - tierPrices.saver).toLocaleString('en-IN')} / traveller</span>
                          <ul className="mt-2.5 space-y-1 text-[11px] text-slate-600">
                            <li>✓ Free Standard Seat</li>
                            <li>✓ Complimentary Sandwich / Snack</li>
                            <li className="text-emerald-600 font-semibold">✓ Free Date Change up to 24h</li>
                          </ul>
                        </div>

                        {/* AirSky VIP */}
                        <div
                          onClick={() => setSelectedFareTier('super')}
                          className={`p-3.5 rounded-xl border cursor-pointer transition-all relative ${
                            selectedFareTier === 'super'
                              ? 'border-sky-600 bg-sky-50/40 ring-2 ring-sky-500/20 shadow-xs'
                              : 'border-slate-200 bg-white hover:bg-slate-50'
                          }`}
                        >
                          <span className="absolute -top-2 right-2 bg-amber-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-xs">
                            VIP Luxury
                          </span>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800 text-sm">{brand?.name || 'AirSky'} VIP</span>
                            <span className="font-extrabold text-sky-700 text-sm">₹{tierPrices.super.toLocaleString('en-IN')}</span>
                          </div>
                          <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 text-[10px] font-bold">+₹{(tierPrices.super - tierPrices.saver).toLocaleString('en-IN')} / traveller</span>
                          <ul className="mt-2.5 space-y-1 text-[11px] text-slate-600">
                            <li className="font-medium text-slate-800">✓ Extra Legroom Seat included</li>
                            <li>✓ Full Hot Gourmet Meal & Beverage</li>
                            <li className="text-emerald-600 font-semibold">✓ Priority Check-in & Baggage</li>
                          </ul>
                        </div>
                      </div>
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

                </div>
              )}

              {/* ======================================================== */}
              {/* ======================================================== */}
              {/* STEP 2: SELECT SEATS FOR EACH TRAVELLER (CABIN MAP) */}
              {/* ======================================================== */}
              {step === 2 && (
                <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-1.5 sm:p-5 shadow-xs space-y-3 sm:space-y-4 animate-fadeIn">
                  
                  {/* Round Trip Flight Selector for Seat Maps */}
                  {flight?.isRoundTrip && (
                    <div className="bg-slate-100/80 p-1.5 rounded-2xl flex flex-col sm:flex-row gap-1.5 border border-slate-200/80">
                      <button
                        type="button"
                        onClick={() => setSeatFlightLeg('onward')}
                        className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between gap-2 cursor-pointer ${
                          seatFlightLeg === 'onward'
                            ? 'bg-white shadow-sm text-sky-800 font-extrabold ring-2 ring-sky-500/20'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                        }`}
                      >
                        <div className="flex items-center gap-2 text-left">
                          <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs ${
                            seatFlightLeg === 'onward' ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-600'
                          }`}>
                            <Plane className="w-3.5 h-3.5 rotate-45" />
                          </span>
                          <div>
                            <span className="text-[10px] uppercase font-black tracking-wider block text-sky-600">
                              Flight 1: Departure
                            </span>
                            <span className="font-extrabold text-xs text-slate-900">
                              {flight.onwardFlight?.from || flight.from} ➔ {flight.onwardFlight?.to || flight.to}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono font-bold bg-sky-50 text-sky-700 px-2 py-0.5 rounded-md border border-sky-200/60">
                          {passengers.filter(p => p.onwardSeat).length}/{passengers.length} Selected
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSeatFlightLeg('return')}
                        className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between gap-2 cursor-pointer ${
                          seatFlightLeg === 'return'
                            ? 'bg-white shadow-sm text-indigo-800 font-extrabold ring-2 ring-indigo-500/20'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                        }`}
                      >
                        <div className="flex items-center gap-2 text-left">
                          <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs ${
                            seatFlightLeg === 'return' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                          }`}>
                            <Plane className="w-3.5 h-3.5 -rotate-135" />
                          </span>
                          <div>
                            <span className="text-[10px] uppercase font-black tracking-wider block text-indigo-600">
                              Flight 2: Return
                            </span>
                            <span className="font-extrabold text-xs text-slate-900">
                              {flight.returnFlight?.from || flight.to} ➔ {flight.returnFlight?.to || flight.from}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-200/60">
                          {passengers.filter(p => p.returnSeat).length}/{passengers.length} Selected
                        </span>
                      </button>
                    </div>
                  )}

                  {/* Active Flexibility Tier Benefit Live Notice */}
                  {selectedFareTier === 'super' ? (
                    <div className="p-3.5 sm:p-4 bg-amber-50/80 border border-amber-300 rounded-2xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
                        <div>
                          <span className="text-xs font-black uppercase tracking-wider text-amber-900 block">
                            AIR SKY GO VIP Luxury Plan Benefits Active
                          </span>
                          <span className="text-[11px] text-amber-800">
                            ✨ <strong>Extra Legroom XL</strong>, Front Premium & All Seats are <strong>100% FREE (₹0)</strong>. Full Hot Gourmet Meals are also included free!
                          </span>
                        </div>
                      </div>
                      <span className="hidden sm:inline-block px-2.5 py-1 bg-amber-500 text-white font-black text-[10px] uppercase rounded-full shrink-0 shadow-xs">
                        VIP Active
                      </span>
                    </div>
                  ) : selectedFareTier === 'flexi' ? (
                    <div className="p-3.5 sm:p-4 bg-slate-100 border border-slate-300 rounded-2xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <Zap className="w-5 h-5 text-slate-800 shrink-0" />
                        <div>
                          <span className="text-xs font-black uppercase tracking-wider text-slate-900 block">
                            Flexi Plus Plan Benefits Active
                          </span>
                          <span className="text-[11px] text-slate-700">
                            ⚡ <strong>Free Standard Seat Selection</strong> (Window, Aisle & Middle are ₹0). Complimentary Snack / Sandwich Meal is also <strong>FREE (₹0)</strong>!
                          </span>
                        </div>
                      </div>
                      <span className="hidden sm:inline-block px-2.5 py-1 bg-slate-900 text-white font-black text-[10px] uppercase rounded-full shrink-0 shadow-xs">
                        Flexi Plus Active
                      </span>
                    </div>
                  ) : (
                    <div className="p-3 sm:p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-2.5 text-xs text-slate-600">
                      <Info className="w-4 h-4 text-slate-500 shrink-0" />
                      <span>
                        <strong>Saver Plan:</strong> Standard middle seats are free (₹0). Window, Aisle and Extra Legroom seats have nominal standard fees.
                      </span>
                    </div>
                  )}

                  <RealAircraftSeatMap
                    flight={flight?.isRoundTrip && seatFlightLeg === 'return' ? (flight.returnFlight || flight) : (flight?.onwardFlight || flight)}
                    passengers={passengers.map(p => ({
                      ...p,
                      seat: flight?.isRoundTrip ? (seatFlightLeg === 'return' ? p.returnSeat : p.onwardSeat) : p.seat
                    }))}
                    activePassengerIndex={activePassengerIndex}
                    onSelectPassengerIndex={setActivePassengerIndex}
                    onSeatClick={handleSeatClick}
                    onAutoAssignFree={handleAutoAssignFreeSeats}
                    layoutData={layoutData}
                    loading={loadingSeats}
                    selectedFareTier={selectedFareTier}
                  />

                  {flight?.isRoundTrip && seatFlightLeg === 'onward' && (
                    <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl flex items-center justify-between text-xs text-sky-900">
                      <span>Departure flight seats selected. Switch to select seats for return flight.</span>
                      <button
                        type="button"
                        onClick={() => setSeatFlightLeg('return')}
                        className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                      >
                        <span>Select Return Seats</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* In-Flight Meal Selection (Asked during Seat Selection) */}
                  <div className="bg-slate-50 rounded-2xl border border-slate-200 p-3.5 sm:p-5 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <div className="flex items-center gap-2">
                        <Utensils className="w-4 h-4 text-sky-600" />
                        <span className="font-extrabold text-xs sm:text-sm text-slate-900">Select In-Flight Meals (Optional)</span>
                      </div>
                      <span className="text-[10px] sm:text-[11px] font-bold text-slate-500">
                        {selectedFareTier === 'super' ? '✨ Full Hot Gourmet Meals Free with VIP' : selectedFareTier === 'flexi' ? '🥪 Complimentary Snack Free with Flexi Plus' : 'Freshly prepared on-board'}
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {passengers.map((p, idx) => (
                        <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-sky-600 text-white text-[11px] font-black flex items-center justify-center">
                                {idx + 1}
                              </span>
                              <span className="text-xs font-black text-slate-800">
                                {p.firstName || p.lastName ? `${p.title} ${p.firstName} ${p.lastName}` : `Traveller ${idx + 1}`}
                                {p.seat && <span className="ml-1.5 text-sky-600 font-mono font-bold">(Seat {p.seat})</span>}
                              </span>
                            </div>
                            <span className="text-[11px] font-extrabold text-slate-600">
                              {p.meal} {p.mealPrice > 0 ? (
                                <span className="text-sky-700 font-bold">(+₹{p.mealPrice})</span>
                              ) : p.meal && p.meal !== 'No Meal' ? (
                                <span className="text-emerald-700 font-bold">(FREE)</span>
                              ) : null}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                            {getMealOptions(selectedFareTier).map(m => (
                              <button
                                key={m.name}
                                type="button"
                                onClick={() => handleMealSelect(idx, m.name, m.price)}
                                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                                  p.meal === m.name
                                    ? 'bg-sky-50 border-sky-500 text-sky-900 font-bold shadow-xs'
                                    : 'bg-slate-50/60 border-slate-200 text-slate-600 hover:bg-slate-100'
                                }`}
                              >
                                <div className="font-bold flex items-center justify-between">
                                  <span>{m.name}</span>
                                  <span className={`font-mono text-[10px] ${m.price === 0 ? 'text-emerald-700 font-black' : 'text-slate-500'}`}>
                                    {m.price === 0 ? 'FREE' : `+₹${m.price}`}
                                  </span>
                                </div>
                                <div className="text-[10px] text-slate-400 mt-0.5 truncate">{m.desc}</div>
                                {m.badge && (
                                  <span className="inline-block mt-1 text-[9px] font-black px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded">
                                    ✓ {m.badge}
                                  </span>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* STEP 3: BOOKING CONFIRMATION, OVERVIEW & COUPONS */}
              {/* ======================================================== */}
              {step === 3 && (
                <motion.div
                  key="checkout-step-3-review"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  className="space-y-4 sm:space-y-5 animate-fadeIn"
                >
                  {/* Top Header Banner */}
                  <div className="bg-slate-950 rounded-3xl p-5 sm:p-6 text-white border border-white/10 shadow-lg flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>Step 3 of 4: Booking Overview & Confirmation</span>
                      </div>
                      <h3 className="text-base sm:text-xl font-black text-white tracking-tight">
                        Review Your Selection & Offers
                      </h3>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Please verify flight details, travellers, assigned seats, and promo discounts before payment.
                      </p>
                    </div>
                    <div className="hidden sm:flex flex-col items-end shrink-0 pl-4 border-l border-white/10">
                      <span className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">Total Payable</span>
                      <span className="text-2xl font-black text-white font-mono">₹{grandTotal.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* 1. Flight Itinerary Card(s) */}
                  {flight?.isRoundTrip ? (
                    <div className="space-y-3.5">
                      {/* Flight 1: Departure (Jana) */}
                      <div className="bg-white rounded-2xl border border-sky-200/90 p-4 sm:p-5 shadow-xs space-y-3.5">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 flex-wrap gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <AirlineBadge code={flight.onwardFlight?.airlineCode || flight.airlineCode} name={flight.onwardFlight?.airline || flight.airline} size="sm" showDetails={false} />
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-black text-[10px] uppercase">
                                  1. Departure Flight (Jana)
                                </span>
                                <h4 className="font-black text-slate-900 text-sm sm:text-base">
                                  {flight.onwardFlight?.airline || flight.airline} <span className="font-mono text-sky-700">({flight.onwardFlight?.flightNumber || flight.flightNumber})</span>
                                </h4>
                              </div>
                              <span className="text-[11px] text-slate-500 font-semibold">
                                Date: <strong className="text-slate-800">{flight.onwardFlight?.departureDate || flight.departureDate}</strong> • Class: <strong className="text-slate-800">{travelClass.toUpperCase()}</strong>
                              </span>
                            </div>
                          </div>
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Confirmed Outbound
                          </span>
                        </div>

                        {/* Departure Route & Timings */}
                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
                          <div className="text-left min-w-0">
                            <div className="text-lg sm:text-xl font-black text-slate-900 font-mono">
                              {flight.onwardFlight?.departureTime || flight.departureTime}
                            </div>
                            <div className="text-xs font-bold text-slate-800">
                              {flight.onwardFlight?.from || flight.from} <span className="text-slate-500 font-normal">({flight.onwardFlight?.fromCity || flight.fromCity})</span>
                            </div>
                            <div className="text-[11px] text-slate-500">
                              Terminal {formatTerminal(flight.onwardFlight?.terminal?.from || flight.terminal?.from || 'T1')}
                            </div>
                          </div>

                          <div className="flex-1 max-w-[160px] text-center px-2 py-1 mx-auto">
                            <span className="text-[11px] font-extrabold text-slate-500 block mb-0.5 font-mono">
                              {flight.onwardFlight?.duration || flight.duration || '2h 15m'}
                            </span>
                            <div className="relative flex items-center justify-center my-1">
                              <div className="w-full h-0.5 bg-slate-300"></div>
                              <div className="absolute w-1.5 h-1.5 rounded-full bg-slate-700 -left-0.5"></div>
                              {flight.onwardFlight?.stops > 0 && (
                                <div className="absolute w-2.5 h-2.5 rounded-full bg-amber-500 border-2 border-white shadow-xs z-10" />
                              )}
                              <div className="absolute w-1.5 h-1.5 rounded-full bg-slate-700 -right-0.5"></div>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md inline-block mt-0.5 ${
                              flight.onwardFlight?.stops === 0 || !flight.onwardFlight?.stops
                                ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                                : 'text-amber-800 bg-amber-50 border border-amber-200'
                            }`}>
                              {flight.onwardFlight?.stops === 0 || !flight.onwardFlight?.stops
                                ? 'Non-Stop'
                                : `${flight.onwardFlight.stops} Stop (${flight.onwardFlight.layoverAirport || flight.onwardFlight.layoverCity || 'Connecting'})`}
                            </span>
                          </div>

                          <div className="text-left sm:text-right min-w-0">
                            <div className="text-lg sm:text-xl font-black text-slate-900 font-mono">
                              {flight.onwardFlight?.arrivalTime || flight.arrivalTime}
                            </div>
                            <div className="text-xs font-bold text-slate-800">
                              {flight.onwardFlight?.to || flight.to} <span className="text-slate-500 font-normal">({flight.onwardFlight?.toCity || flight.toCity})</span>
                            </div>
                            <div className="text-[11px] text-slate-500">
                              Terminal {formatTerminal(flight.onwardFlight?.terminal?.to || flight.terminal?.to || 'T2')} • Baggage: {flight.onwardFlight?.baggage || 'Cabin 7kg, Check-in 15kg'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Flight 2: Return (Aana) */}
                      <div className="bg-white rounded-2xl border border-indigo-200/90 p-4 sm:p-5 shadow-xs space-y-3.5">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 flex-wrap gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <AirlineBadge code={flight.returnFlight?.airlineCode || flight.airlineCode} name={flight.returnFlight?.airline || flight.airline} size="sm" showDetails={false} />
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-black text-[10px] uppercase">
                                  2. Return Flight (Aana)
                                </span>
                                <h4 className="font-black text-slate-900 text-sm sm:text-base">
                                  {flight.returnFlight?.airline || flight.airline} <span className="font-mono text-indigo-700">({flight.returnFlight?.flightNumber || flight.flightNumber})</span>
                                </h4>
                              </div>
                              <span className="text-[11px] text-slate-500 font-semibold">
                                Date: <strong className="text-slate-800">{flight.returnFlight?.departureDate || flight.returnDate}</strong> • Class: <strong className="text-slate-800">{travelClass.toUpperCase()}</strong>
                              </span>
                            </div>
                          </div>
                          <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                            Confirmed Inbound
                          </span>
                        </div>

                        {/* Return Route & Timings */}
                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
                          <div className="text-left min-w-0">
                            <div className="text-lg sm:text-xl font-black text-slate-900 font-mono">
                              {flight.returnFlight?.departureTime || flight.departureTime}
                            </div>
                            <div className="text-xs font-bold text-slate-800">
                              {flight.returnFlight?.from || flight.to} <span className="text-slate-500 font-normal">({flight.returnFlight?.fromCity || flight.toCity})</span>
                            </div>
                            <div className="text-[11px] text-slate-500">
                              Terminal {formatTerminal(flight.returnFlight?.terminal?.from || 'T1')}
                            </div>
                          </div>

                          <div className="flex-1 max-w-[160px] text-center px-2 py-1 mx-auto">
                            <span className="text-[11px] font-extrabold text-slate-500 block mb-0.5 font-mono">
                              {flight.returnFlight?.duration || '2h 15m'}
                            </span>
                            <div className="relative flex items-center justify-center my-1">
                              <div className="w-full h-0.5 bg-slate-300"></div>
                              <div className="absolute w-1.5 h-1.5 rounded-full bg-slate-700 -left-0.5"></div>
                              {flight.returnFlight?.stops > 0 && (
                                <div className="absolute w-2.5 h-2.5 rounded-full bg-amber-500 border-2 border-white shadow-xs z-10" />
                              )}
                              <div className="absolute w-1.5 h-1.5 rounded-full bg-slate-700 -right-0.5"></div>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md inline-block mt-0.5 ${
                              flight.returnFlight?.stops === 0 || !flight.returnFlight?.stops
                                ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                                : 'text-amber-800 bg-amber-50 border border-amber-200'
                            }`}>
                              {flight.returnFlight?.stops === 0 || !flight.returnFlight?.stops
                                ? 'Non-Stop'
                                : `${flight.returnFlight.stops} Stop (${flight.returnFlight.layoverAirport || flight.returnFlight.layoverCity || 'Connecting'})`}
                            </span>
                          </div>

                          <div className="text-left sm:text-right min-w-0">
                            <div className="text-lg sm:text-xl font-black text-slate-900 font-mono">
                              {flight.returnFlight?.arrivalTime || flight.arrivalTime}
                            </div>
                            <div className="text-xs font-bold text-slate-800">
                              {flight.returnFlight?.to || flight.from} <span className="text-slate-500 font-normal">({flight.returnFlight?.toCity || flight.fromCity})</span>
                            </div>
                            <div className="text-[11px] text-slate-500">
                              Terminal {formatTerminal(flight.returnFlight?.terminal?.to || 'T2')} • Baggage: {flight.returnFlight?.baggage || 'Cabin 7kg, Check-in 15kg'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : flight?.isMultiCity && flight.multiCityLegs ? (
                    <div className="space-y-3.5">
                      {flight.multiCityLegs.map((leg, i) => (
                        <div key={i} className="bg-white rounded-2xl border border-sky-200/90 p-4 sm:p-5 shadow-xs space-y-3.5">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 flex-wrap gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <AirlineBadge code={leg.airlineCode} name={leg.airline} size="sm" showDetails={false} />
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-black text-[10px] uppercase">
                                    Leg {i + 1}
                                  </span>
                                  <h4 className="font-black text-slate-900 text-sm sm:text-base">
                                    {leg.airline} <span className="font-mono text-sky-700">({leg.flightNumber})</span>
                                  </h4>
                                </div>
                                <span className="text-[11px] text-slate-500 font-semibold">
                                  Date: <strong className="text-slate-800">{leg.date}</strong> • Class: <strong className="text-slate-800">{travelClass.toUpperCase()}</strong>
                                </span>
                              </div>
                            </div>
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              Confirmed Leg {i + 1}
                            </span>
                          </div>

                          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
                            <div className="text-left min-w-0">
                              <div className="text-lg sm:text-xl font-black text-slate-900 font-mono">
                                {leg.departureTime}
                              </div>
                              <div className="text-xs font-bold text-slate-800">
                                {leg.from} <span className="text-slate-500 font-normal">({leg.fromCity || leg.from})</span>
                              </div>
                            </div>

                            <div className="flex-1 max-w-[160px] text-center px-2 py-1 mx-auto">
                              <span className="text-[11px] font-extrabold text-slate-500 block mb-0.5 font-mono">
                                {leg.duration || '2h 15m'}
                              </span>
                              <div className="relative flex items-center justify-center my-1">
                                <div className="w-full h-0.5 bg-slate-300"></div>
                                <div className="absolute w-1.5 h-1.5 rounded-full bg-slate-700 -left-0.5"></div>
                                {leg.stops > 0 && (
                                  <div className="absolute w-2.5 h-2.5 rounded-full bg-amber-500 border-2 border-white shadow-xs z-10" />
                                )}
                                <div className="absolute w-1.5 h-1.5 rounded-full bg-slate-700 -right-0.5"></div>
                              </div>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md inline-block mt-0.5 ${
                                leg.stops === 0 || !leg.stops
                                  ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                                  : 'text-amber-800 bg-amber-50 border border-amber-200'
                              }`}>
                                {leg.stops === 0 || !leg.stops
                                  ? 'Non-Stop'
                                  : `${leg.stops} Stop (${leg.layoverAirport || 'Connecting'})`}
                              </span>
                            </div>

                            <div className="text-left sm:text-right min-w-0">
                              <div className="text-lg sm:text-xl font-black text-slate-900 font-mono">
                                {leg.arrivalTime}
                              </div>
                              <div className="text-xs font-bold text-slate-800">
                                {leg.to} <span className="text-slate-500 font-normal">({leg.toCity || leg.to})</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3.5">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <AirlineBadge code={flight.airlineCode} name={flight.airline} size="sm" showDetails={false} />
                          <div className="min-w-0">
                            <h4 className="font-black text-slate-900 text-sm sm:text-base leading-tight truncate">
                              {flight.airline} <span className="font-mono text-sky-700 font-bold">({flight.flightNumber})</span>
                            </h4>
                            <div className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                              Aircraft: {flight.aircraft || 'Boeing 737'} • Class: <strong className="text-slate-700">{travelClass.toUpperCase()}</strong>
                            </div>
                          </div>
                        </div>
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 whitespace-nowrap">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Confirmed
                        </span>
                      </div>

                      {/* Flight Route & Timings - Clean Responsive Flight Board */}
                      <div className="p-3 sm:p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                        <div className="grid grid-cols-3 items-center gap-2">
                          {/* Departure */}
                          <div className="text-left min-w-0">
                            <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight leading-none">
                              {flight.departureTime}
                            </div>
                            <div className="text-xs font-black text-slate-800 mt-1 flex items-center gap-1">
                              <span>{flight.from}</span>
                              {flight.terminal?.from && (
                                <span className="text-[10px] font-bold text-slate-500 bg-slate-200/80 px-1 rounded">
                                  T{String(flight.terminal.from).replace(/^T/i, '')}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate mt-0.5" title={flight.fromCity}>
                              {flight.fromCity}
                            </div>
                          </div>

                          {/* Duration Divider */}
                          <div className="text-center px-1">
                            <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-500 block mb-0.5 font-mono">
                              {flight.duration || '2h 15m'}
                            </span>
                            <div className="relative flex items-center justify-center my-1">
                              <div className="w-full h-0.5 bg-slate-300"></div>
                              <div className="absolute w-1.5 h-1.5 rounded-full bg-slate-700 -left-0.5"></div>
                              {flight.stops > 0 && (
                                <div className="absolute w-2.5 h-2.5 rounded-full bg-amber-500 border-2 border-white shadow-xs z-10" />
                              )}
                              <div className="absolute w-1.5 h-1.5 rounded-full bg-slate-700 -right-0.5"></div>
                            </div>
                            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md inline-block ${
                              flight.stops === 0 
                                ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' 
                                : 'text-amber-800 bg-amber-50 border border-amber-200'
                            }`}>
                              {flight.stops === 0 ? 'Non-Stop' : `${flight.stops} Stop`}
                            </span>
                          </div>

                          {/* Arrival */}
                          <div className="text-right min-w-0">
                            <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight leading-none">
                              {flight.arrivalTime}
                            </div>
                            <div className="text-xs font-black text-slate-800 mt-1 flex items-center justify-end gap-1">
                              <span>{flight.to}</span>
                              {flight.terminal?.to && (
                                <span className="text-[10px] font-bold text-slate-500 bg-slate-200/80 px-1 rounded">
                                  T{String(flight.terminal.to).replace(/^T/i, '')}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate mt-0.5" title={flight.toCity}>
                              {flight.toCity}
                            </div>
                          </div>
                        </div>

                        {/* Date & Baggage strip */}
                        <div className="mt-2.5 pt-2 border-t border-slate-200/70 flex items-center justify-between text-[11px] text-slate-500">
                          <span>📅 {flight.departureDate || new Date().toISOString().split('T')[0]}</span>
                          <span>🧳 {flight.baggage || 'Cabin 7kg, Check-in 15kg'}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. Travellers, Assigned Seats & Meals Card */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3.5">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <UserPlus className="w-4 h-4 text-sky-600 shrink-0" />
                        <h4 className="font-extrabold text-slate-900 text-sm sm:text-base truncate">
                          Travellers & Seats ({passengers.length})
                        </h4>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs shrink-0">
                        <button
                          type="button"
                          onClick={() => transitionToStep(1)}
                          className="text-sky-600 hover:text-sky-700 font-bold hover:underline cursor-pointer"
                        >
                          Edit Names
                        </button>
                        <span className="text-slate-300">•</span>
                        <button
                          type="button"
                          onClick={() => transitionToStep(2)}
                          className="text-sky-600 hover:text-sky-700 font-bold hover:underline cursor-pointer"
                        >
                          Change Seats
                        </button>
                      </div>
                    </div>

                    {/* List of Passengers with Seats and Meals */}
                    <div className="space-y-2">
                      {passengers.map((p, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-slate-50/80 hover:bg-slate-50 rounded-xl border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-800 font-black text-xs flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <div className="min-w-0">
                              <span className="font-black text-slate-900 text-sm truncate block sm:inline">
                                {p.title} {p.firstName} {p.lastName}
                              </span>
                              <span className="text-[11px] text-slate-500 font-medium sm:ml-2">
                                ({p.type || 'Adult'}, {p.gender || 'Male'})
                                {p.passportNumber ? ` • Passport: ${p.passportNumber}` : ''}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                            {/* Seat Pill */}
                            <span className="px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-200 text-sky-900 font-bold text-xs flex items-center gap-1 shrink-0">
                              <Armchair className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                              <span>Seat: <strong className="font-mono text-sky-700">{p.seat || 'Auto'}</strong></span>
                              {p.seatPrice > 0 ? (
                                <span className="text-[10px] text-sky-600 font-mono">(+₹{p.seatPrice})</span>
                              ) : p.seat ? (
                                <span className="text-[10px] text-emerald-700 font-black whitespace-nowrap">
                                  (FREE)
                                </span>
                              ) : null}
                            </span>

                            {/* Meal Pill */}
                            <span className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 font-semibold text-xs flex items-center gap-1 shrink-0">
                              <Utensils className="w-3 h-3 text-amber-600 shrink-0" />
                              <span className="truncate max-w-[120px] sm:max-w-none">{p.meal || 'No meal'}</span>
                              {p.mealPrice > 0 ? (
                                <span className="text-[10px] text-amber-700 font-mono">(+₹{p.mealPrice})</span>
                              ) : p.meal && p.meal !== 'No Meal' ? (
                                <span className="text-[10px] text-emerald-700 font-black whitespace-nowrap shrink-0">
                                  (FREE)
                                </span>
                              ) : null}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Contact Summary Info */}
                    <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-600 bg-slate-100/60 p-2.5 rounded-xl border border-slate-200/60">
                      <span>📱 <strong>Mobile:</strong> +91 {contact.phone}</span>
                      <span>✉️ <strong>Email:</strong> {contact.email}</span>
                    </div>
                  </div>

                  {/* 3. Interactive Coupon Management Section */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Tag className="w-4 h-4 text-emerald-600 shrink-0" />
                        <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm truncate">
                          Offers & Promo Code
                        </h4>
                      </div>
                      <span className="text-[10px] sm:text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 shrink-0 whitespace-nowrap">
                        Save Extra
                      </span>
                    </div>

                    {/* Coupon input field */}
                    <div className="relative flex items-center w-full">
                      <input
                        type="text"
                        placeholder="Enter promo code (e.g. AIRSKY35)"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="w-full min-w-0 bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-24 py-2.5 text-xs sm:text-sm font-mono font-bold uppercase focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                      />
                      {discountAmount > 0 ? (
                        <button
                          type="button"
                          onClick={handleRemovePromo}
                          className="absolute right-1.5 px-3.5 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold rounded-lg text-xs transition-colors cursor-pointer border border-rose-200 shrink-0 shadow-2xs"
                        >
                          Remove
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={applyingCoupon || !couponCode}
                          onClick={() => handleApplyPromo()}
                          className="absolute right-1.5 px-4 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-extrabold rounded-lg text-xs transition-colors cursor-pointer shadow-xs shrink-0"
                        >
                          {applyingCoupon ? 'Checking...' : 'Apply'}
                        </button>
                      )}
                    </div>

                    {/* Error alert */}
                    {couponError && (
                      <div className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 px-3 py-2 rounded-xl flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>{couponError}</span>
                      </div>
                    )}

                    {/* Available Coupons list */}
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <div className="text-[11px] font-bold text-slate-500 flex items-center justify-between gap-2">
                        <span className="truncate">Available Offers:</span>
                        <span className="text-[10px] text-slate-400 font-normal shrink-0 whitespace-nowrap">Tap to apply</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {(availableCoupons.length > 0 ? availableCoupons : [
                          { code: 'AIRSKY500', type: 'flat', discount: 500, minAmount: 3000, description: 'Flat ₹500 off on any flight', status: 'Active' },
                          { code: 'FLYHIGH', type: 'percent', discount: 10, maxDiscount: 1500, minAmount: 4000, description: '10% instant discount up to ₹1,500', status: 'Active' },
                          { code: 'IXIGO50', type: 'flat', discount: 750, minAmount: 5000, description: 'Special ₹750 Super Saver discount', status: 'Active' },
                          { code: 'FIRSTFLY', type: 'flat', discount: 1000, minAmount: 6000, description: 'Welcome ₹1,000 off on first flight', status: 'Active' }
                        ]).filter(c => c.status !== 'Inactive').map(c => {
                          const isApplied = couponCode.toUpperCase() === c.code.toUpperCase() && discountAmount > 0;
                          return (
                            <div
                              key={c.code}
                              onClick={() => isApplied ? handleRemovePromo() : handleApplyPromo(c.code)}
                              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                                isApplied
                                  ? 'bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-500/20'
                                  : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                              }`}
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-mono font-black text-xs text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 shrink-0">
                                    {c.code}
                                  </span>
                                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded shrink-0 whitespace-nowrap">
                                    {c.type === 'percent' ? `${c.discount}% OFF` : `₹${c.discount} OFF`}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-500 mt-1 truncate">
                                  {c.description}
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  isApplied ? handleRemovePromo() : handleApplyPromo(c.code);
                                }}
                                className={`text-xs font-black px-3 py-1 rounded-lg shrink-0 cursor-pointer whitespace-nowrap ${
                                  isApplied
                                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                    : 'bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200'
                                }`}
                              >
                                {isApplied ? 'Applied ✓' : 'Apply'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>


                </motion.div>
              )}

              {/* ======================================================== */}
              {/* STEP 4: PAYMENT GATEWAY (UPI QR, CARDS, NETBANKING) */}
              {/* ======================================================== */}
              {step === 4 && (
                <motion.div
                  key="checkout-step-4"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-xs space-y-2.5 animate-fadeIn"
                >
                  {/* Flight Details Strip */}
                  <div className="flex items-center justify-between p-2.5 sm:p-3 bg-slate-950 text-white rounded-2xl border border-white/10 shadow-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <AirlineBadge code={flight.airlineCode} name={flight.airline} size="xs" showDetails={false} />
                      <div className="min-w-0">
                        <div className="text-xs font-black truncate">{flight.airline} • {flight.from} ➔ {flight.to}</div>
                        <div className="text-[10px] text-slate-300 font-semibold truncate">{passengers.length} Pax • {flight.departureTime}</div>
                      </div>
                    </div>
                  </div>

                  {/* LIVE PAYMENT VERIFICATION SCREEN (While Admin Verifies & Ticks Approve) */}
                  {isVerifyingPayment ? (
                    <div className="py-6 px-4 bg-white rounded-3xl border border-slate-200 shadow-xl text-center space-y-4 animate-fadeIn">
                      {/* Radar / Pulsing animation */}
                      <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full bg-slate-900/10 animate-ping" />
                        <div className="absolute inset-2 rounded-full bg-slate-900/15 animate-pulse" />
                        <div className="relative w-14 h-14 rounded-full bg-slate-950 text-white flex items-center justify-center shadow-md border border-white/10">
                          <RefreshCw className="w-7 h-7 animate-spin text-white" />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <span className="inline-block px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-[11px] font-black tracking-wide uppercase animate-pulse">
                          ⏳ Payment Verification in Progress
                        </span>
                        <h4 className="text-base sm:text-lg font-black text-slate-900">
                          Payment Verifying
                        </h4>
                        <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
                          Your payment reference has been submitted and is being verified with the bank server. <strong>Once verified, your confirmed ticket will automatically appear on screen with the PDF download option.</strong>
                        </p>
                      </div>

                      {/* Booking Reference Card */}
                      <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs max-w-xs mx-auto space-y-1.5 text-xs text-left">
                        <div className="flex justify-between items-center text-slate-600 pb-1.5 border-b border-slate-100">
                          <span className="font-semibold text-slate-500">Booking PNR:</span>
                          <span className="font-mono font-black text-sky-800 text-sm">{createdPnr}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-600">
                          <span className="font-semibold text-slate-500">Amount Paid:</span>
                          <span className="font-mono font-extrabold text-slate-900">₹{grandTotal.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-600">
                          <span className="font-semibold text-slate-500">App / Method:</span>
                          <span className="font-bold text-slate-800">{selectedUpiApp || paymentMethod}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-600 pt-1 border-t border-slate-100">
                          <span className="font-semibold text-slate-500">Live Status:</span>
                          <span className="text-amber-700 font-extrabold flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping inline-block" />
                            Waiting for Approval
                          </span>
                        </div>
                      </div>

                      {/* Manual Refresh & Help */}
                      <div className="pt-2 flex flex-col items-center gap-2">
                        {paymentMethod === 'upiApps' && (
                          <button
                            type="button"
                            onClick={() => {
                              const appKey = selectedAppKey || 'phonepe';
                              const appName = selectedUpiApp || 'PhonePe';
                              handleLaunchUpiApp(appKey, appName);
                            }}
                            className="w-full max-w-xs py-3 px-4 bg-slate-900 hover:bg-black active:scale-95 text-white font-extrabold text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all border border-slate-800"
                          >
                            <Smartphone className="w-4 h-4" />
                            <span>Open {selectedUpiApp || 'PhonePe'} App ↗</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={async () => {
                            const activePnr = createdPnr || localStorage.getItem('asg_current_pending_pnr');
                            if (!activePnr) return;
                            try {
                              const res = await api.getBookingByPnr(activePnr);
                              const b = res?.data || res?.booking;
                              const bStatus = String(b?.status || '').trim().toUpperCase();
                              if (b && bStatus === 'CONFIRMED') {
                                setIsVerifyingPayment(false);
                                try { localStorage.removeItem('asg_current_pending_pnr'); } catch (e) {}
                                onBookingSuccess(ensureCompleteBookingData(b));
                              } else {
                                alert('Verification in progress. Please wait a moment while the admin verifies your payment.');
                              }
                            } catch (e) {
                              console.warn(e);
                            }
                          }}
                          className="px-4 py-2 bg-sky-600 hover:bg-sky-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer transition-all"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Check Status Now</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleWhatsAppHelp}
                          className="text-[11px] text-emerald-700 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                        >
                          Need instant help? WhatsApp Support
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>

                  {/* 5-Minute Session Timer Strip */}
                  <div className="flex items-center justify-between px-3.5 py-2.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl text-xs font-medium">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="text-[11px] font-semibold text-slate-700">Complete payment within:</span>
                      <span className={`font-mono font-black text-xs ${paymentTimerSeconds <= 60 ? 'text-rose-600 animate-pulse' : 'text-amber-800'}`}>
                        {formatTimer(paymentTimerSeconds)}
                      </span>
                    </div>
                    <span className="text-[10px] text-amber-700 font-bold hidden sm:inline">Fare locked for 5 min</span>
                  </div>

                  {isTimerExpired && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold text-center space-y-1 animate-shake">
                      <p>⚠️ Payment session expired (5 min limit). Please renew to proceed.</p>
                      <button
                        type="button"
                        onClick={() => { setPaymentTimerSeconds(300); setIsTimerExpired(false); }}
                        className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[11px] font-bold cursor-pointer"
                      >
                        Renew 5-Min Session
                      </button>
                    </div>
                  )}

                  {/* Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                        <Lock className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <span className="font-extrabold text-slate-900 text-xs sm:text-sm">Select Payment Method</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                      <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>256-Bit SSL</span>
                    </span>
                  </div>

                  {/* Payment Method Selector Tabs - Dynamically loaded from Admin settings */}
                  {paymentTabs.length > 0 ? (
                    <div className={`grid gap-2 ${
                      paymentTabs.length === 1 ? 'grid-cols-1' :
                      paymentTabs.length === 2 ? 'grid-cols-2' :
                      paymentTabs.length === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'
                    }`}>
                      {paymentTabs.map(tab => {
                        const Icon = tab.icon;
                        const isSelected = paymentMethod === tab.id || (tab.id === 'upiQr' && paymentMethod === 'upi');
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => handleSelectPaymentMethod(tab.id)}
                            className={`py-3 px-3 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col items-center justify-center gap-1.5 ${
                              isSelected
                                ? 'bg-sky-50/90 border-sky-500 text-sky-950 shadow-xs ring-1 ring-sky-400/30 font-bold'
                                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50/60'
                            }`}
                          >
                            {tab.badge && (
                              <span className="absolute -top-2 right-2.5 bg-slate-900 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs border border-white">
                                {tab.badge}
                              </span>
                            )}
                            <Icon className={`w-5 h-5 mx-auto ${isSelected ? 'text-sky-600' : 'text-slate-500'}`} />
                            <div className="text-xs font-black tracking-tight truncate">{tab.label}</div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 font-bold text-center">
                      Payment gateway maintenance. Please contact WhatsApp support.
                    </div>
                  )}

                  {/* 1. UPI QR Payment Content */}
                  {isUpiQrEnabled && (paymentMethod === 'upiQr' || paymentMethod === 'upi') && (() => {
                    const activeVpa = paymentSettings?.upi?.vpa || 'care@airsky';
                    const activeName = paymentSettings?.upi?.businessName || paymentSettings?.upi?.name || 'Air Sky India';
                    const activeMcc = paymentSettings?.upi?.mcc || '5499';
                    const txnRef = `ASG${flight.id || 'FL'}${Date.now().toString().slice(-6)}`;
                    const note = `Flight ${flight.flightNumber || 'Ticket'}`;
                    const upiPayload = `upi://pay?pa=${encodeURIComponent(activeVpa)}&pn=${encodeURIComponent(activeName)}&am=${grandTotal}&cu=INR&tn=${encodeURIComponent(note)}&mc=${encodeURIComponent(activeMcc)}&tr=${encodeURIComponent(txnRef)}`;
                    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(upiPayload)}`;

                    return (
                      <div className="p-3.5 sm:p-4 bg-slate-50/80 rounded-2xl border border-slate-200">
                        <div className="flex flex-row items-center justify-center gap-3.5 text-left">
                          {/* QR Box */}
                          <div className="p-2 bg-white rounded-2xl shadow-xs border border-slate-200 text-center shrink-0 w-32 h-32 sm:w-36 sm:h-36 flex flex-col items-center justify-center relative overflow-hidden">
                            {qrLoading ? (
                              <div className="flex flex-col items-center justify-center w-full h-full p-1 bg-slate-50/90 relative rounded-lg">
                                {/* Animated Scanning Beam */}
                                <motion.div
                                  className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-sky-500 to-transparent shadow-sm shadow-sky-400"
                                  animate={{ top: ['15%', '85%', '15%'] }}
                                  transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
                                />
                                <div className="relative">
                                  <QrCode className="w-10 h-10 text-sky-600 animate-pulse" />
                                  <RefreshCw className="w-4 h-4 text-emerald-600 animate-spin absolute -bottom-1 -right-1" />
                                </div>
                                <span className="text-[8px] font-black text-slate-600 mt-1.5 uppercase tracking-tight text-center leading-tight">
                                  Generating QR...
                                </span>
                              </div>
                            ) : (
                              <motion.img
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.25 }}
                                src={qrUrl}
                                alt="UPI QR Code"
                                className="w-full h-full object-contain"
                              />
                            )}
                          </div>

                          {/* UPI Instructions */}
                          <div className="space-y-1 text-xs">
                            {qrLoading ? (
                              <div className="space-y-1 animate-fadeIn">
                                <div className="flex items-center gap-1.5 text-sky-800 font-extrabold text-xs">
                                  <RefreshCw className="w-3 h-3 animate-spin text-sky-600" />
                                  <span>Creating Secure Dynamic QR...</span>
                                </div>
                                <p className="text-[10px] text-slate-500 leading-tight">
                                  Connecting to UPI Bank Switch & locking live fare
                                </p>
                                <div className="text-[9px] text-emerald-700 font-bold flex items-center gap-1 pt-0.5">
                                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                  <span>NPCI / 256-Bit Encrypted</span>
                                </div>
                              </div>
                            ) : (
                              <>
                                <p className="font-extrabold text-slate-900 text-xs sm:text-sm">Scan & Pay with Any UPI App</p>
                                <p className="text-[11px] text-slate-500">Google Pay, PhonePe, Paytm, BHIM, CRED</p>
                                <div className="pt-1 text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span>Instant Ticket Confirmation</span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* 2. UPI Apps Content */}
                  {isUpiAppsEnabled && paymentMethod === 'upiApps' && (
                    <div className="p-3 sm:p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-3">
                      <div className="pb-0.5">
                        <p className="font-extrabold text-slate-900 text-xs sm:text-sm">Tap an App to Pay Directly</p>
                        <p className="text-[10px] sm:text-[11px] text-slate-500">Instant UPI redirect or continue with the Pay button below</p>
                      </div>

                      {/* App Buttons List */}
                      {visibleUpiApps.length > 0 ? (
                        <div className="flex flex-col gap-2">
                          {visibleUpiApps.map(app => {
                            const isSelected = (selectedUpiApp === app.name) || (selectedAppKey === app.key);
                            const isCurrentLaunching = isLaunchingApp && selectedAppKey === app.key;
                            return (
                              <button
                                key={app.key}
                                type="button"
                                onClick={() => handleLaunchUpiApp(app.key, app.name)}
                                className={`w-full p-2.5 sm:p-3 rounded-2xl border transition-all text-left cursor-pointer active:scale-[0.98] relative flex items-center gap-3 ${
                                  isSelected
                                    ? 'bg-sky-50/90 border-sky-500 ring-2 ring-sky-400/40 shadow-xs'
                                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
                                }`}
                              >
                                <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-xs p-1.5 overflow-hidden">
                                  {app.iconUrl ? (
                                    <img
                                      src={app.iconUrl}
                                      alt={app.name}
                                      className="w-full h-full object-contain"
                                    />
                                  ) : (
                                    <Smartphone className="w-5 h-5 text-slate-700" />
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="text-xs sm:text-sm font-black text-slate-900 leading-tight">
                                    {app.name}
                                  </div>
                                  <div className={`text-[10px] sm:text-xs font-semibold leading-tight mt-0.5 ${isSelected ? 'text-sky-700 font-bold' : 'text-slate-400'}`}>
                                    {isCurrentLaunching ? 'Opening app...' : isSelected ? 'Selected • Instant Pay' : 'Tap to pay via ' + app.name}
                                  </div>
                                </div>
                                <div className="shrink-0 ml-auto">
                                  {isCurrentLaunching ? (
                                    <RefreshCw className="w-4 h-4 text-sky-600 animate-spin" />
                                  ) : isSelected ? (
                                    <span className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center shadow-xs">
                                      <Check className="w-3 h-3 stroke-[3]" />
                                    </span>
                                  ) : (
                                    <span className="w-5 h-5 rounded-full border-2 border-slate-300 bg-white block" />
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-center text-xs text-slate-500">
                          No UPI apps enabled by admin. Please select UPI QR Code.
                        </div>
                      )}

                      {/* Fallback box if App did not open (Exact match to Vue script logic) */}
                      {appLaunchFailed && (
                        <div className="p-3 bg-amber-50/95 border border-amber-300 rounded-xl space-y-2.5 animate-fadeIn mt-2 shadow-xs">
                          <div className="flex items-start gap-2.5">
                            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                            <div className="text-xs">
                              <strong className="block font-bold text-slate-900">
                                {(ALL_UPI_APPS.find(a => a.key === appLaunchFailed)?.name || 'UPI App')} did not open
                              </strong>
                              <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">
                                That app may not be installed, or it blocked the request. Pay with the QR code instead, or copy the UPI ID and pay manually.
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                setAppLaunchFailed(null);
                                setPaymentMethod('upiQr');
                              }}
                              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 active:scale-95 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                              <span>Show QR instead</span>
                            </button>
                            <button
                              type="button"
                              onClick={handleCopyUpiId}
                              className="px-3 py-1.5 bg-white hover:bg-slate-50 active:scale-95 border border-slate-300 text-slate-700 font-bold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              <span>{copiedVpa ? 'Copied!' : 'Copy UPI ID'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setAppLaunchFailed(null)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-lg cursor-pointer"
                            >
                              Dismiss
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-center gap-1.5 pt-1 text-[10px] sm:text-[11px] text-slate-500 font-medium">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Secured by 256-Bit NPCI / UPI Encryption</span>
                      </div>
                    </div>
                  )}

                  {/* 3. Card Payment Content */}
                  {isCardEnabled && paymentMethod === 'card' && (
                    <div className="p-2.5 sm:p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                      <div>
                        <label className="block font-bold text-slate-600 text-[10px] mb-0.5">Card Number *</label>
                        <input
                          type="text"
                          maxLength={19}
                          placeholder="4111 2222 3333 4444"
                          value={cardDetails.number}
                          onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 font-mono font-bold text-xs"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block font-bold text-slate-600 text-[10px] mb-0.5">Expiry *</label>
                          <input
                            type="text"
                            maxLength={5}
                            placeholder="MM/YY"
                            value={cardDetails.expiry}
                            onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 font-mono font-bold text-xs"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-600 text-[10px] mb-0.5">CVV *</label>
                          <input
                            type="password"
                            maxLength={4}
                            placeholder="123"
                            value={cardDetails.cvv}
                            onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 font-mono font-bold text-xs"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block font-bold text-slate-600 text-[10px] mb-0.5">Cardholder Name *</label>
                        <input
                          type="text"
                          placeholder="Name on card"
                          value={cardDetails.name}
                          onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 font-bold text-xs"
                        />
                      </div>
                    </div>
                  )}

                  {/* 4. Net Banking */}
                  {isNetBankingEnabled && paymentMethod === 'netbanking' && (
                    <div className="p-2.5 sm:p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                      <label className="block font-bold text-slate-700 text-[10px]">Select Popular Bank:</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                        {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Mahindra', 'Punjab National Bank'].map(b => (
                          <button
                            key={b}
                            type="button"
                            onClick={() => setSelectedBank(b)}
                            className={`p-1.5 rounded-lg border text-left font-bold text-[10px] sm:text-[11px] transition-all cursor-pointer ${
                              selectedBank === b
                                ? 'bg-sky-50 border-sky-500 text-sky-900 shadow-xs'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {b}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}



                  {/* Action Buttons */}
                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    <button
                      type="button"
                      disabled={isProcessing || isTimerExpired}
                      onClick={handleFinalBooking}
                      className="w-full py-3 sm:py-3.5 rounded-2xl bg-slate-900 hover:bg-black active:scale-[0.98] text-white font-black text-xs uppercase tracking-wide shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Connecting & Opening {selectedUpiApp || 'UPI App'}...</span>
                        </>
                      ) : isTimerExpired ? (
                        <>
                          <Clock className="w-3.5 h-3.5" />
                          <span>Session Expired — Please Renew</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>
                            {paymentMethod === 'upiApps' && selectedUpiApp
                              ? `PAY ₹${grandTotal.toLocaleString('en-IN')} & OPEN ${selectedUpiApp.toUpperCase()}`
                              : `PAY ₹${grandTotal.toLocaleString('en-IN')} & CONFIRM`}
                          </span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center justify-between text-[10px] px-1 text-slate-500">
                      <button
                        type="button"
                        onClick={handleBackFromPayment}
                        className="hover:text-slate-800 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <ArrowLeft className="w-3 h-3" />
                        <span>Back to Review</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleWhatsAppHelp}
                        className="text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>WhatsApp Help</span>
                      </button>
                    </div>
                  </div>
                    </>
                  )}
                </motion.div>
              )}

            </div>

            {/* Right Column: Fare Breakup & PromoSuggestions (Hidden on step === 4 for zero-scroll fit) */}
            <div className={`${step === 4 ? 'hidden' : 'lg:col-span-4'} space-y-4`}>
              


              {step === 4 ? (
                /* Step 4 Dedicated Payment Summary & Direct Action Card */
                <div className="bg-white rounded-2xl border border-slate-200 p-3.5 sm:p-4 shadow-xs space-y-2.5 animate-fadeIn">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <AirlineBadge code={flight.airlineCode} name={flight.airline} size="xs" showDetails={false} />
                      <div className="min-w-0">
                        <div className="text-xs font-black text-slate-900 truncate">
                          {flight.airline} ({flight.flightNumber || 'Direct'})
                        </div>
                        <div className="text-[10px] text-slate-500 font-bold truncate">
                          {flight.from} ➔ {flight.to} • {flight.departureTime}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                      {passengers.length} Pax
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>Base Fare ({passengers.length} Pax)</span>
                      <span className="font-bold font-mono">₹{standardBaseFare.toLocaleString('en-IN')}</span>
                    </div>

                    {totalSeatFee > 0 && (
                      <div className="flex justify-between">
                        <span>Seat Selection</span>
                        <span className="font-bold font-mono text-sky-700">+₹{totalSeatFee.toLocaleString('en-IN')}</span>
                      </div>
                    )}

                    {baggageFee > 0 && (
                      <div className="flex justify-between">
                        <span>Extra Baggage</span>
                        <span className="font-bold font-mono text-sky-700">+₹{baggageFee.toLocaleString('en-IN')}</span>
                      </div>
                    )}

                    {insuranceFee > 0 && (
                      <div className="flex justify-between">
                        <span>Travel Insurance</span>
                        <span className="font-bold font-mono text-emerald-700">+₹{insuranceFee.toLocaleString('en-IN')}</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span>Taxes & Fees (incl. GST)</span>
                      <span className="font-bold font-mono">+₹{taxes.toLocaleString('en-IN')}</span>
                    </div>

                    {discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                        <span>Promo Discount ({couponCode})</span>
                        <span className="font-mono">-₹{discountAmount.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Payable</div>
                      <div className="text-[10px] text-emerald-600 font-bold">All Taxes Included</div>
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight">
                      ₹{grandTotal.toLocaleString('en-IN')}
                    </div>
                  </div>

                  {/* Primary Pay Button */}
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={handleFinalBooking}
                    className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-black active:scale-[0.98] text-white font-black text-xs sm:text-sm uppercase tracking-wide shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Confirming Instant PNR...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>PAY ₹{grandTotal.toLocaleString('en-IN')} & CONFIRM</span>
                      </>
                    )}
                  </button>

                  {/* Secondary Back Button */}
                  <button
                    type="button"
                    onClick={handleBackFromPayment}
                    className="w-full py-1 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span>Back to Review (Step 3)</span>
                  </button>

                  {/* Trust & WhatsApp Support */}
                  <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Lock className="w-3 h-3 text-emerald-600" />
                      <span>Instant Airline Ticket</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleWhatsAppHelp}
                      className="text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <MessageCircle className="w-3 h-3" />
                      <span>WhatsApp Help</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Detailed Fare Summary */
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                  <h4 className="font-extrabold text-slate-900 text-base pb-2 border-b border-slate-100">
                    Fare Breakup
                  </h4>

                <div className="space-y-2 text-xs text-slate-600">
                  {flight?.isRoundTrip ? (
                    <>
                      <div className="flex justify-between items-center gap-2 text-slate-700">
                        <span className="truncate">Flight 1 (Onward): {flight.onwardFlight?.from || flight.from} ➔ {flight.onwardFlight?.to || flight.to}</span>
                        <span className="font-bold font-mono shrink-0 whitespace-nowrap">₹{((flight.onwardFlight?.basePrice || Math.round(standardBaseFare / 2 / passengers.length)) * passengers.length).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between items-center gap-2 text-slate-700">
                        <span className="truncate">Flight 2 (Return): {flight.returnFlight?.from || flight.to} ➔ {flight.returnFlight?.to || flight.from}</span>
                        <span className="font-bold font-mono shrink-0 whitespace-nowrap">₹{((flight.returnFlight?.basePrice || Math.round(standardBaseFare / 2 / passengers.length)) * passengers.length).toLocaleString('en-IN')}</span>
                      </div>
                    </>
                  ) : flight?.isMultiCity && flight.multiCityLegs ? (
                    flight.multiCityLegs.map((leg, i) => (
                      <div key={i} className="flex justify-between items-center gap-2 text-slate-700">
                        <span className="truncate">Leg {i + 1}: {leg.from} ➔ {leg.to}</span>
                        <span className="font-bold font-mono shrink-0 whitespace-nowrap">₹{((leg.price || Math.round(standardBaseFare / flight.multiCityLegs.length / passengers.length)) * passengers.length).toLocaleString('en-IN')}</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex justify-between items-center gap-2">
                      <span className="truncate">Base Fare ({passengers.length} Pax)</span>
                      <span className="font-bold font-mono shrink-0 whitespace-nowrap">₹{standardBaseFare.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  {selectedFareTier !== 'saver' && (
                    <div className="flex justify-between items-center gap-2">
                      <span className="truncate">{selectedFareTier === 'super' ? `${brand?.name || 'AirSky'} VIP Upgrade` : 'Flexi Plus Upgrade'}</span>
                      <span className="font-bold font-mono text-sky-700 shrink-0 whitespace-nowrap">+₹{tierUpgradeTotal.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  {totalSeatFee > 0 ? (
                    <div className="flex justify-between items-center gap-2">
                      <span className="truncate">Seat Selection ({passengers.filter(p => p.seatPrice > 0).length} Pax)</span>
                      <span className="font-bold font-mono text-sky-700 shrink-0 whitespace-nowrap">+₹{totalSeatFee.toLocaleString('en-IN')}</span>
                    </div>
                  ) : passengers.some(p => p.seat) && (
                    <div className="flex justify-between items-center gap-2 text-emerald-700 font-semibold">
                      <span className="truncate">Seat Selection ({passengers.filter(p => p.seat).length} Pax)</span>
                      <span className="font-bold font-mono shrink-0 whitespace-nowrap">FREE</span>
                    </div>
                  )}

                  {totalMealsFee > 0 ? (
                    <div className="flex justify-between items-center gap-2">
                      <span className="truncate">Meals & In-Flight Dining</span>
                      <span className="font-bold font-mono text-sky-700 shrink-0 whitespace-nowrap">+₹{totalMealsFee.toLocaleString('en-IN')}</span>
                    </div>
                  ) : passengers.some(p => p.meal && p.meal !== 'No Meal') && (
                    <div className="flex justify-between items-center gap-2 text-emerald-700 font-semibold">
                      <span className="truncate">In-Flight Meals</span>
                      <span className="font-bold font-mono shrink-0 whitespace-nowrap">FREE</span>
                    </div>
                  )}

                  {baggageFee > 0 && (
                    <div className="flex justify-between items-center gap-2">
                      <span className="truncate">Extra Baggage ({extraBaggageKg}kg)</span>
                      <span className="font-bold font-mono text-sky-700 shrink-0 whitespace-nowrap">+₹{baggageFee.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  {insuranceFee > 0 && (
                    <div className="flex justify-between items-center gap-2">
                      <span className="truncate">Travel Insurance ({passengers.length} Pax)</span>
                      <span className="font-bold font-mono text-emerald-700 shrink-0 whitespace-nowrap">+₹{insuranceFee.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center gap-2">
                    <span className="truncate">Taxes & Fees (incl. GST)</span>
                    <span className="font-bold font-mono shrink-0 whitespace-nowrap">+₹{taxes.toLocaleString('en-IN')}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between items-center gap-2 text-emerald-700 font-extrabold bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-200">
                      <span className="flex items-center gap-1 min-w-0">
                        <Tag className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">Promo ({couponCode})</span>
                      </span>
                      <span className="font-mono font-black shrink-0 whitespace-nowrap ml-2">-₹{discountAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">Total Payable Fare</div>
                    <div className="text-[10px] text-slate-400 truncate">{passengers.length} Traveller{passengers.length > 1 ? 's' : ''} • Taxes included</div>
                  </div>
                  <div className="text-2xl font-black text-slate-900 font-mono shrink-0 whitespace-nowrap">
                    ₹{grandTotal.toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 text-center pt-1 border-t border-slate-100">
                  🔒 Guaranteed best value with instant airline PNR generation
                </div>
              </div>
              )}

            </div>

          </div>
        </div>

        {/* Persistent Sticky Bottom Bar / Toolbar (as shown in user's reference) - Hidden on Step 4 */}
        {step < 4 && (
          <div className="bg-white border-t border-slate-200 px-3 py-2 sm:px-6 sm:py-3.5 flex items-center justify-between shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] z-30 relative">
          
          {/* Left Side: Live Price + (i) Info icon + Travellers Count + Savings */}
          <div className="flex flex-col justify-center min-w-0 pr-2">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-lg sm:text-2xl font-black text-slate-900 font-mono tracking-tight whitespace-nowrap">
                ₹{grandTotal.toLocaleString('en-IN')}
              </span>
              
              {/* (i) Info circular button */}
              <button
                type="button"
                onClick={() => setShowFareBreakupPopup(!showFareBreakupPopup)}
                className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border border-slate-300 text-slate-500 hover:text-sky-600 hover:border-sky-500 flex items-center justify-center transition-colors cursor-pointer bg-slate-50 hover:bg-sky-50 shrink-0"
                title="Click to view full fare breakup"
              >
                <Info className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wide mt-1 whitespace-nowrap">
              <span>{passengers.length} Pax</span>
              {discountAmount > 0 && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="text-emerald-600 font-black normal-case">
                    Saved ₹{discountAmount.toLocaleString('en-IN')}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Right Side: Primary Orange CONTINUE button + Compact Back button */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {step > 1 && (
              <button
                type="button"
                onClick={() => transitionToStep(step - 1)}
                className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 cursor-pointer shadow-xs active:scale-95 transition-all"
                title="Back to previous step"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                if (step === 1) handleProceedToSeats();
                else if (step === 2) handleProceedToReview();
                else if (step === 3) handleProceedToPayment();
                else handleFinalBooking();
              }}
              disabled={isProcessing || isLaunchingApp || (step === 4 && isTimerExpired)}
              className="h-9 sm:h-11 px-4 sm:px-7 rounded-xl bg-[#FF5A00] hover:bg-[#E04F00] active:scale-[0.98] text-white font-black text-xs sm:text-sm uppercase tracking-wide shadow-md hover:shadow-orange-500/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-50"
            >
              <span>
                {isProcessing || isLaunchingApp ? (
                  'Processing...'
                ) : step === 1 ? (
                  <>
                    <span className="sm:hidden">Continue</span>
                    <span className="hidden sm:inline">Continue to Seats</span>
                  </>
                ) : step === 2 ? (
                  <>
                    <span className="sm:hidden">Continue</span>
                    <span className="hidden sm:inline">Continue to Review</span>
                  </>
                ) : step === 3 ? (
                  <>
                    <span className="sm:hidden">Pay Now</span>
                    <span className="hidden sm:inline">Continue to Payment</span>
                  </>
                ) : isTimerExpired ? (
                  'Window Expired'
                ) : paymentMethod === 'upiApps' ? (
                  `PAY VIA ${String(selectedUpiApp || 'PHONEPE').toUpperCase()}`
                ) : paymentMethod === 'upiQr' ? (
                  'I Have Paid'
                ) : (
                  `Pay ₹${grandTotal.toLocaleString('en-IN')}`
                )}
              </span>
              {!isProcessing && !isLaunchingApp && <ArrowRight className="w-3.5 h-3.5 shrink-0" />}
            </button>
          </div>

          {/* Fare Breakup Popover when (i) is clicked */}
          <AnimatePresence>
            {showFareBreakupPopup && (
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.95 }}
                className="absolute bottom-full left-3 sm:left-6 mb-2.5 w-[calc(100vw-36px)] sm:w-96 max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 text-xs space-y-2.5"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5 font-extrabold text-sm text-slate-900">
                    <Info className="w-4 h-4 text-sky-600" />
                    <span>Fare Breakup ({passengers.length} Pax)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowFareBreakupPopup(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1.5 text-slate-600 text-xs">
                  <div className="flex justify-between">
                    <span>Base Fare ({passengers.length} Traveller{passengers.length > 1 ? 's' : ''})</span>
                    <span className="font-bold font-mono text-slate-900">₹{standardBaseFare.toLocaleString('en-IN')}</span>
                  </div>

                  {selectedFareTier !== 'saver' && (
                    <div className="flex justify-between">
                      <span>{selectedFareTier === 'super' ? 'AirSky VIP Upgrade' : 'Flexi Plus Upgrade'}</span>
                      <span className="font-bold font-mono text-sky-700">+₹{tierUpgradeTotal.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  {totalSeatFee > 0 && (
                    <div className="flex justify-between">
                      <span>Seat Selection ({passengers.filter(p => p.seatPrice > 0).length} Paid)</span>
                      <span className="font-bold font-mono text-sky-700">+₹{totalSeatFee.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  {totalMealsFee > 0 && (
                    <div className="flex justify-between">
                      <span>Meals & In-Flight Dining</span>
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

                  <div className="flex justify-between">
                    <span>Taxes & Airport Charges</span>
                    <span className="font-bold font-mono text-slate-900">+₹{taxes.toLocaleString('en-IN')}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between items-center gap-2 text-emerald-700 font-extrabold bg-emerald-50 px-2 py-1.5 rounded-lg border border-emerald-200">
                      <span className="truncate">Promo ({couponCode})</span>
                      <span className="font-mono font-black shrink-0 whitespace-nowrap ml-2">-₹{discountAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="font-black text-xs text-slate-900 uppercase block">Total Amount</span>
                    <span className="text-[10px] text-slate-400">All taxes & fees included</span>
                  </div>
                  <span className="text-xl font-black text-slate-900 font-mono">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        )}
      </motion.div>
    </motion.div>
  );
}

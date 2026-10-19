import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plane, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight,
  Calendar,
  Users,
  Compass,
  Tag,
  TrendingDown
} from 'lucide-react';

export default function FlightSearchLoader({
  searchParams = {},
  airports = [],
  isRoundTrip = false,
  roundTripData = null,
  isMultiCity = false,
  multiCityLegsData = null,
  brand = null
}) {
  const [flightCount, setFlightCount] = useState(0);
  const [lowestFare, setLowestFare] = useState(7999);
  const [activeAirlineIdx, setActiveAirlineIdx] = useState(0);
  const [messageIdx, setMessageIdx] = useState(0);

  const searchMessages = [
    "Connecting to Amadeus, Sabre & Airline Direct APIs...",
    "Scanning 150+ airlines for non-stop & shortest layovers...",
    "Comparing lowest airfares & applying secret promo discounts...",
    "Locking in live seat availability & baggage allowances..."
  ];

  const airlineBadges = [
    { name: "IndiGo", code: "6E", logo: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=80&q=80", color: "#00457C" },
    { name: "Air India", code: "AI", logo: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=80&q=80", color: "#ED1B24" },
    { name: "Emirates", code: "EK", logo: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=80&q=80", color: "#D71A21" },
    { name: "Saudia", code: "SV", logo: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=80&q=80", color: "#006C35" },
    { name: "Qatar Airways", code: "QR", logo: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=80&q=80", color: "#5C0632" },
    { name: "Vistara", code: "UK", logo: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=80&q=80", color: "#3B1443" }
  ];

  // Helper to resolve airport details
  const getAirportInfo = (query) => {
    if (!query) return { code: '---', city: 'Departure', name: 'Airport' };
    const clean = String(query).trim().toLowerCase();
    const found = airports.find(
      (a) => a.code?.toLowerCase() === clean || a.city?.toLowerCase() === clean
    );
    if (found) return found;
    return {
      code: query.length <= 4 ? query.toUpperCase() : query.slice(0, 3).toUpperCase(),
      city: query,
      name: `${query} Airport`
    };
  };

  let origin = getAirportInfo(searchParams.from || 'DEL');
  let destination = getAirportInfo(searchParams.to || 'BOM');
  let tripTypeTitle = 'One-Way Flight';

  if (isRoundTrip) {
    origin = getAirportInfo(searchParams.from || roundTripData?.from);
    destination = getAirportInfo(searchParams.to || roundTripData?.to);
    tripTypeTitle = 'Round-Trip Flight';
  } else if (isMultiCity && multiCityLegsData && multiCityLegsData.length > 0) {
    origin = getAirportInfo(multiCityLegsData[0]?.from || searchParams.from);
    destination = getAirportInfo(
      multiCityLegsData[multiCityLegsData.length - 1]?.to || searchParams.to
    );
    tripTypeTitle = `Multi-City (${multiCityLegsData.length} Legs)`;
  }

  const travelClass = (searchParams.travelClass || 'economy').toUpperCase();
  const paxCount = 
    (searchParams.passengers?.adults || 1) + 
    (searchParams.passengers?.children || 0);

  // Live dynamic counter simulations
  useEffect(() => {
    const flightTimer = setInterval(() => {
      setFlightCount((prev) => {
        if (prev >= 64) return 68;
        return prev + Math.floor(Math.random() * 9) + 4;
      });
    }, 180);

    const fareTimer = setInterval(() => {
      setLowestFare((prev) => {
        if (prev <= 3450) return 3350;
        return prev - Math.floor(Math.random() * 450) - 200;
      });
    }, 280);

    const airlineTimer = setInterval(() => {
      setActiveAirlineIdx((prev) => (prev + 1) % airlineBadges.length);
    }, 450);

    const msgTimer = setInterval(() => {
      setMessageIdx((prev) => (prev + 1) % searchMessages.length);
    }, 1600);

    return () => {
      clearInterval(flightTimer);
      clearInterval(fareTimer);
      clearInterval(airlineTimer);
      clearInterval(msgTimer);
    };
  }, []);

  return (
    <div className="w-full space-y-6 my-2 animate-fadeIn">
      {/* ========================================================= */}
      {/* 1. MAKEMYTRIP / SKYSCANNER SUNNY SKY ANIMATED STAGE        */}
      {/* ========================================================= */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-sky-400 via-sky-300 to-blue-200 text-slate-900 shadow-2xl border-2 border-white/80 p-5 sm:p-8 min-h-[360px] sm:min-h-[420px] flex flex-col justify-between">
        
        {/* Radiant Sunlight in Top-Left */}
        <div className="absolute -top-16 -left-16 w-64 h-64 bg-amber-200/50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 left-0 w-32 h-32 bg-yellow-100/60 rounded-full blur-xl pointer-events-none" />

        {/* ========================================================= */}
        {/* PARALLAX DRIFTING CLOUDS (Layered Depth)                   */}
        {/* ========================================================= */}
        {/* Background Clouds (Slow) */}
        <motion.div
          className="absolute pointer-events-none opacity-40 text-white"
          animate={{ x: ['120%', '-40%'] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          style={{ top: '8%' }}
        >
          <svg className="w-40 sm:w-56 h-20 fill-current" viewBox="0 0 200 80">
            <path d="M 20,60 Q 20,40 40,40 Q 50,15 80,25 Q 110,10 130,30 Q 155,20 170,45 Q 185,50 180,65 Q 170,75 140,75 L 30,75 Q 15,75 20,60 Z" />
          </svg>
        </motion.div>

        {/* Mid-level Cloud */}
        <motion.div
          className="absolute pointer-events-none opacity-60 text-white"
          animate={{ x: ['110%', '-50%'] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear', delay: 3 }}
          style={{ top: '38%' }}
        >
          <svg className="w-48 sm:w-64 h-24 fill-current drop-shadow-md" viewBox="0 0 200 80">
            <path d="M 30,65 Q 25,45 50,42 Q 65,10 95,20 Q 125,5 145,28 Q 175,18 185,45 Q 195,60 180,70 L 40,70 Q 25,70 30,65 Z" />
          </svg>
        </motion.div>

        {/* Foreground Clouds (Fast) */}
        <motion.div
          className="absolute pointer-events-none opacity-75 text-white/90"
          animate={{ x: ['130%', '-60%'] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
          style={{ bottom: '15%' }}
        >
          <svg className="w-56 sm:w-80 h-28 fill-current drop-shadow-lg" viewBox="0 0 200 80">
            <path d="M 25,60 Q 20,38 45,35 Q 60,8 90,18 Q 120,4 140,25 Q 170,15 180,40 Q 190,55 175,68 L 35,68 Q 20,68 25,60 Z" />
          </svg>
        </motion.div>

        {/* ========================================================= */}
        {/* TOP STATUS & ROUTE PILL (Glassmorphism)                   */}
        {/* ========================================================= */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 bg-white/75 backdrop-blur-md px-4 sm:px-6 py-2.5 rounded-2xl border border-white/90 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-600"></span>
            </span>
            <span className="text-xs sm:text-sm font-black text-slate-800 tracking-wide uppercase">
              {tripTypeTitle}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <span className="px-2.5 py-1 rounded-lg bg-sky-100 text-sky-800 border border-sky-200">
              {travelClass}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-200">
              {paxCount} Traveller{paxCount > 1 ? 's' : ''}
            </span>
            {searchParams.date && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white text-slate-800 border border-slate-200">
                <Calendar className="w-3 h-3 text-sky-600" />
                <span>{searchParams.date}</span>
              </span>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* CENTER AIRPORT ROUTE & 3D ANIMATED JETLINER               */}
        {/* ========================================================= */}
        <div className="relative z-10 py-6 sm:py-8">
          
          {/* Origin & Destination Cards Bar */}
          <div className="flex items-center justify-between gap-4 max-w-4xl mx-auto px-2">
            
            {/* Origin City Card */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-3 sm:p-4 shadow-lg border border-white text-left min-w-[110px] sm:min-w-[180px]">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-sky-600 block">
                Depart From
              </span>
              <div className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {origin.code}
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-700 truncate max-w-[120px] sm:max-w-[160px]">
                {origin.city}
              </div>
            </div>

            {/* Middle Dotted Flight Trajectory with Center Badge */}
            <div className="flex-1 px-2 relative hidden md:block">
              <div className="relative flex items-center justify-center">
                <div className="w-full h-1 border-t-2 border-dashed border-white/90" />
                <span className="absolute px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[11px] font-extrabold text-sky-700 shadow-sm border border-sky-100 flex items-center gap-1.5 whitespace-nowrap">
                  <Compass className="w-3.5 h-3.5 text-sky-600 animate-spin" style={{ animationDuration: '4s' }} />
                  <span>Searching Best Route</span>
                </span>
              </div>
            </div>

            {/* Destination City Card */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-3 sm:p-4 shadow-lg border border-white text-right min-w-[110px] sm:min-w-[180px]">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-indigo-600 block">
                Arrive At
              </span>
              <div className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {destination.code}
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-700 truncate max-w-[120px] sm:max-w-[160px] ml-auto">
                {destination.city}
              </div>
            </div>

          </div>

          {/* ========================================================= */}
          {/* THE 3D AIRPLANE FLYING THROUGH THE SKY                    */}
          {/* ========================================================= */}
          <div className="relative w-full h-32 sm:h-40 my-3 flex items-center justify-center overflow-visible">
            
            {/* Dynamic Plane Shadow on Clouds */}
            <motion.div
              className="absolute w-28 sm:w-36 h-6 bg-slate-800/15 rounded-full blur-md pointer-events-none"
              animate={{
                scale: [0.9, 1.15, 0.9],
                y: [40, 52, 40],
                opacity: [0.15, 0.3, 0.15]
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />

            {/* THE COMMERCIAL JETLINER (Detailed SVG Illustration) */}
            <motion.div
              className="relative z-20 flex items-center justify-center"
              animate={{
                y: [-8, 8, -8],
                rotate: [-2, 3, -2],
                scale: [1, 1.04, 1]
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            >
              {/* Twin Jet Engine Contrail Streams */}
              <div className="absolute -left-20 sm:-left-28 top-1/2 -translate-y-1/2 flex flex-col gap-5 pointer-events-none">
                {/* Upper engine exhaust trail */}
                <motion.div
                  className="w-24 sm:w-36 h-2 bg-gradient-to-r from-transparent via-white/80 to-white rounded-full blur-[1px]"
                  animate={{ opacity: [0.4, 0.9, 0.4], scaleX: [0.9, 1.1, 0.9] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                />
                {/* Lower engine exhaust trail */}
                <motion.div
                  className="w-24 sm:w-36 h-2 bg-gradient-to-r from-transparent via-white/80 to-white rounded-full blur-[1px]"
                  animate={{ opacity: [0.9, 0.4, 0.9], scaleX: [1.1, 0.9, 1.1] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
                />
              </div>

              {/* Vector Jet Airplane Illustration */}
              <svg 
                className="w-32 sm:w-44 h-24 sm:h-32 drop-shadow-2xl" 
                viewBox="0 0 240 160" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Airplane Body / Fuselage */}
                <path
                  d="M230 80 C210 65 140 68 80 70 L30 65 C20 65 15 72 20 80 C15 88 20 95 30 95 L80 90 C140 92 210 95 230 80 Z"
                  fill="url(#fuselageGradient)"
                  stroke="#0284c7"
                  strokeWidth="1.5"
                />

                {/* Vertical Tail Fin */}
                <path
                  d="M20 75 L5 25 C3 20 8 18 14 20 L45 70 Z"
                  fill="url(#tailGradient)"
                  stroke="#0369a1"
                  strokeWidth="1.5"
                />

                {/* Horizontal Stabilizer Tail */}
                <path
                  d="M15 80 L5 105 C3 108 8 110 12 108 L35 85 Z"
                  fill="#0284c7"
                />

                {/* Main Wing (Top Wing) */}
                <path
                  d="M110 70 L140 10 C143 5 150 6 152 12 L160 70 Z"
                  fill="url(#wingGradient)"
                  stroke="#0284c7"
                  strokeWidth="1.5"
                />

                {/* Turbofan Jet Engine (Mounted Under Upper Wing) */}
                <rect x="125" y="48" width="34" height="12" rx="6" fill="#1e293b" />
                <ellipse cx="157" cy="54" rx="3" ry="5" fill="#38bdf8" />
                <circle cx="127" cy="54" r="4" fill="#0284c7" />

                {/* Lower Wing */}
                <path
                  d="M110 90 L140 150 C143 155 150 154 152 148 L160 90 Z"
                  fill="url(#wingGradient)"
                  stroke="#0284c7"
                  strokeWidth="1.5"
                />

                {/* Turbofan Jet Engine (Mounted Under Lower Wing) */}
                <rect x="125" y="100" width="34" height="12" rx="6" fill="#1e293b" />
                <ellipse cx="157" cy="106" rx="3" ry="5" fill="#38bdf8" />
                <circle cx="127" cy="106" r="4" fill="#0284c7" />

                {/* Cockpit Windshield Glass */}
                <path
                  d="M210 74 Q220 78 226 80 Q220 82 210 86 L205 74 Z"
                  fill="#0369a1"
                />

                {/* Passenger Cabin Windows Row */}
                {[65, 80, 95, 110, 125, 140, 155, 170, 185].map((x) => (
                  <circle key={x} cx={x} cy="79" r="2" fill="#0284c7" />
                ))}

                {/* Aircraft Livery Speed Ribbon */}
                <path
                  d="M60 84 Q140 85 210 82"
                  stroke="#f59e0b"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* SVG Color Gradients */}
                <defs>
                  <linearGradient id="fuselageGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f8fafc" />
                    <stop offset="50%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#e2e8f0" />
                  </linearGradient>
                  <linearGradient id="wingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#e0f2fe" />
                    <stop offset="100%" stopColor="#0284c7" />
                  </linearGradient>
                  <linearGradient id="tailGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0284c7" />
                    <stop offset="100%" stopColor="#1e3a8a" />
                  </linearGradient>
                </defs>
              </svg>
            </motion.div>

          </div>

        </div>

        {/* ========================================================= */}
        {/* 3. DOPAMINE LIVE STATS: FLIGHT COUNTER & LOWEST FARE TICKER */}
        {/* ========================================================= */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
          
          {/* Card 1: Flights Found Rolling Counter */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-3.5 shadow-md border border-white flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Live Flight Scanner
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-2xl sm:text-3xl font-black text-sky-600 font-mono">
                  {flightCount}
                </span>
                <span className="text-xs font-extrabold text-slate-700">
                  Flights Found
                </span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-sky-100 flex items-center justify-center text-sky-600 shrink-0">
              <Plane className="w-5 h-5 rotate-45 animate-pulse" />
            </div>
          </div>

          {/* Card 2: Lowest Fare Dropping Counter */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-3.5 shadow-md border border-white flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Cheapest Fare Unlocked
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono">
                  ₹{lowestFare.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                  BEST PRICE
                </span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>

          {/* Card 3: Airline Partner Verification Slot */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-3.5 shadow-md border border-white flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Checking Airlines
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span 
                  className="w-2.5 h-2.5 rounded-full animate-ping"
                  style={{ backgroundColor: airlineBadges[activeAirlineIdx].color }}
                />
                <span className="text-sm font-black text-slate-900 truncate">
                  {airlineBadges[activeAirlineIdx].name} ({airlineBadges[activeAirlineIdx].code})
                </span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-emerald-600 shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
          </div>

        </div>

        {/* Bottom Reassuring Step Message */}
        <div className="relative z-10 mt-3 pt-3 border-t border-slate-300/60 flex items-center justify-between text-xs text-slate-800 font-semibold">
          <div className="flex items-center gap-2 truncate">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0 animate-bounce" />
            <AnimatePresence mode="wait">
              <motion.span
                key={messageIdx}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="truncate font-extrabold text-slate-800"
              >
                {searchMessages[messageIdx]}
              </motion.span>
            </AnimatePresence>
          </div>
          <span className="text-[11px] font-bold text-slate-600 shrink-0">
            Powered by Global GDS
          </span>
        </div>

      </div>

      {/* ========================================================= */}
      {/* 2. REALISTIC FLIGHT CARD SKELETONS WITH SHIMMER GRADIENT   */}
      {/* ========================================================= */}
      <div className="space-y-3.5">
        {[1, 2, 3].map((card) => (
          <div
            key={card}
            className="bg-white rounded-2xl sm:rounded-3xl p-5 border border-slate-200 shadow-xs relative overflow-hidden"
          >
            {/* Shimmer sweep animation */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-40 bg-gradient-to-r from-transparent via-slate-100 to-transparent"
              style={{
                animation: 'shimmer 2s infinite linear',
                backgroundSize: '200% 100%'
              }}
            />

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              
              {/* Airline Col */}
              <div className="md:col-span-3 flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-200 animate-pulse shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 bg-slate-200 rounded-md w-28 animate-pulse" />
                  <div className="h-3 bg-slate-100 rounded-md w-20 animate-pulse" />
                </div>
              </div>

              {/* Timing & Route Col */}
              <div className="md:col-span-6 flex items-center justify-between gap-3">
                {/* Departure */}
                <div className="space-y-1 text-left">
                  <div className="h-5 bg-slate-200 rounded-md w-16 animate-pulse" />
                  <div className="h-3 bg-slate-100 rounded-md w-12 animate-pulse" />
                </div>

                {/* Duration Line */}
                <div className="flex-1 max-w-[150px] px-2 text-center space-y-1.5">
                  <div className="h-3 bg-slate-100 rounded-md w-14 mx-auto animate-pulse" />
                  <div className="relative flex items-center justify-center">
                    <div className="w-full h-0.5 bg-slate-200" />
                    <div className="absolute w-2.5 h-2.5 rounded-full bg-amber-400 border border-white" />
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-md w-16 mx-auto animate-pulse" />
                </div>

                {/* Arrival */}
                <div className="space-y-1 text-right">
                  <div className="h-5 bg-slate-200 rounded-md w-16 animate-pulse ml-auto" />
                  <div className="h-3 bg-slate-100 rounded-md w-12 animate-pulse ml-auto" />
                </div>
              </div>

              {/* Price & Action Button Col */}
              <div className="md:col-span-3 flex md:flex-col items-center md:items-end justify-between gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                <div className="space-y-1 text-left md:text-right">
                  <div className="h-6 bg-slate-200 rounded-lg w-24 animate-pulse" />
                  <div className="h-3 bg-slate-100 rounded-md w-16 animate-pulse ml-auto" />
                </div>
                <div className="h-10 bg-sky-200 rounded-xl w-28 animate-pulse" />
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

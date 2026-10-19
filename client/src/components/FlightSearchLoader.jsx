import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plane, 
  Sparkles, 
  ShieldCheck, 
  Globe, 
  ArrowRight,
  Calendar,
  Users,
  Compass,
  CheckCircle2,
  Clock,
  Luggage,
  Cloud
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
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(15);

  const searchSteps = [
    {
      icon: Globe,
      title: "Connecting to Global Aviation Distribution Networks...",
      sub: "Querying live GDS airline feeds (Amadeus, Sabre & Airline Direct APIs)"
    },
    {
      icon: Plane,
      title: "Searching 150+ Airlines for Real-Time Schedules...",
      sub: "Locating fastest non-stop and optimal connecting flights"
    },
    {
      icon: Sparkles,
      title: "Scanning Lowest Airfares & Instant Web Discounts...",
      sub: "Applying special promotional coupons, student and senior citizen fares"
    },
    {
      icon: ShieldCheck,
      title: "Confirming Live Seat Availability & Baggage Allowances...",
      sub: "Fetching refundable fare rules, terminal gates and meal inclusions"
    }
  ];

  // Rotate through steps
  useEffect(() => {
    const stepInterval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % searchSteps.length);
    }, 1800);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) return 92;
        return prev + Math.floor(Math.random() * 8) + 4;
      });
    }, 250);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, []);

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

  // Determine Origin & Destination depending on trip type
  let origin = getAirportInfo(searchParams.from || 'DEL');
  let destination = getAirportInfo(searchParams.to || 'BOM');
  let tripLabel = 'ONE-WAY TRIP';

  if (isRoundTrip) {
    origin = getAirportInfo(searchParams.from || roundTripData?.from);
    destination = getAirportInfo(searchParams.to || roundTripData?.to);
    tripLabel = 'ROUND TRIP';
  } else if (isMultiCity && multiCityLegsData && multiCityLegsData.length > 0) {
    origin = getAirportInfo(multiCityLegsData[0]?.from || searchParams.from);
    destination = getAirportInfo(
      multiCityLegsData[multiCityLegsData.length - 1]?.to || searchParams.to
    );
    tripLabel = `MULTI-CITY (${multiCityLegsData.length} LEGS)`;
  }

  const travelClass = (searchParams.travelClass || 'economy').toUpperCase();
  const passengerCount = 
    (searchParams.passengers?.adults || 1) + 
    (searchParams.passengers?.children || 0) + 
    (searchParams.passengers?.infants || 0);

  const popularAirlines = [
    { name: "IndiGo", code: "6E", color: "from-blue-500 to-indigo-600" },
    { name: "Air India", code: "AI", color: "from-red-500 to-amber-600" },
    { name: "Emirates", code: "EK", color: "from-emerald-500 to-teal-700" },
    { name: "Saudia", code: "SV", color: "from-green-600 to-emerald-800" },
    { name: "Qatar Airways", code: "QR", color: "from-purple-600 to-rose-700" },
    { name: "Vistara", code: "UK", color: "from-violet-600 to-indigo-800" }
  ];

  const currentStep = searchSteps[stepIndex];
  const StepIcon = currentStep.icon;

  return (
    <div className="w-full space-y-6 my-2 animate-fadeIn">
      {/* ========================================================= */}
      {/* 1. HERO ANIMATED FLIGHT STAGE BANNER                       */}
      {/* ========================================================= */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-sky-950 to-indigo-950 text-white p-6 sm:p-8 shadow-2xl border border-sky-500/25">
        
        {/* Soft background ambient glowing orbs */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-40 bg-sky-400/10 rounded-full blur-2xl pointer-events-none" />

        {/* Top Header Pill Bar */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-black tracking-widest uppercase text-emerald-400">
              Live Flight Search In Progress
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-white/10 border border-white/15 text-sky-200">
              {tripLabel}
            </span>
            <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-sky-500/20 border border-sky-400/30 text-sky-300">
              {travelClass} • {passengerCount} {passengerCount > 1 ? 'PAX' : 'PAX'}
            </span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. AIRPORT TO AIRPORT FLIGHT PATH ANIMATION               */}
        {/* ========================================================= */}
        <div className="relative z-10 py-6 sm:py-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* Origin Airport */}
            <div className="md:col-span-3 text-left">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-sm shadow-sky-400 animate-pulse" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-300">
                  Departure
                </span>
              </div>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                {origin.code}
              </div>
              <div className="text-base sm:text-lg font-bold text-slate-100 truncate">
                {origin.city}
              </div>
              <div className="text-xs text-sky-200/80 truncate max-w-[200px]">
                {origin.name}
              </div>
              {searchParams.date && (
                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 text-[11px] text-sky-200 font-semibold border border-white/10">
                  <Calendar className="w-3 h-3 text-sky-400" />
                  <span>{searchParams.date}</span>
                </div>
              )}
            </div>

            {/* Flight Trajectory & Animated Airplane */}
            <div className="md:col-span-6 relative py-4 sm:py-6">
              
              {/* Route Line Track with glowing gradient */}
              <div className="relative w-full h-12 flex items-center justify-center">
                
                {/* SVG Arched Dotted Flight Trajectory */}
                <svg className="w-full h-14 overflow-visible" preserveAspectRatio="none" viewBox="0 0 300 40">
                  <defs>
                    <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                      <stop offset="50%" stopColor="#60a5fa" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#818cf8" stopOpacity="0.4" />
                    </linearGradient>
                  </defs>
                  {/* Subtle baseline track */}
                  <path
                    d="M 10 30 Q 150 0 290 30"
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth="3"
                  />
                  {/* Glowing flight trajectory */}
                  <path
                    d="M 10 30 Q 150 0 290 30"
                    fill="none"
                    stroke="url(#routeGradient)"
                    strokeWidth="3"
                    strokeDasharray="6 6"
                    className="animate-pulse"
                  />
                </svg>

                {/* Drifting Clouds in Background */}
                <motion.div
                  className="absolute pointer-events-none text-sky-300/20"
                  animate={{ x: [120, -120], opacity: [0, 0.4, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                  style={{ top: '15%' }}
                >
                  <Cloud className="w-8 h-8" />
                </motion.div>
                <motion.div
                  className="absolute pointer-events-none text-white/15"
                  animate={{ x: [80, -140], opacity: [0, 0.3, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear", delay: 2 }}
                  style={{ top: '65%' }}
                >
                  <Cloud className="w-6 h-6" />
                </motion.div>

                {/* ANIMATED AIRPLANE GLIDING ALONG ROUTE */}
                <motion.div
                  className="absolute z-20 flex items-center pointer-events-none"
                  animate={{
                    left: ['5%', '88%'],
                    y: ['2px', '-18px', '2px'],
                    rotate: [10, 2, -6]
                  }}
                  transition={{
                    duration: 2.8,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  {/* Contrail Vapor Trail */}
                  <div className="w-12 sm:w-16 h-1 bg-gradient-to-r from-transparent via-sky-300 to-white/90 rounded-full blur-[0.5px]" />
                  
                  {/* Plane Icon inside glowing pulse circle */}
                  <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 border-2 border-white shadow-xl shadow-sky-400/50 flex items-center justify-center transform rotate-90">
                    <Plane className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                </motion.div>

              </div>

              {/* Mid-route Info Banner */}
              <div className="text-center mt-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-bold text-sky-200 border border-white/10">
                  <Compass className="w-3.5 h-3.5 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
                  <span>Scanning Direct & Best 1-Stop Connections</span>
                </span>
              </div>
            </div>

            {/* Destination Airport */}
            <div className="md:col-span-3 text-left md:text-right">
              <div className="flex items-center md:justify-end gap-2 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-300">
                  Destination
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 shadow-sm shadow-indigo-400 animate-pulse" />
              </div>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                {destination.code}
              </div>
              <div className="text-base sm:text-lg font-bold text-slate-100 truncate">
                {destination.city}
              </div>
              <div className="text-xs text-sky-200/80 truncate max-w-[200px] md:ml-auto">
                {destination.name}
              </div>
              {(isRoundTrip && searchParams.returnDate) && (
                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 text-[11px] text-sky-200 font-semibold border border-white/10">
                  <Calendar className="w-3 h-3 text-indigo-400" />
                  <span>Return: {searchParams.returnDate}</span>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. DYNAMIC LIVE STEP TICKER & SHIMMER PROGRESS BAR         */}
        {/* ========================================================= */}
        <div className="relative z-10 pt-4 border-t border-white/10 space-y-3">
          
          {/* Animated Message Transition */}
          <div className="min-h-[46px] flex items-center justify-between gap-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={stepIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center shrink-0 shadow-inner">
                  <StepIcon className="w-4 h-4 text-sky-300 animate-bounce" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-extrabold text-white">
                    {currentStep.title}
                  </h4>
                  <p className="text-xs text-sky-200/70 hidden sm:block">
                    {currentStep.sub}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            <span className="text-xs font-black font-mono text-sky-300 shrink-0">
              {progress}%
            </span>
          </div>

          {/* Glowing Shimmer Progress Bar */}
          <div className="relative w-full h-2.5 bg-slate-800/80 rounded-full overflow-hidden border border-white/10">
            <motion.div
              className="h-full bg-gradient-to-r from-sky-400 via-cyan-400 to-indigo-500 rounded-full relative"
              initial={{ width: '15%' }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "easeOut", duration: 0.3 }}
            >
              {/* Shimmer light sweep */}
              <div 
                className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent"
                style={{
                  animation: 'shimmer 1.5s infinite linear',
                  backgroundSize: '200% 100%'
                }}
              />
            </motion.div>
          </div>

          {/* Airlines being queried live pills */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-semibold">
              <span>Checking partner inventory:</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {popularAirlines.map((al, idx) => (
                <div
                  key={al.code}
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-all ${
                    idx <= stepIndex + 1
                      ? 'bg-white/15 text-white border-sky-400/40 shadow-xs'
                      : 'bg-white/5 text-slate-400 border-white/5'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${al.color}`} />
                  <span>{al.name}</span>
                  {idx <= stepIndex && (
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* ========================================================= */}
      {/* 4. REALISTIC SKELETON FLIGHT CARDS WITH SHIMMER GRADIENT   */}
      {/* ========================================================= */}
      <div className="space-y-3.5">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="bg-white rounded-2xl sm:rounded-3xl p-5 border border-slate-200/90 shadow-sm relative overflow-hidden"
          >
            {/* Shimmer sweep effect over card */}
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
                    <div className="absolute w-2 h-2 rounded-full bg-slate-300" />
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

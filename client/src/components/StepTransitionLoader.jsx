import React from 'react';
import { motion } from 'motion/react';
import { Plane, Armchair, ShieldCheck, FileText, Users, Lock, Sparkles, CheckCircle2 } from 'lucide-react';
import AirlineBadge from './AirlineBadge';

export default function StepTransitionLoader({
  targetStep = 2,
  fromStep = 1,
  flight = {},
  passengersCount = 1
}) {
  const isGoingBack = targetStep < fromStep;

  // Contextual step messaging
  let title = 'Loading Next Step...';
  let subtitle = 'Connecting to airline live systems...';
  let StepIcon = Plane;

  if (targetStep === 2) {
    title = isGoingBack ? 'Reopening Seat Selection' : 'Loading Cabin & Live Seats';
    subtitle = `Fetching ${flight.airline || 'flight'} aircraft seat map & meal preferences...`;
    StepIcon = Armchair;
  } else if (targetStep === 3) {
    title = isGoingBack ? 'Returning to Review' : 'Finalizing Fare & Itinerary';
    subtitle = `Locking in seat choices & applying secret promo discounts...`;
    StepIcon = FileText;
  } else if (targetStep === 4) {
    title = 'Connecting to Secure Gateway';
    subtitle = 'Securing 256-Bit SSL encrypted UPI & instant booking channel...';
    StepIcon = Lock;
  } else if (targetStep === 1) {
    title = 'Returning to Traveller Details';
    subtitle = 'Retrieving passenger names and contact preferences...';
    StepIcon = Users;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="absolute inset-0 z-50 flex flex-col items-center justify-center p-6 bg-slate-950/85 backdrop-blur-md rounded-3xl text-white select-none overflow-hidden"
    >
      {/* Ambient Glow Orbs */}
      <div className="absolute -top-16 -left-16 w-60 h-60 bg-sky-500/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 w-60 h-60 bg-indigo-500/25 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center text-center space-y-4">
        {/* Top Flight Header Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold shadow-xs">
          <AirlineBadge code={flight.airlineCode} name={flight.airline} size="xs" showDetails={false} />
          <span className="font-bold text-slate-200">
            {flight.airline} {flight.flightNumber ? `• ${flight.flightNumber}` : ''}
          </span>
          <span className="text-sky-300 font-extrabold font-mono">
            {flight.from || 'DEL'} ➔ {flight.to || 'BOM'}
          </span>
        </div>

        {/* 3D Radar & Jetliner Animation Stage */}
        <div className="relative w-28 h-28 my-1 flex items-center justify-center">
          {/* Outer Pulsing Waves */}
          <motion.div
            className="absolute inset-0 rounded-full border border-sky-400/30"
            animate={{ scale: [0.8, 1.35], opacity: [0.8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
          />
          <motion.div
            className="absolute inset-2 rounded-full border border-teal-400/25"
            animate={{ scale: [0.8, 1.25], opacity: [0.7, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut', delay: 0.4 }}
          />

          {/* Rotating Dashed Radar Ring */}
          <div
            className="absolute inset-0 rounded-full border-2 border-dashed border-sky-400/40 animate-spin"
            style={{ animationDuration: '6s' }}
          />

          {/* Central Glowing Shield / Backdrop */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-600 via-blue-600 to-indigo-600 shadow-lg shadow-sky-500/30 border border-white/20 flex items-center justify-center relative overflow-hidden">
            {/* Plane Silhouette Flying diagonally */}
            <motion.div
              animate={{
                y: [-3, 3, -3],
                x: [-2, 2, -2],
                rotate: isGoingBack ? [215, 225, 215] : [40, 48, 40]
              }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              className="text-white drop-shadow-md relative"
            >
              <Plane className="w-8 h-8 fill-current text-white transform" />
              {/* Jet Propulsion Glow */}
              <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-amber-400 rounded-full blur-xs opacity-80 animate-ping" />
            </motion.div>
          </div>
        </div>

        {/* Step Transition Title & Status */}
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-sky-400 text-xs font-bold uppercase tracking-wider">
            <StepIcon className="w-3.5 h-3.5" />
            <span>Step {targetStep} of 4</span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
            {title}
          </h3>
          <p className="text-xs text-slate-300 font-medium max-w-xs mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Shimmer Progress Bar */}
        <div className="w-52 sm:w-64 h-1.5 bg-white/10 rounded-full overflow-hidden border border-white/15 p-[1px]">
          <motion.div
            className="h-full bg-gradient-to-r from-sky-400 via-teal-300 to-indigo-400 rounded-full shadow-sm shadow-sky-400/60"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 0.75, ease: 'easeInOut' }}
          />
        </div>

        {/* Bottom Trust Badges */}
        <div className="pt-1 flex items-center justify-center gap-4 text-[10px] text-slate-400 font-semibold">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>256-Bit SSL</span>
          </span>
          <span className="w-1 h-1 rounded-full bg-slate-600" />
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-sky-400" />
            <span>Live Airline Sync</span>
          </span>
          <span className="w-1 h-1 rounded-full bg-slate-600" />
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-teal-400" />
            <span>Instant PNR</span>
          </span>
        </div>
      </div>
    </motion.div>
  );
}

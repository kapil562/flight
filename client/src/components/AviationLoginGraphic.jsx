import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plane, Compass, Radio, Shield, Award, Sparkles, Navigation, Cloud } from 'lucide-react';

export default function AviationLoginGraphic({ activeTheme = 'sky' }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [radarAngle, setRadarAngle] = useState(0);

  // Radar continuous sweep
  useEffect(() => {
    const interval = setInterval(() => {
      setRadarAngle(prev => (prev + 3) % 360);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  // Parallax tilt on mouse move
  const handleMouseMove = (e) => {
    const { clientX, clientY, currentTarget } = e;
    const { width, height, left, top } = currentTarget.getBoundingClientRect();
    const x = (clientX - left) / width - 0.5;
    const y = (clientY - top) / height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-full min-h-[380px] lg:min-h-[580px] rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-sky-950 to-slate-900 text-white flex flex-col justify-between p-6 sm:p-8 select-none shadow-2xl border border-white/10"
    >
      {/* Dynamic Ambient Sky Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Sky backdrop atmospheric gradients */}
        <div 
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full blur-[100px] opacity-40 transition-colors duration-700"
          style={{ background: 'var(--theme-primary, #0284c7)' }}
        />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full blur-[110px] opacity-30 bg-blue-600" />
        <div className="absolute top-1/2 left-1/3 w-80 h-80 rounded-full blur-[90px] opacity-25 bg-cyan-400" />

        {/* Ambient Starfield / High Altitude Particles */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.15)_1px,transparent_1px),radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.2)_1px,transparent_1px),radial-gradient(circle_at_40%_80%,rgba(255,255,255,0.15)_1px,transparent_1px),radial-gradient(circle_at_70%_75%,rgba(255,255,255,0.15)_1px,transparent_1px)] bg-[size:140px_140px]" />

        {/* Drifting Clouds (Multi-layer Parallax) */}
        <motion.div
          animate={{ x: [-80, 200, -80] }}
          transition={{ duration: 32, repeat: Infinity, ease: 'linear' }}
          className="absolute top-12 -left-20 w-80 h-28 bg-white/5 rounded-full blur-2xl"
        />
        <motion.div
          animate={{ x: [200, -100, 200] }}
          transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
          className="absolute bottom-28 -right-20 w-96 h-36 bg-sky-400/10 rounded-full blur-3xl"
        />
      </div>

      {/* TOP BAR: Aviation Status / HUD */}
      <div className="relative z-10 flex items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-sky-400 shadow-inner">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-wider uppercase text-sky-400">AirSky Avionics</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            </div>
            <p className="text-[10px] font-mono text-slate-400 tracking-wider">RADAR: ACTIVE • SAT-LINK 100%</p>
          </div>
        </div>

        {/* Altitude & Heading Tape */}
        <div className="hidden sm:flex items-center gap-3 font-mono text-[11px] bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 backdrop-blur-md">
          <div className="flex items-center gap-1.5 text-amber-400">
            <Compass className="w-3.5 h-3.5" />
            <span>HDG 284°</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="text-cyan-300 font-semibold">
            <span>FL380 (38,000 FT)</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="text-emerald-400">
            <span>M 0.85 (510 KTS)</span>
          </div>
        </div>
      </div>

      {/* CENTER: 3D-PERSPECTIVE AIRLINER & RADAR HUD */}
      <div className="relative z-10 my-auto py-8 sm:py-12 flex flex-col items-center justify-center">
        
        {/* Radar Range Rings */}
        <div className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full border border-sky-500/20 pointer-events-none flex items-center justify-center">
          <div className="w-52 h-52 sm:w-68 sm:h-68 rounded-full border border-sky-400/15 flex items-center justify-center">
            <div className="w-32 h-32 sm:w-44 sm:h-44 rounded-full border border-sky-300/10" />
          </div>

          {/* Sweeping Radar Scanner Line */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `conic-gradient(from ${radarAngle}deg at 50% 50%, rgba(56, 189, 248, 0.28) 0deg, rgba(56, 189, 248, 0) 45deg)`
            }}
          />

          {/* Radar Blip 1: DEL */}
          <div className="absolute top-12 left-16 flex items-center gap-1.5 text-[9px] font-mono text-emerald-400 bg-black/60 px-2 py-0.5 rounded-md border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>AI-102 (DEL)</span>
          </div>

          {/* Radar Blip 2: BOM */}
          <div className="absolute bottom-16 right-12 flex items-center gap-1.5 text-[9px] font-mono text-sky-300 bg-black/60 px-2 py-0.5 rounded-md border border-sky-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
            <span>6E-554 (BOM)</span>
          </div>
        </div>

        {/* Interactive Tilt Container for Aircraft */}
        <motion.div
          animate={{
            x: mousePos.x * 25,
            y: mousePos.y * 20 - 4,
            rotateZ: mousePos.x * 12,
            rotateX: -mousePos.y * 12
          }}
          transition={{ type: 'spring', stiffness: 120, damping: 14 }}
          className="relative cursor-pointer flex flex-col items-center"
        >
          {/* Contrail Vapor Trails behind engines */}
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 flex justify-between pointer-events-none opacity-40">
            <motion.div
              animate={{ opacity: [0.2, 0.6, 0.2], height: ['60px', '90px', '60px'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-1.5 bg-gradient-to-t from-transparent via-cyan-200 to-white rounded-full blur-[1px]"
            />
            <motion.div
              animate={{ opacity: [0.2, 0.6, 0.2], height: ['60px', '90px', '60px'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
              className="w-1.5 bg-gradient-to-t from-transparent via-cyan-200 to-white rounded-full blur-[1px]"
            />
          </div>

          {/* High-Fidelity Jet Vector Illustration */}
          <div className="relative">
            {/* Glowing Engine Thrust Aura */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-32 bg-cyan-400/25 rounded-full blur-2xl pointer-events-none" />

            <svg
              className="w-48 h-48 sm:w-60 sm:h-60 filter drop-shadow-[0_20px_35px_rgba(2,132,199,0.45)]"
              viewBox="0 0 200 200"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Airplane Shadow / Halo */}
              <ellipse cx="100" cy="180" rx="45" ry="8" fill="rgba(0,0,0,0.35)" filter="blur(6px)" />

              {/* Main Fuselage Body */}
              <path
                d="M100 20 C106 35 110 70 110 135 C110 155 106 175 100 185 C94 175 90 155 90 135 C90 70 94 35 100 20 Z"
                fill="url(#fuselageGradient)"
                stroke="#e2e8f0"
                strokeWidth="1.5"
              />

              {/* Cockpit Windshield Visor */}
              <path
                d="M96 32 C98 30 102 30 104 32 C106 35 106 38 104 40 C101 41 99 41 96 40 C94 38 94 35 96 32 Z"
                fill="#0284c7"
                stroke="#38bdf8"
                strokeWidth="1"
              />

              {/* Swept Main Wings */}
              <path
                d="M92 90 L20 128 C15 131 16 135 22 135 L90 120 Z"
                fill="url(#wingGradientLeft)"
                stroke="#cbd5e1"
                strokeWidth="1.2"
              />
              <path
                d="M108 90 L180 128 C185 131 184 135 178 135 L110 120 Z"
                fill="url(#wingGradientRight)"
                stroke="#cbd5e1"
                strokeWidth="1.2"
              />

              {/* Wing Sharklets (Vertical Wingtips) */}
              <path d="M19 126 L17 114 C17 112 21 113 22 118 L22 133 Z" fill="#38bdf8" />
              <path d="M181 126 L183 114 C183 112 179 113 178 118 L178 133 Z" fill="#38bdf8" />

              {/* Dual Turbofan Engines Under Wings */}
              <rect x="58" y="106" width="10" height="24" rx="4" fill="#334155" stroke="#94a3b8" strokeWidth="1" />
              <circle cx="63" cy="108" r="3.5" fill="#38bdf8" />
              
              <rect x="132" y="106" width="10" height="24" rx="4" fill="#334155" stroke="#94a3b8" strokeWidth="1" />
              <circle cx="137" cy="108" r="3.5" fill="#38bdf8" />

              {/* Horizontal Tail Stabilizers */}
              <path d="M93 162 L55 180 C52 182 53 184 57 184 L93 174 Z" fill="#94a3b8" />
              <path d="M107 162 L145 180 C148 182 147 184 143 184 L107 174 Z" fill="#94a3b8" />

              {/* Vertical Tail Fin */}
              <path d="M98 140 L102 140 L104 185 L96 185 Z" fill="#0284c7" />

              {/* Navigation Strobe Lights */}
              {/* Left Wing (Port): Red Beacon */}
              <circle cx="18" cy="120" r="3" fill="#ef4444" className="animate-ping" />
              <circle cx="18" cy="120" r="2" fill="#f87171" />

              {/* Right Wing (Starboard): Green Beacon */}
              <circle cx="182" cy="120" r="3" fill="#22c55e" className="animate-ping" />
              <circle cx="182" cy="120" r="2" fill="#4ade80" />

              {/* Tail: White Flash */}
              <circle cx="100" cy="186" r="2.5" fill="#ffffff" className="animate-pulse" />

              {/* Gradient Definitions */}
              <defs>
                <linearGradient id="fuselageGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#f8fafc" />
                  <stop offset="50%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#cbd5e1" />
                </linearGradient>
                <linearGradient id="wingGradientLeft" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#94a3b8" />
                  <stop offset="100%" stopColor="#f1f5f9" />
                </linearGradient>
                <linearGradient id="wingGradientRight" x1="1" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#94a3b8" />
                  <stop offset="100%" stopColor="#f1f5f9" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Interactive Floating Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-white flex items-center gap-2 shadow-lg"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
            <span>Boeing 787-9 Dreamliner • AirSkyGo Fleet</span>
          </motion.div>
        </motion.div>
      </div>

      {/* BOTTOM CARD: Live Waypoint Tracker & Member Perks */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-white/10">
        
        {/* Route Card */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3 border border-white/10 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono text-sky-400 font-bold uppercase">LIVE CRUISE FLIGHT</div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm font-black text-white">DEL</span>
              <Plane className="w-3.5 h-3.5 text-amber-400 rotate-90" />
              <span className="text-sm font-black text-white">BOM</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-mono text-emerald-400 font-bold">ON TIME</span>
            <div className="text-[10px] text-slate-400">ETA: 48 Mins</div>
          </div>
        </div>

        {/* Member Benefits Badge */}
        <div className="bg-gradient-to-r from-amber-500/15 to-sky-500/15 backdrop-blur-md rounded-2xl p-3 border border-amber-400/20 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0">
            <Award className="w-4 h-4" />
          </div>
          <div className="truncate">
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>SkyClub Rewards</span>
              <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded">GOLD</span>
            </div>
            <div className="text-[10px] text-slate-300 truncate">Instant ₹500 voucher on login</div>
          </div>
        </div>

      </div>

    </div>
  );
}

import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Zap, Headphones, Award, Sparkles, PlaneTakeoff, CheckCircle2, Lock, ArrowUpRight } from 'lucide-react';

export default function WhyBookSection() {
  const stats = [
    { value: '1.4M+', label: 'Verified Flyers', sub: 'Across 40+ Domestic Hubs' },
    { value: '99.8%', label: 'Instant PNR Dispatch', sub: 'Direct Airline GDS Sync' },
    { value: '₹0', label: 'Hidden Service Charges', sub: '100% Transparent Checkout' },
    { value: '24x7', label: 'Priority Support', sub: 'Dedicated Aviation Agents' }
  ];

  return (
    <section className="py-16 sm:py-24 bg-white border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        
        {/* Apple Style Editorial Title */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-black uppercase tracking-widest text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-200/80">
            THE AVIATION STANDARD
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Designed for seamless travel. Built for trust.
          </h2>
          <p className="text-sm sm:text-base text-slate-500 font-medium">
            Every booking is backed by direct airline GDS telemetry, instant digital boarding passes, and zero hidden markups.
          </p>
        </div>

        {/* Apple-Style Bento Grid (3-Card Layout) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Bento Card 1: Speed & Instant PNR */}
          <motion.div 
            whileHover={{ y: -6 }}
            className="rounded-3xl p-8 bg-slate-50 border border-slate-200/80 flex flex-col justify-between hover:shadow-xl hover:border-slate-300 transition-all duration-300"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-2">
                Fastest 30-Sec Reservation
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Streamlined 3-step checkout with live seat assignment, passenger pre-filling, and instant SMS + email delivery of your airline PNR.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-slate-200/60 flex items-center justify-between text-xs font-black text-slate-900">
              <span>Instant GDS Sync</span>
              <ArrowUpRight className="w-4 h-4 text-slate-400" />
            </div>
          </motion.div>

          {/* Bento Card 2: 100% Refund Protection */}
          <motion.div 
            whileHover={{ y: -6 }}
            className="rounded-3xl p-8 bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950 text-white flex flex-col justify-between shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6 border border-emerald-500/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-2">
                100% Refund Guarantee
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Automated cancellation processing directly to your original payment method with complete transparency on airline fare rules.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-black text-emerald-400">
              <span>Zero Processing Friction</span>
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </motion.div>

          {/* Bento Card 3: Interactive Aircraft Cabin */}
          <motion.div 
            whileHover={{ y: -6 }}
            className="rounded-3xl p-8 bg-slate-50 border border-slate-200/80 flex flex-col justify-between hover:shadow-xl hover:border-slate-300 transition-all duration-300"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-600 flex items-center justify-center mb-6">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-2">
                Live 3D Aircraft Cabin Map
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Choose window seats, aisle options, or extra legroom with authentic aircraft layouts matching Airbus A320, A321 and Boeing 737 cabins.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-slate-200/60 flex items-center justify-between text-xs font-black text-slate-900">
              <span>Seat Matrix Preview</span>
              <ArrowUpRight className="w-4 h-4 text-slate-400" />
            </div>
          </motion.div>

        </div>

        {/* Luxury Apple-Style Statistics Strip */}
        <div className="rounded-3xl bg-slate-50 border border-slate-200/80 p-8 sm:p-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/80">
            {stats.map((s, idx) => (
              <div key={idx} className={`${idx !== 0 ? 'pt-6 sm:pt-0 sm:pl-8' : ''}`}>
                <div className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight font-mono">
                  {s.value}
                </div>
                <div className="text-xs sm:text-sm font-black text-slate-800 mt-1 uppercase tracking-wider">
                  {s.label}
                </div>
                <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                  {s.sub}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

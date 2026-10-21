import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Zap, Headphones, Award, Sparkles, PlaneTakeoff, CheckCircle2, Lock } from 'lucide-react';

export default function WhyBookSection() {
  const perks = [
    {
      icon: Zap,
      color: 'bg-amber-500/10 text-amber-600 border border-amber-500/20',
      title: 'Fast 30-Sec Reservation',
      desc: 'Instant 3-step checkout with real-time seat assignment and verified airline PNR generated immediately.'
    },
    {
      icon: ShieldCheck,
      color: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20',
      title: '100% Refund Protection',
      desc: 'Instant automated refund processing directly to your original payment mode upon ticket cancellation.'
    },
    {
      icon: Award,
      color: 'bg-sky-500/10 text-sky-600 border border-sky-500/20',
      title: 'Interactive 3D Aircraft Cabin',
      desc: 'Pick your preferred seat with live aircraft layouts: window seats, aisle options, or extra legroom.'
    },
    {
      icon: Headphones,
      color: 'bg-purple-500/10 text-purple-600 border border-purple-500/20',
      title: '24x7 Priority Travel Desk',
      desc: 'Dedicated flight support agents for web check-in, baggage additions, and live airport flight updates.'
    }
  ];

  const stats = [
    { value: '1.4M+', label: 'Happy Passengers' },
    { value: '99.8%', label: 'Instant PNR Success' },
    { value: '40+', label: 'Domestic & Global Hubs' },
    { value: '₹0', label: 'Hidden Service Fees' }
  ];

  return (
    <section className="bg-gradient-to-b from-white via-slate-50 to-slate-100/70 py-12 sm:py-16 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
        
        {/* Section Header */}
        <motion.div 
          className="text-center max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-black mb-3 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>THE NEXT-GEN AVIATION STANDARD</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Why Millions of Travellers Choose Us
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 font-medium">
            Direct airline GDS connectivity with real-time price monitoring, instant PNRs, and zero booking friction.
          </p>
        </motion.div>

        {/* Feature Bento Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {perks.map((p, idx) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.08 }}
                whileHover={{ y: -5 }}
                className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs hover:shadow-xl hover:border-sky-300 transition-all space-y-3 cursor-pointer group"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${p.color} group-hover:scale-105 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-black text-slate-900 text-base group-hover:text-sky-600 transition-colors">{p.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{p.desc}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Live Statistics Banner */}
        <motion.div 
          className="bg-gradient-to-r from-slate-950 via-slate-900 to-sky-950 rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-slate-800"
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center divide-y sm:divide-y-0 sm:divide-x divide-slate-800">
            {stats.map((s, i) => (
              <div key={i} className="pt-4 sm:pt-0">
                <div className="text-3xl sm:text-4xl font-black tracking-tight text-white font-mono bg-gradient-to-r from-sky-400 to-amber-300 bg-clip-text text-transparent">
                  {s.value}
                </div>
                <div className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
}

import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Zap, Headphones, HeartHandshake, CheckCircle2, Award, Sparkles, Plane } from 'lucide-react';

export default function WhyBookSection() {
  const perks = [
    {
      icon: Zap,
      color: 'bg-amber-500/10 text-amber-600',
      title: 'Fastest 30-Sec Booking',
      desc: 'Seamless 3-step reservation with instant PNR generation and verified digital boarding pass.'
    },
    {
      icon: ShieldCheck,
      color: 'bg-emerald-500/10 text-emerald-600',
      title: '100% Refund Guarantee',
      desc: 'Instant automated refund processing directly to your original payment method upon cancellation.'
    },
    {
      icon: Award,
      color: 'bg-sky-500/10 text-sky-600',
      title: 'Real-Time Seat Matrix',
      desc: 'Interactive 3D aircraft cabin layout lets you pick free standard seats, window seats or extra legroom.'
    },
    {
      icon: Headphones,
      color: 'bg-purple-500/10 text-purple-600',
      title: '24x7 Priority Assistance',
      desc: 'Dedicated flight support desk for web check-in, flight schedule changes and airport gate updates.'
    }
  ];

  const stats = [
    { value: '1.4M+', label: 'Happy Travellers' },
    { value: '99.8%', label: 'Instant PNR Success' },
    { value: '40+', label: 'Domestic & Global Hubs' },
    { value: '₹0', label: 'Hidden Charges' }
  ];

  return (
    <div className="bg-gradient-to-b from-white to-slate-50 py-14 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Title */}
        <motion.div 
          className="text-center max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-bold mb-3 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The AirSkyGo Aviation Standard</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Why Millions of Travellers Choose AirSkyGo
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Engineered with direct airline GDS telemetry for authentic low fares and zero booking hassle.
          </p>
        </motion.div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {perks.map((p, idx) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.1 }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg hover:border-slate-300 transition-all space-y-3 cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${p.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="font-extrabold text-slate-900 text-base">{p.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{p.desc}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Live Statistics Banner */}
        <motion.div 
          className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl"
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center divide-y sm:divide-y-0 sm:divide-x divide-slate-800">
            {stats.map((s, i) => (
              <div key={i} className="pt-4 sm:pt-0">
                <div className="text-3xl sm:text-4xl font-black tracking-tight text-white font-mono bg-gradient-to-r from-sky-400 to-amber-300 bg-clip-text text-transparent">
                  {s.value}
                </div>
                <div className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}

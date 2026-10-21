import React from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  Zap, 
  Headphones, 
  Award, 
  Sparkles, 
  PlaneTakeoff, 
  CheckCircle2, 
  Lock, 
  ArrowUpRight,
  Plane,
  Clock,
  QrCode,
  Check,
  MessageCircle,
  Phone
} from 'lucide-react';

export default function WhyBookSection() {
  const metrics = [
    { value: '1.4M+', label: 'Verified Flyers', sub: 'Across 40+ Domestic Hubs' },
    { value: '99.8%', label: 'GDS PNR Dispatch', sub: 'Instant Telemetry Sync' },
    { value: '₹0', label: 'Hidden Markups', sub: '100% Transparent Checkout' },
    { value: '< 60s', label: 'Support Response', sub: 'Live WhatsApp Concierge' }
  ];

  return (
    <section className="py-20 sm:py-28 bg-slate-50/50 border-t border-slate-200/80 relative overflow-hidden">
      
      {/* Background Ambient Blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-6xl h-96 pointer-events-none -z-10 opacity-40">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-slate-300/40 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-80 h-80 bg-sky-200/30 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        
        {/* Editorial Top Title */}
        <div className="text-center max-w-3xl mx-auto space-y-3.5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 text-white text-xs font-black uppercase tracking-widest shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>The Aviation Standard</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-[1.15]">
            Crafted for speed. <br className="hidden sm:inline" />
            Engineered for complete trust.
          </h2>

          <p className="text-sm sm:text-lg text-slate-500 font-medium max-w-xl mx-auto leading-relaxed">
            Direct airline GDS inventory, instant verified digital tickets, and zero hidden markups at checkout.
          </p>
        </div>

        {/* Asymmetrical Luxury Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Bento Card 1 (Wide 7 Cols): Live Boarding Pass & PNR Dispatch */}
          <motion.div 
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.05 }}
            whileHover={{ y: -4 }}
            className="lg:col-span-7 bg-slate-950 text-white rounded-3xl p-7 sm:p-10 border border-white/10 shadow-2xl flex flex-col justify-between relative overflow-hidden group"
          >
            {/* Subtle Plane Watermark in Background */}
            <div className="absolute -right-8 -bottom-8 opacity-5 pointer-events-none">
              <Plane className="w-80 h-80 rotate-45 text-white" />
            </div>

            {/* Simulated Live Boarding Pass Pod */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border border-white/10 space-y-3 mb-8">
              <div className="flex items-center justify-between text-xs pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
                  </span>
                  <span className="font-black text-white font-mono uppercase tracking-wider text-[11px]">GDS Telemetry Active</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-black border border-emerald-500/30">
                  PNR VERIFIED
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white">DEL</div>
                  <div className="text-[11px] text-slate-400 font-medium">New Delhi (T1)</div>
                </div>

                <div className="flex flex-col items-center px-3">
                  <span className="text-[10px] text-slate-400 font-mono font-bold mb-1">Direct Flight</span>
                  <div className="w-24 sm:w-36 h-0.5 bg-white/20 relative flex items-center justify-center overflow-visible">
                    <motion.div
                      animate={{ x: [-36, 36] }}
                      transition={{ repeat: Infinity, repeatType: "reverse", duration: 3.2, ease: "easeInOut" }}
                      className="absolute"
                    >
                      <Plane className="w-4 h-4 rotate-45 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.7)]" />
                    </motion.div>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold mt-1">2h 15m</span>
                </div>

                <div className="text-right">
                  <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white">BOM</div>
                  <div className="text-[11px] text-slate-400 font-medium">Mumbai (T2)</div>
                </div>
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-slate-300 text-[10px] font-black uppercase tracking-wider mb-3">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>30-Second Ticket Dispatch</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
                Instant Official Airline PNR
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-lg">
                Your booking connects straight to Amadeus and Sabre airline inventory. Once confirmed, your official PNR and digital boarding pass are issued instantly with zero delay.
              </p>
            </div>
          </motion.div>

          {/* Bento Card 2 (5 Cols): 100% Refund Vault */}
          <motion.div 
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.12 }}
            whileHover={{ y: -4 }}
            className="lg:col-span-5 bg-white rounded-3xl p-7 sm:p-10 border border-slate-200/90 shadow-[0_8px_30px_rgba(15,23,42,0.04)] hover:shadow-xl hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mb-6 shadow-xs">
                <ShieldCheck className="w-6 h-6" />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-black uppercase tracking-wider mb-3">
                <span>Passenger Protection</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight mb-2">
                Automated Direct Refunds
              </h3>
              
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-6">
                Cancellations are credited directly back to your original UPI or bank source. No wallet lock-ins or mandatory credit shell vouchers.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Average Refund Processing</span>
              <span className="font-mono font-black text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-full">
                24 - 48 Hours
              </span>
            </div>
          </motion.div>

          {/* Bento Card 3 (5 Cols): Zero Hidden Markups */}
          <motion.div 
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.18 }}
            whileHover={{ y: -4 }}
            className="lg:col-span-5 bg-white rounded-3xl p-7 sm:p-10 border border-slate-200/90 shadow-[0_8px_30px_rgba(15,23,42,0.04)] hover:shadow-xl hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-900 border border-slate-200 flex items-center justify-center mb-6 shadow-xs">
                <Lock className="w-6 h-6" />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-[10px] font-black uppercase tracking-wider mb-3">
                <span>Transparent Checkout</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight mb-2">
                Zero Hidden Convenience Fees
              </h3>

              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                What you see on the search results is exactly what gets billed at payment. Every tax, fuel surcharge, and airport fee is itemized transparently.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-slate-800">
              <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
              <span>Full GST Invoice & Tax Breakup Included</span>
            </div>
          </motion.div>

          {/* Bento Card 4 (Wide 7 Cols): 24x7 WhatsApp & Phone Concierge Desk */}
          <motion.div 
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.24 }}
            whileHover={{ y: -4 }}
            className="lg:col-span-7 bg-white rounded-3xl p-7 sm:p-10 border border-slate-200/90 shadow-[0_8px_30px_rgba(15,23,42,0.04)] hover:shadow-xl hover:border-slate-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
          >
            <div className="space-y-2 max-w-md">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shadow-xs">
                <Headphones className="w-6 h-6" />
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                24x7 Aviation Concierge
              </h3>

              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Need to add extra luggage, change dates, or assist with web check-in? Our dedicated airline travel desk responds in under 60 seconds.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 w-full sm:w-auto shrink-0">
              <motion.a
                href="https://wa.me/918077680310?text=Hi%2C%20I%20need%20help%20with%20flight%20booking"
                target="_blank"
                rel="noreferrer"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                animate={{
                  boxShadow: [
                    "0 4px 14px 0 rgba(16, 185, 129, 0.25)",
                    "0 4px 22px 4px rgba(16, 185, 129, 0.45)",
                    "0 4px 14px 0 rgba(16, 185, 129, 0.25)"
                  ]
                }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="px-5 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Desk</span>
              </motion.a>

              <motion.a
                href="tel:+917224828030"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-5 py-3 rounded-full bg-slate-900 hover:bg-black text-white font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                <span>+91 72248 28030</span>
              </motion.a>
            </div>
          </motion.div>

        </div>

        {/* Minimalist Trust Metrics Bar with Viewport Reveal */}
        <motion.div 
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-10 shadow-xs"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            {metrics.map((m, idx) => (
              <div key={idx} className={`${idx !== 0 ? 'pt-4 sm:pt-0 sm:pl-8' : ''}`}>
                <div className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight font-mono">
                  {m.value}
                </div>
                <div className="text-xs sm:text-sm font-black text-slate-900 mt-1 uppercase tracking-wider">
                  {m.label}
                </div>
                <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                  {m.sub}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
}

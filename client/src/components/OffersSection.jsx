import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Copy, Check, Tag, Gift, Percent, ShieldCheck } from 'lucide-react';

export default function OffersSection({ onApplyPromo }) {
  const [copiedCode, setCopiedCode] = React.useState('');

  const offers = [
    {
      id: 'off-1',
      badge: 'BANK OFFER',
      badgeColor: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      title: 'Flat ₹1,500 OFF with HDFC & ICICI',
      subtitle: 'Valid on domestic & international flights above ₹4,000',
      code: 'FLYHIGH',
      discount: '10% OFF',
      accent: 'from-blue-600 to-indigo-700'
    },
    {
      id: 'off-2',
      badge: 'SUPER SAVER',
      badgeColor: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      title: 'Flat ₹500 Instant Discount',
      subtitle: 'Zero convenience fee on UPI & RuPay payments',
      code: 'AIRSKY500',
      discount: '₹500 OFF',
      accent: 'from-amber-600 to-rose-600'
    },
    {
      id: 'off-3',
      badge: 'AIRLINE SPECIAL',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      title: 'Flat ₹750 Super Saver Deal',
      subtitle: 'Applicable on IndiGo, Air India & Vistara bookings',
      code: 'IXIGO50',
      discount: '₹750 OFF',
      accent: 'from-emerald-600 to-teal-700'
    },
    {
      id: 'off-4',
      badge: 'WELCOME VOUCHER',
      badgeColor: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
      title: 'Flat ₹1,000 Welcome Voucher',
      subtitle: 'Special introductory fare discount for your next journey',
      code: 'FIRSTFLY',
      discount: '₹1,000 OFF',
      accent: 'from-purple-600 to-pink-600'
    }
  ];

  const handleCopy = (code) => {
    try {
      navigator.clipboard?.writeText(code);
    } catch {}
    setCopiedCode(code);
    if (onApplyPromo) onApplyPromo(code);
    setTimeout(() => setCopiedCode(''), 3000);
  };

  return (
    <section id="offers-section" className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 border border-amber-300/40 text-[11px] font-black uppercase tracking-wider mb-2">
            <Gift className="w-3.5 h-3.5 text-amber-500" />
            <span>EXCLUSIVE PROMOTIONS</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Exclusive Flight Offers & Bank Deals
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Apply verified discount promo codes at checkout for instant cash savings
          </p>
        </div>
        
        <div className="flex items-center gap-2 text-xs font-bold text-sky-600 bg-sky-50 px-3 py-1.5 rounded-xl border border-sky-200/80 self-start sm:self-auto">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Live GDS Airfare Discounts</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {offers.map((offer, index) => (
          <motion.div
            key={offer.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: index * 0.06 }}
            whileHover={{ y: -5 }}
            className="group relative bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-xl hover:border-sky-300 transition-all duration-200 flex flex-col justify-between overflow-hidden"
          >
            {/* Top decorative gradient bar */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${offer.accent}`} />

            {/* Voucher Body */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${offer.badgeColor}`}>
                  {offer.badge}
                </span>
                <span className="text-sm font-black text-slate-900 font-mono bg-slate-100 px-2 py-0.5 rounded-lg">
                  {offer.discount}
                </span>
              </div>

              <h3 className="font-black text-slate-900 text-sm leading-snug group-hover:text-sky-600 transition-colors">
                {offer.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-2">
                {offer.subtitle}
              </p>
            </div>

            {/* Bottom Promo Code Pill */}
            <div className="mt-5 pt-3.5 border-t border-dashed border-slate-200 flex items-center justify-between gap-2">
              <div className="font-mono text-xs font-black px-2.5 py-1.5 bg-slate-100/80 rounded-xl text-slate-800 border border-slate-200 tracking-wider">
                {offer.code}
              </div>

              <motion.button
                type="button"
                whileTap={{ scale: 0.92 }}
                onClick={() => handleCopy(offer.code)}
                className={`px-3 py-1.5 font-black text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                  copiedCode === offer.code
                    ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                    : 'bg-sky-50 hover:bg-sky-100 text-sky-700'
                }`}
              >
                {copiedCode === offer.code ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Applied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </motion.button>
            </div>

          </motion.div>
        ))}
      </div>
    </section>
  );
}

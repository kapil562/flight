import React from 'react';
import { motion } from 'motion/react';
import { Tag, Sparkles, Shield, CreditCard, ArrowRight, Zap, Copy, Check } from 'lucide-react';

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
      gradient: 'from-blue-600 to-indigo-700'
    },
    {
      id: 'off-2',
      badge: 'SUPER SAVER',
      badgeColor: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      title: 'Flat ₹500 Instant Discount',
      subtitle: 'Zero convenience fee on UPI & RuPay payments',
      code: 'AIRSKY500',
      discount: '₹500 OFF',
      gradient: 'from-amber-600 to-rose-600'
    },
    {
      id: 'off-3',
      badge: 'IXIGO SPECIAL',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      title: 'Flat ₹750 Super Saver Deal',
      subtitle: 'Applicable on IndiGo, Air India & Vistara flights',
      code: 'IXIGO50',
      discount: '₹750 OFF',
      gradient: 'from-emerald-600 to-teal-700'
    },
    {
      id: 'off-4',
      badge: 'FIRST FLIGHT',
      badgeColor: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
      title: 'Flat ₹1,000 Welcome Voucher',
      subtitle: 'Special introductory fare discount for first-time travellers',
      code: 'FIRSTFLY',
      discount: '₹1,000 OFF',
      gradient: 'from-purple-600 to-pink-600'
    }
  ];

  const handleCopy = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    if (onApplyPromo) onApplyPromo(code);
    setTimeout(() => setCopiedCode(''), 3000);
  };

  return (
    <div id="offers-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Exclusive Flight Offers & Bank Deals
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Use promo codes at checkout for instant fare deductions
          </p>
        </div>
        <span className="hidden sm:inline-block text-xs font-bold text-sky-600">
          Updated Today • Verified Fares
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {offers.map((offer, index) => (
          <motion.div
            key={offer.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: index * 0.08 }}
            whileHover={{ y: -6, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group relative bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-lg hover:border-sky-400 transition-all duration-200 overflow-hidden flex flex-col justify-between cursor-pointer"
          >
            {/* Top Badge */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${offer.badgeColor}`}>
                  {offer.badge}
                </span>
                <span className="text-sm font-black text-slate-900 font-mono">
                  {offer.discount}
                </span>
              </div>

              <h4 className="font-extrabold text-slate-900 text-sm leading-snug group-hover:text-sky-600 transition-colors">
                {offer.title}
              </h4>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                {offer.subtitle}
              </p>
            </div>

            {/* Bottom Promo Code Pill */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <div className="font-mono text-xs font-bold px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700 border border-slate-200/80">
                {offer.code}
              </div>

              <motion.button
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={(e) => { e.stopPropagation(); handleCopy(offer.code); }}
                className="px-3 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                {copiedCode === offer.code ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Applied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </motion.button>
            </div>

          </motion.div>
        ))}
      </div>
    </div>
  );
}

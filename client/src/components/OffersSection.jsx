import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Copy, Check, Gift, ArrowRight } from 'lucide-react';

export default function OffersSection({ onApplyPromo }) {
  const [copiedCode, setCopiedCode] = React.useState('');

  const offers = [
    {
      id: 'off-1',
      badge: 'BANK OFFER',
      title: 'Flat ₹1,500 OFF',
      subtitle: 'Applicable on HDFC, ICICI & SBI Cards above ₹4,000',
      code: 'FLYHIGH',
      discount: '10% OFF'
    },
    {
      id: 'off-2',
      badge: 'SUPER SAVER',
      title: 'Flat ₹500 Instant Discount',
      subtitle: 'Zero convenience fee on UPI & RuPay payments',
      code: 'AIRSKY500',
      discount: '₹500 OFF'
    },
    {
      id: 'off-3',
      badge: 'AIRLINE SPECIAL',
      title: 'Flat ₹750 Airline Deal',
      subtitle: 'Valid on IndiGo, Air India & Vistara bookings',
      code: 'IXIGO50',
      discount: '₹750 OFF'
    },
    {
      id: 'off-4',
      badge: 'WELCOME VOUCHER',
      title: 'Flat ₹1,000 Welcome Voucher',
      subtitle: 'Special introductory discount for your upcoming flight',
      code: 'FIRSTFLY',
      discount: '₹1,000 OFF'
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
    <section id="offers-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/80">
            PROMOTIONS & VOUCHERS
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight mt-2">
            Exclusive Flight Offers & Partner Deals
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Copy and apply verified voucher codes at checkout for instant price deductions
          </p>
        </div>

        <div className="text-xs font-bold text-slate-500 bg-slate-100 px-3.5 py-1.5 rounded-full border border-slate-200/80 self-start sm:self-auto">
          Updated Today • 100% Verified
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {offers.map((offer, index) => (
          <motion.div
            key={offer.id}
            whileHover={{ y: -5 }}
            className="rounded-3xl p-6 bg-white border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700">
                  {offer.badge}
                </span>
                <span className="text-sm font-black text-slate-900 font-mono">
                  {offer.discount}
                </span>
              </div>

              <h3 className="font-black text-slate-900 text-base leading-snug">
                {offer.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                {offer.subtitle}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-dashed border-slate-200 flex items-center justify-between gap-2">
              <span className="font-mono text-xs font-black px-3 py-1.5 bg-slate-100 rounded-xl text-slate-800 tracking-wider">
                {offer.code}
              </span>

              <motion.button
                type="button"
                whileTap={{ scale: 0.92 }}
                onClick={() => handleCopy(offer.code)}
                className={`px-3.5 py-1.5 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                  copiedCode === offer.code
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
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

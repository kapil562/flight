import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, X, Clock, ShieldCheck, CheckCircle2, Phone, Plane, Sparkles, MessageCircle } from 'lucide-react';
import AirlineBadge from './AirlineBadge';

export default function HoldFareModal({ flight, currentPrice, brand = null, onClose, onBookNow }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [holdHours, setHoldHours] = useState(24);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const brandPhone = brand?.phone || '+91 72248 28030';
  const brandWa = brand?.whatsapp || '918077680310';
  const cleanWa = brandWa.replace(/\D/g, '');

  const holdFee = holdHours === 24 ? 199 : 349;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !phone) {
      alert('Please enter your Name and Mobile Number');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  const handleWhatsAppHold = () => {
    const text = encodeURIComponent(
      `Hi ${brand?.name || 'AIR SKY'}, I want to hold/lock the fare for flight:\n` +
      `✈️ Flight: ${flight.airline} ${flight.flightNumber}\n` +
      `🛫 Route: ${flight.from} (${flight.fromCity}) ➔ ${flight.to} (${flight.toCity})\n` +
      `💰 Fare: ₹${currentPrice.toLocaleString('en-IN')}\n` +
      `👤 Name: ${name || 'Customer'}\n` +
      `📞 Phone: ${phone || 'Not provided'}\n\n` +
      `Please lock this fare for me.`
    );
    window.open(`https://wa.me/${cleanWa}?text=${text}`, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-3xl w-full max-w-lg my-auto shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-600 to-amber-600 p-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">Hold / Lock This Fare</h3>
              <p className="text-xs text-amber-100">Protect against price surges for up to 48 hours</p>
            </div>
          </div>
        </div>

        {submitted ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h4 className="text-xl font-black text-slate-900">Fare Locked Successfully!</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Your flight fare of <strong className="text-slate-800">₹{currentPrice.toLocaleString('en-IN')}</strong> for{' '}
                <strong className="text-slate-800">{flight.airline} ({flight.flightNumber})</strong> is locked for {holdHours} hours.
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-900 text-left space-y-1">
              <div className="font-bold">Next Steps:</div>
              <p>An agent will call or WhatsApp you on <strong>{phone}</strong> to confirm passenger details and issue the ticket.</p>
            </div>

            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={handleWhatsAppHold}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Confirm on WhatsApp</span>
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs">
            {/* Flight Summary Card */}
            <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80 flex items-center justify-between">
              <AirlineBadge code={flight.airlineCode} name={flight.airline} size="sm" />
              <div className="text-right">
                <div className="text-sm font-black text-slate-900">₹{currentPrice.toLocaleString('en-IN')}</div>
                <div className="text-[10px] text-slate-400 font-mono">{flight.flightNumber} • {flight.from} ➔ {flight.to}</div>
              </div>
            </div>

            {/* Hold Duration Choice */}
            <div>
              <label className="block font-bold text-slate-700 mb-2">Select Fare Lock Duration:</label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setHoldHours(24)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    holdHours === 24
                      ? 'border-amber-500 bg-amber-50/50 text-amber-950 ring-1 ring-amber-500'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="font-bold flex items-center justify-between">
                    <span>24 Hours Lock</span>
                    <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded">Token ₹199</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">Adjustable against final ticket fare</p>
                </button>

                <button
                  type="button"
                  onClick={() => setHoldHours(48)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    holdHours === 48
                      ? 'border-amber-500 bg-amber-50/50 text-amber-950 ring-1 ring-amber-500'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="font-bold flex items-center justify-between">
                    <span>48 Hours Lock</span>
                    <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded">Token ₹349</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">Max protection against fare hike</p>
                </button>
              </div>
            </div>

            {/* Input Details */}
            <div className="space-y-3">
              <div>
                <label className="block font-bold text-slate-600 mb-1">Your Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Mobile Number (WhatsApp) *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Benefits pill */}
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-emerald-800 text-[11px]">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>Token amount will be 100% credited towards your final ticket payment!</span>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-extrabold rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-1.5"
              >
                <Lock className="w-4 h-4" />
                <span>{loading ? 'Locking Fare...' : `Lock Fare Now for ₹${holdFee}`}</span>
              </button>

              <button
                type="button"
                onClick={handleWhatsAppHold}
                className="px-3.5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1 cursor-pointer shadow-md"
                title="Lock on WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">WhatsApp</span>
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}

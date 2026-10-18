import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageCircle, Phone, X, HelpCircle, ChevronRight, 
  ShieldCheck, Send, CheckCircle2, Headphones, Sparkles, CheckSquare
} from 'lucide-react';

export default function WhatsAppSupportButton({ onOpenQuickPnr, onOpenWebCheckIn, brand = null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [userQuery, setUserQuery] = useState('');

  const cleanWa = (brand?.whatsapp || '918077680310').replace(/\D/g, '');
  const displayWa = brand?.whatsapp || '+91 80776 80310';
  const cleanPhone = brand?.phone || '+91 72248 28030';
  const brandName = brand?.name || 'AIR SKY Go';

  const handleSendQuery = (e) => {
    e?.preventDefault();
    const text = userQuery.trim() || `Hello ${brandName} Support, I need assistance with my flight booking.`;
    window.open(`https://wa.me/${cleanWa}?text=${encodeURIComponent(text)}`, '_blank');
    setUserQuery('');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-3 sm:right-6 z-50 flex flex-col items-end">
      
      {/* Expanded Chat Bot Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="mb-3 w-[calc(100vw-1.5rem)] sm:w-90 max-w-[360px] bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden ring-1 ring-black/5 flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-sky-700 p-4 text-white flex items-center justify-between relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
              
              <div className="flex items-center gap-3 relative z-10">
                <div className="relative">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-xs">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-black text-sm leading-tight text-white">{brandName} Support</h4>
                    <span className="bg-emerald-400/30 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full border border-white/20">
                      LIVE
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-100/90 flex items-center gap-1 mt-0.5 font-medium">
                    <span>⚡ Quick reply in &lt; 2 mins</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer relative z-10"
                aria-label="Close Support"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Body & Interactive Options */}
            <div className="p-3.5 space-y-3 bg-slate-50/60 max-h-[70vh] overflow-y-auto">
              
              {/* Bot Greeting Bubble */}
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="bg-white p-3 rounded-2xl rounded-tl-xs shadow-xs border border-slate-200/80 text-xs text-slate-700 leading-relaxed max-w-[85%]">
                  <span className="font-bold text-slate-900 block mb-0.5">Namaste! Welcome to {brandName} 🙏</span>
                  Aapki flight booking, PNR status ya travel help ke liye hum 24x7 online hain. Niche option chunein:
                </div>
              </div>

              {/* Action 1: WhatsApp Chat */}
              <a
                href={`https://wa.me/${cleanWa}?text=${encodeURIComponent(`Hello ${brandName} Support, I need assistance with my booking.`)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100/90 border border-emerald-200 transition-all group cursor-pointer shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <span>Chat on WhatsApp</span>
                      <span className="bg-emerald-200 text-emerald-900 text-[9px] font-black px-1.5 py-0.2 rounded">Fastest</span>
                    </div>
                    <div className="text-[11px] text-slate-600 font-medium">{displayWa}</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
              </a>

              {/* Action 2: Track PNR */}
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  if (onOpenQuickPnr) onOpenQuickPnr();
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/90 text-left cursor-pointer transition-all group shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                    <HelpCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900">Track PNR / Ticket Status</div>
                    <div className="text-[11px] text-slate-500">Live airline confirmation check</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Action 3: Call Phone Helpline */}
              <a
                href={`tel:${cleanPhone.replace(/\s+/g, '')}`}
                className="flex items-center justify-between p-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/90 text-left transition-all group shadow-xs cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900">Direct Phone Helpline</div>
                    <div className="text-[11px] text-slate-500 font-semibold">{cleanPhone} (24x7)</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </a>

              {/* Action 4: Web Check-In Helper (if callback exists) */}
              {onOpenWebCheckIn && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenWebCheckIn();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/90 text-left cursor-pointer transition-all group shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                      <CheckSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900">Airline Web Check-In</div>
                      <div className="text-[11px] text-slate-500">Select seats & get boarding pass</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </button>
              )}

              {/* Quick Message Input: Direct WhatsApp Sender */}
              <form onSubmit={handleSendQuery} className="pt-1">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    placeholder="Type message or ask question..."
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-hidden focus:border-emerald-500 bg-white shadow-xs"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer"
                    title="Send to WhatsApp"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>

            </div>

            {/* Verified Footer */}
            <div className="px-4 py-2.5 bg-white border-t border-slate-100 text-[10px] text-slate-500 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Travel Support</span>
              </span>
              <span className="text-slate-400 font-mono">24x7x365 Available</span>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger Button with Tooltip */}
      <div className="flex items-center gap-2.5">
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white text-slate-800 text-xs font-extrabold shadow-xl border border-slate-200/90 cursor-pointer select-none hover:border-emerald-400 transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Chat with us</span>
          </motion.div>
        )}

        <motion.button
          type="button"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => setIsOpen(!isOpen)}
          className={`w-13 h-13 sm:w-14 sm:h-14 rounded-full text-white shadow-2xl flex items-center justify-center cursor-pointer relative transition-all duration-300 ${
            isOpen
              ? 'bg-slate-800 shadow-slate-900/40 rotate-90'
              : 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-500/40'
          }`}
          title="24x7 Customer Support & WhatsApp"
          aria-label="Toggle Live Chat Support"
        >
          {!isOpen && (
            <>
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-400 ring-2 ring-white animate-ping" />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-400 ring-2 ring-white" />
            </>
          )}
          {isOpen ? <X className="w-6 h-6 text-white" /> : <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 text-white" />}
        </motion.button>
      </div>

    </div>
  );
}

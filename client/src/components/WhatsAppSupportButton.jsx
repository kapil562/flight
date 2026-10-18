import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, HelpCircle, ChevronRight, ShieldCheck } from 'lucide-react';

export default function WhatsAppSupportButton({ onOpenQuickPnr, brand = null }) {
  const [isOpen, setIsOpen] = useState(false);

  const cleanWa = (brand?.whatsapp || '918077680310').replace(/\D/g, '');
  const displayWa = brand?.whatsapp || '+918077680310';
  const brandName = brand?.name || 'AIR SKY Go';

  return (
    <aside aria-label="Support and Help" className="fixed bottom-20 md:bottom-6 right-3 sm:right-6 z-50 flex flex-col items-end pointer-events-none">
      
      {/* Support Card (Exactly matching user screenshot, with responsive full-screen coverage) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="pointer-events-auto mb-2 w-[calc(100vw-1.5rem)] sm:w-80 max-w-[320px] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
          >
            {/* Green Header */}
            <div className="bg-emerald-700 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm leading-tight text-white">24×7 {brandName} Support</h4>
                  <span className="text-[11px] text-emerald-100 flex items-center gap-1.5 mt-0.5 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                    Specialist Online
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Support Actions Body */}
            <div className="p-3 space-y-2.5 bg-white">
              
              {/* Card 1: Chat on WhatsApp */}
              <a
                href={`https://wa.me/${cleanWa}?text=${encodeURIComponent(`Hello ${brandName} Support, I need assistance with my booking.`)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 rounded-2xl bg-[#ebfbf2] hover:bg-[#d8f6e5] border border-[#c1f0d3] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 leading-tight">Chat on WhatsApp</div>
                    <div className="text-[11px] text-slate-500 font-medium truncate mt-0.5">{displayWa} (Instant reply)</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-emerald-600 shrink-0 ml-1" />
              </a>

              {/* Card 2: Track PNR or Ticket */}
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  if (onOpenQuickPnr) onOpenQuickPnr();
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50/90 hover:bg-slate-100 border border-slate-200/90 text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 leading-tight">Track PNR or Ticket</div>
                    <div className="text-[11px] text-slate-500 font-medium truncate mt-0.5">Instant status without login</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
              </button>

            </div>

            {/* Bottom Footer Line */}
            <div className="px-3.5 py-2.5 bg-slate-50/70 border-t border-slate-100 text-[10px] text-slate-500 flex items-center justify-between">
              <span className="flex items-center gap-1 text-emerald-600 font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>IATA Verified Support</span>
              </span>
              <span className="text-slate-400 font-medium">Available 24×7×365</span>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger Button (Hidden when card is open to avoid clipping or overlapping) */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            type="button"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => setIsOpen(true)}
            className="pointer-events-auto w-13 h-13 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-500/30 flex items-center justify-center cursor-pointer relative"
            title="24×7 Customer Support & WhatsApp"
            aria-label="Open 24×7 Support"
          >
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-400 ring-2 ring-white animate-ping" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-400 ring-2 ring-white" />
            <MessageCircle className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

    </aside>
  );
}

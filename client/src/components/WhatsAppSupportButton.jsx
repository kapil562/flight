import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, Phone, Mail, X, HelpCircle, ChevronRight, ShieldCheck } from 'lucide-react';

export default function WhatsAppSupportButton({ onOpenQuickPnr, brand = null }) {
  const [isOpen, setIsOpen] = useState(false);

  const cleanWa = (brand?.whatsapp || '918077680310').replace(/\D/g, '');
  const displayWa = brand?.whatsapp || '+91 80776 80310';
  const cleanPhone = brand?.phone || '+91 72248 28030';
  const brandName = brand?.name || 'AIR SKY';

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40">
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            className="mb-3 w-80 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm leading-none">24x7 {brandName} Support</h4>
                  <span className="text-[10px] text-emerald-200 flex items-center gap-1 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping" />
                    Specialist Online
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Support Actions */}
            <div className="p-3 space-y-2">
              <a
                href={`https://wa.me/${cleanWa}?text=${encodeURIComponent(`Hello ${brandName} Support, I need assistance with my booking.`)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Chat on WhatsApp</div>
                    <div className="text-[10px] text-slate-500">{displayWa} (Instant reply)</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-emerald-600" />
              </a>

              <a
                href={`tel:${cleanPhone.replace(/\s+/g, '')}`}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Call Toll-Free Helpline</div>
                    <div className="text-[10px] text-slate-500">1800-419-7175 / +91 9663787175</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </a>

              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  if (onOpenQuickPnr) onOpenQuickPnr();
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Track PNR or Ticket</div>
                    <div className="text-[10px] text-slate-500">Instant status without login</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1 text-emerald-600 font-bold">
                <ShieldCheck className="w-3 h-3" /> IATA Verified Support
              </span>
              <span>Available 24x7x365</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger Button */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-13 h-13 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-500/30 flex items-center justify-center cursor-pointer relative"
        title="24x7 Customer Support & WhatsApp"
      >
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-400 ring-2 ring-white animate-ping" />
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-400 ring-2 ring-white" />
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </motion.button>

    </div>
  );
}

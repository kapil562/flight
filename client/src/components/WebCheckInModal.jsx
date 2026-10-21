import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, CheckSquare, ExternalLink, ShieldCheck, Info, Plane, ArrowRight } from 'lucide-react';
import AirlineBadge from './AirlineBadge';

export default function WebCheckInModal({ isOpen, onClose }) {
  const [selectedAirline, setSelectedAirline] = useState('6E');
  const [pnr, setPnr] = useState('');
  const [lastName, setLastName] = useState('');

  if (!isOpen) return null;

  const airlines = [
    { code: '6E', name: 'IndiGo', url: 'https://www.goindigo.in/web-check-in.html' },
    { code: 'AI', name: 'Air India', url: 'https://www.airindia.com/in/en/manage/web-check-in.html' },
    { code: 'QP', name: 'Akasa Air', url: 'https://www.akasaair.com/web-checkin' },
    { code: 'SG', name: 'SpiceJet', url: 'https://www.spicejet.com/check-in' },
    { code: 'UK', name: 'Vistara', url: 'https://www.airvistara.com/in/en/travel-information/vistara-experience/web-check-in' }
  ];

  const handleLaunchCheckIn = (e) => {
    e.preventDefault();
    const airline = airlines.find(a => a.code === selectedAirline);
    if (airline?.url) {
      window.open(airline.url, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-md">
      <div className="fixed inset-0" onClick={onClose} />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative z-10 w-full max-w-lg bg-white rounded-3xl shadow-2xl p-5 sm:p-7 border border-slate-100"
      >
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">Direct Airline Web Check-In</h3>
              <p className="text-[11px] text-slate-400">Available 48 hours to 60 minutes prior to departure</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 cursor-pointer">
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        <form onSubmit={handleLaunchCheckIn} className="py-4 space-y-4">
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
              Select Your Airline
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {airlines.map(a => (
                <button
                  key={a.code}
                  type="button"
                  onClick={() => setSelectedAirline(a.code)}
                  className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                    selectedAirline === a.code
                      ? 'border-sky-500 bg-sky-50 text-sky-800 font-black shadow-xs ring-1 ring-sky-500'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs font-black">{a.code}</div>
                  <div className="text-[10px] text-slate-500 truncate mt-0.5">{a.name}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                PNR Number
              </label>
              <input
                type="text"
                placeholder="e.g. Y9WUNS"
                value={pnr}
                onChange={(e) => setPnr(e.target.value.toUpperCase())}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-black text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500 uppercase font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                Passenger Last Name
              </label>
              <input
                type="text"
                placeholder="e.g. Sharma"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              Upon clicking Launch, you will be redirected straight to the official airline check-in portal with your PNR pre-filled to download the digital boarding pass and select free seats.
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Proceed to Official Airline Check-In</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </form>
      </motion.div>
    </div>
  );
}

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, CheckSquare, ExternalLink, ShieldCheck, Info, Plane } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md">
      <div className="fixed inset-0" onClick={onClose} />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative z-10 w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 border border-slate-100"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Airline Web Check-In Hub</h3>
              <p className="text-[11px] text-slate-400">Complete web check-in 48h to 60m before departure</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full bg-slate-100 hover:bg-slate-200">
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        <form onSubmit={handleLaunchCheckIn} className="py-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Select Your Airline</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {airlines.map(a => (
                <button
                  key={a.code}
                  type="button"
                  onClick={() => setSelectedAirline(a.code)}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                    selectedAirline === a.code
                      ? 'border-sky-500 bg-sky-50 text-sky-800 font-extrabold shadow-xs'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs font-black">{a.code}</div>
                  <div className="text-[10px] text-slate-500 truncate">{a.name}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">PNR / Booking Reference</label>
              <input
                type="text"
                placeholder="e.g. Y9WUNS"
                value={pnr}
                onChange={(e) => setPnr(e.target.value.toUpperCase())}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500 uppercase font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Passenger Last Name</label>
              <input
                type="text"
                placeholder="e.g. Sharma"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              Web check-in opens 48 hours prior to scheduled departure. After completing check-in, your digital boarding pass will be generated with baggage barcode tags.
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-extrabold text-sm shadow-md shadow-sky-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Proceed to Official Airline Web Check-In</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </form>

      </motion.div>
    </div>
  );
}

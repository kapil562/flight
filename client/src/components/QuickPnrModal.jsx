import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, X, Ticket, Plane, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';
import { api } from '../utils/api';

export default function QuickPnrModal({ isOpen, onClose, onOpenTicket }) {
  const [pnrInput, setPnrInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookingResult, setBookingResult] = useState(null);

  if (!isOpen) return null;

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!pnrInput.trim()) {
      setError('Please enter a PNR or Booking Reference');
      return;
    }
    setError('');
    setLoading(true);
    setBookingResult(null);

    try {
      const res = await api.getBookingByPnr(pnrInput.trim());
      if (res.success && res.data) {
        setBookingResult(res.data);
      } else {
        setError('No active booking found with this PNR. Please check and try again.');
      }
    } catch (err) {
      setError('Unable to locate ticket. Please verify your PNR number.');
    } finally {
      setLoading(false);
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
            <div className="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-600 flex items-center justify-center">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">Check PNR / Live Status</h3>
              <p className="text-[11px] text-slate-400">View ticket, real-time gate updates & boarding pass</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 cursor-pointer">
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        <form onSubmit={handleSearch} className="py-4 space-y-3.5">
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
              Enter 6-Digit Airline PNR / Booking ID
            </label>
            <div className="relative">
              <input
                type="text"
                autoFocus
                placeholder="e.g. Y9WUNS"
                value={pnrInput}
                onChange={(e) => setPnrInput(e.target.value.toUpperCase())}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-black text-slate-900 tracking-widest uppercase font-mono focus:bg-white focus:outline-none focus:border-sky-500 shadow-2xs"
              />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-2 top-2 bottom-2 px-5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-black text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <span>Search PNR</span>}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </form>

        {bookingResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-sky-50/50 border border-slate-200 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Confirmed Airline PNR</span>
                <div className="text-lg font-black text-slate-900 font-mono tracking-wider">{bookingResult.pnr}</div>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
                {bookingResult.status}
              </span>
            </div>

            <div className="flex items-center justify-between py-2.5 border-y border-slate-200/80 text-xs font-black text-slate-900">
              <div>
                <div>{bookingResult.fromCity || bookingResult.from}</div>
                <div className="text-[10px] text-slate-400 font-mono font-medium">{bookingResult.departureTime}</div>
              </div>
              <Plane className="w-4 h-4 text-sky-600 rotate-90" />
              <div className="text-right">
                <div>{bookingResult.toCity || bookingResult.to}</div>
                <div className="text-[10px] text-slate-400 font-mono font-medium">{bookingResult.arrivalTime}</div>
              </div>
            </div>

            <div className="text-xs text-slate-600 flex justify-between font-medium">
              <span>Flight: <strong className="text-slate-800">{bookingResult.flightNumber}</strong></span>
              <span>Seats: <strong className="text-slate-800">{(bookingResult.passengers || []).map(p => p.seat).filter(Boolean).join(', ') || 'Auto-Assigned'}</strong></span>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                if (onOpenTicket) onOpenTicket(bookingResult);
              }}
              className="w-full py-3 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Ticket className="w-4 h-4" />
              <span>View Full Ticket & Digital Boarding Pass</span>
            </button>
          </motion.div>
        )}

      </motion.div>
    </div>
  );
}

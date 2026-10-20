import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, X, Ticket, Plane, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
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
            <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Check PNR / Booking Status</h3>
              <p className="text-[11px] text-slate-400">View ticket, seats & download boarding pass without login</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full bg-slate-100 hover:bg-slate-200">
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        <form onSubmit={handleSearch} className="py-4 space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Enter Airline PNR / Booking ID</label>
            <div className="relative">
              <input
                type="text"
                autoFocus
                placeholder="e.g. Y9WUNS"
                value={pnrInput}
                onChange={(e) => setPnrInput(e.target.value.toUpperCase())}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-black text-slate-900 tracking-wider uppercase font-mono focus:bg-white focus:outline-none focus:border-sky-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-2 top-2 bottom-2 px-4 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <span>Search PNR</span>}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </form>

        {bookingResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Confirmed PNR</span>
                <div className="text-base font-black text-slate-900 font-mono">{bookingResult.pnr}</div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                {bookingResult.status}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-y border-slate-200/80 text-xs font-bold text-slate-800">
              <div>
                <div>{bookingResult.fromCity || bookingResult.from}</div>
                <div className="text-[10px] text-slate-400 font-normal">{bookingResult.departureTime}</div>
              </div>
              <Plane className="w-4 h-4 text-sky-600 rotate-90" />
              <div className="text-right">
                <div>{bookingResult.toCity || bookingResult.to}</div>
                <div className="text-[10px] text-slate-400 font-normal">{bookingResult.arrivalTime}</div>
              </div>
            </div>

            <div className="text-xs text-slate-600 flex justify-between">
              <span>Flight: <strong>{bookingResult.flightNumber}</strong></span>
              <span>Class: <strong>{bookingResult.travelClass}</strong></span>
              <span>Seats: <strong>{(bookingResult.passengers || []).map(p => p.seat).filter(Boolean).join(', ') || 'Auto-Assigned'}</strong></span>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                if (onOpenTicket) onOpenTicket(bookingResult);
              }}
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-sky-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Ticket className="w-4 h-4" />
              <span>View Full Ticket & Download Boarding Pass</span>
            </button>
          </motion.div>
        )}

      </motion.div>
    </div>
  );
}

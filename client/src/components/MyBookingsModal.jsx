import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Ticket, Search, CheckCircle2, XCircle, AlertTriangle, Download, ArrowRight, Plane, RefreshCw, Printer } from 'lucide-react';
import { api } from '../utils/api';

export default function MyBookingsModal({ user, onClose, onSelectTicket, onOpenLogin }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchPnr, setSearchPnr] = useState('');
  const [filterTab, setFilterTab] = useState('all'); // 'all', 'confirmed', 'cancelled'
  const [cancellingPnr, setCancellingPnr] = useState(null);

  // Active logged-in user fallback
  const activeUser = user || (() => {
    try {
      const s = localStorage.getItem('asg_user');
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  })();

  const fetchBookings = async (pnrToSearch = '') => {
    setLoading(true);
    try {
      if (pnrToSearch) {
        const res = await api.getBookings({ pnr: pnrToSearch.trim().toUpperCase() });
        setBookings(res.success && Array.isArray(res.data) ? res.data : []);
      } else if (activeUser && (activeUser.email || activeUser.phone)) {
        const params = {};
        if (activeUser.email) params.email = activeUser.email;
        if (activeUser.phone) params.phone = activeUser.phone;
        const res = await api.getBookings(params);
        setBookings(res.success && Array.isArray(res.data) ? res.data : []);
      } else {
        setBookings([]);
      }
    } catch (err) {
      console.error('Error fetching bookings', err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [activeUser?.email, activeUser?.phone]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBookings(searchPnr);
  };

  const handleWebCheckIn = async (pnr) => {
    try {
      const res = await api.checkInBooking(pnr);
      if (res.success) {
        alert(`Web Check-In successful for PNR ${pnr}! Sequence: ${res.booking.boardingPass?.sequence}, Gate: ${res.booking.boardingPass?.gate}`);
        fetchBookings();
      }
    } catch (err) {
      alert('Error during check-in');
    }
  };

  const handleCancelBooking = async (pnr) => {
    if (!window.confirm(`Are you sure you want to cancel booking ${pnr}? A cancellation fee of ₹999 will be deducted.`)) {
      return;
    }

    setCancellingPnr(pnr);
    try {
      const res = await api.cancelBooking(pnr);
      if (res.success) {
        alert(`Booking ${pnr} has been cancelled. Refund of ₹${res.refundAmount.toLocaleString('en-IN')} has been initiated!`);
        fetchBookings();
      } else {
        alert(res.message || 'Failed to cancel booking');
      }
    } catch (err) {
      alert('Network error while cancelling booking');
    } finally {
      setCancellingPnr(null);
    }
  };

  const filtered = bookings.filter(b => {
    if (filterTab === 'confirmed') return b.status === 'CONFIRMED';
    if (filterTab === 'cancelled') return b.status === 'CANCELLED';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-md">
      <div className="fixed inset-0" onClick={onClose} />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative z-10 w-full max-w-4xl bg-white rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-100"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-600 flex items-center justify-center">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">My Bookings & Passbook</h3>
              <p className="text-[11px] text-slate-500">Track itinerary, complete web check-in & download invoices</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 cursor-pointer">
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="px-4 sm:px-6 py-3 border-b border-slate-100 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 max-w-sm">
            <input
              type="text"
              placeholder="Search by 6-digit PNR (e.g. Y9WUNS)..."
              value={searchPnr}
              onChange={(e) => setSearchPnr(e.target.value.toUpperCase())}
              className="bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-black text-slate-900 tracking-wider font-mono focus:outline-none focus:border-sky-500 w-full uppercase"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition-all cursor-pointer shrink-0"
            >
              Search
            </button>
            {searchPnr && (
              <button
                type="button"
                onClick={() => { setSearchPnr(''); fetchBookings(''); }}
                className="text-xs text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
              >
                Clear
              </button>
            )}
          </form>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl text-xs font-black">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                filterTab === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All ({bookings.length})
            </button>
            <button
              onClick={() => setFilterTab('confirmed')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                filterTab === 'confirmed' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Confirmed
            </button>
            <button
              onClick={() => setFilterTab('cancelled')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                filterTab === 'cancelled' ? 'bg-white text-rose-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Cancelled
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50 space-y-4">
          {loading ? (
            <div className="py-20 text-center">
              <RefreshCw className="w-8 h-8 text-sky-600 animate-spin mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-500">Fetching Your Bookings...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center space-y-4 shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
                <Ticket className="w-8 h-8" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h4 className="font-black text-slate-800 text-lg">
                  {searchPnr ? `No Booking Found for PNR "${searchPnr}"` : 'No Bookings Recorded Yet'}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {searchPnr
                    ? 'Please double-check your 6-digit PNR code or search with your registered email.'
                    : activeUser
                      ? `Hello ${activeUser.name || 'Flyer'}, you do not have any active flight bookings. Search flights to book your next trip!`
                      : 'Enter your 6-digit PNR above or log in to view all your previous bookings.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    window.scrollTo({ top: 300, behavior: 'smooth' });
                  }}
                  className="px-5 py-2.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white rounded-xl text-xs font-black shadow-md shadow-sky-600/20 transition-all cursor-pointer flex items-center gap-2"
                >
                  <Plane className="w-4 h-4" />
                  <span>Search & Book Flights</span>
                </button>
                {!activeUser && onOpenLogin && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenLogin();
                    }}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Login to Account
                  </button>
                )}
              </div>
            </div>
          ) : (
            filtered.map((b) => {
              const isConfirmed = b.status === 'CONFIRMED';
              const isCheckInDone = b.checkInStatus === 'COMPLETED';

              return (
                <motion.div
                  key={b.pnr}
                  whileHover={{ y: -2, transition: { duration: 0.15 } }}
                  className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-all space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-xs font-mono font-black bg-sky-50 text-sky-700 border border-sky-200 px-3 py-1 rounded-xl tracking-wider">
                        PNR: {b.pnr}
                      </span>
                      {b.tripType === 'multiCity' && (
                        <span className="text-[10px] font-black uppercase bg-purple-100 text-purple-700 px-2.5 py-0.5 rounded-full">
                          Multi-City
                        </span>
                      )}
                      <span className="text-xs font-black text-slate-800">{b.airline} ({b.flightNumber})</span>
                      <span className="text-[11px] text-slate-400 font-mono">Date: {b.departureDate}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1 ${
                        isConfirmed
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {isConfirmed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        <span>{b.status}</span>
                      </span>

                      {isConfirmed && isCheckInDone && (
                        <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded text-[11px] font-bold">
                          Checked-In (Gate {b.boardingPass?.gate || '14B'})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                    <div className="sm:col-span-6">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="text-base font-black text-slate-900">{b.fromCity || b.from}</div>
                          <div className="text-xs font-mono text-slate-500 font-bold">{b.departureTime}</div>
                        </div>
                        <Plane className="w-4 h-4 text-sky-600 rotate-90 shrink-0" />
                        <div>
                          <div className="text-base font-black text-slate-900">{b.toCity || b.to}</div>
                          <div className="text-xs font-mono text-slate-500 font-bold">{b.arrivalTime}</div>
                        </div>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Passengers: <strong>{(b.passengers || []).map(p => `${p.title || ''} ${p.firstName || ''} ${p.lastName || ''}`.trim()).filter(Boolean).join(', ') || '1 Passenger'}</strong>
                      </div>
                    </div>

                    <div className="sm:col-span-6 flex flex-wrap items-center justify-end gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          if (onSelectTicket) onSelectTicket(b);
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Ticket className="w-3.5 h-3.5" />
                        <span>View Boarding Pass</span>
                      </button>

                      {isConfirmed && !isCheckInDone && (
                        <button
                          type="button"
                          onClick={() => handleWebCheckIn(b.pnr)}
                          className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                        >
                          Web Check-In
                        </button>
                      )}

                      {isConfirmed && (
                        <button
                          type="button"
                          disabled={cancellingPnr === b.pnr}
                          onClick={() => handleCancelBooking(b.pnr)}
                          className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
                        >
                          {cancellingPnr === b.pnr ? 'Cancelling...' : 'Cancel'}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </motion.div>
    </div>
  );
}

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
        // When not logged in and no PNR entered, fetch nothing so other customers' private data is never exposed
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
      alert('Cancellation failed');
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-xs"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
      >
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                Manage My Bookings & Web Check-In
              </h3>
              <p className="text-xs text-slate-500">
                View your confirmed trips, print boarding pass, or request refunds
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PNR Search Box & Filters */}
        <div className="p-4 sm:p-5 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
          
          {/* Quick Search */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by PNR (e.g. ASG-782194)..."
                value={searchPnr}
                onChange={(e) => setSearchPnr(e.target.value.toUpperCase())}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-mono font-bold uppercase"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
            >
              Search
            </button>
            {searchPnr && (
              <button
                type="button"
                onClick={() => { setSearchPnr(''); fetchBookings(''); }}
                className="text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                Clear
              </button>
            )}
          </form>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterTab === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All ({bookings.length})
            </button>
            <button
              onClick={() => setFilterTab('confirmed')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterTab === 'confirmed' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Confirmed
            </button>
            <button
              onClick={() => setFilterTab('cancelled')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterTab === 'cancelled' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Cancelled
            </button>
          </div>

        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 space-y-4">
          {loading ? (
            <div className="py-20 text-center">
              <RefreshCw className="w-8 h-8 text-sky-600 animate-spin mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-500">Fetching Your Bookings...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
                <Ticket className="w-8 h-8" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h4 className="font-extrabold text-slate-800 text-lg">
                  {searchPnr ? `No Booking Found for PNR "${searchPnr}"` : 'No Bookings Found (0 Bookings)'}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {searchPnr
                    ? 'Please double-check your 6-digit PNR number and try again.'
                    : activeUser
                      ? `Hello ${activeUser.name || 'Valued Flyer'}, aapne abhi tak koi flight ticket book nahi ki hai. Naya trip plan karne ke liye flight search karein!`
                      : 'Apna booked ticket dekhne ke liye upar apna PNR search karein ya apne account me Login karein.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    window.scrollTo({ top: 300, behavior: 'smooth' });
                  }}
                  className="px-5 py-2.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-600/20 transition-all cursor-pointer flex items-center gap-2"
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
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow space-y-4"
                >
                  
                  {/* Top Row: PNR & Status */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-xs font-mono font-extrabold bg-sky-50 text-sky-700 border border-sky-200 px-3 py-1 rounded-xl">
                        PNR: {b.pnr}
                      </span>
                      {b.tripType === 'multiCity' && (
                        <span className="text-[10px] font-black uppercase bg-purple-100 text-purple-700 px-2 py-0.5 rounded-md">
                          Multi-City
                        </span>
                      )}
                      <span className="text-xs font-bold text-slate-700">{b.airline} ({b.flightNumber})</span>
                      <span className="text-[11px] text-slate-400 font-mono">Date: {b.departureDate}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${
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

                  {/* Route & Passenger row */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                    
                    {/* Origin & Destination */}
                    <div className="sm:col-span-6">
                      {b.multiCityLegs && b.multiCityLegs.length > 0 ? (
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            Multi-City Flight Sequence ({b.multiCityLegs.length} Flights)
                          </span>
                          <div className="text-xs font-extrabold text-sky-700">
                            {b.multiCityLegs.map(l => `${l.from} ➔ ${l.to}`).join(' • ')}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-4">
                          <div>
                            <div className="text-xl font-black font-mono text-slate-900">{b.from}</div>
                            <div className="text-xs text-slate-500">{b.fromCity}</div>
                            <div className="text-xs font-bold text-slate-800">{b.departureTime}</div>
                          </div>

                          <div className="flex-1 text-center">
                            <div className="h-0.5 bg-slate-200 relative my-2">
                              <Plane className="w-3.5 h-3.5 text-sky-600 bg-white px-0.5 absolute -top-1.5 left-1/2 -translate-x-1/2 rotate-90" />
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">Non-Stop</span>
                          </div>

                          <div className="text-right">
                            <div className="text-xl font-black font-mono text-slate-900">{b.to}</div>
                            <div className="text-xs text-slate-500">{b.toCity}</div>
                            <div className="text-xs font-bold text-slate-800">{b.arrivalTime}</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Passenger & Fare metadata */}
                    <div className="sm:col-span-6 flex flex-wrap items-center justify-between sm:justify-end gap-4 text-xs">
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Passenger(s)</div>
                        <div className="font-extrabold text-slate-900 mt-0.5">
                          {b.passengers?.map((p, i) => (
                            <div key={i}>{p.title} {p.firstName} {p.lastName} (Seat: {p.seat || 'Assigned'})</div>
                          ))}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Total Fare</div>
                        <div className="text-lg font-black text-slate-900 font-mono mt-0.5">
                          ₹{b.fare?.total?.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-emerald-600 font-semibold">{b.payment?.method || 'Paid'}</div>
                      </div>
                    </div>

                  </div>

                  {/* Actions Row */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                    
                    {/* Cancellation Refund Note if cancelled */}
                    {b.status === 'CANCELLED' ? (
                      <div className="text-rose-600 text-[11px] font-semibold flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Cancelled: ₹{b.cancellation?.refundAmount?.toLocaleString('en-IN') || '4,150'} refund initiated to source.</span>
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-400">
                        Contact: {b.contact?.email} • {b.contact?.phone}
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      {isConfirmed && !isCheckInDone && (
                        <button
                          onClick={() => handleWebCheckIn(b.pnr)}
                          className="px-3.5 py-1.5 bg-sky-50 text-sky-700 border border-sky-300 hover:bg-sky-100 rounded-xl font-bold transition-colors cursor-pointer"
                        >
                          Web Check-In
                        </button>
                      )}

                      <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => onSelectTicket(b)}
                        className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5 text-sky-400" />
                        <span>View / Print Ticket</span>
                      </motion.button>

                      {isConfirmed && (
                        <button
                          disabled={cancellingPnr === b.pnr}
                          onClick={() => handleCancelBooking(b.pnr)}
                          className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl font-bold transition-colors cursor-pointer"
                        >
                          {cancellingPnr === b.pnr ? 'Cancelling...' : 'Cancel Flight'}
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
    </motion.div>
  );
}

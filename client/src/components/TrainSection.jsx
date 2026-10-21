import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Train, Search, Calendar, CheckCircle2, AlertCircle, ArrowRight, Clock, ShieldCheck, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../utils/api';

export default function TrainSection() {
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pnrInput, setPnrInput] = useState('');
  const [pnrStatus, setPnrStatus] = useState(null);
  const [pnrLoading, setPnrLoading] = useState(false);
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [trainBooked, setTrainBooked] = useState(false);
  const [passengerName, setPassengerName] = useState('');
  const [irctcId, setIrctcId] = useState('');

  useEffect(() => {
    const fetchTrains = async () => {
      setLoading(true);
      try {
        const res = await api.getTrains();
        if (res.success) setTrains(res.data);
      } catch (err) {
        console.error('Failed to load trains:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrains();
  }, []);

  const handlePnrCheck = (e) => {
    e.preventDefault();
    if (!pnrInput || pnrInput.length < 10) {
      alert('Please enter a valid 10-digit IRCTC PNR number');
      return;
    }
    setPnrLoading(true);
    setTimeout(() => {
      setPnrLoading(false);
      setPnrStatus({
        pnr: pnrInput,
        trainName: '12952 / Tejas Rajdhani Express',
        boarding: 'NDLS (New Delhi)',
        destination: 'MMCT (Mumbai Central)',
        chartStatus: 'CHART PREPARED',
        bookingStatus: 'CNF (Confirmed)',
        coach: 'B4',
        berth: '32 (Lower Berth)',
        passengers: [
          { name: 'Passenger 1', status: 'CNF / B4 / 32 / LB' }
        ]
      });
    }, 600);
  };

  const handleBookTrain = async (e) => {
    e.preventDefault();
    try {
      await api.bookTrain({
        trainNumber: selectedTrain?.train?.number || '12952',
        trainName: selectedTrain?.train?.name || 'Tejas Rajdhani Express',
        from: selectedTrain?.train?.from || 'New Delhi (NDLS)',
        to: selectedTrain?.train?.to || 'Mumbai Central (MMCT)',
        customerName: passengerName || 'Passenger',
        travelClass: selectedTrain?.selectedClass?.name || '3A',
        fare: selectedTrain?.selectedClass?.price || 1850
      });
      setSelectedTrain(null);
      setTrainBooked(true);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="py-6 sm:py-8 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
      
      {/* Banner & PNR Status Box */}
      <div className="bg-slate-950 rounded-3xl sm:rounded-4xl p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden mb-8 border border-white/10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-slate-200 text-xs font-bold border border-white/15 mb-3">
              <Train className="w-3.5 h-3.5 text-amber-300" />
              IRCTC Partner Railway Network
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight mb-2">
              Book Trains &amp; Track Live IRCTC PNR Status
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-medium">
              Zero convenience fee on UPI transfers. Instant refunds &amp; live chart confirmation alerts.
            </p>
          </div>

          {/* Quick PNR Lookup Widget */}
          <div className="lg:col-span-5 bg-white text-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-200/90">
            <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-2">
              Check 10-Digit IRCTC PNR
            </h4>
            <form onSubmit={handlePnrCheck} className="flex gap-2">
              <input
                type="text"
                maxLength={10}
                placeholder="e.g. 2489102931"
                value={pnrInput}
                onChange={(e) => setPnrInput(e.target.value.replace(/\D/g, ''))}
                className="flex-1 bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 focus:border-slate-900 rounded-2xl px-3.5 py-2.5 text-xs font-black text-slate-900 focus:outline-none font-mono transition-all"
              />
              <button
                type="submit"
                disabled={pnrLoading}
                className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white font-black text-xs rounded-2xl shadow-md transition-all cursor-pointer shrink-0 disabled:opacity-50"
              >
                {pnrLoading ? 'Checking...' : 'Check Status'}
              </button>
            </form>

            {/* PNR Status Result Drawer */}
            {pnrStatus && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3.5 p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-mono"
              >
                <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                  <span className="truncate">{pnrStatus.trainName}</span>
                  <span className="bg-slate-900 text-white text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider">{pnrStatus.chartStatus}</span>
                </div>
                <div className="text-slate-500 text-[11px] font-sans mt-0.5">{pnrStatus.boarding} ➔ {pnrStatus.destination}</div>
                <div className="mt-2 pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-800">
                  <span>Status: <strong className="text-emerald-600 font-black">{pnrStatus.bookingStatus}</strong></span>
                  <span>Coach: {pnrStatus.coach} • Berth: {pnrStatus.berth}</span>
                </div>
              </motion.div>
            )}
          </div>

        </div>
      </div>

      {/* Available Trains List */}
      <div className="space-y-4">
        <h3 className="text-xl font-black text-slate-900 tracking-tight">Express &amp; Rajdhani Direct Trains</h3>
        
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map(n => (
              <div key={n} className="bg-white rounded-3xl p-6 border border-slate-200/80 animate-pulse h-28" />
            ))}
          </div>
        ) : (
          trains.map(train => (
            <motion.div
              key={train.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs hover:border-slate-400 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="font-mono font-black text-xs text-white bg-slate-950 px-2.5 py-1 rounded-xl">
                    {train.trainNumber}
                  </span>
                  <h4 className="font-black text-slate-900 text-base">{train.name}</h4>
                </div>
                
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-2 font-medium">
                  <div><strong className="text-slate-900 font-bold">{train.departureTime}</strong> ({train.from})</div>
                  <span>── {train.duration} ──</span>
                  <div><strong className="text-slate-900 font-bold">{train.arrivalTime}</strong> ({train.to})</div>
                </div>
              </div>

              {/* Class Chips */}
              <div className="flex flex-wrap items-center gap-2">
                {train.classes.map(cls => (
                  <button
                    key={cls.type}
                    type="button"
                    onClick={() => setSelectedTrain({ ...train, selectedClass: cls })}
                    className="p-3 rounded-2xl border border-slate-200/80 hover:border-slate-900 bg-slate-50 hover:bg-slate-100/60 text-left transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-3 text-xs font-black text-slate-900">
                      <span>{cls.name}</span>
                      <span className="font-mono font-black">₹{cls.price}</span>
                    </div>
                    <div className="text-[10px] text-emerald-600 font-black mt-0.5">{cls.status}</div>
                  </button>
                ))}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* TRAIN BOOKING MODAL */}
      <AnimatePresence>
        {selectedTrain && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md">
            <div className="fixed inset-0" onClick={() => setSelectedTrain(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 w-full max-w-lg bg-white rounded-3xl sm:rounded-4xl shadow-2xl p-6 sm:p-7 border border-slate-200/80 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">IRCTC Railway Desk</span>
                  <h3 className="text-base font-black text-slate-900 mt-0.5">{selectedTrain.name}</h3>
                </div>
                <button onClick={() => setSelectedTrain(null)} className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleBookTrain} className="space-y-4 py-4">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs font-bold text-slate-800 font-mono">
                  <div>Class: {selectedTrain.selectedClass?.name} ({selectedTrain.selectedClass?.type})</div>
                  <div className="text-slate-900 font-black text-sm">Fare: ₹{selectedTrain.selectedClass?.price}</div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">IRCTC User ID</label>
                  <input
                    type="text"
                    required
                    value={irctcId}
                    onChange={(e) => setIrctcId(e.target.value)}
                    placeholder="Enter IRCTC Username"
                    className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 focus:border-slate-900 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none font-mono transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Passenger Full Name</label>
                    <input
                      type="text"
                      required
                      value={passengerName}
                      onChange={(e) => setPassengerName(e.target.value)}
                      placeholder="e.g. Aman Sharma"
                      className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 focus:border-slate-900 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Berth Preference</label>
                    <select className="w-full bg-slate-50 border border-slate-200 focus:border-slate-900 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none cursor-pointer">
                      <option>No Preference</option>
                      <option>Lower Berth</option>
                      <option>Middle Berth</option>
                      <option>Upper Berth</option>
                      <option>Side Lower</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-black text-white font-black text-sm shadow-md transition-all cursor-pointer active:scale-[0.98]"
                >
                  Pay &amp; Confirm Train Ticket
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRMATION POPUP */}
      <AnimatePresence>
        {trainBooked && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl sm:rounded-4xl p-6 sm:p-7 max-w-md w-full text-center shadow-2xl border border-slate-200/80"
            >
              <div className="w-13 h-13 bg-slate-950 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md">
                <CheckCircle2 className="w-7 h-7 text-emerald-400 stroke-[2.5]" />
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Train Ticket Confirmed</h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Your ticket has been confirmed on IRCTC network. Electronic pass sent via SMS.
              </p>
              <div className="my-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs text-left font-mono space-y-1.5">
                <div>IRCTC PNR: <strong className="text-slate-900">2491028472</strong></div>
                <div>Status: <strong className="text-emerald-600 font-black">CNF (Confirmed)</strong></div>
                <div>Coach &amp; Berth: <strong className="text-slate-800">B3 / 41 (Lower Berth)</strong></div>
              </div>
              <button
                type="button"
                onClick={() => setTrainBooked(false)}
                className="w-full py-2.5 bg-slate-900 hover:bg-black text-white font-black rounded-2xl text-xs cursor-pointer"
              >
                Done
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

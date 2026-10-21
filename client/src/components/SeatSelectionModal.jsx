import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Check, Plane, Armchair, AlertCircle, ArrowRight } from 'lucide-react';
import { api } from '../utils/api';

export default function SeatSelectionModal({ flight, passengersCount = 1, onClose, onConfirmSeats }) {
  const [layoutData, setLayoutData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeats, setSelectedSeats] = useState([]); // array of seat objects e.g. [{ seatNumber: '12A', price: 350 }]
  const [activePassengerIndex, setActivePassengerIndex] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchSeats = async () => {
      try {
        const res = await api.getFlightSeats(flight.id);
        if (isMounted && res.success) {
          setLayoutData(res.layout);
        }
      } catch (err) {
        console.error('Error fetching seats', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchSeats();
    return () => { isMounted = false; };
  }, [flight.id]);

  const handleSeatClick = (seat) => {
    if (seat.isOccupied) return;

    const existingIndex = selectedSeats.findIndex(s => s.seatNumber === seat.seatNumber);

    if (existingIndex > -1) {
      // Unselect seat
      setSelectedSeats(selectedSeats.filter((_, idx) => idx !== existingIndex));
    } else {
      // If we already have selected max seats for passengers, replace the one for active passenger
      let updated = [...selectedSeats];
      if (updated.length >= passengersCount) {
        updated[activePassengerIndex] = seat;
      } else {
        updated.push(seat);
      }
      setSelectedSeats(updated);

      // Move to next passenger if needed
      if (activePassengerIndex < passengersCount - 1) {
        setActivePassengerIndex(activePassengerIndex + 1);
      }
    }
  };

  const totalSeatPrice = selectedSeats.reduce((sum, s) => sum + (s.price || 0), 0);

  const handleConfirm = () => {
    onConfirmSeats(selectedSeats);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs"
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
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                {flight.isMultiCity ? 'Select Flight Seats • Multi-City Itinerary' : `Select Your Seats • ${flight.flightNumber}`}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {flight.isMultiCity ? (
                <span className="font-bold text-sky-700">
                  Multi-City Journey: {flight.multiCityLegs?.map(l => `${l.from} ➔ ${l.to}`).join(' • ') || `${flight.from} → ${flight.to}`} • {passengersCount} traveller(s)
                </span>
              ) : (
                <>{flight.from} → {flight.to} • {flight.aircraft || 'Airbus A320'} • Selecting for {passengersCount} traveller(s)</>
              )}
            </p>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Passenger selector pills */}
        <div className="px-5 py-3 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-500">Traveller:</span>
            {Array.from({ length: passengersCount }).map((_, idx) => {
              const assignedSeat = selectedSeats[idx];
              const isActive = activePassengerIndex === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setActivePassengerIndex(idx)}
                  className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 border transition-all ${
                    isActive
                      ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                      : assignedSeat
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  <span>Traveller {idx + 1}</span>
                  {assignedSeat ? (
                    <span className="px-1.5 py-0.2 bg-white/30 text-white rounded font-mono text-[11px]">
                      {assignedSeat.seatNumber}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400">(Choose)</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Color Legend */}
          <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold text-slate-600">
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded bg-emerald-100 border border-emerald-400"></div>
              <span>Free (₹0)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded bg-amber-100 border border-amber-400"></div>
              <span>Extra Legroom (+₹350)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded bg-sky-600"></div>
              <span>Selected</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded bg-slate-300"></div>
              <span>Occupied</span>
            </div>
          </div>
        </div>

        {/* Cabin Visualizer Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100/60 flex justify-center">
          {loading ? (
            <div className="py-20 text-center">
              <Plane className="w-10 h-10 text-sky-600 animate-bounce mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-600">Loading Aircraft Cabin Layout...</p>
            </div>
          ) : (
            <div className="w-full max-w-md bg-white rounded-t-[5rem] rounded-b-3xl border border-slate-300 shadow-lg p-5 pt-10 relative">
              
              {/* Cockpit Nose */}
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-24 h-8 bg-slate-200 rounded-t-full border-t border-x border-slate-300 flex items-center justify-center">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Cockpit</span>
              </div>

              {/* Column labels */}
              <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-slate-400 mb-4 pb-2 border-b border-slate-100">
                <div>A</div>
                <div>B</div>
                <div>C</div>
                <div className="text-[10px] uppercase text-slate-300 font-mono">Aisle</div>
                <div>D</div>
                <div>E</div>
                <div>F</div>
              </div>

              {/* Rows */}
              <div className="space-y-2">
                {layoutData?.rows?.map((row) => {
                  const leftSeats = row.seats.slice(0, 3);
                  const rightSeats = row.seats.slice(3, 6);

                  return (
                    <div key={row.rowNumber} className="relative">
                      {row.isEmergencyExit && (
                        <div className="text-[10px] font-bold text-amber-600 bg-amber-50 rounded-md text-center py-0.5 my-1.5 border border-amber-200">
                          Emergency Exit Row (Extra Legroom)
                        </div>
                      )}

                      <div className="grid grid-cols-7 gap-1 items-center">
                        
                        {/* Left 3 Seats: A, B, C */}
                        {leftSeats.map((seat) => {
                          const isSelected = selectedSeats.some(s => s.seatNumber === seat.seatNumber);
                          let seatStyle = 'bg-slate-50 border-slate-300 text-slate-700 hover:border-sky-500';
                          
                          if (seat.isOccupied) {
                            seatStyle = 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed opacity-60';
                          } else if (isSelected) {
                            seatStyle = 'bg-sky-600 border-sky-700 text-white shadow-md scale-105';
                          } else if (seat.price > 0) {
                            seatStyle = 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100';
                          } else {
                            seatStyle = 'bg-emerald-50 border-emerald-300 text-emerald-900 hover:bg-emerald-100';
                          }

                          return (
                            <motion.button
                              key={seat.seatNumber}
                              disabled={seat.isOccupied}
                              whileHover={!seat.isOccupied ? { scale: 1.08 } : undefined}
                              whileTap={!seat.isOccupied ? { scale: 0.94 } : undefined}
                              onClick={() => handleSeatClick(seat)}
                              title={`${seat.seatNumber} (${seat.type}) - ₹${seat.price}`}
                              className={`h-9 rounded-lg border flex flex-col items-center justify-center text-[10px] font-bold transition-colors cursor-pointer ${seatStyle}`}
                            >
                              <span>{seat.seatNumber}</span>
                            </motion.button>
                          );
                        })}

                        {/* Aisle Row Number */}
                        <div className="text-center font-bold text-[11px] text-slate-400 font-mono">
                          {row.rowNumber}
                        </div>

                        {/* Right 3 Seats: D, E, F */}
                        {rightSeats.map((seat) => {
                          const isSelected = selectedSeats.some(s => s.seatNumber === seat.seatNumber);
                          let seatStyle = 'bg-slate-50 border-slate-300 text-slate-700 hover:border-sky-500';
                          
                          if (seat.isOccupied) {
                            seatStyle = 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed opacity-60';
                          } else if (isSelected) {
                            seatStyle = 'bg-sky-600 border-sky-700 text-white shadow-md scale-105';
                          } else if (seat.price > 0) {
                            seatStyle = 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100';
                          } else {
                            seatStyle = 'bg-emerald-50 border-emerald-300 text-emerald-900 hover:bg-emerald-100';
                          }

                          return (
                            <motion.button
                              key={seat.seatNumber}
                              disabled={seat.isOccupied}
                              whileHover={!seat.isOccupied ? { scale: 1.08 } : undefined}
                              whileTap={!seat.isOccupied ? { scale: 0.94 } : undefined}
                              onClick={() => handleSeatClick(seat)}
                              title={`${seat.seatNumber} (${seat.type}) - ₹${seat.price}`}
                              className={`h-9 rounded-lg border flex flex-col items-center justify-center text-[10px] font-bold transition-colors cursor-pointer ${seatStyle}`}
                            >
                              <span>{seat.seatNumber}</span>
                            </motion.button>
                          );
                        })}

                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}
        </div>

        {/* Footer Summary & Proceed */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-white flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs text-slate-500">Selected Seats:</div>
            <div className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              {selectedSeats.length > 0 ? (
                selectedSeats.map(s => (
                  <span key={s.seatNumber} className="px-2 py-0.5 bg-sky-100 text-sky-800 rounded font-mono">
                    {s.seatNumber} (₹{s.price})
                  </span>
                ))
              ) : (
                <span className="text-slate-400 font-normal">None selected (will auto-assign at check-in)</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onConfirmSeats([])}
              className="px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs cursor-pointer"
            >
              Skip Seats
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleConfirm}
              className="px-6 py-2.5 rounded-2xl bg-slate-900 hover:bg-black text-white font-black text-xs sm:text-sm shadow-md flex items-center gap-2 cursor-pointer transition-all"
            >
              <span>Continue with Selected ({selectedSeats.length})</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

      </motion.div>
    </motion.div>
  );
}

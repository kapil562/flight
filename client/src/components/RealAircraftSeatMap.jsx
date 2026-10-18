import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Armchair, Check, AlertCircle, Info, Sparkles, User, Users,
  Zap, Compass, ShieldCheck
} from 'lucide-react';

export default function RealAircraftSeatMap({
  flight,
  passengers = [],
  activePassengerIndex = 0,
  onSelectPassengerIndex,
  onSeatClick,
  onAutoAssignFree,
  layoutData,
  loading = false
}) {
  const [hoveredSeat, setHoveredSeat] = useState(null);

  const activePax = passengers[activePassengerIndex] || passengers[0] || {};
  const activePaxName = `${activePax.title || ''} ${activePax.firstName || ''} ${activePax.lastName || ''}`.trim() || `Traveller ${activePassengerIndex + 1}`;

  // Default rows if backend layout is loading
  const rows = layoutData?.rows || Array.from({ length: 28 }).map((_, rIdx) => {
    const r = rIdx + 1;
    const isExit = r === 12 || r === 13;
    const isFrontXL = r === 1;
    return {
      rowNumber: r,
      isEmergencyExit: isExit,
      seats: ['A', 'B', 'C', 'D', 'E', 'F'].map(col => {
        const seatNum = `${r}${col}`;
        const isOccupied = ['1B', '2A', '3C', '4D', '6F', '7B', '9A', '10C', '12E', '15A', '16B', '18D', '21F', '24C'].includes(seatNum);
        let type = 'Standard';
        let price = 0;
        let legroom = '30" Standard Legroom';

        if (isFrontXL) {
          type = 'XL Front Premium';
          price = 650;
          legroom = '38" Extra Legroom';
        } else if (isExit) {
          type = 'Emergency Exit XL';
          price = 550;
          legroom = '36" Extra Legroom';
        } else if (r <= 5) {
          type = 'Front Quick Deplane';
          price = 350;
          legroom = '32" Preferred Pitch';
        } else if (col === 'A' || col === 'F') {
          type = 'Window Seat';
          price = 150;
          legroom = '30" Standard Pitch';
        } else if (col === 'C' || col === 'D') {
          type = 'Aisle Seat';
          price = 120;
          legroom = '30" Standard Pitch';
        } else {
          type = 'Standard Middle';
          price = 0;
          legroom = '30" Standard Pitch';
        }

        return {
          seatNumber: seatNum,
          row: r,
          col,
          type,
          price,
          legroom,
          isOccupied
        };
      })
    };
  });

  return (
    <div className="space-y-4">
      
      {/* Real Passenger Selector Bar */}
      <div className="bg-slate-900 text-white p-3.5 sm:p-4 rounded-2xl shadow-md border border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Active Seat Selection:
            </span>
            <span className="text-xs sm:text-sm font-black text-amber-300">
              {activePaxName} (Traveller {activePassengerIndex + 1})
            </span>
          </div>

          <button
            type="button"
            onClick={onAutoAssignFree}
            className="text-xs font-bold text-sky-300 bg-sky-950/80 hover:bg-sky-900/90 px-3 py-1.5 rounded-xl border border-sky-500/40 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>⚡ Auto-Assign Free Seats (₹0)</span>
          </button>
        </div>

        {/* Passenger Switcher Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {passengers.map((p, idx) => {
            const isActive = activePassengerIndex === idx;
            const hasSeat = !!p.seat;
            const paxDisplayName = p.firstName ? `${p.title || ''} ${p.firstName}` : `Traveller ${idx + 1}`;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectPassengerIndex(idx)}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2.5 border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-sky-500 text-white border-sky-400 shadow-md ring-2 ring-sky-400/50 scale-102'
                    : hasSeat
                    ? 'bg-emerald-950/70 text-emerald-200 border-emerald-500/50 hover:bg-emerald-900/80'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                  isActive ? 'bg-white text-sky-900' : 'bg-slate-700 text-slate-200'
                }`}>
                  P{idx + 1}
                </div>
                <span>{paxDisplayName}</span>
                <span className={`px-2 py-0.5 rounded font-mono text-[11px] font-black ${
                  isActive
                    ? 'bg-sky-950 text-sky-200'
                    : hasSeat
                    ? 'bg-emerald-500/30 text-emerald-300'
                    : 'bg-slate-900 text-amber-400'
                }`}>
                  {p.seat ? `${p.seat} (₹${p.seatPrice || 0})` : 'Choose'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Real-time Seat Inspector Live Toast */}
      <div className="p-3 bg-gradient-to-r from-sky-50 via-indigo-50 to-emerald-50 border border-sky-200 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs">
        {hoveredSeat ? (
          <div className="flex items-center gap-2.5 animate-fadeIn">
            <span className="w-7 h-7 rounded-lg bg-sky-600 text-white font-mono font-black flex items-center justify-center text-xs shadow-xs">
              {hoveredSeat.seatNumber}
            </span>
            <div>
              <div className="font-extrabold text-slate-900 flex items-center gap-2">
                <span>{hoveredSeat.type}</span>
                <span className={`text-[10px] font-black px-1.5 py-0.2 rounded ${
                  hoveredSeat.price === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {hoveredSeat.price === 0 ? 'FREE SEAT' : `+₹${hoveredSeat.price}`}
                </span>
                {hoveredSeat.isOccupied && (
                  <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-1.5 py-0.2 rounded">
                    OCCUPIED
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-500">
                {hoveredSeat.legroom} • {hoveredSeat.col === 'A' || hoveredSeat.col === 'F' ? 'Window View' : hoveredSeat.col === 'C' || hoveredSeat.col === 'D' ? 'Direct Aisle Access' : 'Convenient Middle'} • Reclining Seat
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-slate-600">
            <Info className="w-4 h-4 text-sky-600 shrink-0" />
            <span>Hover or tap any seat to inspect window view, legroom pitch, and live fee.</span>
          </div>
        )}

        <div className="text-[11px] font-bold text-slate-600 font-mono">
          Aircraft: {flight.aircraft || 'Airbus A320neo (3-3 Seating)'}
        </div>
      </div>

      {/* Seat Color & Legend Bar */}
      <div className="bg-white p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-slate-200 shadow-xs">
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-4 text-[10px] sm:text-[11px] font-semibold text-slate-600">
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-emerald-50 border-2 border-emerald-500 shadow-xs shrink-0"></div>
            <span>Free Standard (₹0)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-sky-50 border-2 border-sky-500 shadow-xs shrink-0"></div>
            <span>Window/Aisle (₹120-150)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-amber-50 border-2 border-amber-500 shadow-xs shrink-0"></div>
            <span>XL Legroom (₹350-650)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-sky-600 text-white flex items-center justify-center font-bold text-[8px] shadow-sm shrink-0">✓</div>
            <span>Selected Seat</span>
          </div>
          <div className="flex items-center gap-1.5 col-span-2 sm:col-span-1">
            <div className="w-3.5 h-3.5 rounded bg-slate-200 border border-slate-300 opacity-60 shrink-0"></div>
            <span>Occupied</span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* REAL AIRLINER FUSELAGE WITH WINGS & INTERIOR CABIN */}
      {/* ======================================================== */}
      <div className="relative bg-slate-100/90 p-1 sm:p-5 rounded-xl sm:rounded-3xl border border-slate-200 flex justify-center overflow-x-hidden select-none">
        
        {/* Left Aerodynamic Wing (Port Side - Red Light) */}
        <div className="hidden lg:block absolute left-2 top-[38%] -translate-y-1/2 w-28 h-72 border-t-2 border-l-2 border-slate-400/80 bg-gradient-to-r from-slate-300/40 to-transparent rounded-tl-[4rem] pointer-events-none">
          <div className="absolute top-2 left-2 flex items-center gap-1 text-[10px] font-bold text-rose-500 uppercase">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            <span>Wing (Left)</span>
          </div>
        </div>

        {/* Right Aerodynamic Wing (Starboard Side - Green Light) */}
        <div className="hidden lg:block absolute right-2 top-[38%] -translate-y-1/2 w-28 h-72 border-t-2 border-r-2 border-slate-400/80 bg-gradient-to-l from-slate-300/40 to-transparent rounded-tr-[4rem] pointer-events-none">
          <div className="absolute top-2 right-2 flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase">
            <span>Wing (Right)</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          </div>
        </div>

        {/* Realistic Fuselage Body - Fluid on mobile */}
        <div className="w-full max-w-sm sm:max-w-md bg-white rounded-t-[3.5rem] sm:rounded-t-[5.5rem] rounded-b-[2rem] sm:rounded-b-[3.5rem] border-2 border-slate-200 shadow-xl p-1.5 sm:p-5 pt-8 sm:pt-12 relative mx-auto">
          
          {/* Cockpit Nose Cone & Windshield */}
          <div className="absolute -top-6 sm:-top-7 left-1/2 -translate-x-1/2 w-28 sm:w-36 h-10 sm:h-12 bg-slate-300 rounded-t-full border-t-2 border-x-2 border-slate-400 flex flex-col items-center justify-center shadow-inner">
            <div className="flex gap-1.5 sm:gap-2">
              <div className="w-6 sm:w-8 h-2.5 sm:h-3.5 bg-gradient-to-b from-sky-900 to-slate-900 rounded-t-md opacity-80"></div>
              <div className="w-6 sm:w-8 h-2.5 sm:h-3.5 bg-gradient-to-b from-sky-900 to-slate-900 rounded-t-md opacity-80"></div>
            </div>
            <span className="text-[8px] sm:text-[9px] font-black text-slate-600 uppercase tracking-widest mt-0.5">
              Cockpit
            </span>
          </div>

          {/* Front Entry Doors, Galley & Lavatories */}
          <div className="bg-slate-100 rounded-xl sm:rounded-2xl p-2 sm:p-3 border border-slate-200 mb-3 sm:mb-5 space-y-1.5 sm:space-y-2">
            <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
              <span className="flex items-center gap-1 text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                🚪 Door 1L (Exit)
              </span>
              <span className="flex items-center gap-1 text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                Door 1R (Exit) 🚪
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 sm:gap-2 text-center text-[9px] sm:text-[10px] font-bold">
              <div className="bg-white p-1.5 sm:p-2 rounded-lg sm:rounded-xl border border-slate-200 text-slate-700 flex items-center justify-center gap-1">
                <span>🚻 Front Lavatory</span>
              </div>
              <div className="bg-white p-1.5 sm:p-2 rounded-lg sm:rounded-xl border border-slate-200 text-slate-700 flex items-center justify-center gap-1">
                <span>☕ Galley / Pantry</span>
              </div>
            </div>
          </div>

          {/* Column Letters Bar */}
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-center font-black text-[11px] sm:text-xs text-slate-500 mb-2 sm:mb-3 pb-1.5 sm:pb-2 border-b-2 border-slate-200 bg-slate-50 py-1 sm:py-1.5 rounded-lg sm:rounded-xl">
            <div>A</div>
            <div>B</div>
            <div>C</div>
            <div className="text-[9px] sm:text-[10px] uppercase text-sky-600 font-mono flex items-center justify-center font-black">
              Aisle
            </div>
            <div>D</div>
            <div>E</div>
            <div>F</div>
          </div>

          {/* Cabin Rows (1 to 28) */}
          <div className="space-y-1.5 sm:space-y-2 max-h-[500px] overflow-y-auto pr-0.5 sm:pr-1 scrollbar-thin">
            {rows.map((row) => {
              const leftSeats = row.seats.slice(0, 3);
              const rightSeats = row.seats.slice(3, 6);

              return (
                <div key={row.rowNumber} className="relative">
                  
                  {/* Emergency Exit Row Indicators */}
                  {row.isEmergencyExit && (
                    <div className="my-1.5 py-0.5 sm:py-1 px-2 sm:px-3 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border border-amber-300 rounded-lg sm:rounded-xl text-center flex items-center justify-between text-[9px] sm:text-[10px] font-black text-amber-900 uppercase">
                      <span>🚪 Overwing Exit</span>
                      <span>Row {row.rowNumber} • Extra Legroom XL</span>
                      <span>Exit 🚪</span>
                    </div>
                  )}

                  <div className="grid grid-cols-7 gap-1 sm:gap-1.5 items-center">
                    
                    {/* Left 3 Seats: A, B, C */}
                    {leftSeats.map((seat) => {
                      const passengerAssigned = passengers.find(p => p.seat === seat.seatNumber);
                      const isSelectedForActive = passengers[activePassengerIndex]?.seat === seat.seatNumber;
                      const isSelectedForAny = !!passengerAssigned;
                      const assignedPaxIdx = passengerAssigned ? passengers.indexOf(passengerAssigned) : -1;

                      // Authentic Airline Seat Styling with Headrest & Armrest
                      let seatClasses = 'bg-white border-slate-300 text-slate-700 hover:border-sky-500 hover:shadow-md';
                      let headrestColor = 'bg-slate-200';

                      if (seat.isOccupied) {
                        seatClasses = 'bg-slate-100 border-slate-200 text-slate-300 opacity-40 cursor-not-allowed';
                        headrestColor = 'bg-slate-300';
                      } else if (isSelectedForActive) {
                        seatClasses = 'bg-sky-600 border-sky-700 text-white shadow-lg ring-2 ring-sky-400 scale-105';
                        headrestColor = 'bg-sky-800';
                      } else if (isSelectedForAny) {
                        seatClasses = 'bg-emerald-600 border-emerald-700 text-white shadow-md font-bold';
                        headrestColor = 'bg-emerald-800';
                      } else if (seat.price > 300) {
                        seatClasses = 'bg-amber-50/80 border-amber-400 text-amber-900 hover:bg-amber-100';
                        headrestColor = 'bg-amber-300';
                      } else if (seat.price > 0) {
                        seatClasses = 'bg-sky-50/80 border-sky-300 text-sky-900 hover:bg-sky-100';
                        headrestColor = 'bg-sky-200';
                      } else {
                        seatClasses = 'bg-emerald-50/60 border-emerald-300 text-emerald-900 hover:bg-emerald-100';
                        headrestColor = 'bg-emerald-200';
                      }

                      return (
                        <motion.button
                          key={seat.seatNumber}
                          type="button"
                          disabled={seat.isOccupied}
                          whileHover={!seat.isOccupied ? { scale: 1.08 } : undefined}
                          whileTap={!seat.isOccupied ? { scale: 0.94 } : undefined}
                          onMouseEnter={() => setHoveredSeat(seat)}
                          onMouseLeave={() => setHoveredSeat(null)}
                          onClick={() => onSeatClick(seat)}
                          className={`h-9 sm:h-11 rounded-t-lg rounded-b-xs sm:rounded-t-xl sm:rounded-b-md border sm:border-2 flex flex-col items-center justify-between p-0.5 sm:p-1 transition-all cursor-pointer relative overflow-hidden ${seatClasses}`}
                          title={`${seat.seatNumber} (${seat.type}) - ${seat.price > 0 ? `+₹${seat.price}` : 'FREE'}`}
                        >
                          {/* Realistic Headrest Cushion Bar */}
                          <div className={`w-full h-1 sm:h-1.5 rounded-full ${headrestColor} opacity-70 mb-0.5`}></div>

                          {/* Seat Code & Passenger Badge */}
                          <div className="flex items-center justify-center font-mono font-black text-[8px] sm:text-[10px] leading-none">
                            {isSelectedForAny ? (
                              <span className="font-extrabold text-[7.5px] sm:text-[9px]">
                                P{assignedPaxIdx + 1}
                              </span>
                            ) : (
                              <span>{seat.seatNumber}</span>
                            )}
                          </div>

                          {/* Price Tag Indicator */}
                          <div className="text-[6.5px] sm:text-[8px] font-bold opacity-75 font-mono">
                            {seat.price > 0 ? `₹${seat.price}` : 'Free'}
                          </div>
                        </motion.button>
                      );
                    })}

                    {/* Aisle Row Number Marker */}
                    <div className="text-center font-black text-[9px] sm:text-[11px] text-slate-400 font-mono py-0.5 sm:py-1">
                      {row.rowNumber}
                    </div>

                    {/* Right 3 Seats: D, E, F */}
                    {rightSeats.map((seat) => {
                      const passengerAssigned = passengers.find(p => p.seat === seat.seatNumber);
                      const isSelectedForActive = passengers[activePassengerIndex]?.seat === seat.seatNumber;
                      const isSelectedForAny = !!passengerAssigned;
                      const assignedPaxIdx = passengerAssigned ? passengers.indexOf(passengerAssigned) : -1;

                      let seatClasses = 'bg-white border-slate-300 text-slate-700 hover:border-sky-500 hover:shadow-md';
                      let headrestColor = 'bg-slate-200';

                      if (seat.isOccupied) {
                        seatClasses = 'bg-slate-100 border-slate-200 text-slate-300 opacity-40 cursor-not-allowed';
                        headrestColor = 'bg-slate-300';
                      } else if (isSelectedForActive) {
                        seatClasses = 'bg-sky-600 border-sky-700 text-white shadow-lg ring-2 ring-sky-400 scale-105';
                        headrestColor = 'bg-sky-800';
                      } else if (isSelectedForAny) {
                        seatClasses = 'bg-emerald-600 border-emerald-700 text-white shadow-md font-bold';
                        headrestColor = 'bg-emerald-800';
                      } else if (seat.price > 300) {
                        seatClasses = 'bg-amber-50/80 border-amber-400 text-amber-900 hover:bg-amber-100';
                        headrestColor = 'bg-amber-300';
                      } else if (seat.price > 0) {
                        seatClasses = 'bg-sky-50/80 border-sky-300 text-sky-900 hover:bg-sky-100';
                        headrestColor = 'bg-sky-200';
                      } else {
                        seatClasses = 'bg-emerald-50/60 border-emerald-300 text-emerald-900 hover:bg-emerald-100';
                        headrestColor = 'bg-emerald-200';
                      }

                      return (
                        <motion.button
                          key={seat.seatNumber}
                          type="button"
                          disabled={seat.isOccupied}
                          whileHover={!seat.isOccupied ? { scale: 1.08 } : undefined}
                          whileTap={!seat.isOccupied ? { scale: 0.94 } : undefined}
                          onMouseEnter={() => setHoveredSeat(seat)}
                          onMouseLeave={() => setHoveredSeat(null)}
                          onClick={() => onSeatClick(seat)}
                          className={`h-9 sm:h-11 rounded-t-lg rounded-b-xs sm:rounded-t-xl sm:rounded-b-md border sm:border-2 flex flex-col items-center justify-between p-0.5 sm:p-1 transition-all cursor-pointer relative overflow-hidden ${seatClasses}`}
                          title={`${seat.seatNumber} (${seat.type}) - ${seat.price > 0 ? `+₹${seat.price}` : 'FREE'}`}
                        >
                          {/* Realistic Headrest Cushion Bar */}
                          <div className={`w-full h-1 sm:h-1.5 rounded-full ${headrestColor} opacity-70 mb-0.5`}></div>

                          {/* Seat Code & Passenger Badge */}
                          <div className="flex items-center justify-center font-mono font-black text-[8px] sm:text-[10px] leading-none">
                            {isSelectedForAny ? (
                              <span className="font-extrabold text-[7.5px] sm:text-[9px]">
                                P{assignedPaxIdx + 1}
                              </span>
                            ) : (
                              <span>{seat.seatNumber}</span>
                            )}
                          </div>

                          {/* Price Tag Indicator */}
                          <div className="text-[6.5px] sm:text-[8px] font-bold opacity-75 font-mono">
                            {seat.price > 0 ? `₹${seat.price}` : 'Free'}
                          </div>
                        </motion.button>
                      );
                    })}

                  </div>
                </div>
              );
            })}
          </div>

          {/* Rear Galley & Tail Lavatories */}
          <div className="mt-4 sm:mt-5 bg-slate-100/90 rounded-2xl p-2.5 sm:p-3 border border-slate-200 space-y-2">
            <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-bold">
              <div className="bg-white p-2 rounded-xl border border-slate-200 text-slate-700 flex items-center justify-center gap-1 shadow-2xs">
                <span>🚻 Rear Lavatory L</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-slate-200 text-slate-700 flex items-center justify-center gap-1 shadow-2xs">
                <span>🚻 Rear Lavatory R</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
              <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1">
                🚪 Rear Exit 2L
              </span>
              <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1">
                Rear Exit 2R 🚪
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, Sparkles } from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const SHORT_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

// Timezone-safe date helper
export const parseYMD = (str) => {
  if (!str) return null;
  const parts = str.split('-').map(Number);
  if (parts.length < 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) return null;
  return new Date(parts[0], parts[1] - 1, parts[2]);
};

export const formatYMD = (date) => {
  if (!date) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const getTodayString = (offsetDays = 0) => {
  const d = new Date();
  if (offsetDays) d.setDate(d.getDate() + offsetDays);
  return formatYMD(d);
};

export default function CustomDatePicker({
  value,
  onChange,
  minDate = getTodayString(),
  label = 'Departure',
  subText = '',
  from = 'DEL',
  to = 'BOM',
  compact = false,
  align = 'left',
  className = '',
  variant = 'capsule'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedDateObj = useMemo(() => parseYMD(value) || new Date(), [value]);
  const minDateObj = useMemo(() => parseYMD(minDate) || new Date(), [minDate]);

  // Calendar view year and month
  const [viewYear, setViewYear] = useState(() => selectedDateObj.getFullYear());
  const [viewMonth, setViewMonth] = useState(() => selectedDateObj.getMonth());

  // Reset to selected date's month whenever opened
  useEffect(() => {
    if (isOpen) {
      const d = parseYMD(value) || new Date();
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    }
  }, [isOpen, value]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Generate days for viewMonth and viewYear
  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const startDayOfWeek = firstDay.getDay(); // 0 = Sun, 6 = Sat
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const days = [];
    // Padding before month starts
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({ empty: true, key: `empty-${i}` });
    }

    const todayStr = getTodayString();

    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(viewYear, viewMonth, day);
      const dateStr = formatYMD(dateObj);
      const isPast = minDate ? dateStr < minDate : dateStr < todayStr;
      const isSelected = value === dateStr;
      const isToday = dateStr === todayStr;

      days.push({
        empty: false,
        key: dateStr,
        dayNumber: day,
        dateStr,
        dateObj,
        isPast,
        isSelected,
        isToday
      });
    }

    return days;
  }, [viewYear, viewMonth, minDate, value]);

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(y => y - 1);
    } else {
      setViewMonth(m => m - 1);
    }
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(y => y + 1);
    } else {
      setViewMonth(m => m + 1);
    }
  };

  const canGoPrev = useMemo(() => {
    if (!minDate) return true;
    const minD = parseYMD(minDate);
    if (!minD) return true;
    return viewYear > minD.getFullYear() || (viewYear === minD.getFullYear() && viewMonth > minD.getMonth());
  }, [viewYear, viewMonth, minDate]);

  const handleSelectDay = (dayObj) => {
    if (dayObj.isPast || dayObj.empty) return;
    onChange(dayObj.dateStr);
    setIsOpen(false);
  };

  // Formatted representations for display card
  const formattedDay = selectedDateObj ? selectedDateObj.getDate() : '';
  const formattedMonthYear = selectedDateObj 
    ? `${SHORT_MONTHS[selectedDateObj.getMonth()]}' ${String(selectedDateObj.getFullYear()).slice(-2)}` 
    : '';
  const formattedWeekday = selectedDateObj 
    ? ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][selectedDateObj.getDay()] 
    : '';

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Trigger Box */}
      {variant === 'capsule' ? (
        <div
          onClick={() => setIsOpen(!isOpen)}
          role="button"
          tabIndex={0}
          aria-label={`Select ${label} date`}
          className="p-3 sm:px-4 sm:py-3 rounded-2xl sm:rounded-full hover:bg-slate-100/80 transition-all cursor-pointer select-none group w-full text-left"
        >
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
            {label}
          </span>

          {value ? (
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-sm sm:text-base font-black text-slate-900 truncate">
                {formattedDay} {formattedMonthYear}
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-slate-500 capitalize shrink-0">
                • {formattedWeekday.slice(0, 3)}
              </span>
            </div>
          ) : (
            <div className="text-sm sm:text-base font-black text-slate-400 mt-0.5">
              Select Date
            </div>
          )}

          <span className="text-[10px] text-slate-400 truncate block mt-0.5">
            {subText || (label.toLowerCase().includes('return') ? 'Aane ki ticket' : 'Departure date')}
          </span>
        </div>
      ) : (
        /* Legacy Boxed Mode (for multi-city forms if needed) */
        <div
          onClick={() => setIsOpen(!isOpen)}
          role="button"
          tabIndex={0}
          aria-label={`Select ${label} date`}
          className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border border-slate-200 hover:border-sky-500 transition-all bg-slate-50/50 hover:bg-white h-full min-h-[76px] sm:min-h-[84px] flex flex-col justify-between cursor-pointer select-none group focus:outline-hidden focus:ring-2 focus:ring-sky-500"
        >
          <div className="flex items-center text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5 sm:mb-1">
            <div className="flex items-center gap-1.5 truncate">
              <CalendarIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-600 shrink-0 group-hover:scale-110 transition-transform" />
              <span className="truncate">{label}</span>
            </div>
          </div>

          {value ? (
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm sm:text-2xl font-black text-slate-900 leading-none">
                {formattedDay}
              </span>
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm font-extrabold text-slate-800 leading-tight">
                  {formattedMonthYear}
                </span>
                <span className="text-[10px] sm:text-xs font-medium text-slate-500 capitalize leading-none">
                  {formattedWeekday}
                </span>
              </div>
            </div>
          ) : (
            <div className="py-0.5">
              <div className="text-xs sm:text-sm font-extrabold text-slate-400">
                Select Date
              </div>
              <div className="text-[9px] sm:text-[10px] text-slate-400 font-medium truncate">
                {subText || 'Add date for discounts'}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modern Airline-Grade Calendar Popover */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Mobile backdrop for seamless outside touch */}
            <div 
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-40 sm:hidden"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.16 }}
              className={`fixed sm:absolute top-1/2 left-1/2 sm:top-full ${
                align === 'right' ? 'sm:left-auto sm:right-0' : 'sm:left-0 sm:right-auto'
              } -translate-x-1/2 -translate-y-1/2 sm:translate-x-0 sm:translate-y-0 sm:mt-2.5 z-50 w-[92vw] sm:w-[380px] md:w-[410px] bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden text-slate-900`}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-sky-600 to-blue-700 px-4 py-3.5 text-white flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-sky-200">
                    {label} Calendar
                  </div>
                  <div className="text-base sm:text-lg font-black flex items-center gap-1.5">
                    <span>{MONTH_NAMES[viewMonth]} {viewYear}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    disabled={!canGoPrev}
                    aria-label="Previous month"
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      canGoPrev 
                        ? 'bg-white/15 hover:bg-white/30 text-white cursor-pointer' 
                        : 'text-white/30 cursor-not-allowed'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleNextMonth}
                    aria-label="Next month"
                    className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    aria-label="Close calendar"
                    className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center ml-1 cursor-pointer transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Calendar Grid Container */}
              <div className="p-3 sm:p-4">
                {/* Weekday Row */}
                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                  {WEEKDAYS.map((w, idx) => (
                    <div 
                      key={w} 
                      className={`text-[11px] font-black uppercase tracking-wider py-1 ${
                        idx === 0 || idx === 6 ? 'text-amber-600' : 'text-slate-400'
                      }`}
                    >
                      {w}
                    </div>
                  ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day) => {
                    if (day.empty) {
                      return <div key={day.key} className="h-9 sm:h-10 md:h-11" />;
                    }

                    const isPast = day.isPast;
                    const isSelected = day.isSelected;

                    return (
                      <button
                        key={day.key}
                        type="button"
                        disabled={isPast}
                        onClick={() => handleSelectDay(day)}
                        className={`h-9 sm:h-10 md:h-11 rounded-xl flex items-center justify-center transition-all relative text-center select-none cursor-pointer ${
                          isSelected
                            ? 'bg-sky-600 text-white shadow-md font-black scale-105 z-10 ring-2 ring-sky-300'
                            : isPast
                            ? 'text-slate-300 bg-slate-50/50 cursor-not-allowed opacity-50'
                            : day.isToday
                            ? 'bg-sky-50 text-sky-700 font-extrabold border border-sky-300 hover:bg-sky-100'
                            : 'hover:bg-slate-100 text-slate-700 hover:text-slate-900 font-bold'
                        }`}
                      >
                        <span className={`text-xs sm:text-sm md:text-base font-bold ${
                          isSelected ? 'text-white' : isPast ? 'text-slate-300' : day.isToday ? 'text-sky-700' : 'text-slate-800'
                        }`}>
                          {day.dayNumber}
                        </span>

                        {day.isToday && !isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-500 absolute top-1 right-1" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Quick Date Selectors at Bottom */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        onChange(getTodayString(0));
                        setIsOpen(false);
                      }}
                      className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-sky-50 hover:text-sky-600 text-slate-700 cursor-pointer transition-colors"
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(getTodayString(1));
                        setIsOpen(false);
                      }}
                      className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-sky-50 hover:text-sky-600 text-slate-700 cursor-pointer transition-colors"
                    >
                      Tomorrow
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(getTodayString(7));
                        setIsOpen(false);
                      }}
                      className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-sky-50 hover:text-sky-600 text-slate-700 cursor-pointer transition-colors"
                    >
                      +1 Week
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="text-[11px] font-bold text-sky-600 hover:text-sky-800 px-2 py-1 rounded-lg hover:bg-sky-50 cursor-pointer transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

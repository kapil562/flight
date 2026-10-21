import React, { useEffect, useState } from 'react';
import { TrendingDown, Calendar, Sparkles, ChevronRight, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '../utils/api';

export default function PriceCalendar({ from, to, selectedDate, onSelectDate }) {
  const [calendarData, setCalendarData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchCalendar = async () => {
      setLoading(true);
      try {
        const res = await api.getFareCalendar(from, to);
        if (isMounted && res.success) {
          setCalendarData(res.calendar);
        }
      } catch (err) {
        console.error('Error fetching fare calendar', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (from && to) {
      fetchCalendar();
    }
    return () => { isMounted = false; };
  }, [from, to]);

  if (!calendarData || calendarData.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-[0_4px_20px_rgba(15,23,42,0.04)] mb-6 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3.5 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <TrendingDown className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>Lowest Fare Trend & Dates</span>
              <span className="text-sky-600 font-mono">({from} ➔ {to})</span>
            </h4>
            <p className="text-[11px] text-slate-500">Compare day-wise fares and save up to 30%</p>
          </div>
        </div>

        <div className="text-[11px] text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full font-black border border-emerald-200/80 flex items-center gap-1.5 self-start sm:self-auto shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Verified GDS Live Radar</span>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200">
        {calendarData.map((item) => {
          const isSelected = selectedDate === item.date;
          return (
            <motion.button
              key={item.date}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectDate(item.date)}
              className={`shrink-0 px-4 py-2.5 rounded-2xl border text-center transition-all cursor-pointer relative ${
                isSelected
                  ? 'bg-gradient-to-br from-sky-600 to-blue-600 text-white border-transparent shadow-lg shadow-sky-600/30 scale-102'
                  : item.isLowest
                  ? 'bg-emerald-50/60 border-emerald-300 hover:border-emerald-400 text-slate-800'
                  : 'bg-slate-50/80 border-slate-200 hover:border-sky-300 text-slate-700 hover:bg-white'
              }`}
            >
              <div className={`text-[10px] font-black uppercase tracking-wider ${isSelected ? 'text-sky-100' : 'text-slate-400'}`}>
                {item.day}, {item.date.slice(5)}
              </div>
              <div className={`text-sm sm:text-base font-black font-mono mt-0.5 tracking-tight ${
                isSelected ? 'text-white' : item.isLowest ? 'text-emerald-700' : 'text-slate-900'
              }`}>
                ₹{item.price.toLocaleString('en-IN')}
              </div>
              {item.isLowest && (
                <span className={`inline-block text-[8px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-full mt-1 ${
                  isSelected ? 'bg-white text-sky-800' : 'bg-emerald-600 text-white'
                }`}>
                  Cheapest
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

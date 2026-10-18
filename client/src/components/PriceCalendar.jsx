import React, { useEffect, useState } from 'react';
import { TrendingDown, Calendar, Sparkles } from 'lucide-react';
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
    <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Fare Trends & Cheapest Dates ({from} → {to})
          </span>
        </div>
        <div className="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200 flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          <span>Lowest fare guaranteed</span>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {calendarData.map((item) => {
          const isSelected = selectedDate === item.date;
          return (
            <button
              key={item.date}
              onClick={() => onSelectDate(item.date)}
              className={`flex-shrink-0 px-3.5 py-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                isSelected
                  ? 'bg-sky-600 text-white border-sky-600 shadow-md scale-105'
                  : item.isLowest
                  ? 'bg-emerald-50/70 border-emerald-300 hover:border-emerald-400 text-slate-800'
                  : 'bg-slate-50 border-slate-200 hover:border-sky-300 text-slate-700'
              }`}
            >
              <div className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-sky-100' : 'text-slate-400'}`}>
                {item.day}, {item.date.slice(5)}
              </div>
              <div className={`text-sm font-extrabold mt-0.5 ${isSelected ? 'text-white' : item.isLowest ? 'text-emerald-700 font-black' : 'text-slate-900'}`}>
                ₹{item.price.toLocaleString('en-IN')}
              </div>
              {item.isLowest && (
                <span className={`inline-block text-[9px] font-black uppercase tracking-tighter px-1 rounded mt-0.5 ${isSelected ? 'bg-white text-sky-800' : 'bg-emerald-600 text-white'}`}>
                  Lowest
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

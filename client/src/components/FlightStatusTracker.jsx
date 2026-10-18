import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Activity, Plane, Clock, MapPin, Gauge, ShieldCheck, ArrowRight, RotateCw } from 'lucide-react';
import { api } from '../utils/api';
import AirlineBadge from './AirlineBadge';

export default function FlightStatusTracker({ initialQuery = '' }) {
  const [query, setQuery] = useState(initialQuery || 'DEL-BOM');
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date().toLocaleTimeString());

  const fetchStatus = async (searchQuery) => {
    setLoading(true);
    try {
      const res = await api.trackFlightStatus(searchQuery);
      if (res.success) {
        setFlights(res.data);
        setLastRefreshed(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.error('Error fetching live status', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus(query);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchStatus(query);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      
      {/* Top Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8"
      >
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Real-Time Aviation Radar & Telemetry
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight mb-2">
            AirSkyGo Live Flight Tracker
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mb-6">
            Check real-time flight status, radar progress, gate numbers, and departure delay estimations.
          </p>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter Flight Number (e.g. 6E-2041, AI-805) or Route (DEL-BOM)..."
                className="w-full bg-white/10 border border-white/20 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-400 font-medium"
              />
            </div>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-6 py-3 bg-sky-500 hover:bg-sky-400 text-slate-900 font-extrabold text-sm rounded-2xl shadow-lg shadow-sky-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap"
            >
              <Activity className="w-4 h-4" />
              <span>Track Live</span>
            </motion.button>
          </form>

          {/* Quick Suggestions */}
          <div className="flex flex-wrap items-center gap-2 mt-4 text-xs text-slate-400">
            <span>Try searching:</span>
            {['6E-2041', 'AI-805', 'UK-993', 'DEL-BOM', 'DEL-DXB'].map(item => (
              <button
                key={item}
                type="button"
                onClick={() => { setQuery(item); fetchStatus(item); }}
                className="bg-white/10 hover:bg-white/20 text-sky-200 px-2.5 py-1 rounded-lg border border-white/10 transition-colors font-mono cursor-pointer"
              >
                {item}
              </button>
            ))}
          </div>

        </div>
      </motion.div>

      {/* Tracker Status Cards */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-extrabold text-slate-900">
          Tracked Flights ({flights.length})
        </h3>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Last updated: {lastRefreshed}</span>
          <button
            onClick={() => fetchStatus(query)}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
            title="Refresh Radar"
          >
            <RotateCw className={`w-3.5 h-3.5 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(n => (
            <div key={n} className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse space-y-4">
              <div className="h-6 bg-slate-200 rounded w-1/4"></div>
              <div className="h-16 bg-slate-100 rounded"></div>
            </div>
          ))}
        </div>
      ) : flights.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
          <Plane className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="font-extrabold text-slate-800 text-base">No Flights Found</h4>
          <p className="text-xs text-slate-500 mt-1">Please try searching with another flight number or route.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {flights.map(flight => {
            const isBoarding = flight.status === 'Boarding';
            const isDelayed = flight.status?.includes('Delayed');

            return (
              <motion.div
                key={flight.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow"
              >
                
                {/* Header: Airline + Status Pill */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <AirlineBadge code={flight.airlineCode} name={flight.airline} />
                    <span className="font-mono text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      {flight.aircraft}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 ${
                      isBoarding
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : isDelayed
                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}>
                      <span className="w-2 h-2 rounded-full bg-current animate-ping"></span>
                      <span>{flight.status || 'On-Time'}</span>
                    </span>
                  </div>
                </div>

                {/* Visual Radar Progress Bar */}
                <div className="py-5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-2">
                    <div>
                      <span className="text-xl font-black font-mono">{flight.from}</span>
                      <span className="text-slate-500 font-normal ml-1.5">({flight.fromCity})</span>
                    </div>

                    <div className="text-center font-mono text-slate-400 text-[11px]">
                      {flight.duration} Non-Stop
                    </div>

                    <div>
                      <span className="text-xl font-black font-mono">{flight.to}</span>
                      <span className="text-slate-500 font-normal ml-1.5">({flight.toCity})</span>
                    </div>
                  </div>

                  {/* Progress Line with moving airplane */}
                  <div className="relative w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className="h-full bg-gradient-to-r from-sky-500 to-blue-600 rounded-full transition-all duration-700"
                      style={{ width: `${flight.progress || 60}%` }}
                    ></div>
                  </div>

                  {/* Icon indicator */}
                  <div className="flex justify-between text-[11px] font-semibold text-slate-500 mt-1">
                    <div>Dep: <strong className="text-slate-900">{flight.departureTime}</strong> ({flight.terminal?.from})</div>
                    <div className="text-sky-700 font-mono font-bold flex items-center gap-1">
                      <Plane className="w-3.5 h-3.5 rotate-45 inline text-sky-600" />
                      <span>{flight.progress || 60}% en route</span>
                    </div>
                    <div>Arr: <strong className="text-slate-900">{flight.arrivalTime}</strong> ({flight.terminal?.to})</div>
                  </div>
                </div>

                {/* Telemetry Footer */}
                <div className="pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50/70 -mx-5 -mb-5 p-4 rounded-b-2xl">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Departure Gate</span>
                    <div className="font-extrabold text-slate-900 mt-0.5">{flight.gate?.departure || 'Gate 12A'}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Arrival Belt</span>
                    <div className="font-extrabold text-slate-900 mt-0.5">{flight.gate?.arrival || 'Baggage Belt 3'}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Current Altitude</span>
                    <div className="font-extrabold text-slate-900 font-mono mt-0.5">{flight.altitude || '33,000 ft'}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Ground Speed</span>
                    <div className="font-extrabold text-slate-900 font-mono mt-0.5">{flight.speed || '820 km/h'}</div>
                  </div>
                </div>

              </motion.div>
            );
          })}
        </div>
      )}

    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plane, Building2, Palmtree, Train, Globe2, CheckSquare, Search, Sparkles } from 'lucide-react';

export default function ServiceTabs({ 
  activeService, 
  onSelectService, 
  onOpenQuickPnr, 
  onOpenWebCheckIn,
  settings = null,
  brand = null 
}) {
  const defaultServices = {
    flights: true,
    hotels: true,
    holidays: true,
    trains: false, // Default OFF
    visa: true,
    checkin: true,
    pnr: true
  };

  const [enabledConfig, setEnabledConfig] = useState(() => {
    return settings?.enabledServices || brand?.enabledServices || (() => {
      try {
        const saved = localStorage.getItem('asg_services');
        return saved ? JSON.parse(saved) : null;
      } catch { return null; }
    })() || defaultServices;
  });

  useEffect(() => {
    if (settings?.enabledServices || brand?.enabledServices) {
      setEnabledConfig(settings?.enabledServices || brand?.enabledServices);
    }
  }, [settings?.enabledServices, brand?.enabledServices]);

  useEffect(() => {
    const handleUpdate = (e) => {
      if (e.detail?.enabledServices) {
        setEnabledConfig(e.detail.enabledServices);
      } else {
        try {
          const saved = localStorage.getItem('asg_services');
          if (saved) setEnabledConfig(JSON.parse(saved));
        } catch {}
      }
    };
    window.addEventListener('asg_brand_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('asg_brand_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const allServices = [
    { id: 'flights', label: 'Flights', icon: Plane, tag: 'Lowest Fare' },
    { id: 'hotels', label: 'Hotels', icon: Building2, tag: null },
    { id: 'holidays', label: 'Holidays', icon: Palmtree, tag: 'Packages' },
    { id: 'trains', label: 'Trains', icon: Train, tag: null },
    { id: 'visa', label: 'Visa Desk', icon: Globe2, tag: 'Fast' },
    { id: 'checkin', label: 'Web Check-In', icon: CheckSquare, tag: null, action: onOpenWebCheckIn },
    { id: 'pnr', label: 'Check PNR', icon: Search, tag: null, action: onOpenQuickPnr }
  ];

  const visibleServices = allServices.filter(s => enabledConfig[s.id] !== false);

  if (visibleServices.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 -mb-2 sm:-mb-4 relative z-20">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-1.5 shadow-[0_12px_32px_rgba(15,23,42,0.08)] border border-slate-200/90 flex items-center justify-between gap-1 sm:gap-2 overflow-x-auto scrollbar-none w-full">
        {visibleServices.map((srv) => {
          const Icon = srv.icon;
          const isActive = activeService === srv.id;

          return (
            <button
              key={srv.id}
              type="button"
              onClick={() => {
                if (srv.action) {
                  srv.action();
                } else {
                  onSelectService(srv.id);
                }
              }}
              className={`flex-1 min-w-max flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm transition-all duration-200 whitespace-nowrap cursor-pointer shrink-0 relative ${
                isActive
                  ? 'bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 text-white shadow-lg shadow-sky-600/30 scale-[1.01]'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100/80 active:scale-98'
              }`}
            >
              <div className={`p-1 rounded-lg ${isActive ? 'bg-white/20' : 'bg-slate-100 text-sky-600'}`}>
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              </div>
              <span className="tracking-tight">{srv.label}</span>
              {srv.tag && (
                <span className={`text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                  isActive ? 'bg-amber-400 text-slate-950' : 'bg-amber-100 text-amber-800'
                }`}>
                  {srv.tag}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

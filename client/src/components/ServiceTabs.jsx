import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plane, Building2, Palmtree, Train, Globe2, CheckSquare, Search } from 'lucide-react';

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
    trains: false, // Default OFF as requested
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
    { id: 'flights', label: 'Flights', icon: Plane, badge: null },
    { id: 'hotels', label: 'Hotels', icon: Building2, badge: 'HOT' },
    { id: 'holidays', label: 'Holidays', icon: Palmtree, badge: 'OFFERS' },
    { id: 'trains', label: 'Trains', icon: Train, badge: null },
    { id: 'visa', label: 'Visa Services', icon: Globe2, badge: 'FAST' },
    { id: 'checkin', label: 'Web Check-In', icon: CheckSquare, badge: null, action: onOpenWebCheckIn },
    { id: 'pnr', label: 'Check PNR', icon: Search, badge: null, action: onOpenQuickPnr }
  ];

  const visibleServices = allServices.filter(s => enabledConfig[s.id] !== false);

  if (visibleServices.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 -mb-3 sm:-mb-5 relative z-40">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl p-1.5 sm:p-2 shadow-xl border border-slate-200/90 flex items-center justify-between gap-1.5 sm:gap-2.5 overflow-x-auto scrollbar-none w-full">
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
              className={`flex-1 min-w-[120px] sm:min-w-0 flex items-center justify-center gap-2 px-3 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-extrabold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer relative text-center ${
                isActive
                  ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-md shadow-sky-600/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0 ${isActive ? 'text-white' : 'text-sky-600'}`} />
              <span className="truncate">{srv.label}</span>
              {srv.badge && (
                <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase shrink-0 ${
                  isActive ? 'bg-amber-400 text-slate-950' : 'bg-amber-100 text-amber-700'
                }`}>
                  {srv.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

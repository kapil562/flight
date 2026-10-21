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
    { id: 'flights', label: 'Flights', icon: Plane, tag: null },
    { id: 'hotels', label: 'Stays & Hotels', icon: Building2, tag: null },
    { id: 'holidays', label: 'Holiday Packages', icon: Palmtree, tag: null },
    { id: 'trains', label: 'Trains', icon: Train, tag: null },
    { id: 'visa', label: 'Visa Desk', icon: Globe2, tag: null },
    { id: 'checkin', label: 'Web Check-In', icon: CheckSquare, tag: null, action: onOpenWebCheckIn },
    { id: 'pnr', label: 'Check PNR', icon: Search, tag: null, action: onOpenQuickPnr }
  ];

  const visibleServices = allServices.filter(s => enabledConfig[s.id] !== false);

  if (visibleServices.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-2 sm:pt-4">
      <div className="flex items-center justify-center">
        <div className="bg-slate-200/60 backdrop-blur-xl rounded-full p-1 border border-slate-300/40 shadow-inner flex items-center gap-1 overflow-x-auto scrollbar-none max-w-full">
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
                className={`flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full font-black text-xs sm:text-sm transition-all duration-200 whitespace-nowrap cursor-pointer shrink-0 relative active:scale-95 ${
                  isActive
                    ? 'text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeServiceTabPill"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                    className="absolute inset-0 bg-slate-950 rounded-full shadow-md -z-0"
                  />
                )}
                <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 relative z-10 transition-colors ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span className="tracking-tight relative z-10">{srv.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

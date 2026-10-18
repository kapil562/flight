import React from 'react';
import { motion } from 'motion/react';
import { Plane, Building2, Palmtree, Train, Globe2, CheckSquare, Search } from 'lucide-react';

export default function ServiceTabs({ activeService, onSelectService, onOpenQuickPnr, onOpenWebCheckIn }) {
  const services = [
    { id: 'flights', label: 'Flights', icon: Plane, badge: null },
    { id: 'hotels', label: 'Hotels', icon: Building2, badge: 'HOT' },
    { id: 'holidays', label: 'Holidays', icon: Palmtree, badge: 'OFFERS' },
    { id: 'trains', label: 'Trains', icon: Train, badge: null },
    { id: 'visa', label: 'Visa Services', icon: Globe2, badge: 'FAST' },
    { id: 'checkin', label: 'Web Check-In', icon: CheckSquare, badge: null, action: onOpenWebCheckIn },
    { id: 'pnr', label: 'Check PNR', icon: Search, badge: null, action: onOpenQuickPnr }
  ];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 -mb-3 sm:-mb-5 relative z-20">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl p-1.5 sm:p-2 shadow-xl border border-slate-200/90 flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none">
        {services.map((srv) => {
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
              className={`flex items-center gap-2 px-3.5 sm:px-5 py-2.5 rounded-xl sm:rounded-2xl font-extrabold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer shrink-0 relative ${
                isActive
                  ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-md shadow-sky-600/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${isActive ? 'text-white' : 'text-sky-600'}`} />
              <span>{srv.label}</span>
              {srv.badge && (
                <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase ${
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

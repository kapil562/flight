import React from 'react';
import { motion } from 'motion/react';
import { Plane, Building2, Palmtree, Ticket, User } from 'lucide-react';

export default function BottomNav({ activeService, onSelectService, onOpenMyBookings, onOpenManageProfile, onOpenAuth, currentUser, settings = null, brand = null }) {
  const enabledConfig = {
    flights: true,
    hotels: true,
    holidays: true,
    ...(settings?.enabledServices || brand?.enabledServices || {})
  };

  const allNavItems = [
    {
      id: 'flights',
      label: 'Flights',
      icon: Plane,
      action: () => {
        onSelectService('flights');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    {
      id: 'hotels',
      label: 'Stays',
      icon: Building2,
      action: () => {
        onSelectService('hotels');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    {
      id: 'holidays',
      label: 'Holidays',
      icon: Palmtree,
      badge: null,
      action: () => {
        onSelectService('holidays');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    {
      id: 'bookings',
      label: 'Trips',
      icon: Ticket,
      action: onOpenMyBookings
    },
    {
      id: 'profile',
      label: currentUser ? (currentUser.name ? currentUser.name.split(' ')[0] : 'Profile') : 'Sign In',
      icon: User,
      action: currentUser ? (onOpenManageProfile || onOpenMyBookings) : onOpenAuth,
      isUser: !!currentUser
    }
  ];

  const navItems = allNavItems.filter(item => {
    if (item.id === 'flights') return enabledConfig.flights !== false;
    if (item.id === 'hotels') return enabledConfig.hotels !== false;
    if (item.id === 'holidays') return enabledConfig.holidays !== false;
    return true;
  });

  return (
    <nav className="md:hidden fixed bottom-3 left-4 right-4 z-40 bg-white/90 backdrop-blur-2xl border border-slate-200/90 rounded-3xl px-2 py-2 flex justify-around items-center shadow-[0_12px_40px_rgba(0,0,0,0.12)]">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeService === item.id;

        return (
          <button
            key={item.id}
            onClick={item.action}
            className={`flex-1 flex flex-col items-center justify-center py-1 relative text-center cursor-pointer transition-all active:scale-90 ${
              isActive ? 'text-slate-900 font-black' : 'text-slate-400 font-bold'
            }`}
          >
            {item.isUser && (currentUser?.avatar || currentUser?.photoURL) ? (
              <div className="relative mb-0.5">
                <img
                  src={currentUser.avatar || currentUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || 'User')}&background=0f172a&color=fff`}
                  alt={currentUser.name}
                  className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-300"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 ring-1 ring-white" />
              </div>
            ) : (
              <div className={`p-1 rounded-xl transition-all mb-0.5 ${isActive ? 'bg-slate-100 text-slate-900' : 'text-slate-500'}`}>
                <Icon className="w-4 h-4" />
              </div>
            )}

            <span className="text-[10px] tracking-tight leading-none">
              {item.label}
            </span>

            {isActive && (
              <div className="w-1 h-1 rounded-full bg-slate-900 mt-0.5" />
            )}
          </button>
        );
      })}
    </nav>
  );
}

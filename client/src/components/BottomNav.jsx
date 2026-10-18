import React from 'react';
import { motion } from 'motion/react';
import { Plane, Building2, Palmtree, Ticket, User } from 'lucide-react';

export default function BottomNav({ activeService, onSelectService, onOpenMyBookings, onOpenAuth, currentUser, settings = null, brand = null }) {
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
      label: 'Hotels',
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
      badge: 'DEALS',
      action: () => {
        onSelectService('holidays');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    {
      id: 'bookings',
      label: 'My Trips',
      icon: Ticket,
      action: onOpenMyBookings
    },
    {
      id: 'profile',
      label: currentUser ? (currentUser.name ? currentUser.name.split(' ')[0] : 'Profile') : 'Login',
      icon: User,
      action: onOpenAuth,
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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 px-1 py-1.5 flex justify-around items-center shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeService === item.id;

        return (
          <button
            key={item.id}
            onClick={item.action}
            className="flex-1 flex flex-col items-center justify-center py-1 relative text-center cursor-pointer transition-transform active:scale-90"
          >
            {item.badge && (
              <span className="absolute -top-1 right-2 sm:right-3 bg-amber-500 text-slate-950 text-[8px] font-black px-1 rounded-full">
                {item.badge}
              </span>
            )}

            {item.isUser && currentUser?.avatar ? (
              <div className="relative">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-5 h-5 rounded-full object-cover border border-sky-500"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white" />
              </div>
            ) : (
              <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-sky-50 text-sky-600' : 'text-slate-500'}`}>
                <Icon className="w-5 h-5" />
              </div>
            )}

            <span
              className={`text-[10px] font-bold mt-0.5 tracking-tight ${
                isActive ? 'text-sky-600 font-extrabold' : 'text-slate-500'
              }`}
            >
              {item.label}
            </span>

            {/* Active dot indicator */}
            {isActive && (
              <motion.div
                layoutId="activeTabIndicator"
                className="w-1.5 h-1.5 rounded-full bg-sky-600 mt-0.5"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}

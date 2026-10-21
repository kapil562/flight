import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plane, 
  Building2, 
  Palmtree, 
  Train, 
  Globe2, 
  Ticket, 
  User, 
  LogOut, 
  ChevronDown, 
  Menu, 
  X, 
  Sparkles, 
  Search, 
  CheckSquare, 
  Phone, 
  ShieldCheck, 
  ArrowRight,
  Compass,
  Radio
} from 'lucide-react';

export default function Navbar({
  activeService = 'flights',
  onSelectService,
  onOpenQuickPnr,
  onOpenWebCheckIn,
  onOpenMyBookings,
  onOpenManageProfile,
  onOpenAuth,
  currentUser,
  onLogout,
  settings = {},
  brand = null
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userMenuRef = useRef(null);

  const siteName = brand?.name || settings.siteName || 'AIR SKY';
  const announcement = settings.announcement;
  const helplinePhone = brand?.phone || '+91 72248 28030';

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const [enabledServices, setEnabledServices] = useState(() => {
    return settings?.enabledServices || brand?.enabledServices || (() => {
      try {
        const saved = localStorage.getItem('asg_services');
        return saved ? JSON.parse(saved) : null;
      } catch { return null; }
    })() || {
      flights: true,
      hotels: true,
      holidays: true,
      trains: false,
      visa: true,
      checkin: true,
      pnr: true
    };
  });

  useEffect(() => {
    if (settings?.enabledServices || brand?.enabledServices) {
      setEnabledServices(settings?.enabledServices || brand?.enabledServices);
    }
  }, [settings?.enabledServices, brand?.enabledServices]);

  const allNavItems = [
    { id: 'flights', label: 'Flights', icon: Plane },
    { id: 'hotels', label: 'Hotels', icon: Building2 },
    { id: 'holidays', label: 'Holidays', icon: Palmtree },
    { id: 'trains', label: 'Trains', icon: Train },
    { id: 'visa', label: 'Visa Desk', icon: Globe2 }
  ];

  const navItems = allNavItems.filter(item => enabledServices[item.id] !== false);

  return (
    <header className="sticky top-0 z-50 w-full transition-all duration-300">
      
      {/* Top Subtle Luxury Live Strip */}
      <div className="bg-slate-950/95 text-white text-[11px] py-1.5 px-4 sm:px-8 border-b border-white/10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between font-medium">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>LIVE GDS</span>
            </span>
            <span className="truncate text-slate-300 font-medium">
              {announcement?.text || 'Flat ₹500 Instant Discount with code AIRSKY500 • 100% Verified GDS Seats'}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-xs text-slate-300">
            <a href={`tel:${helplinePhone.replace(/\s+/g, '')}`} className="hover:text-white transition-colors flex items-center gap-1.5 font-bold">
              <Phone className="w-3 h-3 text-emerald-400" />
              <span>{helplinePhone}</span>
            </a>
            <span className="text-white/20">•</span>
            <button
              type="button"
              onClick={onOpenWebCheckIn}
              className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-slate-300 hover:text-emerald-400 font-bold"
            >
              <CheckSquare className="w-3 h-3 text-emerald-400" />
              <span>Web Check-In</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modern Floating Island Glass Dock Header */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-2 sm:pt-3 pb-2">
        <div className="bg-white/90 backdrop-blur-2xl border border-slate-200/90 rounded-2xl sm:rounded-full px-4 sm:px-6 py-2.5 sm:py-3 shadow-[0_10px_35px_rgba(15,23,42,0.06)] flex items-center justify-between transition-all">
          
          {/* Brand Identity / Logo */}
          <motion.div 
            onClick={() => onSelectService('flights')} 
            className="flex items-center gap-3 cursor-pointer select-none shrink-0"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            {brand?.logo ? (
              <img
                src={brand.logo}
                alt={brand.name || 'Brand Logo'}
                className="h-8 sm:h-9 w-auto max-w-[150px] object-contain drop-shadow-xs"
              />
            ) : (
              <div className="flex items-center gap-2.5">
                <div 
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white bg-slate-950 shadow-md border border-white/10"
                >
                  <Plane className="w-4 h-4 rotate-45 transform text-white" />
                </div>
                <div>
                  <div className="text-lg sm:text-xl font-black tracking-tight text-slate-950 leading-none">
                    {brand?.name || siteName}
                  </div>
                  <span className="block text-[9px] font-black text-slate-400 tracking-widest uppercase mt-0.5">
                    {brand?.tagline || settings.siteTagline || 'Aviation & Travel'}
                  </span>
                </div>
              </div>
            )}
          </motion.div>

          {/* Desktop Capsule Service Switcher */}
          <nav className="hidden lg:flex items-center p-1 rounded-full bg-slate-100/90 border border-slate-200/70 shadow-inner">
            {navItems.map(item => {
              const Icon = item.icon;
              const isSelected = activeService === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectService(item.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 relative ${
                    isSelected
                      ? 'bg-slate-950 text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-white/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Utilities Dock */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Quick PNR Lookup Pill */}
            {enabledServices.pnr !== false && (
              <button
                type="button"
                onClick={onOpenQuickPnr}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-700 bg-slate-100/80 hover:bg-slate-200/80 border border-slate-200 transition-all cursor-pointer"
              >
                <Search className="w-3.5 h-3.5 text-slate-500" />
                <span>Check PNR</span>
              </button>
            )}

            {/* My Trips */}
            <button
              type="button"
              onClick={onOpenMyBookings}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-700 bg-slate-100/80 hover:bg-slate-200/80 border border-slate-200 transition-all cursor-pointer"
            >
              <Ticket className="w-3.5 h-3.5 text-emerald-600" />
              <span>My Trips</span>
            </button>

            {/* User Profile / Sign In Pill */}
            {currentUser ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1 pr-3 rounded-full border border-slate-200 bg-white hover:border-slate-300 shadow-xs transition-all cursor-pointer"
                >
                  <img
                    src={currentUser.avatar || currentUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || 'User')}&background=020617&color=fff&bold=true`}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover ring-2 ring-slate-100"
                  />
                  <div className="text-left hidden md:block">
                    <div className="text-xs font-black text-slate-900 leading-none truncate max-w-[90px]">
                      {currentUser.name}
                    </div>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-60 bg-white rounded-3xl shadow-2xl border border-slate-200/90 py-3 z-50 overflow-hidden"
                    >
                      <div className="px-4 pb-3 border-b border-slate-100">
                        <p className="text-xs font-black text-slate-900 truncate">{currentUser.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{currentUser.email || currentUser.phone}</p>
                      </div>

                      <div className="p-2 space-y-1">
                        <button
                          type="button"
                          onClick={() => { if (onOpenManageProfile) onOpenManageProfile(); setUserDropdownOpen(false); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                        >
                          <User className="w-4 h-4 text-slate-700" />
                          <span>Frequent Flyer Profile</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => { onOpenMyBookings(); setUserDropdownOpen(false); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                        >
                          <Ticket className="w-4 h-4 text-emerald-600" />
                          <span>My Bookings</span>
                        </button>
                        <div className="h-px bg-slate-100 my-1" />
                        <button
                          type="button"
                          onClick={() => { if (onLogout) onLogout(); setUserDropdownOpen(false); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        >
                          <LogOut className="w-4 h-4 text-rose-600" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onOpenAuth}
                className="px-4 sm:px-5 py-2 rounded-full bg-slate-950 hover:bg-black text-white font-black text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </motion.button>
            )}

            {/* Mobile Menu Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-full bg-slate-100 text-slate-800 hover:bg-slate-200 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden mx-3 bg-white/95 backdrop-blur-2xl border border-slate-200 rounded-3xl p-4 shadow-2xl space-y-2 overflow-hidden mb-3"
          >
            <div className="grid grid-cols-2 gap-2 pb-2">
              {navItems.map(item => {
                const Icon = item.icon;
                const isSelected = activeService === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { onSelectService(item.id); setMobileMenuOpen(false); }}
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                      isSelected ? 'bg-slate-950 text-white shadow-sm' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-1.5">
              <button
                onClick={() => { onOpenQuickPnr(); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100"
              >
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-slate-600" />
                  <span>Check PNR Status</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => { onOpenWebCheckIn(); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100"
              >
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-emerald-600" />
                  <span>Airline Web Check-In</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => { onOpenMyBookings(); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100"
              >
                <div className="flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-emerald-600" />
                  <span>My Trips & Boarding Passes</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

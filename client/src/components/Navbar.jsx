import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Plane, Building2, Palmtree, Train, Globe2, Ticket, User, LogOut, ChevronDown, Menu, X, Sparkles, Award, Search, CheckSquare, Phone, ShieldCheck, ArrowRight, Compass } from 'lucide-react';

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
  const [mobileUserDropdownOpen, setMobileUserDropdownOpen] = useState(false);
  const userMenuRef = useRef(null);
  const mobileUserMenuRef = useRef(null);

  const siteName = brand?.name || settings.siteName || 'AIR SKY';
  const announcement = settings.announcement;
  const helplinePhone = brand?.phone || '+91 72248 28030';

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
      if (mobileUserMenuRef.current && !mobileUserMenuRef.current.contains(e.target)) {
        setMobileUserDropdownOpen(false);
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
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-slate-200/60 shadow-[0_4px_30px_rgba(15,23,42,0.03)] transition-all">
      
      {/* Top Subtle Luxury Ticker Strip */}
      <div className="bg-slate-900 text-white text-[11px] py-1 px-4 sm:px-8 flex items-center justify-between font-medium">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="truncate text-slate-300 font-medium">
            {announcement?.text || 'Flat ₹500 Instant Discount with code AIRSKY500 • 100% Verified GDS Seats'}
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-4 text-xs text-slate-300">
          <a href={`tel:${helplinePhone.replace(/\s+/g, '')}`} className="hover:text-white transition-colors flex items-center gap-1.5 font-bold">
            <Phone className="w-3 h-3 text-sky-400" />
            <span>{helplinePhone}</span>
          </a>
          <span className="text-slate-700">|</span>
          <button
            type="button"
            onClick={onOpenWebCheckIn}
            className="hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-emerald-400 font-bold"
          >
            <CheckSquare className="w-3 h-3" />
            <span>Web Check-In</span>
          </button>
        </div>
      </div>

      {/* Main Glass Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Brand Identity */}
          <motion.div 
            onClick={() => onSelectService('flights')} 
            className="flex items-center gap-3 cursor-pointer select-none"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            {brand?.logo ? (
              <img
                src={brand.logo}
                alt={brand.name || 'Brand Logo'}
                className="h-8 sm:h-10 w-auto max-w-[160px] object-contain drop-shadow-xs"
              />
            ) : (
              <div className="flex items-center gap-2.5">
                <div 
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md shadow-sky-600/20"
                  style={{ background: brand?.primary_color || 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}
                >
                  <Plane className="w-5 h-5 rotate-45 transform text-sky-400" />
                </div>
                <div>
                  <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 leading-none">
                    {brand?.name || siteName}
                  </span>
                  <span className="block text-[10px] font-bold text-slate-400 tracking-widest uppercase mt-0.5">
                    {brand?.tagline || settings.siteTagline || 'Aviation & Travel'}
                  </span>
                </div>
              </div>
            )}
          </motion.div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map(item => {
              const Icon = item.icon;
              const isSelected = activeService === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectService(item.id)}
                  className={`px-3.5 py-2 rounded-full text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-sky-400' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {enabledServices.pnr !== false && (
              <button
                onClick={onOpenQuickPnr}
                className="px-3.5 py-2 rounded-full text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Search className="w-3.5 h-3.5 text-amber-500" />
                <span>Check PNR</span>
              </button>
            )}

            <button
              onClick={onOpenMyBookings}
              className="px-3.5 py-2 rounded-full text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Ticket className="w-3.5 h-3.5 text-emerald-600" />
              <span>My Trips</span>
            </button>
          </nav>

          {/* Right Controls: Currency Pill + User Profile */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100/80 text-slate-700 text-xs font-mono font-bold border border-slate-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>{settings.currency || '₹'} {settings.currencyCode || 'INR'}</span>
            </div>

            {currentUser ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1 pr-3 rounded-full border border-slate-200 bg-white hover:border-slate-300 shadow-xs transition-all cursor-pointer"
                >
                  <img
                    src={currentUser.avatar || currentUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || 'User')}&background=0f172a&color=fff&bold=true`}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-200"
                  />
                  <div className="text-left hidden lg:block">
                    <div className="text-xs font-black text-slate-800 leading-none truncate max-w-[100px]">
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
                      className="absolute right-0 mt-3 w-64 bg-white rounded-3xl shadow-2xl border border-slate-200/90 py-3 z-50 overflow-hidden"
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
                          <User className="w-4 h-4 text-sky-600" />
                          <span>Account Settings</span>
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
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onOpenAuth}
                className="px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-black text-xs shadow-md shadow-slate-900/15 transition-all cursor-pointer flex items-center gap-2"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </motion.button>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
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
            className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-2xl px-5 pt-4 pb-6 space-y-2 shadow-2xl"
          >
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => { onSelectService(item.id); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black text-slate-800 bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <Icon className="w-4 h-4 text-sky-600" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            <div className="pt-2 border-t border-slate-100 space-y-2">
              <button
                onClick={() => { onOpenQuickPnr(); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                <div className="flex items-center gap-2.5">
                  <Search className="w-4 h-4 text-amber-500" />
                  <span>Check PNR Status</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => { onOpenWebCheckIn(); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                <div className="flex items-center gap-2.5">
                  <CheckSquare className="w-4 h-4 text-emerald-600" />
                  <span>Airline Web Check-In</span>
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

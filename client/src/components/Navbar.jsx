import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Plane, Building2, Palmtree, Train, Globe2, Ticket, User, LogOut, ChevronDown, Menu, X, Sparkles, Award, Search, CheckSquare, Phone, ShieldCheck, ArrowRight } from 'lucide-react';

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

  // Services enabled/disabled config (Synced with Admin Panel)
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
      trains: false, // Default trains OFF
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

  useEffect(() => {
    const handleUpdate = (e) => {
      if (e.detail?.enabledServices) {
        setEnabledServices(e.detail.enabledServices);
      } else {
        try {
          const saved = localStorage.getItem('asg_services');
          if (saved) setEnabledServices(JSON.parse(saved));
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

  const allNavItems = [
    { id: 'flights', label: 'Flights', icon: Plane },
    { id: 'hotels', label: 'Hotels', icon: Building2 },
    { id: 'holidays', label: 'Holidays', icon: Palmtree },
    { id: 'trains', label: 'Trains', icon: Train },
    { id: 'visa', label: 'Visa', icon: Globe2 }
  ];

  const navItems = allNavItems.filter(item => enabledServices[item.id] !== false);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_4px_24px_rgba(15,23,42,0.04)] transition-all">
      
      {/* Top Luxury Announcement & Customer Support Strip */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-sky-950 text-white text-[11px] py-1.5 px-3 sm:px-6 flex items-center justify-between font-medium tracking-wide border-b border-white/5">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <span className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-[9px] uppercase font-black px-2 py-0.5 rounded-full shadow-xs shrink-0 tracking-wider">
            EXCLUSIVE
          </span>
          <span className="truncate max-w-[58vw] sm:max-w-none text-slate-200 font-semibold">
            {announcement?.text || '🎉 Special Discount: Flat ₹500 OFF with code AIRSKY500! Zero Convenience Fee.'}
          </span>
        </div>

        {/* 24x7 Customer Helpline & Quick Utility Links */}
        <div className="hidden sm:flex items-center gap-3.5 shrink-0 text-slate-300 text-xs">
          <Link to="/about" className="hover:text-amber-300 transition-colors">
            About
          </Link>
          <span className="text-slate-700">•</span>
          <a href={`tel:${helplinePhone.replace(/\s+/g, '')}`} className="hover:text-amber-300 transition-colors flex items-center gap-1.5 group">
            <Phone className="w-3 h-3 text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="font-semibold">{helplinePhone} (24x7)</span>
          </a>
          <span className="text-slate-700">•</span>
          <Link to="/contact" className="hover:text-amber-300 transition-colors">
            Support Desk
          </Link>
          {enabledServices.checkin !== false && (
            <>
              <span className="text-slate-700">•</span>
              <button
                type="button"
                onClick={onOpenWebCheckIn}
                className="hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-emerald-400 font-semibold"
              >
                <CheckSquare className="w-3 h-3" />
                <span>Web Check-In</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Navbar Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-[58px] sm:min-h-[66px] py-1.5">
          
          {/* Brand Logo & Tagline */}
          <motion.div 
            onClick={() => onSelectService('flights')} 
            className="flex items-center gap-2.5 sm:gap-3.5 cursor-pointer group select-none"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            {brand?.logo ? (
              <img
                src={brand.logo}
                alt={brand.name || 'Brand Logo'}
                className="h-8 sm:h-9 md:h-10 max-h-[42px] w-auto max-w-[130px] sm:max-w-[155px] md:max-w-[180px] object-contain drop-shadow-xs"
              />
            ) : (
              <>
                <motion.div 
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-sky-600/20 relative overflow-hidden"
                  style={{ background: brand?.primary_color || 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)' }}
                  whileHover={{ rotate: 12, scale: 1.06 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Plane className="w-5 h-5 rotate-45 transform" />
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                </motion.div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="text-lg sm:text-2xl font-black tracking-tight leading-none bg-gradient-to-r from-slate-900 to-slate-800 bg-clip-text"
                      style={{ color: brand?.brand_text_color || '#0f172a' }}
                    >
                      {brand?.name || siteName}
                    </span>
                    <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <p
                    className="text-[10px] font-bold tracking-wider hidden sm:block truncate max-w-xs uppercase mt-0.5"
                    style={{ color: brand?.tagline_color || '#64748b' }}
                  >
                    {brand?.tagline || settings.siteTagline || 'Luxury Aviation & Fast Bookings'}
                  </p>
                </div>
              </>
            )}
          </motion.div>

          {/* Desktop Multi-Service Navigation Dock */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/90 shadow-xs backdrop-blur-md">
            {navItems.map(item => {
              const Icon = item.icon;
              const isSelected = activeService === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectService(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all duration-200 cursor-pointer relative ${
                    isSelected
                      ? 'bg-white text-sky-700 shadow-sm shadow-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 transition-colors ${isSelected ? 'text-sky-600' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                  {isSelected && (
                    <motion.div
                      layoutId="navDockIndicator"
                      className="absolute -bottom-1 left-3 right-3 h-0.5 bg-sky-600 rounded-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}

            {enabledServices.pnr !== false && (
              <>
                <div className="w-px h-5 bg-slate-300/80 mx-1.5" />
                {/* Check PNR Button */}
                <button
                  onClick={onOpenQuickPnr}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-sky-700 hover:bg-white/70 transition-all cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5 text-amber-500" />
                  <span>Check PNR</span>
                </button>
              </>
            )}

            <div className="w-px h-5 bg-slate-300/80 mx-1.5" />

            {/* My Trips */}
            <button
              onClick={onOpenMyBookings}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-sky-700 hover:bg-white/70 transition-all cursor-pointer"
            >
              <Ticket className="w-3.5 h-3.5 text-emerald-600" />
              <span>My Trips</span>
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* Currency Pill */}
            <div className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-slate-100/90 text-slate-700 rounded-xl border border-slate-200 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{settings.currency || '₹'} {settings.currencyCode || 'INR'}</span>
            </div>

            {/* User Profile Dropdown or Login CTA */}
            {currentUser ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1 pr-3 rounded-2xl border border-slate-200 bg-white hover:border-sky-400 shadow-xs hover:shadow-md transition-all cursor-pointer"
                >
                  <img
                    src={currentUser.avatar || currentUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || 'User')}&background=0284c7&color=fff&bold=true`}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-xl object-cover ring-2 ring-sky-500/30"
                  />
                  <div className="text-left hidden xl:block">
                    <div className="text-xs font-black text-slate-800 leading-none truncate max-w-[110px]">
                      {currentUser.name}
                    </div>
                    <div className="text-[10px] text-amber-600 font-bold flex items-center gap-1 mt-0.5">
                      <Award className="w-2.5 h-2.5" />
                      <span>{currentUser.tier || 'SkyClub VIP'}</span>
                    </div>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Profile Dropdown */}
                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2.5 w-68 bg-white rounded-2xl shadow-2xl border border-slate-200/90 py-2 z-50 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-sky-50/50">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-black text-slate-900 truncate">{currentUser.name}</p>
                          <span className="text-[9px] font-black bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">VERIFIED</span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">{currentUser.email || currentUser.phone}</p>
                        <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-800 border border-amber-300/40 text-[10px] font-black">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          <span>{currentUser.points || 2450} SkyMiles Rewards</span>
                        </div>
                      </div>

                      <div className="p-2 space-y-1">
                        <button
                          type="button"
                          onClick={() => { if (onOpenManageProfile) onOpenManageProfile(); setUserDropdownOpen(false); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                        >
                          <User className="w-4 h-4 text-sky-600" />
                          <span>Manage Profile & Frequent Flyers</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => { onOpenMyBookings(); setUserDropdownOpen(false); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                        >
                          <Ticket className="w-4 h-4 text-emerald-600" />
                          <span>My Bookings & Invoices</span>
                        </button>

                        <div className="h-px bg-slate-100 my-1" />

                        <button
                          type="button"
                          onClick={() => { if (onLogout) onLogout(); setUserDropdownOpen(false); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        >
                          <LogOut className="w-4 h-4 text-rose-600" />
                          <span>Logout</span>
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
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 text-white font-black text-xs shadow-md shadow-sky-600/25 hover:shadow-sky-600/40 transition-all cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>Login / Sign Up</span>
              </motion.button>
            )}
          </div>

          {/* Mobile Right Controls: Login Avatar + Menu Toggle */}
          <div className="flex lg:hidden items-center gap-2">
            {!currentUser ? (
              <button
                type="button"
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600 text-white font-black text-xs shadow-xs cursor-pointer active:scale-95"
              >
                <User className="w-3.5 h-3.5" />
                <span>Login</span>
              </button>
            ) : (
              <div className="relative" ref={mobileUserMenuRef}>
                <button
                  type="button"
                  onClick={() => setMobileUserDropdownOpen(!mobileUserDropdownOpen)}
                  className="flex items-center gap-1.5 p-0.5 rounded-full ring-2 ring-sky-500 cursor-pointer active:scale-95 shadow-xs"
                  title="My Account"
                >
                  <img
                    src={currentUser.avatar || currentUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || 'User')}&background=0284c7&color=fff&bold=true`}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                </button>

                {/* Mobile User Popover */}
                <AnimatePresence>
                  {mobileUserDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 overflow-hidden"
                    >
                      <div className="px-3.5 py-2.5 border-b border-slate-100 bg-slate-50">
                        <p className="text-xs font-black text-slate-900 leading-tight">{currentUser.name || 'My Account'}</p>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">{currentUser.email || currentUser.phone}</p>
                      </div>

                      <div className="p-1.5 space-y-0.5">
                        <button
                          type="button"
                          onClick={() => { if (onOpenManageProfile) onOpenManageProfile(); setMobileUserDropdownOpen(false); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                        >
                          <User className="w-3.5 h-3.5 text-sky-600" />
                          <span>Manage Profile</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => { onOpenMyBookings(); setMobileUserDropdownOpen(false); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                        >
                          <Ticket className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Manage Booking</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => { if (onLogout) onLogout(); setMobileUserDropdownOpen(false); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5 text-rose-600" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer active:scale-95 transition-all"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-slate-200 bg-white/98 backdrop-blur-xl px-4 pt-3 pb-6 space-y-1.5 overflow-hidden shadow-2xl"
          >
            {/* User Greeting Card in Mobile Drawer */}
            {currentUser && (
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-50 to-sky-50 rounded-2xl border border-slate-100 mb-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={currentUser.avatar || currentUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || 'User')}&background=0284c7&color=fff&bold=true`}
                    alt={currentUser.name}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-sky-500/40 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-black text-slate-900 truncate">{currentUser.name || 'Account'}</div>
                    <div className="text-[10px] text-slate-500 truncate">{currentUser.email || currentUser.phone}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { if (onLogout) onLogout(); setMobileMenuOpen(false); }}
                  className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-black flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            )}

            {/* Service Nav Buttons */}
            <div className="grid grid-cols-2 gap-1.5">
              {navItems.map(item => {
                const Icon = item.icon;
                const isSelected = activeService === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { onSelectService(item.id); setMobileMenuOpen(false); }}
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-black transition-all ${
                      isSelected ? 'bg-sky-600 text-white shadow-sm' : 'bg-slate-50 text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-sky-600'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-1">
              {enabledServices.pnr !== false && (
                <button
                  onClick={() => { onOpenQuickPnr(); setMobileMenuOpen(false); }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 hover:bg-slate-50 cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Search className="w-4 h-4 text-amber-500" />
                    <span>Check PNR Status</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              )}

              {enabledServices.checkin !== false && (
                <button
                  onClick={() => { onOpenWebCheckIn(); setMobileMenuOpen(false); }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 hover:bg-slate-50 cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <CheckSquare className="w-4 h-4 text-emerald-600" />
                    <span>Web Check-In Terminal</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              )}

              <button
                onClick={() => { onOpenMyBookings(); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 hover:bg-slate-50 cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Ticket className="w-4 h-4 text-sky-600" />
                  <span>My Trips & Tickets</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>

            <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-1.5 text-center">
              <Link
                to="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-[11px] font-bold text-slate-700"
              >
                About Us
              </Link>
              <Link
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-[11px] font-bold text-slate-700"
              >
                Support 24x7
              </Link>
              <Link
                to="/terms"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-[11px] font-bold text-slate-700"
              >
                Terms
              </Link>
            </div>

            {/* Mobile Auth Button */}
            {!currentUser && (
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { onOpenAuth(); setMobileMenuOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-black bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-md cursor-pointer"
                >
                  <User className="w-4 h-4" />
                  <span>Login / Register Account</span>
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Plane, Building2, Palmtree, Train, Globe2, Ticket, User, LogOut, ChevronDown, Menu, X, Sparkles, Award, Search, CheckSquare, Phone } from 'lucide-react';

export default function Navbar({
  activeService = 'flights',
  onSelectService,
  onOpenQuickPnr,
  onOpenWebCheckIn,
  onOpenMyBookings,
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

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
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
      trains: false, // Default trains OFF as requested
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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      
      {/* Top Announcement & Customer Support Bar (Moyatri Style) */}
      <div className="bg-gradient-to-r from-sky-800 via-blue-900 to-indigo-950 text-white text-[10px] sm:text-xs py-1.5 px-3 sm:px-6 flex items-center justify-between font-semibold tracking-wide">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="bg-amber-400 text-slate-950 text-[9px] uppercase font-black px-1.5 py-0.2 rounded shrink-0">
            OFFER
          </span>
          <span className="truncate max-w-[55vw] sm:max-w-none">
            {announcement?.text || '🎉 Special Discount: Flat ₹500 OFF with code MOYATRI500!'}
          </span>
        </div>

        {/* 24x7 Customer Helpline & Company Links */}
        <div className="hidden sm:flex items-center gap-3 shrink-0 text-slate-200">
          <Link to="/about" className="hover:text-amber-300 transition-colors">
            About Us
          </Link>
          <span className="text-slate-500">|</span>
          <Link to="/contact" className="hover:text-amber-300 transition-colors flex items-center gap-1">
            <Phone className="w-3 h-3 text-amber-400" />
            <span>24x7 Support</span>
          </Link>
          <span className="text-slate-500">|</span>
          <Link to="/terms" className="hover:text-amber-300 transition-colors">
            Terms
          </Link>
          {enabledServices.checkin !== false && (
            <>
              <span className="text-slate-500">|</span>
              <button
                type="button"
                onClick={onOpenWebCheckIn}
                className="hover:text-white transition-colors cursor-pointer flex items-center gap-1"
              >
                <CheckSquare className="w-3 h-3 text-emerald-400" />
                <span>Web Check-In</span>
              </button>
            </>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Logo & Brand Identity */}
          <motion.div 
            onClick={() => onSelectService('flights')} 
            className="flex items-center gap-3 cursor-pointer group select-none"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {brand?.logo ? (
              <img
                src={brand.logo}
                alt={brand.name || 'Brand Logo'}
                className="h-10 sm:h-12 w-auto max-w-[170px] object-contain rounded-lg"
              />
            ) : (
              <motion.div 
                className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-lg"
                style={{ background: brand?.primary_color || '#ff6d01' }}
                whileHover={{ rotate: 15, scale: 1.08 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Plane className="w-6 h-6 rotate-45 transform" />
              </motion.div>
            )}
            <div>
              <div className="flex items-center gap-1.5">
                <span
                  className="text-2xl font-black tracking-tight"
                  style={{ color: brand?.brand_text_color || '#0B1F3A' }}
                >
                  {brand?.name || siteName}
                </span>
              </div>
              <p
                className="text-[11px] font-bold tracking-wide hidden sm:block truncate max-w-xs uppercase"
                style={{ color: brand?.tagline_color || '#6b7280' }}
              >
                {brand?.tagline || settings.siteTagline || 'Premium Luxury Travel'}
              </p>
            </div>
          </motion.div>

          {/* Desktop Multi-Service Navigation Tabs (Moyatri Style) */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80">
            {navItems.map(item => {
              const Icon = item.icon;
              const isSelected = activeService === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectService(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? 'bg-white text-sky-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-sky-600' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {enabledServices.pnr !== false && (
              <>
                <div className="w-px h-5 bg-slate-300 mx-1" />
                {/* Check PNR Button */}
                <button
                  onClick={onOpenQuickPnr}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold text-slate-700 hover:text-sky-700 hover:bg-white/60 transition-all cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5 text-amber-500" />
                  <span>Check PNR</span>
                </button>
              </>
            )}

            <div className="w-px h-5 bg-slate-300 mx-1" />

            {/* My Bookings */}
            <button
              onClick={onOpenMyBookings}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold text-slate-700 hover:text-sky-700 hover:bg-white/60 transition-all cursor-pointer"
            >
              <Ticket className="w-3.5 h-3.5 text-emerald-600" />
              <span>My Trips</span>
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Currency Pill */}
            <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl border border-slate-200 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{settings.currency || '₹'} {settings.currencyCode || 'INR'}</span>
            </div>

            {/* User Profile or Login CTA */}
            {currentUser ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl border border-slate-200 bg-white hover:border-sky-400 shadow-xs transition-all cursor-pointer"
                >
                  <img
                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-xl object-cover border border-sky-500"
                  />
                  <div className="text-left hidden xl:block">
                    <div className="text-xs font-bold text-slate-800 leading-none truncate max-w-[110px]">
                      {currentUser.name}
                    </div>
                    <div className="text-[10px] text-amber-600 font-semibold flex items-center gap-1 mt-0.5">
                      <Award className="w-2.5 h-2.5" />
                      <span>{currentUser.tier || 'SkyClub'}</span>
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Profile Dropdown */}
                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70">
                        <p className="text-xs font-extrabold text-slate-900">{currentUser.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{currentUser.email || currentUser.phone}</p>
                        <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          <span>{currentUser.points || 2450} SkyMiles Points</span>
                        </div>
                      </div>

                      <div className="p-1 space-y-0.5">
                        <button
                          type="button"
                          onClick={() => { onOpenMyBookings(); setUserDropdownOpen(false); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                        >
                          <Ticket className="w-4 h-4 text-emerald-600" />
                          <span>My Bookings & Tickets</span>
                        </button>

                        {enabledServices.pnr !== false && (
                          <button
                            type="button"
                            onClick={() => { onOpenQuickPnr(); setUserDropdownOpen(false); }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                          >
                            <Search className="w-4 h-4 text-amber-500" />
                            <span>Instant PNR Status</span>
                          </button>
                        )}

                        {enabledServices.checkin !== false && (
                          <button
                            type="button"
                            onClick={() => { onOpenWebCheckIn(); setUserDropdownOpen(false); }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                          >
                            <CheckSquare className="w-4 h-4 text-sky-600" />
                            <span>Web Check-In Hub</span>
                          </button>
                        )}
                      </div>

                      <div className="p-1 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => { if (onLogout) onLogout(); setUserDropdownOpen(false); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
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
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 text-white font-extrabold text-xs shadow-md shadow-sky-600/25 hover:from-sky-500 hover:to-blue-500 transition-all cursor-pointer"
              >
                <User className="w-4 h-4" />
                <span>Login / Sign Up</span>
              </motion.button>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex lg:hidden items-center gap-2">
            {!currentUser ? (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600 text-white font-extrabold text-xs shadow-xs"
              >
                <User className="w-3.5 h-3.5" />
                <span>Login</span>
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 p-1 rounded-full border border-sky-500"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover"
                />
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
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
            className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-1 overflow-hidden shadow-lg"
          >
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => { onSelectService(item.id); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold ${
                    activeService === item.id ? 'bg-sky-50 text-sky-700' : 'text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4 text-sky-600" />
                  <span>Book {item.label}</span>
                </button>
              );
            })}

            <div className="pt-2 border-t border-slate-100 space-y-1">
              {enabledServices.pnr !== false && (
                <button
                  onClick={() => { onOpenQuickPnr(); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-800 hover:bg-slate-50 cursor-pointer"
                >
                  <Search className="w-4 h-4 text-amber-500" />
                  <span>Check PNR Status</span>
                </button>
              )}

              {enabledServices.checkin !== false && (
                <button
                  onClick={() => { onOpenWebCheckIn(); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-800 hover:bg-slate-50 cursor-pointer"
                >
                  <CheckSquare className="w-4 h-4 text-emerald-600" />
                  <span>Web Check-In Hub</span>
                </button>
              )}

              <button
                onClick={() => { onOpenMyBookings(); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-800 hover:bg-slate-50 cursor-pointer"
              >
                <Ticket className="w-4 h-4 text-emerald-600" />
                <span>My Bookings & Check-in</span>
              </button>

              <div className="pt-2 border-t border-slate-100 space-y-1">
                <Link
                  to="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-sky-500" />
                  <span>About Us</span>
                </Link>

                <Link
                  to="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  <Phone className="w-4 h-4 text-emerald-500" />
                  <span>Contact Us & 24x7 Support</span>
                </Link>

                <Link
                  to="/terms"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>Terms & Conditions</span>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

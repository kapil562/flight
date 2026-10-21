import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plane, 
  ShieldCheck, 
  Headphones, 
  Zap, 
  CreditCard, 
  Heart, 
  ArrowUpRight, 
  HelpCircle, 
  FileText, 
  Phone, 
  Mail, 
  MapPin, 
  Lock,
  MessageCircle,
  ExternalLink,
  CheckCircle2,
  Globe2
} from 'lucide-react';

export default function Footer({ onSelectRoute, brand: propBrand = null, settings: propSettings = {} }) {
  const [brand, setBrand] = useState(() => {
    try {
      const saved = localStorage.getItem('asg_brand_live');
      return saved ? JSON.parse(saved) : (propBrand || {});
    } catch {
      return propBrand || {};
    }
  });

  useEffect(() => {
    if (propBrand && Object.keys(propBrand).length > 0) {
      setBrand(propBrand);
    }
  }, [propBrand]);

  useEffect(() => {
    const handleUpdate = (e) => {
      if (e.detail) {
        setBrand(prev => ({ ...prev, ...e.detail }));
      } else {
        try {
          const saved = localStorage.getItem('asg_brand_live');
          if (saved) setBrand(JSON.parse(saved));
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

  const defaultDomestic = [
    { from: 'DEL', to: 'BOM', label: 'Delhi to Mumbai' },
    { from: 'DEL', to: 'BLR', label: 'Delhi to Bengaluru' },
    { from: 'BOM', to: 'GOI', label: 'Mumbai to Goa' },
    { from: 'DEL', to: 'GOI', label: 'Delhi to Goa' }
  ];

  const defaultIntl = [
    { from: 'DEL', to: 'DXB', label: 'Delhi to Dubai' },
    { from: 'BLR', to: 'DEL', label: 'Bengaluru to Delhi' },
    { from: 'BOM', to: 'DEL', label: 'Mumbai to Delhi' },
    { from: 'DEL', to: 'HYD', label: 'Delhi to Hyderabad' }
  ];

  const domesticRoutes = brand?.footer?.domesticRoutes
    ? brand.footer.domesticRoutes.split(',').map(item => {
        const parts = item.trim().split(':');
        if (parts.length >= 2) {
          const codes = parts[0].trim().split('-');
          return { from: codes[0]?.trim() || 'DEL', to: codes[1]?.trim() || 'BOM', label: parts[1].trim() };
        }
        return { from: 'DEL', to: 'BOM', label: item.trim() };
      }).filter(r => r.label)
    : defaultDomestic;

  const intlRoutes = brand?.footer?.intlRoutes
    ? brand.footer.intlRoutes.split(',').map(item => {
        const parts = item.trim().split(':');
        if (parts.length >= 2) {
          const codes = parts[0].trim().split('-');
          return { from: codes[0]?.trim() || 'DEL', to: codes[1]?.trim() || 'DXB', label: parts[1].trim() };
        }
        return { from: 'DEL', to: 'DXB', label: item.trim() };
      }).filter(r => r.label)
    : defaultIntl;

  const partnerAirlinesList = brand?.footer?.partnerAirlines
    ? brand.footer.partnerAirlines.split(',').map(s => s.trim()).filter(Boolean)
    : ['IndiGo', 'Air India', 'Vistara', 'Akasa Air', 'SpiceJet', 'Emirates', 'Singapore Airlines'];

  const footerDesc = brand?.footer?.description || brand?.tagline || propSettings?.siteTagline || 'Direct GDS inventory, verified airline PNR issuance, and 24x7 luxury travel concierge.';
  const copyrightText = brand?.footer?.copyright || `© ${new Date().getFullYear()} ${brand?.name || propSettings?.siteName || 'AIR SKY'}. All rights reserved.`;
  const addressText = brand?.address || propSettings?.address || 'Panchsheel Apartment, Flat No. 204, Plot No. 9, Sector 10, Dwarka, Delhi – 110075';
  const phoneText = brand?.phone || propSettings?.supportPhone || '+91 72248 28030';
  const emailText = brand?.email || propSettings?.supportEmail || 'care@airskyindia.com';
  const whatsappNum = (brand?.whatsapp || '918077680310').replace(/\D/g, '');

  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 sm:pt-20 pb-12 border-t border-slate-900 mt-16 sm:mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        
        {/* Top Editorial Banner Pod */}
        <div className="bg-slate-900/60 rounded-3xl p-6 sm:p-10 border border-white/10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-2xl backdrop-blur-md">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-black uppercase tracking-widest text-emerald-400">
                Direct Airline Inventory & GDS Sync
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Curating First-Class Travel & Instant Verified Bookings
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {footerDesc}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <a
              href={`https://wa.me/${whatsappNum}?text=Hi%2C%20I%20need%20assistance%20with%20flight%20booking.`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 sm:flex-initial px-5 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-slate-950 text-emerald-500" />
              <span>WhatsApp Concierge</span>
            </a>

            <a
              href={`tel:${phoneText.replace(/\s+/g, '')}`}
              className="flex-1 sm:flex-initial px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-black text-xs border border-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Phone className="w-4 h-4 text-slate-300" />
              <span>{phoneText}</span>
            </a>
          </div>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
          
          {/* Bento Pod 1: Brand & Corporate HQ */}
          <div className="bg-slate-900/40 rounded-3xl p-6 border border-white/5 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-white text-slate-950 flex items-center justify-center font-black shadow-md">
                  <Plane className="w-4 h-4 rotate-45" />
                </div>
                <div>
                  <h4 className="text-base font-black text-white leading-none">
                    {brand?.name || propSettings?.siteName || 'AIR SKY'}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
                    Aviation Portal
                  </span>
                </div>
              </div>

              <p className="text-slate-400 leading-relaxed text-xs">
                Empowering travellers with real-time airline fares, verified instant PNR generation, and seamless web check-in.
              </p>
            </div>

            <div className="pt-4 border-t border-white/5 space-y-2 text-[11px] text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>{addressText}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <a href={`mailto:${emailText}`} className="text-slate-300 hover:text-white transition-colors">
                  {emailText}
                </a>
              </div>
            </div>
          </div>

          {/* Bento Pod 2: Top Domestic Routes */}
          <div className="bg-slate-900/40 rounded-3xl p-6 border border-white/5 space-y-4">
            <h5 className="font-black text-white uppercase tracking-wider text-xs flex items-center gap-2">
              <Plane className="w-4 h-4 text-slate-400" />
              <span>Popular Flight Corridors</span>
            </h5>

            <div className="space-y-2">
              {domesticRoutes.map(r => (
                <button
                  key={r.label}
                  onClick={() => onSelectRoute(r.from, r.to)}
                  className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all text-left cursor-pointer group border border-white/5"
                >
                  <span className="font-bold text-xs">{r.label}</span>
                  <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400 group-hover:text-emerald-400 font-bold">
                    <span>{r.from} ➔ {r.to}</span>
                    <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Bento Pod 3: Company & Passenger Charter */}
          <div className="bg-slate-900/40 rounded-3xl p-6 border border-white/5 space-y-4">
            <h5 className="font-black text-white uppercase tracking-wider text-xs flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-400" />
              <span>Passenger Charter</span>
            </h5>

            <ul className="space-y-2.5 font-bold">
              <li>
                <Link to="/about" className="text-slate-400 hover:text-white transition-colors flex items-center justify-between">
                  <span>About Our Airline Network</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-600" />
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-slate-400 hover:text-white transition-colors flex items-center justify-between">
                  <span>24x7 Helpdesk & Concierge</span>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-black">ACTIVE</span>
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-slate-400 hover:text-white transition-colors flex items-center justify-between">
                  <span>Terms & Passenger Conditions</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-600" />
                </Link>
              </li>
              <li>
                <Link to="/terms#cancellation" className="text-slate-400 hover:text-white transition-colors flex items-center justify-between">
                  <span>Instant Refund & Cancellation</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-600" />
                </Link>
              </li>
              <li>
                <Link to="/terms#passport" className="text-slate-400 hover:text-white transition-colors flex items-center justify-between">
                  <span>Passport & Visa Protocols</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-600" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Bento Pod 4: Airline Partners & Security */}
          <div className="bg-slate-900/40 rounded-3xl p-6 border border-white/5 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <h5 className="font-black text-white uppercase tracking-wider text-xs flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-slate-400" />
                <span>Partner Airlines</span>
              </h5>

              <div className="flex flex-wrap gap-1.5">
                {partnerAirlinesList.map(a => (
                  <span key={a} className="px-3 py-1 bg-white/5 rounded-full text-slate-300 border border-white/5 font-black text-[10px]">
                    {a}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-white/10 space-y-1.5">
              <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-400 uppercase tracking-wider">
                <Lock className="w-3.5 h-3.5" />
                <span>Bank Encrypted Checkout</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                256-bit SSL encryption for UPI, RuPay, Visa, Mastercard, and net-banking transactions.
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Operational Status */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>All Aviation & GDS Inventory Systems Fully Operational</span>
          </div>

          <div>
            {copyrightText}
          </div>
        </div>

      </div>
    </footer>
  );
}

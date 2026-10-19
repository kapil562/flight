import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plane, ShieldCheck, Headphones, Zap, CreditCard, Heart, ArrowUpRight, HelpCircle, FileText } from 'lucide-react';

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
    { from: 'DEL', to: 'BOM', label: 'Delhi to Mumbai Flights' },
    { from: 'DEL', to: 'BLR', label: 'Delhi to Bengaluru Flights' },
    { from: 'BOM', to: 'GOI', label: 'Mumbai to Goa Flights' },
    { from: 'DEL', to: 'GOI', label: 'Delhi to Goa Flights' }
  ];

  const defaultIntl = [
    { from: 'DEL', to: 'DXB', label: 'Delhi to Dubai Flights' },
    { from: 'BLR', to: 'DEL', label: 'Bengaluru to Delhi Flights' },
    { from: 'BOM', to: 'DEL', label: 'Mumbai to Delhi Flights' },
    { from: 'DEL', to: 'HYD', label: 'Delhi to Hyderabad Flights' }
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

  const footerDesc = brand?.footer?.description || brand?.tagline || propSettings?.siteTagline || 'Premium Luxury Travel platform delivering fastest bookings, interactive seat pickers, and live fare radar.';
  const copyrightText = brand?.footer?.copyright || `© ${new Date().getFullYear()} ${brand?.name || propSettings?.siteName || 'AIR SKY Go'}. All rights reserved.`;
  const addressText = brand?.address || propSettings?.address || 'Panchsheel Apartment, Flat No. 204, Plot No. 9, Sector 10, Dwarka, Delhi – 110075';
  const phoneText = brand?.phone || propSettings?.supportPhone || '+91 72248 28030';
  const emailText = brand?.email || propSettings?.supportEmail || 'care@airskyindia.com';

  return (
    <footer className="bg-slate-900 text-slate-300 pt-14 pb-10 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Value Propositions / Why AirSkyGo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12 border-b border-slate-800">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-white text-sm mb-1">
                {brand?.footer?.card1Title || 'Real-Time Live Inventory'}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {brand?.footer?.card1Desc || 'Direct GDS integration ensures 100% accurate seat availability and instant verified airfares.'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-white text-sm mb-1">
                {brand?.footer?.card2Title || 'Instant PNR & Digital Tickets'}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {brand?.footer?.card2Desc || 'Guaranteed immediate airline PNR generation with downloadable boarding pass and SMS updates.'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-white text-sm mb-1">
                {brand?.footer?.card3Title || '24x7 Aviation Support'}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {brand?.footer?.card3Desc || 'Hassle-free web check-in support and instant automated cancellations with swift refund processing.'}
              </p>
            </div>
          </div>
        </div>

        {/* Links Grid (5 Columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 py-10 border-b border-slate-800 text-xs">
          
          {/* Brand Info */}
          <div className="sm:col-span-2 md:col-span-1 lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              {brand?.logo ? (
                <img
                  src={brand.logo}
                  alt={brand.name || 'Brand Logo'}
                  className="h-12 sm:h-14 md:h-16 w-auto max-w-[220px] object-contain brightness-105"
                />
              ) : (
                <>
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
                    style={{ background: brand?.primary_color || '#ff6d01' }}
                  >
                    <Plane className="w-4 h-4 rotate-45" />
                  </div>
                  <span className="text-xl font-extrabold text-white tracking-tight">
                    {brand?.name || propSettings?.siteName || 'AIR SKY Go'}
                  </span>
                </>
              )}
            </div>
            <p className="text-slate-400 leading-relaxed mb-3">
              {footerDesc}
            </p>
            {addressText && (
              <p className="text-[11px] text-slate-400 leading-relaxed mb-2 flex items-start gap-1">
                <span className="shrink-0">📍</span>
                <span>{addressText}</span>
              </p>
            )}
            <div className="space-y-1 text-[11px] text-slate-400 mb-3">
              {phoneText && (
                <div className="flex items-center gap-1">
                  <span>📞 Phone:</span>
                  <a href={`tel:${phoneText.replace(/\s+/g, '')}`} className="text-slate-300 font-bold hover:text-white transition-colors">
                    {phoneText}
                  </a>
                </div>
              )}
              {emailText && (
                <div className="flex items-center gap-1">
                  <span>✉️ Email:</span>
                  <a href={`mailto:${emailText}`} className="text-slate-300 font-bold hover:text-white transition-colors">
                    {emailText}
                  </a>
                </div>
              )}
            </div>
            <div className="text-[11px] text-slate-500">
              {copyrightText}
            </div>
          </div>

          {/* Company & Support Links (Terms & Conditions, About Us, Contact) */}
          <div>
            <h5 className="font-bold text-white uppercase tracking-wider mb-3 text-xs flex items-center gap-1.5">
              <span>Company & Support</span>
            </h5>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/about"
                  className="text-slate-400 hover:text-sky-400 transition-colors flex items-center gap-1"
                >
                  <span>About Us</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-slate-400 hover:text-sky-400 transition-colors flex items-center gap-1"
                >
                  <span>Contact Us & Help</span>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1 py-0.2 rounded font-bold">24x7</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-slate-400 hover:text-sky-400 transition-colors flex items-center gap-1"
                >
                  <span>Terms & Conditions</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/terms#cancellation"
                  className="text-slate-400 hover:text-sky-400 transition-colors flex items-center gap-1"
                >
                  <span>Cancellation & Refund Policy</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/terms#passport"
                  className="text-slate-400 hover:text-sky-400 transition-colors flex items-center gap-1"
                >
                  <span>Passport & Visa Rules</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/terms#liability"
                  className="text-slate-400 hover:text-sky-400 transition-colors flex items-center gap-1"
                >
                  <span>Privacy Policy & Grievance</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Routes */}
          <div>
            <h5 className="font-bold text-white uppercase tracking-wider mb-3 text-xs">Top Flight Routes</h5>
            <ul className="space-y-2">
              {domesticRoutes.map(r => (
                <li key={r.label}>
                  <button
                    onClick={() => onSelectRoute(r.from, r.to)}
                    className="text-slate-400 hover:text-sky-400 transition-colors text-left"
                  >
                    {r.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* More Routes */}
          <div>
            <h5 className="font-bold text-white uppercase tracking-wider mb-3 text-xs">International & Metro</h5>
            <ul className="space-y-2">
              {intlRoutes.map(r => (
                <li key={r.label}>
                  <button
                    onClick={() => onSelectRoute(r.from, r.to)}
                    className="text-slate-400 hover:text-sky-400 transition-colors text-left"
                  >
                    {r.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Partner Airlines */}
          <div>
            <h5 className="font-bold text-white uppercase tracking-wider mb-3 text-xs">Airlines Partners</h5>
            <div className="flex flex-wrap gap-1.5">
              {partnerAirlinesList.map(a => (
                <span key={a} className="px-2 py-1 bg-slate-800 rounded-lg text-slate-300 border border-slate-700/60 font-semibold text-[10px]">
                  {a}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Security & Payment Badges */}
        <div className="pt-6 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-slate-400" />
            <span>Secure 256-bit SSL Gateway • UPI, RuPay, Visa, Mastercard, NetBanking</span>
          </div>

          <div className="flex items-center gap-1 text-[11px]">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for seamless aviation travel</span>
          </div>
        </div>

      </div>
    </footer>
  );
}

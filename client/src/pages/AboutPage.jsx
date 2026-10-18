import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plane, 
  ShieldCheck, 
  Clock, 
  Users, 
  Award, 
  Headphones, 
  CheckCircle2, 
  Globe2, 
  Compass, 
  ArrowRight, 
  PhoneCall, 
  Mail, 
  MapPin, 
  ChevronRight,
  Sparkles,
  Zap
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppSupportButton from '../components/WhatsAppSupportButton';
import QuickPnrModal from '../components/QuickPnrModal';
import WebCheckInModal from '../components/WebCheckInModal';
import { api } from '../utils/api';

export default function AboutPage() {
  const navigate = useNavigate();
  const [brand, setBrand] = useState(() => {
    try {
      const saved = localStorage.getItem('asg_brand');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('asg_settings');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [quickPnrOpen, setQuickPnrOpen] = useState(false);
  const [webCheckInOpen, setWebCheckInOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const handleBrandUpdate = (e) => {
      if (e.detail) setBrand(e.detail);
    };
    window.addEventListener('asg_brand_updated', handleBrandUpdate);

    const loadData = async () => {
      try {
        const [brandRes, settingsRes] = await Promise.all([
          api.getBrand().catch(() => ({ success: false })),
          api.getSettings().catch(() => ({ success: false }))
        ]);
        if (brandRes?.success && brandRes.data) setBrand(brandRes.data);
        if (settingsRes?.success && settingsRes.data) {
          setSettings(settingsRes.data);
          if (!brandRes?.data && settingsRes.data.brand) setBrand(settingsRes.data.brand);
        }
      } catch (e) {
        console.error('Failed to load brand data', e);
      }
    };
    loadData();

    return () => window.removeEventListener('asg_brand_updated', handleBrandUpdate);
  }, []);

  const brandName = brand?.name || 'AIR SKY';
  const tagline = brand?.tagline || 'Premium Luxury Travel';
  const phone = brand?.phone || '+91 72248 28030';
  const email = brand?.email || 'care@airskyindia.com';
  const address = brand?.address || 'Panchsheel Apartment, Flat No. 204, Plot No. 9, Sector 10, Dwarka, Delhi – 110075';

  const stats = [
    { label: 'Happy Travellers', value: '1.2M+', icon: Users, desc: 'Flying across domestic & global destinations' },
    { label: 'Airline Partners', value: '85+', icon: Plane, desc: 'Direct GDS connections with top global carriers' },
    { label: 'Booking Success Rate', value: '99.8%', icon: ShieldCheck, desc: 'Instant PNR and guaranteed fare locks' },
    { label: 'Dedicated Support', value: '24/7', icon: Headphones, desc: 'Round-the-clock priority aviation customer desk' }
  ];

  const features = [
    {
      title: 'Real-Time Live Inventory',
      desc: 'Direct integration with global distribution systems (Amadeus, Galileo) ensures 100% genuine live seats and instant pricing without stale cache.',
      icon: Zap,
      color: 'from-amber-500 to-orange-500'
    },
    {
      title: 'Interactive 3D Seat Selector',
      desc: 'Pick your exact seat—window, aisle, extra legroom—with live real aircraft cabin layouts before finalizing your payment.',
      icon: Sparkles,
      color: 'from-sky-500 to-blue-600'
    },
    {
      title: 'Zero Hidden Charges',
      desc: 'What you see is what you pay. Transparent fare breakdowns including base fare, taxes, and optional ancillaries with transparent UPI discounts.',
      icon: ShieldCheck,
      color: 'from-emerald-500 to-teal-600'
    },
    {
      title: 'Instant Automated Web Check-In',
      desc: 'Avoid airport queues with our 1-click web check-in service that automatically delivers digital boarding passes straight to WhatsApp and Email.',
      icon: Clock,
      color: 'from-indigo-500 to-purple-600'
    }
  ];

  const airlines = [
    'IndiGo', 'Air India', 'Vistara', 'Akasa Air', 'SpiceJet', 
    'Emirates', 'Singapore Airlines', 'Qatar Airways', 'Etihad Airways', 'British Airways'
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar
        brand={brand}
        settings={settings}
        activeService="about"
        onSelectService={(srv) => navigate(`/?service=${srv}`)}
        onOpenQuickPnr={() => setQuickPnrOpen(true)}
        onOpenWebCheckIn={() => setWebCheckInOpen(true)}
        onOpenMyBookings={() => navigate('/?openBookings=true')}
        onOpenAuth={() => navigate('/login')}
      />

      <main className="flex-1">
        {/* Breadcrumb Bar */}
        <div className="bg-white border-b border-slate-200 py-3 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Link to="/" className="hover:text-sky-600 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-800 font-bold">About Us</span>
          </div>
        </div>

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-sky-950 to-blue-900 text-white py-16 sm:py-24 px-4 sm:px-6">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
          <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-400/30 text-sky-300 text-xs font-bold tracking-wide">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span>THE AIR SKY STORY & AVIATION PHILOSOPHY</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Making Air Travel <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-sky-300 to-sky-400">Effortless, Fast & Transparent</span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-normal">
              Founded with the vision to modernize flight bookings across India and international routes, 
              <strong> {brandName}</strong> blends high-speed GDS connectivity with transparent pricing, 
              instant verified PNR ticketing, and 24x7 customer support.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/25 transition-all transform hover:-translate-y-0.5"
              >
                <Plane className="w-4 h-4 rotate-45" />
                <span>Search Flights Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 backdrop-blur-md transition-all"
              >
                <PhoneCall className="w-4 h-4 text-sky-300" />
                <span>Contact Aviation Desk</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 -mt-8 relative z-20">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {stats.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div key={idx} className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-md flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{s.value}</span>
                    <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-xs sm:text-sm">{s.label}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-sky-600 bg-sky-50 px-3 py-1 rounded-lg">
                <Globe2 className="w-3.5 h-3.5" />
                <span>Our Mission</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                Empowering Millions of Flyers with Real-Time Airfares & Genuine Live Availability
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                At <strong>{brandName}</strong>, we believe booking a flight ticket should be as simple, 
                transparent, and prompt as boarding the aircraft. We eliminate unnecessary markups, cryptic fees, 
                and frustrating checkout loops by giving passengers real-time access to global inventories.
              </p>
              <div className="space-y-3 pt-2">
                {[
                  '100% Genuine Airline PNRs generated instantly upon payment confirmation.',
                  'Real-time seat maps allowing passengers to reserve window, aisle, or emergency exit seats.',
                  'Comprehensive domestic & international coverage with automated passport capture.',
                  'Direct WhatsApp notifications and zero-hassle cancellations with rapid refunds.'
                ].map((point, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm font-semibold text-slate-700">{point}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Corporate Profile Card */}
            <div className="bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-sky-800/40 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black text-xl">
                  ✈️
                </div>
                <div>
                  <h3 className="font-black text-lg text-white">{brandName}</h3>
                  <p className="text-xs text-sky-300 font-medium">{tagline}</p>
                </div>
              </div>

              <div className="space-y-4 text-xs text-slate-300">
                <div className="flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="block font-bold text-white text-[11px] uppercase tracking-wide">Registered Headquarters</span>
                    <p className="text-slate-300 mt-0.5">{address}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
                  <PhoneCall className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="block font-bold text-white text-[11px] uppercase tracking-wide">24x7 Support Desk</span>
                    <a href={`tel:${phone.replace(/\s+/g, '')}`} className="text-slate-200 font-bold hover:text-emerald-300">
                      {phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
                  <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                  <div>
                    <span className="block font-bold text-white text-[11px] uppercase tracking-wide">Support Email</span>
                    <a href={`mailto:${email}`} className="text-slate-200 font-bold hover:text-sky-300">
                      {email}
                    </a>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-slate-400">DGCA & Aviation Standards Compliant</span>
                <span className="text-emerald-400 font-extrabold flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" /> 100% Verified
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us Features */}
        <section className="bg-white border-y border-slate-200 py-14 sm:py-20 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Why Flyers Prefer {brandName}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Engineered from the ground up for modern domestic and international aviation travelers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((f, idx) => {
                const Icon = f.icon;
                return (
                  <div key={idx} className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 hover:border-sky-300 hover:shadow-md transition-all">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${f.color} text-white flex items-center justify-center mb-4 shadow-sm`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-extrabold text-slate-800 text-sm mb-2">{f.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{f.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Airline Partners */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <div className="text-center mb-6">
            <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
              Direct Connectivity With Leading Airlines
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {airlines.map((a, idx) => (
              <span key={idx} className="px-4 py-2 bg-white rounded-xl border border-slate-200 font-extrabold text-slate-700 text-xs shadow-xs">
                ✈️ {a}
              </span>
            ))}
          </div>
        </section>

        {/* CTA Banner */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
          <div className="bg-gradient-to-r from-sky-600 via-blue-700 to-indigo-800 rounded-3xl p-8 sm:p-12 text-white text-center space-y-4 shadow-xl">
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
              Ready to Take Off on Your Next Journey?
            </h3>
            <p className="text-xs sm:text-sm text-sky-100 max-w-xl mx-auto">
              Search live fares, choose your favorite aircraft seats, and book your tickets in under 60 seconds with instant PNR.
            </p>
            <div className="pt-2">
              <button
                onClick={() => navigate('/')}
                className="px-8 py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer"
              >
                Search Flights Now
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer
        brand={brand}
        settings={settings}
        onSelectRoute={(from, to) => navigate(`/?from=${from}&to=${to}`)}
      />

      <WhatsAppSupportButton onOpenQuickPnr={() => setQuickPnrOpen(true)} brand={brand} />

      {quickPnrOpen && (
        <QuickPnrModal isOpen={quickPnrOpen} onClose={() => setQuickPnrOpen(false)} />
      )}
      {webCheckInOpen && (
        <WebCheckInModal isOpen={webCheckInOpen} onClose={() => setWebCheckInOpen(false)} />
      )}
    </div>
  );
}

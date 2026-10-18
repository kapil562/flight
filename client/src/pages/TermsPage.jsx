import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  ShieldCheck, 
  AlertTriangle, 
  Scale, 
  RefreshCw, 
  Luggage, 
  Globe2, 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  ChevronRight,
  PhoneCall,
  Mail,
  MapPin,
  Lock
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppSupportButton from '../components/WhatsAppSupportButton';
import QuickPnrModal from '../components/QuickPnrModal';
import WebCheckInModal from '../components/WebCheckInModal';
import { api } from '../utils/api';

export default function TermsPage() {
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
  const [activeSection, setActiveSection] = useState('acceptance');

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
  const phone = brand?.phone || '+91 72248 28030';
  const email = brand?.email || 'care@airskyindia.com';
  const address = brand?.address || 'Panchsheel Apartment, Flat No. 204, Plot No. 9, Sector 10, Dwarka, Delhi – 110075';

  const sections = [
    { id: 'acceptance', title: '1. Acceptance of Terms', icon: Scale },
    { id: 'bookings', title: '2. Bookings & Instant PNR', icon: FileText },
    { id: 'cancellation', title: '3. Cancellation & Refunds', icon: RefreshCw },
    { id: 'passport', title: '4. Passport & Travel Documents', icon: Globe2 },
    { id: 'baggage', title: '5. Baggage & Cabin Rules', icon: Luggage },
    { id: 'schedule', title: '6. Airline Delays & Changes', icon: Clock },
    { id: 'payment', title: '7. Payment & SSL Gateway', icon: CreditCard },
    { id: 'liability', title: '8. Legal & Grievance Officer', icon: ShieldCheck }
  ];

  const scrollTo = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar
        brand={brand}
        settings={settings}
        activeService="terms"
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
            <span className="text-slate-800 font-bold">Terms and Conditions</span>
          </div>
        </div>

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-slate-900 via-sky-950 to-blue-900 text-white py-12 sm:py-16 px-4 sm:px-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
          <div className="max-w-3xl mx-auto relative z-10 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/30 text-sky-300 text-xs font-bold">
              <Scale className="w-3.5 h-3.5" />
              <span>LEGAL AGREEMENT & PASSENGER CHARTER</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              Terms & Conditions
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto">
              Please review the passenger booking agreement, airline fare regulations, cancellation rules, and legal conditions governing your travel with <strong>{brandName}</strong>.
            </p>
            <div className="text-[11px] text-slate-400 pt-1">
              Last Updated & Effective: <strong>October 2026</strong> • Version 2.4
            </div>
          </div>
        </section>

        {/* Content Layout */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Sticky Table of Contents (4 cols) */}
            <div className="hidden lg:block lg:col-span-4 sticky top-24 bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 px-2">
                Quick Navigation
              </h3>
              <nav className="space-y-1">
                {sections.map((sec) => {
                  const Icon = sec.icon;
                  const isCurrent = activeSection === sec.id;
                  return (
                    <button
                      key={sec.id}
                      onClick={() => scrollTo(sec.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-left transition-colors cursor-pointer ${
                        isCurrent
                          ? 'bg-sky-50 text-sky-700 font-extrabold'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isCurrent ? 'text-sky-600' : 'text-slate-400'}`} />
                      <span>{sec.title}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="pt-4 mt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-2 px-2">
                <p>Have questions regarding our terms?</p>
                <Link
                  to="/contact"
                  className="text-sky-600 hover:text-sky-700 font-bold flex items-center gap-1"
                >
                  <span>Speak with our Legal Desk</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Document Content (8 cols) */}
            <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-sm space-y-10 text-slate-700 text-xs sm:text-sm leading-relaxed">

              {/* Section 1 */}
              <div id="acceptance" className="scroll-mt-28 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Scale className="w-5 h-5 text-sky-600" />
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    1. Acceptance of Terms & Passenger Charter
                  </h2>
                </div>
                <p>
                  By accessing, browsing, or completing a flight or hotel reservation through the <strong>{brandName}</strong> website, mobile applications, or affiliate channels, you expressly confirm that you are at least 18 years of age and legally competent to enter into this legally binding agreement.
                </p>
                <p>
                  <strong>{brandName}</strong> operates as an authorized Online Travel Agency (OTA) facilitating tickets and bookings between travelers and operating airlines (including IndiGo, Air India, Vistara, Akasa Air, SpiceJet, Emirates, Singapore Airlines, and other DGCA/IATA registered carriers). All flights booked through this portal remain governed by the respective airline’s Conditions of Carriage.
                </p>
              </div>

              {/* Section 2 */}
              <div id="bookings" className="scroll-mt-28 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <FileText className="w-5 h-5 text-sky-600" />
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    2. Flight Bookings, Airfares & Instant PNR Issuance
                  </h2>
                </div>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                  <li>
                    <strong>Live Inventory:</strong> All airfares displayed reflect real-time GDS availability. Fares fluctuate continuously based on airline seat inventory, dynamic demand, and booking class availability.
                  </li>
                  <li>
                    <strong>Guaranteed PNR:</strong> Upon successful payment completion, an official airline Passenger Name Record (PNR) is issued instantly and delivered via SMS, WhatsApp, and E-Ticket PDF.
                  </li>
                  <li>
                    <strong>Passenger Accuracy:</strong> Names entered during checkout must exactly match the government-issued photo ID (or valid Passport for international travel). Any spelling corrections post-issuance are subject to strict airline correction policies and applicable name-change fees.
                  </li>
                  <li>
                    <strong>Infant & Child Tickets:</strong> Infants (under 2 years of age on date of travel) must not occupy a separate seat unless a child fare is purchased. Age proof is mandatory at airport check-in.
                  </li>
                </ul>
              </div>

              {/* Section 3 */}
              <div id="cancellation" className="scroll-mt-28 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <RefreshCw className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    3. Cancellation, Rescheduling & Refund Rules
                  </h2>
                </div>
                <p>
                  We understand travel plans can change. Cancellations are processed transparently in accordance with DGCA guidelines and airline fare conditions:
                </p>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Free Cancellation / 24-Hour Grace Period:</strong> For bookings made more than 7 days prior to departure, cancellations made within 24 hours of booking incur zero airline penalty under DGCA regulations.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Standard Cancellations:</strong> Cancellations requested up to 2 hours (domestic) or 4 hours (international) prior to scheduled departure will incur the applicable airline cancellation fee plus standard platform convenience charges.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Refund Settlement:</strong> Approved refunds are credited directly to the customer’s original source account (UPI, Debit Card, Credit Card, NetBanking) within 3 to 7 banking days.</span>
                  </div>
                </div>
              </div>

              {/* Section 4 */}
              <div id="passport" className="scroll-mt-28 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Globe2 className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    4. Mandatory Passport & Travel Documentation
                  </h2>
                </div>
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 space-y-2 text-xs">
                  <div className="flex items-center gap-2 font-black">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>CRITICAL INTERNATIONAL TRAVEL REQUIREMENTS</span>
                  </div>
                  <p>
                    For all international itineraries originating from or arriving in India:
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>A valid Passport with at least <strong>6 months remaining validity</strong> from the date of travel is mandatory.</li>
                    <li>Passport Number, Expiry Date, and Nationality must be entered correctly during checkout.</li>
                    <li>The passenger is solely responsible for obtaining necessary Visas (Transit, Tourist, or Work Visa) and meeting destination immigration protocols. {brandName} bears no liability for boarding denials resulting from invalid visa documentation.</li>
                  </ul>
                </div>
                <p className="text-xs text-slate-500">
                  For Domestic Flights in India: Passengers must carry a valid original Government Photo ID (Aadhaar Card, Driving License, Voter ID, or Passport).
                </p>
              </div>

              {/* Section 5 */}
              <div id="baggage" className="scroll-mt-28 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Luggage className="w-5 h-5 text-amber-600" />
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    5. Baggage Allowances & Prohibited Articles
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <h4 className="font-extrabold text-slate-900 mb-1">Domestic Flights (India)</h4>
                    <p className="text-slate-600">
                      • Check-in: 15 Kg per adult/child (Economy)<br />
                      • Cabin Baggage: 1 piece up to 7 Kg + small laptop bag/handbag.
                    </p>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <h4 className="font-extrabold text-slate-900 mb-1">International Flights</h4>
                    <p className="text-slate-600">
                      • Check-in: 20 Kg to 30 Kg (as per ticket fare tier)<br />
                      • Cabin Baggage: 1 piece up to 7 Kg to 10 Kg.
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500">
                  Power banks, lithium-ion spare batteries, and e-cigarettes are strictly restricted to <strong>Cabin Baggage Only</strong> and must never be placed in checked luggage.
                </p>
              </div>

              {/* Section 6 */}
              <div id="schedule" className="scroll-mt-28 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Clock className="w-5 h-5 text-sky-600" />
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    6. Airline Schedule Changes & Airport Check-In
                  </h2>
                </div>
                <p>
                  Flight timings and gate assignments are determined solely by operating airlines and Air Traffic Control (ATC). {brandName} transmits all airline schedule change alerts via SMS and Email to the contact numbers registered at the time of reservation.
                </p>
                <p>
                  Airport reporting guidelines:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  <li><strong>Domestic Flights:</strong> Check-in counters close 60 minutes prior to departure; boarding gates close 25 minutes prior.</li>
                  <li><strong>International Flights:</strong> Check-in counters close 75 minutes prior to departure; boarding gates close 35 minutes prior.</li>
                </ul>
              </div>

              {/* Section 7 */}
              <div id="payment" className="scroll-mt-28 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <CreditCard className="w-5 h-5 text-teal-600" />
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    7. Payment Security & Zero Surcharge Guarantee
                  </h2>
                </div>
                <div className="flex items-center gap-3 p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl text-emerald-900 text-xs">
                  <Lock className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <strong>256-Bit SSL Encrypted Transactions:</strong> All card payments, UPI transactions, and NetBanking payments are secured via RBI-approved payment gateways. We do not store your complete CVV or card PINs on our servers.
                  </div>
                </div>
              </div>

              {/* Section 8 */}
              <div id="liability" className="scroll-mt-28 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <ShieldCheck className="w-5 h-5 text-purple-600" />
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    8. Legal Jurisdiction & Grievance Officer
                  </h2>
                </div>
                <p>
                  These Terms of Use are governed by the laws of India. Any disputes arising in connection with bookings completed on this platform are subject to the exclusive jurisdiction of the competent courts in <strong>New Delhi, India</strong>.
                </p>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                  <h4 className="font-extrabold text-slate-900 uppercase tracking-wide">
                    Designated Grievance & Legal Officer
                  </h4>
                  <div className="space-y-1 text-slate-600">
                    <p><strong>Entity:</strong> {brandName} Travel Solutions Private Limited</p>
                    <p><strong>Address:</strong> {address}</p>
                    <p><strong>Helpline:</strong> {phone}</p>
                    <p><strong>Email:</strong> {email}</p>
                  </div>
                </div>
              </div>

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

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Phone, 
  Mail, 
  MapPin, 
  MessageCircle, 
  Clock, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  ChevronDown, 
  HelpCircle, 
  ShieldCheck, 
  Plane,
  Sparkles,
  Ticket
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppSupportButton from '../components/WhatsAppSupportButton';
import QuickPnrModal from '../components/QuickPnrModal';
import WebCheckInModal from '../components/WebCheckInModal';
import { api } from '../utils/api';

export default function ContactPage() {
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

  // Form State
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    pnr: '',
    category: 'booking',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Accordion state
  const [openFaq, setOpenFaq] = useState(0);

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
  const rawPhone = phone.replace(/\D/g, '');
  const email = brand?.email || 'care@airskyindia.com';
  const whatsapp = brand?.whatsapp || '+918077680310';
  const rawWhatsapp = whatsapp.replace(/\D/g, '');
  const address = brand?.address || 'Panchsheel Apartment, Flat No. 204, Plot No. 9, Sector 10, Dwarka, Delhi – 110075';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.message) {
      setErrorMsg('Please fill in all mandatory fields (Name, Email, Phone, Message).');
      return;
    }
    setErrorMsg('');
    setSubmitting(true);

    // Simulate sending inquiry / ticket generation
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setForm({
        name: '',
        email: '',
        phone: '',
        pnr: '',
        category: 'booking',
        subject: '',
        message: ''
      });
    }, 700);
  };

  const faqs = [
    {
      q: 'How can I check the live status of my flight booking or PNR?',
      a: 'You can check your booking status instantly by clicking on the "Check PNR" button located in the top navigation bar or using the "My Trips" dashboard. Enter your 6-character Airline PNR or Booking Reference to view confirmation and download your E-Ticket.'
    },
    {
      q: 'How do I cancel my ticket and claim a refund?',
      a: 'To cancel your ticket, go to My Bookings, enter your PNR, and select the cancellation option. Refunds for eligible bookings are processed back to the original payment source (UPI, Credit/Debit card, NetBanking) within 3 to 7 working days, subject to standard airline fare rules.'
    },
    {
      q: 'How does automated 1-Click Web Check-In work?',
      a: 'Airlines open web check-in 48 to 24 hours prior to departure. Simply open our Web Check-In Hub from the top menu, select your operating airline, enter your PNR, and download your boarding pass directly to WhatsApp and Email.'
    },
    {
      q: 'Are passport details mandatory for booking international flights?',
      a: 'Yes. In accordance with DGCA and international aviation safety regulations, all passengers traveling on international itineraries must provide valid Passport Numbers, Expiry Dates (valid for at least 6 months), and Nationality at the time of checkout.'
    },
    {
      q: 'What should I do if my payment was deducted but ticket was not generated?',
      a: 'In rare cases of bank gateway latency, your transaction is safely recorded in our settlement ledger. Please reach out to our 24x7 Helpline at ' + phone + ' or WhatsApp desk with your transaction ID, and our team will either issue your ticket immediately or initiate an instant auto-refund.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar
        brand={brand}
        settings={settings}
        activeService="contact"
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
            <span className="text-slate-800 font-bold">Contact Us</span>
          </div>
        </div>

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-slate-900 via-sky-950 to-blue-900 text-white py-14 sm:py-20 px-4 sm:px-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
          <div className="max-w-3xl mx-auto relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">
              <Clock className="w-3.5 h-3.5" />
              <span>24x7 PRIORITY AVIATION DESK</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
              We are Here to <span className="text-sky-400">Help You Fly Smoothly</span>
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto">
              Have questions about your flight booking, baggage allowances, web check-in, or need emergency travel assistance? Contact our team anytime.
            </p>
          </div>
        </section>

        {/* Contact Cards Grid */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 -mt-8 relative z-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Phone Support */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-md flex flex-col justify-between hover:border-emerald-300 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">24x7 Helpline</h3>
                  <span className="text-emerald-600 text-[11px] font-bold">Instant Connect</span>
                </div>
              </div>
              <p className="text-sm font-black text-slate-800 mb-3">{phone}</p>
              <a
                href={`tel:${rawPhone}`}
                className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold text-center transition-colors flex items-center justify-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Helpline</span>
              </a>
            </div>

            {/* WhatsApp Desk */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-md flex flex-col justify-between hover:border-emerald-400 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">WhatsApp Support</h3>
                  <span className="text-emerald-600 text-[11px] font-bold">Quick Resolution</span>
                </div>
              </div>
              <p className="text-sm font-black text-slate-800 mb-3">{whatsapp}</p>
              <a
                href={`https://wa.me/${rawWhatsapp}?text=Hi%20${encodeURIComponent(brandName)},%20I%20need%20assistance%20with%20my%20flight%20booking.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 px-3 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-xl text-xs font-extrabold text-center transition-colors flex items-center justify-center gap-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>

            {/* Email Support */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-md flex flex-col justify-between hover:border-sky-300 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">Official Email</h3>
                  <span className="text-sky-600 text-[11px] font-bold">Ticket & Invoices</span>
                </div>
              </div>
              <p className="text-xs font-bold text-slate-800 truncate mb-3">{email}</p>
              <a
                href={`mailto:${email}?subject=Flight%20Booking%20Inquiry`}
                className="w-full py-2 px-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-extrabold text-center transition-colors flex items-center justify-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Send Email</span>
              </a>
            </div>

            {/* Headquarters */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-md flex flex-col justify-between hover:border-amber-300 transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">Headquarters</h3>
                  <span className="text-slate-500 text-[11px] font-bold">New Delhi, India</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug line-clamp-2 mb-3">{address}</p>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-extrabold text-center transition-colors flex items-center justify-center gap-1.5"
              >
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>View on Map</span>
              </a>
            </div>

          </div>
        </section>

        {/* Main Content: Support Form & FAQ */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Inquiry Form (7 Cols) */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-black text-sky-600 uppercase tracking-wider bg-sky-50 px-2.5 py-1 rounded-md mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Direct Communication</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Send us a Message or Booking Inquiry
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Fill in your details and our dedicated aviation desk will respond within 30 minutes.
                </p>
              </div>

              {submitted ? (
                <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-extrabold text-emerald-900">Inquiry Received Successfully!</h3>
                  <p className="text-xs text-emerald-700 max-w-md mx-auto leading-relaxed">
                    Thank you for reaching out. Ticket token <strong>#ASG-{Math.floor(100000 + Math.random() * 900000)}</strong> has been opened. Our support executive will contact you via WhatsApp and Email shortly.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {errorMsg && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Rahul Sharma"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 text-xs text-slate-800 font-medium outline-hidden transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Phone / Mobile <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        placeholder="e.g. 9876543210"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 text-xs text-slate-800 font-medium outline-hidden transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        placeholder="e.g. rahul@example.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 text-xs text-slate-800 font-medium outline-hidden transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Flight PNR / Booking ID <span className="text-slate-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Y9WUNS or 6E-955"
                        value={form.pnr}
                        onChange={(e) => setForm({ ...form, pnr: e.target.value.toUpperCase() })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 text-xs text-slate-800 font-mono font-medium outline-hidden transition-all uppercase"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Inquiry Category
                      </label>
                      <select
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 text-xs text-slate-800 font-medium outline-hidden bg-white cursor-pointer"
                      >
                        <option value="booking">New Flight Booking / Fare Quote</option>
                        <option value="cancellation">Cancellation & Refund Request</option>
                        <option value="checkin">Web Check-in & Boarding Pass Help</option>
                        <option value="seat">Seat Selection & Special Assistance</option>
                        <option value="baggage">Baggage Query / Excess Baggage</option>
                        <option value="payment">Payment Confirmation / Invoice</option>
                        <option value="feedback">Feedback & Complaints</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Subject
                      </label>
                      <input
                        type="text"
                        placeholder="Brief summary of your query"
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 text-xs text-slate-800 font-medium outline-hidden transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Message Details <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Please describe your flight route, date, passenger details, or issue..."
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 text-xs text-slate-800 font-medium outline-hidden transition-all resize-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white font-black text-xs sm:text-sm shadow-md shadow-sky-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? (
                      <span>Sending inquiry...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Support Ticket</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Quick Resolution FAQ (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-xs font-black uppercase text-amber-600">
                  <HelpCircle className="w-4 h-4 text-amber-500" />
                  <span>Frequently Asked Questions</span>
                </div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  Instant Answers & Solutions
                </h3>

                <div className="space-y-2.5 pt-1">
                  {faqs.map((faq, idx) => {
                    const isOpen = openFaq === idx;
                    return (
                      <div
                        key={idx}
                        className={`rounded-xl border transition-all overflow-hidden ${
                          isOpen ? 'bg-sky-50/50 border-sky-200' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                          className="w-full p-3.5 text-left flex items-center justify-between gap-2 font-bold text-xs text-slate-800 cursor-pointer"
                        >
                          <span>{faq.q}</span>
                          <ChevronDown className={`w-4 h-4 text-slate-500 shrink-0 transition-transform ${isOpen ? 'rotate-180 text-sky-600' : ''}`} />
                        </button>
                        {isOpen && (
                          <div className="px-3.5 pb-3.5 text-[11px] text-slate-600 leading-relaxed font-medium">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Actions Card */}
              <div className="bg-gradient-to-br from-slate-900 to-sky-950 text-white rounded-3xl p-6 border border-sky-800/40 space-y-4">
                <h4 className="font-black text-sm text-white flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-amber-400" />
                  <span>Need Immediate Self-Service?</span>
                </h4>
                <p className="text-xs text-slate-300">
                  Track your flight status or retrieve your boarding pass right now without waiting in queue:
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => setQuickPnrOpen(true)}
                    className="py-2.5 px-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold text-center text-white transition-colors cursor-pointer"
                  >
                    🔍 Check PNR
                  </button>
                  <button
                    onClick={() => setWebCheckInOpen(true)}
                    className="py-2.5 px-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-xs font-bold text-center text-white transition-colors cursor-pointer"
                  >
                    ✅ Web Check-In
                  </button>
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

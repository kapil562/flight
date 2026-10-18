import React, { useState, useEffect } from 'react';
import {
  Key,
  Search,
  CreditCard,
  QrCode,
  Settings,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  ExternalLink,
  Save,
  RefreshCw,
  Cpu,
  Radio,
  ShieldCheck,
  Plane,
  Building2,
  Sparkles,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { api } from '../utils/api';

export default function AdminApiSettings({ onNavigateTab }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Password visibility toggles
  const [showSerpApiKey, setShowSerpApiKey] = useState(false);
  const [showRzpSecret, setShowRzpSecret] = useState(false);
  const [showSerperKey, setShowSerperKey] = useState(false);
  const [showAmadeusSecret, setShowAmadeusSecret] = useState(false);

  // Test states
  const [testingSerpApi, setTestingSerpApi] = useState(false);
  const [serpApiTestResult, setSerpApiTestResult] = useState(null);
  const [testingSerper, setTestingSerper] = useState(false);
  const [serperTestResult, setSerperTestResult] = useState(null);

  // Main Form State
  const [form, setForm] = useState({
    // 1. SerpApi (Google Flights)
    serpapi: {
      apiKey: '',
      enabled: true
    },
    // 2. Razorpay
    razorpay: {
      keyId: '',
      keySecret: '',
      clearKey: false,
      clearSecret: false
    },
    // 3. UPI QR Code Payments
    upi: {
      vpa: 'paytm.s2zbyoe@pty',
      businessName: 'Air Sky India'
    },
    // 4. General Settings
    general: {
      bookingPrefix: 'GS',
      contactEmail: 'care@airskyindia.com',
      contactPhone: '+91 72248 28030',
      legalName: 'Air Sky Travels Private Limited',
      companyGstin: '07ABCCS8601B1ZP'
    },
    // 5. Our Extra APIs ("apna wala extra")
    activeProvider: 'serper',
    serper: {
      apiKey: '',
      enabled: true,
      status: 'Active (Live Google Search)'
    },
    amadeus: {
      clientId: '',
      clientSecret: '',
      environment: 'test',
      enabled: false,
      status: 'Not Configured'
    },
    aviationStack: {
      accessKey: '',
      enabled: false,
      status: 'Not Configured'
    }
  });

  // Fetch initial API settings
  const loadSettings = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await api.getApiSettings();
      if (res && res.success && res.data) {
        setForm(prev => ({
          ...prev,
          serpapi: {
            apiKey: res.data.serpapi?.apiKey || '',
            enabled: res.data.serpapi?.enabled !== false
          },
          razorpay: {
            keyId: res.data.razorpay?.keyId || '',
            keySecret: res.data.razorpay?.keySecret || '',
            clearKey: false,
            clearSecret: false
          },
          upi: {
            vpa: res.data.upi?.vpa || 'paytm.s2zbyoe@pty',
            businessName: res.data.upi?.businessName || 'Air Sky India'
          },
          general: {
            bookingPrefix: res.data.general?.bookingPrefix || 'GS',
            contactEmail: res.data.general?.contactEmail || 'care@airskyindia.com',
            contactPhone: res.data.general?.contactPhone || '+91 72248 28030',
            legalName: res.data.general?.legalName || 'Air Sky Travels Private Limited',
            companyGstin: res.data.general?.companyGstin || '07ABCCS8601B1ZP'
          },
          activeProvider: res.data.activeProvider || 'serper',
          serper: {
            apiKey: res.data.serper?.apiKey || '',
            enabled: res.data.serper?.enabled !== false,
            status: res.data.serper?.status || 'Active (Live Google Search)'
          },
          amadeus: {
            clientId: res.data.amadeus?.clientId || '',
            clientSecret: res.data.amadeus?.clientSecret || '',
            environment: res.data.amadeus?.environment || 'test',
            enabled: !!res.data.amadeus?.enabled,
            status: res.data.amadeus?.status || 'Not Configured'
          },
          aviationStack: {
            accessKey: res.data.aviationStack?.accessKey || '',
            enabled: !!res.data.aviationStack?.enabled,
            status: res.data.aviationStack?.status || 'Not Configured'
          }
        }));
      }
    } catch (err) {
      console.error('Error loading API settings', err);
      setErrorMessage('Failed to load current API settings from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  // Save Settings Submit Handler
  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setErrorMessage('');
    setSaveSuccess(false);

    try {
      const payload = {
        serpapi: form.serpapi,
        razorpay: form.razorpay,
        upi: form.upi,
        general: form.general,
        activeProvider: form.activeProvider,
        serper: form.serper,
        amadeus: form.amadeus,
        aviationStack: form.aviationStack
      };

      const res = await api.updateApiSettings(payload);
      if (res && res.success) {
        setSaveSuccess(true);
        // Clear checkboxes after successful save
        setForm(prev => ({
          ...prev,
          razorpay: {
            ...prev.razorpay,
            clearKey: false,
            clearSecret: false
          }
        }));
        setTimeout(() => setSaveSuccess(false), 4500);
      } else {
        setErrorMessage(res?.message || 'Failed to save settings');
      }
    } catch (err) {
      console.error('Error saving API settings', err);
      setErrorMessage('Network or server error while saving API settings.');
    } finally {
      setSaving(false);
    }
  };

  // Test SerpApi Key
  const handleTestSerpApi = async () => {
    if (!form.serpapi.apiKey.trim()) {
      alert('Please enter a SerpApi key first to test.');
      return;
    }
    setTestingSerpApi(true);
    setSerpApiTestResult(null);
    try {
      const res = await api.testSerpApiKey(form.serpapi.apiKey.trim());
      if (res.success) {
        setSerpApiTestResult({
          success: true,
          message: `${res.message} (Searches remaining: ${res.searches_remaining})`
        });
      } else {
        setSerpApiTestResult({
          success: false,
          message: res.message || 'SerpApi connection test failed'
        });
      }
    } catch (err) {
      setSerpApiTestResult({
        success: false,
        message: 'Could not connect to SerpApi testing service'
      });
    } finally {
      setTestingSerpApi(false);
    }
  };

  // Test Serper Key
  const handleTestSerper = async () => {
    if (!form.serper.apiKey.trim()) {
      alert('Please enter a Serper API key first to test.');
      return;
    }
    setTestingSerper(true);
    setSerperTestResult(null);
    try {
      const res = await api.testSerperApiKey(form.serper.apiKey.trim());
      if (res.success) {
        setSerperTestResult({
          success: true,
          message: `${res.message} (Credits remaining: ${res.credits})`
        });
      } else {
        setSerperTestResult({
          success: false,
          message: res.message || 'Serper API test failed'
        });
      }
    } catch (err) {
      setSerperTestResult({
        success: false,
        message: 'Could not connect to Serper testing service'
      });
    } finally {
      setTestingSerper(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin text-sky-600 mb-3" />
        <p className="text-sm font-semibold">Loading API & Payment Settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* PAGE HEADER */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold mb-2">
            <Key className="w-3.5 h-3.5" />
            API Keys & Payment Credentials
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            API &amp; Payment Settings
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Configure live Google Flights (SerpApi), Razorpay card/UPI gateway, UPI QR code receiver, GST &amp; booking prefix, and multi-provider engines.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadSettings}
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            title="Reload settings"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reload
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-[var(--brand,#ff6d01)] hover:bg-[var(--brand-hover,#e65700)] text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-orange-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>

      {/* SUCCESS / ERROR ALERTS */}
      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold flex items-center gap-3 shadow-sm animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>API &amp; Payment Settings saved successfully! All credentials, UPI info, and API engines are live across the website.</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-bold flex items-center gap-3 shadow-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* MASTER PROVIDER SELECTOR (Our extra live capability) */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl border border-indigo-500/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h4 className="font-black text-base text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              Active Primary Flight Engine
            </h4>
            <p className="text-slate-300 text-xs mt-0.5">
              Select which engine the public search bar should query first when customers search for flights.
            </p>
          </div>
          <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 bg-white/10 rounded-full border border-white/20 self-start sm:self-auto">
            Current: {form.activeProvider.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. Local Engine */}
          <div
            onClick={() => setForm({ ...form, activeProvider: 'local' })}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              form.activeProvider === 'local'
                ? 'bg-indigo-600/30 border-indigo-400 ring-2 ring-indigo-400/50'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-[10px] text-indigo-300 uppercase tracking-wider">Fastest &amp; Offline</span>
              <input
                type="radio"
                name="primary_provider"
                checked={form.activeProvider === 'local'}
                onChange={() => setForm({ ...form, activeProvider: 'local' })}
                className="accent-indigo-500"
              />
            </div>
            <div className="font-extrabold text-sm text-white">Local Aviation Engine</div>
            <p className="text-slate-300 text-[11px] mt-1 leading-relaxed">
              Instant high-speed flight results from your custom database. Zero external API limits.
            </p>
          </div>

          {/* 2. SerpApi Google Flights */}
          <div
            onClick={() => setForm({ ...form, activeProvider: 'serpapi' })}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              form.activeProvider === 'serpapi'
                ? 'bg-orange-600/30 border-orange-400 ring-2 ring-orange-400/50'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-[10px] text-orange-400 uppercase tracking-wider">Google Flights</span>
              <input
                type="radio"
                name="primary_provider"
                checked={form.activeProvider === 'serpapi'}
                onChange={() => setForm({ ...form, activeProvider: 'serpapi' })}
                className="accent-orange-500"
              />
            </div>
            <div className="font-extrabold text-sm text-white flex items-center gap-1.5">
              SerpApi Flights
              <span className="text-[9px] bg-orange-500/30 text-orange-300 px-1.5 py-0.2 rounded font-black">AIR SKY</span>
            </div>
            <p className="text-slate-300 text-[11px] mt-1 leading-relaxed">
              Official Google Flights scraper via SerpApi. Queries live airline fares and schedules.
            </p>
          </div>

          {/* 3. Serper Google Search */}
          <div
            onClick={() => setForm({ ...form, activeProvider: 'serper' })}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              form.activeProvider === 'serper'
                ? 'bg-emerald-600/30 border-emerald-400 ring-2 ring-emerald-400/50'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-[10px] text-emerald-400 uppercase tracking-wider">Live Search + Hotels</span>
              <input
                type="radio"
                name="primary_provider"
                checked={form.activeProvider === 'serper'}
                onChange={() => setForm({ ...form, activeProvider: 'serper' })}
                className="accent-emerald-500"
              />
            </div>
            <div className="font-extrabold text-sm text-white flex items-center gap-1.5">
              Google Serper
              <span className="text-[9px] bg-emerald-500/30 text-emerald-300 px-1.5 py-0.2 rounded font-black">ACTIVE</span>
            </div>
            <p className="text-slate-300 text-[11px] mt-1 leading-relaxed">
              Live Google Search results for flights + Google Places real hotel live aggregator.
            </p>
          </div>

          {/* 4. Amadeus GDS */}
          <div
            onClick={() => setForm({ ...form, activeProvider: 'amadeus' })}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              form.activeProvider === 'amadeus'
                ? 'bg-amber-600/30 border-amber-400 ring-2 ring-amber-400/50'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-[10px] text-amber-300 uppercase tracking-wider">Airline GDS</span>
              <input
                type="radio"
                name="primary_provider"
                checked={form.activeProvider === 'amadeus'}
                onChange={() => setForm({ ...form, activeProvider: 'amadeus' })}
                className="accent-amber-500"
              />
            </div>
            <div className="font-extrabold text-sm text-white">Amadeus Flight API</div>
            <p className="text-slate-300 text-[11px] mt-1 leading-relaxed">
              Global commercial airline reservation GDS network for verified real flight inventories.
            </p>
          </div>
        </div>
      </div>

      {/* 2x2 MAIN GRID (Exact Replica of airskyindia.com/admin/settings) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* CARD 1: Flight Search API (SerpApi) */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-slate-200/80 flex flex-col justify-between">
          <div>
            <h6 className="font-extrabold text-slate-900 text-base mb-2 flex items-center gap-2">
              <Search className="w-5 h-5 text-[var(--brand,#ff6d01)]" />
              Flight Search API (SerpApi)
            </h6>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Google Flights data via SerpApi. Get your key at{' '}
              <a
                href="https://serpapi.com/"
                target="_blank"
                rel="noreferrer"
                className="text-sky-600 font-bold hover:underline inline-flex items-center gap-1"
              >
                serpapi.com <ExternalLink className="w-3 h-3" />
              </a>{' '}
              (250 free searches/month).
            </p>

            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">API Key</label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-slate-400 pointer-events-none">
                  <Key className="w-4 h-4" />
                </span>
                <input
                  type={showSerpApiKey ? 'text' : 'password'}
                  placeholder="Enter SerpApi key"
                  value={form.serpapi.apiKey}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      serpapi: { ...form.serpapi, apiKey: e.target.value }
                    })
                  }
                  className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono focus:outline-hidden focus:border-[var(--brand,#ff6d01)] focus:ring-2 focus:ring-orange-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowSerpApiKey(!showSerpApiKey)}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  title={showSerpApiKey ? 'Hide Key' : 'Show Key'}
                >
                  {showSerpApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Test Connection Button */}
            <div className="flex items-center gap-2 mb-3">
              <button
                type="button"
                onClick={handleTestSerpApi}
                disabled={testingSerpApi}
                className="px-3.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-[var(--brand,#ff6d01)] text-xs font-bold rounded-lg border border-orange-200 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {testingSerpApi ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Testing SerpApi...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Test SerpApi Key
                  </>
                )}
              </button>
              {serpApiTestResult && (
                <span
                  className={`text-[11px] font-bold ${
                    serpApiTestResult.success ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {serpApiTestResult.message}
                </span>
              )}
            </div>

            {/* Info Box */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 text-[11px] sm:text-xs flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span>Searches live flight data from Google Flights. Works for all Indian domestic airlines (IndiGo, Air India, SpiceJet, Akasa Air, Vistara).</span>
            </div>
          </div>
        </div>

        {/* CARD 2: Razorpay (Card/UPI) */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-slate-200/80 flex flex-col justify-between">
          <div>
            <h6 className="font-extrabold text-slate-900 text-base mb-2 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-500" />
              Razorpay (Card/UPI)
            </h6>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Accept card &amp; UPI payments. Get keys from{' '}
              <a
                href="https://dashboard.razorpay.com/"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 font-bold hover:underline inline-flex items-center gap-1"
              >
                Razorpay Dashboard <ExternalLink className="w-3 h-3" />
              </a>
              .
            </p>

            {/* Key ID */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Key ID</label>
              <input
                type="text"
                placeholder="rzp_live_xxxxx"
                value={form.razorpay.keyId}
                onChange={(e) =>
                  setForm({
                    ...form,
                    razorpay: { ...form.razorpay, keyId: e.target.value }
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input
                  type="checkbox"
                  id="clearRzpKey"
                  checked={form.razorpay.clearKey}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      razorpay: { ...form.razorpay, clearKey: e.target.checked }
                    })
                  }
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs text-slate-500 font-medium">Clear the stored Razorpay key</span>
              </label>
            </div>

            {/* Key Secret */}
            <div className="mb-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Key Secret</label>
              <div className="relative flex items-center">
                <input
                  type={showRzpSecret ? 'text' : 'password'}
                  placeholder="xxxxxxxxxxxxx"
                  value={form.razorpay.keySecret}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      razorpay: { ...form.razorpay, keySecret: e.target.value }
                    })
                  }
                  className="w-full pl-3.5 pr-12 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowRzpSecret(!showRzpSecret)}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  title={showRzpSecret ? 'Hide Secret' : 'Show Secret'}
                >
                  {showRzpSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input
                  type="checkbox"
                  id="clearRzpSecret"
                  checked={form.razorpay.clearSecret}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      razorpay: { ...form.razorpay, clearSecret: e.target.checked }
                    })
                  }
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs text-slate-500 font-medium">Clear the stored secret</span>
              </label>

              <small className="text-slate-400 text-[11px] block mt-1.5 leading-relaxed">
                Leaving these blank keeps whatever is already stored. Tick a box to remove it.
              </small>
            </div>
          </div>
        </div>

        {/* CARD 3: UPI QR Code Payments */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-slate-200/80 flex flex-col justify-between">
          <div>
            <h6 className="font-extrabold text-slate-900 text-base mb-2 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-emerald-500" />
              UPI QR Code Payments
            </h6>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Accept payments via UPI QR code scan. Customer scans and pays directly.
            </p>

            {/* UPI VPA */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">UPI VPA (ID)</label>
              <input
                type="text"
                placeholder="yourname@upi"
                value={form.upi.vpa}
                onChange={(e) =>
                  setForm({
                    ...form,
                    upi: { ...form.upi, vpa: e.target.value }
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>

            {/* Name (for QR) */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Name (for QR)</label>
              <input
                type="text"
                placeholder="Your Business Name"
                value={form.upi.businessName}
                onChange={(e) =>
                  setForm({
                    ...form,
                    upi: { ...form.upi, businessName: e.target.value }
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-semibold"
              />
            </div>

            {/* Alert info banner with link to Payments & UPI */}
            <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-100 text-sky-900 text-[11px] sm:text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                To turn payment methods on or off, and to change the PhonePe / GPay / Paytm links, use the{' '}
                <strong>Payments &amp; UPI</strong> page.{' '}
                {onNavigateTab && (
                  <button
                    type="button"
                    onClick={() => onNavigateTab('payments_upi')}
                    className="text-sky-700 font-extrabold underline hover:text-sky-900 cursor-pointer ml-1 inline-block"
                  >
                    Open Payments &amp; UPI
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* CARD 4: General Settings */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-slate-200/80 flex flex-col justify-between">
          <div>
            <h6 className="font-extrabold text-slate-900 text-base mb-2 flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-500" />
              General Settings
            </h6>

            {/* Booking ID Prefix */}
            <div className="mb-3.5">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Booking ID Prefix</label>
              <input
                type="text"
                placeholder="GS"
                maxLength={5}
                value={form.general.bookingPrefix}
                onChange={(e) =>
                  setForm({
                    ...form,
                    general: { ...form.general, bookingPrefix: e.target.value.toUpperCase() }
                  })
                }
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-black uppercase tracking-wider focus:outline-hidden focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
              />
              <small className="text-slate-400 text-[11px] mt-1 block">
                Booking IDs will be like {form.general.bookingPrefix || 'GS'}XXXXXX
              </small>
            </div>

            {/* Contact Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Contact Email</label>
                <input
                  type="email"
                  placeholder="support@yourdomain.com"
                  value={form.general.contactEmail}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      general: { ...form.general, contactEmail: e.target.value }
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Contact Phone</label>
                <input
                  type="tel"
                  placeholder="1800xxxxxxx"
                  value={form.general.contactPhone}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      general: { ...form.general, contactPhone: e.target.value }
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                />
              </div>
            </div>

            {/* Legal / Registered Name */}
            <div className="mb-3.5">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Legal / Registered Name</label>
              <input
                type="text"
                placeholder="Air Sky Travels Private Limited"
                value={form.general.legalName}
                onChange={(e) =>
                  setForm({
                    ...form,
                    general: { ...form.general, legalName: e.target.value }
                  })
                }
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all font-semibold"
              />
              <small className="text-slate-400 text-[11px] mt-1 block">
                Shown on the booking summary and ticket.
              </small>
            </div>

            {/* Company GSTIN */}
            <div className="mb-3.5">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Company GSTIN</label>
              <input
                type="text"
                placeholder="07ABCCS8601B1ZP"
                maxLength={15}
                value={form.general.companyGstin}
                onChange={(e) =>
                  setForm({
                    ...form,
                    general: { ...form.general, companyGstin: e.target.value.toUpperCase() }
                  })
                }
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono uppercase tracking-wider focus:outline-hidden focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
              />
              <small className="text-slate-400 text-[11px] mt-1 block">
                15 characters, e.g. 07ABCCS8601B1ZP. Must match your GST registration exactly.
              </small>
            </div>

            {/* GST Alert Banner */}
            <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100 text-purple-950 text-[11px] flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">
                This GSTIN is printed on every booking summary and downloaded ticket. The traveller step's own "Add GST Number" box captures the customer's GSTIN separately.
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* EXTRA APIS SECTION ("apna wala extra jo bhi ha") */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-lg border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold mb-2">
              <Cpu className="w-3.5 h-3.5" />
              Advanced Flight Aggregation &amp; Hotel Places APIs
            </div>
            <h3 className="font-extrabold text-white text-lg">
              Additional Connected APIs (Serper Live Search, Hotels &amp; Commercial GDS)
            </h3>
            <p className="text-slate-400 text-xs mt-1">
              Connect external search feeds to power live flight web crawling and Google Places real hotel inventories.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* 1. Google Serper API */}
          <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 font-black flex items-center justify-center text-sm border border-emerald-500/30">
                    G
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-sm">Google Serper API</h5>
                    <span className="text-[10px] text-slate-400">Flights &amp; Google Hotels</span>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.serper.enabled}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        serper: { ...form.serper, enabled: e.target.checked }
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              <div className="mb-3">
                <label className="block text-[11px] font-bold text-slate-300 mb-1">API Key</label>
                <div className="relative flex items-center">
                  <input
                    type={showSerperKey ? 'text' : 'password'}
                    placeholder="Enter Serper API Key"
                    value={form.serper.apiKey}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        serper: { ...form.serper, apiKey: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-hidden focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSerperKey(!showSerperKey)}
                    className="absolute right-2.5 text-slate-400 hover:text-white"
                  >
                    {showSerperKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleTestSerper}
                disabled={testingSerper}
                className="w-full py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {testingSerper ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Testing Connection...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Test Live Connection
                  </>
                )}
              </button>

              {serperTestResult && (
                <p
                  className={`text-[10px] font-bold mt-2 ${
                    serperTestResult.success ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {serperTestResult.message}
                </p>
              )}
            </div>
          </div>

          {/* 2. Amadeus Flight API */}
          <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 font-black flex items-center justify-center text-sm border border-amber-500/30">
                    A
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-sm">Amadeus Flight API</h5>
                    <span className="text-[10px] text-slate-400">Commercial GDS Network</span>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.amadeus.enabled}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        amadeus: { ...form.amadeus, enabled: e.target.checked }
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>

              <div className="space-y-2 mb-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Client ID</label>
                  <input
                    type="text"
                    placeholder="Amadeus Client ID"
                    value={form.amadeus.clientId}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        amadeus: { ...form.amadeus, clientId: e.target.value }
                      })
                    }
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Client Secret</label>
                  <div className="relative flex items-center">
                    <input
                      type={showAmadeusSecret ? 'text' : 'password'}
                      placeholder="Amadeus Client Secret"
                      value={form.amadeus.clientSecret}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          amadeus: { ...form.amadeus, clientSecret: e.target.value }
                        })
                      }
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-hidden focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAmadeusSecret(!showAmadeusSecret)}
                      className="absolute right-2.5 text-slate-400 hover:text-white"
                    >
                      {showAmadeusSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Environment</label>
                  <select
                    value={form.amadeus.environment}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        amadeus: { ...form.amadeus, environment: e.target.value }
                      })
                    }
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:border-amber-500"
                  >
                    <option value="test">Sandbox / Test</option>
                    <option value="production">Live Production</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* 3. AviationStack Flight Radar */}
          <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 font-black flex items-center justify-center text-sm border border-sky-500/30">
                    <Plane className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-sm">AviationStack Radar</h5>
                    <span className="text-[10px] text-slate-400">Live Aircraft GPS Radar</span>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.aviationStack.enabled}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        aviationStack: { ...form.aviationStack, enabled: e.target.checked }
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                </label>
              </div>

              <div className="mb-3">
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Access Key</label>
                <input
                  type="password"
                  placeholder="Enter AviationStack Access Key"
                  value={form.aviationStack.accessKey}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      aviationStack: { ...form.aviationStack, accessKey: e.target.value }
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-hidden focus:border-sky-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700 text-slate-400 text-[11px] leading-relaxed">
                Connects to international flight tracking transponders for live arrival, departure, and altitude status.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM STICKY/FINAL SAVE BUTTON (Matching Reference) */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3.5 bg-[var(--brand,#ff6d01)] hover:bg-[var(--brand-hover,#e65700)] text-white font-black text-sm rounded-2xl shadow-lg shadow-orange-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {saving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Saving Settings...
            </>
          ) : (
            <>
              <Check className="w-5 h-5" />
              Save Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
}

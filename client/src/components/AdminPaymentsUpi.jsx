import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, Lock, QrCode, Smartphone, CreditCard, Building2,
  Sliders, Link, Play, Copy, Check, RefreshCw, AlertCircle, Info,
  ExternalLink, Zap, RotateCcw, MessageSquare, Save
} from 'lucide-react';
import { api } from '../utils/api';

const DEFAULT_DEEP_LINKS = {
  any: 'upi://pay?pa={vpa}&pn={name}&am={amount}&cu=INR&tn={note}&tr={tr}&mc={mc}&mode=02',
  phonepe: 'phonepe://native?data=eyJwMnBQYXltZW50Q2hlY2tvdXRQYXJhbXMiOnsiY2hlY2tvdXRUeXBlIjoiQ09MTEVDVCIsImluaXRpYWxBbW91bnQiOjc5NjAwLCJub3RlIjp7InR5cGUiOiJ0ZXh0IiwibWVzc2FnZSI6Ik1lc3NobyBTaG9vcGluZyJ9LCJzdXBwb3J0ZWRJbnN0cnVtZW50cyI6LTF9LCJjb250YWN0Ijp7InR5cGUiOiJFWFRFUk5BTF9NRVJDSEFOVCIsIm5hbWUiOiJNZWVzaG8gU2hvb3BpbmciLCJ2cGEiOiJyODZqNzQyOTkzQG1haXJ0ZWwifX0%3D&id=p2ppayment',
  gpay: 'tez://upi/pay?pa={vpa}&pn={name}&am={amount}&cu=INR&tn={note}&tr={tr}&mc={mc}&mode=02',
  paytm: 'paytmmp://pay?pa={vpa}&pn={name}&am={amount}&cu=INR&tn={note}&tr={tr}&mc={mc}&mode=02',
  bhim: 'upi://pay?pa={vpa}&pn={name}&am={amount}&cu=INR&tn={note}&tr={tr}&mc={mc}&mode=02',
  other: 'upi://pay?pa={vpa}&pn={name}&am={amount}&cu=INR&tn={note}&tr={tr}&mc={mc}&mode=02'
};

export default function AdminPaymentsUpi() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [copiedKey, setCopiedKey] = useState(null);

  const [form, setForm] = useState(() => {
    try {
      const saved = localStorage.getItem('asg_payment_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          gatewayActive: parsed.gatewayActive !== false,
          paymentMode: parsed.paymentMode || 'manual',
          upi: {
            vpa: parsed.upi?.vpa || 'r86j742993@mairtel',
            name: parsed.upi?.name || 'Meesho Shooping',
            mcc: parsed.upi?.mcc || '5499',
            businessName: parsed.upi?.businessName || parsed.upi?.name || 'Meesho Shooping'
          },
          methods: {
            upiQr: parsed.methods?.upiQr !== false,
            upiApps: parsed.methods?.upiApps !== false,
            card: parsed.methods?.card === true,
            netBanking: parsed.methods?.netBanking === true
          },
          apps: {
            any: parsed.apps?.any === true,
            phonepe: parsed.apps?.phonepe !== false,
            gpay: parsed.apps?.gpay !== false,
            paytm: parsed.apps?.paytm !== false,
            bhim: parsed.apps?.bhim !== false,
            other: parsed.apps?.other === true
          },
          deepLinks: { ...DEFAULT_DEEP_LINKS, ...(parsed.deepLinks || {}) },
          instructions: parsed.instructions || "1. Scan the QR code and pay the exact amount\n2. After payment, enter your 12-digit UPI Reference / UTR Number\n3. Click 'I Have Paid'\n4. Your ticket will be confirmed instantly once verified"
        };
      }
    } catch (e) {}

    return {
      gatewayActive: true,
      paymentMode: 'manual', // 'manual' | 'auto'
      upi: {
        vpa: 'r86j742993@mairtel',
        name: 'Meesho Shooping',
        mcc: '5499'
      },
      methods: {
        upiQr: true,
        upiApps: true,
        card: false,
        netBanking: false
      },
      apps: {
        any: false,
        phonepe: true,
        gpay: true,
        paytm: true,
        bhim: true,
        other: false
      },
      deepLinks: { ...DEFAULT_DEEP_LINKS },
      instructions: "1. Scan the QR code and pay the exact amount\n2. After payment, enter your 12-digit UPI Reference / UTR Number\n3. Click 'I Have Paid'\n4. Your ticket will be confirmed instantly once verified"
    };
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await api.getPaymentSettings();
      if (res && res.success && res.data) {
        let localData = null;
        try {
          const saved = localStorage.getItem('asg_payment_settings');
          if (saved) localData = JSON.parse(saved);
        } catch (e) {}

        const merged = {
          ...res.data,
          ...(localData || {}),
          upi: {
            ...(res.data.upi || {}),
            ...(localData?.upi || {})
          },
          methods: {
            ...(res.data.methods || {}),
            ...(localData?.methods || {})
          },
          apps: {
            ...(res.data.apps || {}),
            ...(localData?.apps || {})
          },
          deepLinks: {
            ...(res.data.deepLinks || {}),
            ...(localData?.deepLinks || {})
          }
        };

        setForm(merged);
        try { localStorage.setItem('asg_payment_settings', JSON.stringify(merged)); } catch (e) {}
      }
    } catch (err) {
      console.warn('Using saved payment settings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const payloadToSave = {
        ...form,
        upi: {
          ...form.upi,
          vpa: (form.upi?.vpa || '').trim(),
          name: (form.upi?.name || '').trim(),
          businessName: (form.upi?.name || form.upi?.businessName || '').trim(),
          mcc: (form.upi?.mcc || '5499').trim()
        },
        updatedAt: new Date().toISOString()
      };

      // 1. Immediately persist to localStorage for instant reliable hydration
      try {
        localStorage.setItem('asg_payment_settings', JSON.stringify(payloadToSave));
        window.dispatchEvent(new CustomEvent('asg_payment_settings_updated', { detail: payloadToSave }));
      } catch (storageErr) {}

      // 2. Save to backend API
      try {
        await api.updatePaymentSettings(payloadToSave);
      } catch (apiErr) {
        console.warn('API save notice:', apiErr);
      }

      setForm(payloadToSave);
      setSaveSuccessMsg('Payment & UPI settings saved successfully!');
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Save error:', err);
      alert('Failed to save payment settings');
    } finally {
      setSaving(false);
    }
  };

  const renderSampleLink = (template) => {
    const vpa = encodeURIComponent(form.upi?.vpa || 'r86j742993@mairtel');
    const name = encodeURIComponent(form.upi?.name || 'Meesho Shooping');
    const mcc = form.upi?.mcc || '5499';
    const amount = '15597.00';
    const tr = 'GS6AC38C484D4FB';
    const note = encodeURIComponent(`Flight Booking ${tr}`);
    const currency = 'INR';

    return (template || '')
      .replace(/{vpa}/g, vpa)
      .replace(/{name}/g, name)
      .replace(/{amount}/g, amount)
      .replace(/{note}/g, note)
      .replace(/{tr}/g, tr)
      .replace(/{mc}/g, mcc)
      .replace(/{currency}/g, currency);
  };

  const handleCopyLink = (key, template) => {
    const rendered = renderSampleLink(template);
    navigator.clipboard.writeText(rendered);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleTestLink = (template) => {
    const rendered = renderSampleLink(template);
    window.open(rendered, '_blank');
  };

  const handleResetLinks = () => {
    if (window.confirm('Reset all UPI deep links to standard defaults?')) {
      setForm(prev => ({
        ...prev,
        deepLinks: { ...DEFAULT_DEEP_LINKS }
      }));
    }
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const liveUpiUrl = `upi://pay?pa=${encodeURIComponent(form.upi?.vpa || 'r86j742993@mairtel')}&pn=${encodeURIComponent(form.upi?.name || 'Meesho Shooping')}&mc=${form.upi?.mcc || '5499'}&cu=INR`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(liveUpiUrl)}`;

  if (loading) {
    return (
      <div className="py-24 text-center">
        <RefreshCw className="w-10 h-10 text-amber-500 animate-spin mx-auto mb-3" />
        <p className="text-sm font-bold text-slate-500">Loading Payment Gateway Configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* 1. Header & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            Payments & UPI
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            Turn payment methods on or off, and set the UPI app links customers use
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 border transition-all ${
            form.gatewayActive
              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
              : 'bg-slate-100 text-slate-500 border-slate-200'
          }`}>
            <span className={`w-2 h-2 rounded-full ${form.gatewayActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
            <span>{form.gatewayActive ? 'Gateway Active' : 'Gateway Inactive'}</span>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={form.gatewayActive}
              onChange={(e) => setForm({ ...form, gatewayActive: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-12 h-6.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:start-[3px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
          </label>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fadeIn shadow-xs">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* 2. Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => scrollToSection('payment-toggles')}
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all text-left flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="font-extrabold text-sm text-slate-900">Turn methods on / off</div>
            <div className="text-[11px] text-slate-400">QR, UPI apps, Card, Net Banking</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => scrollToSection('upi-links')}
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all text-left flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Link className="w-5 h-5" />
          </div>
          <div>
            <div className="font-extrabold text-sm text-slate-900">Edit app links</div>
            <div className="text-[11px] text-slate-400">PhonePe, GPay, Paytm scripts</div>
          </div>
        </button>
      </div>

      {/* 3. Payment Mode Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <label className="block font-bold text-xs text-slate-500 uppercase tracking-wider mb-0.5">Payment Mode</label>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold text-slate-900">
                  Currently running on <strong className="text-amber-600">{form.paymentMode === 'manual' ? 'Manual' : 'Auto Gateway'}</strong>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                  {form.paymentMode === 'manual' ? 'You confirm each payment' : 'Instant API Webhook'}
                </span>
              </div>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={form.paymentMode === 'manual'}
              onChange={(e) => setForm({ ...form, paymentMode: e.target.checked ? 'manual' : 'auto' })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-900"></div>
          </label>
        </div>
        <p className="text-xs text-slate-500 pt-1">
          Customers pay by UPI QR or app and you confirm each booking from <strong>Bookings</strong> after checking your account. No gateway account needed.
        </p>
      </div>

      {/* 4. Secure Payment Gateway Hero Card */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-sky-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
              <Zap className="w-3.5 h-3.5" />
              Direct P2M & P2P Real-Time Flow
            </div>
            <h5 className="text-2xl font-black text-white tracking-tight">Secure Payment Gateway</h5>
            <p className="text-slate-300 text-xs leading-relaxed max-w-xl">
              Accept UPI payments directly into your account with 0% gateway commission. Customers scan QR or tap to pay via their favorite UPI app.
            </p>

            <div className="flex flex-wrap gap-3 pt-1 text-xs">
              <div className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15 flex items-center gap-1.5 font-bold text-slate-200">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> 256-bit SSL
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15 flex items-center gap-1.5 font-bold text-slate-200">
                <Zap className="w-4 h-4 text-amber-400" /> Instant QR
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15 flex items-center gap-1.5 font-bold text-slate-200">
                <Smartphone className="w-4 h-4 text-sky-400" /> UPI Apps
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15 flex items-center gap-1.5 font-bold text-slate-200">
                <Building2 className="w-4 h-4 text-indigo-400" /> All Banks
              </div>
            </div>
          </div>

          <div className="md:col-span-4 flex flex-col items-center justify-center text-center">
            <div className="p-3 bg-white rounded-2xl shadow-2xl border border-slate-700">
              <img
                src={qrCodeUrl}
                alt="QR Preview"
                className="w-36 h-36 object-contain rounded-xl"
              />
            </div>
            <span className="text-[11px] font-mono font-bold text-amber-400 mt-2 block">
              {form.upi?.vpa}
            </span>
          </div>
        </div>
      </div>

      {/* 5. 2-Column Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Configuration, Toggles & Deep Links */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Card A: UPI Configuration */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h6 className="font-extrabold text-slate-900 text-base">UPI Configuration</h6>
                <p className="text-xs text-slate-500">Set up your UPI payment details</p>
              </div>
            </div>

            {/* UPI ID */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">UPI ID (VPA) *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">@</span>
                <input
                  type="text"
                  required
                  placeholder="yourname@okicici"
                  value={form.upi?.vpa || ''}
                  onChange={(e) => setForm({ ...form, upi: { ...form.upi, vpa: e.target.value.trim() } })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2.5 font-mono font-bold text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Enter your UPI ID. Example: merchant@okicici, name@ybl</p>
            </div>

            {/* Business Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Business / Account Name</label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="AIR SKY"
                  value={form.upi?.name || ''}
                  onChange={(e) => setForm({ ...form, upi: { ...form.upi, name: e.target.value } })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 font-bold text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Spaces are fine - it is URL-encoded automatically when the link is built.</p>
            </div>

            {/* MCC */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Merchant Category Code (MCC)</label>
              <input
                type="text"
                maxLength={4}
                placeholder="5499"
                value={form.upi?.mcc || ''}
                onChange={(e) => setForm({ ...form, upi: { ...form.upi, mcc: e.target.value.trim() } })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-mono font-bold text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">Travel services is <code className="bg-slate-100 px-1 py-0.5 rounded text-amber-700 font-mono">5499</code>. Sent as the mc parameter.</p>
            </div>
          </div>

          {/* Card B: Payment Methods Shown to Customers */}
          <div id="payment-toggles" className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div>
              <h6 className="font-extrabold text-slate-900 text-sm">Payment Methods Shown to Customers</h6>
              <p className="text-xs text-slate-400 mt-0.5">Switch off anything you don't want to offer. Disabled options are hidden from the payment page.</p>
            </div>

            <div className="space-y-3">
              {[
                { key: 'upiQr', label: 'UPI QR', desc: 'Show a scannable QR code', icon: QrCode, bg: 'bg-slate-900', color: 'text-white' },
                { key: 'upiApps', label: 'UPI Apps', desc: 'PhonePe, GPay, Paytm buttons', icon: Smartphone, bg: 'bg-purple-700', color: 'text-white' },
                { key: 'card', label: 'Card', desc: 'Visa, Mastercard, RuPay, Amex', icon: CreditCard, bg: 'bg-blue-700', color: 'text-white' },
                { key: 'netBanking', label: 'Net Banking', desc: 'Pay via your bank', icon: Building2, bg: 'bg-teal-700', color: 'text-white' }
              ].map(item => {
                const Icon = item.icon;
                const isChecked = !!form.methods?.[item.key];
                return (
                  <div key={item.key} className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 hover:border-slate-200 bg-slate-50/60 transition-all">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl ${item.bg} ${item.color} flex items-center justify-center shadow-xs`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-extrabold text-xs text-slate-900 block">{item.label}</span>
                        <span className="text-[11px] text-slate-400">{item.desc}</span>
                      </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => setForm({
                          ...form,
                          methods: { ...form.methods, [item.key]: e.target.checked }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-amber-500"></div>
                    </label>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card C: UPI App Buttons */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div>
              <h6 className="font-extrabold text-slate-900 text-sm">UPI App Buttons</h6>
              <p className="text-xs text-slate-400 mt-0.5">Individual apps shown inside the "UPI Apps" method. Turning one off hides only that button.</p>
            </div>

            <div className="space-y-3">
              {[
                { key: 'any', label: 'Any UPI app', bg: 'bg-slate-900', color: 'text-white' },
                { key: 'phonepe', label: 'PhonePe', bg: 'bg-[#5f259f]', color: 'text-white' },
                { key: 'gpay', label: 'Google Pay', bg: 'bg-[#4285f4]', color: 'text-white' },
                { key: 'paytm', label: 'Paytm', bg: 'bg-[#00b9f5]', color: 'text-white' },
                { key: 'bhim', label: 'BHIM', bg: 'bg-[#ee3124]', color: 'text-white' },
                { key: 'other', label: 'Other UPI', bg: 'bg-slate-600', color: 'text-white' }
              ].map(app => {
                const isChecked = !!form.apps?.[app.key];
                return (
                  <div key={app.key} className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 hover:border-slate-200 bg-slate-50/60 transition-all">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl ${app.bg} ${app.color} flex items-center justify-center font-bold text-xs shadow-xs`}>
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-extrabold text-xs text-slate-900">{app.label}</span>
                        <span className={`ml-2 text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          isChecked ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {isChecked ? 'Visible to customers' : 'Hidden'}
                        </span>
                      </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => setForm({
                          ...form,
                          apps: { ...form.apps, [app.key]: e.target.checked }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-amber-500"></div>
                    </label>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card D: UPI App Deep Links */}
          <div id="upi-links" className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h6 className="font-extrabold text-slate-900 text-sm">UPI App Deep Links</h6>
                <p className="text-xs text-slate-400 mt-0.5">These are the links that open each payment app directly on customer phones.</p>
              </div>

              <button
                type="button"
                onClick={handleResetLinks}
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to defaults</span>
              </button>
            </div>

            {/* Placeholders Guide */}
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-slate-700 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-900">
                <Info className="w-3.5 h-3.5" />
                Placeholders available:
              </div>
              <div className="flex flex-wrap gap-1 font-mono text-[10px]">
                {['{vpa}', '{name}', '{amount}', '{note}', '{tr}', '{mc}', '{currency}'].map(p => (
                  <code key={p} className="px-1.5 py-0.5 rounded bg-white border border-amber-200 text-amber-800">{p}</code>
                ))}
              </div>
              <p className="text-[10px] text-slate-500 pt-0.5">
                <code>{'{tr}'}</code> is the booking reference and <code>{'{mc}'}</code> the merchant category code.
              </p>
            </div>

            {/* Editors for Each App Link */}
            <div className="space-y-4">
              {[
                { key: 'any', label: 'Any UPI app', scheme: 'upi://', bg: 'bg-slate-900' },
                { key: 'phonepe', label: 'PhonePe', scheme: 'phonepe://', bg: 'bg-[#5f259f]' },
                { key: 'gpay', label: 'Google Pay', scheme: 'tez://', bg: 'bg-[#4285f4]' },
                { key: 'paytm', label: 'Paytm', scheme: 'paytmmp://', bg: 'bg-[#00b9f5]' },
                { key: 'bhim', label: 'BHIM', scheme: 'upi://', bg: 'bg-[#ee3124]' },
                { key: 'other', label: 'Other UPI', scheme: 'upi://', bg: 'bg-slate-600' }
              ].map(app => {
                const currentTemplate = form.deepLinks?.[app.key] || DEFAULT_DEEP_LINKS[app.key];
                const rendered = renderSampleLink(currentTemplate);
                const isVisible = !!form.apps?.[app.key];

                return (
                  <div key={app.key} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-lg ${app.bg} text-white flex items-center justify-center text-[10px]`}>
                          <Smartphone className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-bold text-xs text-slate-900">{app.label}</span>
                        <code className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-700 font-mono">{app.scheme}</code>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                          isVisible ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'
                        }`}>
                          {isVisible ? 'Visible' : 'Hidden'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleTestLink(currentTemplate)}
                          className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                          title="Test open this link on device"
                        >
                          <Play className="w-3 h-3 fill-current" /> Test
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopyLink(app.key, currentTemplate)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                          title="Copy rendered link"
                        >
                          {copiedKey === app.key ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          {copiedKey === app.key ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>

                    <input
                      type="text"
                      value={currentTemplate}
                      onChange={(e) => setForm({
                        ...form,
                        deepLinks: { ...form.deepLinks, [app.key]: e.target.value }
                      })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-mono text-[11px] text-slate-800 focus:outline-none focus:border-amber-500"
                    />

                    <div className="p-2.5 bg-slate-100/70 rounded-xl font-mono text-[10px] text-slate-500 break-all">
                      <span className="font-bold text-slate-400 mr-1.5">Renders as:</span>
                      <span className="text-slate-700">{rendered}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card E: Live QR Preview Box */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs text-center space-y-3">
            <h6 className="font-extrabold text-slate-900 text-sm">Live QR Preview</h6>
            <div className="inline-block p-4 bg-white rounded-2xl border-2 border-dashed border-amber-300 shadow-sm">
              <img
                src={qrCodeUrl}
                alt="QR Preview"
                className="w-48 h-48 mx-auto rounded-xl object-contain"
              />
            </div>
            <p className="text-xs text-slate-500">
              Customers scan this to pay any amount to <strong className="text-amber-600 font-mono">{form.upi?.vpa}</strong>
            </p>
          </div>

        </div>

        {/* RIGHT COLUMN: How It Works & Customer Instructions */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Card 1: How It Works */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center font-bold">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <h6 className="font-extrabold text-slate-900 text-base">How It Works</h6>
                <p className="text-xs text-slate-500">Payment flow for customers</p>
              </div>
            </div>

            <div className="space-y-4 pt-1">
              {[
                { step: '1', title: 'Customer Scans QR', desc: 'Opens any UPI app to scan' },
                { step: '2', title: 'Pays via UPI App', desc: 'PhonePe, GPay, Paytm, etc.' },
                { step: '3', title: 'Clicks "I Have Paid"', desc: 'Submits payment UTR for verification' },
                { step: '4', title: 'You Confirm', desc: 'Verify and confirm from Booking Manager' },
                { step: '5', title: 'Ticket Generated', desc: 'Customer downloads e-ticket' }
              ].map(item => (
                <div key={item.step} className="flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0 mt-0.5">
                    {item.step}
                  </div>
                  <div>
                    <strong className="text-xs font-bold text-slate-900 block">{item.title}</strong>
                    <span className="text-[11px] text-slate-400">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Customer Instructions */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h6 className="font-extrabold text-slate-900 text-base">Customer Instructions</h6>
                <p className="text-xs text-slate-500">Shown during payment checkout</p>
              </div>
            </div>

            <textarea
              rows={5}
              maxLength={1000}
              value={form.instructions || ''}
              onChange={(e) => setForm({ ...form, instructions: e.target.value })}
              placeholder="1. Scan the QR code and pay the exact amount..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-amber-500 leading-relaxed"
            />
            <div className="text-right text-[10px] text-slate-400 font-mono">
              {(form.instructions || '').length}/1000 characters
            </div>
          </div>

        </div>

      </div>

      {/* 6. Bottom Sticky Save Bar */}
      <div className="sticky bottom-4 z-30 p-4 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Changes are saved securely and reflect live on checkout</span>
          </div>
          {saveSuccessMsg && (
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black flex items-center gap-1.5 border border-emerald-300 animate-pulse">
              <Check className="w-3.5 h-3.5 text-emerald-700" />
              <span>UPI & Settings Saved Live!</span>
            </span>
          )}
        </div>

        <button
          type="button"
          disabled={saving}
          onClick={handleSave}
          className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-extrabold rounded-xl text-xs shadow-md shadow-orange-500/20 flex items-center gap-2 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
        >
          {saving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Settings</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
}

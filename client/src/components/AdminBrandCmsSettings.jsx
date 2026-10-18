import React, { useState, useEffect } from 'react';
import {
  Palette,
  Check,
  Upload,
  Trash2,
  Sparkles,
  Building2,
  Phone,
  Mail,
  MessageCircle,
  MapPin,
  Info,
  Save,
  RefreshCw,
  Megaphone,
  Layout,
  Percent,
  CheckCircle2,
  AlertCircle,
  Eye,
  Sliders
} from 'lucide-react';
import { api } from '../utils/api';

const COLOR_PRESETS = [
  {
    name: 'Air Sky Orange (Reference)',
    primary: '#ff6d01',
    hover: '#e65700',
    dark: '#272c33',
    light: '#fff4eb',
    brandText: '#0B1F3A',
    tagline: '#6b7280'
  },
  {
    name: 'Aero Sky Blue',
    primary: '#0284c7',
    hover: '#0369a1',
    dark: '#0f172a',
    light: '#f0f9ff',
    brandText: '#0B1F3A',
    tagline: '#64748b'
  },
  {
    name: 'Royal Emerald',
    primary: '#059669',
    hover: '#047857',
    dark: '#042f2e',
    light: '#ecfdf5',
    brandText: '#064e3b',
    tagline: '#64748b'
  },
  {
    name: 'Sunset Coral',
    primary: '#ea580c',
    hover: '#c2410c',
    dark: '#431407',
    light: '#fff7ed',
    brandText: '#1c1917',
    tagline: '#78716c'
  },
  {
    name: 'Royal Violet',
    primary: '#7c3aed',
    hover: '#6d28d9',
    dark: '#2e1065',
    light: '#f5f3ff',
    brandText: '#3b0764',
    tagline: '#701a75'
  },
  {
    name: 'Midnight Gold',
    primary: '#d97706',
    hover: '#b45309',
    dark: '#451a03',
    light: '#fffbeb',
    brandText: '#451a03',
    tagline: '#78350f'
  }
];

export default function AdminBrandCmsSettings({ onSettingsUpdated }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Active section scroll / tab highlight
  const [activeSubSection, setActiveSubSection] = useState('brand');

  // Form State combining Brand Settings & Website CMS
  const [form, setForm] = useState({
    // Brand Identity
    name: 'AIR SKY',
    short_name: 'Air Sky',
    tagline: 'Premium Luxury Travel',
    logo: '',
    // 6 Colors
    primary_color: '#ff6d01',
    hover_color: '#e65700',
    dark_color: '#272c33',
    light_color: '#fff4eb',
    brand_text_color: '#0B1F3A',
    tagline_color: '#6b7280',
    // Contact & Support
    email: 'care@airskyindia.com',
    phone: '+91 72248 28030',
    whatsapp: '+918077680310',
    address: 'Panchsheel Apartment, Flat No. 204, Plot No. 9, Sector 10, Dwarka, Delhi – 110075',

    // CMS: Announcement Ticker
    announcement: {
      enabled: true,
      text: '🎉 Special Festive Sale: Get Flat ₹500 OFF with code AIRSKY500 | Zero Convenience Fee on UPI!',
      badge: 'Limited Time',
      bgColor: 'bg-gradient-to-r from-amber-600 to-rose-600'
    },

    // CMS: Hero Search Headline & Subtitle
    hero: {
      badgeText: 'Super Fast Real-Time Aviation Search',
      title: 'Fly Anywhere with',
      brandHighlight: 'Air Sky',
      subtitle: 'Ixigo & Cleartrip style live airfares, lowest fare trend, instant seat map & verified PNR tickets.'
    },

    // CMS: Complete Footer Customization
    footer: {
      description: 'Premium Luxury Travel platform delivering fastest bookings, interactive seat pickers, and live fare radar.',
      copyright: '© 2026 AIR SKY. All rights reserved.',
      card1Title: 'Real-Time Live Inventory',
      card1Desc: 'Direct GDS integration ensures 100% accurate seat availability and instant verified airfares.',
      card2Title: 'Instant PNR & Digital Tickets',
      card2Desc: 'Guaranteed immediate airline PNR generation with downloadable boarding pass and SMS updates.',
      card3Title: '24x7 Aviation Support',
      card3Desc: 'Hassle-free web check-in support and instant automated cancellations with swift refund processing.',
      partnerAirlines: 'IndiGo, Air India, Vistara, Akasa Air, SpiceJet, Emirates, Singapore Airlines'
    },

    // CMS: Policies & Pricing
    currency: '₹',
    currencyCode: 'INR',
    gstPercent: 12,
    cancellationFee: 999,
    insuranceFee: 199
  });

  const [fileInputKey, setFileInputKey] = useState(Date.now());
  const [tempLogoUrl, setTempLogoUrl] = useState('');

  // Load both brand & site settings
  const loadData = async () => {
    setLoading(true);
    setErrorMessage('');

    // Pre-populate from localStorage for zero delay
    try {
      const localBrand = localStorage.getItem('asg_brand');
      const localSettings = localStorage.getItem('asg_settings');
      if (localBrand || localSettings) {
        const b = localBrand ? JSON.parse(localBrand) : {};
        const s = localSettings ? JSON.parse(localSettings) : {};
        setForm(prev => ({
          ...prev,
          name: b.name || s.siteName || prev.name,
          short_name: b.short_name || prev.short_name,
          tagline: b.tagline || s.siteTagline || prev.tagline,
          logo: b.logo !== undefined ? b.logo : prev.logo,
          primary_color: b.primary_color || prev.primary_color,
          hover_color: b.hover_color || prev.hover_color,
          dark_color: b.dark_color || prev.dark_color,
          light_color: b.light_color || prev.light_color,
          brand_text_color: b.brand_text_color || prev.brand_text_color,
          tagline_color: b.tagline_color || prev.tagline_color,
          email: b.email || s.supportEmail || prev.email,
          phone: b.phone || s.supportPhone || prev.phone,
          whatsapp: b.whatsapp || prev.whatsapp,
          address: b.address || prev.address,
          footer: { ...prev.footer, ...(b.footer || s.footer || {}) },
          announcement: { ...prev.announcement, ...(s.announcement || {}) },
          hero: { ...prev.hero, ...(s.hero || {}) }
        }));
      }
    } catch (e) {}

    try {
      const [brandRes, settingsRes] = await Promise.all([
        api.getBrand().catch(() => ({ success: false })),
        api.getSettings().catch(() => ({ success: false }))
      ]);

      setForm(prev => {
        const brandData = brandRes?.success && brandRes.data ? brandRes.data : {};
        const siteData = settingsRes?.success && settingsRes.data ? settingsRes.data : {};

        return {
          ...prev,
          // Brand data
          name: brandData.name || siteData.siteName || prev.name,
          short_name: brandData.short_name || prev.short_name,
          tagline: brandData.tagline || siteData.siteTagline || prev.tagline,
          logo: brandData.logo !== undefined ? brandData.logo : prev.logo,
          primary_color: brandData.primary_color || prev.primary_color,
          hover_color: brandData.hover_color || prev.hover_color,
          dark_color: brandData.dark_color || prev.dark_color,
          light_color: brandData.light_color || prev.light_color,
          brand_text_color: brandData.brand_text_color || prev.brand_text_color,
          tagline_color: brandData.tagline_color || prev.tagline_color,
          email: brandData.email || siteData.supportEmail || prev.email,
          phone: brandData.phone || siteData.supportPhone || prev.phone,
          whatsapp: brandData.whatsapp || prev.whatsapp,
          address: brandData.address || prev.address,

          // Footer CMS data
          footer: {
            description: brandData.footer?.description || siteData.footer?.description || prev.footer.description,
            copyright: brandData.footer?.copyright || siteData.footer?.copyright || prev.footer.copyright,
            card1Title: brandData.footer?.card1Title || siteData.footer?.card1Title || prev.footer.card1Title,
            card1Desc: brandData.footer?.card1Desc || siteData.footer?.card1Desc || prev.footer.card1Desc,
            card2Title: brandData.footer?.card2Title || siteData.footer?.card2Title || prev.footer.card2Title,
            card2Desc: brandData.footer?.card2Desc || siteData.footer?.card2Desc || prev.footer.card2Desc,
            card3Title: brandData.footer?.card3Title || siteData.footer?.card3Title || prev.footer.card3Title,
            card3Desc: brandData.footer?.card3Desc || siteData.footer?.card3Desc || prev.footer.card3Desc,
            partnerAirlines: brandData.footer?.partnerAirlines || siteData.footer?.partnerAirlines || prev.footer.partnerAirlines
          },

          // CMS data
          announcement: {
            enabled: siteData.announcement?.enabled ?? prev.announcement.enabled,
            text: siteData.announcement?.text || prev.announcement.text,
            badge: siteData.announcement?.badge || prev.announcement.badge,
            bgColor: siteData.announcement?.bgColor || prev.announcement.bgColor
          },
          hero: {
            badgeText: siteData.hero?.badgeText || prev.hero.badgeText,
            title: siteData.hero?.title || prev.hero.title,
            brandHighlight: siteData.hero?.brandHighlight || brandData.name || prev.hero.brandHighlight,
            subtitle: siteData.hero?.subtitle || prev.hero.subtitle
          },
          currency: siteData.currency || prev.currency,
          currencyCode: siteData.currencyCode || prev.currencyCode,
          gstPercent: siteData.gstPercent !== undefined ? siteData.gstPercent : prev.gstPercent,
          cancellationFee: siteData.cancellationFee !== undefined ? siteData.cancellationFee : prev.cancellationFee,
          insuranceFee: siteData.insuranceFee !== undefined ? siteData.insuranceFee : prev.insuranceFee
        };
      });
    } catch (err) {
      console.error('Error loading brand & CMS data', err);
      setErrorMessage('Failed to load settings from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const applyColorPreset = (preset) => {
    setForm(prev => ({
      ...prev,
      primary_color: preset.primary,
      hover_color: preset.hover,
      dark_color: preset.dark,
      light_color: preset.light,
      brand_text_color: preset.brandText,
      tagline_color: preset.tagline
    }));
  };

  // Handle local image file upload & optimize/compress via Canvas for ultra-fast loading
  const handleLogoFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, SVG, WebP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          // Optimize logo to max 400x120 preserving transparency & aspect ratio
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_W = 400;
          const MAX_H = 120;

          if (width > height) {
            if (width > MAX_W) {
              height = Math.round((height * MAX_W) / width);
              width = MAX_W;
            }
          } else {
            if (height > MAX_H) {
              width = Math.round((width * MAX_H) / height);
              height = MAX_H;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          const optimizedUrl = canvas.toDataURL('image/png', 0.95);
          setForm(prev => ({ ...prev, logo: optimizedUrl }));
        } catch (canvasErr) {
          setForm(prev => ({ ...prev, logo: event.target.result }));
        }
      };
      img.onerror = () => {
        setForm(prev => ({ ...prev, logo: event.target.result }));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleApplyLogoUrl = () => {
    if (tempLogoUrl.trim()) {
      setForm(prev => ({ ...prev, logo: tempLogoUrl.trim() }));
      setTempLogoUrl('');
    }
  };

  const handleRemoveLogo = () => {
    setForm(prev => ({ ...prev, logo: '' }));
    setTempLogoUrl('');
    setFileInputKey(Date.now());
  };

  // Save Both Brand Settings & Website CMS
  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSaveSuccessMsg('');
    setErrorMessage('');

    try {
      const finalLogo = tempLogoUrl.trim() ? tempLogoUrl.trim() : form.logo;

      const brandPayload = {
        name: form.name,
        short_name: form.short_name,
        tagline: form.tagline,
        primary_color: form.primary_color,
        hover_color: form.hover_color,
        dark_color: form.dark_color,
        light_color: form.light_color,
        brand_text_color: form.brand_text_color,
        tagline_color: form.tagline_color,
        logo: finalLogo,
        email: form.email,
        phone: form.phone,
        whatsapp: form.whatsapp,
        address: form.address,
        footer: form.footer
      };

      const settingsPayload = {
        siteName: form.name,
        siteTagline: form.tagline,
        supportEmail: form.email,
        supportPhone: form.phone,
        currency: form.currency,
        currencyCode: form.currencyCode,
        gstPercent: Number(form.gstPercent),
        cancellationFee: Number(form.cancellationFee),
        insuranceFee: Number(form.insuranceFee),
        announcement: form.announcement,
        hero: form.hero,
        footer: form.footer,
        brand: brandPayload
      };

      const [brandRes, settingsRes] = await Promise.all([
        api.updateBrand(brandPayload),
        api.updateSettings(settingsPayload)
      ]);

      if (brandRes?.success || settingsRes?.success) {
        setSaveSuccessMsg('Brand Identity, Logo & Website CRM Saved Live! Logo, colors, footer, ticker & policies are active across the entire website.');

        // Save into localStorage for instant 100% persistent hydration everywhere
        try {
          localStorage.setItem('asg_brand', JSON.stringify(brandPayload));
          localStorage.setItem('asg_settings', JSON.stringify(settingsPayload));
          window.dispatchEvent(new CustomEvent('asg_brand_updated', { detail: brandPayload }));
        } catch (storageErr) {}

        // Live DOM Root Update
        document.documentElement.style.setProperty('--brand', form.primary_color);
        document.documentElement.style.setProperty('--brand-hover', form.hover_color);
        document.documentElement.style.setProperty('--brand-dark', form.dark_color);
        document.documentElement.style.setProperty('--brand-light', form.light_color);
        document.documentElement.style.setProperty('--brand-text', form.brand_text_color);
        document.documentElement.style.setProperty('--tagline-color', form.tagline_color);
        if (form.name) {
          document.title = `${form.name} - ${form.tagline || 'Premium Luxury Travel'}`;
        }
        window.__BRAND__ = brandPayload;

        if (onSettingsUpdated) {
          onSettingsUpdated(settingsPayload);
        }

        setTimeout(() => setSaveSuccessMsg(''), 5000);
      } else {
        setErrorMessage(brandRes?.message || settingsRes?.message || 'Failed to save settings');
      }
    } catch (err) {
      console.error('Error saving brand & CRM settings', err);
      setErrorMessage('Network or server error while saving settings.');
    } finally {
      setSaving(false);
    }
  };

  const scrollToSection = (id) => {
    setActiveSubSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin text-[var(--brand,#ff6d01)] mb-3" />
        <p className="text-sm font-semibold">Loading Brand &amp; Website CRM Settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* TOP HEADER */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold mb-2">
            <Palette className="w-3.5 h-3.5 text-[var(--brand,#ff6d01)]" />
            Unified Brand Identity &amp; Website CMS
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Brand Settings &amp; Website CRM
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Logo, 6 Theme Colors, Support Info, Announcement Ticker, Hero Headlines, aur Pricing Policies ek hi jagah se control karein.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadData}
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
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
                Saving Live...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Save All Changes Live
              </>
            )}
          </button>
        </div>
      </div>

      {/* QUICK JUMP SUB-NAV PILLS */}
      <div className="bg-white rounded-2xl p-2.5 border border-slate-200/80 shadow-xs flex items-center gap-1.5 overflow-x-auto scrollbar-thin">
        {[
          { id: 'sec-brand', label: '1. Brand & Logo', icon: Building2 },
          { id: 'sec-colors', label: '2. 6-Color Palette', icon: Palette },
          { id: 'sec-contact', label: '3. Contact & WhatsApp', icon: Phone },
          { id: 'sec-ticker', label: '4. Announcement Ticker', icon: Megaphone },
          { id: 'sec-hero', label: '5. Hero Headlines', icon: Layout },
          { id: 'sec-footer', label: '6. Footer & Website CMS', icon: Sparkles },
          { id: 'sec-policies', label: '7. Tax & Pricing', icon: Percent }
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => scrollToSection(item.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubSection === item.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <item.icon className="w-3.5 h-3.5" />
            {item.label}
          </button>
        ))}
      </div>

      {/* SUCCESS & ERROR NOTICES */}
      {saveSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold flex items-center gap-3 shadow-sm animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-bold flex items-center gap-3 shadow-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* SECTION 1: BRAND IDENTITY & LOGO */}
      <div id="sec-brand" className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-slate-200/80 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-[var(--brand,#ff6d01)] flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-extrabold text-slate-900">1. Brand Identity &amp; Logo</h4>
              <p className="text-xs text-slate-500">Website Brand Name, Short Name, Tagline aur Logo upload.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Brand Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g. AIR SKY"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold focus:border-[var(--brand,#ff6d01)] focus:outline-hidden"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Short Name</label>
            <input
              type="text"
              value={form.short_name}
              onChange={(e) => handleChange('short_name', e.target.value)}
              placeholder="e.g. Air Sky"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold focus:border-[var(--brand,#ff6d01)] focus:outline-hidden"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Tagline</label>
            <input
              type="text"
              value={form.tagline}
              onChange={(e) => handleChange('tagline', e.target.value)}
              placeholder="e.g. Premium Luxury Travel"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:border-[var(--brand,#ff6d01)] focus:outline-hidden"
            />
          </div>
        </div>

        {/* LOGO UPLOAD & PREVIEW */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-800">Brand Logo</span>
            {form.logo && (
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remove Logo
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* File Upload & URL Inputs */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Upload from Device</label>
                <input
                  key={fileInputKey}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoFileUpload}
                  className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[var(--brand,#ff6d01)] file:text-white hover:file:opacity-90 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Or Paste Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://example.com/logo.png"
                    value={tempLogoUrl}
                    onChange={(e) => {
                      const val = e.target.value;
                      setTempLogoUrl(val);
                      if (val.trim()) {
                        setForm(p => ({ ...p, logo: val.trim() }));
                      }
                    }}
                    className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleApplyLogoUrl}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Apply URL
                  </button>
                </div>
              </div>
            </div>

            {/* Logo Preview Box */}
            <div className="flex items-center justify-center p-4 rounded-xl border border-dashed border-slate-300 bg-white min-h-[100px]">
              {form.logo ? (
                <div className="text-center">
                  <img
                    src={form.logo}
                    alt="Brand Logo"
                    className="max-h-16 max-w-[200px] object-contain mx-auto"
                  />
                  <span className="text-[10px] text-emerald-600 font-bold block mt-1">Logo Active &amp; Ready</span>
                </div>
              ) : (
                <div className="text-center text-slate-400">
                  <Upload className="w-6 h-6 mx-auto mb-1 opacity-50" />
                  <span className="text-xs">No custom logo uploaded (Default icon will show)</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* LIVE HEADER PREVIEW BOX (Matching airskyindia.com reference) */}
        <div>
          <label className="block text-xs font-extrabold text-slate-700 mb-2">Live Header Preview (Real-time Colors &amp; Brand)</label>
          <div
            className="p-4 sm:p-5 rounded-2xl bg-white shadow-md flex items-center justify-between gap-4 transition-all"
            style={{ border: `2px solid ${form.primary_color}` }}
          >
            <div className="flex items-center gap-3">
              {form.logo ? (
                <img src={form.logo} alt="Logo" className="h-10 max-w-[120px] object-contain" />
              ) : (
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white"
                  style={{ backgroundColor: form.primary_color }}
                >
                  {(form.short_name || 'AS').slice(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <div className="font-black text-base tracking-tight" style={{ color: form.brand_text_color }}>
                  {form.name || 'AIR SKY'}
                </div>
                <div className="text-xs font-medium" style={{ color: form.tagline_color }}>
                  {form.tagline || 'Premium Luxury Travel'}
                </div>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-3">
              <span className="text-xs font-bold text-slate-600">24/7 Helpline:</span>
              <span
                className="px-3 py-1.5 rounded-xl font-bold text-xs text-white shadow-xs"
                style={{ backgroundColor: form.primary_color }}
              >
                {form.phone || '+91 72248 28030'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: 6-COLOR THEME PALETTE & PRESETS */}
      <div id="sec-colors" className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-slate-200/80 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-extrabold text-slate-900">2. Website Theme Colors (6-Color Dynamic Palette)</h4>
              <p className="text-xs text-slate-500">Pick any custom hex colors or click 1-click theme presets below.</p>
            </div>
          </div>
        </div>

        {/* 6 Color Inputs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { key: 'primary_color', label: 'Primary Brand' },
            { key: 'hover_color', label: 'Hover Accent' },
            { key: 'dark_color', label: 'Dark Charcoal' },
            { key: 'light_color', label: 'Light Accent' },
            { key: 'brand_text_color', label: 'Brand Text' },
            { key: 'tagline_color', label: 'Tagline Gray' }
          ].map((item) => (
            <div key={item.key} className="p-3 rounded-2xl border border-slate-200 bg-slate-50/50">
              <label className="block text-[11px] font-bold text-slate-700 mb-1 truncate">{item.label}</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form[item.key]}
                  onChange={(e) => handleChange(item.key, e.target.value)}
                  className="w-8 h-8 rounded-lg border-0 cursor-pointer p-0 bg-transparent shrink-0"
                />
                <input
                  type="text"
                  value={form[item.key]}
                  onChange={(e) => handleChange(item.key, e.target.value)}
                  className="w-full text-xs font-mono font-bold uppercase bg-white px-2 py-1.5 rounded-lg border border-slate-200"
                />
              </div>
            </div>
          ))}
        </div>

        {/* 1-Click Theme Presets */}
        <div>
          <span className="text-xs font-extrabold text-slate-700 block mb-2.5">Quick 1-Click Theme Presets</span>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {COLOR_PRESETS.map((preset) => {
              const isMatch = form.primary_color.toLowerCase() === preset.primary.toLowerCase();
              return (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => applyColorPreset(preset)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isMatch
                      ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ backgroundColor: preset.primary }}></span>
                    <span className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ backgroundColor: preset.hover }}></span>
                    <span className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ backgroundColor: preset.dark }}></span>
                  </div>
                  <div className={`text-xs font-black truncate ${isMatch ? 'text-white' : 'text-slate-800'}`}>
                    {preset.name}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION 3: CONTACT & WHATSAPP SUPPORT */}
      <div id="sec-contact" className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-slate-200/80 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-extrabold text-slate-900">3. Contact &amp; Support Channels</h4>
              <p className="text-xs text-slate-500">Website helpline, WhatsApp widget number, and registered office address.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              Support Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="care@airskyindia.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-emerald-500 focus:outline-hidden font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              Helpline Phone Number
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+91 72248 28030"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-emerald-500 focus:outline-hidden font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
              WhatsApp Number
            </label>
            <input
              type="tel"
              value={form.whatsapp}
              onChange={(e) => handleChange('whatsapp', e.target.value)}
              placeholder="+918077680310"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-emerald-500 focus:outline-hidden font-semibold"
            />
            <small className="text-slate-400 text-[11px] mt-1 block">Floating WhatsApp button will open chat with this number.</small>
          </div>

          <div className="sm:col-span-3">
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              Registered Office Address
            </label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Panchsheel Apartment, Flat No. 204, Plot No. 9, Sector 10, Dwarka, Delhi – 110075"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-emerald-500 focus:outline-hidden font-medium"
            />
          </div>
        </div>
      </div>

      {/* SECTION 4: ANNOUNCEMENT TICKER (CMS) */}
      <div id="sec-ticker" className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-slate-200/80 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-extrabold text-slate-900">4. Top Header Announcement Ticker (CMS)</h4>
              <p className="text-xs text-slate-500">Live offer notice bar running on top of every page.</p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={form.announcement?.enabled ?? true}
              onChange={(e) =>
                setForm({
                  ...form,
                  announcement: { ...form.announcement, enabled: e.target.checked }
                })
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--brand,#ff6d01)]"></div>
            <span className="ml-2.5 text-xs font-bold text-slate-700">
              {form.announcement?.enabled ? 'Active (Visible)' : 'Hidden'}
            </span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          <div className="sm:col-span-9">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Announcement Message</label>
            <input
              type="text"
              value={form.announcement?.text || ''}
              onChange={(e) =>
                setForm({
                  ...form,
                  announcement: { ...form.announcement, text: e.target.value }
                })
              }
              placeholder="e.g. 🎉 Special Festive Sale: Get Flat ₹500 OFF with code AIRSKY500"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:outline-hidden focus:border-amber-500"
            />
          </div>
          <div className="sm:col-span-3">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Badge Text</label>
            <input
              type="text"
              value={form.announcement?.badge || ''}
              onChange={(e) =>
                setForm({
                  ...form,
                  announcement: { ...form.announcement, badge: e.target.value }
                })
              }
              placeholder="e.g. Limited Time"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold focus:outline-hidden focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* SECTION 5: HERO SEARCH HEADLINES (CMS) */}
      <div id="sec-hero" className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-slate-200/80 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Layout className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-extrabold text-slate-900">5. Hero Search Section Headlines (CMS)</h4>
              <p className="text-xs text-slate-500">Public homepage banner titles and search subtitle text.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Hero Title Prefix</label>
            <input
              type="text"
              value={form.hero?.title || ''}
              onChange={(e) =>
                setForm({
                  ...form,
                  hero: { ...form.hero, title: e.target.value }
                })
              }
              placeholder="e.g. Fly Anywhere with"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Brand Highlight Word</label>
            <input
              type="text"
              value={form.hero?.brandHighlight || ''}
              onChange={(e) =>
                setForm({
                  ...form,
                  hero: { ...form.hero, brandHighlight: e.target.value }
                })
              }
              placeholder="e.g. Air Sky"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-black text-[var(--brand,#ff6d01)] focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Hero Subtitle</label>
            <textarea
              rows={2}
              value={form.hero?.subtitle || ''}
              onChange={(e) =>
                setForm({
                  ...form,
                  hero: { ...form.hero, subtitle: e.target.value }
                })
              }
              placeholder="e.g. Ixigo & Cleartrip style live airfares, lowest fare trend, instant seat map & verified PNR tickets."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:outline-hidden focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* SECTION 6: FOOTER & WEBSITE CUSTOMIZATION (CMS) */}
      <div id="sec-footer" className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-slate-200/80 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-extrabold text-slate-900">6. Footer &amp; Website Customization (CMS)</h4>
              <p className="text-xs text-slate-500">Footer tagline description, copyright notice, 3 value cards aur partner airlines customize karein.</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Footer Brand Description</label>
              <textarea
                rows={2}
                value={form.footer?.description || ''}
                onChange={(e) => setForm({
                  ...form,
                  footer: { ...form.footer, description: e.target.value }
                })}
                placeholder="e.g. Premium Luxury Travel platform delivering fastest bookings, interactive seat pickers..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Footer Copyright Text</label>
              <input
                type="text"
                value={form.footer?.copyright || ''}
                onChange={(e) => setForm({
                  ...form,
                  footer: { ...form.footer, copyright: e.target.value }
                })}
                placeholder="e.g. © 2026 AIR SKY. All rights reserved."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Partner Airlines (Comma Separated)</label>
            <input
              type="text"
              value={form.footer?.partnerAirlines || ''}
              onChange={(e) => setForm({
                ...form,
                footer: { ...form.footer, partnerAirlines: e.target.value }
              })}
              placeholder="IndiGo, Air India, Vistara, Akasa Air, SpiceJet, Emirates, Singapore Airlines"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          {/* 3 Value Proposition Cards */}
          <div className="pt-2">
            <span className="text-xs font-extrabold text-slate-800 block mb-2">3 Value Proposition Feature Badges (Top of Footer)</span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[11px] font-black text-sky-600 uppercase">Card 1 (Speed/Inventory)</span>
                <input
                  type="text"
                  placeholder="Card Title"
                  value={form.footer?.card1Title || ''}
                  onChange={(e) => setForm({
                    ...form,
                    footer: { ...form.footer, card1Title: e.target.value }
                  })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold bg-white"
                />
                <textarea
                  rows={2}
                  placeholder="Card Description"
                  value={form.footer?.card1Desc || ''}
                  onChange={(e) => setForm({
                    ...form,
                    footer: { ...form.footer, card1Desc: e.target.value }
                  })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-[11px] bg-white resize-none"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[11px] font-black text-emerald-600 uppercase">Card 2 (Security/Tickets)</span>
                <input
                  type="text"
                  placeholder="Card Title"
                  value={form.footer?.card2Title || ''}
                  onChange={(e) => setForm({
                    ...form,
                    footer: { ...form.footer, card2Title: e.target.value }
                  })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold bg-white"
                />
                <textarea
                  rows={2}
                  placeholder="Card Description"
                  value={form.footer?.card2Desc || ''}
                  onChange={(e) => setForm({
                    ...form,
                    footer: { ...form.footer, card2Desc: e.target.value }
                  })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-[11px] bg-white resize-none"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[11px] font-black text-amber-600 uppercase">Card 3 (24x7 Support)</span>
                <input
                  type="text"
                  placeholder="Card Title"
                  value={form.footer?.card3Title || ''}
                  onChange={(e) => setForm({
                    ...form,
                    footer: { ...form.footer, card3Title: e.target.value }
                  })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold bg-white"
                />
                <textarea
                  rows={2}
                  placeholder="Card Description"
                  value={form.footer?.card3Desc || ''}
                  onChange={(e) => setForm({
                    ...form,
                    footer: { ...form.footer, card3Desc: e.target.value }
                  })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-[11px] bg-white resize-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 7: PRICING, TAX & POLICIES (CMS) */}
      <div id="sec-policies" className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-slate-200/80 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-extrabold text-slate-900">7. Pricing, GST Tax &amp; Penalty Policy (CMS)</h4>
              <p className="text-xs text-slate-500">Booking breakdown taxes, cancellation fee, and currency settings.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">GST Tax Rate (%)</label>
            <input
              type="number"
              value={form.gstPercent}
              onChange={(e) => handleChange('gstPercent', parseInt(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold font-mono focus:outline-hidden focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Cancellation Fee (₹)</label>
            <input
              type="number"
              value={form.cancellationFee}
              onChange={(e) => handleChange('cancellationFee', parseInt(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold font-mono focus:outline-hidden focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Travel Insurance (₹)</label>
            <input
              type="number"
              value={form.insuranceFee}
              onChange={(e) => handleChange('insuranceFee', parseInt(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold font-mono focus:outline-hidden focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Currency Symbol</label>
            <input
              type="text"
              value={form.currency}
              onChange={(e) => handleChange('currency', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-black font-mono focus:outline-hidden focus:border-purple-500"
            />
          </div>
        </div>
      </div>

      {/* BOTTOM SAVE BUTTON */}
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
              Saving Brand &amp; Website CMS...
            </>
          ) : (
            <>
              <Check className="w-5 h-5" />
              Save Brand &amp; Website Settings Live
            </>
          )}
        </button>
      </div>
    </div>
  );
}

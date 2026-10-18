import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Sparkles, ShieldCheck, CheckCircle2, 
  Mail, Lock, User, Eye, EyeOff, KeyRound, Ticket, 
  Plane, Building2, Train, Phone, Star, Gift, ArrowRight,
  Shield, Check, Heart, HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

import { api } from '../utils/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const [authMethod, setAuthMethod] = useState('phone'); // 'phone' | 'email'
  const [isRegister, setIsRegister] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [otpValues, setOtpValues] = useState(['', '', '', '']);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [timer, setTimer] = useState(30);
  const [brand, setBrand] = useState(null);

  useEffect(() => {
    api.getBrand().then(res => {
      if (res.success && res.data) setBrand(res.data);
    }).catch(() => {});
  }, []);

  // OTP Countdown Timer
  useEffect(() => {
    let interval = null;
    if (otpStep && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpStep, timer]);

  const triggerCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // Handle Send OTP
  const handleSendOtp = (e) => {
    e?.preventDefault();
    if (!phoneNumber || phoneNumber.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number');
      return;
    }
    setErrorMessage('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOtpStep(true);
      setTimer(30);
    }, 450);
  };

  // Handle Verify OTP
  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    const fullOtp = otpValues.join('');
    if (fullOtp.length < 4) {
      setErrorMessage('Please enter the 4-digit verification code');
      return;
    }
    setLoading(true);
    try {
      const res = await api.customerAuth({
        phone: phoneNumber,
        name: fullName || (isRegister ? fullName : ''),
        method: 'phone'
      });
      const user = res.user || {
        id: 'USR-' + Math.floor(1000 + Math.random() * 9000),
        name: fullName || 'Traveller ' + phoneNumber.slice(-4),
        phone: '+91 ' + phoneNumber,
        role: 'traveller',
        tier: 'SkyClub Member',
        points: 500
      };
      localStorage.setItem('asg_user', JSON.stringify(user));
      triggerCelebration();
      setTimeout(() => navigate('/'), 400);
    } catch (err) {
      setErrorMessage('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Email Submit
  const handleEmailSubmit = async (e) => {
    e?.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter your email and password');
      return;
    }
    setErrorMessage('');
    setLoading(true);
    try {
      const res = await api.customerAuth({
        email: email,
        name: fullName || email.split('@')[0],
        method: 'email'
      });
      const user = res.user || {
        id: 'USR-' + Math.floor(1000 + Math.random() * 9000),
        name: fullName || email.split('@')[0],
        email: email,
        role: 'traveller',
        tier: 'SkyClub Member',
        points: 500
      };
      localStorage.setItem('asg_user', JSON.stringify(user));
      triggerCelebration();
      setTimeout(() => navigate('/'), 400);
    } catch (err) {
      setErrorMessage('Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Social Login
  const handleSocialLogin = async (provider) => {
    setLoading(true);
    try {
      const res = await api.customerAuth({
        email: `customer.${provider.toLowerCase()}@example.com`,
        name: `${provider} Traveller`,
        method: provider
      });
      if (res.user) {
        localStorage.setItem('asg_user', JSON.stringify(res.user));
        triggerCelebration();
        setTimeout(() => navigate('/'), 400);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50/40 to-slate-100 text-slate-800 flex flex-col justify-between relative overflow-x-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Subtle Background Decorative Atmosphere */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-sky-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl pointer-events-none" />

      {/* TOP NAVBAR */}
      <header className="relative z-20 max-w-7xl mx-auto w-full px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-xs border border-slate-200/80 transition-all hover:scale-102 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-sky-600" />
          <span>Back to Home</span>
        </Link>

        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          {brand?.logo ? (
            <img
              src={brand.logo}
              alt={brand.name || 'Brand Logo'}
              className="h-8 sm:h-9 w-auto max-w-[150px] object-contain rounded"
            />
          ) : (
            <div
              className="w-9 h-9 rounded-2xl flex items-center justify-center text-white shadow-md"
              style={{ background: brand?.primary_color || '#ff6d01' }}
            >
              <Plane className="w-5 h-5 rotate-45" />
            </div>
          )}
          <span
            className="text-xl font-black tracking-tight"
            style={{ color: brand?.brand_text_color || '#0B1F3A' }}
          >
            {brand?.name || 'AIR SKY'}
          </span>
        </Link>

        {/* 24x7 Customer Helpline */}
        <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs">
          <Phone className="w-3.5 h-3.5 text-amber-500" />
          <span>24x7 Support: <strong className="text-slate-900">{brand?.phone || '+91 72248 28030'}</strong></span>
        </div>
      </header>

      {/* MAIN CONTAINER: MakeMyTrip-Style 2-Column Luxury Login Card */}
      <main className="relative z-10 max-w-4xl mx-auto w-full px-3 sm:px-6 py-6 sm:py-10 my-auto">
        <div className="bg-white rounded-3xl sm:rounded-4xl shadow-2xl border border-slate-100 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
          
          {/* LEFT COLUMN: Cheerful Travel Imagery & Member Benefits (Visible on md+) */}
          <div className="hidden md:flex md:col-span-5 relative overflow-hidden flex-col justify-between p-7 text-white">
            
            {/* Background scenic photo with warm tropical sunset & ocean */}
            <img
              src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80"
              alt="Dream Holiday Travel"
              className="absolute inset-0 w-full h-full object-cover scale-105"
            />
            {/* Gradient Darkening Overlay for crisp readable text */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-sky-900/40" />

            {/* Top Brand Pill */}
            <div className="relative z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-[11px] font-black uppercase tracking-wider text-amber-300">
                <Sparkles className="w-3.5 h-3.5" />
                AirSky Member Club
              </span>
              <h3 className="text-2xl font-black text-white mt-3 leading-tight">
                Unlock Secret Fares & Instant ₹500 OFF
              </h3>
              <p className="text-xs text-sky-100 mt-1.5">
                Join 2.5 Million+ smart travellers across India.
              </p>
            </div>

            {/* Middle Feature Highlights List */}
            <div className="relative z-10 space-y-3.5 my-auto">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-2.5 rounded-2xl border border-white/20">
                <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xs shrink-0">
                  ₹500
                </div>
                <div className="text-xs">
                  <strong className="block text-white font-extrabold">Flat ₹500 Welcome Discount</strong>
                  <span className="text-[11px] text-sky-100">Use promo code <strong>AIRSKY500</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-2.5 rounded-2xl border border-white/20">
                <div className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0">
                  <Plane className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <strong className="block text-white font-extrabold">Zero Convenience Fee</strong>
                  <span className="text-[11px] text-sky-100">Direct flight & hotel bookings</span>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-2.5 rounded-2xl border border-white/20">
                <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <strong className="block text-white font-extrabold">1-Click Fast Web Check-in</strong>
                  <span className="text-[11px] text-sky-100">IndiGo, Air India, Akasa & SpiceJet</span>
                </div>
              </div>
            </div>

            {/* Bottom Customer Testimonial Card */}
            <div className="relative z-10 bg-slate-950/70 backdrop-blur-md rounded-2xl p-3 border border-white/15">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-current" />
                  ))}
                </div>
                <span className="text-[10px] font-bold text-white">4.9/5 Rating</span>
              </div>
              <p className="text-[11px] text-slate-200 italic">
                "Saved ₹1,400 on our family flights to Goa. The PNR status tracker is super quick!"
              </p>
              <span className="text-[10px] text-sky-300 font-bold block mt-1">
                — Pooja Verma, Verified Traveller
              </span>
            </div>

          </div>

          {/* RIGHT COLUMN: Clean, High-Contrast White Login Form (MakeMyTrip Style) */}
          <div className="md:col-span-7 p-6 sm:p-9 flex flex-col justify-between">
            <div>
              
              {/* Form Heading */}
              <div className="mb-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {isRegister ? 'Create Your Account' : 'Login / Sign Up'}
                  </h2>
                  <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-100">
                    Free
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Enter your mobile number to get instant OTP & member pricing.
                </p>
              </div>

              {/* Method Switcher: Mobile Number (OTP) vs Email */}
              <div className="flex border-b border-slate-200 mb-5 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => { setAuthMethod('phone'); setOtpStep(false); setErrorMessage(''); }}
                  className={`pb-2.5 px-3 border-b-2 cursor-pointer transition-all flex items-center gap-1.5 ${
                    authMethod === 'phone'
                      ? 'border-sky-600 text-sky-600 font-extrabold'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span>Mobile Number (OTP)</span>
                  <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.2 rounded-full font-black">FAST</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMethod('email'); setErrorMessage(''); }}
                  className={`pb-2.5 px-3 border-b-2 cursor-pointer transition-all ${
                    authMethod === 'email'
                      ? 'border-sky-600 text-sky-600 font-extrabold'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Email & Password
                </button>
              </div>

              {/* Error Message Alert */}
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2"
                >
                  <span className="shrink-0">⚠️</span>
                  <span>{errorMessage}</span>
                </motion.div>
              )}

              {/* METHOD 1: MOBILE NUMBER WITH OTP (Real Indian Travel Pattern) */}
              {authMethod === 'phone' ? (
                <div>
                  {!otpStep ? (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                      {isRegister && (
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name</label>
                          <div className="relative">
                            <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                            <input
                              type="text"
                              placeholder="e.g. Aman Sharma"
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500 transition-colors"
                            />
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Mobile Number
                        </label>
                        <div className="flex rounded-2xl border-2 border-slate-200 bg-slate-50/70 overflow-hidden focus-within:border-sky-600 focus-within:bg-white transition-all shadow-xs">
                          <span className="flex items-center gap-1.5 px-3.5 text-xs font-extrabold text-slate-800 bg-slate-100 border-r border-slate-200">
                            <span>🇮🇳</span>
                            <span>+91</span>
                          </span>
                          <input
                            type="tel"
                            maxLength={10}
                            autoFocus
                            placeholder="Enter 10-digit mobile number"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                            className="w-full px-3.5 py-3 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
                          />
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">We will send a 4-digit verification code to this number.</p>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-600 via-blue-600 to-sky-700 hover:from-sky-500 hover:to-blue-500 text-white font-extrabold text-sm shadow-lg shadow-sky-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                      >
                        {loading ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <span>Continue</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </form>
                  ) : (
                    /* OTP VERIFICATION STEP */
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                      <div className="text-center py-1">
                        <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-2 border border-sky-100">
                          <KeyRound className="w-6 h-6" />
                        </div>
                        <h4 className="text-base font-extrabold text-slate-900">Enter Verification Code</h4>
                        <p className="text-xs text-slate-500 mt-1">
                          Code sent to <strong className="text-slate-900">+91 {phoneNumber}</strong>{' '}
                          <button
                            type="button"
                            onClick={() => setOtpStep(false)}
                            className="text-sky-600 font-bold hover:underline cursor-pointer ml-1"
                          >
                            Change
                          </button>
                        </p>
                      </div>

                      {/* 4 Digit OTP Inputs */}
                      <div className="flex justify-center gap-3 my-4">
                        {[0, 1, 2, 3].map((idx) => (
                          <input
                            key={idx}
                            id={`otp-box-${idx}`}
                            type="text"
                            maxLength={1}
                            value={otpValues[idx]}
                            autoFocus={idx === 0}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, '');
                              const newVals = [...otpValues];
                              newVals[idx] = val;
                              setOtpValues(newVals);
                              if (val && idx < 3) {
                                document.getElementById(`otp-box-${idx + 1}`)?.focus();
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Backspace' && !otpValues[idx] && idx > 0) {
                                document.getElementById(`otp-box-${idx - 1}`)?.focus();
                              }
                            }}
                            className="w-12 sm:w-14 h-12 sm:h-14 text-center text-xl font-black rounded-2xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-sky-600 focus:outline-none focus:ring-4 focus:ring-sky-500/10 transition-all"
                          />
                        ))}
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-600 via-blue-600 to-sky-700 hover:from-sky-500 hover:to-blue-500 text-white font-extrabold text-sm shadow-lg shadow-sky-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                      >
                        {loading ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <span>Verify & Sign In</span>
                        )}
                      </button>

                      <div className="text-center text-xs text-slate-500 pt-1">
                        {timer > 0 ? (
                          <span>Resend OTP in <strong className="text-slate-800">{timer}s</strong></span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setTimer(30)}
                            className="text-sky-600 font-extrabold hover:underline cursor-pointer"
                          >
                            Resend Code
                          </button>
                        )}
                      </div>
                    </form>
                  )}
                </div>
              ) : (
                /* METHOD 2: EMAIL & PASSWORD */
                <form onSubmit={handleEmailSubmit} className="space-y-3.5">
                  {isRegister && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="e.g. Aman Sharma"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-bold text-slate-700">Password</label>
                      <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Password reset instructions have been sent to your email.'); }} className="text-[11px] font-semibold text-sky-600 hover:underline">
                        Forgot?
                      </a>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-600 via-blue-600 to-sky-700 hover:from-sky-500 hover:to-blue-500 text-white font-extrabold text-sm shadow-lg shadow-sky-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>{isRegister ? 'Create Free Account' : 'Sign In with Email'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* SOCIAL LOGINS */}
              {!otpStep && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                    Or Sign In With
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleSocialLogin('Google')}
                      className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-all cursor-pointer shadow-2xs hover:border-slate-300"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span>Google</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSocialLogin('Apple')}
                      className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-all cursor-pointer shadow-2xs hover:border-slate-300"
                    >
                      <svg className="w-4 h-4 fill-slate-900" viewBox="0 0 24 24">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.84c.66-.82 1.11-1.96.99-3.1-.96.04-2.18.66-2.87 1.48-.61.71-1.15 1.88-1.01 2.99 1.08.08 2.22-.55 2.89-1.37z" />
                      </svg>
                      <span>Apple ID</span>
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Terms and Trust Security Assurances */}
            <div className="pt-4 border-t border-slate-100 text-center">
              <p className="text-[10px] text-slate-400">
                By continuing, you agree to AirSkyGo's{' '}
                <a href="#terms" className="text-slate-600 underline font-semibold">Terms of Service</a> &{' '}
                <a href="#privacy" className="text-slate-600 underline font-semibold">Privacy Policy</a>.
              </p>
              <div className="flex items-center justify-center gap-3 text-[10px] text-slate-400 mt-2">
                <span className="flex items-center gap-1 text-emerald-600 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" /> 256-Bit SSL Encrypted
                </span>
                <span>•</span>
                <span>IATA Accredited Agency</span>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="relative z-20 max-w-7xl mx-auto w-full px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 border-t border-slate-200/80 gap-2">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
            <CheckCircle2 className="w-4 h-4" /> 100% Secure Checkout
          </span>
          <span>•</span>
          <span>PCI-DSS Level 1 Compliant</span>
          <span>•</span>
          <span>Official IRCTC Booking Partner</span>
        </div>
        <div>
          © {new Date().getFullYear()} AirSkyGo Technologies Pvt. Ltd. All rights reserved.
        </div>
      </footer>

    </div>
  );
}

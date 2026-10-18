import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Smartphone, Mail, Lock, User, ArrowRight, 
  CheckCircle2, ShieldAlert, Sparkles, KeyRound, 
  Star, Plane, Eye, EyeOff
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../utils/api';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [authTab, setAuthTab] = useState('traveller'); // 'traveller' | 'register'
  const [method, setMethod] = useState('phone'); // 'phone' | 'email'
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

  // Countdown timer for OTP
  useEffect(() => {
    let interval = null;
    if (otpStep && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpStep, timer]);

  if (!isOpen) return null;

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

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

  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    const fullOtp = otpValues.join('');
    if (fullOtp.length < 4) {
      setErrorMessage('Please enter the 4-digit code');
      return;
    }
    setLoading(true);
    try {
      const res = await api.customerAuth({
        phone: phoneNumber,
        name: fullName,
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
      triggerConfetti();
      if (onLoginSuccess) onLoginSuccess(user);
      onClose();
    } catch (err) {
      setErrorMessage('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
      triggerConfetti();
      if (onLoginSuccess) onLoginSuccess(user);
      onClose();
    } catch (err) {
      setErrorMessage('Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

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
        triggerConfetti();
        if (onLoginSuccess) onLoginSuccess(res.user);
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-slate-950/65 backdrop-blur-sm">
      
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-3xl bg-white rounded-3xl sm:rounded-4xl shadow-2xl border border-slate-100 overflow-hidden grid grid-cols-1 md:grid-cols-12 my-auto max-h-[92vh]"
      >
        {/* Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LEFT COLUMN: Cheerful Travel Visual (Visible on md+) */}
        <div className="hidden md:flex md:col-span-5 relative overflow-hidden flex-col justify-between p-6 text-white">
          <img
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=700&q=80"
            alt="Travel"
            className="absolute inset-0 w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-sky-900/40" />

          {/* Top Badge */}
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-[10px] font-black uppercase tracking-wider text-amber-300">
              <Sparkles className="w-3.5 h-3.5" />
              Member Club
            </span>
            <h3 className="text-xl font-black text-white mt-2.5 leading-snug">
              Flat ₹500 OFF On Flights & Hotels
            </h3>
            <p className="text-xs text-sky-100 mt-1">
              Join 2.5M+ happy travellers.
            </p>
          </div>

          {/* Perks List */}
          <div className="relative z-10 space-y-2.5 my-auto">
            <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/20 text-xs">
              <div className="w-7 h-7 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-black text-[11px] shrink-0">
                ₹500
              </div>
              <div>
                <strong className="block text-white">Use Code AIRSKY500</strong>
                <span className="text-[10px] text-sky-100">Flat discount on 1st booking</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/20 text-xs">
              <div className="w-7 h-7 rounded-lg bg-sky-500 text-white flex items-center justify-center shrink-0">
                <Plane className="w-3.5 h-3.5" />
              </div>
              <div>
                <strong className="block text-white">Zero Convenience Fee</strong>
                <span className="text-[10px] text-sky-100">Direct airline partner fares</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/20 text-xs">
              <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <div>
                <strong className="block text-white">Fast Web Check-in</strong>
                <span className="text-[10px] text-sky-100">IndiGo, Air India & SpiceJet</span>
              </div>
            </div>
          </div>

          {/* Testimonial */}
          <div className="relative z-10 bg-slate-950/70 backdrop-blur-md rounded-xl p-2.5 border border-white/15">
            <div className="flex text-amber-400 mb-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-2.5 h-2.5 fill-current" />
              ))}
            </div>
            <p className="text-[10px] text-slate-200 italic">
              "Booking tickets on AirSkyGo takes under 60 seconds. Love the instant PNR check!"
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Clean White Form (MakeMyTrip Style) */}
        <div className="md:col-span-7 p-6 sm:p-7 flex flex-col justify-between overflow-y-auto">
          <div>
            
            {/* Header */}
            <div className="mb-4 pr-8">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                {authTab === 'traveller' ? 'Login / Sign Up' : 'Create Free Account'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Enter your mobile number to get instant OTP & member pricing.
              </p>
            </div>

            {/* Method Switcher */}
            <div className="flex border-b border-slate-200 mb-4 text-xs font-bold">
              <button
                type="button"
                onClick={() => { setMethod('phone'); setOtpStep(false); setErrorMessage(''); }}
                className={`pb-2 px-3 border-b-2 cursor-pointer transition-all flex items-center gap-1.5 ${
                  method === 'phone'
                    ? 'border-sky-600 text-sky-600 font-extrabold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>Mobile Number (OTP)</span>
                <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.2 rounded-full font-black">FAST</span>
              </button>
              <button
                type="button"
                onClick={() => { setMethod('email'); setErrorMessage(''); }}
                className={`pb-2 px-3 border-b-2 cursor-pointer transition-all ${
                  method === 'email'
                    ? 'border-sky-600 text-sky-600 font-extrabold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Email & Password
              </button>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2"
              >
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </motion.div>
            )}

            {/* METHOD 1: PHONE + OTP */}
            {method === 'phone' ? (
              <div>
                {!otpStep ? (
                  <form onSubmit={handleSendOtp} className="space-y-3.5">
                    {authTab === 'register' && (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            placeholder="e.g. Aman Sharma"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Mobile Number
                      </label>
                      <div className="flex rounded-2xl border-2 border-slate-200 bg-slate-50/70 overflow-hidden focus-within:border-sky-600 focus-within:bg-white transition-all shadow-xs">
                        <span className="flex items-center gap-1.5 px-3 text-xs font-extrabold text-slate-800 bg-slate-100 border-r border-slate-200">
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
                          className="w-full px-3 py-2.5 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 rounded-2xl bg-gradient-to-r from-sky-600 via-blue-600 to-sky-700 hover:from-sky-500 hover:to-blue-500 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-sky-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
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
                  <form onSubmit={handleVerifyOtp} className="space-y-3">
                    <div className="text-center py-1">
                      <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-1 border border-sky-100">
                        <KeyRound className="w-5 h-5" />
                      </div>
                      <h4 className="text-sm font-extrabold text-slate-900">Enter Verification Code</h4>
                      <p className="text-xs text-slate-500">
                        Sent to <strong className="text-slate-900">+91 {phoneNumber}</strong>{' '}
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
                    <div className="flex justify-center gap-2.5 my-2">
                      {[0, 1, 2, 3].map((idx) => (
                        <input
                          key={idx}
                          id={`modal-otp-${idx}`}
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
                              document.getElementById(`modal-otp-${idx + 1}`)?.focus();
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Backspace' && !otpValues[idx] && idx > 0) {
                              document.getElementById(`modal-otp-${idx - 1}`)?.focus();
                            }
                          }}
                          className="w-11 h-11 text-center text-lg font-black rounded-xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-sky-600 focus:outline-none transition-all"
                        />
                      ))}
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 rounded-2xl bg-gradient-to-r from-sky-600 via-blue-600 to-sky-700 hover:from-sky-500 hover:to-blue-500 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-sky-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <span>Verify & Sign In</span>
                      )}
                    </button>

                    <div className="text-center text-xs text-slate-500">
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
              <form onSubmit={handleEmailSubmit} className="space-y-3">
                {authTab === 'register' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="e.g. Aman Sharma"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-slate-700">Password</label>
                    <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Password reset instructions have been sent to your email.'); }} className="text-[11px] font-semibold text-sky-600 hover:underline">
                      Forgot?
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-9 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-sky-600 via-blue-600 to-sky-700 hover:from-sky-500 hover:to-blue-500 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-sky-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{authTab === 'register' ? 'Create Free Account' : 'Sign In with Email'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Social Logins */}
            {!otpStep && (
              <div className="mt-3.5 pt-3 border-t border-slate-100">
                <div className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Or Sign In With
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleSocialLogin('Google')}
                    className="flex items-center justify-center gap-2 p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-all cursor-pointer shadow-2xs hover:border-slate-300"
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
                    className="flex items-center justify-center gap-2 p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-all cursor-pointer shadow-2xs hover:border-slate-300"
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

          {/* Footer Assurances */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1 text-emerald-600 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" /> 256-Bit SSL Encrypted
            </span>
            <span>IATA Certified Agency</span>
          </div>

        </div>

      </motion.div>
    </div>
  );
}

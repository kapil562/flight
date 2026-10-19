import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Mail, Lock, User, ArrowRight, 
  CheckCircle2, ShieldAlert, Sparkles, 
  Star, Plane, Eye, EyeOff, ArrowLeft, Send
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  updateProfile,
  formatFirebaseUser,
  getFirebaseErrorMessage
} from '../utils/firebaseAuth';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleSuccess = (firebaseUser, customName = '') => {
    const user = formatFirebaseUser(firebaseUser, customName);
    localStorage.setItem('asg_user', JSON.stringify(user));
    triggerConfetti();
    if (onLoginSuccess) onLoginSuccess(user);
    onClose();
  };

  // Google 1-Click Sign-in
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result?.user) {
        handleSuccess(result.user);
      }
    } catch (err) {
      console.error('Google Sign-in Error:', err);
      setErrorMessage(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Email / Password Login or Sign-Up
  const handleEmailAuth = async (e) => {
    e?.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      if (authMode === 'register') {
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        if (fullName.trim()) {
          try {
            await updateProfile(userCredential.user, { displayName: fullName.trim() });
          } catch (e) {}
        }
        handleSuccess(userCredential.user, fullName.trim());
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
        handleSuccess(userCredential.user);
      }
    } catch (err) {
      console.error('Email Auth Error:', err);
      setErrorMessage(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password Reset Link
  const handleForgotPassword = async (e) => {
    e?.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter the email address associated with your account.');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSuccessMessage(`Password reset link sent to ${email.trim()}! Please check your email inbox and spam folder.`);
    } catch (err) {
      console.error('Password Reset Error:', err);
      setErrorMessage(getFirebaseErrorMessage(err));
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
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-3xl bg-white rounded-3xl sm:rounded-4xl shadow-2xl border border-slate-100 overflow-hidden grid grid-cols-1 md:grid-cols-12 my-auto max-h-[92vh]"
      >
        {/* Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LEFT COLUMN: Travel Visual & Benefits */}
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
                <span className="text-[10px] text-sky-100">Instant flat discount</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/20 text-xs">
              <div className="w-7 h-7 rounded-lg bg-sky-500 text-white flex items-center justify-center shrink-0">
                <Plane className="w-3.5 h-3.5" />
              </div>
              <div>
                <strong className="block text-white">Direct Airline Partner Fares</strong>
                <span className="text-[10px] text-sky-100">Zero convenience fee</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/20 text-xs">
              <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <div>
                <strong className="block text-white">Fast Web Check-in & PNR</strong>
                <span className="text-[10px] text-sky-100">Live flight status & baggage</span>
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
              "Sign in with Google is instant. Love the quick PNR search and seat layout!"
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Auth Form */}
        <div className="md:col-span-7 p-6 sm:p-7 flex flex-col justify-between overflow-y-auto">
          <div>
            
            {/* Header */}
            <div className="mb-4 pr-8">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                {authMode === 'forgot' 
                  ? 'Reset Password' 
                  : authMode === 'register' 
                    ? 'Create Free Account' 
                    : 'Sign In to Your Account'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {authMode === 'forgot'
                  ? 'Enter your registered email and we will send you a reset link.'
                  : 'Access your trips, check-in, bookings and exclusive member fares.'}
              </p>
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

            {/* Success Message */}
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMessage}</span>
              </motion.div>
            )}

            {/* MODE 1: FORGOT PASSWORD */}
            {authMode === 'forgot' ? (
              <form onSubmit={handleForgotPassword} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Registered Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      autoFocus
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-sky-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Reset Link</span>
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => { setAuthMode('login'); setErrorMessage(''); setSuccessMessage(''); }}
                    className="text-xs font-bold text-sky-600 hover:text-sky-700 hover:underline flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Sign In</span>
                  </button>
                </div>
              </form>
            ) : (
              <div>
                {/* 1-Click Google Sign In (Primary Provider) */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-2xl border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800 font-extrabold text-xs sm:text-sm transition-all cursor-pointer shadow-xs flex items-center justify-center gap-3 active:scale-98 disabled:opacity-50 mb-3.5"
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                {/* Divider */}
                <div className="relative flex items-center justify-center my-3">
                  <div className="border-t border-slate-200 w-full"></div>
                  <span className="bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider relative shrink-0">
                    Or with Email
                  </span>
                </div>

                {/* Tabs: Sign In / Create Account */}
                <div className="flex border-b border-slate-200 mb-3.5 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => { setAuthMode('login'); setErrorMessage(''); setSuccessMessage(''); }}
                    className={`pb-2 px-3 border-b-2 cursor-pointer transition-all ${
                      authMode === 'login'
                        ? 'border-sky-600 text-sky-600 font-extrabold'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAuthMode('register'); setErrorMessage(''); setSuccessMessage(''); }}
                    className={`pb-2 px-3 border-b-2 cursor-pointer transition-all ${
                      authMode === 'register'
                        ? 'border-sky-600 text-sky-600 font-extrabold'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Create Account
                  </button>
                </div>

                {/* Email + Password Form */}
                <form onSubmit={handleEmailAuth} className="space-y-3">
                  {authMode === 'register' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          required
                          placeholder="e.g. Rahul Sharma"
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
                        required
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
                      {authMode === 'login' && (
                        <button
                          type="button"
                          onClick={() => { setAuthMode('forgot'); setErrorMessage(''); setSuccessMessage(''); }}
                          className="text-[11px] font-semibold text-sky-600 hover:underline cursor-pointer"
                        >
                          Forgot Password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-9 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-sky-600 via-blue-600 to-sky-700 hover:from-sky-500 hover:to-blue-500 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-sky-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 mt-1"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>{authMode === 'register' ? 'Create Free Account' : 'Sign In with Email'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

          </div>

          {/* Footer Assurances */}
          <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1 text-emerald-600 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Firebase Secure Authentication
            </span>
            <span>256-Bit SSL Encrypted</span>
          </div>

        </div>

      </motion.div>
    </div>
  );
}

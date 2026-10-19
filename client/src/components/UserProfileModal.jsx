import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Mail, Phone, ShieldCheck, Sparkles, Ticket, LogOut, CheckCircle2, ArrowRight } from 'lucide-react';

export default function UserProfileModal({ currentUser, onClose, onUpdateUser, onOpenMyBookings, onLogout }) {
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    const updated = {
      ...currentUser,
      name: name.trim() || currentUser?.name || 'Valued Traveller',
      email: email.trim(),
      phone: phone.trim()
    };

    try {
      localStorage.setItem('asg_user', JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('asg_user_updated', { detail: updated }));
    } catch (err) {
      console.warn('Error saving to localStorage', err);
    }

    if (onUpdateUser) {
      onUpdateUser(updated);
    }

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const avatarUrl = currentUser?.avatar || currentUser?.photoURL || 
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name || currentUser?.name || 'Traveller')}&background=0284c7&color=fff&bold=true`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto"
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 px-5 py-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shrink-0">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-extrabold tracking-tight">Manage Profile</h3>
                <p className="text-xs text-sky-100/90 font-medium truncate">View and update your personal travel details</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0 ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-4 sm:p-5 space-y-4">
            {/* User Overview Pill */}
            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <img
                src={avatarUrl}
                alt={name || 'User'}
                className="w-13 h-13 rounded-2xl object-cover border-2 border-sky-500 shadow-md shadow-sky-500/10 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-black text-slate-900 truncate">{name || 'Traveller'}</h4>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold shrink-0">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    Verified
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate mt-0.5">{email || phone || 'Registered Member'}</p>
                <div className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                  <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                  <span className="truncate">{currentUser?.tier || 'SkyClub Platinum'} • {currentUser?.points || 1250} Miles</span>
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <form onSubmit={handleSave} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {savedSuccess && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Profile updated successfully!</span>
                </div>
              )}

              {/* Quick Link to Manage Bookings */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenMyBookings) onOpenMyBookings();
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-sky-50/80 hover:bg-sky-100/80 border border-sky-100 text-sky-900 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-xs shrink-0">
                    <Ticket className="w-4 h-4" />
                  </div>
                  <div className="text-left min-w-0">
                    <div className="text-xs font-black truncate">Manage Bookings</div>
                    <div className="text-[10px] text-sky-700/80 font-medium truncate">View your tickets & download invoice</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-sky-600 group-hover:translate-x-1 transition-transform shrink-0 ml-2" />
              </button>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="h-11 px-5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold transition-colors cursor-pointer shrink-0"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-11 px-6 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-black shadow-md shadow-sky-600/25 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  Save Changes
                </button>
              </div>
            </form>

            {/* Logout Row */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 truncate max-w-[180px]">Signed in as {currentUser?.name || 'User'}</span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onLogout) onLogout();
                }}
                className="inline-flex items-center gap-1.5 text-rose-600 hover:text-rose-700 font-bold hover:underline cursor-pointer shrink-0 ml-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

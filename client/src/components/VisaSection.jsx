import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe2, Clock, CheckCircle2, ShieldCheck, FileText, ArrowRight, X, Sparkles, Upload } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../utils/api';

export default function VisaSection() {
  const [visas, setVisas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVisa, setSelectedVisa] = useState(null);
  const [appliedSuccess, setAppliedSuccess] = useState(false);
  const [applicantName, setApplicantName] = useState('');
  const [passportNumber, setPassportNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchVisa = async () => {
      setLoading(true);
      try {
        const res = await api.getVisa();
        if (res.success) setVisas(res.data);
      } catch (err) {
        console.error('Failed to load visa:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchVisa();
  }, []);

  const handleApplyVisa = async (e) => {
    e.preventDefault();
    if (!selectedVisa) return;
    setSubmitting(true);
    try {
      await api.applyVisa({
        country: selectedVisa.country,
        visaType: selectedVisa.type,
        applicantName,
        passportNumber,
        phone,
        fee: selectedVisa.price
      });
    } catch (err) {
      console.error('Visa application error:', err);
    } finally {
      setSubmitting(false);
      setSelectedVisa(null);
      setAppliedSuccess(true);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    }
  };

  return (
    <div className="py-6 sm:py-8 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
      
      {/* Banner */}
      <div className="bg-slate-950 rounded-3xl sm:rounded-4xl p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden mb-8 border border-white/10">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-slate-200 text-xs font-bold border border-white/15 mb-3">
            <Globe2 className="w-3.5 h-3.5 text-amber-300" />
            Hassle-Free Global Visa Concierge
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight mb-2">
            Tourist &amp; Business Visas Approved Fast
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-medium">
            99.2% approval rate. Instant online document verification, express processing &amp; doorstep pickup.
          </p>
        </div>
      </div>

      {/* Visas Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(n => (
            <div key={n} className="bg-white rounded-3xl p-6 border border-slate-200/80 animate-pulse h-60" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visas.map(visa => (
            <motion.div
              key={visa.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-3xl">{visa.flag}</div>
                  <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-slate-100 text-slate-800">
                    {visa.entry}
                  </span>
                </div>

                <h3 className="text-xl font-black text-slate-900 tracking-tight">{visa.country}</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">{visa.type}</p>

                <div className="mt-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5" /> Processing Time
                    </span>
                    <strong className="text-slate-900 font-black">{visa.processingDays}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Validity</span>
                    <strong className="text-slate-900 font-black">{visa.validity}</strong>
                  </div>
                </div>

                {/* Requirements */}
                <div className="mt-4 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Required Documents</span>
                  {visa.requirements.slice(0, 3).map((req, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{req}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price & Action */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-2xl font-black text-slate-900 font-mono">
                    ₹{visa.price.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">Govt fee + assistance incl.</span>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedVisa(visa)}
                  className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-black text-white font-black text-xs shadow-md transition-all cursor-pointer active:scale-95"
                >
                  Apply Visa
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* VISA APPLICATION MODAL */}
      <AnimatePresence>
        {selectedVisa && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md">
            <div className="fixed inset-0" onClick={() => setSelectedVisa(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative z-10 w-full max-w-lg bg-white rounded-3xl sm:rounded-4xl shadow-2xl p-6 sm:p-7 border border-slate-200/80 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{selectedVisa.flag}</span>
                  <div>
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">Express Visa Desk</span>
                    <h3 className="text-base font-black text-slate-900">{selectedVisa.country}</h3>
                  </div>
                </div>
                <button onClick={() => setSelectedVisa(null)} className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleApplyVisa} className="space-y-4 py-4">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs font-bold text-slate-800 font-mono">
                  <div>Type: {selectedVisa.type}</div>
                  <div className="text-slate-900 font-black text-sm">Fee: ₹{selectedVisa.price}</div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Applicant Full Name (As per Passport)</label>
                  <input
                    type="text"
                    required
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    placeholder="e.g. Aman Sharma"
                    className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 focus:border-slate-900 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Passport Number</label>
                    <input
                      type="text"
                      required
                      value={passportNumber}
                      onChange={(e) => setPassportNumber(e.target.value)}
                      placeholder="e.g. Z1234567"
                      className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 focus:border-slate-900 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none uppercase font-mono transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">WhatsApp Phone</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 focus:border-slate-900 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Document Upload Hint */}
                <div className="p-3.5 border-2 border-dashed border-slate-200 rounded-2xl text-center bg-slate-50 hover:bg-slate-100/60 transition-colors cursor-pointer">
                  <Upload className="w-5 h-5 text-slate-600 mx-auto mb-1" />
                  <span className="text-xs font-bold text-slate-800">Upload Passport Copy (PDF / JPG)</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">Or share with your assigned visa desk officer on WhatsApp</p>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-black text-white font-black text-sm shadow-md transition-all cursor-pointer disabled:opacity-50 active:scale-[0.98]"
                >
                  {submitting ? 'Submitting Application...' : 'Submit Application & Assign Officer'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SUCCESS CONFIRMATION */}
      <AnimatePresence>
        {appliedSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl sm:rounded-4xl p-6 sm:p-7 max-w-md w-full text-center shadow-2xl border border-slate-200/80"
            >
              <div className="w-13 h-13 bg-slate-950 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md">
                <CheckCircle2 className="w-7 h-7 text-emerald-400 stroke-[2.5]" />
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Visa Application Initiated</h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Your dedicated Visa Officer has been assigned and will verify your documents within 2 hours.
              </p>
              <button
                type="button"
                onClick={() => setAppliedSuccess(false)}
                className="w-full mt-4 py-2.5 bg-slate-900 hover:bg-black text-white font-black rounded-2xl text-xs cursor-pointer"
              >
                Done
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

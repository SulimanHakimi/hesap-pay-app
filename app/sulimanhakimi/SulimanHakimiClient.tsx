'use client';

import { useState } from 'react';
import { Lock, Mail, User } from 'lucide-react';

const PRESETS = [5000, 10000, 15000];

export default function SulimanHakimiClient() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState('5000');
  const [isCustom, setIsCustom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const numericAmount = Number(amount);
  const amountValid = Number.isFinite(numericAmount) && numericAmount > 0;

  const handlePresetSelect = (val: number) => {
    setIsCustom(false);
    setAmount(val.toString());
  };

  const handleCustomClick = () => {
    setIsCustom(true);
    setAmount('');
  };

  const handleBuy = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your email.');
      return;
    }
    if (!amountValid) {
      setError('Please enter a valid payment amount.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: 'mptqbhjkvc87u',
          amount: numericAmount,
          customerEmail: email,
          customerName: name,
        }),
      });

      const text = await res.text();
      let data: any = {};
      try { data = text ? JSON.parse(text) : {}; } catch { /* non-JSON */ }
      if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        throw new Error('No payment URL returned');
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row">
      
      {/* LEFT PANEL: Brand Color Background */}
      <div className="w-full md:w-[40%] bg-[#1cb594] text-white p-8 md:p-16 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#179c7f]">
        <div className="space-y-12">
          <div>
            <div className="inline-flex items-center gap-2 text-emerald-100/90 font-bold uppercase tracking-wider text-[10px]">
              <span className="w-2 h-2 bg-emerald-100 rounded-full" />
              Suliman Hakimi
            </div>
            <h1 className="text-3xl font-light tracking-tight mt-4 text-white">Payment Gateway</h1>
            <p className="text-emerald-50/80 text-sm mt-1.5 font-medium">Secure Payment Terminal</p>
          </div>

          <div className="pt-8 border-t border-[#179c7f]">
            <div className="text-emerald-100/90 text-[10px] font-bold uppercase tracking-wider">Amount to Pay</div>
            <div className="text-5xl font-extralight mt-3 tracking-tight text-white">
              ؋{amountValid ? numericAmount.toLocaleString() : '0'}
            </div>
          </div>
        </div>

        <div className="mt-16 md:mt-0 space-y-6">
          <div className="space-y-3.5 bg-black/10 p-6 rounded-2xl border border-white/10 text-xs text-emerald-50 font-medium">
            <div className="flex justify-between">
              <span>Merchant</span>
              <span className="text-white font-bold">Suliman Hakimi</span>
            </div>
            <div className="flex justify-between">
              <span>Transaction Type</span>
              <span className="text-white font-bold">General Payment</span>
            </div>
            <div className="flex justify-between">
              <span>Platform Fee</span>
              <span className="text-white font-bold">0.00 AFN</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-emerald-100/80 uppercase tracking-widest font-bold">
            <Lock className="w-3.5 h-3.5" />
            Payments Secured and Encrypted
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: White Form Background */}
      <div className="w-full md:w-[60%] bg-white p-8 md:p-20 flex flex-col justify-center">
        <div className="max-w-md w-full mx-auto">
          
          <h2 className="text-xl font-bold tracking-tight text-black mb-1">Payment Details</h2>
          <p className="text-zinc-500 text-sm mb-8 font-medium">Enter your details and select the payment amount to proceed.</p>

          {error && (
            <div className="mb-6 p-4 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-black font-bold flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1cb594] shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleBuy} className="space-y-6">
            
            {/* Customer Details */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Your Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Full name"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-11 pr-4 py-3 text-sm text-black placeholder-zinc-400 focus:outline-none focus:border-[#1cb594] focus:bg-white focus:ring-1 focus:ring-[#1cb594] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-11 pr-4 py-3 text-sm text-black placeholder-zinc-400 focus:outline-none focus:border-[#1cb594] focus:bg-white focus:ring-1 focus:ring-[#1cb594] transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Price Selection */}
            <div className="space-y-3 pt-6 border-t border-zinc-100">
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Select Payment Amount (AFN)</label>
              
              {/* Presets Grid */}
              <div className="grid grid-cols-3 gap-2">
                {PRESETS.map((val) => {
                  const active = !isCustom && Number(amount) === val;
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handlePresetSelect(val)}
                      className={`py-3 rounded-xl border text-xs font-bold transition-all duration-150 active:scale-[0.98] ${
                        active
                          ? 'bg-[#1cb594] border-[#1cb594] text-white shadow-sm font-extrabold'
                          : 'bg-white border-zinc-200 text-zinc-800 hover:bg-zinc-50 hover:border-zinc-300'
                      }`}
                    >
                      ؋{val.toLocaleString()}
                    </button>
                  );
                })}
              </div>

              {/* Custom amount switch or input */}
              {!isCustom ? (
                <button
                  type="button"
                  onClick={handleCustomClick}
                  className="w-full py-3 bg-zinc-50 hover:bg-zinc-100/80 border border-zinc-200 text-zinc-800 rounded-xl text-xs font-bold transition-all duration-150 active:scale-[0.99] text-center"
                >
                  + Enter custom amount
                </button>
              ) : (
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-extrabold text-sm">؋</span>
                  <input
                    required
                    type="number"
                    min="1"
                    step="1"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="Enter custom amount"
                    className="w-full border border-zinc-200 bg-white rounded-xl pl-9 pr-24 py-3 text-sm font-bold text-black focus:outline-none focus:border-[#1cb594] focus:ring-1 focus:ring-[#1cb594] transition-all"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => handlePresetSelect(5000)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-500 hover:text-[#1cb594] transition-colors"
                  >
                    Use Presets
                  </button>
                </div>
              )}
            </div>

            {/* Pay Button */}
            <button
              type="submit"
              disabled={loading || !amountValid}
              className="w-full bg-[#1cb594] hover:bg-[#159e80] text-white py-4 rounded-xl font-bold text-sm tracking-wide transition-all duration-150 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white/25 border-t-white rounded-full animate-spin" />
              ) : (
                'Confirm and Pay'
              )}
            </button>
          </form>
          
        </div>
      </div>
    </div>
  );
}

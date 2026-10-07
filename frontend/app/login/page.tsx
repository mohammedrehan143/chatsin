'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { Phone, Lock, ArrowRight, AlertCircle, MessageCircle, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { user, login } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!phoneNumber.trim() || !password) {
      setError('Please enter your mobile number and password');
      return;
    }

    try {
      setLoading(true);
      await login({
        phoneNumber: phoneNumber.trim(),
        password: password,
      });
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your mobile number or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#eae6df] relative overflow-x-hidden">
      {/* WhatsApp Web Green Header Banner */}
      <div className="h-56 bg-[#00a884] w-full flex items-start px-8 pt-7">
        <div className="max-w-5xl w-full mx-auto flex items-center gap-3 select-none">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white backdrop-blur">
            <MessageCircle className="w-6 h-6 fill-white" />
          </div>
          <span className="text-white font-bold tracking-wider text-sm uppercase">WhatsApp Web</span>
        </div>
      </div>

      {/* Main Card Container */}
      <div className="flex-1 flex items-start justify-center -mt-32 px-4 pb-12 z-10">
        <div className="w-full max-w-4xl bg-white rounded-xl shadow-xl border border-slate-200/80 overflow-hidden flex flex-col md:flex-row min-h-[480px]">
          {/* Left Column: Instructions */}
          <div className="p-8 md:p-10 flex-1 bg-white flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-100">
            <div>
              <h1 className="text-2xl md:text-3xl font-light text-[#111b21] mb-6">
                Use WhatsApp on your computer
              </h1>

              <ol className="space-y-4 text-sm text-[#3b4a54] list-decimal list-inside leading-relaxed">
                <li>
                  Enter your registered <strong className="text-[#111b21]">Mobile Number</strong>.
                </li>
                <li>Enter your secure password or account PIN.</li>
                <li>Stay logged in on this browser without losing your messages.</li>
              </ol>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center gap-2.5 text-xs text-[#667781]">
              <ShieldCheck className="w-4 h-4 text-[#00a884]" />
              <span>End-to-end encrypted session persistence</span>
            </div>
          </div>

          {/* Right Column: Mobile Number Login Form */}
          <div className="p-8 md:p-10 w-full md:w-[420px] bg-[#fcfcfc] flex flex-col justify-center">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-[#111b21]">Sign in with Mobile</h2>
              <p className="text-xs text-[#667781] mt-1">Enter your phone number to access your chats</p>
            </div>

            {error && (
              <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-600 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#54656f] mb-1.5">
                  Mobile Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#8696a0] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1 234 567 8900 or digits"
                    className="w-full bg-white border border-[#d1d7db] focus:border-[#00a884] focus:ring-1 focus:ring-[#00a884] rounded-lg pl-10 pr-4 py-2.5 text-sm text-[#111b21] placeholder-[#8696a0] focus:outline-none transition-all shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#54656f] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8696a0] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border border-[#d1d7db] focus:border-[#00a884] focus:ring-1 focus:ring-[#00a884] rounded-lg pl-10 pr-4 py-2.5 text-sm text-[#111b21] placeholder-[#8696a0] focus:outline-none transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-[#00a884] rounded border-slate-300 focus:ring-[#00a884] accent-[#00a884]"
                />
                <label htmlFor="rememberMe" className="text-xs text-[#54656f] select-none cursor-pointer">
                  Keep me signed in
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#00a884] hover:bg-[#008069] text-white font-semibold rounded-lg text-sm shadow-md transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Next</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-200 text-center text-xs text-[#54656f]">
              Need a new mobile account?{' '}
              <Link href="/register" className="text-[#00a884] hover:underline font-semibold">
                Sign up here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

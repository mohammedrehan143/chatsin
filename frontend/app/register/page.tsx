'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { Phone, Lock, User, ArrowRight, AlertCircle, MessageSquareText, ShieldCheck } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { user, register } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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

    const cleanPhone = phoneNumber.trim().replace(/[^0-9+]/g, '');
    if (!cleanPhone || cleanPhone.length < 7) {
      setError('Please enter a valid mobile number (min. 7 digits)');
      return;
    }

    if (!username.trim()) {
      setError('Please choose a display name / username');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      await register({
        phoneNumber: cleanPhone,
        username: username.trim(),
        password: password,
      });
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#f4f4f5] relative overflow-x-hidden font-sans">
      {/* Chatsin Black Header Banner */}
      <div className="h-60 bg-[#09090b] w-full flex items-start px-8 pt-9 border-b border-zinc-800">
        <div className="max-w-5xl w-full mx-auto flex items-center gap-3 select-none">
          <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center text-white backdrop-blur border border-white/10">
            <MessageSquareText className="w-6 h-6 text-white" />
          </div>
          <span className="text-white font-bold tracking-tight text-lg">Chatsin</span>
        </div>
      </div>

      {/* Main Card Container */}
      <div className="flex-1 flex items-start justify-center -mt-36 px-4 pb-12 z-10 animate-fade-in">
        <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-zinc-200/90 overflow-hidden flex flex-col md:flex-row min-h-[490px]">
          {/* Left Column: Instructions */}
          <div className="p-8 md:p-12 flex-1 bg-white flex flex-col justify-between border-b md:border-b-0 md:border-r border-zinc-100">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-100 rounded-full text-xs font-semibold text-zinc-800 mb-6">
                <span>Join Chatsin</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#09090b] mb-4">
                Register your Mobile Account
              </h1>
              <p className="text-xs text-[#71717a] leading-relaxed mb-6">
                Connect instantly with friends, teammates, and contacts.
              </p>

              <ol className="space-y-4 text-xs text-[#52525b] list-decimal list-inside leading-relaxed">
                <li>
                  Register using your <strong className="text-[#09090b]">Mobile Number</strong>.
                </li>
                <li>Set your unique display name and password.</li>
                <li>Instant sync with real-time conversations, status, and read receipts.</li>
              </ol>
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-100 flex items-center gap-2.5 text-xs text-[#71717a]">
              <ShieldCheck className="w-4 h-4 text-[#09090b]" />
              <span className="font-medium">Encrypted & persistent authentication</span>
            </div>
          </div>

          {/* Right Column: Register Form */}
          <div className="p-8 md:p-10 w-full md:w-[420px] bg-[#fafafa] flex flex-col justify-center">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-[#09090b]">Create Mobile Account</h2>
              <p className="text-xs text-[#71717a] mt-1">Get started in seconds</p>
            </div>

            {error && (
              <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-red-600 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#52525b] mb-1.5">
                  Mobile Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#a1a1aa] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1 234 567 8900"
                    className="w-full bg-white border border-zinc-200 focus:border-[#09090b] focus:ring-1 focus:ring-[#09090b] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#09090b] placeholder-zinc-400 focus:outline-none transition-all shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#52525b] mb-1.5">
                  Profile Name / Display Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#a1a1aa] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full bg-white border border-zinc-200 focus:border-[#09090b] focus:ring-1 focus:ring-[#09090b] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#09090b] placeholder-zinc-400 focus:outline-none transition-all shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#52525b] mb-1.5">
                  Password (min. 6 characters)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#a1a1aa] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border border-zinc-200 focus:border-[#09090b] focus:ring-1 focus:ring-[#09090b] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#09090b] placeholder-zinc-400 focus:outline-none transition-all shadow-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#09090b] hover:bg-[#27272a] text-white font-semibold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed active:scale-98"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Agree & Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-zinc-200 text-center text-xs text-[#71717a]">
              Already have an account?{' '}
              <Link href="/login" className="text-[#09090b] hover:underline font-bold">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

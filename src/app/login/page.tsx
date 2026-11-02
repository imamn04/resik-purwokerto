"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ThumbsUp,
  MapPin,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal login. Periksa username dan kata sandi.");
        setLoading(false);
        return;
      }

      // Store in localStorage & document.cookie for tunnel / cross-network resiliency
      if (data.token) {
        localStorage.setItem("resik_token", data.token);
        const isHttps = window.location.protocol === "https:";
        document.cookie = `resik_session=${data.token}; path=/; max-age=604800; SameSite=Lax${
          isHttps ? "; Secure" : ""
        }`;
      }
      if (data.user) {
        localStorage.setItem("resik_user", JSON.stringify(data.user));
      }

      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 50);
    } catch (err: any) {
      setError("Terjadi kesalahan koneksi jaringan. Coba lagi.");
      setLoading(false);
    }
  };

  const setDemoAccount = (u: string, p: string = "password123") => {
    setUsername(u);
    setPassword(p);
    setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F7FE] p-4 sm:p-6 lg:p-10 font-sans">
      <div className="w-full max-w-5xl bg-white rounded-4xl shadow-horizon border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-2">
        {/* Left Hero Panel (Horizon Deep Navy + Gold Branding) */}
        <div className="hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-[#0B1437] via-[#111C44] to-[#1B254B] text-white relative overflow-hidden select-none">
          {/* Subtle Glows */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10">
            {/* Brand Logo */}
            <div className="flex items-center gap-3 mb-10">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center text-[#111C44] font-black text-2xl shadow-horizon-glow ring-4 ring-amber-400/20">
                RP
              </div>
              <div>
                <h2 className="font-black text-lg tracking-tight text-white leading-tight">
                  RESIK PURWOKERTO
                </h2>
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest">
                  Management System
                </span>
              </div>
            </div>

            <h1 className="text-3xl font-black leading-snug tracking-tight text-white mb-4">
              Pusat Manajemen <span className="text-amber-400">Jasa Kebersihan</span> & Layanan Teknik.
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed mb-8">
              Aplikasi operasional internal untuk mengelola rekapitulasi pekerjaan cuci AC, kasur, sofa, karpet, cleaning rumah, dan kelistrikan di Purwokerto & sekitarnya.
            </p>

            {/* Feature Highlights */}
            <div className="space-y-3.5 text-xs">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#1B254B]/80 border border-white/5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-extrabold text-white">Auto Numbering Format RP-YYYYMMDD-XXXX</p>
                  <p className="text-[#A3AED0] text-[11px]">Sistem penomoran nota resmi tanpa bentrok</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#1B254B]/80 border border-white/5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <ThumbsUp className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-extrabold text-white">Dokumentasi Foto Before & After</p>
                  <p className="text-[#A3AED0] text-[11px]">Bukti pengerjaan teknisi tersimpan rapi</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#1B254B]/80 border border-white/5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-extrabold text-white">CRM Kontak Pelanggan Terintegrasi</p>
                  <p className="text-[#A3AED0] text-[11px]">Otomatis tersimpan & 1-klik kirim pesan WhatsApp</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-[11px] text-[#A3AED0]">
            <span>&copy; 2026 Resik Purwokerto</span>
            <span className="text-amber-400 font-bold">@resikpurwokerto</span>
          </div>
        </div>

        {/* Right Form Panel (Clean Horizon Style) */}
        <div className="p-8 sm:p-10 lg:p-12 flex flex-col justify-between">
          <div>
            <div className="mb-8">
              <span className="text-xs font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 uppercase tracking-widest inline-block mb-2">
                Portal Masuk
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#1B254B] tracking-tight">
                Masuk ke Akun Anda
              </h2>
              <p className="text-xs sm:text-sm text-[#707E94] mt-1 font-medium">
                Masukkan kredensial akun terdaftar untuk mengelola sistem.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800 animate-fade-in font-semibold">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-[#1B254B] uppercase tracking-wider mb-2">
                  Username / Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#A3AED0]">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin / owner / staf1"
                    className="w-full pl-11 pr-4 py-3 bg-[#F4F7FE] border border-slate-200/80 rounded-2xl text-sm font-bold text-[#1B254B] focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all shadow-inner"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-[#1B254B] uppercase tracking-wider mb-2">
                  Kata Sandi
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#A3AED0]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3 bg-[#F4F7FE] border border-slate-200/80 rounded-2xl text-sm font-bold text-[#1B254B] focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all shadow-inner"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-600 hover:to-amber-500 text-[#111C44] font-black text-sm shadow-horizon-glow transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#111C44] border-t-transparent rounded-full animate-spin" />
                    <span>Memverifikasi Akun...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk ke Dashboard</span>
                    <ArrowRight className="w-4 h-4 text-[#111C44]" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick Demo Access Pills */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-[11px] font-black text-[#707E94] uppercase tracking-wider text-center mb-3">
              Pilih Akun Demo (1-Click Instant Login):
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setDemoAccount("owner")}
                className="p-3 rounded-2xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/50 text-[#1B254B] font-bold text-left transition-all flex items-center justify-between shadow-xs"
              >
                <span>👑 Owner</span>
                <span className="text-[10px] text-amber-700 font-mono">owner</span>
              </button>
              <button
                type="button"
                onClick={() => setDemoAccount("admin")}
                className="p-3 rounded-2xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 text-[#1B254B] font-bold text-left transition-all flex items-center justify-between shadow-xs"
              >
                <span>💼 Admin</span>
                <span className="text-[10px] text-blue-700 font-mono">admin</span>
              </button>
              <button
                type="button"
                onClick={() => setDemoAccount("staf1")}
                className="p-3 rounded-2xl border border-slate-200 hover:border-sky-500 hover:bg-sky-50/50 text-[#1B254B] font-bold text-left transition-all flex items-center justify-between shadow-xs"
              >
                <span>🛠️ Staf Lapangan</span>
                <span className="text-[10px] text-sky-700 font-mono">staf1</span>
              </button>
              <button
                type="button"
                onClick={() => setDemoAccount("viewer")}
                className="p-3 rounded-2xl border border-slate-200 hover:border-slate-400 hover:bg-slate-100 text-[#1B254B] font-bold text-left transition-all flex items-center justify-between shadow-xs"
              >
                <span>👁️ Viewer</span>
                <span className="text-[10px] text-slate-500 font-mono">viewer</span>
              </button>
            </div>
            <p className="text-[10px] text-[#707E94] text-center mt-3 font-semibold">
              Password default demo: <span className="font-mono text-[#111C44] font-black">password123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

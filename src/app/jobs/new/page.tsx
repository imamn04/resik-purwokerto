"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import { formatRupiah, sanitizePhoneNumber } from "@/lib/utils";
import {
  ArrowLeft,
  Save,
  User,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Sparkles,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Search,
} from "lucide-react";

export default function NewJobPage() {
  const router = useRouter();

  // Form State
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [jobDetails, setJobDetails] = useState("");
  const [scheduledDate, setScheduledDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [scheduledTime, setScheduledTime] = useState("09:00");
  const [technicianName, setTechnicianName] = useState("");
  const [basePrice, setBasePrice] = useState<number | string>(0);
  const [extraFee, setExtraFee] = useState<number | string>(0);
  const [discount, setDiscount] = useState<number | string>(0);
  const [status, setStatus] = useState("PENDING");
  const [notes, setNotes] = useState("");

  // Master services & Customers state
  const [services, setServices] = useState<any[]>([]);
  const [existingCustomers, setExistingCustomers] = useState<any[]>([]);
  const [customerSuggestions, setCustomerSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Status
  const [loadingServices, setLoadingServices] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto calculated total
  const calculatedTotal = Math.max(
    0,
    (Number(basePrice) || 0) + (Number(extraFee) || 0) - (Number(discount) || 0)
  );

  // Load Services & Customers
  useEffect(() => {
    async function initData() {
      try {
        const [servRes, custRes] = await Promise.all([
          fetch("/api/services"),
          fetch("/api/customers"),
        ]);

        if (servRes.ok) {
          const servData = await servRes.json();
          setServices(servData.services || []);
          if (servData.services && servData.services.length > 0) {
            setServiceId(servData.services[0].id);
            setBasePrice(servData.services[0].defaultPrice || 0);
          }
        }

        if (custRes.ok) {
          const custData = await custRes.json();
          setExistingCustomers(custData.customers || []);
        }
      } catch (err) {
        console.error("Failed to load init data:", err);
      } finally {
        setLoadingServices(false);
      }
    }
    initData();
  }, []);

  // When Service Changes, auto-fill default base price
  const handleServiceChange = (id: string) => {
    setServiceId(id);
    const selected = services.find((s) => s.id === id);
    if (selected && selected.defaultPrice) {
      setBasePrice(selected.defaultPrice);
    }
  };

  // Autocomplete by Phone or Name
  const handlePhoneSearch = (val: string) => {
    setCustomerPhone(val);
    if (val.length >= 3) {
      const matches = existingCustomers.filter((c) =>
        c.phone.toLowerCase().includes(val.toLowerCase())
      );
      setCustomerSuggestions(matches);
      setShowSuggestions(matches.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleNameSearch = (val: string) => {
    setCustomerName(val);
    if (val.length >= 3) {
      const matches = existingCustomers.filter((c) =>
        c.name.toLowerCase().includes(val.toLowerCase())
      );
      setCustomerSuggestions(matches);
      setShowSuggestions(matches.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectExistingCustomer = (c: any) => {
    setCustomerName(c.name);
    setCustomerPhone(c.phone);
    setCustomerAddress(c.address || "");
    setShowSuggestions(false);
  };

  // Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!customerName.trim() || !customerPhone.trim()) {
      setError("Nama pelanggan dan nomor WhatsApp wajib diisi!");
      return;
    }

    if (!serviceId) {
      setError("Pilih salah satu layanan pekerjaan!");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerAddress: customerAddress.trim(),
          serviceId,
          jobDetails: jobDetails.trim(),
          scheduledDate,
          scheduledTime,
          technicianName: technicianName.trim(),
          basePrice: Number(basePrice) || 0,
          extraFee: Number(extraFee) || 0,
          discount: Number(discount) || 0,
          status,
          notes: notes.trim(),
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Gagal menyimpan pekerjaan baru");
        setSubmitting(false);
        return;
      }

      // Redirect to the created job detail page
      router.push(`/jobs/${json.job.id}`);
    } catch (err: any) {
      setError("Terjadi kesalahan jaringan saat menyimpan");
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#707E94] hover:text-amber-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Daftar Pekerjaan
          </Link>
          <span className="text-xs text-[#111C44] bg-amber-100 px-3 py-1 rounded-full font-black border border-amber-300 shadow-2xs">
            Auto Format RP-YYYYMMDD-XXXX
          </span>
        </div>

        {/* Title */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-black text-[#1B254B] tracking-tight">
            Input Pekerjaan Baru (Job Intake)
          </h1>
          <p className="text-xs sm:text-sm text-[#707E94] mt-1 font-medium">
            Formulir pendaftaran job baru, penugasan armada teknisi, dan kalkulasi tagihan.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-xs sm:text-sm text-rose-800 animate-fade-in font-bold">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Card 1: Data Pelanggan */}
          <div className="horizon-card p-6 relative">
            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-[#111C44] flex items-center justify-center font-black text-xs shadow-2xs">
                1
              </div>
              <h2 className="text-base font-black text-[#1B254B]">
                Data Pelanggan (CRM Database)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* No. WhatsApp Pelanggan */}
              <div className="relative">
                <label className="block text-xs font-black text-[#1B254B] uppercase tracking-wider mb-1.5">
                  Nomor WhatsApp Pelanggan *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A3AED0]">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={customerPhone}
                    onChange={(e) => handlePhoneSearch(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F4F7FE] border border-slate-200 rounded-2xl text-sm font-bold text-[#1B254B] focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all font-mono shadow-inner"
                  />
                </div>
                <p className="text-[11px] text-[#707E94] mt-1 font-medium">
                  Ketik nomor WA untuk mencari histori pelanggan secara otomatis.
                </p>

                {/* Autocomplete Dropdown */}
                {showSuggestions && (
                  <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-100">
                    <p className="text-[10px] font-black text-[#707E94] px-3 py-1.5 uppercase bg-slate-50">
                      Pelanggan Pernah Memesan:
                    </p>
                    {customerSuggestions.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => selectExistingCustomer(c)}
                        className="w-full px-3 py-2 text-left hover:bg-amber-50 text-xs flex items-center justify-between group transition-colors"
                      >
                        <div>
                          <p className="font-extrabold text-[#1B254B]">{c.name}</p>
                          <p className="text-[#707E94] text-[11px]">{c.address || "Tanpa alamat"}</p>
                        </div>
                        <span className="font-mono text-amber-700 font-bold text-[11px]">
                          {c.phone}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Nama Pelanggan */}
              <div>
                <label className="block text-xs font-black text-[#1B254B] uppercase tracking-wider mb-1.5">
                  Nama Lengkap Pelanggan *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A3AED0]">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => handleNameSearch(e.target.value)}
                    placeholder="Contoh: Ibu Rina / Bpk. Hendra"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F4F7FE] border border-slate-200 rounded-2xl text-sm font-bold text-[#1B254B] focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all shadow-inner"
                  />
                </div>
              </div>

              {/* Alamat Lengkap */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-black text-[#1B254B] uppercase tracking-wider mb-1.5">
                  Alamat Lengkap / Lokasi Pengerjaan *
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-3.5 text-[#A3AED0] pointer-events-none">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <textarea
                    rows={2}
                    required
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="Contoh: Jl. HR Bunyamin No. 12, Bancarkembar, Purwokerto Utara (Patokan samping Bank Mandiri)"
                    className="w-full pl-10 pr-4 py-2 bg-[#F4F7FE] border border-slate-200 rounded-2xl text-sm font-bold text-[#1B254B] focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all resize-none shadow-inner"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Layanan & Jadwal Pengerjaan */}
          <div className="horizon-card p-6">
            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center font-black text-xs shadow-2xs">
                2
              </div>
              <h2 className="text-base font-black text-[#1B254B]">
                Detail Layanan & Jadwal Petugas
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Jenis Layanan */}
              <div>
                <label className="block text-xs font-black text-[#1B254B] uppercase tracking-wider mb-1.5">
                  Kategori Layanan *
                </label>
                <select
                  value={serviceId}
                  onChange={(e) => handleServiceChange(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#F4F7FE] border border-slate-200 rounded-2xl text-sm font-bold text-[#1B254B] focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer shadow-inner"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.category}) — Default {formatRupiah(s.defaultPrice)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Petugas / Teknisi */}
              <div>
                <label className="block text-xs font-black text-[#1B254B] uppercase tracking-wider mb-1.5">
                  Petugas / Tim Teknisi
                </label>
                <input
                  type="text"
                  value={technicianName}
                  onChange={(e) => setTechnicianName(e.target.value)}
                  placeholder="Contoh: Mas Joko & Tim AC / Tim Cleaning 1"
                  className="w-full px-4 py-2.5 bg-[#F4F7FE] border border-slate-200 rounded-2xl text-sm font-bold text-[#1B254B] focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-inner"
                />
              </div>

              {/* Tanggal Jadwal */}
              <div>
                <label className="block text-xs font-black text-[#1B254B] uppercase tracking-wider mb-1.5">
                  Tanggal Jadwal Pengerjaan *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A3AED0]">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <input
                    type="date"
                    required
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F4F7FE] border border-slate-200 rounded-2xl text-sm font-black text-[#1B254B] focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-inner"
                  />
                </div>
              </div>

              {/* Jam Pengerjaan */}
              <div>
                <label className="block text-xs font-black text-[#1B254B] uppercase tracking-wider mb-1.5">
                  Jam Pengerjaan
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A3AED0]">
                    <Clock className="w-4 h-4" />
                  </div>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F4F7FE] border border-slate-200 rounded-2xl text-sm font-black text-[#1B254B] focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-inner"
                  />
                </div>
              </div>

              {/* Detail Pekerjaan */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-black text-[#1B254B] uppercase tracking-wider mb-1.5">
                  Detail / Spesifikasi Pekerjaan
                </label>
                <textarea
                  rows={2}
                  value={jobDetails}
                  onChange={(e) => setJobDetails(e.target.value)}
                  placeholder="Contoh: Cuci 2 unit AC 1 PK (bocor air & cuci outdoor), plus cleaning 1 sofa L di ruang tamu."
                  className="w-full px-4 py-2 bg-[#F4F7FE] border border-slate-200 rounded-2xl text-sm font-bold text-[#1B254B] focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none shadow-inner"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Biaya & Status Pekerjaan */}
          <div className="horizon-card p-6">
            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-black text-xs shadow-2xs">
                3
              </div>
              <h2 className="text-base font-black text-[#1B254B]">
                Kalkulasi Biaya & Status Awal
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
              {/* Harga Dasar */}
              <div>
                <label className="block text-xs font-black text-[#1B254B] uppercase tracking-wider mb-1.5">
                  Harga Pekerjaan (Rp)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#F4F7FE] border border-slate-200 rounded-2xl text-sm font-black text-[#1B254B] focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-inner"
                />
              </div>

              {/* Biaya Tambahan */}
              <div>
                <label className="block text-xs font-black text-[#1B254B] uppercase tracking-wider mb-1.5">
                  Biaya Tambahan (Rp)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={extraFee}
                  onChange={(e) => setExtraFee(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-2.5 bg-[#F4F7FE] border border-slate-200 rounded-2xl text-sm font-black text-[#1B254B] focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-inner"
                />
                <span className="text-[10px] text-[#707E94] font-medium">Misal: transportasi / sparepart</span>
              </div>

              {/* Diskon */}
              <div>
                <label className="block text-xs font-black text-[#1B254B] uppercase tracking-wider mb-1.5">
                  Diskon / Potongan (Rp)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-2.5 bg-[#F4F7FE] border border-slate-200 rounded-2xl text-sm font-black text-rose-600 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-inner"
                />
              </div>
            </div>

            {/* Total Highlight Bar (Horizon Dark Navy + Gold) */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-[#0B1437] via-[#111C44] to-[#1B254B] text-white flex items-center justify-between mb-5 shadow-horizon-navy">
              <div>
                <p className="text-xs text-amber-400 font-black uppercase tracking-wider">
                  Total Tagihan Akhir
                </p>
                <p className="text-[11px] text-slate-300">
                  Harga Dasar + Biaya Tambahan - Diskon
                </p>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-amber-400">
                {formatRupiah(calculatedTotal)}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Status Awal */}
              <div>
                <label className="block text-xs font-black text-[#1B254B] uppercase tracking-wider mb-1.5">
                  Status Pekerjaan
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#F4F7FE] border border-slate-200 rounded-2xl text-sm font-black text-[#1B254B] focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer shadow-inner"
                >
                  <option value="PENDING">🟡 PENDING (Menunggu Konfirmasi)</option>
                  <option value="DIJADWALKAN">🔵 DIJADWALKAN (Teknisi Siap)</option>
                  <option value="DALAM_PENGERJAAN">🟣 DALAM PENGERJAAN</option>
                  <option value="SELESAI">🟢 SELESAI</option>
                  <option value="DIBATALKAN">🔴 DIBATALKAN</option>
                </select>
              </div>

              {/* Catatan Tambahan */}
              <div>
                <label className="block text-xs font-black text-[#1B254B] uppercase tracking-wider mb-1.5">
                  Catatan Khusus
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Minta dikerjakan pagi sebelum jam 11"
                  className="w-full px-4 py-2.5 bg-[#F4F7FE] border border-slate-200 rounded-2xl text-sm font-bold text-[#1B254B] focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-inner"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/jobs"
              className="px-6 py-3.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-[#1B254B] text-sm font-bold transition-all shadow-xs"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-600 hover:to-amber-500 text-[#111C44] font-black text-sm shadow-horizon-glow transition-all flex items-center gap-2 cursor-pointer disabled:opacity-70 active:scale-[0.98]"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#111C44] border-t-transparent rounded-full animate-spin" />
                  <span>Menyimpan Job...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-[#111C44]" />
                  <span>Simpan & Terbitkan Job</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}

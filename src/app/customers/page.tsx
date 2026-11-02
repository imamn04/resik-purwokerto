"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import { formatRupiah, formatDateID, getWhatsAppLink } from "@/lib/utils";
import {
  Users,
  Search,
  MessageCircle,
  Briefcase,
  ExternalLink,
  MapPin,
  Phone,
  Calendar,
  X,
  Plus,
} from "lucide-react";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);

  const fetchCustomers = async (query: string = "") => {
    setLoading(true);
    try {
      const res = await fetch(`/api/customers?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const json = await res.json();
        setCustomers(json.customers || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#1B254B] tracking-tight flex items-center gap-2">
            Data Pelanggan (CRM)
            <span className="text-xs font-black px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
              {customers.length} Pelanggan
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-[#707E94] mt-1 font-medium">
            Database kontak pelanggan yang tersimpan otomatis saat penginputan pekerjaan.
          </p>
        </div>

        <Link
          href="/jobs/new"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-600 hover:to-amber-500 text-[#111C44] font-black text-xs sm:text-sm shadow-horizon-glow transition-all self-start sm:self-auto cursor-pointer active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 text-[#111C44]" />
          Job untuk Pelanggan Baru
        </Link>
      </div>

      {/* Search Bar */}
      <div className="horizon-card p-5 mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#A3AED0]">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari pelanggan berdasarkan nama, nomor telepon, atau alamat..."
            className="w-full pl-11 pr-4 py-3 bg-[#F4F7FE] border border-slate-200 rounded-2xl text-sm font-bold text-[#1B254B] focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all shadow-inner"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-semibold text-slate-500 uppercase">Memuat database pelanggan...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="py-16 text-center px-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-700">Belum ada data pelanggan</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Data pelanggan akan otomatis terkumpul saat Anda menginput pekerjaan baru.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Pelanggan</th>
                  <th className="py-3.5 px-4">Nomor WhatsApp</th>
                  <th className="py-3.5 px-4">Alamat Terakhir</th>
                  <th className="py-3.5 px-4">Total Order</th>
                  <th className="py-3.5 px-4">Total Transaksi</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((c) => {
                  const waUrl = getWhatsAppLink(
                    c.phone,
                    `Halo ${c.name}, salam dari Resik Purwokerto.`
                  );
                  return (
                    <tr key={c.id} className="hover:bg-amber-50/30 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                        {c.name}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-700 font-medium">{c.phone}</span>
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded text-emerald-600 hover:bg-emerald-50"
                            title="Chat WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4 fill-emerald-100" />
                          </a>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                        {c.address || "-"}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="bg-blue-50 text-blue-900 font-bold px-2 py-0.5 rounded-full text-[11px] border border-blue-200">
                          {c._count?.jobs ?? c.totalOrders ?? 0} Pekerjaan
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap font-bold text-slate-900">
                        {formatRupiah(c.totalSpent)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        <Link
                          href={`/jobs?search=${encodeURIComponent(c.phone)}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-amber-500 hover:text-blue-950 font-bold text-[11px] text-slate-700 transition-colors"
                        >
                          <Briefcase className="w-3.5 h-3.5" />
                          Lihat Job
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}


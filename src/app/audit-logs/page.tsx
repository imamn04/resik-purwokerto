"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import {
  History,
  ShieldAlert,
  Search,
  User,
  Clock,
  Activity,
  Calendar,
} from "lucide-react";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/audit-logs");
      if (res.ok) {
        const json = await res.json();
        setLogs(json.logs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((l) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      l.details?.toLowerCase().includes(q) ||
      l.action?.toLowerCase().includes(q) ||
      l.user?.name?.toLowerCase().includes(q) ||
      l.user?.username?.toLowerCase().includes(q)
    );
  });

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#1B254B] tracking-tight flex items-center gap-2">
            Audit Trail & Log Aktivitas
            <span className="text-xs font-black px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
              Khusus Owner
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-[#707E94] mt-1 font-medium">
            Rekam jejak seluruh operasi sistem: penambahan job, perubahan status, login pengguna, dan penghapusan data.
          </p>
        </div>

        <div className="w-full sm:w-72">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A3AED0]">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Saring log aktivitas..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#F4F7FE] border border-slate-200 rounded-2xl text-xs font-bold text-[#1B254B] focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-inner"
            />
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-semibold text-slate-500 uppercase">Memuat log audit...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            Belum ada rekam jejak aktivitas yang sesuai.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Waktu</th>
                  <th className="py-3.5 px-4">Pengguna</th>
                  <th className="py-3.5 px-4">Tipe Aksi</th>
                  <th className="py-3.5 px-4">Keterangan Aktivitas</th>
                  <th className="py-3.5 px-4">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                      {new Date(log.createdAt).toLocaleString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      {log.user ? (
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-800">{log.user.name}</span>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-semibold">
                            {log.user.role}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Sistem / Anonim</span>
                      )}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          log.action === "CREATE"
                            ? "bg-emerald-100 text-emerald-800"
                            : log.action === "STATUS_CHANGE"
                            ? "bg-blue-100 text-blue-800"
                            : log.action === "DELETE"
                            ? "bg-rose-100 text-rose-800"
                            : log.action === "LOGIN"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-slate-100 text-slate-800"
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-800 font-medium">
                      {log.details || "-"}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-slate-400">
                      {log.ipAddress || "127.0.0.1"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}


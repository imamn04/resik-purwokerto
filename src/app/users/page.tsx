"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { formatDateID } from "@/lib/utils";
import {
  UserCheck,
  Plus,
  Shield,
  Edit2,
  Lock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  KeyRound,
} from "lucide-react";

export default function UsersManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("STAFF_INPUT");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const json = await res.json();
        setUsers(json.users || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, password, role, phone, email }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Gagal membuat pengguna baru");
        setSubmitting(false);
        return;
      }

      setFeedback(`Pengguna @${username} berhasil dibuat!`);
      setShowAddModal(false);
      setName("");
      setUsername("");
      setPassword("");
      setPhone("");
      fetchUsers();
      setTimeout(() => setFeedback(null), 3000);
    } catch {
      setError("Terjadi kesalahan jaringan");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedUser.id,
          name,
          role,
          phone,
          isActive,
          newPassword: newPassword ? newPassword : undefined,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Gagal memperbarui akun");
        setSubmitting(false);
        return;
      }

      setFeedback(`Akun ${selectedUser.username} berhasil diperbarui!`);
      setShowEditModal(false);
      setNewPassword("");
      fetchUsers();
      setTimeout(() => setFeedback(null), 3000);
    } catch {
      setError("Terjadi kesalahan jaringan");
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (u: any) => {
    setSelectedUser(u);
    setName(u.name);
    setRole(u.role);
    setPhone(u.phone || "");
    setIsActive(u.isActive);
    setNewPassword("");
    setShowEditModal(true);
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#1B254B] tracking-tight flex items-center gap-2">
            Manajemen Akun Pengguna
            <span className="text-xs font-black px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
              Khusus Owner
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-[#707E94] mt-1 font-medium">
            Kontrol akun pegawai, hak akses (RBAC), penonaktifan akun, dan pantau produktivitas.
          </p>
        </div>

        <button
          onClick={() => {
            setError(null);
            setShowAddModal(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-600 hover:to-amber-500 text-[#111C44] font-black text-xs sm:text-sm shadow-horizon-glow transition-all cursor-pointer self-start sm:self-auto active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 text-[#111C44]" />
          Tambah Akun Pengguna
        </button>
      </div>

      {feedback && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-medium text-slate-500">Memuat data pengguna...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Nama & Username</th>
                  <th className="py-3.5 px-4">Role Hak Akses</th>
                  <th className="py-3.5 px-4">No. HP</th>
                  <th className="py-3.5 px-4 text-center">Job Diinput</th>
                  <th className="py-3.5 px-4">Status Akun</th>
                  <th className="py-3.5 px-4">Login Terakhir</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{u.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">@{u.username}</div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          u.role === "OWNER"
                            ? "bg-amber-100 text-amber-900 border border-amber-300"
                            : u.role === "ADMIN"
                            ? "bg-blue-100 text-blue-900 border border-blue-300"
                            : u.role === "STAFF_INPUT"
                            ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                            : "bg-purple-100 text-purple-900 border border-purple-300"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-600">
                      {u.phone || "-"}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-center font-bold text-blue-900">
                      {u._count?.createdJobs || 0}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {u.isActive ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-700 font-semibold text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          Nonaktif
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 text-[11px]">
                      {u.lastLoginAt
                        ? new Date(u.lastLoginAt).toLocaleString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Belum pernah"}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => openEditModal(u)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition-colors"
                      >
                        <Edit2 className="w-3 h-3" />
                        Edit / Reset
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Tambah User Baru */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setShowAddModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 z-10">
            <h2 className="text-base font-bold text-slate-900 mb-1">Tambah Akun Pengguna Baru</h2>
            <p className="text-xs text-slate-500 mb-4">
              Buat akun untuk staf atau pengawas operasional Resik Purwokerto.
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Mas Budi Lapangan"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Username Login *</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Contoh: budi_ac"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kata Sandi Awal *</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Role / Peran *</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="STAFF_INPUT">STAFF INPUT</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="OWNER">OWNER</option>
                    <option value="VIEWER">VIEWER</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">No. WhatsApp</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="08..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-blue-950 font-bold"
                >
                  {submitting ? "Menyimpan..." : "Buat Akun"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit User & Reset Password */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setShowEditModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 z-10">
            <h2 className="text-base font-bold text-slate-900 mb-1">
              Edit Akun @{selectedUser.username}
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Ubah wewenang, nomor telepon, status keaktifan, atau reset kata sandi.
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleEditUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Pengguna</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Role Akun</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="STAFF_INPUT">STAFF INPUT</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="OWNER">OWNER</option>
                    <option value="VIEWER">VIEWER</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status Keaktifan</label>
                  <select
                    value={isActive ? "true" : "false"}
                    onChange={(e) => setIsActive(e.target.value === "true")}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="true">✅ Aktif</option>
                    <option value="false">❌ Nonaktif (Blokir)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">No. WhatsApp</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div className="pt-2 border-t border-slate-100">
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                  Reset Kata Sandi Baru (Opsional)
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Kosongkan jika tidak ingin mengubah sandi"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-blue-950 font-bold"
                >
                  {submitting ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}


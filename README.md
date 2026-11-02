# RESIK PURWOKERTO MANAGEMENT SYSTEM (RPMS)

Sistem Informasi Manajemen Operasional Jasa Kebersihan & Technical Service untuk **Resik Purwokerto** ([@resikpurwokerto](https://www.instagram.com/resikpurwokerto)).

Dibangun dengan arsitektur **Next.js 14 App Router**, **Prisma ORM**, **Tailwind CSS**, dan tema visual **Horizon UI** (*Midnight Navy & Sunflower Gold*).

---

## 🌟 Fitur Utama Sistem

1. **Dashboard Operasional Horizon:**
   - 4 Kartu Metrik Utama: *Total Order Job, Jadwal Hari Ini, Dalam Proses, dan Total Omzet*.
   - **Multi-Column Agenda Card:** Tampilan antrean terstruktur yang memisahkan waktu, pelanggan, jenis layanan, nama teknisi, dan status pekerjaan.
   - **Filter Segmented Tab:** Filter cepat (*Semua, Perlu Dikerjakan, Hari Ini, Selesai*) dengan antarmuka geser horizontal di perangkat seluler (*mobile*).
   - **Grafik Tren Performa 6 Bulan:** Spline Area Chart interaktif menggunakan **Recharts** dengan mode switch (*Kombinasi, Omzet, Order*) dan tooltip mengambang.
   - **Kesiapan Armada & Tim Lapangan:** Monitoring status kesiapan 4 regu teknisi (*AC, Sofa & Kasur, Deep Cleaning, dan Kelistrikan*).

2. **Manajemen Pekerjaan (Job Order):**
   - Penomoran otomatis berstandar: `RP-YYYYMMDD-XXXX`.
   - Form input ramah jempol (*Mobile-First*) dengan kalkulator otomatis biaya layanan, biaya tambahan, dan diskon.
   - Integrasi WhatsApp 1-Klik ke nomor pelanggan.
   - Cetak SPK / Nota pekerjaan siap print (*print-friendly*).

3. **Dokumentasi Foto Lapangan (Before & After):**
   - Unggah dan simpan foto kondisi sebelum (*Before*) dan sesudah (*After*) pengerjaan teknisi.

4. **CRM Pelanggan:**
   - Pencarian otomatis nama/telepon pelanggan untuk mencegah duplikasi data pelanggan lama.
   - Riwayat order dan total pengeluaran per pelanggan.

5. **Laporan & Ekspor Finansial:**
   - Rekap omzet dan volume order harian, mingguan, bulanan, dan tahunan.
   - **Ekspor Excel (.xlsx)** otomatis berformat resmi menggunakan ExcelJS.

6. **Role-Based Access Control (RBAC):**
   - **OWNER:** Akses penuh ke seluruh menu, omzet finansial, manajemen pengguna, dan audit trail.
   - **ADMIN:** Mengelola seluruh pekerjaan, CRM pelanggan, dan laporan operasional.
   - **STAFF INPUT:** Khusus input pekerjaan baru via HP di lapangan dan melihat riwayat pekerjaan pribadi.
   - **VIEWER:** Mode baca saja (*read-only*) untuk pemantauan data.

---

## 🛠️ Stack Teknologi

- **Framework Web:** Next.js 14 (App Router) + TypeScript + React 18
- **Database:** SQLite (Lokal, portabel, zero-configuration)
- **ORM:** Prisma ORM v5
- **Styling:** Tailwind CSS + Desain Sistem Horizon UI
- **Data Visualization:** Recharts (Interactive Spline Area Chart)
- **Ikon:** Lucide React
- **Ekspor Dokumen:** ExcelJS & Native Browser Print

---

## 🚀 Panduan Instalasi & Menjalankan Proyek

Ikuti langkah-langkah di bawah ini untuk menjalankan proyek ini dari nol di komputer atau server:

### 1. Prasyarat Sistem
Pastikan perangkat Anda sudah terinstal:
- **Node.js** versi 18 atau lebih baru (disarankan Node 20 LTS atau Node 22).
- **Git**.

### 2. Clone Repository
```bash
git clone https://github.com/imamn04/resik-purwokerto.git
cd resik-purwokerto
```

### 3. Install Seluruh Dependensi Library
```bash
npm install
```

### 4. Konfigurasi Environment (.env)
Salin file template `.env.example` menjadi `.env`:

* **Di Windows (PowerShell):**
  ```powershell
  Copy-Item .env.example .env
  ```
* **Di Mac / Linux / Git Bash:**
  ```bash
  cp .env.example .env
  ```

Isi file `.env` default:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="resik-purwokerto-secure-auth-secret-key-32chars"
NEXTAUTH_SECRET="resik-purwokerto-secure-auth-secret-key-32chars"
```

### 5. Inisialisasi Database & Seeding Data Awal
Jalankan perintah Prisma berikut untuk membuat file database dan mengisi master data layanan & akun:
```bash
npx prisma generate
npx prisma db push
node prisma/seed.js
```

### 6. Jalankan Server Aplikasi

* **Mode Pengembangan (Development):**
  ```bash
  npm run dev
  ```
  Buka browser Anda di: `http://localhost:3000`

* **Mode Produksi (Production - Cepat & Optimal):**
  ```bash
  npm run build
  npm run start
  ```

---

## 🔐 Akun Login Default

Semua akun awal menggunakan kata sandi default: **`password123`**

| Peran (Role) | Username | Password | Deskripsi Wewenang |
| :--- | :--- | :--- | :--- |
| **OWNER** | `owner` | `password123` | Akses penuh seluruh sistem, omzet finansial, manajemen pengguna & audit log |
| **ADMIN** | `admin` | `password123` | Manajemen order job, data pelanggan, update status, dan laporan |
| **STAFF** | `staf1` | `password123` | Input job lapangan lewat HP & pantau riwayat pekerjaan pribadi |
| **VIEWER** | `viewer` | `password123` | Monitoring & pantau laporan (hanya baca) |

*(Di halaman login juga tersedia tombol instan 1-klik untuk mencoba masing-masing akun tanpa mengetik sandi).*

---

## 📁 Struktur Direktori Penting

```
resik-purwokerto/
├── prisma/
│   ├── schema.prisma      # Skema database relasional (User, Customer, Job, Service, AuditLog)
│   └── seed.js            # Script seeding master data layanan dan akun demo
├── src/
│   ├── app/               # Next.js App Router (Halaman dashboard, jobs, customers, reports, dll)
│   ├── components/        # Komponen UI Horizon, AppLayout, StatusBadge
│   ├── lib/               # Helper utilities (format rupiah, tanggal Indonesia, auth JWT)
│   └── types/             # Deklarasi tipe TypeScript
├── .env.example           # Contoh file konfigurasi environment
├── .gitignore             # File filter Git (mengabaikan node_modules, .next, .env, dev.db)
├── package.json           # Dependensi proyek
└── tailwind.config.ts     # Konfigurasi token warna Horizon (Midnight Navy & Amber Gold)
```

---

## 📝 Lisensi
Hak Cipta & Hak Milik Operasional &copy; Resik Purwokerto Management System.

# Dokumentasi Sistem Informasi PKL/MBKM

Dokumentasi ini mencakup arsitektur, struktur database, API endpoint, dan struktur frontend untuk aplikasi manajemen PKL/MBKM.

## 1. Overview Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js (^5.2.1)
- **Database**: MySQL (via `mysql2`)
- **ORM**: Sequelize (^6.37.7)
- **Authentication**: JWT & Bcrypt
- **Security**: Helmet, Cors

### Frontend (Sidemi)
- **Framework**: Next.js 16.1.1 (App Router)
- **UI Library**: React 19, Radix UI (Primitives)
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Data Fetching**: Axios
- **Charts**: Recharts

---

## 2. Backend Documentation

### Database Schema (Core Models)

Relasi utama berpusat pada model `Pendaftaran` yang menghubungkan Mahasiswa dengan aktivitas PKL/MBKM mereka.

#### `Users`
- **Role**: Autentikasi dan Role Management.
- **Relasi**:
  - `hasOne` -> `Mahasiswa`
  - `hasOne` -> `Dosen`

#### `Mahasiswa`
- **Data**: `nim`, `nama`, `kelas`, `angkatan`, `prodiId`.
- **Relasi**:
  - `belongsTo` -> `User`
  - `belongsTo` -> `Prodi`
  - `hasMany` -> `Pendaftaran`

#### `Dosen`
- **Data**: `nidn`, `nama`.
- **Relasi**:
  - `belongsTo` -> `User`
  - `hasMany` -> `Pendaftaran` (sebagai Pembimbing)

#### `Pendaftaran` (Core Transaksi)
- **Data**:
  - `tipe`: Enum ('PKL1', 'PKL2', 'MBKM')
  - `status`: Enum ('PENDING', 'APPROVED', 'REJECTED', 'ACTIVE', 'COMPLETED')
  - `judulProject`: String (PKL2)
- **Relasi**:
  - `belongsTo` -> `Mahasiswa`
  - `belongsTo` -> `Instansi`
  - `belongsTo` -> `Dosen` (Pembimbing)
  - `belongsTo` -> `Periode`
  - `hasMany` -> `LaporanHarian`
  - `hasMany` -> `LaporanMingguan`

#### `Laporan` (Harian/Mingguan/Tengah/Akhir)
- Mencatat progress mahasiswa.
- Terhubung ke `Pendaftaran`.

### API Endpoints

Base URL: `/api` (kecuali Auth di `/auth`)

#### **Auth** (`/auth`)
- `POST /register`: Pendaftaran akun baru.
- `POST /login`: Masuk aplikasi (Return JWT).

#### **Master Data** (`/api`)
- **Periode**: `/periode` (CRUD)
- **Prodi**: `/prodi` (CRUD)
- **Instansi**: `/instansi` (CRUD) - Mahasiswa bisa create (usulan).
- **Users**: `/users` (Admin only CRUD)
- **Kriteria Nilai**: `/kriteria` (CRUD)

#### **PKL Workflow** (`/api`)
- **Pendaftaran**:
  - `POST /pkl/register`: Mahasiswa mendaftar PKL.
  - `GET /pkl/me`: Status pendaftaran user login.
  - `GET /pkl/all`: Admin melihat semua pendaftaran.
  - `PUT /pkl/:id/assign`: Admin set dosen pembimbing.
  - `PUT /pkl/:id/validate`: Admin validasi status pendaftaran.
- **Bimbingan**:
  - `GET /pkl/bimbingan`: Dosen melihat mahasiswa bimbingan.
- **Laporan**:
  - `POST/GET /laporan/harian`: Logbook harian.
  - `POST/GET /laporan/mingguan`: Laporan mingguan.
  - `POST/GET /laporan/tengah`: Laporan tengah periode.
  - `POST/GET /laporan/akhir`: Laporan akhir periode.
  - `PUT /laporan/.../approve`: Dosen menyetujui laporan.

#### **Penilaian** (`/api`)
- `POST /nilai`: Input nilai individual.
- `GET /nilai/rekap`: Rekap nilai (Admin).
- `POST /sidang`: Penjadwalan sidang.

---

## 3. Frontend (Sidemi) Documentation

Aplikasi dibangun menggunakan Next.js App Router dengan struktur direktori berbasis fitur di dalam `app/dashboard`.

### Struktur Halaman (`app/dashboard`)

#### **Role: Mahasiswa**
- **`/pendaftaran`**: Form pendaftaran PKL/MBKM.
- **`/laporan`**:
  - Tab Harian, Mingguan, Tengah, Akhir.
  - Fitur upload file dan input logbook.
- **`/nilai`**: Melihat transkrip nilai PKL.
- **`/profile`**: Edit data diri mahasiswa.

#### **Role: Dosen**
- **`/bimbingan`**: List mahasiswa bimbingan.
  - Aksi: Approve Pendaftaran (jika flow mendukung), Cek Laporan.
- **`/sidang`**: Jadwal menguji/membimbing sidang.

#### **Role: Admin / Kaprodi**
- **`/admin`**: Dashboard Admin.
  - **`/validasi`**: Validasi pendaftaran masuk.
- **`/master`**: Manajemen data master.
  - `/dosen`, `/mahasiswa`, `/instansi`, `/periode`.
- **`/peserta`**: Monitoring seluruh peserta PKL active.
- **`/nilai`**: Rekapitulasi nilai akhir.

### Komponen Utama
- **Layout**: Sidebar navigation responsive (menggunakan `Sheet` untuk mobile).
- **UI Components**: Menggunakan Radix UI (Dialog, Popover, Select, Tabs) yang dibungkus di `components/ui`.
- **Forms**: Input validasi standar HTML/React hook form (implied).

### Catatan Pengembangan
- **Environment**: Setup `.env` untuk `NEXT_PUBLIC_API_URL`.
- **Styling**: Ubah `globals.css` atau konfigurasi Tailwind untuk tema warna.

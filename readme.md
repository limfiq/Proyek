# Dokumentasi Sistem Informasi PKL/MBKM

Dokumentasi ini mencakup skema arsitektur, struktur database, API endpoint, cara deployment, dan struktur frontend untuk aplikasi manajemen PKL/MBKM.

## 1. Overview Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js (^5.2.1)
- **Database**: MySQL (via `mysql2`)
- **ORM**: Sequelize (^6.37.7)
- **Authentication**: JWT & Bcrypt
- **Security**: Helmet, Cors
- **Containerization**: Docker

### Frontend (Sidemi)
- **Framework**: Next.js 16.1.1 (App Router)
- **UI Library**: React 19, Radix UI (Primitives)
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Data Fetching**: Axios
- **Charts**: Recharts
- **Exporting**: `xlsx` (Excel), `jspdf` & `jspdf-autotable` (PDF)

---

## 2. Deployment Guide (Docker)

Aplikasi ini telah didukung oleh Docker dan Docker Compose untuk kemudahan deployment.

### Prasyarat
- Docker Engine & Docker Compose terinstall di server/local machine.
- Node.js (opsional, jika ingin menjalankan tanpa Docker).

### Langkah Deployment
1. **Clone Repository**
   Pastikan seluruh source code berada di direktori proyek (e.g., `e:\Project\proyek`).

2. **Konfigurasi Environment**
   File `docker-compose.yml` sudah dikonfigurasi dengan default credentials. Untuk production, **WAJIB** mengganti password database.
   
   Edit `docker-compose.yml` di root directory:
   ```yaml
   services:
     db:
       environment:
         MYSQL_ROOT_PASSWORD: password_rahasia_anda  # UBAH INI
         MYSQL_DATABASE: db_pkl_new
     
     backend:
       environment:
         DB_PASSWORD: password_rahasia_anda      # SESUAIKAN DENGAN DI ATAS
         # ... variabel lain
   ```

3. **Build & Run**
   Jalankan perintah berikut di terminal root folder:
   ```bash
   docker-compose up -d --build
   ```
   
   Proses ini akan:
   - Membuat container MySQL (port 3306).
   - Membuild image Backend dan menjalankannya (port 5000).
   - Membuild image Frontend (Next.js) dan menjalankannya (port 3000).

4. **Akses Aplikasi**
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:5000
   - **Database**: Port 3306 (Gunakan DBeaver/HeidiSQL untuk akses jika perlu).

### Troubleshooting Deployment
- **API Connection Refused**: Jika frontend tidak bisa menghubungi backend, pastikan `NEXT_PUBLIC_API_URL` di `docker-compose.yml` (service `frontend`) mengarah ke IP publik server atau domain backend, bukan `localhost` jika diakses dari client machine yang berbeda.
- **Dependency Issues**: Jika ada error module missing, coba rebuild tanpa cache: `docker-compose build --no-cache`.

---

## 3. Backend Documentation

### Database Schema (Core Models)

Relasi utama berpusat pada model `Pendaftaran` yang menghubungkan Mahasiswa dengan aktivitas PKL/MBKM mereka.

#### `Users`
- **Role**: Autentikasi dan Role Management.
- **Relasi**: `hasOne` -> `Mahasiswa`, `hasOne` -> `Dosen`

#### `Mahasiswa` & `Dosen`
- Menyimpan data profil spesifik (NIM, NIDN, Prodi, dll) yang terhubung ke `User`.

#### `Pendaftaran` (Core Transaksi)
- **Data**: Tipe (PKL1/PKL2/MBKM), Status, Judul Project.
- **Relasi**: ke `Mahasiswa`, `Instansi`, `Dosen` (Pembimbing), `Periode`.

#### `LaporanAkhir`
- **Data**: `fileUrl`, `ikuUrl` (Bukti IKU), `type_iku`, `finalUrl` (Laporan Final setelah sidang).

### API Endpoints
Base URL: `/api` for resources, `/auth` for authentication.

- **Auth**: Login/Register.
- **Master**: CRUD untuk `/periode`, `/prodi`, `/instansi`, `/users`.
- **Tx**: `/pkl` (Register, Assign, Validate), `/bimbingan`.
- **Laporan**: `/laporan/{harian,mingguan,tengah,akhir}`.
- **Nilai**: `/nilai` (Input & Rekap), `/sidang` (Scheduling).

---

## 4. Frontend (Sidemi) Documentation

Aplikasi dibangun menggunakan Next.js App Router.

### Update UI/UX (Jan 2026)
- **User Menu Relocation**: Menu "Ganti Password" dan "Logout" dipindahkan dari Sidebar ke **Dropdown Menu** di pojok kanan atas (Topbar/Header). Klik avatar user untuk mengaksesnya.
- **Robust Navigation**: Sidebar kini mendukung role case-insensitive untuk mencegah menu kosong.

### Fitur Baru: Export Data
Fitur **Export to Excel** dan **Export to PDF** telah tersedia di halaman Admin untuk memudahkan rekapitulasi data.

**Lokasi Fitur:**
1. **Master Instansi**: `/dashboard/master/instansi`
2. **Master Users**: `/dashboard/master/users`
3. **Validasi PKL**: `/dashboard/admin/validasi`
4. **Jadwal Sidang**: `/dashboard/admin/sidang`
5. **Rekap Nilai**: `/dashboard/admin/rekap`
6. **Rekap Laporan**: `/dashboard/admin/laporan`

Tombol export terletak di bagian header atau filter area pada masing-masing halaman. Export akan mengunduh data sesuai dengan **filter yang sedang aktif** (misal: hasil pencarian).

### Struktur Halaman (`app/dashboard`)

#### **Role: Mahasiswa**
- **`/pendaftaran`**: Form pendaftaran.
- **`/laporan`**: 
  - Tab Harian, Mingguan, Tengah, Akhir.
  - **Monitoring Status**: Menampilkan status dan link laporan Tengah/Akhir yang sudah disubmit.
- **`/nilai`**: Transkrip.
- **`/profile`**: Edit profil.

#### **Role: Dosen**
- **`/bimbingan`**: List mahasiswa bimbingan & approval laporan.
- **`/sidang`**: Jadwal menguji.

#### **Role: Admin / Kaprodi**
- **`/admin`**: Dashboard Admin.
  - **`/validasi`**: Validasi pendaftaran.
- **`/master`**: Manajemen data (Dosen, Mhs, Instansi, dll).
- **`/admin/sidang`**: Penjadwalan sidang.
- **`/admin/rekap`**: Input & monitor nilai.
- **`/admin/laporan`**: Monitoring kelengkapan laporan mahasiswa.

### Komponen Utama
- **Layout**: Sidebar navigation responsive + Topbar dengan User Dropdown.
- **Export Lib**: `lib/exportUtils.js` (Wrapper untuk `xlsx` dan `jspdf`).
- **UI**: Radix UI (Sheet, DropdownMenu, etc) + Tailwind CSS.


Panduan Setup Google Drive API untuk Logbook
Untuk mengaktifkan fitur upload foto ke Google Drive, Anda perlu mengatur Google Cloud Console dan mendapatkan Service Account Key.

Langkah 1: Buat Project & Enable API
Buka Google Cloud Console.
Buat Project Baru (misal: Sidemi Logbook).
Buka menu APIs & Services > Library.
Cari "Google Drive API" dan klik Enable.
Langkah 2: Buat Service Account
Buka menu APIs & Services > Credentials.
Klik + CREATE CREDENTIALS > Service Account.
Isi nama (misal: logbook-uploader) dan klik Create.
(Opsional) Pada langkah "Grant this service account access to project", Anda bisa pilih role Editor atau lewati saja (kita akan share folder secara spesifik nanti).
Klik Done.
Langkah 3: Generate JSON Key
Di daftar Service Accounts, klik pada email service account yang baru dibuat (contoh: logbook-uploader@sidemi-logbook.iam.gserviceaccount.com).
Masuk ke tab Keys.
Klik Add Key > Create new key.
Pilih JSON lalu klik Create.
File JSON akan terdownload otomatis.
Rename file tersebut menjadi service-account-key.json.
Pindahkan file ini ke folder: 
…/GitHub/Proyek/backend/service-account-key.json
.
Langkah 4: Siapkan Folder Google Drive
Buka Google Drive Anda (gunakan akun Gmail/Workspace biasa).
Buat Folder Baru (misal: Logbook Uploads).
Buka folder tersebut. Perhatikan URL-nya di browser.
URL: https://drive.google.com/drive/folders/1aBcDeFgHiJkLmNoPqRsTuVwXyZ
Folder ID adalah bagian terakhir: 1aBcDeFgHiJkLmNoPqRsTuVwXyZ.
Salin Folder ID ini.
Langkah 5: Beri Akses ke Service Account
Klik kanan folder Logbook Uploads > Share.
Di kolom "Add people", masukkan email service account tadi (yang berakhiran @...gserviceaccount.com).
Pastikan role-nya adalah Editor.
Klik Send (hilangkan centang "Notify people" jika ada, karena ini bot).
Langkah 6: Konfigurasi Backend
Buka file 
.env
 di folder backend.
Tambahkan atau update baris berikut:
env
GOOGLE_DRIVE_FOLDER_ID=paste_folder_id_disini
Restart server backend (npm run dev).
Selesai! Sekarang aplikasi akan mengupload foto logbook ke folder tersebut.
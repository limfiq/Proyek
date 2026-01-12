# XAMPP Services Setup Guide

## Deskripsi
Script ini menginstal Apache dan MySQL dari folder XAMPP (`E:\xampp`) sebagai Windows Service, sehingga mereka akan berjalan otomatis ketika Windows startup.

## File-file yang Disediakan

### 1. `install-xampp-services.bat` (Batch Script)
Script batch untuk instalasi services. Lebih sederhana dan straightforward.

### 2. `install-xampp-services.ps1` (PowerShell Script)
Script PowerShell yang lebih powerful dengan berbagai pilihan management.

---

## Cara Menggunakan

### **Menggunakan Batch Script (.bat)**

1. **Buka Command Prompt sebagai Administrator**
   - Tekan `Win + R`
   - Ketik `cmd`
   - Tekan `Ctrl + Shift + Enter` untuk membuka sebagai Administrator

2. **Jalankan script**
   ```
   e:\Project\proyek\install-xampp-services.bat
   ```

3. Script akan:
   - Instalasi Apache sebagai service "ApacheXAMPP"
   - Instalasi MySQL sebagai service "MySQL80"
   - Otomatis menjalankan kedua service
   - Konfigurasi untuk auto-start pada Windows startup

---

### **Menggunakan PowerShell Script (.ps1)**

1. **Buka PowerShell sebagai Administrator**
   - Tekan `Win + X`
   - Pilih "Windows PowerShell (Admin)"

2. **Set ExecutionPolicy** (jika belum pernah diset)
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

3. **Jalankan script dengan parameter yang diinginkan:**

   **Instalasi Services:**
   ```powershell
   E:\Project\proyek\install-xampp-services.ps1 -Install
   ```

   **Lihat Status Services:**
   ```powershell
   E:\Project\proyek\install-xampp-services.ps1
   ```

   **Start Services:**
   ```powershell
   E:\Project\proyek\install-xampp-services.ps1 -Start
   ```

   **Stop Services:**
   ```powershell
   E:\Project\proyek\install-xampp-services.ps1 -Stop
   ```

   **Uninstall Services:**
   ```powershell
   E:\Project\proyek\install-xampp-services.ps1 -Uninstall
   ```

---

## Verifikasi Instalasi

### Cara 1: Melalui Services GUI
1. Tekan `Win + R`
2. Ketik `services.msc`
3. Tekan Enter
4. Cari "ApacheXAMPP" dan "MySQL80"
5. Pastikan status kedua service adalah "Running"

### Cara 2: Melalui Command Prompt
```cmd
sc query ApacheXAMPP
sc query MySQL80
```

---

## Mengelola Services Secara Manual

### Start Services
```cmd
net start ApacheXAMPP
net start MySQL80
```

### Stop Services
```cmd
net stop ApacheXAMPP
net stop MySQL80
```

### Uninstall Services
```cmd
REM Uninstall Apache
net stop ApacheXAMPP
"E:\xampp\apache\bin\httpd.exe" -k uninstall -n "ApacheXAMPP"

REM Uninstall MySQL
net stop MySQL80
"E:\xampp\mysql\bin\mysqld.exe" --remove
```

---

## Troubleshooting

### Service sudah ada / Error saat instalasi
- Script batch dan PowerShell akan otomatis menghapus service yang sudah ada sebelum menginstal yang baru

### Port sudah digunakan
- Default Apache: Port 80
- Default MySQL: Port 3306
- Jika ada service lain yang menggunakan port ini, ubah konfigurasi di XAMPP

### Access Denied
- Pastikan menjalankan script sebagai Administrator

### MySQL tidak start
- Periksa apakah ada instance MySQL lain yang sedang berjalan
- Periksa file `E:\xampp\mysql\data\` tidak corrupt
- Lihat MySQL error log di `E:\xampp\mysql\data\`

---

## Informasi Tambahan

- **Apache Service Name**: ApacheXAMPP
- **MySQL Service Name**: MySQL80
- **Startup Type**: Automatic (akan auto-start saat Windows boot)
- **XAMPP Path**: E:\xampp

---

## Catatan Penting

1. Script harus dijalankan sebagai Administrator
2. Jangan menjalankan XAMPP Control Panel bersamaan dengan services ini (bisa conflict)
3. Pastikan XAMPP sudah diinstall di `E:\xampp`
4. Untuk development, bisa juga menggunakan XAMPP Control Panel tanpa services

---

Selesai! Apache dan MySQL akan otomatis berjalan setiap kali Windows startup.

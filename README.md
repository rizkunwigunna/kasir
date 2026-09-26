# 🛒 Kasir Pintar (Mobile-First POS)

Aplikasi Kasir (Point of Sale) modern, responsif, dan dirancang khusus untuk kenyamanan penggunaan di **HP (Smartphone)** maupun tablet dan desktop. Aplikasi ini siap di-deploy secara instan ke **Vercel**.

---

## ✨ Fitur Utama

- 📱 **Mobile-First Responsive Design**: Tampilan khusus layar smartphone dengan navigasi jempol (*thumb-friendly*), keranjang geser (*slide-over drawer*), dan tombol nominal cepat.
- 📷 **Scan Barcode Kamera HP**: Gunakan kamera HP langsung untuk memindai barcode / QR code barang secara otomatis.
- 🧾 **Struk Digital & Thermal Print**:
  - Format struk kasir profesional (58mm / 80mm).
  - Cetak langsung ke printer Bluetooth / Thermal via browser print (`window.print`).
  - **Kirim Struk ke WhatsApp**: Kirim rincian struk otomatis ke nomor WA pelanggan dalam 1 kali klik.
- 💳 **Multi Metode Pembayaran**:
  - Tunai (dengan hitung kembalian otomatis & tombol nominal cepat).
  - QRIS (tampilan kode QRIS siap scan pelanggan).
  - Transfer Bank (BCA, Mandiri, BRI dengan tombol salin nomor rekening).
  - Kartu Debit / EDC.
- 📦 **Manajemen Produk & Stok**: Tambah, ubah, hapus produk, atur harga beli & harga jual, serta peringatan otomatis jika stok menipis (≤ 5).
- 📊 **Laporan & Analitik Penjualan**: Lacak omset harian/mingguan/bulanan, estimasi margin laba, produk terlaris, dan rincian metode pembayaran.
- 💾 **Penyimpanan Lokal & Backup/Restore**: Data tersimpan otomatis di browser HP tanpa perlu setup database yang rumit, dan dapat diexport/diimport dalam bentuk file JSON.
- 📲 **PWA (Progressive Web App)**: Bisa di-*install* ke layar utama HP (*Add to Home screen*) agar berjalan fullscreen layaknya aplikasi kasir native di Play Store / App Store.

---

## 🚀 Cara Menjalankan di Lokal (PC / Laptop)

1. Jalankan aplikasi kasir:
   ```bash
   npm run dev
   ```

2. **Untuk mencoba langsung di HP via jaringan Wi-Fi lokal:**
   ```bash
   npm run dev -- --host
   ```
   Buka alamat IP yang muncul di terminal (misal: `http://192.168.1.10:5173`) melalui browser Chrome/Safari di HP Anda.

---

## 🌐 Cara Deploy ke Vercel (Online & Diakses dari Mana Saja)

### Opsi 1: Menggunakan GitHub (Sangat Disarankan)
1. Buat repository baru di [github.com](https://github.com/new).
2. Hubungkan repository lokal dan push:
   ```bash
   git remote add origin https://github.com/USERNAME_ANDA/NAMA_REPO.git
   git branch -M main
   git push -u origin main
   ```
3. Buka [vercel.com](https://vercel.com) dan login (bisa login dengan akun GitHub).
4. Klik tombol **"Add New..."** &rarr; **"Project"**.
5. Pilih repository kasir Anda, lalu klik **"Deploy"**.
6. Selesai! Dalam hitungan detik Anda akan mendapatkan URL Vercel (contoh: `https://kasir-anda.vercel.app`).

### Opsi 2: Deploy Langsung via Vercel CLI
Jalankan perintah ini di terminal folder proyek:
```bash
npx vercel
```
Ikuti instruksi login dan konfirmasi di layar terminal sampai proses deploy selesai.

---

## 📱 Cara Memasang di Layar Utama HP (Install PWA)

Setelah aplikasi terbuka di browser HP menggunakan link Vercel:
- **Android (Google Chrome):**
  1. Buka link Vercel Anda di Chrome.
  2. Ketuk ikon titik tiga (⋮) di kanan atas.
  3. Pilih **"Tambahkan ke Layar Utama" (Add to Home screen)** atau **"Instal Aplikasi"**.
- **iPhone (Apple Safari):**
  1. Buka link Vercel Anda di Safari.
  2. Ketuk tombol **Share** (kotak dengan panah ke atas) di bagian bawah.
  3. Gulir ke bawah dan pilih **"Add to Home Screen"** (Tambahkan ke Layar Utama).

Aplikasi kini akan memiliki ikon sendiri di beranda HP Anda dan terbuka fullscreen tanpa address bar browser!

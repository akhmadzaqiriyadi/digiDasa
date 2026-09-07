# 📘 Panduan Operasional & Deployment: ADAPTIVA-BOT

> **Panduan Lengkap untuk Guru, Panitia SPMB, dan Pengembang Sistem**  
> SMK Negeri 1 Adiwerna (STM ADB) — Tim Adaptiva (DIGIForward 2026–2027)

---

## 📑 Daftar Isi
1. [Ringkasan Peran Sistem](#1-ringkasan-peran-sistem)
2. [Panduan untuk Panitia SPMB & Guru](#2-panduan-untuk-panitia-spmb--guru)
   - [A. Menghubungkan Nomor WhatsApp Sekolah](#a-menghubungkan-nomor-whatsapp-sekolah)
   - [B. Memperbarui Data Biaya, Kuota, & Jadwal SPMB](#b-memperbarui-data-biaya-kuota--jadwal-spmb)
   - [C. Menangani Tiket Eskalasi Orang Tua Murid](#c-menangani-tiket-eskalasi-orang-tua-murid)
3. [Panduan Pengembang & Konfigurasi Teknis](#3-panduan-pengembang--konfigurasi-teknis)
   - [A. Persyaratan Lingkungan (Prerequisites)](#a-persyaratan-lingkungan-prerequisites)
   - [B. Menyiapkan Environment Variables (.env)](#b-menyiapkan-environment-variables-env)
   - [C. Menjalankan Database Prisma (Local SQLite & Production PostgreSQL)](#c-menjalankan-database-prisma)
   - [D. Menjalankan Server & API Documentation](#d-menjalankan-server--api-documentation)
4. [Panduan Deployment ke Cloud / VPS (Zero-Cost Ready)](#4-panduan-deployment-ke-cloud--vps)
   - [Opsi A: Railway / Render (Cloud App Engine)](#opsi-a-railway--render)
   - [Opsi B: VPS Ubuntu / Debian (PM2 + Nginx)](#opsi-b-vps-ubuntu--debian-pm2--nginx)
5. [Troubleshooting & Solusi Masalah Sering Muncul (FAQ)](#5-troubleshooting--faq)

---

## 1. Ringkasan Peran Sistem

**ADAPTIVA-BOT** adalah asisten informasi digital 24 jam berbasis AI (Google Gemini 2.5 Flash Grounded) yang terhubung langsung ke WhatsApp dan Portal Sekolah.

```
                    ┌────────────────────────┐
                    │ Orang Tua / Calon Siswa │
                    └───────────┬────────────┘
                                │ (Kirim Chat WA / Web)
                                ▼
                    ┌────────────────────────┐
                    │ WhatsApp / Web Gateway │
                    └───────────┬────────────┘
                                │
                    ┌───────────▼────────────┐
                    │ ADAPTIVA-BOT Engine    │◄─── SK Resmi Sekolah & Data SPMB
                    └───────────┬────────────┘
                                │ (Bantuan Khusus / Tiket)
                                ▼
                    ┌────────────────────────┐
                    │ Panitia SPMB Sekolah   │
                    └────────────────────────┘
```

---

## 2. Panduan untuk Panitia SPMB & Guru

### A. Menghubungkan Nomor WhatsApp Sekolah
1. Pastikan server backend sudah berjalan (`cd backend && npm run dev`).
2. Tampilkan QR Code melalui Frontend atau ambil QR data URL dari endpoint API: **`GET /api/v1/whatsapp/status`** (atau picu inisialisasi dengan `POST /api/v1/whatsapp/connect`).
3. Di HP admin panitia:
   - Buka **WhatsApp** ➔ **Titik Tiga / Pengaturan** ➔ **Perangkat Tertaut (Linked Devices)**.
   - Ketuk **Tautkan Perangkat**.
   - Arahkan kamera HP ke QR Code.
4. Status akan berubah menjadi **`CONNECTED`** (terpantau di `/api/v1/whatsapp/status`).
5. Sesi login tersimpan otomatis di `.wwebjs_auth`; tidak perlu scan ulang setiap hari!

### B. Memperbarui Data Biaya, Kuota, & Entitas Pengetahuan (Full Dynamic CRUD)
Data acuan AI dapat diperbarui secara dinamis langsung di PostgreSQL:
* **Cara 1 (Kelola Entitas Tambahan Bebas):**
  - Kirim `POST /api/v1/knowledge/entities` untuk menambahkan program baru (Kelas Industri, Beasiswa Khusus, Program Magang Jepang, Ekstrakurikuler).
  - Gunakan `GET /api/v1/knowledge/entities?page=1&limit=10&category=BEASISWA&q=tahfidz` untuk melihat data dengan pagination & filter.
  - Gunakan `PUT /api/v1/knowledge/entities/:id` dan `DELETE /api/v1/knowledge/entities/:id` untuk edit dan hapus.
* **Cara 2 (Kelola Jurusan & FAQ):**
  - Jurusan: `POST /api/v1/knowledge/jurusan`, `PUT /api/v1/knowledge/jurusan/:kode`, `DELETE /api/v1/knowledge/jurusan/:kode`.
  - FAQ: `POST /api/v1/knowledge/faqs`, `PUT /api/v1/knowledge/faqs/:id`, `DELETE /api/v1/knowledge/faqs/:id`.
* **Cara 3 (Bulk Update Grounding):**
  - Kirim request `PUT /api/v1/knowledge` dengan rincian biaya atau jadwal SPMB baru.
  - Setiap perubahan data di database langsung tersinkronisasi ke prompt AI Google Gemini (< 1 ms).

### C. Menangani Tiket Eskalasi Orang Tua Murid
1. Jika orang tua murid meminta dispensasi khusus atau konsultasi pribadi, bot otomatis mencatat tiket dan memberikan nomor WhatsApp panitia (`wa.me/6285292677431`).
2. Panitia dapat melihat daftar tiket yang masuk di:
   - Endpoint: **`GET /api/v1/tickets?status=OPEN`**
   - Atau lewat antarmuka Portal Sekolah (**stmadb-portal**).
3. Setelah masalah selesai dibantu oleh panitia, tandai selesai dengan memanggil:
   - **`POST /api/v1/tickets/<ID_TIKET>/resolve`**

---

## 3. Panduan Pengembang & Konfigurasi Teknis

### A. Persyaratan Lingkungan (Prerequisites)
* **Node.js**: Versi `>= 18.x` (direkomendasikan Node 20 LTS atau 22 LTS).
* **NPM**: Versi `>= 9.x`.
* **PostgreSQL**: Port 5432 (Lokal di macOS via Homebrew / Postgres.app atau cloud Supabase/Neon).
* **Google Chrome**: Terinstall di sistem untuk *engine headless browser* WhatsApp.

### B. Menyiapkan Environment Variables (.env)
Salin contoh environment:
```bash
cp .env.example .env
```
Isi konfigurasi pada file `.env`:
```env
PORT=3000
NODE_ENV=development

# Google Gemini API Key dari Google AI Studio (Gratis)
GEMINI_API_KEY=AIzaSy...

# Nomor WhatsApp Resmi Panitia SPMB
PANITIA_WA_NUMBER=6285292677431
PANITIA_NAME="Panitia SPMB SMK Negeri 1 Adiwerna"

# Database URL PostgreSQL (Mac lokal atau Cloud)
DATABASE_URL="postgresql://zaq@localhost:5432/digidasa"

# Autostart WhatsApp saat server nyala (set false saat coding agar tidak spam QR)
ENABLE_WA_AUTOSTART=false
```

### C. Menjalankan Database Prisma (PostgreSQL)
```bash
# Sinkronisasi schema model ke database PostgreSQL:
npm run prisma:push

# Mengisi database dengan data awal resmi sekolah (Seeder):
npm run prisma:seed
```

### D. Menjalankan Server & API Documentation
```bash
# Mode Development (Live reload otomatis):
npm run dev

# Kompilasi TypeScript:
npm run build

# Menjalankan Produksi:
npm start

# Menjalankan E2E Test Suite (Vitest):
npm test

# Menjalankan Linter & Formatter:
npm run lint
npm run format
```

Akses Dokumentasi Interaktif: **`http://localhost:3000/reference`**

---

## 4. Panduan Deployment ke Cloud / VPS

### Opsi A: Railway / Render (Zero-Cost Cloud)
1. Hubungkan repositori GitHub ini ke **Railway** atau **Render**.
2. Pasang environment variables sesuai file `.env` di dashboard Railway.
3. Buat database **PostgreSQL** gratis di Railway/Supabase/Neon.tech dan masukkan koneksi string ke variabel `DATABASE_URL`.
4. *Build Command:* `npm run build && npm run prisma:push`
5. *Start Command:* `npm start`

### Opsi B: VPS Ubuntu / Debian (PM2 + Nginx)
1. **Clone repositori dan install dependencies:**
   ```bash
   git clone https://github.com/smkn1adiwerna/digidasa.git
   cd digidasa
   npm install
   cp .env.example .env
   # Edit .env dengan nano .env
   ```
2. **Install Chromium / Google Chrome:**
   ```bash
   sudo apt update
   sudo apt install -y chromium-browser libnss3 libatk-bridge2.0-0 libgtk-3-0 libasound2
   ```
3. **Build & Jalankan dengan PM2 Process Manager:**
   ```bash
   npm run build
   npm run prisma:push
   npm install -g pm2
   pm2 start dist/server.js --name adaptiva-bot
   pm2 save
   pm2 startup
   ```
4. **Setup Reverse Proxy Nginx (SSL HTTPS):**
   ```nginx
   server {
       server_name bot.smkn1adiwerna.sch.id;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

---

## 5. Troubleshooting & FAQ

| Masalah | Penyebab | Solusi |
| :--- | :--- | :--- |
| **Pesan WhatsApp tidak dibalas** | WhatsApp belum berstatus `CONNECTED`. | Cek status di `GET /api/v1/whatsapp/status` atau buka antarmuka Frontend untuk scan ulang QR code dengan HP panitia. |
| **Error `GEMINI_API_KEY is not initialized`** | API Key kosong atau belum dimasukkan ke `.env`. | Buka [Google AI Studio](https://aistudio.google.com/), buat API key gratis baru, dan pasang di `.env`. *(Catatan: Sistem tetap jalan menggunakan Local Semantic Fallback Engine).* |
| **Error Puppeteer Chrome tidak ditemukan** | Path Chrome belum sesuai di OS Linux/Mac. | Pastikan Google Chrome terinstall atau atur path di file `WhatsAppProvider.ts`. |
| **Format teks di WhatsApp berantakan** | Markdown mengandung double asterisk atau bintang bullet. | Sistem sudah otomatis memformat dengan `WhatsAppFormatter.ts` (`*tebal*` & `• bullet`). |

---
*Dibuat oleh Tim SMK Negeri 1 Adiwerna - Adaptiva | DIGIForward 2026–2027.*

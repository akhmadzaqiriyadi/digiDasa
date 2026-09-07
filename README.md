<div align="center">
  <img src="./docs/assets/hero_banner.jpg" alt="ADAPTIVA-BOT SMK Negeri 1 Adiwerna Hero Banner" width="100%" style="border-radius: 16px; margin-bottom: 24px;" />

  <table align="center" border="0" style="border: none; margin: 10px 0;">
    <tr style="border: none;">
      <td align="center" style="border: none; padding-right: 15px;">
        <img src="./docs/assets/logo_smk.png" alt="Logo SMK Negeri 1 Adiwerna" width="110" />
      </td>
      <td align="left" style="border: none;">
        <h1 style="margin: 0; padding: 0; border-bottom: none;">🚀 ADAPTIVA-BOT</h1>
        <h3 style="margin: 4px 0 0 0; color: #64748b; font-weight: 500;">SMK Negeri 1 Adiwerna (STM ADB) • DIGIForward 2026–2027</h3>
      </td>
    </tr>
  </table>

  [![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-v20+-green?logo=node.js&logoColor=white)](https://nodejs.org/)
  [![Express](https://img.shields.io/badge/Express-v5.2-black?logo=express&logoColor=white)](https://expressjs.com/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-5432-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
  [![Prisma ORM](https://img.shields.io/badge/Prisma-v6.4-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
  [![Google Gemini](https://img.shields.io/badge/Google%20Gemini-2.5%20Flash-8E75B2?logo=google&logoColor=white)](https://ai.google.dev/)
  [![Vitest E2E](https://img.shields.io/badge/Vitest-24%2F24%20Passing%20(100%25)-brightgreen?logo=vitest&logoColor=white)](https://vitest.dev/)
  [![API Docs](https://img.shields.io/badge/Scalar%20UI-API%20Reference-purple)](http://localhost:3000/reference)

  <p><strong>Asisten Informasi Digital Sekolah 24/7 Berbasis WhatsApp & Cognitive AI Grounded</strong></p>
  <p>Proyek Inovasi Layanan Publik Pendidikan untuk Tim <strong>SMK Negeri 1 Adiwerna (STM ADB) - Tim Adaptiva</strong> dalam Program <strong>DIGIForward 2026–2027</strong> (PT Generasi Edukator Indonesia & CTI Group).</p>
</div>

---

## 📑 Pusat Dokumentasi Proyek

Seluruh berkas dokumen perencanaan, lembar kerja, panduan teknis, dan PDF resmi tersimpan di direktori [`docs/`](./docs):

| Berkas | Format | Deskripsi |
| :--- | :---: | :--- |
| **[Panduan Penggunaan & Deployment](./docs/PANDUAN_PENGGUNAAN_DAN_DEPLOYMENT.md)** | 📘 Markdown | Panduan operasional panitia SPMB, panduan guru, konfigurasi database PostgreSQL, dan deploy cloud. |
| **[Lembar Kerja DIGIForward Adaptiva](./docs/LEMBAR_KERJA_DIGIFORWARD_ADAPTIVA.pdf)** | 📄 PDF Resmi | Berkas eksekutif 4 halaman siap cetak lengkap dengan diagram alur dan peta konsep berwarna. |
| **[Lembar Kerja Source Text](./docs/LEMBAR_KERJA_DIGIFORWARD_ADAPTIVA.md)** | 📝 Markdown | Teks lengkap Aktivitas 1–4, perumusan empati orang tua murid, identifikasi masalah, dan solusi. |
| **[Dokumen Template DIGIForward](./docs/SMKNegeri1Adiwerna_Adaptiva.pdf)** | 📑 PDF | Template lembar kerja resmi dari PT Generasi Edukator Indonesia & CTI Group. |

---

## 🏛️ Bedah Arsitektur Sistem (System Architecture Deep Dive)

ADAPTIVA-BOT dirancang dengan arsitektur **Monorepo Modern**, memisahkan secara tegas antara **Frontend Client (`fe/`)**, **Backend Core Engine (`backend/`)**, **WhatsApp Web Gateway**, **Cognitive AI Grounding Layer**, dan **Data Persistence Layer**.

<div align="center" style="margin: 30px 0;">
  <img src="./docs/assets/architecture.jpg" alt="ADAPTIVA-BOT System Architecture Infographic" width="100%" style="border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);" />
</div>

---

### 1. Lapisan Antarmuka & Klien (*Presentation & Gateway Layer*)
* **🌐 Frontend Client Application (`fe/`)**:
  * Dirancang sebagai antarmuka tunggal untuk staf, guru, dan admin panitia SPMB.
  * **WhatsApp QR Scanner**: Antarmuka interaktif pemindaian QR Code (mengonsumsi `GET /api/v1/whatsapp/status` dan `POST /api/v1/whatsapp/connect`) menggantikan halaman HTML lama backend.
  * **Dynamic Knowledge Base Manager**: Mengelola entitas pengetahuan kustom (`KnowledgeEntity`), kuota jurusan, dan FAQ secara visual dengan dukungan paginasi, pencarian, dan filter kategori.
  * **Pusat Tiket Eskalasi**: Memantau antrean pertanyaan wali murid yang butuh penanganan manusia (`GET /api/v1/tickets?status=OPEN`) serta melakukan penyelesaian tiket (*resolve*).
  * **Dashboard Analitik**: Visualisasi grafik topik terpopuler, total interaksi, dan status kesehatan server (`GET /api/v1/status`).
  * **Web Chatbot Widget (Opsional)**: Komponen chat langsung di portal web sekolah bagi pendaftar yang tidak membuka WhatsApp.
* **📱 WhatsApp Web Gateway (`whatsapp-web.js`)**:
  * Menjalankan instance Chromium headless dengan persistensi otentikasi berbasis `LocalAuth`.
  * Menggunakan pola *Observer / EventEmitter* untuk menangani siklus hidup koneksi (`qr`, `ready`, `authenticated`, `message_create`, `disconnected`).
  * Bekerja secara *asynchronous non-blocking*, sehingga pesan masuk dari ratusan wali murid dapat diproses secara konkuren tanpa hambatan.
* **⚙️ Express 5 Headless REST API**:
  * Seluruh endpoint menyajikan format standar JSON (`application/json`) murni (*Pure Headless Architecture*).
  * Dilengkapi middleware keamanan CORS terkonfigurasi, request rate protection, dan parser payload body 10MB.
* **📖 Dokumentasi Interaktif Scalar UI (`/reference`)**:
  * Terintegrasi langsung dengan spesifikasi OpenAPI 3.0 bertema *DeepSpace Dark Theme*.
  * Memungkinkan pengujian interaktif langsung (*Try It Out*) untuk seluruh 24 endpoint API.

---

### 2. Lapisan Domain & Logika Bisnis (*Domain Core Layer*)
* **Modul Chat & Conversational Memory**:
  * Menyimpan riwayat percakapan per sesi/nomor telepon dalam struktur *sliding memory window* untuk mempertahankan konteks obrolan (*multi-turn dialog*).
  * Melakukan validasi DTO (*Data Transfer Object*) secara ketat menggunakan **Zod Schema**.
* **Modul Knowledge Base & Grounding Dinamis**:
  * **Dual-Layer Storage Architecture**: Membaca data dari PostgreSQL menggunakan Prisma dan menyimpannya di memori (*in-memory fast cache*) untuk kueri AI instan.
  * Menyediakan model kustom **`KnowledgeEntity`** yang memungkinkan panitia menambahkan program baru (misal: *Kelas Industri Toyota*, *Beasiswa Tahfidz*, *Program Magang Jerman*) secara dinamis melalui REST API tanpa restart server.
  * Fitur pencarian teks (`q`), multi-filter (`category`, `isActive`), serta paginasi (`page`, `limit`) dan pengurutan (`sortBy`, `sortOrder`).
* **Modul Human Escalation & Ticketing**:
  * Mendeteksi kebutuhan bantuan khusus dari calon siswa/orang tua (misal: permohonan keringanan biaya berkas, masalah legalisir ijazah, atau penanganan khusus).
  * Otomatis membuat tiket antrean (`TCK-XXXXXX`) dan menghasilkan tautan WhatsApp resmi panitia (`https://wa.me/6285292677431?text=...`) agar terjadi peralihan mulus (*seamless human handover*).
* **WhatsApp Formatter (`WhatsAppFormatter`)**:
  * Secara otomatis mentransformasi format Markdown standar (seperti `## Heading`, `**Bold**`, `[Link](url)`) menjadi format teks natif WhatsApp (`*Bold*`, bullet emoji `•`, spacing rapi) agar nyaman dibaca di layar HP.

---

### 3. Lapisan Cognitive AI & Decision Engine (*Hybrid 4-Tier Architecture*)
Sistem menerapkan **Arsitektur Pengambilan Keputusan Hibrida (4 Tingkat)** untuk menjamin kecepatan respons instan (< 1 ms), keakuratan 100% tanpa halusinasi, dan ketersediaan layanan 24/7:

```
                          [Pesan WhatsApp / Web Masuk]
                                       │
               ┌───────────────────────┴───────────────────────┐
               ▼                                               ▼
   [Angka 1-5 / Menu Cepat]                        [Pertanyaan Kalimat Bebas]
               │                                               │
        (Eksekusi 0 ms)                                        ▼
      Fast Numeric Router                         [Google Gemini 2.5 Flash]
  (Data Resmi SK SPMB 2026)                                    │
                                               ┌───────────────┴───────────────┐
                                               ▼                               ▼
                                        [Data Tersedia]             [Di Luar Cakupan Data /
                                      Jawaban Santun &               Butuh Konfirmasi Staf /
                                      Akurat Sesuai SK                   Kata Kunci 'Admin']
                                                                               │
                                                                               ▼
                                                                  [HUMAN ESCALATION TRIGGER]
                                                                               │
                                                              ┌────────────────┴────────────────┐
                                                              ▼                                 ▼
                                                     Buat Tiket Persisten              Kirimkan Nomor Tiket
                                                   (tickets.json / Database)           ke WhatsApp Pengguna
```

1. **Tier 1 - Fast Numeric Router (0 ms Latency)**:
   - Menangkap pintasan angka cepat (**1 s.d. 5**) atau kata kunci pasti tanpa membuang kuota/latency API:
     * **`1`**: Pilihan Jurusan & Kuota Daya Tampung SPMB.
     * **`2`**: Syarat Berkas & Dokumen Pendaftaran Resmi.
     * **`3`**: Rincian Biaya Bebas SPP (Gratis) & Paket Seragam.
     * **`4`**: Jadwal & Alur Tahapan Pendaftaran SPMB 2026.
     * **`5`**: Bantuan Staf Panitia SPMB & Pembuatan Tiket Layanan.
2. **Tier 2 - Cognitive Generative AI (Google Gemini 2.5 Flash Grounded)**:
   - Memproses pertanyaan bahasa alami kontekstual dari orang tua murid (contoh: *"kalau anak saya dari luar kota apa syaratnya?"* atau *"seragamnya bisa dicicil gak?"*).
   - Dibatasi secara mutlak oleh SK Panitia SPMB 2026/2027 sebagai pedoman anti-halusinasi (*Zero Hallucination Guarantee*).
3. **Tier 3 - Deterministic Semantic Fallback Engine**:
   - Menjamin bot **tetap beroperasi normal dalam waktu < 1 ms** saat kuota API Gemini habis, terjadi gangguan jaringan internet, atau saat offline.
4. **Tier 4 - Human Escalation & Persistent Ticketing**:
   - Mendeteksi kasus khusus/dispensasi atau permintaan eksplisit menghubungi staf (`admin`, `panitia`, `manusia`, atau menu `5`).
   - Otomatis menerbitkan nomor tiket unik (contoh: `#TCK-956915`), mengirimkan nomor tiket tersebut ke chat WhatsApp pendaftar, dan menyimpannya secara persisten ke disk (`backend/tickets.json`) dan database PostgreSQL.

---

### 4. Lapisan Penyimpanan Data (*Data Persistence Layer*)
* **PostgreSQL Engine & Persistent JSON**: Database relasional tangguh dengan ACID compliance, didukung penyimpanan fail-safe lokal (`tickets.json`) agar antrean tiket tetap aman saat server restart.
* **Prisma ORM v6.4**: Lapisan abstraksi database dengan skema deklaratif:
  * Model `SchoolInfo` & `AdmissionSchedule`: Profil sekolah dan jadwal resmi pendaftaran.
  * Model `Jurusan`: Program keahlian, kuota daya tampung, akreditasi, dan prospek karir.
  * Model `FaqItem`: Bank tanya jawab resmi panitia.
  * Model `KnowledgeEntity`: Entitas informasi tambahan dinamis (Kelas Industri, Beasiswa, TEFA).
  * Model `ChatLog`: Jejak audit percakapan orang tua murid.
  * Model `EscalationTicket`: Antrean eskalasi kasus panitia.

---

## 🔄 Diagram Interaksi Sistem & Alur Kerja

```mermaid
sequenceDiagram
    autonumber
    actor Wali as 👤 Wali Murid (WhatsApp)
    actor Admin as 👨‍💼 Panitia SPMB (Frontend UI)
    participant FE as 🌐 Frontend Client (`fe/`)
    participant WA as 📱 WhatsApp Gateway
    participant API as ⚙️ Express REST API (`backend/`)
    participant DB as 🗄️ PostgreSQL Database
    participant AI as 🧠 Google Gemini 2.5 Flash

    rect rgb(20, 30, 45)
        Note over Admin,API: Skenario 1: Admin Mengelola Sistem via Frontend Dashboard
        Admin->>FE: Buka Menu Scanner & Scan QR
        FE->>API: GET /api/v1/whatsapp/status (Poll / Check QR)
        API-->>FE: Tampilkan QR Code di Layar Dashboard
        Admin->>FE: Tambah Entitas Baru via Dialog Form (CRUD)
        FE->>API: POST /api/v1/knowledge/entities
        API->>DB: Simpan ke PostgreSQL & Sinkron ke Memori AI
        DB-->>API: 201 Created
        API-->>FE: Data Tersimpan & AI Grounding Aktif Live
    end

    rect rgb(30, 45, 30)
        Note over Wali,AI: Skenario 2: Tanya Jawab Otomatis Calon Wali Murid
        Wali->>WA: Kirim Chat ("1" atau "Apakah ada beasiswa?")
        WA->>API: Event onMessage (Text, SenderID)
        alt Navigasi Angka 1-5
            API->>API: Fast Numeric Router (0 ms)
        else Pertanyaan Bahasa Alami
            API->>DB: Ambil Grounding Data SK Resmi
            API->>AI: Sintesis Jawaban dengan Grounding Ketat
            AI-->>API: Respon Resmi Anti-Halusinasi
        end
        API->>API: WhatsAppFormatter (Format Teks Indah)
        API-->>WA: Kirim Pesan Terformat
        WA-->>Wali: Jawaban Diterima di WhatsApp (< 2 Detik)
    end

    rect rgb(45, 30, 30)
        Note over Wali,Admin: Skenario 3: Kasus Khusus & Eskalasi Human-in-the-Loop
        Wali->>WA: Kirim Chat ("admin" / "saya butuh keringanan")
        WA->>API: Deteksi Intent Bantuan Khusus
        API->>DB: Buat Tiket Antrean (#TCK-XXXXXX) & Simpan Persisten
        API-->>WA: Balasan + Link wa.me Panitia + Bukti Nomor Tiket #TCK-XXXXXX
        Admin->>FE: Buka Menu Tiket Eskalasi (/dashboard/tickets)
        FE-->>Admin: Tiket Baru Muncul Real-time dengan Status OPEN
        Admin->>FE: Klik "Resolve Tiket" setelah Menghubungi Wali Murid
        FE->>API: POST /api/v1/tickets/:id/resolve
        API->>DB: Update Status Tiket RESOLVED
    end
```

---

## 📁 Struktur Repositori Monorepo

```
.
├── backend/                          # REST API Engine (Node.js, Express, TypeScript, PostgreSQL)
│   ├── prisma/                       # Skema relasional PostgreSQL & Database Seeder
│   │   ├── schema.prisma             # Model relasional (PostgreSQL)
│   │   ├── seed.ts                   # Seeder data resmi SK SPMB 2026/2027
│   │   └── tsconfig.json             # Isolasi TypeScript compiler untuk Prisma
│   ├── src/
│   │   ├── @types/                   # Ambient type declarations
│   │   ├── config/                   # Validasi runtime environment berbasis Zod (env.ts)
│   │   ├── core/                     # Utilitas atomik (ApiResponse, AppError, Logger, Prisma, Formatter)
│   │   ├── docs/                     # Spesifikasi OpenAPI 3.0 & Scalar UI (/reference)
│   │   ├── modules/                  # Domain modules (Clean Architecture)
│   │   │   ├── ai/                   # AI Strategy (Fast Numeric + Gemini 2.5 Flash + Local Fallback)
│   │   │   ├── chat/                 # Chat Pipeline, Conversational Memory & DTO
│   │   │   ├── knowledge/            # Dynamic Knowledge Base & Live Grounding Repository
│   │   │   ├── tickets/              # Escalation Queue, File Persistence & Analytics
│   │   │   └── whatsapp/             # WhatsApp Client Manager & Event Controller
│   │   ├── routes/                   # Central API Router v1
│   │   ├── app.ts                    # Konfigurasi aplikasi Express
│   │   └── server.ts                 # Entry point server & Graceful Shutdown
│   ├── tests/
│   │   └── e2e/                      # Vitest & Supertest E2E Test Suite (24 Test Cases)
│   ├── tickets.json                  # Penyimpanan persisten antrean tiket eskalasi
│   ├── .env.example                  # Template variabel lingkungan
│   ├── vitest.config.ts              # Konfigurasi Vitest runner
│   ├── tsconfig.json                 # Konfigurasi TypeScript Strict Mode
│   └── package.json                  # Dependensi backend & npm scripts
├── fe/                               # Antarmuka Pengguna Frontend (Next.js 15, React 19, Tailwind CSS)
│   ├── src/
│   │   ├── app/                      # Next.js App Router (Dashboard & Portal Publik)
│   │   │   ├── dashboard/            # Pusat Kendali Panitia (WhatsApp, Tiket, Knowledge, Overview)
│   │   │   ├── globals.css           # Design tokens & Glassmorphism system
│   │   │   ├── layout.tsx            # Root layout & Metadata
│   │   │   └── page.tsx              # Portal Publik SPMB & Pencarian Kurikulum
│   │   ├── components/               # Komponen UI Reusable (Shadcn UI, Modals, Dialogs, Pagination)
│   │   ├── hooks/                    # Custom React Query Hooks (useWhatsApp, useKnowledge, useTickets)
│   │   └── lib/                      # API Client & Skema Validasi Zod
│   ├── e2e/                          # Playwright E2E Test Suite (6 Passing Tests)
│   ├── playwright.config.ts          # Konfigurasi Playwright Test Runner
│   ├── tsconfig.json                 # Konfigurasi TypeScript Frontend
│   └── package.json                  # Dependensi frontend (Next.js, Radix UI, TanStack Query)
├── docs/                             # Berkas lembar kerja, PDF resmi, & panduan deployment
│   ├── PANDUAN_PENGGUNAAN_DAN_DEPLOYMENT.md
│   ├── LEMBAR_KERJA_DIGIFORWARD_ADAPTIVA.pdf
│   ├── LEMBAR_KERJA_DIGIFORWARD_ADAPTIVA.md
│   └── SMKNegeri1Adiwerna_Adaptiva.pdf
├── .gitignore                        # Aturan pengabaian berkas sensitif tingkat monorepo
├── package.json                      # Workspace root mendelegasikan perintah otomatis
└── README.md                         # Dokumentasi utama arsitektur dan panduan
```

---

## 📡 Daftar Endpoint API (v1)

Spesifikasi OpenAPI 3.0 dan UI Interaktif: **`http://localhost:3000/reference`**

| Method | Endpoint | Fungsi | Parameter Kueri / Fitur |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Pemeriksaan kesehatan server & uptime | - |
| `GET` | `/reference` / `/docs` | **Scalar Interactive API Reference UI** | Dark theme *DeepSpace* |
| `POST` | `/api/v1/chat` | Chat percakapan AI (Grounded SK SPMB + Fast Numeric) | Body: `{ message, sender, history? }` |
| `GET` | `/api/v1/knowledge` | Mengambil basis data profil sekolah dari PostgreSQL | - |
| `PUT` | `/api/v1/knowledge` | Update dinamis profil sekolah ke PostgreSQL | Body: Schema Update |
| `POST`| `/api/v1/knowledge/sync` | Sinkronisasi ulang data SK sekolah | - |
| `GET` | `/api/v1/knowledge/entities` | **List entitas dinamis kustom** | `page`, `limit`, `q`, `category`, `isActive`, `sortBy`, `sortOrder` |
| `POST` | `/api/v1/knowledge/entities` | **Tambah entitas pengetahuan kustom baru** | Auto Live Grounding ke memori AI |
| `GET` | `/api/v1/knowledge/entities/:id` | Detail entitas pengetahuan kustom | Parameter `id` |
| `PUT` | `/api/v1/knowledge/entities/:id` | Update entitas pengetahuan kustom | Parameter `id` |
| `DELETE`| `/api/v1/knowledge/entities/:id` | Hapus entitas pengetahuan kustom | Parameter `id` |
| `GET` | `/api/v1/knowledge/jurusan` | **List jurusan & daya tampung** | `page`, `limit`, `q`, `sortBy`, `sortOrder` |
| `POST` | `/api/v1/knowledge/jurusan` | Tambah program keahlian baru | Kode jurusan unik |
| `PUT` | `/api/v1/knowledge/jurusan/:kode`| Update kuota atau akreditasi jurusan | Parameter `kode` |
| `DELETE`| `/api/v1/knowledge/jurusan/:kode`| Hapus jurusan dari database | Parameter `kode` |
| `GET` | `/api/v1/knowledge/faqs` | **List tanya jawab resmi sekolah** | `page`, `limit`, `category`, `q`, `sortBy` |
| `POST` | `/api/v1/knowledge/faqs` | Tambah tanya jawab resmi baru | Kategori FAQ |
| `PUT` | `/api/v1/knowledge/faqs/:id` | Update isi pertanyaan / jawaban | Parameter `id` |
| `DELETE`| `/api/v1/knowledge/faqs/:id` | Hapus FAQ dari database | Parameter `id` |
| `GET` | `/api/v1/status` | Analitik sistem, statistik chat & WhatsApp | Total chats, topik terpopuler |
| `GET` | `/api/v1/tickets` | Daftar antrean tiket eskalasi panitia | Filter: `?status=OPEN` / `RESOLVED` |
| `POST` | `/api/v1/tickets/:id/resolve` | Menyelesaikan status tiket eskalasi | Parameter `id` |
| `GET` | `/api/v1/whatsapp/status` | Mengambil status koneksi & QR Data URL | `{ isReady, status, qrDataUrl }` |
| `POST` | `/api/v1/whatsapp/connect` | Memicu inisialisasi WhatsApp Chromium | Generate QR code headless |
| `POST` | `/api/v1/whatsapp/disconnect` | Memutus koneksi sesi WhatsApp | Reset state ke DISCONNECTED |
| `POST` | `/api/v1/whatsapp/logout` | Keluar sesi WhatsApp dan bersihkan auth | Reset session directory |
| `POST` | `/api/v1/whatsapp/send-test` | Kirim pesan WhatsApp manual | Body: `{ targetNumber, message }` |

---

## ⚡ Panduan Menjalankan Sistem (Quick Start)

Aplikasi terdiri dari **Backend REST API Engine** (`http://localhost:3000`) dan **Frontend Client Dashboard** (`http://localhost:3001`):

### 1. Instalasi Dependensi Seluruh Monorepo
```bash
# Instalasi backend:
npm install --prefix backend

# Instalasi frontend:
npm install --prefix fe
```

### 2. Konfigurasi Environment Backend
Salin template konfigurasi:
```bash
cp backend/.env.example backend/.env
```
Sesuaikan variabel lingkungan di file `backend/.env`:
* `DATABASE_URL`: `postgresql://username:password@localhost:5432/digidasa?schema=public`
* `GEMINI_API_KEY`: API Key dari [Google AI Studio](https://aistudio.google.com/)
* `PANITIA_WA_NUMBER`: Nomor WhatsApp resmi panitia SPMB (contoh: `6285292677431`)

### 3. Migrasi & Seed Database PostgreSQL
```bash
npm run prisma:push --prefix backend
npm run prisma:seed --prefix backend
```

### 4. Menjalankan Server Pengembangan

Jalankan di 2 tab terminal terpisah:

**Terminal 1 (Backend API Engine - Port 3000):**
```bash
npm --prefix backend run dev
```

**Terminal 2 (Frontend Web Client - Port 3001):**
```bash
npm --prefix fe run dev
```

* Buka Portal Publik & Pusat Kendali di browser: **`http://localhost:3001`**
* Buka Dokumentasi Interaktif Scalar UI: **`http://localhost:3000/reference`**

### 5. Pengujian & Jaminan Mutu (100% Passing)
```bash
# 1. Menjalankan Vitest Backend E2E Suite (24 Test Cases):
npm --prefix backend test

# 2. Menjalankan Playwright Frontend E2E Suite (6 Test Cases):
npm --prefix fe run test:e2e

# 3. Pengecekan Type-safety TypeScript:
npm --prefix backend run typecheck
npm --prefix fe run typecheck
```

---

## 🏫 Profil & Kampus SMK Negeri 1 Adiwerna (STM ADB)

> [!NOTE]
> **Pemisah Fisik Bangunan:** Di bawah ini merupakan dokumentasi 2 (dua) fasilitas fisik bangunan yang berbeda di lingkungan SMK Negeri 1 Adiwerna (STM ADB) dengan garis pembatas visual:

<div align="center">

| 🚪 **GEDUNG 1: GERBANG UTAMA (STM ADB)** | ⚡ **GARIS PEMISAH BANGUNAN** ⚡ | 🏢 **GEDUNG 2: KOMPLEKS KELAS & TEFA** |
| :---: | :---: | :---: |
| <img src="./docs/assets/gedung_gerbang.png" alt="Gerbang Utama SMK Negeri 1 Adiwerna (STM ADB)" width="380" /> | <img src="./docs/assets/vertical_divider.svg" alt="Pemisah Gedung" height="240" /><br/><sub>**LOKASI 1** ⟵ ❖ ⟶ **LOKASI 2**<br/>*(Fisik Bangunan Berbeda)*</sub> | <img src="./docs/assets/gedung_utama.jpg" alt="Gedung Pembelajaran & Laboratorium TEFA" width="380" /> |
| **Gerbang Kedatangan & Pos Masuk**<br/><sub>Akses utama kedatangan siswa, pos piket satpam, tamu dinas, dan gerbang pendaftaran SPMB</sub> | ╏<br/>╏<br/>╏ | **Kompleks Ruang Kelas, Lab & Bengkel TEFA**<br/><sub>Gedung pembelajaran teori, bengkel teknik kejuruan industri, dan laboratorium komputer</sub> |

</div>

---

## 🤝 Tim Pengembang & Penanggung Jawab
* **Lembaga:** SMK Negeri 1 Adiwerna (STM ADB), Kabupaten Tegal, Jawa Tengah.
* **Inisiatif:** Program DIGIForward 2026–2027 *(PT Generasi Edukator Indonesia / GenEd, Cabang Dinas Pendidikan Wilayah XII Jateng, & CTI Group)*.
* **Tim:** Tim Adaptiva SMK Negeri 1 Adiwerna.

---
*Dikembangkan dengan standar industri penuh untuk memajukan transformasi digital pendidikan vokasi Indonesia.* 🇮🇩
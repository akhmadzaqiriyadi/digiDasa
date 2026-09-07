# 🚀 ADAPTIVA-BOT: Cognitive Automation AI & Agile Architecture

> **Asisten Informasi Digital Sekolah 24/7 Berbasis WhatsApp & Cognitive AI Grounded**  
> Proyek Inovasi Layanan Publik Pendidikan untuk Tim **SMK Negeri 1 Adiwerna (STM ADB) - Tim Adaptiva** dalam Program **DIGIForward 2026–2027** *(PT Generasi Edukator Indonesia & CTI Group)*.

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

```
+-----------------------------------------------------------------------------------------------------------------+
|                                           PRESENTATION & CLIENT LAYER                                           |
|                                                                                                                 |
|   +---------------------------------+   +---------------------------------------+   +-----------------------+   |
|   |   📱 Calon Siswa & Orang Tua    |   |   🌐 Frontend Client App (`fe/`)      |   |   📖 Scalar UI Docs   |   |
|   |   - WhatsApp Mobile / Desktop   |   |   - Dashboard Monitoring & Analitik   |   |   - Interactive API   |   |
|   |   - Tanya Info SPP, Jurusan, SK |   |   - WhatsApp QR Scanner Interface     |   |     Documentation     |   |
|   |                                 |   |   - Dynamic Knowledge Manager (CRUD)  |   |     (/reference)      |   |
|   |                                 |   |   - Escalation Ticket Resolver Center |   |                       |   |
|   |                                 |   |   - Web Chatbot Widget (Situs Sekolah)|   |                       |   |
|   +----------------+----------------+   +-------------------+-------------------+   +-----------+-----------+   |
+--------------------|----------------------------------------|-----------------------------------|---------------+
                     |                                        | HTTP / JSON REST API              |
+--------------------v----------------------------------------v-----------------------------------v---------------+
|                                            INTERFACE & GATEWAY LAYER                                            |
|                                                                                                                 |
|   +-------------------------------------+                +--------------------------------------------------+   |
|   |   📱 WhatsApp Web Gateway           |                |   ⚙️ Express 5 Pure REST API Engine              |   |
|   |   (whatsapp-web.js Chromium Engine) |   Internal     |   (Headless JSON Endpoints v1)                   |   |
|   |   - Headless Session & LocalAuth    |--------------> |   - Rate Limiter, CORS, Request Logger           |   |
|   |   - Event: qr, ready, message_create|                |   - OpenAPI 3.0 Contract & Zod Validation        |   |
|   +------------------+------------------+                +------------------------+-------------------------+   |
+----------------------|------------------------------------------------------------|-----------------------------+
                       |                                                            |
+----------------------v------------------------------------------------------------v-----------------------------+
|                                         DOMAIN CORE & BUSINESS LOGIC LAYER                                      |
|                                                                                                                 |
|  +-------------------+  +--------------------+  +--------------------+  +-------------------+  +--------------+ |
|  |    Chat Module    |  |  Knowledge Module  |  |   Ticket Module    |  |  WhatsApp Module  |  |  Formatter   | |
|  |  - Conversational |  |  - Dynamic Entities|  |  - Auto-Escalation |  |  - Client State   |  |  - WhatsApp   | |
|  |    Sliding Memory |  |    CRUD & Filtering|  |  - Ticket Resolver |  |    Event Handlers |  |    Markdown   | |
|  |  - DTO Validation |  |  - Dual-Layer Cache|  |  - wa.me Handover  |  |  - Status Monitor |  |    Normalizer | |
|  +---------+---------+  +---------+----------+  +---------+----------+  +---------+---------+  +------+-------+ |
+------------|----------------------|-----------------------|-----------------------|-------------------|---------+
             |                      |                       |                       |                   |
+------------v----------------------v-----------------------v-----------------------v-------------------v---------+
|                                     COGNITIVE AI & KNOWLEDGE GROUNDING LAYER                                    |
|                                                                                                                 |
|   +-------------------------------------+           +-------------------------------------------------------+   |
|   |   Primary Provider:                 |           |   Secondary Local Fallback:                           |   |
|   |   Google Gemini 2.5 Flash           |           |   Semantic In-Memory Fallback Engine                  |   |
|   |   (Grounded ke SK SPMB 2026/2027)   |           |   (Deterministic Keyword Scoring < 1ms, Zero Offline) |   |
|   +------------------+------------------+           +---------------------------+---------------------------+   |
|                      |                                                          |                               |
|                      +----------------------------+-----------------------------+                               |
|                                                   |                                                             |
|                                     +-------------v--------------+                                              |
|                                     |  PromptEngine Synthesizer  |                                              |
|                                     |  (System Prompt + Grounding|                                              |
|                                     +-------------+--------------+                                              |
+---------------------------------------------------|-------------------------------------------------------------+
                                                    |
+---------------------------------------------------v-------------------------------------------------------------+
|                                         DATA PERSISTENCE & STORAGE LAYER                                        |
|                                                                                                                 |
|       +-------------------------------+                   +---------------------------------------------+       |
|       |   Prisma ORM Client v6.4      |                   |   In-Memory Synchronized Knowledge Cache    |       |
|       |   (Type-safe Query Engine)    |                   |   (Fast-read Grounding Data untuk AI)       |       |
|       +---------------+---------------+                   +----------------------+----------------------+       |
|                       |                                                          |                              |
|       +---------------v----------------------------------------------------------v----------------------+       |
|       |                              PostgreSQL Database (Port 5432)                                    |       |
|       |   Tables: Knowledge, Jurusan, Faq, KnowledgeEntity, ChatSession, ChatMessage, EscalationTicket   |       |
|       +-------------------------------------------------------------------------------------------------+       |
+-----------------------------------------------------------------------------------------------------------------+
```

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

### 3. Lapisan Cognitive AI & Anti-Halusinasi (*Cognitive AI Layer*)
Sistem menerapkan pola **Strategy Pattern** melalui antarmuka `IAIProvider`:
1. **Primary Provider (`GeminiProvider`)**:
   * Menggunakan model mutakhir **Google Gemini 2.5 Flash** via Google GenAI SDK.
   * Menginjeksikan basis data resmi (SK Panitia SPMB 2026/2027) ke dalam *System Prompt Grounding*.
   * Diberikan instruksi ketat: **hanya menjawab berdasarkan data resmi yang disediakan**. Jika informasi tidak ada di SK, AI wajib menyatakan tidak memiliki wewenang dan mengarahkan ke panitia.
2. **Local Fallback Engine (`LocalFallbackProvider`)**:
   * Jaring pengaman deterministik berbasis pencocokan bobot semantik (*keyword-weighted scoring*).
   * Menjamin bot **tetap menjawab dalam waktu < 1 ms** untuk pertanyaan fundamental (biaya SPP gratis, syarat berkas, pilihan jurusan, jadwal pendaftaran) meskipun kuota API habis atau server offline.

---

### 4. Lapisan Penyimpanan Data (*Data Persistence Layer*)
* **PostgreSQL Engine**: Database relasional tangguh untuk menjamin integritas data, konkurensi tinggi, dan ACID compliance.
* **Prisma ORM v6.4**: Lapisan abstraksi database dengan skema deklaratif:
  * Model `SchoolInfo` & `PmbRegistration`: Data profil sekolah dan jadwal pendaftaran.
  * Model `Jurusan`: Program keahlian, kuota daya tampung, akreditasi, dan prospek karir.
  * Model `Faq`: Bank tanya jawab resmi panitia.
  * Model `KnowledgeEntity`: Entitas informasi tambahan dinamis.
  * Model `ChatSession` & `ChatMessage`: Jejak audit percakapan orang tua murid.
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
        Admin->>FE: Tambah Entitas Baru (misal: Beasiswa Khusus)
        FE->>API: POST /api/v1/knowledge/entities
        API->>DB: Simpan ke PostgreSQL & Sinkron ke Memori AI
        DB-->>API: 201 Created
        API-->>FE: Data Tersimpan & AI Grounding Aktif Live
    end

    rect rgb(30, 45, 30)
        Note over Wali,AI: Skenario 2: Tanya Jawab Otomatis Calon Wali Murid
        Wali->>WA: Kirim Chat ("Apakah ada program beasiswa?")
        WA->>API: Event onMessage (Text, SenderID)
        API->>DB: Ambil Grounding Data Terbaru (termasuk Entitas Kustom)
        DB-->>API: Data SK SPMB + Beasiswa Baru
        API->>AI: Sintesis Jawaban dengan Grounding Ketat
        AI-->>API: Respon Resmi Anti-Halusinasi
        API->>API: WhatsAppFormatter (Format Teks Indah)
        API-->>WA: Kirim Pesan Terformat
        WA-->>Wali: Jawaban Diterima di WhatsApp (< 2 Detik)
    end

    rect rgb(45, 30, 30)
        Note over Wali,Admin: Skenario 3: Kasus Khusus & Eskalasi Human-in-the-Loop
        Wali->>WA: Kirim Chat ("Saya butuh keringanan biaya seragam")
        WA->>API: Deteksi Intent Bantuan Khusus
        API->>DB: Buat Tiket Antrean (TCK-XXXXXX)
        API-->>WA: Balasan + Link wa.me Panitia
        Admin->>FE: Buka Menu Tiket Eskalasi (GET /api/v1/tickets)
        FE-->>Admin: Notifikasi Tiket Baru Muncul di Dashboard
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
│   │   │   ├── ai/                   # AI Strategy (Gemini 2.5 Flash + Local Fallback Engine)
│   │   │   ├── chat/                 # Chat Pipeline, Conversational Memory & DTO
│   │   │   ├── knowledge/            # Dynamic Knowledge Base & Live Grounding Repository
│   │   │   ├── tickets/              # Escalation Queue & Analytics
│   │   │   └── whatsapp/             # WhatsApp Client Manager & Event Controller
│   │   ├── routes/                   # Central API Router v1
│   │   ├── app.ts                    # Konfigurasi aplikasi Express
│   │   └── server.ts                 # Entry point server & Graceful Shutdown
│   ├── tests/
│   │   └── e2e/                      # Vitest & Supertest E2E Test Suite (24 Test Cases)
│   ├── .env.example                  # Template variabel lingkungan
│   ├── eslint.config.mjs             # Flat ESLint configuration
│   ├── vitest.config.ts              # Konfigurasi Vitest runner
│   ├── tsconfig.json                 # Konfigurasi TypeScript Strict Mode
│   └── package.json                  # Dependensi backend & npm scripts
├── fe/                               # Antarmuka Pengguna Frontend (Siap untuk inisialisasi framework UI)
│   └── .gitkeep
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
| `POST` | `/api/v1/chat` | Chat percakapan AI (Grounded SK SPMB) | Body: `{ message, sessionId? }` |
| `GET` | `/api/v1/knowledge` | Mengambil basis data profil sekolah dari PostgreSQL | - |
| `PUT` | `/api/v1/knowledge` | Update dinamis profil sekolah ke PostgreSQL | Body: Schema Update |
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
| `POST` | `/api/v1/whatsapp/send-test` | Kirim pesan WhatsApp manual | Body: `{ targetNumber, message }` |

---

## ⚡ Panduan Menjalankan Sistem (Quick Start)

Perintah dapat dijalankan langsung dari **root repository** (otomatis mendelegasikan ke `backend`) atau dari dalam folder `backend/`:

### 1. Instalasi Dependensi
```bash
npm install --prefix backend
# ATAU jika masuk ke folder backend:
# cd backend && npm install
```

### 2. Konfigurasi Environment
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
npm run prisma:push
npm run prisma:seed
```

### 4. Menjalankan Server
```bash
# Mode Pengembangan (Live reload):
npm run dev

# Kompilasi TypeScript:
npm run build

# Menjalankan Produksi:
npm start
```

### 5. Pengujian & Jaminan Mutu (All-Cases Tested)
```bash
# Menjalankan E2E Suite (24 Test Cases lulus 100%):
npm test

# Pengecekan Type-safety TypeScript:
npm run typecheck

# Audit Linter & Format Kode:
npm run lint
npm run format
```

---

## 🤝 Tim Pengembang & Penanggung Jawab
* **Lembaga:** SMK Negeri 1 Adiwerna (STM ADB), Kabupaten Tegal, Jawa Tengah.
* **Inisiatif:** Program DIGIForward 2026–2027 *(PT Generasi Edukator Indonesia / GenEd, Cabang Dinas Pendidikan Wilayah XII Jateng, & CTI Group)*.
* **Tim:** Tim Adaptiva SMK Negeri 1 Adiwerna.

---
*Dikembangkan dengan standar industri penuh untuk memajukan transformasi digital pendidikan vokasi Indonesia.* 🇮🇩
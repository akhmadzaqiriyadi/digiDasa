# 🌐 ADAPTIVA-BOT Frontend (Next.js 15 + Tailwind CSS + Shadcn UI)

Antarmuka web resmi untuk Pusat Kendali Operasional Panitia SPMB dan Portal Informasi Publik SMK Negeri 1 Adiwerna (STM ADB).

---

## 🚀 Fitur Utama Frontend

1. **Dashboard Eksekutif & Metrik (`/dashboard`)**:
   - Status kesehatan sistem realtime (*Uptime, Provider AI, Mode Operasional*).
   - Ringkasan analitik chat, tiket eskalasi terbuka, dan distribusi topik populer.
2. **Pusat Gateway WhatsApp (`/dashboard/whatsapp`)**:
   - Status koneksi WhatsApp interaktif (*Connected, Initializing, Scan QR, Disconnected*).
   - State machine buttons yang cerdas tanpa duplikasi animasi loading.
   - Pengujian kirim pesan WhatsApp langsung ke nomor orang tua murid/pendaftar.
3. **Manajemen Tiket Eskalasi Panitia (`/dashboard/tickets`)**:
   - Antrean kasus siswa/wali murid yang membutuhkan asistensi staf manual.
   - Fitur pencarian instan (ID Tiket, Nomor WhatsApp, Alasan).
   - Filter status (`Semua`, `Menunggu Respons`, `Terselesaikan`) & Paginasi.
   - Tombol langsung *"Hubungi via WhatsApp"* dan *"Selesaikan Tiket"*.
4. **Basis Pengetahuan & Kurikulum (`/dashboard/knowledge`)**:
   - CRUD Visual untuk Program Keahlian / Jurusan dengan form dialog interaktif.
   - CRUD Tanya Jawab Resmi Panitia (FAQ).
   - CRUD Entitas Pengetahuan Dinamis kustom (*Kelas Industri, Beasiswa, TEFA*).
5. **Portal Publik SPMB (`/`)**:
   - Banner Hero resmi SMKN 1 Adiwerna dengan pemisah visual gedung yang presisi.
   - Pencarian jurusan dan FAQ interaktif untuk calon pendaftar.
   - Tombol akses cepat WhatsApp dan widget informasi pendaftaran.

---

## 🛠️ Stack Teknologi

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **UI & Styling**: [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/), [Shadcn UI](https://ui.shadcn.com/)
- **State & Server Cache**: [@tanstack/react-query v5](https://tanstack.com/query)
- **Validasi Data**: [Zod v3](https://zod.dev/)
- **Ikon**: [Lucide React](https://lucide.dev/)
- **Testing**: [Playwright E2E Suite](https://playwright.dev/)

---

## ⚡ Panduan Menjalankan

```bash
# 1. Instalasi dependensi
npm install

# 2. Menjalankan server pengembangan (Port 3001)
npm run dev

# 3. Pengecekan Type-safety TypeScript
npm run typecheck

# 4. Menjalankan E2E Testing (Playwright)
npm run test:e2e
```


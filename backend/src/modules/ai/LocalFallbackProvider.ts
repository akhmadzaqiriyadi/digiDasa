import { IAIEngine, IAIResponse, IChatHistoryItem } from './types';
import { knowledgeRepository } from '../knowledge/KnowledgeRepository';
import { APP_CONFIG } from '../../config/env';

export class LocalFallbackProvider implements IAIEngine {
  public async generateReply(message: string, _history?: IChatHistoryItem[]): Promise<IAIResponse> {
    const q = message.toLowerCase();
    const data = knowledgeRepository.getKnowledge();
    const disclaimer = `\n\n📌 *${APP_CONFIG.disclaimer}*`;

    let reply = '';
    let requiresHumanEscalation = false;

    if (
      q.includes('spp') ||
      q.includes('uang gedung') ||
      q.includes('bayar bulanan') ||
      q.includes('biaya sekolah')
    ) {
      reply =
        `Halo Bapak/Ibu! Untuk SPP bulanan di ${APP_CONFIG.schoolName} adalah:\n\n` +
        `✅ *${data.biaya.spp_bulanan.keterangan}*\n\n` +
        `Sekolah negeri di Jawa Tengah tidak memungut biaya SPP bulanan maupun uang gedung.`;
    } else if (
      q.includes('seragam') ||
      q.includes('baju') ||
      q.includes('wearpack') ||
      q.includes('kain')
    ) {
      const p = data.biaya.paket_seragam_dan_kelengkapan;
      const rincian = p.rincian_item.map((i) => `• ${i}`).join('\n');
      reply =
        `Berikut rincian paket seragam resmi siswa baru ${APP_CONFIG.schoolName}:\n\n` +
        `👕 *Putra:* Rp ${p.total_putra.toLocaleString('id-ID')}\n` +
        `👗 *Putri:* Rp ${p.total_putri.toLocaleString('id-ID')}\n\n` +
        `*Rincian Kelengkapan:*\n${rincian}\n\n` +
        `ℹ️ *Catatan:* ${p.opsi_pembayaran}\n` +
        `🤝 *Keringanan:* ${data.biaya.keringanan_dan_beasiswa}`;
    } else if (
      q.includes('jurusan') ||
      q.includes('prodi') ||
      q.includes('keahlian') ||
      q.includes('rpl') ||
      q.includes('tkj') ||
      q.includes('tkr') ||
      q.includes('tpm') ||
      q.includes('titl') ||
      q.includes('dpib')
    ) {
      const listJurusan = data.jurusan
        .map(
          (j) =>
            `🔹 *${j.kode} - ${j.nama}* (Kuota: ${j.kuota} siswa)\n   _${j.deskripsi}_\n   *Prospek:* ${j.prospek_kerja}`
        )
        .join('\n\n');
      reply = `Pilihan Konsentrasi Keahlian / Jurusan di ${APP_CONFIG.schoolName} Tahun ${data.school_info.academic_year}:\n\n${listJurusan}`;
    } else if (
      q.includes('jadwal') ||
      q.includes('kapan') ||
      q.includes('tanggal') ||
      q.includes('buka') ||
      q.includes('daftar ulang')
    ) {
      const listJadwal = data.jadwal_spmb_2026
        .map((j) => `📅 *${j.tahap}*\n   Tanggal: ${j.tanggal}\n   Tempat: ${j.tempat}`)
        .join('\n\n');
      reply = `Jadwal resmi tahapan SPMB ${APP_CONFIG.schoolName}:\n\n${listJadwal}`;
    } else if (
      q.includes('syarat') ||
      q.includes('dokumen') ||
      q.includes('berkas') ||
      q.includes('rapor') ||
      q.includes('ijazah')
    ) {
      const listSyarat = data.syarat_dokumen.map((s, idx) => `${idx + 1}. ${s}`).join('\n');
      reply = `Dokumen dan berkas persyaratan pendaftaran SPMB:\n\n${listSyarat}`;
    } else if (
      q.includes('jalur') ||
      q.includes('afirmasi') ||
      q.includes('zonasi') ||
      q.includes('domisili') ||
      q.includes('prestasi')
    ) {
      const listJalur = data.jalur_pendaftaran
        .map((j) => `📍 *${j.jalur}* (Kuota: ${j.kuota_persen})\n   Syarat: ${j.syarat}`)
        .join('\n\n');
      reply = `Jalur pendaftaran SPMB ${APP_CONFIG.schoolName}:\n\n${listJalur}`;
    } else if (
      q.includes('admin') ||
      q.includes('panitia') ||
      q.includes('manusia') ||
      q.includes('telepon') ||
      q.includes('kontak') ||
      q.includes('bantuan') ||
      q.includes('khusus') ||
      q.includes('keringanan')
    ) {
      requiresHumanEscalation = true;
      reply =
        `Baik Bapak/Ibu, untuk bantuan langsung atau konsultasi khusus dengan staf panitia SPMB, silakan hubungi:\n\n` +
        `👨‍💼 *${APP_CONFIG.panitiaName}*\n` +
        `📱 *WhatsApp Resmi:* wa.me/${APP_CONFIG.panitiaWaNumber}\n` +
        `📞 *Telepon Sekolah:* ${data.school_info.contact.phone}\n` +
        `🏫 *Loket Layanan:* Sekretariat SPMB Graha SMK Negeri 1 Adiwerna (Senin - Jumat, 08.00 - 14.00 WIB).`;
    } else {
      reply =
        `Terima kasih telah menghubungi layanan informasi resmi ${APP_CONFIG.schoolName}.\n\n` +
        `Saya dapat membantu Bapak/Ibu mengenai:\n` +
        `1️⃣ *Rincian Biaya & SPP* (Ketik: _"biaya" / "seragam"_)\n` +
        `2️⃣ *Pilihan Jurusan & Kuota* (Ketik: _"jurusan"_)\n` +
        `3️⃣ *Jadwal SPMB & Tanggal Masuk* (Ketik: _"jadwal"_)\n` +
        `4️⃣ *Syarat Berkas & Dokumen* (Ketik: _"syarat"_)\n` +
        `5️⃣ *Bantuan Staf Panitia* (Ketik: _"admin"_)\n\n` +
        `Silakan ketik pertanyaan Anda!`;
    }

    return {
      reply: reply + disclaimer,
      source: 'local-semantic-engine',
      confidence: 0.95,
      isFallback: true,
      requiresHumanEscalation,
      timestamp: new Date().toISOString()
    };
  }
}

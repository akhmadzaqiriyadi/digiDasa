import { IAIEngine, IAIResponse, IChatHistoryItem } from './types';
import { knowledgeRepository } from '../knowledge/KnowledgeRepository';
import { APP_CONFIG } from '../../config/env';

export class LocalFallbackProvider implements IAIEngine {
  public async generateReply(message: string, _history?: IChatHistoryItem[]): Promise<IAIResponse> {
    const trimmed = message.trim();
    const q = trimmed.toLowerCase();
    const data = knowledgeRepository.getKnowledge();
    const disclaimer = `\n\n📌 *${APP_CONFIG.disclaimer}*`;

    let reply = '';
    let requiresHumanEscalation = false;

    // Direct numeric menu triggers: 1, 2, 3, 4, 5 (or "no 1", "nomor 1", "#1", "opsi 1")
    const isMenu1 = /^(no|nomor|menu|opsi)?\s*1(\.)?$/i.test(q);
    const isMenu2 = /^(no|nomor|menu|opsi)?\s*2(\.)?$/i.test(q);
    const isMenu3 = /^(no|nomor|menu|opsi)?\s*3(\.)?$/i.test(q);
    const isMenu4 = /^(no|nomor|menu|opsi)?\s*4(\.)?$/i.test(q);
    const isMenu5 = /^(no|nomor|menu|opsi)?\s*5(\.)?$/i.test(q);

    if (
      isMenu1 ||
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
            `🔹 *${j.kode} - ${j.nama}* (Kuota: ${j.kuota} siswa)\n   _${j.deskripsi}_\n   *Prospek Kerja:* ${j.prospek_kerja}`
        )
        .join('\n\n');
      reply = `Pilihan Konsentrasi Keahlian / Jurusan di ${APP_CONFIG.schoolName} Tahun Ajaran ${data.school_info.academic_year}:\n\n${listJurusan}\n\n💡 _Ketik *2* untuk Syarat Berkas atau *3* untuk Rincian Biaya._`;
    } else if (
      isMenu2 ||
      q.includes('syarat') ||
      q.includes('dokumen') ||
      q.includes('berkas') ||
      q.includes('rapor') ||
      q.includes('ijazah')
    ) {
      const listSyarat = data.syarat_dokumen.map((s, idx) => `${idx + 1}. ${s}`).join('\n');
      reply = `Dokumen dan berkas persyaratan pendaftaran SPMB ${APP_CONFIG.schoolName}:\n\n${listSyarat}\n\n💡 _Ketik *4* untuk melihat Jadwal Pendaftaran atau *5* untuk Bantuan Panitia._`;
    } else if (
      isMenu3 ||
      q.includes('biaya') ||
      q.includes('spp') ||
      q.includes('uang gedung') ||
      q.includes('bayar') ||
      q.includes('seragam') ||
      q.includes('baju') ||
      q.includes('wearpack') ||
      q.includes('kain')
    ) {
      const p = data.biaya.paket_seragam_dan_kelengkapan;
      const rincian = p.rincian_item.map((i) => `• ${i}`).join('\n');
      reply =
        `Rincian Biaya Pendidikan & Perlengkapan Siswa Baru ${APP_CONFIG.schoolName}:\n\n` +
        `✅ *SPP & Uang Gedung:* ${data.biaya.spp_bulanan.keterangan}\n` +
        `Sekolah negeri di Jawa Tengah BEBAS BIAYA SPP bulanan dan uang gedung.\n\n` +
        `👕 *Paket Seragam Resmi Putra:* Rp ${p.total_putra.toLocaleString('id-ID')}\n` +
        `👗 *Paket Seragam Resmi Putri:* Rp ${p.total_putri.toLocaleString('id-ID')}\n\n` +
        `*Rincian Perlengkapan:*\n${rincian}\n\n` +
        `ℹ️ *Opsi Pembayaran:* ${p.opsi_pembayaran}\n` +
        `🤝 *Bantuan / Keringanan:* ${data.biaya.keringanan_dan_beasiswa}`;
    } else if (
      isMenu4 ||
      q.includes('jadwal') ||
      q.includes('kapan') ||
      q.includes('tanggal') ||
      q.includes('buka') ||
      q.includes('daftar ulang') ||
      q.includes('alur')
    ) {
      const listJadwal = data.jadwal_spmb_2026
        .map((j) => `📅 *${j.tahap}*\n   Tanggal: ${j.tanggal}\n   Tempat: ${j.tempat}`)
        .join('\n\n');
      reply = `Jadwal resmi tahapan SPMB ${APP_CONFIG.schoolName} 2026:\n\n${listJadwal}`;
    } else if (
      isMenu5 ||
      q.includes('admin') ||
      q.includes('panitia') ||
      q.includes('manusia') ||
      q.includes('telepon') ||
      q.includes('kontak') ||
      q.includes('bantuan') ||
      q.includes('khusus') ||
      q.includes('keringanan') ||
      q.includes('tiket') ||
      q.includes('operator') ||
      q.includes('cs')
    ) {
      requiresHumanEscalation = true;
      reply =
        `Baik Bapak/Ibu, untuk konsultasi khusus atau bantuan langsung dari tim staf panitia SPMB:\n\n` +
        `👨‍💼 *${APP_CONFIG.panitiaName}*\n` +
        `📱 *WhatsApp Resmi:* wa.me/${APP_CONFIG.panitiaWaNumber}\n` +
        `📞 *Telepon Sekolah:* ${data.school_info.contact.phone}\n` +
        `🏫 *Loket Layanan Graha:* Sekretariat SPMB Graha SMK Negeri 1 Adiwerna (Senin - Jumat, 08.00 - 14.00 WIB).`;
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
    } else {
      reply =
        `Halo Bapak/Ibu! Selamat datang di Layanan Informasi Resmi SPMB ${APP_CONFIG.schoolName} Tahun Ajaran ${data.school_info.academic_year}.\n\n` +
        `Silakan balas dengan *angka (1 - 5)* atau *kata kunci* di bawah ini:\n\n` +
        `1️⃣ *Pilihan Jurusan & Kuota* (Ketik: *1* atau *jurusan*)\n` +
        `2️⃣ *Syarat Berkas & Dokumen* (Ketik: *2* atau *syarat*)\n` +
        `3️⃣ *Rincian Biaya & Bebas SPP* (Ketik: *3* atau *biaya*)\n` +
        `4️⃣ *Jadwal & Alur SPMB 2026* (Ketik: *4* atau *jadwal*)\n` +
        `5️⃣ *Bantuan Panitia / Buat Tiket* (Ketik: *5* atau *admin*)\n\n` +
        `Anda juga dapat langsung mengetikkan pertanyaan Anda dengan kalimat bebas!`;
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

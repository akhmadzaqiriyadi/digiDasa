import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding PostgreSQL database with official SMK Negeri 1 Adiwerna data...');

  const dataPath = path.join(__dirname, '../src/modules/knowledge/defaultData.json');
  const rawData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

  // 1. Seed School Info
  await prisma.schoolInfo.upsert({
    where: { id: 'school-core' },
    update: {
      name: rawData.school_info.name,
      address: rawData.school_info.address,
      academicYear: rawData.school_info.academic_year,
      phone: rawData.school_info.contact.phone,
      spmbWhatsapp: rawData.school_info.contact.spmb_whatsapp,
      email: rawData.school_info.contact.email,
      website: rawData.school_info.contact.website,
      lastUpdated: rawData.school_info.last_updated,
      skNumber: rawData.school_info.sk_number
    },
    create: {
      id: 'school-core',
      name: rawData.school_info.name,
      address: rawData.school_info.address,
      academicYear: rawData.school_info.academic_year,
      phone: rawData.school_info.contact.phone,
      spmbWhatsapp: rawData.school_info.contact.spmb_whatsapp,
      email: rawData.school_info.contact.email,
      website: rawData.school_info.contact.website,
      lastUpdated: rawData.school_info.last_updated,
      skNumber: rawData.school_info.sk_number
    }
  });

  // 2. Seed Jurusan
  for (const j of rawData.jurusan) {
    await prisma.jurusan.upsert({
      where: { kode: j.kode },
      update: {
        nama: j.nama,
        kuota: j.kuota,
        deskripsi: j.deskripsi,
        prospekKerja: j.prospek_kerja
      },
      create: {
        kode: j.kode,
        nama: j.nama,
        kuota: j.kuota,
        deskripsi: j.deskripsi,
        prospekKerja: j.prospek_kerja
      }
    });
  }

  // 3. Seed Admission Schedules
  await prisma.admissionSchedule.deleteMany();
  for (let idx = 0; idx < rawData.jadwal_spmb_2026.length; idx++) {
    const s = rawData.jadwal_spmb_2026[idx];
    await prisma.admissionSchedule.create({
      data: {
        tahap: s.tahap,
        tanggal: s.tanggal,
        tempat: s.tempat,
        order: idx + 1
      }
    });
  }

  // 4. Seed Jalur Pendaftaran
  await prisma.jalurPendaftaran.deleteMany();
  for (let idx = 0; idx < rawData.jalur_pendaftaran.length; idx++) {
    const jp = rawData.jalur_pendaftaran[idx];
    await prisma.jalurPendaftaran.create({
      data: {
        jalur: jp.jalur,
        kuotaPersen: jp.kuota_persen,
        syarat: jp.syarat,
        order: idx + 1
      }
    });
  }

  // 5. Seed Syarat Dokumen
  await prisma.syaratDokumen.deleteMany();
  for (let idx = 0; idx < rawData.syarat_dokumen.length; idx++) {
    const doc = rawData.syarat_dokumen[idx];
    await prisma.syaratDokumen.create({
      data: {
        dokumen: doc,
        order: idx + 1
      }
    });
  }

  // 6. Seed Biaya Info
  await prisma.biayaInfo.upsert({
    where: { id: 'biaya-core' },
    update: {
      sppNominal: rawData.biaya.spp_bulanan.nominal,
      sppKeterangan: rawData.biaya.spp_bulanan.keterangan,
      daftarUlangNominal: rawData.biaya.daftar_ulang.nominal,
      daftarUlangKeterangan: rawData.biaya.daftar_ulang.keterangan,
      seragamPutra: rawData.biaya.paket_seragam_dan_kelengkapan.total_putra,
      seragamPutri: rawData.biaya.paket_seragam_dan_kelengkapan.total_putri,
      seragamOpsi: rawData.biaya.paket_seragam_dan_kelengkapan.opsi_pembayaran,
      seragamRincian: JSON.stringify(rawData.biaya.paket_seragam_dan_kelengkapan.rincian_item),
      keringananBeasiswa: rawData.biaya.keringanan_dan_beasiswa
    },
    create: {
      id: 'biaya-core',
      sppNominal: rawData.biaya.spp_bulanan.nominal,
      sppKeterangan: rawData.biaya.spp_bulanan.keterangan,
      daftarUlangNominal: rawData.biaya.daftar_ulang.nominal,
      daftarUlangKeterangan: rawData.biaya.daftar_ulang.keterangan,
      seragamPutra: rawData.biaya.paket_seragam_dan_kelengkapan.total_putra,
      seragamPutri: rawData.biaya.paket_seragam_dan_kelengkapan.total_putri,
      seragamOpsi: rawData.biaya.paket_seragam_dan_kelengkapan.opsi_pembayaran,
      seragamRincian: JSON.stringify(rawData.biaya.paket_seragam_dan_kelengkapan.rincian_item),
      keringananBeasiswa: rawData.biaya.keringanan_dan_beasiswa
    }
  });

  // 7. Seed FAQ Populer
  await prisma.faqItem.deleteMany();
  for (let idx = 0; idx < rawData.faq_populer.length; idx++) {
    const faq = rawData.faq_populer[idx];
    await prisma.faqItem.create({
      data: {
        question: faq.q,
        answer: faq.a,
        category: 'SPMB',
        order: idx + 1
      }
    });
  }

  // 8. Seed Dynamic Knowledge Entities (Program Tambahan & Kerjasama)
  await prisma.knowledgeEntity.deleteMany();
  const sampleEntities = [
    {
      category: 'KERJASAMA_INDUSTRI',
      title: 'Kelas Industri Daihatsu & Komatsu',
      content: 'SMK Negeri 1 Adiwerna bekerjasama resmi dengan PT Astra Daihatsu Motor (PINTAR Bersama Daihatsu) dan PT Komatsu Indonesia untuk kurikulum sinkronisasi industri, penyediaan unit praktik modern, serta perekrutan kerja langsung setelah lulus.',
      tags: 'daihatsu, komatsu, astra, industri, kerja',
      order: 1,
      isActive: true
    },
    {
      category: 'MAGANG_LUAR_NEGERI',
      title: 'Program Magang & Penempatan Kerja ke Jepang',
      content: 'Tersedia program akselerasi pelatihan bahasa & budaya Jepang serta penempatan magang kerja industri manufaktur dan otomasi di Jepang bekerjasama dengan LPK resmi terakreditasi Kemnaker.',
      tags: 'jepang, magang, luar negeri, karir',
      order: 2,
      isActive: true
    },
    {
      category: 'BEASISWA',
      title: 'Beasiswa Tahfidz & Prestasi Akademik',
      content: 'Sekolah memberikan apresiasi pembebasan biaya perlengkapan dan seragam bagi siswa penghafal Al-Quran minimal 3 Juz serta peraih medali kejuaraan LKS (Lomba Kompetensi Siswa) tingkat provinsi/nasional.',
      tags: 'beasiswa, tahfidz, prestasi, lks',
      order: 3,
      isActive: true
    },
    {
      category: 'EKSTRAKURIKULER',
      title: 'Ekstrakurikuler Unggulan Robotika & IT Club',
      content: 'Mengakomodasi minat siswa dalam riset IoT, mikrokontroler Arduino/ESP32, Cognitive AI automation, cyber security, dan competitive programming dengan mentor praktisi industri.',
      tags: 'robotik, it, iot, ai, ekskul',
      order: 4,
      isActive: true
    }
  ];

  for (const ent of sampleEntities) {
    await prisma.knowledgeEntity.create({ data: ent });
  }

  console.log('✅ PostgreSQL database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

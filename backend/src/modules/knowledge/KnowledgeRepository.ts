import fs from 'fs';
import path from 'path';
import { ISchoolKnowledge, IJurusan, IJadwalTahap, IJalurPendaftaran, IFAQItem } from './types';
import { prisma } from '../../core/prisma';
import { logger } from '../../core/logger';

const KNOWLEDGE_PATHS = [
  path.join(__dirname, 'defaultData.json'),
  path.join(process.cwd(), 'src/modules/knowledge/defaultData.json'),
  path.join(process.cwd(), 'src/knowledge/defaultData.json')
];

export class KnowledgeRepository {
  private static instance: KnowledgeRepository;
  private data: ISchoolKnowledge | null = null;
  private activePath: string = KNOWLEDGE_PATHS[0];
  private isDbSynced = false;

  private constructor() {
    this.loadFromFile();
    this.syncFromDb().catch((err) => {
      logger.warn('[KnowledgeRepository] Background DB sync deferred: ' + (err?.message || err));
    });
  }

  public static getInstance(): KnowledgeRepository {
    if (!KnowledgeRepository.instance) {
      KnowledgeRepository.instance = new KnowledgeRepository();
    }
    return KnowledgeRepository.instance;
  }

  public loadFromFile(): void {
    try {
      let foundPath: string | null = null;
      for (const p of KNOWLEDGE_PATHS) {
        if (fs.existsSync(p)) {
          foundPath = p;
          break;
        }
      }

      if (foundPath) {
        this.activePath = foundPath;
        const raw = fs.readFileSync(foundPath, 'utf-8');
        this.data = JSON.parse(raw) as ISchoolKnowledge;
        logger.info(`[KnowledgeRepository] Default knowledge template loaded from ${foundPath}`);
      } else {
        logger.warn('[KnowledgeRepository] defaultData.json not found in any standard path.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error('[KnowledgeRepository] Failed to read knowledge file: ' + msg);
    }
  }

  public async syncFromDb(): Promise<ISchoolKnowledge> {
    try {
      const [school, jurusans, schedules, jalurs, docs, biaya, faqs, customEntities] =
        await Promise.all([
          prisma.schoolInfo.findFirst({ where: { id: 'school-core' } }),
          prisma.jurusan.findMany({ orderBy: { kode: 'asc' } }),
          prisma.admissionSchedule.findMany({ orderBy: { order: 'asc' } }),
          prisma.jalurPendaftaran.findMany({ orderBy: { order: 'asc' } }),
          prisma.syaratDokumen.findMany({ orderBy: { order: 'asc' } }),
          prisma.biayaInfo.findFirst({ where: { id: 'biaya-core' } }),
          prisma.faqItem.findMany({ orderBy: { order: 'asc' } }),
          prisma.knowledgeEntity.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } })
        ]);

      if (school) {
        let seragamItems: string[] = [];
        if (biaya?.seragamRincian) {
          try {
            seragamItems = JSON.parse(biaya.seragamRincian);
          } catch {
            seragamItems = [biaya.seragamRincian];
          }
        }

        const dbKnowledge: ISchoolKnowledge = {
          school_info: {
            name: school.name,
            address: school.address,
            academic_year: school.academicYear,
            contact: {
              phone: school.phone,
              spmb_whatsapp: school.spmbWhatsapp,
              email: school.email,
              website: school.website
            },
            last_updated: school.lastUpdated,
            sk_number: school.skNumber
          },
          jurusan: jurusans.map((j) => ({
            id: j.id,
            kode: j.kode,
            nama: j.nama,
            kuota: j.kuota,
            deskripsi: j.deskripsi,
            prospek_kerja: j.prospekKerja
          })),
          biaya: {
            spp_bulanan: {
              nominal: biaya?.sppNominal ?? 0,
              keterangan:
                biaya?.sppKeterangan ??
                'GRATIS / Bebas SPP Bulanan (Ditanggung Pemerintah Provinsi Jawa Tengah).'
            },
            daftar_ulang: {
              nominal: biaya?.daftarUlangNominal ?? 0,
              keterangan:
                biaya?.daftarUlangKeterangan ??
                'Daftar ulang online dan fisik TIDAK DIPUNGUT BIAYA (Gratis).'
            },
            paket_seragam_dan_kelengkapan: {
              total_putra: biaya?.seragamPutra ?? 750000,
              total_putri: biaya?.seragamPutri ?? 790000,
              opsi_pembayaran:
                biaya?.seragamOpsi ??
                'Dapat diangsur 2x atau dibeli mandiri sesuai standar spesifikasi sekolah.',
              rincian_item:
                seragamItems.length > 0
                  ? seragamItems
                  : (this.data?.biaya.paket_seragam_dan_kelengkapan.rincian_item ?? [])
            },
            keringanan_dan_beasiswa:
              biaya?.keringananBeasiswa ??
              'Bagi keluarga pemegang KIP / PIP / PKH / Terdaftar DTKS, seragam dibantu melalui program Keringanan Koperasi Sekolah & Baznas Sekolah.'
          },
          jadwal_spmb_2026: schedules.map((s) => ({
            id: s.id,
            tahap: s.tahap,
            tanggal: s.tanggal,
            tempat: s.tempat
          })),
          jalur_pendaftaran: jalurs.map((jp) => ({
            id: jp.id,
            jalur: jp.jalur,
            kuota_persen: jp.kuotaPersen,
            syarat: jp.syarat
          })),
          syarat_dokumen: docs.map((d) => d.dokumen),
          faq_populer: faqs.map((f) => ({
            id: f.id,
            q: f.question,
            a: f.answer,
            category: f.category
          })),
          custom_entities: customEntities.map((ce) => ({
            id: ce.id,
            category: ce.category,
            title: ce.title,
            content: ce.content,
            tags: ce.tags,
            order: ce.order,
            isActive: ce.isActive,
            createdAt: ce.createdAt,
            updatedAt: ce.updatedAt
          }))
        };

        this.data = dbKnowledge;
        this.isDbSynced = true;
        logger.info(
          '[KnowledgeRepository] Live knowledge successfully synchronized from PostgreSQL database.'
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.warn('[KnowledgeRepository] Database read failed, using cached knowledge: ' + msg);
    }

    return this.getKnowledge();
  }

  public getKnowledge(): ISchoolKnowledge {
    if (!this.data) {
      this.loadFromFile();
    }
    return this.data!;
  }

  public getGroundingSummary(): string {
    const d = this.getKnowledge();
    if (!d || !d.school_info) return 'Data sekolah belum tersedia.';

    const jurusanList = d.jurusan
      .map(
        (j) =>
          `- ${j.kode} (${j.nama}): Kuota ${j.kuota} siswa. Deskripsi: ${j.deskripsi} Prospek: ${j.prospek_kerja}`
      )
      .join('\n');

    const jadwalList = d.jadwal_spmb_2026
      .map((j) => `- ${j.tahap}: ${j.tanggal} (Tempat: ${j.tempat})`)
      .join('\n');

    const syaratList = d.syarat_dokumen.map((s) => `- ${s}`).join('\n');

    const jalurList = d.jalur_pendaftaran
      .map((j) => `- ${j.jalur} (Kuota ${j.kuota_persen}): Syarat: ${j.syarat}`)
      .join('\n');

    const seragamList = d.biaya.paket_seragam_dan_kelengkapan.rincian_item
      .map((item) => `  * ${item}`)
      .join('\n');

    const faqList = d.faq_populer.map((f) => `Q: ${f.q}\nA: ${f.a}`).join('\n\n');

    const customList = (d.custom_entities || [])
      .map((c) => `• [${c.category}] *${c.title}*:\n  ${c.content}`)
      .join('\n\n');

    return `
=== DOKUMEN RESMI SEKOLAH ===
Nama Sekolah: ${d.school_info.name}
Tahun Ajaran: ${d.school_info.academic_year}
Alamat: ${d.school_info.address}
Kontak SPMB / WA: ${d.school_info.contact.spmb_whatsapp}
Nomor SK Resmi: ${d.school_info.sk_number} (Update: ${d.school_info.last_updated})

--- RINCIAN BIAYA RESMI ---
1. SPP Bulanan: ${d.biaya.spp_bulanan.keterangan}
2. Biaya Daftar Ulang: ${d.biaya.daftar_ulang.keterangan}
3. Biaya Paket Seragam Lengkap & Atribut:
   - Siswa Putra: Rp ${d.biaya.paket_seragam_dan_kelengkapan.total_putra.toLocaleString('id-ID')}
   - Siswi Putri: Rp ${d.biaya.paket_seragam_dan_kelengkapan.total_putri.toLocaleString('id-ID')}
   - Catatan Seragam: ${d.biaya.paket_seragam_dan_kelengkapan.opsi_pembayaran}
   - Rincian Paket Seragam:
${seragamList}
4. Keringanan & Beasiswa: ${d.biaya.keringanan_dan_beasiswa}

--- DAFTAR JURUSAN / KONSENTRASI KEAHLIAN ---
${jurusanList}

--- JADWAL TAHAPAN SPMB ${d.school_info.academic_year} ---
${jadwalList}

--- JALUR PENDAFTARAN & KUOTA ---
${jalurList}

--- PERSYARATAN BERKAS & DOKUMEN ---
${syaratList}

--- PERTANYAAN POPULER (FAQ) ---
${faqList}

--- PROGRAM KHUSUS, KERJASAMA INDUSTRI & INFORMASI TAMBAHAN ---
${customList || 'Belum ada program tambahan.'}
=============================
`;
  }

  public async updateKnowledge(newData: Partial<ISchoolKnowledge>): Promise<{
    success: boolean;
    message: string;
    data?: ISchoolKnowledge;
  }> {
    try {
      // 1. Update PostgreSQL SchoolInfo
      if (newData.school_info) {
        const si = newData.school_info;
        await prisma.schoolInfo.upsert({
          where: { id: 'school-core' },
          update: {
            name: si.name,
            address: si.address,
            academicYear: si.academic_year,
            phone: si.contact?.phone,
            spmbWhatsapp: si.contact?.spmb_whatsapp,
            email: si.contact?.email,
            website: si.contact?.website,
            lastUpdated:
              si.last_updated ||
              new Date().toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              }),
            skNumber: si.sk_number
          },
          create: {
            id: 'school-core',
            name: si.name || 'SMK Negeri 1 Adiwerna',
            address: si.address || 'Jl. Raya Singkil No. 1, Adiwerna',
            academicYear: si.academic_year || '2026/2027',
            phone: si.contact?.phone || '(0283) 443768',
            spmbWhatsapp: si.contact?.spmb_whatsapp || '6285292677431',
            email: si.contact?.email || 'info@smkn1adiwerna.sch.id',
            website: si.contact?.website || 'https://smkn1adiwerna.sch.id',
            lastUpdated: si.last_updated || '31 Agustus 2026',
            skNumber: si.sk_number || 'SK/SPMB/2026/042-ADB'
          }
        });
      }

      // 2. Update Jurusan
      if (newData.jurusan && Array.isArray(newData.jurusan)) {
        for (const j of newData.jurusan as IJurusan[]) {
          if (j.kode) {
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
                nama: j.nama || j.kode,
                kuota: j.kuota || 0,
                deskripsi: j.deskripsi || '',
                prospekKerja: j.prospek_kerja || ''
              }
            });
          }
        }
      }

      // 3. Update Biaya
      if (newData.biaya) {
        const b = newData.biaya;
        await prisma.biayaInfo.upsert({
          where: { id: 'biaya-core' },
          update: {
            sppNominal: b.spp_bulanan?.nominal,
            sppKeterangan: b.spp_bulanan?.keterangan,
            daftarUlangNominal: b.daftar_ulang?.nominal,
            daftarUlangKeterangan: b.daftar_ulang?.keterangan,
            seragamPutra: b.paket_seragam_dan_kelengkapan?.total_putra,
            seragamPutri: b.paket_seragam_dan_kelengkapan?.total_putri,
            seragamOpsi: b.paket_seragam_dan_kelengkapan?.opsi_pembayaran,
            seragamRincian: b.paket_seragam_dan_kelengkapan?.rincian_item
              ? JSON.stringify(b.paket_seragam_dan_kelengkapan.rincian_item)
              : undefined,
            keringananBeasiswa: b.keringanan_dan_beasiswa
          },
          create: {
            id: 'biaya-core',
            sppNominal: b.spp_bulanan?.nominal ?? 0,
            sppKeterangan: b.spp_bulanan?.keterangan ?? 'GRATIS',
            daftarUlangNominal: b.daftar_ulang?.nominal ?? 0,
            daftarUlangKeterangan: b.daftar_ulang?.keterangan ?? 'GRATIS',
            seragamPutra: b.paket_seragam_dan_kelengkapan?.total_putra ?? 750000,
            seragamPutri: b.paket_seragam_dan_kelengkapan?.total_putri ?? 790000,
            seragamOpsi: b.paket_seragam_dan_kelengkapan?.opsi_pembayaran ?? '',
            seragamRincian: JSON.stringify(b.paket_seragam_dan_kelengkapan?.rincian_item ?? []),
            keringananBeasiswa: b.keringanan_dan_beasiswa ?? ''
          }
        });
      }

      // 4. Update Jadwal SPMB
      if (newData.jadwal_spmb_2026 && Array.isArray(newData.jadwal_spmb_2026)) {
        await prisma.admissionSchedule.deleteMany();
        const schedules = newData.jadwal_spmb_2026 as IJadwalTahap[];
        for (let i = 0; i < schedules.length; i++) {
          await prisma.admissionSchedule.create({
            data: {
              tahap: schedules[i].tahap,
              tanggal: schedules[i].tanggal,
              tempat: schedules[i].tempat,
              order: i + 1
            }
          });
        }
      }

      // 5. Update Jalur Pendaftaran
      if (newData.jalur_pendaftaran && Array.isArray(newData.jalur_pendaftaran)) {
        await prisma.jalurPendaftaran.deleteMany();
        const jalurs = newData.jalur_pendaftaran as IJalurPendaftaran[];
        for (let i = 0; i < jalurs.length; i++) {
          await prisma.jalurPendaftaran.create({
            data: {
              jalur: jalurs[i].jalur,
              kuotaPersen: jalurs[i].kuota_persen,
              syarat: jalurs[i].syarat,
              order: i + 1
            }
          });
        }
      }

      // 6. Update Syarat Dokumen
      if (newData.syarat_dokumen && Array.isArray(newData.syarat_dokumen)) {
        await prisma.syaratDokumen.deleteMany();
        const docs = newData.syarat_dokumen;
        for (let i = 0; i < docs.length; i++) {
          await prisma.syaratDokumen.create({
            data: {
              dokumen: docs[i],
              order: i + 1
            }
          });
        }
      }

      // 7. Update FAQ Populer
      if (newData.faq_populer && Array.isArray(newData.faq_populer)) {
        await prisma.faqItem.deleteMany();
        const faqs = newData.faq_populer as IFAQItem[];
        for (let i = 0; i < faqs.length; i++) {
          await prisma.faqItem.create({
            data: {
              question: faqs[i].q,
              answer: faqs[i].a,
              category: 'SPMB',
              order: i + 1
            }
          });
        }
      }

      // Refresh in-memory cache directly from DB
      const updatedKnowledge = await this.syncFromDb();

      // Backup persist to local JSON
      try {
        fs.writeFileSync(this.activePath, JSON.stringify(updatedKnowledge, null, 2), 'utf-8');
      } catch {
        // Non-fatal
      }

      logger.info(
        '[KnowledgeRepository] Knowledge base successfully updated in PostgreSQL and synced to cache.'
      );
      return {
        success: true,
        message: 'Knowledge base updated in PostgreSQL successfully.',
        data: updatedKnowledge
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error('[KnowledgeRepository] Update PostgreSQL error: ' + msg);
      return { success: false, message: msg };
    }
  }
}

export const knowledgeRepository = KnowledgeRepository.getInstance();

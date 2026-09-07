export interface ISchoolInfo {
  name: string;
  address: string;
  academic_year: string;
  contact: {
    phone: string;
    spmb_whatsapp: string;
    email: string;
    website: string;
  };
  last_updated: string;
  sk_number: string;
}

export interface IJurusan {
  id?: string;
  kode: string;
  nama: string;
  kuota: number;
  deskripsi: string;
  prospek_kerja: string;
}

export interface IBiayaInfo {
  spp_bulanan: {
    nominal: number;
    keterangan: string;
  };
  daftar_ulang: {
    nominal: number;
    keterangan: string;
  };
  paket_seragam_dan_kelengkapan: {
    total_putra: number;
    total_putri: number;
    opsi_pembayaran: string;
    rincian_item: string[];
  };
  keringanan_dan_beasiswa: string;
}

export interface IJadwalTahap {
  id?: string;
  tahap: string;
  tanggal: string;
  tempat: string;
}

export interface IJalurPendaftaran {
  id?: string;
  jalur: string;
  kuota_persen: string;
  syarat: string;
}

export interface IFAQItem {
  id?: string;
  q: string;
  a: string;
  category?: string;
}

export interface IKnowledgeEntity {
  id: string;
  category: string;
  title: string;
  content: string;
  tags?: string | null;
  order: number;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface ISchoolKnowledge {
  school_info: ISchoolInfo;
  jurusan: IJurusan[];
  biaya: IBiayaInfo;
  jadwal_spmb_2026: IJadwalTahap[];
  jalur_pendaftaran: IJalurPendaftaran[];
  syarat_dokumen: string[];
  faq_populer: IFAQItem[];
  custom_entities?: IKnowledgeEntity[];
}

export interface IPaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface IPaginatedResult<T> {
  items: T[];
  pagination: IPaginationMeta;
}

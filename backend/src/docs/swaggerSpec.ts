export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'ADAPTIVA-BOT Cognitive Core API Reference',
    version: '1.0.0',
    description: `
## 🚀 ADAPTIVA-BOT: Cognitive AI & Agile Backend Engine

Dokumentasi API Resmi Backend **ADAPTIVA-BOT (Agile Digital Assistant for Public & Timely Information via Automated AI)** untuk **SMK Negeri 1 Adiwerna (STM ADB)** Tahun Ajaran 2026/2027.

### 🌟 Fitur Utama:
- **Natural Language Processing (NLP)** berbasis Google Gemini 2.5 Flash (Grounded on SK SPMB Sekolah).
- **PostgreSQL Relational Storage & Live Grounding RAG** via Prisma ORM.
- **Dynamic Extensible Knowledge Base** dengan dukungan Full CRUD, Pagination, dan Filter.
- **Anti-Hallucination Guardrails & Zero-Key Semantic Fallback**.
- **WhatsApp Web Gateway & QR Integration**.
- **Scalar DeepSpace Interactive UI** dengan multi-language code snippets.
    `,
    contact: {
      name: 'Tim SMK Negeri 1 Adiwerna - Adaptiva',
      email: 'info@smkn1adiwerna.sch.id',
      url: 'https://smkn1adiwerna.sch.id'
    }
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local Development Server'
    }
  ],
  tags: [
    { name: 'Health & System', description: 'Server health check & system diagnostics' },
    { name: 'Chat Engine', description: 'Endpoint percakapan AI & simulasi pesan' },
    { name: 'Knowledge Base', description: 'Manajemen basis data resmi SPMB dan grounding' },
    {
      name: 'Dynamic Knowledge Entities',
      description: 'CRUD, Pagination, dan Filtering entitas pengetahuan kustom sekolah'
    },
    {
      name: 'Jurusan Management',
      description: 'CRUD, Pagination, dan Pencarian jurusan/kompetensi keahlian'
    },
    {
      name: 'FAQ Management',
      description: 'CRUD, Pagination, dan Filtering tanya jawab terverifikasi'
    },
    {
      name: 'System Status & WhatsApp',
      description: 'Status server, QR code, dan koneksi WhatsApp'
    },
    { name: 'Tickets & Escalation', description: 'Antrean bantuan staf panitia dan analitik' }
  ],
  paths: {
    '/health': {
      get: {
        tags: ['Health & System'],
        summary: 'Pemeriksaan Kesehatan Server (Health Check)',
        description: 'Mengembalikan status server, uptime, dan ketersediaan layanan.',
        responses: {
          200: {
            description: 'Server dalam kondisi sehat (HEALTHY)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/HealthResponse' }
              }
            }
          }
        }
      }
    },
    '/api/v1/chat': {
      post: {
        tags: ['Chat Engine'],
        summary: 'Kirim Pesan Chat untuk Dijawab oleh AI Engine (Grounded)',
        description:
          'Menerima pertanyaan pengguna, memproses menggunakan Google Gemini 2.5 Flash (Grounded RAG), dan mengembalikan jawaban resmi dalam waktu < 1 detik. Jika terdeteksi pertanyaan khusus, otomatis membuat tiket eskalasi panitia.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ChatRequest' },
              examples: {
                pertanyaan_biaya: {
                  summary: 'Contoh 1: Tanya SPP & Seragam',
                  value: {
                    message: 'Berapa rincian biaya seragam dan SPP bulanan untuk siswa baru?',
                    sender: 'Ibu Ratna (Wali Murid)',
                    history: []
                  }
                },
                pertanyaan_jurusan: {
                  summary: 'Contoh 2: Tanya Jurusan & Kuota',
                  value: {
                    message: 'Apa saja jurusan teknik yang ada dan prospek kerjanya?',
                    sender: 'Calon Siswa Baru',
                    history: []
                  }
                },
                pertanyaan_eskalasi: {
                  summary: 'Contoh 3: Panggilan Panitia Manusia',
                  value: {
                    message:
                      'Saya ingin konsultasi khusus dispensasi nilai dengan admin panitia sekolah',
                    sender: 'Pak Budi',
                    history: []
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Jawaban berhasil dihasilkan',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ChatResponse' }
              }
            }
          },
          400: {
            description: 'Validasi input gagal',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    },
    '/api/v1/knowledge': {
      get: {
        tags: ['Knowledge Base'],
        summary: 'Mengambil Seluruh Basis Data Resmi Sekolah dari PostgreSQL (Live Grounding)',
        description:
          'Mengambil data lengkap SMK Negeri 1 Adiwerna langsung dari database PostgreSQL via Prisma ORM mencakup identitas sekolah, daftar 6 jurusan, rincian biaya seragam, jadwal tahapan SPMB, jalur pendaftaran, syarat dokumen, FAQ terverifikasi, dan entitas kustom.',
        responses: {
          200: {
            description: 'Data informasi sekolah berhasil dimuat dari PostgreSQL',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/KnowledgeResponse' }
              }
            }
          }
        }
      },
      put: {
        tags: ['Knowledge Base'],
        summary: 'Memperbarui Data Informasi Sekolah Secara Dinamis di PostgreSQL',
        description:
          'Memungkinkan staf panitia memperbarui identitas sekolah, rincian biaya, jadwal, jalur pendaftaran, syarat dokumen, atau kuota jurusan secara dinamis di database PostgreSQL tanpa perlu restart server. Perubahan langsung terhubung ke AI Grounding Prompt.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateKnowledgeRequest' },
              example: {
                school_info: {
                  last_updated: '1 September 2026',
                  sk_number: 'SK/SPMB/2026/042-ADB'
                },
                biaya: {
                  spp_bulanan: {
                    nominal: 0,
                    keterangan: '100% GRATIS SPP Bulanan & Bebas Uang Gedung'
                  },
                  paket_seragam_dan_kelengkapan: {
                    total_putra: 750000,
                    total_putri: 790000,
                    opsi_pembayaran: 'Dapat diangsur 2x via Koperasi Sekolah'
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Data berhasil diperbarui di PostgreSQL dan Grounding AI aktif',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/KnowledgeResponse' }
              }
            }
          }
        }
      }
    },

    // =========================================================================
    // DYNAMIC KNOWLEDGE ENTITIES (CRUD + PAGINATION + FILTER)
    // =========================================================================
    '/api/v1/knowledge/entities': {
      get: {
        tags: ['Dynamic Knowledge Entities'],
        summary: 'Daftar Entitas Pengetahuan Dinamis (Dengan Pagination & Filtering)',
        description:
          'Mengambil daftar entitas pengetahuan dinamis sekolah dengan filter kategori, pencarian teks, status aktif, dan pagination.',
        parameters: [
          {
            name: 'page',
            in: 'query',
            required: false,
            description: 'Nomor halaman (default: 1)',
            schema: { type: 'integer', default: 1, example: 1 }
          },
          {
            name: 'limit',
            in: 'query',
            required: false,
            description: 'Jumlah data per halaman (default: 10, max: 100)',
            schema: { type: 'integer', default: 10, example: 10 }
          },
          {
            name: 'q',
            in: 'query',
            required: false,
            description: 'Kata kunci pencarian (judul, isi, atau tags)',
            schema: { type: 'string', example: 'daihatsu' }
          },
          {
            name: 'category',
            in: 'query',
            required: false,
            description: 'Filter kategori (misal: KERJASAMA_INDUSTRI, BEASISWA, EKSTRAKURIKULER)',
            schema: { type: 'string', example: 'KERJASAMA_INDUSTRI' }
          },
          {
            name: 'isActive',
            in: 'query',
            required: false,
            description: 'Filter status keaktifan entitas di grounding AI (true / false)',
            schema: { type: 'boolean', example: true }
          }
        ],
        responses: {
          200: {
            description: 'Daftar entitas pengetahuan dinamis dan metadata pagination',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PaginatedEntitiesResponse' }
              }
            }
          }
        }
      },
      post: {
        tags: ['Dynamic Knowledge Entities'],
        summary: 'Tambah Entitas Pengetahuan Dinamis Baru (Auto Live Grounding)',
        description:
          'Menambahkan entitas pengetahuan baru ke PostgreSQL. Begitu tersimpan, entitas aktif otomatis disuntikkan ke AI Grounding Prompt.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateEntityRequest' },
              example: {
                category: 'KERJASAMA_INDUSTRI',
                title: 'Program Kelas Khusus Honda Astra Motor',
                content:
                  'SMK Negeri 1 Adiwerna membuka kelas kurikulum khusus teknisi sepeda motor bekerjasama dengan Astra Honda Motor dengan jaminan uji kompetensi BNSP.',
                tags: 'honda, astra, motor, tsm, bengkel',
                order: 5,
                isActive: true
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Entitas pengetahuan baru berhasil dibuat dan disimpan',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/EntityResponse' }
              }
            }
          }
        }
      }
    },
    '/api/v1/knowledge/entities/{id}': {
      get: {
        tags: ['Dynamic Knowledge Entities'],
        summary: 'Detail Entitas Pengetahuan Berdasarkan ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'UUID Entitas pengetahuan',
            schema: { type: 'string', example: '9a21d9fa-3f82-4f81-8176-79ec2f8b5a1b' }
          }
        ],
        responses: {
          200: {
            description: 'Detail entitas pengetahuan ditemukan',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/EntityResponse' }
              }
            }
          },
          404: {
            description: 'Entitas tidak ditemukan',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      },
      put: {
        tags: ['Dynamic Knowledge Entities'],
        summary: 'Update Entitas Pengetahuan Dinamis',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'UUID Entitas pengetahuan',
            schema: { type: 'string', example: '9a21d9fa-3f82-4f81-8176-79ec2f8b5a1b' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateEntityRequest' },
              example: {
                title: 'Program Kelas Khusus Honda Astra Motor (Rev 2026)',
                isActive: true
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Entitas pengetahuan berhasil diperbarui',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/EntityResponse' }
              }
            }
          }
        }
      },
      delete: {
        tags: ['Dynamic Knowledge Entities'],
        summary: 'Hapus Entitas Pengetahuan dari Database',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'UUID Entitas pengetahuan',
            schema: { type: 'string', example: '9a21d9fa-3f82-4f81-8176-79ec2f8b5a1b' }
          }
        ],
        responses: {
          200: {
            description: 'Entitas berhasil dihapus',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/DeleteResponse' }
              }
            }
          }
        }
      }
    },

    // =========================================================================
    // JURUSAN MANAGEMENT (CRUD + PAGINATION + FILTER)
    // =========================================================================
    '/api/v1/knowledge/jurusan': {
      get: {
        tags: ['Jurusan Management'],
        summary: 'Daftar Jurusan / Kompetensi Keahlian (Dengan Pagination & Search)',
        parameters: [
          {
            name: 'page',
            in: 'query',
            required: false,
            schema: { type: 'integer', default: 1, example: 1 }
          },
          {
            name: 'limit',
            in: 'query',
            required: false,
            schema: { type: 'integer', default: 10, example: 10 }
          },
          {
            name: 'q',
            in: 'query',
            required: false,
            description: 'Cari kode, nama prodi, deskripsi, atau prospek kerja',
            schema: { type: 'string', example: 'RPL' }
          }
        ],
        responses: {
          200: {
            description: 'Daftar jurusan berhasil dimuat',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PaginatedJurusanResponse' }
              }
            }
          }
        }
      },
      post: {
        tags: ['Jurusan Management'],
        summary: 'Tambah Jurusan / Konsentrasi Keahlian Baru',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateJurusanRequest' },
              example: {
                kode: 'MEKATRONIKA',
                nama: 'Teknik Mekatronika & Robotika Otomasi',
                kuota: 36,
                deskripsi:
                  'Fokus pada integrasi mekanika, elektronika, PLC, dan otomasi industri modern.',
                prospekKerja:
                  'Automation Engineer Junior, PLC Programmer, Teknisi Robotika Industri'
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Jurusan baru berhasil didaftarkan',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/JurusanResponse' }
              }
            }
          }
        }
      }
    },
    '/api/v1/knowledge/jurusan/{kode}': {
      put: {
        tags: ['Jurusan Management'],
        summary: 'Perbarui Data Jurusan Berdasarkan Kode',
        parameters: [
          {
            name: 'kode',
            in: 'path',
            required: true,
            description: 'Kode unik jurusan (misal: RPL, TKJ, TKR)',
            schema: { type: 'string', example: 'RPL' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateJurusanRequest' },
              example: {
                kuota: 72,
                nama: 'Rekayasa Perangkat Lunak & Artificial Intelligence'
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Jurusan berhasil diperbarui'
          }
        }
      },
      delete: {
        tags: ['Jurusan Management'],
        summary: 'Hapus Jurusan Berdasarkan Kode',
        parameters: [
          {
            name: 'kode',
            in: 'path',
            required: true,
            schema: { type: 'string', example: 'MEKATRONIKA' }
          }
        ],
        responses: {
          200: {
            description: 'Jurusan berhasil dihapus'
          }
        }
      }
    },

    // =========================================================================
    // FAQ MANAGEMENT (CRUD + PAGINATION + FILTER)
    // =========================================================================
    '/api/v1/knowledge/faqs': {
      get: {
        tags: ['FAQ Management'],
        summary: 'Daftar Tanya Jawab Resmi SPMB (Dengan Pagination & Filter)',
        parameters: [
          {
            name: 'page',
            in: 'query',
            required: false,
            schema: { type: 'integer', default: 1, example: 1 }
          },
          {
            name: 'limit',
            in: 'query',
            required: false,
            schema: { type: 'integer', default: 10, example: 10 }
          },
          {
            name: 'category',
            in: 'query',
            required: false,
            schema: { type: 'string', example: 'SPMB' }
          },
          {
            name: 'q',
            in: 'query',
            required: false,
            schema: { type: 'string', example: 'seragam' }
          }
        ],
        responses: {
          200: {
            description: 'Daftar FAQ berhasil dimuat',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PaginatedFaqsResponse' }
              }
            }
          }
        }
      },
      post: {
        tags: ['FAQ Management'],
        summary: 'Tambah FAQ Baru',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateFaqRequest' },
              example: {
                question: 'Apakah ada asrama untuk siswa luar kota?',
                answer:
                  'Saat ini belum tersedia asrama resmi sekolah, namun terdapat puluhan kos mitra binaan di sekitar kampus sekolah.',
                category: 'FASILITAS',
                order: 10
              }
            }
          }
        },
        responses: {
          201: {
            description: 'FAQ baru berhasil ditambahkan'
          }
        }
      }
    },
    '/api/v1/knowledge/faqs/{id}': {
      put: {
        tags: ['FAQ Management'],
        summary: 'Perbarui FAQ Berdasarkan ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateFaqRequest' }
            }
          }
        },
        responses: {
          200: { description: 'FAQ berhasil diperbarui' }
        }
      },
      delete: {
        tags: ['FAQ Management'],
        summary: 'Hapus FAQ Berdasarkan ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        responses: {
          200: { description: 'FAQ berhasil dihapus' }
        }
      }
    },

    // =========================================================================
    // SYSTEM & WHATSAPP
    // =========================================================================
    '/api/v1/whatsapp/status': {
      get: {
        tags: ['System Status & WhatsApp'],
        summary: 'Ambil status koneksi WhatsApp saat ini',
        responses: {
          200: {
            description: 'Status koneksi WhatsApp (DISCONNECTED, SCAN_QR, CONNECTED)'
          }
        }
      }
    },
    '/api/v1/whatsapp/connect': {
      post: {
        tags: ['System Status & WhatsApp'],
        summary: 'Inisialisasi koneksi WhatsApp & Generate QR Code',
        description:
          'Memicu inisialisasi Chromium headless untuk memunculkan QR Code WhatsApp Web.',
        responses: {
          200: {
            description: 'Proses inisialisasi WhatsApp berjalan'
          }
        }
      }
    },
    '/api/v1/whatsapp/disconnect': {
      post: {
        tags: ['System Status & WhatsApp'],
        summary: 'Putus koneksi sesi WhatsApp',
        responses: {
          200: {
            description: 'Koneksi WhatsApp berhasil diputus'
          }
        }
      }
    },
    '/api/v1/whatsapp/send-test': {
      post: {
        tags: ['System Status & WhatsApp'],
        summary: 'Kirim Pesan WhatsApp Manual Langsung',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['targetNumber', 'message'],
                properties: {
                  targetNumber: { type: 'string', example: '6285292677431' },
                  message: { type: 'string', example: 'Halo dari panel backend ADAPTIVA-BOT' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Pesan berhasil dikirim'
          }
        }
      }
    },
    '/api/v1/status': {
      get: {
        tags: ['System Status & WhatsApp'],
        summary: 'Status Sistem, Server, WhatsApp, dan Analitik Pertanyaan',
        responses: {
          200: {
            description: 'Status sistem aktif',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/StatusResponse' }
              }
            }
          }
        }
      }
    },
    '/api/v1/tickets': {
      get: {
        tags: ['Tickets & Escalation'],
        summary: 'Daftar Antrean Tiket Eskalasi Panitia Sekolah',
        parameters: [
          {
            name: 'status',
            in: 'query',
            required: false,
            schema: {
              type: 'string',
              enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED'],
              example: 'OPEN'
            }
          }
        ],
        responses: {
          200: {
            description: 'Daftar tiket eskalasi'
          }
        }
      }
    },
    '/api/v1/tickets/{id}/resolve': {
      post: {
        tags: ['Tickets & Escalation'],
        summary: 'Tandai Tiket Eskalasi Selesai Ditangani Panitia',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', example: 'TCK-104141' }
          }
        ],
        responses: {
          200: {
            description: 'Tiket berhasil diselesaikan'
          }
        }
      }
    }
  },
  components: {
    schemas: {
      PaginationMeta: {
        type: 'object',
        properties: {
          total: { type: 'integer', example: 45 },
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 10 },
          totalPages: { type: 'integer', example: 5 },
          hasNext: { type: 'boolean', example: true },
          hasPrev: { type: 'boolean', example: false }
        }
      },
      ChatRequest: {
        type: 'object',
        required: ['message'],
        properties: {
          message: { type: 'string', example: 'Berapa rincian biaya seragam dan SPP bulanan?' },
          sender: { type: 'string', default: 'Web User', example: 'Ibu Ratna (Wali Murid)' },
          history: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                sender: { type: 'string', enum: ['user', 'bot'] },
                message: { type: 'string' },
                timestamp: { type: 'string' }
              }
            }
          }
        }
      },
      ChatResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Pesan berhasil diproses' },
          data: {
            type: 'object',
            properties: {
              reply: { type: 'string' },
              source: { type: 'string', example: 'gemini-2.5-flash' },
              confidence: { type: 'number', example: 0.99 },
              isFallback: { type: 'boolean', example: false },
              requiresHumanEscalation: { type: 'boolean', example: false },
              latencyMs: { type: 'number', example: 280 }
            }
          },
          timestamp: { type: 'string' }
        }
      },
      HealthResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Server is up and healthy' },
          data: {
            type: 'object',
            properties: {
              status: { type: 'string', example: 'HEALTHY' },
              uptime: { type: 'number', example: 120.4 }
            }
          },
          timestamp: { type: 'string' }
        }
      },
      KnowledgeEntityItem: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '9a21d9fa-3f82-4f81-8176-79ec2f8b5a1b' },
          category: { type: 'string', example: 'KERJASAMA_INDUSTRI' },
          title: { type: 'string', example: 'Kelas Industri Daihatsu & Komatsu' },
          content: { type: 'string', example: 'SMK Negeri 1 Adiwerna bekerjasama resmi dengan...' },
          tags: { type: 'string', example: 'daihatsu, komatsu, industri' },
          order: { type: 'integer', example: 1 },
          isActive: { type: 'boolean', example: true },
          createdAt: { type: 'string' },
          updatedAt: { type: 'string' }
        }
      },
      CreateEntityRequest: {
        type: 'object',
        required: ['category', 'title', 'content'],
        properties: {
          category: { type: 'string', example: 'KERJASAMA_INDUSTRI' },
          title: { type: 'string', example: 'Kelas Industri Daihatsu & Komatsu' },
          content: { type: 'string', example: 'Kerjasama kurikulum industri dan rekrutmen kerja.' },
          tags: { type: 'string', example: 'industri, karir' },
          order: { type: 'integer', example: 1 },
          isActive: { type: 'boolean', default: true }
        }
      },
      UpdateEntityRequest: {
        type: 'object',
        properties: {
          category: { type: 'string' },
          title: { type: 'string' },
          content: { type: 'string' },
          tags: { type: 'string' },
          order: { type: 'integer' },
          isActive: { type: 'boolean' }
        }
      },
      EntityResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string' },
          data: { $ref: '#/components/schemas/KnowledgeEntityItem' },
          timestamp: { type: 'string' }
        }
      },
      PaginatedEntitiesResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string' },
          data: {
            type: 'object',
            properties: {
              items: {
                type: 'array',
                items: { $ref: '#/components/schemas/KnowledgeEntityItem' }
              },
              pagination: { $ref: '#/components/schemas/PaginationMeta' }
            }
          },
          timestamp: { type: 'string' }
        }
      },
      CreateJurusanRequest: {
        type: 'object',
        required: ['kode', 'nama', 'kuota', 'deskripsi', 'prospekKerja'],
        properties: {
          kode: { type: 'string', example: 'RPL' },
          nama: { type: 'string', example: 'Rekayasa Perangkat Lunak' },
          kuota: { type: 'integer', example: 72 },
          deskripsi: { type: 'string', example: 'Fokus pemrograman web, mobile, AI.' },
          prospekKerja: { type: 'string', example: 'Software Developer, AI Engineer' }
        }
      },
      UpdateJurusanRequest: {
        type: 'object',
        properties: {
          nama: { type: 'string' },
          kuota: { type: 'integer' },
          deskripsi: { type: 'string' },
          prospekKerja: { type: 'string' }
        }
      },
      JurusanResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string' },
          data: { type: 'object' },
          timestamp: { type: 'string' }
        }
      },
      PaginatedJurusanResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string' },
          data: {
            type: 'object',
            properties: {
              items: { type: 'array', items: { type: 'object' } },
              pagination: { $ref: '#/components/schemas/PaginationMeta' }
            }
          },
          timestamp: { type: 'string' }
        }
      },
      CreateFaqRequest: {
        type: 'object',
        required: ['question', 'answer'],
        properties: {
          question: { type: 'string', example: 'Apakah ada SPP bulanan?' },
          answer: { type: 'string', example: '100% GRATIS bebas SPP.' },
          category: { type: 'string', example: 'SPMB' },
          order: { type: 'integer', example: 1 }
        }
      },
      UpdateFaqRequest: {
        type: 'object',
        properties: {
          question: { type: 'string' },
          answer: { type: 'string' },
          category: { type: 'string' },
          order: { type: 'integer' }
        }
      },
      PaginatedFaqsResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string' },
          data: {
            type: 'object',
            properties: {
              items: { type: 'array', items: { type: 'object' } },
              pagination: { $ref: '#/components/schemas/PaginationMeta' }
            }
          },
          timestamp: { type: 'string' }
        }
      },
      KnowledgeResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: {
            type: 'string',
            example: 'Data informasi sekolah berhasil dimuat dari PostgreSQL'
          },
          data: {
            type: 'object',
            properties: {
              school_info: { type: 'object' },
              jurusan: { type: 'array', items: { type: 'object' } },
              biaya: { type: 'object' },
              jadwal_spmb_2026: { type: 'array', items: { type: 'object' } },
              jalur_pendaftaran: { type: 'array', items: { type: 'object' } },
              syarat_dokumen: { type: 'array', items: { type: 'string' } },
              faq_populer: { type: 'array', items: { type: 'object' } },
              custom_entities: {
                type: 'array',
                items: { $ref: '#/components/schemas/KnowledgeEntityItem' }
              }
            }
          },
          timestamp: { type: 'string' }
        }
      },
      UpdateKnowledgeRequest: {
        type: 'object',
        description:
          'Payload dinamis untuk memperbarui basis pengetahuan sekolah di database PostgreSQL',
        properties: {
          school_info: { type: 'object' },
          jurusan: { type: 'array', items: { type: 'object' } },
          biaya: { type: 'object' },
          jadwal_spmb_2026: { type: 'array', items: { type: 'object' } },
          jalur_pendaftaran: { type: 'array', items: { type: 'object' } },
          syarat_dokumen: { type: 'array', items: { type: 'string' } },
          faq_populer: { type: 'array', items: { type: 'object' } }
        }
      },
      StatusResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Status sistem aktif' },
          data: {
            type: 'object',
            properties: {
              server: { type: 'string', example: 'ONLINE' },
              version: { type: 'string', example: '1.0.0 (Enterprise TS)' },
              whatsapp: { type: 'object' },
              analytics: { type: 'object' }
            }
          },
          timestamp: { type: 'string' }
        }
      },
      DeleteResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Data berhasil dihapus dari database' },
          data: { type: 'object' },
          timestamp: { type: 'string' }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Error description' },
          timestamp: { type: 'string' }
        }
      }
    }
  }
};

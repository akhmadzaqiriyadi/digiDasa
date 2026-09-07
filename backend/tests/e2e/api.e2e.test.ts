import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app';
import { Application } from 'express';

describe('🚀 ADAPTIVA-BOT E2E & Integration Test Suite', () => {
  let app: Application;

  beforeAll(() => {
    app = createApp();
  });

  describe('1. Health Check & Scalar Docs Endpoints', () => {
    it('GET /health should return 200 and healthy status', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('HEALTHY');
    });

    it('GET /reference should serve Scalar interactive documentation UI', async () => {
      const res = await request(app).get('/reference');
      expect(res.status).toBe(200);
      expect(res.text).toContain('Scalar');
    });

    it('GET /docs should also serve Scalar documentation', async () => {
      const res = await request(app).get('/docs');
      expect(res.status).toBe(200);
    });

    it('GET /unknown-route should return 404 standardized error format', async () => {
      const res = await request(app).get('/api/v1/invalid-route');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('2. Cognitive AI Chat Pipeline (/api/v1/chat)', () => {
    it('should process general fee & SPP questions accurately', async () => {
      const res = await request(app).post('/api/v1/chat').send({
        message: 'Berapa biaya SPP bulanan di SMK Negeri 1 Adiwerna?',
        sender: 'Ibu Ratna'
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.reply).toContain('GRATIS');
      expect(res.body.data.reply).toContain('Surat Keputusan (SK)');
      expect(res.body.data.requiresHumanEscalation).toBe(false);
      expect(res.body.data.latencyMs).toBeGreaterThanOrEqual(0);
    });

    it('should answer jurusan questions with complete programs', async () => {
      const res = await request(app).post('/api/v1/chat').send({
        message: 'Jurusan dan kuota apa saja yang dibuka?',
        sender: 'Calon Siswa'
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.reply).toContain('RPL');
      expect(res.body.data.reply).toContain('TKJ');
    });

    it('should trigger human escalation and ticket creation when requesting admin', async () => {
      const res = await request(app).post('/api/v1/chat').send({
        message: 'Tolong saya mau bicara dengan admin panitia sekolah mengenai dispensasi',
        sender: 'Pak Budi'
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.requiresHumanEscalation).toBe(true);
      expect(res.body.data.reply).toContain('wa.me/');
    });

    it('should return 400 Bad Request when message is empty', async () => {
      const res = await request(app).post('/api/v1/chat').send({
        message: ''
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('3. Knowledge Base & Grounding APIs (/api/v1/knowledge)', () => {
    it('GET /api/v1/knowledge should return official school metadata, fees, and jurusan', async () => {
      const res = await request(app).get('/api/v1/knowledge');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.school_info.name).toBe('SMK Negeri 1 Adiwerna (STM ADB)');
      expect(res.body.data.jurusan.length).toBeGreaterThan(0);
      expect(res.body.data.biaya).toBeDefined();
    });

    it('PUT /api/v1/knowledge should dynamically update school info and jurusan in PostgreSQL', async () => {
      const updatePayload = {
        school_info: {
          last_updated: '2 September 2026',
          sk_number: 'SK/SPMB/2026/042-ADB-REV'
        },
        jurusan: [
          {
            kode: 'RPL',
            nama: 'Rekayasa Perangkat Lunak & Cognitive AI',
            kuota: 72,
            deskripsi: 'Pemrograman Web, Mobile, Cloud, dan AI Automation.',
            prospek_kerja: 'Software Engineer, AI Developer'
          }
        ]
      };

      const res = await request(app).put('/api/v1/knowledge').send(updatePayload);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.school_info.last_updated).toBe('2 September 2026');
      expect(res.body.data.school_info.sk_number).toBe('SK/SPMB/2026/042-ADB-REV');

      const rpl = res.body.data.jurusan.find((j: { kode: string }) => j.kode === 'RPL');
      expect(rpl?.nama).toContain('Cognitive AI');
    });

    it('GET /api/v1/knowledge/entities should support pagination, search query, and category filter', async () => {
      const res = await request(app)
        .get('/api/v1/knowledge/entities')
        .query({ page: 1, limit: 2, category: 'KERJASAMA_INDUSTRI' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.pagination).toBeDefined();
      expect(res.body.data.pagination.page).toBe(1);
      expect(res.body.data.pagination.limit).toBe(2);
      expect(Array.isArray(res.body.data.items)).toBe(true);
      if (res.body.data.items.length > 0) {
        expect(res.body.data.items[0].category).toBe('KERJASAMA_INDUSTRI');
      }
    });

    it('POST, PUT, and DELETE /api/v1/knowledge/entities should handle full CRUD cycle', async () => {
      // 1. CREATE
      const createRes = await request(app).post('/api/v1/knowledge/entities').send({
        category: 'KERJASAMA_INDUSTRI',
        title: 'Kelas Industri Astra Honda Motor',
        content: 'Kurikulum standar AHM dan uji sertifikasi mekanik resmi.',
        tags: 'honda, astra, otomotif',
        order: 10,
        isActive: true
      });

      expect(createRes.status).toBe(201);
      expect(createRes.body.success).toBe(true);
      const createdId = createRes.body.data.id;
      expect(createdId).toBeDefined();

      // 2. GET by ID
      const getRes = await request(app).get(`/api/v1/knowledge/entities/${createdId}`);
      expect(getRes.status).toBe(200);
      expect(getRes.body.data.title).toBe('Kelas Industri Astra Honda Motor');

      // 3. UPDATE
      const updateRes = await request(app)
        .put(`/api/v1/knowledge/entities/${createdId}`)
        .send({ title: 'Kelas Industri Astra Honda Motor (Updated)' });
      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.title).toContain('(Updated)');

      // 4. DELETE
      const deleteRes = await request(app).delete(`/api/v1/knowledge/entities/${createdId}`);
      expect(deleteRes.status).toBe(200);

      // Verify deletion
      const checkRes = await request(app).get(`/api/v1/knowledge/entities/${createdId}`);
      expect(checkRes.status).toBe(404);
    });

    it('POST /api/v1/knowledge/entities should return 400 when required fields are missing', async () => {
      const res = await request(app).post('/api/v1/knowledge/entities').send({
        category: 'INVALID'
        // missing title and content
      });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('PUT and DELETE /api/v1/knowledge/entities/:id should return 404 for non-existent ID', async () => {
      const putRes = await request(app)
        .put('/api/v1/knowledge/entities/non-existent-uuid-1234')
        .send({ title: 'New Title' });
      expect(putRes.status).toBe(404);

      const delRes = await request(app).delete('/api/v1/knowledge/entities/non-existent-uuid-1234');
      expect(delRes.status).toBe(404);
    });

    it('GET /api/v1/knowledge/jurusan should return paginated list of programs', async () => {
      const res = await request(app).get('/api/v1/knowledge/jurusan').query({ page: 1, limit: 5 });
      expect(res.status).toBe(200);
      expect(res.body.data.pagination.total).toBeGreaterThanOrEqual(6);
      expect(res.body.data.items.length).toBeLessThanOrEqual(5);
    });

    it('POST, PUT, and DELETE /api/v1/knowledge/jurusan should handle complete Jurusan lifecycle', async () => {
      // 1. Create Jurusan
      const createRes = await request(app).post('/api/v1/knowledge/jurusan').send({
        kode: 'MEKA',
        nama: 'Teknik Mekatronika & Robotika',
        kuota: 36,
        deskripsi: 'Otomasi industri dan robotika manufaktur',
        prospekKerja: 'Teknisi PLC, Otomasi Industri'
      });
      expect(createRes.status).toBe(201);
      expect(createRes.body.data.kode).toBe('MEKA');

      // 2. Duplicate code check
      const dupRes = await request(app).post('/api/v1/knowledge/jurusan').send({
        kode: 'MEKA',
        nama: 'Duplikat',
        kuota: 20,
        deskripsi: 'Deskripsi',
        prospekKerja: 'Kerja'
      });
      expect(dupRes.status).toBe(400);

      // 3. Update Jurusan
      const updateRes = await request(app)
        .put('/api/v1/knowledge/jurusan/MEKA')
        .send({ kuota: 40 });
      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.kuota).toBe(40);

      // 4. Update non-existent Jurusan
      const notFoundUpdate = await request(app)
        .put('/api/v1/knowledge/jurusan/NONEXIST')
        .send({ kuota: 10 });
      expect(notFoundUpdate.status).toBe(404);

      // 5. Delete Jurusan
      const delRes = await request(app).delete('/api/v1/knowledge/jurusan/MEKA');
      expect(delRes.status).toBe(200);

      // 6. Delete non-existent Jurusan
      const notFoundDel = await request(app).delete('/api/v1/knowledge/jurusan/NONEXIST');
      expect(notFoundDel.status).toBe(404);
    });

    it('GET /api/v1/knowledge/faqs should return paginated list of FAQs', async () => {
      const res = await request(app).get('/api/v1/knowledge/faqs').query({ page: 1, limit: 5 });
      expect(res.status).toBe(200);
      expect(res.body.data.pagination).toBeDefined();
      expect(Array.isArray(res.body.data.items)).toBe(true);
    });

    it('POST, PUT, and DELETE /api/v1/knowledge/faqs should handle complete FAQ lifecycle', async () => {
      // 1. Create FAQ
      const createRes = await request(app).post('/api/v1/knowledge/faqs').send({
        question: 'Berapa jarak maksimal jalur zonasi?',
        answer: 'Jalur zonasi memperhitungkan jarak radius maksimal 5 km dari sekolah.',
        category: 'ZONASI',
        order: 10
      });
      expect(createRes.status).toBe(201);
      const faqId = createRes.body.data.id;

      // 2. Update FAQ
      const updateRes = await request(app)
        .put(`/api/v1/knowledge/faqs/${faqId}`)
        .send({ answer: 'Jalur zonasi memperhitungkan radius 6 km.' });
      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.answer).toContain('6 km');

      // 3. Delete FAQ
      const delRes = await request(app).delete(`/api/v1/knowledge/faqs/${faqId}`);
      expect(delRes.status).toBe(200);

      // 4. Delete non-existent FAQ
      const notFoundDel = await request(app).delete(`/api/v1/knowledge/faqs/${faqId}`);
      expect(notFoundDel.status).toBe(404);
    });
  });

  describe('4. Status & Escalation Tickets Management', () => {
    it('GET /api/v1/status should return system online status and analytics', async () => {
      const res = await request(app).get('/api/v1/status');
      expect(res.status).toBe(200);
      expect(res.body.data.server).toBe('ONLINE');
      expect(res.body.data.analytics.totalChats).toBeGreaterThan(0);
    });

    it('GET /api/v1/tickets should return list of tickets and support status filter', async () => {
      const res = await request(app).get('/api/v1/tickets');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);

      const openRes = await request(app).get('/api/v1/tickets').query({ status: 'OPEN' });
      expect(openRes.status).toBe(200);
      expect(Array.isArray(openRes.body.data)).toBe(true);
    });

    it('POST /api/v1/tickets/:id/resolve should resolve an existing ticket or return 400 for invalid id', async () => {
      const listRes = await request(app).get('/api/v1/tickets');
      const firstTicket = listRes.body.data[0];

      const resolveRes = await request(app).post(`/api/v1/tickets/${firstTicket.id}/resolve`);
      expect(resolveRes.status).toBe(200);
      expect(resolveRes.body.data.status).toBe('RESOLVED');

      const invalidRes = await request(app).post('/api/v1/tickets/NON-EXISTENT-TCK/resolve');
      expect(invalidRes.status).toBe(400);
    });
  });

  describe('5. WhatsApp Gateway API Interface', () => {
    it('POST /api/v1/whatsapp/connect should trigger WhatsApp connection flow', async () => {
      const res = await request(app).post('/api/v1/whatsapp/connect');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('status');
    });

    it('GET /api/v1/whatsapp/status should return gateway readiness status', async () => {
      const res = await request(app).get('/api/v1/whatsapp/status');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('isReady');
      expect(res.body.data).toHaveProperty('status');
      expect(res.body.data).toHaveProperty('panitiaContact');
    });

    it('POST /api/v1/whatsapp/send-test should validate target number and text', async () => {
      const res = await request(app).post('/api/v1/whatsapp/send-test').send({});
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});

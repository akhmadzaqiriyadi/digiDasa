import { Router } from 'express';
import { ChatController } from '../modules/chat/ChatController';
import { KnowledgeController } from '../modules/knowledge/KnowledgeController';
import { WhatsAppController } from '../modules/whatsapp/WhatsAppController';

export const apiRouter = Router();

// Chat Endpoint
apiRouter.post('/chat', ChatController.handleChat);

// Knowledge Base Root Endpoints (Full summary & Bulk sync)
apiRouter.get('/knowledge', ChatController.getKnowledge);
apiRouter.put('/knowledge', ChatController.updateKnowledge);

// Dynamic Knowledge Entities (CRUD + Pagination + Filter)
apiRouter.get('/knowledge/entities', KnowledgeController.getEntities);
apiRouter.post('/knowledge/entities', KnowledgeController.createEntity);
apiRouter.get('/knowledge/entities/:id', KnowledgeController.getEntityById);
apiRouter.put('/knowledge/entities/:id', KnowledgeController.updateEntity);
apiRouter.delete('/knowledge/entities/:id', KnowledgeController.deleteEntity);

// Jurusan Management (CRUD + Pagination + Filter)
apiRouter.get('/knowledge/jurusan', KnowledgeController.getJurusan);
apiRouter.post('/knowledge/jurusan', KnowledgeController.createJurusan);
apiRouter.put('/knowledge/jurusan/:kode', KnowledgeController.updateJurusan);
apiRouter.delete('/knowledge/jurusan/:kode', KnowledgeController.deleteJurusan);

// FAQ Management (CRUD + Pagination + Filter)
apiRouter.get('/knowledge/faqs', KnowledgeController.getFaqs);
apiRouter.post('/knowledge/faqs', KnowledgeController.createFaq);
apiRouter.put('/knowledge/faqs/:id', KnowledgeController.updateFaq);
apiRouter.delete('/knowledge/faqs/:id', KnowledgeController.deleteFaq);

// Status & Analytics
apiRouter.get('/status', ChatController.getSystemStatus);

// Tickets & Escalation
apiRouter.get('/tickets', ChatController.getTickets);
apiRouter.post('/tickets/:id/resolve', ChatController.resolveTicket);

// WhatsApp Gateway Management
apiRouter.get('/whatsapp/status', WhatsAppController.getStatus);
apiRouter.post('/whatsapp/connect', WhatsAppController.connect);
apiRouter.post('/whatsapp/disconnect', WhatsAppController.disconnect);
apiRouter.post('/whatsapp/send-test', WhatsAppController.sendTestMessage);

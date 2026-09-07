import { apiClient } from './client';
import {
  SchoolKnowledgeResponseSchema,
  SchoolKnowledgeResponse,
  CustomEntity,
  CreateEntityInput,
  CreateJurusanInput,
  CreateFaqInput,
  JurusanItem,
  FaqItem
} from '../schemas';
import { DEFAULT_SCHOOL_KNOWLEDGE } from '../constants/default-knowledge';

export async function getSchoolKnowledge(): Promise<SchoolKnowledgeResponse> {
  try {
    const data = await apiClient<unknown>('/knowledge', {
      method: 'GET',
      cache: 'no-store'
    });
    return SchoolKnowledgeResponseSchema.parse(data);
  } catch (err) {
    console.warn('Backend knowledge API unavailable or failed to parse, falling back to default:', err);
    return SchoolKnowledgeResponseSchema.parse(DEFAULT_SCHOOL_KNOWLEDGE);
  }
}

export async function syncKnowledgeFromDb(): Promise<{ success: boolean; message: string }> {
  return apiClient('/knowledge/sync', {
    method: 'POST'
  });
}

// 1. Custom Entity CRUD
export async function createCustomEntity(payload: CreateEntityInput): Promise<{ success: boolean; data: CustomEntity }> {
  return apiClient('/knowledge/entities', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function updateCustomEntity(id: string, payload: Partial<CreateEntityInput>): Promise<{ success: boolean; data: CustomEntity }> {
  return apiClient(`/knowledge/entities/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

export async function deleteCustomEntity(id: string): Promise<{ success: boolean; message: string }> {
  return apiClient(`/knowledge/entities/${id}`, {
    method: 'DELETE'
  });
}

// 2. Jurusan CRUD
export async function createJurusan(payload: CreateJurusanInput): Promise<{ success: boolean; data: JurusanItem; message: string }> {
  return apiClient('/knowledge/jurusan', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function updateJurusan(kode: string, payload: Partial<CreateJurusanInput>): Promise<{ success: boolean; data: JurusanItem; message: string }> {
  return apiClient(`/knowledge/jurusan/${kode}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

export async function deleteJurusan(kode: string): Promise<{ success: boolean; message: string }> {
  return apiClient(`/knowledge/jurusan/${kode}`, {
    method: 'DELETE'
  });
}

// 3. FAQ CRUD
export async function createFaq(payload: CreateFaqInput): Promise<{ success: boolean; data: FaqItem; message: string }> {
  return apiClient('/knowledge/faqs', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function updateFaq(id: string, payload: Partial<CreateFaqInput>): Promise<{ success: boolean; data: FaqItem; message: string }> {
  return apiClient(`/knowledge/faqs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

export async function deleteFaq(id: string): Promise<{ success: boolean; message: string }> {
  return apiClient(`/knowledge/faqs/${id}`, {
    method: 'DELETE'
  });
}

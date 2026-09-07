import { apiClient } from './client';
import {
  SchoolKnowledgeResponseSchema,
  SchoolKnowledgeResponse,
  CustomEntity
} from '../schemas';

export async function getSchoolKnowledge(): Promise<SchoolKnowledgeResponse> {
  const data = await apiClient<unknown>('/knowledge', {
    method: 'GET',
    cache: 'no-store'
  });
  return SchoolKnowledgeResponseSchema.parse(data);
}

export async function syncKnowledgeFromDb(): Promise<{ success: boolean; message: string }> {
  return apiClient('/knowledge/sync', {
    method: 'POST'
  });
}

export async function createCustomEntity(payload: {
  category: string;
  title: string;
  content: string;
  order?: number;
}): Promise<{ success: boolean; data: CustomEntity }> {
  return apiClient('/knowledge/entities', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function deleteCustomEntity(id: string): Promise<{ success: boolean; message: string }> {
  return apiClient(`/knowledge/entities/${id}`, {
    method: 'DELETE'
  });
}

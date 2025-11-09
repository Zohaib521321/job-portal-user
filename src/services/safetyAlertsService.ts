import { apiFetch } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import type { ApiResponse } from '@/lib/types/api';

export type SafetyAlert = {
  id: number;
  title: string;
  slug: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
};

export async function listSafetyAlerts(params?: { page?: number; limit?: number; search?: string }) {
  const q = new URLSearchParams();
  if (params?.page) q.set('page', String(params.page));
  if (params?.limit) q.set('limit', String(params.limit));
  if (params?.search) q.set('search', params.search);
  return apiFetch<ApiResponse<SafetyAlert[]>>(endpoints.safetyAlerts(q.toString()));
}

export type PublicSafetyAlertsResponse = ApiResponse<{
  alerts: SafetyAlert[];
  pagination: { page: number; limit: number; total: number; totalPages: number; hasMore: boolean };
}>;

export async function listPublicSafetyAlerts(params?: { page?: number; limit?: number; search?: string }) {
  const q = new URLSearchParams();
  if (params?.page) q.set('page', String(params.page));
  if (params?.limit) q.set('limit', String(params.limit));
  if (params?.search) q.set('search', params.search);
  return apiFetch<PublicSafetyAlertsResponse>(endpoints.safetyAlertsPublic(q.toString()));
}



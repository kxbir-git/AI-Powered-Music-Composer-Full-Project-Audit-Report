const API_BASE = '/api';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Network request failed' }));
    throw new ApiError(response.status, errorData.detail || 'An error occurred');
  }

  return response.json();
}

export const api = {
  // Auth
  register: (data: any) => request<{ access_token: string; refresh_token: string }>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: any) => request<{ access_token: string; refresh_token: string }>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  getProfile: () => request<any>('/auth/me'),
  updateProfile: (data: { name?: string; preferences?: any }) => request<any>('/auth/me', { method: 'PUT', body: JSON.stringify(data) }),
  getUserStats: () => request<any>('/auth/stats'),

  // Music Generation
  generateMusic: (data: any) => request<{ id: string; projectId: string; status: string }>('/music/generate', { method: 'POST', body: JSON.stringify(data) }),
  getGenerationStatus: (id: string) => request<any>(`/music/generate/${id}/status`),
  createVariation: (data: any) => request<any>('/music/variation', { method: 'POST', body: JSON.stringify(data) }),

  // Projects & Library
  getProjects: (params?: Record<string, string>) => {
    const query = new URLSearchParams(params).toString();
    return request<any>(`/music/projects?${query}`);
  },
  getProject: (id: string) => request<any>(`/music/projects/${id}`),
  updateProject: (id: string, data: any) => request<any>(`/music/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProject: (id: string) => request<any>(`/music/projects/${id}`, { method: 'DELETE' }),

  // Recommendations
  getRecommendations: () => request<any>('/recommendations'),

  // Audio Analyzer
  analyzeAudio: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request<any>('/music/analyze', { method: 'POST', body: formData });
  },

  // Favorites
  getFavorites: () => request<any>('/favorites'),
  addFavorite: (projectId: string) => request<any>(`/favorites?project_id=${projectId}`, { method: 'POST' }),
  removeFavorite: (id: string) => request<any>(`/favorites/${id}`, { method: 'DELETE' }),
};

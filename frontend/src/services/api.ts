const API_BASE = '/api';

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ detail: 'Network request failed' }));
    throw new Error(errorBody.detail || `API error: ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    fetchApi<{ access_token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  // Dashboard
  getDashboardSummary: () => fetchApi<any>('/dashboard/summary'),
  getDashboardCharts: () => fetchApi<any>('/dashboard/charts'),

  // Defects
  getDefects: (params?: Record<string, string>) => {
    const query = new URLSearchParams(params).toString();
    return fetchApi<any[]>(`/defects${query ? `?${query}` : ''}`);
  },
  getDefectById: (id: number) => fetchApi<any>(`/defects/${id}`),
  simulateDefect: (defectData: any) =>
    fetchApi<any>('/defects/simulate', {
      method: 'POST',
      body: JSON.stringify(defectData),
    }),

  // Patterns
  getPatterns: (params?: Record<string, string>) => {
    const query = new URLSearchParams(params).toString();
    return fetchApi<any[]>(`/patterns${query ? `?${query}` : ''}`);
  },
  getPatternDetail: (id: number) => fetchApi<any>(`/patterns/${id}`),
  getAISummary: (patternId: number) => fetchApi<any>(`/patterns/${patternId}/ai-summary`),

  // NCRs
  getNCRs: (params?: Record<string, string>) => {
    const query = new URLSearchParams(params).toString();
    return fetchApi<any[]>(`/ncrs${query ? `?${query}` : ''}`);
  },
  getNCRById: (id: number) => fetchApi<any>(`/ncrs/${id}`),
  updateNCR: (id: number, data: any) =>
    fetchApi<any>(`/ncrs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Tickets
  getTickets: (params?: Record<string, string>) => {
    const query = new URLSearchParams(params).toString();
    return fetchApi<any[]>(`/tickets${query ? `?${query}` : ''}`);
  },
  getTicketById: (id: number) => fetchApi<any>(`/tickets/${id}`),
  updateTicket: (id: number, data: any) =>
    fetchApi<any>(`/tickets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Alerts
  getAlerts: (params?: Record<string, string>) => {
    const query = new URLSearchParams(params).toString();
    return fetchApi<any[]>(`/alerts${query ? `?${query}` : ''}`);
  },
  acknowledgeAlert: (id: number) =>
    fetchApi<any>(`/alerts/${id}/ack`, {
      method: 'PUT',
    }),

  // Stations & Products & Codes
  getStations: () => fetchApi<any[]>('/stations'),
  getStationDetail: (id: number) => fetchApi<any>(`/stations/${id}`),
  getProducts: () => fetchApi<any[]>('/products'),
  getDefectCodes: (search?: string) =>
    fetchApi<any[]>(`/defect-codes${search ? `?search=${encodeURIComponent(search)}` : ''}`),

  // Settings
  getSettings: () => fetchApi<any>('/settings'),
  updateSettings: (threshold: number, time_window: number) =>
    fetchApi<any>('/settings', {
      method: 'PUT',
      body: JSON.stringify({ threshold, time_window }),
    }),

  // Analytics
  getAnalytics: () => fetchApi<any>('/analytics'),

  // Demo Mode
  resetDemoDatabase: () => fetchApi<any>('/demo/reset', { method: 'POST' }),
  simulateDemoSequence: () => fetchApi<any>('/demo/simulate-sequence', { method: 'POST' }),
};

const BASE = '/api/v1';

export const getToken = () => localStorage.getItem('sm_token');
export const setToken = (t) => localStorage.setItem('sm_token', t);
export const clearToken = () => localStorage.removeItem('sm_token');

export async function apiFetch(path, init = {}) {
  const token = getToken();
  const isForm = init.body instanceof FormData;

  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      ...(isForm ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {}),
    },
  });

  if (!res.ok) {
    let detail = '';
    try { detail = JSON.stringify(await res.json()); } catch { detail = await res.text(); }
    throw new Error(detail || `HTTP ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  register: (body) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  token: async (email, password) => {
    const body = new URLSearchParams({ username: email, password });
    const res = await fetch(`${BASE}/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    if (!res.ok) throw new Error('Invalid credentials');
    return res.json();
  },
  me: () => apiFetch('/auth/me'),

  uploadProductImage: (file) => {
    const fd = new FormData();
    fd.append('file', file);
    return apiFetch('/products/ocr', { method: 'POST', body: fd });
  },
  myProducts: () => apiFetch('/products/'),

  match: (body) => apiFetch('/match/', { method: 'POST', body: JSON.stringify(body) }),

  ask: (question, language = 'en') =>
    apiFetch('/assistant/ask', { method: 'POST', body: JSON.stringify({ question, language }) }),

  pendingVerifications: () => apiFetch('/verification/pending'),
  decide: (body) => apiFetch('/verification/decide', { method: 'POST', body: JSON.stringify(body) }),
  audit: () => apiFetch('/verification/audit'),

  analyticsOverview: () => apiFetch('/analytics/overview'),
  analyticsTopStandards: () => apiFetch('/analytics/top-standards'),
  analyticsDecisions: () => apiFetch('/analytics/decisions'),
};

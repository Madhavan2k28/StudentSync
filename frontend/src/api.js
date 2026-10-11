// All calls to the Spring Boot REST API go through here.
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8081';

function token() {
  return localStorage.getItem('ss_token');
}

async function request(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token()) headers.Authorization = `Bearer ${token()}`;

  let res;
  try {
    res = await fetch(`${BASE}/api${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Cannot reach the server. Check that the backend is running on ' + BASE);
  }

  if (res.status === 401 && !path.startsWith('/auth/login')) {
    localStorage.removeItem('ss_token');
    localStorage.removeItem('ss_user');
    window.dispatchEvent(new Event('ss-logout'));
  }
  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
  return data;
}

function qs(params) {
  const p = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => v && p.append(k, v));
  const s = p.toString();
  return s ? `?${s}` : '';
}

export const api = {
  stats: () => request('/stats'),

  register: (data) => request('/auth/register', { method: 'POST', body: data }),
  login: (data) => request('/auth/login', { method: 'POST', body: data }),
  logout: () => request('/auth/logout', { method: 'POST' }),

  items: (filters = {}) => request('/items' + qs(filters)),
  myItems: () => request('/items/mine'),
  item: (id) => request(`/items/${id}`),
  createItem: (data) => request('/items', { method: 'POST', body: data }),
  deleteItem: (id) => request(`/items/${id}`, { method: 'DELETE' }),
  matches: (id) => request(`/items/${id}/matches`),

  submitClaim: (itemId, data) => request(`/items/${itemId}/claims`, { method: 'POST', body: data }),
  itemClaims: (itemId) => request(`/items/${itemId}/claims`),
  claimsReceived: () => request('/claims/received'),
  claimsSent: () => request('/claims/sent'),
  verifyClaim: (id) => request(`/claims/${id}/verify`, { method: 'POST' }),
  rejectClaim: (id) => request(`/claims/${id}/reject`, { method: 'POST' }),

  skills: (filters = {}) => request('/skills' + qs(filters)),
  mySkills: () => request('/skills/mine'),
  addSkill: (data) => request('/skills', { method: 'POST', body: data }),
  removeSkill: (id) => request(`/skills/${id}`, { method: 'DELETE' }),

  profile: (id) => request(`/users/${id}`),
  updateProfile: (data) => request('/users/me', { method: 'PUT', body: data }),

  sendRequest: (data) => request('/requests', { method: 'POST', body: data }),
  requestsSent: () => request('/requests/sent'),
  requestsReceived: () => request('/requests/received'),
  acceptRequest: (id) => request(`/requests/${id}/accept`, { method: 'POST' }),
  rejectRequest: (id) => request(`/requests/${id}/reject`, { method: 'POST' }),
  schedule: (id, data) => request(`/requests/${id}/schedule`, { method: 'PUT', body: data }),
  feedback: (id, data) => request(`/requests/${id}/feedback`, { method: 'POST', body: data }),
};

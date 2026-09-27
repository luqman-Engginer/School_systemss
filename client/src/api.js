const TOKEN_KEY = 'sh_token';
const USER_KEY = 'sh_user';

const BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

export function mediaUrl(path) {
  if (!path) return path;
  if (/^(https?:|data:|\/\/)/.test(path)) return path;
  return `${BASE_URL}${path}`;
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(t) {
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else localStorage.removeItem(TOKEN_KEY);
}
export function getUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY)) || null;
  } catch {
    return null;
  }
}
export function setUser(u) {
  if (u) localStorage.setItem(USER_KEY, JSON.stringify(u));
  else localStorage.removeItem(USER_KEY);
}

export async function api(path, { method = 'GET', body, form } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  let payload;
  if (form) {
    payload = form;
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  const res = await fetch(`${BASE_URL}/api${path}`, { method, headers, body: payload });
  let json;
  try {
    json = await res.json();
  } catch {
    const ct = res.headers.get('content-type') || '?';
    json = {
      success: false,
      error: res.ok
        ? `Respon server tidak valid (bukan JSON, ${ct}). Periksa VITE_API_URL.`
        : `Respon server tidak valid (${res.status}, ${ct}). Pastikan VITE_API_URL menunjuk ke backend API.`,
    };
  }
  if (!res.ok) {
    const err = new Error(json.error || `Request gagal (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return json.data;
}

export const uploadFile = async (file) => {
  const fd = new FormData();
  fd.append('file', file);
  return api('/upload', { method: 'POST', form: fd });
};
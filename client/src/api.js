const TOKEN_KEY = 'sh_token';
const USER_KEY = 'sh_user';

const BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

const REQUEST_TIMEOUT_MS = 15000;
const MAX_ATTEMPTS = 3;
const RETRY_BASE_MS = 700;

// Hanya status di bawah ini yang aman di-retry. 4xx berarti permintaan sudah
// diproses dan ditolak, jadi retry tidak akan mengubah hasil dan untuk POST
// berisiko membuat data duplikat. 500 adalah error level aplikasi, bukan
// masalah konektivitas.
const RETRYABLE_STATUS = new Set([408, 425, 429, 502, 503, 504]);

const listeners = new Set();
let status = 'online';
let failures = 0;

function emit(next) {
  if (next === status) return;
  status = next;
  for (const fn of [...listeners]) fn(status);
}

export function subscribeApiStatus(fn) {
  listeners.add(fn);
  fn(status);
  return () => listeners.delete(fn);
}

export function getApiStatus() {
  return status;
}

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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function send(path, { method, headers, payload }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(`${BASE_URL}/api${path}`, { method, headers, body: payload, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
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

  let lastError = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    let res;
    try {
      res = await send(path, { method, headers, payload });
    } catch (e) {
      // Tidak ada respons sama sekali: timeout, offline, DNS, atau koneksi diputus.
      lastError = new Error(
        e?.name === 'AbortError'
          ? `Server tidak merespons dalam ${Math.round(REQUEST_TIMEOUT_MS / 1000)} detik.`
          : 'Tidak bisa menghubungi server. Periksa koneksi internet Anda.'
      );
      if (attempt < MAX_ATTEMPTS) {
        await sleep(RETRY_BASE_MS * attempt);
        continue;
      }
      break;
    }

    failures = 0;
    emit('online');

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

    if (res.ok) return json.data;

    const err = new Error(json.error || `Request gagal (${res.status})`);
    err.status = res.status;
    if (!RETRYABLE_STATUS.has(res.status)) throw err;

    lastError = err;
    if (attempt < MAX_ATTEMPTS) {
      await sleep(RETRY_BASE_MS * attempt);
      continue;
    }
    // Retryable habis. Perlakukan sama dengan gagal konektivitas: kemungkinan
    // besar proses backend sedang restart atau tidak merespons.
    break;
  }

  failures += 1;
  if (failures >= 2) emit('offline');
  throw lastError;
}

export const uploadFile = async (file) => {
  const fd = new FormData();
  fd.append('file', file);
  return api('/upload', { method: 'POST', form: fd });
};

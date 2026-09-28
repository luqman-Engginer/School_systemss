import { useEffect, useRef, useState } from 'react';
import { CloudOff, RefreshCw, Wifi } from 'lucide-react';
import { api, subscribeApiStatus } from '../api';

const POLL_MS = 5000;
const RECOVERED_MS = 4000;

export default function ApiStatus() {
  const [status, setStatus] = useState('online');
  const [checking, setChecking] = useState(false);
  const [recovered, setRecovered] = useState(false);
  const wasOffline = useRef(false);

  useEffect(() => subscribeApiStatus(setStatus), []);

  useEffect(() => {
    if (status === 'offline') {
      wasOffline.current = true;
      return undefined;
    }
    if (!wasOffline.current) return undefined;

    setRecovered(true);
    const hide = setTimeout(() => {
      setRecovered(false);
      wasOffline.current = false;
    }, RECOVERED_MS);
    return () => clearTimeout(hide);
  }, [status]);

  useEffect(() => {
    if (status !== 'offline') return undefined;

    let cancelled = false;

    const probe = async () => {
      setChecking(true);
      try {
        // Berhasil akan membuat subscribeApiStatus mengubah status ke 'online'.
        await api('/health');
      } catch {
        // Masih tidak terjangkau, coba lagi pada interval berikutnya.
      } finally {
        if (!cancelled) setChecking(false);
      }
    };

    const id = setInterval(probe, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [status]);

  if (status === 'online' && !recovered) return null;

  const offline = status === 'offline';

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 bottom-0 z-[100] flex justify-center px-4 pb-4 pointer-events-none"
    >
      <div
        className={`pointer-events-auto flex max-w-lg items-start gap-3 rounded-2xl px-4 py-3 shadow-2xl ring-1 backdrop-blur ${
          offline
            ? 'bg-rose-950/95 text-rose-50 ring-rose-500/40'
            : 'bg-emerald-950/95 text-emerald-50 ring-emerald-500/40'
        }`}
      >
        {offline ? (
          <CloudOff size={20} className="mt-0.5 shrink-0" />
        ) : (
          <Wifi size={20} className="mt-0.5 shrink-0" />
        )}

        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold">
            {offline ? 'Server sedang tidak terjangkau' : 'Koneksi kembali pulih'}
          </p>
          <p className="mt-0.5 text-xs leading-relaxed opacity-90">
            {offline
              ? 'Data mungkin belum termuat. Halaman ini akan otomatis mencoba lagi — Anda tidak perlu refresh.'
              : 'Semua data akan tampil normal lagi.'}
          </p>
        </div>

        {offline && (
          <RefreshCw
            size={16}
            className={`mt-1 shrink-0 text-rose-200/70 ${checking ? 'animate-spin' : ''}`}
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
}

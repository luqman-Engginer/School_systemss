import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../api';

// Mengambil data dari API dengan status loading & error yang eksplisit.
// Tujuannya: halaman TIDAK pernah menggantung di spinner saat request gagal
// (mis. VITE_API_URL salah, CORS, mixed content, 401, atau server down).
//
// Pemakaian:
//   const { data, error, loading, retry } = useApi('/public/home');
//   if (error) return <ErrorState error={error} onRetry={retry} />;
//   if (!data) return <Spinner />;
//
// Untuk request bersyarat (mis. menunggu pilihan kelas):
//   const { data, error, retry } = useApi(`/teacher/progress?class_id=${id}`, { enabled: !!id });
export function useApi(path, { enabled = true, deps = [] } = {}) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(Boolean(enabled) && Boolean(path));
  const [tick, setTick] = useState(0);

  const retry = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!enabled || !path) {
      setLoading(false);
      return undefined;
    }
    let alive = true;
    setLoading(true);
    setError(null);
    api(path)
      .then((d) => {
        if (!alive) return;
        setData(d);
        setError(null);
      })
      .catch((e) => {
        if (!alive) return;
        setError(e);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, enabled, tick, ...deps]);

  return { data, error, loading, retry };
}

export default useApi;

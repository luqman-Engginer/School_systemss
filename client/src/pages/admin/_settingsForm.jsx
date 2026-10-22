import { useEffect, useState } from 'react';
import { api } from '../../api';
import { useApi } from '../../hooks/useApi';
import { Page, Spinner, useToast, ErrorState } from '../../components/ui';

export function SettingsPage({ title, subtitle, children }) {
  const { data, error, retry } = useApi('/admin/settings');
  const [s, setS] = useState(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => { if (data != null) setS(data); }, [data]);

  const save = async () => {
    setLoading(true);
    try { await api('/admin/settings', { method: 'PUT', body: s }); toast.success('Pengaturan berhasil disimpan.'); }
    catch (e) { toast.error(e.message); } finally { setLoading(false); }
  };

  if (error) return <ErrorState error={error} onRetry={retry} />;

  return (
    <Page title={title} subtitle={subtitle}
      actions={<button className="btn-primary btn-sm" disabled={loading || !s} onClick={save}>{loading ? 'Menyimpan...' : 'Simpan Perubahan'}</button>}>
      {!s ? <Spinner /> : <div className="space-y-5">{children(s, setS)}</div>}
    </Page>
  );
}

export function Field({ label, children, col = 1 }) {
  return <div className={`space-y-1.5 ${col === 2 ? 'sm:col-span-2' : 'sm:col-span-1'}`}><label className="label !mb-0">{label}</label>{children}</div>;
}
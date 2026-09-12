import { useEffect, useState } from 'react';
import { api } from '../../api';
import { Page, Card, StatusBadge, Badge, Modal, EmptyState, useToast, Spinner } from '../../components/ui';
import { NotebookPen, Mail } from 'lucide-react';

const STATUSES = ['SUBMITTED', 'UNDER_REVIEW', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'];

export default function AdminAspirasi() {
  const [rows, setRows] = useState(null);
  const [sel, setSel] = useState(null);
  const [form, setForm] = useState({ status: 'SUBMITTED', response: '' });
  const toast = useToast();
  const load = () => api('/admin/aspirations').then(setRows);
  useEffect(() => { load(); }, []);

  if (!rows) return <Spinner />;

  const pending = rows.filter((r) => ['SUBMITTED', 'UNDER_REVIEW', 'IN_PROGRESS'].includes(r.status)).length;

  const open = (a) => { setSel(a); setForm({ status: a.status, response: a.admin_response || '' }); };

  const update = async (status, response) => {
    try {
      await api(`/admin/aspirations/${sel.id}`, { method: 'PUT', body: { status, admin_response: response } });
      toast.success(`Aspirasi berstatus ${status}.`);
      setSel(null);
      load();
    } catch (e) { toast.error(e.message); }
  };

  return (
    <Page title="Aspirasi Murid" subtitle={`Kotak aspirasi siswa — ${pending} dalam proses.`}>
      <div className="flex gap-2 mb-4 flex-wrap">
        {STATUSES.map((s) => <span key={s}><StatusBadge status={s} /></span>)}
      </div>
      <div className="space-y-3">
        {rows.map((a) => (
          <Card key={a.id} className="p-5 card-hover cursor-pointer" onClick={() => open(a)}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="h-10 w-10 shrink-0 rounded-xl bg-indigo-50 text-indigo-600 grid place-items-center"><NotebookPen size={18} /></div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-900">{a.title}</p>
                  <p className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-2">
                    <span>{a.anonymous ? '(Anonim)' : a.student_name}</span>·<span>{a.category}</span>·
                    <span>{new Date(a.created_at + 'Z').toLocaleDateString('id-ID', { dateStyle: 'medium' })}</span>
                    {a.anonymous === 1 && <Badge tone="violet">Identitas disembunyikan</Badge>}
                  </p>
                </div>
              </div>
              <StatusBadge status={a.status} />
            </div>
            {a.admin_response && <p className="mt-3 ml-[52px] rounded-xl bg-emerald-50 border border-emerald-100 p-3 text-sm text-emerald-800 flex items-start gap-2"><Mail size={15} className="mt-0.5 shrink-0" /> {a.admin_response}</p>}
          </Card>
        ))}
        {rows.length === 0 && <EmptyState title="Belum ada aspirasi" />}
      </div>

      {sel && (
        <Modal open onClose={() => setSel(null)} title={`Proses Aspirasi #${sel.id}`} size="lg" footer={null}>
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 grid place-items-center shrink-0"><NotebookPen size={22} /></div>
            <div>
              <p className="text-lg font-extrabold text-slate-900">{sel.title}</p>
              <p className="text-sm text-slate-400 mt-1">{sel.anonymous ? '(Anonim)' : sel.student_name} · {sel.category}</p>
              <p className="text-sm text-slate-500 mt-3 leading-relaxed">{sel.content}</p>
            </div>
          </div>

          <div className="mt-5 grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="label">Ubah Status</label>
              <select className="select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {STATUSES.map((s) => <option key={s} value={s}>{s.replaceAll('_', ' ')}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="label">Balas / Tanggapan Admin</label>
              <textarea className="textarea min-h-20" value={form.response} onChange={(e) => setForm({ ...form, response: e.target.value })} placeholder="Tulis tanggapan untuk murid..." />
            </div>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <button className="btn-outline btn-sm" onClick={() => setSel(null)}>Tutup</button>
            <button className="btn-primary btn-sm" onClick={() => update(form.status, form.response)}>Simpan & Kirim Notifikasi</button>
          </div>
        </Modal>
      )}
    </Page>
  );
}
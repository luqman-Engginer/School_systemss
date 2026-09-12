import { useEffect, useState } from 'react';
import { api } from '../../api';
import { Page, Card, Modal, StatusBadge, EmptyState, useToast, Spinner, Badge } from '../../components/ui';
import { Plus, Pencil, Trash2, Link2, PlaySquare, FileText } from 'lucide-react';

export default function TeacherMaterials() {
  const [rows, setRows] = useState(null);
  const [meta, setMeta] = useState({ subjects: [], classes: [] });
  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState(null);
  const toast = useToast();

  const load = () => Promise.all([api('/teacher/materials'), api('/teacher/my-classes')])
    .then(([m, mc]) => { setRows(m); setMeta({ subjects: mc.subjects, classes: mc.classes }); });

  useEffect(() => { load(); }, []);

  if (!rows) return <Spinner />;

  const save = async (f) => {
    try {
      if (sel) await api(`/teacher/materials/${sel.id}`, { method: 'PUT', body: f });
      else await api('/teacher/materials', { method: 'POST', body: f });
      toast.success('Materi disimpan. Siswa menerima notifikasi.');
      setOpen(false);
      load();
    } catch (e) { toast.error(e.message); }
  };

  const del = async (m) => {
    if (!window.confirm(`Hapus materi "${m.title}"?`)) return;
    try { await api(`/teacher/materials/${m.id}`, { method: 'DELETE' }); toast.success('Materi dihapus.'); load(); } catch (e) { toast.error(e.message); }
  };

  return (
    <Page title="Materi Pembelajaran" subtitle="Buat dan kelola materi untuk kelas Anda."
      actions={<button className="btn-primary btn-sm" onClick={() => { setSel(null); setOpen(true); }}><Plus size={15} /> Buat Materi</button>}>
      <div className="space-y-4">
        {rows.map((m) => (
          <Card key={m.id} className="p-5 card-hover">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-4 min-w-0">
                <div className="h-12 w-12 shrink-0 rounded-2xl bg-gradient-brand grid place-items-center text-white"><FileText size={20} /></div>
                <div>
                  <p className="font-extrabold text-slate-900">{m.title}</p>
                  <p className="text-sm text-slate-500 mt-1">{m.subject_name} · {m.class_name} · Pertemuan {m.meeting}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <StatusBadge status={m.status} />
                    {m.video_url && <Badge tone="rose"><PlaySquare size={11} /> Video</Badge>}
                    {m.file_url && <Badge tone="blue"><FileText size={11} /> File</Badge>}
                    {m.external_link && <Badge tone="violet"><Link2 size={11} /> Link</Badge>}
                    {m.is_extra ? <Badge tone="amber">Materi Tambahan</Badge> : <Badge tone="green">Wajib</Badge>}
                  </div>
                </div>
              </div>
              <div className="flex gap-1.5">
                <button className="btn-ghost btn-sm !px-2" onClick={() => { setSel(m); setOpen(true); }}><Pencil size={16} /></button>
                <button className="btn-danger btn-sm !px-2" onClick={() => del(m)}><Trash2 size={16} /></button>
              </div>
            </div>
            {m.description && <p className="mt-3 text-sm text-slate-500 leading-relaxed line-clamp-2">{m.description}</p>}
          </Card>
        ))}
        {rows.length === 0 && <EmptyState title="Belum ada materi" desc="Buat materi pertama Anda untuk mulai berbagi pembelajaran." />}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={`${sel ? 'Ubah' : 'Buat'} Materi`} footer={null}>
        <MaterialForm meta={meta} sel={sel} onSave={save} onClose={() => setOpen(false)} />
      </Modal>
    </Page>
  );
}

function MaterialForm({ meta, sel, onSave, onClose }) {
  const [f, setF] = useState(() => ({
    title: sel?.title || '',
    description: sel?.description || '',
    subject_id: sel?.subject_id || '',
    class_id: sel?.class_id || meta.classes[0]?.id || '',
    meeting: sel?.meeting || 1,
    is_extra: sel?.is_extra || 0,
    video_url: sel?.video_url || '',
    file_url: sel?.file_url || '',
    external_link: sel?.external_link || '',
    status: sel?.status || 'PUBLISHED'
  }));

  useEffect(() => {
    const cls = meta.classes.find((c) => c.id === +f.class_id);
    if (cls && meta.subjects.some((s) => s.class_id === +f.class_id) && !f.subject_id) {
      const sub = meta.subjects.find((s) => s.class_id === +f.class_id);
      if (sub) setF((x) => ({ ...x, subject_id: sub.id }));
    }
  }, [f.class_id]);

  const subs = meta.subjects.filter((s) => s.class_id === +f.class_id);

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <div className="sm:col-span-2 space-y-1.5"><label className="label">Judul Materi *</label><input className="input" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></div>
      <div className="space-y-1.5"><label className="label">Kelas</label><select className="select" value={f.class_id} onChange={(e) => setF({ ...f, class_id: e.target.value, subject_id: '' })}>{meta.classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
      <div className="space-y-1.5"><label className="label">Mata Pelajaran</label><select className="select" value={f.subject_id} onChange={(e) => setF({ ...f, subject_id: e.target.value })}>
        <option value="">{subs.length ? 'Pilih Mata Pelajaran' : 'Tidak ada mapel di kelas ini'}</option>
        {subs.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>
      {!subs.length && <p className="text-xs text-amber-600">Tidak ada mata pelajaran untuk kelas terpilih. Pilih kelas lain atau buat mapel dahulu.</p>}
      </div>
      <div className="space-y-1.5"><label className="label">Pertemuan Ke-</label><input type="number" className="input" value={f.meeting} onChange={(e) => setF({ ...f, meeting: +e.target.value })} /></div>
      <div className="space-y-1.5"><label className="label">Status</label><select className="select" value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}><option>DRAFT</option><option>PUBLISHED</option></select></div>
      <div className="sm:col-span-2 space-y-1.5"><label className="label">Deskripsi</label><textarea className="textarea" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></div>
      <div className="space-y-1.5"><label className="label">URL Video (YouTube)</label><input className="input" value={f.video_url} onChange={(e) => setF({ ...f, video_url: e.target.value })} /></div>
      <div className="space-y-1.5"><label className="label">URL File / Modul</label><input className="input" value={f.file_url} onChange={(e) => setF({ ...f, file_url: e.target.value })} /></div>
      <div className="space-y-1.5"><label className="label">Tautan Eksternal</label><input className="input" value={f.external_link} onChange={(e) => setF({ ...f, external_link: e.target.value })} /></div>
      <div className="flex items-center gap-3 pt-5">
        <button type="button" onClick={() => setF({ ...f, is_extra: f.is_extra ? 0 : 1 })} className={`w-14 h-8 rounded-full transition-colors relative ${f.is_extra ? 'bg-amber-500' : 'bg-slate-200'}`}><span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${f.is_extra ? 'left-7' : 'left-1'}`} /></button>
        <span className="text-sm text-slate-600">Materi tambahan (extra learning)</span>
      </div>
      <div className="flex justify-end gap-2 sm:col-span-2">
        <button className="btn-outline btn-sm" onClick={onClose}>Batal</button>
        <button className="btn-primary btn-sm" onClick={() => { if (!f.title.trim()) { alert('Judul materi wajib diisi.'); return; } if (!f.subject_id) { alert('Pilih mata pelajaran untuk materi ini.'); return; } onSave(f); }}>Simpan & Publikasikan</button>
      </div>
    </div>
  );
}
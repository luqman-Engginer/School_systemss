import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../api';
import { Page, Card, Modal, StatusBadge, EmptyState, Badge, useToast, ConfirmModal, Spinner } from '../../components/ui';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';

const CONFIGS = {
  berita: {
    name: 'Berita', api: 'news', key: 'title', status: true, thumbnail: 'thumbnail',
    table: ['title', 'category', 'status', 'published_at'],
    fields: [
      { n: 'title', l: 'Judul Berita', t: 'text', req: true },
      { n: 'category', l: 'Kategori', t: 'text', ph: 'cth: Kegiatan, Akademik...' },
      { n: 'thumbnail', l: 'Thumbnail (URL)', t: 'image' },
      { n: 'published_at', l: 'Tanggal Terbit', t: 'date' },
      { n: 'status', l: 'Status', t: 'status' },
      { n: 'content', l: 'Isi Berita', t: 'textarea', col: 2 }
    ]
  },
  event: {
    name: 'Event', api: 'events', key: 'title', status: true, thumbnail: 'poster',
    table: ['title', 'date', 'location', 'status'],
    fields: [
      { n: 'title', l: 'Judul Event', t: 'text', req: true },
      { n: 'poster', l: 'Poster (URL)', t: 'image' },
      { n: 'date', l: 'Tanggal', t: 'date' },
      { n: 'start_time', l: 'Jam Mulai', t: 'time' },
      { n: 'end_time', l: 'Jam Selesai', t: 'time' },
      { n: 'location', l: 'Lokasi', t: 'text' },
      { n: 'status', l: 'Status', t: 'status' },
      { n: 'description', l: 'Deskripsi', t: 'textarea', col: 2 }
    ]
  },
  galeri: {
    name: 'Galeri', api: 'gallery', key: 'title', status: true, thumbnail: 'image',
    table: ['title', 'category', 'status'],
    fields: [
      { n: 'title', l: 'Judul', t: 'text', req: true },
      { n: 'category', l: 'Kategori', t: 'select', opts: ['Kegiatan Sekolah', 'Pembelajaran', 'Event', 'Prestasi', 'Ekstrakurikuler', 'Fasilitas'] },
      { n: 'image', l: 'Gambar (URL)', t: 'image' },
      { n: 'status', l: 'Status', t: 'status' },
      { n: 'description', l: 'Deskripsi', t: 'textarea', col: 2 }
    ]
  },
  prestasi: {
    name: 'Prestasi', api: 'achievements', key: 'title', status: true, thumbnail: 'documentation',
    table: ['title', 'rank', 'year', 'status'],
    fields: [
      { n: 'title', l: 'Judul Prestasi', t: 'text', req: true },
      { n: 'category', l: 'Kategori', t: 'text', ph: 'Akademik, Olahraga, Seni...' },
      { n: 'student_team', l: 'Siswa / Tim', t: 'text' },
      { n: 'competition', l: 'Kompetisi', t: 'text' },
      { n: 'rank', l: 'Peringkat / Penghargaan', t: 'text' },
      { n: 'year', l: 'Tahun', t: 'text' },
      { n: 'documentation', l: 'Dokumentasi (URL)', t: 'image' },
      { n: 'status', l: 'Status', t: 'status' },
      { n: 'description', l: 'Deskripsi', t: 'textarea', col: 2 }
    ]
  },
  faq: {
    name: 'FAQ', api: 'faqs', key: 'question', status: false, extraStatus: 'active',
    table: ['question', 'category', 'active'],
    fields: [
      { n: 'question', l: 'Pertanyaan', t: 'text', req: true },
      { n: 'category', l: 'Kategori', t: 'text', ph: 'Umum, Akademik...' },
      { n: 'sort_order', l: 'Urutan', t: 'number' },
      { n: 'active', l: 'Aktif', t: 'toggle' },
      { n: 'answer', l: 'Jawaban', t: 'textarea', col: 2 }
    ]
  },
  pengumuman: {
    name: 'Pengumuman', api: 'announcements', key: 'title', status: false, extraStatus: 'status',
    table: ['title', 'target_role', 'status'],
    fields: [
      { n: 'title', l: 'Judul', t: 'text', req: true },
      { n: 'target_role', l: 'Target', t: 'select', opts: ['ALL', 'STUDENT', 'TEACHER', 'PARENT'] },
      { n: 'status', l: 'Status', t: 'status' },
      { n: 'content', l: 'Isi Pengumuman', t: 'textarea', col: 2 }
    ]
  },
  peraturan: {
    name: 'Peraturan Sekolah', api: 'school_rules', key: 'title', status: false, extraStatus: 'status',
    table: ['title', 'category', 'status'],
    fields: [
      { n: 'title', l: 'Judul', t: 'text', req: true },
      { n: 'category', l: 'Kategori', t: 'select', opts: ['Akademik', 'Kedisiplinan', 'Ketertiban', 'Kerapian', 'Lingkungan', 'Teknologi', 'Etika'] },
      { n: 'version', l: 'Versi', t: 'text' },
      { n: 'effective_date', l: 'Berlaku Mulai', t: 'date' },
      { n: 'status', l: 'Status', t: 'status' },
      { n: 'content', l: 'Isi Peraturan', t: 'textarea', col: 2 }
    ]
  }
};

const STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];

export default function AdminUmum() {
  const { cms } = useParams();
  const cfg = CONFIGS[cms];
  const toast = useToast();
  const [rows, setRows] = useState(null);
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [del, setDel] = useState(null);

  const load = () => api(`/admin/${cfg.api}`).then(setRows);
  useEffect(() => { if (cfg) load(); }, [cms]);

  if (!cfg) return <Page title="Konten"><EmptyState title="Halaman tidak ditemukan" /></Page>;
  if (!rows) return <Spinner />;

  const items = rows.filter((r) => (r[cfg.key] || '').toLowerCase().includes(q.toLowerCase()));

  const fieldVal = (f, row) => {
    const v = row[f.n];
    if (f.n === 'active') return v ? 'Aktif' : 'Nonaktif';
    if (f.n === 'published_at' || f.n === 'date' || f.n === 'effective_date') return v ? new Date(v + 'T00:00:00').toLocaleDateString('id-ID', { dateStyle: 'medium' }) : '—';
    return v || '—';
  };

  const save = async (data) => {
    try {
      if (editing) await api(`/admin/${cfg.api}/${editing.id}`, { method: 'PUT', body: data });
      else await api(`/admin/${cfg.api}`, { method: 'POST', body: data });
      toast.success('Data berhasil disimpan.');
      setOpen(false);
      load();
    } catch (e) { toast.error(e.message); }
  };

  const remove = async () => {
    try {
      await api(`/admin/${cfg.api}/${del.id}`, { method: 'DELETE' });
      toast.success('Data dihapus.');
      load();
    } catch (e) { toast.error(e.message); }
  };

  return (
    <Page title={`Kelola ${cfg.name}`} subtitle="CMS: kelola konten yang ditampilkan di website publik."
      actions={<button className="btn-primary btn-sm" onClick={() => { setEditing(null); setOpen(true); }}><Plus size={15} /> Tambah {cfg.name}</button>}>
      <Card className="p-5">
        <div className="flex justify-end mb-4">
          <div className="relative"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input className="input !pl-9 !w-64" placeholder="Cari..." value={q} onChange={(e) => setQ(e.target.value)} /></div>
        </div>
        <div className="overflow-x-auto">
          <table className="table-shell">
            <thead><tr><th>#</th>{cfg.table.map((c) => <th key={c}>{c.replaceAll('_', ' ')}</th>)}<th className="text-right">Aksi</th></tr></thead>
            <tbody>
              {items.map((r, i) => (
                <tr key={r.id} className="animate-fade-up">
                  <td className="!text-slate-400">{i + 1}</td>
                  {cfg.table.map((c) => (
                    <td key={c} className="max-w-[220px]">
                      {c === 'status' ? <StatusBadge status={r[c]} /> : c === 'active' ? <Badge tone={r[c] ? 'green' : 'slate'}>{r[c] ? 'Aktif' : 'Nonaktif'}</Badge> : <span className="line-clamp-1">{fieldVal({ n: c }, r)}</span>}
                    </td>
                  ))}
                  <td>
                    <div className="flex justify-end gap-1.5">
                      <button className="btn-ghost btn-sm !px-2" onClick={() => { setEditing(r); setOpen(true); }}><Pencil size={15} /></button>
                      <button className="btn-danger btn-sm !px-2" onClick={() => setDel(r)}><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={cfg.table.length + 2}><EmptyState title="Belum ada data" /></td></tr>}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title={`${editing ? 'Ubah' : 'Tambah'} ${cfg.name}`} size="lg" footer={null}>
        <EditForm cfg={cfg} model={editing} onSubmit={save} submitLabel={editing ? 'Simpan Perubahan' : 'Simpan'} onCancel={() => setOpen(false)} />
      </Modal>

      <ConfirmModal open={!!del} onClose={() => setDel(null)} onConfirm={remove} title="Hapus data" message={`Yakin menghapus "${del?.[cfg.key]}"? Tindakan ini tidak dapat dibatalkan.`} />
    </Page>
  );
}

function EditForm({ cfg, model, onSubmit, onCancel }) {
  const [form, setForm] = useState(() => {
    const init = {};
    for (const f of cfg.fields) init[f.n] = model?.[f.n] ?? (f.t === 'toggle' ? 1 : f.t === 'status' ? 'DRAFT' : '');
    return init;
  });

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {cfg.fields.map((f) => {
        const val = form[f.n];
        if (f.t === 'textarea') return (
          <div key={f.n} className="sm:col-span-2 space-y-1.5">
            <label className="label">{f.l} {f.req && <span className="text-rose-500">*</span>}</label>
            <textarea className="textarea min-h-28" value={val} placeholder={f.ph} onChange={(e) => setForm({ ...form, [f.n]: e.target.value })} />
          </div>
        );
        if (f.t === 'select') return (
          <div key={f.n} className="space-y-1.5">
            <label className="label">{f.l}</label>
            <select className="select" value={val} onChange={(e) => setForm({ ...form, [f.n]: e.target.value })}>{f.opts.map((o) => <option key={o} value={o}>{o.replaceAll('_', ' ')}</option>)}</select>
          </div>
        );
        if (f.t === 'status') return (
          <div key={f.n} className="space-y-1.5">
            <label className="label">{f.l}</label>
            <select className="select" value={val} onChange={(e) => setForm({ ...form, [f.n]: e.target.value })}>{STATUSES.map((o) => <option key={o} value={o}>{o}</option>)}</select>
          </div>
        );
        if (f.t === 'toggle') return (
          <div key={f.n} className="space-y-1.5">
            <label className="label">{f.l}</label>
            <button type="button" onClick={() => setForm({ ...form, [f.n]: val ? 0 : 1 })} className={`w-14 h-8 rounded-full transition-colors relative ${val ? 'bg-emerald-500' : 'bg-slate-200'}`}><span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${val ? 'left-7' : 'left-1'}`} /></button>
          </div>
        );
        if (f.t === 'image') return (
          <div key={f.n} className="sm:col-span-2 space-y-1.5">
            <label className="label">{f.l}</label>
            <div className="flex items-center gap-3">
              {val && <img src={val} alt="" className="h-14 w-20 rounded-lg object-cover border border-slate-200 shake" />}
              <input className="input" value={val} placeholder="https://..." onChange={(e) => setForm({ ...form, [f.n]: e.target.value })} />
            </div>
          </div>
        );
        if (f.t === 'date') return (
          <div key={f.n} className="space-y-1.5"><label className="label">{f.l}</label><input type="date" className="input" value={val} onChange={(e) => setForm({ ...form, [f.n]: e.target.value })} /></div>
        );
        if (f.t === 'time') return (
          <div key={f.n} className="space-y-1.5"><label className="label">{f.l}</label><input type="time" className="input" value={val} onChange={(e) => setForm({ ...form, [f.n]: e.target.value })} /></div>
        );
        if (f.t === 'number') return (
          <div key={f.n} className="space-y-1.5"><label className="label">{f.l}</label><input type="number" className="input" value={val} onChange={(e) => setForm({ ...form, [f.n]: e.target.value })} /></div>
        );
        return (
          <div key={f.n} className="space-y-1.5">
            <label className="label">{f.l} {f.req && <span className="text-rose-500">*</span>}</label>
            <input className="input" value={val} placeholder={f.ph} onChange={(e) => setForm({ ...form, [f.n]: e.target.value })} />
          </div>
        );
      })}
      <div className="sm:col-span-2 flex justify-end gap-2 mt-2">
        <button className="btn-outline btn-sm" onClick={onCancel}>Batal</button>
        <button className="btn-primary btn-sm" onClick={() => onSubmit(form)}>Simpan</button>
      </div>
    </div>
  );
}
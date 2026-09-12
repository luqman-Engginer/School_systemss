import { useEffect, useState } from 'react';
import { api } from '../../api';
import { Page, Card, Modal, Spinner, useToast, Avatar, EmptyState, Badge, Tabs } from '../../components/ui';
import { Plus, Pencil, Trash2, Search, Users } from 'lucide-react';

function UserForm({ model, onClose, onSave }) {
  const [f, setF] = useState(() => ({
    name: model?.name || '',
    email: model?.email || '',
    password: '',
    phone: model?.phone || '',
    photo: model?.photo || '',
    role: model?.role || 'STUDENT',
    position: model?.detail?.position || 'Guru',
    subject: model?.detail?.subject || '',
    bio: model?.detail?.bio || '',
    public_visible: model?.detail?.public_visible ?? 1,
    nis: model?.detail?.nis || '',
    gender: model?.detail?.gender || 'L',
    birth_date: model?.detail?.birth_date || '',
    class_id: model?.detail?.class_id || '',
    occupation: model?.detail?.occupation || ''
  }));
  const [opts, setOpts] = useState({ students: [], classes: [], years: [] });

  useEffect(() => { api('/admin/users/options').then((d) => { setOpts(d); if (!f.class_id) setF((x) => ({ ...x, class_id: d.classes[0]?.id || '' })); }).catch(() => {}); }, []);

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <div className="space-y-1.5"><label className="label">Nama Lengkap *</label><input className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
      <div className="space-y-1.5"><label className="label">Email *</label><input className="input" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
      <div className="space-y-1.5"><label className="label">{model ? 'Password baru (kosongkan jika tetap)' : 'Password *'}</label><input type="password" className="input" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></div>
      <div className="space-y-1.5"><label className="label">Telepon</label><input className="input" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></div>
      {!model && (
        <div className="space-y-1.5"><label className="label">Peran *</label>
          <select className="select" value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })}>
            {['STUDENT', 'TEACHER', 'PARENT', 'ADMIN'].map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>
      )}
      <div className="space-y-1.5"><label className="label">Foto URL</label><input className="input" value={f.photo} onChange={(e) => setF({ ...f, photo: e.target.value })} /></div>

      {f.role === 'STUDENT' && (
        <>
          <div className="space-y-1.5"><label className="label">NIS</label><input className="input" value={f.nis} onChange={(e) => setF({ ...f, nis: e.target.value })} /></div>
          <div className="space-y-1.5"><label className="label">Jenis Kelamin</label><select className="select" value={f.gender} onChange={(e) => setF({ ...f, gender: e.target.value })}><option>L</option><option>P</option></select></div>
          <div className="space-y-1.5"><label className="label">Tanggal Lahir</label><input type="date" className="input" value={f.birth_date} onChange={(e) => setF({ ...f, birth_date: e.target.value })} /></div>
          <div className="space-y-1.5 col-span-2 sm:col-span-1"><label className="label">Kelas</label><select className="select" value={f.class_id} onChange={(e) => setF({ ...f, class_id: e.target.value })}><option value="">—</option>{opts.classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
        </>
      )}
      {f.role === 'TEACHER' && (
        <>
          <div className="space-y-1.5"><label className="label">Jabatan</label><input className="input" value={f.position} onChange={(e) => setF({ ...f, position: e.target.value })} /></div>
          <div className="space-y-1.5"><label className="label">Bidang / Mapel</label><input className="input" value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} /></div>
          <div className="sm:col-span-2 space-y-1.5"><label className="label">Tampil di Halaman Publik</label><button type="button" onClick={() => setF({ ...f, public_visible: f.public_visible ? 0 : 1 })} className={`w-14 h-8 rounded-full transition-colors relative ${f.public_visible ? 'bg-emerald-500' : 'bg-slate-200'}`}><span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${f.public_visible ? 'left-7' : 'left-1'}`} /></button></div>
          <div className="sm:col-span-2 space-y-1.5"><label className="label">Bio</label><textarea className="textarea" value={f.bio} onChange={(e) => setF({ ...f, bio: e.target.value })} /></div>
        </>
      )}
      {f.role === 'PARENT' && (
        <div className="space-y-1.5"><label className="label">Pekerjaan</label><input className="input" value={f.occupation} onChange={(e) => setF({ ...f, occupation: e.target.value })} /></div>
      )}

      <div className="sm:col-span-2 flex justify-end gap-2 mt-2">
        <button className="btn-outline btn-sm" onClick={onClose}>Batal</button>
        <button className="btn-primary btn-sm" onClick={() => onSave(f)}>Simpan</button>
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const [tab, setTab] = useState('STUDENT');
  const [rows, setRows] = useState(null);
  const [sel, setSel] = useState(null);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const toast = useToast();

  const load = () => api(`/admin/users?role=${tab}&q=${encodeURIComponent(q)}`).then(setRows);
  useEffect(() => { setRows(null); load(); }, [tab, q]);

  if (!rows) return <Spinner />;

  const save = async (f) => {
    try {
      const payload = { ...f };
      delete payload.password;
      if (f.password) payload.password = f.password;
      if (sel) await api(`/admin/users/${sel.id}`, { method: 'PUT', body: payload });
      else await api('/admin/users', { method: 'POST', body: payload });
      toast.success('Data pengguna tersimpan.');
      setOpen(false);
      load();
    } catch (e) { toast.error(e.message); }
  };

  const del = async (u) => {
    if (!window.confirm(`Nonaktifkan ${u.name}?`)) return;
    try { await api(`/admin/users/${u.id}`, { method: 'DELETE' }); toast.success('Pengguna dinonaktifkan.'); load(); } catch (e) { toast.error(e.message); }
  };

  const openEdit = async (u) => {
    try {
      const d = await api(`/admin/users/${u.id}`);
      setSel(d);
      setOpen(true);
    } catch (e) { toast.error(e.message); }
  };

  const cols = (() => {
    if (tab === 'STUDENT') return [['nis', 'NIS'], ['class_name', 'Kelas']];
    if (tab === 'TEACHER') return [['position', 'Jabatan'], ['subject', 'Bidang']];
    if (tab === 'PARENT') return [['children_count', 'Anak Terhubung']];
    return [['role', 'Peran']];
  })();

  return (
    <Page title="Manajemen Pengguna" subtitle="Kelola akun Admin, Guru, Siswa, dan Wali Murid."
      actions={<button className="btn-primary btn-sm" onClick={() => { setSel(null); setOpen(true); }}><Plus size={15} /> Tambah Pengguna</button>}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <Tabs tabs={[['STUDENT', 'Siswa'], ['TEACHER', 'Guru'], ['PARENT', 'Wali Murid'], ['ADMIN', 'Admin']].map(([k, l]) => ({ key: k, label: l }))} active={tab} onChange={setTab} />
        <div className="relative"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input className="input !pl-9 !w-60" placeholder="Cari nama..." value={q} onChange={(e) => setQ(e.target.value)} /></div>
      </div>

      <Card className="p-5">
        <div className="overflow-x-auto">
          <table className="table-shell">
            <thead><tr><th>Pengguna</th>{cols.map(([k, l]) => <th key={k}>{l}</th>)}<th>Status</th><th className="text-right">Aksi</th></tr></thead>
            <tbody>
              {rows.map((u, i) => (
                <tr key={u.id} className="animate-fade-up">
                  <td>
                    <div className="flex items-center gap-3">
                      <Avatar src={u.photo} name={u.name} size={38} />
                      <div><p className="font-bold text-slate-800 text-sm">{u.name}</p><p className="text-xs text-slate-400">{u.email}</p></div>
                    </div>
                  </td>
                  {cols.map(([k, l]) => <td key={k} className="text-xs">{u[k] || '—'}</td>)}
                  <td><Badge tone={u.status === 'ACTIVE' ? 'green' : 'slate'}>{u.status}</Badge></td>
                  <td>
                    <div className="flex justify-end gap-1.5">
                      <button className="btn-ghost btn-sm !px-2" onClick={() => openEdit(u)}><Pencil size={15} /></button>
                      {u.status === 'ACTIVE' && <button className="btn-danger btn-sm !px-2" onClick={() => del(u)}><Trash2 size={15} /></button>}
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={6}><EmptyState icon={Users} title="Belum ada pengguna" /></td></tr>}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title={`${sel ? 'Ubah' : 'Tambah'} Pengguna`} footer={null}>
        <UserForm model={sel} onClose={() => setOpen(false)} onSave={save} />
      </Modal>
    </Page>
  );
}
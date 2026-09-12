import { useEffect, useState } from 'react';
import { api } from '../../api';
import { Page, Card, Modal, Spinner, useToast, Avatar, EmptyState, Badge } from '../../components/ui';
import { HeartHandshake, Pencil } from 'lucide-react';

export default function AdminWali() {
  const [rows, setRows] = useState(null);
  const [students, setStudents] = useState([]);
  const [sel, setSel] = useState(null);
  const [links, setLinks] = useState([]);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const load = () => api('/admin/users?role=PARENT').then(setRows);
  useEffect(() => { load(); api('/admin/users/options').then((d) => setStudents(d.students)).catch(() => {}); }, []);

  if (!rows) return <Spinner />;

  const open = async (p) => {
    try {
      const d = await api(`/admin/users/${p.id}`);
      setSel(d);
      setLinks(d.detail?.children || []);
    } catch (e) { toast.error(e.message); }
  };

  const setChild = async (student, relation) => {
    const next = links.some((c) => c.student_id === student.id)
      ? links.map((c) => (c.student_id === student.id ? { ...c, relation } : c))
      : [...links, { student_id: student.id, relation }];
    await persist(next);
  };

  const removeChild = async (studentId) => {
    await persist(links.filter((c) => c.student_id !== studentId));
  };

  const persist = async (next) => {
    setLinks(next);
    setSaving(true);
    try {
      await api(`/admin/users/${sel.id}`, { method: 'PUT', body: { children: next } });
      toast.success('Relasi wali–siswa diperbarui.');
      load();
    } catch (e) {
      toast.error(e.message);
      setLinks(sel.detail?.children || []);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Page title="Relasi Wali & Siswa" subtitle="Hubungkan wali murid dengan siswa yang berada di bawah pengawasannya.">
      <Card className="p-5">
        <div className="overflow-x-auto">
          <table className="table-shell">
            <thead><tr><th>Wali Murid</th><th>Anak Terhubung</th><th>Status</th><th className="text-right">Aksi</th></tr></thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className="animate-fade-up">
                  <td><div className="flex items-center gap-3"><Avatar src={p.photo} name={p.name} size={38} /><div><p className="font-bold text-sm">{p.name}</p><p className="text-xs text-slate-400">{p.email}</p></div></div></td>
                  <td>
                    {p.children_count > 0
                      ? <span className="inline-flex items-center gap-1 text-sm"><HeartHandshake size={14} className="text-rose-400" /> {p.children_count} anak</span>
                      : <Badge tone="amber">Belum ada relasi</Badge>}
                  </td>
                  <td><Badge tone={p.status === 'ACTIVE' ? 'green' : 'slate'}>{p.status}</Badge></td>
                  <td><div className="flex justify-end"><button className="btn-ghost btn-sm !px-2" onClick={() => open(p)}><Pencil size={15} /></button></div></td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={4}><EmptyState title="Belum ada wali murid" /></td></tr>}
            </tbody>
          </table>
        </div>
      </Card>

      {sel && (
        <Modal open onClose={() => setSel(null)} title={`Kelola relasi: ${sel.name}`} footer={null}>
          <p className="text-sm text-slate-500 mb-4">Pilih siswa yang dihubungkan dengan wali murid ini. Satu wali dapat dihubungkan ke lebih dari satu siswa.</p>
          <div className="space-y-2 max-h-[45vh] overflow-y-auto pr-1">
            {students.map((s) => (
              <ChildRow key={s.id} student={s} checked={links.some((c) => c.student_id === s.id)}
                relation={links.find((c) => c.student_id === s.id)?.relation || 'WALI'}
                disabled={saving}
                onToggle={(on, rel) => (on ? setChild(s, rel || 'WALI') : removeChild(s.id))}
                onRelation={(rel) => setChild(s, rel)} />
            ))}
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <button className="btn-outline btn-sm" onClick={() => setSel(null)}>Tutup</button>
            <button className="btn-primary btn-sm" disabled={saving} onClick={() => setSel(null)}>{saving ? 'Menyimpan...' : 'Selesai'}</button>
          </div>
        </Modal>
      )}
    </Page>
  );
}

function ChildRow({ student, checked, relation, disabled, onToggle, onRelation }) {
  return (
    <div className={`flex items-center justify-between gap-3 rounded-xl border p-3.5 transition-colors ${checked ? 'border-indigo-200 bg-indigo-50/50' : 'border-slate-100'}`}>
      <div className="flex items-center gap-3 min-w-0">
        <Avatar src={student.photo} name={student.name} size={36} />
        <div><p className="text-sm font-bold text-slate-800">{student.name}</p><p className="text-xs text-slate-400">{student.email}</p></div>
      </div>
      <div className="flex items-center gap-2">
        {checked && (
          <select className="select !py-1.5 !w-24 !text-xs" value={relation} disabled={disabled} onChange={(e) => onRelation(e.target.value)}>
            <option>AYAH</option><option>IBU</option><option>WALI</option>
          </select>
        )}
        <button disabled={disabled} onClick={() => onToggle(!checked, relation)} className={`btn btn-sm ${checked ? 'border border-indigo-300 text-indigo-600 bg-white' : 'btn-primary !bg-slate-900 !bg-none'}`}>
          {checked ? 'Terhubung' : 'Hubungkan'}
        </button>
      </div>
    </div>
  );
}
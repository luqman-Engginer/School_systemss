import { useEffect, useState } from 'react';
import { api } from '../../api';
import { Page, Card, Spinner, EmptyState, Modal, useToast, Avatar, Badge, StatusBadge } from '../../components/ui';
import { ShieldAlert, Plus } from 'lucide-react';
import dayjs from 'dayjs';

const CATEGORIES = ['Kedisiplinan', 'Kerajinan', 'Kehadiran', 'Aturan', 'Lainnya'];

export default function TeacherDiscipline() {
  const [myClasses, setMyClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [rows, setRows] = useState(null);
  const [open, setOpen] = useState(false);
  const toast = useToast();
  const [f, setF] = useState({ student_id: '', category: 'Kedisiplinan', point: 5, description: '', date: dayjs().format('YYYY-MM-DD'), notes: '' });

  const loadRecs = () => api('/teacher/discipline').then(setRows).catch(() => {});

  useEffect(() => {
    api('/teacher/my-classes').then((mc) => { setMyClasses(mc.classes); if (mc.classes.length) setSelectedClass(mc.classes[0].id); }).catch(() => {});
    loadRecs();
  }, []);

  useEffect(() => {
    if (selectedClass) api(`/teacher/students?class_id=${selectedClass}`).then(setStudents).catch(() => {});
  }, [selectedClass]);

  if (!rows) return <Spinner />;

  const submit = async () => {
    try {
      if (!f.student_id) return toast.error('Pilih siswa terlebih dahulu.');
      await api('/teacher/discipline', { method: 'POST', body: { ...f, date: f.date || null } });
      toast.success('Catatan kedisiplinan dibuat. Siswa telah dinotifikasi.');
      setOpen(false);
      setF({ student_id: '', category: 'Kedisiplinan', point: 5, description: '', date: dayjs().format('YYYY-MM-DD'), notes: '' });
      loadRecs();
    } catch (e) { toast.error(e.message); }
  };

  return (
    <Page title="Catatan Kedisiplinan" subtitle="Buat dan pantau catatan kedisiplinan siswa yang Anda input."
      actions={<button className="btn-primary btn-sm" onClick={() => setOpen(true)}><Plus size={15} /> Tambah Catatan</button>}>
      <div className="space-y-3">
        {rows.map((r) => (
          <Card key={r.id} className="p-5">
            <div className="flex flex-wrap items-start gap-4">
              <div className="h-11 w-11 shrink-0 rounded-2xl grid place-items-center text-white" style={{ background: r.point > 0 ? 'linear-gradient(135deg,#f43f5e,#fb7185)' : 'linear-gradient(135deg,#10b981,#34d399)' }}>
                <ShieldAlert size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-extrabold text-slate-900">{r.student_name ?? `Siswa #${r.student_id}`}</p>
                  <Badge tone={r.point > 0 ? 'rose' : 'green'}>{r.point > 0 ? `-${r.point} poin` : `+${Math.abs(r.point)} poin`}</Badge>
                  <StatusBadge status={r.status} />
                </div>
                <p className="text-sm text-slate-500 mt-1">{r.category} · {r.description}</p>
                <p className="text-[11px] text-slate-400 mt-1">{dayjs(r.date).format('D MMM YYYY')}</p>
              </div>
            </div>
          </Card>
        ))}
        {rows.length === 0 && <EmptyState title="Belum ada catatan kedisiplinan" />}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Tambah Catatan Kedisiplinan" footer={null}>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2 space-y-1.5">
            <label className="label">Kelas</label>
            <select className="select" value={selectedClass || ''} onChange={(e) => setSelectedClass(+e.target.value)}>
              {myClasses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2 space-y-1.5"><label className="label">Siswa</label><select className="select" value={f.student_id} onChange={(e) => setF({ ...f, student_id: e.target.value })}><option value="">Pilih siswa...</option>{students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
          <div className="space-y-1.5"><label className="label">Kategori</label><select className="select" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></div>
          <div className="space-y-1.5"><label className="label">Poin</label><input type="number" className="input" value={f.point} onChange={(e) => setF({ ...f, point: +e.target.value })} /></div>
          <div className="sm:col-span-2 space-y-1.5"><label className="label">Deskripsi</label><textarea className="textarea" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></div>
          <div className="sm:col-span-2 flex justify-end gap-2">
            <button className="btn-outline btn-sm" onClick={() => setOpen(false)}>Batal</button>
            <button className="btn-primary btn-sm" onClick={submit}>Simpan</button>
          </div>
        </div>
      </Modal>
    </Page>
  );
}
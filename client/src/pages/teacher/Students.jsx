import { useEffect, useState } from 'react';
import { api } from '../../api';
import { Page, Card, Spinner, EmptyState, Avatar, Badge, StatusBadge, useToast, Modal } from '../../components/ui';
import { MessageSquare, ShieldAlert } from 'lucide-react';
import dayjs from 'dayjs';

export default function TeacherStudents() {
  const [d, setD] = useState(null);
  const [selected, setSelected] = useState(null);
  const [students, setStudents] = useState([]);
  const [subject, setSubject] = useState('');
  const [history, setHistory] = useState(null);
  const [fbOpen, setFbOpen] = useState(false);
  const [fbText, setFbText] = useState('');
  const [disOpen, setDisOpen] = useState(false);
  const [disForm, setDisForm] = useState({ category: 'Kedisiplinan', point: 5, description: '', date: dayjs().format('YYYY-MM-DD'), notes: '' });
  const toast = useToast();

  useEffect(() => {
    api('/teacher/my-classes').then((mc) => {
      setD(mc);
      if (mc.classes.length) setSelected(mc.classes[0].id);
      if (mc.subjects.length) setSubject(mc.subjects[0].id);
    }).catch(() => {});
  }, []);
  useEffect(() => {
    if (selected) api(`/teacher/students?class_id=${selected}`).then(setStudents).catch(() => {});
    else setStudents([]);
  }, [selected]);

  if (!d) return <Spinner />;

  const sendFeedback = async (st) => {
    try {
      await api('/teacher/feedback', { method: 'POST', body: { student_id: st.id, subject_id: subject || null, content: fbText } });
      toast.success('Feedback terkirim ke siswa.');
      setFbOpen(false); setFbText('');
    } catch (e) { toast.error(e.message); }
  };

  const addDiscipline = async (st) => {
    try {
      await api('/teacher/discipline', { method: 'POST', body: { ...disForm, student_id: st.id, date: disForm.date || null } });
      toast.success('Catatan kedisiplinan ditambahkan.');
      setDisOpen(false);
      setDisForm({ category: 'Kedisiplinan', point: 5, description: '', date: dayjs().format('YYYY-MM-DD'), notes: '' });
    } catch (e) { toast.error(e.message); }
  };

  const loadHistory = async (st) => {
    const h = await api(`/teacher/attendance/history/${st.id}`).catch(() => []);
    setHistory({ st, rows: h });
  };

  return (
    <Page title="Siswa & Interaksi" subtitle="Lihat siswa, kirim feedback, catat kedisiplinan, dan pantau kehadiran.">
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <select className="select" value={selected || ''} onChange={(e) => setSelected(+e.target.value)}>
          <option value="">Semua kelas</option>
          {d.classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <div className="ml-auto flex gap-2">
          <select className="select !w-auto" value={subject} onChange={(e) => setSubject(e.target.value)}>
            {d.subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-2.5">
        {students.map((st) => (
          <Card key={st.id} className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <Avatar src={st.photo} name={st.name} size={42} />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 truncate">{st.name}</p>
                <p className="text-xs text-slate-400">{st.nis || '—'} · {st.gender || '—'}</p>
              </div>
              <div className="flex gap-1.5">
                <button className="btn-outline btn-sm" onClick={() => loadHistory(st)}>Riwayat Hadir</button>
                <button className="btn-outline btn-sm" onClick={() => setFbOpen({ st })}><MessageSquare size={14} /> Feedback</button>
                <button className="btn-danger btn-sm" onClick={() => setDisOpen({ st })}><ShieldAlert size={14} /> Disiplin</button>
              </div>
            </div>
          </Card>
        ))}
        {students.length === 0 && <EmptyState title="Tidak ada siswa" />}
      </div>

      <Modal open={!!fbOpen} onClose={() => setFbOpen(false)} title={`Kirim Feedback — ${fbOpen?.st?.name || ''}`} footer={null}>
        <textarea className="textarea" rows={4} placeholder="Tulis feedback untuk siswa ini..." value={fbText} onChange={(e) => setFbText(e.target.value)} />
        <div className="mt-4 flex justify-end gap-2">
          <button className="btn-outline btn-sm" onClick={() => setFbOpen(false)}>Batal</button>
          <button className="btn-primary btn-sm" onClick={() => sendFeedback(fbOpen.st)}>Kirim</button>
        </div>
      </Modal>

      <Modal open={!!disOpen} onClose={() => setDisOpen(false)} title={`Catatan Kedisiplinan — ${disOpen?.st?.name || ''}`} footer={null}>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5"><label className="label">Kategori</label><select className="select" value={disForm.category} onChange={(e) => setDisForm({ ...disForm, category: e.target.value })}><option>Kedisiplinan</option><option>Kerajinan</option><option>Kehadiran</option><option>Aturan</option><option>Lainnya</option></select></div>
          <div className="space-y-1.5"><label className="label">Poin</label><input type="number" className="input" value={disForm.point} onChange={(e) => setDisForm({ ...disForm, point: +e.target.value })} /></div>
          <div className="sm:col-span-2 space-y-1.5"><label className="label">Deskripsi</label><textarea className="textarea" value={disForm.description} onChange={(e) => setDisForm({ ...disForm, description: e.target.value })} /></div>
          <div className="sm:col-span-2 flex justify-end gap-2">
            <button className="btn-outline btn-sm" onClick={() => setDisOpen(false)}>Batal</button>
            <button className="btn-primary btn-sm" onClick={() => addDiscipline(disOpen.st)}>Simpan</button>
          </div>
        </div>
      </Modal>

      <Modal open={!!history} onClose={() => setHistory(null)} title={`Kehadiran — ${history?.st?.name || ''}`} size="xl" footer={null}>
        {history && (
          <div className="grid grid-cols-3 gap-3 mb-4">
            {['PRESENT', 'LATE', 'SICK', 'EXCUSED', 'ABSENT'].map((s) => (
              <div key={s} className="rounded-xl bg-slate-50 p-3 text-center">
                <p className="text-lg font-extrabold text-slate-800">{history.rows.filter((r) => r.status === s).length}</p>
                <p className="text-[10px] font-semibold text-slate-400">{s.replaceAll('_', ' ')}</p>
              </div>
            ))}
          </div>
        )}
        <div className="space-y-1.5 max-h-[40vh] overflow-y-auto pr-1">
          {history?.rows.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-3.5 py-2.5">
              <span className="text-sm text-slate-600">{dayjs(r.date).format('D MMM YYYY')}</span>
              <StatusBadge status={r.status} />
            </div>
          ))}
        </div>
      </Modal>
    </Page>
  );
}
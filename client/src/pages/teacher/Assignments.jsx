import { useEffect, useState } from 'react';
import { api } from '../../api';
import { Page, Card, Modal, StatusBadge, EmptyState, useToast, Spinner, Badge, Avatar, ProgressBar } from '../../components/ui';
import { Plus, Pencil, Trash2, ClipboardList, Star } from 'lucide-react';
import dayjs from 'dayjs';

export default function TeacherAssignments() {
  const [rows, setRows] = useState(null);
  const [meta, setMeta] = useState({ subjects: [], classes: [] });
  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState(null);
  const [gradeFor, setGradeFor] = useState(null);
  const [gradeData, setGradeData] = useState(null);
  const toast = useToast();

  const load = () => Promise.all([api('/teacher/assignments'), api('/teacher/my-classes')])
    .then(([a, mc]) => { setRows(a); setMeta({ subjects: mc.subjects, classes: mc.classes }); });

  useEffect(() => { load(); }, []);
  if (!rows) return <Spinner />;

  const save = async (f) => {
    try {
      if (sel) await api(`/teacher/assignments/${sel.id}`, { method: 'PUT', body: f });
      else await api('/teacher/assignments', { method: 'POST', body: f });
      toast.success('Tugas disimpan. Siswa menerima notifikasi.');
      setOpen(false);
      load();
    } catch (e) { toast.error(e.message); }
  };

  const del = async (a) => {
    if (!window.confirm(`Hapus tugas "${a.title}"?`)) return;
    try { await api(`/teacher/assignments/${a.id}`, { method: 'DELETE' }); toast.success('Tugas dihapus.'); load(); } catch (e) { toast.error(e.message); }
  };

  const openGrading = async (a) => {
    const d = await api(`/teacher/assignments/${a.id}/submissions`);
    setGradeFor(d.assignment);
    setGradeData(d);
  };

  return (
    <Page title="Tugas & Penilaian" subtitle="Buat tugas, pantau pengumpulan, dan beri nilai."
      actions={<button className="btn-primary btn-sm" onClick={() => { setSel(null); setOpen(true); }}><Plus size={15} /> Buat Tugas</button>}>
      <div className="space-y-4">
        {rows.map((a) => (
          <Card key={a.id} className="p-5 card-hover">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-4 min-w-0">
                <div className="h-12 w-12 shrink-0 rounded-2xl bg-gradient-brand grid place-items-center text-white"><ClipboardList size={20} /></div>
                <div>
                  <p className="font-extrabold text-slate-900">{a.title}</p>
                  <p className="text-sm text-slate-500 mt-1">{a.subject_name} · {a.class_name}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <StatusBadge status={a.status} />
                    <Badge tone={dayjs(a.deadline).isBefore(dayjs()) ? 'rose' : 'amber'}>Deadline: {dayjs(a.deadline).format('D MMM YYYY')}</Badge>
                    <Badge tone="slate">Skor maks: {a.max_score}</Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button className="btn-primary btn-sm" onClick={() => openGrading(a)}>Periksa</button>
                <button className="btn-ghost btn-sm !px-2" onClick={() => { setSel(a); setOpen(true); }}><Pencil size={16} /></button>
                <button className="btn-danger btn-sm !px-2" onClick={() => del(a)}><Trash2 size={16} /></button>
              </div>
            </div>
            {a.description && <p className="mt-3 text-sm text-slate-500 line-clamp-2">{a.description}</p>}
          </Card>
        ))}
        {rows.length === 0 && <EmptyState title="Belum ada tugas" />}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={`${sel ? 'Ubah' : 'Buat'} Tugas`} footer={null}>
        <AssignmentForm meta={meta} sel={sel} onSave={save} onClose={() => setOpen(false)} />
      </Modal>

      <Modal open={!!gradeFor} onClose={() => setGradeFor(null)} title={`Periksa: ${gradeFor?.title}`} size="xl" footer={null}>
        {gradeData && <GradingView data={gradeData} onClose={() => setGradeFor(null)} onReload={load} toast={toast} />}
      </Modal>
    </Page>
  );
}

function AssignmentForm({ meta, sel, onSave, onClose }) {
  const [f, setF] = useState(() => ({
    title: sel?.title || '',
    description: sel?.description || '',
    instructions: sel?.instructions || '',
    attachment: sel?.attachment || '',
    subject_id: sel?.subject_id || '',
    class_id: sel?.class_id || meta.classes[0]?.id || '',
    deadline: sel?.deadline || dayjs().add(7, 'day').format('YYYY-MM-DD'),
    max_score: sel?.max_score || 100,
    status: sel?.status || 'PUBLISHED'
  }));
  const subs = meta.subjects.filter((s) => s.class_id === +f.class_id);

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <div className="sm:col-span-2 space-y-1.5"><label className="label">Judul Tugas *</label><input className="input" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></div>
      <div className="space-y-1.5"><label className="label">Kelas</label><select className="select" value={f.class_id} onChange={(e) => setF({ ...f, class_id: e.target.value, subject_id: '' })}>{meta.classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
      <div className="space-y-1.5"><label className="label">Mata Pelajaran</label><select className="select" value={f.subject_id} onChange={(e) => setF({ ...f, subject_id: e.target.value })}>{subs.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
      <div className="space-y-1.5"><label className="label">Deadline</label><input type="date" className="input" value={f.deadline} onChange={(e) => setF({ ...f, deadline: e.target.value })} /></div>
      <div className="space-y-1.5"><label className="label">Skor Maksimal</label><input type="number" className="input" value={f.max_score} onChange={(e) => setF({ ...f, max_score: +e.target.value })} /></div>
      <div className="sm:col-span-2 space-y-1.5"><label className="label">Deskripsi</label><textarea className="textarea" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></div>
      <div className="sm:col-span-2 space-y-1.5"><label className="label">Instruksi</label><textarea className="textarea" value={f.instructions} onChange={(e) => setF({ ...f, instructions: e.target.value })} /></div>
      <div className="flex justify-end gap-2 sm:col-span-2">
        <button className="btn-outline btn-sm" onClick={onClose}>Batal</button>
        <button className="btn-primary btn-sm" onClick={() => onSave(f)}>Simpan & Publikasikan</button>
      </div>
    </div>
  );
}

function GradingView({ data, onClose, onReload, toast }) {
  const { assignment, submissions, summary } = data;
  const [grade, setGrade] = useState({});
  const [feedback, setFeedback] = useState({});
  const grading = submissions.filter((s) => s.grade === null && ['SUBMITTED', 'LATE'].includes(s.status));

  const saveGrade = async (sub) => {
    try {
      await api(`/teacher/submissions/${sub.id}/grade`, { method: 'POST', body: { grade: grade[sub.id] !== undefined ? grade[sub.id] : null, feedback: feedback[sub.id] || '' } });
      toast.success(`Nilai ${sub.student_name} disimpan.`);
      onReload();
    } catch (e) { toast.error(e.message); }
  };

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="rounded-xl bg-indigo-50 p-3 text-center"><p className="text-xl font-extrabold text-indigo-700">{summary.total}</p><p className="text-[11px] font-semibold text-indigo-400">Siswa</p></div>
        <div className="rounded-xl bg-emerald-50 p-3 text-center"><p className="text-xl font-extrabold text-emerald-700">{summary.submitted}</p><p className="text-[11px] font-semibold text-emerald-400">Mengumpulkan</p></div>
        <div className="rounded-xl bg-sky-50 p-3 text-center"><p className="text-xl font-extrabold text-sky-700">{summary.graded}</p><p className="text-[11px] font-semibold text-sky-400">Dinilai</p></div>
      </div>

      <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
        {submissions.map((s) => (
          <div key={s.id} className={`rounded-2xl border p-4 ${['SUBMITTED', 'LATE'].includes(s.status) && s.grade === null ? 'border-indigo-200 bg-indigo-50/40' : 'border-slate-100'}`}>
            <div className="flex items-center gap-3">
              <Avatar src={s.photo} name={s.student_name} size={36} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800">{s.student_name}</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  <StatusBadge status={s.status} />
                  {s.grade !== null && <Badge tone="green"><Star size={10} /> {s.grade}/{s.max_score}</Badge>}
                  {s.submitted_at && <span className="text-[11px] text-slate-400">{dayjs(s.submitted_at).isValid() ? dayjs(s.submitted_at).format('D MMM HH:mm') : '—'}</span>}
                </div>
              </div>
              {s.grade === null && ['SUBMITTED', 'LATE'].includes(s.status) && <Badge tone="amber">Menunggu</Badge>}
            </div>
            {s.content && <p className="mt-3 text-xs text-slate-500 bg-white rounded-lg p-3 border border-slate-100">{s.content}</p>}
            {s.grade === null && ['SUBMITTED', 'LATE'].includes(s.status) ? (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <input type="number" className="input !w-24" min={0} max={s.max_score} placeholder="Nilai" value={grade[s.id] ?? ''} onChange={(e) => setGrade({ ...grade, [s.id]: e.target.value })} />
                <input className="input !flex-1 min-w-40" placeholder="Feedback untuk siswa..." value={feedback[s.id] ?? ''} onChange={(e) => setFeedback({ ...feedback, [s.id]: e.target.value })} />
                <button className="btn-primary btn-sm" onClick={() => saveGrade(s)}>Simpan Nilai</button>
              </div>
            ) : s.grade !== null && (
              <div className="mt-2 text-xs text-slate-500">{s.feedback && <span className="italic">"{s.feedback}"</span>}</div>
            )}
          </div>
        ))}
        {grading.length === 0 && submissions.every((s) => s.grade !== null) && <EmptyState title="Semua sudah dinilai" />}
      </div>
    </div>
  );
}
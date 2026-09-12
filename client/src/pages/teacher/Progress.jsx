import { useEffect, useState } from 'react';
import { api } from '../../api';
import { Page, Card, Spinner, EmptyState, ProgressBar, Avatar, Badge } from '../../components/ui';

export default function TeacherProgress() {
  const [classes, setClasses] = useState([]);
  const [selected, setSelected] = useState(null);
  const [rows, setRows] = useState(null);

  useEffect(() => {
    api('/teacher/my-classes').then((d) => {
      setClasses(d.classes);
      if (d.classes.length) { setSelected(d.classes[0].id); }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (selected) api(`/teacher/progress?class_id=${selected}`).then(setRows).catch(() => {});
    else setRows(null);
  }, [selected]);

  return (
    <Page title="Progress Belajar Siswa" subtitle="Pantau tuntasnya materi pembelajaran per siswa di kelas Anda.">
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <label className="text-sm font-semibold text-slate-600">Pilih Kelas:</label>
        <select className="select" value={selected || ''} onChange={(e) => setSelected(+e.target.value)}>
          {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {!rows ? <Spinner /> : (
        <div className="space-y-3">
          {rows.map((st) => (
            <StudentProgressCard key={st.student_id} student={st} />
          ))}
          {rows.length === 0 && <EmptyState title="Belum ada siswa di kelas ini" />}
        </div>
      )}
    </Page>
  );
}

export function StudentProgressCard({ student }) {
  const [collapsed, setCollapsed] = useState(true);
  return (
    <Card className="p-5">
      <div className="flex items-center gap-4">
        <Avatar src={student.photo} name={student.name} size={44} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-extrabold text-slate-900 truncate">{student.name}</p>
            <span className="text-sm font-extrabold text-indigo-600">{student.overall}%</span>
          </div>
          <ProgressBar value={student.overall} className="!h-2 mt-2" tone={student.overall >= 75 ? 'emerald' : student.overall >= 50 ? 'amber' : 'rose'} />
        </div>
        <button onClick={() => setCollapsed(!collapsed)} className="btn-ghost btn-sm">{collapsed ? 'Detail' : 'Tutup'}</button>
      </div>
      {!collapsed && (
        <div className="mt-4 grid sm:grid-cols-2 gap-3">
          {student.perSubject.map((p) => (
            <div key={p.subject} className="rounded-xl border border-slate-100 p-3.5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold text-slate-700">{p.subject}</p>
                <Badge tone={p.pct >= 75 ? 'green' : p.pct >= 50 ? 'amber' : 'rose'}>{p.done}/{p.total}</Badge>
              </div>
              <ProgressBar value={p.pct} className="!h-1.5" />
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
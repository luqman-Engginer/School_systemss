import { useState } from 'react';
import { Page, Card, Spinner, EmptyState, Badge, ProgressBar, Avatar, ErrorState } from '../../components/ui';
import { useApi } from '../../hooks/useApi';
import { Users, BookOpen } from 'lucide-react';

export default function TeacherClasses() {
  const { data: d, error, retry } = useApi('/teacher/my-classes');
  const [selClass, setSelClass] = useState(null);
  const { data: studentsData, error: studentsError, retry: retryStudents } = useApi(`/teacher/students?class_id=${selClass}`, { enabled: !!selClass });
  const students = studentsData ?? [];
  if (error) return <ErrorState error={error} onRetry={retry} />;
  if (studentsError) return <ErrorState error={studentsError} onRetry={retryStudents} />;
  if (!d) return <Spinner />;

  return (
    <Page title="Kelas Saya" subtitle="Kelas yang Anda ampu atau walikan.">
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <h3 className="font-extrabold text-slate-900 mb-4 flex items-center gap-2"><Users size={16} className="text-indigo-500" /> Kelas</h3>
          <div className="space-y-2">
            {d.classes.map((c) => (
              <button key={c.id} onClick={() => setSelClass(c.id)} className={`w-full rounded-xl border p-4 text-left transition-all ${selClass === c.id ? 'border-indigo-300 bg-indigo-50/50 shadow-sm' : 'border-slate-100 hover:border-indigo-200'}`}>
                <div className="flex items-center justify-between">
                  <div><p className="font-bold text-slate-900">{c.name}</p><p className="text-xs text-slate-400 mt-0.5">Wali kelas: {c.homeroom || '—'}</p></div>
                  <div className="text-right"><Badge tone="indigo">{c.student_count} siswa</Badge></div>
                </div>
              </button>
            ))}
            {d.classes.length === 0 && <EmptyState title="Belum ada kelas" />}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-extrabold text-slate-900 mb-1 flex items-center gap-2"><BookOpen size={16} className="text-sky-500" /> Mata Pelajaran Diampu</h3>
          <p className="text-xs text-slate-400 mb-4">{d.subjects.length} mapel aktif</p>
          <div className="grid grid-cols-2 gap-2">
            {d.subjects.map((s) => (
              <div key={s.id} className="rounded-xl border border-slate-100 p-3.5">
                <p className="text-sm font-bold text-slate-800">{s.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{s.class_name} · {s.code}</p>
              </div>
            ))}
          </div>
          {selClass && (
            <div className="mt-6">
              <h4 className="text-sm font-extrabold text-slate-900 mb-3">Daftar Siswa ({students.length})</h4>
              <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                {students.map((st) => (
                  <div key={st.id} className="flex items-center gap-3 rounded-lg border border-slate-100 p-2.5">
                    <Avatar src={st.photo} name={st.name} size={32} />
                    <p className="text-sm font-bold text-slate-700 flex-1 truncate">{st.name}</p>
                    <Badge tone="slate">{st.nis || '—'}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    </Page>
  );
}
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../api';
import { Page, Card, Spinner, ProgressBar, Badge, EmptyState, StatusBadge } from '../../components/ui';
import { BookOpen, CalendarCheck2, MessageSquare, ShieldAlert } from 'lucide-react';
import dayjs from 'dayjs';

export default function ParentAcademic() {
  const { childId } = useParams();
  const [d, setD] = useState(null);
  const [overview, setOverview] = useState(null);

  useEffect(() => {
    Promise.all([api(`/parent/child/${childId}/progress`), api(`/parent/child/${childId}/overview`), api(`/parent/child/${childId}/grades`)])
      .then(([p, o, g]) => { setD({ subjects: p, grades: g }); setOverview(o); })
      .catch(() => {});
  }, [childId]);

  if (!d || !overview) return <Spinner />;

  const lastGrades = d.grades.slice(0, 5);

  return (
    <Page title="Akademik Anak" subtitle="Rekap pencapaian akademik anak Anda.">
      <Card className="p-6 mb-6 bg-gradient-brand text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            {overview.classInfo && <p className="text-sm font-semibold text-white/80">{overview.classInfo.name} · {overview.classInfo.grade} · Wali: {overview.classInfo.homeroom}</p>}
            <p className="mt-1 text-3xl font-extrabold">Progress {overview.progressPct}%</p>
          </div>
          <div className="flex gap-3">
            <div className="rounded-xl bg-white/10 px-4 py-3 text-center"><p className="text-xl font-extrabold">{overview.done}/{overview.total}</p><p className="text-[10px] font-semibold text-white/70">MATERI</p></div>
            <div className="rounded-xl bg-white/10 px-4 py-3 text-center"><p className="text-xl font-extrabold">{overview.discipline}</p><p className="text-[10px] font-semibold text-white/70">CATATAN DISIPLIN</p></div>
          </div>
        </div>
        <ProgressBar value={overview.progressPct} tone="emerald" className="!bg-white/25 mt-4" />
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-extrabold text-slate-900 mb-4">Progress per Mata Pelajaran</h3>
          <div className="space-y-4">
            {d.subjects.map((s) => (
              <div key={s.subject}>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-sm font-bold text-slate-700 flex items-center gap-2"><BookOpen size={14} className="text-indigo-500" /> {s.subject}</p>
                  <span className="text-xs font-extrabold text-slate-500">{s.materialsPct}%</span>
                </div>
                <ProgressBar value={s.materialsPct} className="!h-1.5" tone={s.materialsPct >= 75 ? 'emerald' : s.materialsPct >= 50 ? 'amber' : 'rose'} />
                <p className="text-[10px] text-slate-400 mt-0.5">Tugas: {s.graded}/{s.assignmentsTotal} dinilai · Rata-rata: {s.avgGrade ?? '—'}</p>
              </div>
            ))}
            {d.subjects.length === 0 && <EmptyState title="Belum ada data" />}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-extrabold text-slate-900 mb-4">Nilai & Feedback Terakhir</h3>
          <div className="space-y-2.5">
            {lastGrades.length === 0 && <EmptyState title="Belum ada nilai" />}
            {lastGrades.map((g, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3.5">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{g.subject_name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{g.assignment_title}</p>
                </div>
                {g.grade !== null ? <Badge tone="green">{g.grade}/{g.max_score}</Badge> : <StatusBadge status={g.status} />}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Page>
  );
}
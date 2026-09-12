import { useEffect, useState } from 'react';
import { api } from '../../api';
import { Page, Card, Spinner, EmptyState, ProgressBar, Badge } from '../../components/ui';
import { BookOpen, ClipboardList, TrendingUp } from 'lucide-react';

export default function StudentProgress() {
  const [d, setD] = useState(null);
  useEffect(() => { api('/student/progress').then(setD).catch(() => {}); }, []);
  if (!d) return <Spinner />;

  return (
    <Page title="Progress Belajar Saya" subtitle="Pantau perkembangan belajar per mata pelajaran.">
      <Card className="p-6 mb-6 bg-gradient-brand text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-white/80">Progress keseluruhan</p>
            <p className="text-3xl font-extrabold">{d.overall}%</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-white/80">{d.doneMaterials} / {d.totalMaterials} materi selesai</p>
            <p className="text-[11px] text-white/70 mt-1">Terus semangat belajar!</p>
          </div>
        </div>
        <ProgressBar value={d.overall} tone="emerald" className="!bg-white/25 mt-4" />
      </Card>

      <div className="grid gap-5">
        {d.subjects.map((s) => {
          const isGood = s.materialsPct >= 75;
          return (
            <Card key={s.subject} className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-indigo-50 grid place-items-center text-indigo-600"><BookOpen size={18} /></div>
                  <div><p className="font-extrabold text-slate-900">{s.subject}</p>
                    <p className="text-xs text-slate-400">Materi: {s.materialsDone}/{s.materialsTotal} selesai</p></div>
                </div>
                <div className="flex items-center gap-5">
                  <div className="hidden sm:block">
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-1.5"><ClipboardList size={12} /> Tugas dikerjakan: <b className="text-slate-700">{s.assignmentsDone}/{s.assignmentsTotal}</b></div>
                    <div className="flex items-center gap-2 text-xs text-slate-400"><TrendingUp size={12} /> Rata-rata nilai: <b className="text-slate-700">{s.avgGrade !== null ? s.avgGrade : '—'}</b></div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-extrabold text-indigo-600">{s.materialsPct}%</span>
                    <Badge tone={isGood ? 'green' : 'amber'} className="block mt-1">{isGood ? 'Sesuai target' : 'Perlu ditingkatkan'}</Badge>
                    <ProgressBar value={s.materialsPct} className="!h-1.5 w-28 mt-2" />
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
        {d.subjects.length === 0 && <EmptyState title="Belum ada data progress" />}
      </div>
    </Page>
  );
}
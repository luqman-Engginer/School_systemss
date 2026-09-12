import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api';
import { Page, Card, Spinner, ProgressBar, Badge, EmptyState } from '../../components/ui';
import { BookOpen, UserCheck, AlertTriangle, MessageSquare, GraduationCap, ArrowUpRight } from 'lucide-react';
import dayjs from 'dayjs';

export const selectChild = (id) => { try { localStorage.setItem('schoolhub_child', String(id)); } catch {} };

export default function ParentChildOverview() {
  const { childId } = useParams();
  const navigate = useNavigate();
  const [d, setD] = useState(null);
  const [child, setChild] = useState(null);

  useEffect(() => {
    selectChild(childId);
    Promise.all([api(`/parent/child/${childId}/overview`), api(`/parent/child/${childId}/progress`), api(`/parent/child/${childId}/attendance`), api('/parent/children')])
      .then(([o, progress, att, kids]) => {
        setD({ overview: o, progress, attendance: att });
        setChild(kids.find((k) => String(k.student_id) === String(childId)) || { name: 'Anak' });
      })
      .catch(() => {});
  }, [childId]);

  if (!d || !child) return <Spinner />;

  const { overview } = d;
  const sum = (s) => d.attendance.summary.filter((x) => x.status === s).reduce((a, x) => a + x.c, 0);
  const attTotal = d.attendance.summary.reduce((a, x) => a + x.c, 0);

  return (
    <Page title={child.name} subtitle={`Relasi ${child.relation || 'Wali'} · ${overview.classInfo ? `${overview.classInfo.name} · ${overview.classInfo.grade}` : ''}`}>
      <Card className="p-6 mb-6 bg-gradient-brand text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-white/80">Progress Belajar</p>
            <p className="text-3xl font-extrabold">{overview.progressPct}%</p>
            <p className="text-[11px] text-white/70 mt-1">{overview.done}/{overview.total} materi selesai</p>
          </div>
          <div className="flex gap-3">
            <div className="rounded-xl bg-white/10 px-4 py-3 text-center"><p className="text-xl font-extrabold">{attTotal ? Math.round(((sum('PRESENT') + sum('LATE')) / attTotal) * 100) : 0}%</p><p className="text-[10px] font-semibold text-white/70">KEHADIRAN</p></div>
            <div className="rounded-xl bg-white/10 px-4 py-3 text-center"><p className="text-xl font-extrabold">{overview.discipline}</p><p className="text-[10px] font-semibold text-white/70">CATATAN DISIPLIN</p></div>
          </div>
        </div>
        <ProgressBar value={overview.progressPct} tone="emerald" className="!bg-white/25 mt-4" />
      </Card>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <Card className="p-5 card-hover cursor-pointer" onClick={() => navigate(`/wali/anak/${childId}/akademik`)}>
          <ModIcon icon={BookOpen} cls="bg-indigo-100 text-indigo-600" label="Akademik & Nilai" desc="Detail per mapel, nilai, feedback" />
        </Card>
        <Card className="p-5 card-hover cursor-pointer" onClick={() => navigate(`/wali/anak/${childId}/kehadiran`)}>
          <ModIcon icon={UserCheck} cls="bg-emerald-100 text-emerald-600" label="Kehadiran" desc="Rekap 30 hari terakhir" />
        </Card>
        <Card className="p-5 card-hover cursor-pointer" onClick={() => navigate(`/wali/anak/${childId}/disiplin`)}>
          <ModIcon icon={AlertTriangle} cls="bg-amber-100 text-amber-600" label="Kedisiplinan" desc="Catatan dan poin disiplin" />
        </Card>
        <Card className="p-5 card-hover cursor-pointer" onClick={() => navigate(`/wali/anak/${childId}/feedback`)}>
          <ModIcon icon={MessageSquare} cls="bg-violet-100 text-violet-600" label="Feedback Guru" desc="Catatan perkembangan dari guru" />
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="font-extrabold text-slate-900 mb-4">Progress per Mata Pelajaran</h3>
        <div className="space-y-4">
          {d.progress.map((s) => (
            <div key={s.subject}>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-sm font-bold text-slate-700 flex items-center gap-2"><GraduationCap size={14} className="text-indigo-500" /> {s.subject}</p>
                <span className="text-xs font-extrabold text-slate-500">{s.materialsPct}%</span>
              </div>
              <ProgressBar value={s.materialsPct} className="!h-1.5" tone={s.materialsPct >= 75 ? 'emerald' : s.materialsPct >= 50 ? 'amber' : 'rose'} />
            </div>
          ))}
        </div>
      </Card>
    </Page>
  );
}

function ModIcon({ icon: Icon, cls, label, desc }) {
  return (
    <div className="flex items-start gap-3">
      <div className={`h-11 w-11 shrink-0 rounded-xl grid place-items-center ${cls}`}><Icon size={20} /></div>
      <div className="min-w-0">
        <p className="text-sm font-extrabold text-slate-900 flex items-center gap-1">{label} <ArrowUpRight size={13} className="text-slate-300" /></p>
        <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
      </div>
    </div>
  );
}
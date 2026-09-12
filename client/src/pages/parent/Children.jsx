import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { Page, Card, Spinner, Badge, EmptyState } from '../../components/ui';
import { GraduationCap, UserCheck, MessageSquare, ArrowUpRight } from 'lucide-react';

export default function ParentChildren() {
  const [d, setD] = useState(null);
  const navigate = useNavigate();
  useEffect(() => { api('/parent/dashboard').then(setD).catch(() => {}); }, []);
  if (!d) return <Spinner />;

  return (
    <Page title="Anak Saya" subtitle="Pilih anak untuk melihat detail perkembangan akademik.">
      <div className="grid md:grid-cols-2 gap-5">
        {d.children.map((c) => (
          <ChildCard key={c.student_id} child={c} onClick={() => navigate(`/wali/anak/${c.student_id}`)} />
        ))}
        {d.children.length === 0 && <EmptyState title="Belum ada anak terhubung" desc="Hubungi admin sekolah untuk menautkan anak Anda." />}
      </div>
    </Page>
  );
}

export function ChildCard({ child: c, onClick }) {
  const total = (c.attendance || []).reduce((a, x) => a + x.c, 0);
  const absent = (c.attendance || []).find((x) => x.status === 'ABSENT')?.c || 0;
  const presence = total ? Math.round(((total - absent) / total) * 100) : null;

  return (
    <Card className="p-6 card-hover cursor-pointer" onClick={onClick}>
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-2xl bg-gradient-brand grid place-items-center text-white text-xl font-extrabold">{(c.name || 'A')[0]}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-lg font-extrabold text-slate-900">{c.name}</p>
            <Badge tone="slate">{c.relation}</Badge>
          </div>
          {c.classInfo
            ? <p className="text-xs text-slate-400 mt-0.5">{c.classInfo.name} · Kelas {c.classInfo.grade}</p>
            : <p className="text-xs text-slate-400 mt-0.5">Belum ada kelas</p>}
        </div>
        <ArrowUpRight size={18} className="text-slate-300" />
      </div>
      <div className="mt-5 flex gap-2">
        <QuickStat icon={GraduationCap} label="Progress" value={`${c.progressPct || 0}%`} />
        <QuickStat icon={UserCheck} label="Kehadiran" value={presence === null ? '—' : `${presence}%`} />
        <QuickStat icon={MessageSquare} label="Feedback" value={c.feedback?.length || 0} />
      </div>
    </Card>
  );
}

function QuickStat({ icon: Icon, label, value }) {
  return (
    <div className="flex-1 rounded-xl bg-slate-50 p-3 text-center">
      <Icon size={15} className="mx-auto text-indigo-500" />
      <p className="mt-1 text-xs font-bold text-slate-700">{value}</p>
      <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wide">{label}</p>
    </div>
  );
}
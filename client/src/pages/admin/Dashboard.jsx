import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { Page, Stat, Card, Spinner, StatusBadge, Badge, ProgressBar, Avatar } from '../../components/ui';
import {
  Users, GraduationCap, UserCog, Baby, NotebookPen,
  Megaphone, ArrowUpRight, Activity
} from 'lucide-react';

export default function AdminDashboard() {
  const [d, setD] = useState(null);
  const navigate = useNavigate();
  useEffect(() => { api('/admin/dashboard').then(setD).catch(() => {}); }, []);
  if (!d) return <Spinner />;

  const roleTotals = d.roleBreakdown.reduce((a, r) => ({ ...a, [r.role]: r.c }), {});
  const attendanceMap = Object.fromEntries(d.attendanceToday.map((x) => [x.status, x.c]));

  return (
    <Page title="Dashboard Admin" subtitle="Ringkasan sistem, pengguna, konten, dan aktivitas sekolah.">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon={Users} label="Total Pengguna" value={d.users} tone="indigo" />
        <Stat icon={GraduationCap} label="Siswa" value={d.students} tone="sky" />
        <Stat icon={UserCog} label="Guru" value={d.teachers} tone="violet" />
        <Stat icon={Baby} label="Wali Murid" value={d.parents} tone="emerald" />
      </div>

      <div className="mt-6 grid lg:grid-cols-3 gap-6">
        {/* left col */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-extrabold text-slate-900">Statistik Utama</h3>
              <Badge tone="indigo">TA {d.activeYear || '—'}</Badge>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              {[
                ['Kelas', d.classes, '/admin/akademik/kelas'],
                ['Mapel', d.subjects, '/admin/akademik/mapel'],
                ['Materi', d.materials, null],
                ['Tugas', d.assignments, null]
              ].map(([l, v, to]) => (
                <button key={l} onClick={() => to && navigate(to)} className={`rounded-2xl bg-slate-50 border border-slate-100 p-4 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all ${to ? 'cursor-pointer' : ''}`}>
                  <p className="text-2xl font-extrabold text-slate-900">{v}</p>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">{l}</p>
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-extrabold text-slate-900">Aspirasi Terbaru</h3>
              <button onClick={() => navigate('/admin/aspirasi')} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1">Kelola <ArrowUpRight size={13} /></button>
            </div>
            <div className="space-y-3">
              {d.recentAspirations.map((a) => (
                <div key={a.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-3.5 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-full bg-indigo-50 text-indigo-600 grid place-items-center shrink-0"><NotebookPen size={16} /></div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{a.title}</p>
                      <p className="text-xs text-slate-400">{a.anonymous ? '(Anonim)' : a.student_name} · {a.category}</p>
                    </div>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              ))}
              {d.recentAspirations.length === 0 && <p className="text-sm text-slate-400 text-center py-6">Belum ada aspirasi.</p>}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-extrabold text-slate-900 mb-4">Jumlah Siswa per Kelas</h3>
            <div className="space-y-4">
              {d.studentsPerClass.map((c) => (
                <div key={c.name} className="flex items-center gap-4">
                  <span className="w-20 text-sm font-bold text-slate-700">{c.name}</span>
                  <ProgressBar value={(c.total / Math.max(...d.studentsPerClass.map((x) => x.total), 1)) * 100} className="flex-1" />
                  <span className="text-sm font-extrabold text-slate-800 w-8 text-right">{c.total}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* right col */}
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-slate-900">Kehadiran Hari Ini</h3>
              <Megaphone size={18} className="text-slate-300" />
            </div>
            <div className="space-y-3">
              {[['Hadir', attendanceMap.PRESENT || 0, 'bg-emerald-500'], ['Terlambat', attendanceMap.LATE || 0, 'bg-amber-500'], ['Sakit', attendanceMap.SICK || 0, 'bg-sky-500'], ['Izin', attendanceMap.EXCUSED || 0, 'bg-violet-500'], ['Alpa', attendanceMap.ABSENT || 0, 'bg-rose-500']].map(([l, v, color]) => (
                <div key={l} className="flex items-center gap-3">
                  <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
                  <span className="text-sm text-slate-600 flex-1">{l}</span>
                  <span className="text-sm font-extrabold text-slate-800">{v}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-extrabold text-slate-900 mb-4 flex items-center gap-2"><Megaphone size={16} className="text-indigo-500" /> Event Mendatang</h3>
            <div className="space-y-3">
              {d.upcomingEvents.map((e) => (
                <div key={e.id} className="flex items-center gap-3">
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-brand text-white grid place-items-center text-xs font-extrabold">{new Date(e.date + 'T00:00:00').getDate()}</div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{e.title}</p>
                    <p className="text-[11px] text-slate-400">{new Date(e.date + 'T00:00:00').toLocaleDateString('id-ID', { dateStyle: 'medium' })}</p>
                  </div>
                </div>
              ))}
              {d.upcomingEvents.length === 0 && <p className="text-sm text-slate-400 text-center py-4">Tidak ada event.</p>}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-extrabold text-slate-900 mb-4 flex items-center gap-2"><Activity size={16} className="text-sky-500" /> Aktivitas Terbaru</h3>
            <div className="space-y-3">
              {d.activity.map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-slate-300 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-slate-700">{a.action}</p>
                    <p className="text-[11px] text-slate-400">{a.entity} · {new Date(a.created_at + 'Z').toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </Page>
  );
}
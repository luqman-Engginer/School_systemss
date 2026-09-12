import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { Page, Stat, Card, Spinner, StatusBadge, ProgressBar, EmptyState, Badge } from '../../components/ui';
import { BookOpen, ClipboardList, CalendarDays, AlertTriangle, Megaphone, BookMarked, Hourglass } from 'lucide-react';
import dayjs from 'dayjs';
import 'dayjs/locale/id';

dayjs.locale('id');

export default function StudentDashboard() {
  const [d, setD] = useState(null);
  const navigate = useNavigate();
  useEffect(() => { api('/student/dashboard').then(setD).catch(() => {}); }, []);
  if (!d) return <Spinner />;

  const mapProgress = (arr, key) => arr.reduce((m, x) => { m[x.status] = x.c; return m; }, {});
  const p = mapProgress(d.progress, 'status');
  const done = p.COMPLETED || 0;
  const total = (p.COMPLETED || 0) + (p.IN_PROGRESS || 0) + (p.MISSED || 0) + (p.NOT_STARTED || 0);

  return (
    <Page title="Halo, selamat belajar!" subtitle={dayjs().format('dddd, D MMMM YYYY')}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon={BookOpen} label="Materi Selesai" value={`${done}/${total}`} tone="indigo" />
        <Stat icon={Hourglass} label="Tugas Rutin" value={d.upcomingAssignments.length} sub="masa depan" tone="sky" />
        <Stat icon={AlertTriangle} label="Materi Terlewat" value={d.missed.length} tone="rose" />
        <Stat icon={BookMarked} label="Mapel Berjalan" value={d.schedule.length} sub="kelas hari ini" tone="violet" />
      </div>

      <div className="mt-6 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-extrabold text-slate-900 flex items-center gap-2"><CalendarDays size={17} className="text-indigo-500" /> Jadwal Hari Ini</h3>
              <button onClick={() => navigate('/murid/jadwal')} className="text-xs font-bold text-indigo-600">Lihat jadwal lengkap</button>
            </div>
            {d.schedule.length === 0 && <EmptyState title="Tidak ada pelajaran hari ini" />}
            <div className="space-y-2">
              {d.schedule.map((s, i) => (
                <div key={i} className="flex items-center gap-4 rounded-xl border border-slate-100 p-3.5">
                  <div className="shrink-0 text-center w-20"><p className="text-sm font-extrabold text-slate-800">{s.start_time}</p><p className="text-[10px] text-slate-400">– {s.end_time}</p></div>
                  <div className="flex-1"><p className="text-sm font-bold text-slate-800">{s.subject_name}</p><p className="text-xs text-slate-400">{s.teacher_name || '—'}</p></div>
                  <Badge tone="slate">{s.room || '—'}</Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-extrabold text-slate-900">Tugas Mendatang</h3>
              <button onClick={() => navigate('/murid/tugas')} className="text-xs font-bold text-indigo-600">Semua tugas</button>
            </div>
            <div className="space-y-2">
              {d.upcomingAssignments.map((a) => {
                const late = a.my_status === 'GRADED' || a.my_status === 'SUBMITTED';
                return (
                  <div key={a.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3.5">
                    <div className="h-9 w-9 shrink-0 rounded-xl bg-gradient-brand grid place-items-center text-white"><ClipboardList size={16} /></div>
                    <div className="flex-1 min-w-0"><p className="text-sm font-bold text-slate-800 truncate">{a.title}</p><p className="text-[11px] text-slate-400">{a.subject_name} · deadline {dayjs(a.deadline).format('D MMM')}</p></div>
                    {late ? <Badge tone="green">Dikumpulkan</Badge> : a.my_status === 'LATE' ? <Badge tone="rose">Terlambat</Badge> : <Badge tone="amber">Open</Badge>}
                  </div>
                );
              })}
              {d.upcomingAssignments.length === 0 && <EmptyState title="Tidak ada tugas mendatang" />}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-extrabold text-slate-900 mb-4">Progress Belajar</h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-500">Materi terselesaikan</span>
              <span className="text-lg font-extrabold text-indigo-600">{total ? Math.round((done / total) * 100) : 0}%</span>
            </div>
            <ProgressBar value={total ? (done / total) * 100 : 0} className="!h-2.5" />
            {d.missed.length > 0 && (
              <button onClick={() => navigate('/murid/terlewat')} className="mt-4 w-full flex items-center gap-2 rounded-xl border border-rose-100 bg-rose-50 p-3 text-left">
                <AlertTriangle size={16} className="text-rose-500" />
                <span className="text-xs font-bold text-rose-600">{d.missed.length} materi terlewat — segera pelajari!</span>
              </button>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="font-extrabold text-slate-900 mb-4 flex items-center gap-2"><Megaphone size={16} className="text-amber-500" /> Pengumuman</h3>
            <div className="space-y-2.5">
              {d.announcements.map((a) => (
                <div key={a.id} className="rounded-xl border border-slate-100 p-3">
                  <p className="text-sm font-bold text-slate-800">{a.title}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{dayjs(a.published_at).format('D MMM YYYY')} · {a.category || 'Umum'}</p>
                </div>
              ))}
              {d.announcements.length === 0 && <EmptyState title="Belum ada pengumuman" />}
            </div>
          </Card>

          <Card className="p-6 bg-gradient-brand text-white">
            <div className="flex items-center justify-between gap-2 mb-3">
              <h3 className="font-extrabold">Materi Baru</h3>
              <button onClick={() => navigate('/murid/materi')} className="text-[11px] font-bold text-white/80">Lihat semua</button>
            </div>
            <div className="space-y-2.5">
              {d.newMaterials.map((m) => (
                <div key={m.id} className="rounded-xl bg-white/10 p-3">
                  <p className="text-sm font-bold">{m.title}</p>
                  <p className="text-[11px] text-white/70 mt-0.5">{m.subject_name} · Pertemuan {m.meeting}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </Page>
  );
}
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { useAuth } from '../../store';
import { Page, Stat, Card, Spinner, StatusBadge, ProgressBar, EmptyState, Badge } from '../../components/ui';
import { Users, BookOpen, ClipboardList, UserCheck, CalendarDays, MessageSquare, ArrowUpRight } from 'lucide-react';
import dayjs from 'dayjs';
import 'dayjs/locale/id';

dayjs.locale('id');

export default function TeacherDashboard() {
  const [d, setD] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  useEffect(() => { api('/teacher/dashboard').then(setD).catch(() => {}); }, []);
  if (!d) return <Spinner />;

  const now = dayjs();
  const upcomingClasses = d.schedule.filter((s) => +s.start_time.replace(':', '') >= +now.format('HHmm'));

  return (
    <Page title={`Selamat datang, ${user?.name || 'Bapak/Ibu Guru'}`} subtitle={now.format('dddd, D MMMM YYYY')}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon={Users} label="Kelas Saya" value={d.classes.length} tone="indigo" />
        <Stat icon={BookOpen} label="Mapel Diampu" value={d.subjects.length} tone="sky" />
        <Stat icon={ClipboardList} label="Tugas Dibuat" value={d.assignments.length} tone="violet" />
        <Stat icon={UserCheck} label="Absensi Dicatat" value={d.todayAttendance} sub="hari ini" tone="emerald" />
      </div>

      <div className="mt-6 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-extrabold text-slate-900 flex items-center gap-2"><CalendarDays size={17} className="text-indigo-500" /> Jadwal Hari Ini</h3>
              <button onClick={() => navigate('/guru/jadwal')} className="text-xs font-bold text-indigo-600 inline-flex items-center gap-1">Lihat jadwal <ArrowUpRight size={13} /></button>
            </div>
            {d.schedule.length === 0 && <EmptyState title="Tidak ada kelas hari ini" desc="Jadwal mengajar Anda kosong untuk hari ini." />}
            <div className="space-y-2">
              {d.schedule.map((s, i) => (
                <div key={i} className="flex items-center gap-4 rounded-xl border border-slate-100 p-3.5">
                  <div className="shrink-0 text-center w-20">
                    <p className="text-sm font-extrabold text-slate-800">{s.start_time}</p>
                    <p className="text-[10px] text-slate-400">– {s.end_time}</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-800">{s.subject_name}</p>
                    <p className="text-xs text-slate-400">{s.class_name} · {s.room}</p>
                  </div>
                  {upcomingClasses.includes(s) ? <Badge tone="green">Akan datang</Badge> : <Badge tone="slate">Selesai</Badge>}
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-extrabold text-slate-900">Ringkasan Tugas & Pengumpulan</h3>
              <button onClick={() => navigate('/guru/tugas')} className="text-xs font-bold text-indigo-600 inline-flex items-center gap-1">Kelola <ArrowUpRight size={13} /></button>
            </div>
            <div className="overflow-x-auto">
              <table className="table-shell">
                <thead><tr><th>Tugas</th><th>Kelas</th><th>Dikumpulkan</th><th className="text-right">Aksi</th></tr></thead>
                <tbody>
                  {d.submissionSummary.map((a) => (
                    <tr key={a.id}>
                      <td className="max-w-[200px]"><p className="font-bold truncate">{a.title}</p></td>
                      <td className="text-xs"><Badge tone="indigo">{a.class_name}</Badge></td>
                      <td><div className="flex items-center gap-2 w-40"><ProgressBar value={a.total ? (a.submitted / a.total) * 100 : 0} className="!h-1.5 w-24" /><span className="text-xs font-bold">{a.submitted}/{a.total}</span></div></td>
                      <td><div className="flex justify-end"><button className="btn-outline btn-sm" onClick={() => navigate(`/guru/tugas`)}>Nilai</button></div></td>
                    </tr>
                  ))}
                  {d.submissionSummary.length === 0 && <tr><td colSpan={4}><EmptyState title="Belum ada tugas" /></td></tr>}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-extrabold text-slate-900 mb-4 flex items-center gap-2"><Users size={16} className="text-violet-500" /> Kelas Saya</h3>
            <div className="space-y-2">
              {d.classes.map((c) => (
                <button key={c.id} onClick={() => navigate('/guru/kelas')} className="w-full flex items-center justify-between rounded-xl border border-slate-100 p-3.5 hover:border-indigo-300 hover:bg-indigo-50/40 transition-colors text-left">
                  <div><p className="text-sm font-bold text-slate-800">{c.name}</p><p className="text-[11px] text-slate-400">Wali: {c.homeroom || '—'}</p></div>
                  <Badge tone="indigo">{c.grade}</Badge>
                </button>
              ))}
              {d.classes.length === 0 && <p className="text-sm text-slate-400 text-center py-6">Belum ada kelas.</p>}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-extrabold text-slate-900 mb-4 flex items-center gap-2"><MessageSquare size={16} className="text-sky-500" /> Ruang Diskusi</h3>
            <div className="space-y-2">
              {d.discussions.map((r) => (
                <button key={r.id} onClick={() => navigate('/guru/diskusi')} className="w-full rounded-xl border border-slate-100 p-3.5 hover:border-sky-300 hover:bg-sky-50/40 transition-colors text-left">
                  <p className="text-sm font-bold text-slate-800 truncate">{r.title}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{r.message_count} pesan · {r.type.replaceAll('_', ' ')}</p>
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-extrabold text-slate-900 mb-4">Meeting Terdekat</h3>
            <div className="space-y-2">
              {d.meetings.map((m) => (
                <button key={m.id} onClick={() => navigate('/guru/meeting')} className="w-full rounded-xl border border-slate-100 p-3.5 text-left hover:border-indigo-300 transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-slate-800 truncate">{m.topic || 'Meeting'}</p>
                    <StatusBadge status={m.status} />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{new Date(m.date + 'T00:00:00').toLocaleDateString('id-ID', { dateStyle: 'medium' })} · {m.student_name} · {m.meeting_type}</p>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </Page>
  );
}
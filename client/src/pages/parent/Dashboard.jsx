import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { useAuth } from '../../store';
import { Page, Stat, Card, Spinner, ProgressBar, EmptyState, Badge, StatusBadge } from '../../components/ui';
import { Users, CalendarDays, Megaphone, ClipboardList, ArrowUpRight, HeartHandshake } from 'lucide-react';
import dayjs from 'dayjs';
import 'dayjs/locale/id';

dayjs.locale('id');

export default function ParentDashboard() {
  const [d, setD] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  useEffect(() => { api('/parent/dashboard').then(setD).catch(() => {}); }, []);
  if (!d) return <Spinner />;

  return (
    <Page title={`Selamat datang, ${user?.name || 'Wali Murid'}`} subtitle={dayjs().format('dddd, D MMMM YYYY')}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon={Users} label="Anak Terhubung" value={d.children.length} tone="indigo" />
        <Stat icon={HeartHandshake} label="Meeting Terjadwal" value={d.meetings.filter((m) => m.status !== 'CANCELLED').length} tone="sky" />
        <Stat icon={Megaphone} label="Notifikasi Baru" value={d.notifications} tone="amber" />
        <Stat icon={ClipboardList} label="Feedback Terbaru" value={d.children.reduce((a, c) => a + (c.feedback?.length || 0), 0)} tone="violet" />
      </div>

      <div className="mt-6 space-y-6">
        {d.children.map((c) => (
          <Card key={c.student_id} className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-gradient-brand grid place-items-center text-white font-extrabold">{(c.name || 'A')[0]}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-extrabold text-slate-900">{c.name}</p>
                    <Badge tone="slate">{c.relation}</Badge>
                  </div>
                  {c.classInfo && <p className="text-sm text-slate-400 mt-0.5">{c.classInfo.name} · {c.classInfo.grade}</p>}
                </div>
              </div>
              <div className="flex items-center gap-5">
                <div className="text-right">
                  <p className="text-2xl font-extrabold text-indigo-600">{c.progressPct}%</p>
                  <ProgressBar value={c.progressPct} className="!h-1.5 w-28 mt-1" />
                  <p className="text-[10px] text-slate-400 mt-1">progress belajar</p>
                </div>
                <button onClick={() => navigate(`/wali/anak/${c.student_id}`)} className="btn-outline btn-sm">Detail <ArrowUpRight size={13} /></button>
              </div>
            </div>

            {c.upcomingAssign.length > 0 && (
              <div className="mt-5 pt-4 border-t border-slate-100">
                <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wide mb-2.5">Tugas Terdekat</p>
                <div className="space-y-2">
                  {c.upcomingAssign.map((a, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
                      <div className="flex-1"><p className="text-sm font-bold text-slate-800">{a.title}</p><p className="text-[11px] text-slate-400">{a.subject_name} · deadline {dayjs(a.deadline).format('D MMM YYYY')}</p></div>
                      {a.grade !== null ? <Badge tone="green">{a.grade}</Badge> : <Badge tone="amber">Belum dinilai</Badge>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(c.feedback?.length || 0) > 0 && (
              <div className="mt-4">
                <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wide mb-2.5">Feedback Guru</p>
                <div className="space-y-2">
                  {c.feedback.map((f, i) => (
                    <div key={i} className="rounded-xl bg-slate-50 border border-slate-100 p-3.5">
                      <p className="text-sm text-slate-600 italic">"{f.content}"</p>
                      <p className="text-[11px] text-slate-400 mt-1">— {f.teacher_name} · {dayjs(f.created_at + 'Z').format('D MMM YYYY')}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        ))}

        {d.children.length === 0 && <EmptyState title="Belum ada anak terhubung" desc="Hubungi admin sekolah untuk menautkan anak Anda." />}

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-slate-900 flex items-center gap-2"><CalendarDays size={17} className="text-indigo-500" /> Pertemuan Orang Tua</h3>
            <button onClick={() => navigate('/wali/meeting')} className="text-xs font-bold text-indigo-600">Semua meeting</button>
          </div>
          <div className="space-y-2">
            {d.meetings.map((m) => (
              <div key={m.id} className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-100 p-3.5">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800">{m.topic}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{m.student_name} · {dayjs(m.date).format('D MMM YYYY')} · {m.start_time}–{m.end_time}</p>
                </div>
                <StatusBadge status={m.status} />
              </div>
            ))}
            {d.meetings.length === 0 && <EmptyState title="Belum ada meeting" />}
          </div>
        </Card>
      </div>
    </Page>
  );
}
import { useEffect, useMemo, useState } from 'react';
import { api } from '../../api';
import { Page, Card, Spinner, EmptyState, ProgressBar, Avatar, Badge } from '../../components/ui';
import {
  TrendingUp, Users, BookOpen, ClipboardCheck, Star, CalendarDays, Activity
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts';

const TONES = { indigo: '#6366f1', sky: '#0ea5e9', emerald: '#10b981', amber: '#f59e0b', rose: '#f43f5e', violet: '#8b5cf6' };

export default function TeacherTraffic() {
  const [classes, setClasses] = useState([]);
  const [selected, setSelected] = useState(null);
  const [days, setDays] = useState(14);
  const [d, setD] = useState(null);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    api('/teacher/my-classes').then((mc) => {
      setClasses(mc.classes);
      if (mc.classes.length) setSelected(mc.classes[0].id);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (selected) { setD(null); api(`/teacher/traffic?class_id=${selected}&days=${days}`).then(setD).catch(() => {}); }
    else setD(null);
  }, [selected, days]);

  const tone = (v) => (v >= 75 ? 'emerald' : v >= 50 ? 'amber' : 'rose');

  const sortedStudents = useMemo(() => (d ? [...d.students].sort((a, b) => b.overall - a.overall) : []), [d]);

  return (
    <Page
      title="Traffic & Perkembangan Siswa"
      desc="Pantau tren perkembangan belajar, kehadiran, dan pengumpulan tugas per kelas."
      actions={
        <select className="select !w-auto" value={days} onChange={(e) => setDays(+e.target.value)}>
          <option value={7}>7 hari terakhir</option>
          <option value={14}>14 hari terakhir</option>
          <option value={30}>30 hari terakhir</option>
        </select>
      }
    >
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <label className="text-sm font-semibold text-slate-600">Pilih Kelas:</label>
        <select className="select" value={selected || ''} onChange={(e) => setSelected(+e.target.value)}>
          {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {d?.classInfo && (
          <div className="flex items-center gap-2 ml-2">
            <Badge tone="indigo">{d.classInfo.name}</Badge>
            <Badge tone="slate">Wali: {d.classInfo.homeroom || '—'}</Badge>
          </div>
        )}
      </div>

      {!d ? <Spinner /> : (
        <div className="space-y-6">
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Users} label="Siswa Aktif" value={d.studentCount} tone="indigo" />
            <StatCard icon={BookOpen} label="Total Materi" value={d.totalMaterials} tone="sky" />
            <StatCard icon={ClipboardCheck} label="Tugas Dikumpulkan" value={d.submitted} tone="violet" />
            <StatCard icon={Star} label="Tugas Dinilai" value={d.graded} tone="emerald" />
          </div>

          {/* Progress trend chart */}
          <Card className="p-6">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-5">
              <h3 className="font-extrabold text-slate-900 flex items-center gap-2">
                <TrendingUp size={18} className="text-indigo-500" /> Tren Penyelesaian Materi
              </h3>
              <span className="text-xs font-bold text-slate-400">{d.avgOverall}% rata-rata kelas</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer>
                <AreaChart data={d.trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={TONES.indigo} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={TONES.indigo} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} tickMargin={8} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12, boxShadow: '0 8px 24px rgba(15,23,42,0.08)' }} labelFormatter={(_, p) => p?.[0]?.payload?.day || ''} />
                  <Area type="monotone" dataKey="count" name="Materi selesai" stroke={TONES.indigo} strokeWidth={2.5} fill="url(#gTrend)" dot={{ r: 3, fill: TONES.indigo, strokeWidth: 0 }} activeDot={{ r: 5 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Attendance trend */}
            <Card className="p-6">
              <h3 className="font-extrabold text-slate-900 mb-5 flex items-center gap-2">
                <CalendarDays size={18} className="text-emerald-500" /> Tren Kehadiran
              </h3>
              {d.attendance.length === 0 ? (
                <EmptyState title="Belum ada data kehadiran" />
              ) : (
                <div className="h-60">
                  <ResponsiveContainer>
                    <BarChart data={d.attendance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                      <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} unit="%" />
                      <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} formatter={(v) => [`${v}%`, 'Kehadiran']} />
                      <Bar dataKey="pct" name="Kehadiran" fill={TONES.emerald} radius={[8, 8, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>

            {/* Per student progress chart */}
            <Card className="p-6">
              <h3 className="font-extrabold text-slate-900 mb-5 flex items-center gap-2">
                <Activity size={18} className="text-violet-500" /> Progress per Siswa
              </h3>
              {sortedStudents.length === 0 ? (
                <EmptyState title="Belum ada siswa" />
              ) : (
                <div className="h-60">
                  <ResponsiveContainer>
                    <LineChart data={sortedStudents} margin={{ top: 10, right: 10, left: -30, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} interval={0} angle={-30} textAnchor="end" height={60} tickFormatter={(n) => (n || '').split(' ')[0]} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} unit="%" />
                      <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} formatter={(v) => [`${v}%`, 'Progress']} />
                      <Line type="monotone" dataKey="overall" name="Progress %" stroke={TONES.violet} strokeWidth={2.5} dot={{ r: 4, fill: TONES.violet, strokeWidth: 0 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>
          </div>

          {/* Per student detail */}
          <Card className="p-6">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-5">
              <h3 className="font-extrabold text-slate-900">Rincian Siswa</h3>
              <span className="text-xs text-slate-400">Klik untuk melihat per mapel</span>
            </div>
            <div className="space-y-3">
              {sortedStudents.map((st) => (
                <div key={st.student_id} className="rounded-2xl border border-slate-100">
                  <button onClick={() => setExpanded(expanded === st.student_id ? null : st.student_id)} className="w-full flex items-center gap-4 p-4 text-left hover:bg-slate-50/60 transition-colors">
                    <Avatar src={st.photo} name={st.name} size={42} />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 truncate">{st.name}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <ProgressBar value={st.overall} className="!h-2 flex-1" tone={tone(st.overall)} />
                        <span className={`text-sm font-extrabold w-14 text-right ${st.overall >= 75 ? 'text-emerald-600' : st.overall >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>{st.overall}%</span>
                      </div>
                    </div>
                    <Badge tone={tone(st.overall)}>{st.perSubject.filter((p) => p.pct >= 50).length}/{st.perSubject.length} mapel</Badge>
                  </button>
                  {expanded === st.student_id && (
                    <div className="px-4 pb-4 grid sm:grid-cols-2 gap-3">
                      {st.perSubject.map((p) => (
                        <div key={p.subject} className="rounded-xl bg-slate-50 border border-slate-100 p-3.5">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-bold text-slate-700">{p.subject}</p>
                            <Badge tone={tone(p.pct)}>{p.done}/{p.total}</Badge>
                          </div>
                          <ProgressBar value={p.pct} className="!h-1.5" tone={tone(p.pct)} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {sortedStudents.length === 0 && <EmptyState title="Belum ada siswa di kelas ini" />}
            </div>
          </Card>
        </div>
      )}
    </Page>
  );
}

function StatCard({ icon: Icon, label, value, tone = 'indigo' }) {
  const tones = {
    indigo: 'bg-indigo-50 text-indigo-600',
    sky: 'bg-sky-50 text-sky-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    violet: 'bg-violet-50 text-violet-600'
  };
  return (
    <Card className="p-5 flex items-start gap-4 card-hover">
      <div className={`h-11 w-11 shrink-0 rounded-xl grid place-items-center ${tones[tone]}`}><Icon size={20} /></div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <p className="mt-1 text-2xl font-extrabold text-slate-900 leading-none">{value}</p>
      </div>
    </Card>
  );
}

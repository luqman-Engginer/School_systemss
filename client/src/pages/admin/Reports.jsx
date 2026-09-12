import { useEffect, useState } from 'react';
import { api } from '../../api';
import { Page, Card, Spinner, ProgressBar, EmptyState } from '../../components/ui';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const COLORS = { PRESENT: '#10b981', LATE: '#f59e0b', SICK: '#0ea5e9', EXCUSED: '#8b5cf6', ABSENT: '#f43f5e' };
const PCOLORS = { COMPLETED: '#10b981', IN_PROGRESS: '#0ea5e9', MISSED: '#f43f5e', NOT_STARTED: '#94a3b8' };

export default function AdminReports() {
  const [d, setD] = useState(null);
  useEffect(() => { api('/admin/reports').then(setD).catch(() => {}); }, []);
  if (!d) return <Spinner />;

  const att = d.attendance.map((x) => ({ name: x.status, value: x.c, fill: COLORS[x.status] || '#64748b' }));
  const sub = d.submissions.map((x) => ({ name: x.status, value: x.c }));
  const prog = d.progress.map((x) => ({ name: x.status, value: x.c, fill: PCOLORS[x.status] || '#64748b' }));

  return (
    <Page title="Laporan" subtitle="Ringkasan data kehadiran, tugas, dan progress pembelajaran.">
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="font-extrabold text-slate-900 mb-4">Kehadiran (30 hari terakhir)</h3>
          {att.length === 0
            ? <EmptyState title="Belum ada data kehadiran" />
            : <>
                <div className="h-56"><ResponsiveContainer><PieChart><Pie data={att} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>{att.map((a, i) => <Cell key={i} fill={a.fill} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>
                <div className="mt-3 space-y-1.5">
                  {att.map((a) => (
                    <div key={a.name} className="flex items-center justify-between text-sm"><span className="flex items-center gap-2 text-slate-600"><span className="h-2.5 w-2.5 rounded-full" style={{ background: a.fill }} /> {a.name.replaceAll('_', ' ')}</span><span className="font-extrabold">{a.value}</span></div>
                  ))}
                </div>
              </>}
        </Card>

        <Card className="p-6">
          <h3 className="font-extrabold text-slate-900 mb-4">Status Pengumpulan Tugas</h3>
          {sub.length === 0
            ? <EmptyState title="Belum ada pengumpulan" />
            : <div className="h-56"><ResponsiveContainer><BarChart data={sub}><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" /><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis allowDecimals={false} tick={{ fontSize: 11 }} /><Tooltip /><Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div>}
        </Card>

        <Card className="p-6">
          <h3 className="font-extrabold text-slate-900 mb-4">Status Progress Pembelajaran</h3>
          {prog.length === 0
            ? <EmptyState title="Belum ada data progress" />
            : <>
                <div className="h-56"><ResponsiveContainer><PieChart><Pie data={prog} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>{prog.map((a, i) => <Cell key={i} fill={a.fill} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>
                <div className="mt-3 space-y-1.5">
                  {prog.map((a) => (
                    <div key={a.name} className="flex items-center justify-between text-sm"><span className="flex items-center gap-2 text-slate-600"><span className="h-2.5 w-2.5 rounded-full" style={{ background: a.fill }} /> {a.name.replaceAll('_', ' ')}</span><span className="font-extrabold">{a.value}</span></div>
                  ))}
                </div>
              </>}
        </Card>
      </div>

      <Card className="p-6 mt-6">
        <h3 className="font-extrabold text-slate-900 mb-4">Distribusi Status Tugas</h3>
        {sub.length === 0
          ? <EmptyState title="Belum ada pengumpulan" />
          : <div className="space-y-4">
              {sub.map((s) => {
                const total = sub.reduce((a, x) => a + x.value, 0);
                return (
                  <div key={s.name} className="flex items-center gap-4">
                    <span className="w-28 text-sm font-semibold text-slate-600">{s.name.replaceAll('_', ' ')}</span>
                    <ProgressBar value={total ? (s.value / total) * 100 : 0} tone={s.name === 'GRADED' ? 'emerald' : s.name === 'LATE' ? 'amber' : s.name === 'SUBMITTED' ? 'brand' : 'slate'} className="flex-1" />
                    <span className="text-sm font-extrabold text-slate-800 w-8 text-right">{s.value}</span>
                  </div>
                );
              })}
            </div>}
      </Card>
    </Page>
  );
}
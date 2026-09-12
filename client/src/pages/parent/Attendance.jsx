import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../api';
import { Page, Card, Spinner, EmptyState, StatusBadge } from '../../components/ui';
import { CalendarCheck2, CalendarClock, CalendarX } from 'lucide-react';
import dayjs from 'dayjs';

export default function ParentAttendance() {
  const { childId } = useParams();
  const [d, setD] = useState(null);
  useEffect(() => { api(`/parent/child/${childId}/attendance`).then(setD).catch(() => {}); }, [childId]);
  if (!d) return <Spinner />;

  const sum = (s) => d.summary.filter((x) => x.status === s).reduce((a, x) => a + x.c, 0);
  const total = d.summary.reduce((a, x) => a + x.c, 0);
  const pct = total ? Math.round(((sum('PRESENT') + sum('LATE')) / total) * 100) : 0;

  const card = (label, count, cls) => (
    <div className={`rounded-2xl p-4 text-center ${cls}`}>
      <p className="text-xl font-extrabold">{count}</p>
      <p className="text-[10px] font-bold uppercase tracking-wide opacity-70">{label}</p>
    </div>
  );

  return (
    <Page title="Kehadiran Anak" subtitle="Rekap kehadiran dalam 30 hari terakhir.">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        {card('Hadir', sum('PRESENT'), 'bg-emerald-50 text-emerald-700')}
        {card('Terlambat', sum('LATE'), 'bg-amber-50 text-amber-700')}
        {card('Sakit', sum('SICK'), 'bg-sky-50 text-sky-700')}
        {card('Izin', sum('EXCUSED'), 'bg-violet-50 text-violet-700')}
        {card('Alpa', sum('ABSENT'), 'bg-rose-50 text-rose-700')}
      </div>

      <Card className="p-5 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-slate-600">Tingkat kehadiran (hadir + terlambat)</span>
          <span className="text-lg font-extrabold text-indigo-600">{pct}%</span>
        </div>
      </Card>

      <div className="space-y-2.5">
        {d.rows.map((r) => (
          <div key={r.id} className="flex items-center gap-4 rounded-xl border border-slate-100 p-4 bg-white">
            <div className={`h-10 w-10 shrink-0 rounded-xl grid place-items-center ${r.status === 'PRESENT' ? 'bg-emerald-50 text-emerald-600' : r.status === 'LATE' ? 'bg-amber-50 text-amber-600' : r.status === 'ABSENT' ? 'bg-rose-50 text-rose-600' : 'bg-sky-50 text-sky-600'}`}>
              {r.status === 'PRESENT' || r.status === 'LATE' ? <CalendarCheck2 size={18} /> : r.status === 'ABSENT' ? <CalendarX size={18} /> : <CalendarClock size={18} />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-extrabold text-slate-800">{dayjs(r.date).format('dddd, D MMMM YYYY')}</p>
              <p className="text-[11px] text-slate-400">{r.class_name || '—'} {r.check_in_time && `· Check-in ${r.check_in_time}`}</p>
            </div>
            <StatusBadge status={r.status} />
          </div>
        ))}
        {d.rows.length === 0 && <EmptyState title="Belum ada catatan kehadiran" />}
      </div>
    </Page>
  );
}
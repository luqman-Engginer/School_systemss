import { useEffect, useState } from 'react';
import { api } from '../../api';
import { Page, Card, Spinner, EmptyState, StatusBadge } from '../../components/ui';
import { CalendarCheck2, CalendarClock, CalendarX } from 'lucide-react';
import dayjs from 'dayjs';

export default function StudentAttendance() {
  const [d, setD] = useState(null);
  useEffect(() => { api('/student/attendance').then(setD).catch(() => {}); }, []);
  if (!d) return <Spinner />;

  const sum = (s) => d.summary.filter((x) => x.status === s).reduce((a, x) => a + x.c, 0);
  const total = d.summary.reduce((a, x) => a + x.c, 0);
  const pct = total ? Math.round(((sum('PRESENT') + sum('LATE')) / total) * 100) : 0;

  return (
    <Page title="Kehadiran Saya" subtitle="Rekap kehadiran Anda selama 30 hari terakhir.">
      <Card className="p-6 mb-6 bg-gradient-brand text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-white/80">Tingkat kehadiran</p>
            <p className="text-3xl font-extrabold">{pct}%</p>
          </div>
          <div className="flex gap-3">
            <div className="rounded-xl bg-white/10 px-4 py-3 text-center"><p className="text-xl font-extrabold">{total}</p><p className="text-[10px] font-semibold text-white/70">TOTAL CATATAN</p></div>
            <div className="rounded-xl bg-white/10 px-4 py-3 text-center"><p className="text-xl font-extrabold">{sum('ABSENT')}</p><p className="text-[10px] font-semibold text-white/70">ALPA</p></div>
          </div>
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
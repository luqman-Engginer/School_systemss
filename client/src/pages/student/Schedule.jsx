import { useState } from 'react';
import { Page, Card, Spinner, EmptyState, Badge, ErrorState } from '../../components/ui';
import { useApi } from '../../hooks/useApi';
import { DAY_NAMES } from '../../constants';

export default function StudentSchedule() {
  const [today, setToday] = useState(new Date().getDay());
  const day0 = useApi('/student/schedule?day=0');
  const day1 = useApi('/student/schedule?day=1');
  const day2 = useApi('/student/schedule?day=2');
  const day3 = useApi('/student/schedule?day=3');
  const day4 = useApi('/student/schedule?day=4');
  const day5 = useApi('/student/schedule?day=5');
  const day6 = useApi('/student/schedule?day=6');
  const results = [day0, day1, day2, day3, day4, day5, day6];

  const failed = results.find((r) => r.error);
  if (failed) return <ErrorState error={failed.error} onRetry={() => results.forEach((r) => r.retry())} />;
  if (results.some((r) => !r.data)) return <Spinner />;

  const days = Object.fromEntries(results.map((r, i) => [i, r.data]));

  return (
    <Page title="Jadwal Pelajaran" subtitle="Pahami jadwal harian dan mingguan Anda.">
      <div className="flex flex-wrap gap-2 mb-6">
        {[0, 1, 2, 3, 4, 5, 6].map((d) => (
          <button key={d} onClick={() => setToday(d)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${today === d ? 'bg-gradient-brand text-white shadow-md' : 'bg-white border border-slate-100 text-slate-500 hover:border-indigo-200'}`}>
            {DAY_NAMES[d]}
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        {[today].map((d) => {
          const items = days[d] || [];
          return items.map((s, i) => (
            <Card key={i} className="p-4 flex items-center gap-4">
              <div className="shrink-0 text-center w-24 rounded-xl bg-indigo-50 p-3">
                <p className="text-sm font-extrabold text-indigo-700">{s.start_time}</p>
                <p className="text-[10px] text-indigo-400">– {s.end_time}</p>
              </div>
              <div className="flex-1">
                <p className="font-extrabold text-slate-900">{s.subject_name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{s.teacher_name || '—'}</p>
              </div>
              <Badge tone="slate">{s.room || '—'}</Badge>
            </Card>
          ));
        })}
        {(days[today] || []).length === 0 && <EmptyState title={`Tidak ada pelajaran hari ${DAY_NAMES[today].toLowerCase()}`} />}
      </div>
    </Page>
  );
}
import { useEffect, useState } from 'react';
import { api } from '../../api';
import { Page, Card, Spinner, EmptyState, Badge } from '../../components/ui';
import { DAY_NAMES } from '../../constants';

export default function TeacherSchedule() {
  const [d, setD] = useState(null);
  useEffect(() => { api('/teacher/dashboard').then(setD).catch(() => {}); }, []);
  if (!d) return <Spinner />;

  const days = [1, 2, 3, 4, 5, 6, 0];

  return (
    <Page title="Jadwal Mengajar" subtitle="Jadwal mingguan mata pelajaran yang Anda ampu.">
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {days.map((day) => {
          const all = d.weekly;
          const dayItems = (all && all[day]) || [];
          return (
            <Card key={day} className="p-4 min-h-[180px]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-extrabold text-slate-900">{DAY_NAMES[day]}</h3>
                <Badge tone={dayItems.length ? 'indigo' : 'slate'}>{dayItems.length} kelas</Badge>
              </div>
              <div className="space-y-2">
                {dayItems.map((s, i) => (
                  <div key={i} className="rounded-xl bg-gradient-brand text-white p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-bold">{s.subject_name}</p>
                      <span className="text-[11px] font-semibold opacity-90">{s.start_time}</span>
                    </div>
                    <p className="text-[11px] mt-1 opacity-90">{s.class_name} · {s.room}</p>
                  </div>
                ))}
                {dayItems.length === 0 && <p className="text-sm text-slate-400 text-center py-6">Tidak ada kelas</p>}
              </div>
            </Card>
          );
        })}
      </div>
    </Page>
  );
}
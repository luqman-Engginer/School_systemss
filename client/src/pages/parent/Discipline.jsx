import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../api';
import { Page, Card, Spinner, EmptyState, Badge } from '../../components/ui';
import { ShieldAlert } from 'lucide-react';
import dayjs from 'dayjs';

export default function ParentDiscipline() {
  const { childId } = useParams();
  const [d, setD] = useState(null);
  useEffect(() => { api(`/parent/child/${childId}/discipline`).then(setD).catch(() => {}); }, [childId]);
  if (!d) return <Spinner />;

  const totalPoints = d.reduce((a, r) => a + (r.point || 0), 0);

  return (
    <Page title="Disiplin Anak" subtitle="Catatan kedisiplinan dan poin pelanggaran.">
      <Card className="p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className={`h-14 w-14 rounded-2xl grid place-items-center ${totalPoints > 0 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
            <ShieldAlert size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Total poin catatan</p>
            <p className={`text-3xl font-extrabold ${totalPoints > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{totalPoints}</p>
          </div>
          <div className="ml-auto text-right">
            <Badge tone={totalPoints > 0 ? 'rose' : 'green'}>{d.length} catatan</Badge>
            <p className="text-[11px] text-slate-400 mt-1">{totalPoints === 0 ? 'Pembinaan diberikan dalam bentuk kebaikan. Pertahankan! 💪' : 'Perlu pembinaan lanjutan. Diskusikan dengan wali kelas.'}</p>
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        {d.map((r) => (
          <Card key={r.id} className="p-5">
            <div className="flex flex-wrap items-start gap-4">
              <div className={`h-11 w-11 shrink-0 rounded-2xl grid place-items-center ${r.point > 0 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}><ShieldAlert size={18} /></div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-extrabold text-slate-900">{r.category}</p>
                  <Badge tone={r.point > 0 ? 'rose' : 'green'}>{r.point > 0 ? `-${r.point}` : `+${Math.abs(r.point)}`} poin</Badge>
                  <Badge tone="slate">{(r.status || 'OPEN').replaceAll('_', ' ')}</Badge>
                </div>
                <p className="text-sm text-slate-500 mt-1.5">{r.description}</p>
                <p className="text-[11px] text-slate-400 mt-1">{dayjs(r.date).format('D MMMM YYYY')}</p>
              </div>
            </div>
          </Card>
        ))}
        {d.length === 0 && <EmptyState title="Tidak ada catatan kedisiplinan" desc="Anak Anda tetap tertib. Pertahankan!" />}
      </div>
    </Page>
  );
}
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api';
import { Page, Card, Spinner, EmptyState, StatusBadge, Badge } from '../../components/ui';
import { MessageSquare } from 'lucide-react';
import dayjs from 'dayjs';

export default function ParentFeedback() {
  const { childId } = useParams();
  const navigate = useNavigate();
  const [d, setD] = useState(null);
  useEffect(() => { api(`/parent/child/${childId}/feedback`).then(setD).catch(() => {}); }, [childId]);
  if (!d) return <Spinner />;

  return (
    <Page title="Feedback Guru" subtitle="Catatan perkembangan anak dari para guru.">
      <div className="space-y-3">
        {d.map((f) => (
          <Card key={f.id} className="p-5">
            <div className="flex flex-wrap items-start gap-4">
              <div className="h-11 w-11 shrink-0 rounded-2xl bg-violet-100 grid place-items-center text-violet-600"><MessageSquare size={18} /></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700 leading-relaxed">{f.content}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge tone="indigo">{f.teacher_name || 'Guru'}</Badge>
                  {f.subject_name && <Badge tone="slate">{f.subject_name}</Badge>}
                  <span className="text-[11px] text-slate-400">· {dayjs(f.created_at + 'Z').format('D MMM YYYY HH:mm')}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
        {d.length === 0 && <EmptyState title="Belum ada feedback dari guru" />}
      </div>

      <div className="mt-6 flex gap-2">
        <button className="btn-outline btn-sm" onClick={() => navigate(`/wali/anak/${childId}`)}>Kembali ke Overview</button>
      </div>
    </Page>
  );
}
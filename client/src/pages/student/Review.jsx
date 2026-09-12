import { useEffect, useState } from 'react';
import { api } from '../../api';
import { Page, Card, Spinner, EmptyState, Badge, useToast, VideoModal } from '../../components/ui';
import { RefreshCw, Play, FileText, Link2, CheckCircle2 } from 'lucide-react';
import dayjs from 'dayjs';

export default function StudentReview() {
  const [rows, setRows] = useState(null);
  const [video, setVideo] = useState(null);
  const toast = useToast();
  const load = () => api('/student/review').then(setRows).catch(() => {});
  useEffect(() => { load(); }, []);
  if (!rows) return <Spinner />;

  const review = async (m) => {
    try { await api(`/student/review/${m.material_id}`, { method: 'POST' }); toast.success('Review dicatat. Ulang materi membantu pemahaman!'); load(); } catch (e) { toast.error(e.message); }
  };

  return (
    <Page title="Ulangi Materi (Review)" subtitle="Materi yang telah selesai ditandai untuk pengulangan.">
      <div className="space-y-4">
        {rows.map((m) => (
          <Card key={m.material_id} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-4 min-w-0">
                <div className={`h-12 w-12 shrink-0 rounded-2xl grid place-items-center ${m.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                  {m.status === 'COMPLETED' ? <CheckCircle2 size={20} /> : <RefreshCw size={20} />}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-extrabold text-slate-900">{m.title}</p>
                    <Badge tone={m.status === 'COMPLETED' ? 'green' : 'amber'}>{m.status.replaceAll('_', ' ')}</Badge>
                    <Badge tone="indigo">{m.subject_name}</Badge>
                  </div>
                  {m.description && <p className="text-sm text-slate-500 mt-1.5 line-clamp-2">{m.description}</p>}
                  <p className="text-[11px] text-slate-400 mt-1.5">Review terakhir: {m.last_reviewed ? dayjs(m.last_reviewed + 'Z').format('D MMM YYYY HH:mm') : '—'} · Dilakukan {m.review_count}x review</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {m.video_url && <button className="btn-outline btn-sm" onClick={() => setVideo(m.video_url)}><Play size={13} /> Video</button>}
                    {m.file_url && <a className="btn-outline btn-sm" href={m.file_url} target="_blank" rel="noreferrer"><FileText size={13} /> Modul</a>}
                    {m.external_link && <a className="btn-outline btn-sm" href={m.external_link} target="_blank" rel="noreferrer"><Link2 size={13} /> Tautan</a>}
                    <button className="btn-primary btn-sm" onClick={() => review(m)}><RefreshCw size={13} /> Review Sekarang</button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
        {rows.length === 0 && <EmptyState title="Belum ada materi untuk direview" />}
      </div>
      {video && <VideoModal url={video} onClose={() => setVideo(null)} />}
    </Page>
  );
}
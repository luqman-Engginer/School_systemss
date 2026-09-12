import { useEffect, useState } from 'react';
import { api } from '../../api';
import { Page, Card, Spinner, EmptyState, Badge, useToast, VideoModal } from '../../components/ui';
import { AlertTriangle, Play, FileText, RotateCw } from 'lucide-react';

export default function StudentMissed() {
  const [rows, setRows] = useState(null);
  const [video, setVideo] = useState(null);
  const toast = useToast();
  const load = () => api('/student/missed-learning').then(setRows).catch(() => {});
  useEffect(() => { load(); }, []);
  if (!rows) return <Spinner />;

  const review = async (m) => {
    try { await api(`/student/review/${m.material_id}`, { method: 'POST' }); toast.success('Tercatat sebagai reviewed. Anda bisa menandai selesai dari materi.'); load(); } catch (e) { toast.error(e.message); }
  };

  return (
    <Page title="Materi Terlewat" subtitle="Material progress yang belum ditandai selesai. Catch up sekarang.">
      {rows.length === 0 && <EmptyState title="Tidak ada materi terlewat" desc="Mantap! Semua materi sudah Anda pelajari." />}
      <div className="space-y-4">
        {rows.map((m) => (
          <Card key={m.material_id} className="p-5 border-rose-100">
            <div className="flex flex-wrap items-start gap-4">
              <div className="h-12 w-12 shrink-0 rounded-2xl bg-rose-100 grid place-items-center text-rose-600"><AlertTriangle size={20} /></div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-extrabold text-slate-900">{m.title}</p>
                  <Badge tone="rose">Pertemuan {m.meeting}</Badge>
                  <Badge tone="indigo">{m.subject_name}</Badge>
                </div>
                {m.description && <p className="text-sm text-slate-500 mt-2 line-clamp-2">{m.description}</p>}
                <p className="text-xs text-slate-400 mt-1.5">{m.teacher_name || 'Guru'}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {m.video_url && <button className="btn-outline btn-sm" onClick={() => setVideo(m.video_url)}><Play size={13} /> Tonton Video</button>}
                  {m.file_url && <a className="btn-outline btn-sm" href={m.file_url} target="_blank" rel="noreferrer"><FileText size={13} /> Unduh</a>}
                  <button className="btn-primary btn-sm" onClick={() => review(m)}><RotateCw size={13} /> Tandai Dipelajari</button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      {video && <VideoModal url={video} onClose={() => setVideo(null)} />}
    </Page>
  );
}
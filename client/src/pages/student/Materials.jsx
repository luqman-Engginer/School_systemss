import { useEffect, useState } from 'react';
import { api } from '../../api';
import { Page, Card, Spinner, Badge, useToast, VideoModal, EmptyState } from '../../components/ui';
import { BookOpen, Play, CheckCircle2, Circle, Link2, FileText } from 'lucide-react';

export default function StudentMaterials() {
  const [rows, setRows] = useState(null);
  const [video, setVideo] = useState(null);
  const toast = useToast();

  const load = () => api('/student/materials').then(setRows).catch(() => {});
  useEffect(() => { load(); }, []);

  if (!rows) return <Spinner />;

  const setStatus = async (m, status) => {
    try {
      await api(`/student/materials/${m.id}/progress`, { method: 'POST', body: { status } });
      toast.success(status === 'COMPLETED' ? 'Materi ditandai selesai. Poin progress bertambah!' : 'Mulai dipelajari.');
      load();
    } catch (e) { toast.error(e.message); }
  };

  const grouped = rows.reduce((acc, m) => {
    const key = m.subject_name;
    (acc[key] = acc[key] || []).push(m);
    return acc;
  }, {});

  return (
    <Page title="Materi Pembelajaran" subtitle="Akses semua materi pembelajaran dan tandai progres Anda.">
      {Object.entries(grouped).map(([subject, list]) => {
        const done = list.filter((m) => m.progress_status === 'COMPLETED').length;
        return (
          <section key={subject} className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-extrabold text-slate-900 flex items-center gap-2"><BookOpen size={16} className="text-indigo-500" /> {subject}</h3>
              <span className="text-xs font-bold text-slate-400">{done}/{list.length} selesai</span>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {list.map((m) => (
                <Card key={m.id} className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-extrabold text-slate-900">{m.title}</p>
                        <Badge tone={m.is_extra ? 'amber' : 'indigo'}>{m.is_extra ? 'Ekstra' : `Pertemuan ${m.meeting}`}</Badge>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{m.teacher_name || 'Guru'}</p>
                    </div>
                    <button onClick={() => setStatus(m, m.progress_status === 'COMPLETED' ? 'IN_PROGRESS' : 'COMPLETED')}
                      className={`shrink-0 ${m.progress_status === 'COMPLETED' ? 'text-emerald-500' : 'text-slate-300 hover:text-indigo-500'}`} title="Tandai selesai">
                      {m.progress_status === 'COMPLETED' ? <CheckCircle2 size={26} /> : <Circle size={26} />}
                    </button>
                  </div>
                  {m.description && <p className="mt-3 text-sm text-slate-500 leading-relaxed line-clamp-2">{m.description}</p>}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {m.video_url && <button onClick={() => setVideo(m.video_url)} className="btn-ghost btn-sm"><Play size={13} /> Video</button>}
                    {m.file_url && <a href={m.file_url} target="_blank" rel="noreferrer" className="btn-ghost btn-sm"><FileText size={13} /> Unduh Modul</a>}
                    {m.external_link && <a href={m.external_link} target="_blank" rel="noreferrer" className="btn-ghost btn-sm"><Link2 size={13} /> Tautan</a>}
                  </div>
                  {m.progress_status === 'IN_PROGRESS' && <button onClick={() => setStatus(m, 'COMPLETED')} className="mt-3 w-full btn-primary btn-sm">Tandai Selesai</button>}
                </Card>
              ))}
            </div>
          </section>
        );
      })}
      {rows.length === 0 && <EmptyState title="Belum ada materi untuk kelas Anda" />}

      {video && <VideoModal url={video} onClose={() => setVideo(null)} />}
    </Page>
  );
}
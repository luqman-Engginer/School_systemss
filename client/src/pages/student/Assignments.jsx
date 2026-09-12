import { useEffect, useState } from 'react';
import { api } from '../../api';
import { Page, Card, Spinner, EmptyState, Modal, useToast, StatusBadge, Badge, Avatar } from '../../components/ui';
import { ClipboardList, Send, Star } from 'lucide-react';
import dayjs from 'dayjs';

export default function StudentAssignments() {
  const [rows, setRows] = useState(null);
  const [open, setOpen] = useState(null);
  const [content, setContent] = useState('');
  const toast = useToast();

  const load = () => api('/student/assignments').then(setRows).catch(() => {});
  useEffect(() => { load(); }, []);
  if (!rows) return <Spinner />;

  const submit = async (a) => {
    try {
      await api(`/student/assignments/${a.id}/submit`, { method: 'POST', body: { content } });
      toast.success('Tugas dikumpulkan. Tunggu penilaian guru.');
      setOpen(null); setContent('');
      load();
    } catch (e) { toast.error(e.message); }
  };

  const summarizes = (mapFn) => Object.entries(rows.reduce(mapFn, {})).map(([k, v]) => ({ k, v }));

  return (
    <Page title="Tugas Saya" subtitle="Kerjakan dan kumpulkan tugas tepat waktu.">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {summarizes((acc, a) => { acc[a.my_status] = (acc[a.my_status] || 0) + 1; return acc; }).map(({ k, v }) => (
          <div key={k} className="rounded-xl border border-slate-100 p-3.5 text-center">
            <p className="text-lg font-extrabold text-slate-800">{v}</p><p className="text-[11px] font-semibold text-slate-400">{k.replaceAll('_', ' ')}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {rows.map((a) => {
          const done = ['SUBMITTED', 'GRADED', 'LATE'].includes(a.my_status);
          const late = dayjs().isAfter(dayjs(a.deadline)) && !done;
          return (
            <Card key={a.id} className={`p-5 ${late ? 'border-rose-200' : ''}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-4 min-w-0">
                  <div className="h-12 w-12 shrink-0 rounded-2xl bg-gradient-brand grid place-items-center text-white"><ClipboardList size={20} /></div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-extrabold text-slate-900">{a.title}</p>
                      <StatusBadge status={a.my_status} />
                      {a.grade !== null && <Badge tone="green"><Star size={10} /> {a.grade}/{a.sub_max || a.max_score}</Badge>}
                    </div>
                    <p className="text-sm text-slate-500 mt-1">{a.subject_name} · {a.teacher_name || 'Guru'}</p>
                    <div className="mt-1.5 flex flex-wrap gap-2 text-[11px] text-slate-400">
                      <span>Deadline: <b className={late ? 'text-rose-500' : ''}>{dayjs(a.deadline).format('dddd, D MMM YYYY')}</b></span>
                      {a.submitted_at && <span>· Dikumpulkan {dayjs(a.submitted_at).format('D MMM, HH:mm')}</span>}
                    </div>
                  </div>
                </div>
                {!done && (
                  <div className="flex gap-2 shrink-0">
                    <button className={`btn btn-sm ${late ? 'btn-danger' : 'btn-primary'}`} onClick={() => setOpen(a)}><Send size={14} /> Kumpulkan</button>
                  </div>
                )}
              </div>
              {a.description && <p className="mt-3 text-sm text-slate-500 line-clamp-2">{a.description}</p>}
              {a.my_status === 'GRADED' && a.feedback && (
                <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-100 p-3.5">
                  <p className="text-xs font-extrabold text-emerald-700 mb-1">Feedback Guru</p>
                  <p className="text-sm text-emerald-800">{a.feedback}</p>
                </div>
              )}
            </Card>
          );
        })}
        {rows.length === 0 && <EmptyState title="Belum ada tugas" />}
      </div>

      <Modal open={!!open} onClose={() => setOpen(null)} title={`Kumpulkan: ${open?.title || ''}`} footer={null}>
        <p className="text-xs text-slate-400 mb-3">Deadline: {open && dayjs(open.deadline).format('D MMM YYYY')}</p>
        <textarea className="textarea" rows={5} placeholder="Tulis jawaban atau lampirkan tautan pekerjaan Anda..." value={content} onChange={(e) => setContent(e.target.value)} />
        <div className="mt-4 flex justify-end gap-2">
          <button className="btn-outline btn-sm" onClick={() => setOpen(null)}>Batal</button>
          <button className="btn-primary btn-sm" onClick={() => submit(open)}>Kumpulkan Tugas</button>
        </div>
      </Modal>
    </Page>
  );
}
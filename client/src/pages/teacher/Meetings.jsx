import { useState } from 'react';
import { api } from '../../api';
import { Page, Card, Spinner, EmptyState, Modal, useToast, Badge, StatusBadge, ErrorState } from '../../components/ui';
import { useApi } from '../../hooks/useApi';
import { Plus, Video, MapPin, Pencil } from 'lucide-react';
import dayjs from 'dayjs';

export default function TeacherMeetings() {
  const { data: rows, error, retry } = useApi('/teacher/meetings');
  const { data: meta, error: metaError, retry: retryMeta } = useApi('/teacher/my-classes');
  const cls = meta?.classes?.[0]?.id;
  const { data: studentsData, error: studentsError, retry: retryStudents } = useApi(`/teacher/students?class_id=${cls}`, { enabled: !!cls });
  const { data: parentsData, error: parentsError, retry: retryParents } = useApi('/teacher/parents', { enabled: !!cls });
  const students = studentsData ?? [];
  const parents = (parentsData ?? []).filter((p) => p.students.some((s) => s.class_id === cls));
  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState(null);
  const toast = useToast();

  const load = () => { retry(); retryMeta(); retryStudents(); retryParents(); };

  if (error) return <ErrorState error={error} onRetry={retry} />;
  if (metaError) return <ErrorState error={metaError} onRetry={retryMeta} />;
  if (studentsError) return <ErrorState error={studentsError} onRetry={retryStudents} />;
  if (parentsError) return <ErrorState error={parentsError} onRetry={retryParents} />;
  if (!rows || !meta) return <Spinner />;

  const save = async (f) => {
    try {
      if (sel) await api(`/teacher/meetings/${sel.id}`, { method: 'PUT', body: f });
      else await api('/teacher/meetings', { method: 'POST', body: f });
      toast.success('Meeting disimpan.');
      setOpen(false);
      load();
    } catch (e) { toast.error(e.message); }
  };

  const changeStatus = async (m, status) => {
    try { await api(`/teacher/meetings/${m.id}`, { method: 'PUT', body: { status } }); toast.success('Status diperbarui.'); load(); } catch (e) { toast.error(e.message); }
  };

  return (
    <Page title="Pertemuan Orang Tua" subtitle="Jadwalkan dan kelola pertemuan dengan orang tua murid."
      actions={<button className="btn-primary btn-sm" onClick={() => { setSel(null); setOpen(true); }}><Plus size={15} /> Jadwalkan Meeting</button>}>
      <div className="space-y-4">
        {rows.map((m) => (
          <Card key={m.id} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-4 min-w-0">
                <div className="h-11 w-11 shrink-0 rounded-2xl grid place-items-center text-white" style={{ background: m.meeting_type === 'ONLINE' ? 'linear-gradient(135deg,#8b5cf6,#a78bfa)' : 'linear-gradient(135deg,#0ea5e9,#38bdf8)' }}>
                  {m.meeting_type === 'ONLINE' ? <Video size={18} /> : <MapPin size={18} />}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-extrabold text-slate-900">{m.topic || 'Konsultasi'}</p>
                    <StatusBadge status={m.status} />
                    <Badge tone={m.meeting_type === 'ONLINE' ? 'violet' : 'blue'}>{m.meeting_type}</Badge>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">Siswa: {m.student_name} · Orang tua: {m.parent_name}</p>
                  <p className="text-xs text-slate-400 mt-1">{dayjs(m.date).format('dddd, D MMMM YYYY')} · {m.start_time}–{m.end_time} · {m.location || 'Ruang pertemuan'}</p>
                </div>
              </div>
              <div className="flex gap-1.5">
                <button className="btn-ghost btn-sm !px-2" onClick={() => { setSel(m); setOpen(true); }}><Pencil size={16} /></button>
              </div>
            </div>
            {m.status === 'REQUESTED' && (
              <div className="mt-3 pt-3 border-t border-slate-100 flex gap-2">
                <button className="btn-primary btn-sm" onClick={() => changeStatus(m, 'SCHEDULED')}>Konfirmasi</button>
                <button className="btn-danger btn-sm" onClick={() => changeStatus(m, 'CANCELLED')}>Batalkan</button>
              </div>
            )}
          </Card>
        ))}
        {rows.length === 0 && <EmptyState title="Belum ada pertemuan" />}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={`${sel ? 'Ubah' : 'Jadwalkan'} Meeting`} footer={null}>
        <MeetingForm meta={{ parents, students, classes: meta.classes }} sel={sel} onSave={save} onClose={() => setOpen(false)} />
      </Modal>
    </Page>
  );
}

function MeetingForm({ meta, sel, onSave, onClose }) {
  const [f, setF] = useState(() => ({
    parent_id: sel?.parent_id || '',
    student_id: sel?.student_id || '',
    topic: sel?.topic || '',
    date: sel?.date || dayjs().add(1, 'day').format('YYYY-MM-DD'),
    start_time: sel?.start_time || '09:00',
    end_time: sel?.end_time || '10:00',
    location: sel?.location || '',
    meeting_type: sel?.meeting_type || 'OFFLINE',
    notes: sel?.notes || ''
  }));

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <div className="sm:col-span-2 space-y-1.5"><label className="label">Topik</label><input className="input" value={f.topic} onChange={(e) => setF({ ...f, topic: e.target.value })} /></div>
      <div className="space-y-1.5"><label className="label">Siswa</label><select className="select" value={f.student_id} onChange={(e) => setF({ ...f, student_id: e.target.value })}><option value="">Pilih...</option>{meta.students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
      <div className="space-y-1.5"><label className="label">Orang Tua</label><select className="select" value={f.parent_id} onChange={(e) => setF({ ...f, parent_id: e.target.value })}><option value="">Pilih...</option>{meta.parents.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
      <div className="space-y-1.5"><label className="label">Tanggal</label><input type="date" className="input" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></div>
      <div className="space-y-1.5"><label className="label">Waktu</label><div className="flex gap-2"><input type="time" className="input" value={f.start_time} onChange={(e) => setF({ ...f, start_time: e.target.value })} /><input type="time" className="input" value={f.end_time} onChange={(e) => setF({ ...f, end_time: e.target.value })} /></div></div>
      <div className="space-y-1.5"><label className="label">Tipe</label><select className="select" value={f.meeting_type} onChange={(e) => setF({ ...f, meeting_type: e.target.value })}><option value="OFFLINE">Offline (Tatap muka)</option><option value="ONLINE">Online (Video)</option></select></div>
      <div className="space-y-1.5"><label className="label">Lokasi / Tautan</label><input className="input" value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} /></div>
      <div className="space-y-1.5"><label className="label">Catatan</label><textarea className="textarea" value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></div>
      <div className="flex justify-end gap-2 sm:col-span-2">
        <button className="btn-outline btn-sm" onClick={onClose}>Batal</button>
        <button className="btn-primary btn-sm" onClick={() => onSave(f)}>{sel ? 'Simpan Perubahan' : 'Jadwalkan'}</button>
      </div>
    </div>
  );
}
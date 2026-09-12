import { useEffect, useState } from 'react';
import { api } from '../../api';
import { Page, Card, Spinner, EmptyState, Modal, useToast, StatusBadge, Badge } from '../../components/ui';
import { Video, MapPin, CalendarDays } from 'lucide-react';
import dayjs from 'dayjs';

export default function ParentMeetings() {
  const [rows, setRows] = useState(null);
  const toast = useToast();
  const load = () => api('/parent/meetings').then(setRows).catch(() => {});
  useEffect(() => { load(); }, []);
  if (!rows) return <Spinner />;

  const update = async (m, status) => {
    const next = status === 'ACCEPTED' ? 'SCHEDULED' : 'CANCELLED';
    try { await api(`/parent/meetings/${m.id}`, { method: 'PUT', body: { status: next } }); toast.success(`Meeting ${status === 'ACCEPTED' ? 'diterima' : 'ditolak'}.`); load(); } catch (e) { toast.error(e.message); }
  };

  return (
    <Page title="Pertemuan Orang Tua" subtitle="Jadwal meeting dengan guru & wali kelas.">
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
                    <p className="font-extrabold text-slate-900">{m.topic}</p>
                    <StatusBadge status={m.status} />
                    <Badge tone={m.meeting_type === 'ONLINE' ? 'violet' : 'blue'}>{m.meeting_type}</Badge>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">Guru: {m.teacher_name} · Siswa: {m.student_name}</p>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1"><CalendarDays size={12} /> {dayjs(m.date).format('dddd, D MMMM YYYY')} · {m.start_time}–{m.end_time} · {m.location || 'Ruang pertemuan'}</p>
                </div>
              </div>
              {m.status === 'REQUESTED' && (
                <div className="flex gap-2 shrink-0">
                  <button className="btn-primary btn-sm" onClick={() => update(m, 'ACCEPTED')}>Terima</button>
                  <button className="btn-danger btn-sm" onClick={() => update(m, 'DECLINED')}>Tolak</button>
                </div>
              )}
            </div>
            {m.notes && <p className="mt-3 text-sm text-slate-500 italic">"{m.notes}"</p>}
          </Card>
        ))}
        {rows.length === 0 && <EmptyState title="Belum ada pertemuan" />}
      </div>
    </Page>
  );
}
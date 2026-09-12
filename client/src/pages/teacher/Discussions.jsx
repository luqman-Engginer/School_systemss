import { useEffect, useState } from 'react';
import { api, getUser } from '../../api';
import { Page, Card, Spinner, EmptyState, Modal, useToast, Avatar, Badge } from '../../components/ui';
import { Plus, Send, Users, MessageCircle } from 'lucide-react';
import dayjs from 'dayjs';

export default function TeacherDiscussions() {
  const [rows, setRows] = useState(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState(null);
  const [text, setText] = useState('');
  const toast = useToast();

  const load = () => api('/teacher/discussions').then(setRows).catch(() => {});
  useEffect(() => { load(); }, []);
  if (!rows) return <Spinner />;

  const openRoom = async (room) => {
    setActive(room);
    const d = await api(`/teacher/discussions/${room.id}/messages`).catch(() => null);
    if (d) setMessages(d);
  };

  const send = async () => {
    if (!text.trim()) return;
    try {
      await api(`/teacher/discussions/${active.id}/messages`, { method: 'POST', body: { content: text } });
      setText('');
      openRoom(active);
    } catch (e) { toast.error(e.message); }
  };

  return (
    <Page title="Ruang Diskusi" subtitle="Diskusikan topik pembelajaran bersama siswa."
      actions={<button className="btn-primary btn-sm" onClick={() => setOpen(true)}><Plus size={15} /> Buat Diskusi</button>}>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="p-4 lg:max-h-[70vh] overflow-y-auto">
          <div className="space-y-2">
            {rows.map((r) => (
              <button key={r.id} onClick={() => openRoom(r)} className={`w-full rounded-xl border p-3.5 text-left transition-all ${active?.id === r.id ? 'border-indigo-300 bg-indigo-50/50' : 'border-slate-100 hover:border-indigo-200'}`}>
                <p className="text-sm font-extrabold text-slate-900 truncate">{r.title}</p>
                <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1"><MessageCircle size={11} /> {r.message_count} pesan</span>
                  <Badge tone={r.type === 'CLASS_DISCUSSION' ? 'indigo' : 'violet'}>{r.type.replaceAll('_', ' ')}</Badge>
                </div>
              </button>
            ))}
            {rows.length === 0 && <EmptyState title="Belum ada ruang diskusi" />}
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2 min-h-[60vh] flex flex-col">
          {!messages ? (
            <EmptyState title="Pilih ruang diskusi" desc="Klik salah satu ruang di sebelah kiri untuk melihat percakapan." />
          ) : (
            <>
              <div className="border-b border-slate-100 pb-4 mb-4">
                <h3 className="font-extrabold text-slate-900">{messages.room.title}</h3>
                <p className="text-xs text-slate-400 mt-1">{messages.room.description}</p>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto max-h-[45vh] pr-1">
                {messages.messages.map((m) => (
                  <MessageBubble key={m.id} m={m} />
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <input className="input flex-1" placeholder="Tulis pesan..." value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} />
                <button className="btn-primary btn-sm" onClick={send}><Send size={15} /></button>
              </div>
            </>
          )}
        </Card>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Buat Ruang Diskusi" footer={null}>
        <NewRoomForm onClose={() => setOpen(false)} onCreated={() => { setOpen(false); load(); }} />
      </Modal>
    </Page>
  );
}

export function MessageBubble({ m }) {
  const me = String(getUser()?.id ?? '');
  const mine = String(m.sender_id) === me;
  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${mine ? 'bg-gradient-brand text-white rounded-br-sm' : 'bg-slate-100 text-slate-800 rounded-bl-sm'}`}>
        {!mine && <p className="text-[10px] font-bold mb-0.5 opacity-70">{m.sender_name}</p>}
        <p className="text-sm leading-relaxed">{m.content}</p>
        <p className={`text-[10px] mt-1 ${mine ? 'text-white/70' : 'text-slate-400'}`}>{dayjs(m.created_at + 'Z').format('HH:mm')}</p>
      </div>
    </div>
  );
}

function NewRoomForm({ onClose, onCreated }) {
  const [f, setF] = useState({ title: '', type: 'CLASS_DISCUSSION', description: '', start_date: dayjs().format('YYYY-MM-DD') });
  const [classes, setClasses] = useState([]);
  const [members, setMembers] = useState([]);
  const [classSel, setClassSel] = useState('');
  const [students, setStudents] = useState([]);
  const toast = useToast();

  useEffect(() => {
    api('/teacher/my-classes').then((mc) => {
      setClasses(mc.classes);
      if (mc.classes.length) setClassSel(mc.classes[0].id);
    }).catch(() => {});
  }, []);
  useEffect(() => {
    if (classSel) api(`/teacher/students?class_id=${classSel}`).then(setStudents).catch(() => {});
  }, [classSel]);

  const toggleMember = (id) => setMembers((m) => m.includes(id) ? m.filter((x) => x !== id) : [...m, id]);

  const create = async () => {
    try {
      if (!f.title.trim()) return toast.error('Judul wajib diisi.');
      const body = { ...f, members: members };
      await api('/teacher/discussions', { method: 'POST', body });
      toast.success('Ruang diskusi dibuat.');
      onCreated();
    } catch (e) { toast.error(e.message); }
  };

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <div className="sm:col-span-2 space-y-1.5"><label className="label">Judul Diskusi *</label><input className="input" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></div>
      <div className="space-y-1.5"><label className="label">Tipe</label><select className="select" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}><option value="CLASS_DISCUSSION">Diskusi Kelas</option><option value="SCHOOL_DISCUSSION">Diskusi Sekolah</option><option value="TEACHER_PARENT">Guru &amp; Orang Tua</option><option value="TEACHER_STUDENT">Diskusi Pribadi</option></select></div>
      <div className="space-y-1.5"><label className="label">Kelas</label><select className="select" value={classSel} onChange={(e) => setClassSel(+e.target.value)}>{classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
      <div className="sm:col-span-2 space-y-1.5"><label className="label">Deskripsi</label><textarea className="textarea" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></div>
      {f.type === 'CLASS_DISCUSSION' && (
        <div className="sm:col-span-2">
          <p className="label">Anggota Siswa ({members.length} dipilih)</p>
          <div className="grid sm:grid-cols-2 max-h-44 overflow-y-auto gap-1.5 border border-slate-100 rounded-xl p-2">
            {students.map((s) => (
              <label key={s.id} className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-slate-50 cursor-pointer">
                <input type="checkbox" checked={members.includes(s.id)} onChange={() => toggleMember(s.id)} className="accent-indigo-600" />
                <span className="text-sm text-slate-700">{s.name}</span>
              </label>
            ))}
            {students.length === 0 && <p className="text-sm text-slate-400 p-2">Tidak ada siswa di kelas ini.</p>}
          </div>
        </div>
      )}
      <div className="flex justify-end gap-2 sm:col-span-2">
        <button className="btn-outline btn-sm" onClick={onClose}>Batal</button>
        <button className="btn-primary btn-sm" onClick={create}>Buat Diskusi</button>
      </div>
    </div>
  );
}
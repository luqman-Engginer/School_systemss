import { useEffect, useState } from 'react';
import { api, getUser } from '../../api';
import { Page, Card, Spinner, EmptyState, Badge, useToast } from '../../components/ui';
import { Send, MessageCircle } from 'lucide-react';
import dayjs from 'dayjs';

export default function StudentDiscussions() {
  const [rows, setRows] = useState(null);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState(null);
  const [text, setText] = useState('');
  const toast = useToast();

  const load = () => api('/student/discussions').then(setRows).catch(() => {});
  useEffect(() => { load(); }, []);
  if (!rows) return <Spinner />;

  const openRoom = async (room) => {
    setActive(room);
    const d = await api(`/student/discussions/${room.id}/messages`).catch(() => null);
    if (d) setMessages(d);
  };

  const send = async () => {
    if (!text.trim()) return;
    try {
      await api(`/student/discussions/${active.id}/messages`, { method: 'POST', body: { content: text } });
      setText('');
      openRoom(active);
    } catch (e) { toast.error(e.message); }
  };

  return (
    <Page title="Ruang Diskusi" subtitle="Diskusikan materi pelajaran bersama guru dan teman.">
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
                {messages.messages.map((m) => <MessageBubble key={m.id} m={m} />)}
              </div>
              <div className="mt-4 flex gap-2">
                <input className="input flex-1" placeholder="Tulis pesan..." value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} />
                <button className="btn-primary btn-sm" onClick={send}><Send size={15} /></button>
              </div>
            </>
          )}
        </Card>
      </div>
    </Page>
  );
}

function MessageBubble({ m }) {
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
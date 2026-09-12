import { useEffect, useState } from 'react';
import { api } from '../../api';
import { Page, Card, Spinner, EmptyState, Modal, useToast, StatusBadge, Badge } from '../../components/ui';
import { Megaphone, Send } from 'lucide-react';
import dayjs from 'dayjs';

export default function StudentAspirations() {
  const [rows, setRows] = useState(null);
  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState(null);
  const [f, setF] = useState({ title: '', category: 'Saran', content: '', anonymous: false });
  const toast = useToast();

  const load = () => api('/student/aspirations').then(setRows).catch(() => {});
  useEffect(() => { load(); }, []);
  if (!rows) return <Spinner />;

  const submit = async () => {
    try {
      if (!f.title.trim()) return toast.error('Judul wajib diisi.');
      await api('/student/aspirations', { method: 'POST', body: f });
      toast.success('Aspirasi terkirim ke pihak sekolah. Terima kasih atas masukanmu!');
      setOpen(false);
      setF({ title: '', category: 'Saran', content: '', anonymous: false });
      load();
    } catch (e) { toast.error(e.message); }
  };

  return (
    <Page title="Aspirasi & Suara Siswa" subtitle="Sampaikan saran, ide, atau keluhan secara aman."
      actions={<button className="btn-primary btn-sm" onClick={() => setOpen(true)}><Megaphone size={15} /> Sampaikan Aspirasi</button>}>
      <div className="space-y-4">
        {rows.map((a) => (
          <Card key={a.id} className="p-5 cursor-pointer card-hover" onClick={() => setSel(a)}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-extrabold text-slate-900">{a.anonymous ? 'Anonim' : a.student_name || 'Siswa'}</p>
                  <Badge tone={a.anonymous ? 'slate' : 'indigo'}>{a.anonymous ? 'Anonim' : 'Teridentifikasi'}</Badge>
                  {a.category && <Badge tone="violet">{a.category}</Badge>}
                  <StatusBadge status={a.status} />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">{dayjs(a.created_at + 'Z').format('D MMM YYYY, HH:mm')}</p>
                <p className="mt-3 text-sm text-slate-700 leading-relaxed">{a.content}</p>
                {a.admin_response && (
                  <div className="mt-3 rounded-xl bg-slate-50 border border-slate-200 p-3.5">
                    <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wide mb-1">Respon Pihak Sekolah</p>
                    <p className="text-sm text-slate-600">{a.admin_response}</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
        {rows.length === 0 && <EmptyState title="Belum ada aspirasi" desc="Suaramu didengar. Sampaikan aspirasi pertama Anda!" />}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Sampaikan Aspirasi" footer={null}>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2 space-y-1.5"><label className="label">Judul Aspirasi*</label><input className="input" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="Saran: ... / Keluhan: ... / Ide: ..." /></div>
          <div className="space-y-1.5"><label className="label">Kategori</label><select className="select" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}><option>Saran</option><option>Ide</option><option>Keluhan</option><option>Kegiatan</option><option>Lainnya</option></select></div>
          <div className="flex items-end gap-2 pb-1">
            <button type="button" onClick={() => setF({ ...f, anonymous: !f.anonymous })} className={`w-12 h-7 rounded-full transition-colors relative ${f.anonymous ? 'bg-slate-800' : 'bg-slate-200'}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${f.anonymous ? 'left-6' : 'left-1'}`} /></button>
            <span className="text-sm text-slate-600">Kirim secara anonim</span>
          </div>
          <div className="sm:col-span-2 space-y-1.5"><label className="label">Isi Aspirasi</label><textarea className="textarea" rows={5} value={f.content} onChange={(e) => setF({ ...f, content: e.target.value })} placeholder="Tulis aspirasi Anda secara lengkap dan sopan..." /></div>
          <div className="sm:col-span-2 flex justify-end gap-2">
            <button className="btn-outline btn-sm" onClick={() => setOpen(false)}>Batal</button>
            <button className="btn-primary btn-sm" onClick={submit}><Send size={14} /> Kirim</button>
          </div>
        </div>
      </Modal>

      {sel && (
        <Modal open onClose={() => setSel(null)} title="Detail Aspirasi" footer={null}>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge tone={sel.anonymous ? 'slate' : 'indigo'}>{sel.anonymous ? 'Anonim' : sel.student_name}</Badge>
            {sel.category && <Badge tone="violet">{sel.category}</Badge>}
            <StatusBadge status={sel.status} />
          </div>
          <p className="text-sm text-slate-700 leading-relaxed">{sel.content}</p>
          {sel.admin_response && (
            <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200 p-3.5">
              <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wide mb-1">Respon Pihak Sekolah</p>
              <p className="text-sm text-slate-600">{sel.admin_response}</p>
            </div>
          )}
        </Modal>
      )}
    </Page>
  );
}
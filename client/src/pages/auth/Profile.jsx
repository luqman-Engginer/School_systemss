import { useEffect, useState } from 'react';
import { api } from '../../api';
import { Page, Card, Modal, useToast, Spinner, Avatar, Badge } from '../../components/ui';
import { UserCircle2, Eye, EyeOff } from 'lucide-react';

export default function Profile() {
  const [me, setMe] = useState(null);
  const [f, setF] = useState({ name: '', phone: '', photo: '' });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwOpen, setPwOpen] = useState(false);
  const [show, setShow] = useState(false);
  const toast = useToast();

  const load = () => api('/auth/me').then((d) => { setMe(d); setF({ name: d.name, phone: d.phone || '', photo: d.photo || '' }); }).catch(() => {});
  useEffect(() => { load(); }, []);
  if (!me) return <Spinner />;

  const save = async () => {
    try {
      await api('/auth/profile', { method: 'PUT', body: f });
      toast.success('Profil diperbarui.');
      load();
    } catch (e) { toast.error(e.message); }
  };

  const savePw = async () => {
    if (pw.newPassword.length < 6) return toast.error('Password baru minimal 6 karakter.');
    if (pw.newPassword !== pw.confirm) return toast.error('Konfirmasi password tidak cocok.');
    try {
      await api('/auth/change-password', { method: 'POST', body: { currentPassword: pw.currentPassword, newPassword: pw.newPassword } });
      toast.success('Password berhasil diubah.');
      setPwOpen(false);
      setPw({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (e) { toast.error(e.message); }
  };

  const extra = me.extra;
  const extraText = [
    extra?.position && `Jabatan: ${extra.position}`,
    extra?.subject && `Mata pelajaran: ${extra.subject}`,
    extra?.nis && `NIS: ${extra.nis}`,
    extra?.gender && `Jenis kelamin: ${extra.gender}`,
    extra?.birth_date && `Tanggal lahir: ${extra.birth_date}`,
    extra?.occupation && `Pekerjaan: ${extra.occupation}`
  ].filter(Boolean).join(' · ');

  return (
    <Page title="Profil Saya" subtitle="Kelola informasi akun Anda.">
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="p-6 text-center lg:sticky lg:top-20 self-start">
          <Avatar src={me.photo} name={me.name} size={96} className="mx-auto !text-2xl" />
          <h3 className="mt-4 text-lg font-extrabold text-slate-900">{me.name}</h3>
          <p className="text-sm text-slate-400">{me.email}</p>
          <div className="mt-3"><Badge tone="indigo">{me.role}</Badge></div>
          <div className="mt-5 pt-5 border-t border-slate-100 text-left space-y-2">
            <div className="flex items-center justify-between text-sm"><span className="text-slate-400">No. HP</span><span className="font-semibold text-slate-700">{me.phone || '—'}</span></div>
            {extraText && <div className="flex items-center justify-between text-sm"><span className="text-slate-400">Info</span><span className="font-semibold text-slate-700 text-right max-w-[60%]">{extraText}</span></div>}
            <button className="btn-outline btn-sm w-full mt-3" onClick={() => setPwOpen(true)}><Eye size={14} /> Ubah Password</button>
          </div>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <h3 className="font-extrabold text-slate-900 mb-5 flex items-center gap-2"><UserCircle2 size={18} className="text-indigo-500" /> Edit Data Diri</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1.5"><label className="label">Nama Lengkap</label><input className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
            <div className="space-y-1.5"><label className="label">Email (tidak dapat diubah)</label><input className="input opacity-60" value={me.email} disabled /></div>
            <div className="space-y-1.5"><label className="label">No. HP</label><input className="input" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="08xxx" /></div>
            <div className="sm:col-span-2 space-y-1.5">
              <label className="label">Foto Profil (URL)</label>
              <div className="flex gap-2">
                <input className="input" value={f.photo} onChange={(e) => setF({ ...f, photo: e.target.value })} placeholder="https://..." />
                {f.photo && <Avatar src={f.photo} name={f.name} size={42} className="shrink-0" />}
              </div>
            </div>
            <div className="sm:col-span-2 flex justify-end gap-2 mt-2">
              <button className="btn-primary" onClick={save}>Simpan Perubahan</button>
            </div>
          </div>
        </Card>
      </div>

      <Modal open={pwOpen} onClose={() => setPwOpen(false)} title="Ubah Password" size="sm" footer={null}>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="label">Password Lama</label>
            <input type={show ? 'text' : 'password'} className="input" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <label className="label">Password Baru</label>
            <input type={show ? 'text' : 'password'} className="input" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <label className="label">Konfirmasi Password Baru</label>
            <input type={show ? 'text' : 'password'} className="input" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />
          </div>
          <button onClick={() => setShow(!show)} className="text-xs text-slate-500 flex items-center gap-1">{show ? <EyeOff size={13} /> : <Eye size={13} />} {show ? 'Sembunyikan' : 'Tampilkan'} password</button>
          <div className="flex justify-end gap-2 pt-2">
            <button className="btn-outline btn-sm" onClick={() => setPwOpen(false)}>Batal</button>
            <button className="btn-primary btn-sm" onClick={savePw}>Ubah Password</button>
          </div>
        </div>
      </Modal>
    </Page>
  );
}
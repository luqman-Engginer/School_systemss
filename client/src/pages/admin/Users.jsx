import { useEffect, useState } from 'react';
import { api } from '../../api';
import { useApi } from '../../hooks/useApi';
import { Page, Card, Modal, Spinner, useToast, Avatar, EmptyState, Badge, Tabs, ErrorState } from '../../components/ui';
import { Plus, Pencil, Trash2, Search, Users, Download, Upload, FileSpreadsheet } from 'lucide-react';

function parseCSV(text) {
  const lines = text.split(/\r\n|\n|\r/).filter((l) => l.trim() !== '');
  if (lines.length < 2) return [];

  const delimiter = lines[0].includes(';') && !lines[0].includes(',') ? ';' : ',';

  const parseLine = (line) => {
    const values = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    return values;
  };

  const headers = parseLine(lines[0]).map((h) => h.toLowerCase().replace(/[\s_]+/g, '_'));

  const records = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]);
    if (values.every((v) => v === '')) continue;
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] || '';
    });
    records.push({
      name: row.name || row.nama || row.nama_lengkap || '',
      email: row.email || '',
      nis: row.nis || row.nomor_induk || '',
      gender: (row.gender || row.jenis_kelamin || row.jk || 'L').toUpperCase().startsWith('P') ? 'P' : 'L',
      class_id: row.class_id || row.kelas_id || row.id_kelas || ''
    });
  }
  return records;
}

function downloadCSVTemplate() {
  const csvContent = 'name,email,nis,gender,class_id\nAhmad Fauzi,ahmad.fauzi@student.sch.id,2026201,L,1\nSiti Nurhaliza,siti.nurhaliza@student.sch.id,2026202,P,1\n';
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'template_import_murid.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function ImportModal({ open, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const toast = useToast();

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setResult(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result || '';
        const records = parseCSV(text);
        setParsedData(records);
        if (records.length === 0) {
          toast.error('File CSV kosong atau format header tidak sesuai.');
        }
      } catch (err) {
        toast.error('Gagal membaca file CSV: ' + err.message);
      }
    };
    reader.readAsText(f);
  };

  const handleImport = async () => {
    if (!parsedData.length) return;
    setLoading(true);
    try {
      const res = await api('/admin/users/import', { method: 'POST', body: parsedData });
      setResult(res);
      if (res.successCount > 0) {
        toast.success(`Berhasil mengimpor ${res.successCount} murid.`);
        onSuccess?.();
      } else {
        toast.error('Tidak ada murid yang berhasil diimpor.');
      }
    } catch (err) {
      toast.error(err.message || 'Gagal mengimpor data.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setParsedData([]);
    setResult(null);
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Impor Data Murid (CSV)" footer={null}>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 rounded-lg bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900">
          <div>
            <p className="font-semibold">Format Kolom CSV:</p>
            <p className="text-indigo-700 font-mono text-[11px] mt-0.5">name, email, nis, gender, class_id</p>
            <p className="text-indigo-600 text-[11px] mt-1">* Password awal otomatis diatur sama dengan NIS.</p>
          </div>
          <button type="button" onClick={downloadCSVTemplate} className="btn-secondary btn-sm flex items-center gap-1 shrink-0 bg-white">
            <Download size={14} /> Template
          </button>
        </div>

        {!result ? (
          <>
            <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-xl p-6 text-center transition-colors">
              <input type="file" accept=".csv,text/csv" id="csv-upload" className="hidden" onChange={handleFileChange} />
              <label htmlFor="csv-upload" className="cursor-pointer flex flex-col items-center gap-2">
                <FileSpreadsheet size={36} className="text-indigo-600" />
                <span className="text-sm font-semibold text-slate-700">
                  {file ? file.name : 'Pilih file CSV untuk diimpor'}
                </span>
                <span className="text-xs text-slate-400">Klik di sini untuk menelusuri file dari perangkat</span>
              </label>
            </div>

            {parsedData.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span>Pratinjau ({parsedData.length} baris terdeteksi):</span>
                </div>
                <div className="max-h-48 overflow-y-auto border border-slate-100 rounded-lg text-xs">
                  <table className="table-shell w-full text-[11px]">
                    <thead className="bg-slate-50 sticky top-0">
                      <tr>
                        <th>#</th>
                        <th>Nama</th>
                        <th>Email</th>
                        <th>NIS</th>
                        <th>JK</th>
                        <th>Class ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedData.slice(0, 5).map((row, idx) => (
                        <tr key={idx}>
                          <td className="text-slate-400">{idx + 1}</td>
                          <td className="font-medium text-slate-800">{row.name || '—'}</td>
                          <td>{row.email || '—'}</td>
                          <td>{row.nis || '—'}</td>
                          <td>{row.gender || 'L'}</td>
                          <td>{row.class_id || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {parsedData.length > 5 && (
                  <p className="text-[11px] text-slate-400 text-right">Dan {parsedData.length - 5} baris lainnya...</p>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="btn-outline btn-sm" onClick={handleClose}>
                Batal
              </button>
              <button
                type="button"
                disabled={!parsedData.length || loading}
                className="btn-primary btn-sm flex items-center gap-1.5"
                onClick={handleImport}
              >
                {loading ? <Spinner size={14} /> : <Upload size={14} />}
                <span>{loading ? 'Mengimpor...' : `Impor ${parsedData.length} Murid`}</span>
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <p className="text-xs text-slate-500 font-medium">Total</p>
                <p className="text-lg font-bold text-slate-800">{result.total}</p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                <p className="text-xs text-emerald-600 font-medium">Berhasil</p>
                <p className="text-lg font-bold text-emerald-700">{result.successCount}</p>
              </div>
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-100">
                <p className="text-xs text-rose-600 font-medium">Gagal</p>
                <p className="text-lg font-bold text-rose-700">{result.failedCount}</p>
              </div>
            </div>

            {result.results && result.results.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-700">Rincian Hasil Impor:</p>
                <div className="max-h-52 overflow-y-auto border border-slate-100 rounded-lg">
                  <table className="table-shell w-full text-[11px]">
                    <thead className="bg-slate-50 sticky top-0">
                      <tr>
                        <th>Baris</th>
                        <th>Nama</th>
                        <th>Email</th>
                        <th>Status</th>
                        <th>Keterangan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.results.map((r, i) => (
                        <tr key={i} className={r.status === 'FAILED' ? 'bg-rose-50/40' : ''}>
                          <td>{r.row}</td>
                          <td className="font-medium">{r.name || '—'}</td>
                          <td>{r.email || '—'}</td>
                          <td>
                            <Badge tone={r.status === 'SUCCESS' ? 'green' : 'red'}>
                              {r.status === 'SUCCESS' ? 'Berhasil' : 'Gagal'}
                            </Badge>
                          </td>
                          <td className="text-slate-500">{r.reason || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button type="button" className="btn-primary btn-sm" onClick={handleClose}>
                Selesai
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

function UserForm({ model, onClose, onSave }) {
  const [f, setF] = useState(() => ({
    name: model?.name || '',
    email: model?.email || '',
    password: '',
    phone: model?.phone || '',
    photo: model?.photo || '',
    role: model?.role || 'STUDENT',
    position: model?.detail?.position || 'Guru',
    subject: model?.detail?.subject || '',
    bio: model?.detail?.bio || '',
    public_visible: model?.detail?.public_visible ?? 1,
    nis: model?.detail?.nis || '',
    gender: model?.detail?.gender || 'L',
    birth_date: model?.detail?.birth_date || '',
    class_id: model?.detail?.class_id || '',
    occupation: model?.detail?.occupation || ''
  }));
  const [opts, setOpts] = useState({ students: [], classes: [], years: [] });

  useEffect(() => { api('/admin/users/options').then((d) => { setOpts(d); if (!f.class_id) setF((x) => ({ ...x, class_id: d.classes[0]?.id || '' })); }).catch(() => {}); }, []);

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <div className="space-y-1.5"><label className="label">Nama Lengkap *</label><input className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
      <div className="space-y-1.5"><label className="label">Email *</label><input className="input" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
      <div className="space-y-1.5"><label className="label">{model ? 'Password baru (kosongkan jika tetap)' : 'Password *'}</label><input type="password" className="input" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></div>
      <div className="space-y-1.5"><label className="label">Telepon</label><input className="input" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></div>
      {!model && (
        <div className="space-y-1.5"><label className="label">Peran *</label>
          <select className="select" value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })}>
            {['STUDENT', 'TEACHER', 'PARENT', 'ADMIN'].map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>
      )}
      <div className="space-y-1.5"><label className="label">Foto URL</label><input className="input" value={f.photo} onChange={(e) => setF({ ...f, photo: e.target.value })} /></div>

      {f.role === 'STUDENT' && (
        <>
          <div className="space-y-1.5"><label className="label">NIS</label><input className="input" value={f.nis} onChange={(e) => setF({ ...f, nis: e.target.value })} /></div>
          <div className="space-y-1.5"><label className="label">Jenis Kelamin</label><select className="select" value={f.gender} onChange={(e) => setF({ ...f, gender: e.target.value })}><option>L</option><option>P</option></select></div>
          <div className="space-y-1.5"><label className="label">Tanggal Lahir</label><input type="date" className="input" value={f.birth_date} onChange={(e) => setF({ ...f, birth_date: e.target.value })} /></div>
          <div className="space-y-1.5 col-span-2 sm:col-span-1"><label className="label">Kelas</label><select className="select" value={f.class_id} onChange={(e) => setF({ ...f, class_id: e.target.value })}><option value="">—</option>{opts.classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
        </>
      )}
      {f.role === 'TEACHER' && (
        <>
          <div className="space-y-1.5"><label className="label">Jabatan</label><input className="input" value={f.position} onChange={(e) => setF({ ...f, position: e.target.value })} /></div>
          <div className="space-y-1.5"><label className="label">Bidang / Mapel</label><input className="input" value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} /></div>
          <div className="sm:col-span-2 space-y-1.5"><label className="label">Tampil di Halaman Publik</label><button type="button" onClick={() => setF({ ...f, public_visible: f.public_visible ? 0 : 1 })} className={`w-14 h-8 rounded-full transition-colors relative ${f.public_visible ? 'bg-emerald-500' : 'bg-slate-200'}`}><span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${f.public_visible ? 'left-7' : 'left-1'}`} /></button></div>
          <div className="sm:col-span-2 space-y-1.5"><label className="label">Bio</label><textarea className="textarea" value={f.bio} onChange={(e) => setF({ ...f, bio: e.target.value })} /></div>
        </>
      )}
      {f.role === 'PARENT' && (
        <div className="space-y-1.5"><label className="label">Pekerjaan</label><input className="input" value={f.occupation} onChange={(e) => setF({ ...f, occupation: e.target.value })} /></div>
      )}

      <div className="sm:col-span-2 flex justify-end gap-2 mt-2">
        <button className="btn-outline btn-sm" onClick={onClose}>Batal</button>
        <button className="btn-primary btn-sm" onClick={() => onSave(f)}>Simpan</button>
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const [tab, setTab] = useState('STUDENT');
  const [page, setPage] = useState(1);
  const limit = 20;
  const [sel, setSel] = useState(null);
  const [open, setOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [q, setQ] = useState('');
  const toast = useToast();
  const { data: rowsData, error, retry } = useApi(
    `/admin/users?role=${tab}&q=${encodeURIComponent(q)}&page=${page}&limit=${limit}`,
    { deps: [tab, page, q] }
  );
  const rows = rowsData == null ? null : (Array.isArray(rowsData) ? rowsData : (rowsData.rows || []));
  const total = rowsData == null ? 0 : (Array.isArray(rowsData) ? rowsData.length : (rowsData.total || 0));

  useEffect(() => {
    setPage(1);
  }, [tab]);

  if (error) return <ErrorState error={error} onRetry={retry} />;
  if (!rows) return <Spinner />;

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const save = async (f) => {
    try {
      const payload = { ...f };
      delete payload.password;
      if (f.password) payload.password = f.password;
      if (sel) await api(`/admin/users/${sel.id}`, { method: 'PUT', body: payload });
      else await api('/admin/users', { method: 'POST', body: payload });
      toast.success('Data pengguna tersimpan.');
      setOpen(false);
      retry();
    } catch (e) { toast.error(e.message); }
  };

  const del = async (u) => {
    if (!window.confirm(`Nonaktifkan ${u.name}?`)) return;
    try { await api(`/admin/users/${u.id}`, { method: 'DELETE' }); toast.success('Pengguna dinonaktifkan.'); retry(); } catch (e) { toast.error(e.message); }
  };

  const openEdit = async (u) => {
    try {
      const d = await api(`/admin/users/${u.id}`);
      setSel(d);
      setOpen(true);
    } catch (e) { toast.error(e.message); }
  };

  const cols = (() => {
    if (tab === 'STUDENT') return [['nis', 'NIS'], ['class_name', 'Kelas']];
    if (tab === 'TEACHER') return [['position', 'Jabatan'], ['subject', 'Bidang']];
    if (tab === 'PARENT') return [['children_count', 'Anak Terhubung']];
    return [['role', 'Peran']];
  })();

  return (
    <Page
      title="Manajemen Pengguna"
      subtitle="Kelola akun Admin, Guru, Siswa, dan Wali Murid."
      actions={
        <div className="flex flex-wrap items-center gap-2">
          {tab === 'STUDENT' && (
            <>
              <button
                type="button"
                className="btn-secondary btn-sm flex items-center gap-1.5 min-h-[44px]"
                onClick={downloadCSVTemplate}
                title="Unduh contoh template file CSV untuk impor murid"
              >
                <Download size={15} />
                <span>Unduh Template CSV</span>
              </button>
              <button
                type="button"
                className="btn-secondary btn-sm flex items-center gap-1.5 min-h-[44px]"
                onClick={() => setImportOpen(true)}
                title="Impor banyak data murid sekaligus via CSV"
              >
                <Upload size={15} />
                <span>Impor CSV</span>
              </button>
            </>
          )}
          <button className="btn-primary btn-sm flex items-center gap-1.5 min-h-[44px]" onClick={() => { setSel(null); setOpen(true); }}>
            <Plus size={15} />
            <span>Tambah Pengguna</span>
          </button>
        </div>
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <Tabs tabs={[['STUDENT', 'Siswa'], ['TEACHER', 'Guru'], ['PARENT', 'Wali Murid'], ['ADMIN', 'Admin']].map(([k, l]) => ({ key: k, label: l }))} active={tab} onChange={setTab} />
        <div className="relative"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input className="input !pl-9 !w-60" placeholder="Cari nama..." value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} /></div>
      </div>

      <Card className="p-5">
        <div className="overflow-x-auto">
          <table className="table-shell">
            <thead><tr><th>Pengguna</th>{cols.map(([k, l]) => <th key={k}>{l}</th>)}<th>Status</th><th className="text-right">Aksi</th></tr></thead>
            <tbody>
              {rows.map((u, i) => (
                <tr key={u.id} className="animate-fade-up">
                  <td>
                    <div className="flex items-center gap-3">
                      <Avatar src={u.photo} name={u.name} size={38} />
                      <div><p className="font-bold text-slate-800 text-sm">{u.name}</p><p className="text-xs text-slate-400">{u.email}</p></div>
                    </div>
                  </td>
                  {cols.map(([k, l]) => <td key={k} className="text-xs">{u[k] || '—'}</td>)}
                  <td><Badge tone={u.status === 'ACTIVE' ? 'green' : 'slate'}>{u.status}</Badge></td>
                  <td>
                    <div className="flex justify-end gap-1.5">
                      <button className="btn-ghost btn-sm !px-2 min-h-[44px] min-w-[44px] flex items-center justify-center" onClick={() => openEdit(u)} aria-label="Edit"><Pencil size={15} /></button>
                      {u.status === 'ACTIVE' && <button className="btn-danger btn-sm !px-2 min-h-[44px] min-w-[44px] flex items-center justify-center" onClick={() => del(u)} aria-label="Nonaktifkan"><Trash2 size={15} /></button>}
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={6}><EmptyState icon={Users} title="Belum ada pengguna" /></td></tr>}
            </tbody>
          </table>
        </div>

        {/* Tombol Sebelumnya & Berikutnya */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-5 pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-500 font-medium text-center sm:text-left">
            Menampilkan <span className="font-bold text-slate-700">{total > 0 ? (page - 1) * limit + 1 : 0}</span> – <span className="font-bold text-slate-700">{Math.min(page * limit, total)}</span> dari <span className="font-bold text-slate-700">{total}</span> pengguna
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn-outline btn-sm min-h-[44px] flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Sebelumnya
            </button>
            <span className="text-xs font-bold text-slate-700 px-3 py-2 bg-slate-100 rounded-xl">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              className="btn-outline btn-sm min-h-[44px] flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Berikutnya
            </button>
          </div>
        </div>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title={`${sel ? 'Ubah' : 'Tambah'} Pengguna`} footer={null}>
        <UserForm model={sel} onClose={() => setOpen(false)} onSave={save} />
      </Modal>

      <ImportModal open={importOpen} onClose={() => setImportOpen(false)} onSuccess={retry} />
    </Page>
  );
}
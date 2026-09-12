import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../api';
import { Page, Card, Modal, StatusBadge, EmptyState, useToast, Spinner, Badge, Avatar } from '../../components/ui';
import { Plus, Pencil } from 'lucide-react';

const CONFIGS = {
  tahun: {
    name: 'Tahun Ajaran', api: 'academic_years',
    fields: [
      { n: 'name', l: 'Nama (cth: 2026/2027)', t: 'text' },
      { n: 'start_date', l: 'Mulai', t: 'date' },
      { n: 'end_date', l: 'Selesai', t: 'date' },
      { n: 'is_active', l: 'Tahun Aktif', t: 'toggle' },
      { n: 'status', l: 'Status', t: 'select', opts: ['ACTIVE'] }
    ],
    render: (r) => ([
      <div key="n"><p className="font-bold">{r.name}</p><p className="text-xs text-slate-400">{r.start_date} — {r.end_date}</p></div>,
      r.is_active ? <Badge tone="green" key="a">Aktif</Badge> : <Badge tone="slate" key="a">Tidak</Badge>
    ])
  },
  program: {
    name: 'Program', api: 'programs',
    fields: [
      { n: 'name', l: 'Nama Program', t: 'text' },
      { n: 'code', l: 'Kode', t: 'text' },
      { n: 'status', l: 'Status', t: 'select', opts: ['PUBLISHED', 'DRAFT'] },
      { n: 'description', l: 'Deskripsi', t: 'textarea' }
    ]
  },
  kelas: {
    name: 'Kelas', api: 'classes',
    fields: [
      { n: 'name', l: 'Nama Kelas (cth: X IPA 1)', t: 'text' },
      { n: 'grade', l: 'Tingkatan', t: 'text' },
      { n: 'program_id', l: 'Program', t: 'remote', src: 'programs', name: 'name' },
      { n: 'academic_year_id', l: 'Tahun Ajaran', t: 'remote', src: 'academic_years', name: 'name' },
      { n: 'homeroom_teacher_id', l: 'Wali Kelas', t: 'remote', src: 'teachers', name: 'display' },
      { n: 'status', l: 'Status', t: 'select', opts: ['ACTIVE', 'INACTIVE'] }
    ]
  },
  mapel: {
    name: 'Mata Pelajaran', api: 'subjects',
    fields: [
      { n: 'name', l: 'Nama Mapel', t: 'text' },
      { n: 'code', l: 'Kode', t: 'text' },
      { n: 'class_id', l: 'Kelas', t: 'remote', src: 'classes', name: 'name' },
      { n: 'teacher_id', l: 'Guru Pengampu', t: 'remote', src: 'teachers', name: 'display' },
      { n: 'status', l: 'Status', t: 'select', opts: ['ACTIVE', 'INACTIVE'] },
      { n: 'description', l: 'Deskripsi', t: 'textarea' }
    ]
  },
  jadwal: {
    name: 'Jadwal', api: 'schedules',
    fields: [
      { n: 'class_id', l: 'Kelas', t: 'remote', src: 'classes', name: 'name' },
      { n: 'subject_id', l: 'Mapel', t: 'remote', src: 'subjects', name: 'display' },
      { n: 'teacher_id', l: 'Guru', t: 'remote', src: 'teachers', name: 'display' },
      { n: 'day', l: 'Hari', t: 'select', opts: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'] },
      { n: 'start_time', l: 'Mulai', t: 'time' },
      { n: 'end_time', l: 'Selesai', t: 'time' },
      { n: 'room', l: 'Ruang', t: 'text' },
      { n: 'status', l: 'Status', t: 'select', opts: ['ACTIVE', 'INACTIVE'] }
    ]
  }
};

const DAY_MAP = { Senin: 1, Selasa: 2, Rabu: 3, Kamis: 4, Jumat: 5, Sabtu: 6, Minggu: 0 };
const DAY_BACK = { 0: 'Minggu', 1: 'Senin', 2: 'Selasa', 3: 'Rabu', 4: 'Kamis', 5: 'Jumat', 6: 'Sabtu' };

export default function AdminAcademic() {
  const { section } = useParams();
  const cfg = CONFIGS[section];
  const toast = useToast();
  const [rows, setRows] = useState(null);
  const [opts, setOpts] = useState({});
  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState(null);
  const [teachers, setTeachers] = useState(null);
  const [students, setStudents] = useState(null);

  const loadAux = async () => {
    const fetchData = (src) => api(`/admin/${src}`).then((r) => r).catch(() => []);
    const [programs, years, klasses, subjectsArr, teachersArr, studentsArr] = await Promise.all(['programs', 'academic_years', 'classes', 'subjects', 'users?role=TEACHER', 'users?role=STUDENT'].map(fetchData));
    setOpts({ programs, years, classes: klasses, subjects: subjectsArr.map((s) => ({ id: s.id, display: s.name })), teachers: teachersArr.map((t) => ({ id: t.id, display: `${t.name} — ${t.position || 'Guru'}` })) });
    setTeachers(teachersArr);
    setStudents(studentsArr);
  };

  const load = () => {
    if (!cfg) return;
    api(`/admin/${cfg.api}`).then(setRows).catch(() => {});
  };

  useEffect(() => { load(); loadAux(); }, [section]);

  if (section === 'guru' && !teachers) return <Spinner />;
  if (section === 'siswa' && !students) return <Spinner />;
  if (!CONFIGS[section] && section !== 'guru' && section !== 'siswa') return <Page title="Akademik"><EmptyState title="Bagian tidak ditemukan" /></Page>;
  if (cfg && !rows) return <Spinner />;

  const getVal = (f, row) => {
    if (f.t === 'remote') {
      const key = { programs: 'name', academic_years: 'name', classes: 'name', subjects: 'display', teachers: 'display' }[f.src];
      const opt = opts[f.src]?.find((o) => String(o.id) === String(row[f.n]));
      return opt ? (f.src === 'teachers' || f.src === 'subjects' ? opt.display : opt.name) : '—';
    }
    if (f.n === 'day') return DAY_BACK[row[f.n]] || row[f.n];
    return row[f.n] || '—';
  };

  const submit = async (form) => {
    try {
      if (sel) await api(`/admin/${cfg.api}/${sel.id}`, { method: 'PUT', body: form });
      else await api(`/admin/${cfg.api}`, { method: 'POST', body: form });
      toast.success('Data akademik disimpan.');
      setOpen(false);
      load();
    } catch (e) { toast.error(e.message); }
  };

  const sectionLabel = section === 'guru' ? 'Guru & Staf' : section === 'siswa' ? 'Siswa' : 'Akademik';

  return (
    <Page title={cfg ? cfg.name : sectionLabel} subtitle="Manajemen data akademik sekolah."
      actions={cfg && <button className="btn-primary btn-sm" onClick={() => { setSel(null); setOpen(true); }}><Plus size={15} /> Tambah</button>}>

      {section === 'guru' ? <GuruSection rows={teachers} /> : section === 'siswa' ? <SiswaSection rows={students} /> : (
        <Card className="p-5">
          <div className="overflow-x-auto">
            <table className="table-shell">
              <thead><tr>{(cfg.fields.map((f) => <th key={f.n}>{f.l}</th>)).concat(<th className="text-right">Aksi</th>)}</tr></thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.id} className="animate-fade-up">
                    {cfg.fields.map((f) => <td key={f.n} className="max-w-[200px]"><span className="line-clamp-1">{f.t === 'status' ? <StatusBadge status={r[f.n]} /> : getVal(f, r)}</span></td>)}
                    <td><div className="flex justify-end"><button className="btn-ghost btn-sm !px-2" onClick={() => { setSel(r); setOpen(true); }}><Pencil size={15} /></button></div></td>
                  </tr>
                ))}
                {rows.length === 0 && <tr><td colSpan={cfg.fields.length + 1}><EmptyState title="Belum ada data" /></td></tr>}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {cfg && (
        <Modal open={open} onClose={() => setOpen(false)} title={`${sel ? 'Ubah' : 'Tambah'} ${cfg.name}`} footer={null}>
          <AcademicForm cfg={cfg} sel={sel} opts={opts} onSave={submit} onClose={() => setOpen(false)} />
        </Modal>
      )}
    </Page>
  );
}

function AcademicForm({ cfg, sel, opts, onSave, onClose }) {
  const [f, setF] = useState(() => {
    const init = {};
    for (const field of cfg.fields) init[field.n] = sel?.[field.n] ?? (field.t === 'toggle' ? 1 : '');
    return init;
  });

  const fieldEl = (field) => {
    if (field.t === 'textarea') return <div key={field.n} className="sm:col-span-2 space-y-1.5"><label className="label">{field.l}</label><textarea className="textarea" value={f[field.n]} onChange={(e) => setF({ ...f, [field.n]: e.target.value })} /></div>;
    if (field.t === 'toggle') return <div key={field.n} className="space-y-1.5"><label className="label">{field.l}</label><button type="button" onClick={() => setF({ ...f, [field.n]: f[field.n] ? 0 : 1 })} className={`w-14 h-8 rounded-full transition-colors relative ${f[field.n] ? 'bg-emerald-500' : 'bg-slate-200'}`}><span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${f[field.n] ? 'left-7' : 'left-1'}`} /></button></div>;
    if (field.t === 'remote') return <div key={field.n} className="space-y-1.5"><label className="label">{field.l}</label><select className="select" value={f[field.n]} onChange={(e) => setF({ ...f, [field.n]: e.target.value })}><option value="">—</option>{(opts[field.src] || []).map((o) => <option key={o.id} value={o.id}>{field.src === 'teachers' || field.src === 'subjects' ? o.display : o.name}</option>)}</select></div>;
    if (field.t === 'date') return <div key={field.n} className="space-y-1.5"><label className="label">{field.l}</label><input type="date" className="input" value={f[field.n]} onChange={(e) => setF({ ...f, [field.n]: e.target.value })} /></div>;
    if (field.t === 'time') return <div key={field.n} className="space-y-1.5"><label className="label">{field.l}</label><input type="time" className="input" value={f[field.n]} onChange={(e) => setF({ ...f, [field.n]: e.target.value })} /></div>;
    if (field.t === 'select') return <div key={field.n} className="space-y-1.5"><label className="label">{field.l}</label>{field.n === 'day'
      ? <select className="select" value={String(f[field.n])} onChange={(e) => setF({ ...f, [field.n]: e.target.value })}>{field.opts.map((d) => <option key={d} value={DAY_MAP[d]}>{d}</option>)}</select>
      : <select className="select" value={f[field.n]} onChange={(e) => setF({ ...f, [field.n]: e.target.value })}>{field.opts.map((o) => <option key={o} value={o}>{o.replaceAll('_', ' ')}</option>)}</select>}</div>;
    return <div key={field.n} className="space-y-1.5"><label className="label">{field.l}</label><input className="input" value={f[field.n]} onChange={(e) => setF({ ...f, [field.n]: e.target.value })} /></div>;
  };

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {cfg.fields.map(fieldEl)}
      <div className="sm:col-span-2 flex justify-end gap-2 mt-2">
        <button className="btn-outline btn-sm" onClick={onClose}>Batal</button>
        <button className="btn-primary btn-sm" onClick={() => onSave(f)}>Simpan</button>
      </div>
    </div>
  );
}

function GuruSection({ rows }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {rows.map((g) => (
        <Card key={g.id} className="p-5 flex items-center gap-4 card-hover">
          <img src={g.photo} alt="" className="h-16 w-16 rounded-2xl object-cover" />
          <div className="min-w-0">
            <p className="font-bold text-slate-900 text-sm truncate">{g.name}</p>
            <p className="text-xs text-indigo-600 font-semibold">{g.position}</p>
            <p className="text-[11px] text-slate-400 mt-1 truncate">{g.subject}</p>
            <div className="mt-1.5 flex gap-1.5">{g.public_visible ? <Badge tone="green">Tampil Publik</Badge> : <Badge tone="slate">Tersembunyi</Badge>}{g.status === 'ACTIVE' ? <Badge tone="green">Aktif</Badge> : <Badge tone="rose">Nonaktif</Badge>}</div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function SiswaSection({ rows }) {
  return (
    <Card className="p-5">
      <div className="flex justify-end mb-3"><span className="text-xs text-slate-400">Manajemen detail siswa tersedia di menu Manajemen Pengguna.</span></div>
      <div className="overflow-x-auto">
        <table className="table-shell">
          <thead><tr><th>Nama</th><th>NIS</th><th>Kelas</th><th>Status</th></tr></thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id}><td><div className="flex items-center gap-3"><Avatar src={u.photo} name={u.name} size={34} /><div><p className="font-bold text-sm">{u.name}</p><p className="text-xs text-slate-400">{u.email}</p></div></div></td><td>{u.nis}</td><td>{u.class_name || '—'}</td><td><Badge tone={u.status === 'ACTIVE' ? 'green' : 'slate'}>{u.status}</Badge></td></tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={4}><EmptyState title="Belum ada siswa" /></td></tr>}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
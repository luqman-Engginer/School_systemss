import { useEffect, useState } from 'react';
import { api } from '../../api';
import { Page, Card, Spinner, EmptyState, Avatar, Badge, useToast } from '../../components/ui';
import { Check, Clock, Cross, ShieldCheck, MessageSquareHeart } from 'lucide-react';
import dayjs from 'dayjs';

const STATUSES = [
  { k: 'PRESENT', label: 'Hadir', icon: Check, tone: 'text-emerald-600', cls: 'border-emerald-200 text-emerald-600 data-[on]:bg-emerald-500 data-[on]:border-emerald-500 data-[on]:text-white' },
  { k: 'LATE', label: 'Terlambat', icon: Clock, tone: 'text-amber-600', cls: 'border-amber-200 text-amber-600 data-[on]:bg-amber-500 data-[on]:border-amber-500 data-[on]:text-white' },
  { k: 'SICK', label: 'Sakit', icon: ShieldCheck, tone: 'text-sky-600', cls: 'border-sky-200 text-sky-600 data-[on]:bg-sky-500 data-[on]:border-sky-500 data-[on]:text-white' },
  { k: 'EXCUSED', label: 'Izin', icon: MessageSquareHeart, tone: 'text-violet-600', cls: 'border-violet-200 text-violet-600 data-[on]:bg-violet-500 data-[on]:border-violet-500 data-[on]:text-white' },
  { k: 'ABSENT', label: 'Alpa', icon: Cross, tone: 'text-rose-600', cls: 'border-rose-200 text-rose-600 data-[on]:bg-rose-500 data-[on]:border-rose-500 data-[on]:text-white' }
];

export default function TeacherAttendance() {
  const [classes, setClasses] = useState([]);
  const [selected, setSelected] = useState(null);
  const [date, setDate] = useState(() => dayjs().format('YYYY-MM-DD'));
  const [d, setD] = useState(null);
  const [entries, setEntries] = useState({});
  const [saved, setSaved] = useState(false);
  const toast = useToast();

  const load = () => {
    if (!selected) return;
    setD(null);
    api(`/teacher/attendance?class_id=${selected}&date=${date}`).then((data) => {
      setD(data);
      const m = {};
      data.students.forEach((s) => { m[s.student_id] = s.record?.status || 'PRESENT'; });
      setEntries(m);
      setSaved(false);
    }).catch(() => {});
  };
  useEffect(() => { api('/teacher/my-classes').then((c) => { setClasses(c.classes); if (c.classes.length) setSelected(c.classes[0].id); }).catch(() => {}); }, []);
  useEffect(() => { if (selected) load(); }, [selected, date]);

  if (!d) return <Spinner />;

  const submit = async () => {
    try {
      await api('/teacher/attendance', { method: 'POST', body: { class_id: selected, date, entries: d.students.map((s) => ({ student_id: s.student_id, status: entries[s.student_id] })) } });
      toast.success('Kehadiran disimpan.');
      setSaved(true);
    } catch (e) { toast.error(e.message); }
  };

  const counts = d.students.reduce((acc, s) => { acc[entries[s.student_id]] = (acc[entries[s.student_id]] || 0) + 1; return acc; }, {});

  return (
    <Page title="Presensi Kehadiran" subtitle="Catat kehadiran siswa di kelas Anda.">
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <select className="select" value={selected || ''} onChange={(e) => setSelected(+e.target.value)}>
          {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input type="date" className="input !w-auto" value={date} onChange={(e) => setDate(e.target.value)} />
        <div className="flex gap-2 ml-auto">
          <span className="text-xs text-slate-500 self-center">Perbarui status lalu simpan.</span>
          <button className="btn-primary btn-sm" onClick={submit}>{saved ? 'Simpan Lagi' : 'Simpan Kehadiran'}</button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {STATUSES.map((st) => (
          <div key={st.k} className="rounded-xl border border-slate-100 bg-white p-3.5 text-center">
            <p className={`text-lg font-extrabold ${st.tone}`}>{counts[st.k] || 0}</p>
            <p className="text-[11px] font-semibold text-slate-400">{st.label}</p>
          </div>
        ))}
      </div>

      <Card className="p-5">
        {d.students.length === 0 && <EmptyState title="Tidak ada siswa di kelas ini" />}
        <div className="space-y-2.5">
          {d.students.map((s) => (
            <div key={s.student_id} className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-100 p-3">
              <Avatar src={s.photo} name={s.name} size={38} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">{s.name}</p>
                {s.record?.check_in_time && <p className="text-[11px] text-slate-400">Check-in {s.record.check_in_time}</p>}
              </div>
              <div className="flex flex-wrap justify-end gap-1.5">
                {STATUSES.map((st) => {
                  const Icon = st.icon;
                  const active = entries[s.student_id] === st.k;
                  return (
                    <button key={st.k} data-on={active || undefined} onClick={() => setEntries((e) => ({ ...e, [s.student_id]: st.k }))}
                      className={`border rounded-lg p-2 transition-all ${st.cls} ${active ? '' : 'bg-white opacity-60 hover:opacity-100'}`} title={st.label}>
                      {active ? <Icon size={15} fill="currentColor" /> : <Icon size={15} />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </Page>
  );
}
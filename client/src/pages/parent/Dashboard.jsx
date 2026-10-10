import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { useAuth } from '../../store';
import { Page, Stat, Card, Spinner, ProgressBar, EmptyState, Badge, StatusBadge } from '../../components/ui';
import { Users, CalendarDays, Megaphone, ClipboardList, ArrowUpRight, HeartHandshake, UserCheck, MessageSquare, CheckCircle2 } from 'lucide-react';
import dayjs from 'dayjs';
import 'dayjs/locale/id';

dayjs.locale('id');

export default function ParentDashboard() {
  const [d, setD] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  useEffect(() => { api('/parent/dashboard').then(setD).catch(() => {}); }, []);
  if (!d) return <Spinner />;

  return (
    <Page title={`Selamat datang, ${user?.name || 'Wali Murid'}`} subtitle={dayjs().format('dddd, D MMMM YYYY')}>
      {/* Bagian Atas: Satu Kartu per Anak (Kehadiran, Tugas Terdekat, Kabar Terbaru Guru) */}
      <div className="space-y-6">
        {d.children.map((c) => {
          const attMap = (c.attendance || []).reduce((acc, a) => { acc[a.status] = a.c; return acc; }, {});
          const hadir = attMap.PRESENT || 0;
          const sakit = attMap.SICK || 0;
          const izin = attMap.EXCUSED || 0;
          const terlambat = attMap.LATE || 0;
          const alpa = attMap.ABSENT || 0;
          const totalAtt = hadir + sakit + izin + terlambat + alpa;
          const attPct = totalAtt ? Math.round(((hadir + terlambat) / totalAtt) * 100) : 100;

          return (
            <Card key={c.student_id} className="p-6 border-t-4 border-t-indigo-600 shadow-sm space-y-6">
              {/* Header Info Anak */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-brand grid place-items-center text-white text-xl font-black shadow-md">
                    {(c.name || 'A')[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xl font-extrabold text-slate-900">{c.name}</p>
                      <Badge tone="indigo">{c.relation || 'Wali'}</Badge>
                    </div>
                    {c.classInfo ? (
                      <p className="text-sm font-medium text-slate-500 mt-0.5">
                        Kelas <span className="font-bold text-slate-700">{c.classInfo.name}</span> · {c.classInfo.grade}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400 mt-0.5">Belum dialokasikan ke kelas aktif</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <span className="text-xs font-semibold text-slate-500">Progress Belajar:</span>
                      <span className="text-lg font-black text-indigo-600">{c.progressPct}%</span>
                    </div>
                    <ProgressBar value={c.progressPct} className="!h-2 w-32 mt-1" />
                  </div>
                  <button onClick={() => navigate(`/wali/anak/${c.student_id}`)} className="btn-outline btn-sm min-h-[44px]">
                    Detail Siswa <ArrowUpRight size={14} />
                  </button>
                </div>
              </div>

              {/* Grid 3 Kolom: Kehadiran, Tugas Terdekat, Kabar Terbaru Guru */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 1. Kehadiran */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                        <UserCheck size={17} className="text-indigo-600" /> Ringkasan Kehadiran
                      </h4>
                      <Badge tone={attPct >= 85 ? 'green' : attPct >= 70 ? 'amber' : 'rose'}>
                        {attPct}% Hadir
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center my-3">
                      <div className="p-2 rounded-xl bg-white border border-slate-100 shadow-2xs">
                        <p className="text-xs text-slate-500 font-medium">Hadir</p>
                        <p className="text-base font-black text-emerald-600">{hadir}</p>
                      </div>
                      <div className="p-2 rounded-xl bg-white border border-slate-100 shadow-2xs">
                        <p className="text-xs text-slate-500 font-medium">Sakit</p>
                        <p className="text-base font-black text-amber-600">{sakit}</p>
                      </div>
                      <div className="p-2 rounded-xl bg-white border border-slate-100 shadow-2xs">
                        <p className="text-xs text-slate-500 font-medium">Izin</p>
                        <p className="text-base font-black text-sky-600">{izin}</p>
                      </div>
                      <div className="p-2 rounded-xl bg-white border border-slate-100 shadow-2xs">
                        <p className="text-xs text-slate-500 font-medium">Alpa</p>
                        <p className="text-base font-black text-rose-600">{alpa}</p>
                      </div>
                    </div>
                  </div>

                  <button onClick={() => navigate(`/wali/anak/${c.student_id}/kehadiran`)} className="mt-3 w-full btn-ghost btn-sm !text-indigo-600 hover:!bg-indigo-50 min-h-[44px]">
                    Lihat Rekap Absensi Lengkap
                  </button>
                </div>

                {/* 2. Tugas Terdekat */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                        <ClipboardList size={17} className="text-sky-600" /> Tugas Terdekat
                      </h4>
                      <span className="text-[11px] font-bold text-slate-400">
                        {c.upcomingAssign?.length || 0} Tugas
                      </span>
                    </div>

                    <div className="space-y-2">
                      {(c.upcomingAssign || []).slice(0, 2).map((a, i) => (
                        <div key={i} className="p-3 rounded-xl bg-white border border-slate-100 shadow-2xs">
                          <p className="text-xs font-bold text-slate-800 truncate">{a.title}</p>
                          <div className="flex items-center justify-between gap-2 mt-1.5">
                            <span className="text-[11px] text-slate-400 truncate">{a.subject_name} · {dayjs(a.deadline).format('D MMM')}</span>
                            {a.grade !== null ? (
                              <Badge tone="green" className="shrink-0 text-[10px]">Nilai: {a.grade}</Badge>
                            ) : (
                              <Badge tone="amber" className="shrink-0 text-[10px]">Menunggu</Badge>
                            )}
                          </div>
                        </div>
                      ))}

                      {(!c.upcomingAssign || c.upcomingAssign.length === 0) && (
                        <div className="py-5 text-center text-slate-400">
                          <CheckCircle2 size={24} className="mx-auto text-emerald-400 mb-1" />
                          <p className="text-xs font-medium">Tidak ada tugas mendekati batas waktu</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <button onClick={() => navigate(`/wali/anak/${c.student_id}/akademik`)} className="mt-3 w-full btn-ghost btn-sm !text-sky-600 hover:!bg-sky-50 min-h-[44px]">
                    Lihat Seluruh Tugas & Nilai
                  </button>
                </div>

                {/* 3. Kabar Terbaru Guru */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                        <MessageSquare size={17} className="text-violet-600" /> Kabar Terbaru Guru
                      </h4>
                      <span className="text-[11px] font-bold text-slate-400">
                        {c.feedback?.length || 0} Catatan
                      </span>
                    </div>

                    <div className="space-y-2">
                      {(c.feedback || []).slice(0, 2).map((f, i) => (
                        <div key={i} className="p-3 rounded-xl bg-white border border-slate-100 shadow-2xs">
                          <p className="text-xs text-slate-700 italic line-clamp-2">"{f.content}"</p>
                          <p className="text-[10px] font-semibold text-slate-400 mt-1.5">
                            — {f.teacher_name} ({f.subject_name || 'Wali Kelas'}) · {dayjs(f.created_at + 'Z').format('D MMM')}
                          </p>
                        </div>
                      ))}

                      {(!c.feedback || c.feedback.length === 0) && (
                        <div className="py-5 text-center text-slate-400">
                          <p className="text-xs font-medium">Belum ada feedback terbaru dari bapak/ibu guru</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <button onClick={() => navigate(`/wali/anak/${c.student_id}/feedback`)} className="mt-3 w-full btn-ghost btn-sm !text-violet-600 hover:!bg-violet-50 min-h-[44px]">
                    Lihat Semua Feedback Guru
                  </button>
                </div>
              </div>
            </Card>
          );
        })}

        {d.children.length === 0 && (
          <EmptyState title="Belum ada anak terhubung" desc="Hubungi admin sekolah untuk menautkan akun siswa dengan akun wali murid Anda." />
        )}
      </div>

      {/* Bagian Bawah: Statistik Ringkas & Pertemuan Orang Tua */}
      <div className="mt-8 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat icon={Users} label="Anak Terhubung" value={d.children.length} tone="indigo" />
          <Stat icon={HeartHandshake} label="Meeting Terjadwal" value={d.meetings.filter((m) => m.status !== 'CANCELLED').length} tone="sky" />
          <Stat icon={Megaphone} label="Notifikasi Baru" value={d.notifications} tone="amber" />
          <Stat icon={ClipboardList} label="Total Feedback" value={d.children.reduce((a, c) => a + (c.feedback?.length || 0), 0)} tone="violet" />
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-slate-900 flex items-center gap-2">
              <CalendarDays size={17} className="text-indigo-500" /> Pertemuan Orang Tua & Guru
            </h3>
            <button onClick={() => navigate('/wali/meeting')} className="text-xs font-bold text-indigo-600 hover:underline min-h-[44px] flex items-center">
              Semua meeting
            </button>
          </div>
          <div className="space-y-2">
            {d.meetings.map((m) => (
              <div key={m.id} className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-100 p-3.5 hover:bg-slate-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800">{m.topic}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{m.student_name} · {dayjs(m.date).format('D MMM YYYY')} · {m.start_time}–{m.end_time}</p>
                </div>
                <StatusBadge status={m.status} />
              </div>
            ))}
            {d.meetings.length === 0 && <EmptyState title="Belum ada jadwal meeting aktif" />}
          </div>
        </Card>
      </div>
    </Page>
  );
}
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { Page, Stat, Card, Spinner, ProgressBar, EmptyState, Badge } from '../../components/ui';
import { BookOpen, ClipboardList, CalendarDays, AlertTriangle, Megaphone, BookMarked, Hourglass, ArrowUpRight, Clock, CheckCircle2 } from 'lucide-react';
import dayjs from 'dayjs';
import 'dayjs/locale/id';

dayjs.locale('id');

export default function StudentDashboard() {
  const [d, setD] = useState(null);
  const navigate = useNavigate();
  useEffect(() => { api('/student/dashboard').then(setD).catch(() => {}); }, []);
  if (!d) return <Spinner />;

  const mapProgress = (arr, key) => arr.reduce((m, x) => { m[x.status] = x.c; return m; }, {});
  const p = mapProgress(d.progress, 'status');
  const done = p.COMPLETED || 0;
  const total = (p.COMPLETED || 0) + (p.IN_PROGRESS || 0) + (p.MISSED || 0) + (p.NOT_STARTED || 0);

  return (
    <Page title="Halo, selamat belajar!" subtitle={dayjs().format('dddd, D MMMM YYYY')}>
      {/* 3 Kartu Besar di Atas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kartu 1: Jadwal Hari Ini */}
        <Card className="p-6 flex flex-col justify-between border-t-4 border-t-indigo-500 shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 grid place-items-center">
                  <CalendarDays size={19} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 leading-tight">Jadwal Hari Ini</h3>
                  <p className="text-[11px] text-slate-400">{d.schedule.length} mapel terjadwal</p>
                </div>
              </div>
              <button onClick={() => navigate('/murid/jadwal')} className="text-xs font-bold text-indigo-600 inline-flex items-center gap-1 hover:underline min-h-[44px]">
                Lengkap <ArrowUpRight size={13} />
              </button>
            </div>

            <div className="space-y-2.5">
              {d.schedule.slice(0, 4).map((s, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3 transition-colors hover:bg-slate-50">
                  <div className="shrink-0 text-center px-2 py-1 rounded-lg bg-white border border-slate-200/60 shadow-2xs">
                    <p className="text-xs font-black text-slate-800">{s.start_time}</p>
                    <p className="text-[9px] font-semibold text-slate-400">{s.end_time}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{s.subject_name}</p>
                    <p className="text-xs text-slate-400 truncate">{s.teacher_name || 'Guru Pengampu'}</p>
                  </div>
                  {s.room && <Badge tone="slate" className="shrink-0">{s.room}</Badge>}
                </div>
              ))}
              {d.schedule.length === 0 && (
                <div className="py-6 text-center">
                  <CheckCircle2 size={32} className="mx-auto text-emerald-400 mb-2" />
                  <p className="text-sm font-bold text-slate-700">Tidak ada jadwal pelajaran</p>
                  <p className="text-xs text-slate-400 mt-0.5">Nikmati waktu istirahat atau pelajari materi mandiri.</p>
                </div>
              )}
            </div>
          </div>

          {d.schedule.length > 0 && (
            <button onClick={() => navigate('/murid/jadwal')} className="mt-4 w-full btn-outline btn-sm min-h-[44px]">
              Lihat Seluruh Jadwal
            </button>
          )}
        </Card>

        {/* Kartu 2: Tugas yang Jatuh Tempo Minggu Ini */}
        <Card className="p-6 flex flex-col justify-between border-t-4 border-t-sky-500 shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-sky-50 text-sky-600 grid place-items-center">
                  <ClipboardList size={19} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 leading-tight">Tugas Jatuh Tempo Minggu Ini</h3>
                  <p className="text-[11px] text-slate-400">{d.upcomingAssignments.length} tugas mendekati batas waktu</p>
                </div>
              </div>
              <button onClick={() => navigate('/murid/tugas')} className="text-xs font-bold text-sky-600 inline-flex items-center gap-1 hover:underline min-h-[44px]">
                Semua <ArrowUpRight size={13} />
              </button>
            </div>

            <div className="space-y-2.5">
              {d.upcomingAssignments.slice(0, 4).map((a) => {
                const isDone = a.my_status === 'GRADED' || a.my_status === 'SUBMITTED';
                return (
                  <div key={a.id} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3 transition-colors hover:bg-slate-50">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{a.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-500 font-medium truncate">{a.subject_name}</span>
                        <span className="text-[10px] text-slate-400">·</span>
                        <span className="text-[11px] text-rose-500 font-semibold inline-flex items-center gap-0.5">
                          <Clock size={11} /> {dayjs(a.deadline).format('D MMM')}
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0">
                      {isDone ? (
                        <Badge tone="green">Selesai</Badge>
                      ) : a.my_status === 'LATE' ? (
                        <Badge tone="rose">Terlambat</Badge>
                      ) : (
                        <Badge tone="amber">Pending</Badge>
                      )}
                    </div>
                  </div>
                );
              })}
              {d.upcomingAssignments.length === 0 && (
                <div className="py-6 text-center">
                  <CheckCircle2 size={32} className="mx-auto text-emerald-400 mb-2" />
                  <p className="text-sm font-bold text-slate-700">Tidak ada tugas mendekat</p>
                  <p className="text-xs text-slate-400 mt-0.5">Semua tugas minggu ini telah diselesaikan!</p>
                </div>
              )}
            </div>
          </div>

          {d.upcomingAssignments.length > 0 && (
            <button onClick={() => navigate('/murid/tugas')} className="mt-4 w-full btn-outline btn-sm min-h-[44px]">
              Buka Halaman Tugas
            </button>
          )}
        </Card>

        {/* Kartu 3: Materi yang Terlewat */}
        <Card className="p-6 flex flex-col justify-between border-t-4 border-t-rose-500 shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-rose-50 text-rose-600 grid place-items-center">
                  <AlertTriangle size={19} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 leading-tight">Materi yang Terlewat</h3>
                  <p className="text-[11px] text-slate-400">{d.missed.length} materi perlu direview</p>
                </div>
              </div>
              <button onClick={() => navigate('/murid/terlewat')} className="text-xs font-bold text-rose-600 inline-flex items-center gap-1 hover:underline min-h-[44px]">
                Review <ArrowUpRight size={13} />
              </button>
            </div>

            <div className="space-y-2.5">
              {d.missed.slice(0, 4).map((m) => (
                <div key={m.material_id} className="flex items-center justify-between gap-3 rounded-xl border border-rose-100 bg-rose-50/40 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-800 truncate">{m.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{m.subject_name} · Pertemuan {m.meeting}</p>
                  </div>
                  <button onClick={() => navigate('/murid/terlewat')} className="btn-outline btn-sm !text-rose-600 !border-rose-200 hover:!bg-rose-50 shrink-0 min-h-[44px]">
                    Pelajari
                  </button>
                </div>
              ))}
              {d.missed.length === 0 && (
                <div className="py-6 text-center">
                  <CheckCircle2 size={32} className="mx-auto text-emerald-400 mb-2" />
                  <p className="text-sm font-bold text-slate-700">Semua materi tuntas!</p>
                  <p className="text-xs text-slate-400 mt-0.5">Tidak ada materi pembelajaran yang terlewat.</p>
                </div>
              )}
            </div>
          </div>

          {d.missed.length > 0 && (
            <button onClick={() => navigate('/murid/terlewat')} className="mt-4 w-full btn-danger btn-sm min-h-[44px]">
              Pelajari Materi Terlewat ({d.missed.length})
            </button>
          )}
        </Card>
      </div>

      {/* Bagian Bawah: Statistik & Konten Lainnya */}
      <div className="mt-8 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat icon={BookOpen} label="Materi Selesai" value={`${done}/${total}`} tone="indigo" />
          <Stat icon={Hourglass} label="Tugas Aktif" value={d.upcomingAssignments.length} tone="sky" />
          <Stat icon={AlertTriangle} label="Materi Terlewat" value={d.missed.length} tone="rose" />
          <Stat icon={BookMarked} label="Mapel Hari Ini" value={d.schedule.length} tone="violet" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Progress Belajar */}
          <Card className="p-6">
            <h3 className="font-extrabold text-slate-900 mb-4 flex items-center gap-2">
              <BookOpen size={17} className="text-indigo-600" /> Progress Belajar Keseluruhan
            </h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-500">Materi terselesaikan</span>
              <span className="text-lg font-extrabold text-indigo-600">{total ? Math.round((done / total) * 100) : 0}%</span>
            </div>
            <ProgressBar value={total ? (done / total) * 100 : 0} className="!h-2.5" />
            <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs pt-3 border-t border-slate-100">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 font-bold">
                {done} Selesai
              </div>
              <div className="p-2 rounded-lg bg-slate-100 text-slate-700 font-bold">
                {total - done} Tersisa
              </div>
            </div>
          </Card>

          {/* Pengumuman */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-slate-900 flex items-center gap-2">
                <Megaphone size={17} className="text-amber-500" /> Pengumuman
              </h3>
            </div>
            <div className="space-y-2.5">
              {d.announcements.slice(0, 3).map((a) => (
                <div key={a.id} className="rounded-xl border border-slate-100 p-3 hover:bg-slate-50 transition-colors">
                  <p className="text-sm font-bold text-slate-800">{a.title}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{dayjs(a.published_at).format('D MMM YYYY')} · {a.category || 'Umum'}</p>
                </div>
              ))}
              {d.announcements.length === 0 && <EmptyState title="Belum ada pengumuman" />}
            </div>
          </Card>

          {/* Materi Baru */}
          <Card className="p-6 bg-gradient-brand text-white">
            <div className="flex items-center justify-between gap-2 mb-3">
              <h3 className="font-extrabold flex items-center gap-2">
                <BookMarked size={17} /> Materi Terbaru
              </h3>
              <button onClick={() => navigate('/murid/materi')} className="text-[11px] font-bold text-white/80 hover:underline min-h-[44px] flex items-center">
                Lihat semua
              </button>
            </div>
            <div className="space-y-2.5">
              {d.newMaterials.slice(0, 3).map((m) => (
                <div key={m.id} className="rounded-xl bg-white/10 p-3 hover:bg-white/15 transition-colors cursor-pointer" onClick={() => navigate('/murid/materi')}>
                  <p className="text-sm font-bold">{m.title}</p>
                  <p className="text-[11px] text-white/70 mt-0.5">{m.subject_name} · Pertemuan {m.meeting}</p>
                </div>
              ))}
              {d.newMaterials.length === 0 && <p className="text-xs text-white/70 py-4 text-center">Belum ada materi baru dipublikasikan.</p>}
            </div>
          </Card>
        </div>
      </div>
    </Page>
  );
}
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, CalendarDays, Sparkles, BookOpen, Users, MessageSquare,
  Trophy, ImageIcon, ChevronRight, MapPin, Phone, Mail, GraduationCap, Rocket
} from 'lucide-react';
import { api } from '../../api';
import { Spinner, Badge } from '../../components/ui';

const KEUNGGULAN = [
  { icon: BookOpen, title: 'Learning Hub Terpadu', desc: 'Materi, tugas, quiz, hingga review dalam satu alur belajar yang terstruktur.', tone: 'bg-indigo-50 text-indigo-600' },
  { icon: MessageSquare, title: 'Komunikasi Terpusat', desc: 'Ruang diskusi, meeting wali murid, dan feedback guru dalam satu ekosistem.', tone: 'bg-sky-50 text-sky-600' },
  { icon: Users, title: 'Parent Monitoring', desc: 'Wali murid memantau nilai, kehadiran, tugas, dan perkembangan anak secara real-time.', tone: 'bg-emerald-50 text-emerald-600' },
  { icon: Sparkles, title: 'Missed Learning', desc: 'Sistem mendeteksi materi yang terlewat dan mengajak siswa mengejar ketertinggalan.', tone: 'bg-violet-50 text-violet-600' }
];

export default function Home() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api('/public/home').then(setData).catch(() => {});
  }, []);

  if (!data) return <Spinner className="min-h-[60vh]" />;
  const { settings, news, events, achievements, gallery, programs, teachers, faqs } = data;

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-slate-950">
        <img src={settings.hero_image || settings.banner} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/95 via-slate-950/85 to-sky-950/70" />
        <div className="absolute -top-24 -right-24 h-[26rem] w-[26rem] rounded-full bg-indigo-600/30 blur-3xl animate-pulse" />
        <div className="absolute -bottom-32 -left-16 h-[26rem] w-[26rem] rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent" />
        <div className="absolute inset-0 opacity-[0.15]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-24 sm:py-32">
          <div className="max-w-3xl animate-fade-up">
            <span className="chip bg-white/10 text-white backdrop-blur ring-1 ring-white/20"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Tahun Ajaran {new Date().getFullYear()}/{new Date().getFullYear() + 1}</span>
            <h1 className="mt-5 text-4xl sm:text-6xl font-extrabold text-white leading-[1.08] tracking-tight">
              {settings.school_name || 'SMA Cendekia Muda Jakarta'}
            </h1>
            <p className="mt-3 text-lg sm:text-xl font-semibold text-indigo-200">{settings.slogan}</p>
            <p className="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">{settings.description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/program" className="btn-primary btn-lg text-white !rounded-2xl"><Rocket size={18} /> Jelajahi Program</Link>
              <Link to="/kontak" className="btn-lg bg-white/10 text-white backdrop-blur hover:bg-white/20 font-semibold inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 transition-all ring-1 ring-white/15">Hubungi Kami <ChevronRight size={18} /></Link>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl">
            {[{ label: 'Program Unggulan', v: programs.length }, { label: 'Siswa Aktif', v: data.studentCount }, { label: 'Guru & Staf', v: data.teacherCount }, { label: 'Total Prestasi', v: data.achievementCount }].map((x, i) => (
              <div key={i} className="rounded-2xl bg-white/10 backdrop-blur border border-white/15 p-4 text-center hover:bg-white/15 transition-colors">
                <p className="text-2xl font-extrabold text-white">{x.v}</p>
                <p className="text-[11px] text-slate-300">{x.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* KEUNGGULAN */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
        <div className="text-center max-w-2xl mx-auto">
          <span className="chip bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">Kenapa memilih kami</span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Ekosistem sekolah dalam <span className="gradient-text">satu platform</span></h2>
          <p className="mt-3 text-slate-500">Semua kebutuhan sekolah — dari pembelajaran hingga monitoring orang tua — terhubung dan transparan.</p>
        </div>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {KEUNGGULAN.map((k) => (
            <div key={k.title} className="card p-6 card-hover">
              <div className={`h-12 w-12 rounded-2xl grid place-items-center ${k.tone}`}><k.icon size={22} /></div>
              <h3 className="mt-4 font-extrabold text-slate-900">{k.title}</h3>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">{k.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PROGRAM */}
      <section className="bg-gradient-to-b from-white to-slate-50 border-y border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <span className="chip bg-sky-50 text-sky-600 ring-1 ring-sky-100">Program Pendidikan</span>
              <h2 className="mt-4 text-3xl font-extrabold text-slate-900 tracking-tight">Program yang menyiapkan masa depan</h2>
            </div>
            <Link to="/program" className="btn-outline btn-sm">Lihat semua program <ArrowRight size={14} /></Link>
          </div>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {programs.map((p, i) => (
              <Link to="/program" key={p.id} className="card p-6 card-hover group">
                <div className="flex items-center justify-between">
                  <div className="h-11 w-11 rounded-xl grid place-items-center font-extrabold text-white bg-gradient-brand">{p.code || (p.name || '?')[0]}</div>
                  <ArrowRight size={16} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                </div>
                <h3 className="mt-4 font-extrabold text-slate-900">{p.name}</h3>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed line-clamp-3">{p.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* BERITA & EVENT */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-end justify-between gap-4">
              <div>
                <span className="chip bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">Berita Terbaru</span>
                <h2 className="mt-4 text-3xl font-extrabold text-slate-900 tracking-tight">Kabar sekolah</h2>
              </div>
              <Link to="/berita" className="btn-outline btn-sm">Semua berita <ArrowRight size={14} /></Link>
            </div>
            <div className="mt-8 grid sm:grid-cols-2 gap-5">
              {news.map((n) => (
                <Link key={n.id} to={`/berita/${n.id}`} className="card overflow-hidden card-hover group">
                  <div className="relative h-44 overflow-hidden">
                    <img src={n.thumbnail} alt={n.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <Badge tone="indigo" className="absolute left-3 top-3 bg-white/90">{n.category}</Badge>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors">{n.title}</h3>
                    <p className="mt-2 text-xs text-slate-400">{new Date(n.published_at + 'T00:00:00').toLocaleDateString('id-ID', { dateStyle: 'medium' })}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-end justify-between gap-4">
              <div>
                <span className="chip bg-amber-50 text-amber-600 ring-1 ring-amber-100">Event Mendatang</span>
                <h2 className="mt-4 text-3xl font-extrabold text-slate-900 tracking-tight">Agenda</h2>
              </div>
              <Link to="/event" className="btn-outline btn-sm">Semua <ArrowRight size={14} /></Link>
            </div>
            <div className="mt-8 space-y-4">
              {events.map((e) => (
                <Link key={e.id} to={`/event/${e.id}`} className="card p-5 flex gap-4 card-hover">
                  <div className="shrink-0 h-16 w-16 rounded-2xl bg-gradient-brand text-white grid place-items-center flex-col">
                    <span className="text-[10px] uppercase font-bold opacity-90">{new Date(e.date + 'T00:00:00').toLocaleDateString('id-ID', { month: 'short' })}</span>
                    <span className="text-xl font-extrabold leading-none">{new Date(e.date + 'T00:00:00').getDate()}</span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 text-sm leading-snug">{e.title}</h3>
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-400"><MapPin size={12} /> {e.location || 'Kampus Cendekia Muda'}</p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-400"><CalendarDays size={12} /> {e.start_time} – {e.end_time}</p>
                  </div>
                </Link>
              ))}
              {events.length === 0 && <p className="text-sm text-slate-400 text-center py-10">Belum ada event.</p>}
            </div>
          </div>
        </div>
      </section>

      {/* PRESTASI */}
      <section className="bg-slate-900 relative overflow-hidden">
        <div className="absolute -top-24 right-0 h-80 w-80 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-20">
          <div className="text-center">
            <span className="chip bg-white/10 text-white">Prestasi</span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Kebanggaan sekolah kami</h2>
          </div>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {achievements.map((a) => (
              <div key={a.id} className="rounded-2xl bg-white/10 backdrop-blur border border-white/10 p-6 text-center card-hover">
                <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-brand grid place-items-center text-white"><Trophy size={24} /></div>
                <p className="mt-4 text-sm font-extrabold text-amber-300 uppercase tracking-wide">{a.rank}</p>
                <h3 className="mt-1 font-bold text-white">{a.title}</h3>
                <p className="mt-2 text-xs text-slate-400 text-center">{a.student_team} · {a.competition}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/prestasi" className="btn-lg bg-white/10 text-white backdrop-blur hover:bg-white/20 font-semibold inline-flex items-center gap-2 rounded-2xl px-6 py-3.5">Lihat semua prestasi <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      {/* GALERI */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <span className="chip bg-violet-50 text-violet-600 ring-1 ring-violet-100">Galeri</span>
            <h2 className="mt-4 text-3xl font-extrabold text-slate-900 tracking-tight">Momen berkesan</h2>
          </div>
          <Link to="/galeri" className="btn-outline btn-sm">Semua galeri <ArrowRight size={14} /></Link>
        </div>
        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-3">
          {gallery.map((g) => (
            <Link key={g.id} to="/galeri" className="group relative h-44 sm:h-56 overflow-hidden rounded-2xl">
              <img src={g.image} alt={g.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                <p className="text-white text-xs font-bold">{g.title}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* GURU */}
      <section className="bg-gradient-to-b from-slate-50 to-white border-y border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
          <div className="text-center max-w-2xl mx-auto">
            <span className="chip bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">Guru & Staf</span>
            <h2 className="mt-4 text-3xl font-extrabold text-slate-900 tracking-tight">Dibimbing oleh para profesional</h2>
          </div>
          <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-5">
            {teachers.map((t) => (
              <Link to="/guru" key={t.name} className="card p-5 text-center card-hover">
                <img src={t.photo} alt={t.name} className="mx-auto h-24 w-24 rounded-2xl object-cover" />
                <h3 className="mt-4 font-bold text-slate-900 text-sm">{t.name}</h3>
                <p className="text-xs font-semibold text-indigo-600 mt-1">{t.position}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{t.subject}</p>
              </Link>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/guru" className="btn-outline">Lihat seluruh guru & staf <ArrowRight size={14} /></Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-20">
        <div className="text-center">
          <span className="chip bg-sky-50 text-sky-600 ring-1 ring-sky-100">Pertanyaan Umum</span>
          <h2 className="mt-4 text-3xl font-extrabold text-slate-900 tracking-tight">Yang sering ditanyakan</h2>
        </div>
        <div className="mt-10 space-y-3">
          {faqs.map((f) => (
            <details key={f.id} className="card group open:shadow-[var(--shadow-lift)] transition-all hover:border-indigo-200/70">
              <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 font-bold text-slate-800 text-sm list-none hover:text-indigo-600 transition-colors">
                {f.question}
                <ChevronRight size={16} className="text-slate-400 transition-transform group-open:rotate-90 shrink-0" />
              </summary>
              <p className="px-5 pb-5 text-sm text-slate-500 leading-relaxed">{f.answer}</p>
            </details>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link to="/faq" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">Lihat semua FAQ <ArrowRight size={14} className="inline" /></Link>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-brand p-10 sm:p-16 text-center">
          <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
          <div className="relative">
            <GraduationCap size={40} className="mx-auto text-white/80" />
            <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Bergabunglah bersama kami</h2>
            <p className="mt-3 max-w-xl mx-auto text-white/85">Hubungi kami untuk informasi pendaftaran, konsultasi, atau kunjungan sekolah.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a href={`https://wa.me/${settings.whatsapp?.replace(/[^0-9]/g, '')}`} className="btn-lg bg-white text-indigo-700 font-bold inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 hover:bg-indigo-50">WhatsApp Kami</a>
              <a href={`mailto:${settings.email}`} className="btn-lg bg-white/15 text-white backdrop-blur font-semibold inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 hover:bg-white/25"><Mail size={18} /> Email</a>
            </div>
            <p className="mt-6 text-xs text-white/70 flex items-center justify-center gap-1.5"><Phone size={12} /> {settings.phone}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
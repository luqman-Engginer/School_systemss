import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../api';
import { Spinner, Badge, EmptyState } from '../../components/ui';
import SubPageHero from '../../components/SubPageHero';
import { CalendarDays, MapPin, Clock, ArrowRight, Users, Ticket } from 'lucide-react';

const EVENT_TONE = (e) => {
  const today = new Date();
  const d = new Date(e.date + 'T00:00:00');
  if (e.status === 'PUBLISHED' && d > today) return 'blue';
  return 'indigo';
};

export default function Events() {
  const [data, setData] = useState(null);
  useEffect(() => { api('/public/events').then(setData).catch(() => {}); }, []);
  if (!data) return <Spinner className="min-h-[60vh]" />;
  const upcoming = data.filter((e) => new Date(e.date + 'T00:00:00') >= new Date());
  const past = data.filter((e) => new Date(e.date + 'T00:00:00') < new Date());

  return (
    <div>
      <SubPageHero chip="Agenda & Kegiatan" title="Event Sekolah" desc="Jadwal kegiatan sekolah yang akan datang dan telah terlaksana." />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        {upcoming.length === 0 && past.length === 0 && <EmptyState title="Belum ada event" />}

        {upcoming.length > 0 && (
          <>
            <div className="flex items-center gap-3 mb-6">
              <span className="inline-flex h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 items-center justify-center"><Ticket size={18} /></span>
              <h2 className="text-xl font-extrabold text-slate-900">Agenda Mendatang</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {upcoming.map((e) => (
                <Link key={e.id} to={`/event/${e.id}`} className="card overflow-hidden card-hover group flex flex-col sm:flex-row">
                  <div className="relative sm:w-52 sm:shrink-0 h-48 sm:h-auto overflow-hidden">
                    <img src={e.poster} alt={e.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
                    <div className="absolute left-3 top-3"><Badge tone={EVENT_TONE(e)} className="bg-white/90 backdrop-blur">{e.status === 'PUBLISHED' ? 'Akan Datang' : e.status}</Badge></div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">{e.title}</h3>
                    <div className="mt-4 space-y-2.5 text-sm text-slate-500 flex-1">
                      <p className="flex items-center gap-2.5"><CalendarDays size={15} className="text-indigo-400" /> {new Date(e.date + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      <p className="flex items-center gap-2.5"><Clock size={15} className="text-indigo-400" /> {e.start_time} – {e.end_time}</p>
                      <p className="flex items-center gap-2.5"><MapPin size={15} className="text-indigo-400" /> {e.location || '-'}</p>
                    </div>
                    {e.description && <p className="mt-4 text-sm text-slate-500 line-clamp-2">{e.description}</p>}
                    <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600">Lihat detail <ArrowRight size={13} /></span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        {past.length > 0 && (
          <>
            <div className="flex items-center gap-3 mt-14 mb-6">
              <span className="inline-flex h-9 w-9 rounded-xl bg-slate-100 text-slate-500 items-center justify-center"><CalendarDays size={18} /></span>
              <h2 className="text-xl font-extrabold text-slate-900">Agenda Berlalu</h2>
              <span className="text-sm text-slate-400">({past.length} event)</span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {past.map((e) => (
                <Link key={e.id} to={`/event/${e.id}`} className="card p-5 card-hover">
                  <div className="flex items-center justify-between">
                    <Badge tone="slate">Selesai</Badge>
                    <span className="text-[11px] text-slate-400">{new Date(e.date + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                  <h3 className="mt-3 font-bold text-slate-900 leading-snug">{e.title}</h3>
                  {e.location && <p className="mt-2 text-sm text-slate-500 flex items-center gap-1.5"><MapPin size={13} /> {e.location}</p>}
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function EventsDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [err, setErr] = useState(false);
  useEffect(() => { api(`/public/events/${id}`).then(setData).catch(() => setErr(true)); }, [id]);
  if (err || (data && !data.title)) return <div className="py-32 text-center"><EmptyState title="Event tidak ditemukan" /></div>;
  if (!data) return <Spinner className="min-h-[60vh]" />;

  return (
    <div>
      <div className="relative bg-slate-900 overflow-hidden">
        <img src={data.poster} alt="" className="absolute inset-0 h-full w-full object-cover opacity-45" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-indigo-950/40" />
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 py-24">
          <Badge tone="indigo" className="bg-white/15 text-white backdrop-blur">{data.status}</Badge>
          <h1 className="mt-4 text-3xl sm:text-5xl font-extrabold text-white leading-tight text-balance">{data.title}</h1>
          {data.location && <p className="mt-4 flex items-center gap-2 text-white/80"><MapPin size={16} /> {data.location}</p>}
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12 -mt-8 relative">
        <div className="card p-6 sm:p-8 grid sm:grid-cols-3 gap-6 shadow-xl">
          <div className="flex items-center gap-3"><div className="h-11 w-11 rounded-xl bg-indigo-50 text-indigo-600 grid place-items-center"><CalendarDays size={20} /></div><div><p className="text-xs text-slate-400">Tanggal</p><p className="font-bold text-slate-800 text-sm">{new Date(data.date + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p></div></div>
          <div className="flex items-center gap-3"><div className="h-11 w-11 rounded-xl bg-sky-50 text-sky-600 grid place-items-center"><Clock size={20} /></div><div><p className="text-xs text-slate-400">Waktu</p><p className="font-bold text-slate-800 text-sm">{data.start_time} – {data.end_time}</p></div></div>
          <div className="flex items-center gap-3"><div className="h-11 w-11 rounded-xl bg-violet-50 text-violet-600 grid place-items-center"><Users size={20} /></div><div><p className="text-xs text-slate-400">Lokasi</p><p className="font-bold text-slate-800 text-sm">{data.location || '-'}</p></div></div>
        </div>

        {data.description && (
          <div className="mt-8 card p-6 sm:p-8">
            <h2 className="text-lg font-extrabold text-slate-900 mb-4">Tentang Event</h2>
            <div className="prose-content text-[15px] leading-relaxed text-slate-600" style={{ whiteSpace: 'pre-wrap' }}>{data.description}</div>
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link to="/event" className="btn-outline btn-sm"><ArrowRight size={14} className="rotate-180" /> Kembali ke event</Link>
          <Link to="/tentang" className="btn-primary btn-sm"><Users size={14} /> Hubungi Kami</Link>
        </div>
      </div>
    </div>
  );
}

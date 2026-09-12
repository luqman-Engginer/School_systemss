import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../api';
import { Spinner, Badge, EmptyState } from '../../components/ui';
import SubPageHero from '../../components/SubPageHero';
import { CalendarDays, ArrowRight, User } from 'lucide-react';

export default function News() {
  const [data, setData] = useState(null);
  const [q, setQ] = useState('');
  useEffect(() => { api('/public/news').then(setData).catch(() => {}); }, []);
  if (!data) return <Spinner className="min-h-[60vh]" />;
  const items = data.filter((n) => n.title.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <SubPageHero chip="Berita" title="Berita Sekolah" desc="Informasi terbaru seputar kegiatan dan kabar dari SMA kami." />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="flex justify-end mb-8">
          <input className="input !w-64" placeholder="Cari berita..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        {items.length === 0 && <EmptyState title="Berita tidak ditemukan" />}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((n) => (
            <Link key={n.id} to={`/berita/${n.id}`} className="card overflow-hidden card-hover group">
              <div className="relative h-48 overflow-hidden">
                <img src={n.thumbnail} alt={n.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <Badge tone="indigo" className="absolute left-3 top-3 bg-white/90">{n.category}</Badge>
              </div>
              <div className="p-5">
                <p className="flex items-center gap-1.5 text-xs text-slate-400"><CalendarDays size={12} /> {new Date(n.published_at + 'T00:00:00').toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>
                <h3 className="mt-2 font-bold text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">{n.title}</h3>
                <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600">Baca selengkapnya <ArrowRight size={12} /></span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export function NewsDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [err, setErr] = useState(false);
  useEffect(() => { api(`/public/news/${id}`).then(setData).catch(() => setErr(true)); }, [id]);
  if (err || (data && !data.title)) return <div className="py-32 text-center"><EmptyState title="Berita tidak ditemukan" /></div>;
  if (!data) return <Spinner className="min-h-[60vh]" />;

  return (
    <div>
      <div className="relative bg-slate-900 overflow-hidden">
        <img src={data.thumbnail} alt="" className="absolute inset-0 h-full w-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-indigo-950/60" />
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 py-20">
          <Badge tone="indigo">{data.category}</Badge>
          <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white leading-tight">{data.title}</h1>
          <p className="mt-4 flex flex-wrap items-center gap-4 text-sm text-white/70">
            <span className="flex items-center gap-1.5"><User size={14} /> {data.author || 'Admin'}</span>
            <span className="flex items-center gap-1.5"><CalendarDays size={14} /> {new Date(data.published_at + 'T00:00:00').toLocaleDateString('id-ID', { dateStyle: 'long' })}</span>
          </p>
        </div>
      </div>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
        <div className="prose-content text-[15px]" style={{ whiteSpace: 'pre-wrap' }}>{data.content}</div>
        <Link to="/berita" className="btn-outline btn-sm mt-8"><ArrowRight size={14} className="rotate-180" /> Kembali ke berita</Link>
      </div>
    </div>
  );
}
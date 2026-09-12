import { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';
import { api } from '../../api';
import { Spinner, Badge, EmptyState } from '../../components/ui';
import SubPageHero from '../../components/SubPageHero';

export default function Gallery() {
  const [data, setData] = useState(null);
  const [cat, setCat] = useState('Semua');
  const [idx, setIdx] = useState(null);

  useEffect(() => { api('/public/gallery').then(setData).catch(() => {}); }, []);
  useEffect(() => {
    if (idx === null) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setIdx(null);
      if (e.key === 'ArrowLeft') setIdx((i) => (i === null ? i : (i + items.length - 1) % items.length));
      if (e.key === 'ArrowRight') setIdx((i) => (i === null ? i : (i + 1) % items.length));
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [idx]);

  if (!data) return <Spinner className="min-h-[60vh]" />;
  const cats = ['Semua', ...new Set(data.map((g) => g.category).filter(Boolean))];
  const items = data.filter((g) => cat === 'Semua' || g.category === cat);
  const sel = idx !== null ? items[idx] : null;

  return (
    <div>
      <SubPageHero chip="Galeri" title="Galeri Sekolah" desc="Dokumentasi kegiatan, momen, dan fasilitas SMA kami." />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="flex gap-2 flex-wrap mb-8">
          {cats.map((c) => (
            <button key={c} onClick={() => { setCat(c); setIdx(null); }} className={`chip transition-all ${cat === c ? 'bg-gradient-brand text-white shadow-md shadow-indigo-200' : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300'}`}>{c}</button>
          ))}
        </div>

        {items.length === 0 && <EmptyState title="Belum ada galeri" />}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {items.map((g, i) => (
            <button key={g.id} onClick={() => setIdx(i)} className="group relative block w-full overflow-hidden rounded-2xl text-left aspect-[4/3] animate-fade-up focus:outline-none focus:ring-4 focus:ring-indigo-200">
              <img src={g.image} alt={g.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-4">
                <div className="min-w-0">
                  <p className="truncate text-white font-bold text-sm group-hover:text-indigo-200 transition-colors">{g.title}</p>
                  <p className="mt-1.5 w-fit text-[10px] font-semibold uppercase tracking-wide text-white/90 bg-white/15 backdrop-blur rounded-full px-2.5 py-0.5">{g.category}</p>
                </div>
                <ChevronRight size={18} className="shrink-0 text-white/60 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {sel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8" onClick={() => setIdx(null)}>
          <div className="absolute inset-0 bg-slate-900/85 backdrop-blur-sm animate-fade-in" />
          <button onClick={() => setIdx(null)} className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors" aria-label="Tutup"><X size={20} /></button>
          <button onClick={(e) => { e.stopPropagation(); setIdx((idx + items.length - 1) % items.length); }} disabled={items.length < 2} className="absolute left-2 sm:left-4 z-10 rounded-full bg-white/10 p-2.5 text-white hover:bg-white/20 transition-colors disabled:opacity-0" aria-label="Sebelumnya"><ChevronLeft size={22} /></button>
          <button onClick={(e) => { e.stopPropagation(); setIdx((idx + 1) % items.length); }} disabled={items.length < 2} className="absolute right-2 sm:right-4 z-10 rounded-full bg-white/10 p-2.5 text-white hover:bg-white/20 transition-colors disabled:opacity-0" aria-label="Berikutnya"><ChevronRight size={22} /></button>
          <div className="relative max-w-4xl w-full animate-fade-up" onClick={(e) => e.stopPropagation()}>
            <div className="overflow-hidden rounded-2xl bg-slate-800">
              <img src={sel.image} alt={sel.title} className="w-full max-h-[72vh] object-contain" />
            </div>
            <div className="mt-4 flex items-center gap-3">
              <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-brand grid place-items-center text-white"><ImageIcon size={16} /></div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-white font-bold">{sel.title}</p>
                <p className="mt-0.5 text-sm text-white/70 line-clamp-2">{sel.description}</p>
              </div>
              <Badge tone="slate" className="shrink-0 bg-white/15 text-white">{sel.category}</Badge>
              <span className="shrink-0 text-xs font-bold text-white/60">{idx + 1}/{items.length}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
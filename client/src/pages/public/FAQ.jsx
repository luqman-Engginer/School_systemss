import { useEffect, useState } from 'react';
import { api } from '../../api';
import { Spinner, EmptyState } from '../../components/ui';
import SubPageHero from '../../components/SubPageHero';
import { ChevronDown } from 'lucide-react';

const CATES = ['Umum', 'Akademik', 'Teknis'];

export default function FAQ() {
  const [data, setData] = useState(null);
  const [cat, setCat] = useState('Semua');
  useEffect(() => { api('/public/faqs').then(setData).catch(() => {}); }, []);
  if (!data) return <Spinner className="min-h-[60vh]" />;
  const cats = ['Semua', ...CATES];
  const items = data.filter((f) => cat === 'Semua' || f.category === cat);

  return (
    <div>
      <SubPageHero chip="FAQ" title="Pusat Bantuan" desc="Jawaban atas pertanyaan yang paling sering diajukan tentang sekolah." />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
        <div className="flex gap-2 flex-wrap mb-8">
          {cats.map((c) => (
            <button key={c} onClick={() => setCat(c)} className={`chip transition-all ${cat === c ? 'bg-gradient-brand text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300'}`}>{c}</button>
          ))}
        </div>
        {items.length === 0 && <EmptyState title="FAQ tidak ditemukan" />}
        <div className="space-y-3">
          {items.map((f) => (
            <details key={f.id} className="card group open:shadow-md transition-all">
              <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 font-bold text-slate-800 text-sm list-none">
                {f.question}
                <ChevronDown size={16} className="text-slate-400 transition-transform group-open:rotate-180 shrink-0" />
              </summary>
              <p className="px-5 pb-5 text-sm text-slate-500 leading-relaxed">{f.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
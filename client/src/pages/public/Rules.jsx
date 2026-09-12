import { useEffect, useState } from 'react';
import { api } from '../../api';
import { Spinner, EmptyState } from '../../components/ui';
import SubPageHero from '../../components/SubPageHero';
import { Scale } from 'lucide-react';

export default function Rules() {
  const [data, setData] = useState(null);
  useEffect(() => { api('/public/school-rules').then(setData).catch(() => {}); }, []);
  if (!data) return <Spinner className="min-h-[60vh]" />;
  const groups = data.reduce((acc, r) => { (acc[r.category] = acc[r.category] || []).push(r); return acc; }, {});

  return (
    <div>
      <SubPageHero chip="Peraturan Sekolah" title="Tata Tertib & Peraturan" desc="Ketentuan yang berlaku untuk menjaga ketertiban, kedisiplinan, dan kenyamanan bersama di lingkungan sekolah." />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16">
        {Object.keys(groups).length === 0 && <EmptyState title="Belum ada peraturan" />}
        {Object.entries(groups).map(([cat, rules]) => (
          <div key={cat} className="mb-10">
            <h2 className="text-lg font-extrabold text-slate-900 mb-4 flex items-center gap-2"><Scale size={18} className="text-indigo-500" /> {cat}</h2>
            <div className="space-y-3">
              {rules.map((r) => (
                <div key={r.id} className="card p-5 card-hover">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <h3 className="font-bold text-slate-900">{r.title}</h3>
                    <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400 border border-slate-200 rounded-full px-2.5 py-0.5">v{r.version} · {r.effective_date}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500 leading-relaxed">{r.content}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
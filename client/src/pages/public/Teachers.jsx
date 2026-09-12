import { useEffect, useState } from 'react';
import { api } from '../../api';
import { Spinner } from '../../components/ui';
import SubPageHero from '../../components/SubPageHero';
import { BookOpen } from 'lucide-react';

export default function Teachers() {
  const [data, setData] = useState(null);
  useEffect(() => { api('/public/teachers').then(setData).catch(() => {}); }, []);
  if (!data) return <Spinner className="min-h-[60vh]" />;

  return (
    <div>
      <SubPageHero chip="Guru & Staf" title="Para Pendidik Terbaik" desc="Guru dan staf yang berdedikasi membimbing peserta didik untuk berkembang." />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((t) => (
            <div key={t.name} className="card p-6 card-hover flex gap-5">
              <img src={t.photo} alt={t.name} className="h-20 w-20 rounded-2xl object-cover shrink-0" />
              <div className="min-w-0">
                <h3 className="font-extrabold text-slate-900 text-sm leading-snug">{t.name}</h3>
                <p className="mt-0.5 text-xs font-bold text-indigo-600">{t.position}</p>
                <p className="mt-1 text-[11px] text-slate-400 flex items-center gap-1"><BookOpen size={11} /> {t.subject}</p>
                {t.bio && <p className="mt-2.5 text-xs text-slate-500 leading-relaxed line-clamp-3">{t.bio}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api';
import { Spinner } from '../../components/ui';
import SubPageHero from '../../components/SubPageHero';
import { GraduationCap, ArrowRight } from 'lucide-react';

export default function Programs() {
  const [data, setData] = useState(null);
  useEffect(() => { api('/public/programs').then(setData).catch(() => {}); }, []);
  if (!data) return <Spinner className="min-h-[60vh]" />;

  return (
    <div>
      <SubPageHero chip="Program Pendidikan" title="Program Unggulan Sekolah" desc="Jalur peminatan dan program keahlian yang dirancang untuk mengembangkan potensi setiap peserta didik." />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="grid md:grid-cols-2 gap-6">
          {data.map((p, i) => (
            <Link to="/kontak" key={p.id} className="card p-8 card-hover group relative overflow-hidden">
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-brand opacity-10 group-hover:opacity-20 transition-opacity" />
              <div className="flex items-start justify-between gap-4">
                <div className={`h-14 w-14 rounded-2xl grid place-items-center font-extrabold text-white bg-gradient-to-br ${i % 2 ? 'from-violet-500 to-sky-400' : 'from-indigo-500 to-sky-400'}`}>{p.code || p.name[0]}</div>
                <GraduationCap size={22} className="text-slate-300" />
              </div>
              <h2 className="mt-5 text-2xl font-extrabold text-slate-900">{p.name}</h2>
              <p className="mt-3 text-slate-500 leading-relaxed">{p.description}</p>
              <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-indigo-600 group-hover:gap-3 transition-all">Pelajari lebih lanjut <ArrowRight size={15} /></span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
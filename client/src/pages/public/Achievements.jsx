import { useEffect, useState } from 'react';
import { api } from '../../api';
import { Spinner, EmptyState } from '../../components/ui';
import SubPageHero from '../../components/SubPageHero';
import { Trophy, Medal, Award } from 'lucide-react';

export default function Achievements() {
  const [data, setData] = useState(null);
  useEffect(() => { api('/public/achievements').then(setData).catch(() => {}); }, []);
  if (!data) return <Spinner className="min-h-[60vh]" />;

  const medals = { 'Juara 1': Trophy, 'Medali Emas': Trophy, 'Juara 2': Medal, 'Medali Perak': Medal, 'Juara 3': Award, 'Medali Perunggu': Award };

  return (
    <div>
      <SubPageHero chip="Prestasi" title="Prestasi & Kejuaraan" desc="Pencapaian peserta didik kami di berbagai bidang akademik dan non-akademik." />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        {data.length === 0 && <EmptyState title="Belum ada prestasi" />}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {data.map((a) => {
            const Icon = medals[a.rank] || Trophy;
            return (
              <div key={a.id} className="card p-6 text-center card-hover relative overflow-hidden">
                <div className="absolute -top-10 -right-10 h-28 w-28 rounded-full bg-amber-50" />
                <div className="relative">
                  <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 grid place-items-center text-white shadow-lg"><Icon size={28} /></div>
                  <p className="mt-4 text-xs font-extrabold text-amber-500 uppercase tracking-wider">{a.rank}</p>
                  <h3 className="mt-1 font-extrabold text-slate-900 text-sm leading-snug">{a.title}</h3>
                  <p className="mt-2 text-xs text-slate-500">{a.student_team || '-'}</p>
                  <p className="text-xs text-slate-400 mt-1">{a.competition || a.category || '-'} · {a.year}</p>
                  {a.description && <p className="mt-3 text-xs text-slate-500 leading-relaxed border-t border-slate-100 pt-3">{a.description}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
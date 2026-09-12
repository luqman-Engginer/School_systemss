import { useEffect, useState } from 'react';
import { api } from '../../api';
import { Spinner } from '../../components/ui';
import SubPageHero from '../../components/SubPageHero';
import { Eye, Target, Flag, Building2, Users } from 'lucide-react';

export default function About() {
  const [s, setS] = useState(null);
  useEffect(() => { api('/public/about').then(setS).catch(() => {}); }, []);
  if (!s) return <Spinner className="min-h-[60vh]" />;

  const blocks = [
    { icon: Eye, title: 'Visi', text: s.vision },
    { icon: Flag, title: 'Misi', text: s.mission },
    { icon: Target, title: 'Nilai Sekolah', text: s.school_values }
  ];

  const lines = (t) => (t || '').split(/\n+/).filter((x) => x.trim());

  return (
    <div>
      <SubPageHero chip="Tentang" title={s.school_name} desc={s.slogan} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <span className="chip bg-indigo-50 text-indigo-600">Profil Singkat</span>
            <h2 className="mt-4 text-3xl font-extrabold text-slate-900">Sejarah & Identitas</h2>
            <p className="mt-4 text-slate-600 leading-relaxed">{s.description}</p>
            <div className="mt-6 rounded-2xl bg-slate-50 border border-slate-100 p-5">
              <p className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2"><Building2 size={16} className="text-indigo-500" /> Sejarah</p>
              <p className="text-sm text-slate-600 leading-relaxed">{s.history}</p>
            </div>
          </div>
          <div className="space-y-5">
            {blocks.map((b) => (
              <div key={b.title} className="card p-6 card-hover">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-brand grid place-items-center text-white"><b.icon size={18} /></div>
                  <h3 className="font-extrabold text-slate-900">{b.title}</h3>
                </div>
                <div className="mt-3 pl-[52px] space-y-2">
                  {lines(b.text).length > 1 ? lines(b.text).map((l, i) => <p key={i} className="text-sm text-slate-600 leading-relaxed flex gap-2"><span className="text-indigo-500 font-bold">•</span> {l}</p>) : <p className="text-sm text-slate-600 leading-relaxed">{b.text}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16">
          <span className="chip bg-sky-50 text-sky-600">Fasilitas</span>
          <h2 className="mt-4 text-3xl font-extrabold text-slate-900">Sarana Penunjang</h2>
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {lines(s.facilities).map((f, i) => (
              <div key={i} className="card p-5 flex items-center gap-3 card-hover">
                <div className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-600 grid place-items-center shrink-0"><Users size={16} /></div>
                <p className="text-sm font-semibold text-slate-700">{f.replace(/^[-•]\s*/, '')}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16">
          <span className="chip bg-violet-50 text-violet-600">Struktur Organisasi</span>
          <h2 className="mt-4 text-3xl font-extrabold text-slate-900">Kepemimpinan Sekolah</h2>
          <div className="mt-8 card p-8 text-center">
            <p className="text-sm font-semibold text-slate-600 max-w-3xl mx-auto leading-relaxed">{s.structure}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
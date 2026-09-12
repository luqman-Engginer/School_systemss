import { useEffect, useState } from 'react';
import { api } from '../../api';
import { Spinner } from '../../components/ui';
import SubPageHero from '../../components/SubPageHero';
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Youtube, Twitter } from 'lucide-react';

export default function Contact() {
  const [s, setS] = useState(null);
  useEffect(() => { api('/public/contact').then(setS).catch(() => {}); }, []);
  if (!s) return <Spinner className="min-h-[60vh]" />;

  const items = [
    { icon: MapPin, label: 'Alamat', value: s.address },
    { icon: Phone, label: 'Telepon', value: s.phone },
    { icon: Mail, label: 'Email', value: s.email },
    { icon: Clock, label: 'Jam Layanan', value: s.operating_hours }
  ];
  const socials = [
    { icon: Instagram, href: s.instagram, label: 'Instagram' },
    { icon: Facebook, href: s.facebook, label: 'Facebook' },
    { icon: Youtube, href: s.youtube, label: 'YouTube' },
    { icon: Twitter, href: s.twitter, label: 'X / Twitter' }
  ];

  return (
    <div>
      <SubPageHero chip="Kontak" title="Hubungi Kami" desc="Kami siap membantu menjawab pertanyaan Anda." />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-10">
          <div className="space-y-4">
            {items.map((it) => (
              <div key={it.label} className="card p-5 flex items-start gap-4 card-hover">
                <div className="h-11 w-11 shrink-0 rounded-xl bg-indigo-50 text-indigo-600 grid place-items-center"><it.icon size={20} /></div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{it.label}</p>
                  <p className="mt-1 font-semibold text-slate-800 leading-relaxed">{it.value}</p>
                </div>
              </div>
            ))}
            <div className="card p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-3">Sosial Media</p>
              <div className="flex gap-3">
                {socials.filter((x) => x.href).map((x) => (
                  <a key={x.label} href={x.href} target="_blank" rel="noreferrer" className="h-11 w-11 rounded-xl bg-slate-100 text-slate-600 grid place-items-center hover:bg-gradient-brand hover:text-white transition-all" title={x.label}><x.icon size={19} /></a>
                ))}
              </div>
            </div>
            <a className={`btn-primary w-full !py-3.5 ${!s.whatsapp ? 'pointer-events-none opacity-50' : ''}`} href={`https://wa.me/${s.whatsapp?.replace(/[^0-9]/g, '')}`}>Hubungi via WhatsApp</a>
          </div>
          <div className="card overflow-hidden min-h-[420px]">
            <iframe
              title="Lokasi sekolah"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(s.address || 'Jakarta Selatan')}&output=embed`}
              className="h-full w-full min-h-[420px] border-0"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogIn, GraduationCap, ChevronRight, MapPin, Phone, Mail, MessageCircle } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../store';

const ROLE_PATHS = { ADMIN: 'admin', TEACHER: 'guru', STUDENT: 'murid', PARENT: 'wali' };

const links = [
  { to: '/', label: 'Beranda' },
  { to: '/tentang', label: 'Tentang' },
  { to: '/program', label: 'Program' },
  { to: '/berita', label: 'Berita' },
  { to: '/event', label: 'Event' },
  { to: '/galeri', label: 'Galeri' },
  { to: '/prestasi', label: 'Prestasi' },
  { to: '/guru-staf', label: 'Guru & Staf' },
  { to: '/faq', label: 'FAQ' },
  { to: '/kontak', label: 'Kontak' }
];

export default function PublicLayout() {
  const [settings, setSettings] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    api('/public/settings').then((s) => setSettings(s)).catch(() => {});
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const solid = scrolled || !isHome;

  return (
    <div className="min-h-screen bg-white">
      <header className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${solid ? 'bg-white/90 backdrop-blur-xl shadow-[0_1px_0_rgba(15,23,42,0.06)]' : 'bg-gradient-to-b from-slate-950/60 to-transparent'}`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-16 sm:h-[72px] items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-3 min-w-0 group">
              {settings?.logo ? (
                <img src={settings.logo} alt="logo" className="h-10 w-10 rounded-xl object-cover ring-2 ring-white/80 shadow-md transition-transform duration-300 group-hover:scale-105" />
              ) : (
                <div className="h-10 w-10 rounded-xl bg-gradient-brand grid place-items-center text-white shadow-lg shadow-indigo-500/30 transition-transform duration-300 group-hover:scale-105"><GraduationCap size={20} /></div>
              )}
              <div className="min-w-0">
                <p className={`truncate text-sm sm:text-base font-extrabold leading-tight ${isHome && !solid ? 'text-white' : 'text-slate-900'}`}>{settings?.short_name || 'SchoolHub'}</p>
                <p className={`hidden sm:block text-xs truncate ${isHome && !solid ? 'text-slate-300' : 'text-slate-500'}`}>{settings?.slogan || ''}</p>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-0.5">
              {links.map((l) => (
                <NavLink key={l.to} to={l.to} end={l.to === '/'}
                  className={({ isActive }) => `px-3 py-2 text-[13px] font-semibold rounded-lg transition-colors ${isActive ? 'text-indigo-600 bg-indigo-50' : isHome && !solid ? 'text-white/90 hover:text-white hover:bg-white/10' : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'}`}>
                  {l.label}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              {user ? (
                <button className={`btn-primary btn-sm hidden sm:inline-flex ${isHome && !solid ? '!shadow-none' : ''}`} onClick={() => navigate(`/${ROLE_PATHS[user.role]}`)}>
                  Dashboard <ChevronRight size={14} />
                </button>
              ) : (
                <button className={`btn-primary btn-sm hidden sm:inline-flex ${isHome && !solid ? '!shadow-none' : ''}`} onClick={() => navigate('/login')}>
                  <LogIn size={14} /> Masuk
                </button>
              )}
              <button className={`lg:hidden btn-ghost !px-2.5 ${isHome && !solid ? '!text-white hover:!bg-white/10' : ''}`} onClick={() => setOpen(!open)}>
                {open ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {open && (
          <div className="lg:hidden border-t border-slate-100 bg-white max-h-[70vh] overflow-y-auto animate-fade-in shadow-2xl">
            <div className="px-4 py-3 grid grid-cols-2 gap-1">
              {links.map((l) => (
                <NavLink key={l.to} to={l.to} end={l.to === '/'} className="px-3 py-2.5 text-sm font-semibold text-slate-700 rounded-lg hover:bg-slate-50">
                  {l.label}
                </NavLink>
              ))}
            </div>
            <div className="px-4 pb-4 flex gap-2">
              {user ? (
                <button className="btn-primary w-full" onClick={() => navigate(`/${ROLE_PATHS[user.role]}`)}>Dashboard</button>
              ) : (
                <button className="btn-primary w-full" onClick={() => navigate('/login')}><LogIn size={16} /> Masuk</button>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="pt-16 sm:pt-[72px]">{<Outlet context={{ settings }} />}</main>

      <footer className="mt-20 bg-slate-950 text-slate-300 relative overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-64 w-[40rem] rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-14">
          <div className="grid gap-10 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3">
                {settings?.logo ? <img src={settings.logo} alt="logo" className="h-11 w-11 rounded-xl object-cover ring-1 ring-white/20" /> : <div className="h-11 w-11 rounded-xl bg-gradient-brand grid place-items-center"><GraduationCap size={22} /></div>}
                <div>
                  <p className="font-extrabold text-white">{settings?.school_name || 'SchoolHub'}</p>
                  <p className="text-sm text-slate-400">{settings?.slogan || ''}</p>
                </div>
              </div>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-400">{settings?.description}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {[{ key: 'instagram', label: 'Instagram' }, { key: 'facebook', label: 'Facebook' }, { key: 'youtube', label: 'YouTube' }, { key: 'tiktok', label: 'TikTok' }].map((s) => settings[s.key] ? (
                  <a key={s.key} href={settings[s.key]} target="_blank" rel="noreferrer" className="rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors">{s.label}</a>
                ) : null)}
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-white mb-4">Tautan Cepat</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {links.slice(0, 6).map((l) => <Link key={l.to} to={l.to} className="hover:text-white transition-colors">{l.label}</Link>)}
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-white mb-4">Kontak</p>
              <ul className="text-sm space-y-2.5 text-slate-400">
                <li className="flex items-start gap-2"><MapPin size={15} className="mt-0.5 shrink-0 text-indigo-400" />{settings?.address}</li>
                <li className="flex items-center gap-2"><Phone size={15} className="shrink-0 text-indigo-400" />{settings?.phone}</li>
                <li className="flex items-center gap-2"><MessageCircle size={15} className="shrink-0 text-indigo-400" />{settings?.whatsapp}</li>
                <li className="flex items-center gap-2"><Mail size={15} className="shrink-0 text-indigo-400" />{settings?.email}</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
            <p>© {new Date().getFullYear()} {settings?.school_name || 'SchoolHub'}. Seluruh hak cipta dilindungi.</p>
            <p>Digerakkan oleh <span className="bg-gradient-brand bg-clip-text text-transparent font-bold">SchoolHub</span> — Digital School Integrated Platform</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
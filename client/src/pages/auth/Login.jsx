import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Mail, Lock, LogIn, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../store';
import { useToast } from '../../components/ui';

const ROLE_PATH = { ADMIN: '/admin', TEACHER: '/guru', STUDENT: '/murid', PARENT: '/wali' };

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Selamat datang kembali, ${user.name}!`);
      navigate(ROLE_PATH[user.role]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-slate-50">
      <div className="hidden lg:flex relative bg-slate-950 p-12 flex-col justify-between overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(135deg, rgba(79,70,229,0.9) 0%, rgba(2,6,23,0.7) 55%, rgba(14,165,233,0.35) 100%)' }} />
        <div className="absolute -top-40 -right-40 h-[28rem] w-[28rem] rounded-full bg-indigo-600/40 blur-3xl animate-pulse" />
        <div className="absolute bottom-0 -left-24 h-80 w-80 rounded-full bg-sky-500/30 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        <div className="absolute right-8 top-8 h-24 w-24 rounded-2xl border border-white/15 rotate-12" />
        <div className="absolute right-20 bottom-32 h-14 w-14 rounded-2xl border border-white/15 -rotate-12" />
        <div className="relative z-10">
          <button onClick={() => navigate('/')} className="flex items-center gap-3 group">
            <div className="h-12 w-12 rounded-2xl bg-white/15 backdrop-blur grid place-items-center text-white ring-1 ring-white/25 shadow-xl transition-transform group-hover:scale-105"><GraduationCap size={26} /></div>
            <div className="text-left">
              <p className="text-lg font-extrabold text-white">SchoolHub</p>
              <p className="text-xs text-white/70 tracking-wide">Digital School Integrated Platform</p>
            </div>
          </button>
        </div>
        <div className="relative z-10">
          <span className="chip bg-white/10 text-white ring-1 ring-white/25 backdrop-blur"><ShieldCheck size={13} /> Platform Sekolah Terdepan</span>
          <h1 className="mt-5 text-4xl xl:text-5xl font-extrabold text-white leading-[1.12] max-w-lg tracking-tight">
            Satu platform untuk menghubungkan seluruh ekosistem sekolah.
          </h1>
          <p className="mt-5 text-white/80 max-w-md leading-relaxed">
            Belajar, komunikasi, monitoring, dan manajemen sekolah dalam satu sistem terpadu untuk
            Admin, Guru, Murid, dan Wali Murid.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {['Pembelajaran Terpadu', 'Parent Monitoring', 'Keamanan Data', 'Design Modern'].map((t) => (
              <span key={t} className="chip bg-white/10 text-white ring-1 ring-white/20 backdrop-blur">{t}</span>
            ))}
          </div>
        </div>
        <p className="relative z-10 text-xs text-white/60">© {new Date().getFullYear()} SchoolHub</p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md animate-fade-up">
          <button onClick={() => navigate('/')} className="lg:hidden inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-6">
            <ArrowLeft size={15} /> Kembali ke beranda
          </button>

          <div className="lg:hidden flex items-center gap-3 mb-4">
            <div className="h-11 w-11 rounded-xl bg-gradient-brand grid place-items-center text-white shadow-lg shadow-indigo-500/30"><GraduationCap size={22} /></div>
            <p className="text-lg font-extrabold text-slate-900">SchoolHub</p>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Selamat datang kembali <span className="inline-block animate-bounce" style={{ animationDuration: '2.5s' }}>👋</span></h2>
          <p className="mt-1.5 text-sm text-slate-500">Masuk menggunakan akun yang dibagikan oleh sekolah Anda.</p>

          {error && <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600 animate-fade-in flex items-start gap-2"><ShieldCheck size={18} className="mt-0.5 shrink-0" /> {error}</div>}

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="space-y-1">
              <label className="label">Email</label>
              <div className="relative">
                <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input className="input !pl-10" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@sekolah.sch.id" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input className="input !pl-10" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full !py-3 text-base">
              {loading ? <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" /> : <LogIn size={17} />}
              Masuk
            </button>
          </form>

          <div className="mt-8 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 to-sky-50/60 p-4 flex items-start gap-3">
            <div className="h-9 w-9 shrink-0 rounded-xl bg-white shadow-sm ring-1 ring-indigo-100 grid place-items-center text-indigo-600">
              <ShieldCheck size={17} />
            </div>
            <div>
              <p className="text-[13px] font-bold text-slate-800">Akun Anda aman & terkelola sekolah</p>
              <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">
                Email dan kata sandi diberikan secara langsung oleh wali kelas atau administrasi sekolah. Jangan bagikan akun Anda kepada siapa pun.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
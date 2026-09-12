import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, GraduationCap, BookOpen, ClipboardList, Users, CalendarDays,
  MessageSquare, Megaphone, Bell, LogOut, Menu, X, ChevronRight, FileText,
  Trophy, Image as ImageIcon, LifeBuoy, School, Settings, UserCog, BookMarked,
  Timer, BarChart3, ListChecks, FilePlus2, ClipboardCheck, UserCheck,
  AlertTriangle, NotebookPen, Baby, HeartHandshake, Home, Sparkles, Share2, CheckCheck, TrendingUp
} from 'lucide-react';
import { useAuth } from '../store';
import { api } from '../api';
import { Avatar, useToast, Badge } from '../components/ui';

const NAVS = {
  ADMIN: [
    { group: 'Utama', items: [ { to: '/admin', label: 'Dashboard', icon: LayoutDashboard } ] },
    { group: 'Sekolah', items: [
      { to: '/admin/sekolah', label: 'Profil Sekolah', icon: School },
      { to: '/admin/branding', label: 'Branding', icon: Sparkles },
      { to: '/admin/sosial', label: 'Sosial Media', icon: ShareIcon },
      { to: '/admin/kontak', label: 'Kontak & Lokasi', icon: FileText }
    ] },
    { group: 'Konten', items: [
      { to: '/admin/berita', label: 'Berita', icon: FileText },
      { to: '/admin/event', label: 'Event', icon: Megaphone },
      { to: '/admin/galeri', label: 'Galeri', icon: ImageIcon },
      { to: '/admin/prestasi', label: 'Prestasi', icon: Trophy },
      { to: '/admin/faq', label: 'FAQ', icon: LifeBuoy },
      { to: '/admin/pengumuman', label: 'Pengumuman', icon: Megaphone },
      { to: '/admin/peraturan', label: 'Peraturan Sekolah', icon: ClipboardCheck }
    ] },
    { group: 'Akademik', items: [
      { to: '/admin/akademik/tahun', label: 'Tahun Ajaran', icon: CalendarDays },
      { to: '/admin/akademik/program', label: 'Program', icon: BookMarked },
      { to: '/admin/akademik/kelas', label: 'Kelas', icon: Users },
      { to: '/admin/akademik/mapel', label: 'Mata Pelajaran', icon: BookOpen },
      { to: '/admin/akademik/jadwal', label: 'Jadwal', icon: Timer },
      { to: '/admin/akademik/guru', label: 'Guru & Staf', icon: UserCog },
      { to: '/admin/akademik/siswa', label: 'Siswa', icon: GraduationCap },
      { to: '/admin/akademik/wali', label: 'Relasi Wali & Siswa', icon: HeartHandshake }
    ] },
    { group: 'Komunikasi', items: [
      { to: '/admin/aspirasi', label: 'Aspirasi', icon: NotebookPen }
    ] },
    { group: 'Lainnya', items: [
      { to: '/admin/laporan', label: 'Laporan', icon: BarChart3 },
      { to: '/admin/aktivitas', label: 'Aktivitas', icon: ListChecks }
    ] }
  ],
  TEACHER: [
    { group: 'Utama', items: [ { to: '/guru', label: 'Dashboard', icon: LayoutDashboard } ] },
    { group: 'Pengajaran', items: [
      { to: '/guru/kelas', label: 'Kelas Saya', icon: Users },
      { to: '/guru/materi', label: 'Materi', icon: BookOpen },
      { to: '/guru/tugas', label: 'Tugas', icon: ClipboardList },
      { to: '/guru/progress', label: 'Progress Siswa', icon: BarChart3 },
      { to: '/guru/traffic', label: 'Traffic Siswa', icon: TrendingUp }
    ] },
    { group: 'Siswa', items: [
      { to: '/guru/siswa', label: 'Daftar Siswa', icon: GraduationCap },
      { to: '/guru/kehadiran', label: 'Kehadiran', icon: UserCheck },
      { to: '/guru/konseling', label: 'Catatan & Disiplin', icon: AlertTriangle }
    ] },
    { group: 'Komunikasi', items: [
      { to: '/guru/diskusi', label: 'Ruang Diskusi', icon: MessageSquare },
      { to: '/guru/meeting', label: 'Meeting Wali Murid', icon: Users },
      { to: '/guru/jadwal', label: 'Jadwal Mengajar', icon: CalendarDays }
    ] }
  ],
  STUDENT: [
    { group: 'Utama', items: [ { to: '/murid', label: 'Dashboard', icon: LayoutDashboard } ] },
    { group: 'Belajar', items: [
      { to: '/murid/materi', label: 'Materi Saya', icon: BookOpen },
      { to: '/murid/terlewat', label: 'Missed Learning', icon: ClipboardCheck },
      { to: '/murid/tugas', label: 'Tugas', icon: ListChecks },
      { to: '/murid/quiz', label: 'Quiz', icon: FilePlus2 },
      { to: '/murid/review', label: 'Review', icon: BookMarked },
      { to: '/murid/progress', label: 'Progress Saya', icon: BarChart3 }
    ] },
    { group: 'Lainnya', items: [
      { to: '/murid/jadwal', label: 'Jadwal', icon: CalendarDays },
      { to: '/murid/diskusi', label: 'Diskusi', icon: MessageSquare },
      { to: '/murid/aspirasi', label: 'Aspirasi', icon: NotebookPen },
      { to: '/murid/kehadiran', label: 'Kehadiran', icon: UserCheck }
    ] }
  ],
  PARENT: [
    { group: 'Utama', items: [ { to: '/wali', label: 'Dashboard', icon: LayoutDashboard } ] },
    { group: 'Anak', items: [ { to: '/wali/anak', label: 'Anak Saya', icon: Baby } ] },
    { group: 'Monitoring', items: [
      { to: '/wali/anak/SELECTED/akademik', label: 'Akademik & Nilai', icon: BookOpen },
      { to: '/wali/anak/SELECTED/kehadiran', label: 'Kehadiran', icon: UserCheck },
      { to: '/wali/anak/SELECTED/disiplin', label: 'Kedisiplinan', icon: AlertTriangle },
      { to: '/wali/anak/SELECTED/feedback', label: 'Feedback Guru', icon: MessageSquare }
    ] },
    { group: 'Komunikasi', items: [
      { to: '/wali/meeting', label: 'Meeting', icon: Users }
    ] }
  ]
};

function ShareIcon({ size }) {
  return <Share2 size={size} />;
}

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState({ notifications: [], unread: 0 });
  const [settings, setSettings] = useState(null);

  const role = user?.role;
  const [childId, setChildId] = useState(null);
  const base = role === 'ADMIN' ? 'admin' : role === 'TEACHER' ? 'guru' : role === 'STUDENT' ? 'murid' : 'wali';
  const nav = (NAVS[role] || []).map((g) => ({
    ...g,
    items: g.items.map((item) => item.to.includes('SELECTED')
      ? (childId ? { ...item, to: item.to.replace('SELECTED', childId) } : null)
      : item).filter(Boolean)
  }));

  useEffect(() => {
    if (role === 'PARENT') {
      const stored = localStorage.getItem('schoolhub_child');
      api('/parent/children').then((kids) => {
        const active = stored && kids.some((k) => String(k.student_id) === stored) ? stored : kids[0]?.student_id;
        if (active) { localStorage.setItem('schoolhub_child', String(active)); setChildId(String(active)); }
      }).catch(() => {});
    }
  }, [role]);

  useEffect(() => {
    api('/auth/notifications').then(setNotifs).catch(() => {});
    api('/public/settings').then(setSettings).catch(() => {});
    const t = setInterval(() => api('/auth/notifications').then(setNotifs).catch(() => {}), 30000);
    return () => clearInterval(t);
  }, []);

  const openNotifs = async () => {
    if (notifOpen) return setNotifOpen(false);
    try {
      const d = await api('/auth/notifications');
      setNotifs(d);
      setNotifOpen(true);
    } catch {
      setNotifs({ notifications: [], unread: 0 });
      setNotifOpen(true);
    }
  };

  const markRead = async () => {
    try {
      await api('/auth/notifications/read', { method: 'POST', body: {} });
      const d = await api('/auth/notifications');
      setNotifs(d);
      toast.success('Semua notifikasi ditandai sudah dibaca.');
    } catch (e) { toast.error(e.message); }
  };

  const markOneRead = async (n) => {
    if (n.is_read) return;
    try {
      await api('/auth/notifications/read', { method: 'POST', body: { id: n.id } });
      setNotifs((prev) => ({
        ...prev,
        unread: Math.max(0, prev.unread - 1),
        notifications: prev.notifications.map((x) => x.id === n.id ? { ...x, is_read: 1 } : x)
      }));
    } catch (e) { toast.error(e.message); }
  };

  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-slate-950 text-slate-300 flex flex-col transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="relative shrink-0 px-5 h-16 border-b border-white/10 flex items-center gap-3 overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/60 to-transparent" />
          <div className="absolute -top-10 -right-10 h-28 w-28 rounded-full bg-indigo-600/20 blur-2xl" />
          {settings?.logo ? <img src={settings.logo} alt="" className="relative h-9 w-9 rounded-lg object-cover ring-1 ring-white/20" /> : <div className="relative h-9 w-9 rounded-lg bg-gradient-brand grid place-items-center text-white shadow-lg"><GraduationCap size={18} /></div>}
          <div className="relative min-w-0">
            <p className="text-sm font-extrabold text-white truncate">{settings?.short_name || 'SchoolHub'}</p>
            <p className="text-[10px] uppercase tracking-wider text-slate-400">Digital School Platform</p>
          </div>
          <button className="lg:hidden ml-auto text-slate-400" onClick={() => setSidebarOpen(false)}><X size={20} /></button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {nav.map((g) => (
            <div key={g.group}>
              <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">{g.group}</p>
              <div className="space-y-0.5">
                {g.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink key={item.to} to={item.to} end={item.to === `/${base}`} onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) => `navlink text-slate-400 ${isActive ? 'active !text-white bg-gradient-brand' : ''}`}>
                      <Icon size={17} className="shrink-0" /> {item.label}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 shrink-0">
          <Link to="/" className="flex items-center gap-2 rounded-xl bg-white/5 hover:bg-white/10 px-3 py-2 text-xs font-medium text-slate-300 transition-colors"><Home size={14} /> Lihat Website Publik</Link>
        </div>
      </aside>

      {/* Main */}
      <div className="lg:pl-72">
        {/* Topbar */}
        <header className="sticky top-0 z-20 h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 flex items-center gap-3 px-4 sm:px-6">
          <button className="lg:hidden btn-ghost !px-2.5" onClick={() => setSidebarOpen(true)}><Menu size={22} /></button>
          <div className="hidden sm:flex items-center text-xs font-semibold text-slate-400">
            <span className="text-slate-700 capitalize">{role === 'ADMIN' ? 'Admin' : role === 'TEACHER' ? 'Guru' : role === 'STUDENT' ? 'Murid' : 'Wali Murid'}</span>
            <ChevronRight size={14} className="mx-1" />
            <span>Dashboard</span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button onClick={openNotifs} className="relative btn-ghost !px-2.5 !py-2 hover:!bg-indigo-50">
              <Bell size={19} className="text-slate-500" />
              {notifs.unread > 0 && <span className="absolute -top-0.5 -right-0.5 h-5 min-w-5 rounded-full bg-rose-500 text-white text-[10px] font-bold grid place-items-center px-1 ring-2 ring-white">{notifs.unread}</span>}
            </button>

            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 ml-1">
              <Avatar src={user?.photo} name={user?.name} size={36} className="ring-2 ring-white shadow-sm" />
              <div className="hidden sm:block leading-tight">
                <p className="text-sm font-bold text-slate-800 max-w-[160px] truncate">{user?.name}</p>
                <p className="text-[11px] text-slate-400 capitalize">{role === 'ADMIN' ? 'Administrator' : role === 'TEACHER' ? 'Guru' : role === 'STUDENT' ? 'Murid' : 'Wali Murid'}</p>
              </div>
              <button className="btn-ghost !px-2 !py-2 hover:!bg-rose-50 hover:!text-rose-600" onClick={() => { logout(); navigate('/'); }} title="Keluar">
                <LogOut size={17} />
              </button>
            </div>
          </div>
        </header>

        <Outlet />
      </div>

      {/* Notifications drawer */}
      {notifOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-slate-900/40 animate-fade-in" onClick={() => setNotifOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl animate-fade-up flex flex-col">
            <div className="px-5 h-16 border-b border-slate-100 flex items-center justify-between">
              <p className="font-extrabold text-slate-900 flex items-center gap-2">
                Notifikasi
                {notifs.notifications.length > 0 && <span className="text-[11px] font-bold bg-slate-100 text-slate-500 rounded-full px-2 py-0.5">{notifs.notifications.length}</span>}
              </p>
              <button className="btn-ghost !px-2 !py-1" onClick={() => setNotifOpen(false)}><X size={18} /></button>
            </div>

            {notifs.unread > 0 && (
              <button onClick={markRead} className="mx-5 mt-3 inline-flex items-center justify-center gap-1.5 btn-primary btn-sm">
                <CheckCheck size={15} /> Tandai semua sudah dibaca ({notifs.unread})
              </button>
            )}

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
              {notifs.notifications.length === 0 && <p className="text-sm text-slate-400 text-center py-10">Belum ada notifikasi.</p>}
              {notifs.notifications.map((n) => (
                <button key={n.id} onClick={() => markOneRead(n)} className={`w-full text-left rounded-xl border p-3.5 text-sm transition-colors ${n.is_read ? 'border-slate-100 bg-white' : 'border-indigo-200 bg-indigo-50/60 hover:bg-indigo-50'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold text-slate-800 flex items-center gap-2">
                      {!n.is_read && <span className="h-2 w-2 shrink-0 rounded-full bg-indigo-500" />}
                      {n.title}
                    </p>
                    {!n.is_read && <Badge tone="indigo">Baru</Badge>}
                  </div>
                  {n.message && <p className="mt-1 text-xs text-slate-500 line-clamp-2">{n.message}</p>}
                  <p className="mt-1.5 text-[10px] text-slate-400">{new Date(n.created_at + 'Z').toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
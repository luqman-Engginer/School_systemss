import { Component, createContext, useContext, useEffect, useState } from 'react';
import { X, Inbox, CheckCircle2, XCircle, Info, AlertTriangle } from 'lucide-react';

export function Card({ className = '', children, ...rest }) {
  return <div className={`card ${className}`} {...rest}>{children}</div>;
}

export function Stat({ icon: Icon, label, value, sub, tone = 'indigo' }) {
  const tones = {
    indigo: 'bg-indigo-50 text-indigo-600',
    sky: 'bg-sky-50 text-sky-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
    violet: 'bg-violet-50 text-violet-600',
    slate: 'bg-slate-100 text-slate-600'
  };
  const rings = {
    indigo: 'ring-indigo-100',
    sky: 'ring-sky-100',
    emerald: 'ring-emerald-100',
    amber: 'ring-amber-100',
    rose: 'ring-rose-100',
    violet: 'ring-violet-100',
    slate: 'ring-slate-200'
  };
  return (
    <Card className="p-5 flex items-start gap-4 card-hover relative overflow-hidden">
      <span className={`pointer-events-none absolute -top-6 -right-6 h-20 w-20 rounded-full opacity-40 blur-2xl ${tones[tone]}`} />
      <div className={`h-11 w-11 shrink-0 rounded-xl grid place-items-center ring-1 ${tones[tone]} ${rings[tone]}`}>
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <p className="mt-1 text-2xl font-extrabold text-slate-900 leading-none">{value}</p>
        {sub && <p className="mt-1.5 text-xs text-slate-500 truncate">{sub}</p>}
      </div>
    </Card>
  );
}

export function ProgressBar({ value, className = '', tone = 'brand' }) {
  const v = Math.max(0, Math.min(100, value || 0));
  const bar = tone === 'brand'
    ? 'bg-gradient-brand'
    : tone === 'emerald' ? 'bg-emerald-500' : tone === 'amber' ? 'bg-amber-500' : tone === 'rose' ? 'bg-rose-500' : 'bg-indigo-500';
  return (
    <div className={`h-2 w-full rounded-full bg-slate-100 overflow-hidden ${className}`}>
      <div className={`h-full rounded-full ${bar} transition-all duration-500`} style={{ width: `${v}%` }} />
    </div>
  );
}

export function Badge({ children, tone = 'slate', className = '' }) {
  return <span className={`badge-${tone} ${className}`}>{children}</span>;
}

const STATUS_TONES = {
  PUBLISHED: 'green', ACTIVE: 'green', COMPLETED: 'green', PRESENT: 'green',
  RESOLVED: 'green', GRADED: 'green', SCHEDULED: 'blue', SUBMITTED: 'blue',
  DRAFT: 'slate', PENDING: 'amber', NOT_STARTED: 'slate', IN_PROGRESS: 'blue',
  MISSED: 'rose', LATE: 'amber', ABSENT: 'rose', UNDER_REVIEW: 'amber',
  INACTIVE: 'slate', CANCELLED: 'rose', REJECTED: 'rose', ARCHIVED: 'slate',
  SICK: 'amber', EXCUSED: 'violet', OPEN: 'amber', REQUESTED: 'amber', CLOSED: 'slate', ONGOING: 'blue', UPCOMING: 'blue'
};

export function statusTone(s) {
  return STATUS_TONES[s] || 'indigo';
}

export function StatusBadge({ status }) {
  const label = String(status || '').replaceAll('_', ' ');
  return <Badge tone={statusTone(status)}>{label}</Badge>;
}

export function EmptyState({ title = 'Belum ada data', desc, icon: Icon = Inbox, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="h-14 w-14 rounded-2xl bg-slate-100 grid place-items-center text-slate-400 mb-4">
        <Icon size={24} />
      </div>
      <p className="font-bold text-slate-700">{title}</p>
      {desc && <p className="mt-1 text-sm text-slate-400 max-w-xs">{desc}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Spinner({ className = '' }) {
  return (
    <div className={`grid place-items-center py-20 ${className}`}>
      <div className="h-10 w-10 rounded-full border-[3px] border-indigo-200 border-t-indigo-600 animate-spin" />
    </div>
  );
}

export function PageHeader({ title, desc, children, subtitle, icon: Icon, eyebrow }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {(eyebrow || Icon) && (
          <div className="mb-2 flex items-center gap-2">
            {Icon && <span className="h-8 w-8 rounded-lg bg-gradient-brand text-white grid place-items-center shadow-md shadow-indigo-500/25"><Icon size={16} /></span>}
            {eyebrow && <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">{eyebrow}</span>}
          </div>
        )}
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">{subtitle || desc}</p>
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

export function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose && onClose();
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className={`relative w-full ${widths[size]} bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl animate-fade-up max-h-[90vh] overflow-hidden flex flex-col`}>
        <div className="relative flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-br from-slate-50/80 to-white">
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          <button className="btn-ghost btn-sm !px-2 !py-1 !bg-white/70 hover:!bg-white" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="px-6 py-5 overflow-y-auto">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50/60">{footer}</div>}
      </div>
    </div>
  );
}

const ToastContext = createContext(null);
export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const push = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  };
  const ICONS = { success: CheckCircle2, error: XCircle, info: Info };
  return (
    <ToastContext.Provider value={{ push, success: (m) => push(m, 'success'), error: (m) => push(m, 'error'), info: (m) => push(m, 'info') }}>
      {children}
      <div className="fixed top-4 right-4 z-[60] space-y-2 w-80 max-w-[90vw]">
        {toasts.map((t) => {
          const Icon = ICONS[t.type] || CheckCircle2;
          const tone = t.type === 'error' ? 'border-rose-200 bg-white text-rose-600' : t.type === 'info' ? 'border-sky-200 bg-white text-sky-600' : 'border-emerald-200 bg-white text-emerald-600';
          return (
            <div key={t.id} className={`animate-fade-up rounded-xl border ${tone} px-4 py-3 text-sm font-semibold shadow-lg flex items-center gap-3 backdrop-blur`}>
              <Icon size={18} className="shrink-0" />
              <span className="text-slate-800">{t.message}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function Avatar({ src, name, size = 40, className = '' }) {
  const initials = (name || '?').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  return src ? (
    <img src={src} alt={name} style={{ width: size, height: size }} className={`rounded-full object-cover ${className}`} />
  ) : (
    <div style={{ width: size, height: size }} className={`rounded-full grid place-items-center bg-gradient-brand text-white font-bold text-sm ${className}`}>{initials}</div>
  );
}

export function Dot({ color = 'bg-emerald-500' }) {
  return <span className={`inline-block h-2 w-2 rounded-full ${color}`} />;
}

export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex gap-1 rounded-xl bg-slate-100 p-1 w-fit max-w-full overflow-x-auto">
      {tabs.map((t) => (
        <button key={t.key} onClick={() => onChange(t.key)}
          className={`px-4 py-2 text-sm font-semibold rounded-lg whitespace-nowrap transition-all ${active === t.key ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function ConfirmModal({ open, onClose, onConfirm, title, message, confirmText = 'Ya, lanjutkan' }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm"
      footer={<>
        <button className="btn-outline btn-sm" onClick={onClose}>Batal</button>
        <button className="btn-danger btn-sm" onClick={() => { onConfirm(); onClose(); }}>{confirmText}</button>
      </>}>
      <p className="text-sm text-slate-600">{message}</p>
    </Modal>
  );
}

export function FormField({ label, children, hint }) {
  return (
    <div className="space-y-1">
      <label className="label !mb-1">{label}</label>
      {children}
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

export function VideoModal({ url, onClose, title }) {
  return (
    <Modal open onClose={onClose} title={title || 'Video Pembelajaran'} size="lg">
      <div className="aspect-video rounded-xl overflow-hidden bg-slate-900">
        <iframe className="w-full h-full" src={url} title="Video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
      </div>
    </Modal>
  );
}

export function Page({ title, desc, children, actions }) {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader title={title} subtitle={desc}>{actions}</PageHeader>
      <div className="animate-fade-up">{children}</div>
    </div>
  );
}

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info);
  }
  handleReset = () => {
    this.setState({ error: null });
  };
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen grid place-items-center bg-[#f6f7fb] p-6">
          <div className="card max-w-md w-full p-8 text-center">
            <div className="mx-auto h-14 w-14 rounded-2xl bg-rose-100 grid place-items-center text-rose-600"><AlertTriangle size={26} /></div>
            <h1 className="mt-4 text-xl font-extrabold text-slate-900">Oops, terjadi kesalahan</h1>
            <p className="mt-2 text-sm text-slate-500">Halaman ini mengalami gangguan. Silakan muat ulang untuk melanjutkan.</p>
            <p className="mt-3 text-xs text-slate-400 font-mono line-clamp-3">{String(this.state.error?.message || this.state.error)}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <button className="btn-primary btn-sm" onClick={this.handleReset}>Coba Lagi</button>
              <button className="btn-outline btn-sm" onClick={() => { window.location.href = '/'; }}>Ke Beranda</button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
import { useEffect, useState } from 'react';
import { api } from '../../api';
import { Page, Card, Spinner, EmptyState, Badge } from '../../components/ui';
import { Activity, User } from 'lucide-react';

export default function AdminActivity() {
  const [d, setD] = useState(null);
  useEffect(() => { api('/admin/dashboard').then(setD).catch(() => {}); }, []);
  if (!d) return <Spinner />;

  const logs = d.activity;

  return (
    <Page title="Audit Log & Aktivitas" subtitle="Catatan aktivitas penting sistem untuk keamanan dan penelusuran.">
      <Card className="p-5 max-w-3xl">
        {logs.length === 0 && <EmptyState title="Belum ada aktivitas" />}
        <div className="relative space-y-0">
          {logs.map((a, i) => (
            <div key={i} className="flex gap-4 pb-6 last:pb-0 relative">
              <div className="relative z-10 mt-0.5 h-9 w-9 shrink-0 rounded-full bg-gradient-brand grid place-items-center text-white"><Activity size={14} /></div>
              {i < logs.length - 1 && <div className="absolute left-[18px] top-10 h-full w-px bg-slate-100" />}
              <div className="pt-1">
                <p className="text-sm font-bold text-slate-800 flex items-center gap-2">{a.action} <Badge tone="slate" className="!text-[10px]">{a.entity}</Badge></p>
                <p className="text-xs text-slate-400 mt-0.5">{a.details || ''} · {new Date(a.created_at + 'Z').toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1"><User size={10} /> User #{a.user_id}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </Page>
  );
}
import { SettingsPage, Field } from './_settingsForm';
import { Card } from '../../components/ui';
import { Instagram, Facebook, Youtube, Music2, Twitter } from 'lucide-react';

export default function AdminSocial() {
  return (
    <SettingsPage title="Sosial Media" subtitle="Tautan media sosial yang ditampilkan pada website publik.">
      {(s, set) => (
        <Card className="p-6 grid sm:grid-cols-2 gap-5">
          {[
            { label: 'Instagram', field: 'instagram', icon: Instagram },
            { label: 'Facebook', field: 'facebook', icon: Facebook },
            { label: 'YouTube', field: 'youtube', icon: Youtube },
            { label: 'TikTok', field: 'tiktok', icon: Music2 },
            { label: 'X / Twitter', field: 'twitter', icon: Twitter }
          ].map((x) => (
            <Field key={x.field} label={x.label}>
              <div className="flex items-center gap-2">
                <div className="h-11 w-11 shrink-0 rounded-xl bg-slate-100 text-slate-500 grid place-items-center"><x.icon size={18} /></div>
                <input className="input" placeholder={`https://${x.label.toLowerCase()}...`} value={s[x.field]} onChange={(e) => set({ ...s, [x.field]: e.target.value })} />
              </div>
            </Field>
          ))}
        </Card>
      )}
    </SettingsPage>
  );
}
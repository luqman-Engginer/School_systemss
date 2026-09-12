import { SettingsPage, Field } from './_settingsForm';
import { Card } from '../../components/ui';

export default function AdminBranding() {
  return (
    <SettingsPage title="Branding & Tampilan" subtitle="Logo, warna, dan identitas visual yang otomatis diterapkan ke website publik.">
      {(s, set) => (
        <>
          <Card className="p-6 grid sm:grid-cols-2 gap-5">
            <Field label="Nama Website"><input className="input" value={s.website_name} onChange={(e) => set({ ...s, website_name: e.target.value })} /></Field>
            <Field label="Warna Primer"><div className="flex items-center gap-3"><input type="color" className="h-11 w-16 cursor-pointer rounded-xl border border-slate-300 bg-white" value={s.primary_color} onChange={(e) => set({ ...s, primary_color: e.target.value })} /><input className="input" value={s.primary_color} onChange={(e) => set({ ...s, primary_color: e.target.value })} /></div></Field>
            <Field label="Logo URL" col={2}><div className="flex items-center gap-3"><img src={s.logo} alt="" className="h-11 w-11 rounded-xl object-cover border border-slate-200" /><input className="input" value={s.logo} onChange={(e) => set({ ...s, logo: e.target.value })} /></div></Field>
            <Field label="Favicon URL" col={2}><input className="input" value={s.favicon} onChange={(e) => set({ ...s, favicon: e.target.value })} /></Field>
          </Card>
          <Card className="p-6 grid sm:grid-cols-2 gap-5">
            <Field label="Hero Image URL" col={2}><div className="flex items-center gap-3"><img src={s.hero_image} alt="" className="h-16 w-28 rounded-xl object-cover border border-slate-200" /><input className="input" value={s.hero_image} onChange={(e) => set({ ...s, hero_image: e.target.value })} /></div></Field>
            <Field label="Banner URL" col={2}><div className="flex items-center gap-3"><img src={s.banner} alt="" className="h-16 w-28 rounded-xl object-cover border border-slate-200" /><input className="input" value={s.banner} onChange={(e) => set({ ...s, banner: e.target.value })} /></div></Field>
          </Card>
        </>
      )}
    </SettingsPage>
  );
}
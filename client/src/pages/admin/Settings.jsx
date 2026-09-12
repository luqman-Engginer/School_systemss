import { SettingsPage, Field } from './_settingsForm';
import { Card } from '../../components/ui';

export default function AdminSettings() {
  return (
    <SettingsPage title="Profil Sekolah" subtitle="Identitas, sejarah, visi-misi, dan informasi umum sekolah.">
      {(s, set) => (
        <>
          <Card className="p-6 grid sm:grid-cols-2 gap-5">
            <Field label="Nama Sekolah" col={2}>
              <input className="input" value={s.school_name} onChange={(e) => set({ ...s, school_name: e.target.value })} />
            </Field>
            <Field label="Nama Singkat"><input className="input" value={s.short_name} onChange={(e) => set({ ...s, short_name: e.target.value })} /></Field>
            <Field label="Slogan"><input className="input" value={s.slogan} onChange={(e) => set({ ...s, slogan: e.target.value })} /></Field>
            <Field label="Deskripsi" col={2}><textarea className="textarea min-h-24" value={s.description} onChange={(e) => set({ ...s, description: e.target.value })} /></Field>
            <Field label="Sejarah" col={2}><textarea className="textarea min-h-24" value={s.history} onChange={(e) => set({ ...s, history: e.target.value })} /></Field>
          </Card>

          <Card className="p-6 grid sm:grid-cols-2 gap-5">
            <Field label="Visi" col={2}><textarea className="textarea min-h-20" value={s.vision} onChange={(e) => set({ ...s, vision: e.target.value })} /></Field>
            <Field label="Misi" col={2}><textarea className="textarea min-h-24" value={s.mission} onChange={(e) => set({ ...s, mission: e.target.value })} /></Field>
            <Field label="Nilai Sekolah" col={2}><textarea className="textarea" value={s.school_values} onChange={(e) => set({ ...s, school_values: e.target.value })} /></Field>
            <Field label="Fasilitas" col={2}><textarea className="textarea min-h-24" value={s.facilities} onChange={(e) => set({ ...s, facilities: e.target.value })} /></Field>
            <Field label="Struktur Organisasi" col={2}><textarea className="textarea" value={s.structure} onChange={(e) => set({ ...s, structure: e.target.value })} /></Field>
          </Card>
        </>
      )}
    </SettingsPage>
  );
}
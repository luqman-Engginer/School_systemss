import { SettingsPage, Field } from './_settingsForm';
import { Card } from '../../components/ui';

export default function AdminContact() {
  return (
    <SettingsPage title="Kontak & Lokasi" subtitle="Informasi kontak dan peta lokasi sekolah.">
      {(s, set) => (
        <>
          <Card className="p-6 grid sm:grid-cols-2 gap-5">
            <Field label="Telepon"><input className="input" value={s.phone} onChange={(e) => set({ ...s, phone: e.target.value })} /></Field>
            <Field label="WhatsApp"><input className="input" value={s.whatsapp} onChange={(e) => set({ ...s, whatsapp: e.target.value })} /></Field>
            <Field label="Email"><input className="input" value={s.email} onChange={(e) => set({ ...s, email: e.target.value })} /></Field>
            <Field label="Jam Layanan"><input className="input" value={s.operating_hours} onChange={(e) => set({ ...s, operating_hours: e.target.value })} /></Field>
          </Card>
          <Card className="p-6 grid sm:grid-cols-2 gap-5">
            <Field label="Alamat" col={2}><textarea className="textarea" value={s.address} onChange={(e) => set({ ...s, address: e.target.value })} /></Field>
            <Field label="Google Maps URL"><input className="input" value={s.maps_url} onChange={(e) => set({ ...s, maps_url: e.target.value })} /></Field>
            <Field label="Koordinat"> <input className="input" value={`${s.latitude}, ${s.longitude}`} disabled /></Field>
            <Field label="Latitude"><input className="input" value={s.latitude} onChange={(e) => set({ ...s, latitude: e.target.value })} /></Field>
            <Field label="Longitude"><input className="input" value={s.longitude} onChange={(e) => set({ ...s, longitude: e.target.value })} /></Field>
            <Field label="Pratinjau Peta" col={2}>
              <iframe title="map" src={`https://maps.google.com/maps?q=${encodeURIComponent(s.address || 'Jakarta')}&output=embed`} className="h-64 w-full rounded-xl border border-slate-200" loading="lazy" />
            </Field>
          </Card>
        </>
      )}
    </SettingsPage>
  );
}
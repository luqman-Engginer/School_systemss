# SchoolHub — Digital School Integrated Platform

Aplikasi manajemen sekolah terpadu (SMA Cendekia Muda Jakarta): website publik (CMS), dashboard Admin, Guru, Murid, dan Wali Murid — dibangun dengan Node.js (Express + SQLite) dan React (Vite + Tailwind CSS v4).

## Struktur

```
project_skolah/
├── server/          # Backend API (Express, port 5000)
│   └── src/
│       ├── index.js   # Entry point + serves client/dist di production
│       ├── db.js      # Schema SQLite
│       ├── seed.js    # Seed data (dijalankan otomatis saat DB kosong)
│       └── routes/    # auth, public, admin, teacher, student, parent
├── client/          # Frontend (React + Vite + Tailwind v4, port 5173)
│   └── src/
│       ├── App.jsx        # Routing semua role
│       ├── layouts/       # AppLayout (nav per role), PublicLayout
│       └── pages/         # public, auth, admin, teacher, student, parent
└── PRD (2).md       # Spesifikasi produk
```

## Menjalankan

```bash
# Backend
cd server
npm install
npm start              # atau npm run dev (auto-restart)

# Frontend (development)
cd client
npm install
npm run dev            # http://localhost:5173

# Produksi/build frontend
cd client
npm run build          # hasil di client/dist, disajikan langsung oleh server
```

Database SQLite dibuat otomatis di `server/data/schoolhub.db` saat server pertama kali berjalan, lalu di-seed. **Untuk reset data demo, hapus `server/data/schoolhub.db*` dan jalankan ulang server.**

## Deploy

Arsitektur produksi: **frontend statis di Vercel, backend di host long-running**. Keduanya domain terpisah.

Backend tidak bisa ikut naik ke Vercel sebagai static build, dan `vercel.json` hanya melakukan build `client/`. Karena itu `VITE_API_URL` **wajib** diisi di Vercel — kalau kosong, request `/api/*` jatuh ke rewrite SPA dan menerima `index.html` (bukan JSON), sehingga situs terbuka tetapi semua halaman kosong dan login selalu gagal.

### Penting: free tier yang tidur akan menghapus database

Aplikasi ini menyimpan data di file SQLite, jadi **host wajib berupa instans yang tidak pernah dimatikan otomatis**. Free tier berbasis "spin down" tidak bisa dipakai:

| Host | Free tier | Dipakai untuk SchoolHub |
| ---- | --------- | ----------------------- |
| Render Free | Tidur setelah 15 menit idle, spin up ~1 menit, dan **filesystem ephemeral** | **Jangan dipakai.** Dokumentasi Render menyatakan perubahan di filesystem (termasuk SQLite dan file upload) hilang setiap kali service redeploy, restart, atau spin down |
| Railway Free | Kredit $5/bulan, service berhenti saat kredit habis | **Jangan dipakai** untuk produksi |
| Oracle Cloud Always Free | Instans VMnyat always-on | Bisa, tapi kuota Ampere A1 dipangkas jadi 2 OCPU / 12 GB (Juni 2026) dan sering kena "out of host capacity" |

Opsi yang benar-benar 24/7:

| Opsi | Biaya | Catatan |
| ---- | ----- | ------- |
| VPS sendiri (Hetzner, DigitalOcean, Linode) + systemd | €4–6/bulan | Paling murah andal, kontrol penuh, butuh setup Nginx/Caddy + TLS |
| Render **Starter** | $7/bulan | Lepas spin-down, bisa attach persistent disk |
| Fly.io Machine (always-on) | ±$5–7/bulan | Set `auto_stop = false`, attach volume |
| Railway (plan berbayar) | $5 kredit/bulan | Volume persisten, selalu hidup |

Kalau tidak ada budget, **Oracle Cloud Always Free** adalah satu-satunya opsi gratis yang benar-benar always-on. Pastikan `SQLITE_PATH` dan `UPLOAD_DIR` tetap berada di **persistent volume** di sana juga, karena disk instance OCI tidak persisten.

### 1. Backend (host always-on)

| Setting | Nilai |
| ------- | ----- |
| Root Directory | `server` |
| Build Command | `npm ci` |
| Start Command | `npm start` |
| Node version | **22.13 atau lebih baru** — `src/db.js` memakai `node:sqlite`, di bawah itu backend gagal start |

Environment variables (lihat `server/.env.example`):

| Var | Nilai | Wajib |
| --- | ----- | ----- |
| `SQLITE_PATH` | mis. `/data/schoolhub.db` | Ya, arahkan ke **persistent volume** |
| `UPLOAD_DIR` | mis. `/data/uploads` | Ya, volume yang sama |
| `JWT_SECRET` | `openssl rand -base64 48` | Ya |
| `CORS_ORIGIN` | domain Vercel, mis. `https://schoolhub.vercel.app` | Ya di production |
| `PORT` | kosong, biarkan platform yang menentukan | Tidak |

`SQLITE_PATH` dan `UPLOAD_DIR` **wajib** menunjuk ke persistent volume. Tanpa itu, database (beserta seluruh akun dan CMS) dan file upload hilang setiap kali service restart atau redeploy.

Verifikasi backend hidup:

```bash
curl https://<domain-backend>/api/health
# {"success":true,"data":{"status":"ok","db":"readable",...}}
```

`/api/health` mengembalikan **503** kalau database tidak terbaca, jadi monitor uptime bisa membedakan proses hidup tapi layanan tidak bisa melayani data.

### 2. Frontend (Vercel)

| Setting | Nilai |
| ------- | ----- |
| Root Directory | `/` (repo root) |
| Build Command | `cd client && npm run build` |
| Output Directory | `client/dist` |

Tambahkan **Environment Variable** di Project Settings, lalu redeploy:

```
VITE_API_URL=https://<domain-backend>
```

Tanpa trailing slash. Nilainya di-bake saat build, jadi perubahan env **wajib** disertai redeploy.

### Catatan media

Frontend memakai `mediaUrl()` dari `client/src/api.js` untuk menambahkan `VITE_API_URL` pada path gambar, video, dan file modul yang relatif (`/uploads/...`, `/img/...`). Semua `src` dan `href` yang berasal dari database harus dibungkus `mediaUrl()` — kalau tidak, path-nya resolve ke domain Vercel dan media rusak di produksi. URL absolut (`https://`, `data:`) otomatis dibiarkan apa adanya.

Folder upload diatur lewat `UPLOAD_DIR` (lihat `server/src/index.js`) dan **wajib** diarahkan ke persistent volume agar file tidak hilang saat redeploy.

## Ketersediaan & pemulihan

### Siklus hidup backend

`src/index.js` menangani `SIGTERM` dan `SIGINT`: server berhenti menerima koneksi baru, menjalankan `PRAGMA wal_checkpoint(TRUNCATE)`, lalu menutup database. Platform seperti Render/Railway/Fly mengirim `SIGTERM` sebelum mematikan proses, dan tanpa handler ini file `schoolhub.db-wal` bisa tertinggal tidak ter-flush sehingga database berisiko rusak setiap kali deploy.

### Pemulihan otomatis di sisi klien

`client/src/api.js` dan `client/src/components/ApiStatus.jsx` menangani backend yang sedang tidak tersedia:

- Request diberi timeout 15 detik agar tidak menggantung selamanya.
- Koneksi gagal (timeout, offline, DNS terputus) dan status 408/425/429/502/503/504 otomatis di-retry sampai 3 kali dengan jeda bertahap.
- Status 4xx dan 500 **tidak** di-retry, supaya POST tidak menghasilkan data duplikat dan error aplikasi tidak tertutupi.
- Setelah 2 kegagalan berturut-turut, banner "Server sedang tidak terjangkau" muncul di semua halaman (termasuk halaman login) dengan probe otomatis ke `/api/health` setiap 5 detik. Halaman tidak perlu di-refresh dan muncul notifikasi saat koneksi pulih.

### Monitor uptime

Pasang monitor eksternal (UptimeRobot, Better Stack, atau cron job) yang memanggil `GET /api/health` setiap 5 menit. Endpoint ini mengembalikan 503 kalau database tidak terbaca, sehingga alarm berbunyi lebih awal — bukan hanya saat proses mati.

Bila memakai host dengan free tier yang tidur, monitor ini sekaligus membuat service tetap hangat karena request dari monitor ikut membangkitkan service yang spin down.

### Backup database

```bash
cd server && npm run backup
```

Script `server/scripts/backup.js` menulis snapshot konsisten dengan `VACUUM INTO` (aman dijalankan saat server melayani request) dan otomatis menghapus backup lama melebihi `BACKUP_KEEP`. Jadwalkan lewat cron di host:

```cron
0 3 * * * cd /srv/schoolhub/server && /usr/bin/npm run backup >> /var/log/schoolhub-backup.log 2>&1
```

Pastikan `BACKUP_DIR` berada di persistent volume, dan salin keluar dari mesin tersebut secara berkala.

## Akun Demo

| Role    | Email                        | Password  |
| ------- | ---------------------------- | --------- |
| Admin   | `admin@schoolhub.sch.id`     | `admin123` |
| Guru    | `rani@schoolhub.sch.id`      | `guru123`  |
| Murid   | `andi.pratama@student.sch.id`| `siswa123` |
| Wali    | `ortu.andi@family.sch.id`    | `ortu123`  |

> Catatan Windows: PowerShell memblokir `npm.ps1`; gunakan `npm.cmd`. Proses server yang berjalan lama (mis. `node src/index.js`) harus dimulai secara *detached*, mis. `Start-Process node -ArgumentList "src/index.js" -WorkingDirectory ... -WindowStyle Hidden`.

## Fitur per Role

- **Publik (/)** — Beranda, Tentang, Program, Berita, Agenda, Galeri, Prestasi, Guru-Staf, FAQ, Tata Tertib, Kontak, Pendaftaran PPDB.
- **Admin (/admin)** — Dashboard, Kelola Akademik (program, tahun ajaran, kelas, mapel, jadwal), Pengguna (CRUD), Relasi Wali, Aspirasi, Laporan (Recharts), Aktivitas (timeline), Branding, CMS (konten publik), Kontak, Social, Setelan.
- **Guru (/guru)** — Dashboard (ringkasan + jadwal mingguan), Kelas Saya, Materi, Tugas + penilaian, Progres siswa, Kehadiran, Disiplin, Pertemuan wali, Jadwal, Diskusi (chat), Umpan balik.
- **Murid (/murid)** — Dashboard, Materi, Materi Terlewat, Tugas, Kuis (kerjakan & lihat nilai), Review, Progres, Jadwal, Diskusi, Aspirasi, Kehadiran.
- **Wali (/wali)** — Dashboard, Anak (pilih anak), ringkasan Akademik, Kehadiran, Disiplin, Jadwal, Pertemuan (konfirmasi), Feedback.

Parent dipilih per-anak (`/wali/anak/:childId`, disimpan di `localStorage`). Kuis demo tersedia 3 judul (Matematika, Fisika, Informatika) masing-masing 4 soal.
# SchoolHub — Digital School Integrated Platform

Aplikasi manajemen sekolah terpadu (SMA Cendekia Muda Jakarta): website publik (CMS), dashboard Admin, Guru, Murid, dan Wali Murid — dibangun dengan Node.js (Express + MySQL) dan React (Vite + Tailwind CSS v4).

## Struktur

```
project_skolah/
├── server/          # Backend API (Express, port 5000)
│   └── src/
│       ├── index.js   # Entry point + serves client/dist di production
│       ├── db.js      # Skema MySQL (pool mysql2 + helper prepare/get/all/run)
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

1. `cp server/.env.example server/.env`
2. Edit password di `server/.env`
3. `docker compose up`

## Deploy

Arsitektur produksi: **frontend statis di Vercel, backend di host long-running**. Keduanya domain terpisah.

Backend tidak bisa ikut naik ke Vercel sebagai static build, dan `vercel.json` hanya melakukan build `client/`. Karena itu `VITE_API_URL` **wajib** diisi di Vercel — kalau kosong, request `/api/*` jatuh ke rewrite SPA dan menerima `index.html` (bukan JSON), sehingga situs terbuka tetapi semua halaman kosong dan login selalu gagal.

### Penting: database dan file upload harus persisten

Data ada di **MySQL**, bukan lagi di file lokal, jadi frontend statis Vercel dan backend bisa hidup di mana saja. Yang tetap perlu diperhatikan: **layanan MySQL tidak boleh sleep, dan `UPLOAD_DIR` tetap butuh persistent volume** karena file upload tidak disimpan di database.

| Host | Free tier | Dipakai untuk SchoolHub |
| ---- | --------- | ----------------------- |
| Neon / Aiven / PlanetScale | Database terkelola, plan gratis ada | **Paling mudah.** Tidak perlu mengelola server database sendiri |
| MySQL di VPS sendiri | ikut biaya VPS | Lengkap, tapi harus backup manual |
| Render Free | Tidur setelah 15 menit idle, spin up ~1 menit, **filesystem ephemeral** | **Jangan dipakai** — data CMS aman di MySQL, tapi file upload hilang tiap redeploy |
| Railway Free | Kredit $5/bulan, service berhenti saat kredit habis | **Jangan dipakai** untuk produksi |
| Oracle Cloud Always Free | Instans VM always-on | Bisa, tapi kuota Ampere A1 dipangkas jadi 2 OCPU / 12 GB (Juni 2026) dan sering kena "out of host capacity" |

Opsi yang benar-benar 24/7:

| Opsi | Biaya | Catatan |
| ---- | ----- | ------- |
| VPS sendiri (Hetzner, DigitalOcean, Linode) + MySQL lokal + systemd | €4–6/bulan | Paling murah andal, kontrol penuh, butuh setup Nginx/Caddy + TLS |
| Railway (plan berbayar) | $5 kredit/bulan | Volume persisten, selalu hidup |
| Fly.io Machine (always-on) | ±$5–7/bulan | Set `auto_stop = false`, attach volume |
| Render **Starter** | $7/bulan | Lepas spin-down, bisa attach persistent disk |

Kalau tidak ada budget: **Oracle Cloud Always Free** untuk VM + **Neon/Aiven free tier** untuk MySQL. `UPLOAD_DIR` tetap harus diarahkan ke persistent volume di VM, karena disk instance OCI tidak persisten.

### 1. Backend (host always-on)

| Setting | Nilai |
| ------- | ----- |
| Root Directory | `server` |
| Build Command | `npm ci` |
| Start Command | `npm start` |
| Node version | **20 atau lebih baru** |

Environment variables (lihat `server/.env.example`):

| Var | Nilai | Wajib |
| --- | ----- | ----- |
| `DB_HOST` | host MySQL, mis. `127.0.0.1` atau host dari provider terkelola | Ya |
| `DB_PORT` | `3306` | Tidak, ada default |
| `DB_USER` | user MySQL | Ya |
| `DB_PASSWORD` | password MySQL | Ya |
| `DB_NAME` | `schoolhub` | Tidak, ada default |
| `UPLOAD_DIR` | mis. `/data/uploads` | Ya, arahkan ke **persistent volume** |
| `JWT_SECRET` | `openssl rand -base64 48` | Ya |
| `CORS_ORIGIN` | domain Vercel, mis. `https://schoolhub.vercel.app` | Ya di production |
| `PORT` | kosong, biarkan platform yang menentukan | Tidak |

Database `schoolhub` harus sudah ada (tabel dibuat otomatis saat boot). `UPLOAD_DIR` **wajib** menunjuk ke persistent volume — tanpa itu file upload hilang setiap kali service restart atau redeploy.

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

`src/index.js` menangani `SIGTERM` dan `SIGINT`: server berhenti menerima koneksi baru, lalu pool koneksi MySQL ditutup dengan rapi. Platform seperti Render/Railway/Fly mengirim `SIGTERM` sebelum mematikan proses, dan tanpa handler ini koneksi yatim menggantung sampai proses dibunuh paksa oleh platform.

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

Script `server/scripts/backup.js` menulis dump SQL ke `BACKUP_DIR` dan otomatis menghapus backup lama melebihi `BACKUP_KEEP`. Dump memakai `mysqldump`/`mariadb-dump` dengan `--single-transaction` bila binary-nya tersedia, jadi snapshot konsisten tanpa mengunci tabel walau server sedang melayani request. Kalau binary tidak ada, script jatuh ke dump internal berbasis `mysql2` (satu transaction `REPEATABLE READ`).

Jadwalkan lewat cron di host:

```cron
0 3 * * * cd /srv/schoolhub/server && /usr/bin/npm run backup >> /var/log/schoolhub-backup.log 2>&1
```

Pastikan `BACKUP_DIR` berada di persistent volume, dan **salin keluar dari mesin tersebut** secara berkala. Kalau database-nya terkelola (Neon, Aiven, PlanetScale), lebih baik andalkan snapshot otomatis provider dan jalankan script ini sebagai lapisan tambahan.

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
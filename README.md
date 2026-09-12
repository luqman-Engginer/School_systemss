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
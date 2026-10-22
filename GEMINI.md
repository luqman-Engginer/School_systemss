# SchoolHub Project Guidelines

## Folder Structure
- `client/`: Frontend React (Vite, React Router, UI components & pages)
- `server/`: Backend Node/Express (MySQL, JWT auth, uploads)
  - `src/index.js`: App bootstrap, middleware, upload, static & health check
  - `src/auth.js`: JWT token signing, authenticate & requireRole middleware
  - `src/routes/`: API routes (`auth`, `public`, `admin`, `teacher`, `student`, `parent`)

## Running the Application
- **Server**: `cd server && npm install && npm run dev` (Port 5000)
- **Client**: `cd client && npm install && npm run dev`

## Roles & Access Control
- `ADMIN` (`/admin`): Manajemen sekolah, akademik, users, CMS, laporan
- `TEACHER` (`/guru`): Kelola kelas, materi, tugas, kehadiran, progress siswa
- `STUDENT` (`/murid`): Materi, tugas, kuis, jadwal, review, kehadiran
- `PARENT` (`/wali`): Monitoring anak (akademik, kehadiran, feedback, meeting)

## Coding Conventions
1. **Async Routes**: Semua route handler wajib dibuat `async`.
2. **Standard Response**: Selalu return `{ success: true, data }` atau `{ success: false, error }`.
3. **Database Access**: Gunakan `db.prepare(sql).get(...)`, `.all(...)`, atau `.run(...)`.
4. **Async Rule**: Jangan pakai `array.map(async)` tanpa `Promise.all`.

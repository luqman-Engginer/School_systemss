const bcrypt = require('bcryptjs');
const db = require('./db');

function insert(table, data) {
  const keys = Object.keys(data);
  const cols = keys.join(', ');
  const ph = keys.map(() => '?').join(', ');
  const stmt = db.prepare(`INSERT INTO ${table} (${cols}) VALUES (${ph})`);
  const res = stmt.run(...keys.map((k) => data[k]));
  return Number(res.lastInsertRowid);
}

function hash(pw) {
  return bcrypt.hashSync(pw, 10);
}

const n = (x) => (x ? String(x).padStart(2, '0') : '');
const dateOffset = (daysAgo) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return `${d.getFullYear()}-${n(d.getMonth() + 1)}-${n(d.getDate())}`;
};
const dateOffsetPlus = (daysAhead) => {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return `${d.getFullYear()}-${n(d.getMonth() + 1)}-${n(d.getDate())}`;
};

function seed() {
  const count = db.prepare('SELECT COUNT(*) AS c FROM users').get().c;
  if (count > 0) return false;

  // ---------- USERS ----------
  const admin = insert('users', { name: 'Luqman', email: 'admin@schoolhub.sch.id', password_hash: hash('admin123'), role: 'ADMIN', phone: '0812-3456-7890', photo: '/img/admin/200/200.svg' });
  insert('teachers', { user_id: admin, position: 'Kepala Sekolah', subject: 'Manajemen Sekolah', bio: 'Pemimpin akademik SMA Cendekia Muda Jakarta.', public_visible: 1 });

  const teachers = [
    { name: 'Rani Rahmawati, S.Pd.', email: 'rani@schoolhub.sch.id', subject: 'Matematika', position: 'Guru Matematika', bio: 'Guru Matematika dengan pengalaman 10 tahun, fokus pada pembelajaran kontekstual dan menyenangkan.' },
    { name: 'Budi Santoso, M.Pd.', email: 'budi@schoolhub.sch.id', subject: 'Fisika', position: 'Guru Fisika', bio: 'Pecinta eksperimen. Mengajar Fisika dengan pendekatan praktik dan fenomena kehidupan sehari-hari.' },
    { name: 'Siti Aminah, S.Pd.', email: 'siti@schoolhub.sch.id', subject: 'Bahasa Indonesia', position: 'Guru Bahasa Indonesia', bio: 'Guru Bahasa Indonesia, pembina literasi sekolah dan jurnalistik.' },
    { name: 'Agus Prasetyo, S.Kom.', email: 'agus@schoolhub.sch.id', subject: 'Informatika', position: 'Guru Informatika', bio: 'Guru Informatika dan pembina tim robotik. Menggabungkan coding dengan kreativitas.' },
    { name: 'Dewi Lestari, S.Si.', email: 'dewi@schoolhub.sch.id', subject: 'Biologi', position: 'Guru Biologi', bio: 'Guru Biologi dan pembina ekstrakurikuler Karya Ilmiah Remaja (KIR).' },
    { name: 'Eko Wijaya, S.Pd.', email: 'eko@schoolhub.sch.id', subject: 'Sejarah', position: 'Guru Sejarah', bio: 'Guru Sejarah yang gemar bercerita dan membawa museum ke dalam kelas.' }
  ];
  const teacherIds = [];
  const teacherUsers = [];
  for (const t of teachers) {
    const uid = insert('users', { name: t.name, email: t.email, password_hash: hash('guru123'), role: 'TEACHER', phone: `0812-0000-${1000 + teacherIds.length}`, photo: `/img/guru${1 + teacherIds.length}/200/200.svg` });
    teacherUsers.push(uid);
    teacherIds.push(insert('teachers', { user_id: uid, position: t.position, subject: t.subject, bio: t.bio, public_visible: 1 }));
  }

  // ---------- ACADEMIC ----------
  const year = insert('academic_years', { name: '2026/2027', start_date: '2026-07-13', end_date: '2027-06-25', is_active: 1, status: 'ACTIVE' });

  const programNames = ['IPA', 'IPS'];
  const programIds = {};
  for (const p of programNames) programIds[p] = insert('programs', { name: `Ilmu Pengetahuan ${p === 'IPA' ? 'Alam' : 'Sosial'}`, code: p, description: `Program ${p} — jalur peminatan bagi peserta didik untuk mendalami ${p === 'IPA' ? 'sains, matematika dan teknologi' : 'sosial, ekonomi dan humaniora'}.`, status: 'PUBLISHED' });

  const classNames = ['X IPA 1', 'X IPA 2', 'XI IPA 1', 'XI IPA 2'];
  const classIds = {};
  classNames.forEach((c, i) => {
    const grade = c.split(' ')[0];
    const programCode = c.split(' ')[1];
    classIds[c] = insert('classes', { name: c, academic_year_id: year, program_id: programIds[programCode], grade, homeroom_teacher_id: teacherIds[i % teacherIds.length], status: 'ACTIVE' });
  });

  // ---------- SUBJECTS ----------
  const subjectDefs = [
    { name: 'Matematika', code: 'MTK', teacher: 0 },
    { name: 'Fisika', code: 'FIS', teacher: 1 },
    { name: 'Bahasa Indonesia', code: 'BIN', teacher: 2 },
    { name: 'Informatika', code: 'INF', teacher: 3 },
    { name: 'Biologi', code: 'BIO', teacher: 4 },
    { name: 'Sejarah', code: 'SEJ', teacher: 5 }
  ];
  const subjectIds = [];
  for (const s of subjectDefs) {
    for (const [cn, cid] of Object.entries(classIds)) {
      if (!cn.startsWith('X')) continue;
      subjectIds.push(insert('subjects', { name: s.name, code: s.code, description: `Mata pelajaran ${s.name} untuk ${cn}.`, teacher_id: teacherIds[s.teacher], class_id: cid, status: 'ACTIVE' }));
    }
  }
  // extra subjects for XI
  for (const s of subjectDefs.slice(0, 3)) {
    for (const [cn, cid] of Object.entries(classIds)) {
      if (!cn.startsWith('XI')) continue;
      subjectIds.push(insert('subjects', { name: s.name, code: s.code, description: `Mata pelajaran ${s.name} untuk ${cn}.`, teacher_id: teacherIds[s.teacher], class_id: cid, status: 'ACTIVE' }));
    }
  }

  // ---------- STUDENTS ----------
  const studentDefs = [
    ['Andi Pratama', 'X IPA 1'], ['Bima Aditya', 'X IPA 1'], ['Citra Ayu', 'X IPA 1'],
    ['Dinda Puspita', 'X IPA 1'], ['Eko Saputra', 'X IPA 1'], ['Fajar Nugroho', 'X IPA 1'],
    ['Gita Savitri', 'X IPA 1'], ['Hana Ramadhani', 'X IPA 1'], ['Ivan Maulana', 'X IPA 1'],
    ['Joko Susilo', 'X IPA 1'], ['Kartika Sari', 'X IPA 2'], ['Luki Firmansyah', 'X IPA 2']
  ];
  const studentIds = [];
  const studentMap = {};
  studentDefs.forEach((s, i) => {
    const uid = insert('users', { name: s[0], email: `${s[0].toLowerCase().replace(/[^a-z]/g, '.')}@student.sch.id`, password_hash: hash('siswa123'), role: 'STUDENT', phone: `0821-0000-${2000 + i}`, photo: `/img/siswa${i + 1}/200/200.svg` });
    insert('students', { user_id: uid, nis: `2026${String(100 + i)}`, gender: i % 3 === 0 ? 'P' : 'L', birth_date: `2010-${n(1 + (i % 12))}-${n(1 + ((i * 3) % 28))}` });
    insert('student_classes', { student_id: uid, class_id: classIds[s[1]], academic_year_id: year, status: 'ACTIVE' });
    studentIds.push(uid);
    studentMap[s[0]] = uid;
  });

  // ---------- PARENTS ----------
  const parentDefs = [
    ['Bapak Andri Wijaya', 'andi'], ['Ibu Ratna Dewi', 'bima'], ['Bapak Hendra Gunawan', 'citra'],
    ['Bapak Surya Darma', 'dinda'], ['Ibu Maya Sari', 'eko'], ['Bapak Wahyu Hidayat', 'fajar']
  ];
  const parentIds = [];
  parentDefs.forEach((p, i) => {
    const uid = insert('users', { name: p[0], email: `ortu.${p[1]}@family.sch.id`, password_hash: hash('ortu123'), role: 'PARENT', phone: `0813-0000-${3000 + i}`, photo: `/img/ortu${i + 1}/200/200.svg` });
    insert('parents', { user_id: uid, occupation: i % 2 ? 'Wiraswasta' : 'Karyawan Swasta' });
    insert('parent_student', { parent_id: uid, student_id: studentIds[i], relation: i % 2 ? 'IBU' : 'AYAH' });
    parentIds.push(uid);
  });

  // ---------- SCHEDULES ----------
  const times = [
    ['07:00', '08:40'], ['08:45', '10:25'], ['10:40', '12:20'], ['13:00', '14:40'], ['14:45', '16:25']
  ];
  const rooms = ['R.101', 'R.102', 'Lab Komputer 1', 'R.203', 'Lab IPA 2'];
  let si = 0;
  const xipa1 = Object.entries(classIds).filter(([k]) => k === 'X IPA 1');
  for (let day = 1; day <= 6; day++) {
    for (let slot = 0; slot < 5; slot++) {
      const subj = subjectIds[(si++) % subjectIds.length];
      const s = db.prepare('SELECT class_id, teacher_id FROM subjects WHERE id = ?').get(subj);
      insert('schedules', { class_id: s.class_id, subject_id: subj, teacher_id: s.teacher_id, day, start_time: times[slot][0], end_time: times[slot][1], room: rooms[slot], status: 'ACTIVE' });
    }
  }

  // ---------- SCHOOL SETTINGS ----------
  insert('school_settings', {
    school_name: 'SMA Cendekia Muda Jakarta',
    short_name: 'Cendekia Muda',
    slogan: 'Tumbuh · Belajar · Berkarya',
    description: 'Sekolah menengah atas yang menghadirkan pembelajaran modern, terstruktur, dan humanis. Kami memadukan keunggulan akademik, karakter, dan teknologi untuk menyiapkan generasi masa depan.',
    history: 'Didirikan pada tahun 1998, SMA Cendekia Muda Jakarta tumbuh dari lembaga kecil menjadi salah satu sekolah unggulan yang dikenal karena inovasinya dalam pembelajaran.',
    vision: 'Menjadi sekolah unggulan yang membangun generasi berkarakter, berwawasan global, dan menguasai teknologi.',
    mission: '1. Menyelenggarakan pembelajaran yang aktif, kreatif dan menyenangkan.\n2. Mengembangkan potensi peserta didik secara holistik.\n3. Membangun budaya literasi dan teknologi.\n4. Menanamkan nilai-nilai karakter bangsa.\n5. Mewujudkan lingkungan sekolah yang sehat dan ramah.',
    school_values: 'Integritas · Gotong Royong · Kreativitas · Kemandirian · Teknologi',
    facilities: '- Laboratorium IPA & Komputer\n- Perpustakaan digital\n- Lapangan olahraga\n- Aula serbaguna\n- Masjid\n- Hotspot area',
    structure: 'Kepala Sekolah → Wakil Kepala (Kurikulum, Kesiswaan, Sarana, Humas) → Guru & Staf',
    primary_color: '#4f46e5',
    secondary_color: '#0ea5e9',
    website_name: 'SchoolHub',
    phone: '(021) 555-0192',
    whatsapp: '+6281234567890',
    email: 'info@cendekiamuda.sch.id',
    address: 'Jl. Pendidikan Raya No. 12, Kebayoran Baru, Jakarta Selatan 12130',
    operating_hours: 'Senin–Jumat: 06.30–16.00 · Sabtu: 07.00–12.00',
    maps_url: 'https://maps.google.com/?q=Kebayoran+Baru+Jakarta',
    latitude: '-6.2422',
    longitude: '106.7891',
    instagram: 'https://instagram.com/cendekiamuda',
    facebook: 'https://facebook.com/cendekiamuda',
    youtube: 'https://youtube.com/@cendekiamuda',
    tiktok: 'https://tiktok.com/@cendekiamuda',
    twitter: 'https://x.com/cendekiamuda',
    logo: '/img/logo/300/300.svg',
    hero_image: '/img/hero/1600/900.svg',
    banner: '/img/banner/1600/400.svg'
  });

  // ---------- PUBLIC CONTENT ----------
  const newsItems = [
    ['SMA Cendekia Muda Raih Juara 1 Lomba Robotik Nasional', 'science', dateOffsetPlus(2), 'Tim robotik SMA Cendekia Muda berhasil meraih juara pertama pada Lomba Robotik Nasional 2026 yang diselenggarakan di Jakarta. Kemenangan ini diraih setelah melalui babak penyisihan yang ketat di antara 120 tim dari seluruh Indonesia.', '/img/news1/900/500.svg'],
    ['Pembelajaran Digital dengan SchoolHub Dimulai', 'academic', dateOffsetPlus(4), 'Mulai tahun ajaran ini, seluruh kegiatan pembelajaran menggunakan platform digital SchoolHub. Materi, tugas, dan penilaian kini tersedia dalam satu ekosistem terpadu yang dapat diakses siswa kapan pun.', '/img/news2/900/500.svg'],
    ['Kelas X Mengikuti Outing Class ke Museum Nasional', 'activity', dateOffsetPlus(6), 'Sebanyak 240 siswa kelas X mengikuti kegiatan outing class ke Museum Nasional. Kegiatan ini merupakan bagian dari pembelajaran Sejarah interaktif yang mendorong siswa belajar langsung dari sumber sejarah.', '/img/news3/900/500.svg'],
    ['Workshop Penulisan Karya Ilmiah bagi Siswa KIR', 'academic', dateOffsetPlus(9), 'Kegiatan workshop penulisan karya ilmiah digelar untuk membekali anggota Karya Ilmiah Remaja (KIR) dengan kemampuan metodologi riset dan penulisan laporan.', '/img/news4/900/500.svg']
  ];
  newsItems.forEach(([title, category, publishedAt, content, thumb], i) => {
    insert('news', { title, category, content, thumbnail: thumb, author_id: teacherUsers[5], status: 'PUBLISHED', slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'), published_at: publishedAt });
  });

  const eventDefs = [
    ['Ujian Tengah Semester Ganjil', 'Pelaksanaan Ujian Tengah Semester (UTS) Ganjil Tahun Ajaran 2026/2027 untuk seluruh jenjang.', dateOffsetPlus(12), 'Day 0'], ['Pekan Olahraga Sekolah', 'Kegiatan olahraga antar kelas meliputi futsal, basket, voli, dan atletik.', dateOffsetPlus(15), 'Day 0'], ['Seminar Pendidikan Karakter', 'Seminar bersama orang tua dan guru tentang penguatan karakter peserta didik.', dateOffsetPlus(20), 'Day 0'], ['Pensi Cendekia 2026', 'Pentas seni mengakhiri tahun ajaran — musik, tari, teater, dan bazar karya siswa.', dateOffsetPlus(45), 'Day 0']
  ];
  eventDefs.forEach(([title, description, date, loc], i) => {
    const endD = dateOffsetPlus(14 + i);
    insert('events', { title, description, date, start_time: '08:00', end_time: '14:00', location: `${loc === 'Day 0' ? 'Kampus Cendekia Muda' : ''}`, poster: `/img/event${i + 1}/800/500.svg`, status: 'PUBLISHED' });
  });

  const galleryCats = ['Kegiatan Sekolah', 'Pembelajaran', 'Event', 'Prestasi', 'Ekstrakurikuler', 'Fasilitas'];
  for (let i = 0; i < 9; i++) {
    insert('gallery', { image: `/img/galeri${i + 1}/800/600.svg`, title: `Momen Inspiratif ${i + 1}`, description: 'Dokumentasi kegiatan di SMA Cendekia Muda Jakarta.', category: galleryCats[i % galleryCats.length], status: (i % 5 === 0 ? 'DRAFT' : 'PUBLISHED') });
  }

  const achievementDefs = [
    ['Juara 1 Robotik Nasional', 'Teknologi', 'Tim Robotik Cendekia', 'Lomba Robotik Nasional', 'Juara 1', '2026', 'Kemenangan atas 120 tim se-Indonesia.'], ['Juara 2 Debat Bahasa Inggris', 'Akademik', 'Erika & Kevin', 'Debat Bahasa Inggris se-Jabodetabek', 'Juara 2', '2026', ''], ['Medali Emas OSN Matematika', 'Akademik', 'Citra Ayu', 'Olimpiade Sains Nasional', 'Medali Emas', '2026', ''], ['Juara 3 Futsal Pelajar', 'Olahraga', 'Tim Futsal Putra', 'Piala Wali Kota Se-Jakarta', 'Juara 3', '2025', '']
  ];
  achievementDefs.forEach((a, i) => insert('achievements', { title: a[0], category: a[1], student_team: a[2], competition: a[3], rank: a[4], year: a[5], description: a[6], documentation: `/img/prestasi${i + 1}/800/500.svg`, status: 'PUBLISHED' }));

  const faqDefs = [
    ['Umum', 'Apa itu SchoolHub?', 'SchoolHub adalah platform digital sekolah terpadu yang menghubungkan admin, guru, murid, dan wali murid dalam satu sistem pembelajaran, komunikasi, dan monitoring.'],
    ['Umum', 'Bagaimana cara log in?', 'Guru, murid, dan wali murid menerima akun dari sekolah. Gunakan email dan password yang dibagikan melalui wali kelas atau administrasi sekolah.'],
    ['Akademik', 'Apakah orang tua dapat melihat nilai anak?', 'Ya. Wali murid yang terhubung dengan siswa dapat memantau nilai, kehadiran, tugas, dan perkembangan belajar anak melalui dashboard khusus.'],
    ['Akademik', 'Apa itu Missed Learning?', 'Missed Learning adalah fitur yang menandai materi yang belum diselesaikan siswa sehingga yang bersangkutan dapat langsung mengejar ketertinggalan lewat tombol Review Now.'],
    ['Teknis', 'Apakah SchoolHub bisa diakses dari HP?', 'Tentu. SchoolHub dirancang responsif dan dapat diakses dari laptop, tablet, maupun smartphone hanya dengan browser.'],
    ['Umum', 'Kepada siapa saya bisa menghubungi sekolah?', 'Silakan hubungi nomor telepon/kontak yang tersedia di halaman Kontak, atau melalui WhatsApp resmi sekolah.']
  ];
  faqDefs.forEach((f, i) => insert('faqs', { category: f[0], question: f[1], answer: f[2], sort_order: i, active: 1 }));

  const rulesDefs = [
    ['Ketertiban', 'Kedisiplinan Waktu', 'Peserta didik hadir di sekolah paling lambat 15 menit sebelum jam pelajaran dimulai. Keterlambatan akan dicatat dan dikonfirmasikan kepada wali murid.'],
    ['Kerapian', 'Seragam Sekolah', 'Peserta didik wajib mengenakan seragam sesuai jadwal yang ditentukan lengkap dengan atribut (almamater, sepatu, dan tanda pengenal).'],
    ['Akademik', 'Kehadiran & Izin', 'Ketidakhadiran wajib disertai surat izin/surat keterangan dokter. Izin disampaikan kepada wali kelas paling lambat pada hari kehadiran kembali.'],
    ['Lingkungan', 'Kebersihan & Lingkungan', 'Setiap peserta didik bertanggung jawab menjaga kebersihan kelas, lingkungan, dan fasilitas sekolah. Pembuangan sampah harus pada tempatnya.'],
    ['Teknologi', 'Penggunaan Telepon Genggam', 'Telepon genggam hanya boleh digunakan untuk keperluan pembelajaran atas izin guru. Tidak diizinkan untuk mengambil gambar tanpa izin pihak terkait.'],
    ['Etika', 'Etika Berkomunikasi', 'Sopan santun dalam berkomunikasi lisan dan tulisan, termasuk di ruang diskusi digital, adalah bagian dari kedisiplinan yang dijunjung tinggi.']
  ];
  rulesDefs.forEach((r, i) => insert('school_rules', { title: r[1], category: r[0], content: r[2], status: 'PUBLISHED', version: '1.0', effective_date: '2026-07-13' }));

  // ---------- LEARNING MATERIALS ----------
  const materialTitles = {
    'Matematika': [['Bab 1: Bilangan Real', 3], ['Bab 2: Persamaan & Pertidaksamaan', 4], ['Bab 3: Fungsi Linear', 5], ['Latihan Tambahan: Logika Matematika', 6]],
    'Fisika': [['Bab 1: Besaran & Satuan', 3], ['Bab 2: Gerak Lurus', 4], ['Bab 3: Hukum Newton', 5]],
    'Bahasa Indonesia': [['Teks Laporan Hasil Observasi', 3], ['Struktur Teks Eksposisi', 4], ['Menulis Teks Narasi', 5]],
    'Informatika': [['Pengenalan Algoritma', 3], ['Dasar Pemrograman & Variabel', 4], ['Studi Kasus: Logika Percabangan', 5]],
    'Biologi': [['Keanekaragaman Hayati', 3], ['Klasifikasi Makhluk Hidup', 4]],
    'Sejarah': [['Manusia dan Sejarah', 3], ['Peradaban Awal Nusantara', 4]]
  };
  const subjIds = {};
  subjectIds.forEach((id) => {
    const s = db.prepare('SELECT name FROM subjects WHERE id = ?').get(id);
    subjIds[s.name] = subjIds[s.name] || [];
    subjIds[s.name].push(id);
  });
  const classIdFor = (subjId) => db.prepare('SELECT class_id FROM subjects WHERE id = ?').get(subjId).class_id;
  const teacherIdFor = (subjId) => db.prepare('SELECT teacher_id FROM subjects WHERE id = ?').get(subjId).teacher_id;

  const allMaterialIds = [];
  for (const [subjName, mats] of Object.entries(materialTitles)) {
    const ids = subjIds[subjName] || [];
    mats.forEach((mat, mi) => {
      const subjId = ids[mi % ids.length];
      const mid = insert('learning_materials', {
        title: mat[0], description: `Materi pembelajaran ${mat[0]} yang dilengkapi modul, video, dan latihan soal.`, file_url: '', video_url: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`.replace('dQw4w9WgXcQ', 'M7lc1UVf-VE'),
        subject_id: subjId, class_id: classIdFor(subjId), teacher_id: teacherIdFor(subjId), meeting: mat[1], status: 'PUBLISHED', published_at: dateOffset(30 - mi * 3), created_at: dateOffset(32 - mi * 3)
      });
      allMaterialIds.push(mid);
    });
  }

  // progress: mark some completed, some missed, some not started
  studentIds.forEach((sid, idx) => {
    allMaterialIds.forEach((mid, mi) => {
      const mat = db.prepare('SELECT class_id FROM learning_materials WHERE id = ?').get(mid);
      const myClass = db.prepare('SELECT class_id FROM student_classes WHERE student_id = ?').get(sid);
      if (mat.class_id !== myClass.class_id) return;
      const rem = (idx * 7 + mi * 3) % 10;
      let st = 'NOT_STARTED';
      if (rem < 5) st = 'COMPLETED';
      else if (rem < 7) st = 'MISSED';
      else if (rem < 8) st = 'IN_PROGRESS';
      const started = st !== 'NOT_STARTED' ? dateOffset((rem + 2) * 2) : null;
      const done = st === 'COMPLETED' ? dateOffset((rem + 2) * 2 - 1) : null;
      insert('learning_progress', { student_id: sid, material_id: mid, status: st, started_at: started, completed_at: done, review_count: st === 'COMPLETED' ? 1 : 0, last_reviewed: done });
    });
  });

  // ---------- ASSIGNMENTS ----------
  const assignmentDefs = [
    ['Tugas 1: Latihan Bilangan Real', 'Kerjakan latihan 1–15 pada modul Bab 1.', 'Kumpulkan hasil pekerjaan dalam format PDF. Tuliskan langkah penyelesaian secara runtut.', 100, 'Matematika'],
    ['Tugas 2: Percobaan Gerak Parabola', 'Lakukan percobaan sederhana gerak parabola dan laporkan hasilnya.', 'Sertakan foto percobaan dan tabel data pengamatan.', 100, 'Fisika'],
    ['Tugas 3: Presentasi Teks LHO', 'Buat teks laporan hasil observasi lingkungan sekolah.', 'Teks minimal 500 kata dengan struktur lengkap.', 100, 'Bahasa Indonesia'],
    ['Tugas 4: Program Perhitungan Gaji', 'Buat program sederhana menghitung gaji dengan percabangan.', 'Kirim file kode program dan tangkapan layar hasilnya.', 100, 'Informatika']
  ];
  const assignmentsSeeded = [];
  assignmentDefs.forEach((ad, i) => {
    const name = ad[4];
    const ids = subjIds[name] || [];
    const subjId = ids[i % ids.length];
    const aid = insert('assignments', {
      title: ad[0], description: ad[1], instructions: ad[2], subject_id: subjId, class_id: classIdFor(subjId), teacher_id: teacherIdFor(subjId),
      deadline: dateOffsetPlus(5 + i * 3), max_score: ad[3], status: 'PUBLISHED', created_at: dateOffset(3)
    });
    assignmentsSeeded.push(aid);
    // submissions for some students
    studentIds.forEach((sid, si) => {
      const myClass = db.prepare('SELECT class_id FROM student_classes WHERE student_id = ?').get(sid);
      if (myClass.class_id !== classIdFor(subjId)) return;
      const rems = (si * 5 + i * 2) % 8;
      let status = 'SUBMITTED';
      let subAt = dateOffset(1);
      let grade = null;
      let feedback = '';
      if (rems < 4) {
        status = (si * 7 + i) % 3 === 0 ? 'LATE' : 'GRADED';
        grade = 70 + ((si * 11 + i * 7) % 30);
        feedback = 'Kerja bagus! Perhatikan cara penulisan langkah penyelesaian agar lebih runtut.';
      } else if (rems < 5) { status = 'NOT_STARTED'; subAt = null; }
      insert('assignment_submissions', { assignment_id: aid, student_id: sid, content: ad[1], attachment: 'https://picsum.photos/seed/file' + i + si, submitted_at: subAt, status, grade, max_score: ad[3], feedback });
    });
  });

  // ---------- ATTENDANCE ----------
  studentIds.forEach((sid, i) => {
    for (let d = 0; d < 20; d++) {
      const dt = dateOffset(d);
      const dow = new Date(dt).getDay();
      if (dow === 0 || dow === 6) continue;
      const r = (i * 13 + d * 5) % 10;
      const status = r < 6 ? 'PRESENT' : r < 7 ? 'LATE' : r < 8 ? 'SICK' : r < 9 ? 'EXCUSED' : 'ABSENT';
      insert('attendance', { student_id: sid, class_id: db.prepare('SELECT class_id FROM student_classes WHERE student_id = ?').get(sid).class_id, teacher_id: teacherUsers[i % 2], date: dt, status, check_in_time: status === 'LATE' ? '07:45' : '06:55', note: '' });
    }
  });

  // ---------- DISCIPLINE ----------
  studentIds.forEach((sid, i) => {
    if (i % 5 === 1) {
      insert('discipline_records', { student_id: sid, category: 'Kedisiplinan', description: 'Terlambat masuk kelas tanpa keterangan.', point: 10, date: dateOffset(6), reporter_id: teacherUsers[1], status: 'RESOLVED', notes: 'Sudah diberikan pembinaan oleh wali kelas.' });
    }
  });

  // ---------- QUIZZES ----------
  const quizDefs = [
    {
      title: 'Kuis Bab 1: Bilangan Real', subject: 'Matematika', qs: [
        ['Himpunan bilangan yang anggotanya dapat ditulis sebagai a/b dengan a,b bilangan bulat dan b ≠ 0 disebut...', JSON.stringify(['Bilangan rasional', 'Bilangan irasional', 'Bilangan cacah', 'Bilangan bulat']), 'Bilangan rasional'],
        ['Penulisan 0,00000023 dalam bentuk notasi ilmiah adalah...', JSON.stringify(['2,3 × 10⁻⁷', '2,3 × 10⁻⁶', '23 × 10⁻⁸', '2,3 × 10⁷']), '2,3 × 10⁻⁷'],
        ['Hasil dari √75 + √48 adalah...', JSON.stringify(['7√3', '9√3', '10√3', '12√3']), '9√3'],
        ['Bilangan 22/7 termasuk bilangan...', JSON.stringify(['Irasional', 'Rasional', 'Prima', 'Komposit']), 'Rasional']
      ]
    },
    {
      title: 'Kuis Bab 1: Gerak Lurus', subject: 'Fisika', qs: [
        ['Satuan SI untuk percepatan adalah...', JSON.stringify(['m/s', 'm/s²', 'm²/s', 'N']), 'm/s²'],
        ['Sebuah benda bergerak lurus beraturan berarti...', JSON.stringify(['Kecepatannya konstan', 'Percepatannya konstan', 'Kecepatannya berubah', 'Berhenti']), 'Kecepatannya konstan'],
        ['Rumus kecepatan rata-rata adalah...', JSON.stringify(['v = s/t', 'v = t/s', 'v = a/t', 'v = s×t']), 'v = s/t'],
        ['Benda jatuh bebas mengabaikan gaya...', JSON.stringify(['Gravitasi', 'Gesekan udara', 'Normal', 'Berat']), 'Gesekan udara']
      ]
    },
    {
      title: 'Kuis Dasar Algoritma', subject: 'Informatika', qs: [
        ['Langkah-langkah logis untuk menyelesaikan masalah disebut...', JSON.stringify(['Algoritma', 'Program', 'Kode', 'Sintaks']), 'Algoritma'],
        ['Struktur data yang bersifat LIFO adalah...', JSON.stringify(['Queue', 'Stack', 'Array', 'Linked list']), 'Stack'],
        ['Simbol belah ketupat pada flowchart digunakan untuk...', JSON.stringify(['Proses', 'Keputusan/percabangan', 'Input/output', 'Start/end']), 'Keputusan/percabangan'],
        ['Bahasa pemrograman yang dikompilasi menjadi bytecode JVM adalah...', JSON.stringify(['Java', 'Python', 'C++', 'JavaScript']), 'Java']
      ]
    }
  ];
  quizDefs.forEach((qd) => {
    const subjId = subjIds[qd.subject][0];
    const qid = insert('quizzes', { title: qd.title, description: `Kuis singkat ${qd.subject} untuk mengukur pemahaman.`, subject_id: subjId, class_id: classIdFor(subjId), teacher_id: teacherIdFor(subjId), time_limit: 15, passing_score: 70, status: 'PUBLISHED' });
    qd.qs.forEach((qq) => insert('questions', { quiz_id: qid, question: qq[0], type: 'MULTIPLE', options: qq[1], correct_answer: qq[2], score: 25 }));
  });

  // ---------- ASPIRATIONS ----------
  const aspirationDefs = [
    ['Saran: Penambahan Fasilitas Charger di Perpustakaan', 'Mohon dapat disediakan fasilitas charger di area perpustakaan agar siswa dapat mengisi daya laptop.', 'Sarpras'], ['Saran: Konten Pembelajaran Lebih Interaktif', 'Saran agar materi Informatika lebih banyak praktik langsung.', 'Kurikulum'], ['Keluhan: Jadwal Olahraga Bentrok', 'Jadwal olahraga kelas kami bentrok dengan kegiatan ekstrakurikuler.', 'Jadwal'], ['Ide: Adakan Kompetisi Desain Poster Sekolah', 'Agar kreativitas siswa tersalurkan, kami mengusulkan diadakan kompetisi desain poster bertema hari kemerdekaan.', 'Saran']
  ];
  aspirationDefs.forEach((a, i) => {
    insert('aspirations', { student_id: studentIds[i], title: a[0], content: `${a[1]} — Aspirasi ${i + 1} dari murid kami.`, category: a[2], anonymous: i === 2 ? 1 : 0, status: ['SUBMITTED', 'IN_PROGRESS', 'RESOLVED', 'UNDER_REVIEW'][i], admin_response: i === 2 ? 'Terima kasih atas masukannya. Kami sedang berkoordinasi dengan bidang kesiswaan untuk merevisi jadwal.' : '', created_at: dateOffset(12 - i * 3), updated_at: dateOffset(10 - i * 2) });
  });

  // ---------- DISCUSSIONS ----------
  const room1 = insert('discussion_rooms', { title: 'Ruang Diskusi Matematika', topic: 'Tanya jawab materi Bab 1–3', description: 'Diskusi terbuka untuk seluruh siswa kelas X dan guru Matematika.', creator_id: teacherUsers[0], type: 'CLASS_DISCUSSION', start_date: dateOffset(10), status: 'ACTIVE' });
  const room2 = insert('discussion_rooms', { title: 'Ruang Informasi Wali Murid', topic: 'Informasi perkembangan dan kegiatan siswa', description: 'Ruang komunikasi khusus wali murid dengan wali kelas.', creator_id: teacherUsers[1], type: 'TEACHER_PARENT', start_date: dateOffset(10), status: 'ACTIVE' });
  insert('discussion_members', { room_id: room1, user_id: teacherUsers[0] });
  insert('discussion_members', { room_id: room2, user_id: teacherUsers[1] });
  studentIds.slice(0, 12).forEach((sid) => insert('discussion_members', { room_id: room1, user_id: sid }));
  insert('discussion_members', { room_id: room2, user_id: parentIds[0] });
  insert('discussion_members', { room_id: room2, user_id: parentIds[1] });

  insert('messages', { room_id: room1, sender_id: studentIds[0], content: 'Selamat pagi bu, untuk tugas Bab 2 kapan deadline terakhirnya?', created_at: dateOffset(2) });
  insert('messages', { room_id: room1, sender_id: teacherUsers[0], content: 'Pagi Andi, deadline tugas Bab 2 hari Jumat pukul 20.00 ya. Semangat!', created_at: dateOffset(2) });
  insert('messages', { room_id: room1, sender_id: studentIds[3], content: 'Bu, apakah boleh mengumpulkan dalam bentuk foto tulisan tangan?', created_at: dateOffset(1) });
  insert('messages', { room_id: room2, sender_id: parentIds[0], content: 'Selamat siang pak, bagaimana perkembangan belajar Andi di sekolah?', created_at: dateOffset(1) });
  insert('messages', { room_id: room2, sender_id: teacherUsers[1], content: 'Siang bapak. Alhamdulillah Andi menunjukkan peningkatan pada mapel Fisika, khususnya di bab kinematika.', created_at: dateOffset(1) });

  // ---------- MEETINGS ----------
  insert('meetings', { teacher_id: teacherUsers[0], parent_id: parentIds[0], student_id: studentIds[0], topic: 'Perkembangan belajar Andi', date: dateOffsetPlus(7), start_time: '09:00', end_time: '10:00', location: 'Ruang Konsultasi', meeting_type: 'OFFLINE', status: 'SCHEDULED', notes: '' });
  insert('meetings', { teacher_id: teacherUsers[1], parent_id: parentIds[1], student_id: studentIds[1], topic: 'Evaluasi semester', date: dateOffsetPlus(10), start_time: '13:00', end_time: '14:00', location: 'Google Meet', meeting_type: 'ONLINE', status: 'REQUESTED', notes: '' });

  // ---------- FEEDBACK ----------
  studentIds.slice(0, 6).forEach((sid, i) => {
    insert('feedbacks', { teacher_id: teacherUsers[i % 2], student_id: sid, subject_id: subjectIds[i % subjectIds.length], content: 'Anak memiliki motivasi belajar yang baik. Pertahankan semangatnya!', created_at: dateOffset(6 - i) });
  });

  // ---------- NOTIFICATIONS ----------
  const notifDefs = [
    ['NEW_ASSIGNMENT', 'Tugas baru tersedia', 'Tugas 1: Latihan Bilangan Real telah dibagikan untuk kelas Anda.'],
    ['NEW_MATERIAL', 'Materi baru: Bab 2 Persamaan', 'Materi Bab 2: Persamaan & Pertidaksamaan telah dipublikasikan.'],
    ['MEETING', 'Meeting dijadwalkan', 'Meeting orang tua-wali kelas akan dilaksanakan. Pastikan konfirmasi kehadiran Anda.'],
    ['ANNOUNCEMENT', 'Informasi Pekan Olahraga', 'Pekan Olahraga Sekolah akan diselenggarakan bulan depan. Siapkan tim kelas Anda!']
  ];
  for (let i = 0; i < Math.min(12, studentIds.length); i++) {
    notifDefs.forEach((nd, j) => insert('notifications', { recipient_id: studentIds[i], type: nd[0], title: nd[1], message: nd[2], is_read: j < 2 ? 1 : 0, created_at: dateOffset(j * 2) }));
  }
  parentIds.forEach((pid, j) => {
    insert('notifications', { recipient_id: pid, type: 'FEEDBACK', title: 'Feedback guru untuk anak Anda', message: 'Guru memberikan catatan perkembangan untuk anak Anda.', is_read: 0, created_at: dateOffset(3) });
  });

  insert('announcements', { title: 'Selamat datang Tahun Ajaran 2026/2027', content: 'Seluruh kegiatan belajar mengajar dimulai Senin, 13 Juli 2026. Pastikan memeriksa jadwal dan ruang kelas masing-masing.', target_role: 'ALL', author_id: admin, status: 'PUBLISHED', created_at: dateOffset(25) });
  insert('announcements', { title: 'Perpustakaan Digital Diperbarui', content: 'Koleksi e-book terbaru sudah tersedia di perpustakaan digital. Silakan dinikmati!', target_role: 'STUDENT', author_id: admin, status: 'PUBLISHED', created_at: dateOffset(7) });

  // ---------- ACTIVITY LOGS ----------
  insert('activity_logs', { user_id: admin, action: 'SEED_DATA', entity: 'system', details: 'Initial demo data created', created_at: dateOffset(1) });

  return true;
}

module.exports = { seed };

if (require.main === module) {
  const created = seed();
  console.log(created ? 'Seed data created successfully.' : 'Database already seeded.');
}
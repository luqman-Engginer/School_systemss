const express = require('express');
const bcrypt = require('bcryptjs');
const { authenticate, requireRole, db } = require('../auth');
const { makeNotification } = require('./auth');

const router = express.Router();
router.use(authenticate, requireRole('ADMIN'));

// ---------- DASHBOARD ----------
router.get('/dashboard', (req, res) => {
  const cnt = (t, w = '') => db.prepare(`SELECT COUNT(*) AS c FROM ${t} ${w}`).get().c;
  const data = {
    users: cnt('users'),
    students: cnt('users', "WHERE role = 'STUDENT'"),
    teachers: cnt('users', "WHERE role = 'TEACHER'"),
    parents: cnt('users', "WHERE role = 'PARENT'"),
    classes: cnt('classes', "WHERE status = 'ACTIVE'"),
    subjects: cnt('subjects', "WHERE status = 'ACTIVE'"),
    news: cnt('news', "WHERE status = 'PUBLISHED'"),
    events: cnt('events', "WHERE status = 'PUBLISHED'"),
    materials: cnt('learning_materials', "WHERE status = 'PUBLISHED'"),
    assignments: cnt('assignments', "WHERE status = 'PUBLISHED'"),
    aspirations: cnt('aspirations'),
    openAspirations: cnt('aspirations', "WHERE status != 'RESOLVED' AND status != 'REJECTED'"),
    attendanceToday: db.prepare('SELECT status, COUNT(*) AS c FROM attendance WHERE date = date(\'now\') GROUP BY status').all(),
    recentAspirations: db.prepare('SELECT a.*, u.name AS student_name FROM aspirations a JOIN users u ON u.id = a.student_id ORDER BY a.id DESC LIMIT 5').all(),
    recentNews: db.prepare("SELECT id, title, status, created_at FROM news ORDER BY id DESC LIMIT 5").all(),
    upcomingEvents: db.prepare("SELECT * FROM events WHERE status = 'PUBLISHED' AND date >= date('now') ORDER BY date LIMIT 5").all(),
    activity: db.prepare('SELECT * FROM activity_logs ORDER BY id DESC LIMIT 8').all(),
    studentsPerClass: db.prepare('SELECT c.name, COUNT(sc.student_id) AS total FROM classes c LEFT JOIN student_classes sc ON sc.class_id = c.id WHERE c.status = \'ACTIVE\' GROUP BY c.id').all(),
    roleBreakdown: db.prepare('SELECT role, COUNT(*) AS c FROM users GROUP BY role').all(),
    activeYear: db.prepare("SELECT name FROM academic_years WHERE is_active = 1").get()?.name || null
  };
  res.json({ success: true, data });
});

// ---------- SETTINGS ----------
router.get('/settings', (req, res) => {
  const s = db.prepare('SELECT * FROM school_settings WHERE id = 1').get();
  res.json({ success: true, data: s });
});

router.put('/settings', (req, res) => {
  const allowed = ['school_name', 'short_name', 'slogan', 'description', 'history', 'vision', 'mission', 'school_values', 'facilities', 'structure',
    'logo', 'favicon', 'hero_image', 'banner', 'primary_color', 'secondary_color', 'website_name',
    'phone', 'whatsapp', 'email', 'address', 'operating_hours', 'maps_url', 'latitude', 'longitude',
    'instagram', 'facebook', 'youtube', 'tiktok', 'twitter'];
  const body = req.body || {};
  const sets = allowed.filter((k) => body[k] !== undefined).map((k) => `${k} = ?`);
  if (!sets.length) return res.status(422).json({ success: false, error: 'Tidak ada data yang diubah.' });
  const vals = allowed.filter((k) => body[k] !== undefined).map((k) => body[k]);
  db.prepare(`UPDATE school_settings SET ${sets.join(', ')}, updated_at = datetime('now') WHERE id = 1`).run(...vals);
  db.prepare('INSERT INTO activity_logs (user_id, action, entity, details) VALUES (?,?,?,?)').run(req.user.id, 'UPDATE', 'school_settings', 'School settings updated');
  const s = db.prepare('SELECT * FROM school_settings WHERE id = 1').get();
  res.json({ success: true, data: s });
});

// ---------- USERS ----------
router.get('/users', (req, res) => {
  const role = req.query.role || 'STUDENT';
  const q = req.query.q || '';
  let rows;
  if (role === 'STUDENT') {
    rows = db.prepare(`SELECT u.id, u.name, u.email, u.phone, u.photo, u.role, u.status, u.created_at, s.nis, s.gender, sc.class_id, c.name AS class_name
      FROM users u LEFT JOIN students s ON s.user_id = u.id LEFT JOIN student_classes sc ON sc.student_id = u.id AND sc.status = 'ACTIVE' LEFT JOIN classes c ON c.id = sc.class_id
      WHERE u.role = 'STUDENT' AND u.name LIKE ? ORDER BY u.name`).all(`%${q}%`);
  } else if (role === 'TEACHER') {
    rows = db.prepare(`SELECT u.id, u.name, u.email, u.phone, u.photo, u.role, u.status, u.created_at, t.position, t.subject, t.public_visible
      FROM users u LEFT JOIN teachers t ON t.user_id = u.id WHERE u.role = 'TEACHER' AND u.name LIKE ? ORDER BY u.name`).all(`%${q}%`);
  } else if (role === 'PARENT') {
    rows = db.prepare(`SELECT u.id, u.name, u.email, u.phone, u.photo, u.role, u.status, u.created_at, p.occupation,
      (SELECT COUNT(*) FROM parent_student ps WHERE ps.parent_id = u.id) AS children_count
      FROM users u LEFT JOIN parents p ON p.user_id = u.id WHERE u.role = 'PARENT' AND u.name LIKE ? ORDER BY u.name`).all(`%${q}%`);
  } else {
    rows = db.prepare("SELECT u.* FROM users u WHERE u.role = 'ADMIN' ORDER BY u.name").all();
  }
  res.json({ success: true, data: rows });
});

router.get('/users/options', (req, res) => {
  const students = db.prepare("SELECT id, name FROM users WHERE role = 'STUDENT' AND status = 'ACTIVE' ORDER BY name").all();
  const classes = db.prepare("SELECT id, name FROM classes WHERE status = 'ACTIVE' ORDER BY name").all();
  const years = db.prepare("SELECT id, name FROM academic_years").all();
  res.json({ success: true, data: { students, classes, years } });
});

router.get('/users/:id', (req, res) => {
  const id = req.params.id;
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  if (!user) return res.status(404).json({ success: false, error: 'User tidak ditemukan.' });
  let detail = {};
  if (user.role === 'TEACHER') detail = db.prepare('SELECT * FROM teachers WHERE user_id = ?').get(id) || {};
  if (user.role === 'STUDENT') {
    detail = db.prepare('SELECT * FROM students WHERE user_id = ?').get(id) || {};
    detail.class_id = db.prepare('SELECT class_id FROM student_classes WHERE student_id = ? AND status = \'ACTIVE\'').get(id)?.class_id || null;
  }
  if (user.role === 'PARENT') {
    detail = db.prepare('SELECT * FROM parents WHERE user_id = ?').get(id) || {};
    detail.children = db.prepare('SELECT ps.student_id, ps.relation, u.name FROM parent_student ps JOIN users u ON u.id = ps.student_id WHERE ps.parent_id = ?').all(id);
  }
  res.json({ success: true, data: { ...user, detail } });
});

router.post('/users', (req, res) => {
  const b = req.body || {};
  const { name, email, password, role, phone = '', photo = '' } = b;
  if (!name || !email || !password || !role) return res.status(422).json({ success: false, error: 'Nama, email, password, dan role wajib diisi.' });
  if (!['ADMIN', 'TEACHER', 'STUDENT', 'PARENT'].includes(role)) return res.status(422).json({ success: false, error: 'Role tidak valid.' });
  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(String(email).trim().toLowerCase());
  if (exists) return res.status(409).json({ success: false, error: 'Email sudah digunakan.' });
  const uid = db.prepare('INSERT INTO users (name, email, password_hash, role, phone, photo) VALUES (?,?,?,?,?,?)')
    .run(name, String(email).trim().toLowerCase(), bcrypt.hashSync(password, 10), role, phone, photo).lastInsertRowid;
  if (role === 'TEACHER') db.prepare('INSERT INTO teachers (user_id, position, subject, bio, public_visible) VALUES (?,?,?,?,1)').run(uid, b.position || 'Guru', b.subject || '', b.bio || '');
  if (role === 'STUDENT') {
    db.prepare('INSERT INTO students (user_id, nis, gender, birth_date) VALUES (?,?,?,?)').run(uid, b.nis || '', b.gender || 'L', b.birth_date || '');
    if (b.class_id) db.prepare('INSERT INTO student_classes (student_id, class_id, academic_year_id, status) VALUES (?,?,?,?)').run(uid, b.class_id, b.academic_year_id || null, 'ACTIVE');
  }
  if (role === 'PARENT') db.prepare('INSERT INTO parents (user_id, occupation) VALUES (?,?)').run(uid, b.occupation || '');
  db.prepare('INSERT INTO activity_logs (user_id, action, entity, details) VALUES (?,?,?,?)').run(req.user.id, 'CREATE', 'users', `Created user ${name} (${role})`);
  res.status(201).json({ success: true, data: { id: uid } });
});

router.put('/users/:id', (req, res) => {
  const id = req.params.id;
  const b = req.body || {};
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  if (!user) return res.status(404).json({ success: false, error: 'User tidak ditemukan.' });
  if (b.name) db.prepare('UPDATE users SET name = ?, updated_at = datetime(\'now\') WHERE id = ?').run(b.name, id);
  if (typeof b.phone === 'string') db.prepare('UPDATE users SET phone = ?, updated_at = datetime(\'now\') WHERE id = ?').run(b.phone, id);
  if (typeof b.photo === 'string' && b.photo) db.prepare('UPDATE users SET photo = ?, updated_at = datetime(\'now\') WHERE id = ?').run(b.photo, id);
  if (b.password) db.prepare('UPDATE users SET password_hash = ?, updated_at = datetime(\'now\') WHERE id = ?').run(bcrypt.hashSync(b.password, 10), id);
  if (user.role === 'TEACHER') {
    const t = db.prepare('SELECT id FROM teachers WHERE user_id = ?').get(id);
    if (t) db.prepare('UPDATE teachers SET position = ?, subject = ?, bio = ?, public_visible = ? WHERE user_id = ?').run(b.position || t.position, b.subject || t.subject, b.bio !== undefined ? b.bio : t.bio, b.public_visible !== undefined ? Number(b.public_visible) : t.public_visible, id);
  }
  if (user.role === 'STUDENT') {
    const s = db.prepare('SELECT id FROM students WHERE user_id = ?').get(id);
    if (s) db.prepare('UPDATE students SET nis = ?, gender = ?, birth_date = ? WHERE user_id = ?').run(b.nis || s.nis, b.gender || s.gender, b.birth_date || s.birth_date, id);
    if (b.class_id) {
      db.prepare("UPDATE student_classes SET status = 'INACTIVE' WHERE student_id = ?").run(id);
      db.prepare('INSERT INTO student_classes (student_id, class_id, academic_year_id, status) VALUES (?,?,?,?)').run(id, b.class_id, b.academic_year_id || null, 'ACTIVE');
    }
  }
  if (user.role === 'PARENT') {
    const p = db.prepare('SELECT id FROM parents WHERE user_id = ?').get(id);
    if (p) db.prepare('UPDATE parents SET occupation = ? WHERE user_id = ?').run(b.occupation || p.occupation, id);
    if (Array.isArray(b.children)) {
      db.prepare('DELETE FROM parent_student WHERE parent_id = ?').run(id);
      for (const c of b.children) db.prepare('INSERT INTO parent_student (parent_id, student_id, relation) VALUES (?,?,?)').run(id, c.student_id, c.relation || 'WALI');
    }
  }
  db.prepare('INSERT INTO activity_logs (user_id, action, entity, details) VALUES (?,?,?,?)').run(req.user.id, 'UPDATE', 'users', `Updated user #${id}`);
  res.json({ success: true, data: { id } });
});

router.delete('/users/:id', (req, res) => {
  const id = req.params.id;
  if (Number(id) === req.user.id) return res.status(422).json({ success: false, error: 'Tidak dapat menghapus akun sendiri.' });
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  if (!user) return res.status(404).json({ success: false, error: 'User tidak ditemukan.' });
  db.prepare('UPDATE users SET status = \'INACTIVE\', updated_at = datetime(\'now\') WHERE id = ?').run(id);
  db.prepare('INSERT INTO activity_logs (user_id, action, entity, details) VALUES (?,?,?,?)').run(req.user.id, 'DEACTIVATE', 'users', `Deactivated user #${id}`);
  res.json({ success: true, data: { message: 'User dinonaktifkan.' } });
});

// ---------- CONTENT CMS ----------
const crud = (table, columns, { searchCol = 'title', detailJoin = '' } = {}) => {
  router.get(`/${table}`, (req, res) => {
    const q = req.query.q || '';
    let rows;
    if (q) rows = db.prepare(`SELECT * FROM ${table} WHERE ${searchCol} LIKE ? ORDER BY id DESC`).all(`%${q}%`);
    else rows = db.prepare(`SELECT * FROM ${table} ORDER BY id DESC`).all();
    res.json({ success: true, data: rows });
  });
  router.get(`/${table}/:id`, (req, res) => {
    const row = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(req.params.id);
    if (!row) return res.status(404).json({ success: false, error: 'Data tidak ditemukan.' });
    res.json({ success: true, data: row });
  });
  router.post(`/${table}`, (req, res) => {
    const body = req.body || {};
    const keys = columns.filter((c) => body[c] !== undefined);
    if (!keys.length) return res.status(422).json({ success: false, error: 'Tidak ada data.' });
    if (body.status === '') delete body.status;
    const colStr = keys.join(', ');
    const ph = keys.map(() => '?').join(', ');
    const vals = keys.map((k) => (body[k] === null ? '' : body[k]));
    if (table === 'news') {
      vals.push(body.author_id || req.user.id);
      const r = db.prepare(`INSERT INTO news (${colStr}, author_id) VALUES (${ph}, ?)`).run(...vals);
      db.prepare('INSERT INTO activity_logs (user_id, action, entity, details) VALUES (?,?,?,?)').run(req.user.id, 'CREATE', 'news', `Created news #${r.lastInsertRowid}`);
      return res.status(201).json({ success: true, data: { id: r.lastInsertRowid } });
    }
    const r = db.prepare(`INSERT INTO ${table} (${colStr}) VALUES (${ph})`).run(...vals);
    db.prepare('INSERT INTO activity_logs (user_id, action, entity, details) VALUES (?,?,?,?)').run(req.user.id, 'CREATE', table, `Created ${table} #${r.lastInsertRowid}`);
    res.status(201).json({ success: true, data: { id: r.lastInsertRowid } });
  });
  router.put(`/${table}/:id`, (req, res) => {
    const body = req.body || {};
    const keys = columns.filter((c) => body[c] !== undefined);
    if (!keys.length) return res.status(422).json({ success: false, error: 'Tidak ada data.' });
    if (body.status === '') delete body.status;
    const sets = keys.map((k) => `${k} = ?`).join(', ');
    const vals = keys.map((k) => (body[k] === null ? '' : body[k]));
    db.prepare(`UPDATE ${table} SET ${sets} WHERE id = ?`).run(...vals, req.params.id);
    db.prepare('INSERT INTO activity_logs (user_id, action, entity, details) VALUES (?,?,?,?)').run(req.user.id, 'UPDATE', table, `Updated ${table} #${req.params.id}`);
    res.json({ success: true, data: { id: req.params.id } });
  });
  router.delete(`/${table}/:id`, (req, res) => {
    db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(req.params.id);
    db.prepare('INSERT INTO activity_logs (user_id, action, entity, details) VALUES (?,?,?,?)').run(req.user.id, 'DELETE', table, `Deleted ${table} #${req.params.id}`);
    res.json({ success: true, data: { message: 'Data dihapus.' } });
  });
};

crud('news', ['title', 'slug', 'content', 'thumbnail', 'category', 'status', 'published_at']);
crud('events', ['title', 'description', 'date', 'start_time', 'end_time', 'location', 'poster', 'status']);
crud('gallery', ['image', 'title', 'description', 'category', 'status']);
crud('achievements', ['title', 'category', 'student_team', 'competition', 'rank', 'year', 'description', 'documentation', 'status']);
crud('faqs', ['question', 'answer', 'category', 'sort_order', 'active']);
crud('announcements', ['title', 'content', 'target_role', 'status', 'author_id']);
crud('school_rules', ['title', 'category', 'content', 'status', 'version', 'effective_date']);

// ---------- ACADEMIC ----------
crud('academic_years', ['name', 'start_date', 'end_date', 'is_active', 'status']);
crud('programs', ['name', 'code', 'description', 'status']);

const classColumns = ['name', 'academic_year_id', 'program_id', 'grade', 'homeroom_teacher_id', 'status'];
router.get('/classes', (req, res) => {
  const rows = db.prepare(`SELECT c.*, ay.name AS academic_year, p.name AS program_name, u.name AS homeroom_teacher,
    (SELECT COUNT(*) FROM student_classes sc WHERE sc.class_id = c.id AND sc.status = 'ACTIVE') AS student_count
    FROM classes c LEFT JOIN academic_years ay ON ay.id = c.academic_year_id LEFT JOIN programs p ON p.id = c.program_id
    LEFT JOIN teachers t ON t.id = c.homeroom_teacher_id LEFT JOIN users u ON u.id = t.user_id ORDER BY c.name`).all();
  res.json({ success: true, data: rows });
});
router.post('/classes', (req, res) => {
  const b = req.body || {};
  const r = db.prepare(`INSERT INTO classes (${classColumns.join(', ')}) VALUES (${classColumns.map(() => '?').join(', ')})`).run(...classColumns.map((k) => b[k] ?? ''));
  res.status(201).json({ success: true, data: { id: r.lastInsertRowid } });
});
router.put('/classes/:id', (req, res) => {
  const b = req.body || {};
  const sets = classColumns.filter((k) => b[k] !== undefined).map((k) => `${k} = ?`).join(', ');
  const vals = classColumns.filter((k) => b[k] !== undefined).map((k) => b[k]);
  db.prepare(`UPDATE classes SET ${sets} WHERE id = ?`).run(...vals, req.params.id);
  res.json({ success: true, data: { id: req.params.id } });
});
router.delete('/classes/:id', (req, res) => {
  db.prepare('DELETE FROM classes WHERE id = ?').run(req.params.id);
  db.prepare('INSERT INTO activity_logs (user_id, action, entity, details) VALUES (?,?,?,?)').run(req.user.id, 'DELETE', 'classes', `Deleted class #${req.params.id}`);
  res.json({ success: true, data: { message: 'Kelas dihapus.' } });
});

const subjectColumns = ['name', 'code', 'description', 'teacher_id', 'class_id', 'status'];
router.get('/subjects', (req, res) => {
  const rows = db.prepare(`SELECT s.*, u.name AS teacher_name, c.name AS class_name FROM subjects s LEFT JOIN teachers t ON t.id = s.teacher_id LEFT JOIN users u ON u.id = t.user_id LEFT JOIN classes c ON c.id = s.class_id ORDER BY c.name, s.name`).all();
  res.json({ success: true, data: rows });
});
router.post('/subjects', (req, res) => {
  const b = req.body || {};
  const r = db.prepare(`INSERT INTO subjects (${subjectColumns.join(', ')}) VALUES (${subjectColumns.map(() => '?').join(', ')})`).run(...subjectColumns.map((k) => b[k] ?? ''));
  res.status(201).json({ success: true, data: { id: r.lastInsertRowid } });
});
router.put('/subjects/:id', (req, res) => {
  const b = req.body || {};
  const sets = subjectColumns.filter((k) => b[k] !== undefined).map((k) => `${k} = ?`).join(', ');
  const vals = subjectColumns.filter((k) => b[k] !== undefined).map((k) => b[k]);
  db.prepare(`UPDATE subjects SET ${sets} WHERE id = ?`).run(...vals, req.params.id);
  res.json({ success: true, data: { id: req.params.id } });
});
router.delete('/subjects/:id', (req, res) => {
  db.prepare('DELETE FROM subjects WHERE id = ?').run(req.params.id);
  db.prepare('INSERT INTO activity_logs (user_id, action, entity, details) VALUES (?,?,?,?)').run(req.user.id, 'DELETE', 'subjects', `Deleted subject #${req.params.id}`);
  res.json({ success: true, data: { message: 'Mata pelajaran dihapus.' } });
});

const scheduleColumns = ['class_id', 'subject_id', 'teacher_id', 'day', 'start_time', 'end_time', 'room', 'status'];
router.get('/schedules', (req, res) => {
  const rows = db.prepare(`SELECT s.*, c.name AS class_name, sub.name AS subject_name, u.name AS teacher_name
    FROM schedules s LEFT JOIN classes c ON c.id = s.class_id LEFT JOIN subjects sub ON sub.id = s.subject_id
    LEFT JOIN teachers t ON t.id = s.teacher_id LEFT JOIN users u ON u.id = t.user_id ORDER BY s.day, s.start_time`).all();
  res.json({ success: true, data: rows });
});
router.post('/schedules', (req, res) => {
  const b = req.body || {};
  const r = db.prepare(`INSERT INTO schedules (${scheduleColumns.join(', ')}) VALUES (${scheduleColumns.map(() => '?').join(', ')})`).run(...scheduleColumns.map((k) => b[k] ?? ''));
  res.status(201).json({ success: true, data: { id: r.lastInsertRowid } });
});
router.put('/schedules/:id', (req, res) => {
  const b = req.body || {};
  const sets = scheduleColumns.filter((k) => b[k] !== undefined).map((k) => `${k} = ?`).join(', ');
  const vals = scheduleColumns.filter((k) => b[k] !== undefined).map((k) => b[k]);
  db.prepare(`UPDATE schedules SET ${sets} WHERE id = ?`).run(...vals, req.params.id);
  res.json({ success: true, data: { id: req.params.id } });
});
router.delete('/schedules/:id', (req, res) => {
  db.prepare('DELETE FROM schedules WHERE id = ?').run(req.params.id);
  db.prepare('INSERT INTO activity_logs (user_id, action, entity, details) VALUES (?,?,?,?)').run(req.user.id, 'DELETE', 'schedules', `Deleted schedule #${req.params.id}`);
  res.json({ success: true, data: { message: 'Jadwal dihapus.' } });
});

// ---------- ASPIRATIONS ----------
router.get('/aspirations', (req, res) => {
  const rows = db.prepare('SELECT a.*, u.name AS student_name FROM aspirations a JOIN users u ON u.id = a.student_id ORDER BY a.id DESC').all();
  res.json({ success: true, data: rows });
});

router.put('/aspirations/:id', (req, res) => {
  const b = req.body || {};
  const upd = [];
  const vals = [];
  if (b.status) { upd.push('status = ?'); vals.push(b.status); }
  if (b.admin_response !== undefined) { upd.push('admin_response = ?'); vals.push(b.admin_response); }
  if (!upd.length) return res.status(422).json({ success: false, error: 'Tidak ada data.' });
  vals.push(req.params.id);
  db.prepare(`UPDATE aspirations SET ${upd.join(', ')}, updated_at = datetime('now') WHERE id = ?`).run(...vals);
  const asp = db.prepare('SELECT * FROM aspirations WHERE id = ?').get(req.params.id);
  if (asp) makeNotification(asp.student_id, 'ASPIRATION_UPDATE', 'Status aspirasi diperbarui', `Aspirasi "${asp.title}" kini berstatus ${asp.status}.`, asp.id);
  res.json({ success: true, data: { id: req.params.id } });
});

// ---------- REPORTS ----------
router.get('/reports', (req, res) => {
  const attendance = db.prepare('SELECT status, COUNT(*) AS c FROM attendance GROUP BY status').all();
  const submissions = db.prepare('SELECT status, COUNT(*) AS c FROM assignment_submissions GROUP BY status').all();
  const progress = db.prepare('SELECT status, COUNT(*) AS c FROM learning_progress GROUP BY status').all();
  res.json({ success: true, data: { attendance, submissions, progress } });
});

module.exports = router;
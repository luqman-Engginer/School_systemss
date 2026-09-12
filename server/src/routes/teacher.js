const express = require('express');
const { authenticate, requireRole, db, getTeacherId } = require('../auth');
const { makeNotification, notifyClass } = require('./auth');

const router = express.Router();
router.use(authenticate, requireRole('TEACHER'));

const tid = (req) => getTeacherId(req.user.id);

// ---------- DASHBOARD ----------
router.get('/dashboard', (req, res) => {
  const t = tid(req);
  const today = new Date().getDay();
  const schedule = db.prepare(`SELECT s.*, c.name AS class_name, sub.name AS subject_name FROM schedules s
    JOIN classes c ON c.id = s.class_id JOIN subjects sub ON sub.id = s.subject_id
    WHERE s.teacher_id = ? AND s.day = ? ORDER BY s.start_time`).all(t, today);
  const weekly = {};
  for (let i = 0; i < 7; i++) {
    weekly[i] = db.prepare(`SELECT s.*, c.name AS class_name, sub.name AS subject_name FROM schedules s
      JOIN classes c ON c.id = s.class_id JOIN subjects sub ON sub.id = s.subject_id
      WHERE s.teacher_id = ? AND s.day = ? ORDER BY s.start_time`).all(t, i);
  }
  const classes = db.prepare('SELECT c.id, c.name, c.grade, u.name AS homeroom FROM classes c LEFT JOIN teachers h ON h.id = c.homeroom_teacher_id LEFT JOIN users u ON u.id = h.user_id WHERE h.id = ?').all(t);
  const subjects = db.prepare('SELECT * FROM subjects WHERE teacher_id = ? AND status = \'ACTIVE\' ORDER BY name').all(t);
  const materials = db.prepare('SELECT * FROM learning_materials WHERE teacher_id = ? ORDER BY id DESC LIMIT 5').all(t);
  const assignments = db.prepare('SELECT a.*, c.name AS class_name, sub.name AS subject_name FROM assignments a JOIN classes c ON c.id = a.class_id JOIN subjects sub ON sub.id = a.subject_id WHERE a.teacher_id = ? ORDER BY a.created_at DESC LIMIT 5').all(t);
  const submissionSummary = db.prepare(`SELECT a.id, a.title, c.name AS class_name, COUNT(s.id) AS total, SUM(CASE WHEN s.status IN ('SUBMITTED','GRADED','LATE') THEN 1 ELSE 0 END) AS submitted
    FROM assignments a JOIN classes c ON c.id = a.class_id LEFT JOIN assignment_submissions s ON s.assignment_id = a.id
    WHERE a.teacher_id = ? GROUP BY a.id ORDER BY a.id DESC LIMIT 6`).all(t);
  const todayAttendance = db.prepare('SELECT COUNT(*) AS c FROM attendance WHERE teacher_id = ? AND date = date(\'now\')').get(req.user.id).c;
  const meetings = db.prepare('SELECT m.*, u.name AS parent_name, s.name AS student_name FROM meetings m JOIN users u ON u.id = m.parent_id JOIN users s ON s.id = m.student_id WHERE m.teacher_id = ? AND m.status != \'CANCELLED\' ORDER BY m.date LIMIT 5').all(req.user.id);
  const discussions = db.prepare('SELECT d.*, (SELECT COUNT(*) FROM messages ms WHERE ms.room_id = d.id) AS message_count FROM discussion_rooms d JOIN discussion_members dm ON dm.room_id = d.id WHERE dm.user_id = ? AND d.status = \'ACTIVE\'').all(req.user.id);
  res.json({ success: true, data: { schedule, weekly, classes, subjects, materials, assignments, submissionSummary, todayAttendance, meetings, discussions, teacherId: t } });
});

// ---------- CLASSES & SUBJECTS ----------
router.get('/my-classes', (req, res) => {
  const t = tid(req);
  const classes = db.prepare(`SELECT DISTINCT c.id, c.name, c.grade, u.name AS homeroom,
    (SELECT COUNT(*) FROM student_classes sc WHERE sc.class_id = c.id AND sc.status = 'ACTIVE') AS student_count
    FROM classes c JOIN subjects s ON s.class_id = c.id LEFT JOIN teachers h ON h.id = c.homeroom_teacher_id LEFT JOIN users u ON u.id = h.user_id
    WHERE s.teacher_id = ? OR h.id = ? ORDER BY c.name`).all(t, t);
  const subjects = db.prepare('SELECT s.*, c.name AS class_name FROM subjects s JOIN classes c ON c.id = s.class_id WHERE s.teacher_id = ? AND s.status = \'ACTIVE\' ORDER BY c.name, s.name').all(t);
  res.json({ success: true, data: { classes, subjects } });
});

router.get('/students', (req, res) => {
  const t = tid(req);
  const classId = req.query.class_id;
  let rows;
  if (classId) {
    rows = db.prepare(`SELECT u.id, u.name, u.photo, u.phone, s.nis, s.gender, sc.class_id
      FROM student_classes sc JOIN users u ON u.id = sc.student_id LEFT JOIN students s ON s.user_id = u.id
      WHERE sc.class_id = ? AND sc.status = 'ACTIVE' ORDER BY u.name`).all(classId);
  } else {
    rows = db.prepare(`SELECT DISTINCT u.id, u.name, u.photo, u.phone, s.nis, s.gender, c.name AS class_name
      FROM student_classes sc JOIN users u ON u.id = sc.student_id LEFT JOIN students s ON s.user_id = u.id
      JOIN classes c ON c.id = sc.class_id JOIN subjects sub ON sub.class_id = sc.class_id
      WHERE (sub.teacher_id = ? OR c.homeroom_teacher_id = ?) AND sc.status = 'ACTIVE' ORDER BY c.name, u.name`).all(t, t);
  }
  res.json({ success: true, data: rows });
});

// ---------- MATERIALS ----------
router.get('/materials', (req, res) => {
  const t = tid(req);
  const rows = db.prepare('SELECT m.*, c.name AS class_name, sub.name AS subject_name FROM learning_materials m JOIN classes c ON c.id = m.class_id JOIN subjects sub ON sub.id = m.subject_id WHERE m.teacher_id = ? ORDER BY m.id DESC').all(t);
  res.json({ success: true, data: rows });
});
router.post('/materials', (req, res) => {
  const b = req.body || {};
  const t = tid(req);
  const mid = db.prepare('INSERT INTO learning_materials (title, description, file_url, video_url, external_link, subject_id, class_id, teacher_id, meeting, is_extra, status, published_at) VALUES (?,?,?,?,?,?,?,?,?,?,?, datetime(\'now\'))')
    .run(b.title, b.description || '', b.file_url || '', b.video_url || '', b.external_link || '', b.subject_id, b.class_id, t, b.meeting || 1, b.is_extra || 0, b.status || 'PUBLISHED').lastInsertRowid;
  notifyClass(b.class_id, 'NEW_MATERIAL', 'Materi baru tersedia', b.title);
  db.prepare('INSERT INTO activity_logs (user_id, action, entity, details) VALUES (?,?,?,?)').run(req.user.id, 'CREATE', 'learning_materials', `Created material #${mid}`);
  res.status(201).json({ success: true, data: { id: mid } });
});
router.put('/materials/:id', (req, res) => {
  const b = req.body || {};
  const keys = ['title', 'description', 'file_url', 'video_url', 'external_link', 'subject_id', 'class_id', 'meeting', 'is_extra', 'status'];
  const sets = keys.filter((k) => b[k] !== undefined).map((k) => `${k} = ?`).join(', ');
  const vals = keys.filter((k) => b[k] !== undefined).map((k) => b[k]);
  if (!keys.length || !sets) return res.status(422).json({ success: false, error: 'Tidak ada data.' });
  db.prepare(`UPDATE learning_materials SET ${sets} WHERE id = ? AND teacher_id = ?`).run(...vals, req.params.id, tid(req));
  res.json({ success: true, data: { id: req.params.id } });
});
router.delete('/materials/:id', (req, res) => {
  db.prepare('DELETE FROM learning_materials WHERE id = ? AND teacher_id = ?').run(req.params.id, tid(req));
  res.json({ success: true, data: { message: 'Materi dihapus.' } });
});

// ---------- PROGRESS (scoped) ----------
router.get('/progress', (req, res) => {
  const t = tid(req);
  const classId = req.query.class_id;
  if (!classId) return res.status(422).json({ success: false, error: 'Pilih kelas terlebih dahulu.' });
  const students = db.prepare(`SELECT u.id AS student_id, u.name, u.photo FROM student_classes sc JOIN users u ON u.id = sc.student_id WHERE sc.class_id = ? AND sc.status = 'ACTIVE' ORDER BY u.name`).all(classId);
  const subjectsInClass = db.prepare('SELECT id, name FROM subjects WHERE class_id = ? AND teacher_id = ?').all(classId, t);
  const materials = db.prepare('SELECT id, title, subject_id FROM learning_materials WHERE class_id = ? AND teacher_id = ?').all(classId, t);
  const result = students.map((st) => {
    const perSubject = subjectsInClass.map((sub) => {
      const items = materials.filter((m) => m.subject_id === sub.id);
      const done = items.filter((m) => {
        const p = db.prepare('SELECT status FROM learning_progress WHERE student_id = ? AND material_id = ?').get(st.student_id, m.id);
        return p && p.status === 'COMPLETED';
      }).length;
      return { subject: sub.name, total: items.length, done, pct: items.length ? Math.round((done / items.length) * 100) : 0 };
    });
    const all = materials.length;
    const allDone = materials.filter((m) => {
      const p = db.prepare('SELECT status FROM learning_progress WHERE student_id = ? AND material_id = ?').get(st.student_id, m.id);
      return p && p.status === 'COMPLETED';
    }).length;
    return { ...st, overall: all ? Math.round((allDone / all) * 100) : 0, perSubject };
  });
  res.json({ success: true, data: result });
});

// ---------- ASSIGNMENTS ----------
router.get('/assignments', (req, res) => {
  const t = tid(req);
  const rows = db.prepare('SELECT a.*, c.name AS class_name, sub.name AS subject_name FROM assignments a JOIN classes c ON c.id = a.class_id JOIN subjects sub ON sub.id = a.subject_id WHERE a.teacher_id = ? ORDER BY a.id DESC').all(t);
  res.json({ success: true, data: rows });
});
router.post('/assignments', (req, res) => {
  const b = req.body || {};
  const t = tid(req);
  const aid = db.prepare('INSERT INTO assignments (title, description, instructions, attachment, subject_id, class_id, teacher_id, deadline, max_score, status) VALUES (?,?,?,?,?,?,?,?,?,?)')
    .run(b.title, b.description || '', b.instructions || '', b.attachment || '', b.subject_id, b.class_id, t, b.deadline || '', b.max_score || 100, b.status || 'PUBLISHED').lastInsertRowid;
  notifyClass(b.class_id, 'NEW_ASSIGNMENT', 'Tugas baru tersedia', b.title);
  db.prepare('INSERT INTO activity_logs (user_id, action, entity, details) VALUES (?,?,?,?)').run(req.user.id, 'CREATE', 'assignments', `Created assignment #${aid}`);
  res.status(201).json({ success: true, data: { id: aid } });
});
router.put('/assignments/:id', (req, res) => {
  const b = req.body || {};
  const keys = ['title', 'description', 'instructions', 'attachment', 'subject_id', 'class_id', 'deadline', 'max_score', 'status'];
  const sets = keys.filter((k) => b[k] !== undefined).map((k) => `${k} = ?`).join(', ');
  const vals = keys.filter((k) => b[k] !== undefined).map((k) => b[k]);
  if (!keys.length || !sets) return res.status(422).json({ success: false, error: 'Tidak ada data.' });
  db.prepare(`UPDATE assignments SET ${sets} WHERE id = ? AND teacher_id = ?`).run(...vals, req.params.id, tid(req));
  res.json({ success: true, data: { id: req.params.id } });
});
router.delete('/assignments/:id', (req, res) => {
  db.prepare('DELETE FROM assignments WHERE id = ? AND teacher_id = ?').run(req.params.id, tid(req));
  res.json({ success: true, data: { message: 'Tugas dihapus.' } });
});

router.get('/assignments/:id/submissions', (req, res) => {
  const aid = req.params.id;
  const asg = db.prepare('SELECT * FROM assignments WHERE id = ? AND teacher_id = ?').get(aid, tid(req));
  if (!asg) return res.status(403).json({ success: false, error: 'Tidak ditemukan.' });
  const rows = db.prepare('SELECT s.id, s.assignment_id, s.student_id, s.content, s.attachment, s.submitted_at, s.status, s.grade, s.max_score, s.feedback, u.name AS student_name, u.photo FROM assignment_submissions s JOIN users u ON u.id = s.student_id WHERE s.assignment_id = ? ORDER BY u.name').all(aid);
  const summary = { total: rows.length, submitted: rows.filter((r) => ['SUBMITTED', 'LATE', 'GRADED'].includes(r.status)).length, graded: rows.filter((r) => r.grade !== null).length };
  res.json({ success: true, data: { assignment: asg, submissions: rows, summary } });
});

router.post('/submissions/:id/grade', (req, res) => {
  const b = req.body || {};
  const sub = db.prepare('SELECT s.*, a.teacher_id, a.title, s.student_id FROM assignment_submissions s JOIN assignments a ON a.id = s.assignment_id WHERE s.id = ?').get(req.params.id);
  if (!sub || sub.teacher_id !== tid(req)) return res.status(403).json({ success: false, error: 'Tidak berhak menilai.' });
  const grade = b.grade !== undefined ? Number(b.grade) : sub.grade;
  const status = grade !== null ? 'GRADED' : sub.status;
  db.prepare('UPDATE assignment_submissions SET grade = ?, feedback = ?, status = ?, max_score = ? WHERE id = ?').run(grade, b.feedback !== undefined ? b.feedback : sub.feedback, status, b.max_score || sub.max_score, req.params.id);
  makeNotification(sub.student_id, 'FEEDBACK', 'Tugas telah dinilai', `Tugas "${sub.title}" mendapat nilai ${grade}.`, sub.assignment_id);
  db.prepare('INSERT INTO activity_logs (user_id, action, entity, details) VALUES (?,?,?,?)').run(req.user.id, 'GRADE', 'assignment_submissions', `Graded submission #${req.params.id} = ${grade}`);
  res.json({ success: true, data: { message: 'Nilai disimpan.' } });
});

// ---------- ATTENDANCE ----------
router.get('/attendance', (req, res) => {
  const t = tid(req);
  const { class_id, date } = req.query;
  if (!class_id) return res.status(422).json({ success: false, error: 'Pilih kelas.' });
  const d = date || new Date().toISOString().slice(0, 10);
  const students = db.prepare('SELECT u.id AS student_id, u.name, u.photo FROM student_classes sc JOIN users u ON u.id = sc.student_id WHERE sc.class_id = ? AND sc.status = \'ACTIVE\' ORDER BY u.name').all(class_id);
  const records = db.prepare('SELECT * FROM attendance WHERE student_id IN (SELECT student_id FROM student_classes WHERE class_id = ?) AND date = ? AND teacher_id = ?').all(class_id, d, req.user.id);
  const map = {};
  records.forEach((r) => { map[r.student_id] = r; });
  const result = students.map((st) => ({ ...st, record: map[st.student_id] || null }));
  const summary = records.reduce((acc, r) => { acc[r.status] = (acc[r.status] || 0) + 1; return acc; }, {});
  res.json({ success: true, data: { date: d, students: result, summary } });
});

router.post('/attendance', (req, res) => {
  const { class_id, schedule_id, date, entries } = req.body || {};
  if (!Array.isArray(entries) || !entries.length) return res.status(422).json({ success: false, error: 'Tidak ada data.' });
  const d = date || new Date().toISOString().slice(0, 10);
  const del = db.prepare('DELETE FROM attendance WHERE student_id = ? AND date = ? AND COALESCE(schedule_id, 0) = ?');
  const ins = db.prepare('INSERT INTO attendance (student_id, class_id, schedule_id, teacher_id, date, status, check_in_time, note) VALUES (?,?,?,?,?,?,?,?)');
  for (const e of entries) {
    const time = e.check_in_time || (e.status === 'LATE' ? '07:45' : '06:55');
    del.run(e.student_id, d, schedule_id || 0);
    ins.run(e.student_id, class_id, schedule_id || null, req.user.id, d, e.status, time, e.note || '');
  }
  db.prepare('INSERT INTO activity_logs (user_id, action, entity, details) VALUES (?,?,?,?)').run(req.user.id, 'ATTENDANCE', 'attendance', `Recorded attendance for class #${class_id} on ${d}`);
  res.json({ success: true, data: { message: 'Kehadiran disimpan.' } });
});

router.get('/attendance/history/:studentId', (req, res) => {
  const rows = db.prepare('SELECT * FROM attendance WHERE student_id = ? AND teacher_id = ? ORDER BY date DESC LIMIT 30').all(req.params.studentId, req.user.id);
  res.json({ success: true, data: rows });
});

// ---------- DISCIPLINE ----------
router.get('/discipline', (req, res) => {
  const t = tid(req);
  const teacher = db.prepare('SELECT user_id FROM teachers WHERE id = ?').get(t);
  const reporterId = teacher ? teacher.user_id : req.user.id;
  const rows = db.prepare('SELECT d.*, u.name AS student_name FROM discipline_records d LEFT JOIN users u ON u.id = d.student_id WHERE d.reporter_id = ? ORDER BY d.date DESC, d.id DESC').all(reporterId);
  res.json({ success: true, data: rows });
});

router.post('/discipline', (req, res) => {
  const b = req.body || {};
  const d = db.prepare('INSERT INTO discipline_records (student_id, category, description, point, date, reporter_id, status, notes) VALUES (?,?,?,?,?,?,?,?)')
    .run(b.student_id, b.category || 'Kedisiplinan', b.description || '', b.point || 0, b.date || null, req.user.id, 'OPEN', b.notes || '').lastInsertRowid;
  makeNotification(b.student_id, 'SYSTEM', 'Catatan kedisiplinan', `Anda menerima catatan kedisiplinan dari guru.`, d);
  res.status(201).json({ success: true, data: { id: d } });
});

// ---------- PARENTS ----------
router.get('/parents', (req, res) => {
  const rows = db.prepare("SELECT u.id, u.name, u.photo FROM users u WHERE u.role = 'PARENT' AND u.status = 'ACTIVE' ORDER BY u.name").all();
  const links = db.prepare('SELECT ps.parent_id, ps.student_id, s.class_id AS class_id FROM parent_student ps JOIN student_classes s ON s.student_id = ps.student_id AND s.status = \'ACTIVE\'').all();
  const byParent = {};
  for (const l of links) (byParent[l.parent_id] ||= []).push(l);
  res.json({ success: true, data: rows.map((p) => ({ ...p, students: byParent[p.id] || [] })) });
});

// ---------- MEETINGS ----------
router.get('/meetings', (req, res) => {
  const rows = db.prepare('SELECT m.*, u.name AS parent_name, s.name AS student_name FROM meetings m JOIN users u ON u.id = m.parent_id JOIN users s ON s.id = m.student_id WHERE m.teacher_id = ? ORDER BY m.date DESC').all(req.user.id);
  res.json({ success: true, data: rows });
});
router.post('/meetings', (req, res) => {
  const b = req.body || {};
  const mid = db.prepare('INSERT INTO meetings (teacher_id, parent_id, student_id, topic, date, start_time, end_time, location, meeting_type, notes, status) VALUES (?,?,?,?,?,?,?,?,?,?,?)')
    .run(req.user.id, b.parent_id, b.student_id, b.topic || '', b.date || '', b.start_time || '', b.end_time || '', b.location || '', b.meeting_type || 'OFFLINE', b.notes || '', 'REQUESTED').lastInsertRowid;
  makeNotification(b.parent_id, 'MEETING', 'Permintaan meeting dari guru', `Guru mengajukan meeting: ${b.topic || 'Konsultasi'}.`, mid);
  res.status(201).json({ success: true, data: { id: mid } });
});
router.put('/meetings/:id', (req, res) => {
  const b = req.body || {};
  const keys = ['date', 'start_time', 'end_time', 'location', 'meeting_type', 'status', 'notes', 'topic'];
  const sets = keys.filter((k) => b[k] !== undefined).map((k) => `${k} = ?`).join(', ');
  const vals = keys.filter((k) => b[k] !== undefined).map((k) => b[k]);
  if (b.status) {
    const m = db.prepare('SELECT parent_id FROM meetings WHERE id = ?').get(req.params.id);
    db.prepare(`UPDATE meetings SET ${sets} WHERE id = ? AND teacher_id = ?`).run(...vals, req.params.id, req.user.id);
    if (m) makeNotification(m.parent_id, 'MEETING', 'Status meeting diperbarui', `Meeting kini berstatus ${b.status}.`, req.params.id);
  } else {
    db.prepare(`UPDATE meetings SET ${sets} WHERE id = ? AND teacher_id = ?`).run(...vals, req.params.id, req.user.id);
  }
  res.json({ success: true, data: { id: req.params.id } });
});

// ---------- FEEDBACK ----------
router.post('/feedback', (req, res) => {
  const b = req.body || {};
  db.prepare('INSERT INTO feedbacks (teacher_id, student_id, content, subject_id) VALUES (?,?,?,?)').run(req.user.id, b.student_id, b.content || '', b.subject_id || null);
  makeNotification(b.student_id, 'FEEDBACK', 'Feedback dari guru', b.content ? b.content.slice(0, 100) : 'Guru memberikan feedback untuk Anda.');
  res.status(201).json({ success: true, data: { message: 'Feedback terkirim.' } });
});

// ---------- DISCUSSIONS ----------
router.get('/discussions', (req, res) => {
  const rows = db.prepare(`SELECT d.*, u.name AS creator_name, (SELECT COUNT(*) FROM discussion_members dm WHERE dm.room_id = d.id) AS member_count, (SELECT COUNT(*) FROM messages ms WHERE ms.room_id = d.id) AS message_count
    FROM discussion_rooms d JOIN users u ON u.id = d.creator_id ORDER BY d.id DESC`).all();
  res.json({ success: true, data: rows });
});
router.post('/discussions', (req, res) => {
  const b = req.body || {};
  const rid = db.prepare('INSERT INTO discussion_rooms (title, topic, description, creator_id, type, start_date, end_date, status) VALUES (?,?,?,?,?,?,?,?)')
    .run(b.title, b.topic || '', b.description || '', req.user.id, b.type || 'CLASS_DISCUSSION', b.start_date || '', b.end_date || '', 'ACTIVE').lastInsertRowid;
  db.prepare('INSERT INTO discussion_members (room_id, user_id) VALUES (?,?)').run(rid, req.user.id);
  if (Array.isArray(b.members)) {
    const ins = db.prepare('INSERT OR IGNORE INTO discussion_members (room_id, user_id) VALUES (?,?)');
    for (const m of b.members) ins.run(rid, Number(m));
  }
  res.status(201).json({ success: true, data: { id: rid } });
});
router.get('/discussions/:id/messages', (req, res) => {
  const rid = req.params.id;
  const member = db.prepare('SELECT id FROM discussion_members WHERE room_id = ? AND user_id = ?').get(rid, req.user.id);
  if (!member) return res.status(403).json({ success: false, error: 'Anda bukan anggota ruang diskusi ini.' });
  const room = db.prepare('SELECT * FROM discussion_rooms WHERE id = ?').get(rid);
  const messages = db.prepare('SELECT m.*, u.name AS sender_name, u.photo AS sender_photo FROM messages m JOIN users u ON u.id = m.sender_id WHERE m.room_id = ? ORDER BY m.id').all(rid);
  res.json({ success: true, data: { room, messages } });
});
router.post('/discussions/:id/messages', (req, res) => {
  const rid = req.params.id;
  const member = db.prepare('SELECT id FROM discussion_members WHERE room_id = ? AND user_id = ?').get(rid, req.user.id);
  if (!member) return res.status(403).json({ success: false, error: 'Anda bukan anggota ruang diskusi ini.' });
  const b = req.body || {};
  if (!b.content) return res.status(422).json({ success: false, error: 'Isi pesan kosong.' });
  const mid = db.prepare('INSERT INTO messages (room_id, sender_id, content, attachment) VALUES (?,?,?,?)').run(rid, req.user.id, b.content, b.attachment || '').lastInsertRowid;
  res.status(201).json({ success: true, data: { id: mid } });
});

// ---------- TRAFFIC / PERKEMBANGAN SISWA ----------
router.get('/traffic', (req, res) => {
  const t = tid(req);
  const classId = req.query.class_id;
  const days = Math.min(30, Math.max(7, Number(req.query.days) || 14));
  if (!classId) return res.status(422).json({ success: false, error: 'Pilih kelas terlebih dahulu.' });

  const classInfo = db.prepare('SELECT c.id, c.name, c.grade, u.name AS homeroom FROM classes c LEFT JOIN teachers h ON h.id = c.homeroom_teacher_id LEFT JOIN users u ON u.id = h.user_id WHERE c.id = ?').get(classId);
  if (!classInfo) return res.status(404).json({ success: false, error: 'Kelas tidak ditemukan.' });

  const students = db.prepare(`SELECT u.id AS student_id, u.name, u.photo FROM student_classes sc JOIN users u ON u.id = sc.student_id WHERE sc.class_id = ? AND sc.status = 'ACTIVE' ORDER BY u.name`).all(classId);
  const subjectsInClass = db.prepare('SELECT id, name FROM subjects WHERE class_id = ?').all(classId);
  const materials = db.prepare('SELECT id, title, subject_id, meeting FROM learning_materials WHERE class_id = ?').all(classId);

  const studentRows = students.map((st) => {
    const perSubject = subjectsInClass.map((sub) => {
      const items = materials.filter((m) => m.subject_id === sub.id);
      const done = items.filter((m) => {
        const p = db.prepare('SELECT status FROM learning_progress WHERE student_id = ? AND material_id = ?').get(st.student_id, m.id);
        return p && p.status === 'COMPLETED';
      }).length;
      return { subject: sub.name, total: items.length, done, pct: items.length ? Math.round((done / items.length) * 100) : 0 };
    });
    const all = materials.length;
    const allDone = materials.filter((m) => {
      const p = db.prepare('SELECT status FROM learning_progress WHERE student_id = ? AND material_id = ?').get(st.student_id, m.id);
      return p && p.status === 'COMPLETED';
    }).length;
    return { ...st, overall: all ? Math.round((allDone / all) * 100) : 0, perSubject };
  });

  const avgOverall = studentRows.length ? Math.round(studentRows.reduce((a, s) => a + s.overall, 0) / studentRows.length) : 0;

  const trendRows = db.prepare(`SELECT substr(lp.completed_at,1,10) AS day, COUNT(*) AS c
    FROM learning_progress lp JOIN student_classes sc ON sc.student_id = lp.student_id AND sc.status = 'ACTIVE'
    WHERE sc.class_id = ? AND lp.status = 'COMPLETED' AND lp.completed_at IS NOT NULL AND lp.completed_at >= date('now', ?)
    GROUP BY day ORDER BY day`).all(classId, `-${days} days`);

  const trendMap = {};
  trendRows.forEach((r) => { trendMap[r.day] = r.c; });

  const trend = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    trend.push({ day: key, label: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }), count: trendMap[key] || 0 });
  }

  const attRows = db.prepare(`SELECT date, status, COUNT(*) AS c FROM attendance
    WHERE student_id IN (SELECT student_id FROM student_classes WHERE class_id = ? AND status = 'ACTIVE')
    AND date >= date('now', ?) GROUP BY date, status ORDER BY date`).all(classId, `-${days} days`);
  const attMap = {};
  const attByDate = {};
  const PR = { PRESENT: 1, LATE: 1, SICK: 1, EXCUSED: 1 };
  attRows.forEach((r) => {
    (attByDate[r.date] = attByDate[r.date] || []).push(r);
    attMap[r.date] = attMap[r.date] || { present: 0, total: 0 };
    attMap[r.date].total += r.c;
    if (PR[r.status]) attMap[r.date].present += r.c;
  });
  const attendance = Object.keys(attMap).sort().map((d) => {
    const dd = new Date(d + 'T00:00:00');
    return {
      day: d,
      label: dd.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      pct: attMap[d].total ? Math.round((attMap[d].present / attMap[d].total) * 100) : 0,
      present: attMap[d].present,
      total: attMap[d].total
    };
  });

  const ids = students.map((s) => s.student_id);
  let graded = 0;
  let submitted = 0;
  if (ids.length) {
    const ph = ids.map(() => '?').join(',');
    const agg = db.prepare(`SELECT status, COUNT(*) AS c FROM assignment_submissions WHERE student_id IN (${ph}) GROUP BY status`).all(...ids);
    agg.forEach((r) => { if (r.status === 'GRADED') graded = r.c; if (['SUBMITTED', 'GRADED', 'LATE'].includes(r.status)) submitted += r.c; });
  }

  res.json({
    success: true,
    data: {
      classInfo,
      studentCount: students.length,
      totalMaterials: materials.length,
      avgOverall,
      submitted,
      graded,
      trend,
      attendance,
      students: studentRows
    }
  });
});

module.exports = router;
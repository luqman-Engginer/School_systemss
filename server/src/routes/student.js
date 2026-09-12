const express = require('express');
const { authenticate, requireRole, db } = require('../auth');
const { makeNotification } = require('./auth');

const router = express.Router();
router.use(authenticate, requireRole('STUDENT'));

const uid = (req) => req.user.id;

const myClassQuery = 'SELECT class_id FROM student_classes WHERE student_id = ? AND status = \'ACTIVE\'';

// ---------- DASHBOARD ----------
router.get('/dashboard', (req, res) => {
  const me = uid(req);
  const myClass = db.prepare(myClassQuery).get(me)?.class_id || null;
  const today = new Date().getDay();
  const schedule = myClass ? db.prepare('SELECT s.*, sub.name AS subject_name, u.name AS teacher_name FROM schedules s JOIN subjects sub ON sub.id = s.subject_id LEFT JOIN teachers t ON t.id = s.teacher_id LEFT JOIN users u ON u.id = t.user_id WHERE s.class_id = ? AND s.day = ? ORDER BY s.start_time').all(myClass, today) : [];
  const newMaterials = myClass ? db.prepare('SELECT m.*, sub.name AS subject_name FROM learning_materials m JOIN subjects sub ON sub.id = m.subject_id WHERE m.class_id = ? AND m.status = \'PUBLISHED\' ORDER BY m.id DESC LIMIT 5').all(myClass) : [];
  const upcomingAssignments = db.prepare(`SELECT a.*, sub.name AS subject_name, s.status AS my_status
    FROM assignments a JOIN subjects sub ON sub.id = a.subject_id LEFT JOIN assignment_submissions s ON s.assignment_id = a.id AND s.student_id = ?
    WHERE a.class_id = ? AND a.status = 'PUBLISHED' AND a.deadline >= date('now') ORDER BY a.deadline LIMIT 5`).all(me, myClass);
  const missed = db.prepare('SELECT m.id AS material_id, m.title, sub.name AS subject_name, m.meeting FROM learning_progress lp JOIN learning_materials m ON m.id = lp.material_id JOIN subjects sub ON sub.id = m.subject_id WHERE lp.student_id = ? AND lp.status = \'MISSED\' ORDER BY m.meeting').all(me);
  const announcements = db.prepare("SELECT * FROM announcements WHERE status = 'PUBLISHED' AND target_role IN ('ALL','STUDENT') ORDER BY id DESC LIMIT 4").all();
  const progress = db.prepare('SELECT status, COUNT(*) AS c FROM learning_progress WHERE student_id = ? GROUP BY status').all(me);
  const notifUnread = db.prepare('SELECT COUNT(*) AS c FROM notifications WHERE recipient_id = ? AND is_read = 0').get(me).c;
  res.json({ success: true, data: { myClass, schedule, newMaterials, upcomingAssignments, missed, announcements, progress, notifUnread } });
});

// ---------- SCHEDULE ----------
router.get('/schedule', (req, res) => {
  const me = uid(req);
  const myClass = db.prepare(myClassQuery).get(me)?.class_id || null;
  const rows = myClass ? db.prepare('SELECT s.*, sub.name AS subject_name, u.name AS teacher_name FROM schedules s JOIN subjects sub ON sub.id = s.subject_id LEFT JOIN teachers t ON t.id = s.teacher_id LEFT JOIN users u ON u.id = t.user_id WHERE s.class_id = ? AND s.day = ? ORDER BY s.start_time').all(myClass, Number(req.query.day ?? new Date().getDay())) : [];
  res.json({ success: true, data: rows });
});

// ---------- MATERIALS ----------
router.get('/materials', (req, res) => {
  const me = uid(req);
  const myClass = db.prepare(myClassQuery).get(me)?.class_id || null;
  const rows = myClass ? db.prepare(`SELECT m.*, sub.name AS subject_name, u.name AS teacher_name, lp.status AS my_status, lp.review_count, COALESCE(lp.status, 'NOT_STARTED') AS progress_status
    FROM learning_materials m JOIN subjects sub ON sub.id = m.subject_id LEFT JOIN teachers t ON t.id = m.teacher_id LEFT JOIN users u ON u.id = t.user_id
    LEFT JOIN learning_progress lp ON lp.material_id = m.id AND lp.student_id = ?
    WHERE m.class_id = ? AND m.status = 'PUBLISHED' ORDER BY sub.name, m.meeting`).all(me, myClass) : [];
  res.json({ success: true, data: rows });
});

router.post('/materials/:id/progress', (req, res) => {
  const me = uid(req);
  const mid = req.params.id;
  const { status } = req.body || {};
  const existing = db.prepare('SELECT * FROM learning_progress WHERE student_id = ? AND material_id = ?').get(me, mid);
  if (existing) {
    if (status === 'COMPLETED') {
      db.prepare('UPDATE learning_progress SET status = ?, completed_at = datetime(\'now\'), last_reviewed = datetime(\'now\') WHERE id = ?').run('COMPLETED', existing.id);
    } else if (status === 'IN_PROGRESS' && existing.status === 'NOT_STARTED') {
      db.prepare('UPDATE learning_progress SET status = ?, started_at = datetime(\'now\') WHERE id = ?').run('IN_PROGRESS', existing.id);
    }
  } else {
    const s = status === 'COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS';
    db.prepare('INSERT INTO learning_progress (student_id, material_id, status, started_at, completed_at) VALUES (?,?,?,datetime(\'now\'), ?)')
      .run(me, mid, s, s === 'COMPLETED' ? new Date().toISOString().slice(0, 19).replace('T', ' ') : null);
  }
  res.json({ success: true, data: { message: 'Progress tersimpan.' } });
});

// ---------- MISSED LEARNING ----------
router.get('/missed-learning', (req, res) => {
  const me = uid(req);
  const rows = db.prepare(`SELECT lp.material_id, m.title, m.description, m.video_url, m.file_url, m.meeting, sub.name AS subject_name, u.name AS teacher_name
    FROM learning_progress lp JOIN learning_materials m ON m.id = lp.material_id JOIN subjects sub ON sub.id = m.subject_id
    LEFT JOIN teachers t ON t.id = m.teacher_id LEFT JOIN users u ON u.id = t.user_id
    WHERE lp.student_id = ? AND lp.status = 'MISSED' ORDER BY m.meeting`).all(me);
  res.json({ success: true, data: rows });
});

// ---------- REVIEW ----------
router.get('/review', (req, res) => {
  const me = uid(req);
  const rows = db.prepare(`SELECT lp.*, m.title, m.description, m.video_url, m.file_url, m.external_link, sub.name AS subject_name
    FROM learning_progress lp JOIN learning_materials m ON m.id = lp.material_id JOIN subjects sub ON sub.id = m.subject_id
    WHERE lp.student_id = ? AND lp.status IN ('COMPLETED','MISSED') ORDER BY lp.last_reviewed DESC`).all(me);
  res.json({ success: true, data: rows });
});

router.post('/review/:materialId', (req, res) => {
  const me = uid(req);
  const mid = req.params.materialId;
  const existing = db.prepare('SELECT * FROM learning_progress WHERE student_id = ? AND material_id = ?').get(me, mid);
  if (existing) {
    db.prepare('UPDATE learning_progress SET review_count = review_count + 1, last_reviewed = datetime(\'now\'), status = ? WHERE id = ?').run(existing.status === 'MISSED' ? 'IN_PROGRESS' : existing.status, existing.id);
  }
  res.json({ success: true, data: { message: 'Review dicatat.' } });
});

// ---------- PROGRESS ----------
router.get('/progress', (req, res) => {
  const me = uid(req);
  const myClass = db.prepare(myClassQuery).get(me)?.class_id || null;
  const subjects = myClass ? db.prepare('SELECT id, name FROM subjects WHERE class_id = ?').all(myClass) : [];
  const result = subjects.map((s) => {
    const materials = db.prepare('SELECT id FROM learning_materials WHERE subject_id = ? AND class_id = ? AND status = \'PUBLISHED\'').all(s.id, myClass);
    const done = materials.filter((m) => {
      const p = db.prepare('SELECT status FROM learning_progress WHERE student_id = ? AND material_id = ?').get(me, m.id);
      return p && p.status === 'COMPLETED';
    }).length;
    const assignRows = db.prepare('SELECT a.id, a.max_score, s.grade FROM assignments a LEFT JOIN assignment_submissions s ON s.assignment_id = a.id AND s.student_id = ? WHERE a.subject_id = ? AND a.class_id = ?').all(me, s.id, myClass);
    const graded = assignRows.filter((a) => a.grade !== null);
    const avgGrade = graded.length ? Math.round(graded.reduce((acc, a) => acc + a.grade, 0) / graded.length) : null;
    return {
      subject: s.name,
      materialsTotal: materials.length,
      materialsDone: done,
      materialsPct: materials.length ? Math.round((done / materials.length) * 100) : 0,
      assignmentsTotal: assignRows.length,
      assignmentsDone: assignRows.filter((a) => a.grade !== null).length,
      avgGrade
    };
  });
  const totalMats = result.reduce((a, s) => a + s.materialsTotal, 0);
  const totalDone = result.reduce((a, s) => a + s.materialsDone, 0);
  res.json({ success: true, data: { subjects: result, overall: totalMats ? Math.round((totalDone / totalMats) * 100) : 0, totalMaterials: totalMats, doneMaterials: totalDone } });
});

// ---------- ASSIGNMENTS ----------
router.get('/assignments', (req, res) => {
  const me = uid(req);
  const myClass = db.prepare(myClassQuery).get(me)?.class_id || null;
  const rows = myClass ? db.prepare(`SELECT a.*, sub.name AS subject_name, u.name AS teacher_name, COALESCE(s.status, 'NOT_STARTED') AS my_status, s.grade, s.feedback, s.submitted_at, s.attachment AS my_attachment, s.max_score AS sub_max
    FROM assignments a JOIN subjects sub ON sub.id = a.subject_id LEFT JOIN teachers t ON t.id = a.teacher_id LEFT JOIN users u ON u.id = t.user_id
    LEFT JOIN assignment_submissions s ON s.assignment_id = a.id AND s.student_id = ?
    WHERE a.class_id = ? AND a.status = 'PUBLISHED' ORDER BY a.deadline`).all(me, myClass) : [];
  res.json({ success: true, data: rows });
});

router.post('/assignments/:id/submit', (req, res) => {
  const me = uid(req);
  const aid = req.params.id;
  const asg = db.prepare('SELECT * FROM assignments WHERE id = ?').get(aid);
  if (!asg) return res.status(404).json({ success: false, error: 'Tugas tidak ditemukan.' });
  const mine = db.prepare('SELECT student_id FROM student_classes WHERE student_id = ? AND class_id = ? AND status = \'ACTIVE\'').get(me, asg.class_id);
  if (!mine) return res.status(403).json({ success: false, error: 'Anda tidak terdaftar pada kelas tugas ini.' });
  const b = req.body || {};
  const isLate = new Date() > new Date(asg.deadline + 'T23:59:59');
  const status = isLate ? 'LATE' : 'SUBMITTED';
  const existing = db.prepare('SELECT id FROM assignment_submissions WHERE assignment_id = ? AND student_id = ?').get(aid, me);
  if (existing) {
    db.prepare('UPDATE assignment_submissions SET content = ?, attachment = ?, submitted_at = datetime(\'now\'), status = ? WHERE id = ?').run(b.content || '', b.attachment || '', status, existing.id);
  } else {
    db.prepare('INSERT INTO assignment_submissions (assignment_id, student_id, content, attachment, submitted_at, status, max_score) VALUES (?,?,?,?,datetime(\'now\'),?,?)').run(aid, me, b.content || '', b.attachment || '', status, asg.max_score);
  }
  res.json({ success: true, data: { message: `Tugas dikumpulkan (${status}).` } });
});

// ---------- QUIZ ----------
router.get('/quizzes', (req, res) => {
  const me = uid(req);
  const myClass = db.prepare(myClassQuery).get(me)?.class_id || null;
  const rows = myClass ? db.prepare(`SELECT q.*, sub.name AS subject_name, at.status AS attempt_status, at.score,
    (SELECT COUNT(*) FROM questions qq WHERE qq.quiz_id = q.id) AS question_count
    FROM quizzes q JOIN subjects sub ON sub.id = q.subject_id
    LEFT JOIN quiz_attempts at ON at.quiz_id = q.id AND at.student_id = ? WHERE q.class_id = ? ORDER BY q.id`).all(me, myClass) : [];
  res.json({ success: true, data: rows });
});

router.get('/quizzes/:id/questions', (req, res) => {
  const me = uid(req);
  const quiz = db.prepare('SELECT * FROM quizzes WHERE id = ?').get(req.params.id);
  if (!quiz) return res.status(404).json({ success: false, error: 'Quiz tidak ditemukan.' });
  const myClass = db.prepare('SELECT class_id FROM student_classes WHERE student_id = ? AND status = \'ACTIVE\'').get(me)?.class_id;
  if (quiz.class_id !== myClass) return res.status(403).json({ success: false, error: 'Bukan kuis kelas Anda.' });
  const questions = db.prepare('SELECT id, quiz_id, question, type, options, score FROM questions WHERE quiz_id = ? ORDER BY id').all(quiz.id).map((q) => {
    try { q.options = JSON.parse(q.options || '[]'); } catch { q.options = []; }
    return q;
  });
  res.json({ success: true, data: { quiz, questions } });
});

router.post('/quizzes/:id/attempt', (req, res) => {
  const me = uid(req);
  const answers = req.body?.answers || {};
  const quiz = db.prepare('SELECT * FROM quizzes WHERE id = ?').get(req.params.id);
  if (!quiz) return res.status(404).json({ success: false, error: 'Quiz tidak ditemukan.' });
  const questions = db.prepare('SELECT * FROM questions WHERE quiz_id = ?').all(quiz.id);
  let score = 0;
  let max = 0;
  for (const q of questions) {
    const ans = answers[q.id];
    max += q.score;
    if (ans !== undefined && String(ans).toLowerCase() === String(q.correct_answer).toLowerCase()) score += q.score;
  }
  const pct = max ? Math.round((score / max) * 100) : 0;
  db.prepare('UPDATE quiz_attempts SET completed_at = datetime(\'now\'), score = ?, status = \'COMPLETED\' WHERE quiz_id = ? AND student_id = ? AND status = \'IN_PROGRESS\'').run(pct, quiz.id, me);
  if (db.prepare('SELECT COUNT(*) AS c FROM quiz_attempts WHERE quiz_id = ? AND student_id = ?').get(quiz.id, me).c === 0) {
    db.prepare('INSERT INTO quiz_attempts (quiz_id, student_id, started_at, completed_at, score, status) VALUES (?,?,datetime(\'now\'),datetime(\'now\'),?,?)').run(quiz.id, me, pct, 'COMPLETED');
  }
  res.json({ success: true, data: { score: pct, max, totalQuestions: questions.length } });
});

// ---------- ASPIRATIONS ----------
router.get('/aspirations', (req, res) => {
  const rows = db.prepare('SELECT a.*, u.name AS student_name FROM aspirations a JOIN users u ON u.id = a.student_id WHERE a.student_id = ? ORDER BY a.id DESC').all(uid(req));
  res.json({ success: true, data: rows });
});
router.post('/aspirations', (req, res) => {
  const b = req.body || {};
  if (!b.title) return res.status(422).json({ success: false, error: 'Judul aspirasi wajib diisi.' });
  const a = db.prepare('INSERT INTO aspirations (student_id, title, content, category, anonymous, status) VALUES (?,?,?,?,?,?)')
    .run(uid(req), b.title, b.content || '', b.category || 'Saran', b.anonymous ? 1 : 0, 'SUBMITTED').lastInsertRowid;
  db.prepare('INSERT INTO activity_logs (user_id, action, entity, details) VALUES (?,?,?,?)').run(uid(req), 'CREATE', 'aspirations', `Created aspiration #${a}`);
  res.status(201).json({ success: true, data: { id: a } });
});

// ---------- ATTENDANCE ----------
router.get('/attendance', (req, res) => {
  const rows = db.prepare('SELECT a.*, c.name AS class_name FROM attendance a LEFT JOIN classes c ON c.id = a.class_id WHERE a.student_id = ? ORDER BY a.date DESC LIMIT 30').all(uid(req));
  const summary = db.prepare('SELECT status, COUNT(*) AS c FROM attendance WHERE student_id = ? GROUP BY status').all(uid(req));
  res.json({ success: true, data: { rows, summary } });
});

// ---------- DISCIPLINE ----------
router.get('/discipline', (req, res) => {
  const rows = db.prepare('SELECT * FROM discipline_records WHERE student_id = ? ORDER BY date DESC').all(uid(req));
  res.json({ success: true, data: rows });
});

// ---------- DISCUSSIONS ----------
router.get('/discussions', (req, res) => {
  const rows = db.prepare(`SELECT d.*, u.name AS creator_name, (SELECT COUNT(*) FROM messages ms WHERE ms.room_id = d.id) AS message_count
    FROM discussion_rooms d JOIN discussion_members dm ON dm.room_id = d.id JOIN users u ON u.id = d.creator_id
    WHERE dm.user_id = ? AND d.status = 'ACTIVE'`).all(uid(req));
  res.json({ success: true, data: rows });
});
router.post('/discussions/:id/messages', (req, res) => {
  const rid = req.params.id;
  const member = db.prepare('SELECT id FROM discussion_members WHERE room_id = ? AND user_id = ?').get(rid, uid(req));
  if (!member) return res.status(403).json({ success: false, error: 'Anda bukan anggota ruang diskusi ini.' });
  const b = req.body || {};
  if (!b.content) return res.status(422).json({ success: false, error: 'Isi pesan kosong.' });
  const mid = db.prepare('INSERT INTO messages (room_id, sender_id, content, attachment) VALUES (?,?,?,?)').run(rid, uid(req), b.content, b.attachment || '').lastInsertRowid;
  res.status(201).json({ success: true, data: { id: mid } });
});
router.get('/discussions/:id/messages', (req, res) => {
  const rid = req.params.id;
  const member = db.prepare('SELECT id FROM discussion_members WHERE room_id = ? AND user_id = ?').get(rid, uid(req));
  if (!member) return res.status(403).json({ success: false, error: 'Anda bukan anggota ruang diskusi ini.' });
  const room = db.prepare('SELECT * FROM discussion_rooms WHERE id = ?').get(rid);
  const messages = db.prepare('SELECT m.*, u.name AS sender_name, u.photo AS sender_photo FROM messages m JOIN users u ON u.id = m.sender_id WHERE m.room_id = ? ORDER BY m.id').all(rid);
  res.json({ success: true, data: { room, messages } });
});

// ---------- ANNOUNCEMENTS ----------
router.get('/announcements', (req, res) => {
  const rows = db.prepare("SELECT * FROM announcements WHERE status = 'PUBLISHED' AND target_role IN ('ALL','STUDENT') ORDER BY id DESC").all();
  res.json({ success: true, data: rows });
});

module.exports = router;
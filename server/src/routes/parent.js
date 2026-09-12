const express = require('express');
const { authenticate, requireRole, db } = require('../auth');
const { makeNotification } = require('./auth');

const router = express.Router();
router.use(authenticate, requireRole('PARENT'));

const childrenOf = (parentId) => db.prepare('SELECT ps.student_id, ps.relation, u.name, u.photo, u.id FROM parent_student ps JOIN users u ON u.id = ps.student_id WHERE ps.parent_id = ? AND u.status = \'ACTIVE\'').all(parentId);

function requireChild(req, res, next) {
  const childId = req.params.childId;
  const rel = db.prepare('SELECT student_id FROM parent_student WHERE parent_id = ? AND student_id = ?').get(req.user.id, childId);
  if (!rel) return res.status(403).json({ success: false, error: 'Anda tidak terhubung dengan siswa ini.' });
  next();
}

router.get('/dashboard', (req, res) => {
  const children = childrenOf(req.user.id);
  const withData = children.map((c) => {
    const myClass = db.prepare('SELECT class_id FROM student_classes WHERE student_id = ? AND status = \'ACTIVE\'').get(c.student_id)?.class_id || null;
    const classInfo = myClass ? db.prepare('SELECT name, grade FROM classes WHERE id = ?').get(myClass) : null;
    const attendance = db.prepare('SELECT status, COUNT(*) AS c FROM attendance WHERE student_id = ? GROUP BY status').all(c.student_id);
    const prog = db.prepare('SELECT status, COUNT(*) AS c FROM learning_progress WHERE student_id = ? GROUP BY status').all(c.student_id);
    const total = prog.reduce((a, p) => a + p.c, 0);
    const done = prog.find((p) => p.status === 'COMPLETED')?.c || 0;
    const upcomingAssign = db.prepare(`SELECT a.title, sub.name AS subject_name, a.deadline, s.grade FROM assignments a JOIN subjects sub ON sub.id = a.subject_id
      LEFT JOIN assignment_submissions s ON s.assignment_id = a.id AND s.student_id = ?
      WHERE a.class_id = ? AND a.deadline >= date('now') ORDER BY a.deadline LIMIT 2`).all(c.student_id, myClass);
    const feedback = db.prepare('SELECT f.content, u.name AS teacher_name, sub.name AS subject_name, f.created_at FROM feedbacks f LEFT JOIN users u ON u.id = f.teacher_id LEFT JOIN subjects sub ON sub.id = f.subject_id WHERE f.student_id = ? ORDER BY f.id DESC LIMIT 2').all(c.student_id);
    return { ...c, classInfo, attendance, progressPct: total ? Math.round((done / total) * 100) : 0, upcomingAssign, feedback };
  });
  const meetings = db.prepare('SELECT m.*, s.name AS student_name FROM meetings m JOIN users s ON s.id = m.student_id WHERE m.parent_id = ? ORDER BY m.date DESC LIMIT 5').all(req.user.id);
  const notifications = db.prepare('SELECT COUNT(*) AS c FROM notifications WHERE recipient_id = ? AND is_read = 0').get(req.user.id).c;
  res.json({ success: true, data: { children: withData, meetings, notifications } });
});

router.get('/children', (req, res) => {
  res.json({ success: true, data: childrenOf(req.user.id) });
});

router.get('/child/:childId/overview', requireChild, (req, res) => {
  const cid = req.params.childId;
  const myClass = db.prepare('SELECT class_id FROM student_classes WHERE student_id = ? AND status = \'ACTIVE\'').get(cid)?.class_id || null;
  const classInfo = myClass ? db.prepare('SELECT c.name, c.grade, u.name AS homeroom FROM classes c LEFT JOIN teachers h ON h.id = c.homeroom_teacher_id LEFT JOIN users u ON u.id = h.user_id WHERE c.id = ?').get(myClass) : null;
  const prog = db.prepare('SELECT status, COUNT(*) AS c FROM learning_progress WHERE student_id = ? GROUP BY status').all(cid);
  const total = prog.reduce((a, p) => a + p.c, 0);
  const done = prog.find((p) => p.status === 'COMPLETED')?.c || 0;
  const discipline = db.prepare('SELECT COUNT(*) AS c FROM discipline_records WHERE student_id = ?').get(cid).c;
  res.json({ success: true, data: { classInfo, progressPct: total ? Math.round((done / total) * 100) : 0, done, total, discipline } });
});

router.get('/child/:childId/progress', requireChild, (req, res) => {
  const cid = req.params.childId;
  const myClass = db.prepare('SELECT class_id FROM student_classes WHERE student_id = ? AND status = \'ACTIVE\'').get(cid)?.class_id || null;
  const subjects = myClass ? db.prepare('SELECT id, name FROM subjects WHERE class_id = ?').all(myClass) : [];
  const result = subjects.map((s) => {
    const materials = db.prepare('SELECT id FROM learning_materials WHERE subject_id = ? AND class_id = ? AND status = \'PUBLISHED\'').all(s.id, myClass);
    const done = materials.filter((m) => { const p = db.prepare('SELECT status FROM learning_progress WHERE student_id = ? AND material_id = ?').get(cid, m.id); return p && p.status === 'COMPLETED'; }).length;
    const assignRows = db.prepare('SELECT a.id, a.max_score, s.grade FROM assignments a LEFT JOIN assignment_submissions s ON s.assignment_id = a.id AND s.student_id = ? WHERE a.subject_id = ? AND a.class_id = ?').all(cid, s.id, myClass);
    const graded = assignRows.filter((a) => a.grade !== null);
    return { subject: s.name, materialsPct: materials.length ? Math.round((done / materials.length) * 100) : 0, assignmentsTotal: assignRows.length, graded: graded.length, avgGrade: graded.length ? Math.round(graded.reduce((acc, a) => acc + a.grade, 0) / graded.length) : null };
  });
  res.json({ success: true, data: result });
});

router.get('/child/:childId/attendance', requireChild, (req, res) => {
  const cid = req.params.childId;
  const rows = db.prepare('SELECT a.*, c.name AS class_name FROM attendance a LEFT JOIN classes c ON c.id = a.class_id WHERE a.student_id = ? ORDER BY a.date DESC LIMIT 30').all(cid);
  const summary = db.prepare('SELECT status, COUNT(*) AS c FROM attendance WHERE student_id = ? GROUP BY status').all(cid);
  res.json({ success: true, data: { rows, summary } });
});

router.get('/child/:childId/grades', requireChild, (req, res) => {
  const cid = req.params.childId;
  const rows = db.prepare(`SELECT s.grade, s.feedback, s.status, s.max_score, s.submitted_at, a.title AS assignment_title, sub.name AS subject_name
    FROM assignment_submissions s JOIN assignments a ON a.id = s.assignment_id JOIN subjects sub ON sub.id = a.subject_id
    WHERE s.student_id = ? AND s.status IN ('SUBMITTED','LATE','GRADED') ORDER BY s.id DESC`).all(cid);
  res.json({ success: true, data: rows });
});

router.get('/child/:childId/assignments', requireChild, (req, res) => {
  const cid = req.params.childId;
  const myClass = db.prepare('SELECT class_id FROM student_classes WHERE student_id = ? AND status = \'ACTIVE\'').get(cid)?.class_id || null;
  const rows = myClass ? db.prepare(`SELECT a.title, a.description, a.deadline, a.max_score, sub.name AS subject_name, COALESCE(s.status, 'NOT_STARTED') AS my_status, s.grade
    FROM assignments a JOIN subjects sub ON sub.id = a.subject_id LEFT JOIN assignment_submissions s ON s.assignment_id = a.id AND s.student_id = ?
    WHERE a.class_id = ? AND a.status = 'PUBLISHED' ORDER BY a.deadline`).all(cid, myClass) : [];
  res.json({ success: true, data: rows });
});

router.get('/child/:childId/schedule', requireChild, (req, res) => {
  const cid = req.params.childId;
  const myClass = db.prepare('SELECT class_id FROM student_classes WHERE student_id = ? AND status = \'ACTIVE\'').get(cid)?.class_id || null;
  const rows = myClass ? db.prepare('SELECT s.*, sub.name AS subject_name, u.name AS teacher_name FROM schedules s JOIN subjects sub ON sub.id = s.subject_id LEFT JOIN teachers t ON t.id = s.teacher_id LEFT JOIN users u ON u.id = t.user_id WHERE s.class_id = ? ORDER BY s.day, s.start_time').all(myClass) : [];
  res.json({ success: true, data: rows });
});

router.get('/child/:childId/discipline', requireChild, (req, res) => {
  const rows = db.prepare('SELECT * FROM discipline_records WHERE student_id = ? ORDER BY date DESC').all(req.params.childId);
  res.json({ success: true, data: rows });
});

router.get('/child/:childId/feedback', requireChild, (req, res) => {
  const rows = db.prepare('SELECT f.*, u.name AS teacher_name, sub.name AS subject_name FROM feedbacks f LEFT JOIN users u ON u.id = f.teacher_id LEFT JOIN subjects sub ON sub.id = f.subject_id WHERE f.student_id = ? ORDER BY f.id DESC').all(req.params.childId);
  res.json({ success: true, data: rows });
});

router.get('/meetings', (req, res) => {
  const rows = db.prepare('SELECT m.*, u.name AS teacher_name, s.name AS student_name FROM meetings m JOIN users u ON u.id = m.teacher_id JOIN users s ON s.id = m.student_id WHERE m.parent_id = ? ORDER BY m.date DESC').all(req.user.id);
  res.json({ success: true, data: rows });
});

router.put('/meetings/:id', (req, res) => {
  const b = req.body || {};
  const keys = ['status', 'notes'];
  const sets = keys.filter((k) => b[k] !== undefined).map((k) => `${k} = ?`).join(', ');
  const vals = keys.filter((k) => b[k] !== undefined).map((k) => b[k]);
  if (b.status) {
    const m = db.prepare('SELECT teacher_id, student_id FROM meetings WHERE id = ? AND parent_id = ?').get(req.params.id, req.user.id);
    if (m) {
      db.prepare(`UPDATE meetings SET ${sets} WHERE id = ? AND parent_id = ?`).run(...vals, req.params.id, req.user.id);
      makeNotification(m.teacher_id, 'MEETING', 'Meeting dikonfirmasi orang tua', `Orang tua mengubah status meeting menjadi ${b.status}.`, req.params.id);
    }
  } else {
    db.prepare(`UPDATE meetings SET ${sets} WHERE id = ? AND parent_id = ?`).run(...vals, req.params.id, req.user.id);
  }
  res.json({ success: true, data: { id: req.params.id } });
});

module.exports = router;
const express = require('express');
const bcrypt = require('bcryptjs');
const { signToken, authenticate, db } = require('../auth');

const router = express.Router();

router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(422).json({ success: false, error: 'Email dan password wajib diisi.' });
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(String(email).trim().toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ success: false, error: 'Email atau password salah.' });
  }
  if (user.status !== 'ACTIVE') return res.status(403).json({ success: false, error: 'Akun Anda dinonaktifkan. Hubungi admin.' });
  const token = signToken(user);
  db.prepare('INSERT INTO activity_logs (user_id, action, entity, details) VALUES (?,?,?,?)').run(user.id, 'LOGIN', 'auth', `${user.email} login`);
  res.json({ success: true, data: { token, user: { id: user.id, name: user.name, email: user.email, role: user.role, photo: user.photo, phone: user.phone } } });
});

router.get('/me', authenticate, (req, res) => {
  const u = req.user;
  let extra = null;
  if (u.role === 'TEACHER') extra = db.prepare('SELECT id, position, subject, bio, public_visible FROM teachers WHERE user_id = ?').get(u.id);
  if (u.role === 'STUDENT') extra = db.prepare('SELECT id, nis, gender, birth_date FROM students WHERE user_id = ?').get(u.id);
  if (u.role === 'PARENT') extra = db.prepare('SELECT id, occupation FROM parents WHERE user_id = ?').get(u.id);
  res.json({ success: true, data: { ...u, extra } });
});

router.post('/change-password', authenticate, (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword) return res.status(422).json({ success: false, error: 'Password lama dan baru wajib diisi.' });
  if (newPassword.length < 6) return res.status(422).json({ success: false, error: 'Password baru minimal 6 karakter.' });
  const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user.id);
  if (!bcrypt.compareSync(currentPassword, user.password_hash)) return res.status(401).json({ success: false, error: 'Password lama salah.' });
  db.prepare('UPDATE users SET password_hash = ?, updated_at = datetime(\'now\') WHERE id = ?').run(bcrypt.hashSync(newPassword, 10), req.user.id);
  db.prepare('INSERT INTO activity_logs (user_id, action, entity, details) VALUES (?,?,?,?)').run(req.user.id, 'CHANGE_PASSWORD', 'auth', 'Password changed');
  res.json({ success: true, data: { message: 'Password berhasil diubah.' } });
});

router.put('/profile', authenticate, (req, res) => {
  const { name, phone, photo } = req.body || {};
  if (name) db.prepare('UPDATE users SET name = ?, updated_at = datetime(\'now\') WHERE id = ?').run(name, req.user.id);
  if (typeof phone === 'string') db.prepare('UPDATE users SET phone = ?, updated_at = datetime(\'now\') WHERE id = ?').run(phone, req.user.id);
  if (photo) db.prepare('UPDATE users SET photo = ?, updated_at = datetime(\'now\') WHERE id = ?').run(photo, req.user.id);
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  res.json({ success: true, data: { id: user.id, name: user.name, email: user.email, role: user.role, photo: user.photo, phone: user.phone } });
});

router.get('/notifications', authenticate, (req, res) => {
  const rows = db.prepare('SELECT * FROM notifications WHERE recipient_id = ? ORDER BY id DESC LIMIT 50').all(req.user.id);
  const unread = db.prepare('SELECT COUNT(*) AS c FROM notifications WHERE recipient_id = ? AND is_read = 0').get(req.user.id).c;
  res.json({ success: true, data: { notifications: rows, unread } });
});

router.post('/notifications/read', authenticate, (req, res) => {
  const { id } = req.body || {};
  if (id) db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND recipient_id = ?').run(id, req.user.id);
  else db.prepare('UPDATE notifications SET is_read = 1 WHERE recipient_id = ?').run(req.user.id);
  res.json({ success: true, data: { message: 'OK' } });
});

router.post('/notify', (req, res) => { res.status(400).json({ success: false, error: 'Use internal helper' }); });

module.exports = router;

function makeNotification(recipientId, type, title, message, relatedId = null) {
  db.prepare('INSERT INTO notifications (recipient_id, type, title, message, related_id) VALUES (?,?,?,?,?)').run(recipientId, type, title, message, relatedId);
}
module.exports.makeNotification = makeNotification;

function notifyClass(classId, type, title, message, relatedId = null) {
  const students = db.prepare('SELECT student_id FROM student_classes WHERE class_id = ?').all(classId);
  const tx = db.prepare('INSERT INTO notifications (recipient_id, type, title, message, related_id) VALUES (?,?,?,?,?)');
  for (const s of students) tx.run(s.student_id, type, title, message, relatedId);
}
module.exports.notifyClass = notifyClass;
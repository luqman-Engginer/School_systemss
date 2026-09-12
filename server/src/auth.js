const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'schoolhub_demo_secret_change_in_production';
const db = require('./db');

function signToken(user) {
  return jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
}

function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ success: false, error: 'Belum login. Silakan login terlebih dahulu.' });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(payload.id);
    if (!user || user.status !== 'ACTIVE') {
      return res.status(401).json({ success: false, error: 'Akun tidak aktif atau tidak ditemukan.' });
    }
    req.user = { id: user.id, name: user.name, email: user.email, role: user.role, photo: user.photo, phone: user.phone };
    next();
  } catch (e) {
    return res.status(401).json({ success: false, error: 'Sesi berakhir. Silakan login kembali.' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Anda tidak memiliki akses ke fitur ini.' });
    }
    next();
  };
}

function getTeacherId(userId) {
  return db.prepare('SELECT id FROM teachers WHERE user_id = ?').get(userId)?.id || null;
}

function getStudentProfile(userId) {
  return db.prepare('SELECT s.id, s.nis, s.gender, s.birth_date, u.name, u.photo FROM students s JOIN users u ON u.id = s.user_id WHERE s.user_id = ?').get(userId) || null;
}

module.exports = { signToken, authenticate, requireRole, JWT_SECRET, db, getTeacherId, getStudentProfile };
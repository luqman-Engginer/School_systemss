const express = require('express');
const db = require('../db');

const router = express.Router();

const published = (table) => db.prepare(`SELECT * FROM ${table} WHERE status = 'PUBLISHED' ORDER BY id DESC`).all();

router.get('/settings', (req, res) => {
  const s = db.prepare('SELECT * FROM school_settings WHERE id = 1').get();
  res.json({ success: true, data: s });
});

router.get('/home', (req, res) => {
  const settings = db.prepare('SELECT * FROM school_settings WHERE id = 1').get();
  const news = published('news').slice(0, 3);
  const events = published('events').slice(0, 3);
  const achievements = published('achievements').slice(0, 4);
  const gallery = published('gallery').slice(0, 6);
  const programs = db.prepare("SELECT * FROM programs WHERE status = 'PUBLISHED'").all();
  const teachers = db.prepare('SELECT u.name, t.position, t.subject, t.bio, u.photo FROM teachers t JOIN users u ON u.id = t.user_id WHERE t.public_visible = 1 AND u.status = \'ACTIVE\' LIMIT 4').all();
  const faqs = db.prepare('SELECT * FROM faqs WHERE active = 1 ORDER BY sort_order LIMIT 4').all();
  const studentCount = db.prepare("SELECT COUNT(*) AS c FROM users WHERE role = 'STUDENT' AND status = 'ACTIVE'").get().c;
  const teacherCount = db.prepare("SELECT COUNT(*) AS c FROM users u JOIN teachers t ON t.user_id = u.id WHERE t.public_visible = 1 AND u.status = 'ACTIVE'").get().c;
  const achievementCount = db.prepare("SELECT COUNT(*) AS c FROM achievements WHERE status = 'PUBLISHED'").get().c;
  res.json({ success: true, data: { settings, news, events, achievements, gallery, programs, teachers, faqs, studentCount, teacherCount, achievementCount } });
});

router.get('/about', (req, res) => {
  const s = db.prepare('SELECT school_name, short_name, slogan, description, history, vision, mission, school_values, facilities, structure, logo FROM school_settings WHERE id = 1').get();
  res.json({ success: true, data: s });
});

router.get('/programs', (req, res) => {
  const programs = db.prepare("SELECT * FROM programs WHERE status = 'PUBLISHED'").all();
  res.json({ success: true, data: programs });
});

router.get('/news', (req, res) => {
  const rows = published('news');
  res.json({ success: true, data: rows });
});

router.get('/news/:id', (req, res) => {
  const row = db.prepare("SELECT n.*, u.name AS author FROM news n LEFT JOIN users u ON u.id = n.author_id WHERE n.id = ? AND n.status = 'PUBLISHED'").get(req.params.id);
  if (!row) return res.status(404).json({ success: false, error: 'Berita tidak ditemukan.' });
  const related = db.prepare("SELECT id, title, thumbnail FROM news WHERE status = 'PUBLISHED' AND id != ? ORDER BY id DESC LIMIT 3").all(req.params.id);
  res.json({ success: true, data: { ...row, related } });
});

router.get('/events', (req, res) => {
  const rows = published('events');
  res.json({ success: true, data: rows });
});

router.get('/events/:id', (req, res) => {
  const row = db.prepare("SELECT * FROM events WHERE id = ? AND status = 'PUBLISHED'").get(req.params.id);
  if (!row) return res.status(404).json({ success: false, error: 'Event tidak ditemukan.' });
  res.json({ success: true, data: row });
});

router.get('/gallery', (req, res) => {
  const rows = published('gallery');
  res.json({ success: true, data: rows });
});

router.get('/achievements', (req, res) => {
  const rows = published('achievements');
  res.json({ success: true, data: rows });
});

router.get('/teachers', (req, res) => {
  const rows = db.prepare('SELECT u.name, t.position, t.subject, t.bio, u.photo FROM teachers t JOIN users u ON u.id = t.user_id WHERE t.public_visible = 1 AND u.status = \'ACTIVE\' ORDER BY u.name').all();
  res.json({ success: true, data: rows });
});

router.get('/faqs', (req, res) => {
  const rows = db.prepare('SELECT * FROM faqs WHERE active = 1 ORDER BY sort_order').all();
  res.json({ success: true, data: rows });
});

router.get('/school-rules', (req, res) => {
  const rows = db.prepare("SELECT * FROM school_rules WHERE status = 'PUBLISHED' ORDER BY category").all();
  res.json({ success: true, data: rows });
});

router.get('/contact', (req, res) => {
  const s = db.prepare('SELECT phone, whatsapp, email, address, operating_hours, maps_url, latitude, longitude, instagram, facebook, youtube, tiktok, twitter FROM school_settings WHERE id = 1').get();
  res.json({ success: true, data: s });
});

module.exports = router;
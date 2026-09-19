const path = require('path');
const fs = require('fs');

let DatabaseSync;
try {
  ({ DatabaseSync } = require('node:sqlite'));
} catch (e) {
  throw new Error('Runtime tidak mendukung node:sqlite. Gunakan Node.js >= 22.5 (dengan --experimental-sqlite) atau Node.js >= 22.13 / 23+.');
}

const DB_PATH = process.env.SQLITE_PATH || path.join(__dirname, '..', 'data', 'schoolhub.db');
const DATA_DIR = path.dirname(DB_PATH);
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new DatabaseSync(DB_PATH);

db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA busy_timeout = 5000;');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('ADMIN','TEACHER','STUDENT','PARENT')),
  phone TEXT DEFAULT '',
  photo TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE','INACTIVE')),
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS teachers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  position TEXT DEFAULT '',
  subject TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  public_visible INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  nis TEXT DEFAULT '',
  gender TEXT DEFAULT '',
  birth_date TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS parents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  occupation TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS parent_student (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  parent_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  relation TEXT DEFAULT 'WALI',
  UNIQUE(parent_id, student_id)
);

CREATE TABLE IF NOT EXISTS school_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  school_name TEXT DEFAULT '',
  short_name TEXT DEFAULT '',
  slogan TEXT DEFAULT '',
  description TEXT DEFAULT '',
  history TEXT DEFAULT '',
  vision TEXT DEFAULT '',
  mission TEXT DEFAULT '',
  school_values TEXT DEFAULT '',
  facilities TEXT DEFAULT '',
  structure TEXT DEFAULT '',
  logo TEXT DEFAULT '',
  favicon TEXT DEFAULT '',
  hero_image TEXT DEFAULT '',
  banner TEXT DEFAULT '',
  primary_color TEXT DEFAULT '#4f46e5',
  secondary_color TEXT DEFAULT '#0ea5e9',
  website_name TEXT DEFAULT 'SchoolHub',
  phone TEXT DEFAULT '',
  whatsapp TEXT DEFAULT '',
  email TEXT DEFAULT '',
  address TEXT DEFAULT '',
  operating_hours TEXT DEFAULT '',
  maps_url TEXT DEFAULT '',
  latitude TEXT DEFAULT '',
  longitude TEXT DEFAULT '',
  instagram TEXT DEFAULT '',
  facebook TEXT DEFAULT '',
  youtube TEXT DEFAULT '',
  tiktok TEXT DEFAULT '',
  twitter TEXT DEFAULT '',
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS academic_years (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  start_date TEXT DEFAULT '',
  end_date TEXT DEFAULT '',
  is_active INTEGER DEFAULT 0,
  status TEXT DEFAULT 'ACTIVE'
);

CREATE TABLE IF NOT EXISTS programs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  code TEXT DEFAULT '',
  description TEXT DEFAULT '',
  status TEXT DEFAULT 'PUBLISHED'
);

CREATE TABLE IF NOT EXISTS classes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  academic_year_id INTEGER REFERENCES academic_years(id),
  program_id INTEGER REFERENCES programs(id),
  grade TEXT DEFAULT 'X',
  homeroom_teacher_id INTEGER REFERENCES teachers(id),
  status TEXT DEFAULT 'ACTIVE'
);

CREATE TABLE IF NOT EXISTS subjects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  code TEXT DEFAULT '',
  description TEXT DEFAULT '',
  teacher_id INTEGER REFERENCES teachers(id),
  class_id INTEGER REFERENCES classes(id),
  status TEXT DEFAULT 'ACTIVE'
);

CREATE TABLE IF NOT EXISTS student_classes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  academic_year_id INTEGER REFERENCES academic_years(id),
  status TEXT DEFAULT 'ACTIVE'
);

CREATE TABLE IF NOT EXISTS schedules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  teacher_id INTEGER REFERENCES teachers(id),
  day INTEGER NOT NULL CHECK(day BETWEEN 0 AND 6),
  start_time TEXT DEFAULT '07:00',
  end_time TEXT DEFAULT '08:40',
  room TEXT DEFAULT '',
  status TEXT DEFAULT 'ACTIVE'
);

CREATE TABLE IF NOT EXISTS news (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT DEFAULT '',
  content TEXT DEFAULT '',
  thumbnail TEXT DEFAULT '',
  category TEXT DEFAULT '',
  author_id INTEGER REFERENCES users(id),
  status TEXT DEFAULT 'DRAFT' CHECK(status IN ('DRAFT','PUBLISHED','ARCHIVED')),
  created_at TEXT DEFAULT (datetime('now')),
  published_at TEXT DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  date TEXT DEFAULT '',
  start_time TEXT DEFAULT '',
  end_time TEXT DEFAULT '',
  location TEXT DEFAULT '',
  poster TEXT DEFAULT '',
  status TEXT DEFAULT 'DRAFT' CHECK(status IN ('DRAFT','PUBLISHED','ARCHIVED'))
);

CREATE TABLE IF NOT EXISTS gallery (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  image TEXT DEFAULT '',
  title TEXT DEFAULT '',
  description TEXT DEFAULT '',
  category TEXT DEFAULT 'Kegiatan Sekolah',
  status TEXT DEFAULT 'DRAFT' CHECK(status IN ('DRAFT','PUBLISHED','ARCHIVED')),
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS achievements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  category TEXT DEFAULT '',
  student_team TEXT DEFAULT '',
  competition TEXT DEFAULT '',
  rank TEXT DEFAULT '',
  year TEXT DEFAULT '',
  description TEXT DEFAULT '',
  documentation TEXT DEFAULT '',
  status TEXT DEFAULT 'DRAFT' CHECK(status IN ('DRAFT','PUBLISHED','ARCHIVED'))
);

CREATE TABLE IF NOT EXISTS faqs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question TEXT NOT NULL,
  answer TEXT DEFAULT '',
  category TEXT DEFAULT 'Umum',
  sort_order INTEGER DEFAULT 0,
  active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS announcements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  target_role TEXT DEFAULT 'ALL',
  author_id INTEGER REFERENCES users(id),
  status TEXT DEFAULT 'PUBLISHED',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS school_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'Ketertiban',
  content TEXT DEFAULT '',
  status TEXT DEFAULT 'PUBLISHED',
  version TEXT DEFAULT '1.0',
  effective_date TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS learning_materials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  file_url TEXT DEFAULT '',
  video_url TEXT DEFAULT '',
  external_link TEXT DEFAULT '',
  subject_id INTEGER REFERENCES subjects(id),
  class_id INTEGER REFERENCES classes(id),
  teacher_id INTEGER REFERENCES teachers(id),
  meeting INTEGER DEFAULT 1,
  is_extra INTEGER DEFAULT 0,
  status TEXT DEFAULT 'PUBLISHED' CHECK(status IN ('DRAFT','PUBLISHED')),
  created_at TEXT DEFAULT (datetime('now')),
  published_at TEXT DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS learning_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  material_id INTEGER NOT NULL REFERENCES learning_materials(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'NOT_STARTED' CHECK(status IN ('NOT_STARTED','IN_PROGRESS','COMPLETED','MISSED')),
  started_at TEXT DEFAULT NULL,
  completed_at TEXT DEFAULT NULL,
  review_count INTEGER DEFAULT 0,
  last_reviewed TEXT DEFAULT NULL,
  UNIQUE(student_id, material_id)
);

CREATE TABLE IF NOT EXISTS assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  instructions TEXT DEFAULT '',
  attachment TEXT DEFAULT '',
  subject_id INTEGER REFERENCES subjects(id),
  class_id INTEGER REFERENCES classes(id),
  teacher_id INTEGER REFERENCES teachers(id),
  deadline TEXT DEFAULT '',
  max_score INTEGER DEFAULT 100,
  status TEXT DEFAULT 'PUBLISHED' CHECK(status IN ('DRAFT','PUBLISHED')),
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS assignment_submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  assignment_id INTEGER NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT DEFAULT '',
  attachment TEXT DEFAULT '',
  submitted_at TEXT DEFAULT (datetime('now')),
  status TEXT DEFAULT 'NOT_STARTED' CHECK(status IN ('NOT_STARTED','IN_PROGRESS','SUBMITTED','LATE','GRADED')),
  grade REAL DEFAULT NULL,
  max_score INTEGER DEFAULT 100,
  feedback TEXT DEFAULT '',
  UNIQUE(assignment_id, student_id)
);

CREATE TABLE IF NOT EXISTS quizzes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  subject_id INTEGER REFERENCES subjects(id),
  class_id INTEGER REFERENCES classes(id),
  teacher_id INTEGER REFERENCES teachers(id),
  time_limit INTEGER DEFAULT 15,
  passing_score INTEGER DEFAULT 70,
  status TEXT DEFAULT 'PUBLISHED'
);

CREATE TABLE IF NOT EXISTS questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quiz_id INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  type TEXT DEFAULT 'MULTIPLE' CHECK(type IN ('MULTIPLE','TRUE_FALSE','SHORT')),
  options TEXT DEFAULT '[]',
  correct_answer TEXT DEFAULT '',
  score INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quiz_id INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  started_at TEXT DEFAULT (datetime('now')),
  completed_at TEXT DEFAULT NULL,
  score REAL DEFAULT NULL,
  status TEXT DEFAULT 'IN_PROGRESS' CHECK(status IN ('IN_PROGRESS','COMPLETED'))
);

CREATE TABLE IF NOT EXISTS discussion_rooms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  topic TEXT DEFAULT '',
  description TEXT DEFAULT '',
  creator_id INTEGER REFERENCES users(id),
  type TEXT DEFAULT 'CLASS_DISCUSSION' CHECK(type IN ('TEACHER_STUDENT','TEACHER_PARENT','CLASS_DISCUSSION','SCHOOL_DISCUSSION')),
  start_date TEXT DEFAULT '',
  end_date TEXT DEFAULT '',
  status TEXT DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE','CLOSED'))
);

CREATE TABLE IF NOT EXISTS discussion_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id INTEGER NOT NULL REFERENCES discussion_rooms(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TEXT DEFAULT (datetime('now')),
  UNIQUE(room_id, user_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id INTEGER NOT NULL REFERENCES discussion_rooms(id) ON DELETE CASCADE,
  sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT DEFAULT '',
  attachment TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now')),
  read_at TEXT DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS meetings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  teacher_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic TEXT DEFAULT '',
  date TEXT DEFAULT '',
  start_time TEXT DEFAULT '',
  end_time TEXT DEFAULT '',
  location TEXT DEFAULT '',
  meeting_type TEXT DEFAULT 'OFFLINE' CHECK(meeting_type IN ('OFFLINE','ONLINE')),
  status TEXT DEFAULT 'REQUESTED' CHECK(status IN ('REQUESTED','SCHEDULED','COMPLETED','CANCELLED')),
  notes TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS aspirations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  category TEXT DEFAULT 'Saran',
  anonymous INTEGER DEFAULT 0,
  status TEXT DEFAULT 'SUBMITTED' CHECK(status IN ('SUBMITTED','UNDER_REVIEW','IN_PROGRESS','RESOLVED','REJECTED')),
  admin_response TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS attendance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  class_id INTEGER REFERENCES classes(id),
  schedule_id INTEGER REFERENCES schedules(id),
  teacher_id INTEGER REFERENCES users(id),
  date TEXT NOT NULL,
  status TEXT DEFAULT 'PRESENT' CHECK(status IN ('PRESENT','LATE','EXCUSED','SICK','ABSENT')),
  check_in_time TEXT DEFAULT '',
  note TEXT DEFAULT '',
  UNIQUE(student_id, date, schedule_id)
);

CREATE TABLE IF NOT EXISTS discipline_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category TEXT DEFAULT 'Kedisiplinan',
  description TEXT DEFAULT '',
  point INTEGER DEFAULT 0,
  date TEXT DEFAULT (date('now')),
  reporter_id INTEGER REFERENCES users(id),
  status TEXT DEFAULT 'OPEN' CHECK(status IN ('OPEN','RESOLVED')),
  notes TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recipient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT DEFAULT 'SYSTEM',
  title TEXT NOT NULL,
  message TEXT DEFAULT '',
  related_id INTEGER DEFAULT NULL,
  is_read INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  action TEXT NOT NULL,
  entity TEXT DEFAULT '',
  details TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS feedbacks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  teacher_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT DEFAULT '',
  subject_id INTEGER REFERENCES subjects(id),
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_student_classes_student ON student_classes(student_id);
CREATE INDEX IF NOT EXISTS idx_learning_progress_student ON learning_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student ON assignment_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_aspirations_student ON aspirations(student_id);
CREATE INDEX IF NOT EXISTS idx_messages_room ON messages(room_id);
CREATE INDEX IF NOT EXISTS idx_news_status ON news(status);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
`);

module.exports = db;
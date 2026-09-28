const mysql = require('mysql2/promise');

<<<<<<< HEAD
let DatabaseSync;
try {
  ({ DatabaseSync } = require('mysql2'));
} catch (e) {
  throw new Error('Runtime tidak mendukung node:sqlite. Gunakan Node.js >= 22.5 (dengan --experimental-sqlite) atau Node.js >= 22.13 / 23+.');
=======
// Semua waktu disimpan sebagai UTC. SQLite lama memakai datetime('now') yang
// mengembalikan UTC, jadi memakai CURRENT_TIMESTAMP (waktu lokal server) akan
// menggeser seluruh data 8 jam di zona WIB. Karena itu semua timestamp memakai
// UTC_TIMESTAMP() dan driver dikonfigurasi agar tidak mengonversi ulang.
const config = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'schoolhub',
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_POOL_SIZE) || 10,
  queueLimit: 0,
  charset: 'utf8mb4_unicode_ci',
  timezone: 'Z',
  dateStrings: true,
  supportBigNumbers: true,
  multipleStatements: false,
};

const pool = mysql.createPool(config);

// API ini meniru prepare/get/all/run dari node:sqlite supaya pemanggil tidak
// perlu diubah selain menambahkan await. Bentuk parameternya sama persis (?).
//
// node:sqlite diam-diam mengubah undefined menjadi NULL, sedangkan mysql2
// menolaknya. Tanpa normalisasi ini, satu field yang nilainya undefined akan
// menggagalkan seluruh query. Perilaku lama dipertahankan di sini.
const normalize = (params) =>
  params.map((p) => {
    if (p === undefined) return null;
    if (typeof p === 'boolean') return p ? 1 : 0;
    return p;
  });

class Statement {
  constructor(sql) {
    this.sql = sql;
  }

  async get(...params) {
    const [rows] = await pool.execute(this.sql, normalize(params));
    return rows[0];
  }

  async all(...params) {
    const [rows] = await pool.execute(this.sql, normalize(params));
    return rows;
  }

  async run(...params) {
    const [result] = await pool.execute(this.sql, normalize(params));
    return {
      changes: result.affectedRows,
      lastInsertRowid: result.insertId || 0,
    };
  }
>>>>>>> d6b7c37f6931619800a082dd6119ce4b60cac010
}

const prepare = (sql) => new Statement(sql);

const TABLES = [
  `CREATE TABLE IF NOT EXISTS users (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(190) NOT NULL,
    email VARCHAR(190) NOT NULL,
    password_hash VARCHAR(190) NOT NULL,
    role VARCHAR(20) NOT NULL,
    phone VARCHAR(40) NOT NULL DEFAULT '',
    photo TEXT NOT NULL DEFAULT '',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME NOT NULL DEFAULT (UTC_TIMESTAMP()),
    updated_at DATETIME NOT NULL DEFAULT (UTC_TIMESTAMP()),
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_email (email),
    KEY idx_users_role (role),
    CONSTRAINT ck_users_role CHECK (role IN ('ADMIN','TEACHER','STUDENT','PARENT')),
    CONSTRAINT ck_users_status CHECK (status IN ('ACTIVE','INACTIVE'))
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS teachers (
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    position VARCHAR(190) NOT NULL DEFAULT '',
    subject VARCHAR(190) NOT NULL DEFAULT '',
    bio TEXT NOT NULL DEFAULT '',
    public_visible TINYINT(1) NOT NULL DEFAULT 1,
    PRIMARY KEY (id),
    UNIQUE KEY uq_teachers_user (user_id),
    CONSTRAINT fk_teachers_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS students (
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    nis VARCHAR(60) NOT NULL DEFAULT '',
    gender VARCHAR(20) NOT NULL DEFAULT '',
    birth_date VARCHAR(20) NOT NULL DEFAULT '',
    PRIMARY KEY (id),
    UNIQUE KEY uq_students_user (user_id),
    CONSTRAINT fk_students_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS parents (
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    occupation VARCHAR(190) NOT NULL DEFAULT '',
    PRIMARY KEY (id),
    UNIQUE KEY uq_parents_user (user_id),
    CONSTRAINT fk_parents_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS parent_student (
    id INT NOT NULL AUTO_INCREMENT,
    parent_id INT NOT NULL,
    student_id INT NOT NULL,
    relation VARCHAR(40) NOT NULL DEFAULT 'WALI',
    PRIMARY KEY (id),
    UNIQUE KEY uq_parent_student (parent_id, student_id),
    CONSTRAINT fk_ps_parent FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_ps_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS school_settings (
    id INT NOT NULL DEFAULT 1,
    school_name VARCHAR(190) NOT NULL DEFAULT '',
    short_name VARCHAR(190) NOT NULL DEFAULT '',
    slogan VARCHAR(255) NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    history TEXT NOT NULL DEFAULT '',
    vision TEXT NOT NULL DEFAULT '',
    mission TEXT NOT NULL DEFAULT '',
    school_values TEXT NOT NULL DEFAULT '',
    facilities TEXT NOT NULL DEFAULT '',
    structure TEXT NOT NULL DEFAULT '',
    logo TEXT NOT NULL DEFAULT '',
    favicon TEXT NOT NULL DEFAULT '',
    hero_image TEXT NOT NULL DEFAULT '',
    banner TEXT NOT NULL DEFAULT '',
    primary_color VARCHAR(20) NOT NULL DEFAULT '#4f46e5',
    secondary_color VARCHAR(20) NOT NULL DEFAULT '#0ea5e9',
    website_name VARCHAR(190) NOT NULL DEFAULT 'SchoolHub',
    phone VARCHAR(40) NOT NULL DEFAULT '',
    whatsapp VARCHAR(40) NOT NULL DEFAULT '',
    email VARCHAR(190) NOT NULL DEFAULT '',
    address TEXT NOT NULL DEFAULT '',
    operating_hours VARCHAR(190) NOT NULL DEFAULT '',
    maps_url TEXT NOT NULL DEFAULT '',
    latitude VARCHAR(60) NOT NULL DEFAULT '',
    longitude VARCHAR(60) NOT NULL DEFAULT '',
    instagram TEXT NOT NULL DEFAULT '',
    facebook TEXT NOT NULL DEFAULT '',
    youtube TEXT NOT NULL DEFAULT '',
    tiktok TEXT NOT NULL DEFAULT '',
    twitter TEXT NOT NULL DEFAULT '',
    updated_at DATETIME NOT NULL DEFAULT (UTC_TIMESTAMP()),
    PRIMARY KEY (id),
    CONSTRAINT ck_settings_singleton CHECK (id = 1)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS academic_years (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(190) NOT NULL,
    start_date VARCHAR(20) NOT NULL DEFAULT '',
    end_date VARCHAR(20) NOT NULL DEFAULT '',
    is_active TINYINT(1) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    PRIMARY KEY (id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS programs (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(190) NOT NULL,
    code VARCHAR(60) NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    status VARCHAR(20) NOT NULL DEFAULT 'PUBLISHED',
    PRIMARY KEY (id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS classes (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(190) NOT NULL,
    academic_year_id INT DEFAULT NULL,
    program_id INT DEFAULT NULL,
    grade VARCHAR(20) NOT NULL DEFAULT 'X',
    homeroom_teacher_id INT DEFAULT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    PRIMARY KEY (id),
    CONSTRAINT fk_classes_year FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE SET NULL,
    CONSTRAINT fk_classes_program FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE SET NULL,
    CONSTRAINT fk_classes_homeroom FOREIGN KEY (homeroom_teacher_id) REFERENCES teachers(id) ON DELETE SET NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS subjects (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(190) NOT NULL,
    code VARCHAR(60) NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    teacher_id INT DEFAULT NULL,
    class_id INT DEFAULT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    PRIMARY KEY (id),
    CONSTRAINT fk_subjects_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL,
    CONSTRAINT fk_subjects_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS student_classes (
    id INT NOT NULL AUTO_INCREMENT,
    student_id INT NOT NULL,
    class_id INT NOT NULL,
    academic_year_id INT DEFAULT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    PRIMARY KEY (id),
    KEY idx_student_classes_student (student_id),
    CONSTRAINT fk_sc_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_sc_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    CONSTRAINT fk_sc_year FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE SET NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS schedules (
    id INT NOT NULL AUTO_INCREMENT,
    class_id INT NOT NULL,
    subject_id INT NOT NULL,
    teacher_id INT DEFAULT NULL,
    day INT NOT NULL,
    start_time VARCHAR(10) NOT NULL DEFAULT '07:00',
    end_time VARCHAR(10) NOT NULL DEFAULT '08:40',
    room VARCHAR(190) NOT NULL DEFAULT '',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    PRIMARY KEY (id),
    KEY idx_schedules_class (class_id),
    CONSTRAINT ck_schedules_day CHECK (day BETWEEN 0 AND 6),
    CONSTRAINT fk_schedules_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    CONSTRAINT fk_schedules_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    CONSTRAINT fk_schedules_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS news (
    id INT NOT NULL AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL DEFAULT '',
    content TEXT NOT NULL DEFAULT '',
    thumbnail TEXT NOT NULL DEFAULT '',
    category VARCHAR(190) NOT NULL DEFAULT '',
    author_id INT DEFAULT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    created_at DATETIME NOT NULL DEFAULT (UTC_TIMESTAMP()),
    published_at DATETIME DEFAULT NULL,
    PRIMARY KEY (id),
    KEY idx_news_status (status),
    CONSTRAINT ck_news_status CHECK (status IN ('DRAFT','PUBLISHED','ARCHIVED')),
    CONSTRAINT fk_news_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS events (
    id INT NOT NULL AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    date VARCHAR(20) NOT NULL DEFAULT '',
    start_time VARCHAR(10) NOT NULL DEFAULT '',
    end_time VARCHAR(10) NOT NULL DEFAULT '',
    location VARCHAR(255) NOT NULL DEFAULT '',
    poster TEXT NOT NULL DEFAULT '',
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    PRIMARY KEY (id),
    KEY idx_events_status (status),
    CONSTRAINT ck_events_status CHECK (status IN ('DRAFT','PUBLISHED','ARCHIVED'))
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS gallery (
    id INT NOT NULL AUTO_INCREMENT,
    image TEXT NOT NULL DEFAULT '',
    title VARCHAR(255) NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    category VARCHAR(190) NOT NULL DEFAULT 'Kegiatan Sekolah',
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    created_at DATETIME NOT NULL DEFAULT (UTC_TIMESTAMP()),
    PRIMARY KEY (id),
    CONSTRAINT ck_gallery_status CHECK (status IN ('DRAFT','PUBLISHED','ARCHIVED'))
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS achievements (
    id INT NOT NULL AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(190) NOT NULL DEFAULT '',
    student_team VARCHAR(255) NOT NULL DEFAULT '',
    competition VARCHAR(255) NOT NULL DEFAULT '',
    rank VARCHAR(60) NOT NULL DEFAULT '',
    year VARCHAR(20) NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    documentation TEXT NOT NULL DEFAULT '',
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    PRIMARY KEY (id),
    CONSTRAINT ck_achievements_status CHECK (status IN ('DRAFT','PUBLISHED','ARCHIVED'))
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS faqs (
    id INT NOT NULL AUTO_INCREMENT,
    question VARCHAR(255) NOT NULL,
    answer TEXT NOT NULL DEFAULT '',
    category VARCHAR(190) NOT NULL DEFAULT 'Umum',
    sort_order INT NOT NULL DEFAULT 0,
    active TINYINT(1) NOT NULL DEFAULT 1,
    PRIMARY KEY (id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS announcements (
    id INT NOT NULL AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    target_role VARCHAR(40) NOT NULL DEFAULT 'ALL',
    author_id INT DEFAULT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PUBLISHED',
    created_at DATETIME NOT NULL DEFAULT (UTC_TIMESTAMP()),
    PRIMARY KEY (id),
    CONSTRAINT fk_announcements_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS school_rules (
    id INT NOT NULL AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(190) NOT NULL DEFAULT 'Ketertiban',
    content TEXT NOT NULL DEFAULT '',
    status VARCHAR(20) NOT NULL DEFAULT 'PUBLISHED',
    version VARCHAR(20) NOT NULL DEFAULT '1.0',
    effective_date VARCHAR(20) NOT NULL DEFAULT '',
    PRIMARY KEY (id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS learning_materials (
    id INT NOT NULL AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    file_url TEXT NOT NULL DEFAULT '',
    video_url TEXT NOT NULL DEFAULT '',
    external_link TEXT NOT NULL DEFAULT '',
    subject_id INT DEFAULT NULL,
    class_id INT DEFAULT NULL,
    teacher_id INT DEFAULT NULL,
    meeting INT NOT NULL DEFAULT 1,
    is_extra TINYINT(1) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'PUBLISHED',
    created_at DATETIME NOT NULL DEFAULT (UTC_TIMESTAMP()),
    published_at DATETIME DEFAULT NULL,
    PRIMARY KEY (id),
    KEY idx_materials_class (class_id),
    CONSTRAINT ck_materials_status CHECK (status IN ('DRAFT','PUBLISHED')),
    CONSTRAINT fk_materials_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL,
    CONSTRAINT fk_materials_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL,
    CONSTRAINT fk_materials_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS learning_progress (
    id INT NOT NULL AUTO_INCREMENT,
    student_id INT NOT NULL,
    material_id INT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'NOT_STARTED',
    started_at DATETIME DEFAULT NULL,
    completed_at DATETIME DEFAULT NULL,
    review_count INT NOT NULL DEFAULT 0,
    last_reviewed DATETIME DEFAULT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_progress (student_id, material_id),
    KEY idx_learning_progress_student (student_id),
    CONSTRAINT ck_progress_status CHECK (status IN ('NOT_STARTED','IN_PROGRESS','COMPLETED','MISSED')),
    CONSTRAINT fk_progress_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_progress_material FOREIGN KEY (material_id) REFERENCES learning_materials(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS assignments (
    id INT NOT NULL AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    instructions TEXT NOT NULL DEFAULT '',
    attachment TEXT NOT NULL DEFAULT '',
    subject_id INT DEFAULT NULL,
    class_id INT DEFAULT NULL,
    teacher_id INT DEFAULT NULL,
    deadline VARCHAR(20) NOT NULL DEFAULT '',
    max_score INT NOT NULL DEFAULT 100,
    status VARCHAR(20) NOT NULL DEFAULT 'PUBLISHED',
    created_at DATETIME NOT NULL DEFAULT (UTC_TIMESTAMP()),
    PRIMARY KEY (id),
    KEY idx_assignments_class (class_id),
    CONSTRAINT ck_assignments_status CHECK (status IN ('DRAFT','PUBLISHED')),
    CONSTRAINT fk_assignments_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL,
    CONSTRAINT fk_assignments_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL,
    CONSTRAINT fk_assignments_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS assignment_submissions (
    id INT NOT NULL AUTO_INCREMENT,
    assignment_id INT NOT NULL,
    student_id INT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    attachment TEXT NOT NULL DEFAULT '',
    submitted_at DATETIME DEFAULT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'NOT_STARTED',
    grade DOUBLE DEFAULT NULL,
    max_score INT NOT NULL DEFAULT 100,
    feedback TEXT NOT NULL DEFAULT '',
    PRIMARY KEY (id),
    UNIQUE KEY uq_submission (assignment_id, student_id),
    KEY idx_assignment_submissions_student (student_id),
    CONSTRAINT ck_submission_status CHECK (status IN ('NOT_STARTED','IN_PROGRESS','SUBMITTED','LATE','GRADED')),
    CONSTRAINT fk_submissions_assignment FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    CONSTRAINT fk_submissions_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS quizzes (
    id INT NOT NULL AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    subject_id INT DEFAULT NULL,
    class_id INT DEFAULT NULL,
    teacher_id INT DEFAULT NULL,
    time_limit INT NOT NULL DEFAULT 15,
    passing_score INT NOT NULL DEFAULT 70,
    status VARCHAR(20) NOT NULL DEFAULT 'PUBLISHED',
    PRIMARY KEY (id),
    KEY idx_quizzes_class (class_id),
    CONSTRAINT fk_quizzes_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL,
    CONSTRAINT fk_quizzes_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL,
    CONSTRAINT fk_quizzes_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS questions (
    id INT NOT NULL AUTO_INCREMENT,
    quiz_id INT NOT NULL,
    question TEXT NOT NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'MULTIPLE',
    options TEXT NOT NULL DEFAULT '[]',
    correct_answer TEXT NOT NULL DEFAULT '',
    score INT NOT NULL DEFAULT 1,
    PRIMARY KEY (id),
    KEY idx_questions_quiz (quiz_id),
    CONSTRAINT ck_questions_type CHECK (type IN ('MULTIPLE','TRUE_FALSE','SHORT')),
    CONSTRAINT fk_questions_quiz FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS quiz_attempts (
    id INT NOT NULL AUTO_INCREMENT,
    quiz_id INT NOT NULL,
    student_id INT NOT NULL,
    started_at DATETIME NOT NULL DEFAULT (UTC_TIMESTAMP()),
    completed_at DATETIME DEFAULT NULL,
    score DOUBLE DEFAULT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS',
    PRIMARY KEY (id),
    KEY idx_quiz_attempts_student (student_id),
    CONSTRAINT ck_attempt_status CHECK (status IN ('IN_PROGRESS','COMPLETED')),
    CONSTRAINT fk_attempts_quiz FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    CONSTRAINT fk_attempts_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS discussion_rooms (
    id INT NOT NULL AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    topic VARCHAR(255) NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    creator_id INT DEFAULT NULL,
    type VARCHAR(40) NOT NULL DEFAULT 'CLASS_DISCUSSION',
    start_date VARCHAR(20) NOT NULL DEFAULT '',
    end_date VARCHAR(20) NOT NULL DEFAULT '',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    PRIMARY KEY (id),
    CONSTRAINT ck_rooms_type CHECK (type IN ('TEACHER_STUDENT','TEACHER_PARENT','CLASS_DISCUSSION','SCHOOL_DISCUSSION')),
    CONSTRAINT ck_rooms_status CHECK (status IN ('ACTIVE','CLOSED')),
    CONSTRAINT fk_rooms_creator FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE SET NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS discussion_members (
    id INT NOT NULL AUTO_INCREMENT,
    room_id INT NOT NULL,
    user_id INT NOT NULL,
    joined_at DATETIME NOT NULL DEFAULT (UTC_TIMESTAMP()),
    PRIMARY KEY (id),
    UNIQUE KEY uq_room_member (room_id, user_id),
    CONSTRAINT fk_members_room FOREIGN KEY (room_id) REFERENCES discussion_rooms(id) ON DELETE CASCADE,
    CONSTRAINT fk_members_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS messages (
    id INT NOT NULL AUTO_INCREMENT,
    room_id INT NOT NULL,
    sender_id INT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    attachment TEXT NOT NULL DEFAULT '',
    created_at DATETIME NOT NULL DEFAULT (UTC_TIMESTAMP()),
    read_at DATETIME DEFAULT NULL,
    PRIMARY KEY (id),
    KEY idx_messages_room (room_id),
    CONSTRAINT fk_messages_room FOREIGN KEY (room_id) REFERENCES discussion_rooms(id) ON DELETE CASCADE,
    CONSTRAINT fk_messages_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS meetings (
    id INT NOT NULL AUTO_INCREMENT,
    teacher_id INT NOT NULL,
    parent_id INT NOT NULL,
    student_id INT NOT NULL,
    topic VARCHAR(255) NOT NULL DEFAULT '',
    date VARCHAR(20) NOT NULL DEFAULT '',
    start_time VARCHAR(10) NOT NULL DEFAULT '',
    end_time VARCHAR(10) NOT NULL DEFAULT '',
    location VARCHAR(255) NOT NULL DEFAULT '',
    meeting_type VARCHAR(20) NOT NULL DEFAULT 'OFFLINE',
    status VARCHAR(20) NOT NULL DEFAULT 'REQUESTED',
    notes TEXT NOT NULL DEFAULT '',
    created_at DATETIME NOT NULL DEFAULT (UTC_TIMESTAMP()),
    PRIMARY KEY (id),
    KEY idx_meetings_parent (parent_id),
    KEY idx_meetings_student (student_id),
    CONSTRAINT ck_meetings_type CHECK (meeting_type IN ('OFFLINE','ONLINE')),
    CONSTRAINT ck_meetings_status CHECK (status IN ('REQUESTED','SCHEDULED','COMPLETED','CANCELLED')),
    CONSTRAINT fk_meetings_teacher FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_meetings_parent FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_meetings_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS aspirations (
    id INT NOT NULL AUTO_INCREMENT,
    student_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    category VARCHAR(190) NOT NULL DEFAULT 'Saran',
    anonymous TINYINT(1) NOT NULL DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'SUBMITTED',
    admin_response TEXT NOT NULL DEFAULT '',
    created_at DATETIME NOT NULL DEFAULT (UTC_TIMESTAMP()),
    updated_at DATETIME NOT NULL DEFAULT (UTC_TIMESTAMP()),
    PRIMARY KEY (id),
    KEY idx_aspirations_student (student_id),
    CONSTRAINT ck_aspirations_status CHECK (status IN ('SUBMITTED','UNDER_REVIEW','IN_PROGRESS','RESOLVED','REJECTED')),
    CONSTRAINT fk_aspirations_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS attendance (
    id INT NOT NULL AUTO_INCREMENT,
    student_id INT NOT NULL,
    class_id INT DEFAULT NULL,
    schedule_id INT DEFAULT NULL,
    teacher_id INT DEFAULT NULL,
    date VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PRESENT',
    check_in_time VARCHAR(10) NOT NULL DEFAULT '',
    note VARCHAR(255) NOT NULL DEFAULT '',
    PRIMARY KEY (id),
    UNIQUE KEY uq_attendance (student_id, date, schedule_id),
    KEY idx_attendance_student (student_id),
    CONSTRAINT ck_attendance_status CHECK (status IN ('PRESENT','LATE','EXCUSED','SICK','ABSENT')),
    CONSTRAINT fk_attendance_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_attendance_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL,
    CONSTRAINT fk_attendance_schedule FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE SET NULL,
    CONSTRAINT fk_attendance_teacher FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE SET NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS discipline_records (
    id INT NOT NULL AUTO_INCREMENT,
    student_id INT NOT NULL,
    category VARCHAR(190) NOT NULL DEFAULT 'Kedisiplinan',
    description TEXT NOT NULL DEFAULT '',
    point INT NOT NULL DEFAULT 0,
    date VARCHAR(20) NOT NULL DEFAULT (UTC_DATE()),
    reporter_id INT DEFAULT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    notes TEXT NOT NULL DEFAULT '',
    PRIMARY KEY (id),
    KEY idx_discipline_student (student_id),
    CONSTRAINT ck_discipline_status CHECK (status IN ('OPEN','RESOLVED')),
    CONSTRAINT fk_discipline_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_discipline_reporter FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE SET NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS notifications (
    id INT NOT NULL AUTO_INCREMENT,
    recipient_id INT NOT NULL,
    type VARCHAR(60) NOT NULL DEFAULT 'SYSTEM',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL DEFAULT '',
    related_id INT DEFAULT NULL,
    is_read TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT (UTC_TIMESTAMP()),
    PRIMARY KEY (id),
    KEY idx_notifications_recipient (recipient_id),
    CONSTRAINT fk_notifications_recipient FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS activity_logs (
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT DEFAULT NULL,
    action VARCHAR(190) NOT NULL,
    entity VARCHAR(190) NOT NULL DEFAULT '',
    details TEXT NOT NULL DEFAULT '',
    created_at DATETIME NOT NULL DEFAULT (UTC_TIMESTAMP()),
    PRIMARY KEY (id),
    KEY idx_activity_user (user_id),
    CONSTRAINT fk_activity_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS feedbacks (
    id INT NOT NULL AUTO_INCREMENT,
    teacher_id INT NOT NULL,
    student_id INT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    subject_id INT DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT (UTC_TIMESTAMP()),
    PRIMARY KEY (id),
    KEY idx_feedbacks_teacher (teacher_id),
    KEY idx_feedbacks_student (student_id),
    CONSTRAINT fk_feedbacks_teacher FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_feedbacks_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_feedbacks_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
];

// Menjalankan banyak statement sekaligus. Dipakai untuk setup awal (SCHEMA)
// dan migrasi. Keamanan: input bukan dari user, dan multipleStatements hanya
// diaktifkan pada koneksi ini lewat newPoolWithMode.
async function runStatements(statements) {
  const admin = mysql.createPool({ ...config, multipleStatements: true });
  try {
    for (const sql of statements) {
      await admin.query(sql);
    }
  } finally {
    await admin.end();
  }
}

const SCHEMA = TABLES;

async function init() {
  await runStatements(SCHEMA);
}

async function close() {
  await pool.end();
}

module.exports = { pool, prepare, runStatements, init, close, SCHEMA };

# PRODUCT REQUIREMENTS DOCUMENT (PRD)
# SchoolHub — Digital School Integrated Platform

| | |
|---|---|
| **Product Owner** | Luqman Hafidz |
| **Product Name** | SchoolHub |
| **Product Type** | Digital School Integrated Platform |
| **Platform** | Web Application / Responsive Web |
| **Target Devices** | Desktop, Tablet, Mobile |
| **Document Status** | Draft Final — Pre-Development |
| **Version** | 1.0 |
| **Primary Language** | Bahasa Indonesia |

---

## 1. Product Overview

### 1.1 Product Definition

SchoolHub adalah platform digital sekolah terpadu yang mengintegrasikan:

- Informasi sekolah
- Pembelajaran
- Materi
- Tugas
- Quiz
- Progress siswa
- Missed learning
- Jadwal
- Kehadiran
- Kedisiplinan
- Aspirasi
- Komunikasi
- Discussion Room
- Teacher–Parent Meeting
- Parent Monitoring
- Pengumuman
- Event
- Berita
- Gallery
- Prestasi
- School Rules
- Manajemen pengguna
- Manajemen akademik
- Content Management System

SchoolHub menggunakan satu sistem dengan empat role utama:

1. Admin
2. Guru
3. Murid
4. Wali Murid

Selain private platform, SchoolHub juga memiliki **Public Website** yang dapat diakses tanpa login.

---

## 2. Product Vision

> Membangun satu platform digital yang menghubungkan seluruh ekosistem sekolah dalam sistem yang terintegrasi, terstruktur, transparan, dan mudah digunakan.

SchoolHub bertujuan agar:

- Informasi sekolah tidak tersebar.
- Pembelajaran dapat diakses secara terstruktur.
- Siswa dapat mengejar materi yang terlewat.
- Guru dapat mengelola pembelajaran dan memonitor siswa.
- Wali murid dapat memantau perkembangan anak.
- Siswa memiliki ruang menyampaikan aspirasi.
- Komunikasi sekolah menjadi lebih terpusat.
- Data sekolah tersimpan secara persistent.
- Admin dapat mengelola konten tanpa mengubah source code.

---

## 3. Problem Statement

### 3.1 Komunikasi
Sekolah membutuhkan sistem komunikasi yang lebih terpusat antara:
- Guru dan murid
- Guru dan wali murid
- Admin dan pengguna
- Antar peserta discussion room

### 3.2 Pembelajaran
Siswa membutuhkan:
- Materi pembelajaran
- Tugas
- Review
- Materi tambahan
- Progress pembelajaran
- Akses terhadap materi yang terlewat

### 3.3 Monitoring
Guru dan wali murid membutuhkan informasi perkembangan siswa yang sesuai dengan kewenangan mereka.

### 3.4 Informasi Sekolah
Informasi sekolah membutuhkan satu pusat pengelolaan agar:
- Mudah diperbarui
- Konsisten
- Tidak membutuhkan perubahan kode

### 3.5 Aspirasi
Siswa membutuhkan media yang aman dan terstruktur untuk menyampaikan:
- Kritik
- Saran
- Pendapat
- Ide
- Keluhan
- Feedback

---

## 4. Target Users

### 4.1 Admin
Bertanggung jawab terhadap: Sistem, Pengguna, Akademik, Konten, Informasi sekolah, Monitoring, Data platform.

### 4.2 Guru
Bertanggung jawab terhadap: Pembelajaran, Materi, Tugas, Quiz, Kehadiran, Progress siswa, Discussion, Meeting, Feedback.

### 4.3 Murid
Menggunakan platform untuk: Belajar, Mengakses materi, Mengerjakan tugas, Mengikuti quiz, Review, Memantau progress, Berdiskusi, Mengirim aspirasi.

### 4.4 Wali Murid
Menggunakan platform untuk: Monitoring anak, Melihat progress, Melihat kehadiran, Melihat tugas, Melihat nilai, Melihat catatan guru, Mengikuti meeting/discussion.

### 4.5 Public Visitor
Pengunjung tanpa akun yang ingin memperoleh informasi tentang sekolah.

---

## 5. Platform Structure

```
SCHOOLHUB
│
├── PUBLIC WEBSITE
│
│   ├── Home
│   ├── About
│   ├── Programs
│   ├── News
│   ├── Events
│   ├── Achievements
│   ├── Gallery
│   ├── Teachers & Staff
│   ├── School Rules
│   ├── FAQ
│   └── Contact
│
└── PRIVATE PLATFORM
    │
    ├── Admin
    ├── Guru
    ├── Murid
    └── Wali Murid
```

---

## 6. Public Website Requirements

Public website tidak membutuhkan login.

### 6.1 Home

**Requirements** — Homepage harus menampilkan:
- Logo sekolah, Nama sekolah, Slogan, Hero section, Deskripsi singkat
- Keunggulan sekolah, Program pendidikan, Prestasi
- Berita terbaru, Event terdekat, Gallery, Guru/staff pilihan
- FAQ, Contact, Social media, Lokasi

**Acceptance Criteria**
- Pengunjung dapat membuka homepage tanpa login.
- Konten berasal dari database.
- Konten yang berstatus unpublished tidak ditampilkan.
- Link social media berasal dari konfigurasi admin.

---

## 7. About School

Menampilkan: Profil, Sejarah, Visi, Misi, Nilai, Fasilitas, Struktur organisasi, Program unggulan.

Admin dapat mengubah seluruh konten melalui CMS.

---

## 8. Educational Programs

Menampilkan: Jurusan, Program keahlian, Program unggulan, Deskripsi program.

Data harus dapat dikelola admin.

---

## 9. Public News

Admin dapat: Create, Read, Update, Delete, Draft, Publish, Upload thumbnail.

Public hanya dapat melihat berita berstatus **PUBLISHED**. Berita draft tidak boleh muncul pada public website.

---

## 10. Public Events

Event memiliki: Title, Description, Date, Start time, End time, Location, Poster, Status.

**Status:** `DRAFT` · `UPCOMING` · `ONGOING` · `COMPLETED` · `CANCELLED`

Public hanya melihat event yang dipublikasikan.

---

## 11. Gallery

Gallery memiliki: Image, Title, Description, Category, Upload date, Publication status.

**Kategori:** Kegiatan sekolah, Pembelajaran, Event, Prestasi, Ekstrakurikuler, Fasilitas.

---

## 12. Achievements

Data: Achievement title, Category, Student/team, Competition, Rank/award, Year, Description, Documentation, Publication status.

---

## 13. Teacher & Staff Public Profile

Admin dapat menentukan apakah seorang guru/staff ditampilkan secara public.

Data: Name, Photo, Position, Subject, Bio, Status, Public visibility.

---

## 14. FAQ

Admin dapat membuat: Question, Answer, Category, Sort order, Active/inactive.

---

## 15. Contact

Public contact page menampilkan: Phone, WhatsApp, Email, Address, Operational hours, Social media, Google Maps.

---

## 16. Authentication

### 16.1 Authentication Features
Sistem harus menyediakan: Login, Logout, Forgot password, Reset password, Change password, Profile, Role-based access.

- Register public bersifat opsional.
- Untuk akun sekolah, akun dapat dibuat oleh Admin.

---

## 17. Role System

Role utama: `ADMIN` · `TEACHER` · `STUDENT` · `PARENT`

Sistem harus menggunakan **Role-Based Access Control (RBAC)**.

---

## 18. Admin Dashboard

Menampilkan: Total users, Total students, Total teachers, Total parents, Total classes, Attendance summary, Latest aspirations, Latest announcements, Upcoming events, Upcoming meetings, Recent activities.

---

## 19. Teacher Dashboard

Menampilkan: Today's schedule, Classes, Teaching subjects, Recent materials, Recent assignments, Assignment submissions, Student attendance, Student progress, Upcoming meetings, Discussion rooms, Notifications.

---

## 20. Student Dashboard

Menampilkan: Today's schedule, New materials, Upcoming assignments, Assignment deadlines, Missed learning, Review recommendations, Learning progress, Discussion rooms, Announcements, Notifications.

---

## 21. Parent Dashboard

Menampilkan: Linked children, Attendance, Academic progress, Grades, Assignments, Schedule, Teacher feedback, Discipline records, Upcoming meetings, Notifications.

Parent hanya dapat melihat data anak yang terhubung melalui relasi `parent_student`.

---

## 22. Learning Hub

Learning Hub adalah **core feature** SchoolHub.

```
Learning Hub
│
├── Materials
├── Assignments
├── Submissions
├── Quiz
├── Review
├── Missed Learning
└── Progress
```

---

## 23. Learning Materials

Guru dapat: Create, Edit, Delete material · Upload file · Add video URL · Add external link · Add description · Assign class · Assign subject · Assign meeting/session · Publish/unpublish.

Material memiliki: Title, Description, File, Video URL, Subject, Class, Teacher, Meeting/session, Status, Created date, Published date.

---

## 24. Assignments

Guru dapat membuat: Title, Description, Instructions, Attachment, Subject, Class, Deadline, Maximum score, Status.

Murid dapat: View assignment, Upload answer, Submit, View submission status, View grade, View feedback.

Guru dapat: View submissions, Grade, Add feedback, Update grade.

---

## 25. Assignment Status

`NOT_STARTED` · `IN_PROGRESS` · `SUBMITTED` · `LATE` · `GRADED`

---

## 26. Missed Learning System

Sistem harus dapat mengidentifikasi materi yang belum diselesaikan oleh siswa.

**Status pembelajaran:** `NOT_STARTED` · `IN_PROGRESS` · `COMPLETED` · `MISSED`

**Contoh:**
- Pertemuan 1 → COMPLETED
- Pertemuan 2 → COMPLETED
- Pertemuan 3 → MISSED
- Pertemuan 4 → NOT_STARTED

Jika sebuah materi/pertemuan dianggap terlewat, sistem menampilkan:

> "Kamu melewatkan Pertemuan 3."

Kemudian menyediakan: **Review Now**

---

## 27. Learning Review

Murid dapat membuka kembali: Materi sebelumnya, Materi terlewat, Video, Modul, Latihan.

Sistem menyimpan: Student, Material, Started at, Completed at, Review count, Last reviewed.

---

## 28. Extra Learning

Guru dapat menyediakan materi tambahan: Modul, Video, Latihan, Quiz, Artikel, Bacaan tambahan.

Extra learning tidak wajib menjadi bagian dari progress utama kecuali ditentukan guru.

---

## 29. Learning Progress

Sistem menghitung progress berdasarkan data pembelajaran.

**Contoh — MATEMATIKA: 85%**
- Materials: 9 / 10
- Assignments: 8 / 10
- Quiz: 4 / 5

Progress dapat digunakan oleh: Student, Teacher, Parent — dengan scope data sesuai permission.

---

## 30. Quiz System

Quiz memiliki: Title, Description, Subject, Class, Teacher, Time limit, Passing score, Status.

Question memiliki: Question, Question type, Options, Correct answer, Score.

Attempt memiliki: Student, Quiz, Started at, Completed at, Score, Status.

---

## 31. Smart Schedule

Schedule mengintegrasikan: Subject schedule, Assignment deadline, Discussion, Meeting, Event, Academic calendar.

Sistem menyediakan calendar view.

---

## 32. Reminder

Sistem dapat memberikan reminder untuk: Class, Assignment deadline, Meeting, Discussion, Event, New material.

**Contoh:** "10 menit lagi: Pemrograman."

---

## 33. Discussion Room

Discussion Room merupakan ruang komunikasi terstruktur.

**Jenis:** `TEACHER_STUDENT` · `TEACHER_PARENT` · `CLASS_DISCUSSION` · `SCHOOL_DISCUSSION`

Setiap room memiliki: Title, Topic, Description, Creator, Start date, End date, Participants, Status.

---

## 34. Discussion Members

Member dapat berasal dari: Teacher, Student, Parent, Admin.

Participant harus terdaftar di room sebelum dapat mengakses room privat.

---

## 35. Messages

Message memiliki: Sender, Room, Message content, Attachment, Created time, Read status.

User tidak dapat membaca message dari room yang bukan bagian dari dirinya.

---

## 36. Teacher–Parent Meeting

Meeting berbeda dengan chat.

Meeting memiliki: Teacher, Parent, Student, Topic, Date, Start time, End time, Location, Meeting type, Status, Notes.

**Meeting type:** `OFFLINE` · `ONLINE`

**Status:** `REQUESTED` · `SCHEDULED` · `COMPLETED` · `CANCELLED`

Setelah meeting selesai, guru dapat menyimpan catatan hasil meeting.

---

## 37. Aspiration Box

Murid dapat membuat: Suggestion, Opinion, Criticism, Complaint, Idea, Feedback.

Aspirasi memiliki: Title, Content, Category, Sender, Anonymous flag, Status, Admin response, Created date, Updated date.

---

## 38. Aspiration Status

`SUBMITTED` · `UNDER_REVIEW` · `IN_PROGRESS` · `RESOLVED` · `REJECTED`

---

## 39. Anonymous Aspiration

Murid dapat memilih: `IDENTITY_VISIBLE` · `ANONYMOUS`

Jika anonymous:
- Public UI tidak menampilkan identitas siswa.
- Identitas tetap dapat disimpan secara internal apabila dibutuhkan untuk audit dan keamanan sistem.
- Akses terhadap identitas harus dibatasi oleh permission.

---

## 40. Communication Hub

Communication Hub meliputi: Teacher ↔ Student, Teacher ↔ Parent, Admin → User, Discussion Room, Meeting, Feedback.

Sistem tidak boleh mencampur seluruh komunikasi menjadi satu chat tanpa konteks.

---

## 41. School Information Center

School Information Center menjadi pusat informasi internal.

Konten: Announcements, News, Events, Academic calendar, School information, Documents, Programs, Rules.

---

## 42. School Rules

Admin dapat membuat dan mengelola: Academic rules, Attendance rules, Discipline rules, Uniform rules, Behavior rules, Environment rules, Rights & responsibilities, Consequences.

School Rules memiliki: Title, Category, Content, Status, Version, Effective date.

---

## 43. Attendance System

**Attendance status:** `PRESENT` · `LATE` · `EXCUSED` · `SICK` · `ABSENT`

Data: Student, Class, Schedule, Teacher, Date, Check-in time, Status, Note.

---

## 44. Discipline System

Discipline record digunakan untuk mencatat dan mengevaluasi kedisiplinan.

Data: Student, Category, Description, Point, Date, Reporter, Status, Notes.

**Tujuan sistem:** Mencatat → Mengevaluasi → Memperbaiki

Sistem tidak dirancang semata-mata untuk menghukum siswa.

---

## 45. Parent Monitoring

Parent dapat melihat data anak yang terhubung:

- **Academic:** Grades, Progress, Materials, Assignments, Quiz
- **Attendance:** Present, Late, Excused, Sick, Absent
- **Discipline:** Discipline records, Teacher notes
- **Communication:** Teacher feedback, Meetings, Discussions

Parent tidak boleh mengakses data siswa lain.

---

## 46. Notification Center

**Notification type:** `NEW_ASSIGNMENT` · `ASSIGNMENT_DEADLINE` · `NEW_MATERIAL` · `DISCUSSION` · `MEETING` · `ANNOUNCEMENT` · `FEEDBACK` · `ASPIRATION_UPDATE` · `EVENT` · `SYSTEM`

Notification memiliki: Recipient, Type, Title, Message, Related entity, Read status, Created at.

---

## 47. Admin CMS

Admin CMS memungkinkan admin mengelola konten tanpa mengubah source code.

CMS meliputi: School Profile, Branding, Social Media, Location, Contact, News, Events, Gallery, Achievements, Teachers & Staff, FAQ, School Rules, Programs, Announcements.

---

## 48. School Profile Management

Admin dapat mengubah: School name, Short name, Description, History, Vision, Mission, Values, Address, Phone, Email, Operating hours.

---

## 49. Branding Management

Admin dapat mengubah: Logo, Favicon, Hero image, Banner, Slogan, Primary color, Secondary color, Website name.

Perubahan harus otomatis diterapkan pada public website tanpa perubahan source code.

---

## 50. Social Media Management

Admin dapat mengatur: Instagram, Facebook, YouTube, TikTok, X/Twitter, WhatsApp, Other social media.

Setiap social media memiliki: Platform, URL, Active/inactive.

---

## 51. Location Management

Admin dapat mengubah: Address, Google Maps URL, Latitude, Longitude.

Public map harus mengambil konfigurasi terbaru dari database.

---

## 52. Contact Management

Admin dapat mengubah: Phone, WhatsApp, Email, Address, Service hours.

---

## 53. User Management

Admin dapat: Create, Read, Update, Deactivate, Reset password, Assign role, Assign class.

**Role:** `ADMIN` · `TEACHER` · `STUDENT` · `PARENT`

---

## 54. Teacher Management

Admin dapat: Add teacher, Edit teacher, Upload photo, Assign position, Assign subjects, Add bio, Activate/deactivate, Show/hide public profile.

---

## 55. Parent–Student Management

```
Admin menghubungkan:
Parent
  ↓
Student
```

- Satu parent dapat memiliki lebih dari satu student.
- Satu student dapat memiliki lebih dari satu parent/wali jika sistem sekolah membutuhkannya.
- Relasi harus disimpan dalam: `parent_student`

---

## 56. Academic Management

Admin mengelola: Academic year, Department/program, Class, Subject, Teacher, Student, Schedule.

---

## 57. Class Management

Data class: Name, Academic year, Program, Grade, Homeroom teacher, Status.

Student harus memiliki histori kelas agar perpindahan tahun ajaran dapat dilacak.

---

## 58. Subject Management

Data: Subject name, Code, Description, Teacher, Class, Status.

---

## 59. Permission System

Permission merupakan bagian wajib dari SchoolHub. Akses tidak hanya berdasarkan role, tetapi juga berdasarkan **ownership** dan **relationship**.

---

## 60. Core Access Principle

| Role | Akses |
|---|---|
| **Admin** | Memiliki akses administratif terhadap data yang menjadi kewenangannya. |
| **Teacher** | Hanya dapat mengakses data pembelajaran dan siswa yang berada dalam scope pengajaran/kewenangannya. |
| **Student** | Hanya dapat mengakses data miliknya sendiri dan ruang yang diikutinya. |
| **Parent** | Hanya dapat mengakses data anak yang terhubung dengannya. |
| **Public** | Hanya dapat mengakses konten yang dipublikasikan. |

---

## 61. Permission Matrix

*C = Create · R = Read · U = Update · D = Delete · CRUD = semua · R Own = hanya data milik sendiri · R Scoped = hanya data dalam kewenangan · "-" = tidak memiliki akses*

| Feature | Admin | Teacher | Student | Parent | Public |
|---|---|---|---|---|---|
| Public Website | CRUD | R | R | R | R |
| School Profile | CRUD | - | - | - | R |
| Branding | CRUD | - | - | - | R |
| Social Media | CRUD | - | - | - | R |
| Location | CRUD | - | - | - | R |
| News | CRUD | - | - | - | R Published |
| Events | CRUD | - | - | - | R Published |
| Gallery | CRUD | - | - | - | R Published |
| Achievement | CRUD | - | - | - | R Published |
| Teacher Profile | CRUD | R Own | R Public | R Public | R Published |
| Users | CRUD Limited | R Own | R Own | R Own | - |
| Academic | CRUD | R Scoped | R Own | R Child | - |
| Materials | CRUD | CRUD Own | R Assigned | R Child | - |
| Assignments | CRUD | CRUD Own | R Own | R Child | - |
| Submission | CRUD | R/G Own Classes | CRUD Own | R Child | - |
| Quiz | CRUD | CRUD Own | R/Attempt Own | R Child Result | - |
| Progress | CRUD | R Scoped | R Own | R Child | - |
| Review | CRUD | R Scoped | CRUD Own | R Child Summary | - |
| Schedule | CRUD | R Own | R Own | R Child | - |
| Attendance | CRUD | CRUD Scoped | R Own | R Child | - |
| Discipline | CRUD | CRUD Scoped | R Own | R Child | - |
| Discussion | CRUD | CRUD Scoped | R/Write Joined | R/Write Joined | - |
| Messages | CRUD/Audit | CRUD Scoped | CRUD Own | CRUD Own | - |
| Meeting | CRUD | CRUD Own | R Own | CRUD Own Request | - |
| Aspirations | CRUD | Limited | CRUD Own | - | - |
| School Rules | CRUD | R | R | R | R Published |
| Notifications | CRUD | Own | Own | Own | - |

---

## 62. Data Ownership

**Student** hanya dapat mengakses: Own Profile, Own Materials, Own Assignments, Own Submissions, Own Progress, Own Reviews, Own Quiz Attempts, Own Attendance, Own Discipline, Own Notifications, Own Aspirations, Joined Discussions.

**Parent** hanya dapat mengakses: Linked Children, dan data akademik/monitoring yang berhubungan dengan child tersebut.

**Teacher** hanya dapat mengakses data siswa yang: Dia ajar, Berada di kelas yang menjadi kewenangannya, Berhubungan dengan subject yang dia kelola.

---

## 63. Data Privacy

Data berikut tidak boleh ditampilkan kepada public:
- Student grades
- Student attendance
- Student discipline
- Student progress
- Parent information
- Private messages
- Private meetings
- Private aspirations
- Internal school records

---

## 64. Database Requirements

Semua data utama harus persistent di database.

**Minimal entity:**

`users`, `parent_student`, `school_settings`, `news`, `events`, `gallery`, `achievements`, `faqs`, `academic_years`, `programs`, `classes`, `subjects`, `teachers`, `student_classes`, `schedules`, `learning_materials`, `assignments`, `assignment_submissions`, `learning_progress`, `learning_reviews`, `quizzes`, `questions`, `quiz_answers`, `quiz_attempts`, `discussion_rooms`, `discussion_members`, `messages`, `meetings`, `feedbacks`, `attendance`, `discipline_records`, `school_rules`, `notifications`

---

## 65. Database Principles

Database harus:
- Relational
- Normalized
- Menggunakan primary key
- Menggunakan foreign key
- Memiliki timestamps
- Memiliki status jika diperlukan
- Menghindari duplicate data
- Mendukung histori data
- Mendukung soft delete untuk data yang membutuhkan histori
- Memiliki indexing pada kolom yang sering dicari

---

## 66. Content Status

Konten public menggunakan status: `DRAFT` · `PUBLISHED` · `ARCHIVED`

Public website hanya menampilkan **PUBLISHED**.

---

## 67. Audit & Activity

Sistem sebaiknya mencatat aktivitas penting: User login, Content created/updated/deleted, Grade updated, Attendance recorded, Discipline record created, Aspirations updated, Meeting updated, Role changed.

Audit digunakan untuk keamanan dan troubleshooting.

---

## 68. Search

Sistem dapat menyediakan search pada:

**Public:** News, Events, Gallery, Achievements, Programs, FAQ

**Private:** Materials, Assignments, Students (sesuai permission), Discussions, Notifications

Search tidak boleh melewati permission boundary.

---

## 69. File Management

File dapat digunakan pada: Learning material, Assignment, Submission, Gallery, Achievement, Teacher profile, Branding, Event poster.

Sistem harus melakukan: File type validation, File size validation, Secure storage, Access control, Unique filename.

File private tidak boleh dapat diakses hanya dengan menebak URL.

---

## 70. Notification Flow

**Contoh Assignment:**
```
Teacher creates assignment
  ↓
Assignment published
  ↓
System identifies target students
  ↓
Notification created
  ↓
Student receives notification
```

**Contoh Meeting:**
```
Teacher creates meeting
  ↓
Parent receives notification
  ↓
Parent confirms/request change
  ↓
Meeting status updated
  ↓
Notification sent
```

---

## 71. Learning Flow

```
Teacher
  ↓
Create Material
  ↓
Assign Subject/Class
  ↓
Publish
  ↓
Student receives notification
  ↓
Student opens material
  ↓
Learning progress recorded
  ↓
Student completes material
  ↓
Progress updated
```

---

## 72. Missed Learning Flow

```
Learning Session
  ↓
Student did not complete
  ↓
System evaluates status
  ↓
MISSED
  ↓
Student Dashboard
  ↓
"Learning Missed"
  ↓
Review Now
  ↓
Material opened
  ↓
Progress updated
```

---

## 73. Assignment Flow

```
Teacher
  ↓
Create Assignment
  ↓
Publish
  ↓
Student Notification
  ↓
Student Opens
  ↓
Student Submits
  ↓
Teacher Reviews
  ↓
Teacher Grades
  ↓
Feedback
  ↓
Student/Parent can view result according to permission
```

---

## 74. Aspiration Flow

```
Student
  ↓
Create Aspiration
  ↓
SUBMITTED
  ↓
Admin reviews
  ↓
UNDER_REVIEW
  ↓
IN_PROGRESS
  ↓
RESOLVED
```

---

## 75. Meeting Flow

```
Teacher
  ↓
Create Meeting
  ↓
Parent receives notification
  ↓
Meeting confirmed
  ↓
SCHEDULED
  ↓
Meeting happens
  ↓
COMPLETED
  ↓
Teacher adds meeting notes
```

---

## 76. Attendance Flow

```
Teacher
  ↓
Select Class
  ↓
Select Schedule
  ↓
Record Attendance
  ↓
Save
  ↓
Student Attendance Updated
  ↓
Parent Dashboard Updated
```

---

## 77. Discipline Flow

```
Teacher/Admin
  ↓
Create Discipline Record
  ↓
Student linked
  ↓
Record stored
  ↓
Student can view according to policy
  ↓
Parent can view child's record
```

---

## 78. Admin CMS Flow

**Contoh: mengubah Instagram**
```
Admin Login
  ↓
CMS
  ↓
School Settings
  ↓
Social Media
  ↓
Edit Instagram URL
  ↓
Save
  ↓
Database Updated
  ↓
Public Website automatically uses new URL
```

Tidak diperlukan perubahan source code.

---

## 79. Responsive Design

SchoolHub harus responsive untuk: Desktop, Tablet, Mobile.

Breakpoints harus dirancang agar:
- Navigation tetap usable
- Dashboard tidak overflow
- Table memiliki responsive behavior
- Form mudah digunakan
- File upload dapat dilakukan dari mobile
- Calendar dapat digunakan pada mobile

---

## 80. UI/UX Principles

Design harus: Modern, Clean, Professional, School-oriented, Accessible, Responsive, Consistent.

UI harus menggunakan **Design System**, minimal mencakup:

Colors, Typography, Spacing, Buttons, Forms, Cards, Tables, Badges, Modal, Toast, Navbar, Sidebar, Tabs, Dropdown, Pagination, Empty States, Loading States, Error States.

---

## 81. Dashboard UX

Dashboard harus memprioritaskan informasi yang paling relevan berdasarkan role.

| Role | Prioritas |
|---|---|
| **Student** | Today's schedule → Deadline → Missed learning → New materials → Progress |
| **Teacher** | Today's schedule → Classes → Assignment submissions → Attendance → Student progress |
| **Parent** | Child overview → Attendance → Progress → Assignments → Teacher feedback |
| **Admin** | System overview → Users → Content → Academic → Activity |

---

## 82. Security Requirements

Sistem harus menerapkan: Authentication, Authorization, Role-based access, Ownership checks, Relationship checks, Password hashing, Secure session/token management, Input validation, File validation, CSRF protection jika relevan, Rate limiting untuk endpoint sensitif, Secure error handling, Database constraints.

---

## 83. Authorization Examples

**Student**
```
Request: GET /students/20/progress
Jika student ID bukan miliknya → 403 Forbidden
```

**Parent** — mencoba melihat student yang tidak terhubung → `403 Forbidden`

**Teacher** — mencoba melihat siswa di kelas yang bukan kewenangannya → `403 Forbidden`

**Public** — mencoba membuka unpublished news → `404 Not Found` (atau response yang sesuai agar konten tidak bocor)

---

## 84. Error States

Sistem harus memiliki: `404` page, `403` unauthorized, `401` unauthenticated, `422` validation error, `429` rate limit, `500` server error, Empty state, Loading state, Network error state.

Pesan error harus mudah dipahami user.

---

## 85. Accessibility

Interface harus mempertimbangkan: Readable typography, Proper contrast, Keyboard navigation, Accessible form labels, Clear validation messages, Alternative text untuk gambar, Focus state, Tidak hanya mengandalkan warna untuk status.

---

## 86. Performance Requirements

Target awal:
- Public pages cepat dibuka.
- Dashboard tidak melakukan request data yang tidak diperlukan.
- Pagination digunakan untuk data besar.
- Image optimization diterapkan.
- Lazy loading digunakan untuk media.
- Database query dioptimalkan.
- Index digunakan pada field yang sering digunakan.

---

## 87. Responsibility Matrix

| Area | Admin | Teacher | Student | Parent |
|---|---|---|---|---|
| School Content | Owner | - | - | - |
| Academic Data | Owner | Use | View Own | View Child |
| Learning | Manage | Owner | Consume | Monitor |
| Assignment | Manage | Owner | Submit | Monitor |
| Attendance | Manage | Record | View | View |
| Discipline | Manage | Record | View | View |
| Discussion | Manage | Facilitate | Participate | Participate |
| Meeting | Manage | Create | View if relevant | Participate |
| Aspirations | Manage | Limited | Submit | - |
| Notifications | Manage/System | Receive | Receive | Receive |

---

## 88. MVP Scope

**Public:** Home, About, Programs, News, Events, Gallery, Teachers, Contact

**Authentication:** Login, Logout, Role system, Profile

**Admin:** Dashboard, User management, School settings, News, Events, Gallery, Teacher management, Academic management

**Teacher:** Dashboard, Materials, Assignments, Attendance, Student progress

**Student:** Dashboard, Schedule, Materials, Assignments, Submission, Progress, Missed learning

**Parent:** Dashboard, Child monitoring, Attendance, Progress, Assignments

---

## 89. Phase 2

Setelah MVP stabil: Quiz, Discussion Room, Messages, Teacher–Parent Meeting, Aspirations, Discipline, School Rules, Notification Center, Extra Learning, Advanced analytics.

---

## 90. Phase 3

Pengembangan lanjutan: Mobile application, Push notifications, Advanced analytics, Attendance integration, Calendar synchronization, Advanced reporting, AI learning recommendation, AI school assistant, Advanced search, Data export, Advanced audit system.

---

## 91. Non-Functional Requirements

SchoolHub harus:

- **Reliability** — Data yang sudah disimpan tidak boleh hilang karena perpindahan halaman.
- **Security** — User hanya dapat mengakses data yang menjadi kewenangannya.
- **Scalability** — Struktur database harus memungkinkan penambahan: Kelas, Siswa, Guru, Tahun ajaran, Mata pelajaran, Konten.
- **Maintainability** — Code harus modular dan mudah dikembangkan.
- **Usability** — User baru dapat memahami interface tanpa tutorial panjang.

---

## 92. Tech Stack

| Layer | Teknologi |
|---|---|
| **Web Frontend** | React, Vite |
| **Backend** | Go / NestJS / Express (final dipilih sebelum implementation) |
| **Mobile** | Flutter |
| **Database** | Relational — mendukung Foreign keys, Transactions, Indexing, Relationships (implementasi ditentukan di technical design/ERD) |

---

## 93. Frontend Architecture

Frontend harus memisahkan: Public Pages, Private Pages, Admin Pages, Teacher Pages, Student Pages, Parent Pages, Shared Components, Authentication, API Layer, State Management.

---

## 94. Backend Architecture

Backend minimal terdiri dari: Authentication, Users, Roles, School, Content, Academic, Learning, Assignments, Quiz, Attendance, Discipline, Discussion, Meetings, Feedback, Notifications, Files, Reports.

Setiap module harus memiliki responsibility yang jelas.

---

## 95. API Principle

API harus: RESTful atau architecture yang disepakati, Consistent response, Validation, Authentication, Authorization, Pagination, Filtering, Sorting, Error handling.

---

## 96. Acceptance Criteria — Global

**Authentication**
- User dapat login sesuai role.
- User tidak dapat mengakses dashboard role lain.
- Logout berfungsi.
- Password dapat diubah.

**Public Website**
- Public dapat mengakses konten published.
- Admin dapat mengubah konten.
- Perubahan CMS muncul pada public website.

**Learning**
- Teacher dapat membuat material.
- Student dapat mengakses material yang ditugaskan.
- Student dapat menyelesaikan material.
- Progress tersimpan.
- Missed learning dapat diidentifikasi.

**Assignment**
- Teacher dapat membuat assignment.
- Student dapat submit.
- Teacher dapat memberikan nilai.
- Student dapat melihat feedback.
- Parent dapat melihat hasil anak sesuai permission.

**Attendance**
- Teacher dapat mencatat attendance.
- Student dapat melihat attendance miliknya.
- Parent dapat melihat attendance anaknya.

**Parent Monitoring**
- Parent hanya dapat melihat child yang terhubung.
- Parent tidak dapat mengakses data siswa lain.

**Communication**
- User hanya dapat mengakses discussion room yang diikuti.
- Message tersimpan.
- Meeting tersimpan.

**Aspirations**
- Student dapat mengirim aspiration.
- Anonymous option bekerja.
- Admin dapat memproses status.
- Data tersimpan persistent.

---

## 97. Data Integrity Rules

Sistem harus memastikan:

1. Student tidak dapat terdaftar pada class yang tidak valid.
2. Submission hanya dapat dibuat oleh student yang menjadi target assignment.
3. Parent hanya dapat melihat child yang memiliki relasi.
4. Teacher hanya dapat mengelola assignment untuk class/subject yang menjadi kewenangannya.
5. Material hanya dapat diakses oleh target audience.
6. Private discussion hanya dapat diakses member.
7. Unpublished content tidak muncul public.
8. Deleted data yang membutuhkan histori menggunakan soft delete.
9. Foreign key harus menjaga integritas relasi.
10. Data penting menggunakan transaction ketika melakukan beberapa perubahan sekaligus.

---

## 98. Core Database Relationship

```
USER
 │
 ├── ADMIN
 ├── TEACHER
 ├── STUDENT
 └── PARENT
       │
       ↓
   PARENT_STUDENT
       │
       ↓
    STUDENT
       │
       ├── STUDENT_CLASS
       │      ↓
       │    CLASS
       │      ↓
       │    SUBJECT
       │
       ├── LEARNING_PROGRESS
       ├── LEARNING_REVIEWS
       ├── SUBMISSIONS
       ├── QUIZ_ATTEMPTS
       ├── ATTENDANCE
       ├── DISCIPLINE_RECORDS
       └── FEEDBACKS
```

---

## 99. Core Learning Relationship

```
TEACHER
  ↓
SUBJECT
  ↓
CLASS
  ↓
LEARNING_MATERIAL
  ↓
ASSIGNMENT
  ↓
SUBMISSION
  ↓
GRADE / FEEDBACK
```

---

## 100. Communication Relationship

```
USER
  ↓
DISCUSSION_ROOM
  ↓
DISCUSSION_MEMBER
  ↓
MESSAGE
```

**Meeting:**
```
TEACHER + PARENT + STUDENT
        ↓
     MEETING
        ↓
   MEETING NOTES
```

---

## 101. Public Content Relationship

```
SCHOOL_SETTINGS
 │
 ├── NEWS
 ├── EVENTS
 ├── GALLERY
 ├── ACHIEVEMENTS
 ├── FAQ
 ├── PROGRAMS
 ├── TEACHER PROFILES
 └── SCHOOL_RULES
```

---

## 102. Reporting

Admin dapat memperoleh laporan: Student count, Teacher count, Attendance, Assignment completion, Learning progress, Discipline, Aspirations, Meetings, System activity.

Laporan lanjutan dapat dikembangkan pada Phase 3.

---

## 103. Admin Sidebar

```
Dashboard
School Management
├── School Profile
├── Branding
├── Social Media
├── Location
└── Contact
Content
├── News
├── Events
├── Gallery
├── Achievements
├── FAQ
└── Announcements
Academic
├── Academic Years
├── Programs
├── Classes
├── Subjects
├── Teachers
├── Students
└── Schedules
Learning
├── Materials
├── Assignments
├── Quiz
└── Progress
Communication
├── Discussions
├── Meetings
├── Messages
└── Aspirations
Student Management
├── Attendance
├── Discipline
└── Parent Relations
Users
├── Admin
├── Teachers
├── Students
└── Parents
Reports
System
├── Notifications
├── Audit Logs
└── Settings
```

---

## 104. Teacher Sidebar

```
Dashboard
Teaching
├── My Classes
├── Subjects
├── Materials
├── Assignments
├── Quiz
└── Progress
Students
├── Student List
├── Attendance
└── Discipline
Communication
├── Discussion
├── Messages
├── Parent Meetings
└── Feedback
Schedule
Notifications
Profile
```

---

## 105. Student Sidebar

```
Dashboard
Learning
├── My Materials
├── Missed Learning
├── Assignments
├── Quiz
├── Review
└── Progress
Schedule
Discussion
Aspirations
Notifications
Profile
```

---

## 106. Parent Sidebar

```
Dashboard
My Children
Academic
├── Progress
├── Assignments
├── Grades
└── Schedule
Attendance
Discipline
Communication
├── Teacher Feedback
├── Discussion
└── Meetings
Notifications
Profile
```

---

## 107. Future Extensibility

Arsitektur harus memungkinkan penambahan: Mobile app, AI assistant, AI learning recommendation, Online examination, Payment, Library, Extracurricular management, Student achievements, Career center, Alumni, School admission, Digital certificate.

Fitur tersebut belum termasuk MVP dan tidak boleh mengganggu scope utama.

---

## 108. Project Development Order

```
1. Project Setup
2. Database & ERD
3. Authentication
4. Role & Permission
5. School Settings
6. Public Website
7. User Management
8. Academic Management
9. Learning Hub
10. Assignment
11. Progress
12. Missed Learning
13. Attendance
14. Parent Monitoring
15. Communication
16. Meeting
17. Aspirations
18. Notifications
19. Reports
20. Testing
21. Security Audit
22. Deployment
```

---

## 109. Documentation Pipeline

```
MASTER BLUEPRINT
  ↓
PRD.md
  ↓
ERD.md
  ↓
DATABASE SCHEMA
  ↓
API SPECIFICATION
  ↓
DESIGN SYSTEM
  ↓
UI/UX
  ↓
FRONTEND
  ↓
BACKEND
  ↓
TESTING
  ↓
DEPLOYMENT
```

---

## 110. Design System Workflow

Screenshot/reference design dapat dianalisis menggunakan tool desain/AI.

Output design system minimal: `design-system.md`, berisi: Color tokens, Typography, Spacing, Radius, Shadows, Buttons, Forms, Cards, Tables, Navigation, Dashboard components, Responsive rules.

Design system harus diterapkan konsisten pada seluruh halaman.

> 📌 Lihat juga `style-guide-app_sekolah.md` yang sudah tersedia untuk referensi warna, tipografi, dan komponen UI.

---

## 111. Final Product Principle

SchoolHub bukan sekadar website sekolah. SchoolHub adalah **Digital School Integrated Platform** yang menghubungkan:

```
              SCHOOL
                │
   ┌────────────┼────────────┐
   │            │            │
 ADMIN       TEACHER      STUDENT
   │            │            │
   └────────────┼────────────┘
                │
             PARENT
```

Semua pihak terhubung melalui: Learning, Communication, Information, Schedule, Attendance, Discipline, Monitoring, Aspirations, Meetings — dengan satu sumber data terpusat.

---

## 112. Definition of Done

SchoolHub dianggap siap untuk release apabila:

- Semua MVP feature selesai.
- Authentication berjalan.
- RBAC berjalan.
- Ownership authorization berjalan.
- Database persistent.
- Public CMS berjalan.
- Learning system berjalan.
- Assignment berjalan.
- Progress berjalan.
- Missed learning berjalan.
- Parent monitoring berjalan.
- Attendance berjalan.
- Responsive UI berjalan.
- Validation berjalan.
- Error handling berjalan.
- Security testing selesai.
- Database migration berhasil.
- Seed data tersedia.
- Production build berhasil.
- Tidak terdapat critical bug.

---

## 113. Final MVP Checklist

**Foundation**
- [ ] Project setup
- [ ] Database
- [ ] Authentication
- [ ] RBAC
- [ ] Authorization
- [ ] User profile

**Public Website**
- [ ] Home
- [ ] About
- [ ] Programs
- [ ] News
- [ ] Events
- [ ] Gallery
- [ ] Achievements
- [ ] Teachers
- [ ] FAQ
- [ ] Contact

**Admin**
- [ ] Dashboard
- [ ] User management
- [ ] School settings
- [ ] Branding
- [ ] Social media
- [ ] Location
- [ ] Content CMS
- [ ] Academic management

**Teacher**
- [ ] Dashboard
- [ ] Classes
- [ ] Materials
- [ ] Assignments
- [ ] Submission review
- [ ] Attendance
- [ ] Progress

**Student**
- [ ] Dashboard
- [ ] Materials
- [ ] Assignments
- [ ] Submission
- [ ] Missed learning
- [ ] Review
- [ ] Progress
- [ ] Schedule

**Parent**
- [ ] Dashboard
- [ ] Child relationship
- [ ] Progress
- [ ] Attendance
- [ ] Assignments
- [ ] Grades
- [ ] Teacher feedback

**System**
- [ ] Notifications
- [ ] File upload
- [ ] Search
- [ ] Validation
- [ ] Error states
- [ ] Responsive design
- [ ] Security
- [ ] Audit logs

---

## 114. Final Product Statement

> SchoolHub is a centralized digital school ecosystem that connects administrators, teachers, students, and parents through learning, communication, information, monitoring, and school management in one integrated platform.

The platform is designed around three core principles:

1. **CONNECT** — Menghubungkan seluruh pihak sekolah.
2. **ORGANIZE** — Mengatur pembelajaran, informasi, komunikasi, jadwal, dan data secara terstruktur.
3. **MONITOR** — Memungkinkan pihak yang berwenang memantau perkembangan siswa dan aktivitas sekolah berdasarkan permission.

---

## 115. Next Document

Setelah PRD ini disetujui, dokumen berikutnya adalah **ERD.md**.

ERD harus menerjemahkan PRD ini menjadi: Entity, Attribute, Primary key, Foreign key, Relationship, Cardinality, Enum/status, Index, Soft delete, Audit fields, Database constraints.

**Pipeline selanjutnya:**
```
ERD.md
  ↓
Database Schema
  ↓
API Specification
  ↓
Design System
  ↓
Implementation
```

---

**PRD STATUS: READY FOR ERD DESIGN**

import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './store';
import { Spinner } from './components/ui';

import PublicLayout from './layouts/PublicLayout';
import AppLayout from './layouts/AppLayout';

import Home from './pages/public/Home';
import About from './pages/public/About';
import Programs from './pages/public/Programs';
import News, { NewsDetail } from './pages/public/News';
import Events, { EventsDetail } from './pages/public/Events';
import Gallery from './pages/public/Gallery';
import Achievements from './pages/public/Achievements';
import Teachers from './pages/public/Teachers';
import FAQ from './pages/public/FAQ';
import Rules from './pages/public/Rules';
import Contact from './pages/public/Contact';
import Login from './pages/auth/Login';

import AdminDashboard from './pages/admin/Dashboard';
import AdminSettings from './pages/admin/Settings';
import AdminBranding from './pages/admin/Branding';
import AdminSocial from './pages/admin/Social';
import AdminContact from './pages/admin/Contact';
import AdminUmum from './pages/admin/UmumCMS';
import AdminAspirasi from './pages/admin/Aspirasi';
import AdminUsers from './pages/admin/Users';
import AdminAcademic from './pages/admin/Academic';
import AdminWali from './pages/admin/WaliRelasi';
import AdminReports from './pages/admin/Reports';
import AdminActivity from './pages/admin/Activity';

import TeacherDashboard from './pages/teacher/Dashboard';
import TeacherClasses from './pages/teacher/Classes';
import TeacherMaterials from './pages/teacher/Materials';
import TeacherAssignments from './pages/teacher/Assignments';
import TeacherProgress from './pages/teacher/Progress';
import TeacherTraffic from './pages/teacher/Traffic';
import TeacherStudents from './pages/teacher/Students';
import TeacherAttendance from './pages/teacher/Attendance';
import TeacherDiscipline from './pages/teacher/Discipline';
import TeacherDiscussions from './pages/teacher/Discussions';
import TeacherMeetings from './pages/teacher/Meetings';
import TeacherSchedule from './pages/teacher/Schedule';

import StudentDashboard from './pages/student/Dashboard';
import StudentMaterials from './pages/student/Materials';
import StudentMissed from './pages/student/Missed';
import StudentAssignments from './pages/student/Assignments';
import StudentQuiz from './pages/student/Quiz';
import StudentReview from './pages/student/Review';
import StudentProgress from './pages/student/Progress';
import StudentSchedule from './pages/student/Schedule';
import StudentDiscussions from './pages/student/Discussions';
import StudentAspirations from './pages/student/Aspirations';
import StudentAttendance from './pages/student/Attendance';
import Profile from './pages/auth/Profile';

import ParentDashboard from './pages/parent/Dashboard';
import ParentChildren from './pages/parent/Children';
import ParentChildOverview from './pages/parent/ChildOverview';
import ParentAcademic from './pages/parent/Academic';
import ParentAttendance from './pages/parent/Attendance';
import ParentDiscipline from './pages/parent/Discipline';
import ParentMeetings from './pages/parent/Meetings';
import ParentFeedback from './pages/parent/Feedback';

const ROLE_PATHS = { ADMIN: 'admin', TEACHER: 'guru', STUDENT: 'murid', PARENT: 'wali' };

function RoleRedirect() {
  const { user } = useAuth();
  return <Navigate to={`/${ROLE_PATHS[user.role]}`} replace />;
}

function Protected({ allowed, children }) {
  const { user, booted } = useAuth();
  if (!booted) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (!allowed.includes(user.role)) return <Navigate to={`/${ROLE_PATHS[user.role]}`} replace />;
  return children;
}

export default function App() {
  const { user, booted } = useAuth();

  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/tentang" element={<About />} />
        <Route path="/program" element={<Programs />} />
        <Route path="/berita" element={<News />} />
        <Route path="/berita/:id" element={<NewsDetail />} />
        <Route path="/event" element={<Events />} />
        <Route path="/event/:id" element={<EventsDetail />} />
        <Route path="/galeri" element={<Gallery />} />
        <Route path="/prestasi" element={<Achievements />} />
        <Route path="/guru-staf" element={<Teachers />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/peraturan" element={<Rules />} />
        <Route path="/kontak" element={<Contact />} />
      </Route>

      <Route path="/login" element={!booted ? <Spinner /> : user ? <RoleRedirect /> : <Login />} />

      <Route path="/admin" element={<Protected allowed={['ADMIN']}><AppLayout /></Protected>}>
        <Route index element={<AdminDashboard />} />
        <Route path="sekolah" element={<AdminSettings />} />
        <Route path="branding" element={<AdminBranding />} />
        <Route path="sosial" element={<AdminSocial />} />
        <Route path="kontak" element={<AdminContact />} />
        <Route path="akademik/wali" element={<AdminWali />} />
        <Route path="akademik/:section" element={<AdminAcademic />} />
        <Route path=":cms" element={<AdminUmum />} />
        <Route path="aspirasi" element={<AdminAspirasi />} />
        <Route path="laporan" element={<AdminReports />} />
        <Route path="aktivitas" element={<AdminActivity />} />
      </Route>

      <Route path="/guru" element={<Protected allowed={['TEACHER']}><AppLayout /></Protected>}>
        <Route index element={<TeacherDashboard />} />
        <Route path="kelas" element={<TeacherClasses />} />
        <Route path="materi" element={<TeacherMaterials />} />
        <Route path="tugas" element={<TeacherAssignments />} />
        <Route path="progress" element={<TeacherProgress />} />
        <Route path="traffic" element={<TeacherTraffic />} />
        <Route path="siswa" element={<TeacherStudents />} />
        <Route path="kehadiran" element={<TeacherAttendance />} />
        <Route path="konseling" element={<TeacherDiscipline />} />
        <Route path="diskusi" element={<TeacherDiscussions />} />
        <Route path="meeting" element={<TeacherMeetings />} />
        <Route path="jadwal" element={<TeacherSchedule />} />
        <Route path="profil" element={<Profile />} />
      </Route>

      <Route path="/murid" element={<Protected allowed={['STUDENT']}><AppLayout /></Protected>}>
        <Route index element={<StudentDashboard />} />
        <Route path="materi" element={<StudentMaterials />} />
        <Route path="terlewat" element={<StudentMissed />} />
        <Route path="tugas" element={<StudentAssignments />} />
        <Route path="quiz" element={<StudentQuiz />} />
        <Route path="review" element={<StudentReview />} />
        <Route path="progress" element={<StudentProgress />} />
        <Route path="jadwal" element={<StudentSchedule />} />
        <Route path="diskusi" element={<StudentDiscussions />} />
        <Route path="aspirasi" element={<StudentAspirations />} />
        <Route path="kehadiran" element={<StudentAttendance />} />
        <Route path="profil" element={<Profile />} />
      </Route>

      <Route path="/wali" element={<Protected allowed={['PARENT']}><AppLayout /></Protected>}>
        <Route index element={<ParentDashboard />} />
        <Route path="anak" element={<ParentChildren />} />
        <Route path="anak/:childId" element={<ParentChildOverview />} />
        <Route path="anak/:childId/akademik" element={<ParentAcademic />} />
        <Route path="anak/:childId/kehadiran" element={<ParentAttendance />} />
        <Route path="anak/:childId/disiplin" element={<ParentDiscipline />} />
        <Route path="anak/:childId/feedback" element={<ParentFeedback />} />
        <Route path="meeting" element={<ParentMeetings />} />
        <Route path="profil" element={<Profile />} />
      </Route>

      <Route path="*" element={<PublicHomeFallback />} />
    </Routes>
  );
}

function PublicHomeFallback() {
  return <Navigate to="/" replace />;
}
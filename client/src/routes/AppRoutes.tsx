import { Route, Routes } from "react-router-dom";
import AdminLayout from "../components/layout/AdminLayout";
import PublicLayout from "../components/layout/PublicLayout";
import StudentLayout from "../components/layout/StudentLayout";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import ExerciseManagementPage from "../pages/admin/ExerciseManagementPage";
import LessonManagementPage from "../pages/admin/LessonManagementPage";
import StatisticsPage from "../pages/admin/StatisticsPage";
import StudentManagementPage from "../pages/admin/StudentManagementPage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import NotFoundPage from "../pages/NotFoundPage";
import AboutPage from "../pages/public/AboutPage";
import FeaturesPage from "../pages/public/FeaturesPage";
import LandingPage from "../pages/public/LandingPage";
import CompilerWorkspacePage from "../pages/student/CompilerWorkspacePage";
import DashboardPage from "../pages/student/DashboardPage";
import ExerciseDetailPage from "../pages/student/ExerciseDetailPage";
import ExercisesPage from "../pages/student/ExercisesPage";
import HistoryDetailPage from "../pages/student/HistoryDetailPage";
import HistoryPage from "../pages/student/HistoryPage";
import LessonDetailPage from "../pages/student/LessonDetailPage";
import LessonsPage from "../pages/student/LessonsPage";
import ProfilePage from "../pages/student/ProfilePage";
import SavedProgramsPage from "../pages/student/SavedProgramsPage";
import AdminRoute from "./AdminRoute";
import ProtectedRoute from "./ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Any logged-in user */}
      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<StudentLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="compiler" element={<CompilerWorkspacePage />} />
          <Route path="lessons" element={<LessonsPage />} />
          <Route path="lessons/:id" element={<LessonDetailPage />} />
          <Route path="exercises" element={<ExercisesPage />} />
          <Route path="exercises/:id" element={<ExerciseDetailPage />} />
          <Route path="programs" element={<SavedProgramsPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="history/:id" element={<HistoryDetailPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* Administrators only */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="students" element={<StudentManagementPage />} />
          <Route path="lessons" element={<LessonManagementPage />} />
          <Route path="exercises" element={<ExerciseManagementPage />} />
          <Route path="stats" element={<StatisticsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

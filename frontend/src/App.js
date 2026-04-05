import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Navbar         from "./components/shared/Navbar";
import LoginPage      from "./pages/LoginPage";
import AdminDashboard from "./components/admin/AdminDashboard";
import FacultyDashboard from "./components/faculty/FacultyDashboard";
import StudentDashboard from "./components/student/StudentDashboard";

// Wrap protected routes — shows Navbar once, then the page
const ProtectedLayout = ({ children, allowedRole }) => {
  const { user } = useSelector((s) => s.auth);
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRole && user.role !== allowedRole) return <Navigate to="/login" replace />;
  return (
    <>
      <Navbar />
      {children}
    </>
  );
};

export default function App() {
  const { user } = useSelector((s) => s.auth);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />

        {/* Admin */}
        <Route path="/admin" element={
          <ProtectedLayout allowedRole="admin">
            <AdminDashboard onLogout={() => {}} />
          </ProtectedLayout>
        } />

        {/* Faculty */}
        <Route path="/faculty" element={
          <ProtectedLayout allowedRole="faculty">
            <FacultyDashboard />
          </ProtectedLayout>
        } />

        {/* Student */}
        <Route path="/student" element={
          <ProtectedLayout allowedRole="student">
            <StudentDashboard />
          </ProtectedLayout>
        } />

        {/* Default redirect */}
        <Route path="/" element={
          user
            ? <Navigate to={`/${user.role}`} replace />
            : <Navigate to="/login" replace />
        } />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
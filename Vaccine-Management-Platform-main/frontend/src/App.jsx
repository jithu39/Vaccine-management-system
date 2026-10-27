import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Contact from "./pages/Contact";
import About from "./pages/About";
import Account from "./pages/Account";
import ChatbotPage from "./pages/ChatbotPage";
import AuthProvider, { useAuth } from "./components/Auth.jsx";
import Chatbot from "./components/Chatbot.jsx";

import SearchPage from "./pages/resident/SearchPage";
import AddVaccineResidentPage from "./pages/resident/AddVaccineResidentPage";
import AddDiseaseResidentPage from "./pages/resident/AddDiseaseResidentPage"
import RequestsPage from "./pages/admin/RequestsPage.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminSearchPage from "./pages/admin/SearchPage.jsx";
import AppointmentsAdminPage from "./pages/admin/AppointmentsAdminPage.jsx";
import AppointmentsPage from "./pages/resident/AppointmentsPage.jsx";
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/account" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

// The chatbot API now requires a logged-in session, so only show the
// floating widget once a user is authenticated — avoids a confusing
// "having trouble connecting" message for anonymous visitors.
const ChatbotWidget = () => {
  const { user } = useAuth();
  if (!user) return null;
  return <Chatbot />;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/account" element={<Account />} />
          <Route
            path="/chatbot"
            element={
              <ProtectedRoute>
                <ChatbotPage />
              </ProtectedRoute>
            }
          />
          <Route path="/admin" element={
            <ProtectedRoute roles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/search" element={
            <ProtectedRoute roles={["admin"]}>
              <AdminSearchPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/requests" element={
            <ProtectedRoute roles={["admin"]}>
              <RequestsPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/appointments" element={
            <ProtectedRoute roles={["admin"]}>
              <AppointmentsAdminPage />
            </ProtectedRoute>
          } />
          <Route
            path="/resident/search"
            element={
              <ProtectedRoute roles={["resident"]}>
                <SearchPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resident/add-vaccine"
            element={
              <ProtectedRoute roles={["resident"]}>
                <AddVaccineResidentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resident/add-disease"
            element={
              <ProtectedRoute roles={["resident"]}>
                <AddDiseaseResidentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resident/appointments"
            element={
              <ProtectedRoute roles={["resident"]}>
                <AppointmentsPage />
              </ProtectedRoute>
            }
          />
        </Routes>
        <ChatbotWidget />
      </Router>
    </AuthProvider>
  );
};

export default App;
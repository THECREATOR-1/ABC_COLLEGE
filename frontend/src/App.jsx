import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import Departments from './pages/Departments';
import DepartmentDetail from './pages/DepartmentDetail';
import Venues from './pages/Venues';
import VenueDetail from './pages/VenueDetail';
import Gallery from './pages/Gallery';
import About from './pages/About';
import Contact from './pages/Contact';
import Register from './pages/Register';
import RegistrationSuccess from './pages/RegistrationSuccess';
import ParticipantLookup from './pages/ParticipantLookup';
import ParticipantDashboard from './pages/ParticipantDashboard';
import NotFound from './pages/NotFound';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminEvents from './pages/admin/AdminEvents';
import AdminDepartments from './pages/admin/AdminDepartments';
import AdminParticipants from './pages/admin/AdminParticipants';
import AdminQRScanner from './pages/admin/AdminQRScanner';
import AdminVenues from './pages/admin/AdminVenues';
import AdminReports from './pages/admin/AdminReports';
import AdminSponsors from './pages/admin/AdminSponsors';
import AdminFAQ from './pages/admin/AdminFAQ';
import AdminGallery from './pages/admin/AdminGallery';
import ProtectedRoute from './components/ProtectedRoute';

function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16 md:pt-20">{children}</main>
      <Footer />
    </>
  );
}

export default function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* ── Public Routes ─────────────────────────────────── */}
        <Route path="/"                      element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/events"                element={<PublicLayout><Events /></PublicLayout>} />
        <Route path="/events/:id"            element={<PublicLayout><EventDetails /></PublicLayout>} />
        <Route path="/departments"           element={<PublicLayout><Departments /></PublicLayout>} />
        <Route path="/departments/:id"       element={<PublicLayout><DepartmentDetail /></PublicLayout>} />
        <Route path="/venues"                element={<PublicLayout><Venues /></PublicLayout>} />
        <Route path="/venues/:id"            element={<PublicLayout><VenueDetail /></PublicLayout>} />
        <Route path="/gallery"               element={<PublicLayout><Gallery /></PublicLayout>} />
        <Route path="/about"                 element={<PublicLayout><About /></PublicLayout>} />
        <Route path="/contact"               element={<PublicLayout><Contact /></PublicLayout>} />
        <Route path="/register"              element={<PublicLayout><Register /></PublicLayout>} />
        <Route path="/register/:eventId"     element={<PublicLayout><Register /></PublicLayout>} />
        <Route path="/registration-success"  element={<PublicLayout><RegistrationSuccess /></PublicLayout>} />
        <Route path="/my-ticket"             element={<PublicLayout><ParticipantLookup /></PublicLayout>} />
        <Route path="/my-ticket/:regId"      element={<PublicLayout><ParticipantDashboard /></PublicLayout>} />

        {/* ── Admin Routes ──────────────────────────────────── */}
        <Route path="/admin/login"           element={<AdminLogin />} />
        <Route path="/admin"                 element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index                       element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"            element={<AdminDashboard />} />
          <Route path="events"               element={<AdminEvents />} />
          <Route path="departments"          element={<AdminDepartments />} />
          <Route path="participants"         element={<AdminParticipants />} />
          <Route path="venues"               element={<AdminVenues />} />
          <Route path="sponsors"             element={<AdminSponsors />} />
          <Route path="faq"                  element={<AdminFAQ />} />
          <Route path="gallery"              element={<AdminGallery />} />
          <Route path="reports"              element={<AdminReports />} />
          <Route path="scanner"              element={<AdminQRScanner />} />
        </Route>

        {/* ── 404 ──────────────────────────────────────────── */}
        <Route path="*"                      element={<PublicLayout><NotFound /></PublicLayout>} />
      </Routes>
    </AnimatePresence>
  );
}

import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiGrid, FiCalendar, FiLayers, FiUsers, FiMapPin, FiBarChart2, FiMaximize, FiLogOut, FiMenu, FiX, FiStar, FiHelpCircle, FiImage } from 'react-icons/fi';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const menuItems = [
  { path: '/admin', icon: FiGrid, label: 'Dashboard' },
  { path: '/admin/events', icon: FiCalendar, label: 'Events' },
  { path: '/admin/departments', icon: FiLayers, label: 'Departments' },
  { path: '/admin/venues', icon: FiMapPin, label: 'Venues' },
  { path: '/admin/participants', icon: FiUsers, label: 'Participants' },
  { path: '/admin/sponsors', icon: FiStar, label: 'Sponsors' },
  { path: '/admin/faq', icon: FiHelpCircle, label: 'FAQ' },
  { path: '/admin/gallery', icon: FiImage, label: 'Gallery' },
  { path: '/admin/scanner', icon: FiMaximize, label: 'QR Scanner' },
  { path: '/admin/reports', icon: FiBarChart2, label: 'Reports' },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, admin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const SidebarContent = () => (
    <>
      <div className="p-6">
        <h2 className="text-2xl font-bold font-poppins text-white mb-1">ABC Admin</h2>
        <p className="text-gray-400 text-sm">Welcome, {admin?.username}</p>
      </div>

      <nav className="mt-6 flex-1 px-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              location.pathname.startsWith(item.path) && (item.path !== '/admin' || location.pathname === '/admin/dashboard' || location.pathname === '/admin')
                ? 'bg-primary text-white shadow-glow'
                : 'text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10 mt-auto">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
        >
          <FiLogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-secondary text-white fixed h-full hidden lg:flex flex-col z-20">
        <SidebarContent />
      </aside>

      {/* Mobile Header & Sidebar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-secondary text-white z-30 flex items-center justify-between px-4">
        <h2 className="font-bold font-poppins">ABC Admin</h2>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
          {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-0 z-20 bg-secondary flex flex-col pt-16 lg:hidden"
          >
            <SidebarContent />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-6 md:p-8 lg:p-10 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

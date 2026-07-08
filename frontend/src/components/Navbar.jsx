import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiSearch } from 'react-icons/fi';

const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/events', label: 'Events' },
  { path: '/departments', label: 'Departments' },
  { path: '/venues', label: 'Venues' },
  { path: '/gallery', label: 'Gallery' },
  { path: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-white font-bold text-lg">
              A
            </div>
            <div className="hidden sm:block">
              <span className="font-poppins font-bold text-secondary text-lg">ABC College</span>
              <span className="block text-xs text-gray-500 -mt-1">Symposium Portal</span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  location.pathname === link.path
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:text-primary hover:bg-primary/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="w-px h-6 bg-gray-200 mx-2" />
            <Link to="/my-ticket" className="text-gray-600 hover:text-primary px-3 py-2 flex items-center gap-2 text-sm font-medium transition-all">
              <FiSearch /> My Ticket
            </Link>
            <Link to="/register" className="btn-primary text-sm !py-2 !px-4 ml-2">Register</Link>
          </div>

          <button className="lg:hidden p-2" onClick={() => setOpen(!open)}>
            {open ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t"
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setOpen(false)}
                  className={`block px-4 py-3 rounded-lg ${
                    location.pathname === link.path ? 'bg-primary text-white' : 'text-gray-600'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t my-2 border-gray-100" />
              <Link to="/my-ticket" onClick={() => setOpen(false)} className="block px-4 py-3 rounded-lg text-gray-600 flex items-center gap-2">
                <FiSearch /> My Ticket
              </Link>
              <Link to="/register" onClick={() => setOpen(false)} className="block btn-primary text-center mx-4">Register</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiHome, FiSearch, FiAlertCircle } from 'react-icons/fi';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
          transition={{ repeat: Infinity, repeatDelay: 3, duration: 0.6 }}
          className="text-8xl mb-6"
        >
          <FiAlertCircle className="mx-auto text-primary opacity-30" />
        </motion.div>

        <h1 className="text-8xl font-bold font-poppins text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-secondary mb-4">Page Not Found</h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
          Let's get you back on track!
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/" className="btn-primary flex items-center justify-center gap-2">
            <FiHome /> Go Home
          </Link>
          <Link to="/events" className="btn-secondary flex items-center justify-center gap-2">
            <FiSearch /> Browse Events
          </Link>
        </div>

        <p className="mt-12 text-sm text-gray-400">
          ABC Engineering College · National Level Symposium
        </p>
      </motion.div>
    </div>
  );
}

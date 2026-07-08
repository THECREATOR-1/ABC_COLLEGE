import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiLock, FiUser } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

export default function AdminLogin() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form);
      toast.success('Login successful!');
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary via-primary/90 to-accent p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow">
            <span className="text-2xl font-bold text-primary">A</span>
          </div>
          <h1 className="text-2xl font-poppins font-bold text-white">Admin Login</h1>
          <p className="text-gray-300 text-sm mt-2">ABC Symposium Management Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 shadow-2xl space-y-4">
          <div className="relative">
            <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="Username"
              required
              className="input-field pl-11"
            />
          </div>
          <div className="relative">
            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Password"
              required
              className="input-field pl-11"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          <p className="text-center text-sm text-gray-500">
            Default: admin / admin123
          </p>
          <Link to="/" className="block text-center text-sm text-primary hover:underline">Back to Website</Link>
        </form>
      </motion.div>
    </div>
  );
}

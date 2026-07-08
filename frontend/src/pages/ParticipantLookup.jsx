import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch, FiTag } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { registrationAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ParticipantLookup() {
  const [regId, setRegId] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!regId.trim()) {
      toast.error('Please enter a Registration ID');
      return;
    }

    setLoading(true);
    try {
      // Assuming ABC-timestamp-random format
      const formattedId = regId.trim().toUpperCase();
      const res = await registrationAPI.lookupByRegId(formattedId);
      if (res.data.success) {
        navigate(`/my-ticket/${formattedId}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration not found');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="glass rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary to-accent" />
          
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <FiTag size={32} />
            </div>
            <h2 className="text-3xl font-bold font-poppins text-secondary mb-2">My Ticket</h2>
            <p className="text-gray-500">Enter your Registration ID to view your ticket and QR code.</p>
          </div>

          <form onSubmit={handleSearch} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-secondary mb-2">Registration ID</label>
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={regId}
                  onChange={(e) => setRegId(e.target.value.toUpperCase())}
                  placeholder="e.g., ABC-12345678-XYZ"
                  className="input-field pl-12 font-mono uppercase tracking-wider"
                  required
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">Found in your confirmation email</p>
            </div>

            <button 
              type="submit" 
              className="btn-primary w-full flex justify-center items-center gap-2"
              disabled={loading}
            >
              {loading ? <LoadingSpinner size="sm" text="" /> : 'Find My Ticket'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

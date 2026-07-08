import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMapPin, FiCalendar } from 'react-icons/fi';
import { departmentAPI } from '../services/api';
import SkeletonLoader from '../components/SkeletonLoader';

const deptColors = ['from-blue-500 to-cyan-500', 'from-purple-500 to-pink-500', 'from-green-500 to-emerald-500', 'from-orange-500 to-red-500', 'from-indigo-500 to-blue-500', 'from-teal-500 to-green-500'];

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    departmentAPI.getAll()
      .then((res) => setDepartments(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="section-title mb-4">Departments</h1>
          <p className="text-gray-500">Explore events organized by each department</p>
        </motion.div>

        {loading ? <SkeletonLoader count={6} /> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept, i) => (
              <motion.div
                key={dept.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link to={`/departments/${dept.id}`} className="card block group hover:-translate-y-1">
                  <div className={`h-2 rounded-full bg-gradient-to-r ${deptColors[i % deptColors.length]} mb-4`} />
                  <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">{dept.code}</span>
                  <h3 className="font-poppins font-semibold text-lg mt-3 group-hover:text-primary transition">{dept.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-3">
                    <FiMapPin className="text-accent" /> {dept.venue}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                    <FiCalendar className="text-accent" /> {dept.event_count || 0} Events
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

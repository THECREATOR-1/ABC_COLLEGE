import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiUsers, FiLayers, FiTrendingUp, FiDollarSign, FiMapPin, FiStar, FiHelpCircle, FiImage } from 'react-icons/fi';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { eventAPI, registrationAPI, venueAPI, sponsorAPI, faqAPI, galleryAPI } from '../../services/api';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';

const COLORS = ['#2563EB', '#06B6D4', '#8B5CF6', '#F59E0B', '#10B981', '#EF4444'];

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [charts, setCharts] = useState({});
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      registrationAPI.getStats(),
      registrationAPI.getCharts(),
      registrationAPI.getAll({ limit: 5 }),
      venueAPI.getAll(),
      sponsorAPI.getAll(),
      faqAPI.getAll(),
      galleryAPI.getAll()
    ]).then(([statsRes, chartsRes, recentRes, venueRes, sponsorRes, faqRes, galleryRes]) => {
      setStats({
        ...statsRes.data.data,
        totalVenues: venueRes.data.data.length,
        totalSponsors: sponsorRes.data.data.length,
        totalFAQ: faqRes.data.data.length,
        totalGallery: galleryRes.data.data.length
      });
      setCharts(chartsRes.data.data);
      setRecent(recentRes.data.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const statCards = [
    { icon: FiCalendar, label: 'Total Events', value: stats.totalEvents, color: 'bg-blue-500' },
    { icon: FiLayers, label: 'Departments', value: stats.totalDepartments, color: 'bg-purple-500' },
    { icon: FiUsers, label: 'Participants', value: stats.totalParticipants, color: 'bg-green-500' },
    { icon: FiTrendingUp, label: "Today's Reg", value: stats.todayRegistrations, color: 'bg-orange-500' },
    { icon: FiDollarSign, label: 'Revenue', value: `₹${stats.totalRevenue || 0}`, color: 'bg-cyan-500' },
    { icon: FiMapPin, label: 'Total Venues', value: stats.totalVenues, color: 'bg-rose-500' },
    { icon: FiStar, label: 'Sponsors', value: stats.totalSponsors, color: 'bg-yellow-500' },
    { icon: FiHelpCircle, label: 'FAQs', value: stats.totalFAQ, color: 'bg-indigo-500' },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-3xl font-bold text-secondary font-poppins mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card !p-4">
            <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center text-white mb-3`}>
              <card.icon />
            </div>
            <p className="text-2xl font-bold text-secondary">{card.value ?? '—'}</p>
            <p className="text-sm text-gray-500 truncate">{card.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="card mb-8">
        <h3 className="font-semibold mb-4">Quick Management Links</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/admin/participants" className="btn-secondary text-center text-sm py-3">Participants</Link>
          <Link to="/admin/events" className="btn-secondary text-center text-sm py-3">Events</Link>
          <Link to="/admin/departments" className="btn-secondary text-center text-sm py-3">Departments</Link>
          <Link to="/admin/venues" className="btn-secondary text-center text-sm py-3">Venues</Link>
          <Link to="/admin/sponsors" className="btn-secondary text-center text-sm py-3">Sponsors</Link>
          <Link to="/admin/faq" className="btn-secondary text-center text-sm py-3">FAQs</Link>
          <Link to="/admin/gallery" className="btn-secondary text-center text-sm py-3">Gallery</Link>
          <Link to="/admin/scanner" className="btn-secondary text-center text-sm py-3">QR Scanner</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <h3 className="font-semibold mb-4">Registrations by Department</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={charts.departmentPie || []} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {(charts.departmentPie || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card lg:col-span-2">
          <h3 className="font-semibold mb-4">Top Events by Registrations</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={charts.eventBar || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={60} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="registrations" fill="#2563EB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold mb-4">Daily Registrations (30 Days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={charts.dailyLine || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#06B6D4" strokeWidth={2} dot={{ fill: '#2563EB' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-4">Recent Registrations</h3>
          <div className="space-y-3">
            {recent.map((reg) => (
              <div key={reg.id} className="flex items-center justify-between p-3 bg-background rounded-xl">
                <div>
                  <p className="font-medium text-sm">{reg.student_name}</p>
                  <p className="text-xs text-gray-500">{reg.event_name}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${reg.payment_status === 'paid' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                  {reg.payment_status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

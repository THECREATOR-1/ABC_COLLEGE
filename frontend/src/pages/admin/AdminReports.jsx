import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiDownload, FiFileText, FiBarChart2, FiPieChart } from 'react-icons/fi';
import { registrationAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import LoadingSpinner from '../../components/LoadingSpinner';

const COLORS = ['#2563EB', '#06B6D4', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'];

export default function AdminReports() {
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    registrationAPI.getCharts()
      .then(res => setCharts(res.data.data))
      .catch(err => toast.error('Failed to load chart data'))
      .finally(() => setLoading(false));
  }, []);

  const handleExport = async (format) => {
    const toastId = toast.loading(`Generating ${format.toUpperCase()} export...`);
    try {
      const res = await registrationAPI.export(format);
      const blob = new Blob([res.data], { 
        type: format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `symposium_registrations.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Export completed!', { id: toastId });
    } catch (e) {
      toast.error('Export failed', { id: toastId });
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-secondary font-poppins">Reports & Analytics</h1>
          <p className="text-gray-500">Comprehensive overview of symposium performance</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => handleExport('csv')} className="btn-secondary flex items-center gap-2 !py-2">
            <FiFileText /> Export CSV
          </button>
          <button onClick={() => handleExport('xlsx')} className="btn-primary flex items-center gap-2 !py-2">
            <FiDownload /> Export Excel
          </button>
        </div>
      </div>

      {charts && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Events Chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
              <h3 className="text-lg font-bold text-secondary mb-6 flex items-center gap-2"><FiBarChart2 className="text-primary"/> Top Events by Registration</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.eventBar} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={150} tick={{fontSize: 12}} />
                    <RechartsTooltip cursor={{fill: 'transparent'}} />
                    <Legend />
                    <Bar dataKey="registrations" name="Registrations" fill="#2563EB" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Department Distribution */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card">
              <h3 className="text-lg font-bold text-secondary mb-6 flex items-center gap-2"><FiPieChart className="text-accent"/> Revenue by Department</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={charts.departmentPie}
                      cx="50%" cy="50%"
                      innerRadius={80} outerRadius={120}
                      paddingAngle={5}
                      dataKey="count"
                      nameKey="name"
                      label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {charts.departmentPie.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* Registration Trend */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card">
            <h3 className="text-lg font-bold text-secondary mb-6">Registration Trend (Last 30 Days)</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.dailyLine} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tick={{fontSize: 12}} />
                  <YAxis />
                  <RechartsTooltip />
                  <Line type="monotone" dataKey="count" name="Daily Registrations" stroke="#06B6D4" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

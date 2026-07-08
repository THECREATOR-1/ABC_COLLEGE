import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMapPin } from 'react-icons/fi';
import { departmentAPI } from '../services/api';
import EventCard from '../components/EventCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function DepartmentDetail() {
  const { id } = useParams();
  const [dept, setDept] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    departmentAPI.getById(id)
      .then((res) => setDept(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!dept) return <div className="text-center py-20">Department not found</div>;

  const technical = dept.events?.filter((e) => e.event_type === 'Technical') || [];
  const nonTechnical = dept.events?.filter((e) => e.event_type === 'Non Technical') || [];

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card mb-12 bg-gradient-to-r from-primary to-accent text-white !p-8">
          <span className="bg-white/20 px-3 py-1 rounded-full text-sm">{dept.code}</span>
          <h1 className="text-3xl font-poppins font-bold mt-4">{dept.name}</h1>
          <p className="flex items-center gap-2 mt-3 opacity-90"><FiMapPin /> Venue: {dept.venue}</p>
          <p className="mt-2 opacity-80">{dept.description}</p>
        </motion.div>

        {technical.length > 0 && (
          <section className="mb-12">
            <h2 className="section-title text-2xl mb-6">Technical Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {technical.map((event, i) => <EventCard key={event.id} event={{ ...event, department_name: dept.name }} index={i} />)}
            </div>
          </section>
        )}

        {nonTechnical.length > 0 && (
          <section>
            <h2 className="section-title text-2xl mb-6">Non-Technical Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {nonTechnical.map((event, i) => <EventCard key={event.id} event={{ ...event, department_name: dept.name }} index={i} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

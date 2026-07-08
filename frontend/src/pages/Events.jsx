import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiFilter } from 'react-icons/fi';
import { eventAPI, departmentAPI } from '../services/api';
import EventCard from '../components/EventCard';
import SkeletonLoader from '../components/SkeletonLoader';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    departmentAPI.getAll().then((res) => setDepartments(res.data.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    eventAPI.getAll({ search, department, type, page, limit: 9 })
      .then((res) => {
        setEvents(res.data.data);
        setPagination(res.data.pagination);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, department, type, page]);

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="section-title mb-4">All Events</h1>
          <p className="text-gray-500">Browse and register for symposium events</p>
        </motion.div>

        <div className="card mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="input-field pl-11"
            />
          </div>
          <select value={department} onChange={(e) => { setDepartment(e.target.value); setPage(1); }} className="input-field md:w-48">
            <option value="">All Departments</option>
            {departments.map((d) => <option key={d.id} value={d.id}>{d.code}</option>)}
          </select>
          <select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }} className="input-field md:w-48">
            <option value="">All Types</option>
            <option value="Technical">Technical</option>
            <option value="Non Technical">Non Technical</option>
          </select>
        </div>

        {loading ? <SkeletonLoader count={6} /> : events.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <FiFilter className="mx-auto text-4xl mb-4" />
            <p>No events found matching your criteria</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event, i) => <EventCard key={event.id} event={event} index={i} />)}
            </div>
            {pagination.pages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                {Array.from({ length: pagination.pages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-10 h-10 rounded-lg font-medium ${page === i + 1 ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-primary/10'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

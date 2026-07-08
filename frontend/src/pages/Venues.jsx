import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMapPin, FiUsers, FiLayers, FiArrowRight } from 'react-icons/fi';
import { venueAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const deptColors = {
  CSE:    'from-violet-500 to-purple-600',
  ECE:    'from-pink-500 to-rose-600',
  IT:     'from-green-500 to-emerald-600',
  'AI&DS':'from-orange-500 to-amber-600',
  'AI&ML':'from-purple-500 to-indigo-600',
  EEE:    'from-cyan-500 to-blue-600',
};

const deptIcons = { CSE:'💻', ECE:'📡', IT:'🌐', 'AI&DS':'📊', 'AI&ML':'🤖', EEE:'⚡' };

export default function Venues() {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    venueAPI.getAll()
      .then(r => setVenues(r.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            Event Venues
          </span>
          <h1 className="text-4xl md:text-5xl font-bold font-poppins text-secondary mb-4">
            Symposium Venues
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Each department hosts events in their dedicated block. Explore the facilities,
            capacity, and directions for each venue.
          </p>
        </motion.div>

        {loading ? (
          <LoadingSpinner text="Loading venues..." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {venues.map((venue, i) => {
              const code  = venue.department_code || 'CSE';
              const grad  = deptColors[code] || 'from-primary to-accent';
              const emoji = deptIcons[code]  || '🏛️';

              return (
                <motion.div
                  key={venue.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -6 }}
                  className="card overflow-hidden group"
                >
                  {/* Color banner */}
                  <div className={`h-3 bg-gradient-to-r ${grad}`} />

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-4xl">{emoji}</div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${grad}`}>
                        {code}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold font-poppins text-secondary mb-1 group-hover:text-primary transition">
                      {venue.name}
                    </h3>
                    <p className="text-sm text-primary font-medium mb-4">
                      {venue.department_name}
                    </p>

                    <div className="space-y-2 text-sm text-gray-500 mb-5">
                      <div className="flex items-center gap-2">
                        <FiMapPin className="text-primary flex-shrink-0" />
                        <span>{venue.building} · {venue.floor} · {venue.room_number}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiUsers className="text-accent flex-shrink-0" />
                        <span>Capacity: {venue.capacity} participants</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiLayers className="text-green-500 flex-shrink-0" />
                        <span>{venue.event_count || 0} events scheduled</span>
                      </div>
                    </div>

                    <Link
                      to={`/venues/${venue.id}`}
                      className="flex items-center gap-2 text-primary font-semibold text-sm hover:gap-3 transition-all"
                    >
                      View Venue Details <FiArrowRight />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {!loading && venues.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-4">🏛️</p>
            <p className="text-lg">No venues found. Please run the seed script.</p>
          </div>
        )}
      </div>
    </div>
  );
}

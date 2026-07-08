import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMapPin, FiUsers, FiInfo, FiArrowLeft, FiCompass } from 'react-icons/fi';
import { venueAPI } from '../services/api';
import EventCard from '../components/EventCard';
import LoadingSpinner from '../components/LoadingSpinner';

const deptColors = {
  CSE:    'from-violet-500 to-purple-600',
  ECE:    'from-pink-500 to-rose-600',
  IT:     'from-green-500 to-emerald-600',
  'AI&DS':'from-orange-500 to-amber-600',
  'AI&ML':'from-purple-500 to-indigo-600',
  EEE:    'from-cyan-500 to-blue-600',
};

export default function VenueDetail() {
  const { id } = useParams();
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    venueAPI.getById(id)
      .then(r => setVenue(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner text="Loading venue details..." />;
  if (!venue) return <div className="text-center py-20">Venue not found</div>;

  const grad = deptColors[venue.department_code] || 'from-primary to-accent';

  return (
    <div className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <Link to="/venues" className="inline-flex items-center gap-2 text-primary hover:text-accent mb-8 transition-colors">
          <FiArrowLeft /> Back to Venues
        </Link>

        {/* Hero Section */}
        <div className="bg-white rounded-3xl shadow-card overflow-hidden mb-12 relative">
          <div className={`h-32 md:h-48 bg-gradient-to-r ${grad} opacity-90`} />
          
          <div className="px-6 md:px-12 pb-12 -mt-16 relative z-10">
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg inline-block w-full max-w-4xl">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${grad} mb-4`}>
                    {venue.department_name}
                  </span>
                  <h1 className="text-3xl md:text-5xl font-bold font-poppins text-secondary mb-4">
                    {venue.name}
                  </h1>
                  
                  <div className="flex flex-wrap items-center gap-4 text-gray-600 text-sm md:text-base">
                    <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg">
                      <FiMapPin className="text-primary" />
                      <span className="font-medium">{venue.building}, {venue.floor}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg">
                      <FiInfo className="text-primary" />
                      <span className="font-medium">Room {venue.room_number}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg">
                      <FiUsers className="text-primary" />
                      <span className="font-medium">Capacity: {venue.capacity}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <div className="lg:col-span-2 space-y-8">
            <div className="card">
              <h2 className="text-2xl font-bold font-poppins text-secondary mb-6 flex items-center gap-2">
                <FiCompass className="text-accent" /> Directions
              </h2>
              <p className="text-gray-600 leading-relaxed text-lg">
                {venue.directions || 'No directions provided.'}
              </p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="card bg-gradient-to-br from-gray-50 to-white">
              <h3 className="font-bold font-poppins text-secondary mb-4">Facilities</h3>
              <ul className="space-y-3">
                {venue.facilities ? venue.facilities.split(',').map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-600">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    {f.trim()}
                  </li>
                )) : (
                  <li className="text-gray-500">Standard classroom setup</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Events at this Venue */}
        <div>
          <h2 className="text-3xl font-bold font-poppins text-secondary mb-8 text-center">
            Events at {venue.name}
          </h2>
          
          {venue.events && venue.events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {venue.events.map((event, i) => (
                <EventCard key={event.id} event={event} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-2xl">
              <p className="text-gray-500 text-lg">No upcoming events scheduled at this venue.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

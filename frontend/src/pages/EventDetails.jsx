import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCalendar, FiClock, FiMapPin, FiUser, FiPhone, FiAward, FiUsers } from 'react-icons/fi';
import { eventAPI } from '../services/api';
import CountdownTimer from '../components/CountdownTimer';
import LoadingSpinner from '../components/LoadingSpinner';

export default function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    eventAPI.getById(id)
      .then((res) => setEvent(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner text="Loading event details..." />;
  if (!event) return <div className="text-center py-20">Event not found</div>;

  const imageUrl = event.image || `https://picsum.photos/seed/event${event.id}/1200/600`;

  return (
    <div>
      <div className="relative h-64 md:h-96">
        <img
          src={imageUrl.startsWith('http') ? imageUrl : `http://localhost:5000${imageUrl}`}
          alt={event.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto">
            <span className="px-3 py-1 bg-primary text-white rounded-full text-sm">{event.event_type}</span>
            <h1 className="text-3xl md:text-5xl font-poppins font-bold text-white mt-4">{event.name}</h1>
            <p className="text-gray-300 mt-2">{event.department_name}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
              <h2 className="font-poppins font-semibold text-xl mb-4">About This Event</h2>
              <p className="text-gray-600 leading-relaxed">{event.description}</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card">
              <h2 className="font-poppins font-semibold text-xl mb-4">Rules & Regulations</h2>
              <pre className="text-gray-600 whitespace-pre-wrap font-sans text-sm leading-relaxed">{event.rules}</pre>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card">
              <h2 className="font-poppins font-semibold text-xl mb-4">Eligibility</h2>
              <p className="text-gray-600">{event.eligibility}</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card">
              <h2 className="font-poppins font-semibold text-xl mb-4 flex items-center gap-2"><FiAward className="text-primary" /> Prize Details</h2>
              <p className="text-gray-600">{event.prize_details}</p>
            </motion.div>
          </div>

          <div className="space-y-6">
            <div className="card sticky top-24">
              <h3 className="font-poppins font-semibold text-lg mb-6">Event Information</h3>
              <div className="space-y-4 text-sm">
                <div className="flex items-center gap-3"><FiCalendar className="text-primary" /> {new Date(event.event_date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                <div className="flex items-center gap-3"><FiClock className="text-primary" /> {event.event_time?.slice(0, 5)}</div>
                <div className="flex items-center gap-3"><FiMapPin className="text-primary" /> {event.venue}</div>
                <div className="flex items-center gap-3"><FiUser className="text-primary" /> {event.coordinator_name}</div>
                <div className="flex items-center gap-3"><FiPhone className="text-primary" /> {event.coordinator_phone}</div>
                <div className="flex items-center gap-3"><FiUsers className="text-primary" /> {event.available_seats} / {event.max_participants} seats</div>
              </div>

              <div className="mt-6 p-4 bg-background rounded-xl text-center">
                <p className="text-sm text-gray-500">Registration Fee</p>
                <p className="text-3xl font-bold text-primary font-poppins">₹{event.registration_fee}</p>
              </div>

              <div className="my-6">
                <p className="text-sm text-gray-500 text-center mb-4">Event starts in</p>
                <CountdownTimer targetDate={event.event_date} targetTime={event.event_time} />
              </div>

              {event.available_seats > 0 ? (
                <Link to={`/register/${event.id}`} className="btn-primary w-full text-center block">
                  Register Now
                </Link>
              ) : (
                <button disabled className="w-full py-3 bg-gray-300 text-gray-500 rounded-xl cursor-not-allowed">
                  Seats Full
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCalendar, FiMapPin, FiUsers, FiClock } from 'react-icons/fi';

export default function EventCard({ event, index = 0 }) {
  const imageUrl = event.image || `https://picsum.photos/seed/event${event.id}/600/400`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="card group overflow-hidden !p-0"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={imageUrl.startsWith('http') ? imageUrl : `http://localhost:5000${imageUrl}`}
          alt={event.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 left-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            event.event_type === 'Technical' ? 'bg-primary text-white' : 'bg-accent text-white'
          }`}>
            {event.event_type}
          </span>
        </div>
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-bold text-primary">
          ₹{event.registration_fee}
        </div>
      </div>

      <div className="p-5">
        <p className="text-xs text-primary font-medium mb-1">{event.department_name}</p>
        <h3 className="font-poppins font-semibold text-lg text-secondary mb-3 group-hover:text-primary transition">
          {event.name}
        </h3>

        <div className="space-y-2 text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-2"><FiCalendar className="text-accent" /> {new Date(event.event_date).toLocaleDateString()}</div>
          <div className="flex items-center gap-2"><FiClock className="text-accent" /> {event.event_time?.slice(0, 5)}</div>
          <div className="flex items-center gap-2"><FiMapPin className="text-accent" /> {event.venue}</div>
          <div className="flex items-center gap-2"><FiUsers className="text-accent" /> {event.available_seats} seats left</div>
        </div>

        <Link to={`/events/${event.id}`} className="btn-primary w-full text-center block text-sm !py-2">
          View Details
        </Link>
      </div>
    </motion.div>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiAward, FiUsers, FiCalendar } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';
import { eventAPI, galleryAPI, sponsorAPI, faqAPI } from '../services/api';
import EventCard from '../components/EventCard';
import SkeletonLoader from '../components/SkeletonLoader';
import LoadingSpinner from '../components/LoadingSpinner';

const stats = [
  { icon: FiCalendar, label: 'Events', key: 'totalEvents' },
  { icon: FiUsers, label: 'Departments', key: 'totalDepartments' },
  { icon: FaStar, label: 'Participants', key: 'totalParticipants' },
  { icon: FiAward, label: 'Prizes Worth', value: '₹5L+' },
];

const testimonials = [
  { name: 'Arun Kumar', dept: 'CSE', text: 'Amazing symposium experience! The hackathon was well organized and the prizes were incredible.' },
  { name: 'Divya S', dept: 'ECE', text: 'Best college event I have attended. Great learning opportunities and networking.' },
  { name: 'Rahul M', dept: 'IT', text: 'The coding contest was challenging and fun. Looking forward to next year!' },
];

const sponsors = ['TechCorp', 'InnovateLab', 'CloudSys', 'DataFlow', 'CodeBase', 'AI Ventures'];

export default function Home() {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [statsData, setStatsData] = useState({});
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      eventAPI.getUpcoming(),
      eventAPI.getStats(),
      galleryAPI.getAll(),
    ]).then(([eventsRes, statsRes, galleryRes]) => {
      setUpcomingEvents(eventsRes.data.data.slice(0, 6));
      setStatsData(statsRes.data.data);
      setGallery(galleryRes.data.data.slice(0, 6));
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1920&q=80"
            alt="College Symposium"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-secondary/95 via-secondary/80 to-primary/60" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <span className="inline-block px-4 py-2 bg-accent/20 text-accent rounded-full text-sm font-medium mb-6">
              Symposium 2024
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-poppins font-bold text-white leading-tight mb-6">
              ABC Engineering College Symposium
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Innovation • Technology • Competition • Learning
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/events" className="btn-primary flex items-center gap-2">
                Explore Events <FiArrowRight />
              </Link>
              <Link to="/register" className="btn-secondary !bg-white/10 !border-white/30 !text-white hover:!bg-white hover:!text-primary">
                Register Now
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-6 rounded-2xl bg-background hover:shadow-card transition"
              >
                <stat.icon className="mx-auto text-primary text-3xl mb-3" />
                <p className="text-3xl font-bold text-secondary font-poppins">
                  {stat.value || statsData[stat.key] || '—'}
                </p>
                <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title mb-4">Upcoming Events</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Discover exciting technical and non-technical events across all departments</p>
          </div>
          {loading ? <SkeletonLoader count={3} /> : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event, i) => (
                <EventCard key={event.id} event={event} index={i} />
              ))}
            </div>
          )}
          <div className="text-center mt-10">
            <Link to="/events" className="btn-primary inline-flex items-center gap-2">
              View All Events <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Sponsors */}
      <section className="py-16 bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title text-white text-center mb-10">Our Sponsors</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {sponsors.map((sponsor) => (
              <div key={sponsor} className="glass rounded-xl p-6 text-center hover:scale-105 transition">
                <p className="font-poppins font-semibold text-secondary">{sponsor}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title text-center mb-12">What Students Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <FaStar key={j} className="text-yellow-400" />)}
                </div>
                <p className="text-gray-600 mb-4 italic">"{t.text}"</p>
                <div>
                  <p className="font-semibold text-secondary">{t.name}</p>
                  <p className="text-sm text-primary">{t.dept}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Preview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title text-center mb-12">Gallery</h2>
          {loading ? <LoadingSpinner /> : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {gallery.map((item) => (
                <div key={item.id} className="group relative overflow-hidden rounded-2xl aspect-[4/3]">
                  <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-secondary/80 to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-4">
                    <p className="text-white font-semibold">{item.title}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="text-center mt-10">
            <Link to="/gallery" className="btn-secondary">View Full Gallery</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

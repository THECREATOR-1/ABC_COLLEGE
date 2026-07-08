import { motion } from 'framer-motion';
import { FiTarget, FiEye, FiAward } from 'react-icons/fi';

export default function About() {
  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="section-title mb-4">About ABC Engineering College</h1>
          <p className="text-gray-500 max-w-3xl mx-auto">
            ABC Engineering College is a premier institution committed to excellence in technical education,
            research, and innovation since 1995.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="card">
            <img src="https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80" alt="College Campus" className="rounded-xl w-full h-64 object-cover mb-6" />
            <h2 className="font-poppins font-semibold text-xl mb-4">Our Institution</h2>
            <p className="text-gray-600 leading-relaxed">
              ABC Engineering College stands as a beacon of academic excellence, offering world-class infrastructure,
              experienced faculty, and a vibrant campus life. Our annual symposium brings together the brightest minds
              from across the region to compete, collaborate, and celebrate innovation.
            </p>
          </motion.div>

          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center"><FiEye className="text-primary text-xl" /></div>
                <h2 className="font-poppins font-semibold text-xl">Vision</h2>
              </div>
              <p className="text-gray-600">To be a globally recognized center of excellence in engineering education, producing innovative leaders who contribute to society through technology and research.</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center"><FiTarget className="text-accent text-xl" /></div>
                <h2 className="font-poppins font-semibold text-xl">Mission</h2>
              </div>
              <p className="text-gray-600">To provide quality technical education through innovative teaching methodologies, foster research culture, and develop skilled professionals with strong ethical values.</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center"><FiAward className="text-green-500 text-xl" /></div>
                <h2 className="font-poppins font-semibold text-xl">Achievements</h2>
              </div>
              <ul className="text-gray-600 space-y-2 text-sm">
                <li>• NAAC A+ Accredited Institution</li>
                <li>• 95% Placement Record</li>
                <li>• 50+ Industry Partnerships</li>
                <li>• 100+ Research Publications Annually</li>
              </ul>
            </motion.div>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="card bg-gradient-to-r from-secondary to-primary text-white !p-8 md:!p-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&q=80" alt="Principal" className="w-32 h-32 rounded-full object-cover border-4 border-white/30" />
            <div>
              <h2 className="font-poppins font-semibold text-2xl mb-2">Principal's Message</h2>
              <p className="text-gray-200 leading-relaxed italic mb-4">
                "Welcome to ABC Engineering College Symposium 2024. This event represents our commitment to nurturing
                talent and fostering innovation. I encourage all students to participate actively and make the most
                of this wonderful opportunity to learn, compete, and grow."
              </p>
              <p className="font-semibold">Dr. S. Venkatesh</p>
              <p className="text-sm text-gray-300">Principal, ABC Engineering College</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

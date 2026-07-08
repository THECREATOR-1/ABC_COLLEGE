import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { galleryAPI } from '../services/api';
import SkeletonLoader from '../components/SkeletonLoader';

export default function Gallery() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    galleryAPI.getAll()
      .then((res) => setItems(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const categories = ['All', ...new Set(items.map((i) => i.category))];
  const filtered = filter === 'All' ? items : items.filter((i) => i.category === filter);

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="section-title mb-4">Gallery</h1>
          <p className="text-gray-500">Memories from past symposium events</p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                filter === cat ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-primary/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? <SkeletonLoader count={6} /> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="group relative overflow-hidden rounded-2xl aspect-[4/3] cursor-pointer"
              >
                <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-6">
                  <span className="text-accent text-xs font-medium mb-1">{item.category}</span>
                  <h3 className="text-white font-poppins font-semibold text-lg">{item.title}</h3>
                  <p className="text-gray-300 text-sm mt-1">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

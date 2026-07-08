import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiMapPin, FiUsers } from 'react-icons/fi';
import { venueAPI, departmentAPI } from '../../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminVenues() {
  const [venues, setVenues] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const emptyForm = { name: '', building: '', floor: '', room_number: '', capacity: 100, facilities: '', directions: '', department_id: '' };
  const [formData, setFormData] = useState(emptyForm);

  const fetchData = async () => {
    try {
      const [vRes, dRes] = await Promise.all([venueAPI.getAll(), departmentAPI.getAll()]);
      setVenues(vRes.data.data);
      setDepartments(dRes.data.data);
    } catch (e) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const d = { ...formData, department_id: formData.department_id || null };
      if (editingId) {
        await venueAPI.update(editingId, d);
        toast.success('Venue updated');
      } else {
        await venueAPI.create(d);
        toast.success('Venue created');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Error saving venue');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this venue?')) {
      try {
        await venueAPI.delete(id);
        toast.success('Venue deleted');
        fetchData();
      } catch (e) { toast.error('Error deleting venue'); }
    }
  };

  const openModal = (venue = null) => {
    if (venue) {
      setEditingId(venue.id);
      setFormData({
        name: venue.name, building: venue.building || '', floor: venue.floor || '',
        room_number: venue.room_number || '', capacity: venue.capacity,
        facilities: venue.facilities || '', directions: venue.directions || '',
        department_id: venue.department_id || ''
      });
    } else {
      setEditingId(null);
      setFormData(emptyForm);
    }
    setIsModalOpen(true);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-secondary font-poppins">Manage Venues</h1>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
          <FiPlus /> Add Venue
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {venues.map(v => (
          <div key={v.id} className="card relative overflow-hidden group">
            <div className="p-6">
              <h3 className="text-xl font-bold text-secondary mb-2">{v.name}</h3>
              {v.department_name && <p className="text-sm text-primary font-medium mb-4">{v.department_name}</p>}
              
              <div className="space-y-2 text-sm text-gray-600 mb-6">
                <div className="flex items-center gap-2"><FiMapPin /> {v.building} {v.room_number && `(${v.room_number})`}</div>
                <div className="flex items-center gap-2"><FiUsers /> Capacity: {v.capacity}</div>
                <div>Events Scheduled: <span className="font-bold text-primary">{v.event_count || 0}</span></div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => openModal(v)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-2">
                  <FiEdit2 /> Edit
                </button>
                <button onClick={() => handleDelete(v.id)} className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 transition flex items-center justify-center gap-2">
                  <FiTrash2 /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary/50 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-secondary font-poppins">{editingId ? 'Edit Venue' : 'Add Venue'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Venue Name *</label>
                  <input type="text" required value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department (Optional)</label>
                  <select value={formData.department_id} onChange={e=>setFormData({...formData, department_id: e.target.value})} className="input-field">
                    <option value="">-- None --</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Building</label>
                  <input type="text" value={formData.building} onChange={e=>setFormData({...formData, building: e.target.value})} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
                  <input type="text" value={formData.room_number} onChange={e=>setFormData({...formData, room_number: e.target.value})} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Floor</label>
                  <input type="text" value={formData.floor} onChange={e=>setFormData({...formData, floor: e.target.value})} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                  <input type="number" required value={formData.capacity} onChange={e=>setFormData({...formData, capacity: e.target.value})} className="input-field" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Facilities (comma separated)</label>
                <input type="text" value={formData.facilities} onChange={e=>setFormData({...formData, facilities: e.target.value})} className="input-field" placeholder="Projector, AC, WiFi" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Directions</label>
                <textarea rows="3" value={formData.directions} onChange={e=>setFormData({...formData, directions: e.target.value})} className="input-field" />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded-xl text-gray-600 font-medium hover:bg-gray-100">Cancel</button>
                <button type="submit" className="btn-primary">Save Venue</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

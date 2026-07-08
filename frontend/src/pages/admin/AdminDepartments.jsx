import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { departmentAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminDepartments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', code: '', venue: '', description: '' });

  const fetchData = () => {
    departmentAPI.getAll()
      .then((res) => setDepartments(res.data.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await departmentAPI.update(editId, form);
        toast.success('Department updated');
      } else {
        await departmentAPI.create(form);
        toast.success('Department created');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this department? All related events will be deleted.')) return;
    try {
      await departmentAPI.delete(id);
      toast.success('Department deleted');
      fetchData();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex justify-between mb-6">
        <p className="text-gray-500">{departments.length} departments</p>
        <button onClick={() => { setEditId(null); setForm({ name: '', code: '', venue: '', description: '' }); setShowModal(true); }} className="btn-primary flex items-center gap-2 text-sm !py-2"><FiPlus /> Add Department</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((dept) => (
          <div key={dept.id} className="card">
            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">{dept.code}</span>
            <h3 className="font-semibold mt-2">{dept.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{dept.venue}</p>
            <p className="text-xs text-gray-400 mt-2">{dept.event_count} events</p>
            <div className="flex gap-2 mt-4">
              <button onClick={() => { setEditId(dept.id); setForm(dept); setShowModal(true); }} className="p-2 hover:bg-primary/10 rounded-lg text-primary"><FiEdit2 /></button>
              <button onClick={() => handleDelete(dept.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-500"><FiTrash2 /></button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4">
            <h2 className="font-poppins font-semibold text-xl">{editId ? 'Edit' : 'Add'} Department</h2>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" required className="input-field" />
            <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="Code" required className="input-field" />
            <input value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} placeholder="Venue" required className="input-field" />
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className="input-field" />
            <div className="flex gap-3">
              <button type="submit" className="btn-primary flex-1">{editId ? 'Update' : 'Create'}</button>
              <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

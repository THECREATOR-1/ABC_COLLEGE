import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { eventAPI, departmentAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const emptyForm = {
  name: '', department_id: '', venue: '', event_date: '', event_time: '',
  description: '', rules: '', coordinator_name: '', coordinator_phone: '',
  max_participants: 50, registration_fee: 100, available_seats: 50,
  prize_details: '', event_type: 'Technical', eligibility: '',
};

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const fetchData = () => {
    Promise.all([
      eventAPI.getAll({ limit: 100 }),
      departmentAPI.getAll(),
    ]).then(([evRes, deptRes]) => {
      setEvents(evRes.data.data);
      setDepartments(deptRes.data.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => { setEditId(null); setForm(emptyForm); setShowModal(true); };

  const openEdit = (event) => {
    setEditId(event.id);
    setForm({
      ...event,
      event_date: event.event_date?.split('T')[0],
      event_time: event.event_time?.slice(0, 5),
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, department_id: parseInt(form.department_id) };
      if (editId) {
        await eventAPI.update(editId, payload);
        toast.success('Event updated');
      } else {
        await eventAPI.create(payload);
        toast.success('Event created');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this event?')) return;
    try {
      await eventAPI.delete(id);
      toast.success('Event deleted');
      fetchData();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-secondary font-poppins">Manage Events</h1>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm !py-2"><FiPlus /> Add Event</button>
      </div>

      <div className="card overflow-x-auto !p-0">
        <table className="w-full text-sm">
          <thead className="bg-background">
            <tr>
              <th className="text-left p-4">Event</th>
              <th className="text-left p-4">Department</th>
              <th className="text-left p-4">Type</th>
              <th className="text-left p-4">Date</th>
              <th className="text-left p-4">Seats</th>
              <th className="text-left p-4">Fee</th>
              <th className="text-left p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id} className="border-t hover:bg-background/50">
                <td className="p-4 font-medium">{event.name}</td>
                <td className="p-4">{event.department_name}</td>
                <td className="p-4"><span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">{event.event_type}</span></td>
                <td className="p-4">{new Date(event.event_date).toLocaleDateString()}</td>
                <td className="p-4">{event.available_seats}</td>
                <td className="p-4">₹{event.registration_fee}</td>
                <td className="p-4 flex gap-2">
                  <button onClick={() => openEdit(event)} className="p-2 hover:bg-primary/10 rounded-lg text-primary"><FiEdit2 /></button>
                  <button onClick={() => handleDelete(event.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-500"><FiTrash2 /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-4">
            <h2 className="font-poppins font-semibold text-xl">{editId ? 'Edit' : 'Create'} Event</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Event Name" required className="input-field" />
              <select value={form.department_id} onChange={(e) => setForm({ ...form, department_id: e.target.value })} required className="input-field">
                <option value="">Department</option>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              <input value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} placeholder="Venue" required className="input-field" />
              <select value={form.event_type} onChange={(e) => setForm({ ...form, event_type: e.target.value })} className="input-field">
                <option value="Technical">Technical</option>
                <option value="Non Technical">Non Technical</option>
              </select>
              <input type="date" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} required className="input-field" />
              <input type="time" value={form.event_time} onChange={(e) => setForm({ ...form, event_time: e.target.value })} required className="input-field" />
              <input type="number" value={form.registration_fee} onChange={(e) => setForm({ ...form, registration_fee: e.target.value })} placeholder="Fee" className="input-field" />
              <input type="number" value={form.max_participants} onChange={(e) => setForm({ ...form, max_participants: e.target.value, available_seats: e.target.value })} placeholder="Max Participants" className="input-field" />
              <input value={form.coordinator_name} onChange={(e) => setForm({ ...form, coordinator_name: e.target.value })} placeholder="Coordinator Name" className="input-field" />
              <input value={form.coordinator_phone} onChange={(e) => setForm({ ...form, coordinator_phone: e.target.value })} placeholder="Coordinator Phone" className="input-field" />
            </div>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={3} className="input-field" />
            <textarea value={form.rules} onChange={(e) => setForm({ ...form, rules: e.target.value })} placeholder="Rules" rows={3} className="input-field" />
            <textarea value={form.prize_details} onChange={(e) => setForm({ ...form, prize_details: e.target.value })} placeholder="Prize Details" rows={2} className="input-field" />
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

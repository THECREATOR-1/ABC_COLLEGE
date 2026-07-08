import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { sponsorAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const emptyForm = { name: '', logo_url: '', website_url: '', tier: 'Bronze' };

export default function AdminSponsors() {
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const fetchData = () => {
    setLoading(true);
    sponsorAPI.getAll()
      .then((res) => setSponsors(res.data.data))
      .catch((err) => toast.error('Failed to load sponsors'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => { setEditId(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (sponsor) => { setEditId(sponsor.id); setForm(sponsor); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await sponsorAPI.update(editId, form);
        toast.success('Sponsor updated');
      } else {
        await sponsorAPI.create(form);
        toast.success('Sponsor created');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this sponsor?')) return;
    try {
      await sponsorAPI.delete(id);
      toast.success('Sponsor deleted');
      fetchData();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-secondary font-poppins">Manage Sponsors</h1>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm !py-2"><FiPlus /> Add Sponsor</button>
      </div>

      <div className="card overflow-x-auto !p-0">
        <table className="w-full text-sm">
          <thead className="bg-background">
            <tr>
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">Tier</th>
              <th className="text-left p-4">Website</th>
              <th className="text-left p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sponsors.map((sponsor) => (
              <tr key={sponsor.id} className="border-t hover:bg-background/50">
                <td className="p-4 font-medium flex items-center gap-3">
                  {sponsor.logo_url && <img src={sponsor.logo_url} alt={sponsor.name} className="w-8 h-8 rounded-md object-contain bg-white" />}
                  {sponsor.name}
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    sponsor.tier === 'Platinum' ? 'bg-slate-200 text-slate-800' :
                    sponsor.tier === 'Gold' ? 'bg-yellow-100 text-yellow-700' :
                    sponsor.tier === 'Silver' ? 'bg-gray-200 text-gray-700' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    {sponsor.tier}
                  </span>
                </td>
                <td className="p-4">
                  {sponsor.website_url ? <a href={sponsor.website_url} target="_blank" rel="noreferrer" className="text-primary hover:underline">Link</a> : '—'}
                </td>
                <td className="p-4 flex gap-2">
                  <button onClick={() => openEdit(sponsor)} className="p-2 hover:bg-primary/10 rounded-lg text-primary"><FiEdit2 /></button>
                  <button onClick={() => handleDelete(sponsor.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-500"><FiTrash2 /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4">
            <h2 className="font-poppins font-semibold text-xl">{editId ? 'Edit' : 'Create'} Sponsor</h2>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Sponsor Name" required className="input-field" />
            <input value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} placeholder="Logo URL (optional)" className="input-field" />
            <input type="url" value={form.website_url} onChange={(e) => setForm({ ...form, website_url: e.target.value })} placeholder="Website URL (optional)" className="input-field" />
            <select value={form.tier} onChange={(e) => setForm({ ...form, tier: e.target.value })} required className="input-field">
              <option value="Platinum">Platinum</option>
              <option value="Gold">Gold</option>
              <option value="Silver">Silver</option>
              <option value="Bronze">Bronze</option>
            </select>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="btn-primary flex-1">{editId ? 'Update' : 'Create'}</button>
              <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

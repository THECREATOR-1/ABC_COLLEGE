import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { faqAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const emptyForm = { question: '', answer: '', category: 'General', display_order: 0 };

export default function AdminFAQ() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const fetchData = () => {
    setLoading(true);
    faqAPI.getAll()
      .then((res) => setFaqs(res.data.data))
      .catch((err) => toast.error('Failed to load FAQs'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => { setEditId(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (faq) => { setEditId(faq.id); setForm(faq); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await faqAPI.update(editId, form);
        toast.success('FAQ updated');
      } else {
        await faqAPI.create(form);
        toast.success('FAQ created');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this FAQ?')) return;
    try {
      await faqAPI.delete(id);
      toast.success('FAQ deleted');
      fetchData();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-secondary font-poppins">Manage FAQs</h1>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm !py-2"><FiPlus /> Add FAQ</button>
      </div>

      <div className="card overflow-x-auto !p-0">
        <table className="w-full text-sm">
          <thead className="bg-background">
            <tr>
              <th className="text-left p-4">Order</th>
              <th className="text-left p-4">Question</th>
              <th className="text-left p-4">Category</th>
              <th className="text-left p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {faqs.map((faq) => (
              <tr key={faq.id} className="border-t hover:bg-background/50">
                <td className="p-4 text-gray-500 font-mono">{faq.display_order}</td>
                <td className="p-4 font-medium max-w-md truncate">{faq.question}</td>
                <td className="p-4"><span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">{faq.category}</span></td>
                <td className="p-4 flex gap-2">
                  <button onClick={() => openEdit(faq)} className="p-2 hover:bg-primary/10 rounded-lg text-primary"><FiEdit2 /></button>
                  <button onClick={() => handleDelete(faq.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-500"><FiTrash2 /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4">
            <h2 className="font-poppins font-semibold text-xl">{editId ? 'Edit' : 'Create'} FAQ</h2>
            <input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} placeholder="Question" required className="input-field font-medium" />
            <textarea value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} placeholder="Answer" rows={4} required className="input-field" />
            <div className="flex gap-4">
              <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Category (e.g. General, Registration)" className="input-field flex-1" />
              <input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: e.target.value })} placeholder="Order" className="input-field w-24" />
            </div>
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

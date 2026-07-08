import { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiImage, FiUpload } from 'react-icons/fi';
import { galleryAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminGallery() {
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: 'General' });
  const [imageFile, setImageFile] = useState(null);
  const fileInputRef = useRef();

  const fetchData = () => {
    setLoading(true);
    galleryAPI.getAll()
      .then((res) => setGallery(res.data.data))
      .catch((err) => toast.error('Failed to load gallery'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => { 
    setForm({ title: '', description: '', category: 'General' });
    setImageFile(null);
    setShowModal(true); 
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) return toast.error('Please select an image');
    
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('category', form.category);
      formData.append('image', imageFile);

      await galleryAPI.create(formData);
      toast.success('Image uploaded');
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this image?')) return;
    try {
      await galleryAPI.delete(id);
      toast.success('Image deleted');
      fetchData();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-secondary font-poppins">Manage Gallery</h1>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm !py-2"><FiPlus /> Upload Image</button>
      </div>

      {gallery.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <FiImage size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700">No images yet</h3>
          <p className="text-gray-500 mt-2">Upload some photos to showcase your events.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {gallery.map((item) => (
            <div key={item.id} className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100">
              <div className="aspect-square bg-gray-100 relative">
                <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button onClick={() => handleDelete(item.id)} className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors">
                    <FiTrash2 size={20} />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <p className="text-xs text-primary font-semibold mb-1">{item.category}</p>
                <h3 className="font-semibold text-gray-800 line-clamp-1">{item.title}</h3>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4">
            <h2 className="font-poppins font-semibold text-xl">Upload Image</h2>
            
            <div 
              className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {imageFile ? (
                <div className="text-primary font-medium">{imageFile.name}</div>
              ) : (
                <>
                  <FiUpload size={32} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Click to browse or drag image here</p>
                </>
              )}
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
            </div>

            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" required className="input-field font-medium" />
            <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Category (e.g. Day 1, Awards)" className="input-field" />
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description (Optional)" rows={2} className="input-field" />
            
            <div className="flex gap-3 pt-2">
              <button type="submit" className="btn-primary flex-1">Upload</button>
              <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

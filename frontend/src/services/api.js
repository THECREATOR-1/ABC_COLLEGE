import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Auth ──────────────────────────────────────────────────────────────
export const authAPI = {
  login:      (data) => api.post('/auth/login', data),
  getProfile: ()     => api.get('/auth/profile'),
};

// ── Departments ───────────────────────────────────────────────────────
export const departmentAPI = {
  getAll:  ()             => api.get('/departments'),
  getById: (id)           => api.get(`/departments/${id}`),
  create:  (data)         => api.post('/departments', data),
  update:  (id, data)     => api.put(`/departments/${id}`, data),
  delete:  (id)           => api.delete(`/departments/${id}`),
};

// ── Events ────────────────────────────────────────────────────────────
export const eventAPI = {
  getAll:     (params) => api.get('/events', { params }),
  getUpcoming:()       => api.get('/events/upcoming'),
  getById:    (id)     => api.get(`/events/${id}`),
  getStats:   ()       => api.get('/events/stats'),
  create:     (data)   => api.post('/events', data),
  update:     (id, d)  => api.put(`/events/${id}`, d),
  delete:     (id)     => api.delete(`/events/${id}`),
};

// ── Venues ────────────────────────────────────────────────────────────
export const venueAPI = {
  getAll:  ()         => api.get('/venues'),
  getById: (id)       => api.get(`/venues/${id}`),
  create:  (data)     => api.post('/venues', data),
  update:  (id, data) => api.put(`/venues/${id}`, data),
  delete:  (id)       => api.delete(`/venues/${id}`),
};

// ── Registrations ─────────────────────────────────────────────────────
export const registrationAPI = {
  register:        (data)           => api.post('/registrations', data),
  verifyPayment:   (data)           => api.post('/registrations/verify-payment', data),
  getAll:          (params)         => api.get('/registrations', { params }),
  getStats:        ()               => api.get('/registrations/stats'),
  getCharts:       ()               => api.get('/registrations/charts'),
  getById:         (id)             => api.get(`/registrations/${id}`),
  lookupByRegId:   (regId)          => api.get(`/registrations/lookup/${regId}`),
  updateStatus:    (id, status, rejection_reason) => api.patch(`/registrations/${id}/status`, { status, rejection_reason }),
  delete:          (id)             => api.delete(`/registrations/${id}`),
  export:          (fmt)            => api.get('/registrations/export', { params: { format: fmt }, responseType: fmt === 'xlsx' ? 'blob' : 'text' }),
};

// ── Attendance ────────────────────────────────────────────────────────
export const attendanceAPI = {
  verifyQR:       (qrData)              => api.post('/attendance/verify', { qrData }),
  markAttendance: (registrationDbId)    => api.post('/attendance/mark', { registrationDbId }),
  getAll:         ()                    => api.get('/attendance'),
};

// ── Gallery ───────────────────────────────────────────────────────────
export const galleryAPI = {
  getAll:  ()     => api.get('/gallery'),
  create:  (data) => api.post('/gallery', data),
  delete:  (id)   => api.delete(`/gallery/${id}`),
};

// ── Sponsors ──────────────────────────────────────────────────────────
export const sponsorAPI = {
  getAll: ()         => api.get('/sponsors'),
  create: (data)     => api.post('/sponsors', data),
  update: (id, data) => api.put(`/sponsors/${id}`, data),
  delete: (id)       => api.delete(`/sponsors/${id}`),
};

// ── FAQ ───────────────────────────────────────────────────────────────
export const faqAPI = {
  getAll: ()         => api.get('/faq'),
  create: (data)     => api.post('/faq', data),
  update: (id, data) => api.put(`/faq/${id}`, data),
  delete: (id)       => api.delete(`/faq/${id}`),
};

// ── Search ────────────────────────────────────────────────────────────
export const searchAPI = {
  search: (q) => api.get('/search', { params: { q } }),
};

// ── Contact ───────────────────────────────────────────────────────────
export const contactAPI = {
  submit: (data) => api.post('/contact', data),
  getAll: ()     => api.get('/contact'),
};

export default api;

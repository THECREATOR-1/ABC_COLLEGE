import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiMail, FiPhone, FiMapPin, FiSend } from 'react-icons/fi';
import { contactAPI } from '../services/api';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await contactAPI.submit(form);
      toast.success('Message sent successfully!');
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="section-title mb-4">Contact Us</h1>
          <p className="text-gray-500">Get in touch with the symposium organizing committee</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="card">
              <h2 className="font-poppins font-semibold text-xl mb-6">Get In Touch</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0"><FiMapPin className="text-primary" /></div>
                  <div>
                    <p className="font-medium">Address</p>
                    <p className="text-gray-500 text-sm">ABC Engineering College, Anna Nagar, Chennai - 600028, Tamil Nadu, India</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0"><FiPhone className="text-primary" /></div>
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-gray-500 text-sm">+91 98765 43210</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0"><FiMail className="text-primary" /></div>
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-gray-500 text-sm">symposium@abccollege.edu</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden h-64 shadow-card">
              <iframe
                title="College Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.013825489767!2d80.2209!3d13.0827!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDA0JzU3LjciTiA4MMKwMTMnMTUuMiJF!5e0!3m2!1sen!2sin!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
              />
            </div>
          </motion.div>

          <motion.form initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} onSubmit={handleSubmit} className="card space-y-4">
            <h2 className="font-poppins font-semibold text-xl mb-2">Send a Message</h2>
            <input name="name" value={form.name} onChange={handleChange} placeholder="Your Name *" required className="input-field" />
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email Address *" required className="input-field" />
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone Number" className="input-field" />
            <input name="subject" value={form.subject} onChange={handleChange} placeholder="Subject" className="input-field" />
            <textarea name="message" value={form.message} onChange={handleChange} placeholder="Your Message *" required rows={5} className="input-field resize-none" />
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? 'Sending...' : <><FiSend /> Send Message</>}
            </button>
          </motion.form>
        </div>
      </div>
    </div>
  );
}

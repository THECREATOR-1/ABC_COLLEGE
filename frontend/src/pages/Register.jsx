import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiInfo, FiUsers, FiUser } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { eventAPI, registrationAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Register() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [memberCount, setMemberCount] = useState(2);

  const [formData, setFormData] = useState({
    student_name: '',
    register_number: '',
    department: '',
    year: '',
    college_name: '',
    email: '',
    phone: '',
    gender: 'Male',
    event_id: eventId || '',
    registration_type: 'Individual',
    group_members: [],
  });

  useEffect(() => {
    eventAPI.getAll({ limit: 100 })
      .then(res => {
        setEvents(res.data.data);
        if (eventId) {
          const ev = res.data.data.find(e => e.id.toString() === eventId);
          if (ev) setSelectedEvent(ev);
        }
      })
      .catch(() => toast.error('Failed to load events'))
      .finally(() => setLoading(false));
  }, [eventId]);

  const handleEventSelect = (e) => {
    const id = e.target.value;
    setFormData({ ...formData, event_id: id });
    const ev = events.find(ev => ev.id.toString() === id);
    setSelectedEvent(ev || null);
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (!formData.event_id) return toast.error('Please select an event');
    if (!selectedEvent) return toast.error('Invalid event');
    if (selectedEvent.available_seats <= 0) return toast.error('Event is full!');
    setStep(2);
  };

  const handlePayment = async () => {
    setProcessing(true);
    const toastId = toast.loading('Initiating registration...');

    try {
      const initRes = await registrationAPI.register(formData);
      const { registrationDbId, amount, currency, orderId, mockPayment, razorpayKey } = initRes.data.data;
      
      toast.success('Registration initiated. Complete payment.', { id: toastId });

      if (mockPayment) {
        toast.loading('Processing demo payment...', { id: toastId });
        await new Promise(r => setTimeout(r, 1500));
        
        const verifyRes = await registrationAPI.verifyPayment({
          registrationDbId,
          razorpay_order_id: orderId,
          razorpay_payment_id: 'pay_mock_success',
          razorpay_signature: 'mock_signature',
        });
        
        toast.success('Payment successful!', { id: toastId });
        navigate('/registration-success', { state: verifyRes.data.data });
        return;
      }

      if (!window.Razorpay) {
        toast.error('Payment gateway not loaded.', { id: toastId });
        setProcessing(false);
        return;
      }

      const options = {
        key: razorpayKey,
        amount: amount * 100,
        currency,
        name: 'ABC Symposium',
        description: `Registration for ${selectedEvent.name}`,
        order_id: orderId,
        handler: async function (response) {
          toast.loading('Verifying payment...', { id: toastId });
          try {
            const verifyRes = await registrationAPI.verifyPayment({
              registrationDbId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success('Payment verified!', { id: toastId });
            navigate('/registration-success', { state: verifyRes.data.data });
          } catch (e) {
            toast.error(e.response?.data?.message || 'Payment verification failed', { id: toastId });
          }
        },
        prefill: {
          name: formData.student_name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: '#2563EB'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function () {
        toast.error('Payment failed or cancelled', { id: toastId });
        setProcessing(false);
      });
      rzp.open();

    } catch (e) {
      toast.error(e.response?.data?.message || 'Registration failed', { id: toastId });
      setProcessing(false);
    }
  };

  const calculatedTotalAmount = selectedEvent ? (selectedEvent.registration_fee * (formData.registration_type === 'Group' ? memberCount : 1)) : 0;

  if (loading) return <LoadingSpinner text="Preparing registration..." />;

  return (
    <div className="py-12 px-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] min-h-screen">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold font-poppins text-secondary mb-4">Event Registration</h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Fill in your details accurately. Ensure your email and phone number are correct as they will be used for communication.
          </p>
        </div>

        <div className="flex justify-center mb-10">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 ${step >= 1 ? 'border-primary bg-primary text-white' : 'border-gray-300'}`}>1</div>
              <span className="font-semibold">Details</span>
            </div>
            <div className="w-16 h-1 bg-gray-200">
              <div className={`h-full bg-primary transition-all duration-500`} style={{ width: step === 2 ? '100%' : '0%' }} />
            </div>
            <div className={`flex items-center gap-2 ${step === 2 ? 'text-primary' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 ${step === 2 ? 'border-primary bg-primary text-white' : 'border-gray-300'}`}>2</div>
              <span className="font-semibold">Payment</span>
            </div>
          </div>
        </div>

        <div className="glass rounded-3xl p-6 md:p-10 shadow-xl border-t-4 border-t-primary">
          <AnimatePresence mode="wait">
            
            {step === 1 && (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleNext}
                className="space-y-6"
              >
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3 text-blue-800 mb-6">
                  <FiInfo className="flex-shrink-0 mt-1" size={20} />
                  <p className="text-sm">Please ensure you bring your original college ID card to the venue on the day of the event.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <label className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all ${formData.registration_type === 'Individual' ? 'border-primary bg-blue-50/50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                    <input type="radio" name="regType" value="Individual" checked={formData.registration_type === 'Individual'} onChange={() => setFormData({...formData, registration_type: 'Individual', group_members: []})} className="hidden" />
                    <FiUser size={32} className={`mb-2 ${formData.registration_type === 'Individual' ? 'text-primary' : 'text-gray-400'}`} />
                    <span className={`font-semibold ${formData.registration_type === 'Individual' ? 'text-primary' : 'text-gray-600'}`}>Individual</span>
                  </label>
                  
                  <label className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all ${formData.registration_type === 'Group' ? 'border-primary bg-blue-50/50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                    <input type="radio" name="regType" value="Group" checked={formData.registration_type === 'Group'} onChange={() => {
                      const initialMembers = Array(memberCount - 1).fill({ name: '', register_number: '', department: '', year: '', college_name: '', gender: 'Male' });
                      setFormData({...formData, registration_type: 'Group', group_members: initialMembers});
                    }} className="hidden" />
                    <FiUsers size={32} className={`mb-2 ${formData.registration_type === 'Group' ? 'text-primary' : 'text-gray-400'}`} />
                    <span className={`font-semibold ${formData.registration_type === 'Group' ? 'text-primary' : 'text-gray-600'}`}>Group</span>
                  </label>
                </div>

                {formData.registration_type === 'Group' && (
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl">
                    <label className="block text-sm font-semibold text-yellow-800 mb-2">Number of Members (including Leader) *</label>
                    <select value={memberCount} onChange={(e) => {
                      const count = parseInt(e.target.value);
                      setMemberCount(count);
                      const members = Array(count - 1).fill({ name: '', register_number: '', department: '', year: '', college_name: '', gender: 'Male' });
                      setFormData({...formData, group_members: members});
                    }} className="input-field max-w-xs bg-white border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500">
                      <option value="2">2 Members</option>
                      <option value="3">3 Members</option>
                      <option value="4">4 Members</option>
                    </select>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-secondary mb-1">Select Event *</label>
                    <select
                      required
                      value={formData.event_id}
                      onChange={handleEventSelect}
                      className="input-field"
                    >
                      <option value="">-- Choose an event --</option>
                      {events.filter(e => e.is_active).map(ev => (
                        <option key={ev.id} value={ev.id}>
                          {ev.department_name} - {ev.name} (₹{ev.registration_fee} / person)
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedEvent && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-sm grid grid-cols-2 gap-4">
                      <div><span className="text-gray-500">Date:</span> <span className="font-semibold">{new Date(selectedEvent.event_date).toLocaleDateString()}</span></div>
                      <div><span className="text-gray-500">Time:</span> <span className="font-semibold">{selectedEvent.event_time?.slice(0,5)}</span></div>
                      <div><span className="text-gray-500">Venue:</span> <span className="font-semibold">{selectedEvent.venue}</span></div>
                      <div><span className="text-gray-500">Seats Left:</span> <span className="font-semibold text-accent">{selectedEvent.available_seats}</span></div>
                    </motion.div>
                  )}
                </div>

                <h3 className="text-xl font-bold text-secondary border-b pb-2 mb-4 mt-8 pt-4">
                  {formData.registration_type === 'Group' ? 'Member 1 (Team Leader) Details' : 'Participant Details'}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-secondary mb-1">Full Name *</label>
                    <input type="text" required value={formData.student_name} onChange={e => setFormData({...formData, student_name: e.target.value})} className="input-field" placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-secondary mb-1">Register Number / Roll No *</label>
                    <input type="text" required value={formData.register_number} onChange={e => setFormData({...formData, register_number: e.target.value})} className="input-field" placeholder="Ex: 21CS105" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-secondary mb-1">Email Address *</label>
                    <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="input-field" placeholder="john@example.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-secondary mb-1">Phone Number *</label>
                    <input type="tel" pattern="[0-9]{10}" title="10 digit mobile number" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="input-field" placeholder="9876543210" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-secondary mb-1">College Name *</label>
                    <input type="text" required value={formData.college_name} onChange={e => setFormData({...formData, college_name: e.target.value})} className="input-field" placeholder="Your College Name" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-secondary mb-1">Department / Branch *</label>
                    <input type="text" required value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="input-field" placeholder="B.E. CSE" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-secondary mb-1">Year *</label>
                      <select required value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} className="input-field">
                        <option value="">Select</option>
                        <option value="1st">1st Year</option>
                        <option value="2nd">2nd Year</option>
                        <option value="3rd">3rd Year</option>
                        <option value="4th">4th Year</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-secondary mb-1">Gender *</label>
                      <select required value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="input-field">
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                {formData.registration_type === 'Group' && formData.group_members.map((member, index) => (
                  <div key={index} className="mt-8 pt-6 border-t border-gray-200">
                    <h3 className="text-xl font-bold text-secondary pb-2 mb-4">Member {index + 2} Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-secondary mb-1">Full Name *</label>
                        <input type="text" required value={member.name || ''} onChange={e => {
                          const newMembers = [...formData.group_members];
                          newMembers[index] = {...newMembers[index], name: e.target.value};
                          setFormData({...formData, group_members: newMembers});
                        }} className="input-field" placeholder="Full Name" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-secondary mb-1">Register Number *</label>
                        <input type="text" required value={member.register_number || ''} onChange={e => {
                          const newMembers = [...formData.group_members];
                          newMembers[index] = {...newMembers[index], register_number: e.target.value};
                          setFormData({...formData, group_members: newMembers});
                        }} className="input-field" placeholder="Register Number" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-secondary mb-1">College Name *</label>
                        <input type="text" required value={member.college_name || ''} onChange={e => {
                          const newMembers = [...formData.group_members];
                          newMembers[index] = {...newMembers[index], college_name: e.target.value};
                          setFormData({...formData, group_members: newMembers});
                        }} className="input-field" placeholder="College Name" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-secondary mb-1">Department / Branch *</label>
                        <input type="text" required value={member.department || ''} onChange={e => {
                          const newMembers = [...formData.group_members];
                          newMembers[index] = {...newMembers[index], department: e.target.value};
                          setFormData({...formData, group_members: newMembers});
                        }} className="input-field" placeholder="Department" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-secondary mb-1">Year *</label>
                          <select required value={member.year || ''} onChange={e => {
                            const newMembers = [...formData.group_members];
                            newMembers[index] = {...newMembers[index], year: e.target.value};
                            setFormData({...formData, group_members: newMembers});
                          }} className="input-field">
                            <option value="">Select</option>
                            <option value="1st">1st Year</option>
                            <option value="2nd">2nd Year</option>
                            <option value="3rd">3rd Year</option>
                            <option value="4th">4th Year</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-secondary mb-1">Gender *</label>
                          <select required value={member.gender || 'Male'} onChange={e => {
                            const newMembers = [...formData.group_members];
                            newMembers[index] = {...newMembers[index], gender: e.target.value};
                            setFormData({...formData, group_members: newMembers});
                          }} className="input-field">
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="pt-6 border-t mt-8 flex justify-end items-center">
                  <div className="mr-6 text-right">
                    <p className="text-sm text-gray-500">Total Registration Fee</p>
                    <p className="text-2xl font-bold text-primary">₹{calculatedTotalAmount}</p>
                  </div>
                  <button type="submit" className="btn-primary px-10 text-lg">Proceed to Summary</button>
                </div>
              </motion.form>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <div className="text-center">
                  <h3 className="text-2xl font-bold font-poppins text-secondary mb-2">Order Summary</h3>
                  <p className="text-gray-500">Please verify your details before proceeding to payment.</p>
                </div>

                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-gray-200 pb-4">
                      <div>
                        <p className="font-bold text-lg text-secondary">{selectedEvent?.name}</p>
                        <p className="text-sm text-gray-500">{selectedEvent?.department_name} • {formData.registration_type}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">₹{calculatedTotalAmount}</p>
                        <p className="text-xs text-gray-400">Total Amount ({formData.registration_type === 'Group' ? memberCount : 1} Members)</p>
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <p className="font-semibold text-secondary border-b pb-1 mb-2">Lead Participant</p>
                      <div className="grid grid-cols-2 gap-y-4 text-sm">
                        <div><span className="text-gray-500 block">Participant</span> <span className="font-semibold">{formData.student_name}</span></div>
                        <div><span className="text-gray-500 block">Register No</span> <span className="font-semibold">{formData.register_number}</span></div>
                        <div><span className="text-gray-500 block">College</span> <span className="font-semibold">{formData.college_name}</span></div>
                        <div><span className="text-gray-500 block">Contact</span> <span className="font-semibold">{formData.phone}</span></div>
                      </div>
                    </div>

                    {formData.registration_type === 'Group' && formData.group_members.length > 0 && (
                      <div className="pt-4 mt-4 border-t border-gray-200">
                        <p className="font-semibold text-secondary mb-2">Group Members</p>
                        <ul className="space-y-2">
                          {formData.group_members.map((m, i) => (
                            <li key={i} className="text-sm flex justify-between bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
                              <span className="font-medium text-gray-800">{m.name}</span>
                              <span className="text-gray-500">{m.register_number}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3 text-blue-800 text-sm">
                  <FiCheck className="flex-shrink-0 mt-0.5" size={18} />
                  <p>By proceeding, you agree to the terms and conditions. The registration fee is non-refundable.</p>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setStep(1)} disabled={processing} className="px-6 py-3 rounded-xl border-2 border-gray-300 font-semibold hover:bg-gray-50 transition w-1/3 text-gray-600">
                    Back
                  </button>
                  <button onClick={handlePayment} disabled={processing} className="btn-primary w-2/3 flex items-center justify-center gap-2 text-lg">
                    {processing ? <LoadingSpinner size="sm" text="" /> : `Pay ₹${calculatedTotalAmount}`}
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

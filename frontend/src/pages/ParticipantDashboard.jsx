import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { FiCalendar, FiClock, FiMapPin, FiUser, FiDownload, FiCheckCircle, FiXCircle, FiInfo } from 'react-icons/fi';
import { registrationAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function ParticipantDashboard() {
  const { regId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    registrationAPI.lookupByRegId(regId)
      .then(r => setData(r.data.data))
      .catch(e => {
        toast.error('Could not load ticket details');
        console.error(e);
      })
      .finally(() => setLoading(false));
  }, [regId]);

  if (loading) return <LoadingSpinner text="Loading your ticket..." />;
  if (!data) return <div className="text-center py-20">Ticket not found</div>;

  const handlePrint = () => {
    window.print();
  };

  const isRejected = data.status === 'rejected';
  
  let groupMembers = [];
  if (data.registration_type === 'Group' && data.group_members) {
    try {
      groupMembers = typeof data.group_members === 'string' ? JSON.parse(data.group_members) : data.group_members;
    } catch(e) {}
  }

  return (
    <div className="py-12 px-4 bg-background min-h-screen">
      <div className="max-w-4xl mx-auto">
        
        {isRejected && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6 text-red-800 shadow-sm print:hidden">
            <div className="flex items-start gap-4">
              <FiXCircle className="text-red-500 mt-1 flex-shrink-0" size={24} />
              <div>
                <h3 className="text-lg font-bold">Your registration has been rejected by the event organizer.</h3>
                <p className="mt-1 opacity-90">Your registration fee has been refunded.</p>
                {data.rejection_reason && (
                  <div className="mt-3 bg-white/60 p-3 rounded-lg border border-red-100 text-sm">
                    <span className="font-semibold block mb-1">Reason for rejection:</span>
                    {data.rejection_reason}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-white rounded-3xl shadow-card overflow-hidden print:shadow-none ${isRejected ? 'opacity-80' : ''}`}
        >
          {/* Header */}
          <div className={`${isRejected ? 'bg-gradient-to-r from-red-600 to-red-400' : 'bg-gradient-to-r from-primary to-accent'} p-8 text-white flex justify-between items-center print:bg-none print:text-black print:border-b`}>
            <div>
              <h1 className="text-3xl font-bold font-poppins mb-2">{isRejected ? 'Ticket Cancelled' : 'Event Ticket'}</h1>
              <p className="opacity-90 font-mono text-lg">{data.registration_id}</p>
            </div>
            <div className="text-right hidden sm:block">
              <h2 className="text-2xl font-bold font-poppins">ABC Symposium</h2>
              <p className="opacity-90">{isRejected ? 'Invalidated Pass' : 'Official Entry Pass'}</p>
            </div>
          </div>

          <div className="p-8 md:p-12">
            <div className="flex flex-col-reverse md:flex-row gap-12 items-start justify-between">
              
              {/* Details */}
              <div className="flex-1 space-y-8 w-full">
                <div>
                  <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-2">Participant Details {data.registration_type === 'Group' ? '(Group)' : ''}</h3>
                  <div className="bg-gray-50 rounded-2xl p-6 space-y-4 border border-gray-100">
                    
                    <div className="flex items-center gap-3 mb-2">
                      <FiUser className="text-accent text-xl" />
                      <div>
                        <p className="font-semibold text-secondary text-lg">{data.student_name} {data.registration_type === 'Group' ? <span className="text-sm text-gray-500 font-normal">(Leader)</span> : ''}</p>
                        <p className="text-sm text-gray-500">{data.register_number} • {data.college_name} • {data.student_department} • {data.year}</p>
                      </div>
                    </div>

                    {groupMembers.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="font-semibold text-gray-700 mb-3 text-sm">Group Members</p>
                        <div className="space-y-3">
                          {groupMembers.map((m, i) => (
                            <div key={i} className="flex items-center gap-3">
                               <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500 font-bold">{i+2}</div>
                               <div>
                                  <p className="font-semibold text-secondary">{m.name}</p>
                                  <p className="text-xs text-gray-500">{m.register_number} • {m.college_name} • {m.department} • {m.year}</p>
                               </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-2">Event Details</h3>
                  <div className="bg-gray-50 rounded-2xl p-6 space-y-4 border border-gray-100">
                    <div>
                      <p className="font-bold text-secondary text-xl mb-1">{data.event_name}</p>
                      <p className="text-sm text-primary font-medium">{data.dept_name}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-gray-600">
                        <FiCalendar className="text-accent" />
                        <span>{new Date(data.event_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <FiClock className="text-accent" />
                        <span>{data.event_time?.slice(0, 5)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 sm:col-span-2">
                        <FiMapPin className="text-accent" />
                        <span>{data.venue}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* QR Code */}
              <div className="flex-shrink-0 flex flex-col items-center justify-center p-6 bg-gray-50 rounded-3xl border border-gray-200 w-full md:w-auto">
                {!isRejected ? (
                  <>
                    <div className="bg-white p-4 rounded-2xl shadow-sm mb-4">
                      <QRCodeSVG 
                        value={JSON.stringify({ registrationId: data.registration_id })} 
                        size={200}
                        level="H"
                        fgColor="#0F172A"
                      />
                    </div>
                    <div className="flex items-center gap-2 text-green-600 font-semibold bg-green-50 px-4 py-2 rounded-full">
                      <FiCheckCircle /> Payment Confirmed
                    </div>
                    {data.attendance_time && (
                      <p className="text-sm text-gray-500 mt-3 font-medium">
                        Checked in: {new Date(data.attendance_time).toLocaleTimeString()}
                      </p>
                    )}
                  </>
                ) : (
                  <div className="text-center p-4">
                    <div className="w-[200px] h-[200px] bg-red-50 border-2 border-dashed border-red-200 rounded-2xl flex flex-col items-center justify-center text-red-400 p-4 mb-4 mx-auto">
                      <FiXCircle size={48} className="mb-2" />
                      <p className="text-xs text-center font-medium">This QR Code is no longer valid because this registration has been rejected.</p>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                       <div className="text-red-600 font-bold bg-red-50 px-4 py-2 rounded-full flex items-center gap-2 text-sm border border-red-100">
                         <FiXCircle /> Registration Rejected
                       </div>
                       <div className="text-blue-600 font-bold bg-blue-50 px-4 py-2 rounded-full flex items-center gap-2 text-sm border border-blue-100">
                         <FiInfo /> 
                         {data.refund_status === 'Completed' ? 'Payment Refunded' : 'Refund Initiated'}
                       </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
          
          <div className="bg-gray-50 p-6 flex justify-center gap-4 border-t border-gray-100 print:hidden">
            {!isRejected && (
              <button onClick={handlePrint} className="btn-primary flex items-center gap-2">
                <FiDownload /> Print / Save Ticket
              </button>
            )}
            <Link to="/events" className="btn-secondary">Browse More Events</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

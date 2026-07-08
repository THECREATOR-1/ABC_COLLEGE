import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiSearch, FiDownload, FiX, FiInfo } from 'react-icons/fi';
import { registrationAPI, eventAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminParticipants() {
  const [registrations, setRegistrations] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [eventFilter, setEventFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const [selectedReg, setSelectedReg] = useState(null);

  const fetchData = () => {
    setLoading(true);
    registrationAPI.getAll({ search, event: eventFilter, status: statusFilter, limit: 50 })
      .then((res) => setRegistrations(res.data.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    eventAPI.getAll({ limit: 100 }).then((res) => setEvents(res.data.data));
  }, []);

  useEffect(() => { fetchData(); }, [search, eventFilter, statusFilter]);

  const handleExport = async (format) => {
    try {
      const res = await registrationAPI.export(format);
      const blob = format === 'xlsx' ? new Blob([res.data]) : new Blob([res.data], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `registrations.${format === 'xlsx' ? 'xlsx' : 'csv'}`;
      a.click();
      toast.success('Export downloaded');
    } catch {
      toast.error('Export failed');
    }
  };

  const handleStatusUpdate = async (id, status, e) => {
    if (e && e.stopPropagation) e.stopPropagation(); // prevent modal opening if clicked from row button
    try {
      let rejection_reason = '';
      if (status === 'rejected') {
        const reason = window.prompt("Enter rejection reason (optional):");
        if (reason === null) return; // User cancelled
        rejection_reason = reason;
      }
      
      await registrationAPI.updateStatus(id, status, rejection_reason);
      toast.success(`Status updated to ${status}`);
      if (selectedReg && selectedReg.id === id) {
         setSelectedReg({...selectedReg, status: status, payment_status: status === 'rejected' ? 'refunded' : selectedReg.payment_status});
      }
      fetchData();
    } catch {
      toast.error('Update failed');
    }
  };

  const getGroupMembers = (reg) => {
    if (!reg.group_members) return [];
    try {
      return typeof reg.group_members === 'string' ? JSON.parse(reg.group_members) : reg.group_members;
    } catch(e) {
      return [];
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-secondary font-poppins mb-8">Manage Participants</h1>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, register no, event..." className="input-field pl-11" />
        </div>
        <select value={eventFilter} onChange={(e) => setEventFilter(e.target.value)} className="input-field md:w-48">
          <option value="">All Events</option>
          {events.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field md:w-40">
          <option value="">All Status</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>
        <div className="flex gap-2">
          <button onClick={() => handleExport('csv')} className="btn-secondary text-sm !py-2 flex items-center gap-1"><FiDownload /> CSV</button>
          <button onClick={() => handleExport('xlsx')} className="btn-secondary text-sm !py-2 flex items-center gap-1"><FiDownload /> Excel</button>
        </div>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="card overflow-x-auto !p-0">
          <table className="w-full text-sm">
            <thead className="bg-background">
              <tr>
                <th className="text-left p-4">Reg ID</th>
                <th className="text-left p-4">Student(s)</th>
                <th className="text-left p-4">Type</th>
                <th className="text-left p-4">Event</th>
                <th className="text-left p-4">Payment</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((reg) => {
                const members = getGroupMembers(reg);
                return (
                  <tr key={reg.id} className="border-t hover:bg-gray-50 cursor-pointer transition" onClick={() => setSelectedReg(reg)}>
                    <td className="p-4 font-mono text-xs text-blue-600 underline">{reg.registration_id}</td>
                    <td className="p-4">
                      <p className="font-medium text-primary">{reg.student_name} <span className="text-xs text-gray-400 font-normal ml-1">(Leader)</span></p>
                      <p className="text-xs text-gray-500 mb-1">{reg.register_number}</p>
                      {reg.registration_type === 'Group' && members.length > 0 && (
                        <div className="mt-2 border-t pt-2 space-y-1">
                          {members.map((m, i) => (
                            <div key={i} className="text-xs">
                              <span className="font-medium">{m.name}</span> <span className="text-gray-400">({m.register_number})</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${reg.registration_type === 'Group' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {reg.registration_type || 'Individual'}
                      </span>
                    </td>
                    <td className="p-4">{reg.event_name}</td>
                    <td className="p-4">
                      <div className="flex flex-col items-start gap-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          reg.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 
                          reg.payment_status === 'refunded' ? 'bg-red-100 text-red-700' : 
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {reg.payment_status === 'refunded' ? 'Refunded' : reg.payment_status}
                        </span>
                        {reg.paid_amount > 0 && <span className="text-xs font-semibold text-gray-700">₹{reg.paid_amount}</span>}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          reg.status === 'approved' ? 'bg-green-100 text-green-700' : 
                          reg.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                        {reg.status}
                      </span>
                    </td>
                    <td className="p-4">
                      {reg.status === 'pending' && (
                        <button onClick={(e) => handleStatusUpdate(reg.id, 'approved', e)} className="text-xs text-green-600 hover:underline mr-2">Approve</button>
                      )}
                      {reg.status !== 'rejected' && (
                        <button onClick={(e) => handleStatusUpdate(reg.id, 'rejected', e)} className="text-xs text-red-500 hover:underline">Reject</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selectedReg && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-secondary">Registration Details</h2>
              <button onClick={() => setSelectedReg(null)} className="p-2 hover:bg-gray-100 rounded-full"><FiX size={24} /></button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-xl text-sm">
                <div><span className="text-gray-500 block">Reg ID</span><span className="font-mono font-bold text-primary">{selectedReg.registration_id}</span></div>
                <div><span className="text-gray-500 block">Event</span><span className="font-semibold">{selectedReg.event_name}</span></div>
                <div><span className="text-gray-500 block">Type</span><span className="font-semibold">{selectedReg.registration_type || 'Individual'}</span></div>
                <div><span className="text-gray-500 block">Date</span><span className="font-semibold">{new Date(selectedReg.created_at).toLocaleDateString()}</span></div>
              </div>

              <div className="flex gap-4 items-center">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    selectedReg.status === 'approved' ? 'bg-green-100 text-green-700' : 
                    selectedReg.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>Status: {selectedReg.status}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    selectedReg.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 
                    selectedReg.payment_status === 'refunded' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>Payment: {selectedReg.payment_status}</span>
                {selectedReg.refund_status && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-blue-100 text-blue-700">Refund: {selectedReg.refund_status}</span>
                )}
              </div>
              
              {selectedReg.rejection_reason && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-red-800 text-sm">
                  <span className="font-bold">Rejection Reason:</span> {selectedReg.rejection_reason}
                </div>
              )}

              <div>
                <h3 className="text-lg font-bold text-secondary mb-3 border-b pb-1">Leader Details</h3>
                <div className="grid grid-cols-2 gap-y-3 text-sm">
                  <div><span className="text-gray-500 block">Name</span><span className="font-semibold">{selectedReg.student_name}</span></div>
                  <div><span className="text-gray-500 block">Register Number</span><span className="font-semibold">{selectedReg.register_number}</span></div>
                  <div><span className="text-gray-500 block">College</span><span className="font-semibold">{selectedReg.college_name}</span></div>
                  <div><span className="text-gray-500 block">Department</span><span className="font-semibold">{selectedReg.student_department}</span></div>
                  <div><span className="text-gray-500 block">Email</span><span className="font-semibold">{selectedReg.email}</span></div>
                  <div><span className="text-gray-500 block">Phone</span><span className="font-semibold">{selectedReg.phone}</span></div>
                  <div><span className="text-gray-500 block">Year</span><span className="font-semibold">{selectedReg.year}</span></div>
                  <div><span className="text-gray-500 block">Gender</span><span className="font-semibold">{selectedReg.gender}</span></div>
                </div>
              </div>

              {selectedReg.registration_type === 'Group' && getGroupMembers(selectedReg).length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-secondary mb-3 border-b pb-1">Team Members</h3>
                  <div className="space-y-3">
                    {getGroupMembers(selectedReg).map((m, i) => (
                      <div key={i} className="bg-gray-50 p-3 rounded-lg border border-gray-100 grid grid-cols-2 gap-y-2 text-sm">
                        <div><span className="text-gray-500 block text-xs">Name</span><span className="font-semibold">{m.name}</span></div>
                        <div><span className="text-gray-500 block text-xs">Register No</span><span className="font-semibold">{m.register_number}</span></div>
                        <div><span className="text-gray-500 block text-xs">College</span><span className="font-semibold">{m.college_name}</span></div>
                        <div><span className="text-gray-500 block text-xs">Department</span><span className="font-semibold">{m.department}</span></div>
                        <div><span className="text-gray-500 block text-xs">Year</span><span className="font-semibold">{m.year}</span></div>
                        <div><span className="text-gray-500 block text-xs">Gender</span><span className="font-semibold">{m.gender}</span></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedReg.status !== 'rejected' && (
                <div className="pt-4 border-t border-gray-100 flex gap-4">
                   <button onClick={async () => {
                     const reason = window.prompt('Enter rejection reason (optional):');
                     if (reason === null) return; // user cancelled
                     setSelectedReg(null);
                     try {
                       await registrationAPI.updateStatus(selectedReg.id, 'rejected', reason);
                       toast.success('Registration rejected and payment refunded');
                       fetchData();
                     } catch {
                       toast.error('Update failed');
                     }
                   }} className="btn-secondary !bg-red-50 !text-red-600 !border-red-200 hover:!bg-red-100 w-full">
                     Reject Registration
                   </button>
                   {selectedReg.status === 'pending' && (
                     <button onClick={async () => {
                       setSelectedReg(null);
                       try {
                         await registrationAPI.updateStatus(selectedReg.id, 'approved');
                         toast.success('Registration approved');
                         fetchData();
                       } catch {
                         toast.error('Update failed');
                       }
                     }} className="btn-primary w-full">
                       Approve Registration
                     </button>
                   )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useLocation, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiDownload, FiCheckCircle, FiHome } from 'react-icons/fi';

export default function RegistrationSuccess() {
  const { state } = useLocation();
  const data = state?.data;

  if (!data) return <Navigate to="/events" replace />;

  const qrSrc = data.qrCodeDataUrl || (data.qrCodeImage ? `http://localhost:5000${data.qrCodeImage}` : null);
  const receiptUrl = data.receiptPath ? `http://localhost:5000${data.receiptPath}` : null;

  const downloadQR = () => {
    const link = document.createElement('a');
    link.href = qrSrc;
    link.download = `QR-${data.registrationId}.png`;
    link.click();
  };

  return (
    <div className="py-12 min-h-[70vh] flex items-center">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card text-center !p-8 md:!p-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <FiCheckCircle className="text-green-500 text-4xl" />
          </motion.div>

          <h1 className="section-title text-2xl mb-2">Registration Successful!</h1>
          <p className="text-gray-500 mb-8">Your payment has been confirmed. Save your QR code for event day.</p>

          <div className="bg-background rounded-2xl p-6 mb-8 text-left space-y-3">
            <div className="flex justify-between"><span className="text-gray-500">Registration ID</span><span className="font-bold text-primary">{data.registrationId}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Student</span><span className="font-medium">{data.studentName}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Event</span><span className="font-medium">{data.eventName}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Venue</span><span className="font-medium">{data.venue}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Date</span><span className="font-medium">{new Date(data.eventDate).toLocaleDateString()}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Time</span><span className="font-medium">{data.eventTime?.slice(0, 5)}</span></div>
          </div>

          {qrSrc && (
            <div className="mb-8">
              <p className="font-semibold mb-4">Your QR Code</p>
              <img src={qrSrc} alt="Registration QR Code" className="mx-auto w-64 h-64 rounded-xl shadow-card border-4 border-primary/20" />
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {qrSrc && (
              <button onClick={downloadQR} className="btn-primary flex items-center justify-center gap-2">
                <FiDownload /> Download QR Code
              </button>
            )}
            {receiptUrl && (
              <a href={receiptUrl} download className="btn-secondary flex items-center justify-center gap-2">
                <FiDownload /> Download Receipt
              </a>
            )}
            <Link to="/" className="btn-secondary flex items-center justify-center gap-2">
              <FiHome /> Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

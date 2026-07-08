import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { attendanceAPI } from '../../services/api';

export default function AdminQRScanner() {
  const [scanResult, setScanResult] = useState(null);
  const [manualInput, setManualInput] = useState('');
  const scannerRef = useRef(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('qr-reader', {
      fps: 10,
      qrbox: { width: 250, height: 250 },
    }, false);

    scanner.render(
      async (decodedText) => {
        try {
          const qrData = JSON.parse(decodedText);
          const res = await attendanceAPI.verifyQR(qrData);
          setScanResult(res.data.data);
          toast.success('QR Code verified!');
        } catch (err) {
          toast.error(err.response?.data?.message || 'Invalid QR code');
        }
      },
      () => {}
    );

    scannerRef.current = scanner;
    return () => {
      scanner.clear().catch(() => {});
    };
  }, []);

  const handleManualVerify = async () => {
    try {
      const qrData = JSON.parse(manualInput);
      const res = await attendanceAPI.verifyQR(qrData);
      setScanResult(res.data.data);
      toast.success('Verified!');
    } catch {
      toast.error('Invalid QR data JSON');
    }
  };

  const handleMarkAttendance = async () => {
    try {
      await attendanceAPI.markAttendance(scanResult.registrationDbId);
      setScanResult({ ...scanResult, attendanceStatus: 'Present' });
      toast.success('Attendance marked!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to mark attendance');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-secondary font-poppins mb-8">QR Scanner</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold mb-4">Scan QR Code</h3>
          <div id="qr-reader" className="rounded-xl overflow-hidden" />

          <div className="mt-6">
            <p className="text-sm text-gray-500 mb-2">Or paste QR JSON data manually:</p>
            <textarea
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder='{"registrationId":"ABC-...","studentName":"..."}'
              rows={3}
              className="input-field text-xs font-mono"
            />
            <button onClick={handleManualVerify} className="btn-secondary mt-2 w-full text-sm">Verify Manually</button>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-4">Verification Result</h3>
          {scanResult ? (
            <div className="space-y-4">
              <div className="bg-background rounded-xl p-4 space-y-3">
                {[
                  ['Student Name', scanResult.studentName],
                  ['Register Number', scanResult.registerNumber],
                  ['Department', scanResult.department],
                  ['Event', scanResult.eventName],
                  ['Venue', scanResult.venue],
                  ['Date', new Date(scanResult.eventDate).toLocaleDateString()],
                  ['Time', scanResult.eventTime?.slice(0, 5)],
                  ['Payment Status', scanResult.paymentStatus],
                  ['Attendance', scanResult.attendanceStatus],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </div>

              {scanResult.attendanceStatus === 'Absent' && scanResult.paymentStatus === 'paid' && (
                <button onClick={handleMarkAttendance} className="btn-primary w-full">
                  Mark Attendance
                </button>
              )}

              {scanResult.attendanceStatus === 'Present' && (
                <div className="text-center text-green-600 font-semibold py-3 bg-green-50 rounded-xl">
                  ✓ Attendance Already Marked
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-400">
              <p>Scan a QR code to verify registration</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

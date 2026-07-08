const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateReceiptPDF = async (registration) => {
  const uploadDir = path.join(__dirname, '../uploads/receipts');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filename = `receipt-${registration.registration_id}.pdf`;
  const filepath = path.join(uploadDir, filename);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filepath);

    doc.pipe(stream);

    doc.fontSize(22).fillColor('#2563EB').text('ABC Engineering College', { align: 'center' });
    doc.fontSize(16).fillColor('#0F172A').text('Symposium Registration Receipt', { align: 'center' });
    doc.moveDown();
    doc.strokeColor('#2563EB').lineWidth(2).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    const fields = [
      ['Registration ID', registration.registration_id],
      ['Student Name', registration.student_name],
      ['Register Number', registration.register_number],
      ['Department', registration.student_department],
      ['College', registration.college_name],
      ['Event', registration.event_name],
      ['Venue', registration.venue],
      ['Date', new Date(registration.event_date).toDateString()],
      ['Time', registration.event_time],
      ['Fee Paid', `₹${registration.registration_fee}`],
      ['Payment Status', registration.payment_status],
      ['Registration Date', new Date(registration.created_at).toLocaleString()],
    ];

    fields.forEach(([label, value]) => {
      doc.fontSize(11).fillColor('#64748B').text(`${label}:`, { continued: false });
      doc.fontSize(12).fillColor('#0F172A').text(String(value || 'N/A'));
      doc.moveDown(0.5);
    });

    doc.moveDown();
    doc.fontSize(10).fillColor('#64748B').text('Please bring this receipt and QR code on event day.', { align: 'center' });
    doc.text('ABC Engineering College Symposium 2024', { align: 'center' });

    doc.end();

    stream.on('finish', () => resolve(`/uploads/receipts/${filename}`));
    stream.on('error', reject);
  });
};

module.exports = { generateReceiptPDF };

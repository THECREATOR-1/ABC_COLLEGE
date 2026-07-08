const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

const generateRegistrationId = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ABC-${timestamp}-${random}`;
};

const generateQRCode = async (data) => {
  const uploadDir = path.join(__dirname, '../uploads/qrcodes');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const qrData = JSON.stringify(data);
  const filename = `qr-${data.registrationId}-${Date.now()}.png`;
  const filepath = path.join(uploadDir, filename);

  await QRCode.toFile(filepath, qrData, {
    width: 300,
    margin: 2,
    color: { dark: '#2563EB', light: '#FFFFFF' },
  });

  return {
    qrData,
    qrImagePath: `/uploads/qrcodes/${filename}`,
  };
};

const generateQRCodeDataURL = async (data) => {
  const qrData = JSON.stringify(data);
  const dataUrl = await QRCode.toDataURL(qrData, {
    width: 300,
    margin: 2,
    color: { dark: '#2563EB', light: '#FFFFFF' },
  });
  return { qrData, dataUrl };
};

module.exports = { generateRegistrationId, generateQRCode, generateQRCodeDataURL };

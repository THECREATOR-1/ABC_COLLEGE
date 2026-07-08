const nodemailer = require('nodemailer');

const createTransporter = () => {
  if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your_email@gmail.com') {
    return null;
  }
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendRegistrationEmail = async (registration) => {
  const transporter = createTransporter();
  if (!transporter) {
    console.log('📧 Email not configured - skipping confirmation email');
    return { sent: false, message: 'Email not configured' };
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: registration.email,
      subject: `Registration Confirmed - ${registration.event_name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563EB;">ABC Engineering College Symposium</h2>
          <p>Dear ${registration.student_name},</p>
          <p>Your registration has been confirmed!</p>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Registration ID</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${registration.registration_id}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Event</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${registration.event_name}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Venue</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${registration.venue}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Date</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${registration.event_date}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Time</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${registration.event_time}</td></tr>
          </table>
          <p>Please bring your QR code on the event day.</p>
          <p>Best regards,<br>ABC Symposium Team</p>
        </div>
      `,
    });
    return { sent: true };
  } catch (error) {
    console.error('Email send error:', error.message);
    return { sent: false, message: error.message };
  }
};

module.exports = { sendRegistrationEmail };

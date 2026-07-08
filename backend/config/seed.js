require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// ─── Department / Venue data ───────────────────────────────────────────
const departments = [
  {
    name: 'Computer Science and Engineering', code: 'CSE',
    venue: 'CSE Block – Room 101', color_theme: '#6C63FF',
    description: 'The CSE department focuses on algorithms, data structures, AI, and software development. It is one of the largest departments with state-of-the-art computing labs.',
    image: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=600&q=80',
    venueData: { building: 'CSE Block', floor: 'Ground Floor', room_number: 'CSE-101', capacity: 200, facilities: 'AC Seminar Hall, 200 Computers, High-Speed WiFi, Smart Board, Projectors', directions: 'Enter through the main gate, take the left lane, CSE Block is the first building on the right.' }
  },
  {
    name: 'Electronics and Communication Engineering', code: 'ECE',
    venue: 'ECE Seminar Hall', color_theme: '#FF6584',
    description: 'ECE department pioneers innovation in electronic circuits, communication systems, embedded systems, and VLSI design.',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80',
    venueData: { building: 'ECE Block', floor: 'First Floor', room_number: 'ECE-201', capacity: 150, facilities: 'PCB Lab, Signal Generators, Oscilloscopes, Spectrum Analyzers, Smart Boards', directions: 'From the main gate, take the central road, ECE Block is on the right side past the library.' }
  },
  {
    name: 'Information Technology', code: 'IT',
    venue: 'IT Block', color_theme: '#4CAF50',
    description: 'The IT department develops expertise in web technologies, cloud computing, cybersecurity, and database management systems.',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=80',
    venueData: { building: 'IT Block', floor: 'Second Floor', room_number: 'IT-301', capacity: 120, facilities: 'Computer Lab, Server Room, High-Speed Internet, Cloud Infrastructure', directions: 'From the CSE Block, proceed straight for 100m. IT Block is on the left side with a blue building.' }
  },
  {
    name: 'Artificial Intelligence and Data Science', code: 'AI&DS',
    venue: 'AI&DS Lab', color_theme: '#FF9800',
    description: 'AI & DS department explores machine learning, deep learning, data analytics, big data technologies, and business intelligence.',
    image: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&q=80',
    venueData: { building: 'Innovation Hub', floor: 'Ground Floor', room_number: 'IH-101', capacity: 100, facilities: 'GPU Workstations, Data Science Tools, Jupyter Lab, AI Research Lab', directions: 'Located in the Innovation Hub behind the main building. Follow the signs from the main entrance.' }
  },
  {
    name: 'Artificial Intelligence and Machine Learning', code: 'AI&ML',
    venue: 'AI&ML Smart Lab', color_theme: '#9C27B0',
    description: 'AI & ML department specializes in neural networks, natural language processing, computer vision, and reinforcement learning.',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&q=80',
    venueData: { building: 'Innovation Hub', floor: 'First Floor', room_number: 'IH-201', capacity: 100, facilities: 'Smart Classroom, ML Workstations, NVIDIA GPUs, TensorFlow/PyTorch Setup', directions: 'Same building as AI&DS Lab, take the stairs to the first floor.' }
  },
  {
    name: 'Electrical and Electronics Engineering', code: 'EEE',
    venue: 'EEE Block', color_theme: '#00BCD4',
    description: 'EEE department covers power systems, electrical machines, renewable energy, control systems, and IoT technologies.',
    image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600&q=80',
    venueData: { building: 'EEE Block', floor: 'Ground Floor', room_number: 'EEE-101', capacity: 180, facilities: 'Power Lab, Motor Test Bench, PLC Trainers, SCADA System, Electrical Workshop', directions: 'EEE Block is located at the far end of the campus near the back gate. Follow the orange signs.' }
  },
];

// ─── Events per department: 3 Technical + 3 Non-Technical ─────────────
const eventsByDept = {
  CSE: {
    Technical: [
      { name: 'Code Sprint', desc: 'Competitive programming challenge with algorithmic problems. Solve maximum problems in minimum time.', fee: 150, prize: '1st: ₹5000 | 2nd: ₹3000 | 3rd: ₹1500 | Certificates for all', maxP: 100, time: '10:00:00', faculty: 'Dr. R. Suresh', student: 'Arun Kumar (III CSE)' },
      { name: 'Hackathon 24H', desc: 'Build an innovative product in 24 hours. Theme revealed on the spot. Best innovation wins!', fee: 200, prize: '1st: ₹10000 | 2nd: ₹7000 | 3rd: ₹4000', maxP: 60, time: '09:00:00', faculty: 'Prof. S. Meenakshi', student: 'Priya Nair (IV CSE)' },
      { name: 'Debug Master', desc: 'Find and fix bugs in given programs. 5 levels with increasing difficulty. Speed and accuracy matter.', fee: 100, prize: '1st: ₹3000 | 2nd: ₹2000 | 3rd: ₹1000', maxP: 80, time: '14:00:00', faculty: 'Dr. K. Lakshmi', student: 'Karthik V (II CSE)' },
    ],
    'Non Technical': [
      { name: 'Tech Quiz', desc: 'Test your knowledge on latest technology trends, inventions, and tech history. Fast-paced buzzer rounds.', fee: 100, prize: '1st: ₹2000 | 2nd: ₹1500 | 3rd: ₹1000', maxP: 80, time: '11:00:00', faculty: 'Prof. A. Devi', student: 'Sneha R (III CSE)' },
      { name: 'Tech Pictionary', desc: 'Draw technical concepts and make your team guess them. Fun-filled rounds with increasing difficulty.', fee: 50, prize: '1st: ₹1500 | 2nd: ₹1000 | 3rd: ₹500', maxP: 50, time: '13:00:00', faculty: 'Prof. M. Raj', student: 'Divya S (II CSE)' },
      { name: 'Meme Wars', desc: 'Create the funniest tech meme using provided templates. Audience voting decides the winner.', fee: 0, prize: '1st: ₹1000 | 2nd: ₹500 | Goodies for Top 10', maxP: 100, time: '15:00:00', faculty: 'Dr. P. Kumar', student: 'Rohan M (IV CSE)' },
    ],
  },
  ECE: {
    Technical: [
      { name: 'Circuit Debugging', desc: 'Identify and repair faults in given electronic circuits. Components and tools provided.', fee: 150, prize: '1st: ₹5000 | 2nd: ₹3000 | 3rd: ₹2000', maxP: 60, time: '10:00:00', faculty: 'Dr. M. Rajan', student: 'Vikram S (III ECE)' },
      { name: 'PCB Design', desc: 'Design a Printed Circuit Board for a given specification using EDA tools. Best design wins.', fee: 150, prize: '1st: ₹4000 | 2nd: ₹3000 | 3rd: ₹2000', maxP: 40, time: '09:00:00', faculty: 'Prof. R. Priya', student: 'Anitha K (IV ECE)' },
      { name: 'Robo Race', desc: 'Build and race autonomous robots. Fastest robot to complete the track wins. Components provided.', fee: 300, prize: '1st: ₹8000 | 2nd: ₹5000 | 3rd: ₹3000', maxP: 30, time: '14:00:00', faculty: 'Dr. S. Balaji', student: 'Raj Kumar (IV ECE)' },
    ],
    'Non Technical': [
      { name: 'Tech Debate', desc: 'Debate on emerging technology topics. Topics assigned on the spot. Judged on content and delivery.', fee: 50, prize: '1st: ₹2000 | 2nd: ₹1500 | 3rd: ₹1000', maxP: 40, time: '11:00:00', faculty: 'Prof. G. Nair', student: 'Lakshmi A (III ECE)' },
      { name: 'Electronics Quiz', desc: 'Test your fundamentals in electronics and communication. Written and buzzer rounds.', fee: 100, prize: '1st: ₹1500 | 2nd: ₹1000 | 3rd: ₹500', maxP: 80, time: '13:00:00', faculty: 'Dr. T. Ravi', student: 'Mani V (II ECE)' },
      { name: 'Innovation Pitch', desc: 'Pitch your innovative electronics idea to a panel. 10-minute presentation followed by Q&A.', fee: 0, prize: '1st: ₹3000 | 2nd: ₹2000 | 3rd: ₹1000', maxP: 30, time: '15:00:00', faculty: 'Prof. S. Kumar', student: 'Deepa R (IV ECE)' },
    ],
  },
  IT: {
    Technical: [
      { name: 'Web Dev Challenge', desc: 'Build a full-stack web application in 4 hours. Theme and requirements given on the spot.', fee: 200, prize: '1st: ₹8000 | 2nd: ₹5000 | 3rd: ₹3000', maxP: 50, time: '09:00:00', faculty: 'Dr. K. Priya', student: 'Naveen S (III IT)' },
      { name: 'Cyber Security CTF', desc: 'Capture The Flag competition with multiple security challenges. Test your hacking skills ethically!', fee: 150, prize: '1st: ₹6000 | 2nd: ₹4000 | 3rd: ₹2000', maxP: 60, time: '10:00:00', faculty: 'Prof. R. Arun', student: 'Preethi M (IV IT)' },
      { name: 'Database Design', desc: 'Design optimal database schemas for given business requirements. Normalization and optimization scored.', fee: 100, prize: '1st: ₹4000 | 2nd: ₹2500 | 3rd: ₹1500', maxP: 60, time: '14:00:00', faculty: 'Dr. S. Vijay', student: 'Akash T (III IT)' },
    ],
    'Non Technical': [
      { name: 'IT Quiz Blitz', desc: 'Lightning-fast quiz on IT concepts, history, and current trends. Rapid fire and lifeline rounds included.', fee: 100, prize: '1st: ₹2000 | 2nd: ₹1500 | 3rd: ₹500', maxP: 80, time: '11:00:00', faculty: 'Prof. D. Priya', student: 'Hari K (II IT)' },
      { name: 'Tech Charades', desc: 'Act out technology terms and make your team guess. No speaking allowed. Timed rounds with bonus points.', fee: 50, prize: '1st: ₹1500 | 2nd: ₹1000 | 3rd: ₹500', maxP: 60, time: '13:00:00', faculty: 'Dr. N. Meera', student: 'Sowmya P (III IT)' },
      { name: 'Poster Design', desc: 'Create an informative and attractive poster on a technology topic given on the spot.', fee: 50, prize: '1st: ₹1500 | 2nd: ₹1000 | 3rd: ₹500', maxP: 40, time: '15:00:00', faculty: 'Prof. R. Shankar', student: 'Vaishnavi B (II IT)' },
    ],
  },
  'AI&DS': {
    Technical: [
      { name: 'ML Model Showdown', desc: 'Build the best Machine Learning model on the provided dataset. Accuracy-based scoring with model explanation.', fee: 200, prize: '1st: ₹7000 | 2nd: ₹5000 | 3rd: ₹3000', maxP: 50, time: '09:00:00', faculty: 'Dr. R. Venkat', student: 'Nandini K (III AI&DS)' },
      { name: 'Data Visualization', desc: 'Create compelling data stories from complex datasets. Tools: Tableau, Power BI, or Python libraries.', fee: 150, prize: '1st: ₹5000 | 2nd: ₹3000 | 3rd: ₹2000', maxP: 40, time: '10:00:00', faculty: 'Prof. S. Padma', student: 'Arjun M (IV AI&DS)' },
      { name: 'AI Chatbot Battle', desc: 'Build an intelligent chatbot that passes the Turing test. Judged on intelligence, accuracy, and creativity.', fee: 150, prize: '1st: ₹6000 | 2nd: ₹4000 | 3rd: ₹2000', maxP: 40, time: '14:00:00', faculty: 'Dr. V. Ramesh', student: 'Kavitha S (III AI&DS)' },
    ],
    'Non Technical': [
      { name: 'Data Science Quiz', desc: 'Test your knowledge on AI, Data Science, statistics, and ML concepts. Case study rounds included.', fee: 100, prize: '1st: ₹2000 | 2nd: ₹1500 | 3rd: ₹1000', maxP: 80, time: '11:00:00', faculty: 'Prof. A. Bhat', student: 'Rahul V (II AI&DS)' },
      { name: 'AI Art Gallery', desc: 'Create stunning artwork using AI tools. Judged on creativity, prompt engineering, and aesthetic value.', fee: 50, prize: '1st: ₹2000 | 2nd: ₹1500 | 3rd: ₹500 | Gallery exhibition for top 20', maxP: 80, time: '13:00:00', faculty: 'Dr. P. Anand', student: 'Priya S (III AI&DS)' },
      { name: 'Future Tech Talk', desc: 'Present your vision on AI/ML future trends. 8-minute presentation + Q&A. PPT required.', fee: 0, prize: '1st: ₹2000 | 2nd: ₹1500 | 3rd: ₹1000', maxP: 40, time: '15:00:00', faculty: 'Prof. K. Mohan', student: 'Siva R (IV AI&DS)' },
    ],
  },
  'AI&ML': {
    Technical: [
      { name: 'Neural Network Design', desc: 'Design and train neural networks for a given classification task. PyTorch or TensorFlow. Best accuracy wins.', fee: 200, prize: '1st: ₹7000 | 2nd: ₹5000 | 3rd: ₹3000', maxP: 40, time: '09:00:00', faculty: 'Dr. P. Anitha', student: 'Madhavan S (IV AI&ML)' },
      { name: 'NLP Challenge', desc: 'Natural Language Processing tasks: sentiment analysis, text classification, named entity recognition.', fee: 150, prize: '1st: ₹5000 | 2nd: ₹3500 | 3rd: ₹2000', maxP: 50, time: '10:00:00', faculty: 'Prof. R. Devi', student: 'Harish K (III AI&ML)' },
      { name: 'Computer Vision Battle', desc: 'Real-time image classification and object detection challenge. OpenCV / Deep Learning frameworks allowed.', fee: 150, prize: '1st: ₹6000 | 2nd: ₹4000 | 3rd: ₹2000', maxP: 40, time: '14:00:00', faculty: 'Dr. S. Kumar', student: 'Sandhya M (III AI&ML)' },
    ],
    'Non Technical': [
      { name: 'ML Quiz Bowl', desc: 'Machine Learning quiz covering theory, math, and real-world ML applications. Case studies included.', fee: 100, prize: '1st: ₹2000 | 2nd: ₹1500 | 3rd: ₹1000', maxP: 80, time: '11:00:00', faculty: 'Prof. V. Prasad', student: 'Aishwarya T (II AI&ML)' },
      { name: 'AI Ethics Debate', desc: 'Debate on critical AI ethics issues: bias, privacy, job displacement, autonomous weapons. Structured debate format.', fee: 50, prize: '1st: ₹2000 | 2nd: ₹1500 | 3rd: ₹1000', maxP: 40, time: '13:00:00', faculty: 'Dr. R. Nair', student: 'Kiran V (IV AI&ML)' },
      { name: 'Tech Treasure Hunt', desc: 'Campus-wide treasure hunt where every clue is a tech puzzle or ML question. Team event.', fee: 50, prize: '1st: ₹3000 | 2nd: ₹2000 | 3rd: ₹1000 | Goodies for all finishers', maxP: 60, time: '15:00:00', faculty: 'Prof. S. Rajan', student: 'Nethra P (III AI&ML)' },
    ],
  },
  EEE: {
    Technical: [
      { name: 'Power Systems Design', desc: 'Design efficient power distribution systems for given requirements. Simulation tools provided. Efficiency-based scoring.', fee: 150, prize: '1st: ₹5000 | 2nd: ₹3500 | 3rd: ₹2000', maxP: 50, time: '09:00:00', faculty: 'Dr. T. Suresh', student: 'Balaji R (IV EEE)' },
      { name: 'Electrical CAD', desc: 'AutoCAD Electrical circuit design for a given specification. Speed and accuracy matter. Software provided.', fee: 100, prize: '1st: ₹4000 | 2nd: ₹2500 | 3rd: ₹1500', maxP: 40, time: '10:00:00', faculty: 'Prof. M. Kaveri', student: 'Suresh K (III EEE)' },
      { name: 'IoT Challenge', desc: 'Build IoT-based solutions for real-world problems. Arduino/Raspberry Pi and components provided. Working demo required.', fee: 200, prize: '1st: ₹7000 | 2nd: ₹5000 | 3rd: ₹3000', maxP: 40, time: '14:00:00', faculty: 'Dr. P. Raghavan', student: 'Meena S (IV EEE)' },
    ],
    'Non Technical': [
      { name: 'EEE Quiz', desc: 'Comprehensive quiz on electrical engineering fundamentals, power systems, and current technologies.', fee: 100, prize: '1st: ₹2000 | 2nd: ₹1500 | 3rd: ₹1000', maxP: 80, time: '11:00:00', faculty: 'Prof. R. Sundaram', student: 'Vinoth K (II EEE)' },
      { name: 'Green Energy Pitch', desc: 'Pitch your renewable energy ideas to solve real-world energy problems. Feasibility and innovation judged.', fee: 0, prize: '1st: ₹3000 | 2nd: ₹2000 | 3rd: ₹1000', maxP: 30, time: '13:00:00', faculty: 'Dr. S. Balakrishnan', student: 'Anjali M (III EEE)' },
      { name: 'Photography: Tech Lens', desc: 'Capture the beauty of technology through your lens. Theme: Technology in our daily life.', fee: 50, prize: '1st: ₹2000 | 2nd: ₹1500 | 3rd: ₹500 | Exhibition for top 15', maxP: 60, time: '15:00:00', faculty: 'Prof. K. Arumugam', student: 'Nandhini S (III EEE)' },
    ],
  },
};

// ─── Gallery items ─────────────────────────────────────────────────────
const galleryItems = [
  { title: 'Symposium 2023 Opening', category: 'Events', url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80' },
  { title: 'Hackathon Winners', category: 'Events', url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80' },
  { title: 'Tech Talk Session', category: 'Workshops', url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&q=80' },
  { title: 'Cultural Night 2023', category: 'Cultural', url: 'https://images.unsplash.com/photo-1429514513361-8fa32282fd5f?w=800&q=80' },
  { title: 'Robotics Demo', category: 'Technical', url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80' },
  { title: 'Award Ceremony', category: 'Events', url: 'https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?w=800&q=80' },
  { title: 'Code Marathon', category: 'Technical', url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80' },
  { title: 'Team Collaboration', category: 'Events', url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80' },
];

// ─── Sponsors ──────────────────────────────────────────────────────────
const sponsors = [
  { name: 'TechCorp India', tier: 'Platinum', logo: 'https://via.placeholder.com/200x80?text=TechCorp', website: 'https://example.com' },
  { name: 'InnovateLab', tier: 'Gold', logo: 'https://via.placeholder.com/200x80?text=InnovateLab', website: 'https://example.com' },
  { name: 'CloudSys Technologies', tier: 'Gold', logo: 'https://via.placeholder.com/200x80?text=CloudSys', website: 'https://example.com' },
  { name: 'DataFlow Analytics', tier: 'Silver', logo: 'https://via.placeholder.com/200x80?text=DataFlow', website: 'https://example.com' },
  { name: 'CodeBase Solutions', tier: 'Silver', logo: 'https://via.placeholder.com/200x80?text=CodeBase', website: 'https://example.com' },
  { name: 'AI Ventures', tier: 'Bronze', logo: 'https://via.placeholder.com/200x80?text=AIVentures', website: 'https://example.com' },
];

// ─── FAQ ───────────────────────────────────────────────────────────────
const faqs = [
  { q: 'Who can participate in TechSymposium?', a: 'All students from recognized engineering colleges and institutions across India are eligible to participate. Valid college ID is mandatory.', cat: 'General', order: 1 },
  { q: 'Is there a registration fee?', a: 'Registration fees vary by event. Technical events start from ₹100 and non-technical events from ₹0 to ₹100. Check individual event pages for exact fees.', cat: 'Registration', order: 2 },
  { q: 'How do I register for an event?', a: 'Visit the Register page, fill in your details, select your preferred event, and complete the payment. You will receive a QR code via email for entry.', cat: 'Registration', order: 3 },
  { q: 'Can I register for multiple events?', a: 'Yes! You can register for multiple events as long as they do not have overlapping timings. Each registration requires a separate payment.', cat: 'Registration', order: 4 },
  { q: 'What is the payment method?', a: 'We support UPI, Credit/Debit Cards, Net Banking, and Wallets through our demo payment gateway. Cash payments are accepted at the venue.', cat: 'Payment', order: 5 },
  { q: 'Will I receive a QR code after registration?', a: 'Yes! A unique QR code is generated immediately after successful payment. You can download or print it from the registration success page.', cat: 'Registration', order: 6 },
  { q: 'What should I bring on the event day?', a: 'Bring your QR code (printed or digital), valid college ID card, and any additional materials mentioned in the event rules.', cat: 'General', order: 7 },
  { q: 'How do I reach ABC Engineering College?', a: 'ABC Engineering College is located in Chennai, Tamil Nadu. It is well connected by bus, metro, and road. GPS: 13.0827° N, 80.2707° E. Detailed directions on our Contact page.', cat: 'Logistics', order: 8 },
  { q: 'Are there prizes for all events?', a: 'Yes! Every event has cash prizes and certificates. Prize pool totals over ₹1,00,000. Top performers in all events receive recognition.', cat: 'Prizes', order: 9 },
  { q: 'Can I cancel my registration?', a: 'Registration fees are non-refundable. However, you may transfer your registration to another student by contacting the coordinator before 48 hours of the event.', cat: 'Registration', order: 10 },
];

// ─── Sample participants ────────────────────────────────────────────────
const sampleParticipants = [
  { student_name: 'Arun Kumar', register_number: '20CS001', department: 'CSE', year: '3rd', college_name: 'ABC Engineering College', email: 'arun@example.com', phone: '9876543210', gender: 'Male' },
  { student_name: 'Priya Sharma', register_number: '21EC002', department: 'ECE', year: '2nd', college_name: 'XYZ Engineering College', email: 'priya@example.com', phone: '9876543211', gender: 'Female' },
  { student_name: 'Karthik R', register_number: '20IT003', department: 'IT', year: '3rd', college_name: 'ABC Engineering College', email: 'karthik@example.com', phone: '9876543212', gender: 'Male' },
  { student_name: 'Divya M', register_number: '22AI004', department: 'AI&DS', year: '1st', college_name: 'PQR Engineering College', email: 'divya@example.com', phone: '9876543213', gender: 'Female' },
  { student_name: 'Rahul V', register_number: '21EE005', department: 'EEE', year: '2nd', college_name: 'LMN Engineering College', email: 'rahul@example.com', phone: '9876543214', gender: 'Male' },
];

// ─── Main seed function ────────────────────────────────────────────────
async function seed() {
  let connection;
  try {
    console.log('🔌 Connecting to MySQL...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      multipleStatements: true,
    });
    console.log('✅ Connected!');

    // ── Run schema ────────────────────────────────────────────────────
    console.log('\n📦 Running database schema...');
    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await connection.query(schema);
    await connection.changeUser({ database: process.env.DB_NAME || 'abc_symposium' });
    console.log('✅ Schema applied');

    // ── Admin ─────────────────────────────────────────────────────────
    console.log('\n👤 Seeding admin...');
    const hashedPw = await bcrypt.hash('admin123', 12);
    await connection.query(
      'INSERT IGNORE INTO admins (username, password, email) VALUES (?,?,?)',
      ['admin', hashedPw, 'admin@abcsymposium.edu']
    );
    console.log('✅ Admin: username=admin, password=admin123');

    // ── Departments + Venues ──────────────────────────────────────────
    console.log('\n🏛️  Seeding departments and venues...');
    const deptIds = {};
    for (const dept of departments) {
      const [r] = await connection.query(
        'INSERT INTO departments (name, code, venue, description, image, color_theme) VALUES (?,?,?,?,?,?) ON DUPLICATE KEY UPDATE name=VALUES(name), venue=VALUES(venue), description=VALUES(description)',
        [dept.name, dept.code, dept.venue, dept.description, dept.image, dept.color_theme]
      );
      let deptId = r.insertId;
      if (!deptId) {
        const [ex] = await connection.query('SELECT id FROM departments WHERE code=?', [dept.code]);
        deptId = ex[0].id;
      }
      deptIds[dept.code] = deptId;

      // Insert venue
      const v = dept.venueData;
      await connection.query(
        `INSERT INTO venues (name, building, floor, room_number, capacity, facilities, department_id)
         VALUES (?,?,?,?,?,?,?)`,
        [dept.venue, v.building, v.floor, v.room_number, v.capacity, v.facilities, deptId]
      );
    }
    console.log(`✅ ${departments.length} departments + venues seeded`);

    // ── Events ───────────────────────────────────────────────────────
    console.log('\n🎯 Seeding 36 events...');
    let eventCount = 0;
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() + 15); // Events 15 days from now
    const day2 = new Date(baseDate);
    day2.setDate(day2.getDate() + 1);

    for (const [code, typeMap] of Object.entries(eventsByDept)) {
      const deptId = deptIds[code];
      const dept = departments.find(d => d.code === code);
      if (!deptId || !dept) continue;

      for (const [eventType, evts] of Object.entries(typeMap)) {
        const evtDate = eventType === 'Technical' ? baseDate : day2;
        for (const ev of evts) {
          await connection.query(
            `INSERT INTO events (name, department_id, venue, event_date, event_time, description, rules,
              coordinator_name, coordinator_phone, faculty_coordinator, student_coordinator,
              max_participants, registration_fee, available_seats, prize_details, event_type,
              eligibility, is_active, status)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1,'Open')`,
            [
              ev.name, deptId, dept.venue,
              evtDate.toISOString().split('T')[0], ev.time,
              ev.desc,
              '1. Valid college ID mandatory.\n2. Registration fee non-refundable.\n3. Report 30 min before event.\n4. Judges decision is final.\n5. Malpractice leads to disqualification.',
              ev.faculty, '9800000000',
              ev.faculty, ev.student,
              ev.maxP, ev.fee, ev.maxP, ev.prize, eventType,
              'Open to all engineering students from any recognized institution.',
            ]
          );
          eventCount++;
        }
      }
    }
    console.log(`✅ ${eventCount} events seeded`);

    // ── Gallery ──────────────────────────────────────────────────────
    console.log('\n🖼️  Seeding gallery...');
    for (const item of galleryItems) {
      await connection.query(
        'INSERT INTO gallery (title, image_url, category) VALUES (?,?,?)',
        [item.title, item.url, item.category]
      );
    }
    console.log(`✅ ${galleryItems.length} gallery items seeded`);

    // ── Sponsors ─────────────────────────────────────────────────────
    console.log('\n💼 Seeding sponsors...');
    for (const sp of sponsors) {
      await connection.query(
        'INSERT INTO sponsors (name, tier, logo_url, website) VALUES (?,?,?,?)',
        [sp.name, sp.tier, sp.logo, sp.website]
      );
    }
    console.log(`✅ ${sponsors.length} sponsors seeded`);

    // ── FAQ ──────────────────────────────────────────────────────────
    console.log('\n❓ Seeding FAQ...');
    for (const f of faqs) {
      await connection.query(
        'INSERT INTO faq (question, answer, category, display_order) VALUES (?,?,?,?)',
        [f.q, f.a, f.cat, f.order]
      );
    }
    console.log(`✅ ${faqs.length} FAQ items seeded`);

    // ── Sample participants + registrations ──────────────────────────
    console.log('\n👥 Seeding sample participants...');
    const [allEvents] = await connection.query('SELECT id, registration_fee FROM events LIMIT 10');

    for (let i = 0; i < sampleParticipants.length; i++) {
      const p = sampleParticipants[i];
      const [pRes] = await connection.query(
        'INSERT IGNORE INTO participants (student_name, register_number, department, year, college_name, email, phone, gender) VALUES (?,?,?,?,?,?,?,?)',
        [p.student_name, p.register_number, p.department, p.year, p.college_name, p.email, p.phone, p.gender]
      );
      let pid = pRes.insertId;
      if (!pid) {
        const [ep] = await connection.query('SELECT id FROM participants WHERE register_number=?', [p.register_number]);
        pid = ep[0].id;
      }

      if (allEvents[i]) {
        const regId = 'REG-' + Date.now() + '-' + (i + 1);
        const [regRes] = await connection.query(
          "INSERT INTO registrations (registration_id, participant_id, event_id, status, payment_status) VALUES (?,?,?,'approved','paid')",
          [regId, pid, allEvents[i].id]
        );
        await connection.query(
          "INSERT INTO payments (registration_id, amount, status, payment_method) VALUES (?,?,?,'UPI')",
          [regRes.insertId, allEvents[i].registration_fee, 'paid']
        );
        // Reduce available seats
        await connection.query('UPDATE events SET available_seats = available_seats - 1 WHERE id = ?', [allEvents[i].id]);
      }
    }
    console.log(`✅ ${sampleParticipants.length} sample participants seeded`);

    console.log('\n🎉 ==============================');
    console.log('   Database seeded successfully!');
    console.log('   Admin: username=admin, password=admin123');
    console.log(`   Departments: ${departments.length}`);
    console.log(`   Events: ${eventCount}`);
    console.log(`   Participants: ${sampleParticipants.length} samples`);
    console.log('================================\n');

  } catch (err) {
    console.error('\n❌ Seed failed:', err.message);
    console.error('Code:', err.code);
    console.error('\n📌 Make sure MySQL is running and credentials in backend/.env are correct.');
    console.error('   DB_HOST=localhost, DB_USER=root, DB_PASSWORD=<your_password>');
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

seed();

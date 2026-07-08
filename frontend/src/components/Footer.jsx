import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin, FiFacebook, FiTwitter, FiInstagram, FiLinkedin } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="bg-secondary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center font-bold">A</div>
              <span className="font-poppins font-bold text-lg">ABC College</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              ABC Engineering College Symposium - Innovation, Technology, Competition, and Learning.
            </p>
          </div>

          <div>
            <h4 className="font-poppins font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link to="/events" className="hover:text-accent transition">Events</Link></li>
              <li><Link to="/departments" className="hover:text-accent transition">Departments</Link></li>
              <li><Link to="/gallery" className="hover:text-accent transition">Gallery</Link></li>
              <li><Link to="/about" className="hover:text-accent transition">About Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-poppins font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li className="flex items-center gap-2"><FiMapPin className="text-accent" /> ABC Engineering College, Chennai</li>
              <li className="flex items-center gap-2"><FiPhone className="text-accent" /> +91 98765 43210</li>
              <li className="flex items-center gap-2"><FiMail className="text-accent" /> info@abccollege.edu</li>
            </ul>
          </div>

          <div>
            <h4 className="font-poppins font-semibold mb-4">Follow Us</h4>
            <div className="flex gap-3">
              {[FiFacebook, FiTwitter, FiInstagram, FiLinkedin].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-primary transition">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} ABC Engineering College. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

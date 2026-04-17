import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Instagram, Facebook, Twitter } from 'lucide-react';
import Logo from '@/components/ui/logo';

const Footer = () => {
  return (
    <footer className="bg-[#121417] text-background/80 relative overflow-hidden">
      <div className="container mx-auto px-4 py-16 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <div className="mb-4">
              <Logo isDark={true} />
            </div>
            <p className="text-sm leading-relaxed mb-6">
              Experience the finest culinary journey with authentic flavors and modern elegance. Every dish is crafted with love.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-lg font-semibold text-background mb-4">
              Quick Links
            </h4>
            <ul className="space-y-3">
              <li>
                <Link to="/menu" className="hover:text-primary transition-colors">
                  Our Menu
                </Link>
              </li>
              <li>
                <Link to="/booking" className="hover:text-primary transition-colors">
                  Book a Table
                </Link>
              </li>
              <li>
                <Link to="/loyalty" className="hover:text-primary transition-colors">
                  Loyalty Program
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-lg font-semibold text-background mb-4">
              Contact Us
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary" />
                <span>hello@spicehaven.com</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-1" />
                <span>123 Food Street, Downtown, City - 400001</span>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h4 className="font-display text-lg font-semibold text-background mb-4">
              Opening Hours
            </h4>
            <ul className="space-y-3">
              <li className="flex justify-between">
                <span>Monday - Friday</span>
                <span className="text-primary">11 AM - 11 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Saturday</span>
                <span className="text-primary">10 AM - 12 AM</span>
              </li>
              <li className="flex justify-between">
                <span>Sunday</span>
                <span className="text-primary">10 AM - 11 PM</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium">
          <p>© 2026 Spice Haven. All rights reserved.</p>
          <p className="order-first md:order-none">
            Built by <a href="https://www.sarveshghotekar.in" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold">Sarvesh Ghotekar</a>
          </p>
          <div className="flex gap-4 opacity-40 hover:opacity-100 transition-opacity">
            <Link to="/login-captain" className="hover:text-primary">Staff Portal</Link>
            <Link to="/admin-login" className="hover:text-primary">Management</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

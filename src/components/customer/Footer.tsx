import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Instagram, Facebook, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-charcoal text-background/80">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full gradient-warm flex items-center justify-center">
                <span className="text-xl">🍽️</span>
              </div>
              <span className="font-display text-xl font-semibold text-background">
                Spice Haven
              </span>
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

        <div className="border-t border-background/10 mt-12 pt-8 text-center text-sm">
          <p>© 2024 Spice Haven. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

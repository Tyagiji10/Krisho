import { Link } from 'react-router-dom';
import { Leaf, Mail, Phone, MapPin, Globe, MessageCircle, Share2 } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-slate-300 dark:text-slate-400 pt-12 pb-24 md:pb-6 border-t border-slate-800 dark:border-slate-900">
      <div className="container mx-auto px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-8 md:mb-12">
          {/* Brand */}
          <div className="space-y-3 col-span-2 md:col-span-1">
            <div className="flex items-center gap-1.5">
              <div className="bg-primary p-1 rounded-lg text-white">
                <Leaf size={18} />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">Krisho</span>
            </div>
            <p className="text-[10px] md:text-sm leading-relaxed text-slate-400">
              Empowering Indian farmers by bridging the gap between farm and table. Join us in creating a sustainable digital marketplace for agriculture.
            </p>
            <div className="flex gap-3">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="p-1.5 bg-slate-800 rounded-lg hover:bg-primary transition-colors"><Globe size={14} /></a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-1.5 bg-slate-800 rounded-lg hover:bg-primary transition-colors"><MessageCircle size={14} /></a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-1.5 bg-slate-800 rounded-lg hover:bg-primary transition-colors"><Share2 size={14} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h4 className="text-white font-bold mb-4 text-xs md:text-sm">Quick Links</h4>
            <ul className="space-y-2 text-[10px] md:text-sm text-slate-400">
              <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li><Link to="/marketplace" className="hover:text-primary transition-colors">Marketplace</Link></li>
              <li><Link to="/register" className="hover:text-primary transition-colors">Join as Farmer</Link></li>
              <li><a href="/#about" className="hover:text-primary transition-colors">About Us</a></li>
            </ul>
          </div>

          {/* Categories */}
          <div className="col-span-1">
            <h4 className="text-white font-bold mb-4 text-xs md:text-sm">Categories</h4>
            <ul className="space-y-2 text-[10px] md:text-sm text-slate-400">
              <li><Link to="/marketplace?category=Grains" className="hover:text-primary transition-colors">Organic Grains</Link></li>
              <li><Link to="/marketplace?category=Vegetables" className="hover:text-primary transition-colors">Fresh Veggies</Link></li>
              <li><Link to="/marketplace?category=Dairy" className="hover:text-primary transition-colors">Dairy Products</Link></li>
              <li><Link to="/marketplace?category=Spices" className="hover:text-primary transition-colors">Spices & Herbs</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="text-white font-bold mb-4 text-xs md:text-sm">Contact Us</h4>
            <ul className="space-y-2 text-[10px] md:text-sm text-slate-400">
              <li className="flex items-start gap-2">
                <MapPin className="text-primary mt-0.5" size={14} />
                <span>Muzaffarnagar, Uttar Pradesh, India</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="text-primary" size={14} />
                <span>+91 9999999999</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="text-primary" size={14} />
                <span>support@eshakti.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-3 text-[9px] md:text-xs">
          <p>© {new Date().getFullYear()} Krisho. All rights reserved.</p>
          <div className="flex gap-4 md:gap-6">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link to="/cookies" className="hover:text-white transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

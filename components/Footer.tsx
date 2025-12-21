
import React from 'react';
import { AppView } from '../types';
import { Compass, Instagram, Twitter, Facebook, Mail, Heart } from 'lucide-react';

interface FooterProps {
  setView: (view: AppView) => void;
}

const Footer: React.FC<FooterProps> = ({ setView }) => {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4 cursor-pointer" onClick={() => setView(AppView.HOME)}>
              <div className="w-8 h-8 bg-gradient-to-tr from-rose-500 to-orange-400 rounded-lg flex items-center justify-center text-white">
                <Compass className="w-5 h-5" />
              </div>
              <span className="font-serif text-xl font-bold text-gray-900">SheRoam</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Empowering women to explore the world fearlessly. AI-driven safety, trusted community, and verified recommendations.
            </p>
            <div className="flex gap-4">
              <button className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition">
                <Instagram className="w-4 h-4" />
              </button>
              <button className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition">
                <Twitter className="w-4 h-4" />
              </button>
              <button className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition">
                <Facebook className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-bold text-gray-900 mb-4">Product</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><button onClick={() => setView(AppView.SAFETY)} className="hover:text-rose-600 transition">Safety Check</button></li>
              <li><button onClick={() => setView(AppView.EXPLORE)} className="hover:text-rose-600 transition">Explore Places</button></li>
              <li><button onClick={() => setView(AppView.COMMUNITY)} className="hover:text-rose-600 transition">Community</button></li>
              <li><button onClick={() => setView(AppView.BLOG)} className="hover:text-rose-600 transition">Travel Blog</button></li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-bold text-gray-900 mb-4">Company</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><button onClick={() => setView(AppView.ABOUT)} className="hover:text-rose-600 transition">About Us</button></li>
              <li><button onClick={() => setView(AppView.TERMS)} className="hover:text-rose-600 transition">Terms of Use</button></li>
              <li><button onClick={() => setView(AppView.PRIVACY)} className="hover:text-rose-600 transition">Privacy Policy</button></li>
              <li><a href="mailto:hello@sheroam.com" className="hover:text-rose-600 transition">Contact</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-bold text-gray-900 mb-4">Stay Updated</h4>
            <p className="text-xs text-gray-500 mb-4">Get the latest travel safety tips and hidden gems directly to your inbox.</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Enter email" 
                className="flex-1 px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-200 text-sm"
              />
              <button className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} SheRoam Inc. All rights reserved.</p>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <span>Made with</span>
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
            <span>for safe travels everywhere.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

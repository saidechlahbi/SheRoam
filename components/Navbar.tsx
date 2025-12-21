
import React from 'react';
import { AppView, UserProfile } from '../types';
import { Compass, Shield, Users, Map, LogOut, User as UserIcon, BookOpen, HeartHandshake } from 'lucide-react';

interface NavbarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  user: UserProfile | null;
  onLoginClick: () => void;
  onLogoutClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, setView, user, onLoginClick, onLogoutClick }) => {
  const navItems = [
    { id: AppView.HOME, label: 'Home', icon: <Compass className="w-5 h-5" /> },
    { id: AppView.SAFETY, label: 'Safety', icon: <Shield className="w-5 h-5" /> },
    { id: AppView.EXPLORE, label: 'Explore', icon: <Map className="w-5 h-5" /> },
    { id: AppView.BUDDY, label: 'Find Buddy', icon: <HeartHandshake className="w-5 h-5" /> },
    { id: AppView.COMMUNITY, label: 'Community', icon: <Users className="w-5 h-5" /> },
    { id: AppView.BLOG, label: 'Blog', icon: <BookOpen className="w-5 h-5" /> },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center cursor-pointer" onClick={() => setView(AppView.HOME)}>
            <div className="w-10 h-10 bg-gradient-to-tr from-rose-500 to-orange-400 rounded-xl flex items-center justify-center text-white mr-3 shadow-lg shadow-rose-200">
              <Compass className="w-6 h-6" />
            </div>
            <span className="font-serif text-2xl font-bold text-gray-900 tracking-tight">SheRoam</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`flex items-center gap-2 text-sm font-medium transition-colors duration-200 
                  ${currentView === item.id 
                    ? 'text-rose-600' 
                    : 'text-gray-500 hover:text-gray-900'
                  }`}
              >
                <span className="hidden lg:inline">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover border border-gray-200 shadow-sm" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                      <UserIcon className="w-4 h-4" />
                    </div>
                  )}
                  <span className="text-sm font-bold text-gray-800 hidden sm:block">{user.name}</span>
                </div>
                <button 
                  onClick={onLogoutClick}
                  className="text-gray-400 hover:text-rose-600 transition p-2 hover:bg-rose-50 rounded-full"
                  title="Sign out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <>
                <button 
                  onClick={onLoginClick}
                  className="hidden sm:block text-sm font-medium text-gray-500 hover:text-gray-900"
                >
                  Log in
                </button>
                <button 
                  onClick={onLoginClick}
                  className="bg-gray-900 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition shadow-md transform hover:scale-105 active:scale-95"
                >
                  Join Now
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile Nav Bar (Bottom) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-50">
        <div className="flex justify-around items-center p-3">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`flex flex-col items-center gap-1 ${currentView === item.id ? 'text-rose-600' : 'text-gray-400'}`}
            >
              {React.cloneElement(item.icon as any, { className: "w-5 h-5" })}
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

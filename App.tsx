
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import SafetyAnalysis from './components/SafetyAnalysis';
import PlaceFinder from './components/PlaceFinder';
import CommunityFeed from './components/CommunityFeed';
import TravelBuddyFinder from './components/TravelBuddyFinder';
import AuthModal from './components/AuthModal';
import Blog from './components/Blog';
import Footer from './components/Footer';
import { AppView, UserProfile } from './types';
import { ArrowRight, Globe, ShieldCheck, Heart, Search, CheckCircle, Users } from 'lucide-react';
import * as authService from './services/authService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // Check for OAuth callback and restore user session
  useEffect(() => {
    const initAuth = async () => {
      // Handle OAuth callback
      const token = authService.handleOAuthCallback();
      
      // Try to get current user if we have a token
      if (token || authService.isAuthenticated()) {
        try {
          const currentUser = await authService.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
          }
        } catch (error) {
          console.error('Failed to restore user session:', error);
        }
      }
      
      setIsLoadingUser(false);
    };
    
    initAuth();
  }, []);

  const handleLogin = (userData: UserProfile) => {
    setUser(userData);
    setIsAuthOpen(false);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Helper to wrap content with footer (only for main pages that scroll)
  const withFooter = (content: React.ReactNode) => (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1">
        {content}
      </div>
      <Footer setView={setCurrentView} />
    </div>
  );

  const renderView = () => {
    switch (currentView) {
      case AppView.SAFETY:
        return withFooter(<SafetyAnalysis />);
      case AppView.EXPLORE:
        return withFooter(<PlaceFinder user={user} onAuthRequired={() => setIsAuthOpen(true)} />);
      case AppView.BUDDY:
        return withFooter(<TravelBuddyFinder user={user} onAuthRequired={() => setIsAuthOpen(true)} />);
      case AppView.COMMUNITY:
        return withFooter(<CommunityFeed user={user} onAuthRequired={() => setIsAuthOpen(true)} />);
      case AppView.BLOG:
        return withFooter(<Blog />);
      
      // Static Pages
      case AppView.ABOUT:
        return withFooter(
          <div className="max-w-4xl mx-auto px-6 py-16 animate-fade-in">
            <h1 className="text-4xl font-serif font-bold text-gray-900 mb-6">About SheRoam</h1>
            <div className="prose prose-lg text-gray-600">
              <p className="mb-4">SheRoam was born from a simple belief: <strong>every woman deserves to explore the world without fear.</strong></p>
              <p className="mb-4">Founded in 2024 by a team of avid travelers and tech enthusiasts, we realized that existing travel tools lacked the specific context women need—safety nuance, community verification, and trusted local insights.</p>
              <p className="mb-8">Our mission is to bridge that gap using advanced AI technology and the power of shared experiences. Whether you're taking your first solo trip or you're a digital nomad veteran, SheRoam is your digital companion, ensuring you're never truly alone on the road.</p>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Values</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Empowerment:</strong> Providing the knowledge to make confident decisions.</li>
                <li><strong>Community:</strong> Building a supportive network of sisters worldwide.</li>
                <li><strong>Accuracy:</strong> Prioritizing verified, real-time data over generic advice.</li>
              </ul>
            </div>
          </div>
        );
      
      case AppView.TERMS:
        return withFooter(
          <div className="max-w-4xl mx-auto px-6 py-16 animate-fade-in">
            <h1 className="text-4xl font-serif font-bold text-gray-900 mb-8">Terms of Use</h1>
            <div className="space-y-6 text-gray-600">
              <p>Last updated: October 2024</p>
              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-2">1. Acceptance of Terms</h3>
                <p>By accessing and using SheRoam, you agree to be bound by these terms. If you do not agree, please do not use our services.</p>
              </section>
              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-2">2. Community Guidelines</h3>
                <p>SheRoam is a safe space. We have zero tolerance for harassment, hate speech, or sharing false safety information. Violating this will result in immediate account suspension.</p>
              </section>
              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-2">3. Accuracy of Information</h3>
                <p>While we use advanced AI and trusted sources, travel conditions change rapidly. SheRoam provides information for guidance but cannot guarantee absolute safety. Always trust your instincts and local authorities.</p>
              </section>
            </div>
          </div>
        );

      case AppView.PRIVACY:
        return withFooter(
          <div className="max-w-4xl mx-auto px-6 py-16 animate-fade-in">
            <h1 className="text-4xl font-serif font-bold text-gray-900 mb-8">Privacy Policy</h1>
            <div className="space-y-6 text-gray-600">
              <p>Your privacy and safety are our top priorities.</p>
              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-2">1. Data Collection</h3>
                <p>We collect location data only when you actively use features like "Near Me" or check safety scores. This data is not sold to third parties.</p>
              </section>
              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-2">2. User Anonymity</h3>
                <p>When you post in the community, you can choose to limit visibility. We employ measures to protect your identity and precise location history.</p>
              </section>
              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-2">3. Cookies</h3>
                <p>We use cookies to improve your browsing experience and remember your preferences (like recent searches).</p>
              </section>
            </div>
          </div>
        );

      case AppView.HOME:
      default:
        return withFooter(
          <div className="animate-fade-in">
             {/* Hero Section */}
             <div className="relative overflow-hidden bg-rose-50 py-24 sm:py-32 lg:py-40">
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-white/0 to-white/80 rounded-full blur-3xl pointer-events-none" />
               <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-rose-100 text-rose-600 text-sm font-semibold mb-8 shadow-sm animate-fade-in-down">
                   <ShieldCheck className="w-4 h-4" /> Trusted by 50,000+ women travelers
                 </div>
                 <h1 className="text-5xl md:text-7xl font-serif font-bold text-gray-900 mb-8 leading-tight tracking-tight">
                   Travel Fearlessly.<br/>
                   <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500">Discover Freely.</span>
                 </h1>
                 <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
                   The world's first AI-powered companion designed exclusively for women. Accurate safety insights, verified spots, and a global sisterhood wherever you go.
                 </p>
                 <div className="flex flex-col sm:flex-row gap-4 justify-center">
                   <button 
                    onClick={() => setCurrentView(AppView.SAFETY)}
                    className="flex items-center justify-center gap-2 bg-rose-600 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-rose-700 transition shadow-lg shadow-rose-200 hover:shadow-xl hover:-translate-y-1 duration-300"
                   >
                     Check Safety Score
                     <ArrowRight className="w-5 h-5" />
                   </button>
                   <button 
                    onClick={() => setCurrentView(AppView.EXPLORE)}
                    className="flex items-center justify-center gap-2 bg-white text-gray-900 border border-gray-200 px-8 py-4 rounded-full text-lg font-medium hover:bg-gray-50 transition shadow-sm hover:shadow-md"
                   >
                     Explore Places
                   </button>
                 </div>
               </div>
             </div>

             {/* How It Works Section */}
             <div className="py-24 bg-white">
               <div className="max-w-7xl mx-auto px-6 text-center">
                 <h2 className="text-3xl font-serif font-bold text-gray-900 mb-16">How SheRoam Works</h2>
                 <div className="grid md:grid-cols-3 gap-12 relative">
                   {/* Connecting Line (Desktop) */}
                   <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-rose-100 to-transparent -z-10" />
                   
                   <div className="relative bg-white p-6">
                     <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center text-rose-600 mx-auto mb-6 text-3xl font-bold border-4 border-white shadow-lg">
                       1
                     </div>
                     <h3 className="text-xl font-bold text-gray-900 mb-3">Pick a Destination</h3>
                     <p className="text-gray-500">Search any city worldwide. Our AI instantly aggregates safety data, local laws, and cultural norms specific to women.</p>
                   </div>
                   <div className="relative bg-white p-6">
                     <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center text-rose-600 mx-auto mb-6 text-3xl font-bold border-4 border-white shadow-lg">
                       2
                     </div>
                     <h3 className="text-xl font-bold text-gray-900 mb-3">Find Verified Spots</h3>
                     <p className="text-gray-500">Discover hotels, cafes, and activities that are "vibe-checked" for safety and comfort by our algorithm and community.</p>
                   </div>
                   <div className="relative bg-white p-6">
                     <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center text-rose-600 mx-auto mb-6 text-3xl font-bold border-4 border-white shadow-lg">
                       3
                     </div>
                     <h3 className="text-xl font-bold text-gray-900 mb-3">Connect & Go</h3>
                     <p className="text-gray-500">Read real-time tips, join meetups, or just travel with confidence knowing you have the full picture.</p>
                   </div>
                 </div>
               </div>
             </div>

             {/* Features Grid */}
             <div className="max-w-7xl mx-auto px-6 py-24 bg-[#fafaf9]">
               <div className="text-center mb-16">
                 <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">Everything you need to roam safe</h2>
                 <p className="text-gray-500">Comprehensive tools built for the modern solo traveler.</p>
               </div>
               <div className="grid md:grid-cols-3 gap-10">
                 <div className="p-8 rounded-3xl bg-white border border-gray-100 shadow-xl shadow-gray-100/50 hover:shadow-2xl hover:shadow-gray-100/50 transition duration-500 hover:-translate-y-1">
                   <div className="w-14 h-14 bg-teal-100 rounded-2xl flex items-center justify-center text-teal-600 mb-6">
                     <ShieldCheck className="w-7 h-7" />
                   </div>
                   <h3 className="text-2xl font-bold text-gray-900 mb-3">AI Safety Guard</h3>
                   <p className="text-gray-500 leading-relaxed">Real-time analysis of neighborhoods using trusted data sources (Maps, Local News) to keep you informed before you step out.</p>
                 </div>
                 
                 <div className="p-8 rounded-3xl bg-white border border-gray-100 shadow-xl shadow-gray-100/50 hover:shadow-2xl hover:shadow-gray-100/50 transition duration-500 hover:-translate-y-1">
                   <div className="w-14 h-14 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-600 mb-6">
                     <Globe className="w-7 h-7" />
                   </div>
                   <h3 className="text-2xl font-bold text-gray-900 mb-3">Verified Places</h3>
                   <p className="text-gray-500 leading-relaxed">Curated recommendations for hotels, cafes, and spots that are rated highly for female solo travelers and cross-referenced with reviews.</p>
                 </div>

                 <div className="p-8 rounded-3xl bg-white border border-gray-100 shadow-xl shadow-gray-100/50 hover:shadow-2xl hover:shadow-gray-100/50 transition duration-500 hover:-translate-y-1">
                   <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 mb-6">
                     <Users className="w-7 h-7" />
                   </div>
                   <h3 className="text-2xl font-bold text-gray-900 mb-3">Community First</h3>
                   <p className="text-gray-500 leading-relaxed">Connect with women nearby. Share real stories, hidden gems, and real-time advice in a moderated, safe environment.</p>
                 </div>
               </div>
             </div>

             {/* Testimonial / Community Section */}
             <div className="py-24 bg-white border-y border-gray-100">
               <div className="max-w-7xl mx-auto px-6">
                 <div className="grid md:grid-cols-2 gap-16 items-center">
                   <div>
                     <span className="text-rose-600 font-bold tracking-wider text-sm uppercase mb-2 block">Community Voices</span>
                     <h2 className="text-4xl font-serif font-bold text-gray-900 mb-6">Join thousands of women exploring the world.</h2>
                     <div className="space-y-6">
                        <div className="bg-gray-50 p-6 rounded-2xl rounded-tl-none border border-gray-100">
                           <p className="text-gray-700 italic mb-4">"SheRoam completely changed how I travel. I used the safety score feature in Rio and found the most amazing, safe hostel that I wouldn't have found otherwise."</p>
                           <div className="flex items-center gap-3">
                              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150" className="w-10 h-10 rounded-full object-cover" alt="User" />
                              <div>
                                 <p className="font-bold text-gray-900 text-sm">Jessica M.</p>
                                 <p className="text-xs text-gray-500">Solo traveler since 2019</p>
                              </div>
                           </div>
                        </div>
                        <div className="bg-gray-50 p-6 rounded-2xl rounded-bl-none border border-gray-100 ml-8">
                           <p className="text-gray-700 italic mb-4">"The community aspect is what I love. I felt lonely in Bangkok, posted on the feed, and met 3 other girls for dinner that same night!"</p>
                           <div className="flex items-center gap-3">
                              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150" className="w-10 h-10 rounded-full object-cover" alt="User" />
                              <div>
                                 <p className="font-bold text-gray-900 text-sm">Priya S.</p>
                                 <p className="text-xs text-gray-500">Digital Nomad</p>
                              </div>
                           </div>
                        </div>
                     </div>
                   </div>
                   <div className="relative h-[600px] rounded-3xl overflow-hidden shadow-2xl group">
                     <img 
                      src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=800" 
                      className="w-full h-full object-cover transform group-hover:scale-105 transition duration-1000"
                      alt="Woman traveler" 
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-10">
                        <div className="text-white">
                          <p className="font-serif text-3xl font-bold mb-2">"Adventure awaits."</p>
                          <button onClick={() => setCurrentView(AppView.COMMUNITY)} className="flex items-center gap-2 text-sm font-bold hover:underline">
                             Join the discussion <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                     </div>
                   </div>
                 </div>
               </div>
             </div>

             {/* CTA Section */}
             <div className="py-24 bg-rose-600 text-white text-center">
                <div className="max-w-4xl mx-auto px-6">
                   <h2 className="text-4xl font-serif font-bold mb-6">Ready to start your journey?</h2>
                   <p className="text-rose-100 text-lg mb-10 max-w-2xl mx-auto">Join SheRoam today for free and unlock the tools you need to travel safer, smarter, and together.</p>
                   <button 
                     onClick={() => setIsAuthOpen(true)}
                     className="bg-white text-rose-600 px-10 py-4 rounded-full font-bold text-lg hover:bg-rose-50 transition shadow-xl hover:shadow-2xl hover:-translate-y-1 duration-300"
                   >
                     Create Free Account
                   </button>
                </div>
             </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] text-gray-900 font-sans pb-20 md:pb-0">
      <Navbar 
        currentView={currentView} 
        setView={setCurrentView} 
        user={user}
        onLoginClick={() => setIsAuthOpen(true)}
        onLogoutClick={handleLogout}
      />
      <main>
        {renderView()}
      </main>
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)}
        onLogin={handleLogin}
      />
    </div>
  );
};

export default App;

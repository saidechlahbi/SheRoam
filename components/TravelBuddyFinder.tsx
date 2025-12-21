
import React, { useState, useEffect, useRef } from 'react';
import { findTravelBuddies } from '../services/geminiService';
import { TravelBuddy, UserProfile, Coordinates } from '../types';
import { MapPin, ShieldCheck, User, MessageCircle, AlertTriangle, CheckCircle, Search, Loader2, Map as MapIcon, X, Plus, Calendar, Flag, Sparkles, Send, Image as ImageIcon, Video as VideoIcon, Play, ChevronLeft, ChevronRight, Maximize2, Trash2, SlidersHorizontal, Filter } from 'lucide-react';

// Declare Leaflet
declare const L: any;

const TRAVEL_STYLES = ['Budget', 'Mid-range', 'Luxury', 'Backpacker', 'Digital Nomad'];
const POPULAR_INTERESTS = ['Hiking', 'Foodie', 'Nightlife', 'Museums', 'Photography', 'Shopping', 'Wellness', 'Adventure'];

// --- Helper Components ---

interface LightboxProps {
  media: { type: 'image' | 'video'; url: string }[];
  startIndex: number;
  onClose: () => void;
}

const MediaLightbox: React.FC<LightboxProps> = ({ media, startIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % media.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
  };

  const currentMedia = media[currentIndex];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setCurrentIndex((prev) => (prev + 1) % media.length);
      if (e.key === 'ArrowLeft') setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [media.length, onClose]);

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center animate-fade-in" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white p-2 bg-black/50 rounded-full transition z-20">
        <X className="w-8 h-8" />
      </button>

      {media.length > 1 && (
        <>
          <button onClick={handlePrev} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-3 bg-black/50 rounded-full transition z-20 hover:scale-110">
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button onClick={handleNext} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-3 bg-black/50 rounded-full transition z-20 hover:scale-110">
            <ChevronRight className="w-8 h-8" />
          </button>
        </>
      )}

      <div className="w-full h-full max-w-7xl max-h-screen p-4 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
        {currentMedia.type === 'video' ? (
          <video 
            src={currentMedia.url} 
            controls 
            autoPlay 
            className="max-w-full max-h-full rounded-lg shadow-2xl"
          />
        ) : (
          <img 
            src={currentMedia.url} 
            alt={`Media ${currentIndex + 1}`} 
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" 
          />
        )}
      </div>

      <div className="absolute bottom-4 left-0 right-0 text-center text-white/50 text-sm font-medium">
        {currentIndex + 1} / {media.length}
      </div>
    </div>
  );
};

interface MediaGridProps {
  media: { type: 'image' | 'video'; url: string }[];
  onMediaClick: (index: number) => void;
}

const MediaGrid: React.FC<MediaGridProps> = ({ media, onMediaClick }) => {
  if (!media || media.length === 0) return null;

  const count = media.length;
  
  // Render based on count to mimic social feed layouts
  let gridClass = '';
  if (count === 1) gridClass = 'grid-cols-1 h-64';
  else if (count === 2) gridClass = 'grid-cols-2 h-48';
  else if (count === 3) gridClass = 'grid-cols-2 h-48'; 
  else gridClass = 'grid-cols-2 h-48'; // 4 or more

  const renderItem = (item: typeof media[0], index: number, isOverlay: boolean = false, overlayCount: number = 0) => (
     <div 
        key={index} 
        onClick={(e) => { e.stopPropagation(); onMediaClick(index); }}
        className={`relative overflow-hidden cursor-pointer group bg-gray-100 border-white border-[1px]
           ${count === 3 && index === 0 ? 'row-span-2' : ''}
           ${count === 1 ? 'rounded-xl' : ''}
           ${count === 2 ? (index === 0 ? 'rounded-l-xl' : 'rounded-r-xl') : ''}
           ${count >= 3 && index === 0 ? 'rounded-l-xl' : ''}
           ${count === 3 && index === 2 ? 'rounded-br-xl' : ''}
           ${count === 3 && index === 1 ? 'rounded-tr-xl' : ''}
           ${count >= 4 && index === 1 ? 'rounded-tr-xl' : ''}
           ${count >= 4 && index === 2 ? 'rounded-bl-xl' : ''}
           ${count >= 4 && index === 3 ? 'rounded-br-xl' : ''}
        `}
     >
        {item.type === 'video' ? (
           <div className="w-full h-full flex items-center justify-center bg-gray-900 relative">
             <video src={item.url} className="w-full h-full object-cover opacity-80" muted />
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black/30 p-3 rounded-full backdrop-blur-sm group-hover:scale-110 transition">
                   <Play className="w-6 h-6 text-white" />
                </div>
             </div>
           </div>
        ) : (
           <img src={item.url} alt="Trip media" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
        )}
        
        {isOverlay && (
           <div className="absolute inset-0 bg-black/60 flex items-center justify-center hover:bg-black/50 transition">
              <span className="text-white font-bold text-xl">+{overlayCount}</span>
           </div>
        )}
     </div>
  );

  return (
    <div className={`grid ${gridClass} gap-[1px] w-full select-none`}>
       {media.slice(0, 4).map((item, index) => {
          if (count > 4 && index === 3) {
             return renderItem(item, index, true, count - 3); // -3 because we show 0,1,2, and 3 is the overlay for the rest
          }
          return renderItem(item, index);
       })}
    </div>
  );
};


// --- Existing Components ---

interface BuddyMapProps {
  buddy: TravelBuddy;
}

const BuddyMap: React.FC<BuddyMapProps> = ({ buddy }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (mapContainerRef.current && !mapInstanceRef.current) {
        // Initialize Map
        const lat = buddy.coordinates?.lat || 0;
        const lng = buddy.coordinates?.lng || 0;
        
        const map = L.map(mapContainerRef.current).setView([lat, lng], 13);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
             attribution: '&copy; OpenStreetMap &copy; CARTO'
        }).addTo(map);
        mapInstanceRef.current = map;
    }
    
    // Update Marker
    const map = mapInstanceRef.current;
    if (map) {
         const lat = buddy.coordinates?.lat || 0;
         const lng = buddy.coordinates?.lng || 0;

         // Clear previous
         map.eachLayer((layer: any) => {
            if (layer instanceof L.Marker) map.removeLayer(layer);
         });
         
         const icon = L.divIcon({
           className: 'custom-buddy-marker',
           html: `<div class="w-10 h-10 rounded-full border-4 border-rose-500 overflow-hidden shadow-lg"><img src="${buddy.imageUrl}" class="w-full h-full object-cover" /></div>`,
           iconSize: [40, 40],
         });

         L.marker([lat, lng], { icon })
           .addTo(map)
           .bindPopup(`<b>${buddy.name}</b><br>${buddy.currentLocation}`).openPopup();
           
         map.setView([lat, lng], 13);
    }
  }, [buddy]);

  return <div ref={mapContainerRef} className="w-full h-64 rounded-xl z-0" />;
};

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'them';
  timestamp: string;
}

interface ChatWindowProps {
  buddy: TravelBuddy;
  messages: Message[];
  onClose: () => void;
  onSend: (text: string) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ buddy, messages, onClose, onSend }) => {
    const [input, setInput] = useState('');
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const send = (e: React.FormEvent) => {
        e.preventDefault();
        if((input || '').trim()) {
            onSend(input);
            setInput('');
        }
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl w-full max-w-md h-[600px] flex flex-col shadow-2xl overflow-hidden animate-fade-in-up border border-gray-100">
                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white z-10 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <img src={buddy.imageUrl} className="w-10 h-10 rounded-full object-cover border border-gray-100" />
                             {buddy.isOnline && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>}
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">{buddy.name}</h3>
                            <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                                {buddy.isOnline ? 'Online Now' : 'Offline'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                    <div className="text-center text-xs text-gray-400 my-4">
                        <p>This is the start of your conversation with {buddy.name}.</p>
                        <p>Be kind and travel safe!</p>
                    </div>
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${msg.sender === 'me' ? 'bg-rose-600 text-white rounded-tr-sm' : 'bg-white text-gray-700 border border-gray-100 rounded-tl-sm'}`}>
                                <p>{msg.text}</p>
                                <p className={`text-[10px] mt-1 text-right font-medium opacity-80`}>{msg.timestamp}</p>
                            </div>
                        </div>
                    ))}
                    <div ref={endRef} />
                </div>

                {/* Input */}
                <form onSubmit={send} className="p-4 bg-white border-t border-gray-100">
                    <div className="flex gap-2 items-end">
                        <input 
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 bg-gray-100 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm transition-all focus:bg-white border border-transparent focus:border-rose-100"
                            autoFocus
                        />
                        <button type="submit" disabled={!input.trim()} className="bg-rose-600 text-white p-3 rounded-full hover:bg-rose-700 disabled:opacity-50 transition shadow-lg shadow-rose-200">
                            <Send className="w-5 h-5 ml-0.5" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

interface ConfirmationModalProps {
  buddy: TravelBuddy;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ buddy, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-fade-in">
    <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-fade-in-up transform transition-all">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-500">
             <MessageCircle className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">Connect with {buddy.name}?</h3>
        <p className="text-sm text-gray-500">This will open a direct message with {buddy.name}. Please ensure you follow our community guidelines for safe communication.</p>
      </div>
      <div className="flex gap-3">
        <button 
          onClick={onCancel}
          className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <button 
          onClick={onConfirm}
          className="flex-1 py-3 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 transition shadow-lg shadow-rose-200"
        >
          Start Chat
        </button>
      </div>
    </div>
  </div>
);

interface BuddyFilters {
  startDate: string;
  endDate: string;
  interests: string[];
  travelStyle: string;
  minVerification: boolean;
}

interface TravelBuddyFinderProps {
    user: UserProfile | null;
    onAuthRequired: () => void;
}

const TravelBuddyFinder: React.FC<TravelBuddyFinderProps> = ({ user, onAuthRequired }) => {
  const [location, setLocation] = useState('');
  const [buddies, setBuddies] = useState<TravelBuddy[]>([]);
  const [userTrips, setUserTrips] = useState<TravelBuddy[]>([]); 
  const [loading, setLoading] = useState(false);
  const [selectedBuddyId, setSelectedBuddyId] = useState<string | null>(null);
  
  // Filters State
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<BuddyFilters>({
    startDate: '',
    endDate: '',
    interests: [],
    travelStyle: '',
    minVerification: false
  });

  // Create Trip Post State
  const [isCreating, setIsCreating] = useState(false);
  const [newTrip, setNewTrip] = useState({
    destination: '',
    startDate: '',
    endDate: '',
    bio: '',
    interests: '',
    travelStyle: 'Mid-range',
    media: [] as { type: 'image' | 'video', url: string }[]
  });
  const [currentCoordinates, setCurrentCoordinates] = useState<Coordinates | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Chat State
  const [activeChatBuddy, setActiveChatBuddy] = useState<TravelBuddy | null>(null);
  const [pendingChatBuddy, setPendingChatBuddy] = useState<TravelBuddy | null>(null);
  const [conversations, setConversations] = useState<Record<string, Message[]>>({});

  // Lightbox State
  const [lightbox, setLightbox] = useState<{ isOpen: boolean; media: { type: 'image' | 'video'; url: string }[]; index: number }>({
    isOpen: false,
    media: [],
    index: 0
  });

  useEffect(() => {
    if (isCreating) {
        setIsLocating(true);
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setCurrentCoordinates({
                        latitude: pos.coords.latitude,
                        longitude: pos.coords.longitude
                    });
                    setIsLocating(false);
                },
                (err) => {
                    console.error("Geo error", err);
                    setIsLocating(false);
                    setCurrentCoordinates({ latitude: 51.5074, longitude: -0.1278 }); 
                }
            );
        } else {
             setIsLocating(false);
             setCurrentCoordinates({ latitude: 51.5074, longitude: -0.1278 });
        }
    }
  }, [isCreating]);

  const handleSearch = async (e?: React.FormEvent, manualQuery?: string) => {
    if (e) e.preventDefault();
    const query = (manualQuery || location || '').trim().toLowerCase();
    
    if (!query) {
        setBuddies([...userTrips]);
        return;
    }

    setLoading(true);
    
    // 1. Filter User Trips
    const matchingUserTrips = userTrips.filter(trip => {
        const dest = (trip.destination || '').toLowerCase();
        const loc = (trip.currentLocation || '').toLowerCase();
        return dest.includes(query) || loc.includes(query);
    });

    setBuddies(matchingUserTrips);

    try {
      // 2. Fetch AI Recommendations
      const aiResults = await findTravelBuddies(query);
      
      // 3. Merge Results
      setBuddies(prev => {
          const currentIds = new Set(prev.map(p => p.id));
          const uniqueAiResults = aiResults.filter(r => !currentIds.has(r.id));
          return [...prev, ...uniqueAiResults];
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
     const files = e.target.files;
     if (files) {
       Array.from(files).forEach((file: File) => {
          const reader = new FileReader();
          reader.onloadend = () => {
             const type = file.type.startsWith('video') ? 'video' : 'image';
             setNewTrip(prev => ({
                ...prev,
                media: [...prev.media, { type, url: reader.result as string }]
             }));
          };
          reader.readAsDataURL(file);
       });
     }
  };

  const removeMedia = (index: number) => {
      setNewTrip(prev => ({
          ...prev,
          media: prev.media.filter((_, i) => i !== index)
      }));
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
        onAuthRequired();
        return;
    }
    if (!newTrip.destination || !newTrip.bio || !newTrip.startDate || !newTrip.endDate) return;

    const start = new Date(newTrip.startDate);
    const end = new Date(newTrip.endDate);
    const formattedDates = `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

    const firstImage = newTrip.media.find(m => m.type === 'image');
    const mainImage = firstImage ? firstImage.url : (user.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200');

    const post: TravelBuddy = {
        id: Date.now().toString(),
        name: user.name,
        age: 26, 
        bio: newTrip.bio,
        imageUrl: mainImage,
        hometown: 'Verified Traveler',
        currentLocation: 'Current Location',
        destination: newTrip.destination,
        tripDates: formattedDates,
        startDate: newTrip.startDate,
        endDate: newTrip.endDate,
        travelStyle: newTrip.travelStyle as any,
        coordinates: currentCoordinates ? { lat: currentCoordinates.latitude, lng: currentCoordinates.longitude } : { lat: 40.7128, lng: -74.0060 },
        interests: (newTrip.interests || '').split(',').map(i => i.trim()).filter(i => i),
        spamScore: 1,
        verificationLevel: 'ID Verified',
        languages: ['English'],
        isOnline: true,
        tripMedia: newTrip.media
    };

    setUserTrips(prev => [post, ...prev]);
    setBuddies(prev => [post, ...prev]);
    
    setIsCreating(false);
    setNewTrip({ destination: '', startDate: '', endDate: '', bio: '', interests: '', travelStyle: 'Mid-range', media: [] });
  };

  const getSpamLevel = (score: number) => {
      if (score < 20) return { label: 'Trusted', color: 'text-green-600', bg: 'bg-green-100', icon: <CheckCircle className="w-4 h-4" /> };
      if (score < 60) return { label: 'Verified', color: 'text-blue-600', bg: 'bg-blue-100', icon: <ShieldCheck className="w-4 h-4" /> };
      return { label: 'Unverified', color: 'text-orange-600', bg: 'bg-orange-100', icon: <AlertTriangle className="w-4 h-4" /> };
  };

  // Filter Logic
  const filteredBuddies = buddies.filter(buddy => {
    // Verification
    if (filters.minVerification && buddy.spamScore > 60) return false;
    
    // Style
    if (filters.travelStyle && buddy.travelStyle !== filters.travelStyle) return false;
    
    // Dates (Basic Overlap Logic)
    if (filters.startDate && filters.endDate && buddy.startDate && buddy.endDate) {
       const filterStart = new Date(filters.startDate).getTime();
       const filterEnd = new Date(filters.endDate).getTime();
       const buddyStart = new Date(buddy.startDate).getTime();
       const buddyEnd = new Date(buddy.endDate).getTime();
       
       if (buddyEnd < filterStart || buddyStart > filterEnd) return false; 
    }

    // Interests
    if (filters.interests.length > 0) {
        const hasInterest = buddy.interests?.some(i => 
            filters.interests.some(fi => (i || '').toLowerCase().includes(fi.toLowerCase()))
        );
        if (!hasInterest) return false;
    }

    return true;
  });

  const activeFiltersCount = 
    (filters.startDate ? 1 : 0) + 
    (filters.interests.length > 0 ? 1 : 0) + 
    (filters.travelStyle ? 1 : 0) + 
    (filters.minVerification ? 1 : 0);

  const toggleInterest = (interest: string) => {
      setFilters(prev => {
          const exists = prev.interests.includes(interest);
          return {
              ...prev,
              interests: exists ? prev.interests.filter(i => i !== interest) : [...prev.interests, interest]
          };
      });
  };

  // ... (Chat handlers kept as is) ...
  const handlePostButtonClick = () => { if (!user) onAuthRequired(); else setIsCreating(true); };
  const handleInitiateChat = (buddy: TravelBuddy) => { if (!user) onAuthRequired(); else setPendingChatBuddy(buddy); };
  const handleConfirmChat = () => { if (!pendingChatBuddy) return; setActiveChatBuddy(pendingChatBuddy); setPendingChatBuddy(null); if (!conversations[pendingChatBuddy.id]) setConversations(prev => ({ ...prev, [pendingChatBuddy.id]: [{ id: 'welcome', text: `Hey ${pendingChatBuddy.name}! I saw you're also heading to ${pendingChatBuddy.destination || pendingChatBuddy.currentLocation}. Would love to connect!`, sender: 'me', timestamp: 'Draft' }] })); };
  const handleSendMessage = (text: string) => { if (!activeChatBuddy || !text.trim()) return; const newMessage: Message = { id: Date.now().toString(), text: text, sender: 'me', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }; setConversations(prev => { const currentMsgs = prev[activeChatBuddy.id] || []; const filteredMsgs = currentMsgs.filter(m => m.timestamp !== 'Draft'); return { ...prev, [activeChatBuddy.id]: [...filteredMsgs, newMessage] }; }); setTimeout(() => { const reply: Message = { id: (Date.now() + 1).toString(), text: "Hey! Thanks for reaching out. That sounds great, when will you be there?", sender: 'them', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }; setConversations(prev => ({ ...prev, [activeChatBuddy.id]: [...(prev[activeChatBuddy.id] || []), reply] })); }, 2500); };
  const handleMediaClick = (media: { type: 'image' | 'video'; url: string }[], index: number) => { setLightbox({ isOpen: true, media, index }); };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 animate-fade-in relative">
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-10 gap-4">
        <div>
           <h2 className="text-4xl font-serif font-bold text-gray-900 mb-2">Travel Companions</h2>
           <p className="text-gray-500">Find verified women traveling to your destination.</p>
        </div>
        <button 
           onClick={handlePostButtonClick}
           className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-rose-600 transition flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
           <Plus className="w-5 h-5" /> Post a Trip
        </button>
      </div>

      {/* Media Lightbox */}
      {lightbox.isOpen && (
        <MediaLightbox 
           media={lightbox.media}
           startIndex={lightbox.index}
           onClose={() => setLightbox({ ...lightbox, isOpen: false })}
        />
      )}

      {pendingChatBuddy && (
        <ConfirmationModal 
            buddy={pendingChatBuddy}
            onConfirm={handleConfirmChat}
            onCancel={() => setPendingChatBuddy(null)}
        />
      )}

      {activeChatBuddy && (
        <ChatWindow 
            buddy={activeChatBuddy}
            messages={conversations[activeChatBuddy.id] || []}
            onClose={() => setActiveChatBuddy(null)}
            onSend={handleSendMessage}
        />
      )}

      {/* Create Trip Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
           <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl animate-fade-in-up max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-center mb-6">
                 <div>
                    <h3 className="text-2xl font-serif font-bold text-gray-900">Post Your Trip</h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        {isLocating ? <Loader2 className="w-3 h-3 animate-spin" /> : <MapPin className="w-3 h-3 text-rose-500" />}
                        {isLocating ? 'Locating you...' : 'Attaching precise location'}
                    </p>
                 </div>
                 <button onClick={() => setIsCreating(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                    <X className="w-5 h-5" />
                 </button>
              </div>
              
              <form onSubmit={handleCreatePost} className="space-y-4">
                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Where are you going?</label>
                    <div className="relative">
                       <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                       <input 
                         required
                         type="text" 
                         placeholder="e.g. Paris, France" 
                         className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                         value={newTrip.destination}
                         onChange={(e) => setNewTrip({...newTrip, destination: e.target.value})}
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Start Date</label>
                        <input 
                             required
                             type="date" 
                             className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-gray-700"
                             value={newTrip.startDate}
                             onChange={(e) => setNewTrip({...newTrip, startDate: e.target.value})}
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">End Date</label>
                        <input 
                             required
                             type="date" 
                             className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-gray-700"
                             value={newTrip.endDate}
                             onChange={(e) => setNewTrip({...newTrip, endDate: e.target.value})}
                        />
                     </div>
                 </div>
                 
                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Travel Style</label>
                    <div className="flex flex-wrap gap-2">
                        {TRAVEL_STYLES.map(style => (
                            <button
                                key={style}
                                type="button"
                                onClick={() => setNewTrip({...newTrip, travelStyle: style})}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition ${newTrip.travelStyle === style ? 'bg-rose-500 text-white border-rose-500' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
                            >
                                {style}
                            </button>
                        ))}
                    </div>
                 </div>

                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Trip Vibes & Plans</label>
                    <textarea 
                       required
                       rows={3}
                       placeholder="I'm looking for someone to explore museums and try local cafes with..." 
                       className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                       value={newTrip.bio}
                       onChange={(e) => setNewTrip({...newTrip, bio: e.target.value})}
                    />
                 </div>

                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Interests (comma separated)</label>
                    <input 
                       type="text" 
                       placeholder="Hiking, Foodie, Art" 
                       className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                       value={newTrip.interests}
                       onChange={(e) => setNewTrip({...newTrip, interests: e.target.value})}
                    />
                 </div>

                 {/* Media Upload Section */}
                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Trip Media (Optional)</label>
                    <div className="grid grid-cols-3 gap-3 mb-2">
                       {newTrip.media.map((item, index) => (
                           <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group bg-gray-50">
                              {item.type === 'video' ? (
                                <div className="w-full h-full flex items-center justify-center bg-gray-900">
                                   <video src={item.url} className="w-full h-full object-cover opacity-80" />
                                   <Play className="absolute w-8 h-8 text-white" />
                                </div>
                              ) : (
                                <img src={item.url} alt="Preview" className="w-full h-full object-cover" />
                              )}
                              <button 
                                type="button"
                                onClick={() => removeMedia(index)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-lg p-1.5 opacity-0 group-hover:opacity-100 transition shadow-sm hover:scale-110"
                                title="Remove"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                           </div>
                       ))}
                       <button 
                         type="button"
                         onClick={() => fileInputRef.current?.click()}
                         className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-rose-500 hover:text-rose-500 hover:bg-rose-50 transition gap-1"
                       >
                          <Plus className="w-8 h-8" />
                          <span className="text-xs font-bold uppercase tracking-wider">Add Media</span>
                       </button>
                    </div>
                    <input 
                       type="file" 
                       multiple 
                       accept="image/*,video/*"
                       className="hidden" 
                       ref={fileInputRef}
                       onChange={handleMediaSelect}
                    />
                 </div>

                 <button 
                    type="submit" 
                    disabled={isLocating}
                    className="w-full bg-rose-600 text-white py-4 rounded-xl font-bold hover:bg-rose-700 transition shadow-lg mt-4 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                 >
                    {isLocating ? <Loader2 className="animate-spin w-5 h-5" /> : null}
                    Post Trip
                 </button>
              </form>
           </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="mb-12">
          <form onSubmit={(e) => handleSearch(e)} className="flex gap-4">
            <div className="relative flex-1">
                <input
                type="text"
                placeholder="Filter posts by destination (e.g. Bali)..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-6 pr-14 py-4 rounded-full border border-gray-200 shadow-sm focus:ring-2 focus:ring-rose-500 outline-none text-lg"
                />
                {location && (
                <button 
                    type="button"
                    onClick={() => { setLocation(''); handleSearch(undefined, ''); }}
                    className="absolute right-12 top-2 p-2 text-gray-400 hover:text-gray-600"
                >
                    <X className="w-6 h-6" />
                </button>
                )}
                <button 
                type="submit" 
                disabled={loading}
                className="absolute right-2 top-2 p-2 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition disabled:opacity-50"
                >
                {loading ? <Loader2 className="animate-spin w-6 h-6" /> : <Search className="w-6 h-6" />}
                </button>
            </div>
            <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`p-4 rounded-full shadow-sm border transition flex items-center justify-center ${showFilters || activeFiltersCount > 0 ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                title="Filters"
            >
                <SlidersHorizontal className="w-6 h-6" />
                {activeFiltersCount > 0 && (
                    <span className="absolute top-0 right-0 w-3 h-3 bg-rose-500 rounded-full border border-white"></span>
                )}
            </button>
          </form>

          {showFilters && (
              <div className="mt-4 p-6 bg-white border border-gray-100 rounded-3xl shadow-sm animate-fade-in-down">
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2"><Calendar className="w-4 h-4"/> Trip Dates</label>
                          <div className="flex gap-2">
                              <input 
                                  type="date" 
                                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
                                  value={filters.startDate}
                                  onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                              />
                              <span className="self-center text-gray-400">-</span>
                              <input 
                                  type="date" 
                                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
                                  value={filters.endDate}
                                  onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                              />
                          </div>
                      </div>
                      
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2"><Filter className="w-4 h-4"/> Travel Style</label>
                          <div className="relative">
                              <select 
                                value={filters.travelStyle}
                                onChange={(e) => setFilters({...filters, travelStyle: e.target.value})}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm appearance-none cursor-pointer"
                              >
                                  <option value="">Any Style</option>
                                  {TRAVEL_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                          </div>
                      </div>

                      <div className="lg:col-span-2">
                          <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2"><Sparkles className="w-4 h-4"/> Interests</label>
                          <div className="flex flex-wrap gap-2">
                              {POPULAR_INTERESTS.map(interest => (
                                  <button
                                      key={interest}
                                      onClick={() => toggleInterest(interest)}
                                      className={`px-3 py-1 rounded-full text-xs font-bold border transition ${filters.interests.includes(interest) ? 'bg-rose-100 text-rose-700 border-rose-200' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}
                                  >
                                      {interest}
                                  </button>
                              ))}
                          </div>
                      </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                                type="checkbox" 
                                className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500 border-gray-300"
                                checked={filters.minVerification}
                                onChange={(e) => setFilters({...filters, minVerification: e.target.checked})}
                            />
                            <span className="text-sm font-medium text-gray-600">Verified Profiles Only</span>
                        </label>
                        <button 
                            onClick={() => setFilters({ startDate: '', endDate: '', interests: [], travelStyle: '', minVerification: false })}
                            className="text-xs font-bold text-rose-500 hover:text-rose-700"
                        >
                            Reset Filters
                        </button>
                  </div>
              </div>
          )}
      </div>

      {filteredBuddies.length > 0 ? (
         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBuddies.map((buddy) => {
               const spam = getSpamLevel(buddy.spamScore);
               const isSelected = selectedBuddyId === buddy.id;

               return (
                 <div key={buddy.id} className="bg-white rounded-3xl border border-gray-100 shadow-lg hover:shadow-xl transition overflow-hidden flex flex-col group">
                    <div className="relative h-20 bg-gray-100 overflow-hidden">
                       <img src={buddy.imageUrl} alt={buddy.name} className="w-full h-full object-cover blur-sm opacity-50" />
                       <div className="absolute top-4 right-4 flex gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm border border-white/20 backdrop-blur-md ${spam.bg} ${spam.color}`}>
                             {spam.icon} {spam.label}
                          </span>
                       </div>
                    </div>
                    
                    <div className="px-6 relative flex flex-col items-center -mt-10">
                        <div className="w-20 h-20 rounded-full border-4 border-white shadow-md overflow-hidden bg-white">
                            <img src={buddy.imageUrl} alt={buddy.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="text-center mt-2">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center justify-center gap-2">
                                {buddy.name}, {buddy.age}
                                {buddy.isOnline && <span className="w-2.5 h-2.5 bg-green-500 rounded-full border border-white" title="Online"></span>}
                            </h3>
                            <div className="flex flex-col gap-1 items-center">
                                <p className="text-gray-500 text-sm flex items-center justify-center gap-1">
                                    <MapPin className="w-3 h-3" /> {buddy.hometown}
                                </p>
                                {buddy.travelStyle && (
                                    <span className="text-[10px] uppercase font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full mt-1">
                                        {buddy.travelStyle}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col pt-4">
                       {/* Trip Details Section */}
                       <div className="mb-4 pb-4 border-b border-gray-50 text-center">
                          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-rose-50 rounded-full text-rose-700 text-xs font-bold uppercase tracking-wider mb-2">
                                <Flag className="w-3 h-3" /> Heading to {buddy.destination || location || buddy.currentLocation}
                          </div>
                          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 font-medium">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                {buddy.tripDates}
                          </div>
                       </div>

                       <div className="bg-gray-50 rounded-xl p-3 mb-5 relative">
                          <Sparkles className="absolute top-2 left-2 w-3 h-3 text-rose-400" />
                          <p className="text-gray-600 text-sm pl-4 italic text-center">"{buddy.bio}"</p>
                       </div>

                       {/* Trip Media Gallery */}
                       {buddy.tripMedia && buddy.tripMedia.length > 0 && (
                          <div className="mb-5 rounded-xl overflow-hidden shadow-sm border border-gray-100">
                             <MediaGrid 
                               media={buddy.tripMedia} 
                               onMediaClick={(index) => handleMediaClick(buddy.tripMedia || [], index)} 
                             />
                          </div>
                       )}

                       {/* Trust Score Bar */}
                       <div className="mb-4">
                          <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wider">
                             <span>Profile Trust Score</span>
                             <span>{100 - buddy.spamScore}%</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                             <div 
                               className={`h-full rounded-full ${buddy.spamScore < 30 ? 'bg-green-500' : buddy.spamScore < 60 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                               style={{ width: `${100 - buddy.spamScore}%` }}
                             />
                          </div>
                       </div>

                       <div className="flex flex-wrap gap-2 mb-4 justify-center">
                          {buddy.interests.slice(0, 3).map(tag => (
                             <span key={tag} className="px-2 py-1 bg-white border border-gray-200 text-gray-600 text-[10px] uppercase font-bold rounded-md">{tag}</span>
                          ))}
                       </div>
                       
                       {isSelected && (
                          <div className="mb-4 animate-fade-in-down">
                             <BuddyMap buddy={buddy} />
                          </div>
                       )}

                       <div className="mt-auto flex gap-3">
                          <button 
                            onClick={() => handleInitiateChat(buddy)}
                            className="flex-1 bg-gray-900 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-rose-600 transition flex items-center justify-center gap-2 shadow-sm"
                          >
                             <MessageCircle className="w-4 h-4" /> Message
                          </button>
                          <button 
                             onClick={() => setSelectedBuddyId(isSelected ? null : buddy.id)}
                             className={`p-2.5 rounded-xl border transition ${isSelected ? 'bg-rose-50 border-rose-200 text-rose-600' : 'border-gray-200 text-gray-400 hover:border-gray-400 hover:text-gray-600'}`}
                             title="View Exact Location"
                          >
                             {isSelected ? <X className="w-5 h-5" /> : <MapIcon className="w-5 h-5" />}
                          </button>
                       </div>
                    </div>
                 </div>
               );
            })}
         </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
             <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                <Search className="w-8 h-8" />
             </div>
             <h3 className="text-lg font-bold text-gray-900 mb-2">No travelers found</h3>
             <p className="text-gray-500 max-w-sm mx-auto mb-6">Try adjusting your filters or search for a different destination.</p>
             {!location && (
               <div className="flex flex-wrap justify-center gap-2">
                 {['Bali', 'Tokyo', 'Paris', 'New York'].map(city => (
                   <button 
                    key={city}
                    onClick={() => { setLocation(city); handleSearch(undefined, city); }}
                    className="px-4 py-2 bg-gray-100 hover:bg-rose-50 hover:text-rose-600 rounded-full text-sm font-medium transition"
                   >
                     {city}
                   </button>
                 ))}
               </div>
             )}
         </div>
      )}
    </div>
  );
};

export default TravelBuddyFinder;

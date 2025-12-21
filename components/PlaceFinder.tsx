import React, { useState, useEffect, useRef, useCallback } from 'react';
import { findPlaces, getCityDetails, findFlightOffer } from '../services/geminiService';
import { Place, Coordinates, CityDetails, PlaceFilters, FlightOffer, Review, UserProfile } from '../types';
import { MapPin, Navigation, Star, Camera, Loader2, ShieldCheck, Map as MapIcon, ExternalLink, ArrowLeft, Calendar, UtensilsCrossed, List, WifiOff, SlidersHorizontal, DollarSign, Bed, ArrowUpDown, Share2, Heart, Palmtree, X, Clock, History, Sparkles, Quote, Plane, ArrowRight, AlertTriangle, Briefcase, Coffee, MessageSquare, User, Send } from 'lucide-react';

// Declare Leaflet global type
declare const L: any;

const FEATURED_CITIES = [
  { name: 'Kyoto', country: 'Japan', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=800' },
  { name: 'Reykjavik', country: 'Iceland', image: 'https://images.unsplash.com/photo-1476610182048-b716b8518aae?auto=format&fit=crop&q=80&w=800' },
  { name: 'Lisbon', country: 'Portugal', image: 'https://images.unsplash.com/photo-1548707304-441f8acd7827?auto=format&fit=crop&q=80&w=800' },
  { name: 'Melbourne', country: 'Australia', image: 'https://images.unsplash.com/photo-1514395465013-2af9ff5b230c?auto=format&fit=crop&q=80&w=800' },
  { name: 'Chiang Mai', country: 'Thailand', image: 'https://images.unsplash.com/photo-1596701642874-909280145c34?auto=format&fit=crop&q=80&w=800' },
  { name: 'Copenhagen', country: 'Denmark', image: 'https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?auto=format&fit=crop&q=80&w=800' },
];

const CURATED_ACTIVITIES = [
  { 
    title: 'Hidden Cafes', 
    query: 'Best hidden gem cafes with wifi and good vibes',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=600',
  },
  { 
    title: 'Safe Nightlife', 
    query: 'Safe bars and lounges for women', 
    image: 'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&q=80&w=600',
  },
  { 
    title: 'Art & Culture', 
    query: 'Must-visit art galleries and museums', 
    image: 'https://images.unsplash.com/photo-1565533237771-507b97a29938?auto=format&fit=crop&q=80&w=600',
  },
  { 
    title: 'Relaxing Spas', 
    query: 'Top rated day spas and wellness centers', 
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=600',
  },
   { 
    title: 'Local Markets', 
    query: 'Bustling local markets for shopping and food', 
    image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&q=80&w=600',
  },
];

const INTEREST_TAGS = ['Nature', 'History', 'Foodie', 'Art', 'Shopping', 'Wellness', 'Nightlife', 'Adventure'];

interface MapViewProps {
  places: Place[];
  onMarkerClick: (index: number) => void;
}

const MapView: React.FC<MapViewProps> = ({ places, onMarkerClick }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (mapContainerRef.current && !mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current).setView([20, 0], 2);
      
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);
      
      mapInstanceRef.current = map;
    }
    
    const map = mapInstanceRef.current;
    if (map) {
      map.eachLayer((layer: any) => {
        if (layer instanceof L.Marker) {
          map.removeLayer(layer);
        }
      });

      const markers: any[] = [];
      places.forEach((place, index) => {
        if (place.location?.lat && place.location?.lng) {
             const isBooking = place.provider === 'booking';
             const isTripAdvisor = place.provider === 'tripadvisor';
             
             let markerColor = 'bg-rose-500';
             if (isBooking) markerColor = 'bg-[#003580]';
             else if (isTripAdvisor) markerColor = 'bg-[#34E0A1]'; // TripAdvisor Green

             const icon = L.divIcon({
               className: 'custom-marker',
               html: `<div class="w-8 h-8 ${markerColor} rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white relative -left-4 -top-8"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
               iconSize: [0, 0],
             });

            const marker = L.marker([place.location.lat, place.location.lng], { icon })
              .bindPopup(`
                <div class="min-w-[150px] font-sans">
                   <div class="mb-2">
                      <h3 class="font-bold text-gray-900 leading-tight">${place.name}</h3>
                      <p class="text-xs text-gray-500 truncate">${place.address || ''}</p>
                   </div>
                   
                   <div class="flex items-center gap-2 mb-2">
                     <div class="flex items-center gap-1 text-xs font-bold text-yellow-600">
                       <span>★</span> ${place.rating || 'N/A'} <span class="text-gray-400 font-normal">(${place.reviews || 0})</span>
                     </div>
                     ${place.priceLevel ? `<span class="text-xs font-medium text-gray-600 bg-gray-100 px-1 rounded">${place.priceLevel}</span>` : ''}
                   </div>

                   <a href="${place.sourceUrl}" target="_blank" rel="noopener noreferrer" class="block w-full text-center ${isBooking ? 'bg-[#003580]' : isTripAdvisor ? 'bg-[#34E0A1]' : 'bg-gray-900'} text-white text-xs font-bold py-1.5 rounded-md hover:opacity-90 transition">
                     ${isBooking ? 'Book Now' : isTripAdvisor ? 'Check Reviews' : 'More Info'}
                   </a>
                </div>
              `);
            
            marker.on('click', () => {
              onMarkerClick(index);
            });

            marker.addTo(map);
            markers.push(marker);
        }
      });

      if (markers.length > 0) {
        const group = L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.1));
      }
    }
  }, [places, onMarkerClick]);

  return <div ref={mapContainerRef} className="w-full h-full rounded-3xl z-0" />;
};

const FlightCard: React.FC<{ offer: FlightOffer }> = ({ offer }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col md:flex-row gap-6 items-center shadow-sm hover:shadow-md transition mb-8">
      <div className="w-full md:w-40 h-32 flex-shrink-0 bg-gray-50 rounded-xl flex items-center justify-center p-4 relative overflow-hidden">
         <img src={offer.imageUrl} alt={offer.airline} className="w-full h-full object-contain mix-blend-multiply relative z-10" />
      </div>
      <div className="flex-1 w-full text-center md:text-left">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
           <div>
             <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 text-[10px] font-bold uppercase tracking-wider mb-1 inline-block">Best Value</span>
             <h4 className="font-bold text-gray-900 text-lg">{offer.airline}</h4>
             <p className="text-sm text-gray-500">{offer.date}</p>
           </div>
           <div className="text-2xl font-serif font-bold text-gray-900 mt-2 md:mt-0">{offer.price}</div>
         </div>
         
         <div className="flex items-center justify-center md:justify-start gap-3 md:gap-12 bg-gray-50 rounded-xl p-3">
            <div className="text-center">
               <p className="font-bold text-gray-900 text-lg">{offer.departureTime}</p>
               <p className="text-xs text-gray-500 font-medium">{offer.airportCode.split('→')[0].trim()}</p>
            </div>
            <div className="flex flex-col items-center px-2 flex-1 max-w-[120px]">
               <p className="text-[10px] text-gray-400 mb-1">{offer.duration}</p>
               <div className="w-full h-[2px] bg-gray-200 relative flex items-center justify-center">
                 <Plane className="w-4 h-4 text-rose-400 absolute rotate-90 bg-gray-50 rounded-full p-0.5" />
               </div>
               <p className="text-[10px] text-green-600 mt-1 font-bold">Non-stop</p>
            </div>
            <div className="text-center">
               <p className="font-bold text-gray-900 text-lg">{offer.arrivalTime}</p>
               <p className="text-xs text-gray-500 font-medium">{offer.airportCode.split('→')[1].trim()}</p>
            </div>
         </div>
      </div>
      <a 
        href={offer.bookingUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="w-full md:w-auto bg-gray-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-800 transition text-center whitespace-nowrap shadow-lg"
      >
        View Deal
      </a>
    </div>
  );
};

interface PlaceCardProps {
  place: Place;
  idx: number;
  isActive: boolean;
  userLocation?: Coordinates;
  user: UserProfile | null;
  onAuthRequired: () => void;
}

const PlaceCard: React.FC<PlaceCardProps> = ({ place, idx, isActive, userLocation, user, onAuthRequired }) => {
  const [showReviews, setShowReviews] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(0);

  // Generate a storage key based on place name + location to simulate persistence
  const storageKey = `sheroam_reviews_${place.name.replace(/\s+/g, '_')}`;

  useEffect(() => {
    // Load reviews from local storage
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setReviews(JSON.parse(saved));
    } else {
       // Mock some initial reviews if empty, just for display
       if (place.reviews && place.reviews > 0) {
           const mocks: Review[] = [
             {
               id: 'mock-1',
               author: 'Emily R.',
               rating: 5,
               text: 'Absolutely loved this place! Felt very safe and welcoming.',
               date: '2 months ago'
             }
           ];
           setReviews(mocks);
       }
    }
  }, [storageKey, place.reviews]);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onAuthRequired();
      return;
    }
    if (!reviewText.trim() || rating === 0) return;

    const newReview: Review = {
      id: Date.now().toString(),
      author: user.name,
      avatar: user.avatar,
      rating: rating,
      text: reviewText,
      date: 'Just now'
    };

    const updatedReviews = [newReview, ...reviews];
    setReviews(updatedReviews);
    localStorage.setItem(storageKey, JSON.stringify(updatedReviews));
    setReviewText('');
    setRating(0);
  };

  return (
    <div className={`bg-white rounded-3xl overflow-hidden border transition duration-300 flex flex-col h-full scroll-mt-24 ${isActive ? 'ring-2 ring-rose-500 shadow-2xl scale-[1.02] border-rose-100 z-10' : 'border-gray-100 shadow-lg hover:shadow-xl'}`}>
      <div className="relative h-64 overflow-hidden group">
         <img src={place.imageUrl} alt={place.name} className="w-full h-full object-cover transition duration-700 group-hover:scale-110" />
         <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
             <span className="bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-bold text-gray-900 flex items-center gap-1 shadow-sm">
               <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" /> {place.rating}
             </span>
             {place.priceLevel && (
                <span className="bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-bold text-green-700 shadow-sm">
                  {place.priceLevel}
                </span>
             )}
         </div>
         {place.provider && (
           <div className="absolute bottom-4 left-4">
              <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-white shadow-sm ${place.provider === 'booking' ? 'bg-[#003580]' : place.provider === 'tripadvisor' ? 'bg-[#34E0A1]' : 'bg-gray-900'}`}>
                {place.provider === 'booking' ? 'Booking.com' : place.provider === 'tripadvisor' ? 'TripAdvisor' : 'Google Maps'}
              </span>
           </div>
         )}
      </div>
      
      <div className="p-6 flex-1 flex flex-col">
        <div className="mb-4">
          <h3 className="text-xl font-serif font-bold text-gray-900 mb-1 leading-tight group-hover:text-rose-600 transition">{place.name}</h3>
          <p className="text-sm text-gray-500 line-clamp-1 flex items-center gap-1">
             <MapPin className="w-3.5 h-3.5 text-gray-400" /> {place.address}
          </p>
        </div>

        {place.safetyTip && (
          <div className="bg-rose-50 rounded-xl p-3 mb-4 border border-rose-100">
             <div className="flex gap-2 items-start">
                <ShieldCheck className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-rose-800 leading-snug font-medium">
                  <span className="font-bold">Safety:</span> {place.safetyTip}
                </p>
             </div>
          </div>
        )}

        {place.suggestedActivity && (
             <div className="mb-4 text-xs text-gray-500 italic flex items-start gap-2">
                 <Sparkles className="w-3 h-3 text-rose-400 mt-0.5 flex-shrink-0" />
                 "{place.suggestedActivity}"
             </div>
        )}

        <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
          {place.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {place.tags.slice(0, 3).map((tag, i) => (
            <span key={i} className="px-2 py-1 bg-gray-50 text-gray-500 border border-gray-100 text-[10px] font-bold uppercase tracking-wider rounded-md">{tag}</span>
          ))}
        </div>

        {/* Reviews Section Toggle */}
        <div className="mb-4">
           <button 
             onClick={() => setShowReviews(!showReviews)}
             className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-rose-600 transition"
           >
              <MessageSquare className="w-4 h-4" />
              {showReviews ? 'Hide Reviews' : `Reviews (${reviews.length + (place.reviews && place.reviews > reviews.length ? place.reviews - reviews.length : 0)})`}
           </button>

           {showReviews && (
             <div className="mt-4 animate-fade-in space-y-4">
                {/* Review List */}
                <div className="max-h-60 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                   {reviews.length === 0 ? (
                     <p className="text-sm text-gray-400 italic">No reviews yet. Be the first!</p>
                   ) : (
                     reviews.map((rev) => (
                       <div key={rev.id} className="bg-gray-50 p-3 rounded-xl">
                          <div className="flex justify-between items-start mb-1">
                             <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-xs">
                                   {rev.avatar ? <img src={rev.avatar} alt={rev.author} className="w-full h-full object-cover"/> : <User className="w-3 h-3 text-gray-500" />}
                                </div>
                                <span className="text-xs font-bold text-gray-900">{rev.author}</span>
                             </div>
                             <span className="text-[10px] text-gray-400">{rev.date}</span>
                          </div>
                          <div className="flex text-yellow-400 mb-1">
                             {[...Array(5)].map((_, i) => (
                               <Star key={i} className={`w-3 h-3 ${i < rev.rating ? 'fill-current' : 'text-gray-300'}`} />
                             ))}
                          </div>
                          <p className="text-xs text-gray-600">{rev.text}</p>
                       </div>
                     ))
                   )}
                </div>

                {/* Add Review Form */}
                <div className="border-t border-gray-100 pt-3">
                   {user ? (
                     <form onSubmit={handleSubmitReview}>
                        <p className="text-xs font-bold text-gray-700 mb-2">Write a review</p>
                        <div className="flex gap-1 mb-2">
                           {[1, 2, 3, 4, 5].map((star) => (
                             <button 
                               type="button" 
                               key={star}
                               onClick={() => setRating(star)}
                               className="focus:outline-none transition hover:scale-110"
                             >
                               <Star className={`w-5 h-5 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                             </button>
                           ))}
                        </div>
                        <div className="flex gap-2">
                           <input 
                             type="text" 
                             value={reviewText}
                             onChange={(e) => setReviewText(e.target.value)}
                             placeholder="Share your experience..."
                             className="flex-1 text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-rose-500"
                           />
                           <button 
                             type="submit"
                             disabled={!reviewText.trim() || rating === 0}
                             className="bg-rose-600 text-white p-2 rounded-lg hover:bg-rose-700 disabled:opacity-50 transition"
                           >
                             <Send className="w-4 h-4" />
                           </button>
                        </div>
                     </form>
                   ) : (
                     <button 
                       onClick={onAuthRequired} 
                       className="w-full py-2 bg-gray-50 text-rose-600 text-xs font-bold rounded-lg hover:bg-rose-50 transition"
                     >
                       Log in to write a review
                     </button>
                   )}
                </div>
             </div>
           )}
        </div>

        <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between gap-4">
           <div className="text-xs text-gray-400 font-medium flex items-center gap-1">
              <Quote className="w-3 h-3 text-gray-300" />
              {place.reviews ? `${place.reviews} verified reviews` : 'Verified Spot'}
           </div>
           <a 
             href={place.sourceUrl} 
             target="_blank" 
             rel="noopener noreferrer"
             className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-800 transition flex items-center gap-2 shadow-lg shadow-gray-200"
           >
             {place.provider === 'booking' ? 'Book' : 'View'} <ExternalLink className="w-3 h-3" />
           </a>
        </div>
      </div>
    </div>
  );
};

interface PlaceFinderProps {
  user: UserProfile | null;
  onAuthRequired: () => void;
}

const PlaceFinder: React.FC<PlaceFinderProps> = ({ user, onAuthRequired }) => {
  // Search & View State
  const [viewMode, setViewMode] = useState<'search' | 'city'>('search');
  const [activeCity, setActiveCity] = useState<CityDetails | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [activePlaceIndex, setActivePlaceIndex] = useState<number | null>(null);
  
  // Data State
  const [query, setQuery] = useState('');
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCity, setLoadingCity] = useState(false);
  const [isOfflineResult, setIsOfflineResult] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  // Flight Data State
  const [flightOffer, setFlightOffer] = useState<FlightOffer | null>(null);
  const [loadingFlight, setLoadingFlight] = useState(false);
  
  // Location
  const [location, setLocation] = useState<Coordinates | undefined>(undefined);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState(false);

  // Tabs for City Mode
  const [activeTab, setActiveTab] = useState('visit');

  // Filters & Sorting
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<PlaceFilters>({
    minRating: 0,
    category: 'all',
    minPrice: undefined,
    maxPrice: undefined,
    arrivalDate: '',
    interests: []
  });
  const [sortBy, setSortBy] = useState<'recommended' | 'price_low' | 'price_high' | 'rating'>('recommended');
  
  // Custom Interest Input State
  const [customInterest, setCustomInterest] = useState('');

  // Refs for scrolling to cards
  const placeRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Request location on mount
  useEffect(() => {
    requestLocation(true); // silent request on mount
    
    try {
      const saved = localStorage.getItem('sheroam_recent_searches');
      if (saved) setRecentSearches(JSON.parse(saved));
    } catch (e) {
      console.warn('Failed to load recent searches');
    }
  }, []);

  const addToRecentSearches = (q: string) => {
    if (!q.trim()) return;
    const updated = [q, ...recentSearches.filter(s => s !== q)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('sheroam_recent_searches', JSON.stringify(updated));
  };

  const removeRecentSearch = (term: string) => {
    const updated = recentSearches.filter(s => s !== term);
    setRecentSearches(updated);
    localStorage.setItem('sheroam_recent_searches', JSON.stringify(updated));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('sheroam_recent_searches');
  };

  const toggleInterest = (interest: string) => {
    setFilters(prev => {
      const current = prev.interests || [];
      const exists = current.includes(interest);
      const newInterests = exists 
        ? current.filter(i => i !== interest)
        : [...current, interest];
      
      if (!exists) setShowFilters(false);
      return { ...prev, interests: newInterests };
    });
  };

  const addCustomInterest = (e: React.FormEvent) => {
    e.preventDefault();
    if ((customInterest || '').trim()) {
      const normalized = customInterest.trim();
      setFilters(prev => ({
        ...prev,
        interests: [...(prev.interests || []), normalized]
      }));
      setCustomInterest('');
      setShowFilters(false);
    }
  };

  const removeInterest = (interest: string) => {
    setFilters(prev => ({
      ...prev,
      interests: (prev.interests || []).filter(i => i !== interest)
    }));
  };

  const resetFilters = () => {
    setFilters({ 
      minRating: 0, 
      category: 'all',
      minPrice: undefined,
      maxPrice: undefined,
      arrivalDate: '', 
      interests: [] 
    });
    setSortBy('recommended');
    setFlightOffer(null);
  };

  const getCachedData = <T,>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  };

  const setCachedData = (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn("Storage limit reached", e);
    }
  };

  const requestLocation = (silent = false) => {
    return new Promise<Coordinates | undefined>((resolve, reject) => {
      setLocating(true);
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const newLoc = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            };
            setLocation(newLoc);
            setLocating(false);
            setLocationError(false);
            resolve(newLoc);
          },
          (error) => {
            if (!silent) {
                console.error("Error getting location:", error.message);
                setLocationError(true);
            }
            setLocating(false);
            resolve(undefined);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      } else {
        setLocating(false);
        if (!silent) alert("Geolocation is not supported by your browser.");
        resolve(undefined);
      }
    });
  };

  const handleSearch = async (manualQuery?: string, overrideLocation?: Coordinates) => {
    setShowFilters(false);
    setActivePlaceIndex(null);
    const q = manualQuery || query || '';
    if (!q.trim()) return;

    let currentLoc = overrideLocation || location;
    if (!currentLoc) {
        currentLoc = await requestLocation();
        if (!currentLoc) {
            setLocationError(true);
            return; 
        }
    }

    setLoading(true);
    setIsOfflineResult(false);
    addToRecentSearches(q);
    setFlightOffer(null);
    
    if (!activeCity || manualQuery === query) {
      setViewMode('search');
      setActiveCity(null);
    }
    
    setPlaces([]);

    const filterKey = `${filters.minRating}_${filters.category}_${filters.minPrice}-${filters.maxPrice}_${filters.arrivalDate}_${filters.interests?.sort().join('')}`;
    const cacheKey = `sheroam_search_${q}_${currentLoc.latitude.toFixed(4)},${currentLoc.longitude.toFixed(4)}_${filterKey}`;

    setLoadingFlight(true);
    
    const looksLikeDestination = !q.toLowerCase().includes(' in ') && !q.toLowerCase().includes(' near ');
    let optimizedQuery = q;
    if (looksLikeDestination) {
        if (filters.category === 'accommodation') {
            optimizedQuery = `Hotels and places to stay in ${q}`;
        } else if (filters.category === 'activity') {
            optimizedQuery = `Top things to do in ${q}`;
        } else if (filters.category === 'food') {
            optimizedQuery = `Best restaurants and food spots in ${q}`;
        } else {
             optimizedQuery = `Hotels and top places in ${q}`;
        }
    }

    const promises: Promise<any>[] = [
        findPlaces(optimizedQuery, currentLoc, filters),
        findFlightOffer(q, filters.arrivalDate, currentLoc)
    ];

    try {
      const results = await Promise.all(promises);
      const placeResults = results[0];
      const flightResult = results[1];

      if (placeResults && placeResults.length > 0) {
        setCachedData(cacheKey, placeResults);
      }
      setPlaces(placeResults || []);
      
      if (flightResult) {
        setFlightOffer(flightResult);
      }
    } catch (err) {
      console.error(err);
      const cached = getCachedData<Place[]>(cacheKey);
      if (cached) {
        setPlaces(cached);
        setIsOfflineResult(true);
      }
    } finally {
      setLoading(false);
      setLoadingFlight(false);
    }
  };

  const handleCitySelect = async (cityName: string) => {
    let currentLoc = location;
    if (!currentLoc) {
        currentLoc = await requestLocation();
        if (!currentLoc) {
            setLocationError(true);
            return;
        }
    }

    setLoadingCity(true);
    setViewMode('city');
    setPlaces([]);
    setActivePlaceIndex(null);
    setIsOfflineResult(false);
    setFlightOffer(null);
    addToRecentSearches(cityName);
    
    const cityKey = `sheroam_city_${cityName}`;

    try {
      const details = await getCityDetails(cityName);
      setActiveCity(details);
      setCachedData(cityKey, details);
      
      await loadCityPlaces(cityName, 'visit');

    } catch (e) {
      console.error("Network error, checking cache for city");
      const cachedCity = getCachedData<CityDetails>(cityKey);
      if (cachedCity) {
        setActiveCity(cachedCity);
        setIsOfflineResult(true);
        await loadCityPlaces(cityName, 'visit');
      } else {
        setViewMode('search');
        alert("Unable to connect and no offline data available for this city.");
      }
    } finally {
      setLoadingCity(false);
    }
  };

  const loadCityPlaces = async (city: string, category: string) => {
    setLoading(true);
    setPlaces([]);
    setActivePlaceIndex(null);
    setActiveTab(category);
    setIsOfflineResult(false);
    
    let filterCategory: 'all' | 'accommodation' | 'activity' | 'food' = 'all';
    let prompt = "";
    
    if (category === 'visit') {
        prompt = `Must see tourist attractions and hidden gems in ${city} for women`;
        filterCategory = 'activity';
    } else if (category === 'eat') {
        prompt = `Safe and trendy cafes or restaurants in ${city} for solo dining`;
        filterCategory = 'food';
    } else if (category === 'stay') {
        prompt = `Top rated hotels, hostels, or resorts in ${city} suitable for female travelers`;
        filterCategory = 'accommodation';
    }

    const scopedFilters: PlaceFilters = {
        ...filters,
        category: filterCategory
    };

    const filterKey = `${filters.minRating}_${filterCategory}_${filters.minPrice}-${filters.maxPrice}_${filters.arrivalDate}_${filters.interests?.sort().join('')}`;
    const cacheKey = `sheroam_places_${city}_${category}_${filterKey}`;

    const promises: Promise<any>[] = [findPlaces(prompt, location, scopedFilters)];
    if (!flightOffer && location) {
      setLoadingFlight(true);
      promises.push(findFlightOffer(city, filters.arrivalDate, location));
    }

    try {
      const results = await Promise.all(promises);
      const placeResults = results[0];
      const flightResult = results.length > 1 ? results[1] : undefined;

      if (placeResults && placeResults.length > 0) {
        setCachedData(cacheKey, placeResults);
      }
      setPlaces(placeResults || []);
      
      if (flightResult) {
        setFlightOffer(flightResult);
      }
    } catch (e) {
      console.error(e);
      const cached = getCachedData<Place[]>(cacheKey);
      if (cached) {
        setPlaces(cached);
        setIsOfflineResult(true);
      }
    } finally {
      setLoading(false);
      setLoadingFlight(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
  };

  const getFilteredAndSortedPlaces = () => {
    let result = [...places];

    if (filters.minRating > 0) {
      result = result.filter(p => (p.rating || 0) >= filters.minRating);
    }

    switch (sortBy) {
      case 'rating':
        return result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'price_low':
        return result.sort((a, b) => (a.priceLevel?.length || 0) - (b.priceLevel?.length || 0));
      case 'price_high':
        return result.sort((a, b) => (b.priceLevel?.length || 0) - (a.priceLevel?.length || 0));
      default:
        return result;
    }
  };
  
  const sortedPlaces = getFilteredAndSortedPlaces();

  const handleMarkerClick = useCallback((index: number) => {
    setActivePlaceIndex(index);
    if (placeRefs.current[index]) {
      placeRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  const activeFiltersCount = 
    (filters.minPrice !== undefined || filters.maxPrice !== undefined ? 1 : 0) + 
    (filters.category !== 'all' ? 1 : 0) +
    (filters.minRating > 0 ? 1 : 0) + 
    (filters.arrivalDate ? 1 : 0) +
    (filters.interests && filters.interests.length > 0 ? 1 : 0);

  if (locationError && !location) {
      return (
        <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-red-100">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                    <MapPin className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-serif font-bold text-gray-900 mb-3">Location Required</h2>
                <p className="text-gray-500 mb-8">To find the best flights and optimize travel deals from your origin, please enable location services.</p>
                <button 
                  onClick={() => requestLocation()} 
                  className="w-full bg-rose-600 text-white px-6 py-3.5 rounded-xl font-bold hover:bg-rose-700 transition shadow-lg shadow-rose-200"
                >
                  Enable Location
                </button>
            </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      {/* Navbar / Header Area */}
      <div className="bg-white border-b border-gray-100 sticky top-20 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
             {viewMode === 'city' && (
               <button 
                onClick={() => { setViewMode('search'); setActiveCity(null); }}
                className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition"
               >
                 <ArrowLeft className="w-5 h-5 text-gray-600" />
               </button>
             )}

             <div className="flex-1 w-full relative group">
                <input 
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Where do you want to go?"
                  className="w-full pl-12 pr-10 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200 text-gray-800 transition-all focus:bg-white border border-transparent focus:border-rose-100"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <div className="absolute left-4 top-3.5 text-gray-400">
                  <MapPin className="w-5 h-5" />
                </div>
                {query && (
                  <button 
                    onClick={clearSearch}
                    className="absolute right-10 top-3 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`absolute right-2 top-2 p-1.5 rounded-lg transition-colors ${showFilters || activeFiltersCount > 0 ? 'bg-rose-100 text-rose-600' : 'text-gray-400 hover:text-gray-600'}`}
                  title="Filters"
                >
                  <SlidersHorizontal className="w-5 h-5" />
                  {activeFiltersCount > 0 && !showFilters && (
                    <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-rose-500 rounded-full border border-white"></span>
                  )}
                </button>

                {recentSearches.length > 0 && !query && viewMode === 'search' && !activeCity && (
                   <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 hidden group-focus-within:block z-50 animate-fade-in-down">
                     <div className="flex justify-between items-center mb-2">
                       <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                         <History className="w-3 h-3" /> Recent Searches
                       </h4>
                       <button 
                        onMouseDown={(e) => { e.preventDefault(); clearRecentSearches(); }}
                        className="text-[10px] text-rose-500 hover:text-rose-700 font-medium hover:underline"
                       >
                         Clear History
                       </button>
                     </div>
                     <div className="flex flex-col gap-1">
                       {recentSearches.map(term => (
                         <div key={term} className="flex items-center justify-between group/item hover:bg-gray-50 rounded-lg p-2 transition cursor-pointer">
                            <button 
                              onMouseDown={() => { setQuery(term); handleSearch(term); }}
                              className="flex-1 text-left text-sm text-gray-600 flex items-center gap-3"
                            >
                              <Clock className="w-4 h-4 text-gray-300" />
                              {term}
                            </button>
                            <button
                              onMouseDown={(e) => { e.stopPropagation(); removeRecentSearch(term); }}
                              className="text-gray-300 hover:text-gray-500 p-1 opacity-0 group-hover/item:opacity-100 transition"
                            >
                              <X className="w-3 h-3" />
                            </button>
                         </div>
                       ))}
                     </div>
                   </div>
                )}
             </div>

             <div className="flex w-full md:w-auto gap-2">
               {/* Location Indicator (Visual only, as access is forced) */}
               <div className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition font-medium text-sm whitespace-nowrap border ${location ? 'bg-teal-50 text-teal-700 border-teal-100' : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
                  {locating ? <Loader2 className="animate-spin w-4 h-4" /> : <Navigation className="w-4 h-4" />}
                  {location ? 'Location Active' : 'Locating...'}
               </div>

               <button 
                  onClick={() => handleSearch()}
                  disabled={loading}
                  className="flex-1 md:flex-none bg-gray-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition flex items-center justify-center shadow-lg active:scale-95 disabled:opacity-70 disabled:active:scale-100"
                >
                  {loading && viewMode === 'search' ? <Loader2 className="animate-spin w-5 h-5" /> : 'Search'}
                </button>
             </div>
          </div>
          
          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-6 bg-white border border-gray-100 rounded-2xl shadow-sm animate-fade-in-down relative">
               <button onClick={() => setShowFilters(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 md:hidden">
                 <X className="w-5 h-5" />
               </button>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 items-start">
                
                {/* Category Selection */}
                <div className="lg:col-span-4">
                  <label className="text-sm font-bold text-gray-700 mb-3 block flex items-center gap-2">
                     <Briefcase className="w-4 h-4" /> What are you looking for?
                  </label>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                     {[
                       { id: 'all', label: 'Everything', icon: <Star className="w-4 h-4" /> },
                       { id: 'accommodation', label: 'Hotels & Stays', icon: <Bed className="w-4 h-4" /> },
                       { id: 'activity', label: 'Activities', icon: <Camera className="w-4 h-4" /> },
                       { id: 'food', label: 'Food & Drink', icon: <Coffee className="w-4 h-4" /> }
                     ].map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setFilters({...filters, category: cat.id as any})}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition whitespace-nowrap ${
                             filters.category === cat.id 
                               ? 'bg-gray-900 text-white border-gray-900 shadow-md' 
                               : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {cat.icon}
                          {cat.label}
                        </button>
                     ))}
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <div className="flex justify-between items-center mb-3">
                     <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" /> Budget Range (USD)
                    </label>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-2.5 text-gray-400">$</span>
                      <input 
                        type="number"
                        min="0"
                        placeholder="Min"
                        value={filters.minPrice === undefined ? '' : filters.minPrice}
                        onChange={(e) => setFilters({...filters, minPrice: e.target.value ? parseInt(e.target.value) : undefined})}
                        className="w-full pl-7 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200"
                      />
                    </div>
                    <span className="text-gray-400 font-bold">-</span>
                    <div className="relative flex-1">
                       <span className="absolute left-3 top-2.5 text-gray-400">$</span>
                       <input 
                        type="number"
                        min="0"
                        placeholder="Max"
                        value={filters.maxPrice === undefined ? '' : filters.maxPrice}
                        onChange={(e) => setFilters({...filters, maxPrice: e.target.value ? parseInt(e.target.value) : undefined})}
                        className="w-full pl-7 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-3 block flex items-center gap-2">
                    <Star className="w-4 h-4" /> Min Rating ({filters.minRating || 'Any'}+)
                  </label>
                  <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                     <input 
                      type="range" 
                      min="0" 
                      max="5" 
                      step="0.5" 
                      value={filters.minRating}
                      onChange={(e) => setFilters({...filters, minRating: parseFloat(e.target.value)})}
                      className="w-full accent-rose-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                     />
                     <span className="font-bold text-rose-600 w-8 text-center">{filters.minRating > 0 ? filters.minRating : '0'}</span>
                  </div>
                </div>

                <div>
                   <div className="flex justify-between items-center mb-3">
                     <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <Calendar className="w-4 h-4" /> Arrival Date
                    </label>
                    <button onClick={resetFilters} className="text-xs text-rose-500 hover:text-rose-600 font-medium whitespace-nowrap">Clear All</button>
                  </div>
                  <input 
                    type="date"
                    value={filters.arrivalDate || ''}
                    onChange={(e) => setFilters({...filters, arrivalDate: e.target.value})}
                    className="w-full bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-rose-200 text-gray-700 font-medium"
                  />
                </div>

                <div className="lg:col-span-4 border-t border-gray-100 pt-6 mt-2">
                  <label className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <Palmtree className="w-4 h-4" /> Interests & Activities
                  </label>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {INTEREST_TAGS.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => toggleInterest(tag)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition border ${
                          filters.interests?.includes(tag)
                            ? 'bg-rose-100 border-rose-200 text-rose-700'
                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>

                  <form onSubmit={addCustomInterest} className="flex gap-2 max-w-md">
                    <input
                      type="text"
                      placeholder="Add specific activity (e.g. 'Salsa dancing', 'Pottery')"
                      value={customInterest}
                      onChange={(e) => setCustomInterest(e.target.value)}
                      className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200 text-sm"
                    />
                    <button 
                      type="submit"
                      disabled={!(customInterest || '').trim()}
                      className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 disabled:opacity-50 transition"
                    >
                      Add
                    </button>
                  </form>

                  {filters.interests && filters.interests.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {filters.interests.map(interest => (
                        <span key={interest} className="inline-flex items-center gap-1 px-3 py-1 bg-rose-50 text-rose-700 rounded-full text-xs font-bold">
                          {interest}
                          <button onClick={() => removeInterest(interest)} className="hover:text-rose-900">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {loadingCity ? (
        <div className="flex flex-col items-center justify-center h-96">
          <Loader2 className="w-10 h-10 text-rose-500 animate-spin mb-4" />
          <p className="text-gray-500 animate-pulse">Analyzing destination...</p>
        </div>
      ) : viewMode === 'city' && activeCity ? (
        <div className="animate-fade-in">
           <div className="relative h-64 md:h-80 w-full overflow-hidden group">
             <img 
               src={activeCity.imageUrl} 
               alt={activeCity.name} 
               className="w-full h-full object-cover transform group-hover:scale-105 transition duration-1000"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
             <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 max-w-7xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-2">{activeCity.name}</h1>
                <p className="text-white/90 text-lg max-w-2xl leading-relaxed">{activeCity.description}</p>
             </div>
           </div>

           <div className="bg-white border-b border-gray-200 shadow-sm sticky top-[80px] z-30">
             <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-6">
               <div className="flex gap-6 text-sm text-gray-600 overflow-x-auto hide-scrollbar pb-2 md:pb-0">
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    <ShieldCheck className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-gray-900">{activeCity.safetyScore}/10</span> Safety
                  </div>
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    <Clock className="w-5 h-5 text-rose-500" />
                    Best time: <span className="font-semibold text-gray-900">{activeCity.bestTime}</span>
                  </div>
                  {isOfflineResult && (
                    <div className="flex items-center gap-2 text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                      <WifiOff className="w-4 h-4" />
                      Offline Mode
                    </div>
                  )}
               </div>

               <div className="flex items-center gap-4 justify-between md:justify-end">
                  <div className="flex items-center gap-2 border-r border-gray-200 pr-4">
                     <ArrowUpDown className="w-4 h-4 text-gray-400" />
                     <select 
                       value={sortBy} 
                       onChange={(e) => setSortBy(e.target.value as any)}
                       className="text-sm font-medium text-gray-700 bg-transparent outline-none cursor-pointer hover:text-rose-600"
                     >
                       <option value="recommended">Recommended</option>
                       <option value="price_low">Price: Low to High</option>
                       <option value="price_high">Price: High to Low</option>
                       <option value="rating">Top Rated</option>
                     </select>
                  </div>

                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button 
                      onClick={() => setShowMap(false)}
                      className={`p-1.5 rounded-md transition ${!showMap ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                      title="List View"
                    >
                      <List className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setShowMap(true)}
                      className={`p-1.5 rounded-md transition ${showMap ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                      title="Map View"
                    >
                      <MapIcon className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex gap-2 overflow-x-auto hide-scrollbar border-l border-gray-200 pl-4">
                      {[
                        { id: 'visit', label: 'Must See', icon: <Camera className="w-4 h-4" /> },
                        { id: 'eat', label: 'Eat & Drink', icon: <UtensilsCrossed className="w-4 h-4" /> },
                        { id: 'stay', label: 'Stay Safe', icon: <Bed className="w-4 h-4" /> },
                      ].map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => loadCityPlaces(activeCity.name, tab.id)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap
                            ${activeTab === tab.id 
                              ? 'bg-rose-100 text-rose-700 ring-2 ring-rose-500/20' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                          {tab.icon}
                          {tab.label}
                        </button>
                      ))}
                  </div>
               </div>
             </div>
           </div>
           
           {/* Grounded Sources Display */}
           {activeCity.sources && activeCity.sources.length > 0 && (
             <div className="max-w-7xl mx-auto px-4 md:px-6 pt-4 pb-0 text-xs text-gray-500 flex flex-wrap items-center">
               <span className="font-bold mr-2 text-gray-700">Verified with Search:</span>
               {activeCity.sources.map((source, i) => (
                 <a key={i} href={source.url} target="_blank" rel="noopener noreferrer" className="hover:text-rose-600 hover:underline mr-4 inline-flex items-center gap-1 transition-colors">
                   <ExternalLink className="w-3 h-3" />
                   {source.title.length > 30 ? source.title.substring(0, 30) + '...' : source.title}
                 </a>
               ))}
             </div>
           )}

           <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
              {flightOffer && (
                <div className="mb-8">
                   <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                     <Plane className="w-5 h-5 text-rose-500" /> Flight to {activeCity.name}
                   </h3>
                   <FlightCard offer={flightOffer} />
                </div>
              )}

              {loading ? (
                 <div className="grid md:grid-cols-3 gap-6 animate-pulse">
                    {[1,2,3].map(i => <div key={i} className="h-64 bg-gray-200 rounded-3xl" />)}
                 </div>
              ) : (
                <>
                  {showMap && sortedPlaces.length > 0 ? (
                    <div className="h-[500px] w-full rounded-3xl overflow-hidden shadow-lg border border-gray-200">
                      <MapView places={sortedPlaces} onMarkerClick={handleMarkerClick} />
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-3 gap-8">
                      {sortedPlaces.map((place, idx) => (
                        <div key={idx} ref={(el) => { placeRefs.current[idx] = el; }}>
                          <PlaceCard 
                            place={place} 
                            idx={idx} 
                            isActive={activePlaceIndex === idx} 
                            userLocation={location}
                            user={user}
                            onAuthRequired={onAuthRequired}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
           </div>
        </div>
      ) : (
        // DEFAULT DISCOVERY VIEW
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 animate-fade-in">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">Discover Your Next Journey</h2>
            <p className="text-gray-500">Explore safe, curated destinations loved by our community.</p>
          </div>

          <div className="mb-16">
            <div className="flex justify-between items-end mb-6">
               <h3 className="text-xl font-bold text-gray-900">Featured Destinations</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
               {FEATURED_CITIES.map((city) => (
                 <div 
                   key={city.name} 
                   onClick={() => handleCitySelect(city.name)}
                   className="group relative h-80 rounded-3xl overflow-hidden cursor-pointer shadow-lg"
                 >
                   <img src={city.image} alt={city.name} className="w-full h-full object-cover transition duration-700 group-hover:scale-110" />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
                      <h4 className="text-2xl font-bold text-white mb-1">{city.name}</h4>
                      <p className="text-white/80 text-sm flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {city.country}
                      </p>
                   </div>
                 </div>
               ))}
            </div>
          </div>

          <div>
             <div className="flex justify-between items-end mb-6">
               <h3 className="text-xl font-bold text-gray-900">Curated Experiences</h3>
             </div>
             <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
                {CURATED_ACTIVITIES.map((activity) => (
                   <div 
                     key={activity.title}
                     onClick={() => { setQuery(activity.query); handleSearch(activity.query); }}
                     className="relative h-48 rounded-2xl overflow-hidden cursor-pointer group shadow-md"
                   >
                      <img src={activity.image} alt={activity.title} className="w-full h-full object-cover transition duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-4 text-center group-hover:bg-black/50 transition">
                         <span className="text-white font-bold text-lg">{activity.title}</span>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaceFinder;
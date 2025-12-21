
export enum AppView {
  HOME = 'HOME',
  SAFETY = 'SAFETY',
  EXPLORE = 'EXPLORE',
  COMMUNITY = 'COMMUNITY',
  BLOG = 'BLOG',
  BUDDY = 'BUDDY',
  ABOUT = 'ABOUT',
  TERMS = 'TERMS',
  PRIVACY = 'PRIVACY'
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  avatar?: string;
}

export interface Place {
  name: string;
  type?: string;
  address?: string;
  rating?: number;
  reviews?: number;
  priceLevel?: string; // e.g. "$", "$$", "$$$"
  description: string;
  safetyTip?: string; // AI-generated specific safety context
  suggestedActivity?: string; // AI-generated activity based on user behavior
  imageKeywords?: string; // Visual descriptors for accurate image generation
  imageUrl?: string;
  sourceUrl?: string;
  openingHours?: string;
  reviewSnippet?: string;
  tags: string[];
  provider?: 'google' | 'booking' | 'tripadvisor';
  location?: {
    lat: number;
    lng: number;
  };
}

export interface TravelBuddy {
  id: string;
  name: string;
  age: number;
  bio: string;
  imageUrl: string;
  hometown: string;
  currentLocation: string;
  destination?: string; // New field for trip planning
  coordinates: {
    lat: number;
    lng: number;
  };
  interests: string[];
  spamScore: number; // 0-100 (Lower is better, e.g., 5 = Trustworthy, 90 = Bot)
  verificationLevel: 'None' | 'ID Verified' | 'Social Verified' | 'Trusted Traveler';
  languages: string[];
  tripDates: string; // Display string e.g. "Oct 15 - Oct 20"
  startDate?: string; // ISO Date YYYY-MM-DD for filtering
  endDate?: string; // ISO Date YYYY-MM-DD for filtering
  travelStyle?: 'Budget' | 'Mid-range' | 'Luxury' | 'Backpacker' | 'Digital Nomad';
  isOnline?: boolean;
  tripMedia?: { type: 'image' | 'video'; url: string }[];
}

export interface FlightOffer {
  id: string;
  destinationCity: string;
  airportCode: string;
  airline: string;
  price: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  date: string;
  bookingUrl: string;
  imageUrl: string;
}

export interface PlaceFilters {
  minRating: number;
  minPrice?: number;
  maxPrice?: number;
  category: 'all' | 'accommodation' | 'activity' | 'food';
  arrivalDate?: string; // YYYY-MM-DD
  interests?: string[]; // e.g. ["Hiking", "Museums", "Vegan Food"]
}

export interface CityDetails {
  name: string;
  description: string;
  bestTime: string;
  safetyScore: number;
  imageUrl: string;
  sources?: { title: string; url: string }[];
}

export interface SafetyReport {
  city: string;
  safetyScore: number; // 1-10
  summary: string;
  emergencyNumbers: { label: string; number: string }[];
  safeAreas: string[];
  areasToAvoid: string[];
  sources: { title: string; url: string }[];
}

export interface CommunityReply {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  imageUrl?: string;
}

export interface CommunityPost {
  id: string;
  author: string;
  location: string;
  content: string;
  likes: number;
  isLiked?: boolean;
  category: 'Safety' | 'Food' | 'Experience' | 'Hidden Gem';
  timestamp: string;
  replies?: CommunityReply[];
  imageUrl?: string;
  safetyScore?: number;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  imageUrl: string;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
}

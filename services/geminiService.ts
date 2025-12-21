import { GoogleGenAI, Type } from "@google/genai";
import { TravelBuddy, SafetyReport, Place, PlaceFilters, Coordinates, CityDetails, FlightOffer } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Schemas
const TravelBuddySchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING },
      name: { type: Type.STRING },
      age: { type: Type.NUMBER },
      bio: { type: Type.STRING },
      hometown: { type: Type.STRING },
      currentLocation: { type: Type.STRING },
      destination: { type: Type.STRING },
      coordinates: {
        type: Type.OBJECT,
        properties: {
          lat: { type: Type.NUMBER },
          lng: { type: Type.NUMBER },
        },
      },
      interests: { type: Type.ARRAY, items: { type: Type.STRING } },
      spamScore: { type: Type.NUMBER },
      verificationLevel: { type: Type.STRING },
      languages: { type: Type.ARRAY, items: { type: Type.STRING } },
      startDate: { type: Type.STRING },
      endDate: { type: Type.STRING },
      travelStyle: { type: Type.STRING },
    },
  },
};

const SafetyReportSchema = {
  type: Type.OBJECT,
  properties: {
    city: { type: Type.STRING },
    safetyScore: { type: Type.NUMBER },
    summary: { type: Type.STRING },
    emergencyNumbers: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING },
          number: { type: Type.STRING },
        },
      },
    },
    safeAreas: { type: Type.ARRAY, items: { type: Type.STRING } },
    areasToAvoid: { type: Type.ARRAY, items: { type: Type.STRING } },
    sources: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          url: { type: Type.STRING },
        },
      },
    },
  },
};

const PlaceSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING },
      type: { type: Type.STRING },
      address: { type: Type.STRING },
      rating: { type: Type.NUMBER },
      reviews: { type: Type.NUMBER },
      priceLevel: { type: Type.STRING },
      description: { type: Type.STRING },
      safetyTip: { type: Type.STRING },
      suggestedActivity: { type: Type.STRING },
      imageKeywords: { type: Type.STRING },
      sourceUrl: { type: Type.STRING },
      tags: { type: Type.ARRAY, items: { type: Type.STRING } },
      provider: { type: Type.STRING },
      location: {
        type: Type.OBJECT,
        properties: {
          lat: { type: Type.NUMBER },
          lng: { type: Type.NUMBER },
        },
      },
    },
  },
};

const CityDetailsSchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    description: { type: Type.STRING },
    bestTime: { type: Type.STRING },
    safetyScore: { type: Type.NUMBER },
    sources: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          url: { type: Type.STRING },
        },
      },
    },
  },
};

const FlightOfferSchema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING },
    destinationCity: { type: Type.STRING },
    airportCode: { type: Type.STRING },
    airline: { type: Type.STRING },
    price: { type: Type.STRING },
    departureTime: { type: Type.STRING },
    arrivalTime: { type: Type.STRING },
    duration: { type: Type.STRING },
    date: { type: Type.STRING },
    bookingUrl: { type: Type.STRING },
  },
};

export const findTravelBuddies = async (location: string): Promise<TravelBuddy[]> => {
  const modelId = "gemini-2.5-flash";
  
  const prompt = `
    Generate 5 realistic fictional travel companion profiles for women traveling to or living in ${location}.
    Include varying ages (20-40), interests, and backgrounds.
    
    CRITICAL: Assign each a "spamScore" from 0 to 100.
    - 0-20: Highly trusted, verified ID, realistic bio.
    - 21-60: Average user, social verified.
    - 61-100: Suspicious, incomplete profile, generic bio.
    
    Also generate realistic coordinates slightly randomly offset around ${location} (latitude/longitude).
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: TravelBuddySchema,
      }
    });

    const buddies = JSON.parse(response.text || "[]");
    return buddies.map((b: any, i: number) => {
        const start = new Date(b.startDate || Date.now());
        const end = new Date(b.endDate || Date.now());
        const dateStr = `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

        return {
          ...b,
          id: b.id || `buddy-${Date.now()}-${i}`,
          tripDates: dateStr,
          imageUrl: `https://image.pollinations.ai/prompt/portrait%20of%20a%20female%20traveler%20${b.age}yo%20${b.interests?.[0] || 'traveler'}%20realistic%20candid?width=200&height=200&model=flux&seed=${i + location.length}`,
          isOnline: Math.random() > 0.5
        };
    });
  } catch (e) {
    console.error("Buddy Gen Error", e);
    return [];
  }
};

export const getSafetyAnalysis = async (city: string): Promise<SafetyReport | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Provide a detailed safety report for a female traveler in ${city}. Include a safety score (1-10), summary, emergency numbers, safe areas, areas to avoid, and reputable sources.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: SafetyReportSchema,
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Safety Analysis Error", e);
    return null;
  }
};

export const findPlaces = async (query: string, location: Coordinates | undefined, filters: PlaceFilters): Promise<Place[]> => {
  let prompt = `Find 6 places matching "${query}"`;
  if (location) {
    prompt += ` near lat:${location.latitude}, lng:${location.longitude}`;
  }
  prompt += `. Filter criteria: ${JSON.stringify(filters)}. 
  Focus on safety for women. 
  For each place, provide a safetyTip, suggest an activity, and imageKeywords for visual generation.
  Provider should be one of 'google', 'booking', 'tripadvisor'.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: PlaceSchema,
      }
    });

    const places = JSON.parse(response.text || "[]");
    return places.map((p: any, i: number) => ({
      ...p,
      imageUrl: `https://image.pollinations.ai/prompt/${encodeURIComponent(p.imageKeywords || p.name + ' interior design')}?width=400&height=300&model=flux&seed=${i}`,
    }));
  } catch (e) {
    console.error("Find Places Error", e);
    return [];
  }
};

export const getCityDetails = async (cityName: string): Promise<CityDetails | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Provide travel details for ${cityName} focusing on female safety and tourism.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: CityDetailsSchema,
      }
    });
    const data = JSON.parse(response.text || "{}");
    return {
        ...data,
        imageUrl: `https://image.pollinations.ai/prompt/${encodeURIComponent(cityName + ' city landmark')}?width=1200&height=800&model=flux`,
    };
  } catch (e) {
    console.error("City Details Error", e);
    return null;
  }
};

export const findFlightOffer = async (destination: string, date: string | undefined, location: Coordinates): Promise<FlightOffer | null> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Find a realistic flight offer from lat:${location.latitude}, lng:${location.longitude} to ${destination} for date: ${date || 'next month'}.`,
            config: {
                responseMimeType: 'application/json',
                responseSchema: FlightOfferSchema,
            }
        });
        const data = JSON.parse(response.text || "{}");
        return {
            ...data,
            imageUrl: `https://image.pollinations.ai/prompt/logo%20of%20${encodeURIComponent(data.airline)}%20airline%20on%20white%20background?width=200&height=200&model=flux`,
        };
    } catch (e) {
        console.error("Flight Offer Error", e);
        return null;
    }
};
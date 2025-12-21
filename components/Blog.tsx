
import React, { useState } from 'react';
import { BlogPost } from '../types';
import { Clock, User, ArrowLeft, Calendar, Share2, Tag } from 'lucide-react';

const MOCK_POSTS: BlogPost[] = [
  {
    id: '1',
    title: 'Top 10 Safest Cities for Solo Female Travelers in 2025',
    excerpt: 'From the streets of Tokyo to the nordic charm of Copenhagen, discover the destinations where safety meets adventure.',
    content: `
      <p class="mb-4">Traveling alone as a woman is an empowering experience, but safety is often a top priority. Based on our AI analysis and community reports, we've curated the definitive list of safe havens for 2025.</p>
      <h3 class="text-xl font-bold text-gray-900 mb-3 mt-6">1. Tokyo, Japan</h3>
      <p class="mb-4">Consistently ranked as one of the safest cities globally, Tokyo offers a unique blend of tradition and futurism. The public transport is reliable, safe at night, and women-only train cars are available during rush hour.</p>
      <h3 class="text-xl font-bold text-gray-900 mb-3 mt-6">2. Reykjavik, Iceland</h3>
      <p class="mb-4">Iceland is famous for its gender equality and low crime rates. Reykjavik feels more like a cozy town than a capital city, making it perfect for first-time solo travelers.</p>
      <h3 class="text-xl font-bold text-gray-900 mb-3 mt-6">3. Singapore</h3>
      <p class="mb-4">Clean, efficient, and strictly policed, Singapore is a breeze to navigate. The city comes alive at night, and walking alone is generally considered very safe.</p>
      <p class="mt-6 italic text-gray-500">Stay tuned for the full breakdown of all 10 cities!</p>
    `,
    author: 'Emma Wilson',
    date: 'Oct 15, 2024',
    readTime: '5 min read',
    category: 'Guides',
    imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '2',
    title: 'How to make friends while traveling solo',
    excerpt: 'Feeling lonely on the road? Here are 5 proven ways to connect with fellow travelers and locals safely.',
    content: `
      <p class="mb-4">Solo travel doesn't have to mean being alone. In fact, it's often easier to make connections when you're on your own.</p>
      <h3 class="text-xl font-bold text-gray-900 mb-3 mt-6">Stay in Social Hostels</h3>
      <p class="mb-4">Look for accommodations that organize group dinners or walking tours. These are natural ice-breakers.</p>
      <h3 class="text-xl font-bold text-gray-900 mb-3 mt-6">Use the SheRoam Community</h3>
      <p class="mb-4">Our app's community feature is designed exactly for this. Post your location and see who wants to grab coffee!</p>
    `,
    author: 'Sarah Jenkins',
    date: 'Oct 12, 2024',
    readTime: '4 min read',
    category: 'Tips',
    imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '3',
    title: 'Packing Light: A Minimalist Guide',
    excerpt: 'Ditch the checked bag. Learn how to pack everything you need for 2 weeks in a single carry-on.',
    content: `
      <p class="mb-4">The freedom of walking out of the airport without waiting for luggage is unmatched. Here is my capsule wardrobe strategy.</p>
      <ul class="list-disc pl-5 space-y-2 mb-4">
        <li>Merino wool is your best friend (odor resistant!)</li>
        <li>Stick to a 3-color palette</li>
        <li>Wear your heaviest shoes on the plane</li>
      </ul>
    `,
    author: 'Elena Rodriguez',
    date: 'Oct 08, 2024',
    readTime: '6 min read',
    category: 'Packing',
    imageUrl: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '4',
    title: 'Hidden Gems of Portugal',
    excerpt: 'Beyond Lisbon and Porto: exploring the coastal villages and wine valleys that tourists often miss.',
    content: 'Coming soon...',
    author: 'Amara O.',
    date: 'Oct 01, 2024',
    readTime: '7 min read',
    category: 'Destinations',
    imageUrl: 'https://images.unsplash.com/photo-1555881400-74d7acaacd81?auto=format&fit=crop&q=80&w=800'
  }
];

const Blog: React.FC = () => {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  if (selectedPost) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-10 animate-fade-in">
        <button 
          onClick={() => setSelectedPost(null)}
          className="flex items-center gap-2 text-gray-500 hover:text-rose-600 transition mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Articles
        </button>

        <article>
          <div className="mb-8">
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
              <span className="bg-rose-50 text-rose-600 px-3 py-1 rounded-full font-medium text-xs uppercase tracking-wide">
                {selectedPost.category}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" /> {selectedPost.date}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {selectedPost.readTime}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 mb-6 leading-tight">
              {selectedPost.title}
            </h1>
            <div className="flex items-center gap-3 border-b border-gray-100 pb-8">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">{selectedPost.author}</p>
                <p className="text-xs text-gray-500">Travel Contributor</p>
              </div>
              <button className="ml-auto p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-900 transition">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          <img 
            src={selectedPost.imageUrl} 
            alt={selectedPost.title} 
            className="w-full h-80 md:h-[500px] object-cover rounded-3xl mb-10 shadow-lg"
          />

          <div 
            className="prose prose-lg prose-rose max-w-none text-gray-600 leading-relaxed font-sans"
            dangerouslySetInnerHTML={{ __html: selectedPost.content }} 
          />
        </article>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-fade-in">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-serif font-bold text-gray-900 mb-4">Travel Stories & Tips</h2>
        <p className="text-gray-500 max-w-2xl mx-auto text-lg">
          Inspiration for your next adventure, practical safety guides, and stories from our community.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-x-12 gap-y-12">
        {MOCK_POSTS.map((post) => (
          <div 
            key={post.id} 
            className="group cursor-pointer flex flex-col h-full"
            onClick={() => setSelectedPost(post)}
          >
            <div className="overflow-hidden rounded-2xl mb-6 relative shadow-sm group-hover:shadow-xl transition-all duration-300">
              <img 
                src={post.imageUrl} 
                alt={post.title} 
                className="w-full h-64 object-cover transform group-hover:scale-105 transition duration-700"
              />
              <div className="absolute top-4 left-4">
                 <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-gray-900 shadow-sm uppercase tracking-wide">
                    {post.category}
                 </span>
              </div>
            </div>
            
            <div className="flex-1 flex flex-col">
              <div className="flex items-center gap-4 text-xs text-gray-400 mb-3 font-medium uppercase tracking-wider">
                <span>{post.date}</span>
                <span>•</span>
                <span>{post.readTime}</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 leading-tight group-hover:text-rose-600 transition-colors font-serif">
                {post.title}
              </h3>
              <p className="text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                {post.excerpt}
              </p>
              <div className="mt-auto flex items-center gap-2 text-sm font-bold text-rose-600">
                Read Article <ArrowLeft className="w-4 h-4 rotate-180 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Blog;

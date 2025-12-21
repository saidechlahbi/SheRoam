import React, { useState } from 'react';
import { getSafetyAnalysis } from '../services/geminiService';
import { SafetyReport } from '../types';
import { Shield, AlertTriangle, CheckCircle, Phone, Search, ExternalLink, Loader2 } from 'lucide-react';

const SafetyAnalysis: React.FC = () => {
  const [city, setCity] = useState('');
  const [report, setReport] = useState<SafetyReport | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim()) return;
    setLoading(true);
    setReport(null);
    try {
      const data = await getSafetyAnalysis(city);
      setReport(data);
    } catch (err) {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">Check Your Destination</h2>
        <p className="text-gray-500">Get AI-analyzed safety reports based on real-time data and trusted sources.</p>
      </div>

      <form onSubmit={handleSearch} className="relative max-w-lg mx-auto mb-12">
        <input
          type="text"
          placeholder="Enter a city (e.g., Paris, Tokyo, Cape Town)..."
          className="w-full px-6 py-4 pr-12 rounded-full border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent text-lg"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button 
          type="submit" 
          disabled={loading}
          className="absolute right-2 top-2 p-2 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin w-6 h-6" /> : <Search className="w-6 h-6" />}
        </button>
      </form>

      {report && (
        <div className="animate-fade-in space-y-8">
          {/* Score Card */}
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-rose-100 flex flex-col md:flex-row items-center gap-8">
            <div className={`relative flex items-center justify-center w-32 h-32 rounded-full border-8 ${report.safetyScore >= 7 ? 'border-green-400 text-green-600' : report.safetyScore >= 5 ? 'border-yellow-400 text-yellow-600' : 'border-red-400 text-red-600'}`}>
              <span className="text-4xl font-bold">{report.safetyScore}</span>
              <span className="absolute bottom-2 text-xs font-semibold uppercase tracking-wider text-gray-400">/ 10</span>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Safety Overview for {report.city}</h3>
              <p className="text-gray-600 leading-relaxed">{report.summary}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Safe Zones */}
            <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="text-green-600 w-6 h-6" />
                <h4 className="font-bold text-green-800 text-lg">Safe Neighborhoods</h4>
              </div>
              <ul className="space-y-2">
                {report.safeAreas.map((area, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-green-700">
                    <span className="mt-1.5 w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0" />
                    {area}
                  </li>
                ))}
              </ul>
            </div>

            {/* Caution Zones */}
            <div className="bg-orange-50 rounded-2xl p-6 border border-orange-100">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="text-orange-600 w-6 h-6" />
                <h4 className="font-bold text-orange-800 text-lg">Areas to Exercise Caution</h4>
              </div>
              <ul className="space-y-2">
                {report.areasToAvoid.map((area, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-orange-700">
                    <span className="mt-1.5 w-1.5 h-1.5 bg-orange-500 rounded-full flex-shrink-0" />
                    {area}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Emergency & Sources */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
               <div className="flex items-center gap-2 mb-4">
                <Phone className="text-rose-500 w-5 h-5" />
                <h4 className="font-bold text-gray-800">Emergency Contacts</h4>
              </div>
              <div className="space-y-3">
                {report.emergencyNumbers.map((num, idx) => (
                   <div key={idx} className="flex justify-between items-center border-b border-gray-50 pb-2 last:border-0">
                     <span className="text-gray-600 font-medium">{num.label}</span>
                     <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded">{num.number}</span>
                   </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="text-blue-500 w-5 h-5" />
                <h4 className="font-bold text-gray-800">Verified Sources</h4>
              </div>
              <ul className="space-y-2">
                {report.sources.map((source, idx) => (
                  <li key={idx}>
                    <a href={source.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:underline truncate">
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{source.title}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SafetyAnalysis;

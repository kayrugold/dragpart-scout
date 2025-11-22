import React from 'react';
import { Search, Loader2, Filter } from 'lucide-react';
import { CarProfile, SearchStatus } from '../types';

interface PartSearchProps {
  car: CarProfile;
  query: string;
  setQuery: (q: string) => void;
  category: string;
  setCategory: (c: string) => void;
  onSearch: () => void;
  status: SearchStatus;
}

export const CATEGORIES = [
  "All Categories",
  "Engine Components",
  "Induction & Fuel",
  "Exhaust",
  "Transmission & Drivetrain",
  "Suspension & Chassis",
  "Brakes",
  "Wheels & Tires",
  "Interior & Safety",
  "Exterior & Aero",
  "Electronics & Ignition"
];

export const PartSearch: React.FC<PartSearchProps> = ({ 
  car, 
  query, 
  setQuery, 
  category, 
  setCategory, 
  onSearch, 
  status 
}) => {

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Allow empty query if we have a category selected (Browsing mode)
    if (query.trim() || category !== "All Categories") {
      onSearch();
    }
  };

  const isLoading = status === SearchStatus.SEARCHING;

  return (
    <div className="w-full mb-6">
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3">
        {/* Category Select */}
        <div className="relative md:w-64 shrink-0 group">
           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="w-4 h-4 text-slate-400 group-focus-within:text-racing-highlight transition-colors" />
           </div>
           <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={isLoading}
              className="w-full h-full bg-racing-800 text-white border border-racing-700 pl-10 pr-8 py-4 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-racing-highlight focus:border-transparent appearance-none cursor-pointer hover:bg-racing-700 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
           >
              {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
              ))}
           </select>
           <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
           </div>
        </div>

        {/* Search Input */}
        <div className="relative group flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className={`w-5 h-5 ${isLoading ? 'text-racing-highlight' : 'text-slate-400'}`} />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isLoading}
            placeholder={`Find parts for ${car.year} ${car.model}...`}
            className="w-full bg-racing-800 text-white border border-racing-700 pl-12 pr-32 py-4 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-racing-highlight focus:border-transparent text-lg placeholder-slate-500 transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || (!query.trim() && category === "All Categories")}
            className="absolute right-2 top-2 bottom-2 bg-racing-accent hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>SCOUTING...</span>
              </>
            ) : (
              <span>SCOUT</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
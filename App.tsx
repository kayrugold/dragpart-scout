import React, { useState, useEffect } from 'react';
import { Gauge, Wrench, AlertCircle, Flag, Terminal, Key } from 'lucide-react';
import { CarProfile, SearchResult, SearchStatus } from './types';
import { findCarParts } from './services/geminiService';
import { GaragePanel } from './components/GaragePanel';
import { PartSearch, CATEGORIES } from './components/PartSearch';
import { ResultCard } from './components/ResultCard';
import { HistorySidebar } from './components/HistorySidebar';

// Define initial state for the car to avoid empty inputs
const INITIAL_CAR: CarProfile = {
  year: '',
  make: '',
  model: '',
  engine: ''
};

const App: React.FC = () => {
  const [car, setCar] = useState<CarProfile>(INITIAL_CAR);
  
  // Search State
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [status, setStatus] = useState<SearchStatus>(SearchStatus.IDLE);
  
  const [results, setResults] = useState<SearchResult[]>([]);
  const [currentResultId, setCurrentResultId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Manual Key State
  const [manualKeyInput, setManualKeyInput] = useState('');
  const [hasManualKey, setHasManualKey] = useState(false);

  // Load history from local storage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('dragpart_history');
    const savedCar = localStorage.getItem('dragpart_car');
    const savedKey = localStorage.getItem('dragpart_manual_key');
    
    if (savedHistory) {
      try {
        setResults(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
    if (savedCar) {
        try {
            setCar(JSON.parse(savedCar));
        } catch(e) {
            console.error("Failed to parse car", e);
        }
    }
    if (savedKey) {
        setHasManualKey(true);
    }
  }, []);

  // Save history when it changes
  useEffect(() => {
    localStorage.setItem('dragpart_history', JSON.stringify(results));
  }, [results]);

  // Save car profile when it changes
  useEffect(() => {
      localStorage.setItem('dragpart_car', JSON.stringify(car));
  }, [car]);

  const handleSearch = async (overrideQuery?: string, overrideCategory?: string) => {
    const finalQuery = overrideQuery !== undefined ? overrideQuery : query;
    const finalCategory = overrideCategory !== undefined ? overrideCategory : category;

    if (!car.make || !car.model || !car.year) {
      setErrorMsg("Please fill out the Vehicle Profile first (Year, Make, Model).");
      scrollToSection('build-section');
      return;
    }

    setErrorMsg(null);
    setStatus(SearchStatus.SEARCHING);

    // Update UI inputs if triggered programmatically (e.g. by clicking a part)
    if (overrideQuery !== undefined) setQuery(overrideQuery);
    if (overrideCategory !== undefined) setCategory(finalCategory);

    try {
      const data = await findCarParts(car, finalQuery, finalCategory);
      
      // Determine display title for history
      let historyTitle = finalQuery;
      if (!finalQuery.trim()) {
          historyTitle = `Browse: ${finalCategory}`;
      } else if (finalCategory !== "All Categories") {
          historyTitle = `${finalQuery} (${finalCategory})`;
      }

      const newResult: SearchResult = {
        ...data,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        partQuery: historyTitle
      };

      // Add to history (prepend)
      setResults(prev => [newResult, ...prev]);
      setCurrentResultId(newResult.id);
      setStatus(SearchStatus.COMPLETE);
      
      // Auto scroll to results
      setTimeout(() => scrollToSection('race-section'), 100);
      
    } catch (err: any) {
      setStatus(SearchStatus.ERROR);
      console.error(err);
      
      let msg = err.message || "An unknown error occurred.";
      // Clean up the error message if it's a quota issue
      if (msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {
        msg = "High Traffic Alert: The AI model is currently busy or the daily free limit was reached. We've switched to a faster model, please try clicking Scout again!";
      } else if (msg.includes('API Key')) {
        msg = "API Key Error: The application cannot connect to Google.";
      }
      
      setErrorMsg(msg);
    }
  };

  const saveManualKey = () => {
      if (!manualKeyInput.trim()) return;
      localStorage.setItem('dragpart_manual_key', manualKeyInput.trim());
      setHasManualKey(true);
      setManualKeyInput('');
      setErrorMsg(null);
      // Auto retry
      handleSearch();
  };
  
  const clearManualKey = () => {
      localStorage.removeItem('dragpart_manual_key');
      setHasManualKey(false);
  };

  // When category changes in the UI, check if we should auto-browse
  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    // Auto-trigger search if car is ready and query is empty (Browse Mode)
    const isCarReady = car.year && car.make && car.model;
    if (isCarReady && !query.trim() && newCategory !== "All Categories") {
      handleSearch(query, newCategory);
    }
  };

  // When a user clicks a suggested part link in the results
  const handlePartClick = (partName: string) => {
     scrollToSection('search-section');
     // Trigger search for that specific part. 
     handleSearch(partName, "All Categories");
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // Offset for sticky header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  const activeResult = results.find(r => r.id === currentResultId);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-racing-900">
      {/* Navigation Bar */}
      <nav className="bg-racing-900 border-b border-racing-700 sticky top-0 z-50 bg-opacity-95 backdrop-blur-sm print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button onClick={() => scrollToSection('search-section')} className="flex items-center gap-3 hover:opacity-90 transition-opacity text-left">
              <div className="bg-racing-accent p-1.5 rounded-lg transform -skew-x-12">
                <Gauge className="w-6 h-6 text-white transform skew-x-12" />
              </div>
              <span className="text-2xl font-display tracking-wider text-white">
                DRAGPART<span className="text-racing-highlight">SCOUT</span>
              </span>
            </button>
            <div className="hidden md:flex items-center gap-4 text-sm font-mono text-slate-400">
              <button 
                onClick={() => scrollToSection('build-section')} 
                className="flex items-center gap-1 hover:text-white transition-colors focus:outline-none focus:text-white group"
              >
                <Wrench className="w-4 h-4 text-slate-500 group-hover:text-racing-highlight transition-colors" /> 
                BUILD
              </button>
              <span className="text-racing-700">|</span>
              <button 
                onClick={() => scrollToSection('search-section')} 
                className="hover:text-white transition-colors focus:outline-none focus:text-white"
              >
                SEARCH
              </button>
              <span className="text-racing-700">|</span>
              <button 
                onClick={() => scrollToSection('race-section')} 
                className="flex items-center gap-1 hover:text-racing-accent transition-colors focus:outline-none focus:text-racing-accent group"
              >
                RACE
                <Flag className="w-4 h-4 text-slate-500 group-hover:text-racing-accent transition-colors" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32 print:p-0 print:w-full flex flex-col">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 print:block flex-1">
          
          {/* Left Sidebar: Garage & History */}
          <div className="lg:col-span-3 space-y-6 print:hidden">
            <div id="build-section">
              <GaragePanel car={car} setCar={setCar} />
            </div>
            
            <div className="hidden lg:block h-[calc(100vh-400px)] sticky top-24">
               <HistorySidebar 
                 history={results} 
                 onSelect={(item) => {
                   setCurrentResultId(item.id);
                   scrollToSection('race-section');
                 }}
                 onClear={() => {
                   setResults([]);
                   setCurrentResultId(null);
                 }}
                 currentId={currentResultId || undefined}
               />
               
               {/* Key Status Indicator */}
               {hasManualKey && (
                   <div className="mt-4 p-2 text-xs text-center text-slate-500 border border-dashed border-slate-700 rounded cursor-help" title="Using manual override key">
                      <div className="flex items-center justify-center gap-1 mb-1">
                          <Key className="w-3 h-3 text-racing-highlight" />
                          <span>Custom Key Active</span>
                      </div>
                      <button onClick={clearManualKey} className="text-racing-accent hover:underline">Clear Key</button>
                   </div>
               )}
            </div>
          </div>

          {/* Center: Search & Results */}
          <div className="lg:col-span-9 print:w-full">
            
            <div className="max-w-3xl mx-auto print:max-w-none print:w-full">
              <div className="text-center mb-8 print:hidden">
                <h1 className="text-3xl md:text-4xl font-display text-white mb-3">
                  FIND THE PARTS. <span className="text-transparent bg-clip-text bg-gradient-to-r from-racing-highlight to-racing-accent">BUILD THE DREAM.</span>
                </h1>
                <p className="text-slate-400">
                  AI-powered search across the web. Compare prices, reviews, and quality in one place.
                </p>
              </div>

              <div id="search-section" className="print:hidden scroll-mt-24">
                 <PartSearch 
                    car={car} 
                    query={query}
                    setQuery={setQuery}
                    category={category}
                    setCategory={handleCategoryChange}
                    onSearch={() => handleSearch()} 
                    status={status} 
                 />
              </div>

              {errorMsg && (
                <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-red-200 animate-bounce-short print:hidden">
                   <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-bold">System Alert</h4>
                        <p className="text-sm mb-4">{errorMsg}</p>
                        
                        {errorMsg.includes('API Key') && (
                            <div className="bg-black/30 p-4 rounded-lg border border-white/10">
                                <p className="text-xs text-slate-300 mb-2 font-semibold">QUICK FIX: Enter API Key Manually</p>
                                <div className="flex gap-2">
                                    <input 
                                        type="password" 
                                        placeholder="Paste Google Gemini API Key here..."
                                        className="flex-1 bg-racing-900 border border-racing-700 text-white px-3 py-2 rounded text-sm focus:border-racing-highlight focus:outline-none"
                                        value={manualKeyInput}
                                        onChange={(e) => setManualKeyInput(e.target.value)}
                                    />
                                    <button 
                                        onClick={saveManualKey}
                                        className="bg-racing-highlight text-racing-900 font-bold px-4 py-2 rounded text-sm hover:bg-sky-400 transition-colors"
                                    >
                                        SAVE & RETRY
                                    </button>
                                </div>
                                <p className="text-[10px] text-slate-500 mt-2">
                                    This saves the key to your browser for this device only. 
                                    Or verify server status via CLI: <code className="bg-black/50 px-1 rounded">npx wrangler secret list</code>
                                </p>
                            </div>
                        )}
                      </div>
                   </div>
                </div>
              )}

              <div id="race-section" className="scroll-mt-24">
                {activeResult ? (
                  <ResultCard result={activeResult} onPartClick={handlePartClick} />
                ) : (
                  status === SearchStatus.IDLE && results.length === 0 && (
                    <div className="text-center py-12 opacity-50 print:hidden">
                       <div className="w-24 h-24 border-4 border-racing-700 border-t-racing-accent rounded-full mx-auto mb-4 animate-spin-slow" style={{ animationDuration: '3s' }}></div>
                       <p className="text-slate-500 font-mono">READY TO SCOUT</p>
                    </div>
                  )
                )}
              </div>
            </div>

             {/* Mobile History */}
             <div className="lg:hidden mt-8 print:hidden">
               <HistorySidebar 
                 history={results} 
                 onSelect={(item) => {
                   setCurrentResultId(item.id);
                   scrollToSection('race-section');
                 }}
                 onClear={() => {
                   setResults([]);
                   setCurrentResultId(null);
                 }}
                 currentId={currentResultId || undefined}
               />
            </div>

          </div>
        </div>
      </main>
      
      <footer className="fixed bottom-0 left-0 w-full border-t border-racing-700 bg-racing-900/95 backdrop-blur-sm py-4 print:hidden z-50">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-600 text-sm">
          <p>&copy; {new Date().getFullYear()} DragPart Scout. Built for speed.</p>
          <p className="text-xs mt-2">Parts availability and pricing are estimates generated by AI and Google Search.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
import React from 'react';
import { History, Trash2, ChevronRight, Clock } from 'lucide-react';
import { SearchResult } from '../types';

interface HistorySidebarProps {
  history: SearchResult[];
  onSelect: (result: SearchResult) => void;
  onClear: () => void;
  currentId?: string;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({ history, onSelect, onClear, currentId }) => {
  if (history.length === 0) {
    return null;
  }

  return (
    <div className="bg-racing-800 rounded-xl border border-racing-700 overflow-hidden flex flex-col h-full max-h-[600px]">
      <div className="p-4 border-b border-racing-700 flex justify-between items-center bg-racing-900/30">
        <div className="flex items-center gap-2 text-white font-display">
          <History className="w-5 h-5 text-racing-highlight" />
          <h3>RECENT SCOUTS</h3>
        </div>
        <button 
          onClick={onClear}
          className="text-slate-500 hover:text-racing-accent transition-colors p-1"
          title="Clear History"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="overflow-y-auto flex-1 p-2 space-y-2 scrollbar-thin">
        {history.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            className={`w-full text-left p-3 rounded-lg border transition-all group relative ${
              currentId === item.id
                ? 'bg-racing-700 border-racing-highlight/50'
                : 'bg-racing-900/50 border-racing-700 hover:border-slate-500'
            }`}
          >
            <div className="flex justify-between items-start mb-1">
              <span className="font-semibold text-slate-200 truncate pr-2">{item.partQuery}</span>
              {currentId === item.id && <div className="w-2 h-2 rounded-full bg-racing-highlight animate-pulse" />}
            </div>
            
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span className="bg-racing-900 px-1.5 py-0.5 rounded border border-racing-700">
                {item.car.model}
              </span>
              <span className="flex items-center gap-1">
                 <Clock className="w-3 h-3" />
                 {new Date(item.timestamp).toLocaleDateString()}
              </span>
            </div>

            <ChevronRight className={`absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity ${currentId === item.id ? 'opacity-100 text-racing-highlight' : ''}`} />
          </button>
        ))}
      </div>
    </div>
  );
};
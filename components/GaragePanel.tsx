import React from 'react';
import { Car, Cog, PenTool, Settings } from 'lucide-react';
import { CarProfile } from '../types';

interface GaragePanelProps {
  car: CarProfile;
  setCar: (car: CarProfile) => void;
}

export const GaragePanel: React.FC<GaragePanelProps> = ({ car, setCar }) => {
  
  const handleChange = (field: keyof CarProfile, value: string) => {
    setCar({ ...car, [field]: value });
  };

  return (
    <div className="bg-racing-800 rounded-xl border border-racing-700 p-5 shadow-xl">
      <div className="flex items-center gap-2 mb-4 border-b border-racing-700 pb-3">
        <Car className="w-6 h-6 text-racing-accent" />
        <h2 className="text-xl font-display text-white tracking-wide">THE BUILD</h2>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1 font-semibold">Year</label>
            <input
              type="text"
              value={car.year}
              onChange={(e) => handleChange('year', e.target.value)}
              placeholder="1969"
              className="w-full bg-racing-900 border border-racing-700 text-white px-3 py-2 rounded focus:outline-none focus:border-racing-highlight transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1 font-semibold">Make</label>
            <input
              type="text"
              value={car.make}
              onChange={(e) => handleChange('make', e.target.value)}
              placeholder="Chevy"
              className="w-full bg-racing-900 border border-racing-700 text-white px-3 py-2 rounded focus:outline-none focus:border-racing-highlight transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1 font-semibold">Model</label>
          <input
            type="text"
            value={car.model}
            onChange={(e) => handleChange('model', e.target.value)}
            placeholder="Camaro"
            className="w-full bg-racing-900 border border-racing-700 text-white px-3 py-2 rounded focus:outline-none focus:border-racing-highlight transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1 font-semibold">Engine / Trim</label>
          <div className="relative">
            <Cog className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={car.engine}
              onChange={(e) => handleChange('engine', e.target.value)}
              placeholder="LS3 Swap / 454 Big Block"
              className="w-full bg-racing-900 border border-racing-700 text-white pl-9 pr-3 py-2 rounded focus:outline-none focus:border-racing-highlight transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-racing-900/50 rounded border border-racing-700/50 text-xs text-slate-400 flex items-start gap-2">
        <Settings className="w-4 h-4 mt-0.5 shrink-0" />
        <p>This vehicle profile will be used for compatibility checks on all parts searches.</p>
      </div>
    </div>
  );
};
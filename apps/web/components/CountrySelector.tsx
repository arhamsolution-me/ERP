'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check, Globe } from 'lucide-react';
import { WORLD_COUNTRIES, CountryItem } from '@/lib/countries';

interface CountrySelectorProps {
  value: string;
  onChange: (countryName: string) => void;
}

export default function CountrySelector({ value, onChange }: CountrySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedCountry =
    WORLD_COUNTRIES.find((c) => c.name.toLowerCase() === value.toLowerCase()) ||
    WORLD_COUNTRIES[0];

  const filteredCountries = WORLD_COUNTRIES.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Selector Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-slate-200 rounded-xl py-3.5 px-4 text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all shadow-sm flex items-center justify-between cursor-pointer"
      >
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={`https://flagcdn.com/w40/${selectedCountry?.code.toLowerCase()}.png`}
            alt={selectedCountry?.name || 'Country Flag'}
            className="w-6 h-4 object-cover rounded shadow-sm border border-slate-200"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <span className="truncate text-slate-900 font-bold">{selectedCountry?.name || value}</span>
          <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase">
            {selectedCountry?.code}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-80 flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Search Box inside Dropdown */}
          <div className="p-3 border-b border-slate-100 sticky top-0 bg-white z-10">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                placeholder="Search country or code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs font-semibold text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600"
              />
            </div>
          </div>

          {/* Countries List */}
          <div className="overflow-y-auto flex-1 p-2 space-y-1">
            {filteredCountries.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 font-medium">
                No country found matching "{search}"
              </div>
            ) : (
              filteredCountries.map((c) => {
                const isSelected = c.name.toLowerCase() === selectedCountry?.name.toLowerCase();
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => {
                      onChange(c.name);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 text-blue-700 font-bold'
                        : 'hover:bg-slate-50 text-slate-700 font-semibold'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={`https://flagcdn.com/w40/${c.code.toLowerCase()}.png`}
                        alt={c.name}
                        className="w-6 h-4 object-cover rounded shadow-sm border border-slate-200 shrink-0"
                      />
                      <span className="text-xs truncate">{c.name}</span>
                      <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase">
                        {c.code}
                      </span>
                    </div>

                    {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

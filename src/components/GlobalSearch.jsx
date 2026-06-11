import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, FileText, User, Car, ShieldCheck, BadgeCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const GlobalSearch = ({ setActiveTab }) => {
  const { role, userId } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSearchResults = async (searchQuery) => {
    if (!searchQuery || searchQuery.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5100/api/search?q=${encodeURIComponent(searchQuery)}`, {
        headers: {
          'x-user-role': role,
          'x-user-id': userId.toString()
        }
      });
      if (response.ok) {
        const data = await response.json();
        setResults(data);
      }
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setIsOpen(true);
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    if (val.length >= 2) {
      setLoading(true);
      debounceRef.current = setTimeout(() => {
        fetchSearchResults(val);
      }, 300);
    } else {
      setResults([]);
      setLoading(false);
    }
  };

  const handleResultClick = (module) => {
    setActiveTab(module);
    setIsOpen(false);
    setQuery('');
  };

  const getIcon = (type) => {
    switch(type) {
      case 'Owner': return <User size={14} className="text-primary" />;
      case 'Vehicle': return <Car size={14} className="text-secondary" />;
      case 'Insurance': return <ShieldCheck size={14} className="text-success" />;
      case 'License': return <BadgeCheck size={14} className="text-warning" />;
      default: return <FileText size={14} className="text-text-muted" />;
    }
  };

  return (
    <div ref={wrapperRef} className="relative flex-1 max-w-md mx-4 hidden md:block">
      <div className="relative group">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light group-focus-within:text-primary transition-colors" />
        <input 
          type="text" 
          placeholder="Global Search (Name, Vehicle, Chassis, Policy...)" 
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          className="bg-background border border-border rounded-lg pl-9 pr-4 py-1.5 text-sm w-full focus:ring-1 focus:ring-primary/30 focus:border-primary outline-none transition-all placeholder:text-text-light" 
        />
        {loading && (
          <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light animate-spin" />
        )}
      </div>

      {isOpen && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-lg shadow-lg overflow-hidden z-50">
          <div className="max-h-64 overflow-y-auto">
            {!loading && results.length === 0 ? (
              <div className="p-4 text-center text-sm text-text-muted">
                No results found for "{query}"
              </div>
            ) : (
              results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleResultClick(result.module)}
                  className="w-full text-left px-4 py-2 hover:bg-background border-b border-border/50 last:border-b-0 flex items-center gap-3 transition-colors"
                >
                  <div className="p-1.5 bg-background rounded-md border border-border">
                    {getIcon(result.type)}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="text-sm font-bold text-text-main truncate pr-2">{result.title}</span>
                      <span className="text-[10px] font-bold text-text-light uppercase tracking-wider bg-surface px-1.5 rounded">{result.type}</span>
                    </div>
                    <span className="text-xs text-text-muted truncate block">{result.subtitle}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;

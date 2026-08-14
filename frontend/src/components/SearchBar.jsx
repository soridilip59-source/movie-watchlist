import React from 'react';
import { Search, X } from 'lucide-react';
import './SearchBar.css';

const SearchBar = ({ value, onChange, onClear, placeholder = 'Search movies by title, description...' }) => {
  return (
    <div className="search-bar-container">
      <Search size={18} className="search-icon" />
      <input
        type="text"
        className="search-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button className="clear-btn" onClick={onClear} aria-label="Clear search">
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;

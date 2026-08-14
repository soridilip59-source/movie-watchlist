import React from 'react';
import { Filter } from 'lucide-react';
import './FilterBar.css';

const GENRES = [
  'All',
  'Action',
  'Adventure',
  'Animation',
  'Comedy',
  'Drama',
  'Family',
  'Fantasy',
  'Sci-Fi',
];

const FilterBar = ({ selectedGenre, onGenreChange, selectedYear, onYearChange }) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 15 }, (_, i) => currentYear - i);

  return (
    <div className="filter-bar">
      <div className="filter-group">
        <Filter size={16} className="filter-icon" />
        <span className="filter-label">Genre:</span>
        <select
          className="form-select filter-select"
          value={selectedGenre}
          onChange={(e) => onGenreChange(e.target.value)}
        >
          {GENRES.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <span className="filter-label">Year:</span>
        <select
          className="form-select filter-select"
          value={selectedYear}
          onChange={(e) => onYearChange(e.target.value)}
        >
          <option value="">All Years</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default FilterBar;

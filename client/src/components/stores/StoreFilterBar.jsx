import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  MapPin,
  SlidersHorizontal,
  X,
  Store,
  Sparkles,
  ChevronDown,
  Check,
} from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'rating_desc', label: 'Rating (High to Low)' },
  { value: 'rating_asc', label: 'Rating (Low to High)' },
  { value: 'name_asc', label: 'Name (A–Z)' },
  { value: 'created_desc', label: 'Recently Added' },
];

const StoreFilterBar = ({
  activeTab = 'all',
  onTabChange,
  ratedCount = 0,
  searchName = '',
  onSearchNameChange,
  searchAddress = '',
  onSearchAddressChange,
  sortOption = 'rating_desc',
  onSortOptionChange,
  totalResults = 0,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const nameInputRef = useRef(null);

  // Global ⌘K / Ctrl+K keyboard shortcut to focus store search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        nameInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeLabel =
    SORT_OPTIONS.find((opt) => opt.value === sortOption)?.label || 'Rating (High to Low)';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        marginBottom: '2rem',
      }}
    >
      {/* 1. Large, Friendly Two-Input Search & Filter Area */}
      <div
        className="card"
        style={{
          padding: '1.25rem 1.5rem',
          borderRadius: '16px',
          border: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-card)',
          boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1rem',
            alignItems: 'center',
          }}
        >
          {/* Input 1: Search Stores by Name */}
          <div style={{ position: 'relative' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#6366F1',
              }}
            />
            <input
              ref={nameInputRef}
              type="text"
              className="form-input"
              style={{
                paddingLeft: '2.6rem',
                paddingRight: searchName ? '2.4rem' : '3.4rem',
                height: '46px',
                borderRadius: '12px',
                fontSize: '0.925rem',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-surface-subtle)',
              }}
              placeholder="Search stores by name..."
              value={searchName}
              onChange={(e) => onSearchNameChange(e.target.value)}
            />
            {searchName ? (
              <button
                type="button"
                onClick={() => onSearchNameChange('')}
                className="btn-icon"
                style={{
                  position: 'absolute',
                  right: '0.6rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  padding: '4px',
                  color: 'var(--text-muted)',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                }}
                aria-label="Clear store name search"
              >
                <X size={15} />
              </button>
            ) : (
              <span
                style={{
                  position: 'absolute',
                  right: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '0.725rem',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  backgroundColor: 'var(--bg-card)',
                  padding: '0.15rem 0.45rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  pointerEvents: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                }}
                title="Keyboard shortcut: ⌘K or Ctrl+K"
              >
                ⌘K
              </span>
            )}
          </div>

          {/* Input 2: Filter by Address */}
          <div style={{ position: 'relative' }}>
            <MapPin
              size={18}
              style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#EC4899',
              }}
            />
            <input
              type="text"
              className="form-input"
              style={{
                paddingLeft: '2.6rem',
                paddingRight: searchAddress ? '2.4rem' : '1rem',
                height: '46px',
                borderRadius: '12px',
                fontSize: '0.925rem',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-surface-subtle)',
              }}
              placeholder="Filter by Address (street, city, zip)..."
              value={searchAddress}
              onChange={(e) => onSearchAddressChange(e.target.value)}
            />
            {searchAddress && (
              <button
                type="button"
                onClick={() => onSearchAddressChange('')}
                className="btn-icon"
                style={{
                  position: 'absolute',
                  right: '0.6rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  padding: '4px',
                  color: 'var(--text-muted)',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                }}
                aria-label="Clear address filter"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Secondary Row: Navigation Tabs, Results Count, & Sort Dropdown */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        {/* Navigation Tabs: All Stores vs Your Rated Stores */}
        <div className="consumer-tabs">
          <button
            type="button"
            className={`consumer-tab-btn ${activeTab === 'all' ? 'is-active' : ''}`}
            onClick={() => onTabChange('all')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
            }}
          >
            <Store size={16} />
            <span>All Stores</span>
          </button>

          <button
            type="button"
            className={`consumer-tab-btn ${activeTab === 'rated' ? 'is-active' : ''}`}
            onClick={() => onTabChange('rated')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
            }}
          >
            <Sparkles size={16} />
            <span>Your Rated Stores</span>
            {ratedCount > 0 && (
              <span
                style={{
                  backgroundColor: '#4F46E5',
                  color: '#ffffff',
                  fontSize: '0.725rem',
                  fontWeight: 800,
                  padding: '0.1rem 0.45rem',
                  borderRadius: '10px',
                  marginLeft: '4px',
                }}
              >
                {ratedCount}
              </span>
            )}
          </button>
        </div>

        {/* Right Side: Total Count and Sort Menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
            Showing <strong>{totalResults}</strong> {totalResults === 1 ? 'store' : 'stores'}
          </span>

          {/* Custom Sort Dropdown */}
          <div className="custom-dropdown-container" ref={dropdownRef}>
            <button
              type="button"
              className="custom-dropdown-trigger"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-expanded={dropdownOpen}
              aria-label="Sort options"
              style={{
                borderRadius: '10px',
                padding: '0.5rem 0.85rem',
                fontSize: '0.85rem',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
              }}
            >
              <SlidersHorizontal size={14} style={{ color: 'var(--text-muted)' }} />
              <span>
                Sort: <strong>{activeLabel}</strong>
              </span>
              <ChevronDown size={14} style={{ color: 'var(--text-muted)', marginLeft: '2px' }} />
            </button>

            {dropdownOpen && (
              <div className="custom-dropdown-menu">
                {SORT_OPTIONS.map((opt) => {
                  const isSelected = opt.value === sortOption;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      className={`custom-dropdown-item ${isSelected ? 'is-active' : ''}`}
                      onClick={() => {
                        onSortOptionChange(opt.value);
                        setDropdownOpen(false);
                      }}
                    >
                      <span>{opt.label}</span>
                      {isSelected && <Check size={14} color="#4F46E5" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreFilterBar;

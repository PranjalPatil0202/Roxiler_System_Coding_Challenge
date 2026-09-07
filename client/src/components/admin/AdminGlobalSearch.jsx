import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/admin.service';
import { formatRoleLabel } from '../../utils/formatters';
import { Search, Users, Store, X, ArrowRight, Loader2 } from 'lucide-react';

const AdminGlobalSearch = ({ onSelectUser }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({ users: [], stores: [] });

  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Keyboard shortcut listener: Ctrl+K / ⌘K to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search querying admin endpoints across name, email, address
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults({ users: [], stores: [] });
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [usersRes, storesRes] = await Promise.all([
          adminService.getUsers({ search: query.trim(), limit: 5 }),
          adminService.getStores({ search: query.trim(), limit: 5 }),
        ]);

        setResults({
          users: usersRes.success ? usersRes.data || [] : [],
          stores: storesRes.success ? storesRes.data || [] : [],
        });
        setIsOpen(true);
      } catch (err) {
        console.error('Admin search failed:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handleUserClick = (user) => {
    setIsOpen(false);
    setQuery('');
    if (onSelectUser) {
      onSelectUser(user.id);
    } else {
      navigate(`/admin/users?email=${encodeURIComponent(user.email)}`);
    }
  };

  const handleStoreClick = (store) => {
    setIsOpen(false);
    setQuery('');
    if (store && store.name) {
      navigate(`/admin/stores?name=${encodeURIComponent(store.name)}`);
    } else {
      navigate('/admin/stores');
    }
  };

  const hasResults = results.users.length > 0 || results.stores.length > 0;

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
      {/* Search Input Box with ⌘K Badge */}
      <div style={{ position: 'relative' }}>
        <Search
          size={16}
          style={{
            position: 'absolute',
            left: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
          }}
        />
        <input
          ref={inputRef}
          type="text"
          className="form-input elevation-flat"
          style={{
            paddingLeft: '2.25rem',
            paddingRight: query ? '2rem' : '3.25rem',
            height: '38px',
            fontSize: '0.875rem',
            backgroundColor: 'var(--bg-surface)',
          }}
          placeholder="Search users or stores..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value.trim().length >= 2) setIsOpen(true);
          }}
          onFocus={() => {
            if (query.trim().length >= 2) setIsOpen(true);
          }}
        />

        {/* ⌘K Shortcut Hint */}
        {!query && !loading && (
          <kbd
            style={{
              position: 'absolute',
              right: '0.65rem',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '0.6875rem',
              padding: '2px 6px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-muted)',
              fontFamily: 'inherit',
              pointerEvents: 'none',
              fontWeight: 600,
            }}
          >
            ⌘K
          </kbd>
        )}

        {loading ? (
          <Loader2
            size={14}
            className="spinner"
            style={{
              position: 'absolute',
              right: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
              animation: 'spin 1s linear infinite',
            }}
          />
        ) : query ? (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="btn btn-ghost btn-sm"
            style={{
              position: 'absolute',
              right: '0.4rem',
              top: '50%',
              transform: 'translateY(-50%)',
              padding: '2px',
              color: 'var(--text-muted)',
            }}
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        ) : null}
      </div>

      {/* Results Dropdown */}
      {isOpen && query.trim().length >= 2 && (
        <div
          className="elevation-floating"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-floating)',
            maxHeight: '380px',
            overflowY: 'auto',
            zIndex: 105,
            padding: '0.5rem',
            animation: 'slideUp 150ms ease-out',
          }}
        >
          {loading && !hasResults ? (
            <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
              Searching admin directory...
            </div>
          ) : !hasResults ? (
            <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
              No matching users or stores found for "{query}"
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* Users Results Group */}
              {results.users.length > 0 && (
                <div>
                  <div
                    style={{
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <Users size={12} />
                    <span>Users ({results.users.length})</span>
                  </div>
                  {results.users.map((u) => (
                    <button
                      key={u.id}
                      className="dropdown-item"
                      onClick={() => handleUserClick(u)}
                      style={{ borderRadius: 'var(--radius-sm)', padding: '0.5rem 0.6rem' }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {u.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {u.email}
                        </div>
                      </div>
                      <span className={`badge badge-${u.role}`} style={{ fontSize: '0.65rem' }}>
                        {formatRoleLabel(u.role)}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Stores Results Group */}
              {results.stores.length > 0 && (
                <div>
                  <div
                    style={{
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <Store size={12} />
                    <span>Stores ({results.stores.length})</span>
                  </div>
                  {results.stores.map((s) => (
                    <button
                      key={s.id}
                      className="dropdown-item"
                      onClick={() => handleStoreClick(s)}
                      style={{ borderRadius: 'var(--radius-sm)', padding: '0.5rem 0.6rem' }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {s.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {s.address}
                        </div>
                      </div>
                      <div className="badge badge-rating" style={{ fontSize: '0.7rem' }}>
                        ★ {s.average_rating > 0 ? Number(s.average_rating).toFixed(1) : 'New'}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminGlobalSearch;

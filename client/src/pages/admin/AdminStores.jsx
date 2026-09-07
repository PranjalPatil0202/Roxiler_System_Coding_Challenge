import React, { useState, useEffect, useCallback, useRef } from 'react';
import { adminService } from '../../services/admin.service';
import { TableSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import {
  NoStoresIllustration,
  NoSearchResultsIllustration,
} from '../../components/common/illustrations/EmptyStateIllustrations';
import Pagination from '../../components/common/Pagination';
import AddStoreModal from '../../components/admin/AddStoreModal';
import BulkActionBar from '../../components/admin/BulkActionBar';
import Modal from '../../components/common/Modal';
import StoreDetailDrawer from '../../components/stores/StoreDetailDrawer';
import { formatDate } from '../../utils/formatters';
import { exportToCSV } from '../../utils/csvExport';
import { getAuthToken } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  Store,
  Plus,
  ArrowUpDown,
  Filter,
  X,
  User,
  Mail,
  MapPin,
  Download,
  Trash2,
  Star,
  Eye,
} from 'lucide-react';

const AdminStores = () => {
  const { addToast } = useToast();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  const [filters, setFilters] = useState({
    name: '',
    email: '',
    address: '',
  });

  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');

  // Selection state
  const [selectedStoreIds, setSelectedStoreIds] = useState(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  // Active fetch tracking to prevent race conditions
  const activeFetchIdRef = useRef(0);

  // 300ms debounce on filter typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 300);
    return () => clearTimeout(timer);
  }, [filters]);

  const fetchStores = useCallback(async (page = 1) => {
    const fetchId = ++activeFetchIdRef.current;
    setLoading(true);

    try {
      const params = {
        page,
        limit: pagination.limit,
        sortBy,
        sortOrder,
        ...(debouncedFilters.name ? { name: debouncedFilters.name } : {}),
        ...(debouncedFilters.email ? { email: debouncedFilters.email } : {}),
        ...(debouncedFilters.address ? { address: debouncedFilters.address } : {}),
      };

      const res = await adminService.getStores(params);
      if (fetchId === activeFetchIdRef.current && res.success) {
        setStores(res.data || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err) {
      if (fetchId === activeFetchIdRef.current) {
        console.error('Error fetching stores:', err);
      }
    } finally {
      if (fetchId === activeFetchIdRef.current) {
        setLoading(false);
      }
    }
  }, [debouncedFilters, sortBy, sortOrder, pagination.limit]);

  useEffect(() => {
    fetchStores(1);
    setSelectedStoreIds(new Set());
  }, [debouncedFilters, sortBy, sortOrder]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'));
    } else {
      setSortBy(field);
      setSortOrder('ASC');
    }
  };

  const handleFilterChange = (field, val) => {
    setFilters((prev) => ({ ...prev, [field]: val }));
  };

  const clearFilters = () => {
    const cleared = { name: '', email: '', address: '' };
    setFilters(cleared);
    setDebouncedFilters(cleared);
  };

  // Row selection
  const handleSelectAll = () => {
    if (selectedStoreIds.size === stores.length) {
      setSelectedStoreIds(new Set());
    } else {
      setSelectedStoreIds(new Set(stores.map((s) => s.id)));
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedStoreIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // CSV Export respecting active filters
  const handleExportCSV = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        addToast('Authentication required to export data. Please log in again.', 'error');
        return;
      }
      const params = {
        ...(debouncedFilters.name ? { name: debouncedFilters.name } : {}),
        ...(debouncedFilters.email ? { email: debouncedFilters.email } : {}),
        ...(debouncedFilters.address ? { address: debouncedFilters.address } : {}),
        sortBy,
        sortOrder,
      };
      const result = await adminService.exportStoresCSV(token, params);
      addToast(`Stores catalog (${result.filename}) exported successfully`, 'success');
    } catch (err) {
      console.error('Export stores CSV failed:', err);
      addToast(err.message || 'Failed to export stores CSV', 'error');
    }
  };

  // Bulk Delete Execution calling backend API
  const handleBulkDelete = () => {
    if (selectedStoreIds.size === 0) return;
    setShowBulkDeleteModal(true);
  };

  const executeBulkDelete = async () => {
    const storeIds = Array.from(selectedStoreIds);
    if (storeIds.length === 0) return;

    try {
      const res = await adminService.bulkDeleteStores(storeIds);
      if (res.success) {
        addToast(res.message || `Successfully deleted ${storeIds.length} store(s)`, 'success');
        setSelectedStoreIds(new Set());
        setShowBulkDeleteModal(false);
        fetchStores(pagination.page);
      }
    } catch (err) {
      console.error('Bulk delete stores failed:', err);
      addToast(err.response?.data?.message || 'Failed to delete selected stores', 'error');
    }
  };

  const hasActiveFilters = Boolean(filters.name || filters.email || filters.address);
  const isAllSelected = stores.length > 0 && selectedStoreIds.size === stores.length;

  return (
    <div className="admin-stores-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Stores Directory & Analytics</h1>
          <p className="page-subtitle">
            Manage merchant stores, inspect rating score distribution, and export store catalogs.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary elevation-flat" onClick={handleExportCSV} title="Export CSV file">
            <Download size={15} />
            <span>Export CSV</span>
          </button>
          <button className="btn btn-primary elevation-flat" onClick={() => setShowAddModal(true)}>
            <Plus size={16} />
            <span>Register Store</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card elevation-flat" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.9rem' }}>
            <Filter size={16} color="var(--accent)" />
            <span>Search & Filter Stores</span>
          </div>
          {hasActiveFilters && (
            <button className="btn btn-ghost btn-sm" onClick={clearFilters} style={{ color: 'var(--danger)' }}>
              <X size={14} />
              <span>Clear Filters</span>
            </button>
          )}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '0.875rem',
          }}
        >
          <input
            type="text"
            className="form-input"
            placeholder="Filter by Store Name..."
            value={filters.name}
            onChange={(e) => handleFilterChange('name', e.target.value)}
          />
          <input
            type="text"
            className="form-input"
            placeholder="Filter by Store Email..."
            value={filters.email}
            onChange={(e) => handleFilterChange('email', e.target.value)}
          />
          <input
            type="text"
            className="form-input"
            placeholder="Filter by Address..."
            value={filters.address}
            onChange={(e) => handleFilterChange('address', e.target.value)}
          />
        </div>
      </div>

      {/* Dense Stores Table */}
      {loading ? (
        <TableSkeleton rows={6} columns={7} />
      ) : stores.length === 0 ? (
        <EmptyState
          illustration={hasActiveFilters ? NoSearchResultsIllustration : NoStoresIllustration}
          title={hasActiveFilters ? "No matching stores found" : "No stores registered yet"}
          description="Try changing your search filters or register a new store to the platform."
          action={
            hasActiveFilters ? (
              <button className="btn btn-secondary btn-sm" onClick={clearFilters}>
                Clear Filters
              </button>
            ) : null
          }
        />
      ) : (
        <div className="table-container elevation-raised">
          <table className="custom-table">
            <thead>
              <tr>
                {/* Select All Checkbox */}
                <th style={{ width: '44px', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                    aria-label="Select all store rows"
                  />
                </th>
                <th className="sortable" onClick={() => handleSort('name')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span>Store</span>
                    <ArrowUpDown size={13} />
                  </div>
                </th>
                <th className="sortable" onClick={() => handleSort('email')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span>Email</span>
                    <ArrowUpDown size={13} />
                  </div>
                </th>
                <th className="sortable" onClick={() => handleSort('address')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span>Address</span>
                    <ArrowUpDown size={13} />
                  </div>
                </th>
                <th>Assigned Owner</th>
                <th className="sortable num-col" onClick={() => handleSort('rating')}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
                    <span>Community Rating</span>
                    <ArrowUpDown size={13} />
                  </div>
                </th>
                <th className="sortable num-col" onClick={() => handleSort('created_at')}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
                    <span>Registered</span>
                    <ArrowUpDown size={13} />
                  </div>
                </th>
                <th className="num-col" style={{ width: '125px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stores.map((st) => {
                const isSelected = selectedStoreIds.has(st.id);
                return (
                  <tr
                    key={st.id}
                    style={{
                      backgroundColor: isSelected ? 'var(--accent-subtle)' : undefined,
                    }}
                  >
                    {/* Row Checkbox */}
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(st.id)}
                        style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                        aria-label={`Select store ${st.name}`}
                      />
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          className="table-avatar"
                          style={{
                            backgroundColor: 'var(--owner-accent-subtle)',
                            color: 'var(--owner-accent)',
                            border: '1px solid var(--owner-border)',
                          }}
                        >
                          <Store size={16} />
                        </div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {st.name}
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Mail size={13} style={{ color: 'var(--text-muted)' }} />
                        <span>{st.email}</span>
                      </div>
                    </td>
                    <td style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <MapPin size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                        <span>{st.address}</span>
                      </div>
                    </td>
                    <td>
                      {st.owner ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem' }}>
                          <User size={13} color="var(--owner-accent)" />
                          <span style={{ fontWeight: 500 }}>{st.owner.name.split(' ')[0]}</span>
                        </div>
                      ) : (
                        <span className="badge" style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-muted)' }}>
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="num-col">
                      {/* Compact Rating Badge: ★ 4.2 (128) */}
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.25rem 0.5rem',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--bg-surface)',
                          border: '1px solid var(--border-color)',
                          fontSize: '0.8125rem',
                        }}
                      >
                        <Star size={13} fill="var(--star-filled)" color="var(--star-filled)" />
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                          {st.average_rating > 0 ? Number(st.average_rating).toFixed(1) : 'New'}
                        </span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                          ({st.rating_count || 0})
                        </span>
                      </div>
                    </td>
                    <td className="num-col" style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                      {formatDate(st.created_at)}
                    </td>
                    <td className="num-col">
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setSelectedStore(st)}
                        title="View Store Details & Rating Distribution"
                        style={{ padding: '0.35rem 0.65rem' }}
                      >
                        <Eye size={13} />
                        <span>View Details</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Styled Pagination Controls */}
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages || 1}
            totalItems={pagination.total}
            itemCount={stores.length}
            itemLabel="stores"
            onPageChange={(newPage) => fetchStores(newPage)}
          />
        </div>
      )}

      {/* Floating Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selectedStoreIds.size}
        onClearSelection={() => setSelectedStoreIds(new Set())}
      >
        <button
          className="btn btn-danger btn-sm"
          onClick={handleBulkDelete}
        >
          <Trash2 size={15} />
          <span>Delete Selected Stores</span>
        </button>
      </BulkActionBar>

      {/* Add Store Modal */}
      {showAddModal && (
        <AddStoreModal
          onClose={() => setShowAddModal(false)}
          onStoreCreated={() => fetchStores(pagination.page)}
          onStoreDeleted={() => fetchStores(pagination.page)}
        />
      )}

      {/* Slide-over Store Detail Drawer */}
      {selectedStore && (
        <StoreDetailDrawer
          store={selectedStore}
          isOpen={Boolean(selectedStore)}
          onClose={() => setSelectedStore(null)}
          onRatingUpdated={() => fetchStores(pagination.page)}
        />
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteModal && (
        <Modal
          title="Confirm Permanent Store Deletion"
          isOpen={showBulkDeleteModal}
          onClose={() => setShowBulkDeleteModal(false)}
          maxWidth="520px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(239, 68, 68, 0.12)',
                  color: '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Trash2 size={24} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Permanently delete {selectedStoreIds.size} store{selectedStoreIds.size === 1 ? '' : 's'}?
                </h4>
                <p style={{ marginTop: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5 }}>
                  This action cannot be undone. All associated customer reviews and ratings will be permanently wiped from the database.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button className="btn btn-secondary" onClick={() => setShowBulkDeleteModal(false)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={executeBulkDelete}>
                Delete {selectedStoreIds.size} Store{selectedStoreIds.size === 1 ? '' : 's'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminStores;

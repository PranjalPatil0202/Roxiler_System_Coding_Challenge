import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { adminService } from '../../services/admin.service';
import { TableSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import { NoSearchResultsIllustration } from '../../components/common/illustrations/EmptyStateIllustrations';
import Pagination from '../../components/common/Pagination';
import AddUserDrawer from '../../components/admin/AddUserDrawer';
import UserDetailDrawer from '../../components/admin/UserDetailDrawer';
import BulkActionBar from '../../components/admin/BulkActionBar';
import BulkRoleChangeModal from '../../components/admin/BulkRoleChangeModal';
import Modal from '../../components/common/Modal';
import { formatRoleLabel, formatDate, getInitials } from '../../utils/formatters';
import { exportToCSV } from '../../utils/csvExport';
import { getAuthToken } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  Users,
  UserPlus,
  ArrowUpDown,
  Eye,
  Filter,
  X,
  Mail,
  MapPin,
  Download,
  ShieldCheck,
  Trash2,
  CheckSquare,
  Square,
  Search,
  Star,
  Settings,
} from 'lucide-react';

const AdminUsers = () => {
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [density, setDensity] = useState('compact'); // 'compact' | 'comfortable'

  // Immediate inputs state for live form typing
  const [filters, setFilters] = useState({
    name: searchParams.get('name') || '',
    email: searchParams.get('email') || '',
    address: searchParams.get('address') || '',
    role: searchParams.get('role') || '',
  });

  // Debounced filters to trigger network requests without thread hangs
  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');

  // Selection & Bulk state
  const [selectedUserIds, setSelectedUserIds] = useState(new Set());
  const [showBulkRoleModal, setShowBulkRoleModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  // Modals & Drawer state
  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  // Active fetch tracking to prevent race conditions
  const activeFetchIdRef = useRef(0);

  // 300ms Debounce on filter typing + URL searchParams sync
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);

      const currentName = searchParams.get('name') || '';
      const currentEmail = searchParams.get('email') || '';
      const currentAddress = searchParams.get('address') || '';
      const currentRole = searchParams.get('role') || '';

      if (
        filters.name !== currentName ||
        filters.email !== currentEmail ||
        filters.address !== currentAddress ||
        filters.role !== currentRole
      ) {
        const newParams = {};
        if (filters.name) newParams.name = filters.name;
        if (filters.email) newParams.email = filters.email;
        if (filters.address) newParams.address = filters.address;
        if (filters.role) newParams.role = filters.role;
        setSearchParams(newParams, { replace: true });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [filters, searchParams, setSearchParams]);

  const fetchUsers = useCallback(async (page = 1) => {
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
        ...(debouncedFilters.role ? { role: debouncedFilters.role } : {}),
      };

      const res = await adminService.getUsers(params);
      // Only process if this is still the freshest fetch request
      if (fetchId === activeFetchIdRef.current && res.success) {
        setUsers(res.data || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err) {
      if (fetchId === activeFetchIdRef.current) {
        console.error('Error fetching users:', err);
      }
    } finally {
      if (fetchId === activeFetchIdRef.current) {
        setLoading(false);
      }
    }
  }, [debouncedFilters, sortBy, sortOrder, pagination.limit]);

  // Refetch when debounced filters or sorting change
  useEffect(() => {
    fetchUsers(1);
    setSelectedUserIds(new Set());
  }, [debouncedFilters, sortBy, sortOrder]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'));
    } else {
      setSortBy(field);
      setSortOrder('ASC');
    }
  };

  // Immediate filter change updates input state
  const handleFilterChange = (field, val) => {
    setFilters((prev) => ({ ...prev, [field]: val }));
  };

  const clearFilters = () => {
    const cleared = { name: '', email: '', address: '', role: '' };
    setFilters(cleared);
    setDebouncedFilters(cleared);
    setSearchParams({}, { replace: true });
  };

  // Row selection handlers
  const handleToggleSelectAll = () => {
    if (selectedUserIds.size === users.length) {
      setSelectedUserIds(new Set());
    } else {
      setSelectedUserIds(new Set(users.map((u) => u.id)));
    }
  };

  const handleToggleSelect = (userId) => {
    setSelectedUserIds((prev) => {
      const updated = new Set(prev);
      if (updated.has(userId)) {
        updated.delete(userId);
      } else {
        updated.add(userId);
      }
      return updated;
    });
  };

  // Export to CSV handler respecting active filters
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
        ...(debouncedFilters.role ? { role: debouncedFilters.role } : {}),
        sortBy,
        sortOrder,
      };
      const result = await adminService.exportUsersCSV(token, params);
      addToast(`Users directory (${result.filename}) exported successfully`, 'success');
    } catch (err) {
      console.error('Export users CSV failed:', err);
      addToast(err.message || 'Failed to export users CSV', 'error');
    }
  };

  // Bulk Role Change Execution calling backend API
  const handleBulkRoleChange = async (targetRole, affectedUsers) => {
    const userIds = affectedUsers.map((u) => u.id);
    if (userIds.length === 0) return;

    try {
      const res = await adminService.bulkUpdateUserRole(userIds, targetRole);
      if (res.success) {
        addToast(
          res.message || `Successfully updated ${userIds.length} user role(s) to ${formatRoleLabel(targetRole)}`,
          'success'
        );
        setSelectedUserIds(new Set());
        setShowBulkRoleModal(false);
        fetchUsers(pagination.page);
      }
    } catch (err) {
      console.error('Bulk role change failed:', err);
      addToast(err.response?.data?.message || 'Failed to update user roles', 'error');
    }
  };

  // Bulk Delete Execution calling backend API
  const handleBulkDelete = () => {
    if (selectedUserIds.size === 0) return;
    setShowBulkDeleteModal(true);
  };

  const executeBulkDelete = async () => {
    const userIds = Array.from(selectedUserIds);
    if (userIds.length === 0) return;

    try {
      const res = await adminService.bulkDeleteUsers(userIds);
      if (res.success) {
        addToast(res.message || `Successfully deleted ${userIds.length} user account(s)`, 'success');
        setSelectedUserIds(new Set());
        setShowBulkDeleteModal(false);
        fetchUsers(pagination.page);
      }
    } catch (err) {
      console.error('Bulk delete failed:', err);
      addToast(err.response?.data?.message || 'Failed to delete selected users', 'error');
    }
  };

  // Bulk Export Selected Users to CSV
  const handleExportSelectedCSV = () => {
    const selectedList = users.filter((u) => selectedUserIds.has(u.id));
    if (selectedList.length === 0) return;
    exportToCSV(selectedList, [
      { key: 'id', label: 'User ID' },
      { key: 'name', label: 'Full Name' },
      { key: 'email', label: 'Email Address' },
      { key: 'role', label: 'Role', getValue: (r) => formatRoleLabel(r.role) },
      { key: 'address', label: 'Address' },
      { key: 'created_at', label: 'Joined Date', getValue: (r) => formatDate(r.created_at) },
    ], `selected-users-export-${selectedList.length}`);
    addToast(`Exported ${selectedList.length} selected user record(s) to CSV`, 'success');
  };

  const selectedUsersList = users.filter((u) => selectedUserIds.has(u.id));
  const hasActiveFilters = Boolean(filters.name || filters.email || filters.address || filters.role);
  const isAllSelected = users.length > 0 && selectedUserIds.size === users.length;

  return (
    <div className="admin-users-page page-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Users Directory & Governance</h1>
          <p className="page-subtitle">
            Inspect platform member accounts, perform bulk role assignments, and export user records.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary elevation-flat" onClick={handleExportCSV} title="Export CSV file">
            <Download size={15} />
            <span>Export CSV</span>
          </button>
          <button className="btn btn-primary elevation-flat" onClick={() => setShowAddDrawer(true)}>
            <UserPlus size={16} />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar Card */}
      <div className="card elevation-flat" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            <Filter size={15} />
            <span>Search & Filter Directory</span>
          </div>
          {hasActiveFilters && (
            <button className="btn btn-ghost btn-sm" onClick={clearFilters} style={{ color: 'var(--accent)', gap: '0.3rem' }}>
              <X size={14} />
              <span>Clear Filters</span>
            </button>
          )}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '0.875rem',
          }}
        >
          <input
            type="text"
            className="form-input"
            placeholder="Filter by Name..."
            value={filters.name}
            onChange={(e) => handleFilterChange('name', e.target.value)}
          />

          <input
            type="text"
            className="form-input"
            placeholder="Filter by Email..."
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

          <select
            className="form-select"
            value={filters.role}
            onChange={(e) => handleFilterChange('role', e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="normal_user">Normal User</option>
            <option value="store_owner">Store Owner</option>
          </select>
        </div>
      </div>

      {/* Dense Users Table with Multi-Select */}
      {loading ? (
        <TableSkeleton rows={6} columns={6} />
      ) : users.length === 0 ? (
        <EmptyState
          illustration={NoSearchResultsIllustration}
          title="No users match your filter criteria"
          description="Try modifying search keywords or register a new user."
          action={
            hasActiveFilters ? (
              <button className="btn btn-secondary btn-sm" onClick={clearFilters}>
                Clear Filters
              </button>
            ) : null
          }
        />
      ) : (
        <div className="card elevation-raised" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Table Header Bar with Data Density Toggle */}
          <div
            style={{
              padding: '0.75rem 1.25rem',
              backgroundColor: 'var(--bg-surface-subtle)',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Showing <strong>{users.length}</strong> of {pagination.total} registered users
            </span>

            {/* Density Toggle Button */}
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setDensity(density === 'compact' ? 'comfortable' : 'compact')}
              title={`Switch table density (Current: ${density})`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontSize: '0.8125rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '0.35rem 0.75rem',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
              }}
            >
              <Settings size={14} style={{ color: '#4F46E5' }} />
              <span>Density: <strong style={{ color: '#4F46E5' }}>{density === 'compact' ? 'Compact' : 'Comfortable'}</strong></span>
            </button>
          </div>

          <table className={`data-table density-${density}`}>
            <thead>
              <tr>
                {/* Select All Checkbox */}
                <th style={{ width: '40px', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleToggleSelectAll}
                    style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                    aria-label="Select all rows"
                  />
                </th>
                <th className="sortable" onClick={() => handleSort('name')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span>User</span>
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
                <th className="sortable" onClick={() => handleSort('role')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span>Role</span>
                    <ArrowUpDown size={13} />
                  </div>
                </th>
                <th className="sortable num-col" onClick={() => handleSort('created_at')}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
                    <span>Joined</span>
                    <ArrowUpDown size={13} />
                  </div>
                </th>
                <th className="num-col" style={{ width: '125px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isSelected = selectedUserIds.has(u.id);
                return (
                  <tr
                    key={u.id}
                    style={{
                      backgroundColor: isSelected ? 'var(--accent-subtle)' : undefined,
                    }}
                  >
                    {/* Row Selection Checkbox */}
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(u.id)}
                        style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                        aria-label={`Select user ${u.name}`}
                      />
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className={`table-avatar avatar-${u.role}`}>
                          {getInitials(u.name)}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                              {u.name}
                            </span>
                            {u.role === 'store_owner' && (
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.2rem',
                                  fontSize: '0.7rem',
                                  fontWeight: 700,
                                  color: 'var(--star-filled)',
                                  backgroundColor: 'var(--warning-bg)',
                                  padding: '1px 6px',
                                  borderRadius: 'var(--radius-full)',
                                  border: '1px solid rgba(245, 158, 11, 0.25)',
                                }}
                                title={u.storeRating ? `Store Average Rating: ${u.storeRating} ★` : 'Store Owner - No store ratings yet'}
                              >
                                ★ {u.storeRating !== null && u.storeRating !== undefined ? Number(u.storeRating).toFixed(1) : 'New'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Mail size={13} style={{ color: 'var(--text-muted)' }} />
                        <span>{u.email}</span>
                      </div>
                    </td>
                    <td
                      style={{ maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      title={u.address || 'No address provided'}
                    >
                      {u.address ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <MapPin size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.address}</span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge badge-${u.role}`}>
                        {formatRoleLabel(u.role)}
                      </span>
                    </td>
                    <td className="num-col" style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                      {u.created_at ? formatDate(u.created_at) : '—'}
                    </td>
                    <td className="num-col">
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setSelectedUserId(u.id)}
                        title="View User Details & History"
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
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            itemCount={users.length}
            itemLabel="users"
            onPageChange={(p) => fetchUsers(p)}
          />
        </div>
      )}

      {/* Sticky Bottom Bulk Action Bar: [Change Role] [Delete] [Export to CSV] */}
      <BulkActionBar
        selectedCount={selectedUserIds.size}
        onClearSelection={() => setSelectedUserIds(new Set())}
      >
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => setShowBulkRoleModal(true)}
          style={{ borderRadius: '8px', fontWeight: 700 }}
        >
          <ShieldCheck size={14} color="#4F46E5" />
          <span>Change Role</span>
        </button>

        <button
          className="btn btn-danger btn-sm"
          onClick={handleBulkDelete}
          style={{ borderRadius: '8px', fontWeight: 700 }}
        >
          <Trash2 size={14} />
          <span>Delete</span>
        </button>

        <button
          className="btn btn-secondary btn-sm"
          onClick={handleExportSelectedCSV}
          style={{ borderRadius: '8px', fontWeight: 700, color: '#4F46E5', borderColor: 'rgba(99, 102, 241, 0.35)' }}
        >
          <Download size={14} />
          <span>Export to CSV</span>
        </button>
      </BulkActionBar>

      {/* Slide-over Add User Drawer */}
      <AddUserDrawer
        isOpen={showAddDrawer}
        onClose={() => setShowAddDrawer(false)}
        onUserCreated={() => fetchUsers(pagination.page)}
        onUserDeleted={() => fetchUsers(pagination.page)}
      />

      {/* Slide-over User Detail Drawer */}
      {selectedUserId && (
        <UserDetailDrawer
          userId={selectedUserId}
          isOpen={Boolean(selectedUserId)}
          onClose={() => setSelectedUserId(null)}
        />
      )}

      {/* Bulk Role Change Modal */}
      {showBulkRoleModal && (
        <BulkRoleChangeModal
          selectedUsers={selectedUsersList}
          onClose={() => setShowBulkRoleModal(false)}
          onConfirm={handleBulkRoleChange}
        />
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteModal && (
        <Modal
          title="Confirm Permanent User Deletion"
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
                  Permanently delete {selectedUserIds.size} user account{selectedUserIds.size === 1 ? '' : 's'}?
                </h4>
                <p style={{ marginTop: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5 }}>
                  This action cannot be undone. All data and permissions linked to these accounts will be permanently wiped from the database.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button className="btn btn-secondary" onClick={() => setShowBulkDeleteModal(false)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={executeBulkDelete}>
                Delete {selectedUserIds.size} Account{selectedUserIds.size === 1 ? '' : 's'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminUsers;

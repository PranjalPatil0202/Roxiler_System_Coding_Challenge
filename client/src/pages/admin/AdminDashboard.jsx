import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/admin.service';
import { StatsSkeleton } from '../../components/common/Skeleton';
import AddUserDrawer from '../../components/admin/AddUserDrawer';
import AddStoreModal from '../../components/admin/AddStoreModal';
import UserDetailDrawer from '../../components/admin/UserDetailDrawer';
import UserGrowthChart from '../../components/admin/charts/UserGrowthChart';
import RatingsBarChart from '../../components/admin/charts/RatingsBarChart';
import RoleDonutChart from '../../components/admin/charts/RoleDonutChart';
import ActivityFeed from '../../components/dashboard/ActivityFeed';
import StoresGovernanceWidget from '../../components/admin/StoresGovernanceWidget';
import {
  generateRecentActivityFeed,
  calculateTrend,
  groupTimelineData,
} from '../../utils/activityHelper';
import {
  Users,
  Store,
  Star,
  UserPlus,
  Plus,
  ArrowRight,
  TrendingUp,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Download,
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddStore, setShowAddStore] = useState(false);
  const [selectedUserForDetail, setSelectedUserForDetail] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, usersRes, storesRes, ratingsRes] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getUsers({ limit: 50 }),
        adminService.getStores({ limit: 50 }),
        adminService.getRatings({ limit: 100 }),
      ]);

      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      } else {
        setError('Failed to load dashboard metrics');
      }

      if (usersRes.success) {
        setUsers(usersRes.data || []);
      }

      if (storesRes.success) {
        setStores(storesRes.data || []);
      }

      if (ratingsRes && ratingsRes.success) {
        setRatings(ratingsRes.data || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching platform statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Compute True Trends
  const userTrend = calculateTrend(users);
  const storeTrend = calculateTrend(stores);
  const ratingTrend = calculateTrend(ratings);

  // Group timeline data for Recharts
  const timelineData = groupTimelineData(users, stores, ratings);

  // Generate recent activity audit trail
  const activities = generateRecentActivityFeed(users, stores, ratings, 10);

  return (
    <div className="admin-dashboard-page page-fade-in">
      {/* Page Header with Quick Actions */}
      <div className="page-header" style={{ marginBottom: '1.75rem' }}>
        <div>
          <h1 className="page-title">Admin Analytics & Governance Dashboard</h1>
          <p className="page-subtitle">
            Platform-wide telemetry, user growth trends, store performance governance, and audit logs.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary elevation-flat" onClick={() => setShowAddUser(true)}>
            <UserPlus size={16} />
            <span>Add User</span>
          </button>
          <button className="btn btn-primary elevation-flat" onClick={() => setShowAddStore(true)}>
            <Plus size={16} />
            <span>Register Store</span>
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: '1rem',
            backgroundColor: 'var(--danger-bg)',
            color: 'var(--danger)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
          }}
        >
          {error}
        </div>
      )}

      {/* Bento Grid: Row 1 - KPI Stats Cards with Mini Sparklines */}
      {loading ? (
        <StatsSkeleton />
      ) : stats ? (
        <>
          <div className="stats-grid" style={{ marginBottom: '1.75rem' }}>
            {/* Total Users Card */}
            <div className="stat-card elevation-raised">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div
                  className="stat-icon"
                  style={{
                    backgroundColor: 'var(--admin-accent-subtle)',
                    color: 'var(--admin-accent)',
                  }}
                >
                  <Users size={26} />
                </div>
                {userTrend && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.2rem',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: userTrend.isPositive ? 'var(--success)' : 'var(--danger)',
                      backgroundColor: userTrend.isPositive ? 'var(--success-bg)' : 'var(--danger-bg)',
                      padding: '0.25rem 0.5rem',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    {userTrend.isPositive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                    <span>{userTrend.label}</span>
                  </div>
                )}
              </div>
              <div className="stat-info" style={{ marginTop: '0.75rem' }}>
                <span className="stat-label">Total Platform Users</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '0.25rem' }}>
                  <span className="stat-value">{stats.totalUsers}</span>
                  {/* Mini Sparkline */}
                  <svg width="68" height="26" viewBox="0 0 68 26" fill="none">
                    <path d="M2 22 L14 16 L26 19 L38 10 L50 13 L66 4" stroke="var(--admin-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                  {stats.userCountsByRole?.normal_user || 0} reviewers • {stats.userCountsByRole?.store_owner || 0} merchants
                </span>
              </div>
            </div>

            {/* Total Stores Card */}
            <div className="stat-card elevation-raised">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div
                  className="stat-icon"
                  style={{
                    backgroundColor: 'var(--owner-accent-subtle)',
                    color: 'var(--owner-accent)',
                  }}
                >
                  <Store size={26} />
                </div>
                {storeTrend && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.2rem',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: storeTrend.isPositive ? 'var(--success)' : 'var(--danger)',
                      backgroundColor: storeTrend.isPositive ? 'var(--success-bg)' : 'var(--danger-bg)',
                      padding: '0.25rem 0.5rem',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    {storeTrend.isPositive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                    <span>{storeTrend.label}</span>
                  </div>
                )}
              </div>
              <div className="stat-info" style={{ marginTop: '0.75rem' }}>
                <span className="stat-label">Registered Stores</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '0.25rem' }}>
                  <span className="stat-value">{stats.totalStores}</span>
                  {/* Mini Sparkline */}
                  <svg width="68" height="26" viewBox="0 0 68 26" fill="none">
                    <path d="M2 20 L14 18 L26 12 L38 15 L50 7 L66 4" stroke="var(--owner-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                  Active merchant businesses
                </span>
              </div>
            </div>

            {/* Total Ratings Card */}
            <div className="stat-card elevation-raised">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div
                  className="stat-icon"
                  style={{
                    backgroundColor: 'var(--user-accent-subtle)',
                    color: 'var(--user-accent)',
                  }}
                >
                  <Star size={26} />
                </div>
                {ratingTrend && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.2rem',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: ratingTrend.isPositive ? 'var(--success)' : 'var(--danger)',
                      backgroundColor: ratingTrend.isPositive ? 'var(--success-bg)' : 'var(--danger-bg)',
                      padding: '0.25rem 0.5rem',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    {ratingTrend.isPositive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                    <span>{ratingTrend.label}</span>
                  </div>
                )}
              </div>
              <div className="stat-info" style={{ marginTop: '0.75rem' }}>
                <span className="stat-label">Total Verified Reviews</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '0.25rem' }}>
                  <span className="stat-value">{stats.totalRatings}</span>
                  {/* Mini Sparkline */}
                  <svg width="68" height="26" viewBox="0 0 68 26" fill="none">
                    <path d="M2 22 L14 18 L26 13 L38 15 L50 8 L66 3" stroke="var(--user-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                  Customer feedback ratings
                </span>
              </div>
            </div>
          </div>

          {/* Bento Grid: Row 2 - Visualizations (User Growth, Review Activity, Role Distribution) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.5rem',
              marginBottom: '1.75rem',
            }}
          >
            {/* User Growth Line/Area Chart */}
            <UserGrowthChart data={timelineData} />

            {/* Review Activity Bar Chart (with empty state illustration if volume is zero) */}
            <RatingsBarChart data={timelineData} />

            {/* Role Distribution Donut Chart */}
            <RoleDonutChart roleCounts={stats.userCountsByRole} />
          </div>

          {/* Bento Grid: Row 3 - Governance Oversight & Recent Platform Activity Feed */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {/* Stores Governance Widget */}
            <StoresGovernanceWidget stores={stores} />

            {/* Recent Activity Audit Feed with Interactive Slide-Over Profile Inspection */}
            <ActivityFeed
              activities={activities}
              onSelectUser={(userId) => setSelectedUserForDetail(userId)}
            />
          </div>
        </>
      ) : null}

      {/* Add User Slide-over Drawer */}
      <AddUserDrawer
        isOpen={showAddUser}
        onClose={() => setShowAddUser(false)}
        onUserCreated={() => fetchDashboardData()}
        onUserDeleted={() => fetchDashboardData()}
      />

      {/* Add Store Modal */}
      {showAddStore && (
        <AddStoreModal
          onClose={() => setShowAddStore(false)}
          onStoreCreated={() => fetchDashboardData()}
          onStoreDeleted={() => fetchDashboardData()}
        />
      )}

      {/* User Profile Inspection Slide-Over Panel */}
      {selectedUserForDetail && (
        <UserDetailDrawer
          userId={selectedUserForDetail}
          isOpen={Boolean(selectedUserForDetail)}
          onClose={() => setSelectedUserForDetail(null)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;

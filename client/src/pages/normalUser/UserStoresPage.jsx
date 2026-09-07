import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { storeService } from '../../services/store.service';
import StoreCard from '../../components/stores/StoreCard';
import StoreFilterBar from '../../components/stores/StoreFilterBar';
import StoreDetailDrawer from '../../components/stores/StoreDetailDrawer';
import RatingModal from '../../components/rating/RatingModal';
import Pagination from '../../components/common/Pagination';
import { CardSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import {
  NoStoresIllustration,
  NoRatingsIllustration,
  NoSearchResultsIllustration,
} from '../../components/common/illustrations/EmptyStateIllustrations';
import { Store, Sparkles, Search, MapPin } from 'lucide-react';

const PAGE_SIZE = 12;

const UserStoresPage = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  // Two dedicated search inputs: Name and Address
  const [searchName, setSearchName] = useState('');
  const [searchAddress, setSearchAddress] = useState('');

  const [sortOption, setSortOption] = useState('rating_desc');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'rated'
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Selected store for slide-over detail drawer
  const [selectedStore, setSelectedStore] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Rating Modal state
  const [ratingModalStore, setRatingModalStore] = useState(null);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);

  // Parse sortOption into backend params
  const getSortParams = (option) => {
    switch (option) {
      case 'rating_asc':
        return { sortBy: 'rating', sortOrder: 'ASC' };
      case 'name_asc':
        return { sortBy: 'name', sortOrder: 'ASC' };
      case 'created_desc':
        return { sortBy: 'created_at', sortOrder: 'DESC' };
      case 'rating_desc':
      default:
        return { sortBy: 'rating', sortOrder: 'DESC' };
    }
  };

  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const { sortBy, sortOrder } = getSortParams(sortOption);
      const params = {
        sortBy,
        sortOrder,
        page: 1,
        limit: 100, // Fetch up to 100 for instant client-side tab switching and count
        ...(searchName.trim() ? { name: searchName.trim() } : {}),
        ...(searchAddress.trim() ? { address: searchAddress.trim() } : {}),
      };

      const res = await storeService.getStores(params);
      if (res.success && Array.isArray(res.data)) {
        setStores(res.data);
        setTotalCount(res.pagination?.total || res.data.length);
      }
    } catch (err) {
      console.error('Error fetching stores:', err);
    } finally {
      setLoading(false);
    }
  }, [searchName, searchAddress, sortOption]);

  // Debounced fetch when search inputs change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStores();
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchStores]);

  // Compute rated count across stores
  const ratedStoresCount = useMemo(() => {
    return stores.filter((s) => s.userRating !== null && s.userRating !== undefined).length;
  }, [stores]);

  // Filter stores according to active tab
  const filteredStores = useMemo(() => {
    if (activeTab === 'rated') {
      return stores.filter((s) => s.userRating !== null && s.userRating !== undefined);
    }
    return stores;
  }, [stores, activeTab]);

  // Paginated slice
  const paginatedStores = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredStores.slice(start, start + PAGE_SIZE);
  }, [filteredStores, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredStores.length / PAGE_SIZE));

  const handleRatingUpdated = (storeId, newRating) => {
    setStores((prev) =>
      prev.map((s) => {
        if (s.id === storeId) {
          const oldUserRating = s.userRating;
          let newCount = s.rating_count || 0;
          let newAvg = parseFloat(s.average_rating || 0);

          if (oldUserRating === null || oldUserRating === undefined) {
            // Brand new review
            newAvg = ((newAvg * newCount) + newRating) / (newCount + 1);
            newCount += 1;
          } else {
            // Update existing review
            if (newCount > 0) {
              newAvg = ((newAvg * newCount) - oldUserRating + newRating) / newCount;
            } else {
              newAvg = newRating;
            }
          }

          const updated = {
            ...s,
            userRating: newRating,
            average_rating: parseFloat(newAvg.toFixed(2)),
            rating_count: newCount,
          };

          if (selectedStore?.id === storeId) {
            setSelectedStore(updated);
          }
          if (ratingModalStore?.id === storeId) {
            setRatingModalStore(updated);
          }
          return updated;
        }
        return s;
      })
    );
  };

  const handleOpenRatingModal = (store, preselectedRating = null) => {
    setRatingModalStore(preselectedRating ? { ...store, preselectedRating } : store);
    setIsRatingModalOpen(true);
  };

  const handleCloseRatingModal = () => {
    setIsRatingModalOpen(false);
    setRatingModalStore(null);
  };

  const handleOpenDetail = (store) => {
    setSelectedStore(store);
    setIsDrawerOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDrawerOpen(false);
  };

  return (
    <div className="user-stores-page" style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '1.75rem' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.025em' }}>
            Store Discovery Portal
          </h1>
          <p className="page-subtitle" style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
            Explore businesses in your area, inspect verified community ratings, and submit or modify your reviews.
          </p>
        </div>
      </div>

      {/* Two-Input Search & Filter Bar */}
      <StoreFilterBar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setCurrentPage(1);
        }}
        ratedCount={ratedStoresCount}
        searchName={searchName}
        onSearchNameChange={setSearchName}
        searchAddress={searchAddress}
        onSearchAddressChange={setSearchAddress}
        sortOption={sortOption}
        onSortOptionChange={(opt) => {
          setSortOption(opt);
          setCurrentPage(1);
        }}
        totalResults={filteredStores.length}
      />

      {/* Stores Content Area */}
      {loading ? (
        <CardSkeleton count={6} />
      ) : filteredStores.length === 0 ? (
        <div style={{ padding: '2rem 1rem' }}>
          {activeTab === 'rated' ? (
            <EmptyState
              illustration={NoRatingsIllustration}
              title="You haven't rated any stores yet"
              description="Explore businesses in your community and submit your first rating. All stores you score will appear here."
              action={
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setActiveTab('all');
                    setSearchName('');
                    setSearchAddress('');
                  }}
                  style={{ backgroundColor: '#4F46E5', borderColor: '#4F46E5' }}
                >
                  <Store size={16} />
                  <span>Browse All Stores</span>
                </button>
              }
            />
          ) : (
            <EmptyState
              illustration={searchName || searchAddress ? NoSearchResultsIllustration : NoStoresIllustration}
              title={searchName || searchAddress ? 'No matching stores found' : 'No stores available yet'}
              description={
                searchName || searchAddress
                  ? `We couldn't find any stores matching your criteria. Try adjusting your search terms or clearing the filters.`
                  : 'There are no stores registered in the catalog yet.'
              }
              action={
                searchName || searchAddress ? (
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setSearchName('');
                      setSearchAddress('');
                    }}
                  >
                    Clear Filters
                  </button>
                ) : null
              }
            />
          )}
        </div>
      ) : (
        <>
          {/* Clean 3-Column Grid of Store Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {paginatedStores.map((store) => (
              <StoreCard
                key={store.id}
                store={store}
                onOpenRatingModal={handleOpenRatingModal}
                onSelectStore={handleOpenDetail}
                searchName={searchName}
                searchAddress={searchAddress}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {filteredStores.length > PAGE_SIZE && (
            <div style={{ marginTop: '2.5rem' }}>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredStores.length}
                itemCount={paginatedStores.length}
                itemLabel="stores"
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      )}

      {/* Interactive Rating Modal (Submit / Modify 1-5 Stars) */}
      <RatingModal
        store={ratingModalStore}
        isOpen={isRatingModalOpen}
        onClose={handleCloseRatingModal}
        onRatingSubmitted={handleRatingUpdated}
      />

      {/* Store Detail Slide-Over Drawer */}
      <StoreDetailDrawer
        store={selectedStore}
        isOpen={isDrawerOpen}
        onClose={handleCloseDetail}
        onRatingUpdated={handleRatingUpdated}
      />
    </div>
  );
};

export default UserStoresPage;

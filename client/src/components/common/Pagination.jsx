import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemCount = 0,
  itemLabel = 'items',
  onPageChange,
}) => {
  if (totalItems === 0) return null;

  // Generate page numbers array (e.g. 1, 2, 3, 4, 5)
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="styled-pagination">
      <div style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
        Showing <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{itemCount}</span> of{' '}
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{totalItems}</span> {itemLabel}
      </div>

      <div className="pagination-pages-group">
        <button
          className="pagination-btn"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          title="Previous Page"
          aria-label="Previous Page"
        >
          <ChevronLeft size={16} />
        </button>

        {pages.map((p) => (
          <button
            key={p}
            className={`pagination-btn ${p === currentPage ? 'is-active' : ''}`}
            onClick={() => onPageChange(p)}
          >
            {p}
          </button>
        ))}

        <button
          className="pagination-btn"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          title="Next Page"
          aria-label="Next Page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;

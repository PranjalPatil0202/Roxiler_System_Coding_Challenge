import React from 'react';
import { Link } from 'react-router-dom';
import NotFoundIllustration from '../components/common/illustrations/NotFoundIllustration';
import { Home, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div
      className="page-fade-in"
      style={{
        minHeight: '75vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '3rem 1.5rem',
      }}
    >
      {/* Friendly Vector 404 Illustration */}
      <NotFoundIllustration />

      <h2 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.6rem' }}>
        Destination Not Found
      </h2>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '460px', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
        The business storefront or page you are looking for has been moved, renamed, or does not exist in our directory.
      </p>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link to="/" className="btn btn-primary">
          <Home size={16} />
          <span>Return to Catalog</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;

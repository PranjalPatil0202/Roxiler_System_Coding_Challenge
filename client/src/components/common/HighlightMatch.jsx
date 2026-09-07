import React from 'react';

const escapeRegex = (str) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const HighlightMatch = ({ text = '', query = '', className = '', highlightStyle = {} }) => {
  if (!text) return null;
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return <span className={className}>{text}</span>;

  try {
    const escaped = escapeRegex(trimmedQuery);
    const regex = new RegExp(`(${escaped})`, 'gi');
    const parts = text.split(regex);

    return (
      <span className={className}>
        {parts.map((part, i) => {
          const isMatch = part.toLowerCase() === trimmedQuery.toLowerCase();
          return isMatch ? (
            <mark
              key={i}
              style={{
                backgroundColor: 'rgba(99, 102, 241, 0.18)',
                color: '#4338CA',
                fontWeight: 800,
                borderRadius: '3px',
                padding: '0 2px',
                ...highlightStyle,
              }}
            >
              {part}
            </mark>
          ) : (
            <React.Fragment key={i}>{part}</React.Fragment>
          );
        })}
      </span>
    );
  } catch (e) {
    return <span className={className}>{text}</span>;
  }
};

export default HighlightMatch;

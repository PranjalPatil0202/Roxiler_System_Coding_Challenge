import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="elevation-floating"
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '0.65rem 0.9rem',
          fontSize: '0.8125rem',
        }}
      >
        <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
          {label}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--user-accent)' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--user-accent)' }} />
          <span>Reviews: <strong>{payload[0].value}</strong></span>
        </div>
      </div>
    );
  }
  return null;
};

const RatingsBarChart = ({ data = [] }) => {
  const totalReviews = data.reduce((acc, curr) => acc + (curr.ratings || 0), 0);

  return (
    <div className="card elevation-raised" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
        <div>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Review Activity Volume</h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
            Customer store ratings submitted over time
          </p>
        </div>
        {totalReviews > 0 && (
          <span
            style={{
              fontSize: '0.725rem',
              fontWeight: 700,
              color: 'var(--user-accent)',
              backgroundColor: 'var(--user-accent-subtle)',
              padding: '0.2rem 0.55rem',
              borderRadius: 'var(--radius-full)',
            }}
          >
            {totalReviews} logged
          </span>
        )}
      </div>

      <div style={{ width: '100%', height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {totalReviews === 0 ? (
          <div
            style={{
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              width: '100%',
              padding: '1rem',
              backgroundColor: 'var(--bg-surface-subtle)',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--border-color)',
            }}
          >
            {/* Minimalist Chart Empty State SVG */}
            <svg width="120" height="70" viewBox="0 0 120 70" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M10 55 Q35 25, 60 45 T110 30"
                stroke="var(--user-accent)"
                strokeWidth="2"
                strokeDasharray="4 4"
                fill="none"
                opacity="0.6"
              />
              <circle cx="60" cy="45" r="4" fill="var(--user-accent)" />
              <circle cx="110" cy="30" r="4" fill="var(--star-filled)" />
              <path
                d="M20 25 C20 18 30 15 36 20 C42 16 52 20 50 28 C45 32 25 32 20 25 Z"
                fill="var(--bg-card)"
                stroke="var(--border-color)"
                strokeWidth="1.2"
              />
            </svg>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.6rem' }}>
              No review activity logged yet
            </span>
            <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)', maxWidth: '280px', marginTop: '0.2rem' }}>
              Telemetry volume will graph here as registered customers rate local stores.
            </span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="var(--text-muted)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="var(--text-muted)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="ratings"
                fill="var(--user-accent)"
                radius={[6, 6, 0, 0]}
                maxBarSize={36}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default RatingsBarChart;

import React from 'react';
import {
  AreaChart,
  Area,
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--admin-accent)' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--admin-accent)' }} />
          <span>New Users: <strong>{payload[0].value}</strong></span>
        </div>
      </div>
    );
  }
  return null;
};

const UserGrowthChart = ({ data = [] }) => {
  return (
    <div className="card elevation-raised" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>User Acquisition Trend</h4>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
          Platform member registrations over time
        </p>
      </div>

      <div style={{ width: '100%', height: 240 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="userGrowthGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--admin-accent)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="var(--admin-accent)" stopOpacity={0.0} />
              </linearGradient>
            </defs>
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
            <Area
              type="monotone"
              dataKey="users"
              stroke="var(--admin-accent)"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#userGrowthGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default UserGrowthChart;

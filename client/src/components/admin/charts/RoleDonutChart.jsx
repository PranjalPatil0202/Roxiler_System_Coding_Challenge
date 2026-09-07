import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const ROLE_COLORS = {
  admin: '#6366f1', // Indigo
  normal_user: '#10b981', // Emerald
  store_owner: '#f59e0b', // Amber
};

const ROLE_LABELS = {
  admin: 'Admin',
  normal_user: 'Customer',
  store_owner: 'Store Owner',
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: data.payload.fill }} />
          <span>{data.name}: <strong>{data.value}</strong></span>
        </div>
      </div>
    );
  }
  return null;
};

const RoleDonutChart = ({ roleCounts = { admin: 0, normal_user: 0, store_owner: 0 } }) => {
  const chartData = [
    { name: 'Admin', key: 'admin', value: roleCounts.admin || 0, fill: ROLE_COLORS.admin },
    { name: 'Normal User', key: 'normal_user', value: roleCounts.normal_user || 0, fill: ROLE_COLORS.normal_user },
    { name: 'Store Owner', key: 'store_owner', value: roleCounts.store_owner || 0, fill: ROLE_COLORS.store_owner },
  ].filter((d) => d.value > 0);

  const totalUsers = Object.values(roleCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="card elevation-raised" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ marginBottom: '0.75rem' }}>
        <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Role Distribution</h4>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
          User distribution by account privilege
        </p>
      </div>

      <div style={{ width: '100%', height: 200, position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<CustomTooltip />} />
            <Pie
              data={chartData}
              innerRadius={55}
              outerRadius={75}
              paddingAngle={4}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} stroke="var(--bg-card)" strokeWidth={2} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Total Indicator */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          <div style={{ fontSize: '1.35rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', lineHeight: 1 }}>
            {totalUsers}
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Users
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem', fontSize: '0.8125rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: ROLE_COLORS.admin }} />
          <span style={{ color: 'var(--text-secondary)' }}>Admin ({roleCounts.admin || 0})</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: ROLE_COLORS.normal_user }} />
          <span style={{ color: 'var(--text-secondary)' }}>User ({roleCounts.normal_user || 0})</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: ROLE_COLORS.store_owner }} />
          <span style={{ color: 'var(--text-secondary)' }}>Owner ({roleCounts.store_owner || 0})</span>
        </div>
      </div>
    </div>
  );
};

export default RoleDonutChart;

import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, Calendar, Award } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div
        className="elevation-floating"
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '0.65rem 0.9rem',
          fontSize: '0.8125rem',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
          {data.fullDate || label}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: data.trendColor || 'var(--owner-accent)' }}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: data.trendColor || 'var(--owner-accent)',
            }}
          />
          <span>
            Average Rating: <strong>{Number(data.rating).toFixed(2)} ★</strong>
          </span>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          {data.reviewsCount > 0
            ? `${data.reviewsCount} review${data.reviewsCount === 1 ? '' : 's'} recorded`
            : 'Continuous baseline trajectory'}
        </div>
      </div>
    );
  }
  return null;
};

const RatingTrendChart = ({ ratings = [] }) => {
  const [timeRange, setTimeRange] = useState('30d'); // '30d' | 'all'

  // Compute 30-day timeline and determine whether store got better or worse this month
  const { chartData, trendSummary } = useMemo(() => {
    if (!ratings || ratings.length === 0) {
      return {
        chartData: [],
        trendSummary: {
          status: 'steady',
          statusText: 'No rating data available yet',
          delta: 0,
          deltaFormatted: '0.0 ★',
          color: 'var(--text-muted)',
          currentAvg: 0,
        },
      };
    }

    const now = new Date();
    const sorted = [...ratings].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    // Base average from all ratings if any exist
    const overallAvg =
      sorted.length > 0
        ? sorted.reduce((acc, r) => acc + Number(r.rating), 0) / sorted.length
        : 0;

    if (timeRange === '30d') {
      // Generate 30 consecutive daily buckets
      const days = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        d.setHours(23, 59, 59, 999);
        const dayStart = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        dayStart.setHours(0, 0, 0, 0);

        const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const fullDate = d.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });

        // Reviews up to this date
        const reviewsUpToNow = sorted.filter((r) => new Date(r.created_at) <= d);
        // Reviews on this specific date
        const reviewsOnDay = sorted.filter(
          (r) => new Date(r.created_at) >= dayStart && new Date(r.created_at) <= d
        );

        let avgOnDay = overallAvg;
        if (reviewsUpToNow.length > 0) {
          avgOnDay =
            reviewsUpToNow.reduce((sum, r) => sum + Number(r.rating), 0) / reviewsUpToNow.length;
        }

        days.push({
          date: label,
          fullDate,
          rating: parseFloat(avgOnDay.toFixed(2)),
          reviewsCount: reviewsOnDay.length,
          timestamp: d.getTime(),
        });
      }

      // Did the store get better or worse this month?
      // Compare first half of 30-day window (days 0-14) vs second half (days 15-29)
      const firstHalf = days.slice(0, 15);
      const secondHalf = days.slice(15);

      const firstHalfAvg =
        firstHalf.reduce((acc, d) => acc + d.rating, 0) / firstHalf.length;
      const secondHalfAvg =
        secondHalf.reduce((acc, d) => acc + d.rating, 0) / secondHalf.length;

      const delta = parseFloat((secondHalfAvg - firstHalfAvg).toFixed(2));

      let status = 'steady';
      let statusText = 'Store rating remained steady this month';
      let deltaFormatted = `${delta >= 0 ? '+' : ''}${delta.toFixed(1)} ★`;
      let color = '#4f46e5';

      if (delta > 0.04) {
        status = 'better';
        statusText = 'Store performance got better this month';
        color = '#10b981';
      } else if (delta < -0.04) {
        status = 'worse';
        statusText = 'Store performance dropped this month';
        color = '#ef4444';
      }

      const daysWithColor = days.map((d) => ({ ...d, trendColor: color }));

      return {
        chartData: daysWithColor,
        trendSummary: {
          status,
          statusText,
          delta,
          deltaFormatted,
          color,
          currentAvg: days[days.length - 1]?.rating || overallAvg,
        },
      };
    }

    // All Time Range
    const groups = {};
    sorted.forEach((r) => {
      const date = new Date(r.created_at);
      const key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!groups[key]) {
        groups[key] = { total: 0, count: 0, fullDate: date.toLocaleDateString('en-US') };
      }
      groups[key].total += Number(r.rating);
      groups[key].count += 1;
    });

    const entries = Object.entries(groups).map(([date, data]) => ({
      date,
      fullDate: data.fullDate,
      rating: parseFloat((data.total / data.count).toFixed(2)),
      reviewsCount: data.count,
      trendColor: 'var(--owner-accent)',
    }));

    return {
      chartData: entries.length > 0 ? entries : [{ date: 'Today', rating: overallAvg, reviewsCount: 0 }],
      trendSummary: {
        status: 'steady',
        statusText: 'All-time aggregated rating trend',
        delta: 0,
        deltaFormatted: 'All-time',
        color: 'var(--owner-accent)',
        currentAvg: overallAvg,
      },
    };
  }, [ratings, timeRange]);

  const { status, statusText, deltaFormatted, color } = trendSummary;

  if (!ratings || ratings.length === 0) {
    return (
      <div
        className="card elevation-raised"
        style={{
          padding: '2.25rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          minHeight: '320px',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: 'var(--owner-accent-subtle)',
            color: 'var(--owner-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
          }}
        >
          <TrendingUp size={24} />
        </div>
        <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
          Rating Trend (Last 30 Days)
        </h4>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '340px', lineHeight: 1.5, margin: 0 }}>
          No ratings recorded yet. The 30-day performance trendline will generate automatically once customers rate your store.
        </p>
      </div>
    );
  }

  return (
    <div
      className="card elevation-raised"
      style={{
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* Header: Title + Better/Worse This Month Badge */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginBottom: '1.25rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h4 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0 }}>
              Rating Trend (Last 30 Days)
            </h4>
            {/* Did store get better or worse this month? */}
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.2rem 0.6rem',
                borderRadius: '9999px',
                backgroundColor:
                  status === 'better'
                    ? 'rgba(16, 185, 129, 0.12)'
                    : status === 'worse'
                    ? 'rgba(239, 68, 68, 0.12)'
                    : 'rgba(79, 70, 229, 0.12)',
                color: color,
                border: `1px solid ${
                  status === 'better'
                    ? 'rgba(16, 185, 129, 0.3)'
                    : status === 'worse'
                    ? 'rgba(239, 68, 68, 0.3)'
                    : 'rgba(79, 70, 229, 0.3)'
                }`,
              }}
              title={statusText}
            >
              {status === 'better' && <TrendingUp size={13} strokeWidth={2.5} />}
              {status === 'worse' && <TrendingDown size={13} strokeWidth={2.5} />}
              {status === 'steady' && <Minus size={13} strokeWidth={2.5} />}
              <span>
                {status === 'better'
                  ? `Better this month (${deltaFormatted})`
                  : status === 'worse'
                  ? `Worse this month (${deltaFormatted})`
                  : `Steady (${deltaFormatted})`}
              </span>
            </span>
          </div>
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.8125rem',
              marginTop: '0.3rem',
              marginBottom: 0,
            }}
          >
            {statusText}. Linear Area Chart showing continuous 30-day performance trajectory.
          </p>
        </div>

        {/* Range Selector */}
        <div
          style={{
            display: 'inline-flex',
            backgroundColor: 'var(--bg-surface)',
            padding: '3px',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
          }}
        >
          <button
            onClick={() => setTimeRange('30d')}
            className={`btn btn-sm ${timeRange === '30d' ? 'btn-primary' : 'btn-ghost'}`}
            style={{
              padding: '0.25rem 0.65rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              borderRadius: '6px',
            }}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setTimeRange('all')}
            className={`btn btn-sm ${timeRange === 'all' ? 'btn-primary' : 'btn-ghost'}`}
            style={{
              padding: '0.25rem 0.65rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              borderRadius: '6px',
            }}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Linear Area Chart */}
      <div style={{ width: '100%', height: 250, marginTop: '0.5rem' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="trendLinearGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.45} />
                <stop offset="95%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="var(--text-muted)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              interval={Math.floor(chartData.length / 5)}
            />
            <YAxis
              domain={[1, 5]}
              ticks={[1, 2, 3, 4, 5]}
              stroke="var(--text-muted)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            {/* Explicitly Linear Area Chart */}
            <Area
              type="linear"
              dataKey="rating"
              stroke={color}
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#trendLinearGradient)"
              activeDot={{
                r: 5,
                stroke: color,
                strokeWidth: 2,
                fill: '#ffffff',
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RatingTrendChart;

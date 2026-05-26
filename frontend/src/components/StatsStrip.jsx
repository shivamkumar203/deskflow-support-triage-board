import React from 'react';
import { AlertOctagon, Inbox, Play, CheckCircle2, Archive } from 'lucide-react';

const StatsStrip = ({ stats, loading }) => {
  const { statusCounts = {}, openSlaBreachedCount = 0 } = stats || {};

  const statItems = [
    {
      label: 'Open',
      count: statusCounts.open || 0,
      icon: <Inbox className="stat-icon" style={{ color: '#717180' }} />,
      glowColor: 'var(--glow-open)'
    },
    {
      label: 'In Progress',
      count: statusCounts.in_progress || 0,
      icon: <Play className="stat-icon" style={{ color: '#3b82f6' }} />,
      glowColor: 'var(--glow-in-progress)'
    },
    {
      label: 'Resolved',
      count: statusCounts.resolved || 0,
      icon: <CheckCircle2 className="stat-icon" style={{ color: '#10b981' }} />,
      glowColor: 'var(--glow-resolved)'
    },
    {
      label: 'Closed',
      count: statusCounts.closed || 0,
      icon: <Archive className="stat-icon" style={{ color: '#a855f7' }} />,
      glowColor: 'var(--glow-closed)'
    }
  ];

  return (
    <div className="stats-strip-container slide-in">
      <div className="stats-cards-grid">
        {statItems.map((item, idx) => (
          <div 
            key={idx} 
            className="stat-card"
            style={{ '--glow-color': item.glowColor }}
          >
            <div className="stat-header">
              {item.icon}
              <span className="stat-label">{item.label}</span>
            </div>
            <div className="stat-value">{loading ? '...' : item.count}</div>
          </div>
        ))}

        <div className={`stat-card breach-card ${openSlaBreachedCount > 0 ? 'breached-active' : ''}`}>
          <div className="stat-header">
            <AlertOctagon className={`stat-icon ${openSlaBreachedCount > 0 ? 'pulse-icon' : ''}`} style={{ color: '#ef4444' }} />
            <span className="stat-label">SLA Breached (Open)</span>
          </div>
          <div className="stat-value text-red">{loading ? '...' : openSlaBreachedCount}</div>
        </div>
      </div>

      <style>{`
        .stats-strip-container {
          margin-bottom: 1.5rem;
          width: 100%;
        }
        .stats-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem;
        }
        .stat-card {
          background: var(--bg-glass);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-md);
          padding: 1rem 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          transition: var(--transition-smooth);
          backdrop-filter: blur(12px);
        }
        .stat-card:hover {
          border-color: var(--border-hover);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px var(--glow-color, rgba(255,255,255,0.02));
        }
        .stat-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .stat-icon {
          width: 16px;
          height: 16px;
        }
        .stat-label {
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--text-secondary);
        }
        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
        }
        .breach-card {
          border-color: rgba(239, 68, 68, 0.15);
          background: rgba(239, 68, 68, 0.02);
        }
        .breached-active {
          border-color: rgba(239, 68, 68, 0.35);
          background: rgba(239, 68, 68, 0.06);
          animation: pulse-red 2.5s infinite;
        }
        .text-red {
          color: var(--priority-urgent) !important;
        }
        .pulse-icon {
          filter: drop-shadow(0 0 4px var(--priority-urgent));
        }
      `}</style>
    </div>
  );
};

export default StatsStrip;

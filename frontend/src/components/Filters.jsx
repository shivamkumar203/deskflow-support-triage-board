import React from 'react';
import { Filter, AlertTriangle } from 'lucide-react';

const Filters = ({ filterPriority, setFilterPriority, filterBreached, setFilterBreached }) => {
  const priorities = [
    { value: '', label: 'All Priorities' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  return (
    <div className="filters-container slide-in">
      <div className="filters-left">
        <Filter className="filter-icon" />
        <span className="filters-label">Filters</span>
        <div className="priority-options">
          {priorities.map((p) => (
            <button
              key={p.value}
              className={`filter-btn ${filterPriority === p.value ? 'active' : ''}`}
              onClick={() => setFilterPriority(p.value)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="filters-right">
        <button
          className={`breached-toggle-btn ${filterBreached ? 'active-breached' : ''}`}
          onClick={() => setFilterBreached(!filterBreached)}
        >
          <AlertTriangle className="breach-toggle-icon" />
          <span>SLA Breached Only</span>
        </button>
      </div>

      <style>{`
        .filters-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--bg-glass);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-md);
          padding: 0.75rem 1.25rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
          backdrop-filter: blur(12px);
        }
        .filters-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .filter-icon {
          width: 16px;
          height: 16px;
          color: var(--text-tertiary);
        }
        .filters-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .priority-options {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .filter-btn {
          background: transparent;
          border: 1px solid transparent;
          color: var(--text-secondary);
          font-family: var(--font-sans);
          font-size: 0.8125rem;
          font-weight: 500;
          padding: 0.35rem 0.75rem;
          border-radius: 6px;
          cursor: pointer;
          transition: var(--transition-smooth);
        }
        .filter-btn:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.04);
        }
        .filter-btn.active {
          color: #fff;
          background: rgba(255, 255, 255, 0.08);
          border-color: var(--border-hover);
        }
        .filters-right {
          display: flex;
          align-items: center;
        }
        .breached-toggle-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(239, 68, 68, 0.03);
          border: 1px solid rgba(239, 68, 68, 0.15);
          color: rgba(239, 68, 68, 0.85);
          font-family: var(--font-sans);
          font-size: 0.8125rem;
          font-weight: 600;
          padding: 0.45rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          transition: var(--transition-smooth);
        }
        .breached-toggle-btn:hover {
          background: rgba(239, 68, 68, 0.08);
          border-color: rgba(239, 68, 68, 0.3);
          color: var(--priority-urgent);
        }
        .breached-toggle-btn.active-breached {
          background: var(--priority-urgent-bg);
          border-color: var(--priority-urgent);
          color: #fff;
          box-shadow: 0 0 8px rgba(239, 68, 68, 0.15);
        }
        .breach-toggle-icon {
          width: 14px;
          height: 14px;
        }
      `}</style>
    </div>
  );
};

export default Filters;

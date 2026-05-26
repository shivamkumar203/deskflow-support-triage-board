import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, ArrowRight, ArrowLeft, Mail, ChevronRight, User } from 'lucide-react';

const formatAge = (minutes) => {
  if (minutes < 0) return '0m';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  if (hours < 24) return `${hours}h ${remainingMins}m`;
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return `${days}d ${remainingHours}h ${remainingMins}m`;
};

const TicketCard = ({ ticket, onMoveTicket, isShaking }) => {
  const { _id, subject, description, customerEmail, priority, status, createdAt, resolvedAt, ageMinutes: initialAge, slaBreached } = ticket;

  // Real-time ticking for live ticket aging (only for open / in progress status)
  const [currentAge, setCurrentAge] = useState(initialAge);

  useEffect(() => {
    setCurrentAge(initialAge);
    
    const isResolvedOrClosed = status === 'resolved' || status === 'closed';
    if (isResolvedOrClosed) return; // Keep age locked if resolved/closed

    const timer = setInterval(() => {
      setCurrentAge((prevAge) => prevAge + 1);
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [initialAge, status]);

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', _id);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Determine allowed adjacent transitions to toggle visibility of control buttons
  const showMoveForward = status !== 'closed';
  const showMoveBackward = status !== 'open';

  const getForwardTarget = () => {
    if (status === 'open') return 'in_progress';
    if (status === 'in_progress') return 'resolved';
    if (status === 'resolved') return 'closed';
    return null;
  };

  const getBackwardTarget = () => {
    if (status === 'closed') return 'resolved';
    if (status === 'resolved') return 'in_progress';
    if (status === 'in_progress') return 'open';
    return null;
  };

  return (
    <div
      className={`ticket-card slide-in ${isShaking ? 'shake-animation' : ''} ${slaBreached ? 'breach-border' : ''}`}
      draggable
      onDragStart={handleDragStart}
    >
      {slaBreached && (
        <div className="sla-banner">
          <AlertTriangle className="sla-banner-icon" />
          <span>SLA BREACHED</span>
        </div>
      )}

      <div className="card-body">
        <div className="card-top">
          <span className={`badge badge-${priority}`}>{priority}</span>
          <div className="card-age">
            <Clock className="clock-icon" />
            <span>{formatAge(currentAge)}</span>
          </div>
        </div>

        <h3 className="card-title">{subject}</h3>
        <p className="card-desc">{description}</p>

        <div className="card-meta">
          <div className="customer-info">
            <Mail className="mail-icon" />
            <span className="customer-email" title={customerEmail}>{customerEmail}</span>
          </div>
        </div>
      </div>

      <div className="card-actions">
        {showMoveBackward ? (
          <button
            className="action-btn"
            title={`Move back to ${getBackwardTarget()}`}
            onClick={() => onMoveTicket(_id, getBackwardTarget())}
          >
            <ArrowLeft className="action-icon" />
            <span>Back</span>
          </button>
        ) : (
          <div className="action-placeholder" />
        )}

        <div className="action-divider" />

        {showMoveForward ? (
          <button
            className="action-btn next-btn"
            title={`Move forward to ${getForwardTarget()}`}
            onClick={() => onMoveTicket(_id, getForwardTarget())}
          >
            <span>Next</span>
            <ArrowRight className="action-icon" />
          </button>
        ) : (
          <div className="action-placeholder" />
        )}
      </div>

      <style>{`
        .ticket-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-md);
          overflow: hidden;
          transition: var(--transition-smooth);
          cursor: grab;
          display: flex;
          flex-direction: column;
          position: relative;
        }
        .ticket-card:hover {
          border-color: var(--border-hover);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
        .ticket-card:active {
          cursor: grabbing;
        }
        .breach-border {
          border-color: rgba(239, 68, 68, 0.45);
        }
        .breach-border:hover {
          border-color: var(--priority-urgent);
          box-shadow: 0 4px 16px rgba(239, 68, 68, 0.15);
        }
        .sla-banner {
          background: linear-gradient(90deg, #f43f5e, #ef4444);
          color: #fff;
          font-size: 0.65rem;
          font-weight: 700;
          padding: 0.25rem 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          letter-spacing: 0.05em;
        }
        .sla-banner-icon {
          width: 12px;
          height: 12px;
          animation: pulse-red 1.5s infinite;
        }
        .card-body {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          flex-grow: 1;
        }
        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .card-age {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.75rem;
          color: var(--text-secondary);
          font-family: var(--font-mono);
        }
        .clock-icon {
          width: 12px;
          height: 12px;
        }
        .card-title {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1.35;
        }
        .card-desc {
          font-size: 0.8125rem;
          color: var(--text-secondary);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.45;
        }
        .card-meta {
          border-top: 1px solid var(--border-color);
          padding-top: 0.75rem;
          margin-top: 0.25rem;
        }
        .customer-info {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          color: var(--text-tertiary);
        }
        .mail-icon {
          width: 12px;
          height: 12px;
          flex-shrink: 0;
        }
        .customer-email {
          font-size: 0.75rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .card-actions {
          display: flex;
          border-top: 1px solid var(--border-color);
          background: rgba(255, 255, 255, 0.01);
        }
        .action-btn {
          flex: 1;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          font-family: var(--font-sans);
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.625rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          transition: var(--transition-smooth);
        }
        .action-btn:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.03);
        }
        .next-btn:hover {
          color: var(--accent-blue);
        }
        .action-icon {
          width: 12px;
          height: 12px;
        }
        .action-placeholder {
          flex: 1;
        }
        .action-divider {
          width: 1px;
          background: var(--border-color);
        }
      `}</style>
    </div>
  );
};

export default TicketCard;

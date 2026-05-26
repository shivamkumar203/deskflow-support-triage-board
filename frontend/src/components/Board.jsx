import React, { useState } from 'react';
import TicketCard from './TicketCard';
import { Inbox, Play, CheckCircle2, Archive, Loader } from 'lucide-react';

const COLUMNS = [
  { status: 'open', label: 'Open', icon: <Inbox className="col-icon" style={{ color: '#717180' }} />, glowClass: 'glow-open' },
  { status: 'in_progress', label: 'In Progress', icon: <Play className="col-icon" style={{ color: '#3b82f6' }} />, glowClass: 'glow-in-progress' },
  { status: 'resolved', label: 'Resolved', icon: <CheckCircle2 className="col-icon" style={{ color: '#10b981' }} />, glowClass: 'glow-resolved' },
  { status: 'closed', label: 'Closed', icon: <Archive className="col-icon" style={{ color: '#a855f7' }} />, glowClass: 'glow-closed' }
];

const Board = ({ tickets, onMoveTicket, loading, error }) => {
  const [shakingTicketId, setShakingTicketId] = useState(null);

  // Helper to validate transition client-side before sending to server
  const validateTransition = (currentStatus, targetStatus) => {
    const STATUS_STATES = ['open', 'in_progress', 'resolved', 'closed'];
    const currentIndex = STATUS_STATES.indexOf(currentStatus);
    const targetIndex = STATUS_STATES.indexOf(targetStatus);
    
    if (currentIndex === -1 || targetIndex === -1) return false;
    return Math.abs(targetIndex - currentIndex) === 1;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    const ticketId = e.dataTransfer.getData('text/plain');
    if (!ticketId) return;

    // Find the ticket to check transition
    const ticket = tickets.find(t => t._id === ticketId);
    if (!ticket) return;

    if (ticket.status === targetStatus) return; // Dropped in the same column

    if (validateTransition(ticket.status, targetStatus)) {
      onMoveTicket(ticketId, targetStatus);
    } else {
      // Trigger card shaking animation for feedback
      setShakingTicketId(ticketId);
      setTimeout(() => {
        setShakingTicketId(null);
      }, 400); // match animation duration
    }
  };

  return (
    <div className="board-wrapper">
      {error && <div className="board-error-banner">{error}</div>}

      <div className="board-grid">
        {COLUMNS.map((col) => {
          const colTickets = tickets.filter(t => t.status === col.status);
          
          return (
            <div
              key={col.status}
              className={`board-column ${col.glowClass}`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.status)}
            >
              <div className="column-header">
                <div className="column-title-wrapper">
                  {col.icon}
                  <span className="column-label">{col.label}</span>
                </div>
                <span className="column-count">{colTickets.length}</span>
              </div>

              <div className="column-content-scroll">
                <div className="column-cards-container">
                  {loading && colTickets.length === 0 ? (
                    <div className="column-loader">
                      <Loader className="spinner" />
                      <span>Loading tickets...</span>
                    </div>
                  ) : colTickets.length === 0 ? (
                    <div className="empty-column-state">
                      <span>No tickets</span>
                    </div>
                  ) : (
                    colTickets.map((ticket) => (
                      <TicketCard
                        key={ticket._id}
                        ticket={ticket}
                        onMoveTicket={onMoveTicket}
                        isShaking={shakingTicketId === ticket._id}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .board-wrapper {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          width: 100%;
          flex-grow: 1;
        }
        .board-error-banner {
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: var(--priority-urgent);
          padding: 0.75rem 1rem;
          border-radius: var(--border-radius-sm);
          font-size: 0.875rem;
          font-weight: 500;
          animation: slideIn 0.25s ease;
        }
        .board-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.25rem;
          min-height: 550px;
          height: calc(100vh - 280px);
          min-width: 900px;
        }
        
        @media (max-width: 1024px) {
          .board-wrapper {
            overflow-x: auto;
            padding-bottom: 1rem;
          }
        }
        
        .board-column {
          background: rgba(18, 18, 23, 0.45);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-lg);
          display: flex;
          flex-direction: column;
          padding: 1rem;
          transition: var(--transition-smooth);
          backdrop-filter: blur(12px);
          max-height: 100%;
        }
        
        .board-column:hover {
          border-color: var(--border-hover);
        }
        
        .glow-open:hover { box-shadow: inset 0 0 12px rgba(113, 113, 128, 0.03); }
        .glow-in-progress:hover { box-shadow: inset 0 0 12px rgba(59, 130, 246, 0.03); }
        .glow-resolved:hover { box-shadow: inset 0 0 12px rgba(16, 185, 129, 0.03); }
        .glow-closed:hover { box-shadow: inset 0 0 12px rgba(168, 85, 247, 0.03); }
        
        .column-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--border-color);
        }
        .column-title-wrapper {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .col-icon {
          width: 16px;
          height: 16px;
        }
        .column-label {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-primary);
        }
        .column-count {
          font-size: 0.75rem;
          font-weight: 600;
          font-family: var(--font-mono);
          color: var(--text-secondary);
          background: var(--bg-tertiary);
          padding: 0.15rem 0.45rem;
          border-radius: 6px;
        }
        .column-content-scroll {
          flex-grow: 1;
          overflow-y: auto;
          padding-right: 2px;
        }
        .column-cards-container {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .empty-column-state {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100px;
          border: 1px dashed var(--border-color);
          border-radius: var(--border-radius-md);
          color: var(--text-tertiary);
          font-size: 0.8125rem;
        }
        .column-loader {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          height: 100px;
          color: var(--text-tertiary);
          font-size: 0.8125rem;
        }
        .spinner {
          width: 18px;
          height: 18px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Board;

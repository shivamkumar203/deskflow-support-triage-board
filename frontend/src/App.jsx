import React, { useState, useEffect } from 'react';
import StatsStrip from './components/StatsStrip';
import Filters from './components/Filters';
import Board from './components/Board';
import TicketForm from './components/TicketForm';
import { Plus, Code, Mail, User, AlertCircle, RefreshCw } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000';

const App = () => {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({
    statusCounts: { open: 0, in_progress: 0, resolved: 0, closed: 0 },
    priorityCounts: { low: 0, medium: 0, high: 0, urgent: 0 },
    openSlaBreachedCount: 0
  });

  const [filterPriority, setFilterPriority] = useState('');
  const [filterBreached, setFilterBreached] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch all tickets with filters applied
  const fetchTickets = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (filterPriority) params.append('priority', filterPriority);
      if (filterBreached) params.append('breached', 'true');

      const response = await fetch(`${API_BASE_URL}/tickets?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to retrieve tickets from the database');
      }
      const data = await response.json();
      setTickets(data);
    } catch (err) {
      setError(err.message || 'Error communicating with server API');
    } finally {
      setLoading(false);
    }
  };

  // Fetch aggregate statistics
  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/tickets/stats`);
      if (!response.ok) throw new Error();
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Failed to load ticketing metrics');
    } finally {
      setStatsLoading(false);
    }
  };

  // Run on mount or filter changes
  useEffect(() => {
    fetchTickets();
  }, [filterPriority, filterBreached]);

  // Fetch stats periodically or when ticket mutations occur
  useEffect(() => {
    fetchStats();
  }, []);

  // Handle ticket creation
  const handleCreateTicket = async (ticketData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketData)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to submit ticket');
      }

      // Proactively refresh ticket list and stats without page reload
      await fetchTickets();
      await fetchStats();
      return true;
    } catch (err) {
      throw new Error(err.message);
    }
  };

  // Handle status transitions
  const handleMoveTicket = async (ticketId, nextStatus) => {
    try {
      // Optimistically update status in UI to ensure buttery smooth reactivity
      const originalTickets = [...tickets];
      setTickets((prevTickets) =>
        prevTickets.map((t) =>
          t._id === ticketId
            ? { 
                ...t, 
                status: nextStatus,
                resolvedAt: nextStatus === 'resolved' ? new Date().toISOString() : nextStatus !== 'resolved' && t.status === 'resolved' ? null : t.resolvedAt
              }
            : t
        )
      );

      const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });

      if (!response.ok) {
        const errData = await response.json();
        // Rollback optimistic state on error
        setTickets(originalTickets);
        setError(errData.message || 'Failed to transfer ticket');
        return;
      }

      // Re-fetch backend values to sync computed properties (ageMinutes, slaBreached, stats)
      await fetchTickets();
      await fetchStats();
    } catch (err) {
      setError(err.message || 'Error occurred during status transition');
    }
  };

  return (
    <div className="app-container">
      {/* Dynamic Candidate Portfolio Banner */}
      <div className="candidate-header slide-in">
        <div className="candidate-details">
          <div className="candidate-badge">
            <User className="cand-icon" />
            <span>Shivam Kumar</span>
          </div>
          <div className="candidate-meta-item">
            <Mail className="cand-icon" />
            <span>shivamkumar230983@acropolis.in</span>
          </div>
          <div className="candidate-meta-item">
            <Code className="cand-icon" />
            <span>shivamkumar203</span>
          </div>
        </div>
        <div className="assessment-badge">MERN Assessment: DeskFlow</div>
      </div>

      <div className="board-header slide-in">
        <div className="board-title">
          <h1>DeskFlow Triage Board</h1>
          <p>Support queues with automated SLA tracking and priority targets</p>
        </div>
        <div className="board-header-actions">
          <button className="btn" onClick={() => { fetchTickets(); fetchStats(); }} title="Refresh All Data">
            <RefreshCw className={`refresh-icon ${loading ? 'spin-icon' : ''}`} />
          </button>
          <button className="btn btn-primary" onClick={() => setIsFormOpen(true)}>
            <Plus style={{ width: '16px', height: '16px' }} />
            <span>New Ticket</span>
          </button>
        </div>
      </div>

      {/* Aggregate Statistics Header */}
      <StatsStrip stats={stats} loading={statsLoading} />

      {/* Interactive Filters Strip */}
      <Filters
        filterPriority={filterPriority}
        setFilterPriority={setFilterPriority}
        filterBreached={filterBreached}
        setFilterBreached={setFilterBreached}
      />

      {/* Core Tickets Board */}
      <Board
        tickets={tickets}
        onMoveTicket={handleMoveTicket}
        loading={loading}
        error={error}
      />

      {/* Create Ticket Sidebar Overlay Drawer */}
      <TicketForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onCreateTicket={handleCreateTicket}
      />

      <style>{`
        .candidate-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-sm);
          padding: 0.5rem 1rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
          font-size: 0.75rem;
          color: var(--text-secondary);
        }
        .candidate-details {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          flex-wrap: wrap;
        }
        .candidate-badge {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          color: #fff;
          font-weight: 600;
        }
        .candidate-meta-item {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }
        .cand-icon {
          width: 12px;
          height: 12px;
          color: var(--text-tertiary);
        }
        .assessment-badge {
          background: rgba(168, 85, 247, 0.15);
          color: #d8b4fe;
          border: 1px solid rgba(168, 85, 247, 0.3);
          padding: 0.15rem 0.5rem;
          border-radius: 4px;
          font-weight: 600;
        }
        .board-header-actions {
          display: flex;
          gap: 0.5rem;
        }
        .refresh-icon {
          width: 14px;
          height: 14px;
        }
        .spin-icon {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default App;

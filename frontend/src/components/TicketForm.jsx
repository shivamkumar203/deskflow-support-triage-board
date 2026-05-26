import React, { useState } from 'react';
import { X, Sparkles, Send, Loader } from 'lucide-react';

const TicketForm = ({ isOpen, onClose, onCreateTicket }) => {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [priority, setPriority] = useState('medium');
  
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAutofill = () => {
    setSubject('Database Query Performance Issue');
    setDescription('API response delays detected on listing endpoint. Needs index optimizations on priority and status fields.');
    setCustomerEmail('shivamkumar230983@acropolis.in');
    setPriority('high');
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!subject.trim()) return setFormError('Subject is required');
    if (!description.trim()) return setFormError('Description is required');
    if (!customerEmail.trim()) return setFormError('Customer Email is required');
    
    // Simple email validation matching the backend regex
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(customerEmail)) {
      return setFormError('Please enter a valid email address');
    }

    setSubmitting(true);
    try {
      const success = await onCreateTicket({
        subject: subject.trim(),
        description: description.trim(),
        customerEmail: customerEmail.trim().toLowerCase(),
        priority
      });
      
      if (success) {
        // Reset and close
        setSubject('');
        setDescription('');
        setCustomerEmail('');
        setPriority('medium');
        onClose();
      }
    } catch (err) {
      setFormError(err.message || 'Failed to create ticket');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-content slide-in" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="drawer-title-group">
            <h2>Create New Ticket</h2>
            <p>File a new support ticket with priority triage</p>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X className="close-icon" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="drawer-form">
          {formError && <div className="form-error">{formError}</div>}

          <div className="form-group">
            <button 
              type="button" 
              className="btn btn-autofill"
              onClick={handleAutofill}
            >
              <Sparkles className="autofill-icon" />
              <span>Autofill Candidate details</span>
            </button>
          </div>

          <div className="form-group">
            <label className="form-label">Subject</label>
            <input
              type="text"
              className="input"
              placeholder="Brief description of the issue"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Customer Email</label>
            <input
              type="email"
              className="input"
              placeholder="e.g. customer@domain.com"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Priority</label>
            <select
              className="select"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="low">Low (72 Hours Target)</option>
              <option value="medium">Medium (24 Hours Target)</option>
              <option value="high">High (4 Hours Target)</option>
              <option value="urgent">Urgent (1 Hour Target)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="textarea"
              rows="5"
              placeholder="Provide fully detailed context about the problem..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="drawer-actions">
            <button type="button" className="btn" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader className="spinner" style={{ width: '14px', height: '14px' }} />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send style={{ width: '14px', height: '14px' }} />
                  <span>Create Ticket</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .drawer-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          justify-content: flex-end;
          z-index: 1000;
        }
        .drawer-content {
          background: var(--bg-secondary);
          border-left: 1px solid var(--border-color);
          width: 100%;
          max-width: 460px;
          height: 100%;
          display: flex;
          flex-direction: column;
          box-shadow: var(--shadow-lg);
          padding: 2rem;
          overflow-y: auto;
        }
        .drawer-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
        }
        .drawer-title-group h2 {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
        }
        .drawer-title-group p {
          font-size: 0.8125rem;
          color: var(--text-secondary);
          margin-top: 0.25rem;
        }
        .close-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 6px;
          transition: var(--transition-smooth);
        }
        .close-btn:hover {
          color: var(--text-primary);
          background: rgba(255,255,255,0.05);
        }
        .close-icon {
          width: 20px;
          height: 20px;
        }
        .drawer-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          flex-grow: 1;
        }
        .form-error {
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: var(--priority-urgent);
          padding: 0.75rem 1rem;
          border-radius: var(--border-radius-sm);
          font-size: 0.8125rem;
          font-weight: 500;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .form-label {
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--text-secondary);
        }
        .btn-autofill {
          background: rgba(168, 85, 247, 0.04);
          border: 1px dashed rgba(168, 85, 247, 0.3);
          color: #d8b4fe;
          justify-content: center;
          padding: 0.5rem;
        }
        .btn-autofill:hover {
          background: rgba(168, 85, 247, 0.08);
          border-color: rgba(168, 85, 247, 0.6);
          color: #e9d5ff;
        }
        .autofill-icon {
          width: 14px;
          height: 14px;
        }
        .drawer-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: auto;
          padding-top: 2rem;
        }
      `}</style>
    </div>
  );
};

export default TicketForm;

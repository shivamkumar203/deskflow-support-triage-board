const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');

const STATUS_STATES = ['open', 'in_progress', 'resolved', 'closed'];

// Helper to check transition
const isValidTransition = (current, next) => {
  const currentIndex = STATUS_STATES.indexOf(current);
  const nextIndex = STATUS_STATES.indexOf(next);
  
  if (currentIndex === -1 || nextIndex === -1) return false;
  
  // Transition must be exactly one step forward or backward
  return Math.abs(nextIndex - currentIndex) === 1;
};

// @desc    Create a ticket
// @route   POST /tickets
router.post('/', async (req, res) => {
  try {
    const { subject, description, customerEmail, priority } = req.body;
    
    // Check required fields explicitly for precise validation messages
    if (!subject || !description || !customerEmail || !priority) {
      return res.status(400).json({ 
        message: 'Validation failed: subject, description, customerEmail, and priority are required.' 
      });
    }

    const ticket = new Ticket({
      subject,
      description,
      customerEmail,
      priority,
      status: 'open'
    });

    await ticket.save();
    res.status(201).json(ticket);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: `Validation failed: ${messages.join(', ')}` });
    }
    res.status(500).json({ message: 'Server error while creating ticket', error: error.message });
  }
});

// @desc    List tickets with optional combinable filters (status, priority, breached)
// @route   GET /tickets
router.get('/', async (req, res) => {
  try {
    const { status, priority, breached } = req.query;
    
    // Database level filtering for status and priority
    const query = {};
    if (status) {
      if (!STATUS_STATES.includes(status)) {
        return res.status(400).json({ message: `Invalid status filter. Must be one of: ${STATUS_STATES.join(', ')}` });
      }
      query.status = status;
    }
    if (priority) {
      if (!['low', 'medium', 'high', 'urgent'].includes(priority)) {
        return res.status(400).json({ message: 'Invalid priority filter. Must be one of: low, medium, high, urgent' });
      }
      query.priority = priority;
    }

    let tickets = await Ticket.find(query).sort({ createdAt: -1 });

    // Handle breached filter in JavaScript due to dynamically computed ageMinutes/slaBreached virtuals
    if (breached !== undefined) {
      const isBreachedFilter = breached === 'true';
      tickets = tickets.filter(ticket => ticket.slaBreached === isBreachedFilter);
    }

    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching tickets', error: error.message });
  }
});

// @desc    Get aggregate stats
// @route   GET /tickets/stats
router.get('/stats', async (req, res) => {
  try {
    const tickets = await Ticket.find({});
    
    const stats = {
      statusCounts: {
        open: 0,
        in_progress: 0,
        resolved: 0,
        closed: 0
      },
      priorityCounts: {
        low: 0,
        medium: 0,
        high: 0,
        urgent: 0
      },
      openSlaBreachedCount: 0
    };

    tickets.forEach(ticket => {
      // Aggregate status counts
      if (stats.statusCounts[ticket.status] !== undefined) {
        stats.statusCounts[ticket.status]++;
      }
      
      // Aggregate priority counts
      if (stats.priorityCounts[ticket.priority] !== undefined) {
        stats.priorityCounts[ticket.priority]++;
      }
      
      // Count currently open (unresolved) SLA breached tickets
      const isOpenStatus = ticket.status === 'open' || ticket.status === 'in_progress';
      if (isOpenStatus && ticket.slaBreached) {
        stats.openSlaBreachedCount++;
      }
    });

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Server error while calculating statistics', error: error.message });
  }
});

// @desc    Update a ticket (primarily status changes with transition rules)
// @route   PATCH /tickets/:id
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, subject, description, priority } = req.body;

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check transition validity if status is being updated
    if (status && status !== ticket.status) {
      if (!STATUS_STATES.includes(status)) {
        return res.status(400).json({ message: `Invalid status. Must be one of: ${STATUS_STATES.join(', ')}` });
      }

      if (!isValidTransition(ticket.status, status)) {
        return res.status(400).json({ 
          message: `Invalid status transition: cannot move ticket from '${ticket.status}' to '${status}'. Transitions are only allowed one step forward or backward at a time (open ➔ in_progress ➔ resolved ➔ closed).` 
        });
      }

      // Automatically update resolvedAt
      if (status === 'resolved') {
        ticket.resolvedAt = new Date();
      } else if (ticket.status === 'resolved' && status !== 'resolved') {
        // If moving back from resolved, clear resolvedAt
        ticket.resolvedAt = null;
      }

      ticket.status = status;
    }

    // Update other fields if provided
    if (subject !== undefined) ticket.subject = subject;
    if (description !== undefined) ticket.description = description;
    if (priority !== undefined) {
      if (!['low', 'medium', 'high', 'urgent'].includes(priority)) {
        return res.status(400).json({ message: 'Invalid priority. Must be one of: low, medium, high, urgent' });
      }
      ticket.priority = priority;
    }

    await ticket.save();
    res.json(ticket);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: `Validation failed: ${messages.join(', ')}` });
    }
    res.status(500).json({ message: 'Server error while updating ticket', error: error.message });
  }
});

// @desc    Delete a ticket
// @route   DELETE /tickets/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findByIdAndDelete(id);
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    
    res.json({ message: 'Ticket deleted successfully', id });
  } catch (error) {
    res.status(500).json({ message: 'Server error while deleting ticket', error: error.message });
  }
});

module.exports = router;

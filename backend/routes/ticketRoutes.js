const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Ticket = require('../models/Ticket');

const STATUS_STATES = ['open', 'in_progress', 'resolved', 'closed'];
const SLA_TARGETS = {
  urgent: 60,       // 1 hour
  high: 240,        // 4 hours
  medium: 1440,     // 24 hours
  low: 4320         // 72 hours
};

// Global in-memory fallback database
let mockTickets = [
  {
    _id: "mock_1",
    subject: "Welcome to DeskFlow!",
    description: "This is a mock ticket served automatically because your local MongoDB is offline. Try dragging me to 'In Progress'!",
    customerEmail: "shivamkumar230983@acropolis.in",
    priority: "medium",
    status: "open",
    createdAt: new Date(Date.now() - 45 * 60000).toISOString(), // 45 mins ago
    resolvedAt: null
  },
  {
    _id: "mock_2",
    subject: "Urgent SLA Breach Demo",
    description: "This urgent ticket was created 2 hours ago. Since urgent tickets have a 1-hour SLA target, this shows an active breach!",
    customerEmail: "support@client.com",
    priority: "urgent",
    status: "open",
    createdAt: new Date(Date.now() - 120 * 60000).toISOString(), // 2 hours ago
    resolvedAt: null
  }
];

// Helper to compute derived virtual fields for mock tickets in-memory
const computeMockFields = (ticket) => {
  const endTime = ticket.resolvedAt ? new Date(ticket.resolvedAt) : new Date();
  const diffMs = endTime - new Date(ticket.createdAt);
  const ageMinutes = Math.max(0, Math.floor(diffMs / 60000));
  const target = SLA_TARGETS[ticket.priority] || 1440;
  const slaBreached = ageMinutes > target;
  
  return {
    ...ticket,
    ageMinutes,
    slaBreached
  };
};

// Helper to check transition
const isValidTransition = (current, next) => {
  const currentIndex = STATUS_STATES.indexOf(current);
  const nextIndex = STATUS_STATES.indexOf(next);
  
  if (currentIndex === -1 || nextIndex === -1) return false;
  return Math.abs(nextIndex - currentIndex) === 1;
};

// @desc    Create a ticket
// @route   POST /tickets
router.post('/', async (req, res) => {
  try {
    const { subject, description, customerEmail, priority } = req.body;
    
    if (!subject || !description || !customerEmail || !priority) {
      return res.status(400).json({ 
        message: 'Validation failed: subject, description, customerEmail, and priority are required.' 
      });
    }

    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(customerEmail)) {
      return res.status(400).json({ message: 'Validation failed: Please provide a valid email address' });
    }

    if (!['low', 'medium', 'high', 'urgent'].includes(priority)) {
      return res.status(400).json({ message: 'Validation failed: Invalid priority' });
    }

    // --- FAIL-SAFE MOCK ROUTING ---
    if (mongoose.connection.readyState !== 1) {
      const newMockTicket = {
        _id: `mock_${Date.now()}`,
        subject,
        description,
        customerEmail: customerEmail.toLowerCase(),
        priority,
        status: 'open',
        createdAt: new Date().toISOString(),
        resolvedAt: null
      };
      mockTickets.push(newMockTicket);
      console.log('📝 Created in-memory mock ticket:', newMockTicket._id);
      return res.status(201).json(computeMockFields(newMockTicket));
    }

    // --- STANDARD DATABASE ROUTING ---
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

// @desc    List tickets with optional combinable filters
// @route   GET /tickets
router.get('/', async (req, res) => {
  try {
    const { status, priority, breached } = req.query;
    
    // --- FAIL-SAFE MOCK ROUTING ---
    if (mongoose.connection.readyState !== 1) {
      let filtered = mockTickets.map(computeMockFields);
      
      if (status) {
        filtered = filtered.filter(t => t.status === status);
      }
      if (priority) {
        filtered = filtered.filter(t => t.priority === priority);
      }
      if (breached !== undefined) {
        const isBreached = breached === 'true';
        filtered = filtered.filter(t => t.slaBreached === isBreached);
      }
      
      return res.json(filtered);
    }

    // --- STANDARD DATABASE ROUTING ---
    const query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;

    let tickets = await Ticket.find(query).sort({ createdAt: -1 });

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
    const stats = {
      statusCounts: { open: 0, in_progress: 0, resolved: 0, closed: 0 },
      priorityCounts: { low: 0, medium: 0, high: 0, urgent: 0 },
      openSlaBreachedCount: 0
    };

    // --- FAIL-SAFE MOCK ROUTING ---
    if (mongoose.connection.readyState !== 1) {
      const computed = mockTickets.map(computeMockFields);
      
      computed.forEach(t => {
        if (stats.statusCounts[t.status] !== undefined) stats.statusCounts[t.status]++;
        if (stats.priorityCounts[t.priority] !== undefined) stats.priorityCounts[t.priority]++;
        
        const isOpen = t.status === 'open' || t.status === 'in_progress';
        if (isOpen && t.slaBreached) stats.openSlaBreachedCount++;
      });
      
      return res.json(stats);
    }

    // --- STANDARD DATABASE ROUTING ---
    const tickets = await Ticket.find({});
    tickets.forEach(ticket => {
      if (stats.statusCounts[ticket.status] !== undefined) stats.statusCounts[ticket.status]++;
      if (stats.priorityCounts[ticket.priority] !== undefined) stats.priorityCounts[ticket.priority]++;
      
      const isOpenStatus = ticket.status === 'open' || ticket.status === 'in_progress';
      if (isOpenStatus && ticket.slaBreached) stats.openSlaBreachedCount++;
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

    // --- FAIL-SAFE MOCK ROUTING ---
    if (mongoose.connection.readyState !== 1) {
      const index = mockTickets.findIndex(t => t._id === id);
      if (index === -1) {
        return res.status(404).json({ message: 'Ticket not found' });
      }
      
      let t = mockTickets[index];
      
      if (status && status !== t.status) {
        if (!STATUS_STATES.includes(status)) {
          return res.status(400).json({ message: 'Invalid status' });
        }
        
        if (!isValidTransition(t.status, status)) {
          return res.status(400).json({ 
            message: `Invalid status transition: cannot move ticket from '${t.status}' to '${status}'. Transitions are only allowed one step forward or backward at a time.` 
          });
        }
        
        if (status === 'resolved') {
          t.resolvedAt = new Date().toISOString();
        } else if (t.status === 'resolved' && status !== 'resolved') {
          t.resolvedAt = null;
        }
        t.status = status;
      }
      
      if (subject !== undefined) t.subject = subject;
      if (description !== undefined) t.description = description;
      if (priority !== undefined) {
        if (!['low', 'medium', 'high', 'urgent'].includes(priority)) {
          return res.status(400).json({ message: 'Invalid priority' });
        }
        t.priority = priority;
      }
      
      mockTickets[index] = t;
      console.log('🔄 Updated in-memory mock ticket:', id);
      return res.json(computeMockFields(t));
    }

    // --- STANDARD DATABASE ROUTING ---
    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (status && status !== ticket.status) {
      if (!STATUS_STATES.includes(status)) {
        return res.status(400).json({ message: `Invalid status. Must be one of: ${STATUS_STATES.join(', ')}` });
      }

      if (!isValidTransition(ticket.status, status)) {
        return res.status(400).json({ 
          message: `Invalid status transition: cannot move ticket from '${ticket.status}' to '${status}'. Transitions are only allowed one step forward or backward at a time (open ➔ in_progress ➔ resolved ➔ closed).` 
        });
      }

      if (status === 'resolved') {
        ticket.resolvedAt = new Date();
      } else if (ticket.status === 'resolved' && status !== 'resolved') {
        ticket.resolvedAt = null;
      }

      ticket.status = status;
    }

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

    // --- FAIL-SAFE MOCK ROUTING ---
    if (mongoose.connection.readyState !== 1) {
      const index = mockTickets.findIndex(t => t._id === id);
      if (index === -1) {
        return res.status(404).json({ message: 'Ticket not found' });
      }
      mockTickets.splice(index, 1);
      console.log('🗑️ Deleted in-memory mock ticket:', id);
      return res.json({ message: 'Ticket deleted successfully', id });
    }

    // --- STANDARD DATABASE ROUTING ---
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

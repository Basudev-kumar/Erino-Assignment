
import express from 'express';
import Lead from '../models/lead.model.js'



const leadRoutes = express.Router();


const buildFilterQuery = (filters, userId) => {
  const query = { user: userId };
  
  if (!filters) return query;
  
  Object.keys(filters).forEach(field => {
    const filter = filters[field];
    
    if (filter.operator === 'equals') {
      query[field] = filter.value;
    } else if (filter.operator === 'contains') {
      query[field] = { $regex: filter.value, $options: 'i' };
    } else if (filter.operator === 'in') {
      query[field] = { $in: filter.value };
    } else if (filter.operator === 'gt') {
      query[field] = { $gt: filter.value };
    } else if (filter.operator === 'lt') {
      query[field] = { $lt: filter.value };
    } else if (filter.operator === 'between') {
      query[field] = { $gte: filter.value[0], $lte: filter.value[1] };
    } else if (filter.operator === 'on') {
      const date = new Date(filter.value);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      query[field] = { $gte: date, $lt: nextDay };
    } else if (filter.operator === 'before') {
      query[field] = { $lt: new Date(filter.value) };
    } else if (filter.operator === 'after') {
      query[field] = { $gt: new Date(filter.value) };
    }
  });
  
  return query;
};


// Create lead
leadRoutes.post('/', async (req, res) => {
  try {
    const lead = new Lead({
      ...req.body,
      user: req.userId
    });
    
    await lead.save();
    res.status(201).json(lead);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: error.message });
  }
});

// Get leads with pagination and filters
leadRoutes.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;
    
    const filters = req.query.filters ? JSON.parse(req.query.filters) : {};
    const query = buildFilterQuery(filters, req.userId);
    
    const [leads, total] = await Promise.all([
      Lead.find(query)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit),
      Lead.countDocuments(query)
    ]);
    
    res.json({
      data: leads,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single lead
leadRoutes.get('/:id', async (req, res) => {
  try {
    const lead = await Lead.findOne({
      _id: req.params.id,
      user: req.userId
    });
    
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    
    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update lead
leadRoutes.put('/:id', async (req, res) => {
  try {
    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    
    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete lead
leadRoutes.delete('/:id', async (req, res) => {
  try {
    const lead = await Lead.findOneAndDelete({
      _id: req.params.id,
      user: req.userId
    });
    
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


export default leadRoutes;

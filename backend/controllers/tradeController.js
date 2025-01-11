// controllers/tradeController.js

const { Trade } = require('../models'); // Adjust path as needed

/**
 * GET /api/trades
 * Retrieve all trades.
 */
exports.getAllTrades = async (req, res) => {
  try {
    const trades = await Trade.findAll();
    res.json(trades);
  } catch (error) {
    console.error('Error fetching all trades:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * GET /api/trades/:id
 * Retrieve a single trade by ID.
 */
exports.getTradeById = async (req, res) => {
  try {
    const { id } = req.params;
    const trade = await Trade.findByPk(id);
    if (!trade) {
      return res.status(404).json({ error: 'Trade not found' });
    }
    res.json(trade);
  } catch (error) {
    console.error('Error fetching trade by ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * POST /api/trades
 * Create a new trade.
 */
exports.createTrade = async (req, res) => {
  try {
    const { name, industry } = req.body;
    // e.g. { name: 'Carpenter', industry: 'construction' }

    // Basic validation (optional, or rely on model validations)
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Create the new trade
    const newTrade = await Trade.create({ name, industry });
    res.status(201).json(newTrade);
  } catch (error) {
    console.error('Error creating trade:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * PUT /api/trades/:id
 * Update an existing trade.
 */
exports.updateTrade = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, industry } = req.body;

    const trade = await Trade.findByPk(id);
    if (!trade) {
      return res.status(404).json({ error: 'Trade not found' });
    }

    // Update the trade's fields
    trade.name = name ?? trade.name;
    trade.industry = industry ?? trade.industry;

    await trade.save();
    res.json(trade);
  } catch (error) {
    console.error('Error updating trade:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * DELETE /api/trades/:id
 * Delete a trade by ID.
 */
exports.deleteTrade = async (req, res) => {
  try {
    const { id } = req.params;
    const trade = await Trade.findByPk(id);

    if (!trade) {
      return res.status(404).json({ error: 'Trade not found' });
    }

    await trade.destroy();
    res.status(204).send(); // or { message: 'Trade deleted successfully' }
  } catch (error) {
    console.error('Error deleting trade:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
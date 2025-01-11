// routes/tradeRoutes.js

const express = require('express');
const router = express.Router();
const tradeController = require('../../controllers/tradeController');

// GET all trades
router.get('/', tradeController.getAllTrades);

// GET a single trade by ID
router.get('/:id', tradeController.getTradeById);

// CREATE a new trade
router.post('/', tradeController.createTrade);

// UPDATE an existing trade
router.put('/:id', tradeController.updateTrade);

// DELETE a trade
router.delete('/:id', tradeController.deleteTrade);

module.exports = router;
// routes/expenseRoutes.js

const express = require('express');
const router = express.Router();
const expenseController = require('../../controllers/expenseController');

// GET all expenses
router.get('/', expenseController.getAllExpenses);

// GET a single expense by ID
router.get('/:id', expenseController.getExpenseById);

// CREATE a new expense
router.post('/', expenseController.createExpense);

// UPDATE an existing expense
router.put('/:id', expenseController.updateExpense);

// DELETE an expense
router.delete('/:id', expenseController.deleteExpense);

module.exports = router;
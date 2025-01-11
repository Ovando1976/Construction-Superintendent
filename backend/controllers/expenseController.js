// controllers/expenseController.js

const { Expense } = require('../models'); // Adjust path if needed

/**
 * GET /api/expenses
 * Retrieve all expenses.
 */
exports.getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expense.findAll();
    res.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * GET /api/expenses/:id
 * Retrieve a single expense by ID.
 */
exports.getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findByPk(id);

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json(expense);
  } catch (error) {
    console.error('Error fetching expense by ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * POST /api/expenses
 * Create a new expense.
 */
exports.createExpense = async (req, res) => {
  try {
    const {
      name,
      amount,
      date,
      category,
      projectId,
      createdBy,
    } = req.body;

    // Minimal validation at the controller level (optional, your model also has validations)
    if (!name || !amount || !date || !projectId || !createdBy) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newExpense = await Expense.create({
      name,
      amount,
      date,
      category,
      projectId,
      createdBy,
    });

    res.status(201).json(newExpense);
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * PUT /api/expenses/:id
 * Update an existing expense.
 */
exports.updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      amount,
      date,
      category,
      projectId,
      createdBy,
    } = req.body;

    const expense = await Expense.findByPk(id);
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    // Update only the fields present in the request body
    expense.name = (name !== undefined) ? name : expense.name;
    expense.amount = (amount !== undefined) ? amount : expense.amount;
    expense.date = (date !== undefined) ? date : expense.date;
    expense.category = (category !== undefined) ? category : expense.category;
    expense.projectId = (projectId !== undefined) ? projectId : expense.projectId;
    expense.createdBy = (createdBy !== undefined) ? createdBy : expense.createdBy;

    await expense.save();
    res.json(expense);
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * DELETE /api/expenses/:id
 * Delete an expense by ID.
 */
exports.deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const expense = await Expense.findByPk(id);
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    await expense.destroy();
    res.status(204).send(); // or res.json({ message: 'Expense deleted' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
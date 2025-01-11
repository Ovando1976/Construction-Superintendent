// backend/app.js

require('dotenv').config(); // Load environment variables

const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');
const jwt = require('jsonwebtoken');

// Initialize Sequelize (if using models/index.js auto-loader)
const db = require('./models'); // Load Sequelize connection and models

// Initialize Supabase Admin Client
const supabaseAdmin = require('./src/utils/supabaseAdminClient');

// Initialize OpenAI
const { OpenAI } = require('openai');
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'YOUR_FALLBACK_API_KEY',
});

// Initialize Express
const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(bodyParser.json()); // Parse JSON bodies

projectsRoutes = require('./src/routes/projectsRoutes');
const teamMembersRoutes = require('./src/routes/teamMembersRoutes');
const documentsRoutes = require('./src/routes/documentsRoutes');
const authRoutes = require('./src/routes/authRoutes');
const tradesRoutes = require('./src/routes/tradesRoutes'); // Import Trades Routes
const usersRoutes = require('./src/routes/usersRoutes');     // Import Users Routes (if applicable)
const taskRoutes = require('./src/routes/taskRoutes');
const equipmentRoutes = require('./src/routes/equipmentRoutes');
const materialRoutes = require('./src/routes/materialRoutes');
const inspectionRoutes = require('./src/routes/inspectionRoutes');
const expenseRoutes = require('./src/routes/expenseRoutes');
const dailyReportRoutes = require('./src/routes/dailyReportRoutes');
const documentRoutes = require('./src/routes/documentsRoutes');

// **Mount Routes**
app.use('/api/projects', projectsRoutes);
app.use('/api/team-members', teamMembersRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/trades', tradesRoutes);
app.use('/api/users', usersRoutes); // Mount Users Routes (if applicable)
app.use('/api/tasks', taskRoutes);
app.use('/api/equipments', equipmentRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/inspections', inspectionRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/daily-reports', dailyReportRoutes);

// AI Suggestion Route
app.post('/ai-suggest', async (req, res) => {
  try {
    const { context } = req.body;

    const completion = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: `Suggest a realistic ${context} for a construction daily report.`,
      max_tokens: 50,
    });

    res.json({ suggestion: completion.data.choices[0].text.trim() });
  } catch (error) {
    console.error('AI suggestion failed:', error);
    res.status(500).json({ error: 'AI suggestion failed' });
  }
});

// Task Summary Endpoint
app.get('/api/tasks/summary', (req, res) => {
  const result = [
    { status: 'Pending', count: 5 },
    { status: 'In Progress', count: 3 },
    { status: 'Completed', count: 10 },
  ];
  res.json(result);
});

// Equipment Usage Endpoint
app.get('/api/equipment/usage', (req, res) => {
  const usage = [
    { name: 'Crane', hours: 40 },
    { name: 'Excavator', hours: 20 },
  ];
  res.json(usage);
});

// **Protected Route Example**
// Middleware to verify JWT Token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token.' });
    }
    req.user = user;
    next();
  });
};

// Example Protected Route
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({ message: `Hello, ${req.user.name}! This is a protected route.` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// **Test DB connection**
db.sequelize
  .authenticate()
  .then(() => console.log('Database connection established successfully.'))
  .catch((error) => console.error('Error connecting to the database:', error));

// Start Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
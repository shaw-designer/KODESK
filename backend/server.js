const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const { Pool } = require('pg');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security headers
app.use(helmet());

// CORS - restrict to known origins in production
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
};
app.use(cors(corsOptions));

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per window for auth routes
  message: { success: false, message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const executeLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 15, // 15 code executions per minute
  message: { success: false, message: 'Too many execution requests, please slow down' },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(generalLimiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'kodesk_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

// Test database connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
});

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'KODESK API is running' });
});

// Import route handlers
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const languageRoutes = require('./routes/languages');
const taskRoutes = require('./routes/tasks');
const codeExecutionRoutes = require('./routes/codeExecution');
const progressRoutes = require('./routes/progress');
const gameRoutes = require('./routes/games');

// Use routes (with targeted rate limiters on sensitive endpoints)
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/languages', languageRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/execute', executeLimiter, codeExecutionRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/games', gameRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 KODESK Backend Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;


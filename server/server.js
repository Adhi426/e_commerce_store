const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { connectDB } = require('./config/db');
const { seedDB } = require('./seedData');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect Database
connectDB().then(() => {
  // Automatically populate seed data for instant visual demonstration
  seedDB();
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../client')));

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    app: 'NEXORA E-Commerce API Server',
    version: '1.0.0',
    timestamp: new Date(),
  });
});

// Fallback for HTML routing
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, message: 'API Endpoint not found' });
  }
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[NEXORA ERROR]:', err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`  🚀 NEXORA Full-Stack Server Running on Port ${PORT}`);
  console.log(`  🌐 Website URL: http://localhost:${PORT}`);
  console.log(`  📦 CodeAlpha Full Stack Development Task 1`);
  console.log(`====================================================`);
});
